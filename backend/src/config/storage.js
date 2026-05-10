const { Client } = require('minio');

const port = Number(process.env.MINIO_PORT || 9000);
const useSSL = String(process.env.MINIO_USE_SSL || 'false').toLowerCase() === 'true';

const minioClient = new Client({
  endPoint: process.env.MINIO_ENDPOINT || 'localhost',
  port,
  useSSL,
  accessKey: process.env.MINIO_ACCESS_KEY || 'minioadmin',
  secretKey: process.env.MINIO_SECRET_KEY || 'minioadmin123'
});

const bucket = process.env.MINIO_BUCKET || 'photosphere-media';
const publicBaseUrl = (process.env.STORAGE_PUBLIC_BASE_URL || `http://localhost:${port}/${bucket}`).replace(/\/$/, '');

const sanitizeFilename = (name) => name.replace(/[^a-zA-Z0-9._-]/g, '-');

async function uploadImage(file) {
  const objectName = `${Date.now()}-${sanitizeFilename(file.originalname)}`;
  await minioClient.putObject(bucket, objectName, file.buffer, file.size, {
    'Content-Type': file.mimetype
  });
  return {
    objectName,
    imageUrl: `${publicBaseUrl}/${objectName}`
  };
}

module.exports = {
  minioClient,
  bucket,
  uploadImage,
  publicBaseUrl
};
