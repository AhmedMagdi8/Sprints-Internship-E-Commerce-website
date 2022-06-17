const path = require("path");
const fs = require("fs");
const Product = require("../models/productModel");
const User = require("../models/userModel");
const Cart = require("../models/cartModel");
const Order = require("../models/orderModel");

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
        // name file found in the temppath with the targetpath
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



exports.getCart = (req, res, next) => {
    console.log(req.session.user);
    Cart.findOne({
        where: { userId: req.session.user.id }
    })
    .then((cart) =>{
        return cart.getProducts()
        .then(products => {
            console.log(products[0]);
            res.render('cart', {
                userLoggedIn:req.session.user,
                path: '/cart',
                pageTitle: 'Cart',
                products: products
            });
        })
        .catch((error) => console.log(error));
    }).catch(err => console.log(err));

    // res.status(200).render("cart", {
    //   userLoggedIn: req.session.user,
    //   pageTitle: "Cart",
    // });
  };


  exports.postCart = (req, res, next) => {
    const prodId = req.body.productId;
    let qty = req.body.numProduct;
    let fetchedCart;

    Cart.findOne({ where: {userId: req.session.user.id}})
    .then(cart => {
        fetchedCart = cart;
        return cart.getProducts({ where:{id: prodId}});
    })
    .then(products => {
        let product;
        if(products.length > 0) {
            product = products[0];
        }
        if(product) {
            const oldQuantity = product.cartItem.quantity;
            qty = oldQuantity + qty;
            return product;
        }
        return Product.findByPk(prodId);
    })
    .then(product => {
        return fetchedCart.addProduct(product,
            { through : { quantity: qty}
        });
    })
    .then(() => {
        res.redirect('/cart')
    })
    .catch(err => console.log(err));
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


exports.postOrders = (req, res, next) => {
    let fetchedCart;
    Cart.findOne({
        where: { userId: req.session.user.id }
    })
      .then(cart => {
        fetchedCart = cart;
        return cart.getProducts();
      })
      .then(products => {
        User.findByPk(req.session.user.id)
        .then(user => {
            return user.createOrder()
        })

          .then(order => {
            return order.addProducts(
              products.map(product => {
                product.orderItem = { quantity: product.cartItem.quantity };
                return product;
              })
            );
          })
          .catch(err => console.log(err));
      })
      .then(result => {
        return fetchedCart.setProducts(null);
      })
      .then(result => {
        res.redirect('/orders');
      })
      .catch(err => {
        console.log(err);
        res.send(err);
        
      });
  };
  
  exports.getOrders = (req, res, next) => {
    if(req.session.user.isAdmin) {
        Order.findAll({include: ['products', 'user']})
        .then(orders => {
            res.render('orders', {
                path: '/orders',
                pageTitle: 'Your Orders',
                orders: orders,
                userLoggedIn:req.session.user
              });
        })
    } else {
        User.findByPk(req.session.user.id)
        .then(user => {
            return user.getOrders({include: ['products']})
        })
        // Order.findAll({ where : {userId: req.session.user.id}},{include: ['products']})
          .then(orders => {
            // console.log(orders[0].products[0]);
            res.render('orders', {
              path: '/orders',
              pageTitle: 'Your Orders',
              orders: orders,
              userLoggedIn:req.session.user
            });
          })
          .catch(err => console.log(err));
    }

  };