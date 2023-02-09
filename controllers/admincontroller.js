const bcrypt = require('bcryptjs');
const { name } = require('ejs');
const { json } = require('body-parser');
const _ = require('underscore');
const formateDate = require('date-and-time');
const User = require('../models/user');
const Catogary = require('../models/catogaryschema');
const product = require('../models/product');
const orderSchema = require('../models/orderschema');
const Coupon = require('../models/couponschema');
const Banner = require('../models/banner');
const orderschema = require('../models/orderschema');

module.exports = {
  catogaryForm: (req, res, next) => {
    try {
      const error = req.flash('err');
      res.render('admin-catogory', { admin: true, error });
    } catch (error) {
      error.admin = true;
      next(error);
      console.log(error);
    }
  },
  userList: async (req, res, next) => {
    try {
      const { admin } = req.session;
      const users = await User.find();
      res.render('admin-userlist', { admin, users, admin: true });
    } catch (error) {
      error.admin = true;
      next(error);
      console.log(error);
    }
  },
  blockUser: async (req, res, next) => {
    try {
      const Id = req.body.userId;
      const user = await User.findById(Id);
      const response = {};
      if (user.userType == 'Block') {
        User.findOneAndUpdate({ _id: Id }, { userType: 'Unblock' }).then((res) => console.log(res, '=='));
        res.json('Unblock');
      } else {
        User.findOneAndUpdate({ _id: Id }, { userType: 'Block' }).then((res) => console.log(res, '=='));
        res.json('Block');
      }
    } catch (error) {
      error.admin = true;
      next(error);
      console.log(error);
    }
  },
  logoutAdmin: (req, res, next) => {
    try {
      req.session.adminLogged = false;
      res.redirect('/admin');
    } catch (error) {
      error.admin = true;
      next(error);
      console.log(error);
    }
  },
  addCatogary: async (req, res, next) => {
    try {
      const error = req.flash('err');
      const img = req.files.image[0].filename;
      const {
        name, discription, status,
      } = req.body;

      const exist = await Catogary.findOne({ name });
      if (exist) {
        console.log(exist);
        console.log('kkk');
        req.flash('err', 'Give Unique Name');
        res.render('admin-catogory', { admin: true, error });
        req.flash('err', '');
      } else if (img) {
        const nwCatogary = new Catogary({
          name, discription, status, img,
        });
        nwCatogary.save().then(() => {
          res.redirect('/categoryForm');
        });
      }
    } catch (error) {
      error.admin = true;
      next(error);
      console.log(error);
    }
  },
  viewCategory: async (req, res, next) => {
    try {
      const cat = { cat: '' };
      const category = await Catogary.find();
      cat.cat = category;
      const Cat = cat.cat;
      res.render('admin-catogarylist', { Cat, admin: true });
    } catch (error) {
      error.admin = true;
      next(error);
      console.log(error);
    }
  },
  doUnlist: async (req, res, next) => {
    try {
      const Id = req.body.catId;
      let chng;
      const { Status } = req.body;
      if (Status == 'Unlist') {
        chng = 'List';
      } else {
        chng = 'Unlist';
      }
      await Catogary.updateOne(
        { _id: Id },
        {
          $set: { status: chng },
        },
      ).then(() => {
        const stts = true;
        res.json({ stts, chng });
      });
    } catch (error) {
      error.admin = true;
      next(error);
      console.log(error);
    }
  },
  catogaryEdit: async (req, res, next) => {
    try {
      const Id = req.params.id;
      const Doc = await Catogary.findById(Id);
      res.render('admin-catogaryedit', { admin: false, Doc });
    } catch (error) {
      error.admin = true;
      next(error);
      console.log(error);
    }
  },
  postCatEdit: async (req, res, next) => {
    try {
      console.log(req.files, 'req.files');
      const img = req.files.filename;
      console.log(img, 'img');

      const Id = req.body._id;
      const nwCatogary = {
        name: req.body.name,
        discription: req.body.discription,
        img,
        status: req.body.status,
      };
      const Cat = await Catogary.findOne({ _id: Id });
      if (img) {
        await Catogary.updateOne({ _id: Id }, {
          $set: {
            img: nwCatogary.img,
          },
        });
      }
      await Catogary.updateOne({ _id: Id }, {
        $set: {
          name: nwCatogary.name,
          discription: nwCatogary.discription,
          status: nwCatogary.status,
        },
      }).then(() => [
        res.redirect('/addcategory'),
      ]);
    } catch (error) {
      error.admin = true;
      next(error);
      console.log(error);
    }
  },
  adminProductView: async (req, res, next) => {
    try {
      const products = await product.find();
      res.render('admin-productlist', { products, admin: true });
    } catch (error) {
      error.admin = true;
      next(error);
      console.log(error);
    }
  },
  addProductForm: async (req, res, next) => {
    try {
      const error = req.flash('err');
      const cat = await Catogary.find();
      res.render('admin-productaddform', { admin: true, cat, error });
    } catch (error) {
      error.admin = true;
      next(error);
      console.log(error);
    }
  },
  addProduct: async (req, res, next) => {
    try {
      const error = req.flash('err');
      const cat = await Catogary.find();
      const img = req.files.image;
      const image = [];
      img.forEach((el, i, arr) => {
        image.push(arr[i].path.substring(12));
      });
      const exist = await product.findOne({ name: req.body.name });
      console.log(exist);
      if (exist) {
        console.log('kkkk');
        req.flash('err', 'Give Unique Name');
        res.render('admin-productaddform', { admin: true, cat, error });
        req.flash('err', '');
      } else if (img) {
        const nwProduct = new product({
          name: req.body.name,
          price: req.body.price,
          image,
          type: req.body.type,
          category: req.body.category,
          flavour: req.body.flavour,
        });
        nwProduct.save().then(() => {
          res.redirect('/addProductView');
        });
      }
    } catch (error) {
      error.admin = true;
      next(error);
      console.log(error);
    }
  },
  dropProduct: (req, res, next) => {
    try {
      const Id = req.body.id;
      product.deleteOne({ _id: Id }).then(() => {
        res.json({ status: true });
      });
    } catch (error) {
      error.admin = true;
      next(error);
      console.log(error);
    }
  },
  editProductView: (req, res, next) => {
    try {
      const Id = req.params.id;
      product.findById(Id).then((pro) => {
        res.render('admin-proeditform', { admin: false, pro });
      });
    } catch (error) {
      error.admin = true;
      next(error);
      console.log(error);
    }
  },
  updateProduct: (req, res, next) => {
    try {
      console.log(req.files);
      const Id = req.params.id;
      const image = [];
      const nwpro = {
        name: req.body.name,
        price: req.body.price,
        type: req.body.type,
        flavour: req.body.flavour,
        category: req.body.category,
      };
      if (req.files.image) {
        const img = req.files.image;
        img.forEach((el, i, arr) => {
          image.push(arr[i].path.substring(12));
        });
        nwpro.image = image;
      }
      product.updateOne({ _id: Id }, {
        $set: {
          name: nwpro.name,
          price: nwpro.price,
          image: nwpro.image,
          type: nwpro.type,
          flavour: nwpro.flavour,
          category: nwpro.category,
        },
      }).then(() => {
        res.redirect('/products');
      });
    } catch (error) {
      error.admin = true;
      next(error);
      console.log(error);
    }
  },
  orderManagementView: async (req, res, next) => {
    try {
      const orders = await orderSchema.find().populate('productDt.items.productId');
      res.render('ordersview', { orders, admin: true });
    } catch (error) {
      error.admin = true;
      next(error);
      console.log(error);
    }
  },
  changeStatus: (req, res, next) => {
    try {
      const status = req.query.s;
      const response = {};
      const oId = req.query.id;
      orderSchema.updateOne({ _id: oId }, {
        $set: { Status: status },
      }).then(() => {
        if (status == 'Delivered' || status == 'Cancelled') {
          response.value = status;
          response.Status = false;
          res.json(response);
        } else {
          response.Status = true;
        }
      });
    } catch (error) {
      error.admin = true;
      next(error);
      console.log(error);
    }
  },
  dayReport: async (req, res, next) => {
    try {
      const dayReport = await orderSchema.aggregate([
        { $match: { Status: { $eq: 'Delivered' } } },
        {
          $group: {
            _id: { year: { $year: '$date' }, month: { $month: '$date' }, day: { $dayOfMonth: '$date' } },
            totalPrice: { $sum: '$productDt.totalprice' },
            items: { $sum: { $size: '$productDt.items' } },
            count: { $sum: 1 },
          },
        },
        {
          $sort: {
            '_id.year': -1,
            '_id.month': -1,
            '_id.day': -1,
          },
        },
      ]);
      res.render('admin-dayreport', { admin: true, dayReport });
    } catch (error) {
      error.admin = true;
      next(error);
      console.log(error);
    }
  },
  monthReport: async (req, res, next) => {
    try {
      const month = ['January', 'February', 'March', 'April', 'May', 'June', 'July', 'August', 'September', 'October', 'November', 'December'];
      const sale = await orderSchema.aggregate([{ $match: { Status: { $eq: 'Delivered' } } },
        {
          $group: {
            _id: {
              month: { $month: '$date' },
            },
            totalPrice: { $sum: '$productDt.totalprice' },
            items: { $sum: { $size: '$productDt.items' } },
            count: { $sum: 1 },
          },
        },
        {
          $sort: { date: -1 },
        },
      ]);
      const sales = sale.map((el) => {
        const newOne = { ...el };
        // eslint-disable-next-line no-underscore-dangle
        newOne._id.month = month[newOne._id.month - 1];
        return newOne;
      });

      res.render('admin-monthreport', { admin: true, sales });
    } catch (error) {
      error.admin = true;
      next(error);
      console.log(error);
    }
  },
  yearReport: async (req, res, next) => {
    try {
      const year = await orderSchema.aggregate([{ $match: { Status: { $eq: 'Delivered' } } },
        {
          $group: {
            _id: {
              year: { $year: '$date' },
            },
            totalPrice: { $sum: '$productDt.totalprice' },
            items: { $sum: { $size: '$productDt.items' } },
            count: { $sum: 1 },
          },
        },
        {
          $sort: { date: -1 },

        },
      ]);
      res.render('admin-yearreport', { admin: true, year });
    } catch (error) {
      console.log(error);
    }
  },
  AdminDash: async (req, res, next) => {
    try {
      const { admin } = req.session;
      const revenue = await orderSchema.aggregate([
        {
          $match: {
            $or: [{ $and: [{ Status: { $eq: 'Delivered' }, paymentMethod: { $eq: 'Cash on Delivery' } }] },
              { $and: [{ Status: { $eq: 'Delivered' }, paymentMethod: { $eq: 'Razorpay' } }] },
              { $and: [{ Status: { $eq: 'Placed' }, paymentMethod: { $eq: 'Razorpay' } }] }],
          },
        },

        {
          $group: {
            _id: {
            },
            totalPrice: { $sum: '$productDt.totalprice' },
            items: { $sum: { $size: '$productDt.items' } },
            count: { $sum: 1 },

          },
        }, { $sort: { date: -1 } },
      ]);
      const d = new Date();
      const day = d.getDate();
      let month = d.getMonth();
      month += 1;
      const year = d.getFullYear();
      const todayrevenue = await orderSchema.aggregate([
        {
          $match: {
            $or: [{ $and: [{ Status: { $eq: 'Delivered' }, paymentMethod: { $eq: 'Cash on Delivery' } }] },
              { $and: [{ Status: { $eq: 'Delivered' }, paymentMethod: { $eq: 'Razorpay' } }] },
              { $and: [{ Status: { $eq: 'Placed' }, paymentMethod: { $eq: 'Razorpay' } }] }],
          },
        }, {
          $addFields: { Day: { $dayOfMonth: '$date' }, Month: { $month: '$date' }, Year: { $year: '$date' } },
        },
        { $match: { Day: day, Year: year, Month: month } },

        {
          $group: {

            _id: {
              day: { $dayOfMonth: '$date' },

            },
            totalPrice: { $sum: '$productDt.totalprice' },
            items: { $sum: { $size: '$productDt.items' } },
            count: { $sum: 1 },

          },
        },
      ]);

      const todaySales = await orderSchema.aggregate([
        {
          $match: { status: { $ne: 'Cancelled' } },
        }, {
          $addFields: { Day: { $dayOfMonth: '$date' }, Month: { $month: '$date' }, Year: { $year: '$date' } },
        },
        { $match: { Day: day, Year: year, Month: month } },

        {
          $group: {

            _id: {
              day: { $dayOfMonth: '$date' },

            },
            totalPrice: { $sum: '$totalPrice' },
            items: { $sum: { $size: '$productDt.items' } },
            count: { $sum: 1 },

          },
        },
      ]);
      const allSales = await orderSchema.aggregate([
        {
          $match: { status: { $ne: 'Cancelled' } },
        },

        {
          $group: {
            _id: {
            },
            totalPrice: { $sum: '$totalPrice' },
            items: { $sum: { $size: '$productDt.items' } },
            count: { $sum: 1 },

          },
        }, { $sort: { date: -1 } },
      ]);

      res.render('admin-dashboard', {
        admin,
        revenue,
        allSales,
        todaySales,
        todayrevenue,
        admin: true,
      });
    } catch (error) {
      error.admin = true;
      next(error);
      console.log(error);
    }
  },
  CouponView: async (req, res, next) => {
    try {
      const coupon = await Coupon.find();
      res.render('admin-coupen', { admin: true, coupon });
    } catch (error) {
      error.admin = true;
      next(error);
      console.log(error);
    }
  },
  addCoupon: (req, res, next) => {
    try {
      res.render('admin-addcoupon', { admin: true });
    } catch (error) {
      error.admin = true;
      next(error);
      console.log(error);
    }
  },
  postCouponAdd: (req, res, next) => {
    try {
      const {
        name,
        DiscountAmount,
        MinimumCartAmount,
        StartinDate,
        ExpiringDate,
        status,
      } = req.body;

      const nwCoupon = new Coupon({
        name,
        DiscountAmount,
        MinimumCartAmount,
        StartinDate,
        ExpiringDate,
        status,
      });
      nwCoupon.save().then((response) => {
        res.json(true);
      });
    } catch (error) {
      error.admin = true;
      next(error);
      console.log(error);
    }
  },
  editCoupon: async (req, res, next) => {
    try {
      const { id } = req.params;
      const coupon = await Coupon.findById(id);
      res.render('admin-editcoupon', { admin: false, coupon });
    } catch (error) {
      error.admin = true;
      next(error);
      console.log(error);
    }
  },
  postEditCoupon: (req, res, next) => {
    try {
      Coupon.updateOne(
        { _id: req.body._id },
        {
          $set: {
            name: req.body.name,
            DiscountAmount: req.body.DiscountAmount,
            MinimumCartAmount: req.body.MinimumCartAmount,
            StartinDate: req.body.StartinDate,
            ExpiringDate: req.body.ExpiringDate,
            status: req.body.status,
          },
        },
      ).then((response) => {
        res.redirect('/CouponView');
      });
    } catch (error) {
      error.admin = true;
      next(error);
      console.log(error);
    }
  },
  changeCouponStatus: (req, res, next) => {
    try {
      const { id, status } = req.body;
      if (status == '1') {
        Coupon.updateOne({ _id: id }, {
          $set: { status: 'Disable' },
        }).then((response) => {
          res.json(true);
        });
      } else {
        Coupon.updateOne({ _id: id }, {
          $set: { status: 'Enable' },
        }).then((response) => {
          res.json(false);
        });
      }
    } catch (error) {
      error.admin = true;
      next(error);
      console.log(error);
    }
  },
  bannerView: async (req, res, next) => {
    try {
      const banner = await Banner.find();
      res.render('bannerview', { banner, admin: true });
    } catch (error) {
      error.admin = true;
      next(error);
      console.log(error);
    }
  },
  bannerAdd: async (req, res, next) => {
    try {
      res.render('addbannerform', { admin: true });
    } catch (error) {
      error.admin = true;
      next(error);
      console.log(error);
    }
  },
  postAddBanner: (req, res, next) => {
    try {
      const image = req.files.image[0].filename;
      const { name, url, discription } = req.body;
      if (image) {
        const nwBanner = new Banner({
          name, url, discription, image,
        });
        nwBanner.save().then(() => res.redirect('/banner'));
      }
    } catch (err) {
      error.admin = true;
      next(error);
      console.log(error);
    }
  },
  dropBanner: (req, res, next) => {
    try {
      Banner.collection.drop().then(() => res.json(true));
    } catch (error) {
      error.admin = true;
      next(error);
      console.log(error);
    }
  },
  bannerEditView: async (req, res, next) => {
    try {
      const { id } = req.params;
      const banner = await Banner.findById(id);
      res.render('editbannerform', { admin: true, banner });
    } catch (error) {
      error.admin = true;
      next(error);
      console.log(error);
    }
  },
  postEditBanner: (req, res, next) => {
    try {
      const { id } = req.body;
      let image;
      if (req.files.image) {
        image = req.files.image[0].filename;
      }
      const nwBanner = {
        name: req.body.name,
        url: req.body.url,
        discription: req.body.discription,
      };
      if (image) {
        Banner.updateOne({ _id: id }, {
          $set: {
            name: nwBanner.name,
            image,
            url: nwBanner.url,
            discription: nwBanner.discription,
          },
        }).then(() => res.redirect('/banner'));
      } else {
        Banner.updateOne({ _id: id }, {
          $set: {
            name: nwBanner.name,
            url: nwBanner.url,
            discription: nwBanner.discription,
          },
        }).then(() => res.redirect('/banner'));
      }
    } catch (error) {
      error.admin = true;
      next(error);
      console.log(error);
    }
  },
  chart1: async (req, res, next) => {
    try {
      const months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
      const sale = await orderschema.aggregate([
        { $match: { Status: { $eq: 'Delivered' } } },
        {
          $group: {
            _id: {
              month: { $month: '$date' },
            },
            totalPrice: { $sum: '$total' },
            items: { $sum: { $size: '$productDt.items' } },
            count: { $sum: 1 },

          },
        }, { $sort: { '_id.month': -1 } }]);
      const salesRep = sale.map((el) => {
        const newOne = { ...el };
        newOne._id.month = months[newOne._id.month - 1];
        return newOne;
      });

      res.json({ salesRep });
    } catch (error) {
      error.admin = true;
      next(error);
      console.log(error);
    }
  },
  chart2: async (req, res, next) => {
    try {
      const payment = await orderschema.aggregate([
        { $match: { Status: { $eq: 'Delivered' } } },
        {
          $group: {
            _id: {
              payment: '$paymentMethod',
            },
            count: { $sum: 1 },
          },
        }, { $sort: { '_id.month': -1 } }]);
      res.json({ payment });
    } catch (error) {
      error.admin = true;
      console.log(error, ':Error');
      next(error);
    }
  },

};
