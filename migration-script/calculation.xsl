<?xml version="1.0" encoding="UTF-8"?>
<xsl:stylesheet version="2.0" xmlns:xsl="http://www.w3.org/1999/XSL/Transform" xmlns:xs="http://www.w3.org/2001/XMLSchema" xmlns:Calculation="http://www.sap.com/ndb/BiModelCalculation.ecore">
    <xsl:output method="xml" encoding="UTF-8" omit-xml-declaration="no"/>

    <xsl:template match="@*|node()">
        <xsl:copy>
            <xsl:apply-templates select="@*|node()"/>
        </xsl:copy>
    </xsl:template>

    <!-- to uppercase and dot to underscore -->
    <xsl:variable name="from" select="'abcdefghijklmnopqrstuvwxyz.'" />
    <xsl:variable name="to" select="'ABCDEFGHIJKLMNOPQRSTUVWXYZ_'" />

    <xsl:template match="Calculation:scenario/@id">
        <xsl:attribute name="id">
            <xsl:call-template name="process">
                <xsl:with-param name="text" select="."/>
            </xsl:call-template>
         </xsl:attribute>
    </xsl:template>

    <xsl:template match="viewAttribute/@id">
        <xsl:attribute name="id">
            <xsl:call-template name="process">
                <xsl:with-param name="text" select="."/>
            </xsl:call-template>
         </xsl:attribute>
    </xsl:template>

    <!-- <xsl:template match="DataSource/@id">
        <xsl:attribute name="id">
            <xsl:call-template name="process">
                <xsl:with-param name="text" select="."/>
            </xsl:call-template>
         </xsl:attribute>
    </xsl:template> -->

    <xsl:template match="DataSource/@id">
    <xsl:attribute name="id">
        <xsl:choose>
            <!-- If id contains 'Aggregation', keep it and call the process with string after 'Aggregation' -->
            <xsl:when test="starts-with(., 'Aggregation')">
                <xsl:value-of select="'Aggregation'"/>
                <xsl:call-template name="process">
                    <xsl:with-param name="text" select="substring-after(., 'Aggregation')"/>
                </xsl:call-template>
            </xsl:when>
            <!-- If id does not contain 'Aggregation', just pass id as is -->
            <xsl:otherwise>
                <xsl:call-template name="process">
                    <xsl:with-param name="text" select="."/>
                </xsl:call-template>
            </xsl:otherwise>
        </xsl:choose>
    </xsl:attribute>
</xsl:template>

    <xsl:template match="variable/@id">
        <xsl:attribute name="id">
            <xsl:call-template name="process">
                <xsl:with-param name="text" select="."/>
            </xsl:call-template>
         </xsl:attribute>
    </xsl:template>

    <xsl:template match="measure/@id[not(contains(., 'ConvGrossAmount'))]">
        <xsl:attribute name="id">
            <xsl:call-template name="process">
                <xsl:with-param name="text" select="."/>
            </xsl:call-template>
         </xsl:attribute>
    </xsl:template>

    <!-- <xsl:template match="attribute/@id">
        <xsl:attribute name="id">
            <xsl:call-template name="process">
                <xsl:with-param name="text" select="."/>
            </xsl:call-template>
         </xsl:attribute>
    </xsl:template> -->

    <xsl:template match="logicalModel/@id[not(contains(., 'Join') or contains(., 'Union') or contains(., 'Output') or contains(., 'Projection'))]">
        <xsl:attribute name="id">
            <xsl:call-template name="process">
                <xsl:with-param name="text" select="."/>
            </xsl:call-template>
         </xsl:attribute>
    </xsl:template>

<xsl:template match="attribute/@id">
   <xsl:attribute name="id">
      <xsl:choose>
         <xsl:when test="contains(., '$')">
            <xsl:call-template name="process">
               <xsl:with-param name="text" select="substring-before(., '$')"/>
            </xsl:call-template>
            <xsl:text>$</xsl:text>
            <xsl:value-of select="substring-after(., '$')"/>
         </xsl:when>
         <xsl:otherwise>
            <xsl:call-template name="process">
               <xsl:with-param name="text" select="."/>
            </xsl:call-template>
         </xsl:otherwise>
      </xsl:choose>
   </xsl:attribute>
