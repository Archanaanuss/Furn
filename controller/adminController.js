const user = require('../models/userModel');
const Product = require('../models/productModel');
const bcrypt = require('bcrypt');
const Banner = require('../models/bannerModel');
const Category = require('../models/categoryModel');
const Offer = require('../models/offerModel');
const Order = require('../models/ordersModel');

let orderType = 'all';
// Admin get method
const adminLanding = async (req, res) => {
  try {
    res.render('admin/adminLogin', {
      layout: '../views/layouts/adminLayout.ejs',
    });
  } catch (error) {
    console.log(error.message);
  }
};

// Admin post method.
const adminDash = async (req, res) => {
  try {
    const email = req.body.email;
    const password = req.body.password;

    const adminData = await user.findOne({ username: email });
    const userData = await user.find({ isAdmin: 0 });

    if (adminData) {
      const passwordMatch = await bcrypt.compare(password, adminData.password);
      console.log(adminData);

      if (passwordMatch) {
        if (adminData.isAdmin === 0) {
          res.render('admin/adminLogin', {
            message: 'email and password are incorrect',
            layout: '../views/layouts/adminLayout.ejs',
          });
        } else {
          console.log(adminData);
          req.session.admin_id = adminData._id;
          // id=adminData.id;
          res.redirect('/admin/home');
        }
      } else {
        res.render('admin/adminLogin', {
          message: 'email and password are incorrect',
          layout: '../views/layouts/adminLayout.ejs',
        });
      }
    } else {
      res.render('admin/adminLogin', {
        message: 'email and password are incorrect',
        layout: '../views/layouts/adminLayout.ejs',
      });
    }
  } catch (error) {
    console.log(error.message);
  }
};

// Home get method
const adminSignin = async (req, res) => {
  try {
    const userData = await user.find({ isAdmin: 0 });
    const categoryData = await Category.find();
    const categoryArray = [];
    const orderCount = [];

    for (let key of categoryData) {
      categoryArray.push(key.category);
      orderCount.push(0);
    }
    const completeorder = [];
    const orderData = await Order.find();

    for (let key of orderData) {
      const uppend = await key.populate('products.item.productId');
      completeorder.push(uppend);
    }
    console.log(completeorder.length);
    for (let i = 0; i < completeorder.length; i++) {
      for (let j = 0; j < completeorder[i].products.item.length; j++) {
        const catadata = completeorder[i].products.item[j].productId.category;
        const issExisting = categoryArray.findIndex((category) => {
          return category === catadata;
        });
        orderCount[issExisting]++;
      }
    }
    // console.log(catadata);
    console.log(orderCount);
    console.log(categoryArray);
    res.render('admin/adminHome', {
      users: userData,
      category: categoryArray,
      count: orderCount,
      layout: '../views/layouts/adminLayout.ejs',
    });
  } catch (error) {
    console.log(error.message);
  }
};

// View users
const userView = async (req, res) => {
  try {
    var search = '';
    if (req.query.search) {
      search = req.query.search;
    }
    userData = await user.find({
      isAdmin: 0,
      $or: [
        { username: { $regex: '.*' + search + '.*', $options: 'i' } },
        { name: { $regex: '.*' + search + '.*', $options: 'i' } },
        { mobile: { $regex: '.*' + search + '.*', $options: 'i' } },
      ],
    });

    res.render('admin/viewUsers', {
      users: userData,
      layout: '../views/layouts/adminLayout.ejs',
    });
  } catch (error) {
    console.log(error);
  }
};

// Block unblock
const userBlock = async (req, res) => {
  const id = req.query.id;
  const userData = await user.findById({ _id: id });

  if (userData.isVerified) {
    await user.findByIdAndUpdate({ _id: id }, { $set: { isVerified: 0 } });
  } else {
    await user.findByIdAndUpdate({ _id: id }, { $set: { isVerified: 1 } });
  }
  userlist = await user.find({ isAdmin: 0 });

  res.render('admin/viewUsers', {
    users: userlist,
    layout: '../views/layouts/adminLayout.ejs',
  });
};

