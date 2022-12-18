const mongoose = require("mongoose");

const bannerSchema = new mongoose.Schema({
  btitle: {
    type: String,
    required: true,
  },
  bimage: {
    type: String,
    required: true,
  },
});

module.exports = mongoose.model('Banner', bannerSchema);
