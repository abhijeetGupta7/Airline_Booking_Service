const express=require("express");
const { bookingController } = require("../../controllers");

const bookingRouter=express.Router();

bookingRouter.post("/",bookingController.createBooking);

bookingRouter.post("/payments",bookingController.makePayment);

module.exports=bookingRouter;