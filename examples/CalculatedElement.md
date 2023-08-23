Calculated Elements
====================

## Rename Procedure:
CAP Supports two types of calculated elements - [Calculated Elements On-Read](https://cap.cloud.sap/docs/releases/march23#calculated-elements-beta) and [Calculated Elements On-Write](https://cap.cloud.sap/docs/releases/jun23#calculated-elements-on-write).

In the sample below, I have two calculated elements, `FULLNAMEONREAD` and `FULLNAMEONWRITE`, both referencing the fields `NAME.FIRST` and `NAME.LAST`. Renaming these fields can be tricky, as the calculated elements reference them. Normally, we would rename these fields during our rename process, but this won't work in this case. We therefore need to manually adapt the generated rename-procedure. For calc-on-write, we have to replace the calculated field with a normal field, while preserving the data. For calc-on-read, we can simply drop the field as it will not result in a field on the database.

     Entity Employees { 
        key  ID: Integer;
        NAME {
            FIRST: String(10);
            LAST: String(10);
        };
        FULLNAMEONREAD: String(100) = (NAME.FIRST || ' ' || NAME.LAST);
        FULLNAMEONWRITE: String(100) generated always as  (NAME.FIRST || ' ' || NAME.LAST);
     };

We are starting from the following `.hdbprocedure`:

     PROCEDURE RENAME_HDBCDS_TO_PLAIN LANGUAGE SQLSCRIPT AS BEGIN --
     -- Employees
        EXEC 'RENAME TABLE "Employees" TO Employees';
     
        EXEC 'RENAME COLUMN Employees."NAME.FIRST" TO NAME_FIRST';
     
        EXEC 'RENAME COLUMN Employees."NAME.LAST" TO NAME_LAST';
     
     END;
    
As a first step, we drop the field `FULLNAMEONREAD`. calc-on-read approach in CAP ensures that calculations are performed on the fly when data is accessed, and as a result, these particular fields won't need to be permanently stored in the database.

     EXEC 'ALTER TABLE Employees DROP (FULLNAMEONREAD)';

For calc-on-write, we rename the field `FULLNAMEONWRITE` to `__FULLNAMEONWRITE`, the chosen name needs to be one where there are no name collisions!
    
     EXEC 'RENAME COLUMN Employees."FULLNAMEONWRITE" TO __FULLNAMEONWRITE';
  
As a second step, we add a new field `FULLNAMEONWRITE`, which has the same data type as `__FULLNAMEONWRITE`.

     EXEC 'ALTER TABLE Employees ADD (FULLNAMEONWRITE NVARCHAR(100))';
    
Finally, we copy the data from `__FULLNAMEONWRITE` to `FULLNAMEONWRITE` and drop the field afterwards.

     EXEC 'UPDATE Employees SET FULLNAMEONWRITE = __FULLNAMEONWRITE';

     EXEC 'ALTER TABLE Employees DROP (__FULLNAMEONWRITE)';
    
Afterwards, we can execute the renames as usual. So our final `.hdbprocedure` will look like this:

    PROCEDURE RENAME_HDBCDS_TO_PLAIN LANGUAGE SQLSCRIPT AS BEGIN

        -- Rename the Employees Table

        EXEC 'RENAME TABLE "Employees" TO Employees';

        -- Calc on Read

        EXEC 'ALTER TABLE Employees DROP (FULLNAMEONREAD)';

        -- Calc on Write

        EXEC 'RENAME COLUMN Employees."FULLNAMEONWRITE" TO __FULLNAMEONWRITE';

        EXEC 'ALTER TABLE Employees ADD (FULLNAMEONWRITE NVARCHAR(100))';

        EXEC 'UPDATE Employees SET FULLNAMEONWRITE = __FULLNAMEONWRITE';

        EXEC 'ALTER TABLE Employees DROP (__FULLNAMEONWRITE)';

        -- Rename the columns

        EXEC 'RENAME COLUMN Employees."NAME.FIRST" TO NAME_FIRST';

        EXEC 'RENAME COLUMN Employees."NAME.LAST" TO NAME_LAST';

    END;
    
## Deployment:
During the hdbcds and hdbtable deployments, Calculated elements on-read and Calculated elements on-write strategies can be implemented in different ways, it's important to choose the best strategy based on your particular use case and performance expectations. 
### Calculated elements on-write:
Calculated elements on-write are not supported for HDBCDS. Therefore, during hdbcds type deployment, the calculation must be included in a `@sql.append` annotation placed above the column, as shown below.

    Entity Employees {
        key  ID: Integer;
        NAME {
            FIRST: String(10);
            LAST: String(10);
        };
        @sql.append: `generated always as NAME_FIRST || ' ' || NAME_LAST`
        FULLNAMEONWRITE: String(100);
    };
    
Upon building, an **hdbcds** file as shown below will be generated. This file can then be deployed to the HDI Container.
    
    entity EMPLOYEES {
        key ID : Integer;
        NAME_FIRST : String(10);
        NAME_LAST : String(10);
        FULLNAMEONWRITE : String(100) generated always as NAME_FIRST || ' ' || NAME_LAST;
    };

**Note:** Once the hdbcds deployment is complete, refrain from adding any additional data to the table.

For the hdbtable deployment, we can implement the Calc-on-write feature as follows:
    
    Entity Employees {
        key  ID: Integer;
        NAME {
            FIRST: String(10);
            LAST: String(10);
        };
        FULLNAMEONWRITE: String(100) = NAME.FIRST || ' ' || NAME.LAST stored;
    };
    
Upon building, an **hdbtable** file as shown below will be generated. This file can then be deployed to the HDI Container.

    COLUMN TABLE Employees (
        ID INTEGER NOT NULL,
        NAME_FIRST NVARCHAR(10),
        NAME_LAST NVARCHAR(10),
        FULLNAMEONWRITE NVARCHAR(100) GENERATED ALWAYS AS (NAME_FIRST || ' ' || NAME_LAST),
        PRIMARY KEY(ID)
    )

### Calculated elements on-read:
Calculated elements on-read are supported for both hdbcds and hdbtable. They serve as a "predefined" calculation expressions that can be used in views or projections on top of the entity. 

In our example, the Calc-on-read feature can be implemented as follows:

db/Employees.cds:
 
    Entity Employees {
        key  ID: Integer;
        NAME {
            FIRST: String(10);
            LAST: String(10);
        };
        FULLNAMEONREAD: String(100) = NAME.FIRST || ' ' || NAME.LAST;
    };

srv/service.cds:

    using {Employees} from '../db/Employees';

    service EmpService @(path: '/employee') {
        entity BusinessPartners as projection on Employees { ID, FULLNAMEONREAD };
    }

During hdbcds deployment, below **hdbcds** files will be generated on build. These files can then be deployed to the HDI Container.

EMPLOYEES.hdbcds:

    entity EMPLOYEES {
        key ID : Integer;
        NAME_FIRST : String(10);
        NAME_LAST : String(10);
    };

EMPSERVICE_BUSINESSPARTNERS.hdbcds:

    using EMPLOYEES as EMPLOYEES;
    view EMPSERVICE_BUSINESSPARTNERS as select from EMPLOYEES as EMPLOYEES_0 {
        key EMPLOYEES_0.ID as ID,
        EMPLOYEES_0.NAME_FIRST || ' ' || EMPLOYEES_0.NAME_LAST as FULLNAMEONREAD
    };

During hdbtable deployment, below **hdbtable** and **hdbview** files will be generated on build. These files can then be deployed to the HDI Container.

Employees.hdbtable:

    COLUMN TABLE Employees (
        ID INTEGER NOT NULL,
        NAME_FIRST NVARCHAR(10),
        NAME_LAST NVARCHAR(10),
        PRIMARY KEY(ID)
    )

EmpService.BusinessPartners.hdbview:

    VIEW EmpService_BusinessPartners AS SELECT
        Employees_0.ID,
        Employees_0.NAME_FIRST || ' ' || Employees_0.NAME_LAST AS FULLNAMEONREAD
    FROM Employees AS Employees_0

## License
Copyright (c) 2023 SAP SE or an SAP affiliate company. All rights reserved.