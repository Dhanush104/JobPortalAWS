const db = require('../config/db');

// @desc    Apply to a job
// @route   POST /api/applications
// @access  Private (Seeker only)
const applyToJob = async (req, res) => {
  const { job_id, resume_text, cover_letter } = req.body;

  if (!job_id) {
    return res.status(400).json({ message: 'Job ID is required' });
  }

  try {
    // 1. Verify job exists
    const [jobs] = await db.query('SELECT * FROM jobs WHERE id = ?', [job_id]);
    if (jobs.length === 0) {
      return res.status(404).json({ message: 'Job not found' });
    }

    // 2. Check if already applied
    const [existing] = await db.query(
      'SELECT * FROM applications WHERE job_id = ? AND seeker_id = ?',
      [job_id, req.user.id]
    );
    if (existing.length > 0) {
      return res.status(400).json({ message: 'You have already applied for this job' });
    }

    // 3. Insert application
    await db.query(
      'INSERT INTO applications (job_id, seeker_id, resume_text, cover_letter) VALUES (?, ?, ?, ?)',
      [job_id, req.user.id, resume_text || null, cover_letter || null]
    );

    res.status(201).json({ message: 'Application submitted successfully' });
  } catch (error) {
    console.error('Apply Job Error:', error);
    res.status(500).json({ message: 'Server error submitting application' });
  }
};

// @desc    Get seeker applications
// @route   GET /api/applications/seeker
// @access  Private (Seeker only)
const getSeekerApplications = async (req, res) => {
  try {
    const [applications] = await db.query(
      `SELECT a.*, j.title, j.location, j.job_type, j.salary, u.company_name
       FROM applications a
       JOIN jobs j ON a.job_id = j.id
       JOIN users u ON j.employer_id = u.id
       WHERE a.seeker_id = ?
       ORDER BY a.created_at DESC`,
      [req.user.id]
    );
    res.json(applications);
  } catch (error) {
    console.error('Get Seeker Applications Error:', error);
    res.status(500).json({ message: 'Server error fetching applications' });
  }
};

// @desc    Get applications for a specific job listing
// @route   GET /api/applications/job/:jobId
// @access  Private (Employer only)
const getJobApplications = async (req, res) => {
  const jobId = req.params.jobId;

  try {
    // Verify job belongs to this employer
    const [jobs] = await db.query('SELECT * FROM jobs WHERE id = ? AND employer_id = ?', [jobId, req.user.id]);
    if (jobs.length === 0) {
      return res.status(403).json({ message: 'Not authorized to view applications for this job' });
    }

    const [applications] = await db.query(
      `SELECT a.*, u.name as seeker_name, u.email as seeker_email, u.bio as seeker_bio, u.skills as seeker_skills
       FROM applications a
       JOIN users u ON a.seeker_id = u.id
       WHERE a.job_id = ?
       ORDER BY a.created_at DESC`,
      [jobId]
    );

    res.json(applications);
  } catch (error) {
    console.error('Get Job Applications Error:', error);
    res.status(500).json({ message: 'Server error fetching job applications' });
  }
};

// @desc    Update application status
// @route   PUT /api/applications/:id/status
// @access  Private (Employer only)
const updateApplicationStatus = async (req, res) => {
  const applicationId = req.params.id;
  const { status } = req.body;

  if (!status || !['Pending', 'Shortlisted', 'Rejected'].includes(status)) {
    return res.status(400).json({ message: 'Invalid status. Must be Pending, Shortlisted, or Rejected' });
  }

  try {
    // 1. Verify application exists and belongs to a job posted by this employer
    const [applications] = await db.query(
      `SELECT a.*, j.employer_id 
       FROM applications a
       JOIN jobs j ON a.job_id = j.id
       WHERE a.id = ?`,
      [applicationId]
    );

    if (applications.length === 0) {
      return res.status(404).json({ message: 'Application not found' });
    }

    const app = applications[0];
    if (app.employer_id !== req.user.id) {
      return res.status(403).json({ message: 'Not authorized to modify this application status' });
    }

    // 2. Update status
    await db.query('UPDATE applications SET status = ? WHERE id = ?', [status, applicationId]);
    res.json({ message: 'Application status updated successfully' });
  } catch (error) {
    console.error('Update Status Error:', error);
    res.status(500).json({ message: 'Server error updating application status' });
  }
};

module.exports = { applyToJob, getSeekerApplications, getJobApplications, updateApplicationStatus };
