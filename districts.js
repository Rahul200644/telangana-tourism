// routes/districts.js
const express = require('express');
const router = express.Router();
const db = require('./db');

// GET /api/districts — all districts
router.get('/', (req, res) => {
  const districts = db.prepare('SELECT * FROM districts ORDER BY name').all();
  res.json(districts);
});

// GET /api/districts/:id — single district with places
router.get('/:id', (req, res) => {
  const district = db.prepare('SELECT * FROM districts WHERE id=?').get(req.params.id);
  if (!district) return res.status(404).json({ error: 'Not found' });
  const places = db.prepare('SELECT * FROM tourist_places WHERE district_id=?').all(district.id);
  res.json({ ...district, places });
});

// GET /api/districts/name/:name — by name
router.get('/name/:name', (req, res) => {
  const district = db.prepare('SELECT * FROM districts WHERE name=?').get(req.params.name);
  if (!district) return res.status(404).json({ error: 'Not found' });
  const places = db.prepare('SELECT * FROM tourist_places WHERE district_id=?').all(district.id);
  res.json({ ...district, places });
});

module.exports = router;
