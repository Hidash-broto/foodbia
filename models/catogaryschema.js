const mongoose = require('mongoose');

const catogarySchema = new mongoose.Schema(
  {
    name: {
      unique: true,
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