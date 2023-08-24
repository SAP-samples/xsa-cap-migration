{
  "migrations": [
    {
      "fileExts": ["hdbcalculationview"],
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
      "fileExts": ["hdbconstraint", "hdbindex", "hdbview", "hdbsequence", "hdbprocedure", "hdbtablefunction", "hdbfunction", "hdbsynonymconfig", "hdbstructuredprivilege"],
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
    }
  ],
  "scanPath": "{CAP_DIR}/**",
  "ignorePaths": ["node_modules/**"],
  "fileExt": ""
}