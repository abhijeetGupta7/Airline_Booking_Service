const express=require("express");
const { infoController } = require("../../controllers");
const bookingRouter = require("./booking-routes");

const v1Router=express.Router();

v1Router.get("/info", infoController);
v1Router.use("/bookings",bookingRouter);


module.exports=v1Router;