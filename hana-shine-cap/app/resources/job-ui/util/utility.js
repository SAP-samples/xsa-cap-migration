jQuery.sap.declare("sap.hana.democontent.epm.job.util.utility");

function UTIL() {

}

UTIL.formatUTCDateTime = function(dateTime) {
	
	if (!dateTime) return "";

    var year = dateTime.getUTCFullYear();
    var month = ('0' + (dateTime.getUTCMonth() + 1)).slice(-2);
    var date = ('0' + dateTime.getUTCDate()).slice(-2);
    var hours = ('0' + dateTime.getUTCHours()).slice(-2);
    var minutes = ('0' + dateTime.getUTCMinutes()).slice(-2);
    var seconds = ('0' + dateTime.getUTCSeconds()).slice(-2);

    var dateTimeStr = year + "-" + month + "-" + date + " " + hours + ":" + minutes + ":" + seconds;

    return dateTimeStr;
	
	
};

UTIL.formatTimeStamp = function(value) {
	var sTimestamp = value;
    if (sTimestamp) {
        var matches = sTimestamp.match(/\/Date\((\d+)([+-]\d+)\)\//);
        var iTimestamp = parseInt(matches[1]);
        var oDate = new Date(iTimestamp);
        var oDateFormat = sap.ui.core.format.DateFormat.getDateTimeInstance({pattern: "dd/MM/yyyy HH:mm:ss"});
        var sDateFormatted = oDateFormat.format(oDate);
        return sDateFormatted;
    } else {
        return ''; 
    }
};