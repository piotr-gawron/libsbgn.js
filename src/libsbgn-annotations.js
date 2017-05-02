var checkParams = require('./utilities').checkParams;
var $rdf = require('rdflib');
var xmldom = require('xmldom');
var N3 = require('n3');

var ns = {};

/*
	EXAMPLE:

	<rdf:RDF 
		xmlns:rdf="http://www.w3.org/1999/02/22-rdf-syntax-ns#"
	    xmlns:bqmodel="http://biomodels.net/model-qualifiers/"
	    xmlns:bqbiol="http://biomodels.net/biology-qualifiers/"
	    xmlns:eisbm="http://www.eisbm.org/rdf-annotation-newt/">
		<rdf:Description rdf:about="#_000001">
			<bqmodel:is>
				<rdf:Bag>
					<rdf:li rdf:resource="http://identifiers.org/biomodels.db/BIOMD0000000004" />
				</rdf:Bag>
			</bqmodel:is>

			<bqmodel:isDescribedBy>
				<rdf:Bag>
					<rdf:li rdf:resource="http://identifiers.org/pubmed/1833774" />
				</rdf:Bag>
			</bqmodel:isDescribedBy>

			<eisbm:hasProperty>
				<rdf:Bag>
					<eisbm:item eisbm:key="data" eisbm:value="42" />
					<eisbm:item eisbm:key="data2" eisbm:value="1.23" />
				</rdf:Bag>
			</eisbm:hasProperty>

		</rdf:Description>
	</rdf:RDF> 


*/

//ns.xmlns = "http://www.sbml.org/sbml/level3/version1/render/version1";

// ------- ANNOTATION -------
/**
 * Represents the <code>&lt;annotation&gt;</code> element.
 * @class
 */
var Annotation = function (params) {
	var params = checkParams(params, []);
	this.rdfElements = [];
};

/**
 * @param {RdfElement} rdfAnnotation
 */
Annotation.prototype.addRDF = function(rdfAnnotation) {
	this.rdfElements.push(rdfAnnotation);
};

/**
 * @return {Element}
 */
Annotation.prototype.buildXmlObj = function () {
	var annotation = new xmldom.DOMImplementation().createDocument().createElement('annotation');
	for (var i=0; i<this.rdfElements.length; i++) {
		var rdf = this.rdfElements[i];
		//console.log(rdf.toXML());

	}
	return annotation;
};

/**
 * @return {string}
 */
Annotation.prototype.toXML = function() {
	return new xmldom.XMLSerializer().serializeToString(this.buildXmlObj());
};

/**
 * @param {Element} xml
 * @return {Annotation}
 */
Annotation.fromXML = function (xml) {
	if (xml.tagName != 'annotation') {
		throw new Error("Bad XML provided, expected tagName annotation, got: " + xml.tagName);
	}
	var annotation = new ns.Annotation();

	var rdfs = xml.getElementsByTagName('rdf:RDF');
	for (var i=0; i<rdfs.length; i++) {
		var rdfXML = rdfs[i];
		// parse rdf
		var rdf = ns.RdfElement.fromXML(rdfXML);
		annotation.addRDF(rdf);
	}

	return annotation;
};
ns.Annotation = Annotation;
// ------- END ANNOTATION -------

// ------- RDFELEMENT -------
/**
 * Represents the <code>&lt;rdf&gt;</code> element.
 * @class
 */
var RdfElement = function (params) {
	var params = checkParams(params, ['graph']);
	this.graph = params.graph;
};

RdfElement.uri = 'http://www.eisbm.org/';
RdfElement.prefixes = {	rdf: "http://www.w3.org/1999/02/22-rdf-syntax-ns#",
					    bqmodel: "http://biomodels.net/model-qualifiers/",
					    bqbiol: "http://biomodels.net/biology-qualifiers/",
					    sio: "http://semanticscience.org/resource/",
					    eisbm: "http://www.eisbm.org/"};

/**
 * @return {Element}
 */
RdfElement.prototype.buildXmlObj = function () {

};

/**
 * @return {string}
 */
