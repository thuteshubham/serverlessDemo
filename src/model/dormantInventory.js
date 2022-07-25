class DormantInventory {
    constructor(category, carType, trainNumber, assetTag, status, lastConsignee, consignmentNo, last_route_Taken, lastActive_Date, Latitude, Longitude, currentLocation, estimatedActive_Date) {
        this.Category = category;
        this.Car_Type = carType;
        this.Train_Number = trainNumber;
        this.Asset_Tag = assetTag;
        this.lat = Latitude;
        this.lng = Longitude;
        this.Current_Location = currentLocation;
        this.Status = status;
        this.Last_Consignee = lastConsignee;
        this.ConsignmentNo = consignmentNo;
        this.Last_Route_Taken = last_route_Taken;
        this.Last_Active_Date = lastActive_Date;
        this.Estimated_Active_Date = estimatedActive_Date;
    }
}

module.exports = DormantInventory;