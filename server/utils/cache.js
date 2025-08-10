import redis from 'redis';
const client = redis.createClient();

export const cacheMiddleware = (duration) => (req, res, next) => {
  const key = req.originalUrl;
  
  client.get(key, (err, data) => {
    if (data) return res.json(JSON.parse(data));
    
    const originalSend = res.json;
    res.json = (body) => {
      client.setex(key, duration, JSON.stringify(body));
      originalSend.call(res, body);
    };
    next();
  });
};