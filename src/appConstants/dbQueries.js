
const dbQuery = {
    //Qurey for signIN controller 
    GET_USER_INFO_QUERY: (email) => `select * From dbo.Users Where Email='${email}'`,

    // Quries to Get Active Inventory in Dashboard controller
    GET_ACTIVE_INVENTORIES_LIST_QUERY: (category, current_status_active, is_deleted_no) => `select InventoryID,AssetTag,Category,Type,CurrentStatus,IsDeleted From dbo.Inventory Where Category='${category}' And CurrentStatus='${current_status_active}' And IsDeleted=${is_deleted_no}`,

    // Quries to Get Dormant Inventory in Dashboard controller
    GET_DORMANT_INVENTORIES_LIST_QUERY: (current_status_dormant, is_deleted_no) => `select * From dbo.Inventory Where  CurrentStatus='${current_status_dormant}' And IsDeleted=${is_deleted_no}`,
    
    // Quries to Get Active loco in Dashboard controller
    GET_ACTIVE_LOCO_INVENTORY_QUERY: (locoAssetTag, is_deleted_no) => `select * From dbo.Inventory Where AssetTag='${locoAssetTag}' And IsDeleted=${is_deleted_no}`,
    GET_ACTIVE_LOCO_ASSETTAG_LASTREC_QUERY: (locoAssetTag, journeyid) => `select * From dbo.AssetTagData Where AssetTag='${locoAssetTag}' And JourneyID=${journeyid}`,
    GET_ACTIVE_LOCO_LASTJOURNEY_CARSINFO_QUERY: (journeyid, is_deleted_no) => `select * From dbo.LocoCarRouteMapping Where JourneyID=${journeyid} And IsDeleted=${is_deleted_no}`,
    GET_ACTIVE_CARJOURNEY_INVENTORY_INFO_QUERY: (inventoryid) => `select * From dbo.Inventory Where InventoryID=${inventoryid}`,

    // Queries for Dasshboard controller
    GET_LASTLOCATION_SPLC_INFO_QUERY: (splc, is_deleted_no) => `select * From dbo.RouteInfo Where SPLC=${splc} And IsDeleted=${is_deleted_no}`,
    GET_ACTIVE_ASSETTAG_DATA_LIST_QUERY: (assettag, journeyid) => `select * From dbo.AssetTagData Where AssetTag='${assettag}' And JourneyID=${journeyid}`,
    GET_ACTIVE_ROUTE_INFO_LIST_QUERY: (route, is_deleted_no) => `select * From dbo.RouteInfo Where Route='${route}' And IsDeleted=${is_deleted_no}`,
    GET_TRAIN_ROUTE_INFO_QUERY: (trainrouteid, is_deleted_no) => `select * From dbo.TrainRoute Where TrainRouteID=${trainrouteid} And IsDeleted=${is_deleted_no}`,
    GET_LASTINFO_QUERY: (inventoryid, is_deleted_no) => `select  JourneyID,InventoryID,TrainRouteID,OriginSPLC,DestinationSPLC From dbo.LocoCarRouteMapping Where InventoryID=${inventoryid} And IsDeleted=${is_deleted_no} `,
    GET_ORIGIN_INFO_QUERY: (originsplc, is_deleted_no) => `select * From dbo.RouteInfo Where SPLC=${originsplc} And IsDeleted=${is_deleted_no}`,
    GET_DESTINATION_INFO_QUERY: (destinationsplc, is_deleted_no) => `select * From dbo.RouteInfo Where SPLC=${destinationsplc} And IsDeleted=${is_deleted_no}`,
    GET_ASSET_TAG_DATA_QUERY: (assettag) => `select * From dbo.AssetTagData Where  AssetTag='${assettag}'`,

    //Queries for Import route controller
    GET_ROUTES: (is_deleted_no) => `select * from dbo.TrainRoute where IsDeleted=${is_deleted_no}`,
    GET_ROUTE_INFO: (routeName, is_deleted_no) => `select * from dbo.RouteInfo where Route='${routeName}' And IsDeleted=${is_deleted_no}`,

    //Queries for Datageneration for Active locos
    GET_LAST_JOURNEY: () => `select *from dbo.LocoCarRouteMapping ORDER BY JourneyID DESC `,
    LOCO_CAR_ROUTE_MAPPINGS_INSERT_QUERY: (journeyid, inventoryid, trainrouteid, originsplc, destinationsplc, consignee, consignmentNo, journeystatus, is_deleted_no,journeyStartDate,journeyEndDate) =>
    `Insert into dbo.LocoCarRouteMapping (JourneyID,InventoryID,TrainRouteID,OriginSPLC,DestinationSPLC,Consignee,ConsignmentNo,JourneyStatus,IsDeleted,JourneyStartDate,JourneyEndDate) VALUES(${journeyid},${inventoryid},${trainrouteid},${originsplc},${destinationsplc},'${consignee}','${consignmentNo}',${journeystatus},${is_deleted_no},'${journeyStartDate}','${journeyEndDate}')`,
    GET_ACTIVE_INVENTORY_JOINS:(category, current_status_active, is_deleted_no) => `SELECT dbo.Inventory.InventoryID,dbo.Inventory.AssetTag,dbo.Inventory.Category,dbo.Inventory.Type,dbo.Inventory.CurrentStatus,dbo.Inventory.IsDeleted,
    dbo.LocoCarRouteMapping.JourneyID,dbo.LocoCarRouteMapping.TrainRouteID,dbo.LocoCarRouteMapping.OriginSPLC,dbo.LocoCarRouteMapping.DestinationSPLC
    FROM dbo.Inventory
    LEFT JOIN dbo.LocoCarRouteMapping
    ON dbo.Inventory.InventoryID = dbo.LocoCarRouteMapping.InventoryID 
    where dbo.Inventory.Category=${category} and dbo.Inventory.CurrentStatus=${current_status_active} and dbo.Inventory.IsDeleted=${is_deleted_no} and  dbo.LocoCarRouteMapping.IsDeleted=${is_deleted_no}`,
    GET_LAST_JOURNEY1:() => `select TOP 1 * from dbo.LocoCarRouteMapping ORDER BY JourneyID DESC` 
}


module.exports = { dbQuery }
