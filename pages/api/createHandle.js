import { Pool } from 'pg';

const pool = new Pool({
  host: process.env.DB_HOST,
  port: process.env.DB_PORT,
  user: process.env.DB_USER,
  password: process.env.DB_PASSWORD,
  database: process.env.DB_NAME,
});

export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  const { handle, address, email } = req.body;

  // Validate required fields
  if (!handle || !address || !email) {
    return res.status(400).json({ 
      error: 'Missing required fields',
      required: ['handle', 'address', 'email']
    });
  }

  // Basic email validation
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  if (!emailRegex.test(email)) {
    return res.status(400).json({ error: 'Invalid email format' });
  }

  try {
    const query = `
      INSERT INTO Receivers (handle, address, email)
      VALUES ($1, $2, $3)
      RETURNING *
    `;
    
    const result = await pool.query(query, [handle, address, email]);
    
    return res.status(201).json({
      success: true,
      data: result.rows[0]
    });
  } catch (error) {
    console.error('Database error:', error);
    
    // Handle unique constraint violations
    if (error.code === '23505') {
      if (error.constraint === 'receivers_pkey') {
        return res.status(409).json({ error: 'Handle already exists' });
      }
      if (error.constraint === 'receivers_email_key') {
        return res.status(409).json({ error: 'Email already exists' });
      }
    }
    
    return res.status(500).json({ 
      error: 'Failed to create handle',
      details: error.message 
    });
  }
}

