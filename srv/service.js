const cds = require('@sap/cds');
module.exports = cds.service.impl(async function () {
    let {
        NfaDetails
    } = this.entities;

    this.before('READ', NfaDetails, async (req) => {

    });
    this.on('getDataForUserAndProject', async (req) => {
        debugger
        // let demo1 = await cds.connect.to('TestApi');
        // let re = await demo1.get('/Products');
        console.log('test case1');
        let NfaAriba = await cds.connect.to("NfaAriba")
        let body = {
            url: "https://openapi.au.cloud.ariba.com/api/sourcing-project-management/v2/prod/projects/WS67381137",
            securityMaterial: "AribaSourcingProject",
            query: "realm=PEOLSOLUTIONSDSAPP-T&user=puser1&passwordAdapter=PasswordAdapter1&apikey=gG0vXlJzZg6UzopL6lRvVjBwQKTbR0WJ"
        };
        console.log(body);
        let res1 = await NfaAriba.post('/', body)
        console.log("aaaaaaaaaaaaaaaaaaaaaaaaa");
        console.log(res1);
        console.log("aaaaaaaaaaaaaaaaaaaaaaaaa");
        let demo = await cds.connect.to('NfaAriba')
        let res = await demo.get('/Products')
        return 'Doc123';
    })

});