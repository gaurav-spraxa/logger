import fse from 'fs-extra';
import path from 'path';
import rfs from 'file-stream-rotator';
import pino from 'pino';
import pretty from 'pino-pretty';

const logLevel = "info"
const logFolder = path.join(process.cwd(), 'logs');  // Create a stream where the logs will be written
fse.ensureDir(logFolder); // create logs directory if not exists.

const auditFile = path.join(logFolder, 'audit.json');
const streamConfig = {
    date_format: 'YYYY-MM-DD',
    frequency: 'date',
    extension: '.log',
    verbose: false,
    audit_file: auditFile
};
const mainStream = rfs.getStream({
    ...streamConfig,
    filename: path.join(logFolder, 'Cat_Export-%DATE%')
});
const errorStream = rfs.getStream({
    ...streamConfig,
    filename: path.join(logFolder, 'Cat_Export-%DATE%-error')
});
const prettyPrintOptions = {
    colorize: false,
    levelFirst: true,
    ignore: 'pid,hostname',
    translateTime: 'SYS:h:MM:ss TT Z',
    messageFormat: 'Message - {msg}'
};
const streams = [
    { level: logLevel, stream: pretty({ ...prettyPrintOptions, destination: process.stdout, colorize: true }) },
    { level: logLevel, stream: pretty({ ...prettyPrintOptions, destination: mainStream }) },
    { level: 'error', stream: pretty({ ...prettyPrintOptions, destination: errorStream }) }
];

const logger = pino(
    {
        level: logLevel
    },
    pino.multistream(streams)
);

export default logger;
