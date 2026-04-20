module.exports = (req, res) => {
  res.setHeader('Access-Control-Allow-Origin', '*');
  
  if (req.method !== 'POST') {
    res.status(405).json({ error: 'Method not allowed' });
    return;
  }
  
  const event = req.body?.meta?.event_name;
  
  if (event === 'order_created' || event === 'subscription_created') {
    console.log('Payment received:', req.body);
    res.status(200).json({ received: true, event });
  } else {
    res.status(200).json({ received: true, event: event || 'unknown' });
  }
};
