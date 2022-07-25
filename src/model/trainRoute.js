class TrainRoute {
    constructor(TrainRouteID, RouteName, OriginCity, DestinationCity, OriginSPLC, DestinationSPLC, TotalDuration,TotalDistance) {
        this.Train_Route_ID = TrainRouteID;
        this.Route_Name = RouteName;
        this.Origin_Station = OriginCity;
        this.Destination_Station = DestinationCity;
        this.Origin_SPLC = OriginSPLC;
        this.Destination_SPLC = DestinationSPLC;
        this.Total_Duration = TotalDuration;
        this.Total_Distance = TotalDistance;
    }
}

module.exports = TrainRoute;