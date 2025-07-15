import express from 'express';
import cors from 'cors';
import { PythonShell } from 'python-shell';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();

app.use(cors({ origin: 'http://localhost:5173' }));
app.use(express.json());

app.get('/', (req, res) => {
  console.log('Root endpoint accessed');
  res.send('API is working!');
});

app.get('/api/recommendations/:username', async (req, res) => {
  const { username } = req.params;
  console.log(`Fetching recommendations for username: ${username}`);

  const options = {
    mode: 'text',
    pythonOptions: ['-u'], // Unbuffered output
    scriptPath: path.resolve(__dirname, '../ml'),
    args: [username],
    pythonPath: process.env.PYTHON_PATH || 'C:\\Program Files\\Python311\\python.exe',
    timeout: 15000, // 15-second timeout
  };

  console.log('PythonShell options:', options);

  try {
    const results = await new Promise((resolve, reject) => {
      const pyshell = new PythonShell('get_recommendations.py', options);

      let output = [];
      let errors = [];

      pyshell.on('message', (message) => {
        console.log('PythonShell stdout:', message);
        output.push(message);
      });

      pyshell.on('stderr', (stderr) => {
        console.error('PythonShell stderr:', stderr);
        errors.push(stderr);
      });

      pyshell.on('error', (error) => {
        console.error('PythonShell error event:', error);
        reject(error);
      });

      pyshell.on('close', () => {
        console.log('PythonShell closed');
        if (errors.length > 0) {
          reject(new Error(`Python script errors: ${errors.join('\n')}`));
        } else {
          resolve(output);
        }
      });

      pyshell.end((err) => {
        if (err) {
          console.error('PythonShell end error:', err);
          reject(err);
        }
      });
    });

    if (!results || results.length === 0) {
      console.log('No output from Python script');
      return res.status(200).json([]);
    }

    try {
      const parsedResults = JSON.parse(results[0]);
      console.log('Parsed recommendations:', parsedResults);
      res.status(200).json(parsedResults);
    } catch (parseErr) {
      console.error('JSON parse error:', parseErr);
      res.status(500).json({ error: 'Invalid response from recommendation script', details: parseErr.message });
    }
  } catch (err) {
    console.error('Error executing Python script:', err);
    res.status(500).json({ error: 'Failed to fetch recommendations', details: err.message });
  }
});

app.listen(3001, () => console.log('Recommendations server running on port 3001'));