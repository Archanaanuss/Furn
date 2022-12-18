const fast2sms = require('fast-two-sms');
const bcrypt = require('bcrypt');
const User = require('../models/userModel');
const Product = require('../models/productModel');
const Banner = require('../models/bannerModel');
const Orders = require('../models/ordersModel');
const Address = require('../models/addressModel');
const Offer = require('../models/offerModel');
const Category = require('../models/categoryModel');
const { ObjectId } = require('mongodb');

let isLoggedin;
isLoggedin = false;
let session;
let newOtp;
let newUser;
const offer = {
  name: 'None',
  type: 'None',
  discount: 0,
  usedBy: false,
};
const couponTotal = 0;

// OTP
const sendMessage = function (mobile, res) {
  const randomOTP = Math.floor(1000 + Math.random() * 9000);
  const options = {
    authorization:
      'MSOj0bTnaP8phCARmWqtzkgEV4ZN2Ff9eUxXI7iJQ5HcDBKsL1vYiamnRcMxrsjDJboyFEXl0Sk37pZq',
    message: `your OTP verification code is ${randomOTP}`,
    numbers: [mobile],
  };

  // send this message
  fast2sms
    .sendMessage(options)
    .then((response) => {
      console.log('otp sent succcessfully');
    })
    .catch((error) => {
      console.log(error);
    });
  return randomOTP;
};

// landing page   product listing
const landingpage = async (req, res) => {
  try {
    session = req.session;
    session.offer = offer;
    session.couponTotal = couponTotal;
    const productData = await Product.find();
    const bannerlist = await Banner.find();
    const cat = await Category.find();
    if (session.userId) {
      const count = await User.findOne({ _id: session.userId });

      res.render('user/landingpage', {
        product: productData,
        banner: bannerlist,
        category: cat,
        ccount: count.cart.totalqty,
        wcount: count.wishlist.totalqty,
        isLoggedin: true,
      });
    } else {
      res.render('user/landingpage', {
        product: productData,
        banner: bannerlist,
        category: cat,
        isLoggedin: false,
      });
    }
  } catch (error) {
    console.log(error.message);
  }
};

// login and registration
const usersignup = async (req, res) => {
  session = req.session;
  const cat = await Category.find();
  if (session.userId) {
    res.redirect('/');
  } else {
    console.log('Register page');
    res.render('user/userRegister', { category: cat });
  }
};

const userlogin = async (req, res) => {
  session = req.session;
  const cat = await Category.find();
  if (session.userId) {
    res.redirect('/');
  } else if (session.incorrect) {
    console.log('Login page');
    res.render('user/userlogin', {
      category: cat,
      message: ' username and password is incorrect',
    });
  } else {
    console.log('Login page');
    res.render('user/userlogin', { category: cat });
  }
};

// registration form post method
const securePassword = async (password) => {
  try {
    const passwordHash = await bcrypt.hash(password, 10);
    return passwordHash;
  } catch (error) {
    console.log(error.message);
  }
};

const userRegister = async (req, res) => {
  try {
    const cat = await Category.find();
    const alreadyExistingusername = await User.findOne({
      username: req.body.username,
    });
    const alreadyExistingmobile = await User.findOne({
      mobile: req.body.mobile,
    });
    if (req.body.password == req.body.cpassword) {
      if (!alreadyExistingusername && !alreadyExistingmobile) {
        const spassword = await securePassword(req.body.password);
        const user = User({
          name: req.body.name,
          username: req.body.username,
          mobile: req.body.mobile,
          password: spassword,
          isAdmin: 0,
        });
        console.log(user);
        const userData = await user.save();

        if (userData) {
          newUser = userData._id;
          const otp = sendMessage(userData.mobile);
          newOtp = otp;
          res.render('user/otp', { isLoggedin, category: cat });
        } else {
          res.render('user/userRegister', {
            message: 'Your registration was a failure',
            category: cat,
          });
        }
      } else if (alreadyExistingusername) {
        res.render('user/userRegister', {
          message: 'Username Already Exist',
          isLoggedin,
          category: cat,
        });
      } else {
        res.render('user/userRegister', {
          message: 'Mobile Number Already Exist',
          isLoggedin,
          category: cat,
        });
      }
    } else {
      res.render('user/userRegister', {
        message: 'Password mismatch',
        isLoggedin,
        category: cat,
      });
    }
  } catch (error) {
    console.log('hiiiii');
    console.log(error.message);
  }
};

