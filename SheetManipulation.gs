function addTableHeader(sheet, topLeft, type) {
  
  addRecordsToSheet(sheet, [["Entity Name", "Type", "Covered Lines", "Uncovered Lines", "Total Lines", "Test Coverage", "CreatedBy", "LastModifiedBy"]], topLeft, 0);
}

function addRecordsToSheet(sheet, records, topLeft, offset) {
  
  var theOffSet = offset ? offset : 0;
  
  var startRange = sheet.getRange(topLeft);
  var headRange = sheet.getRange(startRange.getRow() + theOffSet, startRange.getColumn() ,records.length, records[0].length)
                       .setValues(records);
}
