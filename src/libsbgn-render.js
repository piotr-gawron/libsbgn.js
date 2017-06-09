/**
 * This submodule contains the classes to manage the render extension's xml and some utility functions.
 * It adds the ability to save the styles and colors used in an SBGN map, as features like background-color,
 * border thickness or font properties are not part of the SBGN standard.
 *
 * It is loosely based on the {@link http://sbml.org/Documents/Specifications/SBML_Level_3/Packages/render|render extension of the SBML format}.
 * A subset of this specification has been adapted for SBGN-ML integration.
 *
 * See {@link Extension} for more general information on extensions in the SBGN-ML format.
 *
 * You can access the following classes like this: <code>libsbgn.render.ColorDefinition</code>
 *
 * @module libsbgn-render
 * @namespace libsbgn.render
*/

var checkParams = require('./utilities').checkParams;
var xmldom = require('xmldom');

var ns = {};

ns.xmlns = "http://www.sbml.org/sbml/level3/version1/render/version1";

// ------- COLORDEFINITION -------
/**
 * Represents the <code>&lt;colorDefinition&gt;</code> element.
 * @class
 * @param {Object} params
 * @param {string=} params.id
 * @param {string=} params.value
 */
var ColorDefinition = function(params) {
	var params = checkParams(params, ['id', 'value']);
	this.id 	= params.id;
	this.value 	= params.value;
};

/**
 * @return {Element}
 */
ColorDefinition.prototype.buildXmlObj = function () {
	var colorDefinition = new xmldom.DOMImplementation().createDocument().createElement('colorDefinition');
	if (this.id != null) {
		colorDefinition.setAttribute('id', this.id);
	}
	if (this.value != null) {
		colorDefinition.setAttribute('value', this.value);
	}
	return colorDefinition;
};

/**
 * @return {string}
 */
ColorDefinition.prototype.toXML = function () {
	return new xmldom.XMLSerializer().serializeToString(this.buildXmlObj());
};

/**
 * @param {Element} xml
 * @return {ColorDefinition}
 */
ColorDefinition.fromXML = function (xml) {
	if (xml.tagName != 'colorDefinition') {
		throw new Error("Bad XML provided, expected tagName colorDefinition, got: " + xml.tagName);
	}
	var colorDefinition = new ns.ColorDefinition();
	colorDefinition.id 		= xml.getAttribute('id') || null;
	colorDefinition.value 	= xml.getAttribute('value') || null;
	return colorDefinition;
};
ns.ColorDefinition = ColorDefinition;
// ------- END COLORDEFINITION -------

// ------- LISTOFCOLORDEFINITIONS -------
/**
 * Represents the <code>&lt;listOfColorDefinitions&gt;</code> element.
 * @class
 */
var ListOfColorDefinitions = function () {
	this.colorDefinitions = [];
};

/**
 * @param {ColorDefinition} colorDefinition
 */
ListOfColorDefinitions.prototype.addColorDefinition = function (colorDefinition) {
	this.colorDefinitions.push(colorDefinition);
};

/**
 * @return {Element}
 */
ListOfColorDefinitions.prototype.buildXmlObj = function () {
	var listOfColorDefinitions = new xmldom.DOMImplementation().createDocument().createElement('listOfColorDefinitions');
	for(var i=0; i<this.colorDefinitions.length; i++) {
		listOfColorDefinitions.appendChild(this.colorDefinitions[i].buildXmlObj());
	}
	return listOfColorDefinitions;
};

/**
 * @return {string}
 */
ListOfColorDefinitions.prototype.toXML = function () {
	return new xmldom.XMLSerializer().serializeToString(this.buildXmlObj());
};

/**
 * @param {Element} xml
 * @return {ListOfColorDefinitions}
 */
ListOfColorDefinitions.fromXML = function (xml) {
	if (xml.tagName != 'listOfColorDefinitions') {
		throw new Error("Bad XML provided, expected tagName listOfColorDefinitions, got: " + xml.tagName);
	}
	var listOfColorDefinitions = new ns.ListOfColorDefinitions();

	var colorDefinitions = xml.getElementsByTagName('colorDefinition');
	for (var i=0; i<colorDefinitions.length; i++) {
		var colorDefinitionXML = colorDefinitions[i];
		var colorDefinition = ns.ColorDefinition.fromXML(colorDefinitionXML);
		listOfColorDefinitions.addColorDefinition(colorDefinition);
	}
	return listOfColorDefinitions;
};
ns.ListOfColorDefinitions = ListOfColorDefinitions;
// ------- END LISTOFCOLORDEFINITIONS -------

