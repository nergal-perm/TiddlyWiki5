/*\
title: $:/core/modules/wiki-bulkops.js
type: application/javascript
module-type: wikimethod

Bulk tiddler operations such as rename.

\*/
(function(){

/*jslint node: true, browser: true */
/*global $tw: false */
"use strict";

/*
Rename a tiddler, and relink any tags or lists that reference it.
*/
function renameTiddler(fromTitle,toTitle,options) {
	fromTitle = (fromTitle || "").trim();
	toTitle = (toTitle || "").trim();
	options = options || {};
	if(fromTitle && toTitle && fromTitle !== toTitle) {
		// Rename the tiddler itself
		var oldTiddler = this.getTiddler(fromTitle),
			newTiddler = new $tw.Tiddler(oldTiddler,{title: toTitle},this.getModificationFields());
		newTiddler = $tw.hooks.invokeHook("th-renaming-tiddler",newTiddler,oldTiddler);
		this.addTiddler(newTiddler);
		this.deleteTiddler(fromTitle);
		// Rename any tags or lists that reference it
		this.relinkTiddler(fromTitle,toTitle,options)
	}
}

/*
Relink any tags or lists that reference a given tiddler
*/
function relinkTiddler(fromTitle,toTitle,options) {
	var self = this;
	fromTitle = (fromTitle || "").trim();
	toTitle = (toTitle || "").trim();
	options = options || {};
	if(fromTitle && toTitle && fromTitle !== toTitle) {
		this.each(function(tiddler,title) {
			var type = tiddler.fields.type || "";
			// Don't touch plugins or JavaScript modules
			if(!tiddler.fields["plugin-type"] && type !== "application/javascript") {
				var tags = (tiddler.fields.tags || []).slice(0),
					list = (tiddler.fields.list || []).slice(0),
					text = (tiddler.fields.text || ""),
					isModified = false;
				if(!options.dontRenameInTags) {
					// Rename tags
					$tw.utils.each(tags,function (title,index) {
						if(title === fromTitle) {
console.log("Renaming tag '" + tags[index] + "' to '" + toTitle + "' of tiddler '" + tiddler.fields.title + "'");
							tags[index] = toTitle;
							isModified = true;
						}
					});
				}
				if(!options.dontRenameInLists) {
					// Rename lists
					$tw.utils.each(list,function (title,index) {
						if(title === fromTitle) {
							console.log("Don't rename in lists: " + options.dontRenameInLists);
console.log("Renaming list item '" + list[index] + "' to '" + toTitle + "' of tiddler '" + tiddler.fields.title + "'");
							list[index] = toTitle;
							isModified = true;
						}
					});
				}
				if(!options.dontRenameInLinks) {
					var re;
					re = new RegExp(escapeRegExp("|" + fromTitle + "]]"), 'g');
					if(re.test(text)) {
						//console.log(re, "found first form at " + text.search(re));
						text = text.replace(re, "|" + toTitle + "]]");
						isModified = true;
					}
					re = new RegExp(escapeRegExp("[[" + fromTitle + "]]"), 'g');
					if(re.test(text)) {
						//console.log(re, "found second form at " + text.search(re));
						text = text.replace(re, "[[" + toTitle + "]]");
						isModified = true;
					}
					re = new RegExp(escapeRegExp("(#" + fromTitle + ")"), 'g');
					if(re.test(text)) {
						//console.log(re, "found third form at " + text.search(re));
						text = text.replace(re, "(#" + toTitle + ")");
						isModified = true;
					}
				}
				if(isModified) {
					var newTiddler = new $tw.Tiddler(tiddler,{tags: tags, list: list, text: text},self.getModificationFields())
					newTiddler = $tw.hooks.invokeHook("th-relinking-tiddler",newTiddler,tiddler);
					self.addTiddler(newTiddler);
				}
			}
		});
	}
};

function escapeRegExp(string){
	return string.replace(/[.*+?^${}()|[\]\\]/g, '\\$&'); // $& means the whole matched string
};

exports.renameTiddler = renameTiddler;
exports.relinkTiddler = relinkTiddler;

})();
