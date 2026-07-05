import React, { useState, useContext } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { AuthContext } from '../context/AuthContext';

const Register = () => {
  const { register } = useContext(AuthContext);
  const [role, setRole] = useState('seeker'); // default: seeker
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [companyName, setCompanyName] = useState('');
  const [bio, setBio] = useState('');
  const [skills, setSkills] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!name || !email || !password || !role) {
      setError('Please fill in all required fields');
      return;
    }

    const payload = {
      name,
      email,
      password,
      role,
      bio,
      company_name: role === 'employer' ? companyName : null,
      skills: role === 'seeker' ? skills : null
    };

    try {
      setError('');
      setLoading(true);
      await register(payload);
      navigate('/dashboard');
    } catch (err) {
      setError(err.message || 'Failed to register');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="container" style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', minHeight: '90vh', padding: '2rem 0' }}>
      <div className="card" style={{ width: '100%', maxWidth: '550px' }}>
        <h2 style={{ textAlign: 'center', marginBottom: '0.5rem', fontWeight: 800 }}>Create an Account</h2>
        <p style={{ textAlign: 'center', color: 'var(--text-secondary)', marginBottom: '2rem' }}>
          Join us today to explore new job opportunities or hire top talent
        </p>

        {error && <div className="alert alert-danger">{error}</div>}

        <form onSubmit={handleSubmit}>
          {/* Role selector tabs */}
          <div className="form-group">
            <label style={{ display: 'block', marginBottom: '0.75rem' }}>I want to sign up as a:</label>
            <div style={{ display: 'flex', gap: '1rem' }}>
              <button
                type="button"
                className={`btn btn-block ${role === 'seeker' ? 'btn-primary' : 'btn-secondary'}`}
                style={{ flex: 1 }}
                onClick={() => setRole('seeker')}
              >
                💼 Job Seeker
              </button>
              <button
                type="button"
                className={`btn btn-block ${role === 'employer' ? 'btn-primary' : 'btn-secondary'}`}
                style={{ flex: 1, marginTop: 0 }}
                onClick={() => setRole('employer')}
              >
                🏢 Employer
              </button>
            </div>
          </div>

          <div className="form-group">
            <label htmlFor="name">Full Name</label>
            <input
              id="name"
              type="text"
              className="form-control"
              placeholder="e.g. John Doe"
              value={name}
              onChange={(e) => setName(e.target.value)}
              required
            />
          </div>

          <div className="form-group">
            <label htmlFor="email">Email Address</label>
            <input
              id="email"
              type="email"
              className="form-control"
              placeholder="name@example.com"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
            />
          </div>

          <div className="form-group">
            <label htmlFor="password">Password</label>
            <input
              id="password"
              type="password"
              className="form-control"
              placeholder="Min 6 characters"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
            />
          </div>

          {/* Conditional field for Employer */}
          {role === 'employer' && (
            <div className="form-group">
              <label htmlFor="companyName">Company Name</label>
              <input
                id="companyName"
                type="text"
                className="form-control"
                placeholder="e.g. Acme Corporation"
                value={companyName}
                onChange={(e) => setCompanyName(e.target.value)}
                required
              />
            </div>
          )}

          {/* Conditional field for Job Seeker */}
          {role === 'seeker' && (
            <div className="form-group">
              <label htmlFor="skills">Professional Skills</label>
              <input
                id="skills"
                type="text"
                className="form-control"
                placeholder="e.g. React, Node.js, SQL, CSS"
                value={skills}
                onChange={(e) => setSkills(e.target.value)}
              />
            </div>
          )}

          <div className="form-group">
            <label htmlFor="bio">
              {role === 'employer' ? 'Company Description' : 'Professional Summary / Bio'}
            </label>
            <textarea
              id="bio"
              className="form-control"
              placeholder={role === 'employer' ? 'Tell job seekers about your company...' : 'Tell employers about yourself...'}
              value={bio}
              onChange={(e) => setBio(e.target.value)}
            />
          </div>

          <button type="submit" className="btn btn-primary btn-block" disabled={loading} style={{ marginTop: '1rem' }}>
            {loading ? 'Creating Account...' : 'Get Started'}
          </button>
        </form>

        <p style={{ textAlign: 'center', marginTop: '1.5rem', color: 'var(--text-secondary)', fontSize: '0.9rem' }}>
          Already have an account? <Link to="/login" style={{ color: 'var(--primary)', fontWeight: 600 }}>Login here</Link>
        </p>
      </div>
    </div>
  );
};

export default Register;
