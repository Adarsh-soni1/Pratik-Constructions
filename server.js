const express = require('express');
const cors = require('cors');
const fs = require('fs');
const path = require('path');

const app = express();
const PORT = process.env.PORT || 3000;
const DB_FILE = path.join(__dirname, 'database.json');

// Middleware
app.use(cors());
app.use(express.json());

// Serve static frontend files (HTML, CSS, JS) from the current folder
app.use(express.static(__dirname));

// API Endpoint to get all projects
app.get('/api/projects', (req, res) => {
    fs.readFile(DB_FILE, 'utf8', (err, data) => {
        if (err) {
            console.error(err);
            return res.status(500).json({ error: 'Failed to read database' });
        }
        try {
            res.json(JSON.parse(data));
        } catch (parseErr) {
            res.json([]);
        }
    });
});

// API Endpoint to update all projects
app.post('/api/projects', (req, res) => {
    const projects = req.body;
    fs.writeFile(DB_FILE, JSON.stringify(projects, null, 2), (err) => {
        if (err) {
            console.error(err);
            return res.status(500).json({ error: 'Failed to write database' });
        }
        res.json({ message: 'Success' });
    });
});

// Start Server
app.listen(PORT, () => {
    console.log(`Server is running at http://localhost:${PORT}`);
    console.log(`Admin Portal: http://localhost:${PORT}/admin.html`);
});
