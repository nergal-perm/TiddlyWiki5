/*\
title: $:/plugins/matabele/maketid.js
type: application/javascript
module-type: widget

MakeTidWidget

\*/
(function(){

/*jslint node: true, browser: true */
/*global $tw: false */
"use strict";

var Widget = require("$:/core/modules/widgets/widget.js").widget;

var MakeTidWidget = function(parseTreeNode,options) {
	this.initialise(parseTreeNode,options);
	this.addEventListeners([
		{type: "tm-new-tiddler",handler: "handleMakeTiddler"}
	]);
};

/*
Inherit from the base widget class
*/
MakeTidWidget.prototype = new Widget();

/*
Render this widget into the DOM
*/
MakeTidWidget.prototype.render = function(parent,nextSibling) {
	var self = this;
	this.parentDomNode = parent;
	this.computeAttributes();
	this.execute();
	this.renderChildren(parent,nextSibling);
};

/*
Compute the internal state of the widget
*/
MakeTidWidget.prototype.execute = function() {
	// Get our parameters
	this.catchTitle = this.getAttribute("title","New Tiddler");
   	this.catchTags = this.getAttribute("tags");
	this.tidTemplate = this.getAttribute("template");
	this.maketidEdit = this.getAttribute("edit", "yes");
	this.catchMessage = this.getAttribute("message","tw-set-field");
	this.catchParam = this.getAttribute("param");
	// Construct the child widgets
	this.makeChildWidgets();
};

/*
Selectively refreshes the widget if needed. Returns true if the widget or any of its children needed re-rendering
*/
MakeTidWidget.prototype.refresh = function(changedTiddlers) {
	var changedAttributes = this.computeAttributes();
	if(changedAttributes.edit || changedAttributes.template || changedAttributes.message || changedAttributes.param || changedAttributes.title || changedAttributes.tags) {
		this.refreshSelf();
		return true;
	}
	else {
		return this.refreshChildren(changedTiddlers);		
	}
};

/*
Handle a tw-new-tiddler event
*/
MakeTidWidget.prototype.handleMakeTiddler = function(event) {
	// Set defaults
	if(event.param) {
		this.maketidTemplate = event.param;
	}
	if(this.tidTemplate) {
		this.maketidTemplate = this.tidTemplate;
	}
	// Make the clone of the template
	var make = this.wiki.getTiddlerAsJson(this.maketidTemplate);
	var makeClone = JSON.parse(this.substituteVariableReferences(make));
	var newtags = this.catchTags;
	var basetitle = this.catchTitle;
	var title = basetitle;
	for(var t=1; this.wiki.tiddlerExists(title); t++) {
		title = basetitle + " " + t;
	}
	makeClone.title = title;
	makeClone.tags = newtags;
	for(var modificationField in this.wiki.getModificationFields()) {
		delete makeClone[modificationField];
	}
	var created = this.wiki.getCreationFields();
	for(var creationField in created) {
		makeClone[modificationField] = created[creationField];
	}
	// Save the clone 
	this.wiki.addTiddler(makeClone);
	// Removed -- Set the value of the text reference 
	// Send another message or return true
	this.sendParam = title;
	if(this.catchParam) {
		this.sendParam = this.catchParam;
	}
	if(this.catchMessage && (this.catchMessage != "tm-new-tiddler")) {
	    this.dispatchEvent({type: this.catchMessage,param: this.sendParam});
	}
	else {
		return true;
	}
	// Control navigation to the new tiddler
	switch(this.maketidEdit) {
		case "yes":
			this.dispatchEvent({type: "tm-edit-tiddler",param: title});
			break;
		case "show":
			var bounds = this.parentDomNode.getBoundingClientRect();
			this.dispatchEvent({
				type: "tm-navigate",
				navigateTo: title,
				navigateFromTitle: this.getVariable("storyTiddler"),
				navigateFromNode: this,
				navigateFromClientRect: {
					top: bounds.top,
					left: bounds.left,
					width: bounds.width,
					right: bounds.right,
					bottom: bounds.bottom,
					height: bounds.height
				},
				navigateSuppressNavigation: event.metaKey || event.ctrlKey || (event.button === 1)
			});
			break;
		case "no":
			break;
	}
				
};
	
exports.maketid = MakeTidWidget;

})();