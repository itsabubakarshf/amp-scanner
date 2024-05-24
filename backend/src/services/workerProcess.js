const logger = require('../utils/logger')
const Worker = require('../models/worker/worker')
const activeWorkerIntervals = new Map();
const runningWorkers = new Set();

const startWorkerProcess = (workerId, processFunction, intervalInSeconds) => {
    const interval = parseInt(intervalInSeconds, 10);

    if (activeWorkerIntervals.has(workerId)) {
        logger.info(`Worker ${workerId} is already running.`);
        return;
    }

    const processAndScheduleNext = async () => {
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
            // Schedule the next run
            const timeoutId = setTimeout(processAndScheduleNext, interval * 1000);
            activeWorkerIntervals.set(workerId, timeoutId);
        }
    };


    // Start the initial process
    const timeoutId = setTimeout(processAndScheduleNext, interval * 1000);
    activeWorkerIntervals.set(workerId, timeoutId);
};

const stopWorkerProcess = (workerId) => {
    const timeoutId = activeWorkerIntervals.get(workerId);
    if (timeoutId) {
        clearTimeout(timeoutId);
        activeWorkerIntervals.delete(workerId);
        console.log(`Stopped worker process for worker ${workerId}.`);
    } else {
        console.log(`No active process found for worker ${workerId}.`);
    }
};

// const processQueue = async () => {
//     if (workerQueue.length === 0) return;

//     const { workerId, processFunction, interval } = workerQueue.shift();

//     const processAndScheduleNext = async () => {
//         logger.info(`Started worker process for worker ${workerId}.`);
//         await processFunction();
//         logger.info(`Completed worker process for worker ${workerId}.`);
//     };

//     const intervalId = setInterval(async () => {
//         await processAndScheduleNext();
//     }, interval * 1000);

//     activeWorkerIntervals.set(workerId, intervalId);
// };



module.exports = {startWorkerProcess,stopWorkerProcess}