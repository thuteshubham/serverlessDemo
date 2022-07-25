class RouteInfo {
    constructor(routeInfoID, routeName, stationName, SPLC, distanceCovered, timeTaken, location) {
        this.RouteInfo_ID = routeInfoID;
        this.Route_Name = routeName
        this.Station_Name = stationName;
        this.Station_SPLC = SPLC;
        this.Location_lat_long = location;
        this.Distance_Covered = distanceCovered;
        this.Time_Taken = timeTaken;
    }
}

module.exports = RouteInfo;