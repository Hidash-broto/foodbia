const mongoose = require('mongoose');
const product = require('./product');

const userSchema = new mongoose.Schema({
  name: {
    type: String,
    required: true,
  },
  email: {
    type: String,
    lowercase: true,
    required: true,
  },
  password: {
    type: String,
    required: true,
  },
  confirmPassword: {
    type: String,
    required: true,
  },
  cart: {
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
    coupon: {
      applyed: false,
      amount: 0,
    },
  },
  userType: {
    default: 'Block',
    type: String,
  },
  address: [

  ],
});

userSchema.methods.couponApply = async () => {
  const { cart } = this;
  console.log(this);
};

// eslint-disable-next-line no-unused-expressions, func-names
userSchema.methods.addCart = function (pro) {
  const { cart } = this;
  const prId = pro._id.toString();
  const isExisting = cart.items.findIndex((objItems) => objItems.productId == prId);
  if (isExisting >= 0) {
    cart.items[isExisting].qty += 1;
  } else {
    cart.items.push({ productId: pro._id, qty: 1 });
  }
  if (!cart.totalprice) {
    cart.totalprice = 0;
  }
  cart.totalprice += pro.price;
  return this.save();
},
userSchema.methods.changeqty = async function (prdId, qty, ctn, callBack) {
  const { cart } = this;
  const quantity = parseInt(qty, 10);
  const count = parseInt(ctn, 10);
  const Prduct = await product.findById(prdId);
  const prdid = Prduct._id.toString();
  console.log(prdid);
  const response = {};
  // eslint-disable-next-line no-mixed-operators
  if (quantity === 1 && count === -1 || count === -2) {
    const isExisting = cart.items.findIndex((objitem) => objitem.productId == prdid);
    cart.totalprice -= Prduct.price * cart.items[isExisting].qty;
    cart.items.splice(isExisting, 1);
    response.remove = true;
  } else if (count === 1) {
    const isExisting = cart.items.findIndex((objitem) => objitem.productId == prdid);
    cart.items[isExisting].qty += 1;
    cart.totalprice += Prduct.price;
    response.status = cart.items[isExisting].qty;
  } else if (count === -1) {
    const isExisting = cart.items.findIndex((objitem) => objitem.productId == prdid);
    cart.items[isExisting].qty -= 1;
    cart.totalprice -= Prduct.price;
    response.status = cart.items[isExisting].qty;
  }
  this.save().then((doc) => {
    response.total = doc.cart.totalprice;
    response.length = cart.items.length;
    response.productPrice = Prduct.price;
    callBack(response);
  });
};

module.exports = mongoose.model('User', userSchema);
