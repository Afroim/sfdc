/**
 *    Get total test coverage for the org  
 */
function getOrgWideCoverage() {
  
  var setting = getCoverageScriptRunSetting();
  var toolingOption = getParamsForToolingAPI();
  
  var query = "SELECT PercentCovered FROM ApexOrgWideCoverage Name LIMIT 1";
  var result = performQuery(query, toolingOption.option, toolingOption.baseUrl);
  
  return [["Org Wide Coverage", "", "", "", "",  JSON.parse(result).records[0].PercentCovered / 100]];
}

function getCoverageForAllClasses() {

  var setting = getCoverageScriptRunSetting();
  var toolingOption = getParamsForToolingAPI();
  
  var query = "SELECT ApexClassOrTrigger.Name, NumLinesCovered, NumLinesUncovered FROM ApexCodeCoverageAggregate";
  query += " WHERE ApexClassOrTriggerId IN (SELECT Id FROM ApexClass WHERE ManageableState = 'unmanaged') ORDER BY ApexClassOrTrigger.Name";//LIMIT 20 OFFSET 20
  //Logger.log("class >> " + query); 
  var result = performQuery(query, toolingOption.option, toolingOption.baseUrl);
  
  var coverageList = JSON.parse(result)
                       .records.map(function(item) {
                           var total = item.NumLinesCovered + item.NumLinesUncovered;
                           return [
                             item.ApexClassOrTrigger.Name,
                             "Class",
                             item.NumLinesCovered,
                             item.NumLinesUncovered,
                             total,
                             total ? (item.NumLinesCovered / total) : 0
                           ];
                       });
    
  return { toContinue : true, records : coverageList};
}


function getCoverageForAllTriggers() {

  var setting = getCoverageScriptRunSetting();
  var toolingOption = getParamsForToolingAPI();
  
  var query = "SELECT ApexClassOrTrigger.Name, NumLinesCovered, NumLinesUncovered FROM ApexCodeCoverageAggregate";
  query += " WHERE ApexClassOrTriggerId IN (SELECT Id FROM ApexTrigger WHERE IsValid = true AND Status = 'Active') ORDER BY ApexClassOrTrigger.Name";
  var result = performQuery(query, toolingOption.option, toolingOption.baseUrl);
  
  var coverageList = JSON.parse(result)
                       .records.map(function(item) {
                           var total = item.NumLinesCovered + item.NumLinesUncovered;
                           return [
                             item.ApexClassOrTrigger.Name,
                             "Trigger",
                             item.NumLinesCovered,
                             item.NumLinesUncovered,
                             total,
                             total ? (item.NumLinesCovered / total) : 0
                           ];
                       });
    
  return { toContinue : true, records : coverageList};
  
}

function performQuery(query, option, baseUrl) {
  
  var enquery =  encodeURIComponent(query);
  var requestUrl = baseUrl + enquery; 
  var result = UrlFetchApp.fetch(requestUrl,option);
  return result;
  
}

/*
   Get Params for Tooling API
*/
function getParamsForToolingAPI () {
  
  var connector = getConnectorFromCache();
  var option = {
      "method"   : "get",
      "headers"  : { "Authorization": "Bearer " + connector.access_token },
      "escaping" : false 
  };
  
  var baseUrl = connector.instance_url + '/services/data/v40.0/tooling/query?q=';
  
  return {
    option : option,
    baseUrl: baseUrl
  };
  
}

/*
  salesforce authentication
*/
function sfdcAuth(credential){
  credential.grant_type = "password";
  var params = Object.keys(credential).filter(function(key){ return key != "orgType"}).map(function(item){
  
    return item + "=" + credential[item].trim();
  
  }).join('&');
  //Endpoint + params
  var authURL = "https://" + credential.orgType + ".salesforce.com/services/oauth2/token?" + params;
  
  var results = UrlFetchApp.fetch(authURL, {"method" : "post"});
  var json = results.getContentText();
  var data = JSON.parse(json);
  
  return data;
  
}
