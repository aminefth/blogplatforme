import mongoose from 'mongoose';
import Logger from '../core/Logger';
import { db } from '../config';

// Build the connection string
const dbURI = `mongodb+srv://${db.user}:${encodeURIComponent(db.password)}@${
  db.host
}/${db.name}`;

// for docker db connection
/* const dbURI = `mongodb://${db.user}:${encodeURIComponent(db.password)}@${
  db.host
}:${db.port}/${db.name}`; */

const options = {
  autoIndex: true,
  /*   minPoolSize: db.minPoolSize, // Maintain up to x socket connections
  maxPoolSize: db.maxPoolSize, // Maintain up to x socket connections
  connectTimeoutMS: 60000, // Give up initial connection after 10 seconds
  socketTimeoutMS: 45000, // Close sockets after 45 seconds of inactivity */
};

Logger.debug(dbURI);

function setRunValidators() {
  this.setOptions({ runValidators: true });
}

mongoose.set('strictQuery', true);
// Create the database connection

mongoose
  .plugin((schema: any) => {
    schema.pre('findOneAndUpdate', setRunValidators);
    schema.pre('updateMany', setRunValidators);
    schema.pre('updateOne', setRunValidators);
    schema.pre('update', setRunValidators);
  })
  .connect(dbURI, options)
  .then(() => {
    Logger.info('Mongoose connection done successfully.....🗄️🗄️🗄️🗄️🗄️');
  })
  .catch((e) => {
    Logger.info('Mongoose connection error.....💥🗄️💥💥🗄️💥');
    Logger.error(e);
  });
// connection events
// when successfully connected
mongoose.connection.on('connected', () => {
  Logger.debug('Mongoose default connection open to ' + dbURI);
});
// If the connection throws an error
mongoose.connection.on('error', (err) => {
  Logger.error('Mongoose default connection error: ' + err);
});
// when the connection is disconnected
mongoose.connection.on('disconnected', () => {
  Logger.info('Mongoose default connection disconnected....successfully');
});

// If the Node process ends, close the Mongoose connection
process.on('SIGINT', () => {
  mongoose.connection.close().finally(() => {
    Logger.info(
      'Mongoose default connection disconnected through app termination',
    );
    process.exit(0);
  });
});

export const connection = mongoose.connection;
