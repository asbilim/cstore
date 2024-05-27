import { productCategory } from "../datas/product";
const mongoose = require("mongoose");
const bcrypt = require("bcrypt");
const uploadToR2 = require("saveFile");

const UserSchema = new mongoose.Schema(
  {
    username: {
      type: String,
      required: true,
      unique: true,
    },
    email: {
      type: String,
      required: true,
      unique: true,
    },
    password: {
      type: String,
      required: true,
    },
    role: {
      type: String,
      required: true,
      default: "client",
      enum: ["admin", "client"],
    },
  },
  { timestamps: true }
);

UserSchema.pre("save", async function (next) {
  if (!this.isModified("password")) {
    return next();
  }
  const salt = await bcrypt.genSalt(10);
  this.password = await bcrypt.hash(this.password, salt);
  next();
});

UserSchema.methods.matchPassword = async function (enteredPassword) {
  return await bcrypt.compare(enteredPassword, this.password);
};

const CartItemSchema = new mongoose.Schema(
  {
    product: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Product",
      required: true,
    },
    quantity: {
      type: Number,
      required: true,
    },
  },
  { timestamps: true }
);

const CartSchema = new mongoose.Schema(
  {
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    items: [CartItemSchema],
    total: {
      type: Number,
      required: true,
    },
  },
  { timestamps: true }
);

CartSchema.pre("save", async function (next) {
  const total = this.items.reduce((acc, item) => {
    return acc + item.product.price * item.quantity;
  }, 0);
  this.total = total;
  next();
});

CartSchema.methods.addItem = async function (productId, quantity) {
  const existingItem = this.items.find(
    (item) => item.product.toString() === productId.toString()
  );
  if (existingItem) {
    existingItem.quantity += quantity;
  } else {
    this.items.push({ product: productId, quantity });
  }
  await this.save();
};

CartSchema.methods.removeItem = async function (productId) {
  this.items = this.items.filter(
    (item) => item.product.toString() !== productId.toString()
  );
  await this.save();
};

ProductSchema.pre("save", async function (next) {
  if (this.isModified("imageUrl")) {
    try {
      const imageUrl = await uploadToR2(this.imageUrl);
      this.imageUrl = imageUrl;
    } catch (error) {
      return next(error);
    }
  }
  next();
});

const ProductSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: true,
      unique: true,
    },
    quantity: {
      type: Number,
      required: true,
    },
    imageUrl: {
      type: String,
      required: true,
    },
    category: {
      type: String,
      required: true,
      default: "new",
      enum: productCategory,
    },
  },
  { timestamps: true }
);

ProductSchema.methods.updateQuantity = async function (newQuantity) {
  this.quantity = newQuantity;
  await this.save();
};

module.exports = {
  User: mongoose.model("User", UserSchema),
  Cart: mongoose.model("Cart", CartSchema),
  Product: mongoose.model("Product", ProductSchema),
};
