export class Page {
	constructor() {
		console.log('Super class');
	}

	onerror(errorMsg, url, lineNumber) {
        console.log('Error: ' + errorMsg + ' Script: ' + url + ' Line: ' + lineNumber);
    }
}