const express = require('express');
const app = express();
const path = require('path');
const mongoose = require('mongoose');
const passport = require('passport');
const session = require('express-session');
require('dotenv').config();
require('./config/passport');
const flash = require('connect-flash');
const methodOverride = require('method-override');
const setUser = require('./middlewares/user/setUser')
const { ensureLoggedIn, checkBlocked } = require('./middlewares/user/checkUser')

app.use((req, res, next) => {
  console.log(`${req.method} ${req.originalUrl}`);
  next();
});


app.use(methodOverride('_method'));


const adminAuthRoutes = require('./routes/admin/auth');
const adminDashboardRoutes = require('./routes/admin/dashboard');
const adminUserRoutes = require('./routes/admin/user');
const adminProductRoutes = require('./routes/admin/products');
const adminCategoryRoutes = require('./routes/admin/categories');
const adminBrandRoutes = require('./routes/admin/brands');
const adminOrderRoutes = require('./routes/admin/orders');
const adminOfferRoutes = require('./routes/admin/offers');
const adminCouponRoutes = require('./routes/admin/coupon');

const authRoutes = require('./routes/user/auth');
const userHomeRoutes = require('./routes/user/home');
const userRegisterRoutes = require('./routes/user/register');
const userLoginRoutes = require('./routes/user/login');
const userShopRoutes = require('./routes/user/shop');
const userSearchRoutes = require('./routes/user/search');
const userProductRoutes = require('./routes/user/product');
const userLogoutRoutes = require('./routes/user/logout');
const userSpecificRoutes = require('./routes/user/user');
const resetPasswordRoutes = require('./routes/user/reset');
const userCartRoutes = require('./routes/user/cart');
const userCheckoutRoutes = require('./routes/user/checkout');
const userOrderRoutes = require('./routes/user/order');
const userWishlistRoutes = require('./routes/user/wishlist');


mongoose.connect('mongodb://127.0.0.1:27017/camverse')
  .then(() => console.log("MongoDB connected"))
  .catch(err => console.log("Mongo Error:", err));



app.set('view engine', 'ejs');
app.set('views', path.join(__dirname, 'views'));
app.use(express.static(path.join(__dirname, 'public')));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));


app.use(session({
    secret: process.env.SESSION_SECRET,
    resave: false,
    saveUninitialized: false,
    cookie: { maxAge: 1000 * 60 * 60 }
}));



app.use(flash());
app.use((req, res, next) => {
  res.locals.messages = req.flash();
  next();
});

app.use(passport.initialize());
app.use(passport.session());

app.use(setUser);

app.use('/admin', adminAuthRoutes);
app.use('/admin/dashboard', adminDashboardRoutes);
app.use('/admin/users', adminUserRoutes);
app.use('/admin/products', adminProductRoutes);
app.use('/admin/categories', adminCategoryRoutes);
app.use('/admin/brands', adminBrandRoutes);
app.use('/admin/orders', adminOrderRoutes);
app.use('/admin/offers', adminOfferRoutes);
app.use('/admin/coupons', adminCouponRoutes);


app.use('/', userHomeRoutes);
app.use('/register', userRegisterRoutes);
app.use('/auth', authRoutes);
app.use('/login', userLoginRoutes);
app.use('/shop', userShopRoutes);
app.use('/search', userSearchRoutes);
app.use('/product', userProductRoutes);
app.use('/logout', userLogoutRoutes);
app.use('/user', ensureLoggedIn, checkBlocked, userSpecificRoutes);
app.use('/reset', resetPasswordRoutes);
app.use('/cart', ensureLoggedIn, checkBlocked, userCartRoutes);
app.use('/checkout', ensureLoggedIn, checkBlocked, userCheckoutRoutes);
app.use('/order', ensureLoggedIn, checkBlocked, userOrderRoutes);
app.use('/wishlist', ensureLoggedIn, checkBlocked, userWishlistRoutes);



app.listen(3000, () => {
    console.log('Server is running on port 3000');
});