// ------- RENDERGROUP -------
/**
 * Represents the <code>&lt;g&gt;</code> element.
 * @class
 * @param {Object} params
 * @param {string=} params.id
 * @param {string=} params.fontSize
 * @param {string=} params.fontFamily
 * @param {string=} params.fontWeight
 * @param {string=} params.fontStyle
 * @param {string=} params.textAnchor
 * @param {string=} params.vtextAnchor
 * @param {string=} params.fill The element's background color
 * @param {string=} params.stroke Border color for glyphs, line color for arcs.
 * @param {string=} params.strokeWidth
 */
var RenderGroup = function (params) {
	// each of those are optional, so test if it is defined is mandatory
	var params = checkParams(params, ['fontSize', 'fontFamily', 'fontWeight', 
		'fontStyle', 'textAnchor', 'vtextAnchor', 'fill', 'id', 'stroke', 'strokeWidth']);
	// specific to renderGroup
	this.fontSize 		= params.fontSize;
	this.fontFamily 	= params.fontFamily;
	this.fontWeight 	= params.fontWeight;
	this.fontStyle 		= params.fontStyle;
	this.textAnchor 	= params.textAnchor; // probably useless
	this.vtextAnchor 	= params.vtextAnchor; // probably useless
	// from GraphicalPrimitive2D
	this.fill 			= params.fill; // fill color
	// from GraphicalPrimitive1D
	this.id 			= params.id;
	this.stroke 		= params.stroke; // stroke color
	this.strokeWidth 	= params.strokeWidth;
};

/**
 * @return {Element}
 */
RenderGroup.prototype.buildXmlObj = function () {
	var renderGroup = new xmldom.DOMImplementation().createDocument().createElement('g');
	if (this.id != null) {
		renderGroup.setAttribute('id', this.id);
	}
	if (this.fontSize != null) {
		renderGroup.setAttribute('fontSize', this.fontSize);
	}
	if (this.fontFamily != null) {
		renderGroup.setAttribute('fontFamily', this.fontFamily);
	}
	if (this.fontWeight != null) {
		renderGroup.setAttribute('fontWeight', this.fontWeight);
	}
	if (this.fontStyle != null) {
		renderGroup.setAttribute('fontStyle', this.fontStyle);
	}
	if (this.textAnchor != null) {
		renderGroup.setAttribute('textAnchor', this.textAnchor);
	}
	if (this.vtextAnchor != null) {
		renderGroup.setAttribute('vtextAnchor', this.vtextAnchor);
	}
	if (this.stroke != null) {
		renderGroup.setAttribute('stroke', this.stroke);
	}
	if (this.strokeWidth != null) {
		renderGroup.setAttribute('strokeWidth', this.strokeWidth);
	}
	if (this.fill != null) {
		renderGroup.setAttribute('fill', this.fill);
	}
	return renderGroup;
};

/**
 * @return {string}
 */
RenderGroup.prototype.toXML = function () {
	return new xmldom.XMLSerializer().serializeToString(this.buildXmlObj());
};

/**
 * @param {Element} xml
 * @return {RenderGroup}
 */
RenderGroup.fromXML = function (xml) {
	if (xml.tagName != 'g') {
		throw new Error("Bad XML provided, expected tagName g, got: " + xml.tagName);
	}
	var renderGroup = new ns.RenderGroup({});
	renderGroup.id 			= xml.getAttribute('id') || null;
	renderGroup.fontSize 	= xml.getAttribute('fontSize') || null;
	renderGroup.fontFamily 	= xml.getAttribute('fontFamily') || null;
	renderGroup.fontWeight 	= xml.getAttribute('fontWeight') || null;
	renderGroup.fontStyle 	= xml.getAttribute('fontStyle') || null;
	renderGroup.textAnchor 	= xml.getAttribute('textAnchor') || null;
	renderGroup.vtextAnchor = xml.getAttribute('vtextAnchor') || null;
	renderGroup.stroke 		= xml.getAttribute('stroke') || null;
	renderGroup.strokeWidth = xml.getAttribute('strokeWidth') || null;
	renderGroup.fill 		= xml.getAttribute('fill') || null;
	return renderGroup;
};
ns.RenderGroup = RenderGroup;
// ------- END RENDERGROUP -------