RdfElement.prototype.toXML = function() {
	/*
		Add some functions to the writer object of N3
		Those functions will allow us to serialize triples synchronously.
		Without it, we would be forced to use the asynchronous functions.
	*/
	function addSimpleWrite (writer) {
		// replicates the writer._write function but returns a string
		writer.simpleWriteTriple = function (subject, predicate, object, graph) {
			return this._encodeIriOrBlankNode(subject) + ' ' +
                  this._encodeIriOrBlankNode(predicate) + ' ' +
                  this._encodeObject(object) +
			(graph ? ' ' + this._encodeIriOrBlankNode(graph) + '.\n' : '.\n')
		};
		// allows to provide an array of triples and concatenate their serialized strings
		writer.simpleWriteTriples = function (array) {
			var stringN3 = '';
			for (var i=0; i<array.length; i++) {
				var triple = array[i];
				stringN3 += this.simpleWriteTriple(triple.subject, triple.predicate, triple.object, triple.graph);
			}
			return stringN3;
		};
	}

	// serialize the stored graph to N3
	var writer = N3.Writer({ prefixes: RdfElement.prefixes, format: 'N-Triples' });
	addSimpleWrite(writer); // add our custom methods to the writer
	var stringN3 = writer.simpleWriteTriples(this.graph.getTriples()); // use custom method to serialize triples

	// read N3 format
	var graph = $rdf.graph();
	try {
	    $rdf.parse(stringN3, graph, RdfElement.uri, 'text/n3');
	} catch (err) {
	    console.log(err);
	}
	/*
		The namespace prefixes are lost in the n3 format, so rdflib will guess them on its own.
		The result gives weird wrong prefixes. Here we provide the original names. Aesthetic purpose only.
	*/
	graph.namespaces = RdfElement.prefixes;

	/*
		serialize to RDF+XML 
		problem, the output differs from the original XML. rdflib expands collections like Bag, and 
		elements with only atributes. It also makes things less readable.
		We need to replace several things to keep output the same as input. 
	*/
	var serialize = $rdf.serialize($rdf.sym(RdfElement.uri), graph, undefined, 'application/rdf+xml');

	function replaceLi(string) {
		var regexpLi = /<rdf:li( rdf:parseType="Resource")?>[\s\S]*?<(\w+):SIO_000116>([\s\S]*?)<\/\2:SIO_000116>[\s\S]*?<rdf:value>([\s\S]*?)<\/rdf:value>[\s\S]*?<\/rdf:li>/g;
		var result = string.replace(regexpLi, '<rdf:li $2:SIO_000116="$3" rdf:value="$4"/>');
		return result;
	}

	function replaceBag(string) {
		// regexp will spot a transformed bag and capture its content
		var regexpBag = /(<rdf:Description>([\s\S]*?)<rdf:type rdf:resource="http:\/\/www\.w3\.org\/1999\/02\/22-rdf-syntax-ns#Bag"\/>[\s\S]*?<\/rdf:Description>)/g;
		var result1 = string.replace(regexpBag, '<rdf:Bag>$2</rdf:Bag>');
		var result2 = result1.replace(/    <\/rdf:Bag>/g, '</rdf:Bag>');
		return result2;
	}

	function replaceParseType(string) {
		var regexp = / rdf:parseType="Resource"/g;
		return string.replace(regexp, '');
	}
	
	var result = replaceParseType(replaceLi(replaceBag(serialize)));
	
	return result;
};

RdfElement.prototype.test = function() {
	//console.log(this.graph);
	var RDF = $rdf.Namespace("http://www.w3.org/1999/02/22-rdf-syntax-ns#");
	var BQMODEL = $rdf.Namespace("http://biomodels.net/model-qualifiers/");
	var BQBIOL = $rdf.Namespace("http://biomodels.net/biology-qualifiers/");
	var SIO = $rdf.Namespace("http://semanticscience.org/resource/");
	
	console.log(this.graph.getTriples("http://local/anID000001", null, null));

}

/**
 * @param {Element} xml
 * @return {RdfElement}
 */
RdfElement.fromXML = function (xml) {
	if (xml.tagName != 'rdf:RDF') {
		throw new Error("Bad XML provided, expected tagName rdf:RDF, got: " + xml.tagName);
	}
	var rdfElement = new RdfElement();
	var graph = $rdf.graph();

	// rdflib only accepts string as input, not xml elements
	var stringXml = new xmldom.XMLSerializer().serializeToString(xml);
	try {
	    $rdf.parse(stringXml, graph, RdfElement.uri, 'application/rdf+xml');
	} catch (err) {
	    console.log(err);
	}
	
	// convert to turtle to feed to N3
	var turtle = $rdf.serialize($rdf.sym(RdfElement.uri), graph, undefined, 'text/turtle');

	var parser = N3.Parser();
	var store = N3.Store();
	store.addTriples(parser.parse(turtle));
	
	rdfElement.graph = store;

	return rdfElement;
};
ns.RdfElement = RdfElement;
// ------- END RDFELEMENT -------

ns.rdflib = $rdf;

module.exports = ns;
