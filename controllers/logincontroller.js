const bcrypt = require('bcryptjs');
const { name } = require('ejs');
const nodemailer = require('nodemailer');
const sendGridTransport = require('nodemailer-sendgrid-transport');
const Crypto = require('crypto');
const { nextTick } = require('process');
const oroducts = require('../models/wishlistscheema');
const User = require('../models/user');
const Product = require('../models/product');
const Order = require('../models/orderschema');
const gnrtRazo = require('../generaterazorpay/generaterazorpay');
const Catogaries = require('../models/catogaryschema');
const Coupon = require('../models/couponschema');
const couponSchema = require('../models/couponschema');
const Banner = require('../models/banner');
const helpers = require('../user helpers/user');

const transporter = nodemailer.createTransport({
  host: 'smtp.gmail.com',
  auth: {
    user: process.env.fEmail,
    pass: process.env.EMAIL_PASS,
  },
});

let newUser;
let token;
let email;

module.exports = {
  registerView: async (req, res, next) => {
    try {
      const error = req.flash('err');
      res.render('signup', {
        // eslint-disable-next-line max-len
        signEmpty: req.session.signEmpty,
        confPassword: req.session.confPassword,
        exist: req.session.exist,
        admin: false,
        error,
      });
      req.session.confPassword = false;
      req.session.signEmpty = false;
      req.session.exist = false;
    } catch (error) {
      console.log(error);
      next(error);
    }
  },
  loginView: (req, res, next) => {
    try {
      const error = req.flash('err');
      res.render('login', { admin: false, error });
    } catch (error) {
      console.log(error);
      next(error);
    }
  },
  homePage: async (req, res, next) => {
    try {
      const { user } = req.session;
      let count = null;
      if (user) {
        count = user.cart.items.length;
      }
      const banner = await Banner.find();
      const nwBanner = banner[0];
      res.render('home', {
        user, count, admin: false, nwBanner,
      });
    } catch (error) {
      console.log(error);
      next(error);
    }
  },
  registerUser: (req, res, next) => {
    try {
      Crypto.randomBytes(2, (err, buffer) => {
        if (err) {
          console.log(err);
        } else {
          console.log(buffer);
          token = buffer.toString('hex');
          console.log(token, 'JIJI');
        }
      });
      const {
        name, password, confirmPassword,
      } = req.body;
      email = req.body.email;
      if (!name || !email || !password || !confirmPassword) {
        req.flash('err', 'Fill the field');
        res.redirect('/signup');
        console.log('Fill empty Area');
        // eslint-disable-next-line
  } else if (password != confirmPassword) {
        req.session.confPassword = true;
        res.redirect('/signup');
        // eslint-disable-next-line no-console
        console.log('password must match');
      } else {
        User.findOne({ email }).then((usr) => {
          if (usr) {
            req.session.exist = true;
            res.render('signup', {
              name, email, password, confirmPassword, admin: false,
            });
          } else {
            newUser = new User({
              name, email, password, confirmPassword,
            });
            bcrypt.genSalt(10, (err, salt) => {
              // eslint-disable-next-line no-shadow
              bcrypt.hash(newUser.password, salt, (err, hash) => {
                if (err) {
                  throw err;
                }
                newUser.password = hash;
                helpers.emailOtp(token, email, () => res.render('otpfill', { admin: false, error: false, email }), true);
              });
            });
          }
        });
      }
    } catch (error) {
      console.log(error);
      next(error);
    }
  },
  loginUser: (req, res, next) => {
    try {
      const { Email, Password } = req.body;
      if (!Email || !Password) {
        req.flash('err', 'Fill all area');
        // eslint-disable-next-line no-console
        console.log('Fill empty area');
        res.redirect('/login');
      } else {
      // eslint-disable-next-line no-new, no-async-promise-executor, no-unused-vars
        new Promise(async (_ressolve) => {
          const user = await User.findOne({ email: Email });
          User.findOne({ email: Email }).then((usr) => {
            if (usr) {
              bcrypt.compare(Password, user.password).then((status) => {
                if (status) {
                  if (user.userType === 'Block') {
                    req.session.loggedIn = true;
                    req.session.user = user;
                    // eslint-disable-next-line no-console
                    console.log('correct');
                    res.redirect('/');
                  } else {
                    req.flash('err', 'You are blocked user');
                  }
                } else {
                  req.flash('err', 'Incorrect Password');
                  // eslint-disable-next-line no-console
                  console.log('Incorrect');
                  res.redirect('/login');
                }
              });
            } else {
              req.flash('err', 'No Account in this Email');
              res.redirect('/login');
            }
          });
        });
      }
    } catch (error) {
      console.log(error);
      next(error);
    }
  },
  logoutUser: (req, res, next) => {
    try {
      req.session.destroy();
      res.redirect('/');
    } catch (error) {
      console.log(error);
      next(error);
    }
  },
  adminLoginView: (req, res, next) => {
    try {
      if (req.session.adminLogged) {
        res.render('admin-home', { admin: true });
      } else {
        const valid = req.flash('err');
        res.render('admin-loggin', { valid, admin: false });
        req.session.adminFill = false;
        req.session.adminErr = false;
      }
    } catch (error) {
      console.log(error);
      next(error);
    }
  },
  adminLogin: (req, res, next) => {
    try {
      const { EMAIL } = process.env;
      const { PASSWORD } = process.env;
      const { email, password } = req.body;
      if (!email || !password) {
        req.flash('err', 'Fill empty area');
        res.redirect('/admin');
        // eslint-disable-next-line eqeqeq
      } else if (email == EMAIL && password == PASSWORD) {
        req.session.adminLogged = true;
        // eslint-disable-next-line no-multi-assign
        req.session.admin = req.body;
        res.render('admin-home', { admin: true });
      } else {
        req.flash('err', 'Incorrect Password or Email');
        res.redirect('/admin');
      }
    } catch (error) {
      console.log(error);
      next(error);
    }
  },
  shopnowView: async (req, res, next) => {
    try {
      const { user } = req.session;
      const category = await Catogaries.find();
      res.render('shopnow', { user, admin: false, category });
    } catch (error) {
      console.log(error);
      next(error);
    }
  },
  productList: async (req, res, next) => {
    try {
      const { user } = req.session;
      const Id = req.params.id;
      console.log(Id);
      const category = await Catogaries.findById(Id);
      const products = await Product.find({ category: category.name });
      console.log(category, 'cat');
      console.log(products, 'pro');
      res.render('productlist', { products, admin: false, user });
    } catch (error) {
      console.log(error);
      next(error);
    }
  },
  wishlistViewer: async (req, res, next) => {
    try {
      const { user } = req.session;
      // eslint-disable-next-line no-underscore-dangle
      const prdDt = await oroducts.find({ userId: user._id }, { productLst: 1, _id: 0 }).populate('productLst');
      console.log(prdDt);
      if (prdDt.length > 0) {
        const pd = prdDt[0].productLst;
        res.render('wishlist', { user, pd, admin: false });
      } else {
        const pd = [];
        res.render('wishlist', { user, pd, admin: false });
      }
    } catch (error) {
      console.log(error);
      next(error);
    }
  },
  cartView: async (req, res, next) => {
    try {
      const { user } = req.session;
      const length = 1;
      // eslint-disable-next-line no-underscore-dangle
      const userId = req.session.user._id;
      const prd = await User.findOne({ _id: userId }).populate('cart.items.productId');
      res.render('cart', {
        user, prd, length, admin: false,
      });
    } catch (error) {
      console.log(error);
      next(error);
    }
  },
  addWishlist: async (req, res, next) => {
    try {
      const { user } = req.session;
      console.log(req.body);
      const prdId = req.body.productId;
      const exist = await oroducts.findOne({ userId: user._id });
      if (exist) {
        oroducts.findOne({ userId: user._id }).then((wishl) => {
          wishl.addWish(prdId, async (response) => {
            const prdDt = await oroducts.find({ userId: user._id }, { productLst: 1, _id: 0 }).populate('productLst');
            const pd = prdDt[0].productLst;
            if (response.status) {
              oroducts.findOneAndUpdate({ userId: user._id }, {
                $push: {
                  prdId,
                },
              });
            }
          });
        });
        res.json(true);
      } else {
        const nwWishlist = new oroducts({
          userId: user._id,
          productLst: prdId,
        });

        nwWishlist.save();
        res.json(true);
      }
    } catch (error) {
      console.log(error);
      next(error);
    }
  },
  wishDrop: async (req, res, next) => {
    try {
      const { user } = req.session;
      const prdId = req.body.productId;
      const response = {};
      oroducts.updateOne({ userId: user._id }, { $pull: { productLst: prdId } }).then(() => {
        response.status = true;
        console.log(response);
        res.json(response);
      });
    } catch (error) {
      console.log(error);
      next(error);
    }
  },
  addtoCart: async (req, res, next) => {
    try {
      const id = req.session.user._id;
      const useer = await User.findById(id);
      const prodct = req.params.id;
      Product.findById(prodct).then((product) => {
        useer.addCart(product);
      });
    } catch (error) {
      console.log(error);
      next(error);
    }
  },
  changeQty: async (req, res, next) => {
    try {
      const id = req.session.user._id;
      const useer = await User.findById(id);
      useer.changeqty(req.body.productId, req.body.qty, req.body.count, (response) => {
        response.access = true;
        req.session.lngth = response.length;
        res.json(response);
      });
    } catch (error) {
      console.log(error);
      next(error);
    }
  },
  checkoutView: (req, res, next) => {
    try {
      const valid = req.flash('err');
      const { user } = req.session;
      const { address } = user;
      if (user.address.length > 0) {
        console.log(address);
        res.render('addressselectionpage', { admin: false, address, user });
      } else {
        res.render('addaddressform', {
          admin: false, status: true, valid, user,
        });
      }
    } catch (error) {
      console.log(error);
      next(error);
    }
  },
  placeOrder: async (req, res, next) => {
    try {
      const { user } = req.session;
      const userId = user._id;
      const {
        address, paymentMethod,
      } = req.body;
      const productDt = req.session.user.cart.items;
      const totalPrice = req.session.user.cart.totalprice;
      console.log(totalPrice);
      req.session.cartPrd = await User.findOne({ _id: user._id }).populate('cart.items.productId');
      const date = new Date();
      const Status = paymentMethod == 'Cash on Delivery' ? 'placed' : 'pending';
      const response = Status;
      const newOrder = new Order({
        userId, address, paymentMethod, Status, productDt, totalPrice, date,
      });
      newOrder.save().then(() => {
        if (response == 'placed') {
          res.json(response);
        } else {
          gnrtRazo.generateRazorpay(newOrder, (order) => {
            res.json({ response, order });
          });
        }
      });
    } catch (error) {
      console.log(error);
      next(error);
    }
  },
  viewOrder: async (req, res, next) => {
    try {
      const { user } = req.session;
      const orders = await Order.find({ userId: user._id }).populate('productDt.productId');
      console.log(orders);
      res.render('vieworder', { admin: false, orders });
    } catch (error) {
      console.log(error);
      next(error);
    }
  },
  verifyPayment: async (req, res, next) => {
    try {
      const { user } = req.session;
      console.log(req.body);
      const dt = req.body.payment;
      // eslint-disable-next-line global-require
      const { createHmac } = await import('node:crypto');

      const secret = 'rUZjxzeFI8xRIS7OrwRz4N0p';
      const hash = createHmac('sha256', secret)
        .update(`${dt.razorpay_order_id}|${dt.razorpay_payment_id}`)
        .digest('hex');
      console.log(hash, 'hash');
      if (hash == dt.razorpay_signature) {
        console.log('success');
        Order.updateOne(
          { userID: user._id },
          {
            $set: { Status: 'placed' },
          },
        ).then(() => {
          res.json({ status: true });
        });
      } else {
        res.json({ status: false });
        console.log('Illya');
      }
    } catch (error) {
      console.log(error);
      next(error);
    }
  },
  orderViewProducts: async (req, res, next) => {
    try {
      const orderId = req.body.productId;
      const doc = await Order.findOne({ _id: orderId }).populate('productDt.productId');
      const orPrd = doc.productDt;
      res.json(orPrd);
    } catch (error) {
      console.log(error);
      next(error);
    }
  },
  cancelOrder: (req, res) => {
    try {
      const oId = req.body.orderId;
      Order.updateOne({ _id: oId }, { $set: { Status: 'Cancelled' } }).then(() => {
        const status = true;
        res.json(status);
      });
    } catch (error) {
      console.log(error);
      next(error);
    }
  },
  userProfile: (req, res, next) => {
    try {
      const { user } = req.session;
      User.findById(user._id).then((usr) => {
        console.log(usr);
        res.render('userprofile', { admin: false, usr });
      });
    } catch (error) {
      console.log(error);
      next(error);
    }
  },
  changePassword: (req, res, next) => {
    try {
      const valid = req.flash('err');
      const userId = req.session.user._id;
      User.findById(userId).then((usr) => {
        res.render('changepassword', { admin: false, usr, valid });
      });
    } catch (error) {
      console.log(error);
      next(error);
    }
  },
  postChangePassword: (req, res, next) => {
    try {
      const { user } = req.session;
      const { currentPassword } = req.body;
      const { NewPassword } = req.body;
      let { confirmPassword } = req.body;
      console.log(req.body);
      bcrypt.compare(currentPassword, user.password).then((status) => {
        if (status) {
          if (NewPassword === confirmPassword) {
            bcrypt.genSalt(10, (err, salt) => {
              bcrypt.hash(confirmPassword, salt, (err, hash) => {
                confirmPassword = hash;
                User.updateOne({ _id: user._id }, {
                  $set: {
                    password: confirmPassword,
                    confirmPassword: NewPassword,
                  },
                }).then((resp) => {
                  res.json({ status: true });
                });
              });
            });
          } else {
            console.log('Password must match');
            res.json({ status: 'match' });
          }
        } else {
          console.log('incorrect', '==');
          req.flash('err', 'Incorrect Password');
          res.json({ status: 'passErr' });
        }
      });
    } catch (error) {
      console.log(error);
      next(error);
    }
  },
  addAddress: (req, res, next) => {
    try {
      const valid = req.flash('err');
      res.render('addaddressform', { admin: false, status: false, valid });
    } catch (error) {
      console.log(error);
      next(error);
    }
  },
  postAddAddress: async (req, res, next) => {
    try {
      const { user } = req.session;
      const { address } = user;
      console.log(req.body);
      const nwAddress = {
        name: req.body.name,
        country: req.body.country,
        streetAddress: req.body.streetAddress,
        town: req.body.town,
        state: req.body.state,
        pincode: req.body.pincode,
        phone: req.body.phone,
      };
      if (nwAddress.name || nwAddress.country || nwAddress.streetAddress || nwAddress.phone || nwAddress.pincode || nwAddress.town) {
        await User.updateOne({ _id: user._id }, {
          $push: { address: nwAddress },
        }).then(() => {
          console.log(req.body.status);
          if (req.body.status) {
            res.render('addressselectionpage', { admin: false, address });
          } else {
            res.redirect('/userProfile');
          }
        });
      } else {
        console.log('Hello');
        req.flash('err', 'Fill All Field');
        res.redirect('/addAddress');
      }
    } catch (error) {
      console.log(error);
      next(error);
    }
  },
  codeApply: async (req, res, next) => {
    try {
      console.log();
      const userId = req.session.user._id;
      const useer = await User.findById(userId);
      let totalPrice = parseInt(useer.cart.totalprice, 10);
      const { code } = req.body;
      const response = {};
      const coupon = await couponSchema.find({ name: code }, (err, document) => {
        if (err) {
          console.log(err);
        } else if (document.length > 0) {
          const doc = document[0];
          console.log(document.length);
          if (doc.status == 'Enable') {
            if (Date.now() > doc.ExpiringDate) {
              response.expiry = true;
            } else {
              const isUsed = doc.usedUsers.findIndex((el) => new String(el.userId).trim() == new String(userId).trim());
              if (isUsed >= 0) {
                response.used = true;
              } else {
                response.used = false;
                if (doc != null || doc != undefined) {
                  if (totalPrice >= doc.MinimumCartAmount) {
                    req.session.user.cart.totalprice = totalPrice - doc.DiscountAmount;
                    console.log(req.session.user.cart.totalprice);
                    totalPrice -= doc.DiscountAmount;
                    response.status = true;
                    response.total = totalPrice;
                    response.discount = doc.DiscountAmount;
                  } else {
                    response.status = false;
                    response.total = totalPrice;
                    response.min = doc.MinimumCartAmount;
                  }
                }
                response.total = totalPrice;
                response.discount = doc.DiscountAmount;
              }
            }
          } else {
            response.error = true;
            response.total = totalPrice;
          }
        } else {
          response.error = true;
          response.total = totalPrice;
        }
        res.json(response);
      }).clone().catch((err) => console.log(err));
    } catch (error) {
      console.log(error);
      next(error);
    }
  },
  invoice: async (req, res, next) => {
    try {
      const { id } = req.params;
      const orders = await Order.findById(id).populate('productDt.productId');
      res.render('invoice', { admin: false, orders });
    } catch (error) {
      console.log(error);
      next(error);
    }
  },
  productDt: async (req, res, next) => {
    try {
      console.log('HIhihi');
      const productId = req.query.id;
      const product = await Product.findById(productId);
      res.render('productdt', { admin: false, product, users: true });
    } catch (error) {
      console.log(error);
      next(error);
    }
  },
  postOtp: (req, res, next) => {
    try {
      const error = req.flash('error', 'Incorrect Otp');
      console.log(req.body);
      console.log(token);
      if (req.body.otp == token) {
        newUser.save();
        token = 0;
        res.redirect('/login');
      } else {
        res.render('otpfill', { admin: false, error });
      }
    } catch (error) {
      console.log(error);
      next(error);
    }
  },
  resendOtp: (req, res, next) => {
    try {
      Crypto.randomBytes(2, (err, buffer) => {
        if (err) {
          console.log(err);
        } else {
          console.log(buffer);
          token = buffer.toString('hex');
          console.log(token);
          helpers.emailOtp(token, email, () => console.log('Dummy'), true);
        }
      });
      res.json(true);
    } catch (error) {
      console.log(error);
      next(error);
    }
  },
  searching: async (req, res, next) => {
    try {
      const pro = req.query.category;
      const { cat } = req.query;
      const allProducts = await Product.find({
        $and: [{
          name: { $regex: new RegExp(`^${pro}.*`, 'i') },
        }, { category: cat }],
      });
      console.log(allProducts, '==');
      res.json(allProducts);
    } catch (error) {
      console.log(error);
      next(error);
    }
  },

};
