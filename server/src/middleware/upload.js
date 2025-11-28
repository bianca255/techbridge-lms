const multer = require('multer');
const path = require('path');
const fs = require('fs');

// Create uploads directory if it doesn't exist
const uploadsDir = './uploads';
if (!fs.existsSync(uploadsDir)) {
  fs.mkdirSync(uploadsDir, { recursive: true });
}

// Configure storage
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    let uploadPath = uploadsDir;
    
    // Organize by type
    if (file.mimetype.startsWith('image/')) {
      uploadPath = path.join(uploadsDir, 'images');
    } else if (file.mimetype.startsWith('video/')) {
      uploadPath = path.join(uploadsDir, 'videos');
    } else if (file.mimetype === 'application/pdf') {
      uploadPath = path.join(uploadsDir, 'documents');
    } else {
      uploadPath = path.join(uploadsDir, 'others');
    }
    
    // Create directory if it doesn't exist
    if (!fs.existsSync(uploadPath)) {
      fs.mkdirSync(uploadPath, { recursive: true });
    }
    
    cb(null, uploadPath);
  },
  filename: (req, file, cb) => {
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
    cb(null, file.fieldname + '-' + uniqueSuffix + path.extname(file.originalname));
  }
});

// File filter - Per SRS: PDF, DOCX, PPTX, MP4, MP3, JPG, PNG (50MB max)
const fileFilter = (req, file, cb) => {
  // Allowed file types per SRS specification
  const allowedTypes = /jpeg|jpg|png|pdf|docx|pptx|mp4|mp3|txt|zip/;
  const extname = allowedTypes.test(path.extname(file.originalname).toLowerCase());
  
  const allowedMimeTypes = [
    'image/jpeg',
    'image/jpg', 
    'image/png',
    'application/pdf',
    'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
    'application/vnd.openxmlformats-officedocument.presentationml.presentation',
    'video/mp4',
    'audio/mpeg',
    'audio/mp3',
    'text/plain',
    'application/zip'
  ];
  const mimetype = allowedMimeTypes.includes(file.mimetype);

  if (extname && mimetype) {
    // TODO: Add malware scanning in production
    // scanFileForMalware(file).then(result => { ... })
    return cb(null, true);
  } else {
    cb(new Error('Invalid file type. Allowed: PDF, DOCX, PPTX, MP4, MP3, JPG, PNG, TXT, ZIP'));
  }
};

// Configure multer
const upload = multer({
  storage: storage,
  limits: {
    fileSize: parseInt(process.env.MAX_FILE_SIZE) || 50 * 1024 * 1024 // 50MB default
  },
  fileFilter: fileFilter
});

module.exports = upload;
