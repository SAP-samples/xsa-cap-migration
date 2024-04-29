class CharReplacementCS {
    configure(config){
        this.regex = new RegExp(config.regex, 'g');
    }
    process(fileContent){
        return fileContent.replace(this.regex, '');
    }
}
module.exports = CharReplacementCS;