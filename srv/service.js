const cds = require('@sap/cds');
const { url } = require('node:inspector');
const { Worker, workerData, parentPort, isMainThread } = require('node:worker_threads');
// projectId = #WS79052482 ///// new one = #WS84836442 ////// #WS85279377
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
        var DocumentItemsUrl = "https://openapi.au.cloud.ariba.com/api/sourcing-event/v2/prod/events/<docId>/items"
        //supplierBids
        var DocumentSupplierBidsUrl = "https://openapi.au.cloud.ariba.com/api/sourcing-event/v2/prod/events/<docId>/supplierBids/<sName>"
        //rounds
        var DocumentRoundsUrl = "https://openapi.au.cloud.ariba.com/api/sourcing-event/v2/prod/events/<docId>/rounds";
        //supplier data pagination api's
        var SupplierQuestionariesUrl = "https://openapi.au.cloud.ariba.com/api/supplierdatapagination/v4/prod//vendors/<vendorId>/workspaces/questionnaires/qna";

        /////////////*****NEW API TO CHECK VENDOR QUOTED AMOUNT IN EACH ROUND*********////////////////
        var SuppierBidsInRounds = "https://openapi.au.cloud.ariba.com/api/sourcing-event/v2/prod/events/<docId>/rounds/<roundNo>/supplierBids/<invitationId>"


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
            let SourcingProjectDocsBody, SourcingProjectDocsResult, DocId, DocumentUrlBody, DocumentUrlResult, Date1, Date2, DiffTime, DiffDays, NfaDetailsData = 0, WokerThreadsResults, WokerThreadsResults1, InsertNfaDetailsBody, ExistingNfaRecord, InsertQueryForNfaDetails, CurrentId, EventNo, Rounds, RfpPublishDate;

            //Initialize as Array
            let InsertEntriesRounds = []
            /////*****************LET*****************/////



            /////-----------------VAR-----------------/////
            var ProjectID, TaskID, projCurrency, WebPublishDate, DocumentUrlFinalDate, DocumentUrlCreateDate, VendorID, RoundsPayload, LastId, SupplierCountRounds, BidRank, SupplierBidName;

            //Initialize as Array
            var WorkerPromises = [], WorkerPromises1 = [], SupplierBidsWorker = [], DocumentScenariosUrlResult = [], VendorIds = [], Supplier = [], RoundsData = [], SupplierDetails = [],
                VendorNames = [], DocSupplierBidItems = [], PaymentDetails = [], SupplierCount1 = [], SupplierCountValue = [], SupplierWithRounds = [], SupplierDataWithRounds = [],
                ItemsDetails = [], VendorDetailsArr = [], ItemsPrice = [], EventHistory = [];

            //Initialize as Objects
            var SupplierInvitationsUrlResult = {}, SupplierCount = {}, SupplierRounds = {};

            //Initialize as Empty 
            var SourcingProjectDescription = "", SourcingProjectBaseLinespend = "", DocumentScenariosTotAwardPrice = "", SupplierName = "", VendorID = "", PVCode = "", SmID = "", SupplierData = "", GstNo = "", CEScore = "", SupplierAdress = "", SupplierStreetName = "", SupplierRegion = "", SupplierPostalCode = "", SupplierCity = "", SupplierHouseID = "", SupplierCountry = "",
                SupplierContactPhone = "", SupplierMobilePhone = "", SupplierMail = "", SupplierLastName = "", SupplierFirstName = "", SupplierContact = "", SubmissionDate = "", DocSupBidInvitationID = "", PayDate = "", AmendmentValue = "", SupplierValueAmount = "", SupplierValueCurrency = "",
                ExistingPoNumberValue = "", TotalNFAAmount = "", TotalNFAAmountCurrency = "", ContractPeriodValue = "", BudgetValue = "", OrderTypePartiesValue = "", FormattedTotalNFAAmount = "", FormattedSupplierValueAmount = "", RationalValue = "",
                VendorsTurnOverAmount = "", VendorsTurnOverCurrency, FormattedVendorsTurnOverAmount = "", VendorsSpendAmount = "", VendorsSpendCurrency = "", FormattedVendorsSpendAmount = "", RationalToDependentPartnerValue = "", NewInitiativeBestPracticesValue = "", NegotiationCommitteValue = "", InternalSLAsKPIsValue = "",
                ContractBasicValue = "", ImportSupplyProposal = "", FTAEPCGValue = "", MonthlyQuantityValue = "", PostFactoNfaReasonValue = "", BusinessPlanPricingValue = "",
                CLPPLastPurchaseAmount = "", CLPPLastPurchaseCurrency = "", FormattedCLPPLastPurchaseAmount = "", PriceJustificationValue = "", CardinalRulesValue = "", DeviationListValue = "", TermsOfPaymentValue = "", PackagingForwardingValue = "", LogisticsAmount = "", LogisticsCurrency = "", FormattedLogisticsAmount = "", InsuranceValue = "",
                PenaltyQualityValue = "", PenaltyCriteriaValue = "", DeliveryLeadTimeValue = "", LiquidatedDamagesValue = "", LiquidatedDamagesClValue = "", PBGAndSDValue = "", PBGAndSDClValue = "", PenaltyForSafetySubcontractValue = "", OtherKeyTermsValue = "", RationaleL1Value = "", PricesValue = "", ApprovingPlant = "",
                VendorName = "", VendorAddress = "", VendorInvitationId = "", VendorUserId = "", FormattedDutyAmountINR = "", SourcingProjectBaseLineCurrency = "", SubjectOfProposalOrder = "", SourcingProjectCreateDate = "", SubjectofProposalOROrder = "", DocumentItemsUrlResult = "", savingsTerms = "", HistoricalAmount = "", CurrentAmount = "", Savings = "";
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
                        RfpPublishDate = DocumentUrlResult.createDate;
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

                    // NfaDetailsData = await SELECT.from('NfaDetails').where('TaskId =', TaskID);
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
                        WorkerPromises.push(createWorker(DocumentItemsUrl.replace('<docId>', DocId), DocumentBase, 'DocumentItemsUrl'))
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
                                        SourcingProjectBaseLineCurrency = result.baselineSpend.currency;
                                        SubjectOfProposalOrder = result.title;
                                        SourcingProjectCreateDate = result.createDate;

                                        break;
                                    case 'DocumentScenariosUrl':
                                        if (result.payload[0].eventId && !(result instanceof Error)) {
                                            DocumentScenariosSupCount = result.payload[0].selectedSuppliersCount || "";
                                            DocumentScenariosUrlResult = result;
                                            DocumentScenariosTotAwardPrice = returnamt(result.payload[0].totalAwardPrice.amount)
                                            let extendedPriceTerms = result.payload[0].rollupTerms.filter(term => term.fieldId === "EXTENDEDPRICE");

                                            extendedPriceTerms.forEach(term => {
                                                HistoricalAmount = term.historyValue.moneyValue.amount;
                                                CurrentAmount = term.value.moneyValue.amount;
                                                Savings = HistoricalAmount - CurrentAmount; // will give the difference
                                            });

                                            SubjectofProposalOROrder = result.payload[0].title;


                                        }
                                        break;
                                    case 'DocumentItemsUrl':
                                        console.log(result.path);
                                        DocumentItemsUrlResult = result;

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
                                // WorkerPromises.push(createWorker(DocumentSupplierBidsUrl.replace('<docId>', DocId).replace('<sName>', SupplierName), DocumentBase, 'DocumentSupplierBidsUrl'))
                                WorkerPromises.push(createWorker(DocumentRoundsUrl.replace('<docId>', DocId), DocumentBase, 'DocumentRoundsUrl'))
                                WorkerPromises.push(createWorker(SupplierQuestionariesUrl.replace('<vendorId>', VendorIds[k].SmVendorId), SupplierQuestionariesBase, 'SupplierQuestionariesUrl'))
                                WokerThreadsResults1 = await Promise.all(WorkerPromises);
                                if (WokerThreadsResults1.length) {
                                    for (let i = 0; i < WokerThreadsResults1.length; i++) {
                                        //For .path == 'SupplierQuestionariesUrl'
                                        if (!Array.isArray(WokerThreadsResults1[i].payload) && (!(WokerThreadsResults1[i] instanceof Error))) {
                                            SupplierData = WokerThreadsResults1[i];
                                        }
                                        // else if (Array.isArray(WokerThreadsResults1[i].payload) && WokerThreadsResults1[i].path == 'DocumentSupplierBidsUrl' && (!(WokerThreadsResults1[i] instanceof Error))) {
                                        //     DocumentSupplierBidResult = WokerThreadsResults1[i];
                                        // } 
                                        else if (Array.isArray(WokerThreadsResults1[i].payload) && WokerThreadsResults1[i].path == 'DocumentRoundsUrl' && (!(WokerThreadsResults1[i] instanceof Error))) {
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

                                PaymentDetails.push({
                                    "slNo": 1,
                                    "ProposedVendorCode": PVCode.at,
                                    "NFANumber": DocId,


                                })
                                {

                                }
                            }
                            Supplier.forEach(supp => {
                                SupplierBidsWorker.push(createWorker(DocumentSupplierBidsUrl.replace('<docId>', DocId).replace('<sName>', supp.SupplierName), DocumentBase, `DocumentSupplierBidsUrl ${supp.SupplierName}`));
                            })
                            var DocumentSupplierBidResult = await Promise.all(SupplierBidsWorker);
                            debugger
                            DocumentSupplierBidResult.forEach(Questions => {
                                console.log(Questions);
                                SupplierBidName = Questions.path.split(" ")[1];
                                if (Questions && Array.isArray(Questions.payload) && Questions.payload.length > 0) {
                                    for (const DocSuppBidItem of Questions.payload) {
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
                                                        }
                                                        break;
                                                    case "Existing PO/ARC/Contract Value":
                                                        if ("terms" in DocSuppBidItem.item &&
                                                            "value" in DocSuppBidItem.item.terms[0] && "supplierValue" in DocSuppBidItem.item.terms[0].value) {
                                                            SupplierValueAmount = DocSuppBidItem.item.terms[0].value.supplierValue.amount
                                                            SupplierValueCurrency = DocSuppBidItem.item.terms[0].value.supplierValue.currency
                                                            FormattedSupplierValueAmount = `${parseFloat(SupplierValueAmount)} ${SupplierValueCurrency}`
                                                        }
                                                        break;
                                                    case "Existing PO number":
                                                        if ("terms" in DocSuppBidItem.item &&
                                                            "value" in DocSuppBidItem.item.terms[0] && "simpleValue" in DocSuppBidItem.item.terms[0].value) {
                                                            ExistingPoNumberValue = DocSuppBidItem.item.terms[0].value.simpleValue
                                                        }
                                                        break;
                                                    case "Amendment Value Total NFA Amount ( Contract Value): Incase of Amendment, please enter the total value including amendment+ tolerance value if Any)":
                                                        if ("terms" in DocSuppBidItem.item &&
                                                            "value" in DocSuppBidItem.item.terms[0] && "moneyValue" in DocSuppBidItem.item.terms[0].value) {
                                                            TotalNFAAmount = DocSuppBidItem.item.terms[0].value.moneyValue.amount;
                                                            TotalNFAAmountCurrency = DocSuppBidItem.item.terms[0].value.moneyValue.amount;
                                                            FormattedTotalNFAAmount = `${parseFloat(TotalNFAAmount)} ${TotalNFAAmountCurrency}`
                                                        }
                                                        break;
                                                    case "Contract Period":
                                                        if ("terms" in DocSuppBidItem.item &&
                                                            "value" in DocSuppBidItem.item.terms[0] && "simpleValue" in DocSuppBidItem.item.terms[0].value) {
                                                            ContractPeriodValue = DocSuppBidItem.item.terms[0].value.simpleValue;
                                                        }
                                                        break;
                                                    case "Budget":
                                                        if ("terms" in DocSuppBidItem.item &&
                                                            "value" in DocSuppBidItem.item.terms[0] && "simpleValue" in DocSuppBidItem.item.terms[0].value) {
                                                            BudgetValue = DocSuppBidItem.item.terms[0].value.simpleValue
                                                        }
                                                        break;
                                                    case "Order Type Parties contacted and technically accepted ( Rational If on single vendor basis)":
                                                        if ("terms" in DocSuppBidItem.item &&
                                                            "value" in DocSuppBidItem.item.terms[0] && "simpleValue" in DocSuppBidItem.item.terms[0].value) {
                                                            OrderTypePartiesValue = DocSuppBidItem.item.terms[0].value.simpleValue
                                                        }
                                                        break;
                                                    case "Rational for not doing auction,Is Price offer obtained before Auction (If Yes Kindly Attach the deviation approval obtained in NFA Supporting)":
                                                        if ("terms" in DocSuppBidItem.item &&
                                                            "value" in DocSuppBidItem.item.terms[0] && "simpleValue" in DocSuppBidItem.item.terms[0].value) {
                                                            RationalValue = DocSuppBidItem.item.terms[0].value.simpleValue
                                                        }
                                                        break;
                                                    case "Vendors Latest Available Turnover ( In INR Cr.)":
                                                        if ("terms" in DocSuppBidItem.item &&
                                                            "value" in DocSuppBidItem.item.terms[0] && "moneyValue" in DocSuppBidItem.item.terms[0].value) {
                                                            VendorsTurnOverAmount = DocSuppBidItem.item.terms[0].value.moneyValue.amount;
                                                            VendorsTurnOverCurrency = DocSuppBidItem.item.terms[0].value.moneyValue.currency;
                                                            FormattedVendorsTurnOverAmount = `${parseFloat(VendorsTurnOverAmount)} ${VendorsTurnOverCurrency}`
                                                        }
                                                        break;
                                                    case "Total Vendor Spend for Current FY (In INR Cr.) (Total Open value as on NFA date + Proposed annual value":
                                                        if ("terms" in DocSuppBidItem.item &&
                                                            "value" in DocSuppBidItem.item.terms[0] && "moneyValue" in DocSuppBidItem.item.terms[0].value) {
                                                            VendorsSpendAmount = DocSuppBidItem.item.terms[0].value.moneyValue.amount;
                                                            VendorsSpendCurrency = DocSuppBidItem.item.terms[0].value.moneyValue.currency;
                                                            FormattedVendorsSpendAmount = `${parseFloat(VendorsSpendAmount)} ${VendorsSpendCurrency}`
                                                        }
                                                        break;
                                                    case "Rational for awarding contract to dependent partner":
                                                        if ("terms" in DocSuppBidItem.item &&
                                                            "value" in DocSuppBidItem.item.terms[0] && "simpleValue" in DocSuppBidItem.item.terms[0].value) {
                                                            RationalToDependentPartnerValue = DocSuppBidItem.item.terms[0].value.simpleValue
                                                        }
                                                        break;
                                                    case "Is any new initiative/best practices (Quality/ESG/Automation/Local supplier development etc) considered in this proposal:":
                                                        if ("terms" in DocSuppBidItem.item &&
                                                            "value" in DocSuppBidItem.item.terms[0] && "simpleValue" in DocSuppBidItem.item.terms[0].value) {
                                                            NewInitiativeBestPracticesValue = DocSuppBidItem.item.terms[0].value.simpleValue
                                                        }
                                                        break;
                                                    case "Negotiation Committee(Name):":
                                                        if ("terms" in DocSuppBidItem.item &&
                                                            "value" in DocSuppBidItem.item.terms[0] && "simpleValue" in DocSuppBidItem.item.terms[0].value) {
                                                            NegotiationCommitteValue = DocSuppBidItem.item.terms[0].value.simpleValue
                                                        }
                                                        break;
                                                    case "Internal SLAs/KPIs for the contract:":
                                                        if ("terms" in DocSuppBidItem.item &&
                                                            "value" in DocSuppBidItem.item.terms[0] && "simpleValue" in DocSuppBidItem.item.terms[0].value) {
                                                            InternalSLAsKPIsValue = DocSuppBidItem.item.terms[0].value.simpleValue
                                                        }
                                                        break;
                                                    case "Contract Value (Basic Value)":
                                                        if ("terms" in DocSuppBidItem.item &&
                                                            "value" in DocSuppBidItem.item.terms[0] && "simpleValue" in DocSuppBidItem.item.terms[0].value) {
                                                            ContractBasicValue = DocSuppBidItem.item.terms[0].value.simpleValue
                                                        }
                                                        break;
                                                    case "Is there Any Import Supply under this Proposal?":
                                                        if ("terms" in DocSuppBidItem.item &&
                                                            "value" in DocSuppBidItem.item.terms[0] && "simpleValue" in DocSuppBidItem.item.terms[0].value) {
                                                            ImportSupplyProposal = DocSuppBidItem.item.terms[0].value.simpleValue
                                                        }
                                                        break;
                                                    case "FTA/EPCG/any other benefit availed for duty saving":
                                                        if ("terms" in DocSuppBidItem.item &&
                                                            "value" in DocSuppBidItem.item.terms[0] && "simpleValue" in DocSuppBidItem.item.terms[0].value) {
                                                            FTAEPCGValue = DocSuppBidItem.item.terms[0].value.simpleValue
                                                        }
                                                        break;
                                                    case "Approximate Duty Amount in INR":
                                                        if ("terms" in DocSuppBidItem.item &&
                                                            "value" in DocSuppBidItem.item.terms[0] && "moneyValue" in DocSuppBidItem.item.terms[0].value) {
                                                            DutyAmountINR = DocSuppBidItem.item.terms[0].value.moneyValue.amount;
                                                            DutyCurrencyINR = DocSuppBidItem.item.terms[0].value.moneyValue.currency;
                                                            FormattedDutyAmountINR = `${parseFloat(DutyAmountINR)} ${DutyCurrencyINR}`
                                                        }
                                                        break;
                                                    case "Monthly Quantity":
                                                        if ("terms" in DocSuppBidItem.item &&
                                                            "value" in DocSuppBidItem.item.terms[0] && "simpleValue" in DocSuppBidItem.item.terms[0].value) {
                                                            MonthlyQuantityValue = DocSuppBidItem.item.terms[0].value.simpleValue;
                                                        }
                                                        break;
                                                    case "Reason for Post Facto NFA ( If Applicable)":
                                                        if ("terms" in DocSuppBidItem.item &&
                                                            "value" in DocSuppBidItem.item.terms[0] && "simpleValue" in DocSuppBidItem.item.terms[0].value) {
                                                            PostFactoNfaReasonValue = DocSuppBidItem.item.terms[0].value.simpleValue;
                                                        }
                                                        break;
                                                    case "Pricing in Business Plan (If Applicable)":
                                                        if ("terms" in DocSuppBidItem.item &&
                                                            "value" in DocSuppBidItem.item.terms[0] && "simpleValue" in DocSuppBidItem.item.terms[0].value) {
                                                            BusinessPlanPricingValue = DocSuppBidItem.item.terms[0].value.simpleValue;
                                                        }
                                                        break;
                                                    case "Last Purchase Price/CLPP":
                                                        if ("terms" in DocSuppBidItem.item &&
                                                            "value" in DocSuppBidItem.item.terms[0] && "moneyValue" in DocSuppBidItem.item.terms[0].value) {
                                                            CLPPLastPurchaseAmount = DocSuppBidItem.item.terms[0].value.moneyValue.amount;
                                                            CLPPLastPurchaseCurrency = DocSuppBidItem.item.terms[0].value.moneyValue.currency;
                                                            FormattedCLPPLastPurchaseAmount = `${parseFloat(CLPPLastPurchaseAmount)} ${CLPPLastPurchaseCurrency}`
                                                        }
                                                        break;
                                                    case "Price Justification":
                                                        if ("terms" in DocSuppBidItem.item &&
                                                            "value" in DocSuppBidItem.item.terms[0] && "simpleValue" in DocSuppBidItem.item.terms[0].value) {
                                                            PriceJustificationValue = DocSuppBidItem.item.terms[0].value.simpleValue;
                                                        }
                                                        break;
                                                    case "Deviations from Group philosophy/ Cardinal rules)":
                                                        if ("terms" in DocSuppBidItem.item &&
                                                            "value" in DocSuppBidItem.item.terms[0] && "simpleValue" in DocSuppBidItem.item.terms[0].value) {
                                                            CardinalRulesValue = DocSuppBidItem.item.terms[0].value.simpleValue;
                                                        }
                                                        break;
                                                    case "List of Deviation":
                                                        if ("terms" in DocSuppBidItem.item &&
                                                            "value" in DocSuppBidItem.item.terms[0] && "simpleValue" in DocSuppBidItem.item.terms[0].value) {
                                                            DeviationListValue = DocSuppBidItem.item.terms[0].value.simpleValue;
                                                        }
                                                        break;
                                                    case "Terms Of Payment & milestone on which payment will be made":
                                                        if ("terms" in DocSuppBidItem.item &&
                                                            "value" in DocSuppBidItem.item.terms[0] && "simpleValue" in DocSuppBidItem.item.terms[0].value) {
                                                            TermsOfPaymentValue = DocSuppBidItem.item.terms[0].value.simpleValue;
                                                        }
                                                        break;
                                                    case "Packing & Forwarding":
                                                        if ("terms" in DocSuppBidItem.item &&
                                                            "value" in DocSuppBidItem.item.terms[0] && "simpleValue" in DocSuppBidItem.item.terms[0].value) {
                                                            PackagingForwardingValue = DocSuppBidItem.item.terms[0].value.simpleValue;
                                                        }
                                                        break;
                                                    case "Logistics":
                                                        if ("terms" in DocSuppBidItem.item &&
                                                            "value" in DocSuppBidItem.item.terms[0] && "moneyValue" in DocSuppBidItem.item.terms[0].value) {
                                                            LogisticsAmount = DocSuppBidItem.item.terms[0].value.moneyValue.amount;
                                                            LogisticsCurrency = DocSuppBidItem.item.terms[0].value.moneyValue.currency;
                                                            FormattedLogisticsAmount = `${parseFloat(LogisticsAmount)} ${LogisticsCurrency}`
                                                        }
                                                        break;
                                                    case "Insurance":
                                                        if ("terms" in DocSuppBidItem.item &&
                                                            "value" in DocSuppBidItem.item.terms[0] && "simpleValue" in DocSuppBidItem.item.terms[0].value) {
                                                            InsuranceValue = DocSuppBidItem.item.terms[0].value.simpleValue;
                                                        }
                                                        break;
                                                    case "Penalty clause for Quality":
                                                        if ("terms" in DocSuppBidItem.item &&
                                                            "value" in DocSuppBidItem.item.terms[0] && "simpleValue" in DocSuppBidItem.item.terms[0].value) {
                                                            PenaltyQualityValue = DocSuppBidItem.item.terms[0].value.simpleValue;
                                                        }
                                                        break;
                                                    case "Penalty criteria":
                                                        if ("terms" in DocSuppBidItem.item &&
                                                            "value" in DocSuppBidItem.item.terms[0] && "simpleValue" in DocSuppBidItem.item.terms[0].value) {
                                                            PenaltyCriteriaValue = DocSuppBidItem.item.terms[0].value.simpleValue;
                                                        }
                                                        break;
                                                    case "Delivery Lead Time":
                                                        if ("terms" in DocSuppBidItem.item &&
                                                            "value" in DocSuppBidItem.item.terms[0] && "simpleValue" in DocSuppBidItem.item.terms[0].value) {
                                                            DeliveryLeadTimeValue = DocSuppBidItem.item.terms[0].value.simpleValue;
                                                        }
                                                        break;
                                                    case "Liquidated Damages":
                                                        if ("terms" in DocSuppBidItem.item &&
                                                            "value" in DocSuppBidItem.item.terms[0] && "simpleValue" in DocSuppBidItem.item.terms[0].value) {
                                                            LiquidatedDamagesValue = DocSuppBidItem.item.terms[0].value.simpleValue;
                                                        }
                                                        break;
                                                    case "Liquidated Damages Clause":
                                                        if ("terms" in DocSuppBidItem.item &&
                                                            "value" in DocSuppBidItem.item.terms[0] && "simpleValue" in DocSuppBidItem.item.terms[0].value) {
                                                            LiquidatedDamagesClValue = DocSuppBidItem.item.terms[0].value.simpleValue;
                                                        }
                                                        break;
                                                    case "PBG and SD":
                                                        if ("terms" in DocSuppBidItem.item &&
                                                            "value" in DocSuppBidItem.item.terms[0] && "simpleValue" in DocSuppBidItem.item.terms[0].value) {
                                                            PBGAndSDValue = DocSuppBidItem.item.terms[0].value.simpleValue;
                                                        }
                                                        break;
                                                    case "PBG and SD Clause":
                                                        if ("terms" in DocSuppBidItem.item &&
                                                            "value" in DocSuppBidItem.item.terms[0] && "simpleValue" in DocSuppBidItem.item.terms[0].value) {
                                                            PBGAndSDClValue = DocSuppBidItem.item.terms[0].value.simpleValue;
                                                        }
                                                        break;
                                                    case "Penalty clause for safety- Subcontract(Allowed/ Not Allowed) (If Yes, which party and crendential of the party and technical approval of the party has to be enclosed in NFA)":
                                                        if ("terms" in DocSuppBidItem.item &&
                                                            "value" in DocSuppBidItem.item.terms[0] && "simpleValue" in DocSuppBidItem.item.terms[0].value) {
                                                            PenaltyForSafetySubcontractValue = DocSuppBidItem.item.terms[0].value.simpleValue;
                                                        }
                                                        break;
                                                    case "Other Key Terms (Eg: Warranty, Inspection Clause, GTC Deviation, Party Delivery. Etc)":
                                                        if ("terms" in DocSuppBidItem.item &&
                                                            "value" in DocSuppBidItem.item.terms[0] && "simpleValue" in DocSuppBidItem.item.terms[0].value) {
                                                            OtherKeyTermsValue = DocSuppBidItem.item.terms[0].value.simpleValue;
                                                        }
                                                        break;
                                                    case "Rationale if not L1":
                                                        if ("terms" in DocSuppBidItem.item &&
                                                            "value" in DocSuppBidItem.item.terms[0] && "simpleValue" in DocSuppBidItem.item.terms[0].value) {
                                                            RationaleL1Value = DocSuppBidItem.item.terms[0].value.simpleValue;
                                                        }
                                                        break;
                                                    case "Prices Are":
                                                        if ("terms" in DocSuppBidItem.item &&
                                                            "value" in DocSuppBidItem.item.terms[0] && "simpleValue" in DocSuppBidItem.item.terms[0].value) {
                                                            PricesValue = DocSuppBidItem.item.terms[0].value.simpleValue;
                                                        }
                                                        break;
                                                    case "Approving Plant":
                                                        if ("terms" in DocSuppBidItem.item &&
                                                            "value" in DocSuppBidItem.item.terms[0] && "simpleValue" in DocSuppBidItem.item.terms[0].value) {
                                                            ApprovingPlant = DocSuppBidItem.item.terms[0].value.simpleValue;
                                                        }
                                                        break;
                                                }

                                                console.log("DocSupplierBidItems", DocSupplierBidItems);

                                            }
                                        }
                                    }
                                    DocSupplierBidItems.push({
                                        SupplierBidName: SupplierBidName,
                                        DocSupBidInvitationID: DocSupBidInvitationID,
                                        PayDate: PayDate,
                                        AmendmentValue: AmendmentValue,
                                        FormattedSupplierValueAmount: FormattedSupplierValueAmount,
                                        ExistingPoNumberValue: ExistingPoNumberValue,
                                        FormattedTotalNFAAmount: FormattedTotalNFAAmount,
                                        ContractPeriodValue: ContractPeriodValue,
                                        BudgetValue: BudgetValue,
                                        OrderTypePartiesValue: OrderTypePartiesValue,
                                        RationalValue: RationalValue,
                                        FormattedVendorsTurnOverAmount: FormattedVendorsTurnOverAmount,
                                        FormattedVendorsSpendAmount: FormattedVendorsSpendAmount,
                                        RationalToDependentPartnerValue: RationalToDependentPartnerValue,
                                        NewInitiativeBestPracticesValue: NewInitiativeBestPracticesValue,
                                        NegotiationCommitteValue: NegotiationCommitteValue,
                                        InternalSLAsKPIsValue: InternalSLAsKPIsValue,
                                        ContractBasicValue: ContractBasicValue,
                                        ImportSupplyProposal: ImportSupplyProposal,
                                        FTAEPCGValue: FTAEPCGValue,
                                        FormattedDutyAmountINR: FormattedDutyAmountINR,
                                        MonthlyQuantityValue: MonthlyQuantityValue,
                                        PostFactoNfaReasonValue: PostFactoNfaReasonValue,
                                        BusinessPlanPricingValue: BusinessPlanPricingValue,
                                        FormattedCLPPLastPurchaseAmount: FormattedCLPPLastPurchaseAmount,
                                        PriceJustificationValue: PriceJustificationValue,
                                        CardinalRulesValue: CardinalRulesValue,
                                        DeviationListValue: DeviationListValue,
                                        TermsOfPaymentValue: TermsOfPaymentValue,
                                        PackagingForwardingValue: PackagingForwardingValue,
                                        FormattedLogisticsAmount: FormattedLogisticsAmount,
                                        InsuranceValue: InsuranceValue,
                                        PenaltyQualityValue: PenaltyQualityValue,
                                        PenaltyCriteriaValue: PenaltyCriteriaValue,
                                        DeliveryLeadTimeValue: DeliveryLeadTimeValue,
                                        LiquidatedDamagesValue: LiquidatedDamagesValue,
                                        LiquidatedDamagesClValue: LiquidatedDamagesClValue,
                                        PBGAndSDValue: PBGAndSDValue,
                                        PBGAndSDClValue: PBGAndSDClValue,
                                        PenaltyForSafetySubcontractValue: PenaltyForSafetySubcontractValue,
                                        OtherKeyTermsValue: OtherKeyTermsValue,
                                        RationaleL1Value: RationaleL1Value,
                                        PricesValue: PricesValue,
                                        ApprovingPlant: ApprovingPlant
                                    })
                                };

                            })
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
                            ProjectDescription: SourcingProjectDescription,
                            BaseLineSpend: SourcingProjectBaseLinespend,
                            ProjectCurrencyORBaseCurrency: SourcingProjectBaseLineCurrency,
                            FinalProposedValue: SubjectOfProposalOrder,
                            RfpPublishDate: RfpPublishDate,
                            NumberOfVendorsShortlistedForRFP: DocumentScenariosSupCount,
                            SavingsAchievedBtwInitialAndFinalQuote: Savings

                        }
                        console.log("InsertNfaDetailsBody", InsertNfaDetailsBody);
                        ExistingNfaRecord = await SELECT.one.from(NfaDetails).where({ NfaNumber: DocId });
                        try {
                            if (!ExistingNfaRecord) {
                                // const InsertQueryForNfaDetails = await INSERT.into(NfaDetails).entries(InsertNfaDetailsBody);
                                console.log("Insert successful:", InsertQueryForNfaDetails);
                            } else {
                                console.log("Record already exists for NfaNumber:", DocId);
                            }
                        } catch (error) {
                            console.error("Error inserting into NfaDetails:", error);
                        }

                        try {
                            // Step 1: Get the max existing idd
                            LastId = await SELECT.one.from('NfaEventHistory').columns('max(idd) as maxId');
                            CurrentId = 1;
                            if (LastId && LastId.maxId) {
                                CurrentId = parseInt(LastId.maxId) + 1;
                            }

                            // Step 2: Prepare insert payloads
                            Rounds = RoundsData.payload;


                            Rounds.forEach((round, index) => {
                                // Getting the supplier length
                                SupplierCountRounds = round.suppliers.length;

                                // Naming the first and last record as First and Last Published
                                EventNo = "";
                                if (index === 0) {
                                    EventNo = "First Published";
                                } else if (index === Rounds.length - 1) {
                                    EventNo = "Last Published";
                                }

                                InsertEntriesRounds.push({
                                    idd: (CurrentId++).toString(),                     // auto-increment idd
                                    NfaNumber: DocId,                                // DocId coming from request
                                    EventNo: EventNo,                                // first/last round only others will be null
                                    Number: round.roundNumber.toString(),            // round number as string
                                    Date: round.biddingEndDate,                      // assign last date of round
                                    NumberOfVendorsParticipated: SupplierCountRounds.toString(), //Calculating the length of suppliers response
                                    L1AmountObtained: ""
                                });
                            });

                            // Step 3: Insert all entries into the DB
                            if (InsertEntriesRounds.length > 0) {
                                // await INSERT.into('NfaEventHistory').entries(InsertEntriesRounds);
                                console.log("Insert successful:", InsertEntriesRounds);
                            }

                        } catch (error) {
                            console.error("Error inserting into NfaEventHistory:", error);
                        }












                        ////akshay and ajay
                        ////////////////************Vendor Details********************///////////////////////
                        for (var a = 0; a < WokerThreadsResults.length; a++) {
                            if (WokerThreadsResults[a].path == 'DocumentSupplierInvitationsUrl')
                                for (i = 0; i < WokerThreadsResults[a].payload.length; i++) {
                                    VendorName = WokerThreadsResults[a].payload[i].organization.name;
                                    VendorAddress = WokerThreadsResults[a].payload[i].organization.address.city;
                                    VendorInvitationId = WokerThreadsResults[a].payload[i].invitationId;
                                    VendorUserId = WokerThreadsResults[a].payload[i].userId;
                                    VendorDetailsArr.push({
                                        VendorName: VendorName,
                                        VendorAddress: VendorAddress,
                                        VendorInvitationId: VendorInvitationId,
                                        VendorUserId: VendorUserId
                                    })
                                    VendorName = "";
                                    VendorAddress = "";
                                    VendorInvitationId = "";
                                    VendorUserId = "";
                                }
                            break;
                        }


                        /////////////********STORING MAX ROUND***************/////////////
                        RoundsPayload = RoundsData.payload.map(item => item.roundNumber);
                        const MaxRound = RoundsPayload.length > 0 ? Math.max(...RoundsPayload) : 0;
                        const AllSuppliers = Array.from(
                            new Set(RoundsData.payload.flatMap(p => p.suppliers))
                        );

                        // RoundsSuppliers = RoundsData.payload[a].suppliers;
                        AllSuppliers.forEach(supplier => {
                            for (var a = 1; a <= RoundsData.payload.length; a++) {
                                // loop through rounds in order
                                SupplierWithRounds.push({
                                    Supplier: supplier,
                                    Rounds: a
                                });
                            }
                        });



                        /////////////////**********GET CALL FOR SUPPLIER BID FOR EACH ROUND*****************////////////
                        for (const item of SupplierWithRounds) {
                            console.log(item)
                            var url = SuppierBidsInRounds
                                .replace('<docId>', encodeURIComponent(DocId))
                                .replace('<roundNo>', encodeURIComponent(item.Rounds))
                                .replace('<invitationId>', encodeURIComponent(item.Supplier));
                            // WorkerPromises1.push(createWorker(SuppierBidsInRounds.replace('<docId>', DocId).replace('<roundNo>', item.Rounds).replace('<invitationId>', item.Supplier), DocumentBase, `SuppierBidsInRounds + ${item.Rounds} + ${item.Supplier}`));
                            var result1 = await createWorker(
                                url,
                                DocumentBase,
                                `SuppierBidsInRounds ${item.Rounds} ${item.Supplier}`
                            );
                            SupplierDataWithRounds.push(result1);
                        }
                        var Item, UnitPrice, SupplierItemId, ItemPrice, ItemPrice1, ItemCurrency, UnitOfMeasure, DiscountPercentage, UnitOfMeasureCode, OrginalQuote, FinalQuote, VendorLocation, OrderAmountOrSplitOrderAmount, Disount, Rank, ItemsWithBid;
                        for (let i = 0; i < SupplierDataWithRounds.length; i++) {

                            const [Supplier, Round, Id] = SupplierDataWithRounds[i].path.split(" ");

                            for (let j = 0; j < SupplierDataWithRounds[i].payload.length; j++) {
                                if (j == 23)
                                    console.log(SupplierDataWithRounds[i].payload[j])
                                if ("itemsWithBid" in SupplierDataWithRounds[i].payload[j]) {

                                    ItemsWithBid = SupplierDataWithRounds[i].payload[j].itemsWithBid;
                                    console.log()
                                }
                            }

                            for (let a = 0; a < ItemsWithBid.length; a++) {
                                for (let j = 0; j < SupplierDataWithRounds[i].payload.length; j++) {
                                    if (SupplierDataWithRounds[i].payload[j].item.itemId == ItemsWithBid[a]) {
                                        console.log(SupplierDataWithRounds[i].payload[j].item.itemId);
                                        Item = SupplierDataWithRounds[i].payload[j].item.title;
                                        SupplierItemId = SupplierDataWithRounds[i].payload[j].itemId;
                                        if ('bidRank' in SupplierDataWithRounds[i].payload[j]) {
                                            BidRank = SupplierDataWithRounds[i].payload[j].bidRank
                                        }
                                        for (let k = 0; k < SupplierDataWithRounds[i].payload[j].item.terms.length; k++) {
                                            if (SupplierDataWithRounds[i].payload[j].item.terms[k].title == "Extended Price") {
                                                ItemPrice = SupplierDataWithRounds[i].payload[j].item.terms[k].value.moneyValue.amount
                                                ItemCurrency = SupplierDataWithRounds[i].payload[j].item.terms[k].value.moneyValue.currency;
                                                ItemPrice1 = `${parseFloat(ItemPrice)} ${ItemCurrency}`;

                                            }
                                            if (SupplierDataWithRounds[i].payload[j].item.terms[k].title == "Quantity") {
                                                UnitOfMeasure = SupplierDataWithRounds[i].payload[j].item.terms[k].value.quantityValue.amount
                                                UnitOfMeasureCode = SupplierDataWithRounds[i].payload[j].item.terms[k].value.quantityValue.unitOfMeasureCode;
                                            }
                                            if (SupplierDataWithRounds[i].payload[j].item.terms[k].title == "Discount Percentage") {
                                                DiscountPercentage = SupplierDataWithRounds[i].payload[j].item.terms[k].value.bigDecimalValue;

                                            }


                                        }
                                    }

                                }
                            }
                            UnitPrice = ItemPrice / UnitOfMeasure;
                            ItemsDetails.push({
                                BidRank: BidRank,
                                ItemName: Item,
                                SupplierItemId: SupplierItemId,
                                SupplierId: Id,
                                Round: Round,
                                ItemPrice: ItemPrice,
                                UnitOfMeasure: UnitOfMeasure,
                                UnitOfMeasureCode: UnitOfMeasureCode,
                                UnitPrice: UnitPrice,
                                DiscountPercentage: DiscountPercentage
                            })
                            BidRank = "";
                            Item = "";
                            SupplierItemId = "";
                            ItemPrice = "";
                            UnitOfMeasure = ""
                            UnitOfMeasureCode = ""
                            UnitPrice = "";
                            DiscountPercentage = "";

                        }

                        // Step 1: Merge ItemsDetails with VendorDetailsArr
                        const mergedArray = ItemsDetails.map(item => {
                            const vendor = VendorDetailsArr.find(v => v.VendorInvitationId === item.SupplierId);
                            return {
                                ...item,
                                ...(vendor || {})
                            };
                        });

                        // Step 2: Group by SupplierId
                        const grouped = mergedArray.reduce((acc, item) => {
                            if (!acc[item.SupplierId]) acc[item.SupplierId] = [];
                            acc[item.SupplierId].push(item);
                            return acc;
                        }, {});

                        // Step 3: Build final result with MinRound + MaxRound + VendorIds + DocSupplierBidItems
                        const finalResult = Object.entries(grouped).map(([supplierId, items]) => {
                            // Sort rounds numerically
                            const sorted = items.sort((a, b) => Number(a.Round) - Number(b.Round));

                            // Vendor master data (from VendorIds)
                            const vendor = VendorIds.find(v => v.VendorInvitationID === supplierId);

                            // Doc bid items (all questions)
                            const doc = DocSupplierBidItems.find(d => d.SupplierBidName === supplierId);

                            return {
                                SupplierId: supplierId,
                                MinRound: sorted[0],                      // first round details
                                MaxRound: sorted[sorted.length - 1],      // last round details

                                // Vendor master info
                                organizationName: vendor?.organizationName || null,
                                VendorLocation: vendor?.VendorLocation || null,
                                ErpVendorId: vendor?.ErpVendorId || null,
                                SmVendorId: vendor?.SmVendorId || null,

                                // All DocSupplierBidItems question/answer fields
                                SupplierBidName: doc?.SupplierBidName || null,
                                DocSupBidInvitationID: doc?.DocSupBidInvitationID || null,
                                PayDate: doc?.PayDate || null,
                                AmendmentValue: doc?.AmendmentValue || null,
                                FormattedSupplierValueAmount: doc?.FormattedSupplierValueAmount || null,
                                ExistingPoNumberValue: doc?.ExistingPoNumberValue || null,
                                FormattedTotalNFAAmount: doc?.FormattedTotalNFAAmount || null,
                                ContractPeriodValue: doc?.ContractPeriodValue || null,
                                BudgetValue: doc?.BudgetValue || null,
                                OrderTypePartiesValue: doc?.OrderTypePartiesValue || null,
                                RationalValue: doc?.RationalValue || null,
                                FormattedVendorsTurnOverAmount: doc?.FormattedVendorsTurnOverAmount || null,
                                FormattedVendorsSpendAmount: doc?.FormattedVendorsSpendAmount || null,
                                RationalToDependentPartnerValue: doc?.RationalToDependentPartnerValue || null,
                                NewInitiativeBestPracticesValue: doc?.NewInitiativeBestPracticesValue || null,
                                NegotiationCommitteValue: doc?.NegotiationCommitteValue || null,
                                InternalSLAsKPIsValue: doc?.InternalSLAsKPIsValue || null,
                                ContractBasicValue: doc?.ContractBasicValue || null,
                                ImportSupplyProposal: doc?.ImportSupplyProposal || null,
                                FTAEPCGValue: doc?.FTAEPCGValue || null,
                                FormattedDutyAmountINR: doc?.FormattedDutyAmountINR || null,
                                MonthlyQuantityValue: doc?.MonthlyQuantityValue || null,
                                PostFactoNfaReasonValue: doc?.PostFactoNfaReasonValue || null,
                                BusinessPlanPricingValue: doc?.BusinessPlanPricingValue || null,
                                FormattedCLPPLastPurchaseAmount: doc?.FormattedCLPPLastPurchaseAmount || null,
                                PriceJustificationValue: doc?.PriceJustificationValue || null,
                                CardinalRulesValue: doc?.CardinalRulesValue || null,
                                DeviationListValue: doc?.DeviationListValue || null,
                                TermsOfPaymentValue: doc?.TermsOfPaymentValue || null,
                                PackagingForwardingValue: doc?.PackagingForwardingValue || null,
                                FormattedLogisticsAmount: doc?.FormattedLogisticsAmount || null,
                                InsuranceValue: doc?.InsuranceValue || null,
                                PenaltyQualityValue: doc?.PenaltyQualityValue || null,
                                PenaltyCriteriaValue: doc?.PenaltyCriteriaValue || null,
                                DeliveryLeadTimeValue: doc?.DeliveryLeadTimeValue || null,
                                LiquidatedDamagesValue: doc?.LiquidatedDamagesValue || null,
                                LiquidatedDamagesClValue: doc?.LiquidatedDamagesClValue || null,
                                PBGAndSDValue: doc?.PBGAndSDValue || null,
                                PBGAndSDClValue: doc?.PBGAndSDClValue || null,
                                PenaltyForSafetySubcontractValue: doc?.PenaltyForSafetySubcontractValue || null,
                                OtherKeyTermsValue: doc?.OtherKeyTermsValue || null,
                                RationaleL1Value: doc?.RationaleL1Value || null,
                                PricesValue: doc?.PricesValue || null,
                                ApprovingPlant: doc?.ApprovingPlant || null
                            };
                        });

                        console.log(finalResult);

                        const maxRoundPerSupplierItem = Object.values(
                            ItemsDetails.reduce((acc, obj) => {
                                const key = `${obj.SupplierId}_${obj.SupplierItemId}`;
                                if (!acc[key] || Number(obj.Round) > Number(acc[key].Round)) {
                                    acc[key] = obj;
                                }
                                return acc;
                            }, {})
                        );

                        console.log(maxRoundPerSupplierItem);
                        for (let i = 0; i < DocumentItemsUrlResult.payload.length; i++) {
                            var ItemQuantity, ItemPrice, ItemImproviseAmount;
                            if (DocumentItemsUrlResult.payload[i].commodity) {
                                for (let j = 0; j < DocumentItemsUrlResult.payload[i].terms.length; j++) {
                                    if (DocumentItemsUrlResult.payload[i].terms[j].title === 'Quantity') {
                                        ItemQuantity = DocumentItemsUrlResult.payload[i].terms[j].value.quantityValue.amount + ' ' + DocumentItemsUrlResult.payload[i].terms[j].value.quantityValue.unitOfMeasureCode;
                                        // quantity_int = ItemResp.payload[i].terms[j].value.quantityValue.amount;
                                    }
                                    if (DocumentItemsUrlResult.payload[i].terms[j].title === 'Price') {
                                        ItemPrice = DocumentItemsUrlResult.payload[i].terms[j].historyValue.moneyValue.amount + ' ' + DocumentItemsUrlResult.payload[i].terms[j].historyValue.moneyValue.currency;
                                        // Price_int = ItemResp.payload[i].terms[j].historyValue.moneyValue.amount;
                                    }
                                    if (DocumentItemsUrlResult.payload[i].terms[j].title === 'Unit Cost') {
                                        ItemImproviseAmount = DocumentItemsUrlResult.payload[i].terms[j].itemBiddingRules.revisedBidRule.absoluteImprovement;
                                    }
                                }
                                if (ItemQuantity === 0 || ItemPrice === 0) {
                                    continue;
                                }
                                ItemsPrice.push({
                                    quantity: ItemQuantity,
                                    Price: ItemPrice,
                                    improvise_amount: ItemImproviseAmount,
                                    ItemId: DocumentItemsUrlResult.payload[i].itemId
                                })
                                ItemQuantity = "";
                                ItemPrice = "";
                                ItemImproviseAmount = "";
                            }




                        }

                        // Create a lookup map from ItemsPrice for faster access
                        const priceMap = {};
                        ItemsPrice.forEach(item => {
                            priceMap[item.ItemId] = item.Price; // you can store more info if needed
                        });

                        // Merge Price into ItemsDetails
                        ItemsDetails.forEach(detail => {
                            const price = priceMap[detail.SupplierItemId]; // match by SupplierItemId
                            if (price !== undefined) {
                                detail.Price = price; // add new field
                            } else {
                                detail.Price = null; // optional: default if no match found
                            }
                        });

                        console.log(ItemsDetails);

                        debugger

                        /////////////roundslogic//////////////
                        const Rounds = RoundsData.payload; // your JSON response

                        if (Rounds.length > 0) {
                            const firstRound = Rounds[0];
                            const lastRound = Rounds[Rounds.length - 1];

                            const selectedRounds = [firstRound, lastRound].map(round => ({
                                roundNumber: round.roundNumber,
                                startDate: round.biddingStartDate
                            }));

                            console.log(selectedRounds);
                        }

                        





                        ////////////////************Vendor Details********************///////////////////////

                    }

                }
            }
            catch (e) {
                console.log(e)
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