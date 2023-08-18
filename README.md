# XS Advanced Programming Model To SAP Cloud Application Programming Model Migration Guide

[![REUSE status](https://api.reuse.software/badge/github.com/SAP-samples/xsa-cap-migration)](https://api.reuse.software/info/github.com/SAP-samples/xsa-cap-migration)

## Introduction
SAP HANA Interactive Education or SHINE is a demo application that includes the following features:
- **HDI Features:**
  - Table
  - CDS Views
  - Sequence
  - Calculation Views
  - Associations
  - Table Functions
  - Synonyms
  - Procedures
  - Cross Container Access
  - Multiple Containers
  - Spatial Features
  - Local Time Data Generation
  - Comments for Tables
  - Index
  - Structured Privilege
  - Usage of Table Functions in CDS views

- **XSA Features:**
  - User Authentication and Authorization (UAA)
  - App Router
  - oData V2 Services (Node.js)
  - Node js
  - Authorization (Roles)
  - oData Exits
  - Job Scheduler Token-Based Authentication
  - oData Batch

SHINE follows the XS Advanced Programming Model(XSA) and uses SAP HANA Service for the database. This article describes the steps to be followed to Migrate this demo application to the Cloud Application Programming Model(CAP) with SAP HANA Cloud as the database.
  
## Decision Table
 | Source XSA Artifact | Target CAP Artifact |	Notes	                                                      | Available Tools(for automation)	 | More Information |
 |---------------------|---------------------|--------------------------------------------------------------|----------------------------------|------------------|
 | HDBCDS entity       | CAP CDS             |Some code changes are required: <ul><li>Modify the notation in view definitions from `""` to `![]`. This is applicable wherever special characters are used in the definitions, if the special characters are not used, quotes can be removed</li><li>Change the HANA CDS Datatypes to CAP CDS Datatypes</li><li>Change table type to type or remove them</li><li>Use `@cds-persistence-exists` for temporary entities</li><li>Move all the CDS files to db folder</li><li>Remove the full text index</li><li>Convert Series entity to a regular entity</li><li>Change technical configurations and privileges</li><li>Some annotations are not supported</li><li>Context cannot be defined for annotations</li></ul><br/> Entities have to be renamed in the HDI container for that we use the `toRename` function of the CDS Compiler|  <ul><li>For creating the rename procedure we use `toRename` function of CDS compiler</li><li>There are no Tools for other steps</li></ul> | <ul><li> We have used the [migration-script](https://github.com/SAP-samples/xsa-cap-migration/blob/main/migration-script) script to automate some of the changes required.</li><li> [CAP Documentation](https://cap.cloud.sap/docs/get-started/)</li><li>[Migration Guide](https://help.sap.com/docs/HANA_CLOUD/3c53bc7b58934a9795b6dd8c7e28cf05/3101cb652bb74739a3e39593ea969bc5.html)</li><li>[cds-compiler](https://www.npmjs.com/package/@sap/cds-compiler)</li><li>[Delimited Identifiers](https://cap.cloud.sap/docs/cds/cdl#delimited-identifiers)</li><li>[(Temporary) Tables](https://help.sap.com/docs/SAP_HANA_PLATFORM/3823b0f33420468ba5f1cf7f59bd6bd9/453d48e28f6747799546236b4b432e58.html)</li></ul>              |
 | Native HDB artifacts| Native HDB artifacts| <ul><li>Most of the artifacts are supported "as is" in the CAP CDS except for table types, we have to create .hdbtabletype files with the definition</li><li>hdbprocedure, hdbrole, hdbsynonym, hdbfunction, hdbsequence, hdbcalculationview, hdbtabledata are the Native HDB artifacts in SHINE that were modified</li></ul>       |    No                              |    <ol><li>We have used this [migration-script](https://github.com/SAP-samples/xsa-cap-migration/blob/main/migration-script) script to rename tables and columns in some of the artifacts.</li><li>[CAP Native Hana Artifacts](https://cap.cloud.sap/docs/advanced/hana)</li></ol>              |
 | OData service       | OData service       |  <ul><li>Supports both V2 and V4 but we have to rewrite the code from xsodata to CAP</li><li>`@OData.publish` annotation is not supported in CAP, This has to be rewritten in CAP format</li></ul>    |      No                            |                  |
 | XSJS (compatibility)| Nothing             |  It is not compatible with CAP, So it is recommended to rewrite the code in CAP    |   No                               | <ul><li>There are Sync/Async problem for Node.js > 16 so it is recommended to rewrite the code in CAP format</li></ul>              |
 | JavaScript/Node.js  | Node.js                    |    1:1 XSA-CAP    |               No                   |  [CAP NodeJS](https://cap.cloud.sap/docs/node.js/)                |
 | Java                | Jave                     |    1:1 XSA-CAP    |               No                   |   [CAP Java](https://cap.cloud.sap/docs/java/)               |
 | Fiori               |    Fiori                 |  Supported in CAP CDS      |         Fiori elements are not used in Shine so further tests on annotation based application is required              |    [CAP with Fiori](https://cap.cloud.sap/docs/advanced/fiori)              |
 | SAPUI5              |     SAPUI5                |   Supported in CAP CDS      |          We can reuse the same code                       |     [SAPUI5](https://sapui5.hana.ondemand.com/#/topic)             |

## Requirements
1. SAP HANA 2.0 (on-premise or SAP HANA Service on BTP) along with the HDI Container. In Shine example, SAP HANA Service Instance was used.
2. Hana Cloud Service Instance should be created.
3. We can use SAP BAS or VScode for the Migration. Tools like cf cli and mbt have to be installed.
4. The deployments can be done either by using the `@sap/hdi-deploy` module or by using the MTA.
5. CDS development kit should be installed with the command `npm i -g @sap/cds-dk` (**Note:** Make sure the [latest](https://cap.cloud.sap/docs/releases/) cds version is installed).

## Where to Start
We have successfully migrated the SHINE sample application and content in order to identify the challenges and issues that customers have encountered in doing a migration from SAP HANA 2.0 to SAP HANA Cloud. The path followed for this Migration involves the below steps: 
1. [Preparing XS Advanced Source and CAP Target Applications](https://github.com/SAP-samples/xsa-cap-migration/blob/main/README.md#step-1-preparing-xs-advanced-source-and-cap-target-applications)
2. [Rename the HANA Artifacts in the Source SAP HANA 2.0/XSA HDI Container](https://github.com/SAP-samples/xsa-cap-migration/blob/main/README.md#step-2-rename-the-hana-artifacts-in-the-source-sap-hana-20xsa-hdi-container).
3. [CAP Application Deployment with hdbcds and hdbtable format to the Source SAP HANA 2.0/XSA HDI Container](https://github.com/SAP-samples/xsa-cap-migration/blob/main/README.md#step-3-cap-application-deployment-with-hdbcds-and-hdbtable-format-to-the-source-sap-hana-20xsa-hdi-container).
4. [Migration of SAP HANA 2.0 HDI Container using Self-Service Migration for SAP HANA Cloud and Bind the CAP application to the migrated container](https://github.com/SAP-samples/xsa-cap-migration/blob/main/README.md#step-4-migration-of-sap-hana-20-hdi-container-using-self-service-migration-for-sap-hana-cloud-and-connect-the-cap-application-to-the-migrated-container).
5. [Migration of SRV and UI layers](https://github.com/SAP-samples/xsa-cap-migration/blob/main/README.md#step-5-migration-of-srv-and-ui-layers).

#### **Note:** 
#### 1. The migration steps should be tested in a development environment before production.
#### 2. This guide is directed at single-tenant-applications.

## Steps
## Step-1: Preparing XS Advanced Source and CAP Target Applications
In this Step, we will prepare the XS Advanced Source and CAP Target Applications.
### 1.1: Clone and Deploy the XS Advanced Source Application:
The first step of the migration is to clone and deploy the Source Application.
- Open a command line terminal and clone the [SHINE](https://github.com/SAP-samples/hana-shine-xsa/tree/shine-cf) Application.
  ```
    git clone https://github.com/SAP-samples/hana-shine-xsa.git -b shine-cf
  ```
- Build the application
  ```
    mbt build -p=cf
  ```
- Once the build is complete, an mta_archives folder will be created in the root folder. Navigate inside the mta_archives folder.
- Deploy the source application to the SAP Business Technology Platform(SAP BTP) using the below command.
  ```
   cf deploy <Generated_MTAR_Name>.mtar
  ```

### 1.2: Creation and Setup of the Target CAP Application
The next step of the migration is to create a Target CAP application.
  #### 1.2.1: Create and initialize the project:
  In this step, we will create a Target CAP application and copy the database of the XSA application and modify it to support the CAP format.
 
 **Note:** All the below steps can be done automatically by running our [migration-script](https://github.com/SAP-samples/xsa-cap-migration/blob/main/migration-script) script. This will also rename the HANA database artifacts to the CAP CDS supported format. As this is an example script, Adjust the "calcview.xsl" file with the attributes that are required by the application and build before running the script.
  
  - Open a command line window and navigate to any folder with the command `cd <folder>`.
  - Create a folder for the CAP project and navigate inside it.
    ```
      mkdir <CAP Project folder>
      cd <CAP Project folder>
    ```
  - Create an initial CAP project by executing the command `cds init` inside the root directory.
  - Copy all the files from the database folder of the XSA/SAP HANA 2.0 Application (Eg: [core-db](https://github.com/SAP-samples/xsa-cap-migration/blob/main/hana-shine-xsa/core-db)) to the db folder of the newly created CAP project.
  
    **Note:** If the source project contains multiple containers with data in multiple folders, CAP Application can be modified to include multiple folders like db, db1 and so on and the data from the source folders can be copied to these folders.
  - Change the extension of the hdbcds files to cds.
  - Modify the notation in view definitions from `""` to `![]`(Eg: `"PurchaseOrderId"` to `![PurchaseOrderId]`). This [delimiter](https://cap.cloud.sap/docs/cds/cdl#delimited-identifiers) makes the processing in CAPCDS more reliable.
  - Change the HANA CDS Datatypes to CAP CDS Datatypes.

    | HANA CDS | CAP CDS |
    |----------|---------|
    |LocalDate|Date|
    |LocalTime|Time|
    |UTCDateTime|DateTime|
    |UTCTimestamp|Timestamp|
    |BinaryFloat|Double|
  - Replace `@OData.publish:true` with `@cds.autoexpose`.
  - `@Comment` should be changed to [Doc comments](https://cap.cloud.sap/docs/cds/cdl#doc-comments-%E2%80%94). In the [migration-script](https://github.com/SAP-samples/xsa-cap-migration/blob/main/migration-script) script, we replace `@Comment` with `@title`.
  - Change the artifact table type to type or remove them as CAP CDS doesn't generate table types anymore. We will create a .hdbtabletype files for each table type definition in the later steps.
  - Temporary entities are not supported in CAP. One way to reuse the existing table is to use [`@cds.persistence.exists`](https://cap.cloud.sap/docs/guides/databases#cds-persistence-exists) annotation for the entity in conjunction with [`.hdbdropcreatetable`](https://help.sap.com/docs/SAP_HANA_PLATFORM/3823b0f33420468ba5f1cf7f59bd6bd9/453d48e28f6747799546236b4b432e58.html). In the [migration-script](https://github.com/SAP-samples/xsa-cap-migration/blob/main/migration-script) script, we just convert these entities to regular entities.
  - Move all the CDS files from their respective folders (Eg: src/) to the db folder of the CAP project. If cds files are inside the src folder then the deployment will fail because of where the "cds" plugin is. As per CAP, the cds files shouldn’t be in src folder because only the gen folder will push the data, but in the XSA application all the artifacts will reside inside the src folder. So we have to move the cds files to the db folder for the deployment to work correctly.
  - Enhance Project Configuration for SAP HANA Cloud by running the command `cds add hana`.
  - Install the npm node modules in the CAP project by running the command `npm install`.
  
  #### 1.2.2: Remove or Modify the Unsupported database features:
  In this step, we will remove or modify the unsupported database features in the CAP CDS files. Some of them are listed below
  - Remove the full text index as they are no longer supported.
  - Convert Series entity to a regular entity.
  - Convert Calculated field to regular field and use the `@sql.append` annotation above the field to add the calculation as below example
    ```
      Entity Employees {
        key  ID: Integer;
        NAME {
          FIRST: String;
          LAST: String;
        };
        @sql.append: `generated always as NAME_FIRST || '' || NAME_LAST`
        FULLNAME: String(100);
      };
    ``` 
    **Note:** During hdbtable deployment we will convert this to a Stored calculated element.
  - Add the technical configurations in the `@sql.append` annotation above the entity as below example
    ```
      @sql.append: ```
      technical configuration { 
        partition by HASH  (PARTNERID) Partitions GET_NUM_SERVERS();
      } ```
      Entity BusinessPartner {}
    ```
  - Based on the advanced odata annotations, convert it to the [CAP structure](https://cap.cloud.sap/docs/advanced/odata#annotating-annotations).
  - We can use `@cds.persistence.udf` for [User-Defined Functions in the Calculation view](https://cap.cloud.sap/docs/advanced/hana#calculated-views-and-user-defined-functions).
  - Add the privileges in the `@sql.append` annotation above the view. 
    ```
      @sql.append:'with structured privilege check'
      define view ItemView as SELECT from Item {};
    ```
  **Note:** For the SHINE example, you can find the modified CDS files in the [hdbcds](https://github.com/SAP-samples/xsa-cap-migration/blob/main/examples/hdbcds/db) examples folder.

## Step-2: Rename the HANA Artifacts in the Source SAP HANA 2.0/XSA HDI Container
As CAP expects unquoted identifiers with `.` replaced by `_`, we have to perform some rename operation that will rename all the existing Source Artifacts to Hana Cloud/CAP supported format.

**Note:** This step can be executed only after the changes recommended in Step-2 are made and executing the command `cds build --production` from the root folder of the CAP project doesn't throw any errors.
  ### 2.1: Generate the Rename Procedure using the cds-compiler:
  The Rename procedure can be created using the toRename command of the cds compiler.
  - Install the SAP cds-compiler globally with the command `npm i -g @sap/cds-compiler`.
  - Create a folder outside the CAP application and copy all the cds files here (Note: Views can be ignored as they will be renamed during deployment).
  - Call the toRename function to generate the hdbprocedure with the below command. This will create a RENAME_HDBCDS_TO_PLAIN.hdbprocedure file.
    ```
    cdsc toRename (folder name)/*.cds >  (folder name)/RENAME_HDBCDS_TO_PLAIN.hdbprocedure
    ```
  - Update the [Calculated Element](https://github.com/SAP-samples/xsa-cap-migration/blob/main/examples/CalculatedElement.md) field in the procedure like this:
  
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

  **Note:** The [RENAME_HDBCDS_TO_PLAIN.hdbprocedure](https://github.com/SAP-samples/xsa-cap-migration/blob/main/examples/hdbcds/db/src/defaults/RENAME_HDBCDS_TO_PLAIN.hdbprocedure) file contains the code of the final Rename procedure for the SHINE example.
  
  ### 2.2: Create the Default access role in the Source SAP HANA 2.0/XSA Application:
  The [default_access_role](https://help.sap.com/docs/hana-cloud-database/sap-hana-cloud-sap-hana-database-developer-guide-for-cloud-foundry-multitarget-applications-sap-business-app-studio/default-access-role-for-hdi-containers?version=2023_2_QRC) is required to Alter the tables. Without this role, the rename procedure will throw an Insufficient privilege error when called because the basic application hdi-container user will not have the alter permissions.
  - In the XSA/SAP HANA 2.0 Application, create a "defaults" folder inside the "src" folder.
  - Create the file "default_access_role.hdbrole" with the `ALTER` privilege added in the defaults folder as below
    ```
      {
        "role" : {
          "name" : "default_access_role",
          "schema_privileges": [
            {
              "privileges": [
                "SELECT",
                "INSERT",
                "UPDATE",
                "DELETE",
                "EXECUTE",
                "CREATE TEMPORARY TABLE",
                "SELECT CDS METADATA",
                "ALTER",
                "CREATE ANY"
              ]
            }
          ]
        }
      }
    ```
  - Create a .hdinamespace file in the "defaults" folder with the empty name space as below to ensure that the role can be named default_access_role. 
    ```
      {
        "name": "",
        "subfolder": "ignore"
      }
    ```
  - Also move the above created RENAME_HDBCDS_TO_PLAIN.hdbprocedure file to the "procedures" folder.
  - Deploy the rename procedure and default access role into the SAP HANA 2.0 HDI Container. The deployment can be done either by using the [SAP HDI Deployer](https://www.npmjs.com/package/@sap/hdi-deploy) or by using the MTA.

  ### 2.3: Rename the Database Tables and their respective columns:
  On calling the deployed RENAME_HDBCDS_TO_PLAIN procedure from the Database Explorer, the Database tables will be renamed. 
  - Open the Database explorer.
  - Load the SAP HANA 2.0 HDI Container in the Database explorer.
  - Select the deployed RENAME_HDBCDS_TO_PLAIN procedure under the Procedures folder of the container.
  - Right click on the procedure and select "Generate Call Statement". This will open the Call statement in the SQL Console.
  - Run the SQL query and this will rename the Database Tables and their respective columns.

  ### 2.4: Update the Other Database Artifacts:
  Just like the Database Tables, the other HANA artifacts should also be renamed as the entities referenced in those artifacts no longer exist after calling the rename procedure, so on access it will throw an error. So, in the CAP Application, make the below changes
  - Delete the .hdbtabledata and .csv files.
    **Note:** When we migrate the HDI container the data will be retained so the sample data is not required. Retaining these files might lead to duplicate entry errors during deployment in case your table expects to have unique records.

  - Create .hdbtabletype files for the table types. Just converting the table type to type will not work, because during cds build, the type definition will be replaced wherever used in the hdbtable and views but if the table type is used in a procedure, the definition will not be updated and during deployment we get the error that the table type mentioned in the procedure is not provided by any file. So when we generate the hdbtabletype file with the table type definition, the deployment will work as expected. The example code is as below
    ```
      TYPE "PROCEDURES_TT_ERRORS" AS TABLE ( 
        "HTTP_STATUS_CODE" Integer,
        "ERROR_MESSAGE" VARCHAR(5000),
        "DETAIL" NVARCHAR(100)
      );
    ```
    **Note:**  SAP CAP Model does not support .hdbtabletype files natively, as CAP is designed to be a database-agnostic model and platform. Instead, CAP encourages developers to use CDS for defining and working with data models. So .hdbtabletype usage should be carefully considered and properly justified as it might not integrate well with CAP environment.
  - Update the other Hana artifacts to point to the new Database tables. 

    **Note:** If the [migration-script](https://github.com/SAP-samples/xsa-cap-migration/blob/main/migration-script) script is used to generate the CAP Application, it will take care of renaming few of the Hana artifacts mentioned in the [list](https://github.com/SAP-samples/xsa-cap-migration/blob/main/migration-script/config.json.tpl#L15). For the remaining artifacts manual rename is required at this point to make them point to the new DB artifacts. The script does not support .hdbrole files so update these files if any to point to the new DB artifacts manually.

  - If there is a .hdinamespace files in your project, update it as an empty namespace as below.
    ```
      {
        "name": "",
        "subfolder": "ignore"
      }
    ```
  
    **Note:** If the Script is used, make sure the above change is made as the script will change the id, so we must ignore the namespace else it will fail during deployment.
  - Make sure the casing is correct in the calculation views, if anything is not modified it might lead to errors during deployment.

  **Note:** The modified artifacts for the example SHINE Application can be accessed with the [link](https://github.com/SAP-samples/xsa-cap-migration/blob/main/examples/hdbcds/db/src).

## Step-3: CAP Application Deployment with hdbcds and hdbtable format to the Source SAP HANA 2.0/XSA HDI Container.
To retain the data in the container, we have to first deploy the CAP Application with the hdbcds format and then with hdbtable format.
  ### 3.1: CAP Application Deployment with hdbcds format:
  The hdbcds deployment will map the CAP entities to the existing entities in the SAP HANA 2.0 HDI container.
  - Open the package.json file in the root folder of the CAP application and change the deploy-format into "hdbcds" and kind as "hana" as below.
    ```
      "cds": {
        "hana": {
          "deploy-format": "hdbcds"
        },
        "requires": {
          "db": {
            "kind": "hana"
          }
        }
      }
    ```
  - Next, we need to remove the rename procedure and the default_access_role as its no longer required. Delete the RENAME_HDBCDS_TO_PLAIN.hdbprocedure from the "procedures" folder and also delete the "defaults" folder. Add the path of these files in the undeploy.json file like this:
    ```
    [
        "src/defaults/*",
        "src/procedures/RENAME_HDBCDS_TO_PLAIN.hdbprocedure"
    ]
    ```
  - Build the CAP Application by running the command `cds build --production`. This will generate the database artifacts with the hdbcds format.
  - Deploy the CAP db module to the SAP HANA 2.0 HDI container. The deployment can be done either by using the [SAP HDI Deployer](https://www.npmjs.com/package/@sap/hdi-deploy) or by using the MTA.
  
  **Note:** The CAP db module of the example SHINE Application with hdbcds format can be accessed with the [link](https://github.com/SAP-samples/xsa-cap-migration/blob/main/examples/hdbcds/db)
  
  ### 3.2: CAP Application Deployment with hdbtable format:
  As Hana Cloud doesn't support hdbcds format, The hdbtable deployment will convert the mapped entities to hdbtables which can then be migrated to the Hana Cloud.
  - Open the package.json file in the root folder of the CAP application and change the deploy-format into "hdbtable".
    ```
      "cds": {
        "hana": {
          "deploy-format": "hdbtable"
        },
        "requires": {
          "db": {
            "kind": "hana"
          }
        }
      }
    ```
  - Change the Calculated field to a [Stored calculated element](https://cap.cloud.sap/docs/releases/jun23#calculated-elements-on-write) as below example
    ```
      Entity Employees {
        key  ID: Integer;
        NAME {
          FIRST: String;
          LAST: String;
        };
        FULLNAME: String(100) = (NAME.FIRST || ' ' || NAME.LAST) stored;
      };
    ```
    **Note:**  Stored calculated element is supported from cds version 7 onwards.
  - Modify the `@sql.append` annotations above the entity to remove the technical configuration blocks.
    
    Eg:
    ```
      @sql.append:'PARTITION BY HASH  ( "PARTNERID" ) PARTITIONS GET_NUM_SERVERS()'
      Entity BusinessPartner {}
    ```
    **Note:** Technical configurations of Row store: Since we are converting the temporary table to table, by default it will be stored as a column table so we can remove the row store. Technical configurations of Column store: Its default so it can also be removed.
  - Open the undeploy.json file in the db folder and update it to undeploy all the hdbcds database artifacts and replace them with .hdbtable database artifacts like this:

    ```
    [
      "src/gen/*.hdbcds"
    ]
    ```

  - Build the CAP Application by running the command `cds build --production`. This will generate the db artifacts with the hdbtable format.
  - Deploy the CAP db module to the SAP HANA 2.0 HDI container. The deployment can be done either by using the [SAP HDI Deployer](https://www.npmjs.com/package/@sap/hdi-deploy) or by using the MTA.
  
  **Note:** The CAP db module of the example SHINE Application with hdbtable format can be accessed with the [link](https://github.com/SAP-samples/xsa-cap-migration/blob/main/examples/hdbtable/db)

## Step-4: Migration of SAP HANA 2.0 HDI Container using Self-Service Migration for SAP HANA Cloud and Connect the CAP application to the migrated container.
Migrate the SAP HANA 2.0 HDI container to Hana Cloud Container and Connect the existing CAP application to this migrated container.
  ### 4.1: SAP HANA 2.0 HDI Container to Hana Cloud HDI Container:
  Use the Self-Service Migration for SAP HANA Cloud to migrate the SAP HANA 2.0 container to Hana Cloud container. This [link](https://help.sap.com/docs/HANA_CLOUD/3c53bc7b58934a9795b6dd8c7e28cf05/3101cb652bb74739a3e39593ea969bc5.html) can be used to access the Migration Guide for the detailed flow.

  ### 4.2: Connect the CAP application to the migrated container:
  Bind and Deploy the existing CAP application to the migrated container
  - In the CAP Application, Open the package.json file in the root folder and change the kind to "hana-cloud". **Note:** `deploy-format` can be removed as `hdbtable` is the default deploy format for Hana Cloud.
    ```
      "cds": {
        "requires": {
          "db": {
            "kind": "hana-cloud"
          }
        }
      }
    ```
  - Bind or Connect the CAP Application to the HANA Cloud container created by the migration service.
  - Build and Deploy the CAP db module to the Hana Cloud container. The deployment can be done either by using the [SAP HDI Deployer](https://www.npmjs.com/package/@sap/hdi-deploy) or by using the MTA.

## Step-5: Migration of SRV and UI layers.
Migrate the SRV and the UI layer of the XSA Application to CAP.
  ### 5.1: Migration of the SRV layer:
  Migrate the srv module from xsodata and xsjs to CAP.
  - For SRV module based on the xsodata service which is exposed and where the annotation `@odata.publish:true` is written, on top of the entities write your own services to expose them in srv module. One approach to verify if the services behave in an expected way is by test driven development approach. That is to write tests for the XSA application and then run the same tests for the deployed CAP application and verify that both behave in the same manner. Eg: [service.cds](https://github.com/SAP-samples/xsa-cap-migration/blob/main/hana-shine-cap/srv/service.cds)
  - We can use the `@cds.persistence.exists` and `@cds.persistence.calcview` to expose the Calculation views. Eg: [datamodel.cds](https://github.com/SAP-samples/xsa-cap-migration/blob/main/hana-shine-cap/db/cds/datamodel.cds)
  - If your existing XSA project is running with odatav2, then make the changes in your cap application by following the given [link](https://pages.github.tools.sap/cap/docs/advanced/odata#odata-v2-proxy-node).
  - Authentication and authorization can be migrated as per the business needs by following the CAP [documentation](https://cap.cloud.sap/docs/guides/authorization).
            
  ### 5.2: Migration of the UI layer:
  We can reuse the same code for the UI layer. Just modify the OData routes and REST endpoints to point to the exposed CAP application services and endpoints. Once all the changes are made, Build and deploy the CAP application to the Hana Cloud container. Eg: [service.js](https://github.com/SAP-samples/xsa-cap-migration/blob/main/hana-shine-cap/srv/service.js)
  
## Known Issues
-  Part of XSJS Javascript code can be reused in CAP but it's not the recommended approach as there are Sync/Async problems for Node.js > 16 and the xsjs module is not supported for Node.js > 14
-  There is No Option to select the specific containers to migrate so it will migrate all the containers in the given space.

## Learning Resources
1. [CAP Documentation](https://cap.cloud.sap/docs/).
2. [SHINE for XSA](https://help.sap.com/docs/SHINE/shine-xsa/shine.html).
3. [SAP Hana Cloud](https://help.sap.com/docs/hana-cloud?locale=en-US).
4. [SAP HANA Cloud Migration Guide](https://help.sap.com/docs/hana-cloud/sap-hana-cloud-migration-guide/sap-hana-cloud-migration-guide?locale=en-US).
5. [Migration Guidance for Incompatible Features](https://help.sap.com/docs/hana-cloud/sap-hana-cloud-migration-guide/checks-performed-by-migration-tool).
6. [Compatibility with Other SAP HANA Products](https://help.sap.com/docs/hana-cloud/sap-hana-cloud-migration-guide/compatibility-with-other-sap-hana-versions).
7. [The Self-Service Migration Tool for SAP HANA Cloud](https://help.sap.com/docs/hana-cloud/sap-hana-cloud-migration-guide/self-service-migration-for-sap-hana-cloud-tool?locale=en-US).
8. [Manual Migration of XSA to CAP](https://github.com/SAP-samples/xsa-cap-migration/blob/main/examples/ManualMigration.md).
9. [SAPUI5](https://sapui5.hana.ondemand.com/#/topic).
10. [Fiori Elements](https://sapui5.hana.ondemand.com/sdk/#/topic/03265b0408e2432c9571d6b3feb6b1fd).
11. [Partition a table in HANA Deployment Infrastructure(HDI)](https://blogs.sap.com/2022/01/11/partition-a-table-in-hana-deployment-infrastructurehdi/)
12. [Deploy Your Multi-Target Application (MTA)](https://developers.sap.com/tutorials/btp-app-cap-mta-deployment.html)

## How to obtain support
[Create an issue](https://github.com/SAP-samples/xsa-cap-migration/issues) in this repository if you find a bug or have questions about the content.
 
For additional support, [ask a question in SAP Community](https://answers.sap.com/questions/ask.html).

## Contributing
If you wish to contribute code, offer fixes or improvements, please send a pull request. Due to legal reasons, contributors will be asked to accept a DCO when they create the first pull request to this project. This happens in an automated fashion during the submission process. SAP uses [the standard DCO text of the Linux Foundation](https://developercertificate.org/).

## License
Copyright (c) 2023 SAP SE or an SAP affiliate company. All rights reserved. This project is licensed under the Apache Software License, version 2.0 except as noted otherwise in the [LICENSE](LICENSE) file.
