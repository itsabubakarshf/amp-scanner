require('dotenv').config();
const mongoose = require('mongoose');

const mongoURI = "mongodb+srv://abubakarshf:thejungle@cluster-mumbai-practice.t6ntrgy.mongodb.net/?retryWrites=true";

mongoose.connect(mongoURI)
  .then(() => {
    console.log('MongoDB connected...');
  })
  .catch(err => {
    console.error('Connection error', err);
  });
