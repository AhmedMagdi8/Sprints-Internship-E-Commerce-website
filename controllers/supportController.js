const SupportTicket = require("../models/supportTicketModel");


exports.getSupport = (req, res, next) => {
    res.render("support", {
        pageTitle:"support",
        userLoggedIn: req.session.user
    });
}

exports.postSupport = async (req, res, next) => {
const title = req.body.title;
const description = req.body.msg;
const email = req.body.email;

try {
    const ticket = new SupportTicket({
        title: title,
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
        res.render("tickets", {
            pageTitle:"Support",
            tickets:tickets,
            userLoggedIn: req.session.user
        });
    
    } catch(e) {
        console.log(e);
        res.sendStatus(500);
    }
  };
