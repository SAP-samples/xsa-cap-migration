sap.ui.controller("shine.democontent.epm.spatial.view.main", {

	// instantiated view will be added to the oViewCache object and retrieved from there
	oViewCache: {},

	onInit: function() {
		sap.app.mainController = this;
	},

	/**
	 * getCachedView checks if view already exists in oViewCache object, will create it if not, and return the view
	 */
	getCachedView: function(viewName) {
		if (!this.oViewCache[viewName]) {
			var fullViewName = "shine.democontent.epm.spatial.view" + "." + viewName;
			this.oViewCache[viewName] = sap.ui.view({
				id: viewName,
				viewName: fullViewName,
				type: sap.ui.core.mvc.ViewType.XML
			});
		}
		return this.oViewCache[viewName];
	},

	/**
	 * Similar to onAfterRendering, but this hook is invoked before the controller's View is re-rendered
	 * (NOT before the first rendering! onInit() is used for that one!).
	 * @memberOf shine_so.main
	 */
	onBeforeRendering: function() {

	},

	/**
	 * Called when the View has been rendered (so its HTML is part of the document). Post-rendering manipulations of the HTML could be done here.
	 * This hook is the same one that SAPUI5 controls get after being rendered.
	 * @memberOf shine_so.main
	 */
	onAfterRendering: function() {
		var oController = this;
		var view = this.getView();
		var oShell = view.byId("main");

		oShell.addWorksetItem(new sap.ui.ux3.NavigationItem({
			id: "nav-bpDetails",
			text: sap.app.i18n.getText("BP_DETAILS_TITLE")
		}));
		oShell.addWorksetItem(new sap.ui.ux3.NavigationItem({
			id: "nav-sales-analysis",
			text: sap.app.i18n.getText("SALES_ANALYSIS")
		}));
		oShell.addWorksetItem(new sap.ui.ux3.NavigationItem({
			id: "nav-productsHeatMap",
			text: sap.app.i18n.getText("PRODUCT_SALES")
		}));

		oShell.addStyleClass('sapDkShell');

		// action when shell workset item are clicked
		oShell.attachWorksetItemSelected(function(oEvent) {
			var sViewName = oEvent.getParameter("id").replace("nav-", "");
			sViewName = sViewName.replace("main--", "");
			oShell.setContent(sap.app.mainController.getCachedView(sViewName));
		});
		
		var aUrl = "/v2/shine/getKeys";
		jQuery.ajax({
			url: aUrl,
			method: 'GET',
			success: function(arg1) {
				if (arg1.d.getKeys.entry.API_KEY) {
					try{
						sap.app.platform = new H.service.Platform({
							'apikey': arg1.d.getKeys.entry.API_KEY
						});
						oShell.setContent(sap.app.mainController.getCachedView("bpDetails"));
					}catch(e){
						jQuery.sap.require("sap.ui.commons.MessageBox");
						sap.ui.commons.MessageBox.show("Please enter a valid API Key. Please click YES inorder to update",sap.ui.commons.MessageBox.Icon.ERROR,"Invalid Evaluation Credentials",
								[sap.ui.commons.MessageBox.Action.YES, sap.ui.commons.MessageBox.Action.NO],
									 function callback(sResult){
									 	if(sResult === "YES"){
											sap.app.mainController.openWelcomeDialog(true);
									 	}
									},
									sap.ui.commons.MessageBox.Action.YES);
					}
				} else {
					oController.openWelcomeDialog(true);
				}
			},
			error: function(err) {
				sap.ui.commons.MessageBox.alert("Unexpected Error" + err + "Please check the application logs for more details");  
			}
		});
	},
	openHelpWindow: function(){
		var oController = this; 
		oController.openWelcomeDialog(false);
	},
	
	openSettings: function(oEvent){
		var oController = this; 
		oController.openWelcomeDialog(true);
	},
	
	openWelcomeDialog: function(isSettings){
		var oController = this; 
		var welcomeDialog = new sap.account.WelcomeDialog(oController, isSettings);
		welcomeDialog.open();
	},

	/**
	 * Called when the Controller is destroyed. Use this one to free resources and finalize activities.
	 * @memberOf shine_so.main
	 */
	onExit: function() {

	}
});
