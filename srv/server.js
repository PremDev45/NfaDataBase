const cds = require('@sap/cds');
const express = require('express');
const cors = require('cors');
 
cds.on('bootstrap', (app) => {
    console.log("Inside bootstrap");
 
    const expressApp = express();
    const corsOptions = {
        origin: '*',
        optionsSuccessStatus: 200
    };
       // Middleware for JSON payload limits
    expressApp.use(express.json({ limit: '50mb' }));
    expressApp.use(express.urlencoded({ limit: '50mb', extended: true }));
 
    expressApp.use((req, res, next) => {
        console.log("Inside CORS middleware");
        next();
    });
    expressApp.use(cors(corsOptions));
 
    app.use((req, res, next) => {
        console.log("Inside main app middleware");
        next();
    });
    app.use(expressApp);
});
 
// Export the cds server
module.exports = cds.server; 
