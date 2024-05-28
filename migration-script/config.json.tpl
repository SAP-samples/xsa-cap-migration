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
      "fileExts": ["hdbconstraint", "hdbindex", "hdbview", "hdbsequence", "hdbprocedure", "hdbtablefunction", "hdbfunction", "hdbstructuredprivilege", "hdblibrary","hdbtrigger"],
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