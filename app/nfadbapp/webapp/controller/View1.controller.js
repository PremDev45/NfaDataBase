sap.ui.define([
    "sap/ui/core/mvc/Controller"
], (Controller) => {
    "use strict";

    return Controller.extend("nfadbapp.controller.View1", {
        onInit() {
            debugger

            var oRouter = this.getOwnerComponent().getRouter();
            oRouter.getRoute("RouteView1").attachMatched(this._onRouteMatched, this);
        },
        _onRouteMatched: async function (oEvent) {
            debugger

            var projectId = oEvent.getParameter("arguments").DocId;
            let user, userEmail;
            try {
                user = sap.ushell.Container.getUser().getFullName();
                userEmail = sap.ushell.Container.getUser().getEmail();
            } catch (error) {
                user = 'Tesst User';
                userEmail = 'premaa@peolsolutions.com'
            }
            var jsonoModel = new sap.ui.model.json.JSONModel({ projectId: projectId, userName: user });
            this.getView().setModel(jsonoModel, "DocId");
            let oModel = this.getView().getModel();
            let sFunctionName = 'getDataForUserAndProject';
            let oFunction = oModel.bindContext(`/${sFunctionName}(...)`);
            oFunction.setParameter('project', projectId);
            oFunction.setParameter('user', userEmail);
            await oFunction.execute();
            var oContext = oFunction.getBoundContext().getValue();
            function loadErrPage(that) {
                debugger
                that.getView().getContent()[0].mAggregations.content[0].setIllustrationType('sapIllus-ErrorScreen');
                that.getView().getContent()[0].mAggregations.content[0].setTitle('Oops! Something went wrong');
                that.getView().getContent()[0].mAggregations.content[0].setDescription(oContext.value);
            }
            if (oContext.value.substring(0, 3) == 'Doc') {
                try {
                    var href_For_Product_display = (sap.ushell && sap.ushell.Container && await sap.ushell.Container.getServiceAsync("Navigation")) || "";
                    if (href_For_Product_display != "") {
                        await href_For_Product_display.navigate({
                            target: {
                                semanticObject: "nfaformsem",
                                action: "display"
                            },
                            params: {
                                "NfaNumber": oContext.value,
                                "IsActiveEntity": true
                            }
                        })
                    } else {
                        loadErrPage(this);
                    }
                } catch (error) {
                    debugger
                    loadErrPage(this);
                }
            } else {
                loadErrPage(this);
            }
            debugger
        },
        deletedb() {
            debugger

            let oFunction = this.getView().getModel().bindContext("/discardNfaData(...)");

            const url = window.location.href;
            const hashId = url.split("#")[1] ?? "";

            // Assign to NfaNumber safely
            const NfaNumber = hashId;

            oFunction.setParameter("NfaNumber", NfaNumber);
            oFunction.execute();
        }
    });
});