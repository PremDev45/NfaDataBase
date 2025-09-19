const cds = require('@sap/cds');
const { url } = require('node:inspector');
const { Worker, workerData, parentPort, isMainThread } = require('node:worker_threads');

if (isMainThread) {
    module.exports = cds.service.impl(async function () {
        let {
            NfaDetails
        } = this.entities;
        var NfaAriba = await cds.connect.to("NfaAriba")

        ///////////////////////////////////////Ariba URLS////////////////////////////////////////////
        //sourcing project api's Base
        const SourcingProjectBase = {
            securityMaterial: "AribaSourcingProject",
            query: "realm=PEOLSOLUTIONSDSAPP-T&user=puser1&passwordAdapter=PasswordAdapter1&apikey=gG0vXlJzZg6UzopL6lRvVjBwQKTbR0WJ"
        };
        //Docs api's Base
        const DocumentBase = {
            securityMaterial: "AribaEvents",
            query: "realm=PEOLSOLUTIONSDSAPP-T&user=puser1&passwordAdapter=PasswordAdapter1&apikey=RuU300xzEClMIpw8UBalRGERG9LQZcHG"
        };
        //supplier data pagination api's Base
        const SupplierQuestionariesBase = {
            securityMaterial: "SupplierQuestionaries",
            query: "realm=PEOLSOLUTIONSDSAPP-T&user=puser1&passwordAdapter=PasswordAdapter1&apikey=3TTrakeyAxb5iVfcZ9kdN4B9jMyyGxOJ"
        };



        //sourcing project api's
        var SourcingProjecturl = "https://openapi.au.cloud.ariba.com/api/sourcing-project-management/v2/prod/projects/<projectId>"

        //Docs
        var SourcingProjectDocsUrl = "https://openapi.au.cloud.ariba.com/api/sourcing-project-management/v2/prod/projects/<projectId>/documents"

        //teams
        var SourcingProjectTeamsUrl = "https://openapi.au.cloud.ariba.com/api/sourcing-project-management/v2/prod/projects/<projectId>/teams"

        //Docs
        var DocumentUrl = "https://openapi.au.cloud.ariba.com/api/sourcing-event/v2/prod/events/<docId>"
        //scenarios
        var DocumentScenariosUrl = "https://openapi.au.cloud.ariba.com/api/sourcing-event/v2/prod/events/<docId>/scenarios"
        //supplierInvitations
        var DocumentSupplierInvitationsUrl = "https://openapi.au.cloud.ariba.com/api/sourcing-event/v2/prod/events/<docId>/supplierInvitations"
        //items with pages
        var DocumentItemsUrl = "https://openapi.au.cloud.ariba.com/api/sourcing-event/v2/prod/events/<docId>/items/pages/<pageNo>"
        //supplierBids
        var DocumentSupplierBidsUrl = "https://openapi.au.cloud.ariba.com/api/sourcing-event/v2/prod/events/<docId>/supplierBids/<sName>"
        //rounds
        var DocumentRoundsUrl = "https://openapi.au.cloud.ariba.com/api/sourcing-event/v2/prod/events/<docId>/rounds";
        //supplier data pagination api's
        var SupplierQuestionariesUrl = "https://openapi.au.cloud.ariba.com/api/supplierdatapagination/v4/prod//vendors/<vendorId>/workspaces/questionnaires/qna"

        ///////////////////////////////////////Ariba URLS////////////////////////////////////////////

        function returndate(input) {
            let a = input;
            let [y, m, d] = a.split('-');
            let jumbleDate = y + "/" + m + "/" + d
            return jumbleDate
        }
        this.on('getDataForUserAndProject', async (req) => {
            debugger
            /////////////////////////////////////////Variables Declaration////////////////////////////////////////////////

            /////*****************LET*****************/////
            let SourcingProjectDocsBody, SourcingProjectDocsResult, DocId, DocumentUrlBody, DocumentUrlResult, Date1, Date2, DiffTime, DiffDays, NfaDetailsData, WokerThreadsResults,WokerThreadsResults1

            /////*****************LET*****************/////


            /////-----------------VAR-----------------/////
            var ProjectID, TaskID, projCurrency, WebPublishDate, DocumentUrlFinalDate, DocumentUrlCreateDate, VendorID

            //Initialize as Array
            var WorkerPromises = [], DocumentScenariosUrlResult = [], VendorIds = [], Supplier = [], RoundsData = []

            //Initialize as Objects
            var SupplierInvitationsUrlResult = {}

            //Initialize as Empty 
            var SourcingProjectDescription = "", SourcingProjectBaseLinespend = "", DocumentScenariosTotAwardPrice = "", SupplierName = "", VendorID = "", PVCode = "", SmID = "", SupplierData = "",DocumentSupplierBidResult = ""
            /////-----------------VAR-----------------/////

            //Initialize as Numbers
            var DocumentScenariosSupCount = 0, VendorCount = 0, NoOfDocs = 0

            /////////////////////////////////////////Variables Declaration////////////////////////////////////////////////

            var SupplierQuestionariesBody = {
                ...SupplierQuestionariesBase,
                url: SupplierQuestionariesUrl.replace("<vendorId>", "S10753627")
            }

            var result = await NfaAriba.post('/', SupplierQuestionariesBody);
            const createWorker = function (url, securityMaterial, path) {
                return new Promise((resolve) => {
                    const worker = new Worker(__filename, {
                        workerData: { url: url, securityMaterial: securityMaterial, path: path }
                    });
                    worker.on('message', (message) => {
                        resolve(message);
                    });
                });
            };


            try {
                ProjectID = req.data.project;
                SourcingProjectDocsBody = {
                    ...SourcingProjectBase,
                    url: SourcingProjectDocsUrl.replace("<projectId>", ProjectID)
                }
                console.log(SourcingProjectDocsBody)
                SourcingProjectDocsResult = await NfaAriba.post('/', SourcingProjectDocsBody);

                if (SourcingProjectDocsResult.payload[0].type == 'RFx' && SourcingProjectDocsResult.payload[0].status != 'Draft') {
                    DocId = SourcingProjectDocsResult.payload[0].internalId;
                    DocumentUrlBody = {
                        ...DocumentBase,
                        url: DocumentUrl.replace("<docId>", DocId)
                    }
                    DocumentUrlResult = await NfaAriba.post('/', DocumentUrlBody);
                    if (DocumentUrlResult.pendingAwardApprovalTaskId) {
                        TaskID = DocumentUrlResult.pendingAwardApprovalTaskId
                    }
                    else
                        return 'No Data for this Project!'

                    projCurrency = DocumentUrlResult.currency || "";
                    if (DocumentUrlResult.openDate) {
                        const DocumentUrlDateObj = new Date(DocumentUrlResult.openDate);
                        WebPublishDate = DocumentUrlDateObj.toISOString().split('T')[0];
                    }
                    if (DocumentUrlResult.createDate) {
                        const DocumentUrlDateObj = new Date(DocumentUrlResult.createDate);
                        DocumentUrlCreateDate = DocumentUrlDateObj.toISOString().split('T')[0];
                    }
                    if (DocumentUrlCreateDate && WebPublishDate) {
                        Date1 = new Date(DocumentUrlCreateDate);
                        Date2 = new Date(WebPublishDate);
                        DiffTime = Math.abs(Date2 - Date1);
                        DiffDays = Math.ceil(DiffTime / (1000 * 60 * 60 * 24));
                        DocumentUrlFinalDate = DiffDays + " Days"
                    }
                    NoOfDocs = {
                        DocId: DocId,
                        IconType: SourcingProjectDocsResult.payload[0].iconType,
                        Status: SourcingProjectDocsResult.payload[0].status,
                        WebPubDate: DocumentUrlResult.openDate,
                        WebPublishDate: WebPublishDate,
                        CreateDate: DocumentUrlCreateDate,
                        FinalDate: DocumentUrlFinalDate,
                    };

                    NfaDetailsData = await SELECT.from('NfaDetails').where('TaskId =', TaskID);
                    if (NfaDetailsData.length) {
                        return NfaDetailsData[0].NfaNumber;
                    } else {
                        function returnamt(amt) {
                            let formattedamt = parseFloat(amt);
                            formattedamt = formattedamt.toLocaleString('en-IN');;
                            return formattedamt;
                        }
                        WorkerPromises.push(createWorker(SourcingProjecturl.replace('<projectId>', ProjectID), SourcingProjectBase, 'SourcingProjectUrl'))
                        WorkerPromises.push(createWorker(SourcingProjectTeamsUrl.replace('<projectId>', ProjectID), SourcingProjectBase, 'SourcingProjectTeamsUrl'))
                        WorkerPromises.push(createWorker(DocumentScenariosUrl.replace('<docId>', DocId), DocumentBase, 'DocumentScenariosUrl'))
                        WorkerPromises.push(createWorker(DocumentSupplierInvitationsUrl.replace('<docId>', DocId), DocumentBase, 'DocumentSupplierInvitationsUrl'))
                        console.log();
                        WokerThreadsResults = await Promise.all(WorkerPromises);
                        console.log(WokerThreadsResults);
                        WokerThreadsResults.forEach(result => {
                            if (!(result instanceof Error)) {
                                switch (result.path) {
                                    case 'DocumentSupplierInvitationsUrl':
                                        SupplierInvitationsUrlResult = result;
                                        break;
                                    case 'SourcingProjectUrl':
                                        SourcingProjectDescription = result.description || ""
                                        SourcingProjectBaseLinespend = returnamt(result.baselineSpend.amount || "")
                                        break;
                                    case 'DocumentScenariosUrl':
                                        if (result.payload[0].eventId && !(result instanceof Error)) {
                                            DocumentScenariosSupCount = result.payload[0].selectedSuppliersCount || "";
                                            DocumentScenariosUrlResult = result;
                                            DocumentScenariosTotAwardPrice = returnamt(result.payload[0].totalAwardPrice.amount)
                                        }
                                        break;
                                }
                            }
                        })

                        if (SupplierInvitationsUrlResult.payload.length) {
                            SupplierInvitationsUrlResult.payload.forEach(suppl => {
                                VendorCount += 1;
                                Supplier.push({
                                    SupplierName: suppl.invitationId,
                                    SmVendorId: suppl.organization.smVendorID,
                                });
                                VendorIds.push({
                                    DocId: NoOfDocs.DocId,
                                    ErpVendorId: suppl.organization.erpVendorID,
                                    SmVendorId: suppl.organization.smVendorID,
                                    organizationName: suppl.organization.name,
                                    VendorLocation: suppl.organization.address.city + " " + suppl.organization.address.country,
                                    VendorInvitationID: suppl.invitationId
                                });
                            });
                        }
                        else {
                            VendorCount = 0;
                        }
                        WorkerPromises = [];
                        if (Supplier.length) { //getting vendor details
                            for (let k = 0; k < Supplier.length; k++) {
                                SupplierName = Supplier[k].SupplierName;
                                if (VendorIds.length != 0) {
                                    VendorID = VendorIds[k].SmVendorId;
                                    PVCode = VendorIds[k].SmVendorId;
                                    SmID = VendorIds[k].SmVendorId;
                                }
                                else {
                                    VendorID = "";
                                    PVCode = "";
                                }
                                WorkerPromises.push(createWorker(DocumentSupplierBidsUrl.replace('<docId>', DocId).replace('<sName>', SupplierName), DocumentBase, 'DocumentSupplierBidsUrl'))
                                WorkerPromises.push(createWorker(DocumentRoundsUrl.replace('<docId>', DocId), DocumentBase, 'DocumentRoundsUrl'))
                                WorkerPromises.push(createWorker(SupplierQuestionariesUrl.replace('<vendorId>', VendorIds[k].SmVendorId), SupplierQuestionariesBase, 'SupplierQuestionariesUrl'))
                                WokerThreadsResults1 = await Promise.all(WorkerPromises);
                                if(WokerThreadsResults1.length)
                                {
                                      for (let i = 0; i < WokerThreadsResults1.length; i++) {
                                        if (!Array.isArray(WokerThreadsResults1[i].payload) && (!(WokerThreadsResults1[i] instanceof Error))) {
                                            SupplierData = WokerThreadsResults1[i];
                                        }
                                        else if (Array.isArray(WokerThreadsResults1[i].payload) && WokerThreadsResults1[i].path == 'DocumentSupplierBidsUrl' && (!(WokerThreadsResults1[i] instanceof Error))) {
                                            DocumentSupplierBidResult = WokerThreadsResults1[i];
                                        } else if (Array.isArray(WokerThreadsResults1[i].payload) && WokerThreadsResults1[i].path == 'DocumentRoundsUrl' && (!(WokerThreadsResults1[i] instanceof Error))) {
                                            RoundsData = WokerThreadsResults1[i];
                                        }
                                    }
                                }
                            }
                        }
                    }
                }
            }
            catch (e) {

            }
        })

    });
}
else {
    async function work() {
        var ariba = await cds.connect.to('NfaAriba');

        try {
            let body = {
                securityMaterial: workerData.securityMaterial.securityMaterial,
                query: workerData.securityMaterial.query,
                url: workerData.url
            };
            var res = await ariba.post('/', body);
            res.path = workerData.path;
            parentPort.postMessage(res);
        } catch (error) {
            parentPort.postMessage(error);
        }
    }
    work();
}