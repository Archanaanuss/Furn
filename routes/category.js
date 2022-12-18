const express = require("express");
const categoryRoute = express.Router();
const Category = require("../models/categoryModel");

categoryRoute.get("/", async (req, res) => {
  const categoryList = await Category.find();

  if (!categoryList) {
    res.status(500).json({ success: false });
  }
  res.send(categoryList);
  
});

module.exports = categoryRoute;
