require('dotenv').config();
const express = require('express');
const bunyanConfig = require('./configs/bunyan');
const compression = require('compression');
const multer = require('multer');
const bunyan = require('bunyan');
const memwatch = require('memwatch-next');
const bodyParser = require('body-parser');
const routes = require('./routes/index');
const mongoose = require('mongoose');

// Set port, init express
const port = process.env.PORT || 8080;
const app = express();

// Init bunyan logger
const log = bunyan.createLogger(bunyanConfig);

// Mongoose connection
mongoose.connect(process.env.MONGODB_URI);

mongoose.Promise = global.Promise;

const db = mongoose.connection;

// Watch for memory leaks, log leaks as fatal
memwatch.on('leak', info => {
  log.fatal('Memory leak detected:', info);
});

// Parse json and urlencoded bodies
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));

// Handles file uploads
const uploads = multer({ dest: 'uploads/' }); // eslint-disable-line no-unused-vars

// Compress responses
app.use(compression());

// Add routes
app.use('/', routes);

// Start application
app.listen(port);
log.info(`Application started, listen on port: ${port}`);
