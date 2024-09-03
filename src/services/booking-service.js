const { default: axios } = require("axios");
const db = require("../models");
const { FLIGHT_SEARCH_SERVICE_URL } = require("../config/server-config");
const AppError = require("../utils/errors/app-error");
const { BAD_REQUEST } = require("http-status-codes");

const { BookingRepository } = require("../repositories");

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
}

module.exports=BookingService;