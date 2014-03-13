 //<![CDATA[

$(document).ready(function(){
	
	$("#execSearch").click(function(event){
		var searchText = document.getElementById("query").value;
		var endpointURL = document.getElementById("endpoint").value;
		//clear datatable
		$("#clear").click();
		executeQuery(searchText, endpointURL);
	});
	
	$("#clear").click(function(event){
		var ex = document.getElementById("results");
		if ( $.fn.DataTable.fnIsDataTable( ex ) ) {
			$(ex).dataTable().fnClearTable();
			mytable = $('#results').DataTable();
			mytable.destroy();
		}
		document.getElementById("limitedRes").innerHTML = "";
 		document.getElementById("resDescription").innerHTML = "";
 		document.getElementById("limitedRes").innerHTML = "";
 	});

	$("#execMore").click(function(event){
		var searchText = document.getElementById("query").value;
		var endpointURL = document.getElementById("endpoint").value;
		//clear datatable
		$("#clear").click();
		executeMoreQuery(searchText, endpointURL);
	});

	$("#clearSaved").click(function(event){
		localStorage.clear();
	});
	
	$("#checkES").click(function(event){
      var url = document.getElementById("endpoint").value;
      $.ajax(url,
      {
        error:function (xhr, ajaxOptions, thrownError){
          alert(xhr.status);
		  document.getElementById("statusOutput").innerHTML = "As of " + (new Date()).toLocaleString() + ", the server status code is " + xhr.status;
           switch (xhr.status) {
              case 404:
                    // Desired Action.
            }
		},
 
        complete: function(xhr, statusText){
           alert(xhr.status);
		   document.getElementById("statusOutput").innerHTML = "As of " + (new Date()).toLocaleString() + ", the server status code is " + xhr.status;
        }
      });
	});
});

function convert(data, searchText){
	var headerVars = data.head.vars;
	var bindings = data.results.bindings;
	var converteData = []
	for(rowIdx in bindings){
		var newRow = bindings[rowIdx];
		var res = [];
		for(var i in headerVars){
			// ch is one of the chars s,p,o
			var ch = headerVars[i];
			//content of table cell
			var sValue = newRow[ch]["value"];
			var sub = sValue.substring(0,7);
			if(sub=="http://"){
				var nsValue='<a href="#describe<'+ sValue +'>" id ="'+ sValue+'" onclick = "cellValue(\'' + sValue + '\')">' + sValue + '</a>'+ 
				'     <a href="' + sValue + '" target="_blank" ><img src="img/link.png"/></a>';
			}
			else{
				var nsValue = longTextFormater(sValue, searchText);
			}
			res.push(nsValue);
		}
		converteData.push(res);
	} 
	return converteData;
}

function cellValue(cellId){
	var cellContent = document.getElementById("" + cellId +"").innerHTML;
	var endpointURL = document.getElementById("endpoint").value;
	var cellQuery = "describe <"+cellContent+">";
	var queryUrl = endpointURL + "?default-graph-uri=&query="+$.URLEncode(cellQuery)+"&format=json&timeout=30000&debug=on";
	
	//clear datatable
	$("#clear").click();
	
	$('#loadingmessage').show();  // show the loading message. 
	$.ajax({
	  dataType: "jsonp",
	  url: queryUrl,
	  success: function(data) {    
			conData = convert(data);
			var datatable = $('#results').dataTable({
				
				"aaData": conData,
				"aoColumns": [
				  { "sTitle": "Entity" },
				  { "sTitle": "Relation" },
				  { "sTitle": "Value" }
				],
				"aoColumnDefs": [
			      { "bVisible": false, "aTargets": [ 0 ] }
			    ]
			});
			
			$('#loadingmessage').hide();  // hide the loading message.
			document.getElementById("resDescription").innerHTML = 'About:  ' + cellContent;
			document.getElementById("saveForm").style.visibility="hidden";
		}
	});
}

function longTextFormater(text, searchText){
	var searchText = document.getElementById("query").value;
	var reg = new RegExp(searchText,"i");
	var replacement = "<b>" + searchText + "</b>";
	var replaced = text.replace(reg, replacement);
	var index = replaced.indexOf(searchText);
	if(index != -1){
		if(replaced.length > 120) {
			var result = "..." + replaced.substr(index-10, 120)+"...";
		}
		else {
			var result = replaced;
		}
	}
	else {
		var result = text;
	}
	return result;
}

function showRelations() {
	//document.getElementById("saveRes").innerHTML = "";
	document.getElementById("saveForm").style.visibility="hidden";
	var oTable = $('#results').dataTable(); 
    var bVis = oTable.fnSettings().aoColumns[0].bVisible;
    var bVis = oTable.fnSettings().aoColumns[2].bVisible;
    oTable.fnSetColumnVis( 0, bVis ? false : true );
    oTable.fnSetColumnVis( 2, bVis ? false : true );
    document.getElementById("saveForm").style.visibility="hidden";
}

function getAllRes(){
	var searchText = document.getElementById("query").value;
	var endpointURL = document.getElementById("endpoint").value;
	//clear datatable
	$("#clear").click();
	executeMoreQuery(searchText, endpointURL);
}

function getTableHeaders(headerVars) {
	var trHeaders = $("<tr></tr>");
	for(var i in headerVars) {
		trHeaders.append( $("<th bgcolor= '#FFFFFF'>" + headerVars[i] + "</th>") );
	}
	return trHeaders;
}

function getTableRow(headerVars, rowData) {
	var tr = $("<tr></tr>");
	for(var i in headerVars) {
		tr.append(getTableCell(headerVars[i], rowData));
	}
	return tr;
}

function getTableCell(fieldName, rowData) {
	var td = $("<td bgcolor= '#FFFFFF'></td>");
	var fieldData = rowData[fieldName];
	var sub = fieldData["value"].substring(0,7);
	//if(sub.indexOf("http://") !== -1){
	if(sub=="http://"){
		//td.html('<a href="' + fieldData["value"] + '">' + fieldData["value"] + '</a>');
		td.html('<a href="#">' + fieldData["value"] + '</a>'+ '     <a href="' + fieldData["value"] + '" target="_blank" ><img src="img/link.png"/></a>');
	}
	else{
		td.html(fieldData["value"]);
	}
	return td;
}

            
  //]]>