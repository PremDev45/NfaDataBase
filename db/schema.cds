namespace db;

using {
    cuid,
    managed
} from '@sap/cds/common';

entity NfaDetails {
    key PanNumber                                  : String default 'def';
        //listPage//
        BUORPurchasingGroup                        : String;
        PlantCode                                  : String;
        Status                                     : String;
        //listPage//
        //General Details//
        SBUUnitLocation                            : String;
        AmendmentInExistingPoArcContract           : Boolean;
        PricingInBusinessPlanIfApplicable          : String;
        PriceJustification                         : String;
        DeviationsfromGroupPhilosophyCardinalRules : String;
        ListOfDeviation                            : String;
        PenaltyClauseForQuality                    : String;
        PenaltyCriteria                            : String;
        RationaleIfNotL1                           : String;
        NFAID                                      : String;
        ApprovingPlant                             : String;
        ExistingPoNumber                           : String;
        //General Details//
        //Header Leavel Info//
        AmendmentValueTotalNfaAmount               : String;
        Budget                                     : String;
        RationalForNotDoingAuction                 : Boolean;
        IsAnyNewInitiativeBestpractices            : String;
        NegotiationCommittee                       : String;
        IsThereAnyImportSupplyUnderThisProposal    : Boolean;
        LastPurchasePriceClpp                      : String;
        SavingIncreaseAmountOnLpp                  : String;
        PricesAre                                  : String;
        //Header Leavel Info//
        //justification//
        Comments                                   : LargeString;
        //justification//
        //missalanious//
        StatusInd                                  : Integer; //used for criticality rep
        CreatedBy                                  : String;
        TaskId                                     : String;
        //missalanious//


        // SBG                                        : String;
        // SBU                                        : String;
        // ProjectDescription                         : String;
        // PrNumberBKTsBKT                            : String;
        // SubjectofProposalOROrder                   : String;
        // PreviousPanReferences                      : String;
        // SplitOrderORNoOfvendors                    : String;
        // SopType                                    : String;
        // OrderTypeORDocumenttyFuuidpe               : String;
        // AssetType                                  : String;
        // NatureOfTransaction                        : String;
        // OrderLocationORPlant                       : String;
        // BaseLineSpend                              : String;
        // ProjectCurrencyORBaseCurrency              : String;
        // OrderCurrencyORBidCurrency                 : String;
        // FinalProposedValue                         : String;
        // SavingsAchievedBtwInitialAndFinalQuote     : String;
        // SavingsAgainstBaseLineSpendOfRFP           : String;
        // NumberOfVendorsShortlistedForRFP           : String;
        // NumberOfVendorsTechnicallyQualified        : String;
        // RequiredAtSiteDate                         : String;
        // RfpNumber                                  : String;
        // RfpPublishDate                             : String;
        // TimeTakenForFinalizationDASHInDAYS         : String;
        // Type                                       : String;
        // StatusA                                    : String;
        // SwitchControl                              : Boolean default false;
        // ProjectId                                  : String;
        // NumberOfVendorsInvited                     : String;
        // TotalLevelsOfApproval                      : String(2);
        // CurrentLevelOfApproval                     : String(2);
        // SapWorkitemId                              : String;
        // SubmittedBy                                : String;
        // SubmittedDate                              : String;
        // ExistingPOARCContractValue                 : String;

        NfaDetailsToNfaEventHistory                : Composition of many NfaEventHistory
                                                         on NfaDetailsToNfaEventHistory.NfaEventHistoryToNfaDetails = $self;
        NfaDetailsToNfaVendorData                  : Composition of many NfaVendorData
                                                         on NfaDetailsToNfaVendorData.NfaVendorDataToNfaDetails = $self;
        NfaDetailsToNfaAttachments                 : Composition of many NfaAttachments
                                                         on NfaDetailsToNfaAttachments.NfaAttachmentsToNfaDetails = $self;
        NfaDetailsToNfaCommentsHistory             : Composition of many NfaCommentsHistory
                                                         on NfaDetailsToNfaCommentsHistory.NfaCommentsHistoryToNfaDetails = $self;
        NfaDetailsToNfaWorkflowHistory             : Composition of many NfaWorkflowHistory
                                                         on NfaDetailsToNfaWorkflowHistory.NfaWorkflowHistoryToNfaDetails = $self;


}

