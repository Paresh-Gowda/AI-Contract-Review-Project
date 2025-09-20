import React, { useState, useEffect } from 'react';

const UploadForm = () => {
  const [file, setFile] = useState(null);
  const [message, setMessage] = useState('');
  const [analysis, setAnalysis] = useState('');
  const [files, setFiles] = useState([]);
  const [loading, setLoading] = useState(false);

  // Fetch uploaded contracts whenever message changes (i.e upload success)
  useEffect(() => {
    fetch('http://localhost:5000/contracts')
      .then(res => res.json())
      .then(setFiles)
      .catch(() => setFiles([]));
  }, [message]);

  const handleFileChange = (e) => {
    setFile(e.target.files[0]);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!file) {
      setMessage('Please select a file');
      return;
    }

    setLoading(true);
    setMessage('');
    setAnalysis('');

    const formData = new FormData();
    formData.append('contract', file);

    try {
      // Upload file
      const uploadResponse = await fetch('http://localhost:5000/upload', {
        method: 'POST',
        body: formData,
      });
      const uploadData = await uploadResponse.json();
      setMessage(uploadData.message || 'File uploaded successfully');

      // For demo, send dummy contractText to analyze API
      const contractText = 'This is a sample contract text to analyze.';

      const analysisResponse = await fetch('http://localhost:5000/analyze', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ contractText }),
      });
      const analysisData = await analysisResponse.json();
      setAnalysis(analysisData.analysis);
    } catch (error) {
      setMessage('Error uploading or analyzing file');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={{ maxWidth: 600, margin: 'auto', padding: 20 }}>
      <h2 style={{ color: '#7b2ff7' }}>AI Legal Assistant - Contract Review</h2>

      <form onSubmit={handleSubmit}>
        <label htmlFor="file-upload" style={{ display: 'block', marginBottom: 8, fontWeight: 'bold' }}>Upload Contract</label>
        <input
          id="file-upload"
          type="file"
          onChange={handleFileChange}
          accept=".pdf,.doc,.docx"
          style={{ width: '100%', padding: 8, marginBottom: 12 }}
        />
        <button
          type="submit"
          disabled={loading}
          style={{
            width: '100%',
            padding: '12px 20px',
            backgroundColor: '#7b2ff7',
            color: '#fff',
            fontWeight: 'bold',
            border: 'none',
            borderRadius: 4,
            cursor: loading ? 'not-allowed' : 'pointer'
          }}
        >
          {loading ? 'Uploading...' : 'Upload'}
        </button>
      </form>

      <p style={{ color: loading ? '#999' : 'green', fontStyle: 'italic', marginTop: 10 }}>{message}</p>

      {analysis && (
        <div style={{ marginTop: 20, padding: 12, backgroundColor: '#f2f2f2', borderRadius: 4, whiteSpace: 'pre-wrap' }}>
          <h3>Contract Analysis</h3>
          <p>{analysis}</p>
        </div>
      )}

      {files.length > 0 && (
        <div style={{ marginTop: 30 }}>
          <h3>Uploaded Contracts</h3>
          <ul style={{ paddingLeft: 20 }}>
            {files.map((file, idx) => (
              <li key={idx}>
                {file.originalName} — <em>{new Date(file.uploadTime).toLocaleString()}</em>
              </li>
            ))}
          </ul>
        </div>
      )}
    </div>
  );
};

export default UploadForm;
