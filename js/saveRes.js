function saveRes(){

	var savedItems = localStorage.getItem("savedData");
	if(savedItems === null) { savedItems2 = []; }
	else { savedItems2 = JSON.parse(savedItems); }
	var newItem = [];

  	var resArr = localStorage.getItem("ajaxData");
  	var resultArray = JSON.parse(resArr);
	var mnemonicName = document.getElementById("mName").value;
	var graphName = document.getElementById("gName").value;
	var description = document.getElementById("desc").value;
	newItem.push(mnemonicName);
	newItem.push(graphName);
	newItem.push(description);
	//resultArray[0] = [ [s1, p1, o1], [s2, p2, o2], ... ]
	newItem.push(resultArray[0]);
	//resultArray[1] = searchtext
	newItem.push(resultArray[1]);
	//resultArray[2] = endpoint url
	newItem.push(resultArray[2]);
	//resultArray[1] = json data
	newItem.push(resultArray[3]);

	savedItems2.push(newItem);
	localStorage.setItem("savedData", JSON.stringify(savedItems2));
	$('#mName').val('');
	$('#gName').val('');
	$('#desc').val('');
	$('#myModal').modal('show');
 }

function formatSaveData(saveResults){
	var headerVars = saveResults.head.vars;
	var bindings = saveResults.results.bindings;
	var converteData = [];
	for(rowIdx in bindings){
		var newRow = bindings[rowIdx];
		var res = [];
		for(var i in headerVars){
			// ch is one of the chars s,p,o
			var ch = headerVars[i];
			//content of table cell
			var sValue = newRow[ch]["value"];
			res.push(sValue);
		}
		converteData.push(res);
	} 
	return converteData;
}