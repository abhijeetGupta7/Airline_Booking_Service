const { StatusCodes } = require("http-status-codes");
const { BookingService } = require("../services/");
const { SuccessResponse, ErrorResponse } = require("../utils/common");

const bookingService=new BookingService();

const inMemoryCache={};

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

async function makePayment(req,res) {
    try {
        const idempotencyKey=req.headers['x-idempotencykey'];
        if(!idempotencyKey) {
            console.log(idempotencyKey);
            ErrorResponse.message="Something went wrong while making payment";
            ErrorResponse.error={ details: "Idempotency key not found" };
            return res.status(StatusCodes.BAD_REQUEST).json(ErrorResponse);        
        }
        if(inMemoryCache[idempotencyKey]) {
            ErrorResponse.message="Something went wrong while making payment";
            ErrorResponse.error={ details: "Payment aready done" };
            return res.status(StatusCodes.BAD_REQUEST).json(ErrorResponse);        
        }
          
        const response= await bookingService.makePayment({
            bookingId:req.body.bookingId,
            totalCost:req.body.totalCost,
            userId:req.body.userId
        });
        SuccessResponse.message="Successfully Booked the Booking";   
        SuccessResponse.data=response;
        
        inMemoryCache[idempotencyKey]=idempotencyKey;
        
        return res.status(StatusCodes.CREATED).json(SuccessResponse);        
    } catch (error) {
        ErrorResponse.message="Something went wrong while making Payment";
        ErrorResponse.error=error;
        
        return res.status(error.statusCode || StatusCodes.INTERNAL_SERVER_ERROR).json(ErrorResponse);        
    }
}




module.exports={
    createBooking,
    makePayment
}
