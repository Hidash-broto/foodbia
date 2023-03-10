const mongoose = require('mongoose');

const productSchema = new mongoose.Schema(
  {
    name: {
      unique: true,
      type: String,
    },
    price: {
      type: Number,
    },
    image: [

    ],
    type: {
      type: String,
    },
    category: {
      type: String,
    },
    flavour: {
      type: String,
    },
  },
);

module.exports = mongoose.model('Product', productSchema);
