const { app } = require('./app');
const { getPort } = require('./config');

const PORT = getPort();

// Start server
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
  console.log(`API available at http://localhost:${PORT}/api/todos`);
});