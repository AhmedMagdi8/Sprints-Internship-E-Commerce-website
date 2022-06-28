const bcrypt = require("bcrypt");

const  User = require('../models/userModel');

exports.getLogin = (req, res, next) => {
    res.status(200).render("login" , {errorMessage: "" });
}
exports.postLogin = async (req, res, next) => {
    const email = req.body.email;
    const password = req.body.password;
    let user;
    if (email && password) {

    try {
        user = await User.findOne({ where: { email : email }});
     } catch (err) {
         res.status(200).render("login", {
             errorMessage: "Something went wrong",
         });
     }

     if (user) {
        const pepper = process.env.PEPPER;
        const result = await bcrypt.compare(password + pepper, user.password);
        if (result) {
          req.session.user = user;
          return res.redirect("/");
        }
      }
    }
    res.status(200).render("login", {
        errorMessage: "Invalid email or password",
    });
}

exports.getRegister = (req, res, next) => {
    res.status(200).render("register", {errorMessage: ""});
}

exports.postRegister = async (req, res, next) => {
    const fName = req.body.firstName;
    const lName = req.body.lastName;
    const email = req.body.email;
    const password  = req.body.password;
    const confirmPassword = req.body.confirmPassword;
    let isAdmin;
    if(req.body.isAdmin == "on")
        isAdmin = true;
    else 
        isAdmin = false;

        let errorMessage;
    if(fName && lName && email && password && confirmPassword) {

    try {
        const user = await User.findOne({ where: { email : email}});
        if(user) {
            throw new Error("User Already exist!");
        }   

        const pepper  = process.env.PEPPER;
        const salt_rounds = process.env.SALT_ROUNDS;

        const hashedPassword = await bcrypt.hash(password + pepper, Number(salt_rounds));

        const newUser = new User({
            firstName:fName.trim(),
            lastName:lName.trim(),
            email:email.trim(),
            password: hashedPassword,
            isAdmin: isAdmin
        })
        await newUser.save();
        await newUser.createCart();
            
        res.redirect("/login");

    } catch(e) {
        errorMessage = e.message;
        res.status(200).render("register", {
            errorMessage: errorMessage
        });
    }
    } else {
        errorMessage = "Please fill all fields";
        res.status(200).render("register", {
            errorMessage: errorMessage
        });
    }
}

exports.logout = (req, res, next) => {
    req.session.user = null;
    res.redirect("/login");
}

