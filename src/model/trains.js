let trains=[

    {
      "trainNumber": 12345,
      "station": "Pune shivajina",
      "destination": "Aurangabad",
      "lastStation": "Nagpur",
      "startTime": "29/06/2022 10:00pm",
      "ETA": "30/06/2022 11:00am",
      "TotalDistance": "800 miles",
      "coverdDistance": "300 miles",
      "routes":[
               {
                   "destination":"Pune",
                   "Time":"29/06/2022 10:00 pm",
                   "latLong":"18.5204° N, 73.8567° E"
               },
               {

                   "destination":"Aurangabad",

                   "Time":"30/06/2022 12:30 am",

                    "latLong":"19.8762° N, 75.3433° E"

               },

               {

                   "destination":"Amaravati",

                   "Time":"30/06/2022 08:00 am",

                   "latLong":"20.9320° N, 77.7523° E"

               },

               {

                   "destination":"Wardha",

                   "Time":"30/06/2022 10:00 am",

                   "latLong":"20.7453° N, 78.6022° E"

               },

               {

                   "destination":"Nagpur",

                   "Time":"30/06/2022 11:00 am",

                   "latLong":"21.1458° N, 79.0882° E"

               }

           ]

    },

    {

      "trainNumber": 12125,

      "station": "Mumbai central",

      "destination": "Surat",

      "lastStation": "Delhi",

      "startTime": "20/06/2022 10:00pm",

      "ETA": "21/06/2022 11:00am",

      "TotalDistance": "1250 miles",

      "coverdDistance": "250 miles",

      "routes":[

               {

                   "destination":"Mumbai",

                   "Time":"29/06/2022 08:00 pm",

                   "latLong":"19.0760° N, 72.8777° E"

               },

               {

                   "destination":"Surat",

                   "Time":"29/06/2022 10:00 pm",

                   "latLong":"21.1702° N, 72.8311° E"

               },

               {

                   "destination":"Rajkot",

                   "Time":"30/06/2022 12:30 am",

                    "latLong":"22.3039° N, 70.8022° E"

               },

               {

                   "destination":"Jaipur",

                   "Time":"30/06/2022 08:00 am",

                   "latLong":"26.9124° N, 75.7873° E"

               },

               {

                   "destination":"Delhi",

                   "Time":"30/06/2022 10:00 am",

                   "latLong":"28.7041° N, 77.1025° E"

               }

           ]

    },

    {

      "trainNumber": 12127,

      "station": "Delhi",

      "destination": "Bhopal",

      "lastStation": "Chennai",

      "startTime": "20/06/2022 10:00pm",

      "ETA": "21/06/2022 11:00am",

      "TotalDistance": "2000 miles",

      "coverdDistance": "500 miles",

      routes:[

               {

                   "destination":"Delhi",

                   "Time":"29/06/2022 08:00 pm",

                   "latLong":"28.7041° N, 77.1025° E"

               },

               {

                   "destination":"Agra",

                   "Time":"29/06/2022 10:00 pm",

                   "latLong":"27.1767° N, 78.0081° E"

               },

               {

                   "destination":"Nagpur",

                   "Time":"30/06/2022 04:30 am",

                    "latLong":"21.1458° N, 79.0882° E"

               },

               {

                   "destination":"Chennai",

                   "Time":"30/06/2022 08:00 am",

                   "latLong":"13.0827° N, 80.2707° E"

               }

           ]

    },

    {

      "trainNumber": 12119,

      "station": "Mumbai",

      "destination": "Nashik",

      "lastStation": "Kolkata",

      "startTime": "20/06/2022 10:00pm",

      "ETA": "21/06/2022 11:00am",

      "TotalDistance": "2000 miles",

      "coverdDistance": "150 miles",

      routes:[

               {

                   "destination":"Mumbai",

                   "Time":"29/06/2022 08:00 pm",

                   "latLong":"19.0760° N, 72.8777° E"

               },

               {

                   "destination":"Nashik",

                   "Time":"29/06/2022 10:00 pm",

                   "latLong":"19.9975° N, 73.7898° E"

               },

               {

                   "destination":"Nagpur",

                   "Time":"30/06/2022 04:30 am",

                    "latLong":"21.1458° N, 79.0882° E"

               },

               {

                   "destination":"Kolkata",

                   "Time":"30/06/2022 08:00 am",

                   "latLong":"22.5726° N, 88.3639° E"

               }

           ]

    }

  ];

 

 

 

  module.exports={

      trains

  }