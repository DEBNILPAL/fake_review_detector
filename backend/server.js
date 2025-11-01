
import express from "express";
import cors from "cors";
import bodyParser from "body-parser";
import pkg from "pg";
import dotenv from "dotenv";
import { spawn } from "child_process";
import path from "path";
import fs from "fs";

const {Pool} = pkg;

dotenv.config();

const app = express();
const port = process.env.PORT ? Number(process.env.PORT) : 3000;

// Middleware
app.use(bodyParser.json({ limit: '10mb' }));
app.use(bodyParser.urlencoded({ limit: '10mb', extended: true }));
app.use(cors());

const pool = new Pool({
  user: process.env.DB_USER,
  host: process.env.DB_HOST,
  database: process.env.DB_NAME,
  password: process.env.DB_PASSWORD,
  port: process.env.DB_PORT,
});

// Ensure DB schema exists
async function ensureSchema() {
  const ddl = `
    CREATE TABLE IF NOT EXISTS users (
      id SERIAL PRIMARY KEY,
      full_name VARCHAR(200) NOT NULL,
      email VARCHAR(255) UNIQUE NOT NULL,
      password_hash TEXT NOT NULL,
      created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
    );

    CREATE TABLE IF NOT EXISTS reviews (
      id SERIAL PRIMARY KEY,
      user_id INTEGER REFERENCES users(id) ON DELETE SET NULL,
      client_name VARCHAR(200) NOT NULL,
      rating NUMERIC,
      review_text TEXT NOT NULL,
      created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
    );

    CREATE TABLE IF NOT EXISTS review_analysis (
      id SERIAL PRIMARY KEY,
      full_name VARCHAR(200) NOT NULL,
      email VARCHAR(255) NOT NULL,
      review TEXT NOT NULL,
      analysis JSONB NOT NULL,
      created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
    );

    CREATE INDEX IF NOT EXISTS idx_users_email ON users(email);
    CREATE INDEX IF NOT EXISTS idx_reviews_user_id ON reviews(user_id);
    CREATE INDEX IF NOT EXISTS idx_review_analysis_email ON review_analysis(email);
    CREATE INDEX IF NOT EXISTS idx_review_analysis_created_at ON review_analysis(created_at);

    -- Backfill: add created_at to reviews if an older table exists without it
    DO $$
    BEGIN
      IF NOT EXISTS (
        SELECT 1
        FROM information_schema.columns
        WHERE table_schema = 'public'
          AND table_name = 'reviews'
          AND column_name = 'created_at'
      ) THEN
        ALTER TABLE reviews ADD COLUMN created_at TIMESTAMPTZ NOT NULL DEFAULT NOW();
      END IF;
    END $$;
  `;
  try {
    await pool.query(ddl);
    console.log("DB schema ensured.");
  } catch (e) {
    console.error("Failed to ensure schema:", e);
  }
}

// Deep Learning Inference Integration
const PYTHON_PATH = process.env.PYTHON_PATH || "python";
const INFERENCE_SCRIPT = path.resolve(process.cwd(), "..", "deep learning", "inference_service.py");

function runInference(command, payload = null) {
  return new Promise((resolve, reject) => {
    try {
      const args = [INFERENCE_SCRIPT, command];
      const proc = spawn(PYTHON_PATH, args, { stdio: ["pipe", "pipe", "pipe"] });

      let stdout = "";
      let stderr = "";

      proc.stdout.on("data", (d) => (stdout += d.toString()));
      proc.stderr.on("data", (d) => (stderr += d.toString()));

      proc.on("error", (err) => reject(err));
      proc.on("close", (code) => {
        if (code !== 0) {
          return reject(new Error(`Inference process exited with code ${code}: ${stderr}`));
        }
        try {
          const json = JSON.parse(stdout || "{}");
          if (json && json.error) {
            return reject(new Error(json.error));
          }
          resolve(json);
        } catch (e) {
          reject(new Error(`Failed to parse inference output: ${e}\nRaw: ${stdout}\nStderr: ${stderr}`));
        }
      });

      if (payload) {
        proc.stdin.write(JSON.stringify(payload));
      }
      proc.stdin.end();
    } catch (e) {
      reject(e);
    }
  });
}

