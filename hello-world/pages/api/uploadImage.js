import { S3Client, PutObjectCommand } from '@aws-sdk/client-s3';
import multer from 'multer';
import { v4 as uuidv4 } from 'uuid';

// Configure S3 client for Hetzner Object Storage
const s3Client = new S3Client({
  endpoint: `https://${process.env.HETZNER_ENDPOINT}`,
  region: process.env.HETZNER_REGION,
  credentials: {
    accessKeyId: process.env.HETZNER_ACCESS_KEY,
    secretAccessKey: process.env.HETZNER_SECRET_KEY,
  },
  forcePathStyle: false,
});

// Configure multer for memory storage
const upload = multer({
  storage: multer.memoryStorage(),
  limits: {
    fileSize: 5 * 1024 * 1024, // 5MB limit
  },
  fileFilter: (req, file, cb) => {
    // Accept images only
    if (!file.mimetype.startsWith('image/')) {
      cb(new Error('Only image files are allowed'), false);
      return;
    }
    cb(null, true);
  },
});

// Disable Next.js body parser for this route
export const config = {
  api: {
    bodyParser: false,
  },
};

// Helper to run multer middleware in Next.js
function runMiddleware(req, res, fn) {
  return new Promise((resolve, reject) => {
    fn(req, res, (result) => {
      if (result instanceof Error) {
        return reject(result);
      }
      return resolve(result);
    });
  });
}

export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
    // Run multer middleware
    await runMiddleware(req, res, upload.single('image'));

    if (!req.file) {
      return res.status(400).json({ error: 'No image file provided' });
    }

    // Generate unique filename
    const fileExtension = req.file.originalname.split('.').pop();
    const fileName = `${uuidv4()}.${fileExtension}`;
    const bucketName = process.env.HETZNER_BUCKET;

    // Upload to Hetzner Object Storage
    const command = new PutObjectCommand({
      Bucket: bucketName,
      Key: fileName,
      Body: req.file.buffer,
      ContentType: req.file.mimetype,
      ACL: 'public-read', // Make file publicly accessible
    });

    await s3Client.send(command);

    // Construct public URL
    const endpoint = process.env.HETZNER_ENDPOINT;
    const imageUrl = `https://${bucketName}.${endpoint}/${fileName}`;

    return res.status(200).json({
      success: true,
      imageUrl,
      fileName,
      size: req.file.size,
      mimeType: req.file.mimetype,
    });
  } catch (error) {
    console.error('Upload error:', error);

    if (error.message === 'Only image files are allowed') {
      return res.status(400).json({ error: 'Only image files are allowed' });
    }

    if (error.code === 'LIMIT_FILE_SIZE') {
      return res.status(400).json({ 
        error: 'File too large',
        message: 'Maximum file size is 5MB'
      });
    }

    return res.status(500).json({ 
      error: 'Failed to upload image',
      details: error.message,
      code: error.code || error.name,
      fullError: process.env.NODE_ENV === 'development' ? error.toString() : undefined
    });
  }
}