// confirm oTP
const ConfirmOTP = async (req, res) => {
  const cat = await Category.find();
  const userData = await User.findOne({ _id: newUser });
  if (userData) {
    if (req.body.otp == newOtp) {
      await User.findByIdAndUpdate(
        { _id: newUser },
        { $set: { isVerified: 1 } },
      );
      // session.otpId = false;
      res.redirect('/login');
      // window.alert("Verification is successfull")
    } else {
      res.render('otp', {
        isLoggedin,
        message: 'Invalid OTP . Please Check Your OTP',
        category: cat,
      });
    }
  }
};

// login form post method
const userSignin = async (req, res) => {
  try {
    const { username } = req.body;
    const { password } = req.body;

    const userData = await User.findOne({ username });
    const cat = await Category.find();

    if (userData) {
      const passwordMatch = await bcrypt.compare(password, userData.password);
      if (passwordMatch) {
        if (userData.isVerified === 0) {
          res.render('user/userlogin', {
            message: 'please verify your mail',
            category: cat,
          });
        } else {
          session = req.session;
          session.userId = userData._id;
          isLoggedin = true;
          res.redirect('/');
          console.log('logged in');
        }
      } else {
        session = req.session;
        session.incorrect = true;
        res.redirect('/login');
      }
    } else {
      session = req.session;
      session.incorrect = true;
      res.redirect('/login');
    }
  } catch {
    console.log('error.message');
  }
};

// dashboard
const userProfile = async (req, res) => {
  try {
    session = req.session;
    if (session.userId) {
      const addressData = await Address.find({ userId: session.userId });
      const userData = await User.findById({ _id: session.userId });
      const orderData = await Orders.find({ userId: session.userId });
      const cat = await Category.find();
      // const count = await User.findOne({ _id: session.userId });

      res.render('user/userprofile', {
        user: userData,
        isLoggedin,
        userOrders: orderData,
        userAddress: addressData,
        ccount: userData.cart.totalqty,
        wcount: userData.wishlist.totalqty,
        category: cat,
      });
    } else {
      res.redirect('/');
    }
  } catch (error) {
    console.log(error.message);
  }
};

// edit user
const editUser = async (req, res) => {
  try {
    session = req.session;
    if (session.userId) {
      await User.findByIdAndUpdate(
        { _id: session.userId },
        {
          $set: {
            name: req.body.name,
            lname: req.body.lname,
            username: req.body.username,
            mobile: req.body.mobile,
          },
        },
      );
      res.redirect('/dashboard');
    } else {
      res.redirect('/login');
    }
  } catch (error) {
    console.log(error.message);
  }
};

// Add Address
const addAddress = async (req, res) => {
  try {
    session = req.session;
    if (session.userId) {
      const addressData = Address({
        userId: session.userId,
        firstname: req.body.firstname,
        lastname: req.body.lastname,
        country: req.body.country,
        address: req.body.streetAddress,
        address2: req.body.streetAddress2,
        city: req.body.city,
        state: req.body.state,
        pin: req.body.pin,
        email: req.body.email,
        mobileno: req.body.mobileno,
      });
      console.log(addressData);
      await addressData.save();
      res.redirect('/dashboard');
    } else {
      res.redirect('/login');
    }
  } catch (error) {
    console.log(error.message);
  }
};

// Product details
const productDetails = async (req, res) => {
  try {
    session = req.session;
    const { id } = req.query;
    const productData = await Product.findById({ _id: id });
    const cat = await Category.find();
    if (session.userId) {
      const count = await User.findOne({ _id: session.userId });

      res.render('user/productDetails', {
        isLoggedin,
        details: productData,
        ccount: count.cart.totalqty,
        wcount: count.wishlist.totalqty,
        category: cat,
      });
    } else {
      res.render('user/productDetails', {
        details: productData,
        category: cat,
        isLoggedin,
        
      });
    }
  } catch (error) {
    console.log(error.message);
  }
};

