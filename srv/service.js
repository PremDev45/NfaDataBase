const cds = require('@sap/cds');
    module.exports = cds.service.impl(async function () {
        let {
           NfaDetails
        } = this.entities;
    
        this.before('READ',NfaDetails,async (req)=>{
       
        });
    
    });