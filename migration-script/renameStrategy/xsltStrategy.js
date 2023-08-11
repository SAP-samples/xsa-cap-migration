const SaxonJS = require('saxon-js');
class XSLT {
    configure(config){
        this.stylesheetFileName = config.stylesheetFileName;
    }
    process(fileContent){
        return SaxonJS.transform({
            stylesheetFileName: this.stylesheetFileName,
            sourceText: fileContent,
            destination: "serialized"
        }).principalResult;
    }
}
module.exports = XSLT;