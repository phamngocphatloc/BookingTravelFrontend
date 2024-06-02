const express = require('express');
const path = require('path');
const app = express();

// Middleware để chuyển hướng mọi yêu cầu về index.html
app.use((req, res, next) => {
  res.sendFile(path.join(__dirname, 'index.html'));
});

app.listen(5500, () => {
  console.log('Server is running on port 5500');
});
