/*\
title: $:/plugins/matabele/setfield.js
type: application/javascript
module-type: widget

SetFieldWidget

\*/
(function(){

/*jslint node: true, browser: true */
/*global $tw: false */
"use strict";

var Widget = require("$:/core/modules/widgets/widget.js").widget;

var SetFieldWidget = function(parseTreeNode,options) {
	this.initialise(parseTreeNode,options);
	this.addEventListeners([
		{type: "tw-set-field", handler: "handleSetField"}
	]);
};

/*
Inherit from the base widget class
*/
SetFieldWidget.prototype = new Widget();

/*
Render this widget into the DOM
*/
SetFieldWidget.prototype.render = function(parent,nextSibling) {
	this.parentDomNode = parent;
	this.computeAttributes();
	this.execute();
	this.renderChildren(parent,nextSibling);
};

/*
Compute the internal state of the widget
*/
SetFieldWidget.prototype.execute = function() {
	// Get our parameters
	this.catchTiddler = this.getAttribute("tiddler");
	this.catchSet = this.getAttribute("set");
	this.catchSetTo = this.getAttribute("setTo");
	this.catchMessage = this.getAttribute("message");
	this.catchParam = this.getAttribute("param");
	// Construct the child widgets
	this.makeChildWidgets();
};

/*
Selectively refreshes the widget if needed. Returns true if the widget or any of its children needed re-rendering
*/
SetFieldWidget.prototype.refresh = function(changedTiddlers) {
	var changedAttributes = this.computeAttributes();
	if(changedAttributes.tiddler || changedAttributes.message || changedAttributes.param || changedAttributes.set || changedAttributes.setTo) {
		this.refreshSelf();
		return true;
	}
	else {
		return this.refreshChildren(changedTiddlers);		
	}
};

/*
Handle a tw-set-field event
*/
SetFieldWidget.prototype.handleSetField = function(event) { 
	// Set defaults
	this.targetTiddler = this.getVariable("currentTiddler");
	if(event.param) {
		this.sendParam = event.param;
		this.targetTiddler = event.param;
	}        
	if(this.catchTiddler) {
		// new modification
		this.sendParam = this.catchTiddler;
		// end
		this.targetTiddler = this.catchTiddler;
	}
	if(this.catchParam) {
		this.sendParam = this.catchParam;
	}
	// Set the value of the text-reference
	if(this.catchSet) {
		this.wiki.setTextReference(this.catchSet,this.catchSetTo,
		this.targetTiddler);
	}
	// Send another message or return true
	if(this.catchMessage && (this.catchMessage != "tw-set-field")) {
		this.dispatchEvent({type: this.catchMessage,param: this.sendParam});
	}
	else {
		return true;
	}
};

exports.setfield = SetFieldWidget;

})();