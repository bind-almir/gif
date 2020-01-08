const AWS = require('aws-sdk');
const fs = require('fs');

const s3 = new AWS.S3();

const createBucket = async (Bucket) => await s3.createBucket( { Bucket } ).promise();
const deleteBucket = async (Bucket) => await s3.deleteBucket( { Bucket } ).promise();
const listObjects = async (Bucket, Prefix, Delimiter) => await s3.listObjectsV2( { Bucket, Prefix, Delimiter } ).promise();
const getObject = async (Bucket, Key) => await s3.getObject( { Bucket, Key } ).promise();
const getObjectStream = (Bucket, Key) => s3.getObject( { Bucket, Key } ).createReadStream();
const putObject = async (Bucket, Key, Body) => await s3.putObject( { Bucket, Key, Body } ).promise();
const deleteObject = async (Bucket, Key) => await s3.deleteObject( { Bucket, Key } ).promise();
const uploadObject = async (Bucket, Key, Body, ACL, ContentType, options) => await s3.upload( { Bucket, Key, Body, ACL, ContentType }, options ).promise();

// had to create promise manualy for some reason .promise() didn't work
const getSignedUrl = async (operation, Bucket, Key, ContentType) => new Promise((resolve, reject) => {
  const { expiry_time } = JSON.parse(process.env.SETTINGS);
  let params = {
    Bucket, Key, Expires: expiry_time
  }
  if(ContentType) params.ContentType = ContentType;
  s3.getSignedUrl(operation, params, (err, data) => {
    if(err) reject(err);
    resolve(data);
  });
});

// generate unique id 
const generateUUID = () => {
  var d = new Date().getTime();
  return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, (c) => {
    let r = (d + Math.random() * 16) % 16 | 0;
    d = Math.floor(d / 16);
    return (c == 'x' ? r : (r & 0x3 | 0x8)).toString(16);
  }).replace(/[-]/g, '');
}

const downloadFile = async(inputFile, fileName) => {
  const { upload_bucket } = JSON.parse(process.env.SETTINGS);
  const tempFile = fs.createWriteStream(inputFile);
  const stream = getObjectStream(upload_bucket, fileName);
  stream.pipe(tempFile);
  let bytes = 0;
  return new Promise((resolve, reject) => {
    stream.on('data', data => {
      bytes += data.length;
    });

    stream.on('end', () => {
      console.log('download complete: ', bytes, ' bytes');
      resolve(true);
    })
    stream.on('error', err => {
      console.log('error downloading file', err);
      reject(err);
    });
  });
}

const uploadFile = async(inputFile, bucket, key, acl, contentType) => {
  const body = fs.createReadStream(inputFile);
  return await uploadObject(bucket, key, body, acl, contentType);
};


module.exports = {
  createBucket,
  deleteBucket,
  listObjects,
  getObject,
  getObjectStream,
  putObject,
  deleteObject,
  uploadObject,
  getSignedUrl,
  generateUUID,
  uploadFile,
  downloadFile
};