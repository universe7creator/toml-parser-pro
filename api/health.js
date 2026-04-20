module.exports = (req, res) => {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.status(200).json({
    status: 'healthy',
    service: 'TOML Parser Pro',
    timestamp: new Date().toISOString(),
    version: '1.0.0'
  });
};
