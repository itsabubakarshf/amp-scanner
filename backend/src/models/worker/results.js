const mongoose = require("mongoose");

const ProcessedResultSchema = new mongoose.Schema({
    workerId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Worker'
    },
    userId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User'
    },
    success: Boolean,
    message: String,
    data: {
        "data-amp": String,
        "data-amp-cur": String,
        "data-amp-title": String,
        href: String
    },
    ss: {
        type:String,
        defualt:'https://via.placeholder.com/150'
    },
    timestamp: {
        type: Date,
        default: Date.now
    }
});

const ProcessedResult = mongoose.model("Result", ProcessedResultSchema);

module.exports = ProcessedResult;
