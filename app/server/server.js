require('dotenv').config();
const express = require('express');
const bunyanConfig = require('./configs/bunyan');
const compression = require('compression');
const multer = require('multer');
const bunyan = require('bunyan');
const memwatch = require('memwatch-next');
const bodyParser = require('body-parser');
const routes = require('./routes');
const passport = require('passport');
const localSignupStrategy = require('./passport/local-signup');
const localLoginStrategy = require('./passport/local-login');
const db = require('./models');

// Set port, init express
const port = process.env.PORT || 8080;
const app = express();
app.use(express.static(`${__dirname}/public`));

/*

Allows CORS

app.use((req, res, next) => {
  res.header('Access-Control-Allow-Origin', '*');
  res.header('Access-Control-Allow-Headers', 'Origin, X-Requested-With, Content-Type, Accept');
  next();
}); */

// Init bunyan logger
const log = bunyan.createLogger(bunyanConfig);

const errorHandler = error => {
  log.error(error);
};

db.connect(process.env.MONGODB_URI, errorHandler);

// Init passport
app.use(passport.initialize());
passport.use('local-signup', localSignupStrategy);
passport.use('local-login', localLoginStrategy);

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
