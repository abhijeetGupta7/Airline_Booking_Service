const { StatusCodes } = require("http-status-codes");
const { BookingService } = require("../services/");
const { SuccessResponse, ErrorResponse } = require("../utils/common");

const bookingService=new BookingService();

async function createBooking(req,res) {
    try {
        const response= await bookingService.createBooking({
            flightId:req.body.flightId,
            noOfSeats:req.body.noOfSeats,
            userId:req.body.userId
        });
        SuccessResponse.message="Successfully created the Booking";   
        SuccessResponse.data=response;
        
        return res.status(StatusCodes.CREATED).json(SuccessResponse);        
    } catch (error) {
        ErrorResponse.message="Something went wrong while creating Booking";
        ErrorResponse.error=error;
        
        return res.status(error.statusCode || StatusCodes.INTERNAL_SERVER_ERROR).json(ErrorResponse);        
    }
}


module.exports={
    createBooking
}
