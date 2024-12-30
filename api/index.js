const express = require('express');
const router = express.Router();

router.get('/endpoint', (req, res) => {
  res.json({ message: 'This is your API endpoint' });
});

module.exports = router;
