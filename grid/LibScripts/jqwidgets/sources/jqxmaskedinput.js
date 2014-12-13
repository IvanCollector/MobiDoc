/*
jQWidgets v2.7.0 (2013-Feb-08)
Copyright (c) 2011-2013 jQWidgets.
License: http://jqwidgets.com/license/
*/


/*
* jqxmaskedinput.js
*
* This source is property of jqwidgets and/or its partners and is subject to jqwidgets Source Code License agreement and jqwidgets EULA.
* Copyright (c) 2011 jqwidgets.
* <Licensing info>
* 
* http://www.jQWidgets.com
*
*/
/* Depends:
*   jqxcore.js*/

// Creating a new instance
// $("#maskedInput").jqxMaskedInput();

// Subscribing to an event
// $('#maskedInput').on('valuechanged', function (event) {
//      // TO DO
// });

// Calling a method
// $("#maskedInput").jqxMaskedInput('inputValue', '100')

// Calling a property
//  $("#maskedInput").jqxMaskedInput({ value: 100 })

//Type: Number.
//Default: 0.
//Sets the masked input's value.
//Property: value

//Type: String.
//Default: '99999'.
//Sets the input format string.
//Property: mask

//Type: Number.
//Default: null.
//Sets the progress bar width.
//Property: width

//Type: Number.
//Default: null.
//Sets the progress height width.
//Property: height

// Type: String
// Default 'left'
// Sets the text alignment.
// Property: textAlign

// Type: Bool
// Default: false
// Sets the readOnly state of the input.
// Property: readOnly

// Type: Char
// Default: "_"
// Sets the prompt char displayed when an editable char is empty.
// Property: promptChar

// Events:

// This event is triggered after value is changed.
// Event: valuechanged 
// This event is triggered when the user entered entered a text. 
// Event: textchanged
// This event is triggered when the mouse is pressed down.
// Event: mousedown
// This event is triggered when the mouse is released.
// Event: mouseup
// This event is triggered when a key is pressed down.
// Event: keydown
// This event is triggered when a key is pressed down.
// Event: keyup
// This event is triggered when a key is pressed down.
// Event: keypress
		

