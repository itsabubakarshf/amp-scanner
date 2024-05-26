const logger = require('../utils/logger');
const Worker = require('../models/worker/worker');
const activeWorkerIntervals = new Map();
const runningWorkers = new Set();
const stoppedWorkers = new Set();

const startWorkerProcess = (workerId, processFunction, intervalInSeconds) => {
    const interval = parseInt(intervalInSeconds, 10);

    if (activeWorkerIntervals.has(workerId)) {
        logger.info(`Worker ${workerId} is already running.`);
        return;
    }

    const processAndScheduleNext = async () => {
        if (stoppedWorkers.has(workerId)) {
            logger.info(`Worker ${workerId} has been stopped. Not scheduling next run.`);
            activeWorkerIntervals.delete(workerId);
            return;
        }

        if (runningWorkers.has(workerId)) {
            logger.info(`Worker ${workerId} is already running. Waiting for it to complete.`);
            return;
        }

        runningWorkers.add(workerId);

        try {
            const worker = await Worker.findById(workerId);
            if (!worker) {
                logger.error(`Worker ${workerId} not found. Stopping the process.`);
                runningWorkers.delete(workerId);
                stopWorkerProcess(workerId);
                return;
            }

            logger.info(`Started worker process for worker ${workerId}.`);
            await processFunction(worker);
            logger.info(`Completed worker process for worker ${workerId}.`);
        } catch (error) {
            logger.error(`Error processing worker ${workerId}: ${error.message}`);
        } finally {
            runningWorkers.delete(workerId);
            // Schedule the next run only if the worker is not stopped
            if (!stoppedWorkers.has(workerId)) {
                const timeoutId = setTimeout(processAndScheduleNext, interval * 1000);
                activeWorkerIntervals.set(workerId, timeoutId);
            } else {
                activeWorkerIntervals.delete(workerId);
            }
        }
    };

    // Start the initial process
    const timeoutId = setTimeout(processAndScheduleNext, interval * 1000);
    activeWorkerIntervals.set(workerId, timeoutId);
};

const stopWorkerProcess = (workerId) => {
    stoppedWorkers.add(workerId);
    const timeoutId = activeWorkerIntervals.get(workerId);
    if (timeoutId) {
        clearTimeout(timeoutId);
        activeWorkerIntervals.delete(workerId);
        logger.info(`Stopped worker process for worker ${workerId}.`);
    } else {
        logger.info(`No active process found for worker ${workerId}.`);
    }
};

module.exports = { startWorkerProcess, stopWorkerProcess, stoppedWorkers };
