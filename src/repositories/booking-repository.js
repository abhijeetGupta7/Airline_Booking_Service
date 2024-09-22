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
    
    async get(data,transaction) {
        try {
            const response=await Booking.findByPk(data, {transaction: transaction});
            return response;
        } catch (error) {
            throw error;
        }       
    }

    async update(id,data,transaction) {   // data ->  { col:val, col:val, ..... }  
        const response= await Booking.update(data,
            { 
                where : {
                    id:id
                }
            },
            { transaction : transaction }
        )
        return response;
    }
}

module.exports=BookingRepository;