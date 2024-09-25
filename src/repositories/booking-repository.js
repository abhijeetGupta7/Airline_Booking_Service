const CrudRepository = require("./crud-repository");
const { Booking } = require("../models");
const { Op } = require("sequelize");

const { Enums } = require("../utils/common");
const { BOOKED, CANCELLED }=Enums.BOOKING_STATUS;


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

    async cancelOldBookings() {
        const tenMinOldTime= new Date(Date.now() - 10*60*1000);
        const response = await Booking.update(
            { status: CANCELLED } , 
            {
                where: {
                    [Op.and] : [ 
                        {
                            createdAt : {
                                [Op.lt] : tenMinOldTime
                            }
                        },
                        {
                            status : {
                                [Op.notIn] : [BOOKED, CANCELLED]
                            }
                        }
                    ]  
                }
            }
        );
        return response;
    }
}

module.exports=BookingRepository;