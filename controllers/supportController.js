const SupportTicket = require("../models/supportTicketModel");


exports.getSupport = (req, res, next) => {
    res.render("support", {
        pageTitle:"support",
        userLoggedIn: req.session.user
    });
}

exports.postSupport = async (req, res, next) => {
const userId = req.body.userId;
const title = req.body.title;
const description = req.body.description;
const email = req.body.email;

try {
    const ticket = new SupportTicket({
        title: title,
        userId:userId,
        description:description,
        email:email
    });
    await ticket.save();
    res.render("support", {
        pageTitle:"Support",
        userLoggedIn: req.session.user
    });

} catch(e) {
    console.log(e);
    res.sendStatus(500);
}
}

exports.getSupportTickets = async (req, res, next) => {

    try {
        const tickets = await SupportTicket.findAll();
        res.render("support", {
            pageTitle:"Support",
            tickets:tickets,
            userLoggedIn: req.session.user
        });
    
    } catch(e) {
        console.log(e);
        res.sendStatus(500);
    }
  };
