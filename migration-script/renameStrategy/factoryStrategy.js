const CDS = require('./cdsStrategy');
const CharReplacementUppercase = require('./charReplacementStrategy');
const CharReplacementUppercaseSingleQuote = require('./charReplacementSingleQuoteStrategy');
const XSLT = require('./xsltStrategy');

class StrategyFactory {
    static strategies = {};
    static register(name, strategy) {
        this.strategies[name] = strategy;
    }
    static get(name) {
        return this.strategies[name];
    }
}
const register = () => {
    StrategyFactory.register("CharReplacementUppercase", new CharReplacementUppercase());
    StrategyFactory.register("CharReplacementUppercaseSingleQuote", new CharReplacementUppercaseSingleQuote());
    StrategyFactory.register("XSLT", new XSLT());
    //StrategyFactory.register("CDS", new CDS());
};
register();
module.exports = StrategyFactory;