// View shop
const shopView = async (req, res) => {
  try {
    session = req.session;
    const category = await Category.find();
    let search = '';
    if (req.query.search) {
      search = req.query.search;
    }
    let page = 1;
    if (req.query.page) {
      page = req.query.page;
    }
    const limit = 8;

    const productData = await Product.find({
      isDelete: 1,
      $or: [
        { name: { $regex: `.${search}.`, $options: 'i' } },
        { brand: { $regex: `.${search}.`, $options: 'i' } },
        { category: { $regex: `.${search}.`, $options: 'i' } },
      ],
    })
      .limit(limit * 1)
      .skip((page - 1) * limit)
      .exec();
    const countpage = await Product.find({
      isDelete: 1,
      $or: [
        { name: { $regex: `.${search}.`, $options: 'i' } },
        { brand: { $regex: `.${search}.`, $options: 'i' } },
        { category: { $regex: `.${search}.`, $options: 'i' } },
      ],
    }).countDocuments();

    if (session.userId) {
      const count = await User.findOne({ _id: session.userId });
      res.render('user/shopView', {
        isLoggedin,
        product: productData,
        ccount: count.cart.totalqty,
        wcount: count.wishlist.totalqty,
        category:category,
        totalPages: Math.ceil(countpage / limit),
        currentPage: page,
        previous: new Number(page) - 1,
        next: new Number(page) + 1,
      });
    } else {
      res.render('user/shopView', {
        isLoggedin,
        product: productData,
        category:category,
        totalPages: Math.ceil(countpage / limit),
        currentPage: page,
        previous: new Number(page) - 1,
        next: new Number(page) + 1,
      });
    }
  } catch (error) {
    console.log(error.message);
  }
};

// shop category
const shopCategory = async (req, res) => {
  try {
    session = req.session;
    const cname = req.query.name;
    const category = await Category.find();
    // const productData = await Product.find({ category: cname });
    let search = '';
    if (req.query.search) {
      search = req.query.search;
    }
    let page = 1;
    if (req.query.page) {
      page = req.query.page;
    }
    const limit = 8;

    const productData = await Product.find({
      category: cname,
      isDelete: 1,
      $or: [
        { name: { $regex: `.${search}.`, $options: 'i' } },
        { brand: { $regex: `.${search}.`, $options: 'i' } },
        { category: { $regex: `.${search}.`, $options: 'i' } },
      ],
    })
      .limit(limit * 1)
      .skip((page - 1) * limit)
      .exec();
    const countpage = await Product.find({
      category: cname,
      isDelete: 1,
      $or: [
        { name: { $regex: `.${search}.`, $options: 'i' } },
        { brand: { $regex: `.${search}.`, $options: 'i' } },
        { category: { $regex: `.${search}.`, $options: 'i' } },
      ],
    }).countDocuments();

    if (session.userId) {
      const count = await User.findOne({ _id: session.userId });
      res.render('user/shopView', {
        isLoggedin,
        ccount: count.cart.totalqty,
        wcount: count.wishlist.totalqty,
        product: productData,
        category:category,
        totalPages: Math.ceil(countpage / limit),
        currentPage: page,
        previous: new Number(page) - 1,
        next: new Number(page) + 1,
      });
    } else {
      res.render('user/shopView', {
        isLoggedin,
        product: productData,
        category:category,
        totalPages: Math.ceil(countpage / limit),
        currentPage: page,
        previous: new Number(page) - 1,
        next: new Number(page) + 1,
      });
    }
  } catch (error) {
    console.log(error.message);
  }
};

// View cart
const viewCart = async (req, res) => {
  try {
    session = req.session;
    const cat = await Category.find();
    if (session.userId) {
      const userData = await User.findOne({ _id: session.userId });
      const completeUser = await userData.populate('cart.item.productId');

      if (session.couponTotal == 0) {
        // update coupon
        session.couponTotal = userData.cart.totalPrice;
      }
      if (userData.cart.item.length === 0) {
        res.render('user/viewCart', {
          isLoggedin,
          category: cat,
          ccount: userData.cart.totalqty,
          wcount: userData.wishlist.totalqty,
          id: session.userId,
          cartProducts: completeUser.cart,
          offer: session.offer,
          couponTotal: session.couponTotal,
          empty: true,
        });
      } else {
        res.render('user/viewCart', {
          isLoggedin,
          ccount: userData.cart.totalqty,
          wcount: userData.wishlist.totalqty,
          category: cat,
          id: session.userId,
          cartProducts: completeUser.cart,
          offer: session.offer,
          couponTotal: session.couponTotal,
          empty: false,
        });
      }
    } else {
      res.render('user/viewCart', {
        isLoggedin,
        category: cat,
        id: session.userId,
        offer: session.offer,
        couponTotal: session.couponTotal,
      });
    }
  } catch (error) {
    console.log(error.message);
  }
};

