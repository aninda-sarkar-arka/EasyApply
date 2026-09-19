import { useEffect, useState, useCallback } from 'react';
import axios from 'axios';
import { useDropzone } from 'react-dropzone';

const ResumeManager = () => {
  const [resumes, setResumes] = useState([]);
  const [loading, setLoading] = useState(true);
  const [uploading, setUploading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  const fetchResumes = async () => {
    try {
      const res = await axios.get('http://localhost:5000/api/resumes');
      setResumes(res.data);
    } catch {
      setError('Failed to load resumes.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { fetchResumes(); }, []);

  const onDrop = useCallback(async (acceptedFiles) => {
    if (acceptedFiles.length === 0) return;
    setUploading(true);
    setError('');
    try {
      for (const file of acceptedFiles) {
        const formData = new FormData();
        formData.append('resume', file);
        await axios.post('http://localhost:5000/api/resumes/upload', formData, {
          headers: { 'Content-Type': 'multipart/form-data' },
        });
      }
      setSuccess(`${acceptedFiles.length} resume(s) uploaded successfully!`);
      setTimeout(() => setSuccess(''), 3000);
      fetchResumes();
    } catch (err) {
      setError(err.response?.data?.msg || 'Upload failed. Only PDF/DOC files under 5MB are allowed.');
    } finally {
      setUploading(false);
    }
  }, []);

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    accept: {
      'application/pdf': ['.pdf'],
      'application/msword': ['.doc'],
      'application/vnd.openxmlformats-officedocument.wordprocessingml.document': ['.docx'],
    },
    maxSize: 5 * 1024 * 1024,
  });

  const handleDelete = async (id) => {
    if (!window.confirm('Delete this resume?')) return;
    try {
      await axios.delete(`http://localhost:5000/api/resumes/${id}`);
      fetchResumes();
    } catch {
      setError('Failed to delete resume.');
    }
  };

  const handleDownload = async (filename, originalName) => {
    try {
      const res = await axios.get(`http://localhost:5000/api/resumes/download/${filename}`, {
        responseType: 'blob',
      });
      const url = window.URL.createObjectURL(new Blob([res.data]));
      const link = document.createElement('a');
      link.href = url;
      link.download = originalName;
      link.click();
      window.URL.revokeObjectURL(url);
    } catch {
      setError('Download failed.');
    }
  };

  return (
    <section className="page page-content">
      <div className="page-header">
        <h1>Resume Manager</h1>
        <p>Upload, manage, and version your resumes.</p>
      </div>

      {error && <div className="notice error">{error}</div>}
      {success && <div className="notice success">{success}</div>}

      <div {...getRootProps()} className={`dropzone${isDragActive ? ' active' : ''}`}>
        <input {...getInputProps()} />
        <div className="icon">📄</div>
        {uploading ? (
          <p>Uploading...</p>
        ) : isDragActive ? (
          <p>Drop your resume here...</p>
        ) : (
          <>
            <p><strong>Drag & drop</strong> your resume here, or <strong>click to browse</strong></p>
            <p style={{ fontSize: '0.82rem', marginTop: '0.3rem', color: '#5a6f85' }}>PDF, DOC, DOCX — Max 5MB</p>
          </>
        )}
      </div>

      {loading && <div className="notice">Loading resumes...</div>}

      {!loading && resumes.length === 0 && (
        <div className="panel empty-state">
          <h3>No resumes uploaded</h3>
          <p>Upload your first resume to get started.</p>
        </div>
      )}

      {resumes.length > 0 && (
        <section className="panel">
          <div className="panel-title">
            <h2>Your Resumes ({resumes.length})</h2>
          </div>
          {resumes.map((resume) => (
            <div className="resume-item" key={resume._id}>
              <div className="resume-item-info">
                <h4>📄 {resume.originalName}</h4>
                <p>Uploaded {new Date(resume.uploadDate).toLocaleDateString()}</p>
              </div>
              <div className="resume-actions">
                <button className="copy-btn" onClick={() => handleDownload(resume.filename, resume.originalName)}>
                  Download
                </button>
                <button className="remove-btn" onClick={() => handleDelete(resume._id)}>
                  Delete
                </button>
              </div>
            </div>
          ))}
        </section>
      )}
    </section>
  );
};

export default ResumeManager;
