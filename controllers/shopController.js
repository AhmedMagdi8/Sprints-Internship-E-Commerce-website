const path = require("path");
const fs = require("fs");
const Product = require("../models/productModel");
const User = require("../models/userModel");
const Cart = require("../models/cartModel");
const Order = require("../models/orderModel");
const Stripe = require('stripe');
const stripe = Stripe(process.env.STRIPE_SECRET_KEY);

exports.getAddProduct = (req, res, next) => {
  res.status(200).render("addProduct", {
    userLoggedIn: req.session.user,
    pageTitle: "Add Product",
  });
};

exports.postAddProduct = (req, res, next) => {
  const name = req.body.productName;
  const price = req.body.productPrice;
  const description = req.body.productDescription;
  const coupon = req.body.productCoupon;

  try {
    let filePath = `/uploads/${req.file.filename}.png`;
    let tempPath = req.file.path;
    let targetPath = path.join(__dirname, `../${filePath}`);

    // console.log(filePath);
    // console.log(tempPath);
    // console.log(targetPath);


    fs.rename(tempPath, targetPath, async (err) => {
        // name file found in the temp path with the target path
      if (err) {
        console.log(err);
        return res.sendStatus(400);
      } 

      const product = new Product({
        name: name,
        price: price,
        description: description,
        coupon: coupon,
        imageUrl:filePath
      });

      await product.save();

      res.status(200).render("addProduct", {
        userLoggedIn: req.session.user,
        pageTitle: "Add Product",
      });
    });
  } catch (err) {
    res.status(400).send("something went wrong");
  }
};


exports.getCart = async (req, res, next) => {
    let total=0;
    let products_=[];

    try {   
        const cart = await Cart.findOne({ where: { userId: req.session.user.id }});
        const products = await cart.getProducts();
        products_ = products;
        products_.forEach(p => {
            total += p.cartItem.dataValues.quantity  * p.price;
        });
        if(products_.length == 0) {
            return res.render('cart', {
                userLoggedIn:req.session.user,
                pageTitle: 'Cart',
                products: products_,
                total: total,
                sessionId: ""
            })
        } else {
            const session = await stripe.checkout.sessions.create({
                line_items: products.map(p => {
                    return {
                        name: p.name,
                        description: p.description,
                        amount: p.price * 100,
                        currency:'usd',
                        quantity: p.cartItem.dataValues.quantity
                    }
                }),
                payment_method_types: ['card'],
                success_url: req.protocol + '://' + req.get('host') + '/checkout/success',
                cancel_url:  req.protocol + '://' + req.get('host') + '/cart',
            });
            res.render('cart', {
                userLoggedIn:req.session.user,
                pageTitle: 'Cart',
                products: products_,
                total: total,
                sessionId: session.id
            });
        }

    } catch(e) {
        console.log(e);
    }

}

    

  exports.postCart = async (req, res, next) => {
    const prodId = req.body.productId;
    let qty = Number(req.body.numProduct);
    let fetchedCart;

    try {
        const cart = await Cart.findOne({ where: {userId: req.session.user.id}});
        fetchedCart = cart;
        const products =  await cart.getProducts({ where:{id: prodId}});
        let product;
        if(products.length > 0) {
            product = products[0];
            if(product) {
                const oldQuantity = Number(product.cartItem.quantity);
                qty = oldQuantity + qty;
            }

        } else {
            product = await Product.findByPk(prodId);
        }
        await fetchedCart.addProduct(product, { through: { quantity: qty }});
        res.redirect("/cart");
    } catch(e) {
        console.log(e)
    }
};


exports.getProduct = async (req, res, next) => {
    const productId = req.params.productId;

    try {
        const product = await Product.findByPk(productId);
        res.render("product", {
            pageTitle:"Product",
            userLoggedIn: req.session.user,
            product: product
        })

    } catch(e) {
        console.log(e);
        res.sendStatus(500);
    }
}


exports.postOrder = async (req, res, next) => {
    let fetchedCart;
    try {
        const cart = await Cart.findOne({
            where: { userId: req.session.user.id }
        });
    
        fetchedCart = cart;
        const products = await cart.getProducts();
        const user = await User.findByPk(req.session.user.id);
        const order = await user.createOrder();
        await order.addProducts(
            products.map(product => {
                product.orderItem = { quantity: product.cartItem.quantity };
                return product;
            })
        );
        await fetchedCart.setProducts(null);
        res.redirect('/orders')
    } catch(e) {
        console.log(e);
    }

        
  };
  
  exports.getOrders = async (req, res, next) => {

    try {
        if(req.session.user.isAdmin) {
            const orders = await Order.findAll({
                include: ['products', 'user'], 
                order: [ ['createdAt', 'DESC'] ]
            });
    
            res.render('orders', {
                path: '/orders',
                pageTitle: 'Your Orders',
                orders: orders,
                userLoggedIn:req.session.user
                });
        
        } else {
            const user = await User.findByPk(req.session.user.id);
            const orders = await user.getOrders({
                include: ['products', 'user'], 
                order: [ ['createdAt', 'DESC'] ]
            });
            res.render('orders', {
                path: '/orders',
                pageTitle: 'Your Orders',
                orders: orders,
                userLoggedIn:req.session.user
            });
        }
    } catch(e) {
        console.log(e);
    }


  };