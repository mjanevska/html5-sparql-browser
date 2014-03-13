$(document).ready(function(){
	
	var savedItems = JSON.parse(localStorage.getItem("savedData"));
	if(savedItems === null) { document.getElementById("newPage").innerHTML = "No saved results";}
	else { drawSavedData(savedItems); }

	$("#download").click(function() {
    var json = localStorage.getItem("JSONdata");
   // var json = CSV2JSON(csv);
    window.open("data:text/json;charset=utf-8," + escape(json))
	});

});

function drawSavedData(savedItems){

	for (var i = 0; i < savedItems.length; i++) {
		var storeTable = savedItems[i];

		var table = '<table border="1" id="'+i+'">';
		table+='<tr style="background-color:#AFAFCC;"><th>Mnemonical name</th><td colspan="2">'+storeTable[0]+'</td></tr>';
		table+='<tr style="background-color:#AFAFCC;"><th>Graph name</th><td colspan="2">'+storeTable[1]+'</td></tr>';
		table+='<tr style="background-color:#AFAFCC;"><th>Description</th><td colspan="2">'+storeTable[2]+'</td></tr>';
		table+='<tr style="background-color:#DBDBFF;"><th>Entity</th><th>Relation</th><th>Value</td></tr>';

		var triples = storeTable[3];
		for(y in triples){
			if(y <= 9){
				var last = triples[y][2];
				table+='<tr style="background-color:#DBDBFF;"><td>'+triples[y][0]+'</td><td>'+triples[y][1]+'</td><td>'+ last.substring(0,170) +'</td></tr>';
			}
		}
		table+='<tr style="background-color:#DBDBFF;"><td colspan="3"><button onclick="getTableDetails(\'' + i + '\')">Details</button>';
		table+='<button onclick="getCleanRefresh(\'' + i + '\')">Clean Refresh</button><button onclick="deleteTable(\'' + i + '\')">Delete</button></td></tr>';
		table +='</table><br>';
		$('#newPage').append(table);
		document.getElementById("formatData").style.visibility = "hidden";
	}
};

function getTableDetails(index){
	var savedItems = JSON.parse(localStorage.getItem("savedData"));
	var storeTable = savedItems[index];
	var table = '<table border="1" id="'+index+'">';
	table+='<tr style="background-color:#AFAFCC;"><th>Mnemonical name</th><td colspan="2">'+storeTable[0]+'</td><td id="0"><img src="img/edit.png" class="btnEditHeader"/></td></tr>';
	table+='<tr style="background-color:#AFAFCC;"><th>Graph name</th><td colspan="2">'+storeTable[1]+'</td><td id="1"><img src="img/edit.png" class="btnEditHeader"/></td></tr>';
	table+='<tr style="background-color:#AFAFCC;"><th>Description</th><td colspan="2">'+storeTable[2]+'</td><td id="2"><img src="img/edit.png" class="btnEditHeader"/></td></tr>';
	table+='<tr style="background-color:#DBDBFF;"><th>Entity</th><th>Relation</th><th colspan="2" >Value</td></tr>';
	//komentirano denes>>>>>
	var triples = storeTable[3];
	for(y in triples){
		var valueOftriple = removeTags(triples[y][2]);
		table+='<tr id="'+y+'" style="background-color:#DBDBFF;"><td>'+triples[y][0]+'  </td><td>'+triples[y][1]+'</td><td>'+valueOftriple+'</td><td><img src="img/edit.png" class="btnEdit"/><img src="img/delete.png" class="btnDelete"/></td></tr>';
	}
	table+='<tr style="background-color:#DBDBFF;"><td colspan="4"><button onclick = "goBack()">Back</button><button id="showFormatData" onclick="showFormatData('+index+')">Show</button>';
	table+='<select id="formats"><option value = "1">JSON</option><option value = "2">XML</option><option value = "2">JTriples</option><option value = "3">CSV</option><option value = "4">TSV</option></select></td></tr>';
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
	var result = confirm("Delete the table?");
	if (result==true) {
		var savedItems = JSON.parse(localStorage.getItem("savedData"));
		savedItems.splice(index,1);
		localStorage.setItem("savedData", JSON.stringify(savedItems));
	}
	goBack();
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
    
    $('#loadingmessage').show();  // show the loading message.

    $.ajax({
      dataType: "jsonp",
      url: queryUrl,
      success: function(data) {

            var sTriples = formatSaveData(data);
            storeTable[3] = sTriples;
            storeTable[6] = data;
            savedItems[index] = storeTable;
            localStorage.setItem("savedData", JSON.stringify(savedItems));
            $('#loadingmessage').hide();
            goBack();  // hide the loading message.
            alert("Data successfully refreshed");
        }
    });
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
 	else if(choice === "JTriples"){
 		//JSON2JT returns array
 		var resJTriples = JSON2JT(json);
 		document.getElementById("textArea").value = JSON.stringify(resJTriples);
 	}
 	else if(choice === "XML"){
 		//JSON2JT returns array
 		var resJTriples = JSON2XML(JSON.parse(json),'\n');
 		document.getElementById("textArea").value = resJTriples;
 	}
 	else {
 		document.getElementById("textArea").value = "Test";
 	}
}

function JSON2CSV(jsonStrObj){
	var jsonArr = formatSaveData(JSON.parse(jsonStrObj));
	var resCSV = '"s","p","o"' + '\n';
	for(var i=0; i<jsonArr.length; i++){
		resCSV+= '"'+jsonArr[i][0] + '","' + jsonArr[i][1] + '","' +jsonArr[i][2] + '"\n';
	}
	return resCSV;
};

function JSON2JT(jsonStrObj){
	var jsonArr = formatSaveData(JSON.parse(jsonStrObj));
	var resJTriples = [];
	for(var i=0; i<jsonArr.length; i++){
		var newItem = {};
		newItem["s"] = jsonArr[i][0];
		newItem["p"] = jsonArr[i][1];
		newItem["o"] = jsonArr[i][2];
		resJTriples.push(newItem);
	}
	return resJTriples;
};

function JSON2XML(o, tab) {
   var toXml = function(v, name, ind) {
      var xml = "";
      if (v instanceof Array) {
         for (var i=0, n=v.length; i<n; i++)
            xml += ind + toXml(v[i], name, ind+"\t") + "\n";
      }
      else if (typeof(v) == "object") {
         var hasChild = false;
         xml += ind + "<" + name;
         for (var m in v) {
            if (m.charAt(0) == "@")
               xml += " " + m.substr(1) + "=\"" + v[m].toString() + "\"";
            else
               hasChild = true;
         }
         xml += hasChild ? ">" : "/>";
         if (hasChild) {
            for (var m in v) {
               if (m == "#text")
                  xml += v[m];
               else if (m == "#cdata")
                  xml += "<![CDATA[" + v[m] + "]]>";
               else if (m.charAt(0) != "@")
                   xml += toXml(v[m], m, ind+"\t");
            }
            xml += (xml.charAt(xml.length-1)=="\n"?ind:"") + "</" + name + ">";
         }
      }
      else {
         xml += ind + "<" + name + ">" + v.toString() +  "</" + name + ">";
      }
      return xml;
   }, xml="";
   for (var m in o)
      xml += toXml(o[m], m, "");
  	//return tab ? xml.replace(/\t/g, tab) : xml.replace(/\t|\n/g, "");
   return tab ? xml.replace(/\t\t\t/g, tab) : xml.replace(/\t|\n/g, "");
}