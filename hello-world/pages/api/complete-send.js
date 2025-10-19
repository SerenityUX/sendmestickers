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

  const { handle, imageUrl, sessionId } = req.body;

  // Validate required fields
  if (!handle || !imageUrl || !sessionId) {
    return res.status(400).json({ 
      error: 'Missing required fields',
      required: ['handle', 'imageUrl', 'sessionId']
    });
  }

  try {
    // Check if this session has already been processed
    const existingCheck = await pool.query(
      'SELECT * FROM Sends WHERE stripeSessionId = $1',
      [sessionId]
    );

    if (existingCheck.rows.length > 0) {
      // Already processed, return success
      return res.status(200).json({
        success: true,
        alreadyProcessed: true,
        data: existingCheck.rows[0]
      });
    }

    // Verify receiver exists
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

    // Insert into Sends table with stripe session ID and PurchasedTrue flag
    const query = `
      INSERT INTO Sends (imageUrl, receiverHandle, stripeSessionId, PurchasedTrue)
      VALUES ($1, $2, $3, TRUE)
      RETURNING *
    `;
    
    const result = await pool.query(query, [imageUrl, handle, sessionId]);
    
    return res.status(201).json({
      success: true,
      data: result.rows[0]
    });
  } catch (error) {
    console.error('Database error:', error);
    
    // Handle unique constraint violations (duplicate session IDs)
    if (error.code === '23505') {
      const existingCheck = await pool.query(
        'SELECT * FROM Sends WHERE stripeSessionId = $1',
        [sessionId]
      );
      return res.status(200).json({
        success: true,
        alreadyProcessed: true,
        data: existingCheck.rows[0]
      });
    }
    
    // Handle foreign key constraint violations
    if (error.code === '23503') {
      return res.status(404).json({ 
        error: 'Receiver not found',
        message: 'The specified handle does not exist'
      });
    }
    
    return res.status(500).json({ 
      error: 'Failed to complete send',
      details: error.message 
    });
  }
}

