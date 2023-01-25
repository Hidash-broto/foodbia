const mongoose = require('mongoose');

const catogarySchema = new mongoose.Schema(
  {
    name: {
      type: String,
    },
    discription: {

    },
    img: {

    },
    status: {

    },
  },
);
module.exports = mongoose.model('Catogary', catogarySchema);