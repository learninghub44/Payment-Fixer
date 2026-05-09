const https = require('https');

function keepAlive() {
  const options = {
    hostname: 'kuwesa-payment-api.onrender.com',
    path: '/api/healthz',
    method: 'GET',
    headers: {
      'User-Agent': 'Keep-Alive-Service'
    }
  };

  const req = https.request(options, (res) => {
    console.log(`Keep-alive ping: ${res.statusCode}`);
  });

  req.on('error', (err) => {
    console.error('Keep-alive error:', err.message);
  });

  req.end();
}

// Ping every 10 minutes (600,000 ms)
setInterval(keepAlive, 600000);

// Run immediately on start
keepAlive();
