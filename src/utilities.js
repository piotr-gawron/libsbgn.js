var ns = {};
var xml2js = require('xml2js');

/*
	guarantees to return an object with given args being set to null if not present, other args returned as is
*/
ns.checkParams = function (params, names) {
	if (typeof params == "undefined" || params == null) {
		params = {};
	}
	if (typeof params != 'object') {
		throw new Error("Bad params. Object with named parameters must be passed.");
	}
	for(var i=0; i < names.length; i++) {
		var argName = names[i];
		if (typeof params[argName] == 'undefined') {
			params[argName] = null;
		}
	}
	return params;
}

ns.getFirstLevelByName = function (xmlObj, localName) {
	var result = [];
	for(var i=0; i<xmlObj.childNodes.length; i++) {
		var child = xmlObj.childNodes[i];
		if (child.localName && child.localName == localName) {
			result.push(child);
		}
	}
	return result;
};

ns.addAttributes = function (jsObj, attributes) {
	jsObj.$ = attributes;
};

ns.parseString = function (string, fn) {
	var parser = new xml2js.Parser({
		tagNameProcessors: [xml2js.processors.stripPrefix],
		attrValueProcessors: [xml2js.processors.parseNumbers, xml2js.processors.parseBooleans]
	});
	parser.parseString(string, fn);
};

ns.parseStringKeepPrefix = function (string, fn) {
	var parser = new xml2js.Parser({
		attrValueProcessors: [xml2js.processors.parseNumbers, xml2js.processors.parseBooleans]
	});
	parser.parseString(string, fn);
};

ns.buildString = function (obj) {
	return new xml2js.Builder({
		headless: true,
		renderOpts: {pretty: false}
	}).buildObject(obj);
};

module.exports = ns;