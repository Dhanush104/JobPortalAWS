const db = require('../config/db');

// @desc    Get all jobs (with filtering)
// @route   GET /api/jobs
// @access  Public
const getJobs = async (req, res) => {
  const { search, location, job_type, category } = req.query;
  
  let query = `
    SELECT j.*, u.name as employer_name, u.company_name 
    FROM jobs j 
    JOIN users u ON j.employer_id = u.id 
    WHERE 1=1
  `;
  const params = [];

  if (search) {
    query += ` AND (j.title LIKE ? OR j.description LIKE ? OR u.company_name LIKE ?)`;
    params.push(`%${search}%`, `%${search}%`, `%${search}%`);
  }

  if (location) {
    query += ` AND j.location LIKE ?`;
    params.push(`%${location}%`);
  }

  if (job_type) {
    query += ` AND j.job_type = ?`;
    params.push(job_type);
  }

  if (category) {
    query += ` AND j.category LIKE ?`;
    params.push(`%${category}%`);
  }

  query += ` ORDER BY j.created_at DESC`;

  try {
    const [jobs] = await db.query(query, params);
    res.json(jobs);
  } catch (error) {
    console.error('Get Jobs Error:', error);
    res.status(500).json({ message: 'Server error fetching jobs' });
  }
};

// @desc    Get jobs posted by the logged-in employer
// @route   GET /api/jobs/my-postings
// @access  Private (Employer only)
const getEmployerJobs = async (req, res) => {
  try {
    const [jobs] = await db.query(
      'SELECT * FROM jobs WHERE employer_id = ? ORDER BY created_at DESC',
      [req.user.id]
    );
    res.json(jobs);
  } catch (error) {
    console.error('Get Employer Jobs Error:', error);
    res.status(500).json({ message: 'Server error fetching employer jobs' });
  }
};

// @desc    Get job by ID
// @route   GET /api/jobs/:id
// @access  Public
const getJobById = async (req, res) => {
  const jobId = req.params.id;

  try {
    const [jobs] = await db.query(
      `SELECT j.*, u.name as employer_name, u.company_name, u.bio as employer_bio 
       FROM jobs j 
       JOIN users u ON j.employer_id = u.id 
       WHERE j.id = ?`,
      [jobId]
    );

    if (jobs.length === 0) {
      return res.status(404).json({ message: 'Job not found' });
    }

    res.json(jobs[0]);
  } catch (error) {
    console.error('Get Job By ID Error:', error);
    res.status(500).json({ message: 'Server error fetching job details' });
  }
};

// @desc    Create a job posting
// @route   POST /api/jobs
// @access  Private (Employer only)
const createJob = async (req, res) => {
  const { title, description, requirements, location, job_type, salary, category } = req.body;

  if (!title || !description || !location || !job_type || !category) {
    return res.status(400).json({ message: 'Please include all required fields (title, description, location, job_type, category)' });
  }

  try {
    const [result] = await db.query(
      `INSERT INTO jobs (employer_id, title, description, requirements, location, job_type, salary, category) 
       VALUES (?, ?, ?, ?, ?, ?, ?, ?)`,
      [req.user.id, title, description, requirements || null, location, job_type, salary || null, category]
    );

    res.status(201).json({
      message: 'Job posting created successfully',
      jobId: result.insertId
    });
  } catch (error) {
    console.error('Create Job Error:', error);
    res.status(500).json({ message: 'Server error creating job listing' });
  }
};

// @desc    Update a job posting
// @route   PUT /api/jobs/:id
// @access  Private (Employer owner only)
const updateJob = async (req, res) => {
  const jobId = req.params.id;
  const { title, description, requirements, location, job_type, salary, category } = req.body;

  try {
    const [jobs] = await db.query('SELECT * FROM jobs WHERE id = ?', [jobId]);
    if (jobs.length === 0) {
      return res.status(404).json({ message: 'Job not found' });
    }

    const job = jobs[0];
    if (job.employer_id !== req.user.id) {
      return res.status(403).json({ message: 'Not authorized to update this job listing' });
    }

    await db.query(
      `UPDATE jobs SET title = ?, description = ?, requirements = ?, location = ?, job_type = ?, salary = ?, category = ? 
       WHERE id = ?`,
      [
        title || job.title,
        description || job.description,
        requirements !== undefined ? requirements : job.requirements,
        location || job.location,
        job_type || job.job_type,
        salary !== undefined ? salary : job.salary,
        category || job.category,
        jobId
      ]
    );

    res.json({ message: 'Job posting updated successfully' });
  } catch (error) {
    console.error('Update Job Error:', error);
    res.status(500).json({ message: 'Server error updating job listing' });
  }
};

// @desc    Delete a job posting
// @route   DELETE /api/jobs/:id
// @access  Private (Employer owner only)
const deleteJob = async (req, res) => {
  const jobId = req.params.id;

  try {
    const [jobs] = await db.query('SELECT * FROM jobs WHERE id = ?', [jobId]);
    if (jobs.length === 0) {
      return res.status(404).json({ message: 'Job not found' });
    }

    const job = jobs[0];
    if (job.employer_id !== req.user.id) {
      return res.status(403).json({ message: 'Not authorized to delete this job listing' });
    }

    await db.query('DELETE FROM jobs WHERE id = ?', [jobId]);
    res.json({ message: 'Job listing deleted successfully' });
  } catch (error) {
    console.error('Delete Job Error:', error);
    res.status(500).json({ message: 'Server error deleting job listing' });
  }
};

module.exports = { getJobs, getEmployerJobs, getJobById, createJob, updateJob, deleteJob };
