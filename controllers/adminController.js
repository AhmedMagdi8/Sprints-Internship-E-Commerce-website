const User = require("../models/userModel");

exports.getProfile = (req, res, next) => {
  res.status(200).render("profile", {
    userLoggedIn: req.session.user,
    pageTitle: "Profile",
  });
};


exports.getUserProfile = async (req, res, next) => {
    const userId = req.query.userId;
    const user = await User.findOne(userId);
    res.status(200).render("userProfile", {
      userLoggedIn: req.session.user,
      user: user.dataValues,
      pageTitle: "User Profile",
    });
  };


exports.postProfile = async (req, res, next) => {
    const firstName = req.body.firstName;
    const lastName = req.body.lastName;
    const address = req.body.address;
    const phoneNumber = req.body.phoneNumber;
    const newPassword = req.body.password;


    let hashedPassword;
    if (newPassword) {
        const pepper  = process.env.PEPPER;
        const salt_rounds = process.env.SALT_ROUNDS;
        hashedPassword = await bcrypt.hash(newPassword + pepper, Number(salt_rounds));
    }
    const user = await User.findByPk(req.session.user.id);
    user.firstName = firstName;
    user.lastName =  lastName;
    user.address = address;
    user.phoneNumber = phoneNumber;
    if(newPassword)
        user.password = hashedPassword;
     
    req.session.user = await user.save();

    res.status(200).render("profile", {
      userLoggedIn: req.session.user,
      pageTitle: "Profile",
    });
  };
  

