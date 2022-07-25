const Appconst = {
    MESSAGE_INVALID_INPUT: "Entered input is invalid",
    MESSAGE_SUCCESS: "The request has been processed successfully.",
    MESSAGE_DATABASE_ERROR: "Error in Database",
    MESSAGE_SYSTEM_ERROR: "Something went wrong, please try again later.",
    MESSAGE_USER_SIGNOUT: "You have signed out, please sign in to proceed further.",
    MESSAGE_RECORD_NOTFOUND: "Record not found.",
    MESSAGE_NO_TOKEN: "UnAuthorized User",
    MESSAGE_NO_ACTIVE_TRAINS: "Currently there are no active trains",
    MESSAGE_NO_UPCOMING_TRAINS: "Currently there are no upcoming trains",
    MESSAGE_UNAUTHORIZED_ERROR: "Unauthorized User",
    NULL_DATA: null,
    MESSAGE_INVENTORIES_NOT_AVAILABLE: "No Inventories availble on this date",

    STATUS_CODE_SUCCESS: 0,
    STATUS_CODE_INPUT_ERROR: 1001,
    STATUS_CODE_DATABASE_ERROR: 1002,
    STATUS_CODE_RECORD_NOTFOUND: 1003,
    STATUS_CODE_SYSTEM_ERROR: 1004,
    STATUS_CODE_NO_TOKEN: 1006,
    STATUS_CODE_MESSAGE_UNAUTHORIZED_ERROR: 1005,
    STATUS_CODE_INVENTORIES_NOT_AVAILABLE: 1007,

    IS_DELETED_NO: 0,
    CURRENT_STATUS_ACTIVE: "Active",
    CURRENT_STATUS_DORMANT: 'Dormant',
    CATEGORY_LOCO: "Loco",
    CATEGORY_RAIL_CAR: "RAILCAR",
    ACTIVE_TRAIN_STATUS_NOT_REACHED: 0,
    ACTIVE_TRAIN_STATUS_REACHED: 1,
    ACTIVE_TRAIN_STATUS_CROSSED: 2,

    DB_JOURNEY_STATUS_NOT_STARTED: 0,
    DB_JOURNEY_STATUS_INPROGRESS: 1,
    DB_JOURNEY_STATUS_COMPLETED: 2,

    TRAIN_STATUS_ONTIME:'On-Time',
    TRAIN_STATUS_DELAY:'Delayed',
    ownership: "BNSF",
    consignees: ["BORAXO", "CONCOR"],
    URL: "http://",
    URLPATH: '/api/'



}

module.exports = Appconst;