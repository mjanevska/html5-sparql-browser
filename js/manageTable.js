function EditHeader(){
    var par = $(this).parent().parent(); //tr
    var tdText = par.children("td:nth-child(2)");
    var tdButtons = par.children("td:nth-child(3)");
    tdText.html("<input type='text' value='"+tdText.html()+"'/>");
    tdButtons.html("<img src='img/save.png' class='btnSaveHeader'/><img src='img/cancel.png' alt='Cancel' class='btnCancelHeader'/>");
 
    $(".btnSaveHeader").bind("click", SaveHeader);
    $(".btnEditHeader").bind("click", EditHeader);
    $(".btnCancelHeader").bind("click", CancelHeader);
};

function SaveHeader(){
	tableID = $(this).closest('table').attr('id');
	tdID = $(this).closest('td').attr('id');
	var savedItems = JSON.parse(localStorage.getItem("savedData"));
	var storeTable = savedItems[tableID];
    var par = $(this).parent().parent(); //tr
   
    var tdText = par.children("td:nth-child(2)");
    var tdButtons = par.children("td:nth-child(3)");
    var cell = tdText.children("input[type=text]").val();
    tdText.html(cell);
    tdButtons.html("<img src='img/edit.png' class='btnEditHeader'/>");
 
 	storeTable[tdID] = cell.toString();
 	savedItems[tableID]=storeTable;
 	localStorage.setItem("savedData", JSON.stringify(savedItems));
    $(".btnEditHeader").bind("click", EditHeader);
};

function CancelHeader(){
    tableID = $(this).closest('table').attr('id');
    getTableDetails(tableID);
};

function Edit(){
    var par = $(this).parent().parent(); //tr
    var tdEntity = par.children("td:nth-child(1)");
    var tdRelation = par.children("td:nth-child(2)");
    var tdValue = par.children("td:nth-child(3)");
    var tdButtons = par.children("td:nth-child(4)");

    var oldValues = [];
    oldValues.push(tdEntity.html());
    oldValues.push(tdRelation.html());
    oldValues.push(tdValue.html());
    localStorage.setItem("oldValues", JSON.stringify(oldValues));
 
    tdEntity.html("<input size='50' type='text' value='"+tdEntity.html()+"'/>");
    tdRelation.html("<input size='50' type='text' value='"+tdRelation.html()+"'/>");
    tdValue.html("<input size='60' type='text' value='"+tdValue.html()+"'/>");
    tdButtons.html("<img src='img/save.png' class='btnSave'/><img src='img/cancel.png' class='btnCancelHeader'/>");

    $(".btnSave").bind("click", Save);
    $(".btnEdit").bind("click", Edit);
    $(".btnCancelHeader").bind("click", CancelHeader);
};

function Save(){

    tableID = $(this).closest('table').attr('id');
    var oldValues = JSON.parse(localStorage.getItem("oldValues"));
    var savedItems = JSON.parse(localStorage.getItem("savedData"));
    var storeTable = savedItems[tableID];
    var trip = storeTable[3];
    var st = ArrtoTstore(trip);

    var par = $(this).parent().parent(); //tr
    var tdEntity = par.children("td:nth-child(1)");
    var tdRelation = par.children("td:nth-child(2)");
    var tdValue = par.children("td:nth-child(3)");
    var tdButtons = par.children("td:nth-child(4)");
 
    var en = tdEntity.children("input[type=text]").val();
    var re = tdRelation.children("input[type=text]").val();
    var va = tdValue.children("input[type=text]").val();

    tdEntity.html(en);
    tdRelation.html(re);
    tdValue.html(va);
    tdButtons.html("<img src='img/edit.png' class='btnEdit'/>");

    st.set(en, oldValues[1], oldValues[2]);
    st.set(en, re, oldValues[2]);
    st.set(en, re, va);
 
    trip = TstoretoArr(st);
    storeTable[3]=trip;
    savedItems[tableID] = storeTable;
    localStorage.setItem("savedData", JSON.stringify(savedItems));

    getTableDetails(tableID);

    $(".btnEdit").bind("click", Edit);
};

function Delete(){
    var tableID = $(this).closest('table').attr('id');
    $('#mydelModal').modal('show');
    $('#mydelModal button.btn-primary').click(function(){
        $('#mydelModal').modal('hide');
        var trID = $(this).closest('tr').attr('id');
        var savedItems = JSON.parse(localStorage.getItem("savedData"));
        var storeTable = savedItems[tableID];
        var trip = storeTable[3];

        trip.splice(trID,1);
        storeTable[3]=trip;
        savedItems[tableID] = storeTable;
        localStorage.setItem("savedData", JSON.stringify(savedItems));

        getTableDetails(tableID);

        $(".btnEdit").bind("click", Edit);
    });
}

function ArrtoTstore(mArray){
    var st = new Triplestore();
    st.remove();
    for(t in mArray){
        var triple = mArray[t];
        st.add(triple[0], triple[1], triple[2]);
    }
    return st;
}

function TstoretoArr(st){
    var subjects = st.getSubjects();
    var mArray = [];
    for(var i = 0; i < subjects.length; i++) {
        var arrItem = [];
        var subject = subjects[i];
        var proj = st.getProjection(subject);
        var properties = proj.getProperties(); 

        for(var j = 0; j < properties.length; j++) {
            var property = properties[j];
            var value = proj.getAll(property);

            for(var k = 0; k < value.length; k++){
                var val = value[k];
                arrItem.push(subject);
                arrItem.push(property);
                arrItem.push(val);
                mArray.push(arrItem);
                arrItem = [];
            }
        }
    }
    return mArray;
}

