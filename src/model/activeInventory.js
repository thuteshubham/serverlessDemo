class ActiveInventory {
    constructor(Category, Type, AssetTag, TrainNumber, station, originSPLC, destinationSPLC, destinationStation, lastLocation, startTime, eTA, totalDistance, coveredDistance) {
        this.Category = Category;
        this.Car_Type = Type;
        this.Train_Number = TrainNumber;
        this.Asset_Tag = AssetTag;
        this.Station = station;
        this.Origin_SPLC = originSPLC;
        this.Destination = destinationStation;
        this.Destination_SPLC = destinationSPLC;
        this.Last_Location = lastLocation;
        this.Start_Time = startTime;
        this.ETA = eTA;
        this.Total_Distance = totalDistance;
        this.Covered_Distance = coveredDistance
    }
}

module.exports = ActiveInventory;