</xsl:template>

    <!-- <xsl:template match="input/@node">
        <xsl:attribute name="node">
            <xsl:call-template name="process">
                <xsl:with-param name="text" select="."/>
            </xsl:call-template>
         </xsl:attribute>
    </xsl:template> -->

    <!-- <xsl:template match="input/@node[contains(., '#') or not(contains(., 'Join') or contains(., 'Union') or contains(., 'Output') or contains(., 'Projection'))]">
        <xsl:attribute name="node">
            <xsl:call-template name="process">
                <xsl:with-param name="text" select="translate(., '#', '')"/>
            </xsl:call-template>
        </xsl:attribute>
    </xsl:template> -->

    <xsl:template match="input/@node[contains(., '#') or not(contains(., 'Join') or contains(., 'Union') or contains(., 'Output') or contains(., 'Projection'))]">
    <xsl:attribute name="node">
        <xsl:choose>
            <!-- If id contains 'Aggregation', keep it and call the process with string after 'Aggregation' -->
            <xsl:when test="starts-with(., 'Aggregation')">
                <xsl:value-of select="'Aggregation'"/>
                <xsl:call-template name="process">
                    <xsl:with-param name="text" select="substring-after(., 'Aggregation')"/>
                </xsl:call-template>
            </xsl:when>
            <!-- If node does not contain 'Aggregation', just pass node as is -->
            <xsl:otherwise>
                <xsl:call-template name="process">
                    <xsl:with-param name="text" select="translate(., '#', '')"/>
                </xsl:call-template>
            </xsl:otherwise>
        </xsl:choose>
    </xsl:attribute>
