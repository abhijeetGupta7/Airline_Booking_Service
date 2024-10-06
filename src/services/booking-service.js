const { default: axios } = require("axios");
const db = require("../models");
const { FLIGHT_SEARCH_SERVICE_URL } = require("../config/server-config");
const AppError = require("../utils/errors/app-error");
const { BAD_REQUEST } = require("http-status-codes");

const { BookingRepository } = require("../repositories");

const { Enums } = require("../utils/common");
const { sendMessage } = require("../config/queue-config");
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
                await this.cancelBooking(data.bookingId);
                throw new AppError("The Booking Time has been expired");
            }
            
            if(data.userId!=bookingDetails.userId) {
                throw new AppError("UserId not matched", BAD_REQUEST);
            }
            if(data.totalCost!=bookingDetails.totalCost) {
                throw new AppError("Amount does not match the required amount", BAD_REQUEST);
            }

            // We assume here that payment is successfull (it's beacuse, here we are not actually integrating a payment gateway, so it's kind of a sample/simple dummy)
            // After payment is successfull, Update the status of Booking to BOOKED
            await this.#bookingRepository.update(data.bookingId, {
                status: BOOKED 
            }, transaction)
            await transaction.commit();
            
            // TODO: Refactor and send Proper Details
            const flightId=bookingDetails.flightId;
            const userId=bookingDetails.userId;
            const userDetailsResponse=await axios.get(`http://localhost:3001/api/v1/user/${userId}/`);
            const userDetails=userDetailsResponse.data.data;
            bookingDetails.status=BOOKED;
            sendMessage('noti-queue',{
                Subject: "Booking and Payment Done Successfully",
                recipientEmail:userDetails.email,
                body: bookingDetails
            });

            return true;
        } catch (error) {
            await transaction.rollback();
            console.log(error);
            throw error;
        }
    }

    async cancelBooking(bookingId) {
        const transaction = await db.sequelize.transaction();
        try {
            const bookingDetails = await this.#bookingRepository.get(bookingId,transaction);
            if(bookingDetails.status==CANCELLED) {
                await transaction.commit();
                return true;
            }
            
            // increate the seats as booking has been cancelled
            await axios.patch(`${FLIGHT_SEARCH_SERVICE_URL}/api/v1/flights/${bookingDetails.flightId}/seats/`,{ seats:bookingDetails.noOfSeats, dec:'false' });
    
            // status updation to CANCELLED
            await this.#bookingRepository.update(bookingId, {
                status: CANCELLED 
            }, transaction)

            await transaction.commit();
        } catch (error) {
            await transaction.rollback();
            throw error;
        }
    }

    async cancelOldBookings() {
        try {
            const response=await this.#bookingRepository.cancelOldBookings();
            return response;
        } catch (error) {
            throw error;
        }
    }
}

module.exports=BookingService;

// Once payment has been done, then repayment option will not be there, bcz even after success of booking,
// when one again tries to do payment after sometime, it accepts, and then due to time limit, it cancells the booking. kuch bhi mtlb ho rha, so we have to handle it
// We have addressed the issue by checking whether the seat status is already SUCCESS or not, if yes then we don't cancel the booking
