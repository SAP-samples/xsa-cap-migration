SHINE on Hana Cloud using SAP Cloud Application Programming Model
===============
SHINE is a Multi-Target Application (MTA) and follows the CAP Programming Model. It consists of the following packages:

- db - This package contains core data model artifacts required to create the tables, calculation view, hdbviews,procedure,functions,sequence,synonyms,analytical privilege, index, hdbgrants and roles etc.

- srv - This package contains the CAP Nodejs Implementation.

- user-db - This package contains user data module and provides table, procedures , sequence and synonyms

- web - This package contains the user interface for the SHINE Launchpad, Data Generator, Purchase Order Worklist, Job Scheduler, Sales Dashboard, Spatial and User CRUD applications implemented in SAPUI5.


## Requirements
* [Cloud Foundry Command Line Interface (CLI)](https://github.com/cloudfoundry/cli#downloads)
* To build the multi target application, we need the [Cloud MTA Build tool](https://sap.github.io/cloud-mta-build-tool/), download the tool from [here](https://sap.github.io/cloud-mta-build-tool/download/)
* For Windows system, install 'MAKE' from https://sap.github.io/cloud-mta-build-tool/makefile/
>Note: @sap Node.js packages have moved from https://npm.sap.com to the default registry https://registry.npmjs.org.
If sap-registry is set in your system please delete by using below command.   
   
    `npm config delete "@sap:registry"`
>Note: Minimum version to run the application is CDS : 7.x.x
* Install the following:
  1. cds    - `npm install -g @sap/cds` & `npm install -g @sap/cds-dk`
  2. [multiapps plugin](https://github.com/cloudfoundry-incubator/multiapps-cli-plugin) - `cf install-plugin multiapps`  
  3. mbt         -  `npm install -g mbt`


## Setup SAP BTP Account & Add Service entitlements
1. Check if the Cloud Foundry account you will be deploying the application has the following [entitlements](https://help.sap.com/viewer/65de2977205c403bbc107264b8eccf4b/Cloud/en-US/c8248745dde24afb91479361de336111.html):

         Job Scheduler: Standard - 1
         XSUAA - 1
         Application Runtime: MEMORY - 4 GB
         Hana Cloud: Hana - 1
         Hana: hdi-shared - 1

### Deploy the reference application

1. Build the application
    `mbt build -p=cf `  
2. Login to Cloud Foundry by typing the below commands on command prompt
    ```
    cf api <api>
    cf login -u <username> -p <password>
    ```
    `api` - [URL of the Cloud Foundry landscape](https://help.sap.com/viewer/65de2977205c403bbc107264b8eccf4b/Cloud/en-US/350356d1dc314d3199dca15bd2ab9b0e.html) that you are trying to connect to.

    Select the org and space when prompted to. For more information on the same refer [link](https://help.sap.com/viewer/65de2977205c403bbc107264b8eccf4b/Cloud/en-US/c4c25cc63ac845779f76202360f98694.html).

3. Deploy the application

  Navigate to mta_archives folder and run the below command from CLI

   `cf deploy shine_0.0.1.mtar`


## Launch the SHINE Application
1. Run the command: `cf apps`  
2. Locate the URLs for the `shine-ui` 

## Undeploy the SHINE Application
To undeploy SHINE and delete all its services run the command: `cf undeploy shine-cap -f --delete-services --delete-service-keys`

