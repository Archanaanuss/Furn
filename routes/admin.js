const express = require("express");
const adminRoute = express.Router();
const path = require("path");

const admauth = require("../middleware/adminauth");

const adminController = require("../controller/adminController");

const multer = require("multer");

let Storage = multer.diskStorage({
  destination: function (req, file, cb) {
    cb(null, path.join(__dirname, "../public/productImage"));
  },
  filename: (req, file, cb) => {
    cb(
      null,
      file.fieldname + "_" + Date.now() + path.extname(file.originalname)
    );
  },
});
let upload = multer({
  storage: Storage,
}).single("productimg");

adminRoute.get("/", admauth.isLogout, adminController.adminLanding);
adminRoute.get("/home", admauth.isLogin, adminController.adminSignin);

adminRoute.post("/login", adminController.adminDash);
adminRoute.get("/block-user", admauth.isLogin, adminController.userBlock);
adminRoute.get("/adminLogout", admauth.isLogin, adminController.adminLogout);
adminRoute.get("/viewuser", admauth.isLogin, adminController.userView);
adminRoute.get("/addProducts", admauth.isLogin, adminController.addProduct);
adminRoute.post("/addProducts", upload, adminController.regProduct);
adminRoute.get("/viewproduct", admauth.isLogin, adminController.productView);
adminRoute.get("/deleteproduct", admauth.isLogin, adminController.deleteProducts);
adminRoute.get("/softdeleteproduct", admauth.isLogin, adminController.softDeleteProducts);
adminRoute.get("/backtosoftdelete", admauth.isLogin, adminController.babackToSoftDelete);


adminRoute.get("/editproduct", admauth.isLogin, adminController.editProducts);
adminRoute.post("/editproduct", admauth.isLogin, upload, adminController.updateProduct);
adminRoute.get("/addBanner", admauth.isLogin, adminController.getBanner);
adminRoute.get("/addcategory", admauth.isLogin, adminController.addCategory);
adminRoute.post("/addcategory", adminController.addnewcategory);
adminRoute.get('/delete-category', adminController.deletecategory);
adminRoute.post("/addBanner", upload, admauth.isLogin, adminController.addBanner);

adminRoute.get('/adminOffer', admauth.isLogin, adminController.adminLoadOffer)
adminRoute.post('/adminOffer', admauth.isLogin, adminController.adminStoreOffer)
adminRoute.get('/delete-offer', admauth.isLogin, adminController.adminDeleteOffer)

adminRoute.get('/adminOrder', admauth.isLogin, adminController.viewOrder);
adminRoute.get('/admin-cancel-order', admauth.isLogin, adminController.adminCancelOrder);
adminRoute.get('/admin-confirm-order', admauth.isLogin, adminController.adminConfirmorder);
adminRoute.get('/admin-delivered-order', admauth.isLogin, adminController.adminDeliveredorder);



module.exports = adminRoute;
