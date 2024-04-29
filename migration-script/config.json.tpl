{
  "migrations": [
    {
      "fileExts": ["hdbcalculationview", "hdbanalyticprivilege"],
      "strategies": [
        {
          "name": "XSLT",
          "config": {
            "stylesheetFileName": "calculation.sef.json"
          }
        }
      ]
    },
    {
      "fileExts": ["hdbconstraint", "hdbindex", "hdbview", "hdbtable", "hdbsequence", "hdbprocedure", "hdbtablefunction", "hdbfunction", "hdbstructuredprivilege", "hdblibrary"],
      "strategies": [
        {
          "name": "CharReplacementUppercase",
          "config": {
            "regex": "\"[\\w\\d.::]*\"",
            "replacements": [
              ["::", "_"],
              [".", "_"]
            ]
          }
        },
        {
          "name": "CharReplacementUppercaseSingleQuote",
          "config": {
            "regex": "'[\\w\\d.::]*'",
            "replacements": [
              ["::", "_"],
              [".", "_"]
            ]
          }
        },
         {
            "name": "CharReplacementCS",
            "config": {
                "regex": "CS_\\w+"
            }
        }
      ]
    },
    {
      "fileExts": ["hdbtabletype", "hdbindex", "hdbview", "hdbtable", "hdbsequence", "hdbprocedure", "hdbtablefunction", "hdbfunction"],
      "strategies": [
         {
            "name": "CharReplacementCS",
            "config": {
                "regex": "CS_\\w+"
            } 
        }
      ]
    }
  ],
  "scanPath": "{CAP_DIR}",
  "ignorePaths": ["**/node_modules/**"],
  "fileExt": ""
}