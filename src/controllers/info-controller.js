const { StatusCodes } = require("http-status-codes");

function infoController(req,res) {
    return res.status(StatusCodes.OK).json({
        message: "API is live"
    });
}

module.exports=infoController;