const mongoose = require("mongoose");

const productSchema = new mongoose.Schema({
  name: {
    type: String,
    required: true,
  },

  category:{
    type: String,
    required: true,
  },
  description: {
    type: String,
    required: true,
  },
  stock:{
    type:Number,
  },
  brand: {
    type: String,
    required: true,
  },
  price: {
    type: Number,
    required: true,
  },
  rating: {
    type: Number,
    required: true,
  },
  image: {
    type: String,
    required: true,
  },
  isProduct: {
    type: Number,
    default: 1,
    require: true,
  },
  isDelete:{
    type: Number,
    default: 1,
    require: true,
  }
});

module.exports = mongoose.model("Product", productSchema);
