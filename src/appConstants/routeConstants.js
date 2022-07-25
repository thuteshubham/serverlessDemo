const Api_Endpoints = {
    signin_API:
    {
        SIGN_IN: '/webSignIn',
        RENEW_ACCESS_TOKEN: '/api/renewAccessToken',
        GET_LOGGEDIN_USER_INFO: '/api/user/getLoggedInUserInfo',
        LOG_OUT: '/api/logout'
    },
    dashboard_API:
    {
        GET_ACTIVE_INVENTORY: '/dashboard/getActiveInventory',
        GET_DORMANT_INVENTORY: '/dashboard/getDormantInventory',
        GET_ACTIVE_LOCO_INFO: '/dashboard/getActiveLocoInfo',
        GET_INVENTORY:'/dashboard/inventory'
    },
    planner_API: {
        GET_ACTIVE_TRAINS: '/planner/getActiveTrain',
        GET_UPCOMING_TRAINS: '/planner/getUpcomingTrain',
    },
    imoprtRoute_API: {
        GET_IMPORT_ROUTE: '/planner/getImportRoute',
        GET_ROUTE_INFO: '/planner/getRouteInfo',
        GET_AVAILABLE_INVENTORY: '/planner/getAvailableInventory',
        POST_CREATE_LOCO_CAR_ROUTE: '/planner/postCreateLocoCarRoute'
    },
    dataGeneration_API: {
        POST_DATA_GENERATION: '/dataGeneration/generateActiveLocoDataForSimulation'
    }
}



module.exports = { Api_Endpoints }