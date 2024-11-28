import fse from "fs-extra";
import path from "path";
import rfs from "file-stream-rotator";
import pino from "pino";
import pretty from "pino-pretty";
import { Transform } from "stream";

const logLevel = "info";
const logFolder = path.join(process.cwd(), "logs"); // Create a stream where the logs will be written
fse.ensureDir(logFolder); // create logs directory if not exists.

const auditFile = path.join(logFolder, "audit.json");

const streamConfig = {
    date_format: "YYYY-MM-DD",
    frequency: "date",
    extension: ".log",
    verbose: true,
    audit_file: auditFile,
    end_stream: false
};

const mainStream = rfs.getStream({
    ...streamConfig,
    filename: path.join(logFolder, "Cat_Export-%DATE%")
});

const errorStream = rfs.getStream({
    ...streamConfig,
    filename: path.join(logFolder, "Cat_Export-%DATE%-error")
});

const prettyPrintOptions = {
    colorize: false,
    levelFirst: true,
    ignore: "pid,hostname",
    translateTime: "SYS:h:MM:ss TT Z",
    messageFormat: "Message - {msg}"
};

// Create a custom writable stream that combines with the rotating stream
class PrettifyingRotatingStream extends Transform {
    constructor(rotatingStream) {
        super();
        this.rotatingStream = rotatingStream;
    }

    _transform(chunk, encoding, callback) {
        try {
            const logObject = JSON.parse(chunk.toString());
            const { level, time, pid, hostname, msg, ...rest } = logObject;
            const timestamp = new Date(time).toTimeString();

            let prettyLog = `${level} [${timestamp}]: Message - ${msg}`;

            if (Object.keys(rest).length > 0) {
                const formattedRest = JSON.stringify(rest, null, 4); // 4-space indentation
                prettyLog += `\n\t${formattedRest}`;
            }

            prettyLog += "\n";
            this.rotatingStream.write(prettyLog);
            callback();

        } catch (error) {
            callback(error);
        }
    }
}

// Create the streams
const prettifiedMainStream = new PrettifyingRotatingStream(mainStream);
const prettifiedErrorStream = new PrettifyingRotatingStream(errorStream);

const streams = [
    { level: logLevel, stream: pretty({ ...prettyPrintOptions, destination: process.stdout, colorize: true }) },
    { level: logLevel, stream: prettifiedMainStream },
    { level: "error", stream: prettifiedErrorStream }
];

const logger = pino(
    {
        level: logLevel,
        formatters: {
            level: (label) => {
                return { level: label.toUpperCase() };
            }
        }
    },
    pino.multistream(streams)
);

export default logger;