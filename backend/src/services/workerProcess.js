const activeWorkerIntervals = new Map();

const startWorkerProcess = (workerId, processFunction, intervalInSeconds) => {
    if (activeWorkerIntervals.has(workerId)) {
        console.log(`Worker ${workerId} is already running.`);
        return;
    }

    const intervalInMilliseconds = intervalInSeconds * 1000;
    const intervalId = setInterval(processFunction, intervalInMilliseconds);
    activeWorkerIntervals.set(workerId, intervalId);
    console.log(`Started worker process for worker ${workerId}.`);
};

const stopWorkerProcess = (workerId) => {
    const intervalId = activeWorkerIntervals.get(workerId);
    if (intervalId) {
        clearInterval(intervalId);
        activeWorkerIntervals.delete(workerId);
        console.log(`Stopped worker process for worker ${workerId}.`);
    } else {
        console.log(`No active process found for worker ${workerId}.`);
    }
};

module.exports = {startWorkerProcess,stopWorkerProcess}