Calculated Elements in Rename Procedure
=======================================
<!--
This sample is a HANA CDS calc-on-read. We could probably just drop such fields and then model them as calc-on-read in CAP - they are somewhat persisted on the
database, using native HANA calc-on-read. Does our native hdbcds -> CAP-hdbcds handover work with such an approach?

Our approach below is NOT a right fit for such calc-on-read, but moreso for calc-on-write.

We should also provide a sample for calc-on-write. Calc-on-write is not supported by CAP for .hdbcds, can be modeled via @sql.append.
To check: Does it work if we remove the calc-part, turn it into a normal field and re-add the calculation-part in the inital CAP-hdbcds deployment?
Or should we/can we do it in the CAP-hdbcds -> CAP-hdbtable handover? That would allow us to model it as a calc-on-write in CAP.
-->
When dealing with calculated elements, Renaming them becomes tricky. In the below sample, the calculated element `FULLNAME` references the fields `NAME.FIRST` and `NAME.LAST`. During our rename, we would normally rename these fields, but this will not work, since the calculated field references them. This means that we will need to manually adapt the generated rename-procedure.

    ```
     Entity Employees {
       key  ID: Integer;
       NAME {
         FIRST: String;
         LAST: String;
       };
       FULLNAME: String(100) = NAME.FIRST || ' ' || NAME.LAST;
     };
    ```
    
In the rename procedure, We need to replace the calculated field `FULLNAME: String(100) = NAME.FIRST || ' ' || NAME.LAST;` with a normal field `FULLNAME: String(100);`, but keep the data. We are starting from the following `.hdbprocedure`:

    ```
     PROCEDURE RENAME_HDBCDS_TO_PLAIN LANGUAGE SQLSCRIPT AS BEGIN --
     -- Employees
     EXEC 'RENAME TABLE "Employees" TO "EMPLOYEES"';
     
     EXEC 'RENAME COLUMN "EMPLOYEES"."NAME.FIRST" TO "NAME_FIRST"';
     
     EXEC 'RENAME COLUMN "EMPLOYEES"."NAME.LAST" TO "NAME_LAST"';
     
     END;
    ```
    
As a first step, we rename the old field to `__FULLNAME`, the chosen name needs to be one where there are no name collisions!

    ```
     EXEC 'RENAME COLUMN "EMPLOYEES"."FULLNAME" TO "__FULLNAME"';
    ```
    
As a second step, we add a new field `FULLNAME`, which has the same data type as `__FULLNAME`.

    ```
     EXEC 'ALTER TABLE "EMPLOYEES" ADD ("FULLNAME" NVARCHAR(100))';
    ```
    
Finally, we copy the data from `__FULLNAME` to `FULLNAME` and drop the field afterwards.

    ```
     EXEC 'UPDATE "EMPLOYEES" SET "FULLNAME" = "__FULLNAME"';
     EXEC 'ALTER TABLE "EMPLOYEES" DROP ("__FULLNAME")';
    ```
    
Afterwards, we can execute the renames as usual. So our final `.hdbprocedure` will look like this:

    ```
     PROCEDURE RENAME_HDBCDS_TO_PLAIN LANGUAGE SQLSCRIPT AS BEGIN --
     -- Employees
     EXEC 'RENAME TABLE "Employees" TO "EMPLOYEES"';

     EXEC 'RENAME COLUMN "EMPLOYEES"."FULLNAME" TO "__FULLNAME"';

     EXEC 'ALTER TABLE "EMPLOYEES" ADD ("FULLNAME" NVARCHAR(100))';

     EXEC 'UPDATE "EMPLOYEES" SET "FULLNAME" = "__FULLNAME"';

     EXEC 'ALTER TABLE "EMPLOYEES" DROP ("__FULLNAME")';

     EXEC 'RENAME COLUMN "EMPLOYEES"."NAME.FIRST" TO "NAME_FIRST"';

     EXEC 'RENAME COLUMN "EMPLOYEES"."NAME.LAST" TO "NAME_LAST"';

     END;
    ```
