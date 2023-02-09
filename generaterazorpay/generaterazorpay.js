const Razorpay = require('razorpay');

const instance = new Razorpay({
  key_id: process.env.razorpayKey_id,
  key_secret: process.env.razorpaySecretKey,
});
module.exports = {
  generateRazorpay: (order, callBack) => {
    instance.orders.create({
      amount: order.productDt.totalprice * 100,
      currency: 'INR',
      receipt: `${order._id}`,
      notes: {
        key1: 'value3',
        key2: 'value2',
      },
    }, (err, order) => {
      callBack(order);
    });
    // console.log(instance.orders, 'Hahaha');
    // return instance.orders;
  },
};
