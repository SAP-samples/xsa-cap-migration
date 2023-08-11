class CharReplacementUppercase{   
    configure(config){
        this.regex = new RegExp(config.regex, 'g');
        this.replacements = config.replacements;
    }
    process(fileContent){
        let that = this;
        return fileContent.replaceAll(this.regex, function(a){
            for(let replacement of that.replacements){
                a = a.replaceAll(replacement[0], replacement[1]);
            }
            return a.toUpperCase();
        });
    }
}
module.exports = CharReplacementUppercase;