// Add product get method
const addProduct = async (req, res) => {
  const userData = await user.find({ isAdmin: 0 });
  const categoryData = await Category.find();
  res.render('admin/addProducts', {
    users: userData,
    category: categoryData,
    layout: '../views/layouts/adminLayout.ejs',
  });
};

// Add product post method
const regProduct = async (req, res) => {
  try {
    const product = Product({
      name: req.body.name,
      price: req.body.price,
      stock: req.body.stock,
      brand: req.body.brand,
      category: req.body.category,
      description: req.body.description,
      rating: req.body.rating,
      image: req.file.filename,
    });
    console.log(product);
    const productData = await product.save();
    if (productData) {
      // res.render('admin/addProduct',{message:"Your registration was successfull."})
      res.redirect('/admin/addProducts');
    } else {
      res.redirect('/admin/addProducts');

      // res.render('admin/addProduct',{message:"Your registration was a failure"})
    }
  } catch (error) {
    console.log(error.message);
  }
};

// View product
const productView = async (req, res) => {
  try {
    var search = '';
    if (req.query.search) {
      search = req.query.search;
    }
    const productData = await Product.find({
      $or: [
        { name: { $regex: '.*' + search + '.*', $options: 'i' } },
        { category: { $regex: '.*' + search + '.*', $options: 'i' } },
        { brand: { $regex: '.*' + search + '.*', $options: 'i' } },
      ],
    });
    const userData = await user.find({ isAdmin: 0 });
    res.render('admin/viewProducts', {
      product: productData,
      users: userData,
      layout: '../views/layouts/adminLayout.ejs',
    });
  } catch (error) {
    console.log(error.message);
  }
};

// Delete product
const deleteProducts = async (req, res) => {
  try {
    const id = req.query.id;
    const productData = await Product.deleteOne({ _id: id });
    res.redirect('/admin/viewproduct');
  } catch (error) {
    console.log(error.message);
  }
};
const softDeleteProducts = async (req, res) => {
  try {
    const id = req.query.id;
    const productData = await Product.findByIdAndUpdate(
      { _id: id },
      { $set: { isDelete: 0 } }
    );
    res.redirect('/admin/viewproduct');
  } catch (error) {
    console.log(error.message);
  }
};
const babackToSoftDelete = async (req, res) => {
  try {
    const id = req.query.id;
    const productData = await Product.findByIdAndUpdate(
      { _id: id },
      { $set: { isDelete: 1 } }
    );
    res.redirect('/admin/viewproduct');
  } catch (error) {
    console.log(error.message);
  }
};

// Product edit & update
const editProducts = async (req, res) => {
  try {
    const id = req.query.id;
    userData = await user.find({ isAdmin: 0 });
    const categoryData = await Category.find();
    const productData = await Product.findById({ _id: id });
    if (productData) {
      res.render('admin/editProduct', {
        product: productData,
        users: userData,
        category: categoryData,
        layout: '../views/layouts/adminLayout.ejs',
      });
    } else {
      res.redirect('/admin/viewproduct');
    }
  } catch (error) {
    console.log(error.message);
  }
};

const updateProduct = async (req, res) => {
  try {
    const productData = await Product.findByIdAndUpdate(
      { _id: req.body.id },
      {
        $set: {
          name: req.body.name,
          price: req.body.price,
          stock: req.body.stock,
          brand: req.body.brand,
          category: req.body.category,
          description: req.body.description,
          rating: req.body.rating,
          image: req.file.filename,
        },
      }
    );
    res.redirect('/admin/viewproduct');
  } catch (error) {
    console.log(error.message);
  }
};

// Add banner get method
const getBanner = async (req, res) => {
  try {
    const userData = await user.find({ isAdmin: 0 });
    const bannerlist = await Banner.find();

    res.render('admin/addBanner', {
      banner: bannerlist,
      users: userData,
      layout: '../views/layouts/adminLayout.ejs',
    });
  } catch (error) {
    console.log(error.message);
  }
};

// Add banner post method
const addBanner = async (req, res) => {
  try {
    let bannerlist = await Banner.find();
    if (bannerlist != null) {
      await Banner.updateOne({
        btitle: req.body.title,
        bimage: req.file.filename,
      });
      res.redirect('/admin/addBanner');
    } else {
      const banner = Banner({
        btitle: req.body.title,
        bimage: req.file.filename,
      });
      console.log(banner);
      const bannerData = await banner.save();
      res.redirect('/admin/addBanner');
    }
  } catch (error) {
    console.log(error.message);
  }
};

