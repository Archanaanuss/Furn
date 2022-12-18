const express = require('express');
const router = express.Router();
const userController = require('../controller/userController');

router.get('/', userController.landingpage);
router.get('/login', userController.userlogin);
router.post('/signup', userController.userRegister);
router.post('/login', userController.userSignin);

router.get('/register', userController.usersignup);
router.post('/otp', userController.ConfirmOTP);
router.get('/dashboard', userController.userProfile);
router.get('/logout', userController.userlogout);
router.get('/productdetails', userController.productDetails);
router.get('/shop', userController.shopView);
router.get('/return-product',userController.returnProduct)
router.get('/shop-category',userController.shopCategory)

router.get('/addtocart', userController.addToCart);
router.get('/viewcart', userController.viewCart);
router.get('/deletecart', userController.deleteCart);
router.post('/editqnty', userController.editQnty);
router.post('/add-coupon',userController.addCoupon)

router.get('/checkout', userController.checkOut);
router.post('/payment', userController.storeOrder);
router.get('/order-success', userController.paymentSuccess);

router.get('/view-order', userController.viewOrder);
router.get('/cancel-order', userController.cancelOrder);

router.post('/edit-user', userController.editUser);
router.post('/add-address', userController.addAddress);

router.get('/wishlist', userController.WishlistView);
router.get('/add-to-wishlist',userController.addToWishlist)
router.get('/delete-wishlist',userController.deleteWishlist)
router.get('/add-to-cart-delete-wishlist',userController.addCartdelWishlsit)



module.exports = router;
