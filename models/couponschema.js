const mongoose = require('mongoose');

const couponSchema = new mongoose.Schema(
  {
    name: {
      unique:true,
      type: String,
    },
    DiscountAmount: {
      type: Number,
    },
    MinimumCartAmount: {
      type: Number,
    },
    StartinDate: {
      type: Date,
    },
    ExpiringDate: {
      type: Date,
    },
    status: {

    },
    usedUsers: [

    ],
  },
);
module.exports = mongoose.model('coupon', couponSchema);