app.post('/api/signup', async (req, res) => {
    const { username,email,password} = req.body;
    try {
        const result = await pool.query(
            'INSERT INTO users (full_name, email, password_hash) VALUES ($1, $2, $3) RETURNING *',
            [username, email, password]
        );
        res.status(201).json(result.rows[0]);
    } catch (error) {
        console.error('Error inserting data:', error);
        res.status(500).json({ error: 'Internal Server Error' });
    }
});

// Fetch reviews from DB
app.get('/api/reviews', async (_req, res) => {
  try {
    const r = await pool.query('SELECT * FROM reviews ORDER BY created_at DESC LIMIT 500');
    res.json({ rows: r.rows, count: r.rowCount });
  } catch (e) {
    console.error('Error fetching reviews:', e);
    res.status(500).json({ error: 'Failed to fetch reviews' });
  }
});

// Diagnostics endpoint
app.get('/api/diagnostics', async (_req, res) => {
  const diag = { db: {}, python: {}, artifacts: {} };
  try {
    const dbver = await pool.query('SELECT version()');
    diag.db.ok = true;
    diag.db.version = dbver.rows?.[0]?.version;
    const tables = await pool.query(`
      SELECT table_name FROM information_schema.tables 
      WHERE table_schema='public' AND table_name IN ('users','reviews','review_analysis')
    `);
    diag.db.tables = tables.rows.map(r => r.table_name);
  } catch (e) {
    diag.db.ok = false;
    diag.db.error = String(e);
  }

  diag.python.path = PYTHON_PATH;
  diag.python.script = INFERENCE_SCRIPT;
  diag.python.script_exists = fs.existsSync(INFERENCE_SCRIPT);

  const base = path.resolve(process.cwd(), "..", "deep learning");
  const files = [
    "deep_learning_model.keras",
    "scaler.joblib",
    "gbc_model.joblib",
    "tfidf_vectorizer.joblib",
    "reviews_large.csv",
  ];
  for (const f of files) {
    const p = path.join(base, f);
    diag.artifacts[f] = fs.existsSync(p);
  }

  try {
    const analytics = await runInference('analytics');
    diag.sample_analytics = analytics?.total_rows !== undefined ? 'ok' : 'unknown';
  } catch (e) {
    diag.sample_analytics = `error: ${e}`;
  }

  res.json(diag);
});

app.post('/api/login', async (req, res) => {
    const { email, password } = req.body;
    try {
        const result = await pool.query(
            'SELECT * FROM users WHERE email = $1 AND password_hash = $2',
            [email, password]
        );
        if (result.rows.length > 0) {
            res.status(200).json({ message: 'Login successful', user: result.rows[0] });
        } else {
            res.status(401).json({ error: 'Invalid email or password' });
        }
    } catch (error) {
        console.error('Error querying data:', error);
        res.status(500).json({ error: 'Internal Server Error' });
    }   
});

app.get('/api/analytics', async (req, res) => {
  try {
    const result = await runInference('analytics');
    res.json(result);
  } catch (error) {
    console.error('Error fetching analytics via model:', error);
    res.status(500).json({ error: 'Failed to compute analytics from model dataset' });
  }
});

// New: POST /api/analytics to analyze a single review and persist to DB
app.post('/api/analytics', async (req, res) => {
  const { full_name, email, review, rating, productId, reviewerId } = req.body || {};

  if (!full_name || !email || !review) {
    return res.status(400).json({ error: 'Fields full_name, email, and review are required.' });
  }

  try {
    // Call ML predictor (uses same artifacts as /api/predict)
    const inference = await runInference('predict', {
      text: review,
      rating: rating ?? 0,
      productId: productId ?? 'prod-1',
      reviewerId: reviewerId ?? 'user-1',
    });

    // Persist into review_analysis table
    const insertQuery = `
      INSERT INTO review_analysis (full_name, email, review, analysis, created_at)
      VALUES ($1, $2, $3, $4::jsonb, NOW())
      RETURNING id
    `;
    const values = [full_name, email, review, JSON.stringify(inference)];
    const saved = await pool.query(insertQuery, values);

    return res.status(201).json({
      message: 'Review analyzed and saved.',
      analysis: inference,
      id: saved.rows?.[0]?.id,
    });
  } catch (error) {
    console.error('Error during review analysis:', error);
    return res.status(500).json({ error: 'Failed to analyze and save review.' });
  }
});