// Add category
const addCategory = async (req, res) => {
  try {
    const categoryData = await Category.find();
    const userData = await user.find({ isAdmin: 0 });
    const productData = await Product.find();
    res.render('admin/adminCategory', {
      product: productData,
      users: userData,
      category: categoryData,
      layout: '../views/layouts/adminLayout.ejs',
    });
  } catch (error) {
    console.log(error.message);
  }
};
// Add category post method
const addnewcategory = async (req, res) => {
  try {
    const category = Category({
      category: req.body.category,
    });
    await category.save();

    res.redirect('/admin/addcategory');
  } catch (error) {
    console.log(error.message);
  }
};

// Delete category
const deletecategory = async (req, res) => {
  try {
    const { id } = req.query;
    console.log(id);
    await Category.deleteOne({ _id: id });
    res.redirect('/admin/addcategory');
  } catch (error) {
    console.log(error);
  }
};

// Offer management
const adminLoadOffer = async (req, res) => {
  try {
    const offerData = await Offer.find();
    const userData = await user.find({ isAdmin: 0 });
    const productData = await Product.find();
    res.render('admin/adminOffer', {
      users: userData,
      product: productData,
      layout: '../views/layouts/adminLayout.ejs',
      offer: offerData,
    });
  } catch (error) {
    console.log(error.message);
  }
};
const adminStoreOffer = async (req, res) => {
  const offer = Offer({
    name: req.body.name,
    type: req.body.type,
    discount: req.body.discount,
  });
  await offer.save();
  res.redirect('/admin/adminOffer');
};

// Delete offer
const adminDeleteOffer = async (req, res) => {
  try {
    const { id } = req.query;
    console.log(id);
    await Offer.deleteOne({ _id: id });
    res.redirect('/admin/adminOffer');
  } catch (error) {
    console.log(error);
  }
};

// Admin order
const viewOrder = async (req, res) => {
  try {
    const productData = await Product.find();
    const userData = await user.find({ isAdmin: 0 });
    const orderData = await Order.find().sort({ createdAt: -1 });
    if (orderType == undefined) {
      res.render('admin/adminOrder', {
        users: userData,
        product: productData,
        order: orderData,
        layout: '../views/layouts/adminLayout.ejs',
      });
    } else {
      id = req.query.id;

      res.render('admin/adminOrder', {
        users: userData,
        product: productData,
        order: orderData,
        id: id,
        layout: '../views/layouts/adminLayout.ejs',
      });
    }
  } catch (error) {
    console.log(error.message);
  }
};
const adminCancelOrder = async (req, res) => {
  const id = req.query.id;
  await Order.deleteOne({ _id: id });
  res.redirect('/admin/adminOrder');
};
const adminConfirmorder = async (req, res) => {
  const id = req.query.id;
  await Order.updateOne({ _id: id }, { $set: { status: 'Comfirmed' } });
  res.redirect('/admin/adminOrder');
};
const adminDeliveredorder = async (req, res) => {
  const id = req.query.id;
  await Order.updateOne({ _id: id }, { $set: { status: 'Delivered' } });
  res.redirect('/admin/adminOrder');
};

// Logout
const adminLogout = function (req, res) {
  adminsession = req.session;
  adminsession.admin_id = false;
  // adminsession.destroy();
  res.redirect('/admin');
};

module.exports = {
  adminLanding,
  adminDash,
  adminSignin,
  adminLogout,
  userBlock,
  userView,
  addProduct,
  regProduct,
  productView,
  deleteProducts,
  softDeleteProducts,
  babackToSoftDelete,
  editProducts,
  updateProduct,
  getBanner,
  addBanner,
  addCategory,
  addnewcategory,
  deletecategory,
  adminLoadOffer,
  adminStoreOffer,
  adminDeleteOffer,
  viewOrder,
  adminCancelOrder,
  adminConfirmorder,
  adminDeliveredorder,
};
