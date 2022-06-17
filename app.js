const path = require('path');
const express = require("express");
require('dotenv').config();
const session = require('express-session');


const sequelize = require("./database");
const Op = require("sequelize").Op;

// routes imports
const authRoutes = require("./routes/authRoutes");
const shopRoutes = require("./routes/shopRoutes");
const adminRoutes = require("./routes/adminRoutes");
const uploadRoutes = require("./routes/uploadRoutes");
const errorController = require('./controllers/error');

const app = express();
app.use(express.urlencoded({extended: false}));
app.use(express.static(path.join(__dirname, "public")));
app.use(session({
    secret: process.env.SESSION_SECRET,
    resave:true, // forces the session to be saved back to the storage even it's modified
    saveUninitialized: false // forces the session to not be saved as initialized when it don't set -- we don't want to save anything
}));

// routes used
app.use("/", authRoutes);
app.use(shopRoutes);
app.use("/user", adminRoutes);
app.use("/uploads", uploadRoutes);


app.set('view engine', 'ejs');
app.set('views', 'views');




// models
const User = require('./models/userModel');
const Product = require('./models/productModel');
const Cart = require('./models/cartModel');
const Order = require('./models/orderModel');
const CartItem = require('./models/cartItemModel');
const OrderItem = require('./models/orderItemModel');

// define table relations

// one to one
User.hasOne(Cart);
Cart.belongsTo(User);
// many to many
Product.belongsToMany(Cart, {through: CartItem});
Cart.belongsToMany(Product, {through: CartItem});
// one to many
User.hasMany(Order);
Order.belongsTo(User);
// many to many
Order.belongsToMany(Product, {through: OrderItem});


app.get("/", async (req, res, next) => {

    try {
        const products = await Product.findAll();
        const payload = {
            pageTitle:'Home',
            userLoggedIn: req.session.user,
            products: products
        }
        res.status(200).render("home", payload);
    } catch(e) {
        console.log(e);
    }
});

app.post("/", async(req, res, next) => {
    try {
        const searchTerm = req.body.searchTerm;
        const searchObj = { where: {
            name: {
              [Op.like]: `%${searchTerm}%`
            }
          }
        }
        const products = await Product.findAll(searchObj);
        const payload = {
            pageTitle:'Home',
            userLoggedIn: req.session.user,
            products: products
        }
        res.status(200).render("home", payload);
    } catch(e) {
        console.log(e);
    }
} )
app.use(errorController.get404);




sequelize
    .sync()
    // .sync({force: true})
    .then(result => {
        app.listen(process.env.PORT, () => console.log("Server is running"));
    }) 
    .catch(e => {
        console.log(e);
    });
