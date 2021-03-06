var createError = require('http-errors');
var express = require('express');
var path = require('path');
var cookieParser = require('cookie-parser');
var logger = require('morgan');
var i18n = require('i18n');

i18n.configure({
  //define how many languages we would support in our application
  locales:['en', 'zh'],

  //define the path to language json files, default is /locales
  directory: __dirname + '/locales',

  //define the default language
  defaultLocale: 'en',
  updateFiles: false,
});


var indexRouter = require('./routes/index');
var usersRouter = require('./routes/users');
var monitor = require('./monitor');
monitor.start();
monitor.getGlobalData();
//require('./dbCompacter');

var app = express();
app.use(i18n.init);
var hbs = require('hbs');
require('handlebars-helpers')({handlebars: hbs.handlebars});
require('./views/hbs_helpers.js')(hbs);
hbs.registerHelper('x18n', function(x, str){
  return x.__(str);
});

// view engine setup
app.set('views', path.join(__dirname, 'views'));
app.set('view engine', 'hbs');

app.use(logger('dev'));
app.use(express.json());
app.use(express.urlencoded({ extended: false }));
app.use(cookieParser());
app.use(express.static(path.join(__dirname, 'public')));

app.use('/', indexRouter);
app.use('/users', usersRouter);

// catch 404 and forward to error handler
app.use(function(req, res, next) {
  next(createError(404));
});

// error handler
app.use(function(err, req, res, next) {
  // set locals, only providing error in development
  res.locals.message = err.message;
  res.locals.error = req.app.get('env') === 'development' ? err : {};

  // render the error page
  res.status(err.status || 500);
  res.render('error');
});

module.exports = app;
