import express from 'express';
import upload from '../middlewares/upload.js';

const router = express.Router();

// Upload single image
router.post('/single', upload.single('image'), (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({ message: 'Không có file được upload' });
    }

    const imageUrl = `/uploads/${req.body.type || 'general'}/${req.file.filename}`;
    
    res.json({
      message: 'Upload thành công',
      imageUrl: imageUrl,
      filename: req.file.filename
    });
  } catch (error) {
    res.status(500).json({ message: 'Lỗi server', error: error.message });
  }
});

export default router;