'use strict';

const fs = require('fs'),
			https = require('https');

let fetcher;

if (typeof fetch === 'undefined') {
	fetcher = require('node-fetch');
} else {
	fetcher = fetch;
}

class Dymo {
	constructor(options) {
		options = options || {};

		this.hostname = options.hostname || '127.0.0.1';
		this.port = options.port || 41951;
		this.printerName = options.printerName;

		let caContents = fs.readFileSync('ca.pem');
		this.agentOptions = new https.Agent({
			ca: caContents
		})
	}

	get apiUrl() {
		return `https://${this.hostname}:${this.port}/DYMO/DLS/Printing`;
	}

	print(printerName, labelXml) {
		let label = `printerName=${encodeURIComponent(printerName)}&printParamsXml=&labelXml=${encodeURIComponent(labelXml)}&labelSetXml=`;

    return fetcher(`${this.apiUrl}/PrintLabel`,
			{
				method: 'POST',
				body: label,
				headers: {
				  'Content-Type': 'application/x-www-form-urlencoded'
        },
				agent: this.agentOptions
			})
		.then((response) => response.text())
		.then((result) => result);
	}

	getPrinters() {
		return fetcher(`${this.apiUrl}/GetPrinters`, { agent: this.agentOptions })
			.then((response) => response.text());
	}
}

if (typeof module !== 'undefined' && module.exports) {
	module.exports = Dymo;
} else {
	window.Dymo = Dymo;
}
