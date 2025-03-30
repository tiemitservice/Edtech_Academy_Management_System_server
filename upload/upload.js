const multer = require('multer');
const cloudinary = require('cloudinary').v2;
const { CloudinaryStorage } = require('multer-storage-cloudinary');
const { v4: uuidv4 } = require('uuid');

// Configure Cloudinary
cloudinary.config({
    cloud_name: 'dvljcimlz',
    api_key: '317225253168774',
    api_secret: '0TWwoDFETsFVugbMQ7jaQfJSxc4',
});

// Set up Cloudinary storage for multer
const storage = new CloudinaryStorage({
    cloudinary: cloudinary,
    params: {
        folder: 'uploads/images', // Cloudinary folder where images will be stored
        format: async (req, file) => {
            const allowedFormats = ['jpeg', 'jpg', 'png']; // Define allowed formats
            const fileFormat = file.mimetype.split('/')[1]; // Extract format from mimetype
            if (allowedFormats.includes(fileFormat)) {
                return fileFormat;
            }
            throw new Error('Invalid file format'); // Reject if format is not allowed
        },
        public_id: (req, file) => uuidv4(), // Generate a unique identifier for each file
    },
});


// Set up multer with file size limit and file type filter
const upload = multer({
    storage: storage,
    limits: { fileSize: 5 * 1024 * 1024 }, // 5MB file size limit
    fileFilter: (req, file, cb) => {
        if (!file.mimetype.startsWith('image/')) {
            return cb(new Error('File must be an image'));
        }
        cb(null, true);
    },
});

module.exports = upload;
