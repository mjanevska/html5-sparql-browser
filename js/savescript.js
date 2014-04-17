$(document).ready(function(){
	
	var savedItems = JSON.parse(localStorage.getItem("savedData"));
	if(savedItems === null) { document.getElementById("newPage").innerHTML = "No saved results";}
	else { drawSavedData(savedItems); }

	$("#saveFile").click(function(event){
		var text = document.getElementById("textArea").value;
		if(text || text.length !== 0) { 
			// var e = document.getElementById("formats");
			// var choice = e.options[e.selectedIndex].value;
			event.preventDefault();
			//var BB = new Blob();
			saveAs(
				  new Blob(
					  [text || text.placeholder]
					, {type: "text/plain;charset=" + document.characterSet}
				)
				, (document.getElementById("html-filename").value || document.getElementById("html-filename").placeholder) + ".file"
			);
		}
	});

});

function drawSavedData(savedItems){

	for (var i = 0; i < savedItems.length; i++) {
		var storeTable = savedItems[i];
		var table = '<table border="1" id="'+i+'" background="img/table.png">';
		table+='<tr><th>Mnemonical name</th><td colspan="2">'+storeTable[0]+'</td></tr>';
		table+='<tr><th>Graph name</th><td colspan="2">'+storeTable[1]+'</td></tr>';
		table+='<tr><th>Description</th><td colspan="2">'+storeTable[2]+'</td></tr>';
		table+='<tr><th>Entity</th><th>Relation</th><th>Value</td></tr>';

		var triples = storeTable[3];
		for(y in triples){
			if(y <= 9){
				var last = triples[y][2];
				table+='<tr><td>'+triples[y][0]+'</td><td>'+triples[y][1]+'</td><td>'+ last.substring(0,170) +'</td></tr>';
			}
		}
		table+='<tr><td colspan="3"><button onclick="getTableDetails(\'' + i + '\')" class="btn btn-primary btn-sm">Details</button>&nbsp;';
		table+='<button class="btn btn-info btn-sm" onclick="getUpdateRefresh(\'' + i + '\')">Update Refresh</button>&nbsp;';
		table+='<button class="btn btn-info btn-sm" onclick="getCleanRefresh(\'' + i + '\')">Clean Refresh</button>&nbsp;<button class="btn btn-warning btn-sm" onclick="deleteTable(\'' + i + '\')">Delete</button></td></tr>';
		table +='</table><br>';
		$('#newPage').append(table);
		document.getElementById("formatData").style.visibility = "hidden";
	}
};

function getTableDetails(index){
	var savedItems = JSON.parse(localStorage.getItem("savedData"));
	var storeTable = savedItems[index];
	var table = '<table border="1" id="'+index+'" background="img/table.png">';
	table+='<tr><th>Mnemonical name</th><td colspan="2">'+storeTable[0]+'</td><td id="0"><img src="img/edit.png" class="btnEditHeader"/></td></tr>';
	table+='<tr><th>Graph name</th><td colspan="2">'+storeTable[1]+'</td><td id="1"><img src="img/edit.png" class="btnEditHeader"/></td></tr>';
	table+='<tr><th>Description</th><td colspan="2">'+storeTable[2]+'</td><td id="2"><img src="img/edit.png" class="btnEditHeader"/></td></tr>';
	table+='<tr><th>Entity</th><th>Relation</th><th colspan="2" >Value</td></tr>';
	
	var triples = storeTable[3];
	for(y in triples){
		var valueOftriple = removeTags(triples[y][2]);
		table+='<tr id="'+y+'"><td>'+triples[y][0]+'  </td><td>'+triples[y][1]+'</td><td>'+valueOftriple+'</td><td><img src="img/edit.png" class="btnEdit"/><img src="img/delete.png" class="btnDelete"/></td></tr>';
	}
	table+='<tr><td colspan="4"><button class="btn btn-primary btn-sm" onclick = "goBack()">Back</button>';
	table+='&nbsp;<select id="formats"><option value = "1">JSON</option><option value = "2">XML</option><option value = "3">RDF/XML</option><option value = "4">Turtle</option><option value = "5">NTriples</option><option value = "6">CSV</option><option value = "7">TSV</option></select>&nbsp;<button class="btn btn-info btn-sm" id="showFormatData" onclick="showFormatData('+index+')">Show</button></td></tr>';
	table +='</table><br>';	
	document.getElementById("objectSaved").innerHTML = table;
	document.getElementById("newPage").innerHTML ="";
	document.getElementById("formatData").style.visibility = "visible";
	// document.getElementById("newPage").style.visibility = "hidden";

	// // tuka se zema json objektot kako string, moze da se napravi pecatenje
	//  var json = storeTable[6];
	// document.getElementById("formatData").style.visibility = "visible";
 // 	document.getElementById("textArea").value = JSON.stringify(JSON.parse(json), null, 4);

	$(".btnEditHeader").bind("click", EditHeader);
	$(".btnEdit").bind("click", Edit);
	$(".btnDelete").bind("click", Delete);
};

