require('dotenv').config();
const express  = require('express');
const http     = require('http');
const path     = require('path');
const os       = require('os');
const helmet   = require('helmet');
const morgan   = require('morgan');

require('./database/db');

const app    = express();
const server = http.createServer(app);

app.use(helmet({ contentSecurityPolicy: false }));
app.use(morgan('dev'));
app.use(express.json());
app.use(express.static(path.join(__dirname, '../client')));
app.use('/uploads', express.static(process.env.UPLOADS_PATH || '/mnt/usbdrive/uploads'));

app.use('/api/auth', require('./routes/auth'));

app.get('/api/health', (req, res) => {
  res.json({
    status:  'ok',
    message: 'VocabPi is running',
    uptime:  Math.floor(process.uptime()) + 's',
    storage: process.env.UPLOADS_PATH
  });
});

function getLocalIP() {
  const interfaces = os.networkInterfaces();
  for (const name of Object.keys(interfaces)) {
    for (const iface of interfaces[name]) {
      if (iface.family === 'IPv4' && !iface.internal) {
        return iface.address;
      }
    }
  }
  return 'unknown';
}

const PORT = process.env.PORT || 3000;
server.listen(PORT, '0.0.0.0', () => {
  console.log('');
  console.log('  VocabPi server running');
  console.log(`  Local:   http://localhost:${PORT}`);
  console.log(`  Network: http://${getLocalIP()}:${PORT}`);
  console.log('');
});
