import React from 'react';
import { Link } from 'react-router-dom';

const JobCard = ({ job }) => {
  const getJobTypeColor = (type) => {
    switch (type) {
      case 'Full-time': return '#6366f1';
      case 'Part-time': return '#10b981';
      case 'Contract': return '#f59e0b';
      case 'Remote': return '#ec4899';
      case 'Internship': return '#8b5cf6';
      default: return 'var(--text-secondary)';
    }
  };

  return (
    <div className="card job-card">
      <div className="job-card-details">
        <span style={{ fontSize: '0.8rem', color: 'var(--text-muted)', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '1px' }}>
          {job.category}
        </span>
        <h3 style={{ marginTop: '0.25rem' }}>{job.title}</h3>
        <p style={{ color: 'var(--text-secondary)', fontWeight: 600, fontSize: '0.95rem', marginBottom: '0.75rem' }}>
          {job.company_name || 'Anonymous Employer'}
        </p>
        
        <div className="job-card-meta">
          <span style={{ color: getJobTypeColor(job.job_type), fontWeight: 700 }}>
            ● {job.job_type}
          </span>
          <span>📍 {job.location}</span>
          {job.salary && <span>💰 {job.salary}</span>}
        </div>
      </div>
      
      <div className="job-card-action">
        <Link to={`/jobs/${job.id}`} className="btn btn-secondary">
          View Details
        </Link>
      </div>
    </div>
  );
};

export default JobCard;