// Add to cart
const addToCart = async (req, res) => {
  try {
    console.log('hello1');

    const productId = req.query.id;
    session = req.session;
    if (session.userId) {
      console.log('hello2');
      const userData = await User.findById({ _id: session.userId });
      const productData = await Product.findById({ _id: productId });
      userData.addToCart(productData);
      res.json({ status: true });
    } else {
      console.log('hello3');

      res.redirect('/login');
    }
  } catch (error) {
    console.log(error.message);
  }
};

// view wishlist
const WishlistView = async (req, res) => {
  try {
    session = req.session;
    const cat = await Category.find();
    if (session.userId) {
      const userData = await User.findById({ _id: session.userId });

      const completeUser = await userData.populate('wishlist.item.productId');
      if (userData.wishlist.item.length === 0) {
        res.render('user/wishList', {
          isLoggedin,
          category: cat,
          ccount: userData.cart.totalqty,
          wcount: userData.wishlist.totalqty,
          id: session.userId,
          wishlistProducts: completeUser.wishlist,
          wempty: true,
        });
      } else {
        res.render('user/wishList', {
          isLoggedin,
          category: cat,
          ccount: userData.cart.totalqty,
          wcount: userData.wishlist.totalqty,
          id: session.userId,
          wishlistProducts: completeUser.wishlist,
          wempty: false,
        });
      }
    } else {
      res.render('user/wishList', {
        isLoggedin,
        id: session.userId,
        category: cat,
      });

      // res.redirect('/')
    }
  } catch (error) {
    console.log(error.message);
  }
};

const addToWishlist = async (req, res) => {
  try {
    const productId = req.query.id;
    session = req.session;
    if (session.userId) {
      const userData = await User.findById({ _id: session.userId });
      const productData = await Product.findById({ _id: productId });
      userData.addToWishlist(productData);
      res.json({ status: true });
      
    } else {
      res.redirect('/wishlist');
    }
  } catch (error) {}
};
const addCartdelWishlsit = async (req, res) => {
  const productId = req.query.id;
  console.log(productId);
  session = req.session;
  const userData = await User.findById({ _id: session.userId });
  const productData = await Product.findById({ _id: productId });
  const add = await userData.addToCart(productData);
  if (add) {
    userData.removefromWishlist(productId);
  }
  res.redirect('/viewcart');
};
const deleteWishlist = async (req, res) => {
  const productId = req.query.id;
  session = req.session;
  const userData = await User.findById({ _id: session.userId });
  userData.removefromWishlist(productId);
  res.redirect('/wishlist');
};

// delete from cart
const deleteCart = async (req, res, next) => {
  try {
    const productId = req.query.id;
    session = req.session;
    if (session.userId) {
      const userData = await User.findById({ _id: session.userId });
      userData.removefromCart(productId);
      res.redirect('/viewcart');
    } else {
      res.redirect('/login');
    }
  } catch (error) {
    console.log(error.message);
  }
};

// Edit Quantity
const editQnty = async (req, res) => {
  try {
    id = req.query.id;
    console.log(id, ':', req.body.qty);
    session = req.session;
    if (session.userId) {
      const userData = await User.findById({ _id: session.userId });
      const foundProduct = userData.cart.item.findIndex(
        (objInItems) => new String(objInItems._id).trim() === new String(id).trim(),
      );
      console.log('product found at:', foundProduct);

      userData.cart.item[foundProduct].qty = req.body.qty;
      console.log(userData.cart.item[foundProduct]);
      userData.cart.totalPrice = 0;

      const totalPrice = userData.cart.item.reduce((acc, curr) => acc + curr.price * curr.qty, 0);
      const totalqty = userData.cart.item.reduce((acc, curr) => acc + curr.qty, 0);
      userData.cart.totalPrice = totalPrice;
      userData.cart.totalqty = totalqty;
      await userData.save();

      res.redirect('/viewcart');
    } else {
      res.redirect('/login');
    }
  } catch (error) {
    console.log(error.message);
  }
};

