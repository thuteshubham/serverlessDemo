const sql=require('mssql');
const config = {
    user: "admin",
    password: "Durga12345",
    server: "database-1.cxsg0qwb5pds.us-west-2.rds.amazonaws.com",
    database: "Railcar2",
    pool: {
        idleTimeoutMillis: 60000
    },
    requestTimeout: 60000,
    options: {
        trustedconnection: true,
        enableArithAbort: true,
        instancename: 'SQLEXPRESS',
        encrypt: false // make false for local & make true for server database
    },
    port: 1433
}


const dbConnection = new sql.ConnectionPool(config)
    .connect()
    .then(pool => {
        console.log('Connected to MSSQL')

        return pool
    })
    .catch(err => console.log('Database Connection Failed! Bad Config: ', err))


module.exports={
    dbConnection 
}