function comapareTime(timeString1,timeString2) {
    return (new Date(timeString1) > new Date(timeString2)) ;
}

module.exports = {
    comapareTime
}