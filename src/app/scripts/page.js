export class Page {
	constructor() {
	}

	onerror(errorMsg, url, lineNumber) {
        console.log('Error: ' + errorMsg + ' Script: ' + url + ' Line: ' + lineNumber);
    }
}