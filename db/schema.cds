namespace db;

using {
    cuid,
    managed
} from '@sap/cds/common';

entity NfaDetails {
    key NfaNumber                                  : String default 'def';
        //listPage//
        BUORPurchasingGroup                        : String;
        PlantCode                                  : String;
        Status                                     : String;
        //listPage//
        //General Details//
        SBUUnitLocation                            : String;
        AmendmentInExistingPoArcContract           : Boolean;//Move to Vendor
        PricingInBusinessPlanIfApplicable          : String;//Move to Vendor
        PriceJustification                         : String;//Move to Vendor
        DeviationsfromGroupPhilosophyCardinalRules : String;//Move to Vendor
        ListOfDeviation                            : String;//Move to Vendor
        PenaltyClauseForQuality                    : String;//Move to Vendor
        PenaltyCriteria                            : String;//Move to Vendor
        RationaleIfNotL1                           : String;//Move to Vendor
        NFAID                                      : String;
        ApprovingPlant                             : String;
        ExistingPoNumber                           : String;//Move to Vendor
        //General Details//
        //Header Leavel Info//
        AmendmentValueTotalNfaAmount               : String;//Move to Vendor
        Budget                                     : String;//Move to Vendor
        RationalForNotDoingAuction                 : Boolean;//Move to Vendor
        IsAnyNewInitiativeBestpractices            : String;//Move to Vendor
        NegotiationCommittee                       : String;//Move to Vendor
        IsThereAnyImportSupplyUnderThisProposal    : Boolean;//Move to Vendor
        LastPurchasePriceClpp                      : String;//Move to Vendor
        SavingIncreaseAmountOnLpp                  : String;//Move to Vendor
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
    key NfaNumber                   : String;
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
                                          on NfaEventHistoryToNfaDetails.NfaNumber = NfaNumber;
}

entity NfaVendorData {
    //Exisint/po/arc/contractValue new field
    // Penalty clause for safety- Subcontract(Allowed/ Not Allowed) (If Yes, which party and crendential of the party and technical approval of the party has to be enclosed in NFA) new field
    key ProposedVendorCode                              : String;
    key NfaNumber                                       : String;
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
        IncoTerm                                        : String;//Move to Vendoritem 
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
        ComparisonOfOffer                               : String;//Move to NfaVendorItemsDetails
        TaxAmount                                       : String;//Move to NfaVendorItemsDetails
        Freight                                         : String;//Move to NfaVendorItemsDetails
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
                                                              on NfaVendorDataToNfaDetails.NfaNumber = NfaNumber;
        NfaVendorDataToNfaVendorItemsDetails            : Composition of many NfaVendorItemsDetails
                                                              on NfaVendorDataToNfaVendorItemsDetails.NfaVendorItemsDetailsToNfaVendorData = $self;


}

entity NfaVendorItemsDetails  {

    key NfaNumber                            : String;
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
                                                   and NfaVendorItemsDetailsToNfaVendorData.NfaNumber          = NfaNumber;

}

entity NfaAttachments : cuid, managed {
    key NfaNumber                  : String;

        @Core.MediaType  : MediaType
        Content                    : LargeBinary;

        @Core.IsMediaType: true
        MediaType                  : String;
        FileName                   : String;
        Size                       : Integer;
        Url                        : String;

        NfaAttachmentsToNfaDetails : Association to one NfaDetails
                                         on NfaAttachmentsToNfaDetails.NfaNumber = NfaNumber;
}

entity NfaCommentsHistory : managed {
    key Idd                            : UUID;
    key NfaNumber                      : String;
        User                           : String;
        Comments                       : LargeString;
        Status                         : String;
        NfaCommentsHistoryToNfaDetails : Association to one NfaDetails
                                             on NfaCommentsHistoryToNfaDetails.NfaNumber = NfaNumber;
}

entity NfaWorkflowHistory {
    key NfaNumber                      : String;
        //workflow History//
    key level                          : Int16;
    key  EmployeeID                     : String;
        EmployeeName                   : String;
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
                                             on NfaWorkflowHistoryToNfaDetails.NfaNumber = NfaNumber;
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
entity  Approvers{
    key EmployeeID                     : String;
    EmployeeName                   : String;
}