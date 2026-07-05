import React, { useState, useEffect, useContext } from 'react';
import { AuthContext } from '../context/AuthContext';
import JobCard from '../components/JobCard';

const Home = () => {
  const { API_URL } = useContext(AuthContext);
  const [jobs, setJobs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  // Search & Filter state
  const [search, setSearch] = useState('');
  const [location, setLocation] = useState('');
  const [jobType, setJobType] = useState('');
  const [category, setCategory] = useState('');

  const fetchJobs = async () => {
    try {
      setLoading(true);
      setError('');
      
      const queryParams = new URLSearchParams();
      if (search) queryParams.append('search', search);
      if (location) queryParams.append('location', location);
      if (jobType) queryParams.append('job_type', jobType);
      if (category) queryParams.append('category', category);

      const response = await fetch(`${API_URL}/jobs?${queryParams.toString()}`);
      if (!response.ok) {
        throw new Error('Failed to fetch jobs');
      }
      const data = await response.json();
      setJobs(data);
    } catch (err) {
      setError(err.message || 'Something went wrong fetching jobs');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchJobs();
  }, []);

  const handleSearchSubmit = (e) => {
    e.preventDefault();
    fetchJobs();
  };

  const handleClearFilters = () => {
    setSearch('');
    setLocation('');
    setJobType('');
    setCategory('');
    // We can't wait for state to update, so fetch using blank filters
    setTimeout(() => {
      fetchJobs();
    }, 0);
  };

  return (
    <div className="container">
      {/* Hero Header */}
      <div className="hero">
        <h1>Find Your <span>Dream Career</span> Today</h1>
        <p>Discover thousands of opportunities or find the perfect hire for your team.</p>
      </div>

      {/* Filter panel */}
      <form onSubmit={handleSearchSubmit} className="search-bar">
        <div style={{ display: 'flex', flexDirection: 'column', gap: '0.25rem' }}>
          <label style={{ fontSize: '0.8rem', fontWeight: 700, color: 'var(--text-secondary)' }}>Keywords</label>
          <input
            type="text"
            className="form-control"
            placeholder="Title, description, company..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
        </div>

        <div style={{ display: 'flex', flexDirection: 'column', gap: '0.25rem' }}>
          <label style={{ fontSize: '0.8rem', fontWeight: 700, color: 'var(--text-secondary)' }}>Location</label>
          <input
            type="text"
            className="form-control"
            placeholder="City, Remote, Country..."
            value={location}
            onChange={(e) => setLocation(e.target.value)}
          />
        </div>

        <div style={{ display: 'flex', flexDirection: 'column', gap: '0.25rem' }}>
          <label style={{ fontSize: '0.8rem', fontWeight: 700, color: 'var(--text-secondary)' }}>Job Type</label>
          <select
            className="form-control"
            value={jobType}
            onChange={(e) => setJobType(e.target.value)}
          >
            <option value="">All Types</option>
            <option value="Full-time">Full-time</option>
            <option value="Part-time">Part-time</option>
            <option value="Contract">Contract</option>
            <option value="Remote">Remote</option>
            <option value="Internship">Internship</option>
          </select>
        </div>

        <div style={{ display: 'flex', gap: '0.5rem' }}>
          <button type="submit" className="btn btn-primary" style={{ flex: 1 }}>
            Search
          </button>
          <button type="button" onClick={handleClearFilters} className="btn btn-secondary" title="Clear Filters">
            ✕
          </button>
        </div>
      </form>

      {/* Error display */}
      {error && <div className="alert alert-danger">{error}</div>}

      {/* Job list */}
      <div style={{ marginBottom: '1.5rem' }}>
        <h2 style={{ fontSize: '1.75rem', fontWeight: 700, marginBottom: '1.5rem' }}>
          {loading ? 'Searching opportunities...' : `${jobs.length} Open Positions`}
        </h2>
      </div>

      {loading ? (
        <div style={{ display: 'flex', justifyContent: 'center', margin: '4rem 0' }}>
          <div className="spinner"></div>
          <span style={{ fontSize: '1.25rem', color: 'var(--text-secondary)' }}>Loading jobs...</span>
        </div>
      ) : jobs.length === 0 ? (
        <div className="card" style={{ textAlign: 'center', padding: '4rem 2rem', marginBottom: '4rem' }}>
          <p style={{ fontSize: '1.25rem', color: 'var(--text-secondary)', marginBottom: '1.5rem' }}>
            No jobs match your search parameters. Try adjusting your filters.
          </p>
          <button type="button" onClick={handleClearFilters} className="btn btn-primary">
            Clear All Filters
          </button>
        </div>
      ) : (
        <div className="jobs-list">
          {jobs.map((job) => (
            <JobCard key={job.id} job={job} />
          ))}
        </div>
      )}
    </div>
  );
};

export default Home;
