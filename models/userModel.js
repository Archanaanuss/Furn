const mongoose = require("mongoose");
const Product = require("../models/productModel");

const userSchema = new mongoose.Schema({
  name: {
    type: String,
    required: true,
  },
  lname: {
    type: String,
  },

  username: {
    type: String,
    required: true,
  },
  mobile: {
    type: String,
    required: true,
  },
  password: {
    type: String,
    required: true,
  },
  isAdmin: {
    type: Number,
    required: true,
  },
  isVerified: {
    type: Number,
    default: 0,
  },
  cart: {
    item: [
      {
        productId: {
          type: mongoose.Types.ObjectId,
          ref: "Product",
          required: true,
        },
        qty: {
          type: Number,
          required: true,
        },
        price: {
          type: Number,
        },
      },
    ],
    totalPrice: {
      type: Number,
      default: 0,
    },
    totalqty: {
      type: Number,
      default: 0,
    },
  },

  wishlist: {
    item: [
      {
        productId: {
          type: mongoose.Types.ObjectId,
          ref: "Product",
          required: true,
        },
       
        price: {
          type: Number,
        },
        qty: {
          type: Number,
        },
      },
    ],
    totalqty: {
      type: Number,
      default: 0,
    },
  },
});

// Cart
userSchema.methods.addToCart = function (product) {
  const cart = this.cart;
  const isExisting = cart.item.findIndex((objInItems) => {
    return (
      new String(objInItems.productId).trim() == new String(product._id).trim()
    );
  });
  if (isExisting >= 0) {
    cart.item[isExisting].qty += 1;
  } else {
    cart.item.push({ productId: product._id, qty: 1, price: product.price });
  }
  cart.totalPrice += product.price;
  cart.totalqty += 1;

  console.log("User in schema:", this);
  return this.save();
};
userSchema.methods.removefromCart = async function (productId) {
  const cart = this.cart;
  const isExisting = cart.item.findIndex(
    (objInItems) =>
      new String(objInItems.productId).trim() === new String(productId).trim()
  );
  if (isExisting >= 0) {
    const prod = await Product.findById(productId);
    cart.totalPrice -= prod.price * cart.item[isExisting].qty;
    cart.totalqty -= cart.item[isExisting].qty;

    cart.item.splice(isExisting, 1);
    console.log("User in schema:", this);
    return this.save();
  }
};

// Wishlist

userSchema.methods.addToWishlist = function (product) {
  const wishlist = this.wishlist
  const isExisting = wishlist.item.findIndex(objInItems => {
      return new String(objInItems.productId).trim() == new String(product._id).trim()
  })
  if(isExisting >=0){
    wishlist.item.pull({
      productId:product._id,
      qty: 1,
      price:product.price,
  })
  wishlist.totalqty -= 1;

  }else{
      wishlist.item.push({
          productId:product._id,
          qty: 1,
          price:product.price,
      })
      wishlist.totalqty += 1;

      
  }
  return this.save()
}
userSchema.methods.removefromWishlist =async function (productId){
  const wishlist = this.wishlist
  const isExisting = wishlist.item.findIndex(objInItems => new String(objInItems.productId).trim() === new String(productId).trim())
  if(isExisting >= 0){
      const prod = await Product.findById(productId)
      wishlist.totalqty -= wishlist.item[isExisting].qty;
      wishlist.item.splice(isExisting,1)
  

      return this.save()
  }
  
}

module.exports = mongoose.model("user", userSchema);
