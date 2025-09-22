const cds = require('@sap/cds');
const { url } = require('node:inspector');
const { Worker, workerData, parentPort, isMainThread } = require('node:worker_threads');
// projectId = #WS79052482 ///// new one = #WS84836442
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
            let SourcingProjectDocsBody, SourcingProjectDocsResult, DocId, DocumentUrlBody, DocumentUrlResult, Date1, Date2, DiffTime, DiffDays, NfaDetailsData, WokerThreadsResults, WokerThreadsResults1, InsertNfaDetailsBody, ExistingNfaRecord, InsertQueryForNfaDetails;

            /////*****************LET*****************/////


            /////-----------------VAR-----------------/////
            var ProjectID, TaskID, projCurrency, WebPublishDate, DocumentUrlFinalDate, DocumentUrlCreateDate, VendorID;

            //Initialize as Array
            var WorkerPromises = [], DocumentScenariosUrlResult = [], VendorIds = [], Supplier = [], RoundsData = [], SupplierDetails = [],
                VendorNames = [], DocSupplierBidItems = [], PaymentDetails = [], SupplierCount1 = [], SupplierCountValue = [];

            //Initialize as Objects
            var SupplierInvitationsUrlResult = {}, SupplierCount = {};

            //Initialize as Empty 
            var SourcingProjectDescription = "", SourcingProjectBaseLinespend = "", DocumentScenariosTotAwardPrice = "", SupplierName = "", VendorID = "", PVCode = "", SmID = "", SupplierData = "", DocumentSupplierBidResult = "", GstNo = "", CEScore = "", SupplierAdress = "", SupplierStreetName = "", SupplierRegion = "", SupplierPostalCode = "", SupplierCity = "", SupplierHouseID = "", SupplierCountry = "",
                SupplierContactPhone = "", SupplierMobilePhone = "", SupplierMail = "", SupplierLastName = "", SupplierFirstName = "", SupplierContact = "", SubmissionDate = "", DocSupBidInvitationID = "", PayDate = "", AmendmentValue = "", SupplierValueAmount = "", SupplierValueCurrency = "",
                ExistingPoNumberValue = "", TotalNFAAmount = "", TotalNFAAmountCurrency = "", ContractPeriodValue = "", BudgetValue = "", OrderTypePartiesValue = "", FormattedTotalNFAAmount = "", FormattedSupplierValueAmount = "", RationalValue = "",
                VendorsTurnOverAmount = "", VendorsTurnOverCurrency, FormattedVendorsTurnOverAmount = "", VendorsSpendAmount = "", VendorsSpendCurrency = "", FormattedVendorsSpendAmount = "", RationalToDependentPartnerValue = "", NewInitiativeBestPracticesValue = "", NegotiationCommitteValue = "", InternalSLAsKPIsValue = "",
                ContractBasicValue = "", ImportSupplyProposal = "", FTAEPCGValue = "", MonthlyQuantityValue = "", PostFactoNfaReasonValue = "", BusinessPlanPricingValue = "",
                CLPPLastPurchaseAmount = "", CLPPLastPurchaseCurrency = "", FormattedCLPPLastPurchaseAmount = "", PriceJustificationValue = "", CardinalRulesValue = "", DeviationListValue = "", TermsOfPaymentValue = "", PackagingForwardingValue = "", LogisticsAmount = "", LogisticsCurrency = "", FormattedLogisticsAmount = "", InsuranceValue = "",
                PenaltyQualityValue = "", PenaltyCriteriaValue = "", DeliveryLeadTimeValue = "", LiquidatedDamagesValue = "", LiquidatedDamagesClValue = "", PBGAndSDValue = "", PBGAndSDClValue = "", PenaltyForSafetySubcontractValue = "", OtherKeyTermsValue = "", RationaleL1Value = "", PricesValue = "",
                VendorName= "", VendorAddress="",VendorInvitationId="",VendorUserId=""
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
                console.log("SourcingProjectDocsBody", SourcingProjectDocsBody)
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
                        console.log('RETURNING NFA NUMBER');
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
                        console.log("WokerThreadsResults", WokerThreadsResults);
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
                                if (WokerThreadsResults1.length) {
                                    for (let i = 0; i < WokerThreadsResults1.length; i++) {
                                        //For .path == 'SupplierQuestionariesUrl'
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
                                if (SupplierData) {
                                    if ('_embedded' in SupplierData && 'questionAnswerList' in SupplierData._embedded) {
                                        for (let h = 0; h < SupplierData._embedded.questionAnswerList.length; h++) {
                                            if ('questionAnswer' in SupplierData._embedded.questionAnswerList[h] && 'questionLabel' in SupplierData._embedded.questionAnswerList[h].questionAnswer) {
                                                if (SupplierData._embedded.questionAnswerList[h].questionAnswer.questionLabel == " Enter your GSTIN Number") {
                                                    GstNo = SupplierData._embedded.questionAnswerList[h].questionAnswer.answer;
                                                }
                                                if (SupplierData._embedded.questionAnswerList[h].questionAnswer.questionLabel == "(Technical) CE Eligibility Yes") {
                                                    CEScore = SupplierData._embedded.questionAnswerList[h].questionAnswer.answer;
                                                }
                                                if (SupplierData._embedded.questionAnswerList[h].questionAnswer.questionLabel == "Supplier Main Address") {
                                                    SupplierAdress = SupplierData._embedded.questionAnswerList[h].questionAnswer.answer;
                                                    const parsedData = JSON.parse(SupplierAdress);
                                                    if ("streetName" in parsedData.default) {
                                                        SupplierStreetName = parsedData.default.streetName || '';
                                                    }
                                                    if ("houseID" in parsedData.default) {
                                                        SupplierHouseID = parsedData.default.houseID || '';
                                                    }
                                                    if ("cityName" in parsedData.default) {
                                                        SupplierCity = parsedData.default.cityName || '';
                                                    }
                                                    if ("streetPostalCode" in parsedData.default) {
                                                        SupplierPostalCode = parsedData.default.streetPostalCode || '';
                                                    }
                                                    if ("regionCode" in parsedData.default) {
                                                        if ("Name" in parsedData.default.regionCode) {
                                                            SupplierRegion = parsedData.default.regionCode.Name || '';
                                                        }
                                                    }
                                                    if ("countryCode" in parsedData.default) {
                                                        if ("Name" in parsedData.default.countryCode) {
                                                            SupplierCountry = parsedData.default.countryCode.Name || '';
                                                        }
                                                    }
                                                    var formattedAddress = `${SupplierStreetName}, ${SupplierHouseID}, ${SupplierCity}, ${SupplierPostalCode}, ${SupplierCountry}`;
                                                    let resultArray = formattedAddress.split(',').map(item => item.trim()).filter(Boolean);
                                                    SupplierAdress = resultArray.join(', ');
                                                }
                                                if (SupplierData._embedded.questionAnswerList[h].questionAnswer.questionLabel == "Contact First Name") {
                                                    SupplierFirstName = SupplierData._embedded.questionAnswerList[h].questionAnswer.answer;
                                                }
                                                if (SupplierData._embedded.questionAnswerList[h].questionAnswer.questionLabel == "Contact Last Name") {
                                                    SupplierLastName = SupplierData._embedded.questionAnswerList[h].questionAnswer.answer;
                                                }
                                                if (SupplierData._embedded.questionAnswerList[h].questionAnswer.questionLabel == "Contact Email") {
                                                    SupplierMail = SupplierData._embedded.questionAnswerList[h].questionAnswer.answer;
                                                }
                                                if (SupplierData._embedded.questionAnswerList[h].questionAnswer.questionLabel == "Mobile Phone") {
                                                    SupplierMobilePhone = SupplierData._embedded.questionAnswerList[h].questionAnswer.answer;
                                                }
                                                if (SupplierData._embedded.questionAnswerList[h].questionAnswer.questionLabel == "Contact Phone") {
                                                    SupplierContactPhone = SupplierData._embedded.questionAnswerList[h].questionAnswer.answer;
                                                }
                                            }
                                        }
                                        SupplierContact = SupplierFirstName + " " + SupplierLastName;//Poo
                                    }
                                    SupplierDetails.push({
                                        VendorId: SupplierData.vendorInfo.smVendorId,
                                        GstNo: GstNo,
                                        CEScore: CEScore,
                                        SupplierStreetName: SupplierStreetName,
                                        SupplierHouseID: SupplierHouseID,
                                        SupplierCity: SupplierCity,
                                        SupplierPostalCode: SupplierPostalCode,
                                        SupplierRegion: SupplierRegion,
                                        SupplierCountry: SupplierCountry,
                                        SupplierAdress: SupplierAdress,
                                        SupplierFirstName: SupplierFirstName,
                                        SupplierLastName: SupplierLastName,
                                        SupplierMail: SupplierMail,
                                        SupplierMobilePhone: SupplierMobilePhone,
                                        SupplierContactPhone: SupplierContactPhone,
                                        SupplierContact: SupplierContact
                                    })
                                }
                                if (DocumentSupplierBidResult && Array.isArray(DocumentSupplierBidResult.payload) && DocumentSupplierBidResult.payload.length > 0) {
                                    for (const DocSuppBidItem of DocumentSupplierBidResult.payload) {
                                        const DocSuppBidItemTitle = DocSuppBidItem.item.title;
                                        console.log(DocSuppBidItem)
                                        SubmissionDate = DocSuppBidItem.submissionDate
                                        if ("invitationId" in DocSuppBidItem) {
                                            VendorNames.push({
                                                VendorName: DocSuppBidItem.invitationId
                                            })
                                            if ("bidStatus" in DocSuppBidItem && DocSuppBidItem.bidStatus == "Accepted") {
                                                if ("invitationId" in DocSuppBidItem) {
                                                    DocSupBidInvitationID = DocSuppBidItem.invitationId;
                                                }
                                                if ("submissionDate" in DocSuppBidItem) {
                                                    PayDate = DocSuppBidItem.submissionDate;
                                                    PayDate = PayDate.substring(0, 10);
                                                    PayDate = returndate(PayDate);
                                                }
                                                switch (DocSuppBidItemTitle) {
                                                    case "Amendment in Existing PO/ARC/Contract":
                                                        if ("terms" in DocSuppBidItem.item &&
                                                            "value" in DocSuppBidItem.item.terms[0] && "simpleValue" in DocSuppBidItem.item.terms[0].value) {
                                                            AmendmentValue = DocSuppBidItem.item.terms[0].value.simpleValue;
                                                            DocSupplierBidItems.push({
                                                                ItemID: DocSuppBidItem.item.itemId,
                                                                label: "AmendmentValue",
                                                                Value: AmendmentValue
                                                            })
                                                        }
                                                        break;
                                                    case "Existing PO/ARC/Contract Value":
                                                        if ("terms" in DocSuppBidItem.item &&
                                                            "value" in DocSuppBidItem.item.terms[0] && "supplierValue" in DocSuppBidItem.item.terms[0].value) {
                                                            SupplierValueAmount = DocSuppBidItem.item.terms[0].value.supplierValue.amount
                                                            SupplierValueCurrency = DocSuppBidItem.item.terms[0].value.supplierValue.currency
                                                            FormattedSupplierValueAmount = `${parseFloat(SupplierValueAmount)} ${SupplierValueCurrency}`
                                                            DocSupplierBidItems.push({
                                                                ItemID: DocSuppBidItem.item.itemId,
                                                                label: "FormattedSupplierValueAmount",
                                                                Value: FormattedSupplierValueAmount
                                                            })
                                                        }
                                                        break;
                                                    case "Existing PO number":
                                                        if ("terms" in DocSuppBidItem.item &&
                                                            "value" in DocSuppBidItem.item.terms[0] && "simpleValue" in DocSuppBidItem.item.terms[0].value) {
                                                            ExistingPoNumberValue = DocSuppBidItem.item.terms[0].value.simpleValue
                                                            DocSupplierBidItems.push({
                                                                ItemID: DocSuppBidItem.item.itemId,
                                                                label: "ExistingPoNumberValue",
                                                                Value: ExistingPoNumberValue
                                                            })
                                                        }
                                                        break;
                                                    case "Amendment Value Total NFA Amount ( Contract Value): Incase of Amendment, please enter the total value including amendment+ tolerance value if Any)":
                                                        if ("terms" in DocSuppBidItem.item &&
                                                            "value" in DocSuppBidItem.item.terms[0] && "moneyValue" in DocSuppBidItem.item.terms[0].value) {
                                                            TotalNFAAmount = DocSuppBidItem.item.terms[0].value.moneyValue.amount;
                                                            TotalNFAAmountCurrency = DocSuppBidItem.item.terms[0].value.moneyValue.amount;
                                                            FormattedTotalNFAAmount = `${parseFloat(TotalNFAAmount)} ${TotalNFAAmountCurrency}`
                                                            DocSupplierBidItems.push({
                                                                ItemID: DocSuppBidItem.item.itemId,
                                                                label: "FormattedTotalNFAAmount",
                                                                Value: FormattedTotalNFAAmount
                                                            })
                                                        }
                                                        break;
                                                    case "Contract Period":
                                                        if ("terms" in DocSuppBidItem.item &&
                                                            "value" in DocSuppBidItem.item.terms[0] && "simpleValue" in DocSuppBidItem.item.terms[0].value) {
                                                            ContractPeriodValue = DocSuppBidItem.item.terms[0].value.simpleValue
                                                            FormattedTotalNFAAmount = `${parseFloat(TotalNFAAmount)} ${TotalNFAAmountCurrency}`
                                                            DocSupplierBidItems.push({
                                                                ItemID: DocSuppBidItem.item.itemId,
                                                                label: "FormattedTotalNFAAmount",
                                                                Value: FormattedTotalNFAAmount
                                                            })
                                                        }
                                                        break;
                                                    case "Budget":
                                                        if ("terms" in DocSuppBidItem.item &&
                                                            "value" in DocSuppBidItem.item.terms[0] && "simpleValue" in DocSuppBidItem.item.terms[0].value) {
                                                            BudgetValue = DocSuppBidItem.item.terms[0].value.simpleValue
                                                            DocSupplierBidItems.push({
                                                                ItemID: DocSuppBidItem.item.itemId,
                                                                label: "BudgetValue",
                                                                Value: BudgetValue
                                                            })
                                                        }
                                                        break;
                                                    case "Order Type Parties contacted and technically accepted ( Rational If on single vendor basis)":
                                                        if ("terms" in DocSuppBidItem.item &&
                                                            "value" in DocSuppBidItem.item.terms[0] && "simpleValue" in DocSuppBidItem.item.terms[0].value) {
                                                            OrderTypePartiesValue = DocSuppBidItem.item.terms[0].value.simpleValue
                                                            DocSupplierBidItems.push({
                                                                ItemID: DocSuppBidItem.item.itemId,
                                                                label: "OrderTypePartiesValue",
                                                                Value: OrderTypePartiesValue
                                                            })
                                                        }
                                                        break;
                                                    case "Rational for not doing auction,Is Price offer obtained before Auction (If Yes Kindly Attach the deviation approval obtained in NFA Supporting)":
                                                        if ("terms" in DocSuppBidItem.item &&
                                                            "value" in DocSuppBidItem.item.terms[0] && "simpleValue" in DocSuppBidItem.item.terms[0].value) {
                                                            RationalValue = DocSuppBidItem.item.terms[0].value.simpleValue
                                                            DocSupplierBidItems.push({
                                                                ItemID: DocSuppBidItem.item.itemId,
                                                                label: "RationalValue",
                                                                Value: RationalValue
                                                            })
                                                        }
                                                        break;
                                                    case "Vendors Latest Available Turnover ( In INR Cr.)":
                                                        if ("terms" in DocSuppBidItem.item &&
                                                            "value" in DocSuppBidItem.item.terms[0] && "moneyValue" in DocSuppBidItem.item.terms[0].value) {
                                                            VendorsTurnOverAmount = DocSuppBidItem.item.terms[0].value.moneyValue.amount;
                                                            VendorsTurnOverCurrency = DocSuppBidItem.item.terms[0].value.moneyValue.currency;
                                                            FormattedVendorsTurnOverAmount = `${parseFloat(VendorsTurnOverAmount)} ${VendorsTurnOverCurrency}`
                                                            DocSupplierBidItems.push({
                                                                ItemID: DocSuppBidItem.item.itemId,
                                                                label: "FormattedVendorsTurnOverAmount",
                                                                Value: FormattedVendorsTurnOverAmount
                                                            })
                                                        }
                                                        break;
                                                    case "Total Vendor Spend for Current FY (In INR Cr.) (Total Open value as on NFA date + Proposed annual value":
                                                        if ("terms" in DocSuppBidItem.item &&
                                                            "value" in DocSuppBidItem.item.terms[0] && "moneyValue" in DocSuppBidItem.item.terms[0].value) {
                                                            VendorsSpendAmount = DocSuppBidItem.item.terms[0].value.moneyValue.amount;
                                                            VendorsSpendCurrency = DocSuppBidItem.item.terms[0].value.moneyValue.currency;
                                                            FormattedVendorsSpendAmount = `${parseFloat(VendorsSpendAmount)} ${VendorsSpendCurrency}`
                                                            DocSupplierBidItems.push({
                                                                ItemID: DocSuppBidItem.item.itemId,
                                                                label: "FormattedVendorsSpendAmount",
                                                                Value: FormattedVendorsSpendAmount
                                                            })
                                                        }
                                                        break;
                                                    case "Rational for awarding contract to dependent partner":
                                                        if ("terms" in DocSuppBidItem.item &&
                                                            "value" in DocSuppBidItem.item.terms[0] && "simpleValue" in DocSuppBidItem.item.terms[0].value) {
                                                            RationalToDependentPartnerValue = DocSuppBidItem.item.terms[0].value.simpleValue
                                                            DocSupplierBidItems.push({
                                                                ItemID: DocSuppBidItem.item.itemId,
                                                                label: "RationalToDependentPartnerValue",
                                                                Value: RationalToDependentPartnerValue
                                                            })
                                                        }
                                                        break;
                                                    case "Is any new initiative/best practices (Quality/ESG/Automation/Local supplier development etc) considered in this proposal:":
                                                        if ("terms" in DocSuppBidItem.item &&
                                                            "value" in DocSuppBidItem.item.terms[0] && "simpleValue" in DocSuppBidItem.item.terms[0].value) {
                                                            NewInitiativeBestPracticesValue = DocSuppBidItem.item.terms[0].value.simpleValue
                                                            DocSupplierBidItems.push({
                                                                ItemID: DocSuppBidItem.item.itemId,
                                                                label: "NewInitiativeBestPracticesValue",
                                                                Value: NewInitiativeBestPracticesValue
                                                            })
                                                        }
                                                        break;
                                                    case "Negotiation Committee(Name):":
                                                        if ("terms" in DocSuppBidItem.item &&
                                                            "value" in DocSuppBidItem.item.terms[0] && "simpleValue" in DocSuppBidItem.item.terms[0].value) {
                                                            NegotiationCommitteValue = DocSuppBidItem.item.terms[0].value.simpleValue
                                                            DocSupplierBidItems.push({
                                                                ItemID: DocSuppBidItem.item.itemId,
                                                                label: "NegotiationCommitteValue",
                                                                Value: NegotiationCommitteValue
                                                            })
                                                        }
                                                        break;
                                                    case "Internal SLAs/KPIs for the contract:":
                                                        if ("terms" in DocSuppBidItem.item &&
                                                            "value" in DocSuppBidItem.item.terms[0] && "simpleValue" in DocSuppBidItem.item.terms[0].value) {
                                                            InternalSLAsKPIsValue = DocSuppBidItem.item.terms[0].value.simpleValue
                                                            DocSupplierBidItems.push({
                                                                ItemID: DocSuppBidItem.item.itemId,
                                                                label: "InternalSLAsKPIsValue",
                                                                Value: InternalSLAsKPIsValue
                                                            })
                                                        }
                                                        break;
                                                    case "Contract Value (Basic Value)":
                                                        if ("terms" in DocSuppBidItem.item &&
                                                            "value" in DocSuppBidItem.item.terms[0] && "simpleValue" in DocSuppBidItem.item.terms[0].value) {
                                                            ContractBasicValue = DocSuppBidItem.item.terms[0].value.simpleValue
                                                            DocSupplierBidItems.push({
                                                                ItemID: DocSuppBidItem.item.itemId,
                                                                label: "ContractBasicValue",
                                                                Value: ContractBasicValue
                                                            })
                                                        }
                                                        break;
                                                    case "Is there Any Import Supply under this Proposal?":
                                                        if ("terms" in DocSuppBidItem.item &&
                                                            "value" in DocSuppBidItem.item.terms[0] && "simpleValue" in DocSuppBidItem.item.terms[0].value) {
                                                            ImportSupplyProposal = DocSuppBidItem.item.terms[0].value.simpleValue
                                                            DocSupplierBidItems.push({
                                                                ItemID: DocSuppBidItem.item.itemId,
                                                                label: "ImportSupplyProposal",
                                                                Value: ImportSupplyProposal
                                                            })
                                                        }
                                                        break;
                                                    case "FTA/EPCG/any other benefit availed for duty saving":
                                                        if ("terms" in DocSuppBidItem.item &&
                                                            "value" in DocSuppBidItem.item.terms[0] && "simpleValue" in DocSuppBidItem.item.terms[0].value) {
                                                            FTAEPCGValue = DocSuppBidItem.item.terms[0].value.simpleValue
                                                            DocSupplierBidItems.push({
                                                                ItemID: DocSuppBidItem.item.itemId,
                                                                label: "FTAEPCGValue",
                                                                Value: FTAEPCGValue
                                                            })
                                                        }
                                                        break;
                                                    case "Approximate Duty Amount in INR":
                                                        if ("terms" in DocSuppBidItem.item &&
                                                            "value" in DocSuppBidItem.item.terms[0] && "moneyValue" in DocSuppBidItem.item.terms[0].value) {
                                                            DutyAmountINR = DocSuppBidItem.item.terms[0].value.moneyValue.amount;
                                                            DutyCurrencyINR = DocSuppBidItem.item.terms[0].value.moneyValue.currency;
                                                            FormattedDutyAmountINR = `${parseFloat(DutyAmountINR)} ${DutyCurrencyINR}`
                                                            DocSupplierBidItems.push({
                                                                ItemID: DocSuppBidItem.item.itemId,
                                                                label: "FormattedDutyAmountINR",
                                                                Value: FormattedDutyAmountINR
                                                            })
                                                        }
                                                        break;
                                                    case "Monthly Quantity":
                                                        if ("terms" in DocSuppBidItem.item &&
                                                            "value" in DocSuppBidItem.item.terms[0] && "simpleValue" in DocSuppBidItem.item.terms[0].value) {
                                                            MonthlyQuantityValue = DocSuppBidItem.item.terms[0].value.simpleValue;
                                                            DocSupplierBidItems.push({
                                                                ItemID: DocSuppBidItem.item.itemId,
                                                                label: "MonthlyQuantityValue",
                                                                Value: MonthlyQuantityValue
                                                            })
                                                        }
                                                        break;
                                                    case "Reason for Post Facto NFA ( If Applicable)":
                                                        if ("terms" in DocSuppBidItem.item &&
                                                            "value" in DocSuppBidItem.item.terms[0] && "simpleValue" in DocSuppBidItem.item.terms[0].value) {
                                                            PostFactoNfaReasonValue = DocSuppBidItem.item.terms[0].value.simpleValue;
                                                            DocSupplierBidItems.push({
                                                                ItemID: DocSuppBidItem.item.itemId,
                                                                label: "PostFactoNfaReasonValue",
                                                                Value: PostFactoNfaReasonValue
                                                            })
                                                        }
                                                        break;
                                                    case "Pricing in Business Plan (If Applicable)":
                                                        if ("terms" in DocSuppBidItem.item &&
                                                            "value" in DocSuppBidItem.item.terms[0] && "simpleValue" in DocSuppBidItem.item.terms[0].value) {
                                                            BusinessPlanPricingValue = DocSuppBidItem.item.terms[0].value.simpleValue;
                                                            DocSupplierBidItems.push({
                                                                ItemID: DocSuppBidItem.item.itemId,
                                                                label: "BusinessPlanPricingValue",
                                                                Value: BusinessPlanPricingValue
                                                            })
                                                        }
                                                        break;
                                                    case "Last Purchase Price/CLPP":
                                                        if ("terms" in DocSuppBidItem.item &&
                                                            "value" in DocSuppBidItem.item.terms[0] && "moneyValue" in DocSuppBidItem.item.terms[0].value) {
                                                            CLPPLastPurchaseAmount = DocSuppBidItem.item.terms[0].value.moneyValue.amount;
                                                            CLPPLastPurchaseCurrency = DocSuppBidItem.item.terms[0].value.moneyValue.currency;
                                                            FormattedCLPPLastPurchaseAmount = `${parseFloat(CLPPLastPurchaseAmount)} ${CLPPLastPurchaseCurrency}`
                                                            DocSupplierBidItems.push({
                                                                ItemID: DocSuppBidItem.item.itemId,
                                                                label: "FormattedCLPPLastPurchaseAmount",
                                                                Value: FormattedCLPPLastPurchaseAmount
                                                            })
                                                        }
                                                        break;
                                                    case "Price Justification":
                                                        if ("terms" in DocSuppBidItem.item &&
                                                            "value" in DocSuppBidItem.item.terms[0] && "simpleValue" in DocSuppBidItem.item.terms[0].value) {
                                                            PriceJustificationValue = DocSuppBidItem.item.terms[0].value.simpleValue;
                                                            DocSupplierBidItems.push({
                                                                ItemID: DocSuppBidItem.item.itemId,
                                                                label: "PriceJustificationValue",
                                                                Value: PriceJustificationValue
                                                            })
                                                        }
                                                        break;
                                                    case "Deviations from Group philosophy/ Cardinal rules)":
                                                        if ("terms" in DocSuppBidItem.item &&
                                                            "value" in DocSuppBidItem.item.terms[0] && "simpleValue" in DocSuppBidItem.item.terms[0].value) {
                                                            CardinalRulesValue = DocSuppBidItem.item.terms[0].value.simpleValue;
                                                            DocSupplierBidItems.push({
                                                                ItemID: DocSuppBidItem.item.itemId,
                                                                label: "CardinalRulesValue",
                                                                Value: CardinalRulesValue
                                                            })
                                                        }
                                                        break;
                                                    case "List of Deviation":
                                                        if ("terms" in DocSuppBidItem.item &&
                                                            "value" in DocSuppBidItem.item.terms[0] && "simpleValue" in DocSuppBidItem.item.terms[0].value) {
                                                            DeviationListValue = DocSuppBidItem.item.terms[0].value.simpleValue;
                                                            DocSupplierBidItems.push({
                                                                ItemID: DocSuppBidItem.item.itemId,
                                                                label: "DeviationListValue",
                                                                Value: DeviationListValue
                                                            })
                                                        }
                                                        break;
                                                    case "Terms Of Payment & milestone on which payment will be made":
                                                        if ("terms" in DocSuppBidItem.item &&
                                                            "value" in DocSuppBidItem.item.terms[0] && "simpleValue" in DocSuppBidItem.item.terms[0].value) {
                                                            TermsOfPaymentValue = DocSuppBidItem.item.terms[0].value.simpleValue;
                                                            DocSupplierBidItems.push({
                                                                ItemID: DocSuppBidItem.item.itemId,
                                                                label: "TermsOfPaymentValue",
                                                                Value: TermsOfPaymentValue
                                                            })
                                                        }
                                                        break;
                                                    case "Packing & Forwarding":
                                                        if ("terms" in DocSuppBidItem.item &&
                                                            "value" in DocSuppBidItem.item.terms[0] && "simpleValue" in DocSuppBidItem.item.terms[0].value) {
                                                            PackagingForwardingValue = DocSuppBidItem.item.terms[0].value.simpleValue;
                                                            DocSupplierBidItems.push({
                                                                ItemID: DocSuppBidItem.item.itemId,
                                                                label: "PackagingForwardingValue",
                                                                Value: PackagingForwardingValue
                                                            })
                                                        }
                                                        break;
                                                    case "Logistics":
                                                        if ("terms" in DocSuppBidItem.item &&
                                                            "value" in DocSuppBidItem.item.terms[0] && "moneyValue" in DocSuppBidItem.item.terms[0].value) {
                                                            LogisticsAmount = DocSuppBidItem.item.terms[0].value.moneyValue.amount;
                                                            LogisticsCurrency = DocSuppBidItem.item.terms[0].value.moneyValue.currency;
                                                            FormattedLogisticsAmount = `${parseFloat(LogisticsAmount)} ${LogisticsCurrency}`
                                                            DocSupplierBidItems.push({
                                                                ItemID: DocSuppBidItem.item.itemId,
                                                                label: "FormattedLogisticsAmount",
                                                                Value: FormattedLogisticsAmount
                                                            })
                                                        }
                                                        break;
                                                    case "Insurance":
                                                        if ("terms" in DocSuppBidItem.item &&
                                                            "value" in DocSuppBidItem.item.terms[0] && "simpleValue" in DocSuppBidItem.item.terms[0].value) {
                                                            InsuranceValue = DocSuppBidItem.item.terms[0].value.simpleValue;
                                                            DocSupplierBidItems.push({
                                                                ItemID: DocSuppBidItem.item.itemId,
                                                                label: "InsuranceValue",
                                                                Value: InsuranceValue
                                                            })
                                                        }
                                                        break;
                                                    case "Penalty clause for Quality":
                                                        if ("terms" in DocSuppBidItem.item &&
                                                            "value" in DocSuppBidItem.item.terms[0] && "simpleValue" in DocSuppBidItem.item.terms[0].value) {
                                                            PenaltyQualityValue = DocSuppBidItem.item.terms[0].value.simpleValue;
                                                            DocSupplierBidItems.push({
                                                                ItemID: DocSuppBidItem.item.itemId,
                                                                label: "PenaltyQualityValue",
                                                                Value: PenaltyQualityValue
                                                            })
                                                        }
                                                        break;
                                                    case "Penalty criteria":
                                                        if ("terms" in DocSuppBidItem.item &&
                                                            "value" in DocSuppBidItem.item.terms[0] && "simpleValue" in DocSuppBidItem.item.terms[0].value) {
                                                            PenaltyCriteriaValue = DocSuppBidItem.item.terms[0].value.simpleValue;
                                                            DocSupplierBidItems.push({
                                                                ItemID: DocSuppBidItem.item.itemId,
                                                                label: "PenaltyCriteriaValue",
                                                                Value: PenaltyCriteriaValue
                                                            })
                                                        }
                                                        break;
                                                    case "Delivery Lead Time":
                                                        if ("terms" in DocSuppBidItem.item &&
                                                            "value" in DocSuppBidItem.item.terms[0] && "simpleValue" in DocSuppBidItem.item.terms[0].value) {
                                                            DeliveryLeadTimeValue = DocSuppBidItem.item.terms[0].value.simpleValue;
                                                            DocSupplierBidItems.push({
                                                                ItemID: DocSuppBidItem.item.itemId,
                                                                label: "DeliveryLeadTimeValue",
                                                                Value: DeliveryLeadTimeValue
                                                            })
                                                        }
                                                        break;
                                                    case "Liquidated Damages":
                                                        if ("terms" in DocSuppBidItem.item &&
                                                            "value" in DocSuppBidItem.item.terms[0] && "simpleValue" in DocSuppBidItem.item.terms[0].value) {
                                                            LiquidatedDamagesValue = DocSuppBidItem.item.terms[0].value.simpleValue;
                                                            DocSupplierBidItems.push({
                                                                ItemID: DocSuppBidItem.item.itemId,
                                                                label: "LiquidatedDamagesValue",
                                                                Value: LiquidatedDamagesValue
                                                            })
                                                        }
                                                        break;
                                                    case "Liquidated Damages Clause":
                                                        if ("terms" in DocSuppBidItem.item &&
                                                            "value" in DocSuppBidItem.item.terms[0] && "simpleValue" in DocSuppBidItem.item.terms[0].value) {
                                                            LiquidatedDamagesClValue = DocSuppBidItem.item.terms[0].value.simpleValue;
                                                            DocSupplierBidItems.push({
                                                                ItemID: DocSuppBidItem.item.itemId,
                                                                label: "LiquidatedDamagesClValue",
                                                                Value: LiquidatedDamagesClValue
                                                            })
                                                        }
                                                        break;
                                                    case "PBG and SD":
                                                        if ("terms" in DocSuppBidItem.item &&
                                                            "value" in DocSuppBidItem.item.terms[0] && "simpleValue" in DocSuppBidItem.item.terms[0].value) {
                                                            PBGAndSDValue = DocSuppBidItem.item.terms[0].value.simpleValue;
                                                            DocSupplierBidItems.push({
                                                                ItemID: DocSuppBidItem.item.itemId,
                                                                label: "PBGAndSDValue",
                                                                Value: PBGAndSDValue
                                                            })
                                                        }
                                                        break;
                                                    case "PBG and SD Clause":
                                                        if ("terms" in DocSuppBidItem.item &&
                                                            "value" in DocSuppBidItem.item.terms[0] && "simpleValue" in DocSuppBidItem.item.terms[0].value) {
                                                            PBGAndSDClValue = DocSuppBidItem.item.terms[0].value.simpleValue;
                                                            DocSupplierBidItems.push({
                                                                ItemID: DocSuppBidItem.item.itemId,
                                                                label: "PBGAndSDClValue",
                                                                Value: PBGAndSDClValue
                                                            })
                                                        }
                                                        break;
                                                    case "Penalty clause for safety- Subcontract(Allowed/ Not Allowed) (If Yes, which party and crendential of the party and technical approval of the party has to be enclosed in NFA)":
                                                        if ("terms" in DocSuppBidItem.item &&
                                                            "value" in DocSuppBidItem.item.terms[0] && "simpleValue" in DocSuppBidItem.item.terms[0].value) {
                                                            PenaltyForSafetySubcontractValue = DocSuppBidItem.item.terms[0].value.simpleValue;
                                                            DocSupplierBidItems.push({
                                                                ItemID: DocSuppBidItem.item.itemId,
                                                                label: "PenaltyForSafetySubcontractValue",
                                                                Value: PenaltyForSafetySubcontractValue
                                                            })
                                                        }
                                                        break;
                                                    case "Other Key Terms (Eg: Warranty, Inspection Clause, GTC Deviation, Party Delivery. Etc)":
                                                        if ("terms" in DocSuppBidItem.item &&
                                                            "value" in DocSuppBidItem.item.terms[0] && "simpleValue" in DocSuppBidItem.item.terms[0].value) {
                                                            OtherKeyTermsValue = DocSuppBidItem.item.terms[0].value.simpleValue;
                                                            DocSupplierBidItems.push({
                                                                ItemID: DocSuppBidItem.item.itemId,
                                                                label: "OtherKeyTermsValue",
                                                                Value: OtherKeyTermsValue
                                                            })
                                                        }
                                                        break;
                                                    case "Rationale if not L1":
                                                        if ("terms" in DocSuppBidItem.item &&
                                                            "value" in DocSuppBidItem.item.terms[0] && "simpleValue" in DocSuppBidItem.item.terms[0].value) {
                                                            RationaleL1Value = DocSuppBidItem.item.terms[0].value.simpleValue;
                                                            DocSupplierBidItems.push({
                                                                ItemID: DocSuppBidItem.item.itemId,
                                                                label: "RationaleL1Value",
                                                                Value: RationaleL1Value
                                                            })
                                                        }
                                                        break;
                                                    case "Prices Are":
                                                        if ("terms" in DocSuppBidItem.item &&
                                                            "value" in DocSuppBidItem.item.terms[0] && "simpleValue" in DocSuppBidItem.item.terms[0].value) {
                                                            PricesValue = DocSuppBidItem.item.terms[0].value.simpleValue;
                                                            DocSupplierBidItems.push({
                                                                ItemID: DocSuppBidItem.item.itemId,
                                                                label: "PricesValue",
                                                                Value: PricesValue
                                                            })
                                                        }
                                                        break;
                                                }
                                                console.log("DocSupplierBidItems", DocSupplierBidItems);


                                            }
                                        }
                                    }
                                };
                                PaymentDetails.push({
                                    "slNo": 1,
                                    "ProposedVendorCode": PVCode.at,
                                    "NFANumber": DocId,


                                })
                                {

                                }
                            }
                        }
                        //Prem Krishna
                        SupplierCount1 = VendorNames.filter(obj => {
                            if (!SupplierCount[obj.VendorName]) {
                                SupplierCount[obj.VendorName] = true;
                                return true;
                            }
                            return false
                        })
                        console.log("SupplierCount1", SupplierCount1);
                        //Array for (Supplier Count For that particular DocID)
                        SupplierCountValue.push({
                            SupplierCount: SupplierCount1.length,
                            DocId: DocId
                        })
                        VendorNames = [];
                        SupplierCount1 = [];
                        VendorCount = 0;

                        InsertNfaDetailsBody = {
                            NfaNumber: DocId,
                            PriceJustification: PriceJustificationValue,
                            PenaltyClauseForQuality: PenaltyQualityValue,
                            NFAID: DocId,
                            AmendmentValueTotalNfaAmount: AmendmentValue,
                            DeviationsfromGroupPhilosophyCardinalRules: CardinalRulesValue,
                            PenaltyCriteria: PenaltyCriteriaValue,
                            PricingInBusinessPlanIfApplicable: BusinessPlanPricingValue,
                            ListOfDeviation: DeviationListValue,
                            RationaleIfNotL1: RationaleL1Value,
                            ExistingPoNumber: ExistingPoNumberValue,
                            IsAnyNewInitiativeBestpractices: NewInitiativeBestPracticesValue,
                            IsThereAnyImportSupplyUnderThisProposal: ImportSupplyProposal,
                            Budget: BudgetValue,
                            NegotiationCommittee: NegotiationCommitteValue,
                            LastPurchasePriceClpp: FormattedCLPPLastPurchaseAmount,
                            PricesAre: PricesValue,
                            RationalForNotDoingAuction: RationalValue,
                            TaskId: TaskID

                        }
                        console.log("InsertNfaDetailsBody", InsertNfaDetailsBody);
                        ExistingNfaRecord = await SELECT.one.from(NfaDetails).where({ NfaNumber: DocId });
                        try {
                            if (!ExistingNfaRecord) {
                                const InsertQueryForNfaDetails = await INSERT.into(NfaDetails).entries(InsertNfaDetailsBody);
                                console.log("Insert successful:", InsertQueryForNfaDetails);
                            } else {
                                console.log("Record already exists for NfaNumber:", DocId);
                            }
                        } catch (error) {
                            console.error("Error inserting into NfaDetails:", error);
                        }

                        try {
                            // Step 1: Check if the record already exists
                            const existingRecord = await SELECT.one.from('NfaEventHistory')
                                .where({ NfaNumber: DocId, EventNo: req.data.EventNo });

                            if (existingRecord) {
                                console.log("Record already exists for NfaNumber:", req.data.NfaNumber);
                                return;
                            }

                            // Step 2: Generate next idd
                            const maxIdResult = await SELECT.one.from('NfaEventHistory').columns('max(idd) as maxId');
                            let nextIdd = 1;
                            if (maxIdResult && maxIdResult.maxId) {
                                nextIdd = parseInt(maxIdResult.maxId) + 1;
                            }

                            // Step 3: Insert the new record
                            // const insertData = {
                            //     ...req.data,
                            //     idd: nextIdd.toString() // store as string, since your entity defines it as String
                            // };

                            // const inserted = await INSERT.into('NfaEventHistory').entries(insertData);
                            console.log("Insert successful:", inserted);

                        } catch (error) {
                            console.error("Error inserting into NfaEventHistory:", error);
                        }
                        var rounds = RoundsData.payload
                        // if (rounds && rounds.length > 0) {
                        //     // Step 1: Find the minimum and maximum roundNumbers
                        //     const roundNumbers = rounds.map(r => r.roundNumber);
                        //     const minRoundNumber = Math.min(...roundNumbers);
                        //     const maxRoundNumber = Math.max(...roundNumbers);

                        //     // Step 2: Find first and last round records
                        //     if (!minRoundNumber === maxRoundNumber) {
                        //         const firstRound = rounds.find(r => r.roundNumber === minRoundNumber);
                        //         const lastRound = rounds.find(r => r.roundNumber === maxRoundNumber);
                        //     }

                        //     // Step 3: Store in an array
                        //     const firstAndLastRounds = [firstRound, lastRound];

                        //     console.log(firstAndLastRounds);
                        // }
                        // let InsertNfaDetailsBody = {
                        //     "idd": "EVT001",
                        //     "NfaNumber": "NFA001",
                        //     "EventNo": "E-1001",
                        //     "Number": "01",
                        //     "Date": "2025-09-21",
                        //     "NumberOfVendorsParticipated":SupplierCountValue.SupplierCount,
                        //     "L1AmountObtained": DocumentScenariosTotAwardPrice
                        // }
                        // await INSERT.into(NfaEventHistory).entries(InsertNfaEventHistoryBody);
                    }
                    rounds.forEach((round, index) => {
                        // Count suppliers for this round
                        const supplierCount = round.suppliers.length;
                        console.log(`Round ${round.roundNumber} has ${supplierCount} supplier(s)`);

                        // Capture first and last round in the same loop
                        if (index === 0) firstRound = round;
                        if (index === rounds.length - 1) lastRound = round;
                    });

                    ////akshay and ajay
                    ////////////////************Vendor Details********************///////////////////////
                    for(i=0;i<WokerThreadsResults[3].payload.length;i++)
                    {
                        VendorName = WokerThreadsResults[3].payload[i].organization.name;
                        VendorAddress = WokerThreadsResults[3].payload[i].organization.address.city;
                        VendorInvitationId = WokerThreadsResults[3].payload[i].invitationId;
                        VendorUserId = WokerThreadsResults[3].payload[i].userId;
                    }
                    ////////////////************Vendor Details********************///////////////////////

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