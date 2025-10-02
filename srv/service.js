const cds = require('@sap/cds');
const { url } = require('node:inspector');
const { Worker, workerData, parentPort, isMainThread } = require('node:worker_threads');
// projectId = #WS79052482 ///// new one = #WS84836442 ////// #WS85279377
if (isMainThread) {
    module.exports = cds.service.impl(async function () {
        let {
            NfaDetails, NfaVendorData
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
        var DocumentItemsUrl = "https://openapi.au.cloud.ariba.com/api/sourcing-event/v2/prod/events/<docId>/items/pages/<pageNo>";
        //supplierBids
        var DocumentSupplierBidsUrl = "https://openapi.au.cloud.ariba.com/api/sourcing-event/v2/prod/events/<docId>/supplierBids/<sName>"
        //rounds
        var DocumentRoundsUrl = "https://openapi.au.cloud.ariba.com/api/sourcing-event/v2/prod/events/<docId>/rounds";
        //supplier data pagination api's
        var SupplierQuestionariesUrl = "https://openapi.au.cloud.ariba.com/api/supplierdatapagination/v4/prod//vendors/<vendorId>/workspaces/questionnaires/qna";

        /////////////*****NEW API TO CHECK VENDOR QUOTED AMOUNT IN EACH ROUND*********////////////////
        var SuppierBidsInRounds = "https://openapi.au.cloud.ariba.com/api/sourcing-event/v2/prod/events/<docId>/rounds/<roundNo>/supplierBids/<invitationId>"


        ///////////////////////////////////////Ariba URLS////////////////////////////////////////////

        // function returndate(input) {
        //     let a = input;
        //     let [y, m, d] = a.split('-');
        //     let jumbleDate = y + "/" + m + "/" + d
        //     return jumbleDate
        // }
        function returndate(input) {
            const date = new Date(input);
            if (isNaN(date)) return input; // fallback if invalid

            const y = date.getFullYear();
            const m = String(date.getMonth() + 1).padStart(2, "0");
            const d = String(date.getDate()).padStart(2, "0");

            return `${y}/${m}/${d}`;  // "2025/09/26"
        }

        function getAllRounds(RoundsData) {
            // Normalize to array
            const roundsArray = Array.isArray(RoundsData)
                ? RoundsData
                : (RoundsData && Array.isArray(RoundsData.payload))
                    ? RoundsData.payload
                    : (RoundsData && typeof RoundsData === 'object')
                        ? Object.values(RoundsData)
                        : [];

            return roundsArray
                .map(r => ({
                    roundNumber: Number(r.roundNumber),
                    biddingStartDate: r.biddingStartDate,
                    suppliers: r.suppliers,
                    supplierCount: Array.isArray(r.suppliers) ? r.suppliers.length : 0
                }))
                .sort((a, b) => a.roundNumber - b.roundNumber);
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
            var ProjectID, TaskID, projCurrency, WebPublishDate, ProjectId, TemplateProjectTitle, BeginDate, DocumentUrlFinalDate, DocumentUrlCreateDate, VendorID, RoundsPayload, LastId, SupplierCountRounds, BidRank, SupplierBidName, ProjectCurrencyBaseCurrency, ApprovingPlantItem, SbuUnitLocation, AuctionDone, TaxPercentage, Freight;

            //Initialize as Array
            var WorkerPromises = [], WorkerPromises1 = [], SupplierBidsWorker = [], DocumentScenariosUrlResult = [], VendorIds = [], Supplier = [], RoundsData = [], SupplierDetails = [],
                VendorNames = [], DocSupplierBidItems = [], PaymentDetails = [], SupplierCount1 = [], SupplierCountValue = [], SupplierWithRounds = [], SupplierDataWithRounds = [],
                ItemsDetails = [], VendorDetailsArr = [], ItemsPrice = [], EventHistory = [], GeneralDetailsArr = [], NfaVendorDataArr = [], NfaVendorItems = [];

            //Initialize as Objects
            var SupplierInvitationsUrlResult = {}, SupplierCount = {}, SupplierRounds = {};

            //Initialize as Empty 
            var SourcingProjectDescription = "", SourcingProjectBaseLinespend = "", DocumentScenariosTotAwardPrice = "", DocumentScenariosTotAwardSavings = "", SupplierName = "", VendorID = "", PVCode = "", SmID = "", SupplierData = "", GstNo = "", CEScore = "", SupplierAdress = "", SupplierStreetName = "", SupplierRegion = "", SupplierPostalCode = "", SupplierCity = "", SupplierHouseID = "", SupplierCountry = "",
                SupplierContactPhone = "", SupplierMobilePhone = "", SupplierMail = "", SupplierLastName = "", SupplierFirstName = "", SupplierContact = "", SubmissionDate = "", DocSupBidInvitationID = "", PayDate = "", AmendmentValue = "", SupplierValueAmount = "", SupplierValueCurrency = "",
                ExistingPoNumberValue = "", TotalNFAAmount = "", TotalNFAAmountCurrency = "", ContractPeriodValue = "", BudgetValue = "", OrderTypePartiesValue = "", FormattedTotalNFAAmount = "", FormattedSupplierValueAmount = "", RationalValue = "",
                VendorsTurnOverAmount = "", VendorsTurnOverCurrency, FormattedVendorsTurnOverAmount = "", VendorsSpendAmount = "", VendorsSpendCurrency = "", FormattedVendorsSpendAmount = "", RationalToDependentPartnerValue = "", NewInitiativeBestPracticesValue = "", NegotiationCommitteValue = "", InternalSLAsKPIsValue = "",
                ContractBasicValue = "", ImportSupplyProposal = "", FTAEPCGValue = "", MonthlyQuantityValue = "", PostFactoNfaReasonValue = "", BusinessPlanPricingValue = "",
                CLPPLastPurchaseAmount = "", CLPPLastPurchaseCurrency = "", FormattedCLPPLastPurchaseAmount = "", PriceJustificationValue = "", CardinalRulesValue = "", DeviationListValue = "", TermsOfPaymentValue = "", PackagingForwardingValue = "", LogisticsAmount = "", LogisticsCurrency = "", FormattedLogisticsAmount = "", InsuranceValue = "",
                PenaltyQualityValue = "", PenaltyCriteriaValue = "", DeliveryLeadTimeValue = "", LiquidatedDamagesValue = "", LiquidatedDamagesClValue = "", PBGAndSDValue = "", PBGAndSDClValue = "", PenaltyForSafetySubcontractValue = "", OtherKeyTermsValue = "", RationaleL1Value = "", PricesValue = "", ApprovingPlant = "",
                VendorName = "", VendorAddress = "", VendorInvitationId = "", VendorUserId = "", FormattedDutyAmountINR = "", SourcingProjectBaseLineCurrency = "", SubjectOfProposalOrder = "", SourcingProjectCreateDate = "", SubjectofProposalOROrder = "", DocumentItemsUrlResult = "", savingsTerms = "", HistoricalAmount = "", CurrentAmount = "", Savings = "";
            /////-----------------VAR-----------------/////

            //Initialize as Numbers
            var DocumentScenariosSupCount = 0, VendorCount = 0, NoOfDocs = 0, pageNo = 0

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
                    AuctionDone = DocumentUrlResult.eventTypeName === "Auction" ? "yes" : "no";
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
                        // WorkerPromises.push(createWorker(DocumentItemsUrl.replace('<docId>', DocId), DocumentBase, 'DocumentItemsUrl'))
                        WokerThreadsResults = await Promise.all(WorkerPromises);
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
                                        ProjectId = result.internalId;
                                        TemplateProjectTitle = result.templateProjectTitle;
                                        BeginDate = result.beginDate;
                                        ProjectCurrencyBaseCurrency = result.currency;

                                        break;
                                    case 'DocumentScenariosUrl':
                                        if (result.payload[0].eventId && !(result instanceof Error)) {
                                            DocumentScenariosSupCount = result.payload[0].selectedSuppliersCount || "";
                                            DocumentScenariosUrlResult = result;
                                            DocumentScenariosTotAwardPrice = returnamt(result.payload[0].totalAwardPrice.amount)
                                            DocumentScenariosTotAwardSavings = returnamt(result.payload[0].totalAwardSavings.difference.amount)
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
                                        VendorId: SupplierData.vendorInfo.acmId,
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
                                        SupplierContact: SupplierContact,
                                        SupplierFinalAddress: `${SupplierStreetName}, ${SupplierRegion}, ${SupplierPostalCode}, ${SupplierCountry}`
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
                                SupplierBidName = Questions.path.split(" ")[1];
                                if (Questions && Array.isArray(Questions.payload) && Questions.payload.length > 0) {
                                    for (const DocSuppBidItem of Questions.payload) {
                                        const DocSuppBidItemTitle = DocSuppBidItem.item.title;
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
                        //Array for (Supplier Count For that particular DocID)
                        SupplierCountValue.push({
                            SupplierCount: SupplierCount1.length,
                            DocId: DocId
                        })
                        VendorNames = [];
                        SupplierCount1 = [];
                        VendorCount = 0;

                        ////akshay and ajay
                        ////////////////************Vendor Details********************///////////////////////
                        for (var a = 0; a < WokerThreadsResults.length; a++) {
                            if (WokerThreadsResults[a].path == 'DocumentSupplierInvitationsUrl') {
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

                        }


                        /////////////********STORING MAX ROUND***************/////////////
                        RoundsPayload = RoundsData.payload.map(item => item.roundNumber);
                        const MaxRound = RoundsPayload.length > 0 ? Math.max(...RoundsPayload) : 0;
                        const AllSuppliers = Array.from(
                            new Set(RoundsData.payload.flatMap(p => p.suppliers))
                        );
                        RoundsData.payload.forEach(round => {
                            round.suppliers.forEach(supplier => {
                                SupplierWithRounds.push({
                                    Supplier: supplier,
                                    Rounds: round.roundNumber
                                });
                            });
                        });

                        console.log(SupplierWithRounds);



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
                        var Item, UnitPrice, SupplierItemId, ItemPrice, ItemPrice1, ItemCurrency, UnitOfMeasure, DiscountPercentage, UnitOfMeasureCode, OrginalQuote, FinalQuote, VendorLocation, OrderAmountOrSplitOrderAmount, Disount, Rank, ItemsWithBid = [];

                        SupplierDataWithRounds.forEach(supplierRound => {
                            const [Supplier, Round, Id] = supplierRound.path.split(" ");

                            supplierRound.payload.forEach(payloadItem => {
                                if (!("itemsWithBid" in payloadItem)) return;

                                payloadItem.itemsWithBid.forEach(itemId => {
                                    const itemData = supplierRound.payload.find(p => p.item.itemId === itemId);
                                    if (!itemData) return;

                                    const { title: ItemName, terms, itemId: SupplierItemId } = itemData.item;
                                    const ItemDescription = itemData.item.itemData?.Description?.value || "";
                                    const BidRank = itemData.bidRank || null;

                                    let ItemPrice, UnitOfMeasure, UnitOfMeasureCode, DiscountPercentage, ItemPriceCurrency, ExtendedPrice, ExtendedPriceCurrency;

                                    terms.forEach(term => {
                                        if (term.title === "Total Cost") {
                                            ItemPrice = term.value.moneyValue.amount;
                                            ItemPriceCurrency = term.value.moneyValue.currency;
                                            ItemPrice = `${parseFloat(ItemPrice)} ${ItemPriceCurrency}`;
                                        }
                                        if (term.title === "Extended Price") {
                                            ExtendedPrice = term.value.moneyValue.amount;
                                            ExtendedPriceCurrency = term.value.moneyValue.currency;
                                            ExtendedPrice = `${parseFloat(ExtendedPrice)} ${ExtendedPriceCurrency}`;
                                        }
                                        if (term.title === "Quantity") {
                                            UnitOfMeasure = term.value.quantityValue.amount;
                                            UnitOfMeasureCode = term.value.quantityValue.unitOfMeasureCode;
                                        }
                                        if (term.title === "Discount Percentage") {
                                            DiscountPercentage = term.value.bigDecimalValue;
                                        }
                                        if (term.title === "Tax %") {
                                            TaxPercentage = term.value.bigDecimalValue;
                                        }
                                        if (term.title === "Freight") {
                                            Freight = term.value.moneyValue.amount;
                                        }
                                    });
                                    const numericPrice = parseFloat(ItemPrice.split(" ")[0]);
                                    const UnitPrice = (numericPrice / UnitOfMeasure).toFixed(2);;

                                    ItemsDetails.push({
                                        SupplierId: Id,
                                        Supplier,
                                        Round,
                                        ItemId: SupplierItemId,
                                        ItemName,
                                        ItemDescription,
                                        ItemPrice,
                                        ExtendedPrice,
                                        UnitOfMeasure,
                                        UnitOfMeasureCode,
                                        UnitPrice,
                                        DiscountPercentage,
                                        BidRank,
                                        TaxPercentage,
                                        Freight
                                    });
                                });
                            });
                        });
                        const group = {}
                        ItemsDetails.forEach(item => {
                            const key = `${item.Round}-${item.ItemId}`;
                            if (!group[key]) group[key] = [];
                            group[key].push(item);
                        });

                        Object.values(group).forEach(group => {
                            // Sort ascending by numeric ItemPrice
                            group.sort((a, b) => parseFloat(a.ItemPrice.split(" ")[0]) - parseFloat(b.ItemPrice.split(" ")[0]));

                            group.forEach((item, index) => {
                                item.BidRank = index + 1; // lowest price = rank 1
                            });
                        });
                        var UniqueItemIds = [];

                        // ... after finishing all pushes into ItemsDetails
                        UniqueItemIds = [...new Set(ItemsDetails.map(item => item.ItemId))];
                        const mergedArray = ItemsDetails.map(item => {
                            const vendor = VendorDetailsArr.find(v => v.VendorInvitationId === item.SupplierId);
                            return {
                                ...item,
                                ...(vendor || {})
                            };
                        });

                        const seen = new Set();
                        const uniqueMergedArray = mergedArray.filter(item => {
                            // key does NOT include ItemPrice
                            const key = `${item.ItemName}|${item.Round}|${item.SupplierId}|${item.VendorName}`;
                            return seen.has(key) ? false : seen.add(key);
                        });
                        console.log(mergedArray);
                        const grouped = uniqueMergedArray.reduce((acc, item) => {
                            if (!acc[item.SupplierId]) acc[item.SupplierId] = [];
                            acc[item.SupplierId].push(item);
                            return acc;
                        }, {});

                        // Step 3: Build final result with MinRound + MaxRound + VendorIds + DocSupplierBidItems
                        const finalResult = Object.entries(grouped).flatMap(([supplierId, items]) => {
                            // Sort rounds numerically
                            const sorted = items.sort((a, b) => Number(a.Round) - Number(b.Round));

                            // Vendor master data (from VendorIds)
                            const vendor = VendorIds.find(v => v.VendorInvitationID === supplierId);

                            // Doc bid items (all questions)
                            const doc = DocSupplierBidItems.find(d => d.SupplierBidName === supplierId);

                            // Return all rounds for this supplier
                            return sorted.map(round => ({
                                SupplierId: supplierId,
                                Round: round.Round,              // keep round number
                                ...round,                        // spread original round details

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
                            }));
                        });
                        console.log(finalResult);

                        // sai


                        // console.log(UniqueItemIds)
                        // pageNo = pageNo + 1;
                        // var DocumentItemsUrlBody = {
                        //     ...DocumentBase,
                        //     url: DocumentItemsUrl.replace('<docId>', DocId).replace('<pageNo>', pageNo)
                        //     // url:"https://openapi.au.cloud.ariba.com/api/sourcing-event/v2/prod/events/Doc85641604/items/pages/1"
                        // }


                        // var DocumentItemsUrlResult = await NfaAriba.post('/', DocumentItemsUrlBody)



                        var pageNo = 1;                     // Start from page 1
                        var allPagesResult = [];             // Store payload of each page

                        // Loop until all UniqueItemIds are found or no more pages
                        while (UniqueItemIds.length > 0) {

                            // Build the request body for this page
                            var DocumentItemsUrlBody = {
                                ...DocumentBase,
                                url: DocumentItemsUrl
                                    .replace('<docId>', DocId)
                                    .replace('<pageNo>', pageNo)
                            };

                            console.log("Fetching page:", pageNo, DocumentItemsUrlBody.url);

                            // Call API (simulate with NfaAriba.post)
                            var DocumentItemsUrlResult = await NfaAriba.post('/', DocumentItemsUrlBody);

                            // Get the payload for this page
                            var payload = DocumentItemsUrlResult.payload || [];

                            // Stop if payload is empty (no more pages)
                            if (payload.length === 0) {
                                console.log("No more items in API. Stopping.");
                                break;
                            }

                            // Store this page's payload
                            allPagesResult.push(payload);

                            // Get itemIds from this page
                            var pageItemIds = payload.map(function (item) {
                                return item.itemId;
                            });

                            // Check which UniqueItemIds are found on this page
                            var foundIds = pageItemIds.filter(function (id) {
                                return UniqueItemIds.includes(id);
                            });

                            console.log("Found on this page:", foundIds);

                            // Remove found IDs from UniqueItemIds
                            UniqueItemIds = UniqueItemIds.filter(function (id) {
                                return !foundIds.includes(id);
                            });

                            console.log("Remaining IDs to find:", UniqueItemIds);

                            // Increment page number to fetch next page
                            pageNo++;
                        }

                        // At the end, allPagesResult contains the payload of all fetched pages
                        console.log("All pages fetched:", allPagesResult);

                        //sai
                        allPagesResult.forEach(array => {
                            console.log(array)
                            debugger

                            for (let i = 0; i < array.length; i++) {
                                if (array[i].title == "SBU Unit Location") {
                                    SbuUnitLocation = array[i].terms[0].value.simpleValue;
                                }
                                if (array[i].title == "Approving Plant") {
                                    ApprovingPlantItem = array[i].terms[0].value.simpleValue;
                                }
                                var ItemQuantity, ItemPrice, ItemImproviseAmount;
                                if (array[i].commodity) {
                                    for (let j = 0; j < array[i].terms.length; j++) {
                                        if (array[i].terms[j].title === 'Quantity') {
                                            ItemQuantity = array[i].terms[j].value.quantityValue.amount + ' ' + array[i].terms[j].value.quantityValue.unitOfMeasureCode;
                                            // quantity_int = ItemResp.payload[i].terms[j].value.quantityValue.amount;
                                        }
                                        if (array[i].terms[j].title === 'Price') {
                                            ItemPrice = array[i].terms[j].historyValue.moneyValue.amount + ' ' + array[i].terms[j].historyValue.moneyValue.currency;
                                            // Price_int = ItemResp.payload[i].terms[j].historyValue.moneyValue.amount;
                                        }
                                        if (array[i].terms[j].title === 'Unit Cost') {
                                            ItemImproviseAmount = array[i].terms[j].itemBiddingRules.revisedBidRule.absoluteImprovement;
                                        }
                                    }
                                    if (ItemQuantity === 0 || ItemPrice === 0) {
                                        continue;
                                    }
                                    ItemsPrice.push({
                                        quantity: ItemQuantity,
                                        Price: ItemPrice,
                                        improvise_amount: ItemImproviseAmount,
                                        ItemId: array[i].itemId,
                                        ItemName: array[i].title
                                    })
                                    ItemQuantity = "";
                                    ItemPrice = "";
                                    ItemImproviseAmount = "";
                                }


                            }
                        });





                        // Create a lookup map from ItemsPrice for faster access
                        const priceMap = {};
                        ItemsPrice.forEach(item => {
                            priceMap[item.ItemId] = item.Price; // you can store more info if needed
                        });
                        ItemsPrice = ItemsPrice.map(item => {
                            const matchedItem = DocumentItemsUrlResult.payload.find(
                                docItem => docItem.itemId === item.ItemId
                            );

                            return {
                                ...item,
                                itemname: matchedItem ? matchedItem.title : null
                            };
                        });
                        const roundsSummary = RoundsData.payload.map(round => ({
                            roundNumber: round.roundNumber,
                            suppliersCount: round.suppliers.length,
                            suppliers: round.suppliers,
                            biddingStartDate: round.biddingStartDate,
                            biddingEndDate: round.biddingEndDate
                        }));

                        debugger
                        const lastRound = roundsSummary[roundsSummary.length - 1];
                        const lastRoundEndDate = new Date(lastRound.biddingEndDate);

                        // Calculate difference in milliseconds
                        const diffMs = lastRoundEndDate - new Date(DocumentUrlCreateDate);

                        // Full days gap
                        const diffDays = Math.floor(diffMs / (1000 * 60 * 60 * 24));
                        const RfpPublishDateFinal = returndate(RfpPublishDate)
                        ///////////////GENERAL DETAILS///////////////////////
                        GeneralDetailsArr.push({
                            NfaNumber: String(DocId).trim(),
                            BUORPurchasingGroup: "",                                // was BUPurchasingGroup
                            Status: "New",
                            ProjectDescription: SourcingProjectDescription,
                            SubjectofProposalOROrder: SubjectofProposalOROrder,    // corrected key
                            ApprovingPlant: ApprovingPlantItem,
                            BaseLineSpend: SourcingProjectBaseLinespend,           // corrected key
                            ProjectCurrencyORBaseCurrency: ProjectCurrencyBaseCurrency, // corrected key
                            FinalProposedValue: DocumentScenariosTotAwardPrice,
                            SavingsAchievedBtwInitialAndFinalQuote: DocumentScenariosTotAwardSavings, // corrected key
                            RfpNumber: ProjectID,                                  // corrected key
                            RfpPublishDate: RfpPublishDateFinal,                        // corrected key
                            TimeTakenForFinalizationDASHInDAYS: diffDays,          // corrected key
                            AuctionDone: AuctionDone,
                            TaskId: TaskID,
                            SBUUnitLocation: SbuUnitLocation
                        });

                        console.log("GeneralDetailsArr", GeneralDetailsArr);
                        //INSERTING GENERAL DETAILS
                        for (const entry of GeneralDetailsArr) {
                            console.log('typeOF', typeof (entry.NfaNumber));
                            console.log('isIT', entry.NfaNumber);
                            const existing = await SELECT.from(NfaDetails).where({ NfaNumber: entry.NfaNumber });
                            console.log("existing", existing);
                            if (existing.length > 0) {
                                // record exists → update it
                                await UPDATE(NfaDetails)
                                    .set(entry)
                                    .where({ NfaNumber: entry.NfaNumber });
                            } else {
                                // record does not exist → insert it
                                const insertGeneral = await INSERT.into(NfaDetails).entries(entry);
                                console.log('insertGeneral', insertGeneral);
                            }
                        }



                        debugger
                        ///////////////////////VENDOR DETAILS//////////////////////////

                        function transformForSchema(finalResult) {
                            let vendors, vendorKey, row;

                            vendors = {};

                            for (let i = 0; i < finalResult.length; i++) {
                                row = finalResult[i];
                                vendorKey = row.SupplierId;

                                if (!vendors[vendorKey]) {
                                    // vendor-level (parent) fields
                                    vendors[vendorKey] = {
                                        SupplierId: row.SupplierId,
                                        VendorName: row.VendorName,
                                        VendorAddress: row.VendorAddress,
                                        VendorInvitationId: row.VendorInvitationId,
                                        VendorUserId: row.VendorUserId,
                                        VendorLocation: row.VendorLocation,
                                        ErpVendorId: row.ErpVendorId,
                                        SmVendorId: row.SmVendorId,
                                        SupplierBidName: row.SupplierBidName,
                                        DocSupBidInvitationID: row.DocSupBidInvitationID,
                                        PayDate: row.PayDate,
                                        BudgetValue: row.BudgetValue,
                                        OrderTypePartiesValue: row.OrderTypePartiesValue,
                                        RationalValue: row.RationalValue,
                                        FTAEPCGValue: row.FTAEPCGValue,
                                        FormattedDutyAmountINR: row.FormattedDutyAmountINR,
                                        TermsOfPaymentValue: row.TermsOfPaymentValue,
                                        PackagingForwardingValue: row.PackagingForwardingValue,
                                        DeliveryLeadTimeValue: row.DeliveryLeadTimeValue,
                                        OtherKeyTermsValue: row.OtherKeyTermsValue,
                                        AmendmentValue: row.AmendmentValue,
                                        FormattedSupplierValueAmount: row.FormattedSupplierValueAmount,
                                        ExistingPoNumberValue: row.ExistingPoNumberValue,
                                        FormattedTotalNFAAmount: row.FormattedTotalNFAAmount,
                                        ContractPeriodValue: row.ContractPeriodValue,
                                        FormattedVendorsTurnOverAmount: row.FormattedVendorsTurnOverAmount,
                                        FormattedVendorsSpendAmount: row.FormattedVendorsSpendAmount,
                                        RationalToDependentPartnerValue: row.RationalToDependentPartnerValue,
                                        NewInitiativeBestPracticesValue: row.NewInitiativeBestPracticesValue,
                                        NegotiationCommitteValue: row.NegotiationCommitteValue,
                                        InternalSLAsKPIsValue: row.InternalSLAsKPIsValue,
                                        ContractBasicValue: row.ContractBasicValue,
                                        ImportSupplyProposal: row.ImportSupplyProposal,
                                        MonthlyQuantityValue: row.MonthlyQuantityValue,
                                        PostFactoNfaReasonValue: row.PostFactoNfaReasonValue,
                                        BusinessPlanPricingValue: row.BusinessPlanPricingValue,
                                        FormattedCLPPLastPurchaseAmount: row.FormattedCLPPLastPurchaseAmount,
                                        PriceJustificationValue: row.PriceJustificationValue,
                                        CardinalRulesValue: row.CardinalRulesValue,
                                        DeviationListValue: row.DeviationListValue,
                                        FormattedLogisticsAmount: row.FormattedLogisticsAmount,
                                        InsuranceValue: row.InsuranceValue,
                                        PenaltyQualityValue: row.PenaltyQualityValue,
                                        PenaltyCriteriaValue: row.PenaltyCriteriaValue,
                                        LiquidatedDamagesValue: row.LiquidatedDamagesValue,
                                        LiquidatedDamagesClValue: row.LiquidatedDamagesClValue,
                                        PBGAndSDValue: row.PBGAndSDValue,
                                        PBGAndSDClValue: row.PBGAndSDClValue,
                                        PenaltyForSafetySubcontractValue: row.PenaltyForSafetySubcontractValue,
                                        RationaleL1Value: row.RationaleL1Value,
                                        PricesValue: row.PricesValue,
                                        ApprovingPlant: row.ApprovingPlant,
                                        NfaVendorItemsDetails: []
                                    };
                                }

                                // child-level (items) → push into details
                                vendors[vendorKey].NfaVendorItemsDetails.push({
                                    Round: row.Round,
                                    ItemId: row.ItemId,
                                    ItemName: row.ItemName,
                                    ItemPrice: row.ItemPrice,
                                    ExtendedPrice: row.ExtendedPrice,
                                    UnitOfMeasure: row.UnitOfMeasure,
                                    UnitPrice: row.UnitPrice,
                                    BidRank: row.BidRank,
                                    DiscountPercentage: row.DiscountPercentage,
                                    TaxPercentage: row.TaxPercentage,
                                    Freight: row.Freight
                                });
                            }

                            return Object.values(vendors);
                        }

                        // Declare variable to store the transformed data
                        let finalTransformedResult;

                        finalTransformedResult = transformForSchema(finalResult);

                        console.log("finalTransformedResult", finalTransformedResult);
                        console.log("finalResult", finalResult);

                        const transformedResultPerRound = [];

                        finalTransformedResult.forEach(vendor => {
                            const matchedSupplier = SupplierDetails.find(s => s.VendorId === vendor.SupplierId);

                            // Group items by round
                            const roundsMap = {};
                            vendor.NfaVendorItemsDetails.forEach(item => {
                                if (!roundsMap[item.Round]) roundsMap[item.Round] = [];
                                roundsMap[item.Round].push(item);
                            });

                            Object.keys(roundsMap).forEach(roundNumber => {
                                const itemsOfRound = roundsMap[roundNumber];

                                // Compute OrderAmountOrSplitOrderAmount based on Rank=1
                                let orderAmount = 0;

                                itemsOfRound.forEach(item => {
                                    // Compare with all vendors for the same round and item
                                    finalTransformedResult.forEach(otherVendor => {
                                        const otherItems = otherVendor.NfaVendorItemsDetails.filter(
                                            i => i.Round === roundNumber && i.ItemId === item.ItemId
                                        );
                                        otherItems.forEach(i => {
                                            if (otherVendor.SupplierId === vendor.SupplierId && i.BidRank === 1) {
                                                // Current vendor has rank 1 for this item
                                                const extendedPriceNum = parseFloat(i.ExtendedPrice.toString().replace(/[^0-9.]/g, "")) || 0;
                                                orderAmount += extendedPriceNum;
                                            }
                                        });
                                    });
                                });

                                const spendAmount = vendor.FormattedVendorsSpendAmount || 0;
                                const turnoverAmount = vendor.FormattedVendorsTurnOverAmount || 1;
                                const isVendorDependency = (spendAmount / turnoverAmount) * 100;

                                // Push parent-round object
                                transformedResultPerRound.push({
                                    ProposedVendorCode: vendor.SupplierId,
                                    NfaNumber: DocId,
                                    round: parseInt(roundNumber, 10),
                                    AwardedVendor: "",
                                    VendorName: vendor.VendorName,
                                    VendorLocation: matchedSupplier ? matchedSupplier.SupplierFinalAddress : null,
                                    OrderAmountOrSplitOrderAmount: orderAmount, // sum of ExtendedPrice for rank 1 items
                                    // DiscountPercentage: vendor.DiscountPercentage,
                                    AmendmentInExistingPoArcContract: vendor.AmendmentValue,
                                    PricingInBusinessPlanIfApplicable: vendor.BusinessPlanPricingValue,
                                    PriceJustification: vendor.PriceJustificationValue,
                                    DeviationsfromGroupPhilosophyCardinalRules: vendor.CardinalRulesValue,
                                    ListOfDeviation: vendor.DeviationListValue,
                                    PenaltyClauseForQuality: vendor.PenaltyQualityValue,
                                    PenaltyCriteria: vendor.PenaltyCriteriaValue,
                                    RationaleIfNotL1: vendor.RationaleL1Value,
                                    AmendmentValueTotalNfaAmount: vendor.AmendmentValue,
                                    Budget: vendor.BudgetValue,
                                    RationalForNotDoingAuction: vendor.RationalValue,
                                    IsAnyNewInitiativeBestpractices: vendor.NewInitiativeBestPracticesValue,
                                    NegotiationCommittee: vendor.NegotiationCommitteValue,
                                    IsThereAnyImportSupplyUnderThisProposal: vendor.ImportSupplyProposal,
                                    LastPurchasePriceClpp: vendor.FormattedCLPPLastPurchaseAmount,
                                    ContractPeriod: vendor.ContractPeriodValue,
                                    OrderTypePartiesContactedAndTechnicallyAccepted: vendor.OrderTypePartiesValue,
                                    IsVendorDependency: isVendorDependency,
                                    VendorsLatestAvailableTurnover: vendor.FormattedVendorsTurnOverAmount,
                                    TotalVendorSpendforCurrentFY: vendor.FormattedVendorsSpendAmount,
                                    InternalSLAsKPIsForTheContract: vendor.InternalSLAsKPIsValue,
                                    ContractValueBasicValue: vendor.ContractBasicValue,
                                    FTAEPCGAnyOtherBenefitAvailedForDutySaving: vendor.FTAEPCGValue,
                                    ApproximateDutyAmountInINR: vendor.FormattedDutyAmountINR,
                                    MonthlyQuantity: vendor.MonthlyQuantityValue,
                                    ReasonForPostFactoNFAIfApplicable: vendor.PostFactoNfaReasonValue,
                                    TermsOfPaymentMilestoneOnwhichPaymentWillBemade: vendor.TermsOfPaymentValue,
                                    PackingForwarding: vendor.PackagingForwardingValue,
                                    Insurance: vendor.InsuranceValue,
                                    LiquidatedDamages: vendor.LiquidatedDamagesValue,
                                    LiquidatedDamagesClause: vendor.LiquidatedDamagesClValue,
                                    PbgAndSd: vendor.PBGAndSDValue,
                                    PbgAndSdClause: vendor.PBGAndSDClValue,
                                    JobClearanceCertificates: "",
                                    HrClearanceCertificates: "",
                                    OtherKeyTerms: vendor.OtherKeyTermsValue,
                                    RationalForAwardingContractToDependentPartner: vendor.RationalToDependentPartnerValue,
                                    DeliveryLeadTime: vendor.DeliveryLeadTimeValue,
                                    NfaVendorItemsDetails: itemsOfRound // only items of this round
                                });
                            });
                        });


                        // Now transformedResultPerRound contains parent-level vendors split by round

                        //Rounds 
                        console.log("transformedResultPerRound", transformedResultPerRound);


                        // finalResult.forEach(vendor => {
                        //     // Find the vendor location once from SupplierDetails
                        //     const matchedSupplier = SupplierDetails.find(
                        //         s => s.VendorId === vendor.SupplierId
                        //     )
                        //     const spendAmount = vendor.FormattedVendorsSpendAmount || 0;
                        //     const turnoverAmount = vendor.FormattedVendorsTurnOverAmount || 1; // avoid divide by zero
                        //     const isVendorDependency = (spendAmount / turnoverAmount) * 100;

                        //     NfaVendorDataArr.push({
                        //         ProposedVendorCode: vendor.SupplierId,
                        //         NfaNumber: DocId,
                        //         round: vendor.Round,
                        //         AwardedVendor: "",
                        //         VendorName: vendor.VendorName,
                        //         VendorLocation: matchedSupplier ? matchedSupplier.SupplierFinalAddress : null,
                        //         OrderAmountOrSplitOrderAmount: vendor.ItemPrice,
                        //         DiscountPercentage: vendor.DiscountPercentage,
                        //         AmendmentInExistingPoArcContract: vendor.AmendmentValue,
                        //         PricingInBusinessPlanIfApplicable: vendor.BusinessPlanPricingValue,
                        //         PriceJustification: vendor.PriceJustificationValue,
                        //         DeviationsfromGroupPhilosophyCardinalRules: vendor.CardinalRulesValue,
                        //         ListOfDeviation: vendor.DeviationListValue,
                        //         PenaltyClauseForQuality: vendor.PenaltyQualityValue,
                        //         PenaltyCriteria: vendor.PenaltyCriteriaValue,
                        //         RationaleIfNotL1: vendor.RationaleL1Value,
                        //         AmendmentValueTotalNfaAmount: vendor.AmendmentValue,
                        //         Budget: vendor.BudgetValue,
                        //         RationalForNotDoingAuction: vendor.RationalValue,
                        //         IsAnyNewInitiativeBestpractices: vendor.NewInitiativeBestPracticesValue,
                        //         NegotiationCommittee: vendor.NegotiationCommitteValue,
                        //         IsThereAnyImportSupplyUnderThisProposal: vendor.ImportSupplyProposal,
                        //         LastPurchasePriceClpp: vendor.FormattedCLPPLastPurchaseAmount,
                        //         ContractPeriod: vendor.ContractPeriodValue,
                        //         OrderTypePartiesContactedAndTechnicallyAccepted: vendor.OrderTypePartiesValue,
                        //         IsVendorDependency: isVendorDependency,
                        //         VendorsLatestAvailableTurnover: vendor.FormattedVendorsTurnOverAmount,
                        //         TotalVendorSpendforCurrentFY: vendor.FormattedVendorsSpendAmount,
                        //         InternalSLAsKPIsForTheContract: vendor.InternalSLAsKPIsValue,
                        //         ContractValueBasicValue: vendor.ContractBasicValue,
                        //         FTAEPCGAnyOtherBenefitAvailedForDutySaving: vendor.FTAEPCGValue,
                        //         ApproximateDutyAmountInINR: vendor.FormattedDutyAmountINR,
                        //         MonthlyQuantity: vendor.MonthlyQuantityValue,
                        //         ReasonForPostFactoNFAIfApplicable: vendor.PostFactoNfaReasonValue,
                        //         TermsOfPaymentMilestoneOnwhichPaymentWillBemade: vendor.TermsOfPaymentValue,
                        //         PackingForwarding: vendor.PackagingForwardingValue,
                        //         Insurance: vendor.InsuranceValue,
                        //         LiquidatedDamages: vendor.LiquidatedDamagesValue,
                        //         LiquidatedDamagesClause: vendor.LiquidatedDamagesClValue,
                        //         PbgAndSd: vendor.PBGAndSDValue,
                        //         PbgAndSdClause: vendor.PBGAndSDClValue,
                        //         JobClearanceCertificates: "",
                        //         HrClearanceCertificates: "",
                        //         OtherKeyTerms: vendor.OtherKeyTermsValue,
                        //         RationalForAwardingContractToDependentPartner: vendor.RationalToDependentPartnerValue,
                        //         DeliveryLeadTime: vendor.DeliveryLeadTimeValue
                        //     });

                        // })
                        // console.log(NfaVendorDataArr)


                        // for (const entry of NfaVendorDataArr) {
                        //     // Ensure keys match CDS data types (strings/Int16)
                        //     entry.ProposedVendorCode = String(entry.ProposedVendorCode).trim();
                        //     entry.NfaNumber = String(entry.NfaNumber).trim();
                        //     entry.round = parseInt(entry.round, 10);


                        //     const existing = await SELECT.from(NfaVendorData)
                        //         .where({
                        //             ProposedVendorCode: entry.ProposedVendorCode,
                        //             NfaNumber: entry.NfaNumber,
                        //             round: entry.round
                        //         });

                        //     if (existing.length > 0) {
                        //         // Update existing record
                        //         await UPDATE(NfaVendorData)
                        //             .set(entry)
                        //             .where({
                        //                 ProposedVendorCode: entry.ProposedVendorCode,
                        //                 NfaNumber: entry.NfaNumber,
                        //                 round: entry.round
                        //             });
                        //         console.log(`Updated existing record: ${entry.NfaNumber}, ${entry.ProposedVendorCode}, round ${entry.round}`);
                        //     } else {
                        //         // Insert new record
                        //         await INSERT.into(NfaVendorData).entries(entry);
                        //         console.log(`Inserted new record: ${entry.NfaNumber}, ${entry.ProposedVendorCode}, round ${entry.round}`);
                        //     }
                        // }


                        ////////////////////////////////////VENDOR ITEM DETAILS/////////////////////////////////
                        ItemsDetails.forEach(item => {
                            NfaVendorItems.push({
                                NfaNumber: DocId,
                                ProposedVendorCode: item.SupplierId,
                                ItemCode: item.ItemId,
                                round: item.Round,
                                Rank: item.BidRank,
                                Freight: item.Freight,
                                ItemShortDescription: item.ItemDescription,
                                Uom: item.UnitOfMeasureCode,
                                Quantity: item.UnitOfMeasure,
                                UnitPrice: item.UnitPrice,
                                IndianTaxPER: item.TaxPercentage,
                            });
                        });

                        debugger



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