app.post('/api/predict', async (req, res) => {
  const { text, rating, productId, reviewerId } = req.body || {};

  if (!text || rating === undefined) {
    return res.status(400).json({ error: 'Fields text and rating are required.' });
  }

  try {
    // Run the deep learning inference
    const result = await runInference('predict', { text, rating, productId, reviewerId });

    // Extract key parts for DB storage
    const { prediction, prob_fake, features, components } = result;

    // Insert into database
    const insertQuery = `
      INSERT INTO predict (review_text, rating, product_id, reviewer_id, prediction, prob_fake, features, components, created_at)
      VALUES ($1, $2, $3, $4, $5, $6, $7::jsonb, $8::jsonb, NOW())
      RETURNING id
    `;
    const values = [
      text,
      rating,
      productId || 'unknown',
      reviewerId || 'unknown',
      prediction,
      prob_fake,
      JSON.stringify(features),
      JSON.stringify(components),
    ];

    const saved = await pool.query(insertQuery, values);

    // Return prediction + saved record ID
    res.status(201).json({
      message: 'Prediction complete and saved.',
      id: saved.rows?.[0]?.id,
      ...result,
    });
  } catch (error) {
    console.error('Prediction error:', error);
    res.status(500).json({ error: 'Failed to score and save review using the deep learning model' });
  }
});

// Lightweight health check for ML integration
app.get('/api/health-ml', async (_req, res) => {
  try {
    const analytics = await runInference('analytics');
    res.json({ ok: true, analytics_sample: analytics });
  } catch (e) {
    res.status(500).json({ ok: false, error: String(e) });
  }
});

// --- API ENDPOINT (Updated for your schema) ---
app.post('/submit_review', async (req, res) => {
  // 🪵 Log incoming request body
  console.log("\n📩 Incoming Review Data:");
  console.log(req.body);

  const { userId, client_name, rating, reviewText } = req.body;

  // 🧠 Validation
  if (
    userId === undefined || userId === null ||
    !client_name ||
    rating === undefined || rating === null ||
    !reviewText
  ) {
    console.log("❌ Missing fields:", { userId, client_name, rating, reviewText });
    return res.status(400).json({ detail: 'All fields are required.' });
  }

  const queryText = `
    INSERT INTO reviews (user_id, client_name, rating, review_text)
    VALUES ($1, $2, $3, $4)
    RETURNING id
  `;
  const values = [userId, client_name, rating, reviewText];

  try {
    const result = await pool.query(queryText, values);
    console.log(" Review saved successfully:", result.rows[0]);
    res.status(201).json({ message: 'Review submitted successfully!' });
  } catch (err) {
    console.error(" Database error:", err.message);
    res.status(500).json({ detail: 'Failed to save review due to a server error.' });
  }
});

// Fetch saved analyses
app.get('/api/review-analysis', async (req, res) => {
  const { email } = req.query || {};
  try {
    if (email) {
      const r = await pool.query('SELECT * FROM review_analysis WHERE email = $1 ORDER BY created_at DESC LIMIT 1000', [email]);
      return res.json({ rows: r.rows, count: r.rowCount });
    }
    const r = await pool.query('SELECT * FROM review_analysis ORDER BY created_at DESC LIMIT 1000');
    res.json({ rows: r.rows, count: r.rowCount });
  } catch (e) {
    console.error('Error fetching review_analysis:', e);
    res.status(500).json({ error: 'Failed to fetch review_analysis' });
  }
});

