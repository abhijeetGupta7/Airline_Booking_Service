const CrudRepository = require("./crud-repository");
const { Booking } = require("../models");

class BookingRepository extends CrudRepository {
    constructor() {
        super();
    }

    async createBooking(bookingPayload,transaction) {
        try {
            const response=await Booking.create(bookingPayload, {transaction: transaction});
            return response;
        } catch (error) {
            throw error;
        }
    }    
}

module.exports=BookingRepository;