import React, { useState, useEffect, useContext } from 'react';
import { Link } from 'react-router-dom';
import { AuthContext } from '../context/AuthContext';

const Dashboard = () => {
  const { user, token, API_URL } = useContext(AuthContext);
  
  // States
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  
  // Seeker states
  const [seekerApplications, setSeekerApplications] = useState([]);
  
  // Employer states
  const [employerJobs, setEmployerJobs] = useState([]);
  const [selectedJob, setSelectedJob] = useState(null); // Full job object if viewing applicants
  const [jobApplicants, setJobApplicants] = useState([]);
  const [updatingStatusId, setUpdatingStatusId] = useState(null);

  // Fetch seeker applications
  const fetchSeekerDashboard = async () => {
    try {
      setLoading(true);
      setError('');
      const response = await fetch(`${API_URL}/applications/seeker`, {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });
      if (!response.ok) {
        throw new Error('Failed to fetch applications');
      }
      const data = await response.json();
      setSeekerApplications(data);
    } catch (err) {
      setError(err.message || 'Error loading dashboard');
    } finally {
      setLoading(false);
    }
  };

  // Fetch employer job listings
  const fetchEmployerDashboard = async () => {
    try {
      setLoading(true);
      setError('');
      const response = await fetch(`${API_URL}/jobs/my-postings`, {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });
      if (!response.ok) {
        throw new Error('Failed to fetch job postings');
      }
      const data = await response.json();
      setEmployerJobs(data);
    } catch (err) {
      setError(err.message || 'Error loading job postings');
    } finally {
      setLoading(false);
    }
  };

  // Fetch applicants for a specific job
  const fetchApplicants = async (job) => {
    try {
      setLoading(true);
      setError('');
      const response = await fetch(`${API_URL}/applications/job/${job.id}`, {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });
      if (!response.ok) {
        throw new Error('Failed to fetch applicants');
      }
      const data = await response.json();
      setJobApplicants(data);
      setSelectedJob(job);
    } catch (err) {
      setError(err.message || 'Error loading applicants');
    } finally {
      setLoading(false);
    }
  };

  // Update applicant status (Shortlist/Reject)
  const handleUpdateStatus = async (applicationId, newStatus) => {
    try {
      setUpdatingStatusId(applicationId);
      const response = await fetch(`${API_URL}/applications/${applicationId}/status`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({ status: newStatus })
      });

      if (!response.ok) {
        const data = await response.json();
        throw new Error(data.message || 'Failed to update status');
      }

      // Refresh applicants list
      setJobApplicants(prev => 
        prev.map(app => app.id === applicationId ? { ...app, status: newStatus } : app)
      );
    } catch (err) {
      alert(err.message || 'Error updating status');
    } finally {
      setUpdatingStatusId(null);
    }
  };

  useEffect(() => {
    if (user && token) {
      if (user.role === 'seeker') {
        fetchSeekerDashboard();
      } else {
        fetchEmployerDashboard();
      }
    }
  }, [user, token]);

  if (loading && !selectedJob && employerJobs.length === 0 && seekerApplications.length === 0) {
    return (
      <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '60vh' }}>
        <div className="spinner"></div>
        <span style={{ fontSize: '1.25rem', color: 'var(--text-secondary)' }}>Loading Dashboard...</span>
      </div>
    );
  }

  // --- JOB SEEKER VIEW ---
  if (user.role === 'seeker') {
    return (
      <div className="container">
        <div className="dashboard-header">
          <div>
            <h1 style={{ fontSize: '2.5rem', fontWeight: 800 }}>Job Seeker Dashboard</h1>
            <p style={{ color: 'var(--text-secondary)' }}>Track and manage your submitted applications</p>
          </div>
          <Link to="/" className="btn btn-primary">Find Jobs</Link>
        </div>

        {error && <div className="alert alert-danger">{error}</div>}

        <div className="card">
          <h2 style={{ fontSize: '1.5rem', marginBottom: '1rem', fontWeight: 700 }}>Your Applications</h2>
          
          {seekerApplications.length === 0 ? (
            <div style={{ textAlign: 'center', padding: '3rem 0' }}>
              <p style={{ color: 'var(--text-secondary)', marginBottom: '1.5rem', fontSize: '1.1rem' }}>
                You haven't applied for any jobs yet.
              </p>
              <Link to="/" className="btn btn-primary">Browse Jobs</Link>
            </div>
          ) : (
            <div style={{ overflowX: 'auto' }}>
              <table className="dashboard-table">
                <thead>
                  <tr>
                    <th>Job Title</th>
                    <th>Company</th>
                    <th>Location</th>
                    <th>Applied Date</th>
                    <th>Status</th>
                    <th>Action</th>
                  </tr>
                </thead>
                <tbody>
                  {seekerApplications.map((app) => (
                    <tr key={app.id}>
                      <td><strong style={{ color: '#fff' }}>{app.title}</strong></td>
                      <td>{app.company_name}</td>
                      <td>{app.location}</td>
                      <td>{new Date(app.created_at).toLocaleDateString()}</td>
                      <td>
                        <span className={`badge badge-${app.status.toLowerCase()}`}>
                          {app.status}
                        </span>
                      </td>
                      <td>
                        <Link to={`/jobs/${app.job_id}`} className="btn btn-secondary" style={{ padding: '0.25rem 0.75rem', fontSize: '0.85rem' }}>
                          View Job
                        </Link>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </div>
    );
  }

  // --- EMPLOYER VIEW ---
  return (
    <div className="container">
      {/* 1. VIEWING APPLICANTS FOR A SPECIFIC JOB */}
      {selectedJob ? (
        <div>
          <div className="dashboard-header">
            <div>
              <button 
                onClick={() => { setSelectedJob(null); fetchEmployerDashboard(); }} 
                className="btn btn-secondary" 
                style={{ padding: '0.4rem 0.8rem', fontSize: '0.85rem', marginBottom: '1rem' }}
              >
                ← Back to Job Postings
              </button>
              <h1 style={{ fontSize: '2.2rem', fontWeight: 800 }}>Applicants for {selectedJob.title}</h1>
              <p style={{ color: 'var(--text-secondary)' }}>
                Review, shortlist, or reject candidates for this listing
              </p>
            </div>
          </div>

          {error && <div className="alert alert-danger">{error}</div>}

          <div className="card">
            <h2 style={{ fontSize: '1.5rem', marginBottom: '1.5rem', fontWeight: 700 }}>
              {jobApplicants.length === 0 ? 'No Applicants Yet' : `Candidates (${jobApplicants.length})`}
            </h2>

            {jobApplicants.length === 0 ? (
              <div style={{ textAlign: 'center', padding: '3rem 0' }}>
                <p style={{ color: 'var(--text-secondary)', fontSize: '1.1rem' }}>
                  No candidate profiles have been submitted for this job listing.
                </p>
              </div>
            ) : (
              <div>
                {jobApplicants.map((app) => (
                  <div key={app.id} className="applicant-card">
                    <div className="applicant-info">
                      <div className="applicant-details">
                        <h4>{app.seeker_name}</h4>
                        <div className="applicant-meta">
                          <span>📧 {app.seeker_email}</span>
                          <span style={{ margin: '0 0.75rem' }}>|</span>
                          <span>Applied on: {new Date(app.created_at).toLocaleDateString()}</span>
                        </div>
                      </div>
                      
                      {/* Evaluation actions */}
                      <div style={{ display: 'flex', gap: '0.5rem', alignItems: 'center' }}>
                        <span className={`badge badge-${app.status.toLowerCase()}`} style={{ marginRight: '0.5rem' }}>
                          {app.status}
                        </span>
                        
                        {app.status === 'Pending' && (
                          <>
                            <button
                              onClick={() => handleUpdateStatus(app.id, 'Shortlisted')}
                              className="btn btn-success"
                              style={{ padding: '0.35rem 0.75rem', fontSize: '0.85rem' }}
                              disabled={updatingStatusId === app.id}
                            >
                              Shortlist
                            </button>
                            <button
                              onClick={() => handleUpdateStatus(app.id, 'Rejected')}
                              className="btn btn-danger"
                              style={{ padding: '0.35rem 0.75rem', fontSize: '0.85rem' }}
                              disabled={updatingStatusId === app.id}
                            >
                              Reject
                            </button>
                          </>
                        )}
                        
                        {app.status !== 'Pending' && (
                          <button
                            onClick={() => handleUpdateStatus(app.id, 'Pending')}
                            className="btn btn-secondary"
                            style={{ padding: '0.35rem 0.75rem', fontSize: '0.85rem' }}
                            disabled={updatingStatusId === app.id}
                          >
                            Reset to Pending
                          </button>
                        )}
                      </div>
                    </div>

                    {app.seeker_bio && (
                      <div style={{ marginBottom: '0.75rem', fontSize: '0.9rem' }}>
                        <strong style={{ color: 'var(--text-secondary)' }}>Candidate Bio: </strong> 
                        <span style={{ color: 'var(--text-primary)' }}>{app.seeker_bio}</span>
                      </div>
                    )}

                    {app.seeker_skills && (
                      <div style={{ marginBottom: '1rem', fontSize: '0.9rem' }}>
                        <strong style={{ color: 'var(--text-secondary)' }}>Skills: </strong>
                        <span style={{ color: 'var(--secondary)', fontWeight: 600 }}>{app.seeker_skills}</span>
                      </div>
                    )}

                    {app.cover_letter && (
                      <div>
                        <h5 style={{ color: 'var(--text-secondary)', marginBottom: '0.25rem', fontSize: '0.9rem' }}>Cover Letter:</h5>
                        <div className="applicant-content" style={{ whiteSpace: 'pre-wrap' }}>{app.cover_letter}</div>
                      </div>
                    )}

                    <div>
                      <h5 style={{ color: 'var(--text-secondary)', marginBottom: '0.25rem', fontSize: '0.9rem' }}>Resume Text:</h5>
                      <div className="applicant-content" style={{ whiteSpace: 'pre-wrap', fontFamily: 'monospace', fontSize: '0.85rem' }}>
                        {app.resume_text}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      ) : (
        /* 2. GENERAL EMPLOYER JOB LISTINGS VIEW */
        <div>
          <div className="dashboard-header">
            <div>
              <h1 style={{ fontSize: '2.5rem', fontWeight: 800 }}>Employer Dashboard</h1>
              <p style={{ color: 'var(--text-secondary)' }}>Post new positions and evaluate candidates</p>
            </div>
            <Link to="/post-job" className="btn btn-primary">Post a Job</Link>
          </div>

          {error && <div className="alert alert-danger">{error}</div>}

          <div className="card">
            <h2 style={{ fontSize: '1.5rem', marginBottom: '1rem', fontWeight: 700 }}>Your Active Postings</h2>
            
            {employerJobs.length === 0 ? (
              <div style={{ textAlign: 'center', padding: '3rem 0' }}>
                <p style={{ color: 'var(--text-secondary)', marginBottom: '1.5rem', fontSize: '1.1rem' }}>
                  You haven't posted any job listings yet.
                </p>
                <Link to="/post-job" className="btn btn-primary">Post Your First Job</Link>
              </div>
            ) : (
              <div style={{ overflowX: 'auto' }}>
                <table className="dashboard-table">
                  <thead>
                    <tr>
                      <th>Job Title</th>
                      <th>Location</th>
                      <th>Job Type</th>
                      <th>Salary Range</th>
                      <th>Posted Date</th>
                      <th>Actions</th>
                    </tr>
                  </thead>
                  <tbody>
                    {employerJobs.map((job) => (
                      <tr key={job.id}>
                        <td><strong style={{ color: '#fff' }}>{job.title}</strong></td>
                        <td>{job.location}</td>
                        <td>{job.job_type}</td>
                        <td>{job.salary || 'Competitive'}</td>
                        <td>{new Date(job.created_at).toLocaleDateString()}</td>
                        <td>
                          <div style={{ display: 'flex', gap: '0.5rem' }}>
                            <button
                              onClick={() => fetchApplicants(job)}
                              className="btn btn-primary"
                              style={{ padding: '0.3rem 0.8rem', fontSize: '0.85rem' }}
                            >
                              View Applicants
                            </button>
                            <Link
                              to={`/jobs/${job.id}`}
                              className="btn btn-secondary"
                              style={{ padding: '0.3rem 0.8rem', fontSize: '0.85rem' }}
                            >
                              Public View
                            </Link>
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
};

export default Dashboard;
