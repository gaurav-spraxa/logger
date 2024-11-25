import logger from "./logger.js";
import express from 'express';
// const logger = new Logger();
const app = express();
const PORT = 3000;

// Define a GET API
app.get('/api/message', (req, res) => {
    res.status(200).json({ message: 'Hello There..!' });
});

// Start the server
app.listen(PORT, () => {
    logger.info(`Server is running on http://localhost:${PORT}`);
});

const err = {
    error: "error...",
    message: "an error occured"
}

setInterval(() => {
    logger.info(`logger ping --- ${new Date().getTime()}`);
    logger.error(`testing error stream --- ${new Date().getTime()}`);
}, 1000)

logger.error({ err: err }, "An expected Error occured.........");
logger.info("Hello there.... ingo from logger......");
logger.debug("Values comming..");
logger.fatal("Fetal error....");
logger.warn("Warning..! stop here..");