// ------- STYLE -------
/**
 * Represents the <code>&lt;style&gt;</code> element.
 * @class
 * @param {Object} params
 * @param {string=} params.id
 * @param {string=} params.name
 * @param {string=} params.idList
 * @param {RenderGroup=} params.renderGroup
 */
var Style = function(params) {
	var params = checkParams(params, ['id', 'name', 'idList', 'renderGroup']);
	this.id 			= params.id;
	this.name 			= params.name;
	this.idList 		= params.idList; // TODO add utility functions to manage this (should be array)
	this.renderGroup 	= params.renderGroup;
};

/**
 * @param {RenderGroup} renderGroup
 */
Style.prototype.setRenderGroup = function (renderGroup) {
	this.renderGroup = renderGroup;
};

/**
 * @return {string[]}
 */
Style.prototype.getIdListAsArray = function () {
	return this.idList.split(' ');
}

/**
 * @param {string[]} idArray
 */
Style.prototype.setIdListFromArray = function (idArray) {
	this.idList = idArray.join(' ');
}

/**
 * @return {Element}
 */
Style.prototype.buildXmlObj = function () {
	var style = new xmldom.DOMImplementation().createDocument().createElement('style');
	if (this.id != null) {
		style.setAttribute('id', this.id);
	}
	if (this.name != null) {
		style.setAttribute('name', this.name);
	}
	if (this.idList != null) {
		style.setAttribute('idList', this.idList);
	}

	if (this.renderGroup) {
		style.appendChild(this.renderGroup.buildXmlObj());
	}
	return style;
};

/**
 * @return {string}
 */
Style.prototype.toXML = function () {
	return new xmldom.XMLSerializer().serializeToString(this.buildXmlObj());
};

/**
 * @param {Element} xml
 * @return {Style}
 */
Style.fromXML = function (xml) {
	if (xml.tagName != 'style') {
		throw new Error("Bad XML provided, expected tagName style, got: " + xml.tagName);
	}
	var style = new ns.Style();
	style.id 		= xml.getAttribute('id') || null;
	style.name 		= xml.getAttribute('name') || null;
	style.idList 	= xml.getAttribute('idList') || null;

	var renderGroupXML = xml.getElementsByTagName('g')[0];
	if (renderGroupXML != null) {
		style.renderGroup = ns.RenderGroup.fromXML(renderGroupXML);
	}
	return style;
};
ns.Style = Style;
// ------- END STYLE -------

// ------- LISTOFSTYLES -------
/**
 * Represents the <code>&lt;listOfStyles&gt;</code> element.
 * @class
 */
var ListOfStyles = function() {
	this.styles = [];
};

/**
 * @param {Style} style
 */
ListOfStyles.prototype.addStyle = function(style) {
	this.styles.push(style);
};

/**
 * @return {Element}
 */
ListOfStyles.prototype.buildXmlObj = function () {
	var listOfStyles = new xmldom.DOMImplementation().createDocument().createElement('listOfStyles');
	for(var i=0; i<this.styles.length; i++) {
		listOfStyles.appendChild(this.styles[i].buildXmlObj());
	}
	return listOfStyles;
};

/**
 * @return {string}
 */
ListOfStyles.prototype.toXML = function () {
	return new xmldom.XMLSerializer().serializeToString(this.buildXmlObj());
};

/**
 * @param {Element} xml
 * @return {ListOfStyles}
 */
ListOfStyles.fromXML = function (xml) {
	if (xml.tagName != 'listOfStyles') {
		throw new Error("Bad XML provided, expected tagName listOfStyles, got: " + xml.tagName);
	}
	var listOfStyles = new ns.ListOfStyles();

	var styles = xml.getElementsByTagName('style');
	for (var i=0; i<styles.length; i++) {
		var styleXML = styles[i];
		var style = ns.Style.fromXML(styleXML);
		listOfStyles.addStyle(style);
	}
	return listOfStyles;
};
ns.ListOfStyles = ListOfStyles;
// ------- END LISTOFSTYLES -------