function deleteTable(index){
	$('#mydeleteModal').modal('show');
	$('#mydeleteModal button.btn-primary').click(function(){
		$('#mydeleteModal').modal('hide');
		var savedItems = JSON.parse(localStorage.getItem("savedData"));
		savedItems.splice(index,1);
		localStorage.setItem("savedData", JSON.stringify(savedItems));
	});
};

function goBack(){
	$.ajax({
	    url: "",
	    context: document.body,
	    success: function(s,x){
	        $(this).html(s);
	    }
	});
};


//get clean refresh function
function getCleanRefresh(index){
    var savedItems = JSON.parse(localStorage.getItem("savedData"));
    var storeTable = savedItems[index];
    var trip = storeTable[3];
    searchText = storeTable[4];
    endpointURL = storeTable[5];
    var dbpediaQuery = "select reduced ?s ?p ?o where {?s ?p ?o . ?p ?k ?type . filter ( regex(?o, \"" + searchText +"\", \"i\") && (?type = owl:DatatypeProperty || ?type = rdf:Property))} LIMIT 1000";
    var dbpediaQueryUrl = endpointURL + "?default-graph-uri=http%3A%2F%2Fdbpedia.org&query="+$.URLEncode(dbpediaQuery)+"&format=json&timeout=30000&debug=on";
    var query = "select reduced ?s ?p ?o where { ?s ?p ?o. filter(regex(?o, \"" + searchText +"\", \"i\"))} LIMIT 1000";
    
    if(endpointURL.indexOf("http://dbpedia.org/") !== -1) {
        var queryUrl = dbpediaQueryUrl;
    }
    else {
        var queryUrl = endpointURL + "?default-graph-uri=&query="+$.URLEncode(query)+"&format=json&timeout=30000&debug=on";
    }
    $('#processing-modal').modal('show');
    // show the loading message.

    $.ajax({
      dataType: "jsonp",
      url: queryUrl,
      success: function(data) {

            var sTriples = formatSaveData(data);
            storeTable[3] = sTriples;
            storeTable[6] = JSON.stringify(data);
            savedItems[index] = storeTable;
            localStorage.setItem("savedData", JSON.stringify(savedItems));
            $('#processing-modal').modal('hide');
            $('#myModal').modal('show');
        }
    });
};


//get update refresh function

function getUpdateRefresh(index){
    var savedItems = JSON.parse(localStorage.getItem("savedData"));
    var storeTable = savedItems[index];
    // var trip = storeTable[3];
    var st = ArrtoTstore(storeTable[3]);
    var searchText = storeTable[4];
    var endpointURL = storeTable[5];
    var jsondata1 = JSON.parse(storeTable[6]);
    var dbpediaQuery = "select reduced ?s ?p ?o where {?s ?p ?o . ?p ?k ?type . filter ( regex(?o, \"" + searchText +"\", \"i\") && (?type = owl:DatatypeProperty || ?type = rdf:Property))} LIMIT 1000";
    var dbpediaQueryUrl = endpointURL + "?default-graph-uri=http%3A%2F%2Fdbpedia.org&query="+$.URLEncode(dbpediaQuery)+"&format=json&timeout=30000&debug=on";
    var query = "select reduced ?s ?p ?o where { ?s ?p ?o. filter(regex(?o, \"" + searchText +"\", \"i\"))} LIMIT 1000";
    
    if(endpointURL.indexOf("http://dbpedia.org/") !== -1) {
        var queryUrl = dbpediaQueryUrl;
    }
    else {
        var queryUrl = endpointURL + "?default-graph-uri=&query="+$.URLEncode(query)+"&format=json&timeout=30000&debug=on";
    }
    $('#processing-modal').modal('show');
    // show the loading message.

    $.ajax({
      dataType: "jsonp",
      url: queryUrl,
      success: function(data) {

            var mArray = formatSaveData(data);
            for(t in mArray){
        		var triple = mArray[t];
        		st.add(triple[0], triple[1], triple[2]);
    		}
            storeTable[3] = removeDuplicates(TstoretoArr(st));
            storeTable[6] = JSON.stringify(data);
            savedItems[index] = storeTable;
            localStorage.setItem("savedData", JSON.stringify(savedItems));
            $('#processing-modal').modal('hide');
            $('#myModal').modal('show');
        }
    });
};

function removeDuplicates(mArray){
	for(var i=0; i < mArray.length - 1; i++){
		if(arraysIdentical(mArray[i], mArray[i+1])){
			mArray.splice(i, 1);
		}
	}
	return mArray;
};

function arraysIdentical(a, b) {
    var i = a.length;
    if (i !== b.length) return false;
    while (i--) {
        if (a[i] !== b[i]) return false;
    }
    return true;
};

function removeTags(value){
	 return value.replace(/<\/.*?>/g, '');
};

