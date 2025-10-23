const cds = require('@sap/cds');
const { log } = require('node:console');
const { url } = require('node:inspector');
const path = require('path');
const fs = require('fs');
const xlsx = require('xlsx');
const { Worker, workerData, parentPort, isMainThread } = require('node:worker_threads');
// projectId = #WS79052482 ///// new one = #WS84836442 ////// #WS85279377
if (isMainThread) {
    module.exports = cds.service.impl(async function () {
        let {
            NfaDetails, NfaVendorData, NfaVendorItemsDetails, NfaWorkflowHistory, NfaVendorDueDeligenceDetails, NfaVendorDueDeligenceDetailsGrade, RulesApprovers
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

        //Due Dilegence api's Base
        const DueDiligenceUrlBase = {
            securityMaterial: "DueDilgence",
            query: "apikey=3TTrakeyAxb5iVfcZ9kdN4B9jMyyGxOJ&realm=PEOLSOLUTIONSDSAPP-T"
        };
        const DueDiligenceUrlFirstBase = {
            securityMaterial: "DueDilgence",
            query: "realm=PEOLSOLUTIONSDSAPP-T&apikey=3TTrakeyAxb5iVfcZ9kdN4B9jMyyGxOJ"
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

        //questioneries upda//items with pages
        var QuestionsUpdated = "https://openapi.au.cloud.ariba.com/api/sourcing-event/v2/prod/events/<docId>/items";

        //supplierBids
        var DocumentSupplierBidsUrl = "https://openapi.au.cloud.ariba.com/api/sourcing-event/v2/prod/events/<docId>/supplierBids/<sName>"

        //rounds
        var DocumentRoundsUrl = "https://openapi.au.cloud.ariba.com/api/sourcing-event/v2/prod/events/<docId>/rounds";

        //supplier data pagination api's
        var SupplierQuestionariesUrl = "https://openapi.au.cloud.ariba.com/api/supplierdatapagination/v4/prod//vendors/<vendorId>/workspaces/questionnaires/qna";

        //  Due Dilegence
        var DueDiligenceUrl = "https://openapi.au.cloud.ariba.com/api/supplierdatapagination/v4/prod/vendors/<vendorId>/workspaces/<WorkspaceId>/questionnaires/<QuestinonId>/qna";

        //  Due Dilegence first
        var DueDiligenceFirstUrl = "https://openapi.au.cloud.ariba.com/api/supplierdatapagination/v4/prod/vendors/<vendorId>/workspaces/questionnaires";

        /////////////*****NEW API TO CHECK VENDOR QUOTED AMOUNT IN EACH ROUND*********////////////////
        var SuppierBidsInRounds = "https://openapi.au.cloud.ariba.com/api/sourcing-event/v2/prod/events/<docId>/rounds/<roundNo>/supplierBids/<invitationId>"


        ///////////////////////////////////////Ariba URLS////////////////////////////////////////////

        // function returndate(input) {
        //     let a = input;
        //     let [y, m, d] = a.split('-');
        //     let jumbleDate = y + "/" + m + "/" + d
        //     return jumbleDate
        // }

        //  function getAllRounds(RoundsData) {
        //     // Normalize to array
        //     const roundsArray = Array.isArray(RoundsData)
        //         ? RoundsData
        //         : (RoundsData && Array.isArray(RoundsData.payload))
        //             ? RoundsData.payload
        //             : (RoundsData && typeof RoundsData === 'object')
        //                 ? Object.values(RoundsData)
        //                 : [];

        //     return roundsArray
        //         .map(r => ({
        //             roundNumber: Number(r.roundNumber),
        //             biddingStartDate: r.biddingStartDate,
        //             suppliers: r.suppliers,
        //             supplierCount: Array.isArray(r.suppliers) ? r.suppliers.length : 0
        //         }))
        //         .sort((a, b) => a.roundNumber - b.roundNumber);
        // }


        function returndate(input) {
            const date = new Date(input);
            if (isNaN(date)) return input; // fallback if invalid

            const y = date.getFullYear();
            const m = String(date.getMonth() + 1).padStart(2, "0");
            const d = String(date.getDate()).padStart(2, "0");

            return `${y}/${m}/${d}`;  // "2025/09/26"
        }


        function returndatenew(input) {
            const date = new Date(Number(input)); // ensure it's a number
            if (isNaN(date)) return input; // fallback if invalid

            const y = date.getFullYear();
            const m = String(date.getMonth() + 1); // month 1-12
            const d = String(date.getDate());      // day 1-31

            return `${d}/${m}/${y}`;  // e.g., "1/1/2010"
        }




        this.on('getDataForUserAndProject', async (req) => {
            debugger
            /////////////////////////////////////////Variables Declaration////////////////////////////////////////////////

            /////*****************LET*****************/////
            let SourcingProjectDocsBody, SourcingProjectDocsResult, DocId, DocumentUrlBody, DocumentUrlResult, Date1, Date2, DiffTime, DiffDays, NfaDetailsData = 0, WokerThreadsResults, WokerThreadsResults1, InsertNfaDetailsBody, ExistingNfaRecord, InsertQueryForNfaDetails, CurrentId, EventNo, Rounds, RfpPublishDate, BestSupplierID, participant, isVendorDependency;

            //Initialize as Array
            let InsertEntriesRounds = [], BestBidScenario = [], VendorsAwardedRecords = [], vendorSplitArray = [], itemsForCB = [];
            /////*****************LET*****************/////



            /////-----------------VAR-----------------/////
            var ProjectID, TaskID, projCurrency, WebPublishDate, ProjectId, TemplateProjectTitle, BeginDate, DocumentUrlFinalDate, DocumentUrlCreateDate, VendorID, RoundsPayload, LastId, SupplierCountRounds, BidRank, SupplierBidName, ProjectCurrencyBaseCurrency, ApprovingPlantItem, SbuUnitLocation, AuctionDone, TaxPercentage, Freight, SplitAmount, IsAwarded;

            //Initialize as Array
            var WorkerPromises = [], WorkerPromises1 = [], SupplierBidsWorker = [], DocumentScenariosUrlResult = [], VendorIds = [], Supplier = [], RoundsData = [], SupplierDetails = [],
                VendorNames = [], DocSupplierBidItems = [], PaymentDetails = [], SupplierCount1 = [], SupplierCountValue = [], SupplierWithRounds = [], SupplierDataWithRounds = [],
                ItemsDetails = [], VendorDetailsArr = [], ItemsPrice = [], EventHistory = [], GeneralDetailsArr = [], NfaVendorDataArr = [], NfaVendorItems = [], WorkflowHistory = [];

            //Initialize as Objects
            var SupplierInvitationsUrlResult = {}, SupplierCount = {}, SupplierRounds = {};

            //quetions
            let questionnaireArray = []; // your main array

            //Initialize as Empty 
            var SourcingProjectDescription = "", SourcingProjectBaseLinespend = "", DocumentScenariosTotAwardPrice = "", DocumentScenariosTotAwardSavings = "", SupplierName = "", VendorID = "", PVCode = "", SmID = "", SupplierData = "", GstNo = "", CEScore = "", SupplierAdress = "", SupplierStreetName = "", SupplierRegion = "", SupplierPostalCode = "", SupplierCity = "", SupplierHouseID = "", SupplierCountry = "",
                SupplierContactPhone = "", SupplierMobilePhone = "", SupplierMail = "", SupplierLastName = "", SupplierFirstName = "", SupplierContact = "", SubmissionDate = "", DocSupBidInvitationID = "", PayDate = "", AmendmentValue = "", SupplierValueAmount = "", SupplierValueCurrency = "",
                ExistingPoNumberValue = "", TotalNFAAmount = "", TotalNFAAmountCurrency = "", ContractPeriodValue = "", BudgetValue = "", OrderTypePartiesValue = "", FormattedTotalNFAAmount = "", FormattedSupplierValueAmount = "", RationalValue = "", Budget = "", HrClearanceCertificates = '', JobClearanceCertificates = '',
                VendorsTurnOverAmount = "", VendorsTurnOverCurrency, FormattedVendorsTurnOverAmount = "", VendorsSpendAmount = "", VendorsSpendCurrency = "", FormattedVendorsSpendAmount = "", RationalToDependentPartnerValue = "", NewInitiativeBestPracticesValue = "", NegotiationCommitteValue = "", InternalSLAsKPIsValue = "",
                ContractBasicValue = "", ImportSupplyProposal = "", FTAEPCGValue = "", MonthlyQuantityValue = "", PostFactoNfaReasonValue = "", BusinessPlanPricingValue = "",
                CLPPLastPurchaseAmount = "", CLPPLastPurchaseCurrency = "", FormattedCLPPLastPurchaseAmount = "", PriceJustificationValue = "", CardinalRulesValue = "", DeviationListValue = "", TermsOfPaymentValue = "", PackagingForwardingValue = "", LogisticsAmount = "", LogisticsCurrency = "", FormattedLogisticsAmount = "", InsuranceValue = "",
                PenaltyQualityValue = "", PenaltyCriteriaValue = "", DeliveryLeadTimeValue = "", LiquidatedDamagesValue = "", LiquidatedDamagesClValue = "", PBGAndSDValue = "", PBGAndSDClValue = "", PenaltyForSafetySubcontractValue = "", OtherKeyTermsValue = "", RationaleL1Value = "", PricesValue = "", ApprovingPlant = "",
                VendorName = "", VendorAddress = "", VendorInvitationId = "", VendorUserId = "", VendorsmVendorID = "", FormattedDutyAmountINR = "", SourcingProjectBaseLineCurrency = "", SubjectOfProposalOrder = "", SourcingProjectCreateDate = "", SubjectofProposalOROrder = "", DocumentItemsUrlResult = "", savingsTerms = "", HistoricalAmount = "", CurrentAmount = "", Savings = "",
                ExistingPoNumber = "", ExistingPoContractValue = "", ExistingPoContractCurrency = "", ProductServiceDescriptionBackground = "";
            /////-----------------VAR-----------------/////

            //Initialize as Numbers
            var DocumentScenariosSupCount = 0, VendorCount = 0, NoOfDocs = 0, pageNo = 0

            /////////////////////////////////////////Variables Declaration////////////////////////////////////////////////

            /////////////////////////////////// to check iflow ////////////////////////

            var SupplierQuestionariesBody = {
                ...SupplierQuestionariesBase,
                url: SupplierQuestionariesUrl.replace("<vendorId>", "S10753627")
            }

            /////////////////////////////////// to check iflow ////////////////////////
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
                console.log("jdhehwgewjhgkwegrjewgrkewjjgrewkrgewrwekgrew", SourcingProjectDocsResult.payload[0].type, SourcingProjectDocsResult.payload[0].status);

                if (SourcingProjectDocsResult.payload[0].type == 'RFx' && SourcingProjectDocsResult.payload[0].status != 'Draft') {
                    console.log("jdhehwgewjhgkwegrjewgrkewjjgrewkrgewrwekgrew")
                    DocId = SourcingProjectDocsResult.payload[0].internalId;
                    let extraFields = {
                        BaseLanguage: "",
                        Commodity: "",
                        Regions: "",
                        Departments: "",
                        Owner: "",
                        Version: "",
                        AnticipatedContractEffectiveDate: "",
                        TargetSavings: "",
                        LastModified: "",
                        Origin: "",
                        DueDeligenceStatus: false, // boolean
                        DueDeligenceOrigin: "None",
                        RiskCategory: "",
                        TotalSpend: ""
                    };
                    DocumentUrlBody = {
                        ...DocumentBase,
                        url: DocumentUrl.replace("<docId>", DocId)
                    }
                    DocumentUrlResult = await NfaAriba.post('/', DocumentUrlBody);
                    AuctionDone = DocumentUrlResult.eventTypeName === "Auction" ? "true" : "false";
                    if (DocumentUrlResult.pendingAwardApprovalTaskId) {
                        TaskID = DocumentUrlResult.pendingAwardApprovalTaskId
                        RfpPublishDate = DocumentUrlResult.createDate;
                        extraFields.BaseLanguage = SourcingProjectDocsResult.payload[0].baseLanguage;
                        extraFields.Version = SourcingProjectDocsResult.payload[0].docVersion;
                        // extraFields. = SourcingProjectDocsResult.payload[0].createDate;
                        extraFields.LastModified = SourcingProjectDocsResult.payload[0].lastModified;
                        extraFields.Owner = SourcingProjectDocsResult.payload[0].owner.name;

                    }
                    else {
                        console.log('No Data for this Project!');
                        return 'No Data for this Project!';

                    }

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
                    debugger

                    if (NfaDetailsData.length) {
                        console.log('RETURNING NFA NUMBER');
                        return NfaDetailsData[0].NfaNumber;
                    } else {
                        let isHr = false;
                        let isJob = false;
                        function returnamt(amt) {
                            let formattedamt = parseFloat(amt);
                            formattedamt = formattedamt.toLocaleString('en-IN');
                            return formattedamt;
                        }
                        WorkerPromises.push(createWorker(SourcingProjecturl.replace('<projectId>', ProjectID), SourcingProjectBase, 'SourcingProjectUrl'))
                        WorkerPromises.push(createWorker(SourcingProjectTeamsUrl.replace('<projectId>', ProjectID), SourcingProjectBase, 'SourcingProjectTeamsUrl'))
                        WorkerPromises.push(createWorker(DocumentScenariosUrl.replace('<docId>', DocId), DocumentBase, 'DocumentScenariosUrl'))
                        WorkerPromises.push(createWorker(DocumentSupplierInvitationsUrl.replace('<docId>', DocId), DocumentBase, 'DocumentSupplierInvitationsUrl'))
                        WorkerPromises.push(createWorker(QuestionsUpdated.replace('<docId>', DocId), DocumentBase, 'QuestionsUpdated'));
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
                                        extraFields.Commodity = result.commodities[0].name;
                                        extraFields.Regions = result.regions[0].name;
                                        extraFields.Departments = result.departments[0].name;
                                        extraFields.TargetSavings = result.targetSavingPct;

                                        break;
                                    case 'DocumentScenariosUrl':
                                        let index = -1;
                                        for (var i = 0; i < result.payload.length; i++) {
                                            if (result.payload[i].systemTag === 'BEST_BID') {
                                                index = i;
                                                break;
                                            }
                                        }
                                        if (index != -1 && result.payload[index].eventId && !(result instanceof Error)) {
                                            DocumentScenariosSupCount = result.payload[index].selectedSuppliersCount || "";
                                            DocumentScenariosUrlResult = result;
                                            BestBidScenario = DocumentScenariosUrlResult.payload.find(
                                                s => s.title === "Best Bid"
                                            );
                                            if (BestBidScenario) {
                                                VendorsAwardedRecords = BestBidScenario.scenarioSummary.participantSummaryList;

                                                VendorsAwardedRecords.forEach(VendorsAwardedRecord => {
                                                    BestSupplierID = VendorsAwardedRecord.supplier.systemID
                                                    // Find the "Total Cost" entry in rollupTermList
                                                    const totalCostEntry = VendorsAwardedRecord.rollupTermList.find(
                                                        term => term.title === "Total Cost"
                                                    );

                                                    let splitAmount = null;

                                                    if (totalCostEntry && totalCostEntry.value && totalCostEntry.value.moneyValue) {
                                                        splitAmount = totalCostEntry.value.moneyValue.amount;
                                                    }

                                                    // Push vendorId and splitAmount into array
                                                    vendorSplitArray.push({
                                                        vendorId: BestSupplierID,
                                                        splitAmount: splitAmount
                                                    });
                                                })
                                            }
                                            DocumentScenariosTotAwardPrice = returnamt(result.payload[index].totalAwardPrice.amount)
                                            DocumentScenariosTotAwardSavings = returnamt(
                                                result.payload[index]?.totalAwardSavings?.difference?.amount ?? 0
                                            );

                                            let extendedPriceTerms = result.payload[index].rollupTerms.filter(term => term.fieldId === "EXTENDEDPRICE");

                                            extendedPriceTerms.forEach(term => {
                                                HistoricalAmount = term.historyValue.moneyValue.amount;
                                                CurrentAmount = term.value.moneyValue.amount;
                                                Savings = HistoricalAmount - CurrentAmount; // will give the difference
                                            });

                                            SubjectofProposalOROrder = result.payload[index].title;
                                            let terms = result.payload[index].rollupTerms;
                                            for (let i = 0; i < terms.length; i++) {
                                                if (terms[i].title === 'Extended Price') {
                                                    extraFields.TotalSpend = terms[i].value.moneyValue.amount;
                                                }
                                            }
                                        }
                                        break;
                                    case 'QuestionsUpdated':
                                        DocumentItemsUrlResult = result;
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
                                        SupplierFinalAddress: `${SupplierStreetName}, ${SupplierRegion}, ${SupplierPostalCode}, ${SupplierCountry}`.split(',')
                                            .map(item => item.trim())    // remove leading/trailing spaces
                                            .filter(Boolean)             // remove empty strings
                                            .join(', ')                 // join back into a clean string
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

                            ///////////////////////questionaries////////////////////////////

                            // const DocSupplierBidItems = [];
                            var existingVendorEntry = [];
                            SupplierDetails.forEach(vendorResponse => {
                                const invitationId = vendorResponse.VendorId;

                                // Loop through each question/item in the payload
                                DocumentItemsUrlResult.payload.forEach(item => {
                                    if (!item.terms || item.terms.length === 0) return;
                                    if (!item.terms[0].participantInitialValues) return;

                                    const questionTitle = item.terms[0].title;
                                    const participantResponses = item.terms[0].participantInitialValues;

                                    // Loop through all vendor responses for this question
                                    // participantResponses.forEach(vendorResponse => {


                                    // Find the matching supplier
                                    const supplier = Supplier.find(s => s.SupplierName === invitationId);

                                    if (!supplier) return; // skip if vendor not found

                                    // Initialize or find existing entry for this vendor
                                    // let existingVendorEntry = DocSupplierBidItems.find(
                                    //     v => v.DocSupBidInvitationID === invitationId
                                    // );



                                    // if (!existingVendorEntry) {
                                    //     existingVendorEntry = {
                                    //         SupplierBidName: supplier.SupplierName,
                                    //         DocSupBidInvitationID: invitationId,
                                    //         SmVendorId: supplier.SmVendorId,
                                    //     };
                                    //     DocSupplierBidItems.push(existingVendorEntry);
                                    // }


                                    // Now handle based on question title
                                    // const responseValue = participantValue?.simpleValue || "";

                                    switch (questionTitle) {
                                        case "Amendment in Existing PO/ARC/Contract":
                                            participant = participantResponses.find(
                                                p => p.invitationId === invitationId
                                            );
                                            AmendmentValue = participant?.participantValue.simpleValue;
                                            break;

                                        case "Existing PO/ARC/Contract Value":
                                            participant = participantResponses.find(
                                                p => p.invitationId === invitationId
                                            );
                                            SupplierValueAmount = participant?.participantValue.moneyValue;
                                            SupplierValueCurrency = participant?.participantValue.moneyValue;
                                            FormattedSupplierValueAmount = `${parseFloat(SupplierValueAmount?.amount)} ${SupplierValueCurrency?.currency}`;
                                            break;

                                        case "Existing PO number":
                                            participant = participantResponses.find(
                                                p => p.invitationId === invitationId
                                            );
                                            ExistingPoNumberValue = participant?.participantValue.simpleValue;
                                            break;

                                        case "Amendment Value Total NFA Amount ( Contract Value): Incase of Amendment, please enter the total value including amendment+ tolerance value if Any)":
                                            participant = participantResponses.find(
                                                p => p.invitationId === invitationId
                                            );
                                            SupplierValueAmount = participant?.participantValue.moneyValue;
                                            SupplierValueCurrency = participant?.participantValue.moneyValue;
                                            FormattedTotalNFAAmount = `${parseFloat(SupplierValueAmount?.amount)} ${SupplierValueCurrency?.currency}`;
                                            break;

                                        case "Contract Period":
                                            participant = participantResponses.find(
                                                p => p.invitationId === invitationId
                                            );
                                            ContractPeriodValue = participant?.participantValue.simpleValue;
                                            break;

                                        case "Budget":
                                            participant = participantResponses.find(
                                                p => p.invitationId === invitationId
                                            );
                                            Budget = participant?.participantValue.simpleValue;
                                            break;

                                            //   existingVendorEntry.push({ invitationId, responseValue,questionTitle });
                                            break;
                                        case "Order Type Parties contacted and technically accepted ( Rational If on single vendor basis)":
                                            participant = participantResponses.find(
                                                p => p.invitationId === invitationId
                                            );
                                            OrderTypePartiesValue = participant?.participantValue.simpleValue;
                                            break;

                                        case "Rational for not doing auction,Is Price offer obtained before Auction (If Yes Kindly Attach the deviation approval obtained in NFA Supporting)":
                                            participant = participantResponses.find(
                                                p => p.invitationId === invitationId
                                            );
                                            RationalValue = participant?.participantValue.simpleValue;
                                            break;

                                        case "Vendors Latest Available Turnover ( In INR Cr.)":
                                            participant = participantResponses.find(
                                                p => p.invitationId === invitationId
                                            );
                                            SupplierValueAmount = participant?.participantValue.moneyValue;
                                            SupplierValueCurrency = participant?.participantValue.moneyValue;
                                            FormattedVendorsTurnOverAmount = `${parseFloat(SupplierValueAmount?.amount)} ${SupplierValueCurrency?.currency}`;
                                            break;

                                        case "Total Vendor Spend for Current FY (In INR Cr.) (Total Open value as on NFA date + Proposed annual value)":
                                            participant = participantResponses.find(
                                                p => p.invitationId === invitationId
                                            );
                                            SupplierValueAmount = participant?.participantValue.moneyValue;
                                            SupplierValueCurrency = participant?.participantValue.moneyValue;
                                            FormattedVendorsSpendAmount = `${parseFloat(SupplierValueAmount?.amount)} ${SupplierValueCurrency?.currency}`;
                                            break;

                                        case "Rational for awarding contract to dependent partner":
                                            participant = participantResponses.find(
                                                p => p.invitationId === invitationId
                                            );
                                            RationalToDependentPartnerValue = participant?.participantValue.simpleValue;
                                            break;
                                        case "Product/Service (Description/Background)":
                                            participant = participantResponses.find(
                                                p => p.invitationId === invitationId
                                            );
                                            ProductServiceDescriptionBackground = participant?.participantValue.simpleValue;
                                            break;
                                        case "Is any new initiative/best practices (Quality/ESG/Automation/Local supplier development etc) considered in this proposal:":
                                            participant = participantResponses.find(
                                                p => p.invitationId === invitationId
                                            );
                                            NewInitiativeBestPracticesValue = participant?.participantValue.simpleValue;
                                            break;

                                        case "Negotiation Committee(Name):":
                                            participant = participantResponses.find(
                                                p => p.invitationId === invitationId
                                            );
                                            NegotiationCommitteValue = participant?.participantValue.simpleValue;
                                            break;

                                        case "Internal SLAs/KPIs for the contract:":
                                            participant = participantResponses.find(
                                                p => p.invitationId === invitationId
                                            );
                                            InternalSLAsKPIsValue = participant?.participantValue.simpleValue;
                                            break;

                                        case "Contract Value (Basic Value)":
                                            participant = participantResponses.find(
                                                p => p.invitationId === invitationId
                                            );
                                            SupplierValueAmount = participant?.participantValue.moneyValue;
                                            SupplierValueCurrency = participant?.participantValue.moneyValue;
                                            ContractBasicValue = `${parseFloat(SupplierValueAmount?.amount)} ${SupplierValueCurrency?.currency}`;
                                            break;

                                        case "Is there Any Import Supply under this Proposal?":
                                            participant = participantResponses.find(
                                                p => p.invitationId === invitationId
                                            );
                                            ImportSupplyProposal = participant?.participantValue.simpleValue;
                                            break;

                                        case "FTA/EPCG/any other benefit availed for duty saving":
                                            participant = participantResponses.find(
                                                p => p.invitationId === invitationId
                                            );
                                            FTAEPCGValue = participant?.participantValue.simpleValue;
                                            break;

                                        case "Approximate Duty Amount in INR":
                                            participant = participantResponses.find(
                                                p => p.invitationId === invitationId
                                            );
                                            SupplierValueAmount = participant?.participantValue.moneyValue;
                                            SupplierValueCurrency = participant?.participantValue.moneyValue;
                                            FormattedDutyAmountINR = `${parseFloat(SupplierValueAmount?.amount)} ${SupplierValueCurrency?.currency}`;
                                            break;

                                        case "Monthly Quantity":
                                            participant = participantResponses.find(
                                                p => p.invitationId === invitationId
                                            );
                                            MonthlyQuantityValue = participant?.participantValue.simpleValue;
                                            break;

                                        case "Reason for Post Facto NFA ( If Applicable)":
                                            participant = participantResponses.find(
                                                p => p.invitationId === invitationId
                                            );
                                            PostFactoNfaReasonValue = participant?.participantValue.simpleValue;
                                            break;

                                        case "Pricing in Business Plan (If Applicable)":
                                            participant = participantResponses.find(
                                                p => p.invitationId === invitationId
                                            );
                                            BusinessPlanPricingValue = participant?.participantValue.simpleValue;
                                            break;

                                        case "Last Purchase Price/CLPP":
                                            participant = participantResponses.find(
                                                p => p.invitationId === invitationId
                                            );
                                            SupplierValueAmount = participant?.participantValue.moneyValue;
                                            SupplierValueCurrency = participant?.participantValue.moneyValue;
                                            FormattedCLPPLastPurchaseAmount = `${parseFloat(SupplierValueAmount?.amount)} ${SupplierValueCurrency?.currency}`;
                                            break;

                                        case "Price Justification":
                                            participant = participantResponses.find(
                                                p => p.invitationId === invitationId
                                            );
                                            PriceJustificationValue = participant?.participantValue.simpleValue;
                                            break;

                                        case "Deviations from Group philosophy/ Cardinal rules)":
                                            participant = participantResponses.find(
                                                p => p.invitationId === invitationId
                                            );
                                            CardinalRulesValue = participant?.participantValue.simpleValue;
                                            break;

                                        case "List of Deviation":
                                            participant = participantResponses.find(
                                                p => p.invitationId === invitationId
                                            );
                                            DeviationListValue = participant?.participantValue.simpleValue;
                                            break;

                                        case "Terms Of Payment & milestone on which payment will be made":
                                            participant = participantResponses.find(
                                                p => p.invitationId === invitationId
                                            );
                                            TermsOfPaymentValue = participant?.participantValue.simpleValue;
                                            break;

                                        case "Packing & Forwarding":
                                            participant = participantResponses.find(
                                                p => p.invitationId === invitationId
                                            );
                                            PackagingForwardingValue = participant?.participantValue.simpleValue;
                                            break;

                                        case "Logistics":
                                            LogisticsAmount = responseValue?.amount;
                                            LogisticsCurrency = responseValue?.currency;
                                            FormattedLogisticsAmount = `${parseFloat(responseValue?.amount)} ${responseValue?.currency}`;
                                            break;

                                        case "Insurance":
                                            participant = participantResponses.find(
                                                p => p.invitationId === invitationId
                                            );
                                            InsuranceValue = participant?.participantValue?.attachmentValue.fileName;
                                            break;

                                        case "HR Clearance Certificates":
                                            isHr = true;
                                            participant = participantResponses.find(
                                                p => p.invitationId === invitationId
                                            );
                                            HrClearanceCertificates = participant?.participantValue?.attachmentValue.fileName;
                                            break;
                                        case "Job Clearance Certificates":
                                            isJob = true;
                                            participant = participantResponses.find(
                                                p => p.invitationId === invitationId
                                            );
                                            JobClearanceCertificates = participant?.participantValue?.attachmentValue.fileName;
                                            break;

                                        case "Penalty clause for Quality":
                                            participant = participantResponses.find(
                                                p => p.invitationId === invitationId
                                            );
                                            PenaltyQualityValue = participant?.participantValue.simpleValue;
                                            break;

                                        case "Penalty criteria":
                                            participant = participantResponses.find(
                                                p => p.invitationId === invitationId
                                            );
                                            PenaltyCriteriaValue = participant?.participantValue.simpleValue;
                                            break;

                                        case "Delivery Lead Time":
                                            participant = participantResponses.find(
                                                p => p.invitationId === invitationId
                                            );
                                            DeliveryLeadTimeValue = participant?.participantValue.simpleValue;
                                            break;

                                        case "Liquidated Damages":
                                            participant = participantResponses.find(
                                                p => p.invitationId === invitationId
                                            );
                                            LiquidatedDamagesValue = participant?.participantValue.simpleValue;
                                            break;

                                        case "Liquidated Damages Clause":
                                            participant = participantResponses.find(
                                                p => p.invitationId === invitationId
                                            );
                                            LiquidatedDamagesClValue = participant?.participantValue.simpleValue;
                                            break;

                                        case "PBG and SD":
                                            participant = participantResponses.find(
                                                p => p.invitationId === invitationId
                                            );
                                            PBGAndSDValue = participant?.participantValue.simpleValue;
                                            break;

                                        case "PBG and SD Clause":
                                            participant = participantResponses.find(
                                                p => p.invitationId === invitationId
                                            );
                                            PBGAndSDClValue = participant?.participantValue.simpleValue;
                                            break;

                                        case "Penalty clause for safety- Subcontract(Allowed/ Not Allowed) (If Yes, which party and crendential of the party and technical approval of the party has to be enclosed in NFA)":
                                            participant = participantResponses.find(
                                                p => p.invitationId === invitationId
                                            );
                                            PenaltyForSafetySubcontractValue = participant?.participantValue.simpleValue;
                                            break;

                                        case "Other Key Terms (Eg: Warranty, Inspection Clause, GTC Deviation, Party Delivery. Etc)":
                                            participant = participantResponses.find(
                                                p => p.invitationId === invitationId
                                            );
                                            OtherKeyTermsValue = participant?.participantValue.simpleValue;
                                            break;

                                        case "Rationale if not L1":
                                            participant = participantResponses.find(
                                                p => p.invitationId === invitationId
                                            );
                                            RationaleL1Value = participant?.participantValue.simpleValue;
                                            break;

                                        case "Prices Are":
                                            participant = participantResponses.find(
                                                p => p.invitationId === invitationId
                                            );
                                            PricesValue = participant?.participantValue.simpleValue;
                                            break;

                                        case "Approving Plant":
                                            participant = participantResponses.find(
                                                p => p.invitationId === invitationId
                                            );
                                            ApprovingPlant = participant?.participantValue.simpleValue;
                                            break;

                                        default:
                                            // existingVendorEntry[questionTitle] = responseValue;
                                            break;
                                    }
                                    participant = "";


                                    // });
                                });


                                DocSupplierBidItems.push({
                                    SupplierBidName: invitationId,
                                    DocSupBidInvitationID: DocSupBidInvitationID,
                                    PayDate: PayDate,
                                    AmendmentValue: AmendmentValue,
                                    FormattedSupplierValueAmount: FormattedSupplierValueAmount,
                                    ExistingPoNumberValue: ExistingPoNumberValue,
                                    FormattedTotalNFAAmount: FormattedTotalNFAAmount,
                                    ContractPeriodValue: ContractPeriodValue,
                                    BudgetValue: Budget,
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
                                    HrClearanceCertificates: HrClearanceCertificates,
                                    JobClearanceCertificates: JobClearanceCertificates,
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
                                    ApprovingPlant: ApprovingPlant,
                                    ProductServiceDescriptionBackground: ProductServiceDescriptionBackground

                                })
                            });

                            console.log('DocSupplierBidItems', DocSupplierBidItems);

                            ///////////////////////questionaries////////////////////////////
                            // Supplier.forEach(supp => {
                            //     SupplierBidsWorker.push(createWorker(DocumentSupplierBidsUrl.replace('<docId>', DocId).replace('<sName>', supp.SupplierName), DocumentBase, `DocumentSupplierBidsUrl ${supp.SupplierName}`));
                            // })
                            // var DocumentSupplierBidResult = await Promise.all(SupplierBidsWorker);
                            // //debugger
                            // DocumentSupplierBidResult.forEach(Questions => {
                            //     SupplierBidName = Questions.path.split(" ")[1];
                            //     if (Questions && Array.isArray(Questions.payload) && Questions.payload.length > 0) {
                            //         for (const DocSuppBidItem of Questions.payload) {
                            //             const DocSuppBidItemTitle = DocSuppBidItem.item.title;
                            //             SubmissionDate = DocSuppBidItem.submissionDate
                            //             if ("invitationId" in DocSuppBidItem) {
                            //                 VendorNames.push({
                            //                     VendorName: DocSuppBidItem.invitationId
                            //                 })
                            //                 if ("bidStatus" in DocSuppBidItem && DocSuppBidItem.bidStatus == "Accepted") {
                            //                     if ("invitationId" in DocSuppBidItem) {
                            //                         DocSupBidInvitationID = DocSuppBidItem.invitationId;
                            //                     }
                            //                     if ("submissionDate" in DocSuppBidItem) {
                            //                         PayDate = DocSuppBidItem.submissionDate;
                            //                         PayDate = PayDate.substring(0, 10);
                            //                         PayDate = returndate(PayDate);
                            //                     }
                            //                     switch (DocSuppBidItemTitle) {
                            //                         case "Amendment in Existing PO/ARC/Contract":
                            //                             if ("terms" in DocSuppBidItem.item &&
                            //                                 "value" in DocSuppBidItem.item.terms[0] && "simpleValue" in DocSuppBidItem.item.terms[0].value) {
                            //                                 AmendmentValue = DocSuppBidItem.item.terms[0].value.simpleValue;
                            //                             }
                            //                             break;
                            //                         case "Existing PO/ARC/Contract Value":
                            //                             if ("terms" in DocSuppBidItem.item &&
                            //                                 "value" in DocSuppBidItem.item.terms[0] && "supplierValue" in DocSuppBidItem.item.terms[0].value) {
                            //                                 SupplierValueAmount = DocSuppBidItem.item.terms[0].value.supplierValue.amount
                            //                                 SupplierValueCurrency = DocSuppBidItem.item.terms[0].value.supplierValue.currency
                            //                                 FormattedSupplierValueAmount = `${parseFloat(SupplierValueAmount)} ${SupplierValueCurrency}`
                            //                             }
                            //                             break;
                            //                         case "Existing PO number":
                            //                             if ("terms" in DocSuppBidItem.item &&
                            //                                 "value" in DocSuppBidItem.item.terms[0] && "simpleValue" in DocSuppBidItem.item.terms[0].value) {
                            //                                 ExistingPoNumberValue = DocSuppBidItem.item.terms[0].value.simpleValue
                            //                             }
                            //                             break;
                            //                         case "Amendment Value Total NFA Amount ( Contract Value): Incase of Amendment, please enter the total value including amendment+ tolerance value if Any)":
                            //                             if ("terms" in DocSuppBidItem.item &&
                            //                                 "value" in DocSuppBidItem.item.terms[0] && "moneyValue" in DocSuppBidItem.item.terms[0].value) {
                            //                                 TotalNFAAmount = DocSuppBidItem.item.terms[0].value.moneyValue.amount;
                            //                                 TotalNFAAmountCurrency = DocSuppBidItem.item.terms[0].value.moneyValue.amount;
                            //                                 FormattedTotalNFAAmount = `${parseFloat(TotalNFAAmount)} ${TotalNFAAmountCurrency}`
                            //                             }
                            //                             break;
                            //                         case "Contract Period":
                            //                             if ("terms" in DocSuppBidItem.item &&
                            //                                 "value" in DocSuppBidItem.item.terms[0] && "simpleValue" in DocSuppBidItem.item.terms[0].value) {
                            //                                 ContractPeriodValue = DocSuppBidItem.item.terms[0].value.simpleValue;
                            //                             }
                            //                             break;
                            //                         case "Budget":
                            //                             if ("terms" in DocSuppBidItem.item &&
                            //                                 "value" in DocSuppBidItem.item.terms[0] && "simpleValue" in DocSuppBidItem.item.terms[0].value) {
                            //                                 BudgetValue = DocSuppBidItem.item.terms[0].value.simpleValue
                            //                             }
                            //                             break;
                            //                         case "Order Type Parties contacted and technically accepted ( Rational If on single vendor basis)":
                            //                             if ("terms" in DocSuppBidItem.item &&
                            //                                 "value" in DocSuppBidItem.item.terms[0] && "simpleValue" in DocSuppBidItem.item.terms[0].value) {
                            //                                 OrderTypePartiesValue = DocSuppBidItem.item.terms[0].value.simpleValue
                            //                             }
                            //                             break;
                            //                         case "Rational for not doing auction,Is Price offer obtained before Auction (If Yes Kindly Attach the deviation approval obtained in NFA Supporting)":
                            //                             if ("terms" in DocSuppBidItem.item &&
                            //                                 "value" in DocSuppBidItem.item.terms[0] && "simpleValue" in DocSuppBidItem.item.terms[0].value) {
                            //                                 RationalValue = DocSuppBidItem.item.terms[0].value.simpleValue
                            //                             }
                            //                             break;
                            //                         case "Vendors Latest Available Turnover ( In INR Cr.)":
                            //                             if ("terms" in DocSuppBidItem.item &&
                            //                                 "value" in DocSuppBidItem.item.terms[0] && "moneyValue" in DocSuppBidItem.item.terms[0].value) {
                            //                                 VendorsTurnOverAmount = DocSuppBidItem.item.terms[0].value.moneyValue.amount;
                            //                                 VendorsTurnOverCurrency = DocSuppBidItem.item.terms[0].value.moneyValue.currency;
                            //                                 FormattedVendorsTurnOverAmount = `${parseFloat(VendorsTurnOverAmount)} ${VendorsTurnOverCurrency}`
                            //                             }
                            //                             break;
                            //                         case "Total Vendor Spend for Current FY (In INR Cr.) (Total Open value as on NFA date + Proposed annual value":
                            //                             if ("terms" in DocSuppBidItem.item &&
                            //                                 "value" in DocSuppBidItem.item.terms[0] && "moneyValue" in DocSuppBidItem.item.terms[0].value) {
                            //                                 VendorsSpendAmount = DocSuppBidItem.item.terms[0].value.moneyValue.amount;
                            //                                 VendorsSpendCurrency = DocSuppBidItem.item.terms[0].value.moneyValue.currency;
                            //                                 FormattedVendorsSpendAmount = `${parseFloat(VendorsSpendAmount)} ${VendorsSpendCurrency}`
                            //                             }
                            //                             break;
                            //                         case "Rational for awarding contract to dependent partner":
                            //                             if ("terms" in DocSuppBidItem.item &&
                            //                                 "value" in DocSuppBidItem.item.terms[0] && "simpleValue" in DocSuppBidItem.item.terms[0].value) {
                            //                                 RationalToDependentPartnerValue = DocSuppBidItem.item.terms[0].value.simpleValue
                            //                             }
                            //                             break;
                            //                         case "Is any new initiative/best practices (Quality/ESG/Automation/Local supplier development etc) considered in this proposal:":
                            //                             if ("terms" in DocSuppBidItem.item &&
                            //                                 "value" in DocSuppBidItem.item.terms[0] && "simpleValue" in DocSuppBidItem.item.terms[0].value) {
                            //                                 NewInitiativeBestPracticesValue = DocSuppBidItem.item.terms[0].value.simpleValue
                            //                             }
                            //                             break;
                            //                         case "Negotiation Committee(Name):":
                            //                             if ("terms" in DocSuppBidItem.item &&
                            //                                 "value" in DocSuppBidItem.item.terms[0] && "simpleValue" in DocSuppBidItem.item.terms[0].value) {
                            //                                 NegotiationCommitteValue = DocSuppBidItem.item.terms[0].value.simpleValue
                            //                             }
                            //                             break;
                            //                         case "Internal SLAs/KPIs for the contract:":
                            //                             if ("terms" in DocSuppBidItem.item &&
                            //                                 "value" in DocSuppBidItem.item.terms[0] && "simpleValue" in DocSuppBidItem.item.terms[0].value) {
                            //                                 InternalSLAsKPIsValue = DocSuppBidItem.item.terms[0].value.simpleValue
                            //                             }
                            //                             break;
                            //                         case "Contract Value (Basic Value)":
                            //                             if ("terms" in DocSuppBidItem.item &&
                            //                                 "value" in DocSuppBidItem.item.terms[0] && "simpleValue" in DocSuppBidItem.item.terms[0].value) {
                            //                                 ContractBasicValue = DocSuppBidItem.item.terms[0].value.simpleValue
                            //                             }
                            //                             break;
                            //                         case "Is there Any Import Supply under this Proposal?":
                            //                             if ("terms" in DocSuppBidItem.item &&
                            //                                 "value" in DocSuppBidItem.item.terms[0] && "simpleValue" in DocSuppBidItem.item.terms[0].value) {
                            //                                 ImportSupplyProposal = DocSuppBidItem.item.terms[0].value.simpleValue
                            //                             }
                            //                             break;
                            //                         case "FTA/EPCG/any other benefit availed for duty saving":
                            //                             if ("terms" in DocSuppBidItem.item &&
                            //                                 "value" in DocSuppBidItem.item.terms[0] && "simpleValue" in DocSuppBidItem.item.terms[0].value) {
                            //                                 FTAEPCGValue = DocSuppBidItem.item.terms[0].value.simpleValue
                            //                             }
                            //                             break;
                            //                         case "Approximate Duty Amount in INR":
                            //                             if ("terms" in DocSuppBidItem.item &&
                            //                                 "value" in DocSuppBidItem.item.terms[0] && "moneyValue" in DocSuppBidItem.item.terms[0].value) {
                            //                                 DutyAmountINR = DocSuppBidItem.item.terms[0].value.moneyValue.amount;
                            //                                 DutyCurrencyINR = DocSuppBidItem.item.terms[0].value.moneyValue.currency;
                            //                                 FormattedDutyAmountINR = `${parseFloat(DutyAmountINR)} ${DutyCurrencyINR}`
                            //                             }
                            //                             break;
                            //                         case "Monthly Quantity":
                            //                             if ("terms" in DocSuppBidItem.item &&
                            //                                 "value" in DocSuppBidItem.item.terms[0] && "simpleValue" in DocSuppBidItem.item.terms[0].value) {
                            //                                 MonthlyQuantityValue = DocSuppBidItem.item.terms[0].value.simpleValue;
                            //                             }
                            //                             break;
                            //                         case "Reason for Post Facto NFA ( If Applicable)":
                            //                             if ("terms" in DocSuppBidItem.item &&
                            //                                 "value" in DocSuppBidItem.item.terms[0] && "simpleValue" in DocSuppBidItem.item.terms[0].value) {
                            //                                 PostFactoNfaReasonValue = DocSuppBidItem.item.terms[0].value.simpleValue;
                            //                             }
                            //                             break;
                            //                         case "Pricing in Business Plan (If Applicable)":
                            //                             if ("terms" in DocSuppBidItem.item &&
                            //                                 "value" in DocSuppBidItem.item.terms[0] && "simpleValue" in DocSuppBidItem.item.terms[0].value) {
                            //                                 BusinessPlanPricingValue = DocSuppBidItem.item.terms[0].value.simpleValue;
                            //                             }
                            //                             break;
                            //                         case "Last Purchase Price/CLPP":
                            //                             if ("terms" in DocSuppBidItem.item &&
                            //                                 "value" in DocSuppBidItem.item.terms[0] && "moneyValue" in DocSuppBidItem.item.terms[0].value) {
                            //                                 CLPPLastPurchaseAmount = DocSuppBidItem.item.terms[0].value.moneyValue.amount;
                            //                                 CLPPLastPurchaseCurrency = DocSuppBidItem.item.terms[0].value.moneyValue.currency;
                            //                                 FormattedCLPPLastPurchaseAmount = `${parseFloat(CLPPLastPurchaseAmount)} ${CLPPLastPurchaseCurrency}`
                            //                             }
                            //                             break;
                            //                         case "Price Justification":
                            //                             if ("terms" in DocSuppBidItem.item &&
                            //                                 "value" in DocSuppBidItem.item.terms[0] && "simpleValue" in DocSuppBidItem.item.terms[0].value) {
                            //                                 PriceJustificationValue = DocSuppBidItem.item.terms[0].value.simpleValue;
                            //                             }
                            //                             break;
                            //                         case "Deviations from Group philosophy/ Cardinal rules)":
                            //                             if ("terms" in DocSuppBidItem.item &&
                            //                                 "value" in DocSuppBidItem.item.terms[0] && "simpleValue" in DocSuppBidItem.item.terms[0].value) {
                            //                                 CardinalRulesValue = DocSuppBidItem.item.terms[0].value.simpleValue;
                            //                             }
                            //                             break;
                            //                         case "List of Deviation":
                            //                             if ("terms" in DocSuppBidItem.item &&
                            //                                 "value" in DocSuppBidItem.item.terms[0] && "simpleValue" in DocSuppBidItem.item.terms[0].value) {
                            //                                 DeviationListValue = DocSuppBidItem.item.terms[0].value.simpleValue;
                            //                             }
                            //                             break;
                            //                         case "Terms Of Payment & milestone on which payment will be made":
                            //                             if ("terms" in DocSuppBidItem.item &&
                            //                                 "value" in DocSuppBidItem.item.terms[0] && "simpleValue" in DocSuppBidItem.item.terms[0].value) {
                            //                                 TermsOfPaymentValue = DocSuppBidItem.item.terms[0].value.simpleValue;
                            //                             }
                            //                             break;
                            //                         case "Packing & Forwarding":
                            //                             if ("terms" in DocSuppBidItem.item &&
                            //                                 "value" in DocSuppBidItem.item.terms[0] && "simpleValue" in DocSuppBidItem.item.terms[0].value) {
                            //                                 PackagingForwardingValue = DocSuppBidItem.item.terms[0].value.simpleValue;
                            //                             }
                            //                             break;
                            //                         case "Logistics":
                            //                             if ("terms" in DocSuppBidItem.item &&
                            //                                 "value" in DocSuppBidItem.item.terms[0] && "moneyValue" in DocSuppBidItem.item.terms[0].value) {
                            //                                 LogisticsAmount = DocSuppBidItem.item.terms[0].value.moneyValue.amount;
                            //                                 LogisticsCurrency = DocSuppBidItem.item.terms[0].value.moneyValue.currency;
                            //                                 FormattedLogisticsAmount = `${parseFloat(LogisticsAmount)} ${LogisticsCurrency}`
                            //                             }
                            //                             break;
                            //                         case "Insurance":
                            //                             if ("terms" in DocSuppBidItem.item &&
                            //                                 "value" in DocSuppBidItem.item.terms[0] && "simpleValue" in DocSuppBidItem.item.terms[0].value) {
                            //                                 InsuranceValue = DocSuppBidItem.item.terms[0].value.simpleValue;
                            //                             }
                            //                             break;
                            //                         case "Penalty clause for Quality":
                            //                             if ("terms" in DocSuppBidItem.item &&
                            //                                 "value" in DocSuppBidItem.item.terms[0] && "simpleValue" in DocSuppBidItem.item.terms[0].value) {
                            //                                 PenaltyQualityValue = DocSuppBidItem.item.terms[0].value.simpleValue;
                            //                             }
                            //                             break;
                            //                         case "Penalty criteria":
                            //                             if ("terms" in DocSuppBidItem.item &&
                            //                                 "value" in DocSuppBidItem.item.terms[0] && "simpleValue" in DocSuppBidItem.item.terms[0].value) {
                            //                                 PenaltyCriteriaValue = DocSuppBidItem.item.terms[0].value.simpleValue;
                            //                             }
                            //                             break;
                            //                         case "Delivery Lead Time":
                            //                             if ("terms" in DocSuppBidItem.item &&
                            //                                 "value" in DocSuppBidItem.item.terms[0] && "simpleValue" in DocSuppBidItem.item.terms[0].value) {
                            //                                 DeliveryLeadTimeValue = DocSuppBidItem.item.terms[0].value.simpleValue;
                            //                             }
                            //                             break;
                            //                         case "Liquidated Damages":
                            //                             if ("terms" in DocSuppBidItem.item &&
                            //                                 "value" in DocSuppBidItem.item.terms[0] && "simpleValue" in DocSuppBidItem.item.terms[0].value) {
                            //                                 LiquidatedDamagesValue = DocSuppBidItem.item.terms[0].value.simpleValue;
                            //                             }
                            //                             break;
                            //                         case "Liquidated Damages Clause":
                            //                             if ("terms" in DocSuppBidItem.item &&
                            //                                 "value" in DocSuppBidItem.item.terms[0] && "simpleValue" in DocSuppBidItem.item.terms[0].value) {
                            //                                 LiquidatedDamagesClValue = DocSuppBidItem.item.terms[0].value.simpleValue;
                            //                             }
                            //                             break;
                            //                         case "PBG and SD":
                            //                             if ("terms" in DocSuppBidItem.item &&
                            //                                 "value" in DocSuppBidItem.item.terms[0] && "simpleValue" in DocSuppBidItem.item.terms[0].value) {
                            //                                 PBGAndSDValue = DocSuppBidItem.item.terms[0].value.simpleValue;
                            //                             }
                            //                             break;
                            //                         case "PBG and SD Clause":
                            //                             if ("terms" in DocSuppBidItem.item &&
                            //                                 "value" in DocSuppBidItem.item.terms[0] && "simpleValue" in DocSuppBidItem.item.terms[0].value) {
                            //                                 PBGAndSDClValue = DocSuppBidItem.item.terms[0].value.simpleValue;
                            //                             }
                            //                             break;
                            //                         case "Penalty clause for safety- Subcontract(Allowed/ Not Allowed) (If Yes, which party and crendential of the party and technical approval of the party has to be enclosed in NFA)":
                            //                             if ("terms" in DocSuppBidItem.item &&
                            //                                 "value" in DocSuppBidItem.item.terms[0] && "simpleValue" in DocSuppBidItem.item.terms[0].value) {
                            //                                 PenaltyForSafetySubcontractValue = DocSuppBidItem.item.terms[0].value.simpleValue;
                            //                             }
                            //                             break;
                            //                         case "Other Key Terms (Eg: Warranty, Inspection Clause, GTC Deviation, Party Delivery. Etc)":
                            //                             if ("terms" in DocSuppBidItem.item &&
                            //                                 "value" in DocSuppBidItem.item.terms[0] && "simpleValue" in DocSuppBidItem.item.terms[0].value) {
                            //                                 OtherKeyTermsValue = DocSuppBidItem.item.terms[0].value.simpleValue;
                            //                             }
                            //                             break;
                            //                         case "Rationale if not L1":
                            //                             if ("terms" in DocSuppBidItem.item &&
                            //                                 "value" in DocSuppBidItem.item.terms[0] && "simpleValue" in DocSuppBidItem.item.terms[0].value) {
                            //                                 RationaleL1Value = DocSuppBidItem.item.terms[0].value.simpleValue;
                            //                             }
                            //                             break;
                            //                         case "Prices Are":
                            //                             if ("terms" in DocSuppBidItem.item &&
                            //                                 "value" in DocSuppBidItem.item.terms[0] && "simpleValue" in DocSuppBidItem.item.terms[0].value) {
                            //                                 PricesValue = DocSuppBidItem.item.terms[0].value.simpleValue;
                            //                             }
                            //                             break;
                            //                         case "Approving Plant":
                            //                             if ("terms" in DocSuppBidItem.item &&
                            //                                 "value" in DocSuppBidItem.item.terms[0] && "simpleValue" in DocSuppBidItem.item.terms[0].value) {
                            //                                 ApprovingPlant = DocSuppBidItem.item.terms[0].value.simpleValue;
                            //                             }
                            //                             break;
                            //                     }


                            //                 }
                            //             }
                            //         }
                            //         DocSupplierBidItems.push({
                            //             SupplierBidName: SupplierBidName,
                            //             DocSupBidInvitationID: DocSupBidInvitationID,
                            //             PayDate: PayDate,
                            //             AmendmentValue: AmendmentValue,
                            //             FormattedSupplierValueAmount: FormattedSupplierValueAmount,
                            //             ExistingPoNumberValue: ExistingPoNumberValue,
                            //             FormattedTotalNFAAmount: FormattedTotalNFAAmount,
                            //             ContractPeriodValue: ContractPeriodValue,
                            //             BudgetValue: BudgetValue,
                            //             OrderTypePartiesValue: OrderTypePartiesValue,
                            //             RationalValue: RationalValue,
                            //             FormattedVendorsTurnOverAmount: FormattedVendorsTurnOverAmount,
                            //             FormattedVendorsSpendAmount: FormattedVendorsSpendAmount,
                            //             RationalToDependentPartnerValue: RationalToDependentPartnerValue,
                            //             NewInitiativeBestPracticesValue: NewInitiativeBestPracticesValue,
                            //             NegotiationCommitteValue: NegotiationCommitteValue,
                            //             InternalSLAsKPIsValue: InternalSLAsKPIsValue,
                            //             ContractBasicValue: ContractBasicValue,
                            //             ImportSupplyProposal: ImportSupplyProposal,
                            //             FTAEPCGValue: FTAEPCGValue,
                            //             FormattedDutyAmountINR: FormattedDutyAmountINR,
                            //             MonthlyQuantityValue: MonthlyQuantityValue,
                            //             PostFactoNfaReasonValue: PostFactoNfaReasonValue,
                            //             BusinessPlanPricingValue: BusinessPlanPricingValue,
                            //             FormattedCLPPLastPurchaseAmount: FormattedCLPPLastPurchaseAmount,
                            //             PriceJustificationValue: PriceJustificationValue,
                            //             CardinalRulesValue: CardinalRulesValue,
                            //             DeviationListValue: DeviationListValue,
                            //             TermsOfPaymentValue: TermsOfPaymentValue,
                            //             PackagingForwardingValue: PackagingForwardingValue,
                            //             FormattedLogisticsAmount: FormattedLogisticsAmount,
                            //             InsuranceValue: InsuranceValue,
                            //             PenaltyQualityValue: PenaltyQualityValue,
                            //             PenaltyCriteriaValue: PenaltyCriteriaValue,
                            //             DeliveryLeadTimeValue: DeliveryLeadTimeValue,
                            //             LiquidatedDamagesValue: LiquidatedDamagesValue,
                            //             LiquidatedDamagesClValue: LiquidatedDamagesClValue,
                            //             PBGAndSDValue: PBGAndSDValue,
                            //             PBGAndSDClValue: PBGAndSDClValue,
                            //             PenaltyForSafetySubcontractValue: PenaltyForSafetySubcontractValue,
                            //             OtherKeyTermsValue: OtherKeyTermsValue,
                            //             RationaleL1Value: RationaleL1Value,
                            //             PricesValue: PricesValue,
                            //             ApprovingPlant: ApprovingPlant
                            //         })
                            //     };

                            // })
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
                                    VendorsmVendorID = WokerThreadsResults[a].payload[i].organization.smVendorID
                                    VendorDetailsArr.push({
                                        VendorName: VendorName,
                                        VendorAddress: VendorAddress,
                                        VendorInvitationId: VendorInvitationId,
                                        VendorUserId: VendorUserId,
                                        VendorsmVendorID: VendorsmVendorID
                                    })
                                    VendorName = "";
                                    VendorAddress = "";
                                    VendorInvitationId = "";
                                    VendorUserId = "";
                                    VendorsmVendorID = "";
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
                        let roundMap = {};

                        RoundsData.payload.forEach(round => {
                            round.suppliers.forEach(supplier => {
                                SupplierWithRounds.push({
                                    Supplier: supplier,
                                    Rounds: round.roundNumber
                                });
                                roundMap[supplier] = Math.max(roundMap[supplier] || 0, round.roundNumber);
                            });
                        });

                        console.log("roundMap", roundMap);
                        console.log("SupplierWithRounds", SupplierWithRounds);



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

                                    let Price, PriceCurrency, ItemPrice, UnitOfMeasure, UnitOfMeasureCode, DiscountPercentage, ItemPriceCurrency, ExtendedPrice, ExtendedPriceCurrency, Savings, SavingsPercent, MaterialCost, LabourCost, ProcessingCost, PackagingCost, MaterialCode, Profit, LandedPrice;


                                    terms.forEach(term => {
                                        const { title, value } = term;

                                        switch (title) {
                                            case "Price":
                                                const priceAmount = value?.moneyValue?.amount ?? 0;
                                                const priceCurrency = value?.moneyValue?.currency ?? "";
                                                Price = `${parseFloat(priceAmount)} ${priceCurrency}`;
                                                break;

                                            case "Quantity":
                                                UnitOfMeasure = value?.quantityValue?.amount ?? 0;
                                                UnitOfMeasureCode = value?.quantityValue?.unitOfMeasureCode ?? "";
                                                break;

                                            case "Extended Price":
                                                const extendedAmount = value?.moneyValue?.amount ?? 0;
                                                const extendedCurrency = value?.moneyValue?.currency ?? "";
                                                ExtendedPrice = `${parseFloat(extendedAmount)} ${extendedCurrency}`;
                                                break;

                                            case "Total Cost":
                                                const totalCostAmount = value?.moneyValue?.amount ?? 0;
                                                const totalCostCurrency = value?.moneyValue?.currency ?? "";
                                                ItemPrice = `${parseFloat(totalCostAmount)} ${totalCostCurrency}`;
                                                break;

                                            case "Savings":
                                                const savingsAmount = value?.moneyDifferenceValue?.difference?.amount ?? 0;
                                                const savingsCurrency = value?.moneyDifferenceValue?.difference?.currency ?? "";
                                                Savings = `${parseFloat(savingsAmount)} ${savingsCurrency}`;
                                                SavingsPercent = value?.moneyDifferenceValue?.percentage ?? 0;
                                                break;

                                            case "Material Cost":
                                                MaterialCost = `${parseFloat(value?.moneyValue?.amount ?? 0)} ${value?.moneyValue?.currency ?? ""}`;
                                                break;

                                            case "Labour Cost":
                                                LabourCost = `${parseFloat(value?.moneyValue?.amount ?? 0)} ${value?.moneyValue?.currency ?? ""}`;
                                                break;

                                            case "Processing Cost ( Non-labour manufacturing cost)":
                                                ProcessingCost = `${parseFloat(value?.moneyValue?.amount ?? 0)} ${value?.moneyValue?.currency ?? ""}`;
                                                break;

                                            case "Packaging Cost":
                                                PackagingCost = `${parseFloat(value?.moneyValue?.amount ?? 0)} ${value?.moneyValue?.currency ?? ""}`;
                                                break;

                                            case "Freight":
                                                Freight = value?.moneyValue?.amount ?? 0;
                                                break;

                                            case "Tax %":
                                                TaxPercentage = value?.bigDecimalValue ?? 0;
                                                break;

                                            case "Profit":
                                                Profit = `${parseFloat(value?.moneyValue?.amount ?? 0)} ${value?.moneyValue?.currency ?? ""}`;
                                                break;

                                            case "Landed Price":
                                                LandedPrice = value?.bigDecimalValue ?? 0;
                                                break;

                                            case "Discount Percentage":
                                                DiscountPercentage = value?.bigDecimalValue ?? 0;
                                                break;

                                            case "Material Code":
                                                MaterialCode = value?.simpleValue ?? "";
                                                break;

                                            case "Existing PO number":
                                                ExistingPoNumber = value?.simpleValue ?? "";
                                                break;

                                            case "Existing PO/ARC/Contract Value":
                                                const poValue = value?.supplierValue?.amount ?? 0;
                                                const poCurrency = value?.supplierValue?.currency ?? "";
                                                ExistingPoContractValue = `${parseFloat(poValue)} ${poCurrency}`;
                                                break;

                                            default:
                                                break;
                                        }
                                    });

                                    // itemsForCB.push({
                                    //     ProposedVendorCode: Id,
                                    //     ItemCode: itemId,
                                    //     round: Round,
                                    //     Price,
                                    //     PriceCurrency,
                                    //     ItemPrice,
                                    //     ItemPriceCurrency,
                                    //     UnitOfMeasure,
                                    //     UnitOfMeasureCode,
                                    //     DiscountPercentage,
                                    //     ExtendedPrice,
                                    //     ExtendedPriceCurrency,


                                    //     Freight,
                                    //     TaxPercentage,

                                    // });
                                    console.log(itemsForCB);
                                    const numericPrice = parseFloat(ItemPrice.split(" ")[0]);
                                    const UnitPrice = (numericPrice / UnitOfMeasure).toFixed(2);

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
                                        Freight,

                                        Savings,
                                        SavingsPercent,
                                        MaterialCost,
                                        LabourCost,
                                        ProcessingCost,
                                        PackagingCost,
                                        MaterialCode,
                                        Profit,
                                        LandedPrice,
                                        ExistingPoNumber,
                                        ExistingPoContractValue,
                                        ExistingPoContractCurrency
                                    });
                                    console.log();
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

                        const vendorArray = Object.keys(grouped).map(vendorID => ({
                            vendorID,
                            smVendorID: grouped[vendorID][0].VendorsmVendorID  // or VendorsmVendorID if that’s the actual property
                        }));

                        ////

                        async function InsertDueDeligence(questionnaireArray, questionnairesList) {

                            for (let i = 0; i < questionnaireArray.length; i++) {
                                const ID = Date.now().toString(); // super simple unique ID
                                questionnaireArray[i].ID = ID;
                                const inserted = await INSERT
                                    .into(NfaVendorDueDeligenceDetails)
                                    .entries(questionnaireArray[i]);
                                console.log('Inserted Due deligence', inserted);
                            }
                            for (let i = 0; i < questionnairesList.length; i++) {
                                const ID = Date.now().toString(); // super simple unique ID
                                questionnairesList[i].ID = ID;
                                const inserted = await INSERT
                                    .into(NfaVendorDueDeligenceDetailsGrade)
                                    .entries(questionnairesList[i]);
                                console.log('Inserted Due deligence rx6', inserted);
                            }




                        }

                        async function fetchDueDiligenceData(vendorArray) {
                            const results = [];

                            for (const vendor of vendorArray) {
                                let DueDiligenceFirstUrlBody = {
                                    ...DueDiligenceUrlFirstBase,
                                    url: DueDiligenceFirstUrl
                                        .replace("<vendorId>", vendor.smVendorID)

                                };

                                try {
                                    const result = await NfaAriba.post('/', DueDiligenceFirstUrlBody);
                                    const questionnaireList = result?._embedded?.questionnaireList ?? [];

                                    let flag = false;

                                    for (const q of questionnaireList) {
                                        const title = q?.questionnaire?.docTitle ?? "";
                                        if (title === "Due Diligence") {
                                            flag = true;
                                            console.log(`✅ Found Due Diligence questionnaire for ${vendor?.vendorID}`);

                                            const WorkSpaceID = q?.questionnaire?.workspaceId;
                                            const QuestionnaireID = q?.questionnaire?.questionnaireId;

                                            if (!WorkSpaceID || !QuestionnaireID) {
                                                console.warn(`⚠️ Missing Workspace or Questionnaire ID for vendor ${vendor?.vendorID}`);
                                                continue;
                                            }

                                            const DueDiligenceUrlBody = {
                                                ...DueDiligenceUrlBase,
                                                url: (DueDiligenceUrl ?? "")
                                                    .replace("<vendorId>", vendor?.smVendorID ?? "")
                                                    .replace("<WorkspaceId>", WorkSpaceID)
                                                    .replace("<QuestinonId>", QuestionnaireID),
                                            };

                                            let dueDiligenceResult;
                                            try {
                                                dueDiligenceResult = await NfaAriba.post('/', DueDiligenceUrlBody);
                                            } catch (err) {
                                                console.error(`❌ Failed to fetch Due Diligence data for ${vendor?.vendorID}:`, err.message);
                                                continue;
                                            }

                                            const questionAnswers = dueDiligenceResult?._embedded?.questionAnswerList ?? [];

                                            const companyData = {
                                                // Basic info
                                                NfaNumber: DocId ?? '',
                                                ProposedVendorCode: vendor?.vendorID ?? '',
                                                round: roundMap?.[vendor?.vendorID] ?? '',
                                                CompanyName: '',
                                                CompanyAddress: '',
                                                CompanyCity: '',
                                                CompanyState: '',
                                                CompanyPincode: '',
                                                CompanyCountry: '',
                                                ClassOfCompany: '',
                                                CompanyActivity: '',
                                                NICCode: '',
                                                NICCodeDescription: '',
                                                CompanyStatus: '',
                                                DateOfIncorporation: '',
                                                AgeOfCompany: '',
                                                ListingStatus: '',
                                                DateOfLastBalanceSheet: '',
                                                DateofLastAnnualGeneralMeeting: '',
                                                AuthorizedCapital: '',
                                                PaidUpCapital: '',
                                                ManagementDetails: '',
                                                CompanyNumber: '',
                                                CompanyEmail: '',
                                                CompanyWebsite: '',
                                                Comments: '',

                                                // Risk
                                                RiskScore: '',
                                                RiskGrade: '',
                                                Description: '',
                                                otherField: ''
                                            };

                                            const questionnairesList = [];

                                            for (const item of questionAnswers) {
                                                const label = item?.questionAnswer?.questionLabel ?? "";
                                                const value = item?.questionAnswer?.answer ?? "";

                                                switch (label) {
                                                    case "Company Name": companyData.CompanyName = value; break;
                                                    case "Company Address": companyData.CompanyAddress = value; break;
                                                    case "Company City": companyData.CompanyCity = value; break;
                                                    case "Company State": companyData.CompanyState = value; break;
                                                    case "Company Pincode": companyData.CompanyPincode = value; break;
                                                    case "Company Country": companyData.CompanyCountry = value; break;
                                                    case "Class of Company": companyData.ClassOfCompany = value; break;
                                                    case "Company Activity": companyData.CompanyActivity = value; break;
                                                    case "NIC Code": companyData.NICCode = value; break;
                                                    case "NIC Code Description": companyData.NICCodeDescription = value; break;
                                                    case "Company Status": companyData.CompanyStatus = value; break;
                                                    case "Date of Incorporation": companyData.DateOfIncorporation = returndatenew?.(value) ?? ''; break;
                                                    case "Age of Company": companyData.AgeOfCompany = value; break;
                                                    case "Listing Status": companyData.ListingStatus = value; break;
                                                    case "Date of Last Balance Sheet": companyData.DateOfLastBalanceSheet = returndatenew?.(value) ?? ''; break;
                                                    case "Date of Last Annual General Meeting": companyData.DateofLastAnnualGeneralMeeting = returndatenew?.(value) ?? ''; break;
                                                    case "Authorized Capital": companyData.AuthorizedCapital = value; break;
                                                    case "Paid Up Capital": companyData.PaidUpCapital = value; break;
                                                    case "Management Details": companyData.ManagementDetails = value; break;
                                                    case "Company Number": companyData.CompanyNumber = value; break;
                                                    case "Company Email": companyData.CompanyEmail = value; break;
                                                    case "Company Website": companyData.CompanyWebsite = value; break;
                                                    case "Comments": companyData.Comments = value; break;
                                                    case "Risk Score": companyData.RiskScore = value; break;
                                                    case "Risk Grade": companyData.RiskGrade = value; break;
                                                    case "Description": companyData.Description = value; break;

                                                    // Handle grouped score data
                                                    case "Min Score":
                                                    case "Max Score":
                                                    case "Category":
                                                    case "Grade Description": {
                                                        let lastObj = questionnairesList[questionnairesList.length - 1];
                                                        if (!lastObj || (lastObj.MinScore && lastObj.MaxScore && lastObj.Category && lastObj.GradeDescription)) {
                                                            lastObj = {
                                                                round: roundMap?.[vendor?.vendorID] ?? '',
                                                                NfaNumber: DocId ?? '',
                                                                ProposedVendorCode: vendor?.vendorID ?? '',
                                                                MinScore: '',
                                                                MaxScore: '',
                                                                Category: '',
                                                                GradeDescription: ''
                                                            };
                                                            questionnairesList.push(lastObj);
                                                        }

                                                        if (label === "Min Score") lastObj.MinScore = value;
                                                        if (label === "Max Score") lastObj.MaxScore = value;
                                                        if (label === "Category") lastObj.Category = value;
                                                        if (label === "Grade Description") lastObj.GradeDescription = value;
                                                        break;
                                                    }

                                                    default:
                                                        companyData.otherField = value;
                                                        break;
                                                }
                                            }

                                            console.log('✅ Company Data:', companyData);
                                            questionnaireArray.push(companyData);

                                            console.log('📋 All Questionnaires:', questionnairesList);

                                            try {
                                                await InsertDueDeligence(questionnaireArray, questionnairesList);
                                            } catch (err) {
                                                console.error(`❌ Error inserting Due Diligence data for ${vendor?.vendorID}:`, err.message);
                                            }

                                            break;
                                        }
                                    }

                                    // If "Due Diligence" questionnaire not found
                                    if (!flag) {
                                        console.warn(`⚠️ No Due Diligence questionnaire found for ${vendor?.vendorID}, falling back to Excel data.`);

                                        function parseSheet(sheet) {
                                            const data = xlsx.utils.sheet_to_json(sheet, { header: 1 });
                                            const result = { "Questionnaire details": [], "Grade RX": [] };

                                            let currentGroup = null;
                                            let currentObj = {};

                                            for (const row of data) {
                                                if (!row?.length) continue;

                                                const key = row[0]?.toString().trim();
                                                const value = row[1]?.toString().trim();
                                                if (!key) continue;

                                                if (key === "Questionnaire details" || key.startsWith("Grade RX")) {
                                                    if (Object.keys(currentObj).length > 0) {
                                                        if (currentGroup === "Questionnaire details") result["Questionnaire details"].push(currentObj);
                                                        else if (currentGroup?.startsWith("Grade RX")) result["Grade RX"].push(currentObj);
                                                        currentObj = {};
                                                    }
                                                    currentGroup = key;
                                                    continue;
                                                }

                                                currentObj[key] = value;
                                            }

                                            // Push last group
                                            if (Object.keys(currentObj).length > 0) {
                                                if (currentGroup === "Questionnaire details") result["Questionnaire details"].push(currentObj);
                                                else if (currentGroup?.startsWith("Grade RX")) result["Grade RX"].push(currentObj);
                                            }

                                            return result;
                                        }

                                        try {
                                            const filePath = path.join(__dirname, '../attachments/Due Deligence Test.xlsx');

                                            if (!fs.existsSync(filePath)) {
                                                console.error('❌ File "Due Deligence Test.xlsx" not found in attachments folder.');
                                                return;
                                            }

                                            const fileBuffer = fs.readFileSync(filePath);
                                            const workbook = xlsx.read(fileBuffer, { type: 'buffer' });
                                            const sheetName = workbook?.SheetNames?.[0];
                                            const sheet = workbook?.Sheets?.[sheetName];

                                            if (!sheet) {
                                                console.error('❌ No sheet found in Excel workbook.');
                                                return;
                                            }

                                            const exceldata = parseSheet(sheet);

                                            // Attach round/vendor info safely
                                            for (const v of exceldata["Questionnaire details"] ?? []) {
                                                v.round = roundMap?.[vendor?.vendorID] ?? '';
                                                v.NfaNumber = DocId ?? '';
                                                v.ProposedVendorCode = vendor?.vendorID ?? '';
                                            }

                                            for (const v of exceldata["Grade RX"] ?? []) {
                                                v.round = roundMap?.[vendor?.vendorID] ?? '';
                                                v.NfaNumber = DocId ?? '';
                                                v.ProposedVendorCode = vendor?.vendorID ?? '';
                                            }

                                            await InsertDueDeligence(exceldata["Questionnaire details"], exceldata["Grade RX"]);
                                            console.log('✅ Excel fallback data processed successfully:', exceldata);

                                        } catch (error) {
                                            console.error('❌ Error reading Excel:', error);
                                        }
                                    }

                                } catch (mainErr) {
                                    console.error('❌ Fatal error in Due Diligence processing:', mainErr.message);
                                }

                            }


                        }

                        // Usage
                        const data = await fetchDueDiligenceData(vendorArray);
                        console.log(data);

                        ////



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
                                HrClearanceCertificates: doc?.HrClearanceCertificates || null,
                                JobClearanceCertificates: doc?.JobClearanceCertificates || null,
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
                                ApprovingPlant: doc?.ApprovingPlant || null,
                                ProductServiceDescriptionBackground: doc?.ProductServiceDescriptionBackground || null
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
                            // //debugger

                            for (let i = 0; i < array.length; i++) {
                                if (array[i].title == "SBU Unit Location") {
                                    SbuUnitLocation = array[i].terms[0].value.simpleValue;
                                }
                                if (array[i].title == "Approving Plant") {
                                    ApprovingPlantItem = array[i].terms[0].value.simpleValue;
                                }
                                var ItemQuantity, ItemPrice, ItemImproviseAmount;
                                if (array?.[i]?.commodity) {
                                    const terms = array[i]?.terms ?? [];
                                    let ItemQuantity = "";
                                    let ItemPrice = "";
                                    let ItemImproviseAmount = "";

                                    for (let j = 0; j < terms.length; j++) {
                                        const term = terms[j];
                                        const title = term?.title ?? "";

                                        if (title === 'Quantity') {
                                            const amount = term?.value?.quantityValue?.amount ?? 0;
                                            const unitCode = term?.value?.quantityValue?.unitOfMeasureCode ?? "";
                                            ItemQuantity = `${amount} ${unitCode}`.trim();
                                        }

                                        if (title === 'Price') {
                                            const amount = term?.historyValue?.moneyValue?.amount ?? 0;
                                            const currency = term?.historyValue?.moneyValue?.currency ?? "";
                                            ItemPrice = `${amount} ${currency}`.trim();
                                        }

                                        if (title === 'Unit Cost') {
                                            ItemImproviseAmount = term?.itemBiddingRules?.revisedBidRule?.absoluteImprovement ?? "";
                                        }
                                    }

                                    // Validate values before pushing
                                    const numericQty = parseFloat(ItemQuantity.split(" ")[0]) || 0;
                                    const numericPrice = parseFloat(ItemPrice.split(" ")[0]) || 0;

                                    if (numericQty === 0 || numericPrice === 0) {
                                        // Skip incomplete or invalid entries
                                        continue;
                                    }

                                    ItemsPrice.push({
                                        quantity: ItemQuantity,
                                        Price: ItemPrice,
                                        improvise_amount: ItemImproviseAmount,
                                        ItemId: array?.[i]?.itemId ?? "",
                                        ItemName: array?.[i]?.title ?? ""
                                    });

                                    // Reset values (for clarity, optional)
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
                        // Initialize values with safe defaults
                        let roundsSummary = [];
                        let lastRound = null;
                        let diffDays = null;
                        let RfpPublishDateFinal = null;

                        if (Array.isArray(RoundsData?.payload) && RoundsData.payload.length > 0) {
                            roundsSummary = RoundsData.payload.map(round => ({
                                roundNumber: round?.roundNumber ?? "",
                                suppliersCount: Array.isArray(round?.suppliers) ? round.suppliers.length : 0,
                                suppliers: Array.isArray(round?.suppliers) ? round.suppliers : [],
                                biddingStartDate: round?.biddingStartDate ?? "",
                                biddingEndDate: round?.biddingEndDate ?? ""
                            }));

                            lastRound = roundsSummary[roundsSummary.length - 1];

                            const lastRoundEndDate = new Date(lastRound?.biddingEndDate);
                            const documentCreateDate = new Date(DocumentUrlCreateDate);

                            if (!isNaN(lastRoundEndDate) && !isNaN(documentCreateDate)) {
                                diffDays = Math.floor((lastRoundEndDate - documentCreateDate) / (1000 * 60 * 60 * 24));
                            }
                        }

                        // Safe call to returndate function
                        if (typeof returndate === "function") {
                            RfpPublishDateFinal = returndate(RfpPublishDate);
                        }

                        // Now you can safely use these variables outside the if block
                        console.log({ roundsSummary, lastRound, diffDays, RfpPublishDateFinal });


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
                            SBUUnitLocation: SbuUnitLocation,
                            maxRound: lastRound.roundNumber,
                            CreatedBy: req.user.id === 'anonymous' ? "prem.k@peolsolutions.com" : req.user.id,

                            ...extraFields
                        });

                        console.log("GeneralDetailsArr", GeneralDetailsArr);
                        const insertGeneral = await INSERT.into(NfaDetails).entries(GeneralDetailsArr);
                        console.log(insertGeneral);
                        //INSERTING GENERAL DETAILS
                        // for (const entry of GeneralDetailsArr) {
                        //     console.log('typeOF', typeof (entry.NfaNumber));
                        //     console.log('isIT', entry.NfaNumber);
                        //     const existing = await SELECT.from(NfaDetails).where({ NfaNumber: entry.NfaNumber });
                        //     console.log("existing", existing);
                        //     if (existing.length > 0) {
                        //         // record exists → update it
                        //         await UPDATE(NfaDetails)
                        //             .set(entry)
                        //             .where({ NfaNumber: entry.NfaNumber });
                        //     } else {
                        //         // record does not exist → insert it
                        //         // const insertGeneral = await INSERT.into(NfaDetails).entries(entry);
                        //         console.log('insertGeneral', insertGeneral);
                        //     }
                        // }



                        //debugger
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
                                        AmendmentValueTotalNfaAmount: row.FormattedTotalNFAAmount,
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
                                        HrClearanceCertificates: row.HrClearanceCertificates,
                                        JobClearanceCertificates: row.JobClearanceCertificates,
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
                                        NfaVendorItemsDetails: [],
                                        ProductServiceDescriptionBackground: row.ProductServiceDescriptionBackground
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
                                    UnitOfMeasureCode: row.UnitOfMeasureCode,
                                    ItemDescription: row.ItemDescription,
                                    UnitPrice: row.UnitPrice,
                                    BidRank: row.BidRank,
                                    DiscountPercentage: row.DiscountPercentage,
                                    TaxPercentage: row.TaxPercentage,
                                    Freight: row.Freight,
                                    Savings: row.Savings,
                                    SavingsPercent: row.SavingsPercent,
                                    MaterialCost: row.MaterialCost,
                                    LabourCost: row.LabourCost,
                                    ProcessingCost: row.ProcessingCost,
                                    PackagingCost: row.PackagingCost,
                                    MaterialCode: row.MaterialCode,
                                    Profit: row.Profit,
                                    LandedPrice: row.LandedPrice,
                                    ExistingPoNumber: row.ExistingPoNumber,
                                    ExistingPoContractValue: row.ExistingPoContractValue

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

                                const spendAmount = parseFloat((vendor.FormattedVendorsSpendAmount || '').replace(/[^0-9.]/g, '')) || 0;
                                const turnoverAmount = parseFloat((vendor.FormattedVendorsTurnOverAmount || '').replace(/[^0-9.]/g, '')) || 0;


                                if (turnoverAmount > 0 && !isNaN(turnoverAmount)) {
                                    isVendorDependency = (spendAmount / turnoverAmount) * 100;
                                } else {
                                    // Optionally log or handle invalid turnover
                                    console.warn(`Invalid turnover amount for vendor: ${turnoverAmount}`);
                                }
                                console.log("isVendorDependency", isVendorDependency);

                                // Find split entry for this vendor
                                const splitEntry = vendorSplitArray.find(v => v.vendorId === vendor.SupplierId);
                                if (splitEntry) {
                                    SplitAmount = splitEntry.splitAmount;
                                }
                                if (SplitAmount) {
                                    IsAwarded = "Yes"
                                }
                                else {
                                    IsAwarded = "No"
                                }
                                // Push parent-round object
                                transformedResultPerRound.push({
                                    ProposedVendorCode: vendor.SupplierId,
                                    NfaNumber: DocId,
                                    round: parseInt(roundNumber, 10),
                                    AwardedVendor: IsAwarded,
                                    VendorName: vendor.VendorName,
                                    VendorLocation: matchedSupplier ? matchedSupplier.SupplierFinalAddress : null,
                                    // OrderAmountOrSplitOrderAmount: orderAmount, // sum of ExtendedPrice for rank 1 items
                                    OrderAmountOrSplitOrderAmount: SplitAmount || '',
                                    // DiscountPercentage: vendor.DiscountPercentage,
                                    AmendmentInExistingPoArcContract: vendor.AmendmentValue,
                                    PricingInBusinessPlanIfApplicable: vendor.BusinessPlanPricingValue,
                                    PriceJustification: vendor.PriceJustificationValue,
                                    DeviationsfromGroupPhilosophyCardinalRules: vendor.CardinalRulesValue,
                                    ListOfDeviation: vendor.DeviationListValue,
                                    PenaltyClauseForQuality: vendor.PenaltyQualityValue,
                                    PenaltyCriteria: vendor.PenaltyCriteriaValue,
                                    RationaleIfNotL1: vendor.RationaleL1Value,
                                    AmendmentValueTotalNfaAmount: vendor.AmendmentValueTotalNfaAmount,
                                    Budget: vendor.BudgetValue,
                                    RationalForNotDoingAuction: vendor.RationalValue,
                                    IsAnyNewInitiativeBestpractices: vendor.NewInitiativeBestPracticesValue,
                                    NegotiationCommittee: vendor.NegotiationCommitteValue,
                                    IsThereAnyImportSupplyUnderThisProposal: vendor.ImportSupplyProposal,
                                    LastPurchasePriceClpp: vendor.FormattedCLPPLastPurchaseAmount,
                                    ContractPeriod: vendor.ContractPeriodValue,
                                    OrderTypePartiesContactedAndTechnicallyAccepted: vendor.OrderTypePartiesValue,
                                    IsVendorDependency: isVendorDependency > 50 ? true : false,
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
                                    HrClearanceCertificates: vendor.HrClearanceCertificates,
                                    JobClearanceCertificates: vendor.JobClearanceCertificates,
                                    LiquidatedDamages: vendor.LiquidatedDamagesValue,
                                    LiquidatedDamagesClause: vendor.LiquidatedDamagesClValue,
                                    PbgAndSd: vendor.PBGAndSDValue,
                                    PbgAndSdClause: vendor.PBGAndSDClValue,
                                    OtherKeyTerms: vendor.OtherKeyTermsValue,
                                    RationalForAwardingContractToDependentPartner: vendor.RationalToDependentPartnerValue,
                                    DeliveryLeadTime: vendor.DeliveryLeadTimeValue,
                                    NfaVendorItemsDetails: itemsOfRound,// only items of this round
                                    ProductServiceDescriptionBackground: vendor.ProductServiceDescriptionBackground
                                });
                            });
                        });




                        // Now transformedResultPerRound contains parent-level vendors split by round

                        //Rounds 
                        console.log("transformedResultPerRound", transformedResultPerRound);
                        //debugger
                        for (const parent of transformedResultPerRound) {
                            const parentEntry = {
                                ProposedVendorCode: parent.ProposedVendorCode,
                                NfaNumber: parent.NfaNumber,
                                round: parseInt(parent.round, 10),
                                AwardedVendor: parent.AwardedVendor,
                                VendorName: parent.VendorName,
                                VendorLocation: parent.VendorLocation,
                                OrderAmountOrSplitOrderAmount: parent.OrderAmountOrSplitOrderAmount,
                                AmendmentInExistingPoArcContract: parent.AmendmentInExistingPoArcContract,
                                PricingInBusinessPlanIfApplicable: parent.PricingInBusinessPlanIfApplicable,
                                PriceJustification: parent.PriceJustification,
                                DeviationsfromGroupPhilosophyCardinalRules: parent.DeviationsfromGroupPhilosophyCardinalRules,
                                ListOfDeviation: parent.ListOfDeviation,
                                PenaltyClauseForQuality: parent.PenaltyClauseForQuality,
                                PenaltyCriteria: parent.PenaltyCriteria,
                                RationaleIfNotL1: parent.RationaleIfNotL1,
                                AmendmentValueTotalNfaAmount: parent.AmendmentValueTotalNfaAmount,
                                Budget: parent.Budget,
                                RationalForNotDoingAuction: parent.RationalForNotDoingAuction,
                                IsAnyNewInitiativeBestpractices: parent.IsAnyNewInitiativeBestpractices,
                                NegotiationCommittee: parent.NegotiationCommittee,
                                IsThereAnyImportSupplyUnderThisProposal: parent.IsThereAnyImportSupplyUnderThisProposal,
                                LastPurchasePriceClpp: parent.LastPurchasePriceClpp,
                                ContractPeriod: parent.ContractPeriod,
                                OrderTypePartiesContactedAndTechnicallyAccepted: parent.OrderTypePartiesContactedAndTechnicallyAccepted,
                                IsVendorDependency: parent.IsVendorDependency,
                                VendorsLatestAvailableTurnover: parent.VendorsLatestAvailableTurnover,
                                TotalVendorSpendforCurrentFY: parent.TotalVendorSpendforCurrentFY,
                                ShortlistedPartiesCredentialsBackground: parent.ShortlistedPartiesCredentialsBackground,
                                InternalSLAsKPIsForTheContract: parent.InternalSLAsKPIsForTheContract,
                                ContractValueBasicValue: parent.ContractValueBasicValue,
                                FTAEPCGAnyOtherBenefitAvailedForDutySaving: parent.FTAEPCGAnyOtherBenefitAvailedForDutySaving,
                                ApproximateDutyAmountInINR: parent.ApproximateDutyAmountInINR,
                                MonthlyQuantity: parent.MonthlyQuantity,
                                ReasonForPostFactoNFAIfApplicable: parent.ReasonForPostFactoNFAIfApplicable,
                                IncoTerm: parent.IncoTerm,
                                TermsOfPaymentMilestoneOnwhichPaymentWillBemade: parent.TermsOfPaymentMilestoneOnwhichPaymentWillBemade,
                                PackingForwarding: parent.PackingForwarding,
                                Insurance: parent.Insurance,
                                HrClearanceCertificates: parent.HrClearanceCertificates,
                                JobClearanceCertificates: parent.JobClearanceCertificates,
                                LiquidatedDamages: parent.LiquidatedDamages,
                                LiquidatedDamagesClause: parent.LiquidatedDamagesClause,
                                PbgAndSd: parent.PbgAndSd,
                                PbgAndSdClause: parent.PbgAndSdClause,
                                OtherKeyTerms: parent.OtherKeyTerms,
                                RationalForAwardingContractToDependentPartner: parent.RationalForAwardingContractToDependentPartner,
                                ProductServiceDescriptionBackground: parent.ProductServiceDescriptionBackground,
                                DeliveryLeadTime: parent.DeliveryLeadTime,
                            }
                            await INSERT.into(NfaVendorData).entries(parentEntry);
                            if (parent.NfaVendorItemsDetails && parent.NfaVendorItemsDetails.length > 0) {
                                const childEntries = parent.NfaVendorItemsDetails.map(item => ({
                                    NfaNumber: DocId,
                                    ProposedVendorCode: parent.ProposedVendorCode,
                                    ItemCode: item.ItemId,
                                    Name: item.ItemName,
                                    round: parseInt(item.Round, 10),
                                    Rank: item.BidRank,
                                    Freight: item.Freight,
                                    ItemShortDescription: item.ItemDescription,
                                    Uom: item.UnitOfMeasureCode,
                                    Quantity: item.UnitOfMeasure,
                                    UnitPrice: item.UnitPrice,
                                    DiscountPercentage: item.DiscountPercentage,
                                    IndianTaxPER: item.TaxPercentage,
                                    Savings: item.Savings,
                                    SavingsPercent: item.SavingsPercent,
                                    MaterialCost: item.MaterialCost,
                                    LabourCost: item.LabourCost,
                                    ProcessingCost: item.ProcessingCost,
                                    PackagingCost: item.PackagingCost,
                                    MaterialCode: item.MaterialCode,
                                    Profit: item.Profit,
                                    LandedPrice: item.LandedPrice,
                                    ExistingPoNumber: item.ExistingPoNumber,
                                    ExistingPoContractValue: item.ExistingPoContractValue,
                                }))
                                await INSERT.into(NfaVendorItemsDetails).entries(childEntries);
                            }
                        }
                        //debugger

                        const approverRulesData = await SELECT.from(RulesApprovers);

                        // Filter for hrData, jobData, and defaultData
                        const hrData = approverRulesData.filter(item => item.ruleName === 'Hr');
                        const jobData = approverRulesData.filter(item => item.ruleName === 'Job');
                        const defaultDataLevel1 = approverRulesData.filter(item => item.ruleName === 'default' && item.level === 1);
                        const defaultDataLevel2 = approverRulesData.filter(item => item.ruleName === 'default' && item.level === 2);
                        // Initialize sets to track EmployeeID per level
                        const level1EmployeeIDs = new Set();
                        const level2EmployeeIDs = new Set();

                        if (isHr && isJob) {
                            // Both HR and Job are present
                            if (hrData.length > 0 && jobData.length > 0 && defaultDataLevel1.length > 0 && defaultDataLevel2.length > 0) {
                                // Level 1: HR Data
                                hrData.forEach(item => {
                                    if (!level1EmployeeIDs.has(item.EmployeeID)) {
                                        level1EmployeeIDs.add(item.EmployeeID); // Mark this EmployeeID as added for level 1
                                        WorkflowHistory.push({
                                            NfaNumber: DocId,
                                            level: 1,
                                            EmployeeID: item.EmployeeID,
                                            EmployeeName: item.EmployeeName,
                                        });
                                    }
                                });

                                // Level 1: Job Data
                                jobData.forEach(item => {
                                    if (!level1EmployeeIDs.has(item.EmployeeID)) {
                                        level1EmployeeIDs.add(item.EmployeeID); // Mark this EmployeeID as added for level 1
                                        WorkflowHistory.push({
                                            NfaNumber: DocId,
                                            level: 1,
                                            EmployeeID: item.EmployeeID,
                                            EmployeeName: item.EmployeeName,
                                        });
                                    }
                                });

                                // Level 2: Default Data
                                defaultDataLevel2.forEach(item => {
                                    if (!level2EmployeeIDs.has(item.EmployeeID)) {
                                        level2EmployeeIDs.add(item.EmployeeID); // Mark this EmployeeID as added for level 2
                                        WorkflowHistory.push({
                                            NfaNumber: DocId,
                                            level: 2,
                                            EmployeeID: item.EmployeeID,
                                            EmployeeName: item.EmployeeName,
                                        });
                                    }
                                });
                            }
                        } else if (isHr) {
                            // Only HR is present
                            if (hrData.length > 0 && defaultDataLevel1.length > 0 && defaultDataLevel2.length > 0) {
                                // Level 1: HR Data
                                hrData.forEach(item => {
                                    if (!level1EmployeeIDs.has(item.EmployeeID)) {
                                        level1EmployeeIDs.add(item.EmployeeID); // Mark this EmployeeID as added for level 1
                                        WorkflowHistory.push({
                                            NfaNumber: DocId,
                                            level: 1,
                                            EmployeeID: item.EmployeeID,
                                            EmployeeName: item.EmployeeName,
                                        });
                                    }
                                });

                                // Level 2: Default Data
                                defaultDataLevel2.forEach(item => {
                                    if (!level2EmployeeIDs.has(item.EmployeeID)) {
                                        level2EmployeeIDs.add(item.EmployeeID); // Mark this EmployeeID as added for level 2
                                        WorkflowHistory.push({
                                            NfaNumber: DocId,
                                            level: 2,
                                            EmployeeID: item.EmployeeID,
                                            EmployeeName: item.EmployeeName,
                                        });
                                    }
                                });
                            }
                        } else if (isJob) {
                            // Only Job is present
                            if (jobData.length > 0 && defaultDataLevel1.length > 0 && defaultDataLevel2.length > 0) {
                                // Level 1: Job Data
                                jobData.forEach(item => {
                                    if (!level1EmployeeIDs.has(item.EmployeeID)) {
                                        level1EmployeeIDs.add(item.EmployeeID); // Mark this EmployeeID as added for level 1
                                        WorkflowHistory.push({
                                            NfaNumber: DocId,
                                            level: 1,
                                            EmployeeID: item.EmployeeID,
                                            EmployeeName: item.EmployeeName,
                                        });
                                    }
                                });

                                // Level 2: Default Data
                                defaultDataLevel2.forEach(item => {
                                    if (!level2EmployeeIDs.has(item.EmployeeID)) {
                                        level2EmployeeIDs.add(item.EmployeeID); // Mark this EmployeeID as added for level 2
                                        WorkflowHistory.push({
                                            NfaNumber: DocId,
                                            level: 2,
                                            EmployeeID: item.EmployeeID,
                                            EmployeeName: item.EmployeeName,
                                        });
                                    }
                                });
                            }
                        } else {
                            // Neither HR nor Job is present, use default data for both levels
                            if (defaultDataLevel1.length > 0 && defaultDataLevel2.length > 0) {
                                // Level 1: Default Data
                                defaultDataLevel1.forEach(item => {
                                    if (!level1EmployeeIDs.has(item.EmployeeID)) {
                                        level1EmployeeIDs.add(item.EmployeeID); // Mark this EmployeeID as added for level 1
                                        WorkflowHistory.push({
                                            NfaNumber: DocId,
                                            level: 1,
                                            EmployeeID: item.EmployeeID,
                                            EmployeeName: item.EmployeeName,
                                        });
                                    }
                                });

                                // Level 2: Default Data
                                defaultDataLevel2.forEach(item => {
                                    if (!level2EmployeeIDs.has(item.EmployeeID)) {
                                        level2EmployeeIDs.add(item.EmployeeID); // Mark this EmployeeID as added for level 2
                                        WorkflowHistory.push({
                                            NfaNumber: DocId,
                                            level: 2,
                                            EmployeeID: item.EmployeeID,
                                            EmployeeName: item.EmployeeName,
                                        });
                                    }
                                });
                            }
                        }

                        console.log(WorkflowHistory); // Verify the result
                        // Insert all entries at once
                        await INSERT.into(NfaWorkflowHistory).entries(WorkflowHistory);
                        console.log("Inserted Into WorkFlow History")

                        // questions 



                        // questions 

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
                        // ItemsDetails.forEach(item => {
                        //     NfaVendorItems.push({
                        //         NfaNumber: DocId,
                        //         ProposedVendorCode: item.SupplierId,
                        //         ItemCode: item.ItemId,
                        //         round: item.Round,
                        //         Rank: item.BidRank,
                        //         Freight: item.Freight,
                        //         ItemShortDescription: item.ItemDescription,
                        //         Uom: item.UnitOfMeasureCode,
                        //         Quantity: item.UnitOfMeasure,
                        //         UnitPrice: item.UnitPrice,
                        //         IndianTaxPER: item.TaxPercentage,
                        //     });
                        // });

                        //debugger



                    }


                }
            }
            catch (e) {
                console.log(e)

            }
        });

        this.on('discardNfaData', async (req) => {
            try {
                let rFP = req.data.NfaNumber;

                console.log("Discard NFA Data for:", rFP);
                const nfaDetails = await cds.read('NfaDetails').where({ RfpNumber: rFP });
                console.log(nfaDetails[0].NfaNumber);
                const NfaNumber = nfaDetails[0].NfaNumber;


                // --- Delete child entities first ---

                // Delete NfaWorkflowHistory
                await DELETE.from(NfaWorkflowHistory).where({ NfaNumber });
                console.log("NfaWorkflowHistory deleted for", NfaNumber);

                // Delete NfaVendorItemsDetails
                await DELETE.from(NfaVendorItemsDetails).where({ NfaNumber });
                console.log("NfaVendorItemsDetails deleted for", NfaNumber);

                // Delete NfaVendorDueDeligenceDetails
                await DELETE.from(NfaVendorDueDeligenceDetails).where({ NfaNumber });
                console.log("NfaVendorDueDeligenceDetails deleted for", NfaNumber);

                // Delete NfaVendorDueDeligenceDetailsGrade
                await DELETE.from(NfaVendorDueDeligenceDetailsGrade).where({ NfaNumber });
                console.log("NfaVendorDueDeligenceDetailsGrade deleted for", NfaNumber);

                // Delete NfaVendorData
                await DELETE.from(NfaVendorData).where({ NfaNumber });
                console.log("NfaVendorData deleted for", NfaNumber);

                // --- Finally delete NfaDetails ---
                await DELETE.from(NfaDetails).where({ NfaNumber });
                console.log("NfaDetails deleted for", NfaNumber);

                return { message: `All NFA data for NfaNumber=${NfaNumber} discarded successfully.` };
            } catch (error) {
                console.error("discardNfaData Error:", error);
                return { error: error.message };
            }
        });



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