const express = require('express');
const app = express();
const Worker = require('../../models/worker/worker');
const auth = require('../../config/auth')
const logger = require('../../utils/logger')

app.post('/workers',auth, async (req, res) => {
    try {
        if (!req.body.siteName) {
            logger.error(`Site name is required to save Worker for user: ${req.user.email}`)
            return res.status(400).json({ status: false, error: 'Site name is required' });
        }
        let obj = req.body
        obj.user = req.user._id
        const worker = new Worker(obj);
        await worker.save();
        logger.info(`Worker Saved Successfully for user: ${req.user.email}`)

        res.status(201).json({ status: true, message: 'Worker successfully saved', data: worker });
    } catch (error) {
        logger.error(error.message);
        res.status(400).json({ status: false, error: 'Error saving Worker' });
    }
});

app.get('/Workers',auth, async (req, res) => {
    try {
        const worker = await Worker.find({user:req.user._id});
        if (!worker) {
            logger.error(`Worker not found for user: ${req.user.email}`)
            return res.status(404).json({ status: false, error: 'Worker not found' });
        }
        logger.info(`Worker retrieved successfully for user: ${req.user.email}`)

        res.status(200).json({ status: true, message: 'Worker retrieved successfully',total:worker.length, data: worker });
    } catch (error) {
        logger.error(error.message);
        res.status(500).json({ status: false, error: 'Error fetching Worker' });
    }
});

app.get('/Workers/:id',auth, async (req, res) => {
    try {
        const worker = await Worker.findById(req.params.id);
        if (!worker) {
            logger.error(`Worker not found for user: ${req.user.email}`)
            return res.status(404).json({ status: false, error: 'Worker not found' });
        }
        logger.info(`Worker retrieved successfully for user: ${req.user.email}`)
        res.status(200).json({ status: true, message: 'Worker retrieved successfully', data: worker });
    } catch (error) {
        logger.error(error.message);
        res.status(500).json({ status: false, error: 'Error fetching Worker' });
    }
});


app.put('/Workers/:id',auth, async (req, res) => {
    try {
        const worker = await Worker.findByIdAndUpdate(req.params.id, req.body, { new: true });
        if (!worker) {
            logger.error(`Worker not found for user: ${req.user.email}`)
            return res.status(404).json({ status: false, error: 'Worker not found' });
        }
        logger.info(`Worker Updated successfully for user: ${req.user.email}`)
        res.status(200).json({ status: true, message: 'Worker updated successfully', data: worker });
    } catch (error) {
        logger.error(error.message);
        res.status(400).json({ status: false, error: 'Error updating Worker' });
    }
});

app.delete('/Workers/:id',auth, async (req, res) => {
    try {
        const worker = await Worker.findByIdAndDelete(req.params.id);
        if (!worker) {
            logger.error(`worker not found for user: ${req.user.email}`)
            return res.status(404).json({ status: false, error: 'worker not found' });
        }
        logger.info(`Worker deleted successfully for user: ${req.user.email}`)
        res.status(200).json({ status: true, message: 'Worker deleted successfully' });
    } catch (error) {
        logger.error(error.message);
        res.status(500).json({ status: false, error: 'Error deleting Worker' });
    }
});


app.delete('/Workers-all',auth, async (req, res) => {
    try {
        await Worker.deleteMany({user:req.user._id,jobberId:req.user.jobberId});
        logger.info(`Worker deleted successfully for user: ${req.user.email}`)
        res.status(200).json({ status: true, message: 'All Workers deleted successfully' });
    } catch (error) {
        logger.error(error.message);
        res.status(500).json({ status: false, error: 'Error deleting Workers' });
    }
});


module.exports = app