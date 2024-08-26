const express=require("express");
const { infoController } = require("../../controllers");

const v1Router=express.Router();

v1Router.get("/info", infoController);

module.exports=v1Router;