// Batch CSV analysis and persistence per user
app.post('/api/batch-analytics', async (req, res) => {
  try {
    const { csv, email, full_name } = req.body || {};
    if (!csv || !email || !full_name) {
      return res.status(400).json({ error: 'Fields csv, email, full_name are required.' });
    }

    // Parse CSV (expects headers including one of: review_text/text/review, and optional rating, product_id, reviewer_id)
    const rawLines = csv.split(/\r?\n/);
    const lines = rawLines.filter(l => l && l.trim().length > 0);
    if (lines.length < 2) {
      return res.status(400).json({ error: 'CSV must include a header and at least one row.' });
    }
    // Detect delimiter (comma, semicolon, or tab) and strip BOM if present
    let headerLine = lines[0].replace(/^\uFEFF/, '');
    const count = (s, ch) => (s.match(new RegExp(ch, 'g')) || []).length;
    const candidates = [ {d: ',', n: count(headerLine, ',')}, {d: ';', n: count(headerLine, ';')}, {d: '\t', n: count(headerLine, '\t')} ];
    candidates.sort((a,b)=>b.n-a.n);
    const delimiter = candidates[0].n > 0 ? (candidates[0].d === '\\t' ? '\t' : candidates[0].d) : ',';
    // Split line by delimiter ignoring delimiters inside quotes
    const splitCsvLine = (line) => {
      const result = [];
      let current = '';
      let inQuotes = false;
      for (let i = 0; i < line.length; i++) {
        const ch = line[i];
        if (ch === '"') {
          // Toggle quotes; handle escaped quotes "" as a single quote
          if (inQuotes && i + 1 < line.length && line[i + 1] === '"') {
            current += '"';
            i++; // skip next quote
          } else {
            inQuotes = !inQuotes;
          }
        } else if (ch === delimiter && !inQuotes) {
          result.push(current);
          current = '';
        } else {
          current += ch;
        }
      }
      result.push(current);
      return result.map(s => s.trim().replace(/^"|"$/g, ''));
    };

    const headers = splitCsvLine(headerLine).map(h => h.trim().toLowerCase());
    const findIdx = (names) => names.map(n => headers.indexOf(n)).find(i => i >= 0);
    const idxText = findIdx(['review_text','text','review','content','comment']);
    const idxRating = findIdx(['rating']);
    const idxProd = findIdx(['product_id','productid','product']);
    const idxReviewer = findIdx(['reviewer_id','reviewerid','user_id','userid','user']);
    if (idxText == null || idxText < 0) {
      return res.status(400).json({ error: 'CSV must contain a review_text/text/review column.' });
    }

    let saved = 0;
    let errors = 0;
    const maxRows = Math.min(lines.length - 1, 1000);
    for (let i = 1; i <= maxRows; i++) {
      const cols = splitCsvLine(lines[i]);
      const review = (cols[idxText] || '').toString();
      if (!review.trim()) { continue; }
      const rating = idxRating != null && idxRating >= 0 ? parseFloat(cols[idxRating] || '0') : 0;
      const productId = idxProd != null && idxProd >= 0 ? (cols[idxProd] || 'prod-1').toString() : 'prod-1';
      const reviewerId = idxReviewer != null && idxReviewer >= 0 ? (cols[idxReviewer] || 'user-1').toString() : 'user-1';

      try {
        const inference = await runInference('predict', { text: review, rating, productId, reviewerId });
        const insertQuery = `
          INSERT INTO review_analysis (full_name, email, review, analysis, created_at)
          VALUES ($1, $2, $3, $4::jsonb, NOW())
        `;
        const values = [full_name, email, review, JSON.stringify(inference)];
        await pool.query(insertQuery, values);
        saved += 1;
      } catch (e) {
        errors += 1;
      }
    }

    return res.status(201).json({ message: 'Batch analysis complete', saved, errors, total_rows: maxRows });
  } catch (e) {
    console.error('Batch analytics error:', e);
    return res.status(500).json({ error: 'Failed to process batch analytics' });
  }
});

app.listen(port, () => {
    console.log(`Server is running on http://localhost:${port}`);
    // Ensure schema on startup (idempotent)
    ensureSchema();
});