function showFormatData(index){
	//var index = $(this).closest('table').attr('id');
	var e = document.getElementById("formats");
	var choice = e.options[e.selectedIndex].text;
	var savedItems = JSON.parse(localStorage.getItem("savedData"));
	var storeTable = savedItems[index];
	var json = storeTable[6];

	if(choice === "JSON"){
		// tuka se zema json objektot kako string, moze da se napravi pecatenje
	 	document.getElementById("textArea").value = JSON.stringify(JSON.parse(json), null, 4);
 	}
 	else if(choice === "CSV") {
 		var resCSV = JSON2CSV(json);
 		// console.log(formatSaveData(JSON.parse(json)));
 		document.getElementById("textArea").value = resCSV;
 	}
 	else if(choice === "TSV"){
 		var resCSV = JSON2CSV(json);
 		// console.log(formatSaveData(JSON.parse(json)));
 		var resTSV = resCSV.replace(/\s*","\s*/g, '"\t"');
 		document.getElementById("textArea").value = resTSV;
 	}
 	else if(choice === "Turtle"){
		var jsonOb = new JsonTurtle;
		// parse JSON object and returns Turtle string
		var turtle_string = jsonOb.parsej(JSON.parse(json),"\n",'');
		document.getElementById("textArea").value = turtle_string;
 	}
 	else if(choice === "NTriples"){
		json2ntriples(index);
 	}
 	else if(choice === "XML"){
 		var x2js = new X2JS();
 		document.getElementById("textArea").value = unescapeXmlChars(x2js.json2xml_str($.parseJSON(json)));

 	}
 	else if(choice === "RDF/XML"){
 		json2rdfxml(index);
 	}
 	else {
 		document.getElementById("textArea").value = "Test";
 	}
 	document.getElementById("saveFile").disabled = false;
}

function unescapeXmlChars(str) {
		return str.replace(/&amp;/g, '&').replace(/&lt;/g, '<').replace(/&gt;/g, '>').replace(/&quot;/g, '"').replace(/&#x27;/g, "'").replace(/&#x2F;/g, '\/');
	}

function JSON2CSV(jsonStrObj){
	var jsonArr = formatSaveData(JSON.parse(jsonStrObj));
	var resCSV = '"s","p","o"' + '\n';
	for(var i=0; i<jsonArr.length; i++){
		resCSV+= '"'+jsonArr[i][0] + '","' + jsonArr[i][1] + '","' +jsonArr[i][2] + '"\n';
	}
	return resCSV;
};

function json2rdfxml(index){
	var savedItems = JSON.parse(localStorage.getItem("savedData"));
    var storeTable = savedItems[index];
    var trip = storeTable[3];
    searchText = storeTable[4];
    endpointURL = storeTable[5];
    var dbpediaQuery = "select reduced ?s ?p ?o where {?s ?p ?o . ?p ?k ?type . filter ( regex(?o, \"" + searchText +"\", \"i\") && (?type = owl:DatatypeProperty || ?type = rdf:Property))} LIMIT 1000";
    var dbpediaQueryUrl = endpointURL + "?default-graph-uri=http%3A%2F%2Fdbpedia.org&query="+$.URLEncode(dbpediaQuery)+"&format=rdf+xml&timeout=30000&debug=on";
    var query = "select reduced ?s ?p ?o where { ?s ?p ?o. filter(regex(?o, \"" + searchText +"\", \"i\"))} LIMIT 1000";
    
    if(endpointURL.indexOf("http://dbpedia.org/") !== -1) {
        var queryUrl = dbpediaQueryUrl;
    }
    else {
        var queryUrl = endpointURL + "?default-graph-uri=&query="+$.URLEncode(query)+"&format=rdf+xml&timeout=30000&debug=on";
    }
    $('#processing-modal').modal('show');
    // show the loading message.

    $.ajax({
      dataType: "text",
      url: queryUrl,
      success: function(data) {
      		$('#processing-modal').modal('hide');
            document.getElementById("textArea").value = data;
        }
    });
};

function json2ntriples(index){
	var savedItems = JSON.parse(localStorage.getItem("savedData"));
    var storeTable = savedItems[index];
    var trip = storeTable[3];
    searchText = storeTable[4];
    endpointURL = storeTable[5];
    var dbpediaQuery = "select reduced ?s ?p ?o where {?s ?p ?o . ?p ?k ?type . filter ( regex(?o, \"" + searchText +"\", \"i\") && (?type = owl:DatatypeProperty || ?type = rdf:Property))} LIMIT 1000";
    var dbpediaQueryUrl = endpointURL + "?default-graph-uri=http%3A%2F%2Fdbpedia.org&query="+$.URLEncode(dbpediaQuery)+"&format=n3&timeout=30000&debug=on";
    var query = "select reduced ?s ?p ?o where { ?s ?p ?o. filter(regex(?o, \"" + searchText +"\", \"i\"))} LIMIT 1000";
    
    if(endpointURL.indexOf("http://dbpedia.org/") !== -1) {
        var queryUrl = dbpediaQueryUrl;
    }
    else {
        var queryUrl = endpointURL + "?default-graph-uri=&query="+$.URLEncode(query)+"&format=n3&timeout=30000&debug=on";
    }
    $('#processing-modal').modal('show');
    // show the loading message.

    $.ajax({
      dataType: "text",
      url: queryUrl,
      success: function(data) {
      		$('#processing-modal').modal('hide');
            document.getElementById("textArea").value = data;
        }
    });
};