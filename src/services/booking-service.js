const { default: axios } = require("axios");
const db = require("../models");
const { FLIGHT_SEARCH_SERVICE_URL } = require("../config/server-config");
const AppError = require("../utils/errors/app-error");
const { BAD_REQUEST } = require("http-status-codes");

const { BookingRepository } = require("../repositories");

const { Enums } = require("../utils/common");
const { BOOKED, CANCELLED }=Enums.BOOKING_STATUS;


class BookingService {
    #bookingRepository;
    constructor() {
        this.#bookingRepository=new BookingRepository();
    }

    async createBooking(data) {
        const transaction=await db.sequelize.transaction();
        try {

            console.log(data);
            const flight=await axios.get(`${FLIGHT_SEARCH_SERVICE_URL}/api/v1/flights/${data.flightId}`);            
            const flightData=flight.data.data;
            if(data.noOfSeats > flightData.totalSeats) {
                throw new AppError("Required number of seats not available", BAD_REQUEST);
            }

            const totalBillingAmount=data.noOfSeats*flightData.price;
            const bookingPayload={...data, totalCost:totalBillingAmount };
            const booking=await this.#bookingRepository.createBooking(bookingPayload,transaction);
            
            await axios.patch(`${FLIGHT_SEARCH_SERVICE_URL}/api/v1/flights/${data.flightId}/seats/`,{ seats:data.noOfSeats });

        await transaction.commit();
        return booking;
        } catch (error) {
            await transaction.rollback();
            throw error;
        }
    }

    async makePayment(data) {   // just dummy payment, not actual Payment Gateway implemented
        const transaction = await db.sequelize.transaction();
        try {
            // if booking is already cancelled
            const bookingDetails = await this.#bookingRepository.get(data.bookingId,transaction);
            if(bookingDetails.status==CANCELLED) {
                throw new AppError("The booking has been expired");
            }
            
            // if booking time expired
            const bookingTime = new Date(bookingDetails.createdAt);
            const currentTime = new Date();
            if(currentTime-bookingTime > 600000) { // timer for 10 mintues (in milliseconds)
                await this.#bookingRepository.update(data.bookingId, {
                    status: CANCELLED 
                }, transaction)
                throw new AppError("The booking has been expired");
            }
            
            if(data.userId!=bookingDetails.userId) {
                throw new AppError("UserId not matched", BAD_REQUEST);
            }
            if(data.totalCost!=bookingDetails.totalCost) {
                throw new AppError("Amount does not match the required amount", BAD_REQUEST);
            }

            // We assume here that payment is successfull (it's beacuse, here we are not actually integrating a payment gateway, so it's kind of a sample/simple dummy)
            // After payment is successfull, Update the status of Booking to BOOKED
            return await this.#bookingRepository.update(data.bookingId, {
                status: BOOKED 
            }, transaction)
            await transaction.commit();
            return response;
        } catch (error) {
            await transaction.rollback();
            throw error;
        }
    }
}

module.exports=BookingService;

// Once payment has been done, then repayment option will not be there, bcz even after success of booking,
// when one again tries tp do payment after sometime, it accepts, and then due to time limit, it cancells the booking. kuch bhi mtlb ho rha, so we ahve to handle it