# XS Advanced Programming Model To SAP Cloud Application Programming Model Migration Guide : Manual

This article describes the process to Manually migrate an application's data stored in containers created by the SAP HANA deployment infrastructure (HDI) to SAP HANA Cloud.

**Note:** [The Self-Service Migration Tool for SAP HANA Cloud](https://help.sap.com/docs/hana-cloud/sap-hana-cloud-migration-guide/self-service-migration-for-sap-hana-cloud-tool?locale=en-US) will list out all of the issues/incompatibilities in the source application during migration. But if we opt for the manual approach, we ourself should be aware of the changes to be made in the source application before the migration.

## Requirements
1. The source SAP HANA instance is available. In Shine example, SAP HANA as a Service Instance was used.
2. The target SAP HANA Cloud instance is available.
3. The database user performing the migration requires HDI container-administrator access to the HDI containers that are being migrated. Follow this [Documentation](https://help.sap.com/docs/HANA_CLOUD_DATABASE/c2cc2e43458d4abda6788049c58143dc/468d01d381644cc781185d568037ce93.html) for more information about maintaining HDI administrator users and assigning privileges.
4. The deployments can be done either by using the `@sap/hdi-deploy` module or by using the MTA.
5. CDS development kit should be installed with the command `npm i -g @sap/cds-dk` (**Note:** Make sure the [latest](https://cap.cloud.sap/docs/releases/) cds version is installed).

## Where to Start
We have successfully migrated the SHINE sample application and content in order to identify the challenges and issues that customers have encountered in doing a migration from SAP HANA 2.0 to SAP HANA Cloud. The path followed for this Migration involves the below steps: 
1. [Clone and deploy the SAP HANA 2.0 Application to the source HDI Container](https://github.com/SAP-samples/xsa-cap-migration/blob/main/examples/ManualMigration.md#step-1-clone-and-deploy-the-sap-hana-20-application-to-the-source-hdi-container).
2. [Creation and Setup of CAP Application](https://github.com/SAP-samples/xsa-cap-migration/blob/main/examples/ManualMigration.md#step-2-creation-and-setup-of-cap-application).
3. [Update the Other Database Artifacts in the CAP Application](https://github.com/SAP-samples/xsa-cap-migration/blob/main/examples/ManualMigration.md#step-3-update-the-other-database-artifacts-in-the-cap-application).
4. [Deploy the CAP Application to the target HDI Container](https://github.com/SAP-samples/xsa-cap-migration/blob/main/examples/ManualMigration.md#step-4-deploy-the-cap-application-to-the-target-hdi-container).
5. [Manually migrate the Date from Source HDI Container to target HDI Container](https://github.com/SAP-samples/xsa-cap-migration/blob/main/examples/ManualMigration.md#step-5-manually-migrate-the-date-from-source-hdi-container-to-target-hdi-container).
6. [Migration of SRV and UI layers](https://github.com/SAP-samples/xsa-cap-migration/blob/main/examples/ManualMigration.md#step-6-migration-of-srv-and-ui-layers)

#### **Note:** The migration steps should be tested in a development environment before production.

## Steps
### Step-1: Clone and deploy the SAP HANA 2.0 Application to the source HDI Container
The first step of the migration is to deploy the (Eg: [SHINE](https://github.com/SAP-samples/hana-shine-xsa)) application to the source HDI Container.

- Clone the [SHINE](https://github.com/SAP-samples/hana-shine-xsa) application.
- Create a source HDI Container for the Hana as a Service database instance by following this [Document](https://help.sap.com/docs/HANA_SERVICE_CF/cc53ad464a57404b8d453bbadbc81ceb/93cdbb1bd50d49fe872e7b648a4d9677.html) and bind or connect the SAP HANA 2.0 Shine Application to the created HDI container.
- Build and Deploy the core-db module to the source HDI container. The deployment can be done either by using the [SAP HDI Deployer](https://www.npmjs.com/package/@sap/hdi-deploy) or by using the MTA.

### Step-2: Creation and Setup of CAP Application
The second step of the migration is to create a CAP application.
  #### 2.1: Create and initialize the project:
  In this step, we will create a new CAP application and copy the database of the XSA Shine application and modify it to support the CAP format.
 
 **Note:** All the below steps can be done automatically by running our [xsa-to-cap-migration](https://github.com/SAP-samples/xsa-cap-migration/blob/main/migration-script) script. This will also rename the HANA database artifacts to the CAP CDS supported format. As this is an example script, Adjust the "calcview.xsl" file with the attributes required by the application and build before running the script.
  
  - Open a command line window and navigate to any folder with the command `cd <folder>`.
  - Create a folder for the CAP project and navigate inside it.
    ```
      mkdir <CAP Project folder>
      cd <CAP Project folder>
    ```
  - Create an initial CAP project by executing the command `cds init` inside the root directory.
  - Copy all the files from the database folder of the XSA Application (Eg: [core-db](https://github.com/SAP-samples/xsa-cap-migration/blob/main/hana-shine-xsa/core-db)) to the db folder of the newly created CAP project.

    **Note:** If the source project contains multiple containers with data in multiple folders, CAP Application can be modified to include multiple folders like db, db1 and so on and the data from the source folders can be copied to these folders.
  - Change the extension of the hdbcds files to cds.
  - Modify the notation in view definitions from `""` to `![]`(Eg: `"PurchaseOrderId"` to `![PurchaseOrderId]`).
  - Change the HANA CDS Datatypes to CAP CDS Datatypes.

    | HANA CDS | CAP CDS |
    |----------|---------|
    |LocalDate|Date|
    |LocalTime|Time|
    |UTCDateTime|DateTime|
    |UTCTimestamp|Timestamp|
    |BinaryFloat|Double|
  - Change @OData.publish:true with @cds.autoexpose.
  - Change @Comment with @title.
  - Change table type to type or remove them as CAP CDS doesn't generate table types anymore. We will create a .hdbtabletype files for each table type definition in the later steps.
  - Convert temporary entities to regular entities.
  - Move all the CDS files from their respective folders (Eg: src/) to the db folder of the CAP project. If cds files are inside the src folder then the deployment will fail because of where the "cds" plugin is. As per CAP, the cds files shouldn’t be in src folder because only the gen folder will push the data, but in the XSA application all the artifacts will reside inside the src folder. So we have to move the cds files to the db folder for the deployment to work correctly.
  - Enhance Project Configuration for SAP HANA Cloud by running the command `cds add hana`.
  - Install the npm node modules in the CAP project by running the command `npm install`.
  
  #### 2.2: Remove or Modify the Unsupported database features:
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
  - Add the technical configurations in the `@sql.append` annotations above the entity as below example.
   
    Eg:
    ```
      @sql.append:'PARTITION BY HASH  ( "PARTNERID" ) PARTITIONS GET_NUM_SERVERS()'
      Entity BusinessPartner {}
    ```
    **Note:** Technical configurations of Row store: Since we are converting the temporary table to table, by default it will be stored as a column table so we can remove the row store. Technical configurations of Column store: Its default so it can also be removed.
  - Context cannot be defined for annotations so rename it as `<context name>.<annotation name>`.
  - Add the privileges in the `@sql.append` annotation above the view. 
    ```
      @sql.append:'with structured privilege check'
      define view ItemView as SELECT from Item {};
    ```
  **Note:** For the SHINE example, you can find the modified CDS files in the db folder of the [hana-shine-cap](https://github.com/SAP-samples/xsa-cap-migration/blob/main/hana-shine-cap/db) repository.

### Step-3: Update the Other Database Artifacts in the CAP Application
As Hana Cloud expects the entities to be in Uppercase and `.` to be replaced by `_` , we have to perform some rename operation that will rename all the existing SAP HANA 2.0 artifacts to Hana Cloud supported format. CDS will take care of the tables but for other artifacts like functions, procedures etc., We need to make the below changes

  - Delete the .hdbtabledata and .csv files. 
  
    **Note:** When we migrate the HDI container the data will be retained so the sample data is not required.
  - Create .hdbtabletype files for the table types. Just converting the table type to type will not work, because during cds build, the type definition will be replaced wherever used in the hdbtable and views but if the table type is used in a procedure, the definition will not be updated and during deployment we get the error that the table type mentioned in the procedure is not provided by any file. So when we generate the hdbtabletype file with the table type definition, the deployment will work as expected. The example code is as below
    ```
      TYPE "PROCEDURES_TT_ERRORS" AS TABLE ( 
        "HTTP_STATUS_CODE" Integer,
        "ERROR_MESSAGE" VARCHAR(5000),
        "DETAIL" NVARCHAR(100)
      );
    ```
  - Update the other Hana artifacts to point to the new Database tables. 

    **Note:** If the [xsa-to-cap-migration](https://github.com/SAP-samples/xsa-cap-migration/blob/main/migration-script) script is used to generate the CAP Application, it will take care of renaming few of the Hana artifacts mentioned in the [list](https://github.com/SAP-samples/xsa-cap-migration/blob/main/migration-script/config.json.tpl#L15). For the remaining artifacts manual rename is required at this point to make them point to the new DB artifacts. The script does not support .hdbrole files so update the hdbrole files if any to point to the new DB artifacts manually.

  - If there is a .hdinamespace files in your project, update it as an empty namespace as below.
    ```
      {
        "name": "",
        "subfolder": "ignore"
      }
    ```
  
    **Note:** If the script is used, make sure the above change is made as the script will change the id, so we must ignore the namespace else it will fail during deployment.
  - Make sure the casing is correct in the calculation views, if anything is not modified it might lead to errors during deployment.

  **Note:** The modified artifacts for the example SHINE Application can be accessed with the [link](https://github.com/SAP-samples/xsa-cap-migration/blob/main/hana-shine-cap/db/src).

### Step-4: Deploy the CAP Application to the target HDI Container
In this step, we will deploy the CAP Application to the target HDI Container. This will create empty tables which will be used in the later steps.
 
 - Create a source HDI Container for the SAP Hana Cloud database instance by following this [Document](https://help.sap.com/docs/HANA_SERVICE_CF/cc53ad464a57404b8d453bbadbc81ceb/93cdbb1bd50d49fe872e7b648a4d9677.html) and bind or connect the CAP Application to the created HDI container.
 - Open the package.json file in the root folder and make sure the kind is "hana-cloud" as below.
    ```
      "cds": {
        "requires": {
          "db": {
            "kind": "hana-cloud"
          }
        }
      }
    ```
  - Bind or Connect the CAP Application to the target HDI container.
  - Build and Deploy the CAP db module to the target HDI container. The deployment can be done either by using the [SAP HDI Deployer](https://www.npmjs.com/package/@sap/hdi-deploy) or by using the MTA.

### Step-5: Manually migrate the Date from Source HDI Container to target HDI Container
Follow the [Documentation](https://help.sap.com/docs/HANA_CLOUD/3c53bc7b58934a9795b6dd8c7e28cf05/5bc8c6f7b216490bbecd2e9bf54f3e69.html) to migrate the data stored in source HDI container to SAP HANA Cloud.

**Note:** The list of virtual tables for Shine example can be found in the [virtual.sql](https://github.com/SAP-samples/xsa-cap-migration/blob/main/examples/virtual.sql) file.

### Step-6: Migration of SRV and UI layers
Migrate the SRV and the UI layer of the XSA Application to CAP.
  #### 6.1: Migration of the SRV layer:
  Migrate the srv module from xsodata and xsjs to CAP.
  - For SRV module based on the xsodata service which is exposed and where the annotation `@odata.publish:true` is written, on top of the entities write your own services to expose them in srv module. One approach to verify if the services behave in an expected way is by test driven development approach. That is to write tests for the XSA application and then run the same tests for the deployed CAP application and verify that both behave in the same manner. Eg: [service.cds](https://github.com/SAP-samples/xsa-cap-migration/blob/main/hana-shine-cap/srv/service.cds)
  - We can use the `@cds.persistence.exists` and `@cds.persistence.calcview` to expose the Calculation views. Eg: [datamodel.cds](https://github.com/SAP-samples/xsa-cap-migration/blob/main/hana-shine-cap/db/datamodel.cds)
  - If your existing XSA project is running with odatav2, then make the changes in your cap application by following the given [link](https://pages.github.tools.sap/cap/docs/advanced/odata#odata-v2-proxy-node).
  - Authentication and authorization can be migrated as per the business needs by following the CAP [documentation](https://cap.cloud.sap/docs/guides/authorization).
  
  **Note:** 
  1. [CAP Documentation](https://cap.cloud.sap/docs/) can be referred for different ways to write the Odata Services in CAP.
  2. Part of XSJS Javascript code can be reused in CAP but it's not the recommended approach as there are Sync/Async problems for Node.js > 16 and the xsjs module is not supported for Node.js > 14
             
  #### 6.2: Migration of the UI layer:
  We can reuse the same code for the UI layer. Just modify the OData routes and REST endpoints to point to the exposed CAP application services and endpoints. Once all the changes are made, Build and deploy the CAP application to the Hana Cloud container. Eg: [service.js](https://github.com/SAP-samples/xsa-cap-migration/blob/main/hana-shine-cap/srv/service.js)
  
