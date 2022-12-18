const express = require('express');
const path = require('path');
const exprseslayout = require('express-ejs-layouts');
const session = require('express-session');
const dotenv = require('dotenv');

const mongoose = require('mongoose');
const nocache = require('nocache');

const app = express();
dotenv.config({ path: '.env' });

// Set view engine
app.set('views', path.join(__dirname, 'views'));
app.set('view engine', 'ejs');

// static files
app.use(express.static(path.join(__dirname, 'public/user')));
app.use(express.static(path.join(__dirname, 'public')));

mongoose.set('strictQuery', false);
mongoose
  .connect(process.env.MONGO_URI)
  .then(() => console.log('DB connected'))
  .catch((err) => console.log(err));
const port = process.env.PORT || 5000;

app.use(nocache());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(exprseslayout);
app.set('layout', './layouts/userLayout.ejs');

// user and admin routes
const userRouter = require('./routes/user');
const adminRouter = require('./routes/admin');

// session
app.use(
  session({
    secret: process.env.sessionSecret,
    saveUninitialized: true,
    // cookie: {maxAge: 600000},
    resave: false,
  }),
);

app.use('/', userRouter);
app.use('/admin', adminRouter);
app.get('*', (req, res) => {
res.render('404');
 });

// server port setting
app.listen(port, () => console.log(`server started on ${port}`));
