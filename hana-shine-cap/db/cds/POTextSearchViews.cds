@cds.persistence.exists
@cds.persistence.udf
entity POTextSearch(TERMS : String(40), ATTRIBUTE : String(20)) {
    TERM      : String(40);
    ATTRIBUTE : String(20);
    RESULTS   : String;
}