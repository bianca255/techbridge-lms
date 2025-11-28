import React, { useState, useEffect } from 'react';
import { certificateService } from '../services';
import LoadingSpinner from '../components/LoadingSpinner';
import './Certificates.css';

const Certificates = () => {
  const [certificates, setCertificates] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchCertificates();
  }, []);

  const fetchCertificates = async () => {
    try {
      const response = await certificateService.getMyCertificates();
      setCertificates(response.data.data.certificates);
    } catch (error) {
      console.error('Error fetching certificates:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleDownload = async (courseId, courseName) => {
    try {
      const response = await certificateService.downloadCertificate(courseId);
      
      // Create blob from response
      const blob = new Blob([response.data], { type: 'application/pdf' });
      const url = window.URL.createObjectURL(blob);
      
      // Create temporary link and trigger download
      const link = document.createElement('a');
      link.href = url;
      link.download = `certificate_${courseName.replace(/\s+/g, '_')}.pdf`;
      document.body.appendChild(link);
      link.click();
      
      // Cleanup
      document.body.removeChild(link);
      window.URL.revokeObjectURL(url);
    } catch (error) {
      alert('Failed to download certificate');
      console.error('Download error:', error);
    }
  };

  const formatDate = (date) => {
    return new Date(date).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
  };

  if (loading) return <LoadingSpinner />;

  return (
    <div className="certificates-page">
      <div className="container">
        <div className="page-header">
          <h1>My Certificates</h1>
          <p>Download and share your achievements</p>
        </div>

        {certificates.length > 0 ? (
          <div className="certificates-grid">
            {certificates.map((cert, index) => (
              <div key={index} className="certificate-card">
                <div className="certificate-thumbnail">
                  <img 
                    src={cert.course.thumbnail || '/placeholder.jpg'} 
                    alt={cert.course.title}
                  />
                  <div className="certificate-overlay">
                    <span className="certificate-icon">🏆</span>
                  </div>
                </div>

                <div className="certificate-content">
                  <h3>{cert.course.title}</h3>
                  <p className="certificate-category">{cert.course.category}</p>
                  
                  <div className="certificate-meta">
                    <div className="meta-item">
                      <span className="label">Completed:</span>
                      <span className="value">{formatDate(cert.completionDate)}</span>
                    </div>
                    <div className="meta-item">
                      <span className="label">Certificate ID:</span>
                      <span className="value cert-id">{cert.id}</span>
                    </div>
                  </div>

                  <div className="certificate-actions">
                    <button 
                      onClick={() => handleDownload(cert.course._id, cert.course.title)}
                      className="btn btn-primary"
                    >
                      📥 Download PDF
                    </button>
                    <button className="btn btn-outline">
                      🔗 Share
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="empty-state">
            <div className="empty-icon">📜</div>
            <h2>No Certificates Yet</h2>
            <p>Complete a course to earn your first certificate!</p>
            <a href="/courses" className="btn btn-primary">Browse Courses</a>
          </div>
        )}
      </div>
    </div>
  );
};

export default Certificates;
