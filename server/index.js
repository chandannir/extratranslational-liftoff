require('dotenv').config();
const express  = require('express');
const https    = require('https');
const path     = require('path');
const os       = require('os');
const helmet   = require('helmet');
const morgan   = require('morgan');
const fs       = require('fs');

require('./database/db');

const app = express();

const sslOptions = {
  key:  fs.readFileSync(path.join(__dirname, '../key.pem')),
  cert: fs.readFileSync(path.join(__dirname, '../cert.pem'))
};

const server = https.createServer(sslOptions, app);

app.use(helmet({ contentSecurityPolicy: false }));
app.use(morgan('dev'));
app.use(express.json());
app.use(express.static(path.join(__dirname, '../client')));
app.use('/uploads', express.static(process.env.UPLOADS_PATH || '/mnt/usbdrive/uploads'));

app.use('/api/auth',       require('./routes/auth'));
app.use('/api/recordings', require('./routes/recordings'));
app.use('/api/vocabulary', require('./routes/vocabulary'));
app.use('/api/search',     require('./routes/search'));

app.get('/api/health', (req, res) => {
  res.json({ status: 'ok', uptime: Math.floor(process.uptime()) + 's' });
});

function getLocalIP() {
  const interfaces = os.networkInterfaces();
  for (const name of Object.keys(interfaces)) {
    for (const iface of interfaces[name]) {
      if (iface.family === 'IPv4' && !iface.internal) return iface.address;
    }
  }
  return 'unknown';
}

const PORT = process.env.PORT || 3000;
server.listen(PORT, '0.0.0.0', () => {
  console.log('');
  console.log('  VocabPi running (HTTPS)');
  console.log(`  Network: https://${getLocalIP()}:${PORT}`);
  console.log('');
});
