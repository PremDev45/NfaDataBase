using db from '../db/schema';

service NfaForm {
    @odata.draft.enabled
    entity NfaDetails            as projection on db.NfaDetails where CreatedBy = 'prem.k@peolsolutions.com';
    entity NfaEventHistory       as projection on db.NfaEventHistory;
    entity NfaVendorData         as projection on db.NfaVendorData;
    entity NfaVendorItemsDetails as projection on db.NfaVendorItemsDetails;
    entity NfaAttachments        as projection on db.NfaAttachments;
    entity NfaCommentsHistory    as projection on db.NfaCommentsHistory;
    entity NfaWorkflowHistory    as projection on db.NfaWorkflowHistory;
    entity Rules as projection on db.Rules;
    function getDataForUserAndProject(user:String,project:String) returns String;
}
service NfaApproval {
    entity NfaDetails            as projection on db.NfaDetails where Status = 'Pending For Approval' and exists (
      select from db.NfaWorkflowHistory
        where NfaWorkflowHistory.PanNumber = NfaDetails.PanNumber
        and NfaWorkflowHistory.Status = 'Pending'
        and NfaWorkflowHistory.EmployeeID = 'prem.k@peolsolutions.com'

    );
    entity NfaEventHistory       as projection on db.NfaEventHistory;
    entity NfaVendorData         as projection on db.NfaVendorData;
    entity NfaVendorItemsDetails as projection on db.NfaVendorItemsDetails;
    entity NfaAttachments        as projection on db.NfaAttachments;
    entity NfaCommentsHistory    as projection on db.NfaCommentsHistory;
    entity NfaWorkflowHistory    as projection on db.NfaWorkflowHistory;

}