(function ($) {

    $.jqx.jqxWidget("jqxMaskedInput", "", {});

    $.extend($.jqx._jqxMaskedInput.prototype, {

        defineInstance: function () {
            //Type: String
            //Default: null
            //Sets the masked input's value.
            this.value = null;
            //Type: String.
            //Default: null.
            //Sets the masked input's mask.
            this.mask = "99999";
            //Type: Number.
            //Default: 0.
            //Sets width of the masked input in pixels. Only positive values have effect.
            this.width = null;
            //Type: Number.
            //Default: 0.
            //Sets height of the masked input in pixels. 
            this.height = 25;
            // Type: String
            // Sets the text alignment.
            this.textAlign = "left";
            // Type: Bool
            // Default: false
            // Sets the readOnly state of the input.
            this.readOnly = false,
            // Type: Char
            // Default: "_"
            // Sets the prompt char displayed when an editable char is empty.
            this.promptChar = "_";
            // Type: String
            // Default: advanced
            // Gets or sets the input mode. When the mode is simple, the text is formatted after editing. When the mode is advanced, the text is formatted while the user is in edit mode.
            // Available values: [simple, advanced]
            this.inputMode = 'advanced';
            this.rtl = false;
            this.events =
			[
		  	   'valuechanged', 'textchanged', 'mousedown', 'mouseup', 'keydown', 'keyup', 'keypress', 'change'
			];
        },

        // creates the masked input's instance. 
        createInstance: function (args) {
            this.render();
        },

        render: function () {
            this.element.innerHTML = "";
            this.host
	        .attr({
	            role: "maskedinput"
	        });

            this.host.addClass(this.toThemeProperty('jqx-input'));
            this.host.addClass(this.toThemeProperty('jqx-rc-all'));
            this.host.addClass(this.toThemeProperty('jqx-widget'));
            this.host.addClass(this.toThemeProperty('jqx-widget-content'));

            maskEditor = this;
            this.maskbox = $("<input autocomplete='off' type='textarea'/>").appendTo(this.host);
            this.maskbox.addClass(this.toThemeProperty('jqx-reset'));
            this.maskbox.addClass(this.toThemeProperty('jqx-input-content'));
            this.maskbox.addClass(this.toThemeProperty('jqx-widget-content'));
            var name = this.host.attr('name');
            if (!name) name = this.element.id;
            this.maskbox.attr('name', name);
            if (this.rtl) {
                this.maskbox.addClass(this.toThemeProperty('jqx-rtl'));
            }

            var me = this;
            this.propertyChangeMap['disabled'] = function (instance, key, oldVal, value) {
                if (value) {
                    instance.maskbox.addClass(me.toThemeProperty('jqx-input-disabled'));
                }
                else {
                    instance.maskbox.removeClass(me.toThemeProperty('jqx-input-disabled'));
                }
            }

            if (this.disabled) {
                this.maskbox.addClass(this.toThemeProperty('jqx-input-disabled'));
                this.maskbox.attr("disabled", true);
                this.host.addClass(this.toThemeProperty('jqx-fill-state-disabled'));
            }

            this.selectedText = "";
            this._addHandlers();
            this.self = this;
            this.oldValue = this._value();
            this.items = new Array();
            this._initializeLiterals();
            this._render();

            if (this.value != null) {
                this.inputValue(this.value.toString());
            }

            var me = this;
            var isOperaMini = $.jqx.mobile.isOperaMiniMobileBrowser();
            if (isOperaMini) {
                this.inputMode = 'simple';
                this.addHandler($(document), 'click', me._exitSimpleInputMode, me);
            }

            var oldVal;
            this.addHandler(this.maskbox, 'blur',
            function (event) {
                if (me.inputMode == 'simple') {
                    me._exitSimpleInputMode(event, me, false);
                    return false;
                }
                if (me.rtl) {
                    me.maskbox.css('direction', 'ltr');
                }
                me.host.removeClass(me.toThemeProperty('jqx-fill-state-focus'));
                if (me.maskbox.val() != oldVal) {
                    me._raiseEvent(7, event);
                }
            });

            this.addHandler(this.maskbox, 'focus',
            function (event) {
                oldVal = me.maskbox.val();
                if (me.inputMode == 'simple') {
                    me.maskbox.val(me._getEditValue());
                    $.data(me.maskbox, "simpleInputMode", true);
                    return false;
                }
                if (me.rtl) {
                    me.maskbox.css('direction', 'rtl');
                }

                me.host.addClass(me.toThemeProperty('jqx-fill-state-focus'));
            });

            var me = this;
            if (this.host.parents('form').length > 0) {
                this.host.parents('form').on('reset', function () {
                    setTimeout(function () {
                        me.clearValue();
                    }, 10);
                });
            }

            if ($.jqx.mobile.isChromeMobileBrowser() && !isOperaMini) {
                var oldText = '';
                var timer = setInterval(function () {
                    var text = $(me.maskbox).val();
                    var selection = me._selection();

                    // delete
                    if (text.length < oldText.length) {
                        var start = selection.start;
                        if (start < me.items.length && me.items[start].canEdit && me.items[start].character != me.promptChar) {
                            me.items[start].character = me.promptChar;
                        }

                        var text = me._getString();
                        me.maskedValue(text);
                        me._setSelectionStart(start);

                    }

                    if (text != oldText) {
                        oldText = text;
                    }
                }, 10);
            }
        },

        focus: function()
        {
            try
            {
                this.maskbox.focus();
            }
            catch (error) {
            }
        },

        _exitSimpleInputMode: function (event, self, checkbounds) {
            if (self == undefined) {
                self = event.data;
            }

            if (self == null) return;

            if (checkbounds == undefined) {
                if (event.target != null && self.element != null) {
                    if ((event.target.id != undefined && event.target.id.toString().length > 0 && self.host.find('#' + event.target.id).length > 0) || event.target == self.element) {
                        return;
                    }
                }

                var offset = self.host.offset();
                var left = offset.left;
                var top = offset.top;
                var width = self.host.width();
                var height = self.host.height();

                var targetOffset = $(event.target).offset();
                if (targetOffset.left >= left && targetOffset.left <= left + width)
                    if (targetOffset.top >= top && targetOffset.top <= top + height) {
                        return;
                    }
            }

            if (self.disabled || self.readOnly)
                return;

            var enteredMode = $.data(self.maskbox, "simpleInputMode");
            if (enteredMode == null) return;

            var currentValue = self.maskbox.val();
            self.inputValue(currentValue, true);

            $.data(self.maskbox, "simpleInputMode", null);
            return false;
        },

        _addHandlers: function () {
            var self = this;

            this.addHandler(this.maskbox, 'mousedown',
            function (event) {
                return self._raiseEvent(2, event)
            });

            this.addHandler(this.maskbox, 'mouseup',
            function (event) {
                return self._raiseEvent(3, event)
            });

            this.addHandler(this.maskbox, 'keydown',
            function (event) {
                return self._raiseEvent(4, event)
            });

            this.addHandler(this.maskbox, 'keyup',
            function (event) {
                return self._raiseEvent(5, event)
            });

            this.addHandler(this.maskbox, 'keypress',
            function (event) {
                return self._raiseEvent(6, event)
            });
        },

        _getString: function () {
            var s = "";
            for (i = 0; i < this.items.length; i++) {
                var character = this.items[i].character;
                if ((this.items[i].character == this.promptChar) && (this.promptChar != this.items[i].defaultCharacter)) {
                    s += this.items[i].defaultCharacter;
                }
                else {
                    s += character;
                }
            }

            return s;
        },

        _initializeLiterals: function () {
            if (this.mask == undefined || this.mask == null) {
                this.items = new Array();
                return;
            }

            this.mask = this.mask.toString();
            var length = this.mask.length;
            for (var i = 0; i < length; i++) {
                var character = this.mask.substring(i, i + 1);
                var regex = "";
                var canEdit = false;

                if (character == "#") {
                    regex = "(\\d|[+]|[-])";
                    canEdit = true;
                }
                else if (character == "9" || character == "0") {
                    regex = "\\d";
                    canEdit = true;
                }
                else if (character == "$") {
                    canEdit = false;
                }
                else if (character == "/" || character == ":") {
                    canEdit = false;
                }
                else if (character == "A" || character == "a") {
                    regex = "\\w";
                    canEdit = true;
                }
                else if (character == "c" || character == "C") {
                    regex = ".";
                    canEdit = true;
                }
                else if (character == "L" || character == "l") {
                    regex = "\\p{L}";
                    canEdit = true;
                }

                var self = this;
                var literal = function (character, regex, canEdit) {
                    literal.character = character;
                    literal.regex = regex;
                    literal.canEdit = canEdit;
                    literal.defaultCharacter = self.promptChar;
                }

                if (canEdit) {
                    literal(this.promptChar, regex, canEdit);
                }
                else {
                    literal(character, regex, canEdit);
                }

                this.items[i] = literal;
            }
        },

        setRegex: function (index, regex, canEdit, defaultCharacter) {
            if ((index == null || index == undefined) || (regex == null || regex == undefined))
                return;

            if (index < this.items.length) {
                this.items[index].regex = regex;
                if (canEdit != null && canEdit != undefined) {
                    this.items[index].canEdit = canEdit;
                }

                if (defaultCharacter != null && defaultCharacter != undefined) {
                    this.items[index].defaultCharacter = defaultCharacter;
                }
            }
        },

        //[optimize]
        _match: function (character, regex) {
            var regExpr = new RegExp(regex, "i");
            return regExpr.test(character);
        },

        //[optimize]
        _raiseEvent: function (id, arg) {
            var evt = this.events[id];
            var args = {};
            args.owner = this;

            var key = arg.charCode ? arg.charCode : arg.keyCode ? arg.keyCode : 0;
            var result = true;
            var isreadOnly = this.readOnly;
            var event = new jQuery.Event(evt);
            event.owner = this;
            args.value = this.inputValue();
            args.text = this.maskedValue();
            event.args = args;
            result = this.host.trigger(event);

            if (this.inputMode != 'simple') {
                // key down
                if (id == 4) {
                    if (isreadOnly || this.disabled) {
                        return false;
                    }
                    var me = this;
                    if ($.jqx.mobile.isChromeMobileBrowser()) {
                        var selection = me._selection();
                        window.setTimeout(function () {
                            var savedSelection = $.data(me.maskbox, "selectionstart");
                            if (savedSelection != null && savedSelection != selection.start) {
                                $.data(me.maskbox, "selectionstart", selection.start);
                            }
                            result = me._handleKeyDown(arg, key);
                        }, 25);
                    }
                    else {
                        result = this._handleKeyDown(arg, key);
                    }
                }
                // key up
                else if (id == 5) {
                    if (isreadOnly || this.disabled) {
                        result = false;
                    }
                }
                else if (id == 6) {
                    if (isreadOnly || this.disabled) {
                        return false;
                    }

                    result = this._handleKeyPress(arg, key)
                }
            }
            else {
                if (id == 4 || id == 5 || id == 6) {
                    if (isreadOnly || this.disabled) {
                        return false;
                    }

                    var letter = String.fromCharCode(key);
                    var digit = parseInt(letter);
                    var allowInput = true;

                    if (!isNaN(digit)) {
                        allowInput = true;
                        var maxLength = this.maskbox.val().toString().length;
                        if (maxLength >= this._getEditStringLength() && this._selection().length == 0) {
                            allowInput = false;
                        }
                    }

                    if (!arg.ctrlKey && !arg.shiftKey) {
                        if (key >= 65 && key <= 90) {
                            allowInput = false;
                        }
                    }

                    return allowInput;
                }
            }

            return result;
        },

        //[optimize]
        _handleKeyPress: function (e, key) {
            var selection = this._selection();
            var rootElement = this;
            if ((e.ctrlKey && key == 97 /* firefox */) || (e.ctrlKey && key == 65) /* opera */) {
                return true;
            }

            if (key == 8) {
                if (selection.start > 0) {
                    rootElement._setSelectionStart(selection.start);
                }
                return false;
            }

            if (key == 46) {
                if (selection.start < this.items.length) {
                    rootElement._setSelectionStart(selection.start);
                }

                return false;
            }

            if ($.jqx.browser.msie) {
                this._insertKey(key);
            }

            var specialKey = this._isSpecialKey(key);
            return specialKey;
        },

        //[optimize]
        _insertKey: function (key) {
            var selection = this._selection();
            var rootElement = this;

            if (selection.start >= 0 && selection.start < this.items.length) {
                var letter = String.fromCharCode(key);
                var selectedTextDeleted = false
                $.each(this.items, function (i, value) {
                    if (i < selection.start) {
                        return;
                    }

                    var item = rootElement.items[i];
                    if (!item.canEdit) {
                        return;
                    }

                    if (rootElement._match(letter, item.regex)) {
                        if (!selectedTextDeleted && selection.length > 0) {
                            for (var j = selection.start; j < selection.end; j++) {
                                if (rootElement.items[j].canEdit) {
                                    rootElement.items[j].character = rootElement.promptChar;
                                }
                            }

                            var text = rootElement._getString();
                            rootElement.maskedValue(text);
                            selectedTextDeleted = true;
                        }

                        item.character = letter;
                        var text = rootElement._getString();
                        rootElement.maskedValue(text);

                        if (selection.start < rootElement.items.length) {
                            rootElement._setSelectionStart(i + 1);
                        }

                        return false;
                    }
                    else return false;
                });
            }
        },

        //[optimize]
        _deleteSelectedText: function () {
            var selection = this._selection();
            var deleted = false;

            if (selection.start > 0 || selection.length > 0) {
                for (i = selection.start; i < selection.end; i++) {
                    if (i < this.items.length && this.items[i].canEdit && this.items[i].character != this.promptChar) {
                        this.items[i].character = this.promptChar;
                        deleted = true;
                    }
                }

                var text = this._getString();
                this.maskedValue(text);
                return deleted;
            }
        },

        //[optimize]
        _saveSelectedText: function () {
            var selection = this._selection();
            var text = "";
            if (selection.start > 0 || selection.length > 0) {
                for (i = selection.start; i < selection.end; i++) {
                    if (this.items[i].canEdit) {
                        text += this.items[i].character;
                    }
                }
            }
            window.clipboardData.setData("Text", text);
            return text;
        },

        //[optimize]
        _pasteSelectedText: function () {
            var selection = this._selection();
            var text = "";
            var k = 0;
            var newSelection = selection.start;
            var clipboardText = window.clipboardData.getData("Text");
            if (clipboardText != this.selectedText && clipboardText.length > 0) {
                this.selectedText = clipboardText;
                if (this.selectedText == null || this.selectedText == undefined)
                    return;
            }

            if (selection.start >= 0 || selection.length > 0) {
                for (i = selection.start; i < this.items.length; i++) {
                    if (this.items[i].canEdit) {
                        if (k < this.selectedText.length) {
                            this.items[i].character = this.selectedText[k];
                            k++;
                            newSelection = 1 + i;
                        }
                    }
                }
            }

            var text = this._getString();
            this.maskedValue(text);

            if (newSelection < this.items.length) {
                this._setSelectionStart(newSelection);
            }
            else this._setSelectionStart(this.items.length);

        },

        //[optimize]
        _handleKeyDown: function (e, key) {
            var selection = this._selection();
            if ((e.ctrlKey && key == 97 /* firefox */) || (e.ctrlKey && key == 65) /* opera */) {
                return true;
            } // allow Ctrl+X (cut)
            if ((e.ctrlKey && key == 120 /* firefox */) || (e.ctrlKey && key == 88) /* opera */) {
                this.selectedText = this._saveSelectedText(e);
                this._deleteSelectedText(e);
                return false;
            }
            // allow Ctrl+C (copy)
            if ((e.ctrlKey && key == 99 /* firefox */) || (e.ctrlKey && key == 67) /* opera */) {
                this.selectedText = this._saveSelectedText(e);
                return false;
            }
            // allow Ctrl+Z (undo)
            if ((e.ctrlKey && key == 122 /* firefox */) || (e.ctrlKey && key == 90) /* opera */) return false;
            // allow or deny Ctrl+V (paste), Shift+Ins
            if ((e.ctrlKey && key == 118 /* firefox */) || (e.ctrlKey && key == 86) /* opera */
            || (e.shiftKey && key == 45)) {
                this._pasteSelectedText();
                return false;
            }
            if (selection.start >= 0 && selection.start < this.items.length) {
                var letter = String.fromCharCode(key);
                var item = this.items[selection.start];

            }

            // handle backspace.
            if (key == 8) {
                if (selection.length == 0) {
                    for (i = this.items.length - 1; i >= 0; i--) {
                        if (this.items[i].canEdit && i < selection.end && this.items[i].character != this.promptChar) {
                            this._setSelection(i, i + 1);
                            break;
                        }
                    }
                }

                selection = this._selection();
                var deletedText = this._deleteSelectedText();

                if (selection.start > 0 || selection.length > 0) {
                    if (selection.start <= this.items.length) {
                        if (deletedText) {
                            this._setSelectionStart(selection.start);
                        }
                        else this._setSelectionStart(selection.start - 1);
                    }
                }
                return false;
            }

            if (key == 190) {
                for (i = 0; i < this.items.length; i++) {
                    if (this.items[i].character == '.') {
                        this._setSelectionStart(i + 1);
                        break;
                    }
                }
            }

            // handle del.
            if (key == 46) {
                if (selection.length == 0) {
                    for (i = 0; i < this.items.length; i++) {
                        if (this.items[i].canEdit && i >= selection.start && this.items[i].character != this.promptChar) {
                            this._setSelection(i, i + 1);
                            break;
                        }
                    }
                }

                var oldSelection = selection;
                selection = this._selection();
                var deleted = this._deleteSelectedText();
                if (selection.start >= 0 || selection.length >= 0) {
                    if (selection.start < this.items.length) {
                        if (selection.length <= 1) {
                            if (oldSelection.end != selection.end) {
                                this._setSelectionStart(selection.end);
                            }
                            else this._setSelectionStart(selection.end + 1);
                        }
                        else this._setSelectionStart(selection.start)
                    }
                }
                return false;
            }

            if ($.jqx.browser.msie == null) {
                var oldVal = this.maskbox.val();
                var me = this;
                if (key >= 96 && key <= 105) {
                    key = key - 48;
                }

                me._insertKey(key);
                var newVal = this.maskbox.val();

                if (oldVal.toString() != newVal.toString()) {
                    return false;
                }
            }

            var specialKey = this._isSpecialKey(key);

            if (key == 189)
                return false;

            if (!$.jqx.browser.mozilla)
                return true;

            return specialKey;
        },

        //[optimize]
        _isSpecialKey: function (key) {
            if (key != 8 /* backspace */ &&
			key != 9 /* tab */ &&
			key != 13 /* enter */ &&
			key != 35 /* end */ &&
			key != 36 /* home */ &&
			key != 37 /* left */ &&
			key != 39 /* right */ &&
			key != 46 /* del */
		    ) {
                return false;
            }

            return true;
        },

        //[optimize]
        _selection: function () {
            if ('selectionStart' in this.maskbox[0]) {
                var e = this.maskbox[0];
                var selectionLength = e.selectionEnd - e.selectionStart;
                return { start: e.selectionStart, end: e.selectionEnd, length: selectionLength, text: e.value };
            }
            else {
                var r = document.selection.createRange();
                if (r == null) {
                    return { start: 0, end: e.value.length, length: 0 }
                }

                var re = this.maskbox[0].createTextRange();
                var rc = re.duplicate();
                re.moveToBookmark(r.getBookmark());
                rc.setEndPoint('EndToStart', re);
                var selectionLength = r.text.length;

                return { start: rc.text.length, end: rc.text.length + r.text.length, length: selectionLength, text: r.text };
            }
        },

        //[optimize]
        _setSelection: function (start, end) {
            if ('selectionStart' in this.maskbox[0]) {
                this.maskbox[0].focus();
                this.maskbox[0].setSelectionRange(start, end);
            }
            else {
                var range = this.maskbox[0].createTextRange();
                range.collapse(true);
                range.moveEnd('character', end);
                range.moveStart('character', start);
                range.select();
            }
        },

        //[optimize]
        _setSelectionStart: function (start) {
            this._setSelection(start, start);
        },

        refresh: function (internalRefresh) {
            if (!internalRefresh) {
                this._render();
            }
        },

        //[optimize]
        _render: function () {
            var leftBorder = parseInt(this.host.css("border-left-width"));
            var rightBorder = parseInt(this.host.css("border-left-width"));
            var topBorder = parseInt(this.host.css("border-left-width"));
            var bottomBorder = parseInt(this.host.css("border-left-width"));

            var height = parseInt(this.host.css("height")) - topBorder - bottomBorder;
            var width = parseInt(this.host.css("width")) - leftBorder - rightBorder;
            if (this.width != null && this.width.toString().indexOf("px") != -1) {
                width = this.width;
            }
            else
                if (this.width != undefined && !isNaN(this.width)) {
                    width = this.width;
                };

            if (this.height != null && this.height.toString().indexOf("px") != -1) {
                height = this.height;
            }
            else if (this.height != undefined && !isNaN(this.height)) {
                height = this.height;
            };

            width = parseInt(width);
            height = parseInt(height);

            this.maskbox.css({
                "border-left-width": 0,
                "border-right-width": 0,
                "border-bottom-width": 0,
                "border-top-width": 0
            });

            this.maskbox.css("text-align", this.textAlign);
            var fontSize = this.maskbox.css("font-size");

            if (!isNaN(height)) {
                this.maskbox.css('height', parseInt(fontSize) + 4 + 'px');
            }

            if (!isNaN(width)) {
                this.maskbox.css('width', width - 2);
            }

            var top = parseInt(height) - 2 * parseInt(topBorder) - 2 * parseInt(bottomBorder) - parseInt(fontSize);
            if (isNaN(top)) top = 0;

            if (!isNaN(height)) {
                this.host.height(height);
            }
            if (!isNaN(width)) {
                this.host.width(width);
            }

            var topPadding = top / 2;

            // fix for MSIE 6 and 7. These browsers double the top padding for some reason...
            if ($.jqx.browser.msie && $.jqx.browser.version < 8) {
                topPadding = top / 4;
            }

            this.maskbox.css("padding-right", '0px');
            this.maskbox.css("padding-left", '0px');
            this.maskbox.css("padding-top", topPadding);
            this.maskbox.css("padding-bottom", top / 2);
            this.maskbox.val(this._getString())
        },

        destroy: function () {
            this.element
			.removeClass("jqx-rc-all")
			;

            this.maskbox.remove();
            this.element.remove();
        },

        // gets or sets the input's value.
        maskedValue: function (newValue) {
            if (newValue === undefined) {
                return this._value();
            }

            this.value = newValue;
            this._refreshValue();

            if (this.oldValue !== newValue) {
                this._raiseEvent(1, newValue);
                this.oldValue = newValue;
                this._raiseEvent(0, newValue);
            }

            return this;
        },

        // sets the input's value.
        _value: function () {
            var value = this.maskbox.val();
            return value;
        },

        // sets a property.
        propertyChangedHandler: function (object, key, oldValue, value) {
            if (this.isInitialized == undefined || this.isInitialized == false)
                return;

            if (key == "rtl") {
                if (object.rtl) {
                    object.maskbox.addClass(object.toThemeProperty('jqx-rtl'));
                }
                else {
                    object.maskbox.removeClass(object.toThemeProperty('jqx-rtl'));
                }
            }

            if (key === "value") {
                if (value == undefined || value == null) value = '';
                value = value.toString();
                this.inputValue(value);
            }

            if (key === 'theme') {
                $.jqx.utilities.setTheme(oldValue, value, this.host);
            }

            if (key == 'disabled') {
                if (value) {
                    object.maskbox.addClass(object.toThemeProperty('jqx-input-disabled'));
                    object.host.addClass(object.toThemeProperty('jqx-fill-state-disabled'));
                    object.maskbox.attr("disabled", true);
                }
                else {
                    object.host.removeClass(this.toThemeProperty('jqx-fill-state-disabled'));
                    object.host.removeClass(this.toThemeProperty('jqx-input-disabled'));
                    object.maskbox.attr("disabled", false);
                }
            }

            if (key == "readOnly") {
                this.readOnly = value;
            }

            if (key == "promptChar") {
                for (i = 0; i < object.items.length; i++) {
                    if (object.items[i].character == object.promptChar) {
                        object.items[i].character = value;
                        object.items[i].defaultCharacter = value;
                    }
                }

                object.promptChar = value;
            }

            if (key == "textAlign") {
                object.maskbox.css("text-align", value);
                object.textAlign = value;
            }

            if (key == "mask") {
                object.mask = value;
                object.items = new Array();
                object._initializeLiterals();
                object.value = object._getString();
                object._refreshValue();
            }
            if (key == "width") {
                object.width = value;
                object._render();
            }
            else if (key == "height") {
                object.height = value;
                object._render();
            }
        },

        // gets the input's value.
        _value: function () {
            var val = this.value;
            return val;
        },

        //[optimize]
        _getEditStringLength: function () {
            var value = '';
            for (i = 0; i < this.items.length; i++) {
                if (this.items[i].canEdit) {
                    value += this.items[i].character;
                }
            }

            return value.length;
        },

        //[optimize]
        _getEditValue: function () {
            var value = '';
            for (i = 0; i < this.items.length; i++) {
                if (this.items[i].canEdit && this.items[i].character != this.promptChar) {
                    value += this.items[i].character;
                }
            }

            return value;
        },

        //[optimize]
        parseValue: function (value) {
            if (value == undefined || value == null)
                return null;

            var input = value.toString();
            var newValue = '';
            var x = 0;
            for (m = 0; m < input.length; m++) {
                var data = input.substring(m, m + 1);

                for (i = x; i < this.items.length; i++) {
                    if (this.items[i].canEdit && this._match(data, this.items[i].regex)) {
                        newValue += data;
                        x = i;
                        break;
                    }
                }
            }

            return newValue;
        },

        // clears the entered value.
        clearValue: function () {
            this.inputValue("", true);
        },

        val: function (data) {
            if (data != undefined && typeof data != 'object') {
                this.inputValue(data);
            }

            return this.maskbox.val();
        },

        // gets or sets the editable input value.
        inputValue: function (data, fullRefresh) {
            if (data == undefined || data == null) {
                var value = "";
                for (i = 0; i < this.items.length; i++) {
                    if (this.items[i].canEdit) {
                        value += this.items[i].character;
                    }
                }

                return value;
            }
            else {
                var k = 0;
                data = data.toString();

                for (var i = 0; i < this.items.length; i++) {
                    if (this.items[i].canEdit) {
                        if (this._match(data.substring(k, k + 1), this.items[i].regex)) {
                            this.items[i].character = data.substring(k, k + 1);
                            k++;
                        }
                        else if (fullRefresh) {
                            this.items[i].character = this.promptChar;
                        }
                    }
                }

                var newString = this._getString();
                this.maskedValue(newString);

                return this.inputValue();
            }
        },

        // applies the value to the input.
        _refreshValue: function () {
            var value = this.maskedValue();
            var k = 0;
            for (i = 0; i < this.items.length; i++) {
                if (value.length > k) {
                    if (this.items[i].canEdit && this.items[i].character != value[k]) {
                        if (this._match(value[k], this.items[i].regex) && value[k].length == 1) {
                            this.items[i].character = value[k];
                        }
                    }
                    k++;
                }
            }

            this.value = this._getString();
            value = this.value;
            this.maskbox.val(value);
        }
    });
})(jQuery);
