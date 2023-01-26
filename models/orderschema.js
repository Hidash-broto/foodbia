const mongoose = require('mongoose');
const product = require('./product');

const orderSchema = new mongoose.Schema({
  userId: {
    type: String,
  },
  address: {
    type: String,
  },
  paymentMethod: {
    type: String,
  },
  Status: {

  },
  productDt: [{
    productId: {
      type: String,
      ref: product,
    },
  }],
  totalPrice: {
    type: Number,
  },
  date: {

  },
});

module.exports = mongoose.model('Order', orderSchema);
