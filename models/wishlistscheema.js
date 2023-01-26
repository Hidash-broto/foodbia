const mongoose = require('mongoose');
const product = require('./product');

const CartSchema = new mongoose.Schema(
  {
    userId: {
      type: String,
      required: true,
    },
    productLst: [{
      type: mongoose.Types.ObjectId,
      ref: product,
    }],
  },
  { timestamps: true },
);

// eslint-disable-next-line no-unused-expressions
CartSchema.methods.addWish = function(proId, callBack) {
  const { productLst } = this;
  const response = {};
  const isExist = productLst.findIndex((obj) => obj == proId);
  console.log(isExist);
  if (isExist >= 0) {
    response.status = false;
  } else {
    response.status = true;
    productLst.push(proId);
  }

  return this.save().then(() => callBack(response));
};

module.exports = mongoose.model('oroduct', CartSchema);
