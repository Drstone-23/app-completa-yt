const express = require('express');
const axios = require('axios');
const app = express();

app.use(express.json());

app.use('/api', async (req, res) => {
  try {
    const fastapiURL = `http://fastapi:8000${req.originalUrl.replace('/api', '')}`;
    const response = await axios({
      method: req.method,
      url: fastapiURL,
      data: req.body
    });

    // Deshabilitar caché para evitar 304
    res.setHeader('Cache-Control', 'no-store, no-cache, must-revalidate, proxy-revalidate');
    res.setHeader('Pragma', 'no-cache');
    res.setHeader('Expires', '0');

    res.status(response.status).json(response.data);
  } catch (error) {
    res.status(error.response?.status || 500).json({ error: error.message });
  }
});

app.listen(3000, () => {
  console.log('Node proxy on http://localhost:3000');
});
