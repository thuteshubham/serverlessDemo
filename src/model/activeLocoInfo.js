class LocoJounrneyInfo {
    constructor(carType, trainNumber, originSPLC, destinationSPLC, lastLocation, station, destination, carcount) {
        this.Car_Type = carType;
        this.Train_Number = trainNumber;
        this.Station = station;
        this.Origin_SPLC = originSPLC;
        this.Destination = destination;
        this.Destination_SPLC = destinationSPLC;
        this.Last_Location = lastLocation;
        this.carCount = carcount;
    }
}

module.exports = LocoJounrneyInfo;