const express=require("express");
const { bookingController } = require("../../controllers");

const bookingRouter=express.Router();

bookingRouter.post("/",bookingController.createBooking);

module.exports=bookingRouter;