entity NfaEventHistory {
    key idd                         : String;
    key PanNumber                   : String;
        //pan web event//
        EventNo                     : String;
        Number                      : String;
        Date                        : String;
        NumberOfVendorsParticipated : String;
        L1AmountObtained            : String;
        //pan web event//


        // ComparisonOfOffer           : String;
        // AuctionDone                 : String;
        // AuctionDetails              : String;

        NfaEventHistoryToNfaDetails : Association to one NfaDetails
                                          on NfaEventHistoryToNfaDetails.PanNumber = PanNumber;
}

entity NfaVendorData {
    key ProposedVendorCode                              : String;
    key PanNumber                                       : String;
        //vendor response details//
        AwardedVendor                                   : String;
        VendorName                                      : String;
        OriginalQuote                                   : String;
        FinalQuote                                      : String;
        VendorLocation                                  : String;
        OrderAmountOrSplitOrderAmount                   : String;
        DiscountPercentage                              : String;
        Rank                                            : String;
        //vendor response details//
        //vendor response//
        ContractPeriod                                  : String;
        OrderTypePartiesContactedAndTechnicallyAccepted : String;
        ContractManagerName                             : String;
        IsVendorDependency                              : Boolean;
        VendorsLatestAvailableTurnover                  : String;
        TotalVendorSpendforCurrentFY                    : String;
        ShortlistedPartiesCredentialsBackground         : String;
        InternalSLAsKPIsForTheContract                  : String;
        ContractValueBasicValue                         : String;
        FTAEPCGAnyOtherBenefitAvailedForDutySaving      : Boolean;
        ApproximateDutyAmountInINR                      : String;
        MonthlyQuantity                                 : String;
        ReasonForPostFactoNFAIfApplicable               : String;
        IncoTerm                                        : String;
        TermsOfPaymentMilestoneOnwhichPaymentWillBemade : String;
        PackingForwarding                               : String;
        Insurance                                       : String;
        LiquidatedDamages                               : String;
        LiquidatedDamagesClause                         : String;
        PbgAndSd                                        : String;
        PbgAndSdClause                                  : String;
        JobClearanceCertificates                        : String;
        HrClearanceCertificates                         : String;
        OtherKeyTerms                                   : String;
        //vendor response//
        //terms and conditions//
        RationalForAwardingContractToDependentPartner   : String;
        //terms and conditions//
        //Item level info//
        ProductServiceDescriptionBackground             : String;
        ApprovalRequestedForSubject                     : String;
        ComparisonOfOffer                               : String;
        TaxAmount                                       : String;
        Freight                                         : String;
        DeliveryLeadTime                                : String;
        //Item level info//


        // TechnicallyApproved                                               : String;
        // ClientApproved                                                    : String;
        // DiscountAmount                                                    : String;
        // ProposedVendorName                                                : String;
        // SupplierOriginState                                               : String;
        // DestinationStateBKTShipDASHtoLocationBKT                          : String;
        // VendorGstNumber                                                   : String;
        // VendorCeScore                                                     : String;
        // VendorCeDate                                                      : String;
        // VendorPeScore                                                     : String;
        // VendorPeDate                                                      : String;
        // VendorContactPersonDASH1                                          : String;
        // VendorContactPersonDASH2                                          : String;
        // TechnicalCommitteewhoClearedTheProposal                           : String;
        // CommercialCommitteewhoClearedTheProposal                          : String;
        // VendorReferencesToBeDisplayedInOrder                              : String;
        // ShortlistedVendorsResponseSummary                                 : String;
        // OrderValueBKTInProjectCurrencyBKT                                 : String;
        // OrderValueBKTInBidCurrencyBKT                                     : String;
        // VendorFinalQuotationDate                                          : String;
        // VendorFinalQuotationAmount                                        : String;
        // ProjectCurrencyORBaseCurrency                                     : String;
        // OrderCurrencyORBidCurrency                                        : String;
        // Incoterms                                                         : String;
        // NumberOfBackToBackTermsAgreedWithVendorAsPerGPCORGCC              : String;
        // DetailsOfDeviatedOrBetterTermsAgreedWithTheVendor                 : String;
        // MarketScenarioAndDemand                                           : String;
        // CompanysPositionAndMarketDynamicsOfThisPurchase                   : String;
        // ShouldBeCostEstimated                                             : String;
        // HighlightsOfThisProposalAndPriceJustificationForThisProposal      : String;
        // PriceEscalationAgreedIfAny                                        : String;
        // ParticularsOfAnyFreeServiceORSupplyGuaranteesORWarrantyfromVendor : String;
        // Transportation                                                    : String;
        // LogisticsCost                                                     : String;
        // DeliverySchedule                                                  : String;
        // TaxDetails                                                        : String;
        // AdditionalRemarks                                                 : String;
        // ABG                                                               : String;
        // ABGValue                                                          : String;
        // CPBG                                                              : String;
        // CPBGValue                                                         : String;
        // ScopeAndResponsibilities                                          : LargeString;
        // CommercialTerms                                                   : LargeString;
        // ComplianceTerms                                                   : LargeString;
        // Others                                                            : LargeString;

        NfaVendorDataToNfaDetails                       : Association to one NfaDetails
                                                              on NfaVendorDataToNfaDetails.PanNumber = PanNumber;
        NfaVendorDataToNfaVendorItemsDetails            : Composition of many NfaVendorItemsDetails
                                                              on NfaVendorDataToNfaVendorItemsDetails.NfaVendorItemsDetailsToNfaVendorData = $self;


}

