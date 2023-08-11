using {SAP_HANA_DEMOCONTENT_EPM_MODELS_CUSTOMER_DISCOUNT_BY_RANKING_AND_REGION as RANKCV} from '../db/cds/datamodel';
using {SAP_HANA_DEMOCONTENT_EPM_MODELS_SALESORDER_DYNAMIC_JOIN as DJCV} from '../db/cds/datamodel';
using {SAP_HANA_DEMOCONTENT_EPM_MODELS_SALESORDER_RANKING as SALESORDER_RANKING_CV} from '../db/cds/datamodel';
using {SAP_HANA_DEMOCONTENT_EPM_MODELS_SALES_YEAR_COMPARISON as SALES_YEAR_COMPARISON_CV} from '../db/cds/datamodel';
using {SAP_HANA_DEMOCONTENT_EPM_MODELS_BUYER as BUYER_CV} from '../db/cds/datamodel';
using {SAP_HANA_DEMOCONTENT_EPM_MODELS_SALES_OVERVIEW_WO_CURR_CONV_OPT_WRAPPER as CURR_CONV_CV} from '../db/cds/datamodel';
using {SAP_HANA_DEMOCONTENT_EPM_MODELS_SALES_ORDER_HEADER_W_BUYER as SALES_ORDER_HEADER_CV} from '../db/cds/datamodel';
using {SAP_HANA_DEMOCONTENT_EPM_SPATIAL_MODELS_REGION_PRODUCT as PRODUCT_CV} from '../db/cds/datamodel';
using {SAP_HANA_DEMOCONTENT_EPM_SPATIAL_MODELS_PRODUCT_SALES as SALES_CV} from '../db/cds/datamodel';
using from './service';

extend service ShineService {
    entity sales                                                   as projection on RANKCV;
    entity SalesChartData                                          as projection on DJCV;
    entity SalesByRegion                                           as
        select from SalesChartData as reg {
            key reg.REGION as REGION      : String(4),
                sum(
                    distinct reg.TOTAL_SALES
                )          as TOTAL_SALES : String(15),
                sum(
                    reg.SALES
                )          as SALES       : String(15),
                sum(
                    distinct reg.SHARE_SALES
                )          as SHARE_SALES : String(15)
        }
        group by
            REGION;
    entity SalesByCountry                                          as
        select from SalesChartData as reg {
            key reg.COUNTRY as COUNTRY     : String(2),
                sum(
                    distinct reg.TOTAL_SALES
                )           as TOTAL_SALES : String(15),
                sum(
                    reg.SALES
                )           as SALES       : String(15),
                sum(
                    distinct reg.SHARE_SALES
                )           as SHARE_SALES : String(15)
        }
        group by
            COUNTRY;
    entity SalesByProduct                                          as
        select from SalesChartData as reg {
            key reg.PRODUCTID    as PRODUCTID    : String(10),
            key reg.COUNTRY      as COUNTRY      : String(2),
                reg.PRODUCT_NAME as PRODUCT_NAME : String(1024),
                reg.REGION       as REGION       : String(4),
                reg.TOTAL_SALES  as TOTAL_SALES  : String(15),
                reg.SALES        as SALES        : String(15),
                reg.SHARE_SALES  as SHARE_SALES  : String(15)
        };

    entity salesRank                                               as projection on SALESORDER_RANKING_CV;
    entity salesYear(IP_YEAR_1 : String(4), IP_YEAR_2 : String(4)) as
        select from SALES_YEAR_COMPARISON_CV (
            IP_YEAR_1::IP_YEAR_1,IP_YEAR_2::IP_YEAR_2
        ) {
            *
        };
    entity Buyer                                                   as projection on BUYER_CV;
    entity SalesOrderItem                                          as projection on CURR_CONV_CV;
    entity SalesOrderHeader                                        as projection on SALES_ORDER_HEADER_CV;
    entity ProductRegionQuantity                                   as projection on PRODUCT_CV;
    entity ProductSales                                            as projection on SALES_CV;

}
