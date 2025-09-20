import React, { useState } from 'react';
import ReactMarkdown from 'react-markdown';
import './App.css'; // Your CSS file with improvements for neat look

export default function App() {
  const [file, setFile] = useState(null);
  const [uploadMessage, setUploadMessage] = useState('');
  const [warning, setWarning] = useState('');
  const [analysis, setAnalysis] = useState('');

  const handleFileChange = (e) => {
    setFile(e.target.files[0]);
    setUploadMessage('');
    setWarning('');
    setAnalysis('');
  };

  const handleUpload = async () => {
    if (!file) {
      alert('Please select a file first.');
      return;
    }

    const formData = new FormData();
    formData.append('contract', file);

    try {
      const uploadRes = await fetch('http://localhost:5000/upload', {
        method: 'POST',
        body: formData,
      });

      if (!uploadRes.ok) throw new Error('Upload failed');
      const uploadData = await uploadRes.json();
      setUploadMessage('File uploaded successfully');

      const dummyText = 'This is the contract text to analyze...';

      const analyzeRes = await fetch('http://localhost:5000/analyze', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ contractText: dummyText, originalName: uploadData.originalName }),
      });

      if (!analyzeRes.ok) throw new Error('Analysis failed');
      const analyzeData = await analyzeRes.json();

      if (analyzeData.warning) setWarning(analyzeData.warning);
      setAnalysis(analyzeData.analysis);

    } catch (err) {
      setWarning('Error uploading or analyzing file');
    }
  };

  return (
    <div className="app-container">
      <h1>AI Legal Assistant - Contract Review</h1>

      <form onSubmit={(e) => { e.preventDefault(); handleUpload(); }}>
        <label htmlFor="contract-upload" style={{ fontWeight: 'bold' }}>
          Upload Contract
        </label>
        <input type="file" id="contract-upload" onChange={handleFileChange} />

        <button type="submit">Upload</button>
      </form>

      {uploadMessage && <p className="upload-message">{uploadMessage}</p>}
      {warning && <p className="warning-message">{warning}</p>}
      {analysis && (
        <div className="analysis-output">
          <ReactMarkdown
            components={{
              a: ({ node, ...props }) => (
                <a {...props} target="_blank" rel="noopener noreferrer">
                  {props.children}
                </a>
              ),
            }}
          >
            {analysis}
          </ReactMarkdown>
        </div>
      )}
    </div>
  );
}
