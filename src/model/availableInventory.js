class AvailableInventory {
    constructor(inventoryID, type, category, assetTag, currentStatus, currentLocation, lastConsignee, ownership,destination,destinationSplc) {
        this.Inventory_ID = inventoryID
        this.Cars_Type = type;
        this.Category = category;
        this.Asset_Tag = assetTag;
        this.Current_Location = currentLocation;
        this.Last_Consignee = lastConsignee;
        this.Current_Status = currentStatus;
        this.Ownership = ownership;
        this.Destination=destination;
        this.DestinationSplc=destinationSplc;

    }
}

module.exports = AvailableInventory;