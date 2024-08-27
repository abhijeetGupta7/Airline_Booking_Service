const { Booking } = require("../models");

class BookingRepository {
    constructor() {
        super(Booking);
    }
}

module.exports=BookingRepository;