// Checkout page
const checkOut = async (req, res) => {
  try {
    session = req.session;
    if (session.userId) {
      const id=req.query.addressid
      const userData = await User.findById({ _id: session.userId });
      const completeUser = await userData.populate('cart.item.productId');
      const addressData = await Address.find({ userId: session.userId });
      const selectAddress= await Address.findOne({_id:id})
      const cat = await Category.find();
      if(session.couponTotal==0){
        session.couponTotal=userData.cart.totalPrice;
      }
      res.render('user/checkOut', {
        isLoggedin,
        ccount: userData.cart.totalqty,
        wcount: userData.wishlist.totalqty,
        category: cat,
        id: session.userId,
        cartProducts: completeUser.cart,
        offer: session.offer,
        couponTotal: session.couponTotal,
        userAddress:addressData,
        addSelect:selectAddress
      });
    } else {
      res.redirect('/');
    }
  } catch (error) {
    console.log(error.message);
  }
};

// Store order
const storeOrder = async (req, res) => {
  try {
    session = req.session;
    if (session.userId) {
      const cat = await Category.find();
      const userData = await User.findById({ _id: session.userId });
      const completeUser = await userData.populate('cart.item.productId');
      // console.log('CompleteUser: ', completeUser);
      userData.cart.totalPrice = session.couponTotal;
      const updatedTotal = await userData.save();

      if (completeUser.cart.totalPrice > 0) {
        const order = Orders({
          userId: session.userId,
          firstname: req.body.firstname,
          lastname: req.body.lastname,
          country: req.body.country,
          address: req.body.streetAddress,
          address2: req.body.streetAddress2,
          city: req.body.city,
          state: req.body.state,
          pin: req.body.pin,
          email: req.body.email,
          mobileno: req.body.mobileno,
          payment: req.body.payment,
          products: completeUser.cart,
          offer: session.offer.name,
        });
        const orderProductStatus = [];
        for (const key of order.products.item) {
          orderProductStatus.push(0);
        }
        // console.log('orderProductStatus',orderProductStatus);
        order.productReturned = orderProductStatus;

        const orderData = await order.save();

        session.currentOrder = orderData._id;
        console.log(session.currentOrder)
        // console.log('userSession.currentOrder',userSession.currentOrder);

        const offerUpdate = await Offer.updateOne(
          { name: session.offer.name },
          { $push: { usedBy: session.userId } },
        );

        // console.log(req.body.payment);
        // await orderData.save();
        if (req.body.payment === 'COD') {
          res.redirect('/order-success');
        } else if (req.body.payment === 'PayPal') {
          res.render('user/paypal', {
            userId: session.userId,
            total: completeUser.cart.totalPrice,
            ccount: userData.cart.totalqty,
            wcount: userData.wishlist.totalqty,
            category: cat,
            isLoggedin,
          });
        } else {
          res.redirect('/');
        }
      } else {
        res.redirect('/checkout');
      }
    } else {
      res.redirect('/');
    }
  } catch (error) {
    console.log(error.message);
  }
};

// payment success
const paymentSuccess = async (req, res) => {
  try {
    session = req.session;
    const cat = await Category.find();

    if (session.userId) {
      const userData = await User.findById({ _id: session.userId });
      const productData = await Product.find();
      for (const key of userData.cart.item) {
        console.log(key.productId, ' + ', key.qty);
        for (const prod of productData) {
          if (new String(prod._id).trim() == new String(key.productId).trim()) {
            prod.stock -= key.qty;
            await prod.save();
          }
        }
      }
      await Orders.find({ userId: session.userId });
      await Orders.updateOne(
        { userId: session.userId, _id: session.currentOrder },
        { $set: { status: 'Build' } },
      );
      await User.updateOne(
        { _id: session.userId },
        {
          $set: {
            'cart.item': [],
            'cart.totalPrice': '0',
            'cart.totalqty': '0',
          },
        },
        { multi: true },
      );
      console.log('Order Built and Cart is Empty.');
      session.couponTotal = 0;
      res.render('user/orderSuccess', {
        ccount: userData.cart.totalqty,
        wcount: userData.wishlist.totalqty,
        isLoggedin,
        category: cat,
      });
    }
  } catch (error) {
    console.log(error.message);
  }
};

