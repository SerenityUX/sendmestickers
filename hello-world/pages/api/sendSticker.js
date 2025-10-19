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

  const { handle, imageUrl } = req.body;

  // Validate required fields
  if (!handle || !imageUrl) {
    return res.status(400).json({ 
      error: 'Missing required fields',
      required: ['handle', 'imageUrl']
    });
  }

  try {
    // First check if the receiver handle exists
    const receiverCheck = await pool.query(
      'SELECT handle FROM Receivers WHERE handle = $1',
      [handle]
    );

    if (receiverCheck.rows.length === 0) {
      return res.status(404).json({ 
        error: 'Receiver not found',
        message: `No receiver with handle "${handle}" exists`
      });
    }

    // Insert into Sends table - address will be auto-populated by trigger
    const query = `
      INSERT INTO Sends (imageUrl, receiverHandle)
      VALUES ($1, $2)
      RETURNING *
    `;
    
    const result = await pool.query(query, [imageUrl, handle]);
    
    return res.status(201).json({
      success: true,
      data: result.rows[0]
    });
  } catch (error) {
    console.error('Database error:', error);
    
    // Handle foreign key constraint violations
    if (error.code === '23503') {
      return res.status(404).json({ 
        error: 'Receiver not found',
        message: 'The specified handle does not exist'
      });
    }
    
    return res.status(500).json({ 
      error: 'Failed to send sticker',
      details: error.message 
    });
  }
}

