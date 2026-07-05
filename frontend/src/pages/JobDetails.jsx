import React, { useState, useEffect, useContext } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import { AuthContext } from '../context/AuthContext';

const JobDetails = () => {
  const { id } = useParams();
  const { user, token, API_URL } = useContext(AuthContext);
  const [job, setJob] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  
  // Application form state
  const [coverLetter, setCoverLetter] = useState('');
  const [resumeText, setResumeText] = useState('');
  const [applySuccess, setApplySuccess] = useState('');
  const [applyError, setApplyError] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [hasApplied, setHasApplied] = useState(false);
  const [appliedStatus, setAppliedStatus] = useState('');

  const navigate = useNavigate();

  const fetchJobDetails = async () => {
    try {
      setLoading(true);
      setError('');
      
      const response = await fetch(`${API_URL}/jobs/${id}`);
      if (!response.ok) {
        throw new Error('Job listing not found');
      }
      const data = await response.json();
      setJob(data);
    } catch (err) {
      setError(err.message || 'Error fetching job details');
    } finally {
      setLoading(false);
    }
  };

  const checkIfApplied = async () => {
    if (!user || user.role !== 'seeker' || !token) return;

    try {
      const response = await fetch(`${API_URL}/applications/seeker`, {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });
      if (response.ok) {
        const applications = await response.json();
        const match = applications.find(app => app.job_id === parseInt(id));
        if (match) {
          setHasApplied(true);
          setAppliedStatus(match.status);
        }
      }
    } catch (err) {
      console.error('Error checking application status:', err);
    }
  };

  useEffect(() => {
    fetchJobDetails();
    checkIfApplied();
  }, [id, user]);

  const handleApplySubmit = async (e) => {
    e.preventDefault();
    if (!resumeText) {
      setApplyError('Please paste your resume content');
      return;
    }

    try {
      setApplyError('');
      setApplySuccess('');
      setSubmitting(true);

      const response = await fetch(`${API_URL}/applications`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({
          job_id: id,
          resume_text: resumeText,
          cover_letter: coverLetter
        })
      });

      const data = await response.json();
      if (!response.ok) {
        throw new Error(data.message || 'Failed to submit application');
      }

      setApplySuccess('Application submitted successfully!');
      setHasApplied(true);
      setAppliedStatus('Pending');
    } catch (err) {
      setApplyError(err.message || 'Something went wrong submitting application');
    } finally {
      setSubmitting(false);
    }
  };

  if (loading) {
    return (
      <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '60vh' }}>
        <div className="spinner"></div>
        <span style={{ fontSize: '1.25rem', color: 'var(--text-secondary)' }}>Loading job details...</span>
      </div>
    );
  }

  if (error || !job) {
    return (
      <div className="container" style={{ padding: '4rem 0' }}>
        <div className="alert alert-danger" style={{ textAlign: 'center' }}>
          <h3>Error</h3>
          <p>{error || 'Job not found'}</p>
          <Link to="/" className="btn btn-secondary" style={{ marginTop: '1.5rem' }}>Back to Listings</Link>
        </div>
      </div>
    );
  }

  return (
    <div className="container">
      {/* Detail Grid */}
      <div className="job-details-grid">
        <div className="job-content">
          <div style={{ display: 'flex', gap: '0.5rem', marginBottom: '1rem', alignItems: 'center' }}>
            <Link to="/" style={{ color: 'var(--primary)', fontWeight: 600 }}>← Back to Jobs</Link>
            <span style={{ color: 'var(--text-muted)' }}>|</span>
            <span style={{ color: 'var(--text-secondary)', fontSize: '0.9rem' }}>Posted {new Date(job.created_at).toLocaleDateString()}</span>
          </div>

          <span style={{ fontSize: '0.85rem', color: 'var(--primary)', fontWeight: 800, textTransform: 'uppercase', letterSpacing: '1px' }}>
            {job.category}
          </span>
          <h1 style={{ fontSize: '2.5rem', fontWeight: 800, marginTop: '0.5rem', marginBottom: '0.5rem' }}>{job.title}</h1>
          <h3 style={{ color: 'var(--text-secondary)', fontWeight: 600, fontSize: '1.2rem', marginBottom: '2rem' }}>
            {job.company_name}
          </h3>

          <hr style={{ border: 'none', height: '1px', backgroundColor: 'var(--glass-border)', margin: '2rem 0' }} />

          <h2>Job Description</h2>
          <p>{job.description}</p>

          {job.requirements && (
            <>
              <h2>Requirements</h2>
              <p>{job.requirements}</p>
            </>
          )}

          {job.employer_bio && (
            <>
              <h2>About {job.company_name}</h2>
              <p>{job.employer_bio}</p>
            </>
          )}
        </div>

        {/* Sidebar Info & Action */}
        <div className="sidebar-info">
          <div className="card">
            <h3 style={{ marginBottom: '1.25rem' }}>Job Overview</h3>
            <div className="sidebar-row">
              <span>Location</span>
              <span style={{ fontWeight: 600 }}>{job.location}</span>
            </div>
            <div className="sidebar-row">
              <span>Job Type</span>
              <span style={{ fontWeight: 600, color: 'var(--primary)' }}>{job.job_type}</span>
            </div>
            <div className="sidebar-row" style={{ borderBottom: 'none' }}>
              <span>Salary Range</span>
              <span style={{ fontWeight: 600, color: 'var(--secondary)' }}>{job.salary || 'Competitive'}</span>
            </div>
          </div>

          {/* Application Box */}
          <div className="card">
            <h3 style={{ marginBottom: '1.25rem' }}>Apply for this position</h3>
            
            {/* If user is the Employer who posted it */}
            {user && user.role === 'employer' && user.id === job.employer_id && (
              <div className="alert alert-success" style={{ fontSize: '0.9rem', marginBottom: 0 }}>
                You posted this listing. You can manage candidates in your dashboard.
                <Link to="/dashboard" className="btn btn-secondary btn-block" style={{ marginTop: '1rem', display: 'flex' }}>
                  Go to Dashboard
                </Link>
              </div>
            )}

            {/* If user is another Employer */}
            {user && user.role === 'employer' && user.id !== job.employer_id && (
              <div className="alert alert-danger" style={{ fontSize: '0.9rem', marginBottom: 0 }}>
                Employers cannot apply for jobs. Please register as a Job Seeker to apply.
              </div>
            )}

            {/* If user is Seeker and already applied */}
            {user && user.role === 'seeker' && hasApplied && (
              <div className="alert alert-success" style={{ fontSize: '0.9rem', marginBottom: 0, textAlign: 'center' }}>
                <h4>Already Applied</h4>
                <p style={{ margin: '0.5rem 0' }}>Your status: <span className={`badge badge-${appliedStatus.toLowerCase()}`}>{appliedStatus}</span></p>
                <p style={{ color: 'var(--text-secondary)', fontSize: '0.85rem' }}>The hiring team will review your details soon.</p>
              </div>
            )}

            {/* If user is Seeker and has NOT applied */}
            {user && user.role === 'seeker' && !hasApplied && (
              <form onSubmit={handleApplySubmit}>
                {applyError && <div className="alert alert-danger">{applyError}</div>}
                {applySuccess && <div className="alert alert-success">{applySuccess}</div>}

                <div className="form-group">
                  <label htmlFor="resumeText">Paste Resume text *</label>
                  <textarea
                    id="resumeText"
                    className="form-control"
                    placeholder="Paste your skills, work experience, education details..."
                    value={resumeText}
                    onChange={(e) => setResumeText(e.target.value)}
                    required
                  />
                </div>

                <div className="form-group">
                  <label htmlFor="coverLetter">Cover Letter</label>
                  <textarea
                    id="coverLetter"
                    className="form-control"
                    placeholder="Explain why you are a great fit for this role..."
                    value={coverLetter}
                    onChange={(e) => setCoverLetter(e.target.value)}
                  />
                </div>

                <button type="submit" className="btn btn-primary btn-block" disabled={submitting}>
                  {submitting ? 'Submitting Application...' : 'Submit Application'}
                </button>
              </form>
            )}

            {/* Guest User */}
            {!user && (
              <div style={{ textAlign: 'center' }}>
                <p style={{ color: 'var(--text-secondary)', marginBottom: '1.25rem', fontSize: '0.9rem' }}>
                  You need to be logged in as a Job Seeker to apply for this job.
                </p>
                <Link to="/login" className="btn btn-primary btn-block">Sign In</Link>
                <div style={{ marginTop: '0.75rem' }}>
                  <Link to="/register" style={{ fontSize: '0.85rem', color: 'var(--text-secondary)' }}>
                    Don't have an account? Register
                  </Link>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default JobDetails;
