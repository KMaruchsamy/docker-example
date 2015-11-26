function messageHandler(e) {
	console.log('message : ' + e.data);
	postMessage('resturned data : ' + e.data);
}

function logMessage(message) {
	var xmlHttp;
	if (XMLHttpRequest)
		xmlHttp = new XMLHttpRequest();
	else
		xmlHttp = new ActiveXObject('Microsoft.XMLHTTP');

	xmlHttp.onreadystatechange = function () {
        if (xmlHttp.readyState == 4 && xmlHttp.status == 200) {
            postMessage(xmlHttp.responseText);
        }
    }
	xmlHttp.open("POST", "/loggingApi");
	xmlHttp.setRequestHeader('Content-Type', 'application/json');
    xmlHttp.send(message);
}



addEventListener('message', messageHandler, true);