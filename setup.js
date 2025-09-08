const fs = require('fs');
const path = require('path');

// Paths for env files
const serverEnvPath = path.join(__dirname, 'server', '.env');
const clientEnvPath = path.join(__dirname, 'client', '.env');

// Create server/.env from .env.example if missing
if (!fs.existsSync(serverEnvPath)) {
  fs.copyFileSync(path.join(__dirname, '.env.example'), serverEnvPath);
  console.log('✅ Created server/.env file from .env.example');
}

// Create client/.env with default values if missing
if (!fs.existsSync(clientEnvPath)) {
  const clientEnvContent = `
REACT_APP_API_URL=http://localhost:5000/api
REACT_APP_PEER_HOST=localhost
REACT_APP_PEER_PORT=9000
`;
  fs.writeFileSync(clientEnvPath, clientEnvContent.trim());
  console.log('✅ Created client/.env file with defaults');
}

console.log('🚀 Setup complete! Please update the .env files with your actual values.');
