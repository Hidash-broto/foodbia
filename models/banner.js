const mongoose = require('mongoose');

const bannerSchema = new mongoose.Schema({
  name: {
    type: String,
    require: [true, 'A banner must have a title'],
    unique: true,
  },
  image: {
    type: String,
  },
  url: {
    type: String,
  },
  discription: {
    type: String,
  },
});

module.exports = mongoose.model('Banner', bannerSchema);
