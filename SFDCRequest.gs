/**
 *    Get total test coverage for the org  
 */
function getOrgWideCoverage() {
  
  var setting = getCoverageScriptRunSetting();
  var toolingOption = getParamsForToolingAPI("query");
  
  var query = "SELECT PercentCovered FROM ApexOrgWideCoverage Name LIMIT 1";
  var result = performQuery(query, toolingOption.option, toolingOption.baseUrl);
  
  return [["Org Wide Coverage", "", "", "", "",  JSON.parse(result).records[0].PercentCovered / 100]];
}

function getCoverageForAllClasses() {
  
  
  var setting = getCoverageScriptRunSetting();
  
  var searchToolingOption = getParamsForToolingAPI("search");
  var searchQuery = "FIND {@isTest} IN ALL FIELDS RETURNING ApexClass(Id, Name)";
  
  var searchResult = performQuery(searchQuery, searchToolingOption.option, searchToolingOption.baseUrl);
  var testIdList = JSON.parse(searchResult).searchRecords.map(function(item){  return item.Id;  });
  
  var toolingOption = getParamsForToolingAPI("query");
  
  var query1 = "SELECT Id, Name, CreatedBy.Name, LastModifiedBy.Name FROM ApexClass WHERE ManageableState = 'unmanaged'";
  var queryResult1 = performQuery(query1, toolingOption.option, toolingOption.baseUrl);
  
  var notTestClassList = JSON.parse(queryResult1)
      .records
      .filter(function(it) { return testIdList.indexOf(it.Id) < 0; } )
      .reduce(function(accumulator ,item){
        
           accumulator[item.Id] = { Name : item.Name, CreatedBy : item.CreatedBy.Name, LastModifiedBy : item.LastModifiedBy.Name };
           return accumulator;
                                       
      }, {}); 
  
  var query2 = "SELECT ApexClassOrTriggerId, ApexClassOrTrigger.Name, NumLinesCovered, NumLinesUncovered FROM ApexCodeCoverageAggregate";
  query2 += " WHERE ApexClassOrTriggerId IN (SELECT Id FROM ApexClass WHERE ManageableState = 'unmanaged') ORDER BY ApexClassOrTrigger.Name";
  var queryResult2 = performQuery(query2, toolingOption.option, toolingOption.baseUrl);
  
  var coverageList = JSON.parse(queryResult2)
                         .records
                         .filter(function(it){ return testIdList.indexOf(it.ApexClassOrTriggerId) < 0; })
                         .map(function(item) {
                         
                           var total = item.NumLinesCovered + item.NumLinesUncovered;
                           var classInfo = notTestClassList[item.ApexClassOrTriggerId];
                         
                           return [
                             item.ApexClassOrTrigger.Name,
                             "Class",
                             item.NumLinesCovered,
                             item.NumLinesUncovered,
                             total,
                             total ? (item.NumLinesCovered / total) : 0,
                             classInfo.CreatedBy,
                             classInfo.LastModifiedBy
                          ];
                       });
    
  return { toContinue : true, records : coverageList};
}


function getCoverageForAllTriggers() {

  var setting = getCoverageScriptRunSetting();
  var toolingOption = getParamsForToolingAPI("query");
  
  var query1 = "SELECT Id, Name, CreatedBy.Name, LastModifiedBy.Name FROM ApexTrigger WHERE IsValid = true AND Status = 'Active'";
  var result1 = performQuery(query1, toolingOption.option, toolingOption.baseUrl);
  
  var triggerInfoList = JSON.parse(result1)
                            .records
                            .reduce(function(accumulator, item){
                              
                                 accumulator[item.Id] = { Name : item.Name, CreatedBy : item.CreatedBy.Name, LastModifiedBy : item.LastModifiedBy.Name };
                                 return accumulator;
                                                             
                             }, {}); 
                        
  var query2 = "SELECT ApexClassOrTriggerId, ApexClassOrTrigger.Name, NumLinesCovered, NumLinesUncovered FROM ApexCodeCoverageAggregate";
  query2 += " WHERE ApexClassOrTriggerId IN (SELECT Id FROM ApexTrigger WHERE IsValid = true AND Status = 'Active') ORDER BY ApexClassOrTrigger.Name";
  var result2 = performQuery(query2, toolingOption.option, toolingOption.baseUrl);
  
  var coverageList = JSON.parse(result2)
                       .records.map(function(item) {
                           var total = item.NumLinesCovered + item.NumLinesUncovered;
                           var triggerInfo = triggerInfoList[item.ApexClassOrTriggerId];
                                                             
                           return [
                             item.ApexClassOrTrigger.Name,
                             "Trigger",
                             item.NumLinesCovered,
                             item.NumLinesUncovered,
                             total,
                             total ? (item.NumLinesCovered / total) : 0,
                             triggerInfo.CreatedBy,
                             triggerInfo.LastModifiedBy
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
function getParamsForToolingAPI(queryKey) {
  
  var connector = getConnectorFromCache();
  var option = {
      "method"   : "get",
      "headers"  : { "Authorization": "Bearer " + connector.access_token },
      "escaping" : false 
  };
  
  //var baseUrl = connector.instance_url + '/services/data/v40.0/tooling/query?q=';
  
  var baseUrl = connector.instance_url + "/services/data/v40.0/tooling/" + queryKey + "?q=";
  
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
