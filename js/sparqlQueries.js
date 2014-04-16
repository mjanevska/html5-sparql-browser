function executeQuery(searchText, endpointURL) {
	var dbpediaQuery = "select reduced ?s ?p ?o where {?s ?p ?o . ?p ?k ?type . filter ( regex(?o, \"" + searchText +"\", \"i\") && (?type = owl:DatatypeProperty || ?type = rdf:Property))} LIMIT 1000";
	var dbpediaQueryUrl = endpointURL + "?default-graph-uri=http%3A%2F%2Fdbpedia.org&query="+$.URLEncode(dbpediaQuery)+"&format=json&timeout=30000&debug=on";
	var query = "select reduced ?s ?p ?o where { ?s ?p ?o. filter(regex(?o, \"" + searchText +"\", \"i\"))} LIMIT 1000";
	
	if(endpointURL.indexOf("http://dbpedia.org/") !== -1) {
		var queryUrl = dbpediaQueryUrl;
	}
	else {
		var queryUrl = endpointURL + "?default-graph-uri=&query="+$.URLEncode(query)+"&format=json&timeout=30000&debug=on";
	}
	
	// show the loading message.
	$('#processing-modal').modal('show');
	$.ajax({
	  dataType: "jsonp",
	  url: queryUrl,
	  success: function(data) {

			var sTriples = formatSaveData(data);
			var queryData = [];
			queryData.push(sTriples);
			queryData.push(searchText);
			queryData.push(endpointURL);
			queryData.push(JSON.stringify(data));
			localStorage.setItem("ajaxData", JSON.stringify(queryData));

			//convert data has parameter data and searchText for formatting long text
			//converts data for showing in dataTable
			conData = convert(data, searchText);
			$('#results').dataTable({
				
				"aaData": conData,
				"aoColumns": [
				  { "sTitle": "Entity" },
				  { "sTitle": "Relation" },
				  { "sTitle": "Value" }
				]
			});
			// hide the loading message.
			$('#processing-modal').modal('hide');
			document.getElementById("saveForm").style.visibility="visible";
		}
	});
 	document.getElementById("limitedRes").innerHTML = "Displaying limited results (max 1000)" + '<button onclick = "getAllRes()" class="btn btn-primary" title="May be slow...">Get all results</button>';
 	document.getElementById("resDescription").innerHTML = 'Entities that have ' + '<a href="#relations" onclick = "showRelations()"> any Relation </a>'+ ' with Value <b>"'+ searchText +'"</b>';
}

function executeMoreQuery(searchText, endpointURL) {

	var dbpediaQuery = "select reduced ?s ?p ?o where {?s ?p ?o . ?p ?k ?type . filter ( regex(?o, \"" + searchText +"\", \"i\") && (?type = owl:DatatypeProperty || ?type = rdf:Property))}";
	var dbpediaQueryUrl = endpointURL + "?default-graph-uri=http%3A%2F%2Fdbpedia.org&query="+$.URLEncode(dbpediaQuery)+"&format=json&timeout=3000000&debug=on";
	var query = "select reduced ?s ?p ?o where { ?s ?p ?o. filter(regex(?o, \"" + searchText +"\", \"i\"))}";
	
	if(endpointURL.indexOf("http://dbpedia.org/") !== -1) {
		var queryUrl = dbpediaQueryUrl;
	}
	else {
		var queryUrl = endpointURL + "?default-graph-uri=&query="+$.URLEncode(query)+"&format=json&timeout=30000&debug=on";
	}
	
	$('#processing-modal').modal('show');  // show the loading message.
	$.ajax({
	  dataType: "jsonp",
	  url: queryUrl,
	  success: function(data) {    

			var sTriples = formatSaveData(data);
			var queryData = [];
			queryData.push(sTriples);
			queryData.push(searchText);
			queryData.push(endpointURL);
			queryData.push(JSON.stringify(data));
			localStorage.setItem("ajaxData", JSON.stringify(queryData));

			//convert data has parameter data and searchText for formatting long text
			//converts data for showing in dataTable
			conData = convert(data, searchText);

			$('#results').dataTable({
				
				"aaData": conData,
				"aoColumns": [
				  { "sTitle": "Entity" },
				  { "sTitle": "Relation" },
				  { "sTitle": "Value" }
				]
			});
			
			$('#processing-modal').modal('hide'); // hide the loading message.
		}
	});
	document.getElementById("saveForm").style.visibility="visible";
 	document.getElementById("limitedRes").innerHTML = "Displaying all results.";
 	document.getElementById("resDescription").innerHTML = 'Entities that have ' + '<a href="#relations" onclick = "showRelations()"> any Relation </a>'+ ' with Value <b>"'+ searchText +'"</b>';
}