const express = require('express');
const mongoose = require('mongoose');
const multer = require('multer');
const path = require('path');
const tesseract = require('tesseract.js');
const cors = require('cors');
require('dotenv').config(); 

const app = express();

// Middleware
app.use(cors());
app.use(express.json());
app.use('/uploads', express.static(path.join(__dirname, 'uploads')));

// Database connection
const mongoUri = process.env.MONGO_URI;
if (!mongoUri) {
  console.error('MongoDB URI is not set in environment variables.');
  process.exit(1);
}
mongoose.connect(process.env.MONGO_URI, { useNewUrlParser: true, useUnifiedTopology: true })
  .then(() => console.log('MongoDB connected'))
  .catch(err => console.error(err));

// Multer setup for file uploads
const storage = multer.diskStorage({
    destination: (req, file, cb) => {
      const uploadPath = path.join(__dirname, 'uploads');
      console.log('Uploading to:', uploadPath); // Debugging statement
      cb(null, uploadPath);
    },
    filename: (req, file, cb) => {
      const filename = `${Date.now()}-${file.originalname}`;
      console.log('Saving file as:', filename); // Debugging statement
      cb(null, filename);
    }
  });
  
  const upload = multer({ storage });
  
  // Route to handle file upload
  app.post('/api/upload-image', upload.single('image'), (req, res) => {
    if (!req.file) {
      console.error('No file uploaded.'); // Debugging statement
      return res.status(400).json({ error: 'No file uploaded' });
    }
  
    res.json({ path: req.file.path });
  });
  
  // Route to handle text input and image processing
  app.post('/api/upload', async (req, res) => {
    const { text, imagePath } = req.body;
  
    console.log('Text input:', text); // Debugging statement
    console.log('Image path:', imagePath); // Debugging statement
  
    try {
      const { data: { text: extractedText } } = await tesseract.recognize(imagePath, 'eng');
  
      let result = '';
  
      if (text.toLowerCase().includes('extract email')) {
        const emails = extractedText.match(/\b[A-Za-z0-9._%+-]+@[A-Za-z0-9.-]+\.[A-Z|a-z]{2,}\b/g);
        result = emails ? emails.join(', ') : 'No emails found';
      } else if (text.toLowerCase().includes('highlight')) {
        const word = text.split('highlight ')[1];
        const highlightedText = extractedText.replace(new RegExp(word, 'gi'), match => `**${match}**`);
        result = highlightedText;
      } else if (text.toLowerCase().includes('translate')) {
        const targetLang = text.split('translate to ')[1] || 'es';
        result = await translate(extractedText, { to: targetLang });
      } else {
        result = extractedText;
      }
      console.log("thisi is", extractedText)
      res.json({ result });
    } catch (err) {
      console.error('Error processing image:', err); // Debugging statement
      res.status(500).json({ error: 'Image processing failed' });
    }
  });

// Server setup
const PORT = process.env.PORT || 8000;
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
