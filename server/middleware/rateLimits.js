import rateLimit from 'express-rate-limit';

export const storyCreationLimit = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 5, // limit each IP to 5 story creations per window
  message: 'Too many stories created, please try again later'
});

export const apiLimiter = rateLimit({
  windowMs: 60 * 60 * 1000, // 1 hour
  max: 1000 // limit each IP to 1000 requests per hour
});