import { app } from './app';
import { port } from './config';
import Logger from './core/Logger';
console.log('amine');
const server = app
  .listen(port, () => {
    Logger.info(`server running on port : ${port}`);
  })
  .on('error', (e) => Logger.error(e));

/////////////////////////////////////////////////////////////////////
process.on('unhandledRejection', (err: any) => {
  Logger.error(err.name, err.message, err.stack);
  Logger.info('UNHANDLED REJECTION! 💥 Shutting down..');
  server.close(() => {
    Logger.info('💥 Process terminated!');
    process.exit(1);
  });
});

/////////////////////////////////////////////////////////////////////
