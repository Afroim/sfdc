var EXPIRY_TIME = 86400;//24 hours

function clearCache() {
  var cache = CacheService.getDocumentCache();
  cache.removeAll(["access_token", "instance_url","id","issued_at","signature", "coverage-script-run-setting"]);
  
  var scriptProperties = PropertiesService.getDocumentProperties();
  scriptProperties.deleteAllProperties();
  
  return {
       username      :  "",
       password      :  "",
       client_id     :  "",
       client_secret :  "",
       orgType       :  ""
   };

}

function saveCoverageScriptRunSetting(setting) {
    var cache = CacheService.getDocumentCache();
    cache.put("coverage-script-run-setting", JSON.stringify(setting),EXPIRY_TIME);
    return cache;
}

function getCoverageScriptRunSetting() {
  var cache = CacheService.getDocumentCache();
  var settingJson = cache.get("coverage-script-run-setting");
  var setting = settingJson ? JSON.parse(settingJson) : {};
  return setting;

}

function saveConnectorDataInCache(connector) {
    var cache = CacheService.getDocumentCache();
    cache.putAll(connector, EXPIRY_TIME);
    return cache;
}

function getConnectorFromCache() {
  var cache = CacheService.getDocumentCache();
  return cache.getAll(["access_token", "instance_url"]);

}

function saveCredential(credential) {
  var scriptProperties = PropertiesService.getDocumentProperties();
  Object.keys(credential).forEach(function(key){
    scriptProperties.setProperty(key, credential[key]);
  });

}

function getCredential() {

  var credential = {
       username      :  "",
       password      :  "",
       client_id     :  "",
       client_secret :  "",
       orgType       :  ""
   };
   
  var scriptProperties = PropertiesService.getDocumentProperties();
  
  Object.keys(credential).forEach(function(key){
  
      credential[key] = scriptProperties.getProperty(key);
  
  });
  return credential;
}
