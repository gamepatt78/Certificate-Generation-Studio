import cloudinaryPackage from 'cloudinary';

const cloudinary = cloudinaryPackage.v2;

cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
});

/**
 * Uploads a PDF buffer to Cloudinary and returns the secure URL.
 * @param {Buffer} buffer - The PDF file buffer to upload.
 * @returns {Promise<string>} The secure URL of the uploaded PDF.
 */
const uploadPdfBuffer = (buffer) => {
  if (!process.env.CLOUDINARY_CLOUD_NAME || !process.env.CLOUDINARY_API_KEY || !process.env.CLOUDINARY_API_SECRET) {
    return Promise.resolve(null);
  }

  return new Promise((resolve, reject) => {
    const uploadStream = cloudinary.uploader.upload_stream(
      {
        resource_type: 'raw',
        format: 'pdf'
      },
      (error, result) => {
        if (error) {
          return reject(error);
        }
        resolve(result?.secure_url || null);
      }
    );

    uploadStream.end(buffer);
  });
};

export default {
  uploadPdfBuffer,
};
