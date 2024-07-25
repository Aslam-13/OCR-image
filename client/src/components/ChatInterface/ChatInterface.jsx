// ChatInterface Component
import React, { useState } from 'react';
import axios from 'axios';

function ChatInterface() {
    const [image, setImage] = useState(null);
    const [text, setText] = useState('');
    const [response, setResponse] = useState('');
  
    const handleImageUpload = (e) => {
      setImage(e.target.files[0]);
    };
  
    const handleTextInput = (e) => {
      setText(e.target.value);
    };
  
    const handleSubmit = async (e) => {
        e.preventDefault(); // Prevent default form submission
    
        try {
          // First, upload the image
          const formData = new FormData();
          formData.append('image', image);
          const imageUploadResponse = await axios.post('api/upload-image', formData);
          const imagePath = imageUploadResponse.data.path;
    
          // Then, send the text input and image path
          const response = await axios.post('api/upload', {
            text,
            imagePath,
          });
    
          setResponse(response.data.result);
        } catch (err) {
          console.error(err);
        }
      };
    
    return (
        <div className="App">
        <h1>OCR Chat Bot</h1>
        <form onSubmit={handleSubmit}>
          <div>
            <label>Upload profile picture</label>
            <input type="file" name="image" required onChange={handleImageUpload} />
          </div>
          <div>
            <input type="text" name="text" value={text} onChange={handleTextInput} placeholder="Enter command" />
          </div>
          <div>
            <input type="submit" value="Upload" />
          </div>
        </form>
        <div>
          <h2>Response:</h2>
          <p>{response}</p>
        </div>
      </div>
    );
  }
export default ChatInterface;