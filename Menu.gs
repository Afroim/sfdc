function onOpen() {
  var sheet = SpreadsheetApp.getActiveSpreadsheet();
  
  var menuEntries = [
    {
      name : "Export Test Coverage Info",
      functionName : "startCoverageExport"
    },
    
    {
      name : "Help",
      functionName : "showHelp"
    },
  ];
  
  sheet.addMenu("Salesforce", menuEntries);
}

function showHelp() {

  var htmlOutput = HtmlService.createTemplateFromFile('HelpTmpl')
                  .evaluate()
                  .setWidth(600)
                  .setHeight(540);             
  
  var ui = SpreadsheetApp.getUi();
  ui.showModalDialog(htmlOutput, "Help");

}

function startCoverageExport() {
  
  var connector = getConnectorFromCache();
  connector && connector.access_token ? exportAllApexEntitiesDialog() : authenticationDialog(); 
}



function authenticationDialog() {
                  
   var htmlOutput = HtmlService.createTemplateFromFile('AuthDialogTmpl')
                  .evaluate()
                  .setWidth(600)
                  .setHeight(580);              
  
  var ui = SpreadsheetApp.getUi();
  ui.showModalDialog(htmlOutput, "Authentication Setting");
  
}

function include(filename) {
  return HtmlService.createHtmlOutputFromFile(filename)
      .getContent();
}

function exportAllApexEntitiesDialog() {
  var htmlOutput = HtmlService.createTemplateFromFile('AllEntitiesCoverageTmpl')
                  .evaluate() 
                  .setWidth(600)
                  .setHeight(410);
  
  var ui = SpreadsheetApp.getUi();
  ui.showModalDialog(htmlOutput, "Export Test Coverage Info");

}

function getScriptRunSetting() {
  return getCoverageScriptRunSetting();
}

function exportAllApexEntities(dataType, topLeft, addOrgWideCoverage, addHeader) {

  var sheet = SpreadsheetApp.getActiveSheet();

  var scriptRunSetting = {
  
      dataType     : dataType,
      topLeft      : topLeft,
addOrgWideCoverage : addOrgWideCoverage, 
      headerHeight : addHeader ? 1 : 0,
      sheetName    : sheet.getName(),
      docId        : SpreadsheetApp.getActive().getId(),  
      offSet       : 0,
      soqlOffSet   : 0,
  };
  
  var cache = saveCoverageScriptRunSetting(scriptRunSetting);
  //add table header 
  if(scriptRunSetting.headerHeight) {
      addTableHeader(sheet, scriptRunSetting.topLeft, "Class");
      scriptRunSetting.offSet = 1;
      saveCoverageScriptRunSetting(scriptRunSetting);
  }
  //add org wide coverage data
  if(scriptRunSetting.addOrgWideCoverage) {
  
    var orgResult = getOrgWideCoverage();
    addRecordsToSheet(sheet, orgResult, scriptRunSetting.topLeft, scriptRunSetting.offSet);
    ++scriptRunSetting.offSet;
    saveCoverageScriptRunSetting(scriptRunSetting);
    
  }
  //export data
  try {
    switch(scriptRunSetting.dataType) {
    
      case "class" :
      
            var result = getCoverageForAllClasses();
            addRecordsAndRenewSetting(result);
            break;
            
      case "trigger" :
      
            var result = getCoverageForAllTriggers();
            addRecordsAndRenewSetting(result);
            break;
            
      default :
            var result = getCoverageForAllClasses();
            addRecordsAndRenewSetting(result);
            var result = getCoverageForAllTriggers();
            addRecordsAndRenewSetting(result);
            break;
    
    }
  }
  catch(exp) {
        Logger.log(exp);
        throw exp;
  }

}

function addRecordsAndRenewSetting(result) {

  if(result.records.length > 0) {
          
    var setting = getCoverageScriptRunSetting();
    var sheet = SpreadsheetApp.openById(setting.docId).getSheetByName(setting.sheetName);
    setting.offSet = parseInt(setting.offSet);
    addRecordsToSheet(sheet, result.records, setting.topLeft, setting.offSet);
    setting.offSet = setting.offSet + result.records.length;
    saveCoverageScriptRunSetting(setting);
    
  }

}
/**
    Connect to the org and save credential data in global script properties and connector data in the script cache
*/
function testConnectionAndSaveCredential(username, password, client_id, client_secret, orgType, savePwd) {

  var credential = {
       username      :  username,
       password      :  password,
       client_id     :  client_id,
       client_secret :  client_secret,
       orgType       :  orgType
   },
   connector;
   
   try {
     connector = sfdcAuth(credential);
   }
   catch(e) {
     
     Logger.log(e);
     var exp = "Request failed";
     throw exp;
   
   }
     
   if(!savePwd) {
      credential.password = ""; 
   }
    
   saveCredential(credential); 
   saveConnectorDataInCache(connector);
   
   exportAllApexEntitiesDialog();
}

