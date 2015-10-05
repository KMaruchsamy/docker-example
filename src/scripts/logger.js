export class Logger {
	constructor() {
		this.worker = this.getWorker();
	}
	messageHandler(e) {
		console.log('messageHandler : ' + e.data);
	}

	errorHandler(e) {
		console.log('errorHandler : ' + e.message);
	}

	getWorker() {
		let _worker = null;
		_worker = new Worker("../lib/logging-worker.js");
		_worker.onmessage = this.messageHandler;
		_worker.onerror = this.errorHandler;
		return _worker;
	}

	terminate() {
		this.worker.terminate();
		console.log('terminate');
	}

	log(args) {
		if (window.Worker) {
			console.log('inside');
			this.worker.postMessage(args);
		}
		else {
			//Normal ajax call ..
		}
	}


	logError(args) { }
	logGroup() { }
	logGroupEnd() { };

}