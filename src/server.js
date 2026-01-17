const express = require('express');
const cors = require('cors');
const { generateSongs } = require('./generators');

const app = express();
app.use(cors());
app.use(express.static('public'));

app.get('/api/songs', (req, res) => {
    const { seed, locale, page, likes } = req.query;
    try {
        const data = generateSongs(
            seed || '0',
            locale || 'en',
            parseInt(page) || 1,
            parseFloat(likes) || 0
        );
        res.json(data);
    } catch (e) {
        res.status(500).json({ error: e.message });
    }
});

const PORT = 3000;
app.listen(PORT, () => console.log(`Server running at http://localhost:${PORT}`));