const express = require('express');
// eslint-disable-next-line import/order

const app = express();
require('dotenv').config();
const cookieParser = require('cookie-parser');
const expressLayouts = require('express-ejs-layouts');
const session = require('express-session');
const path = require('path');
const nocache = require('nocache');
const bodyParser = require('body-parser');
const mongoose = require('mongoose');
const multer = require('multer');
const morgan = require('morgan');
const flash = require('connect-flash');
const location = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, 'public/image');
  },
  filename: (req, file, cb) => {
    cb(null, `${file.filename}-${file.originalname}`);
  },
});

const fileFilter = (req, file, cb) => {
  if (
    file.mimetype === 'image/png'
    || file.mimetype === 'image/jpg'
    || file.mimetype === 'image/jpeg'
  ) {
    cb(null, true);
  } else {
    cb(null, false);
  }
};

app.use(flash());
// app.use(morgan('dev'));
app.use(
  multer({ storage: location, fileFilter }).fields([
    { name: 'image' },
    { maxCount: 3 },
  ]),
);
app.use((req, res, next) => {
  res.header('Cache-Control', 'private, no-cache, no-store, must-revalidate');
  res.header('Expires', '-1');
  res.header('Pragma', 'no-cache');
  next();
});
app.use(cookieParser());
app.use(session({
  secret: 'Key', cookie: { maxAge: 6000000 }, resave: true, saveUninitialized: true,
}));
app.use(express.json());
app.use(bodyParser.urlencoded({ extended: true }));
app.use(expressLayouts);
app.use(express.static('public'));
mongoose.set('strictQuery', true);
const mongo = process.env.MONGO_LAB;
mongoose.connect(mongo, () => { console.log('DataBase Connected'); });
app.set('view engine', 'ejs');
app.set('views', `${__dirname}/views`);
app.set('layout', 'layout');
app.set(express.static('public'));
app.use('/', require('./routes/login'));
app.use('/', require('./routes/admin'));

const PORT = process.env.PORT || 3001;
app.listen(PORT, console.log(`Started Port:${PORT}`));