// ------- RENDERINFORMATION -------
/**
 * Represents the <code>&lt;renderInformation&gt;</code> element.
 * @class
 * @param {Object} params
 * @param {string=} params.id
 * @param {string=} params.name
 * @param {string=} params.programName
 * @param {string=} params.programVersion
 * @param {string=} params.backgroundColor
 * @param {ListOfColorDefinitions=} params.listOfColorDefinitions
 * @param {ListOfStyles=} params.listOfStyles
 */
var RenderInformation = function (params) {
	var params = checkParams(params, ['id', 'name', 'programName', 
		'programVersion', 'backgroundColor', 'listOfColorDefinitions', 'listOfStyles']);
	this.id 					= params.id; // required, rest is optional
	this.name 					= params.name;
	this.programName 			= params.programName;
	this.programVersion 		= params.programVersion;
	this.backgroundColor 		= params.backgroundColor;
	this.listOfColorDefinitions = params.listOfColorDefinitions;
	this.listOfStyles 			= params.listOfStyles;
	/*this.listOfColorDefinitions = new renderExtension.ListOfColorDefinitions(renderInfo.colorDef.colorList);
	this.listOfStyles = new renderExtension.ListOfStyles(renderInfo.styleDef);
	*/
};

/**
 * @param {ListOfColorDefinitions} listOfColorDefinitions
 */
RenderInformation.prototype.setListOfColorDefinitions = function(listOfColorDefinitions) {
	this.listOfColorDefinitions = listOfColorDefinitions;
};

/**
 * @param {ListOfStyles} listOfStyles
 */
RenderInformation.prototype.setListOfStyles = function(listOfStyles) {
	this.listOfStyles = listOfStyles;
};

/**
 * @return {Element}
 */
RenderInformation.prototype.buildXmlObj = function () {
	var renderInformation = new xmldom.DOMImplementation().createDocument().createElement('renderInformation');
	renderInformation.setAttribute('xmlns', ns.xmlns);
	if (this.id != null) {
		renderInformation.setAttribute('id', this.id);
	}
	if (this.name != null) {
		renderInformation.setAttribute('name', this.name);
	}
	if (this.programName != null) {
		renderInformation.setAttribute('programName', this.programName);
	}
	if (this.programVersion != null) {
		renderInformation.setAttribute('programVersion', this.programVersion);
	}
	if (this.backgroundColor != null) {
		renderInformation.setAttribute('backgroundColor', this.backgroundColor);
	}

	if (this.listOfColorDefinitions) {
		renderInformation.appendChild(this.listOfColorDefinitions.buildXmlObj());
	}
	if (this.listOfStyles) {
		renderInformation.appendChild(this.listOfStyles.buildXmlObj());
	}
	return renderInformation;
};

/**
 * @return {string}
 */
RenderInformation.prototype.toXML = function() {
	return new xmldom.XMLSerializer().serializeToString(this.buildXmlObj());
};

/**
 * @param {Element} xml
 * @return {RenderInformation}
 */
RenderInformation.fromXML = function (xml) {
	if (xml.tagName != 'renderInformation') {
		throw new Error("Bad XML provided, expected tagName renderInformation, got: " + xml.tagName);
	}
	var renderInformation = new ns.RenderInformation();
	renderInformation.id 				= xml.getAttribute('id') || null;
	renderInformation.name 				= xml.getAttribute('name') || null;
	renderInformation.programName 		= xml.getAttribute('programName') || null;
	renderInformation.programVersion 	= xml.getAttribute('programVersion') || null;
	renderInformation.backgroundColor 	= xml.getAttribute('backgroundColor') || null;

	var listOfColorDefinitionsXML = xml.getElementsByTagName('listOfColorDefinitions')[0];
	var listOfStylesXML = xml.getElementsByTagName('listOfStyles')[0];
	if (listOfColorDefinitionsXML != null) {
		renderInformation.listOfColorDefinitions = ns.ListOfColorDefinitions.fromXML(listOfColorDefinitionsXML);
	}
	if (listOfStylesXML != null) {
		renderInformation.listOfStyles = ns.ListOfStyles.fromXML(listOfStylesXML);
	}

	return renderInformation;
};
ns.RenderInformation = RenderInformation;
// ------- END RENDERINFORMATION -------

module.exports = ns;