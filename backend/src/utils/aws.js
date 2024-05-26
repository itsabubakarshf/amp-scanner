const AWS = require('aws-sdk');
require("dotenv")
AWS.config.update({
    accessKeyId: process.env.AWS_ACCESS_KEY_ID,
    secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY,
    region: process.env.REGION,
});

const s3 = new AWS.S3();

async function uploadToS3(data, key) {
    const params = {
      Bucket: process.env.BUCKET_NAME,
      Key: key,
      Body: data,
    };
    const response = await s3.upload(params).promise();
    const signedVideoUrl = s3.getSignedUrl('getObject', {
        Bucket: process.env.BUCKET_NAME,
        Key: key ,
        Expires: 315360000 
      });
    return signedVideoUrl; 
  }

module.exports = {uploadToS3}