</xsl:template>

    <xsl:template match="resourceUri">
        <xsl:copy>
            <xsl:call-template name="process">
                <xsl:with-param name="text" select="."/>
            </xsl:call-template>
         </xsl:copy>
    </xsl:template>

    <!-- <xsl:template match="keyMapping/@columnObjectName">
        <xsl:attribute name="columnObjectName">
            <xsl:call-template name="process">
                <xsl:with-param name="text" select="."/>
            </xsl:call-template>
         </xsl:attribute>
    </xsl:template> -->
    <xsl:template match="keyMapping/@columnObjectName[not(contains(., 'Join') or contains(., 'Union') or contains(., 'Output') or contains(., 'Projection'))]">
        <xsl:attribute name="columnObjectName">
            <xsl:call-template name="process">
                <xsl:with-param name="text" select="."/>
            </xsl:call-template>
        </xsl:attribute>
    </xsl:template>

    <xsl:template match="calculationView/@id[not(contains(., 'Join') or contains(., 'Union') or contains(., 'Output') or contains(., 'Projection'))]">
        <xsl:attribute name="id">
            <xsl:call-template name="process">
                <xsl:with-param name="text" select="."/>
            </xsl:call-template>
        </xsl:attribute>
    </xsl:template>

    <!-- <xsl:template match="measureMapping/@columnObjectName">
        <xsl:attribute name="columnObjectName">
            <xsl:call-template name="process">
                <xsl:with-param name="text" select="."/>
            </xsl:call-template>
         </xsl:attribute>
    </xsl:template> -->

    <xsl:template match="measureMapping/@columnObjectName[not(contains(., 'Join') or contains(., 'Union') or contains(., 'Output') or contains(., 'Projection'))]">
        <xsl:attribute name="columnObjectName">
            <xsl:call-template name="process">
                <xsl:with-param name="text" select="."/>
            </xsl:call-template>
        </xsl:attribute>
    </xsl:template>

    <xsl:template match="measureMapping/@columnName[not(contains(., 'ConvGrossAmount'))]">
        <xsl:attribute name="columnName">
            <xsl:call-template name="process">
                <xsl:with-param name="text" select="."/>
            </xsl:call-template>
         </xsl:attribute>
    </xsl:template>

    <xsl:template match="mapping/@target">
        <xsl:attribute name="target">
            <xsl:call-template name="process">
                <xsl:with-param name="text" select="."/>
            </xsl:call-template>
         </xsl:attribute>
    </xsl:template>

    <xsl:template match="mapping/@source">
        <xsl:attribute name="source">
            <xsl:call-template name="process">
                <xsl:with-param name="text" select="."/>
            </xsl:call-template>
         </xsl:attribute>
    </xsl:template>

    <xsl:template match="mapping/@dataSource">
        <xsl:attribute name="dataSource">
            <xsl:call-template name="process">
                <xsl:with-param name="text" select="."/>
            </xsl:call-template>
         </xsl:attribute>
    </xsl:template>

    <!-- <xsl:template match="targetVariable/@resourceUri">
        <xsl:attribute name="resourceUri">
            <xsl:call-template name="process">
                <xsl:with-param name="text" select="."/>
            </xsl:call-template>
         </xsl:attribute>
    </xsl:template> -->

    <xsl:template name="prefixAndTransform">
        <xsl:param name="prefix"/>
        <xsl:param name="text"/>
        <!-- Call the 'process' template to transform the 'text' parameter -->
        <xsl:variable name="transformed_text">
            <xsl:call-template name="process">
                <xsl:with-param name="text" select="$text"/>
            </xsl:call-template>
        </xsl:variable>
        <!-- Return the prefix and the transformed text -->
        <xsl:value-of select="concat($prefix, $transformed_text)"/>
    </xsl:template>

  <xsl:template match="targetVariable/@resourceUri">
    <xsl:attribute name="resourceUri">
        <xsl:choose>
            <xsl:when test="contains(., 'undefined::')">
                <xsl:call-template name="prefixAndTransform">
                    <xsl:with-param name="prefix" select="'undefined::'"/>
                    <xsl:with-param name="text" select="substring-after(., 'undefined::')"/>
                </xsl:call-template>
            </xsl:when>
            <xsl:when test="contains(., '/undefined/calculationviews/')">
                <xsl:call-template name="prefixAndTransform">
                    <xsl:with-param name="prefix" select="'/undefined/calculationviews/'"/>
                    <xsl:with-param name="text" select="substring-after(., '/undefined/calculationviews/')"/>
                </xsl:call-template>
            </xsl:when>
            <xsl:otherwise>
                <xsl:value-of select="."/>
            </xsl:otherwise>
        </xsl:choose>
    </xsl:attribute>