// view orders
const viewOrder = async (req, res) => {
  try {
    session = req.session;
    if (session.userId) {
      const { id } = req.query;
      const cat = await Category.find({});
      const orderData = await Orders.findById({ _id: id });
      const userData = await User.findById({ _id: session.userId });
      await orderData.populate('products.item.productId');
      console.log('hloo');
      console.log(orderData.products.item);
      console.log('hiii1');
      res.render('user/viewOrder', {
        order: orderData,
        user: userData,
        ccount: userData.cart.totalqty,
        wcount: userData.wishlist.totalqty,
        category: cat,
      });
    } else {
      res.redirect('/login');
    }
  } catch (error) {
    console.log(error.message);
  }
};

// cancel order
const cancelOrder = async (req, res) => {
  try {
    session = req.session;
    if (session.userId) {
      const { id } = req.query;
      console.log(id);
      await Orders.deleteOne({ _id: id });
      res.redirect('/dashboard');
    } else {
      res.redirect('/login');
    }
  } catch (error) {
    console.log(error.message);
  }
};
// Add coupon
const addCoupon = async (req, res) => {
  try {
    session = req.session;
    if (session.userId) {
      const userData = await User.findById({ _id: session.userId });
      const offerData = await Offer.findOne({ name: req.body.offer });

      if (offerData) {
        if (offerData.usedBy.includes(session.userId)) {
          res.redirect('/viewcart');
        } else {
          session.offer.name = offerData.name;
          session.offer.type = offerData.type;
          session.offer.discount = offerData.discount;
          const updatedTotal = userData.cart.totalPrice
            - (userData.cart.totalPrice * session.offer.discount) / 100;
          session.couponTotal = updatedTotal;
          res.redirect('/viewcart');
        }
      } else {
        res.redirect('/viewcart');
      }
    } else {
      res.redirect('/viewcart');
    }
  } catch (error) {
    console.log(error.message);
  }
};

// Return product
const returnProduct = async (req, res) => {
  try {
    session = req.session;
    console.log(session.currentOrder)
    if (session.userId) {
      const { id } = req.query;
      // console.log('id',new String(id));
      const productOrderData = await Orders.findById({
        _id: ObjectId(session.currentOrder),
      });
      // console.log('productOrderData.products.item[i].productId',new String(productOrderData.products.item[0].productId));
      const productData = await Product.findById({ _id: id });
      if (productOrderData) {
        for (let i = 0; i < productOrderData.products.item.length; i++) {
          if (
            new String(productOrderData.products.item[i].productId).trim()
            === new String(id).trim()
          ) {
            productData.stock += productOrderData.products.item[i].qty;
            productOrderData.productReturned[i] = 1;
            console.log('found!!!');
            console.log('productData.stock', productData.stock);
            await productData.save().then(() => {
              console.log('productData saved');
            });
            console.log(
              'productOrderData.productReturned[i]',
              productOrderData.productReturned[i],
            );
            await productOrderData.save().then(() => {
              console.log('productOrderData saved');
            });
          } else {
            // console.log('Not at position: ',i);
          }
        }
        res.redirect('/dashboard');
      }
    } else {
      res.redirect('/login');
    }
  } catch (error) {
    console.log(error);
  }
};

// logout
const userlogout = async (req, res) => {
  session = req.session;
  session.userId = false;
  isLoggedin = false;
  res.redirect('/');
};

module.exports = {
  landingpage,
  userlogin,
  userRegister,
  usersignup,
  userSignin,
  userProfile,
  userlogout,
  productDetails,
  viewCart,
  addToCart,
  deleteCart,
  editQnty,
  checkOut,
  ConfirmOTP,
  storeOrder,
  paymentSuccess,
  shopView,
  shopCategory,
  viewOrder,
  cancelOrder,
  editUser,
  addAddress,
  addToWishlist,
  WishlistView,
  addCartdelWishlsit,
  deleteWishlist,
  addCoupon,
  returnProduct,
};
