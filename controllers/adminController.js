const bcrypt = require('bcryptjs');
const { name } = require('ejs');
const { json } = require('body-parser');
const _ = require('underscore');
const User = require('../models/user');
const Catogary = require('../models/catogarySchema');
const product = require('../models/product');
const orderSchema = require('../models/orderSchema');
const Coupon = require('../models/couponSchema');

module.exports = {
  catogaryForm: (req, res) => {
    try {
      res.render('admin-catogory', { admin: true });
    } catch (error) {
      console.log(error);
    }
  },
  userList: async (req, res) => {
    try {
      const { admin } = req.session;
      const users = await User.find();
      res.render('admin-userList', { admin, users, admin: true });
    } catch (error) {
      console.log(error);
    }
  },
  blockUser: async (req, res) => {
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
      console.log(error);
    }
  },
  logoutAdmin: (req, res) => {
    try {
      req.session.destroy();
      res.redirect('/admin');
    } catch (error) {
      console.log(error);
    }
  },
  addCatogary: (req, res) => {
    try {
      const img = req.file.filename;
      console.log(img);
      const {
        name, discription, status,
      } = req.body;
      const nwCatogary = new Catogary({
        name, discription, status,
      });
      if (img) {
        const imgSave = new Catogary({
          img,
        });
        imgSave.save();
      }
      console.log(req.body);
      nwCatogary.save().then(() => {
        res.redirect('/categoryForm');
      });
    } catch (error) {
      console.log(error);
    }
  },
  viewCategory: async (req, res) => {
    try {
      const cat = { cat: '' };
      const category = await Catogary.find();
      cat.cat = category;
      const Cat = cat.cat;
      res.render('admin-catogaryList', { Cat, admin: true });
    } catch (error) {
      console.log(error);
    }
  },
  doUnlist: async (req, res) => {
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
      console.log(error);
    }
  },
  catogaryEdit: async (req, res) => {
    try {
      const Id = req.params.id;
      const Doc = await Catogary.findById(Id);
      res.render('admin-catogaryEdit', { admin: false, Doc });
    } catch (error) {
      console.log(error);
    }
  },
  postCatEdit: async (req, res) => {
    try {
      const img = req.file.filename;
      const Id = req.body._id;
      const nwCatogary = {
        name: req.body.name,
        discription: req.body.discription,
        img,
        status: req.body.status,
      };
      const Cat = await Catogary.findOne({ _id: Id });
      console.log(Cat, 'hihihi');
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
      console.log(error);
    }
  },
  adminProductView: async (req, res) => {
    try {
      const products = await product.find();
      res.render('admin-productList', { products, admin: true });
    } catch (error) {
      console.log(error);
    }
  },
  addProductForm: async (req, res) => {
    try {
      const cat = await Catogary.find();
      res.render('admin-productAddForm', { admin: true, cat });
    } catch (error) {
      console.log(error);
    }
  },
  addProduct: (req, res) => {
    try {
      console.log(req.files);
      const img = req.files.image;
      const image = [];
      img.forEach((el, i, arr) => {
        image.push(arr[i].path.substring(12));
      });
      console.log(image);
      if (img) {
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
      console.log(error);
    }
  },
  dropProduct: (req, res) => {
    try {
      const Id = req.body.id;
      product.deleteOne({ _id: Id }).then(() => {
        res.json({ status: true });
      });
    } catch (error) {
      console.log(error);
    }
  },
  editProductView: (req, res) => {
    try {
      const Id = req.params.id;
      product.findById(Id).then((pro) => {
        res.render('admin-proEditForm', { admin: false, pro });
      });
    } catch (error) {
      console.log(error);
    }
  },
  updateProduct: (req, res) => {
    try {
      console.log(req.body.image);
      const Id = req.params.id;
      const image = [];
      const nwpro = {
        name: req.body.name,
        price: req.body.price,
        type: req.body.type,
        flavour: req.body.flavour,
        category: req.body.category,
      };
      console.log(req.files);
      if (req.files) {
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
      console.log(error);
    }
  },
  orderManagementView: async (req, res) => {
    try {
      const orders = await orderSchema.find();
      res.render('ordersView', { orders, admin: true });
    } catch (error) {
      console.log(error);
    }
  },
  changeStatus: (req, res) => {
    try {
      const status = req.query.s;
      const response = {};
      console.log(status);
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
      console.log(error);
    }
  },
  dayReport: async (req, res) => {
    try {
      const dayReport = await orderSchema.aggregate([
        { $match: { Status: { $eq: 'Delivered' } } },
        {
          $group: {
            _id: { year: { $year: '$date' }, month: { $month: '$date' }, day: { $dayOfMonth: '$date' } },
            totalPrice: { $sum: '$totalPrice' },
            items: { $sum: { $size: '$productDt' } },
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
      res.render('admin-dayReport', { admin: true, dayReport });
    } catch (error) {
      console.log(error);
    }
  },
  monthReport: async (req, res) => {
    try {
      const month = ['January', 'February', 'March', 'April', 'May', 'June', 'July', 'August', 'September', 'October', 'November', 'December'];
      const sale = await orderSchema.aggregate([{ $match: { Status: { $eq: 'Delivered' } } },
        {
          $group: {
            _id: {
              month: { $month: '$date' },
            },
            totalPrice: { $sum: '$totalPrice' },
            items: { $sum: { $size: '$productDt' } },
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

      res.render('admin-monthReport', { admin: true, sales });
    } catch (error) {
      console.log(error);
    }
  },
  yearReport: async (req, res) => {
    try {
      const year = await orderSchema.aggregate([{ $match: { Status: { $eq: 'Delivered' } } },
        {
          $group: {
            _id: {
              year: { $year: '$date' },
            },
            totalPrice: { $sum: '$totalPrice' },
            items: { $sum: { $size: '$productDt' } },
            count: { $sum: 1 },
          },
        },
        {
          $sort: { date: -1 },

        },
      ]);
      res.render('admin-yearReport', { admin: true, year });
    } catch (error) {
      console.log(error);
    }
  },
  AdminDash: async (req, res) => {
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
            totalPrice: { $sum: '$totalPrice' },
            items: { $sum: { $size: '$productDt' } },
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
            totalPrice: { $sum: '$totalPrice' },
            items: { $sum: { $size: '$productDt' } },
            count: { $sum: 1 },

          },
        },
      ]);
      console.log(todayrevenue);

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
            items: { $sum: { $size: '$productDt' } },
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
            items: { $sum: { $size: '$productDt' } },
            count: { $sum: 1 },

          },
        }, { $sort: { date: -1 } },
      ]);
      console.log(revenue, '===');

      res.render('admin-dashboard', {
        admin,
        revenue,
        allSales,
        todaySales,
        todayrevenue,
        admin: false,
      });
    } catch (error) {
      console.log(error);
    }
  },
  CouponView: async (req, res) => {
    try {
      const coupon = await Coupon.find();
      res.render('admin-coupen', { admin: true, coupon });
    } catch (error) {
      console.log(error);
    }
  },
  addCoupon: (req, res) => {
    try {
      res.render('admin-addCoupon', { admin: true });
    } catch (error) {
      console.log(error);
    }
  },
  postCouponAdd: (req, res) => {
    try {
      console.log(req.body);
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
      console.log(error);
    }
  },
  editCoupon: async (req, res) => {
    try {
      const { id } = req.params;
      console.log(id);
      const coupon = await Coupon.findById(id);
      res.render('admin-editCoupon', { admin: false, coupon });
    } catch (error) {
      console.log(error);
    }
  },
  postEditCoupon: (req, res) => {
    try {
      console.log(req.body);
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
      console.log(error);
    }
  },
  changeCouponStatus: (req, res) => {
    try {
      console.log(req.body);
      const { id, status } = req.body;
      if (status == '1') {
        console.log('1');
        Coupon.updateOne({ _id: id }, {
          $set: { status: 'Disable' },
        }).then((response) => {
          res.json(true);
        });
      } else {
        console.log('-1');
        Coupon.updateOne({ _id: id }, {
          $set: { status: 'Enable' },
        }).then((response) => {
          res.json(false);
        });
      }
    } catch (error) {
      console.log(error);
    }
  },
};
