const express = require('express');
const app = express();
const path = require('path');
const mongoose = require('mongoose');
const passport = require('passport');
const session = require('express-session');
require('dotenv').config();
require('./config/passport');
const flash = require('express-flash');



const adminAuthRoutes = require('./routes/admin/auth');
const adminDashboardRoutes = require('./routes/admin/dashboard');
const adminUserRoutes = require('./routes/admin/user');

const authRoutes = require('./routes/user/auth');
const userHomeRoutes = require('./routes/user/home');
const userRegisterRoutes = require('./routes/user/register');
const userLoginRoutes = require('./routes/user/login');




mongoose.connect('mongodb://127.0.0.1:27017/camverse')
  .then(() => console.log("MongoDB connected"))
  .catch(err => console.log("Mongo Error:", err));



app.set('view engine', 'ejs');
app.set('views', path.join(__dirname, 'views'));
app.use(express.static(path.join(__dirname, 'public')));
app.use(express.urlencoded({ extended: true }));


app.use(session({
    secret: process.env.SESSION_SECRET,
    resave: false,
    saveUninitialized: false,
    cookie: { maxAge: 1000 * 60 * 60 }
}));

app.use(flash());

app.use(flash());
app.use((req, res, next) => {
  res.locals.messages = req.flash();
  next();
});

app.use(passport.initialize());
app.use(passport.session());

app.use('/admin', adminAuthRoutes);
app.use('/admin/dashboard', adminDashboardRoutes);
app.use('/admin/users', adminUserRoutes);

app.use('/', userHomeRoutes);
app.use('/register', userRegisterRoutes);

app.use('/auth', authRoutes);

app.use('/login', userLoginRoutes);



app.listen(3000, () => {
    console.log('Server is running on port 3000');
});

