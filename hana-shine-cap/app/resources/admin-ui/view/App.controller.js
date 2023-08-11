//To use a javascript controller its name must end with .controller.js
sap.ui.controller("sap.hana.democontent.epm.admin.view.App", {
     onInit:function() {
          this.getView().addStyleClass("sapUiSizeCompact"); 
     },
     logout: function() {
         window.location.replace('/logout');
    },
    handlePressHome: function(oEvent) {
     sap.m.URLHelper.redirect("../launchpad/index.html", false);
     }

});