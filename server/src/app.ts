import express, { NextFunction, Request, Response } from 'express';
import { corsUrl, environment } from './config';
import Logger from './core/Logger';
import cors from 'cors';
import cookieParser from 'cookie-parser';
import morgan from 'morgan';
import helmet from 'helmet';
import mongoSanitize from 'express-mongo-sanitize';
import compression from 'compression';
import routes from './routes';
import './database';
import {
  ApiError,
  ErrorType,
  InternalError,
  NotFoundError,
} from './core/ApiError';
import e from 'express';

/////////////////////////////////////////////////////////////
process.on('uncaughtException', (err) => {
  Logger.error(err);
});

///////////////////////////////////////////////////////////////

export const app = express();

app.use(express.json({ limit: '10mb' }));
app.use(
  express.urlencoded({ limit: '10mb', extended: true, parameterLimit: 50000 }),
);
app.use(
  cors({
    origin: corsUrl,
    credentials: true,
    optionsSuccessStatus: 200,
  }),
);
app.use(cookieParser());
app.use(mongoSanitize());
app.use(compression());
app.use(helmet());

app.use(morgan('dev'));

// Routes
app.use('/api/v1', routes);

// catch 404 and forward to error handler
app.use((req: Request, res: Response, next: NextFunction) =>
  next(new NotFoundError()),
);

// Middleware Error Handler
// eslint-disable-next-line @typescript-eslint/no-unused-vars
app.use((err: Error, req: Request, res: Response, next: NextFunction) => {
  if (err instanceof ApiError) {
    ApiError.handle(err, res);
    if (err.type === ErrorType.INTERNAL)
      Logger.error(
        `500 - ${err.message} - ${req.originalUrl} - ${req.method} - ${req.ip}`,
      );
  } else {
    Logger.error(
      `500 - ${err.message} - ${req.originalUrl} - ${req.method} - ${req.ip}`,
    );
    Logger.error(err);
    if (environment === 'development') {
      return res.status(500).send(err);
    }
    ApiError.handle(new InternalError(), res);
  }
});

export default app;