</xsl:template>

    <xsl:template match="keyMapping/@columnName">
        <xsl:attribute name="columnName">
            <xsl:call-template name="process">
                <xsl:with-param name="text" select="."/>
            </xsl:call-template>
         </xsl:attribute>
    </xsl:template>

    <xsl:template match="shape/@modelObjectNameSpace[not(contains(., 'Join') or contains(., 'Union') or contains(., 'Output') or contains(., 'Projection') or contains(., 'MeasureGroup') or contains(., 'CalculationView'))]">
        <xsl:attribute name="modelObjectName">
            <xsl:call-template name="process">
                <xsl:with-param name="text" select="."/>
            </xsl:call-template>
        </xsl:attribute>
    </xsl:template>

    <xsl:template match="shape/@modelObjectName[not(contains(., 'Join') or contains(., 'Union') or contains(., 'Output') or contains(., 'Projection') or contains(., 'Aggregation'))]">
        <xsl:attribute name="modelObjectName">
            <xsl:call-template name="process">
                <xsl:with-param name="text" select="."/>
            </xsl:call-template>
        </xsl:attribute>
    </xsl:template>

    <!-- <xsl:template match="shape/@modelObjectName">
        <xsl:attribute name="modelObjectName">
            <xsl:call-template name="process">
                <xsl:with-param name="text" select="."/>
            </xsl:call-template>
         </xsl:attribute>
    </xsl:template> -->

    <xsl:template match="joinAttribute/@name">
        <xsl:attribute name="name">
            <xsl:call-template name="process">
                <xsl:with-param name="text" select="."/>
            </xsl:call-template>
         </xsl:attribute>
    </xsl:template>

    <xsl:template match="descriptions/@defaultDescription">
        <xsl:attribute name="defaultDescription">
            <xsl:call-template name="process">
                <xsl:with-param name="text" select="."/>
            </xsl:call-template>
         </xsl:attribute>
    </xsl:template>

    <xsl:template match="logicalJoin/@associatedObjectUri">
        <xsl:attribute name="associatedObjectUri">
            <xsl:call-template name="process">
                <xsl:with-param name="text" select="."/>
            </xsl:call-template>
         </xsl:attribute>
    </xsl:template>

    <xsl:template match="currencyConversionTables/@rates">
        <xsl:attribute name="rates">
            <xsl:call-template name="process">
                <xsl:with-param name="text" select="."/>
            </xsl:call-template>
         </xsl:attribute>
    </xsl:template>
    <xsl:template match="currencyConversionTables/@configuration">
        <xsl:attribute name="configuration">
            <xsl:call-template name="process">
                <xsl:with-param name="text" select="."/>
            </xsl:call-template>
         </xsl:attribute>
    </xsl:template>
    <xsl:template match="currencyConversionTables/@prefactors">
        <xsl:attribute name="prefactors">
            <xsl:call-template name="process">
                <xsl:with-param name="text" select="."/>
            </xsl:call-template>
         </xsl:attribute>
    </xsl:template>
    <xsl:template match="currencyConversionTables/@notations">
        <xsl:attribute name="notations">
            <xsl:call-template name="process">
                <xsl:with-param name="text" select="."/>
            </xsl:call-template>
         </xsl:attribute>
    </xsl:template>
    <xsl:template match="currencyConversionTables/@precisions">
        <xsl:attribute name="precisions">
            <xsl:call-template name="process">
                <xsl:with-param name="text" select="."/>
            </xsl:call-template>
         </xsl:attribute>
    </xsl:template>

    <xsl:template match="filter">
        <xsl:copy>
            <xsl:call-template name="process">
                <xsl:with-param name="text" select="."/>
            </xsl:call-template>
         </xsl:copy>
    </xsl:template>

    <xsl:template name="process">
        <xsl:param name="text"/>
        <xsl:choose>
            <xsl:when test="contains($text, '::')">
                <xsl:value-of select="translate(concat(substring-before($text, '::'), '_', substring-after($text, '::')), $from, $to)"/>
            </xsl:when>
            <xsl:otherwise>
                <xsl:value-of select="translate($text, $from, $to)"/>
            </xsl:otherwise>
        </xsl:choose>
    </xsl:template>

    <!-- <xsl:template name="quotedToUppercase">
        <xsl:param name="text"/>
            <xsl:analyze-string select="$text" regex='&quot;\w+&quot;'>
                <xsl:matching-substring>
                    <xsl:value-of select='upper-case(.)'/>
                </xsl:matching-substring>
                <xsl:non-matching-substring>
                    <xsl:value-of select="."/>
                </xsl:non-matching-substring>
            </xsl:analyze-string>
    </xsl:template> -->
    <!-- <xsl:variable name="quote" select='"&quot;"'/>

   <xsl:template match="filter|formula">
        <xsl:copy>
            <xsl:choose>
                <xsl:when test="contains(., '&quot;')">
                    <xsl:call-template name="process">
                        <xsl:with-param name="text" select="substring-before(., '&quot;')"/>
                    </xsl:call-template>
                    <xsl:value-of select="$quote"/>
                    <xsl:call-template name="process">
                        <xsl:with-param name="text" select="substring-after(., '&quot;')"/>
                    </xsl:call-template>
                </xsl:when>
                <xsl:otherwise>
                    <xsl:call-template name="process">
                        <xsl:with-param name="text" select="."/>
                    </xsl:call-template>
                </xsl:otherwise>
            </xsl:choose>
        </xsl:copy>
    </xsl:template> -->
</xsl:stylesheet>