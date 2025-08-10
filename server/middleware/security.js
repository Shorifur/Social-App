import helmet from 'helmet';
import xss from 'xss-clean';
import mongoSanitize from 'express-mongo-sanitize';

export const securityMiddleware = (app) => {
  app.use(helmet());
  app.use(xss());
  app.use(mongoSanitize());
  app.disable('x-powered-by');
};