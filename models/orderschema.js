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
  productDt: {
    items: [{
      productId: {
        type: mongoose.Types.ObjectId,
        ref: product,
      },
      qty: {
        type: Number,
      },
    }],
    totalprice: Number,
  },
  discountprice: Number,
  date: {

  },
});

module.exports = mongoose.model('Order', orderSchema);
