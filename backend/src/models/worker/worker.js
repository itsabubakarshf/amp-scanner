const mongoose = require("mongoose");
const validator = require("validator");
require('dotenv').config();

const schema = new mongoose.Schema(
  {
    user: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Users'
    },
    siteName:{
        type:String,
        required:true
    },
    dataAmpUrl:{
        type:String,
        required:true
    },
    dataAmpCurrent:{
        type:String,
        required:true
    },
    dataAmpTitle:{
        type:String,
        required:true
    },
    href:{
        type:String,
        required:true
    },
    interval:{
        type:String,
        required:true,
    },
    status:{
        type:Boolean,
        default:false
    },
    isRunning:{
        type:Boolean,
        default:false
    }
    ,
    currentlyProcessing:{
        type:Boolean,
        default:false
    }
  },
  { timestamps: true });

const Worker = mongoose.model("Worker", schema);

module.exports = Worker;