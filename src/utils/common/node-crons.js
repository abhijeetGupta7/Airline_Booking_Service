var cron = require('node-cron');
const { BookingService } = require('../../services');

function scheduleCrons() {
    cron.schedule('*/5 * * * * *', async () => {
        const bookingService=new BookingService();
        console.log('Running a task every 5 seconds');
        const response=await bookingService.cancelOldBookings();
        console.log(response);
    });
}

module.exports=scheduleCrons