entity NfaVendorItemsDetails {

    key PanNumber                            : String;
    key ProposedVendorCode                   : String;
    key ItemCode                             : String;
        //item Details//
        HsnOrSacCode                         : String;
        ItemShortDescription                 : String;
        Uom                                  : String;
        Quantity                             : String;
        UnitPrice                            : String;
        //item Details//


        // ExtendedPrice                       : String;
        // Amount                              : String;
        // IndianTaxPER                        : String;
        // QuantityOverDeliveryTolerance       : String;

        NfaVendorItemsDetailsToNfaVendorData : Association to one NfaVendorData
                                                   on  NfaVendorItemsDetailsToNfaVendorData.ProposedVendorCode = ProposedVendorCode
                                                   and NfaVendorItemsDetailsToNfaVendorData.PanNumber          = PanNumber;

}

entity NfaAttachments : cuid, managed {
    key PanNumber                  : String;

        @Core.MediaType  : mediaType
        Content                    : LargeBinary;

        @Core.IsMediaType: true
        MediaType                  : String;
        FileName                   : String;
        Size                       : Integer;
        Url                        : String;

        NfaAttachmentsToNfaDetails : Association to one NfaDetails
                                         on NfaAttachmentsToNfaDetails.PanNumber = PanNumber;
}

entity NfaCommentsHistory : managed {
    key Idd                            : UUID;
    key PanNumber                      : String;
        User                           : String;
        Comments                       : LargeString;
        Status                         : String;
        NfaCommentsHistoryToNfaDetails : Association to one NfaDetails
                                             on NfaCommentsHistoryToNfaDetails.PanNumber = PanNumber;
}

entity NfaWorkflowHistory {
    key Idd                            : UUID;
    key PanNumber                      : String;
        //workflow History//
        level                          : String;
        EmployeeName                   : String;
        EmployeeID                     : String;
        Status                         : String;
        ApprovedBy                     : String;
        DaysTaken                      : String;
        BeginDateAndTime               : String;
        EndDateAndTime                 : String;
        //workflow History//


        // Title                  : String;
        // NotificationStatus     : String;
        // Remarks                : String;

        NfaWorkflowHistoryToNfaDetails : Association to one NfaDetails
                                             on NfaWorkflowHistoryToNfaDetails.PanNumber = PanNumber;
}
entity Rules{
    key ruleName:String;
    activeStatus:Boolean;
    RulesToRulesCondition:Composition of many RulesCondition on RulesToRulesCondition.RulesConditionToRules = $self;
    RulesToRulesLevels:Composition of many RulesLevels on RulesToRulesLevels.RulesLevelsToRules = $self;
}
entity RulesCondition{
    key field:String;
    key ruleName:String;
    comparator:String;
    value1:String;
    value2:String;
    RulesConditionToRules:Association to one Rules on RulesConditionToRules.ruleName=ruleName;
}
entity RulesLevels {
    key ruleName:String;
    key level:Int16;
    RulesLevelsToRules:Association to one Rules on RulesLevelsToRules.ruleName=ruleName;
    RulesLevelsToRulesApprovers:Composition of many RulesApprovers on RulesLevelsToRulesApprovers.RulesApproversToRulesLevels = $self; 
}
entity  RulesApprovers{
    key ruleName:String;
    key level:Int16;
    key EmployeeID                     : String;
    EmployeeName                   : String;
    RulesApproversToRulesLevels:Association to one RulesLevels on RulesApproversToRulesLevels.ruleName=ruleName and RulesApproversToRulesLevels.level=level;
}