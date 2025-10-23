using db from '../db/schema';

service NfaForm {
    @odata.draft.enabled
    entity NfaDetails                        as projection on db.NfaDetails
                                                where
                                                    CreatedBy = 'prem.k@peolsolutions.com';

    entity NfaEventHistory                   as projection on db.NfaEventHistory;
    entity NfaVendorData                     as projection on db.NfaVendorData;
    entity NfaVendorItemsDetails             as projection on db.NfaVendorItemsDetails;
    entity NfaVendorDueDeligenceDetails      as projection on db.NfaVendorDueDeligenceDetails;
    entity NfaVendorDueDeligenceDetailsGrade as projection on db.NfaVendorDueDeligenceDetailsGrade;
    entity NfaAttachments                    as projection on db.NfaAttachments;
    entity NfaCommentsHistory                as projection on db.NfaCommentsHistory;
    entity NfaWorkflowHistory                as projection on db.NfaWorkflowHistory;

    @odata.draft.enabled
    entity Rules                             as projection on db.Rules;

    entity Approvers                         as projection on db.Approvers;
    function getDataForUserAndProject(user: String, project: String)                     returns String;
    function getHrJob(NfaNumber: String, invitationId: String)                           returns String;
    function getJobClearanceCertificate(NfaNumber: String, invitationId: String)         returns String;
    function getInsurance(NfaNumber: String, invitationId: String)                       returns String;
    function discardNfaData(NfaNumber: String)                                           returns String;
    function excel(NfaNumber: String)                                           returns String;
    Action actioncallforbpa(NfaNumber: String)   returns String;
    function validateBeforeSendForApproval(NfaNumber: String)     returns String;
    function sendForApproval(NfaNumber: String)     returns String;
     function ApproversAction(NfaNumber: String, Action: String)                       returns String;
    function getVendorData(ProposedVendorCode: String, NfaNumber: String, round: String) returns String;
}

service NfaApproval {
    entity NfaDetails                        as projection on db.NfaDetails
                                                where
                                                    Status = 'Pending For Approval'
                                                    and exists(
                                                        select from db.NfaWorkflowHistory
                                                        where
                                                                NfaWorkflowHistory.NfaNumber  = NfaDetails.NfaNumber
                                                            and NfaWorkflowHistory.Status     = 'Pending'
                                                            and NfaWorkflowHistory.EmployeeID = 'prem.k@peolsolutions.com'

                                                    );

    entity NfaEventHistory                   as projection on db.NfaEventHistory;
    entity NfaVendorData                     as projection on db.NfaVendorData;
    entity NfaVendorDueDeligenceDetails      as projection on db.NfaVendorDueDeligenceDetails;
    entity NfaVendorDueDeligenceDetailsGrade as projection on db.NfaVendorDueDeligenceDetailsGrade;
    entity NfaVendorItemsDetails             as projection on db.NfaVendorItemsDetails;
    entity NfaAttachments                    as projection on db.NfaAttachments;
    entity NfaCommentsHistory                as projection on db.NfaCommentsHistory;
    entity NfaWorkflowHistory                as projection on db.NfaWorkflowHistory;
    function ApproversAction(NfaNumber: String, Action: String)    returns String;

}
