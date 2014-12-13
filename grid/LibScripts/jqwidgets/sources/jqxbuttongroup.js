/*
jQWidgets v2.7.0 (2013-Feb-08)
Copyright (c) 2011-2013 jQWidgets.
License: http://jqwidgets.com/license/
*/

/*
* Depends:
*   jqxcore.js
*/

(function ($) {

    $.jqx.jqxWidget("jqxButtonGroup", "", {});

    $.extend($.jqx._jqxButtonGroup.prototype, {
        defineInstance: function () {
            //Possible values: checkbox, radio, default
            this.mode = 'default';
            this.roundedCorners = true;
            this.disabled = false;
            this.enableHover = false;
            this.orientation = 'horizontal';

            this._eventsMap = {
                'mousedown': 'touchstart',
                'mouseup': 'touchend'
            };
            this._events = ['selected', 'unselected', 'buttonclick'];
            this._buttonId = {};
            this._selected = null;
            this._pressed = null;
            this._baseId = 'group_button';
        },

        createInstance: function (args) {
            this._isTouchDevice = $.jqx.mobile.isTouchDevice();
            var me = this;
            this.addHandler(this.host, 'selectstart', function (event) {
                if (!me.disabled) {
                    event.preventDefault();
                }
            });
        },

        refresh: function () {
            this._refreshButtons();
        },

        render: function () {
            this.refresh();
        },

        _getEvent: function (event) {
            if (this._isTouchDevice) {
                var e = this._eventsMap[event] || event;
                e += "." + this.element.id;
                return e;
            }
            event += "." + this.element.id;
            return event;
        },

        _refreshButtons: function () {
            if (this.lastElement)
                this.lastElement.remove();

            this.lastElement = $("<div style='clear: both;'></div>");
            var children = this.host.children(),
                count = children.length,
                current;
            for (var i = 0; i < count; i += 1) {
                current = $(children[i]);
                this._refreshButton(current, i, count);
            }
            this.lastElement.appendTo(this.host);
        },

        _refreshButton: function (btn, counter, count) {
            (function (btn) {
                btn = this._render(btn);
                this._removeStyles(btn);
                this._addStyles(btn, counter, count);
                this._performLayout(btn);
                this._removeButtonListeners(btn);
                this._addButtonListeners(btn);
                this._handleButtonId(btn, counter);
            }).apply(this, [btn]);
        },

        destroy: function (removeFromDom) {
            this._removeStyles();
            this._removeEventListeners();
            if (removeFromDom != false) {
                this.host.remove();
            }
        },

        _render: function (btn) {
            if (btn[0].tagName.toLowerCase() === 'button') {
                return this._renderFromButton(btn);
            } else {
                return this._renderButton(btn);
            }
        },

        _renderButton: function (btn) {
            var content;
            btn.wrapInner('<div/>');
            return btn;
        },

        _removeStyles: function (btn) {
            this.host.removeClass('jqx-widget');
            this.host.removeClass('jqx-rc-all');
            btn.removeClass(this.toThemeProperty('jqx-fill-state-normal'));
            btn.removeClass(this.toThemeProperty('jqx-group-button-normal'));
            btn.removeClass(this.toThemeProperty('jqx-rc-tl'));
            btn.removeClass(this.toThemeProperty('jqx-rc-bl'));
            btn.removeClass(this.toThemeProperty('jqx-rc-tr'));
            btn.removeClass(this.toThemeProperty('jqx-rc-br'));
            btn.css('margin-left', 0);
        },

        _addStyles: function (btn, counter, count) {
            this.host.addClass('jqx-widget');
            this.host.addClass('jqx-rc-all');
            this.host.addClass('jqx-buttongroup');
            btn.addClass(this.toThemeProperty('jqx-button'));
            btn.addClass(this.toThemeProperty('jqx-group-button-normal'));
            btn.addClass(this.toThemeProperty('jqx-fill-state-normal'));
            if (this.roundedCorners) {
                if (counter === 0) {
                    this._addRoundedCorners(btn, true);
                } else if (counter === count - 1) {
                    this._addRoundedCorners(btn, false);
                }
            }
            if (this.orientation == 'horizontal') {
                btn.css('margin-left', -parseInt(btn.css('border-left-width'), 10));
            }
            else {
                btn.css('margin-top', -parseInt(btn.css('border-left-width'), 10));
            }
        },

        _addRoundedCorners: function (button, left) {
            if (this.orientation == 'horizontal') {
                if (left) {
                    button.addClass(this.toThemeProperty('jqx-rc-tl'));
                    button.addClass(this.toThemeProperty('jqx-rc-bl'));
                } else {
                    button.addClass(this.toThemeProperty('jqx-rc-tr'));
                    button.addClass(this.toThemeProperty('jqx-rc-br'));
                }
            }
            else {
                if (left) {
                    button.addClass(this.toThemeProperty('jqx-rc-tl'));
                    button.addClass(this.toThemeProperty('jqx-rc-tr'));
                } else {
                    button.addClass(this.toThemeProperty('jqx-rc-bl'));
                    button.addClass(this.toThemeProperty('jqx-rc-br'));
                }
            }
        },

        _centerContent: function (content, parent) {
            content.css({
                'margin-top': (parent.height() - content.height()) / 2,
                'margin-left': (parent.width() - content.width()) / 2
            });
            return content;
        },

        _renderFromButton: function (btn) {
            var content = btn.val();
            if (content == "") {
                content = btn.html();
            }

            var div;
            var id = btn[0].id;
            btn.wrap('<div/>');
            div = btn.parent();
            div.attr('style', btn.attr('style'));
            btn.remove();
            $.jqx.utilities.html(div, content);
            div[0].id = id;
            return div;
        },

        _performLayout: function (btn) {
            if (this.orientation == 'horizontal') {
                btn.css('float', 'left');
            }
            else {
                btn.css('float', 'none');
            }

            this._centerContent($(btn.children()), btn);
        },

        _mouseEnterHandler: function (e) {
            var self = e.data.self,
                btn = $(e.currentTarget);
            if (self._isDisabled(btn) || !self.enableHover) {
                return;
            }
            btn.addClass(self.toThemeProperty('jqx-group-button-hover'));
            btn.addClass(self.toThemeProperty('jqx-fill-state-hover'));
        },

        _mouseLeaveHandler: function (e) {
            var self = e.data.self,
                btn = $(e.currentTarget);
            if (self._isDisabled(btn) || !self.enableHover) {
                return;
            }
            btn.removeClass(self.toThemeProperty('jqx-group-button-hover'));
            btn.removeClass(self.toThemeProperty('jqx-fill-state-hover'));
        },

        _mouseDownHandler: function (e) {
            var self = e.data.self,
                btn = $(e.currentTarget);
            if (self._isDisabled(btn)) {
                return;
            }
            self._pressed = btn;
            btn.addClass(self.toThemeProperty('jqx-group-button-pressed'));
            btn.addClass(self.toThemeProperty('jqx-fill-state-pressed'));
        },

        _mouseUpHandler: function (e) {
            var self = e.data.self,
                btn = $(e.currentTarget);
            if (self._isDisabled(btn)) {
                return;
            }
            self._handleSelection(btn);
            self._pressed = null;
            btn = self._buttonId[btn[0].id];
            self._raiseEvent(2, { index: btn.num, button: btn.btn });
        },

        _isDisabled: function (btn) {
            if (!btn || !btn[0]) {
                return false;
            }
            return this._buttonId[btn[0].id].disabled;
        },

        _documentUpHandler: function (e) {
            var self = e.data.self,
                pressedButton = self._pressed;
            if (pressedButton && !self._buttonId[pressedButton[0].id].selected) {
                pressedButton.removeClass(self.toThemeProperty('jqx-fill-state-pressed'));
                self._pressed = null;
            }
        },

        _addButtonListeners: function (btn) {
            var self = this;
            this.addHandler(btn, this._getEvent('mouseenter'), this._mouseEnterHandler, { self: this });
            this.addHandler(btn, this._getEvent('mouseleave'), this._mouseLeaveHandler, { self: this });
            this.addHandler(btn, this._getEvent('mousedown'), this._mouseDownHandler, { self: this });
            this.addHandler(btn, this._getEvent('mouseup'), this._mouseUpHandler, { self: this });
            this.addHandler($(document), this._getEvent('mouseup'), this._documentUpHandler, { self: this });
        },

        _removeButtonListeners: function (btn) {
            this.removeHandler(btn, this._getEvent('mouseenter'), this._mouseEnterHandler);
            this.removeHandler(btn, this._getEvent('mouseleave'), this._mouseLeaveHandler);
            this.removeHandler(btn, this._getEvent('mousedown'), this._mouseDownHandler);
            this.removeHandler(btn, this._getEvent('mouseup'), this._mouseUpHandler);
            this.removeHandler($(document), this._getEvent('mouseup'), this._documentUpHandler);
        },

        _handleSelection: function (btn) {
            if (this.mode === 'radio') {
                this._handleRadio(btn);
            } else if (this.mode === 'checkbox') {
                this._handleCheckbox(btn);
            } else {
                this._handleDefault(btn);
            }
        },

        _handleRadio: function (btn) {
            var selected = this._getSelectedButton();
            if (selected && selected.btn[0].id !== btn[0].id) {
                this._unselectButton(selected.btn, true);
            }
            for (var data in this._buttonId) {
                this._buttonId[data].selected = true;
                this._unselectButton(this._buttonId[data].btn, false);
            }

            this._selectButton(btn, true);
        },

        _handleCheckbox: function (btn) {
            var btnInfo = this._buttonId[btn[0].id];
            if (btnInfo.selected) {
                this._unselectButton(btnInfo.btn, true);
            } else {
                this._selectButton(btn, true);
            }
        },

        _handleDefault: function (btn) {
            this._selectButton(btn, false);
            for (var data in this._buttonId) {
                this._buttonId[data].selected = true;
                this._unselectButton(this._buttonId[data].btn, false);
            }
        },

        _getSelectedButton: function () {
            for (var data in this._buttonId) {
                if (this._buttonId[data].selected) {
                    return this._buttonId[data];
                }
            }
            return null;
        },

        _getSelectedButtons: function () {
            var selected = [];
            for (var data in this._buttonId) {
                if (this._buttonId[data].selected) {
                    selected.push(this._buttonId[data].num);
                }
            }
            return selected;
        },

        _getButtonByIndex: function (index) {
            var current;
            for (var data in this._buttonId) {
                if (this._buttonId[data].num === index) {
                    return this._buttonId[data];
                }
            }
            return null;
        },

        _selectButton: function (btn, raiseEvent) {
            var btnInfo = this._buttonId[btn[0].id];
            if (btnInfo.selected) {
                return;
            }
            btnInfo.btn.addClass(this.toThemeProperty('jqx-group-button-pressed'));
            btnInfo.btn.addClass(this.toThemeProperty('jqx-fill-state-pressed'));
            btnInfo.selected = true;
            if (raiseEvent) {
                this._raiseEvent(0, { index: btnInfo.num, button: btnInfo.btn });
            }
        },

        _unselectButton: function (btn, raiseEvent) {
            var btnInfo = this._buttonId[btn[0].id];
            if (!btnInfo.selected) {
                return;
            }
            btnInfo.btn.removeClass(this.toThemeProperty('jqx-group-button-pressed'));
            btnInfo.btn.removeClass(this.toThemeProperty('jqx-fill-state-pressed'));
            btnInfo.selected = false;
            if (raiseEvent) {
                this._raiseEvent(1, { index: btnInfo.num, button: btnInfo.btn });
            }
        },

        setSelection: function (index) {
            if (this.mode === 'checkbox') {
                if (typeof index === 'number') {
                    this._setSelection(index);
                } else {
                    for (var i = 0; i < index.length; i += 1) {
                        this._setSelection(index[i]);
                    }
                }
            } else if (typeof index === 'number' && this.mode === 'radio') {
                this._setSelection(index);
            }
        },

        _setSelection: function (index) {
            var btn = this._getButtonByIndex(index);
            this._handleSelection(btn.btn);
        },

        getSelection: function () {
            if (this.mode === 'radio') {
                return this._getSelectedButton().num;
            } else if (this.mode === 'checkbox') {
                return this._getSelectedButtons();
            }
            return undefined;
        },

        disable: function () {
            var current;
            for (var btn in this._buttonId) {
                current = this._buttonId[btn];
                this.disableAt(current.num);
            }
        },

        enable: function () {
            var current;
            for (var btn in this._buttonId) {
                current = this._buttonId[btn];
                this.enableAt(current.num);
            }
        },

        disableAt: function (index) {
            var btn = this._getButtonByIndex(index);
            if (!btn.disabled) {
                btn.disabled = true;
                btn.btn.addClass(this.toThemeProperty('jqx-fill-state-disabled'));
            }
        },

        enableAt: function (index) {
            var btn = this._getButtonByIndex(index);
            if (btn.disabled) {
                btn.disabled = false;
                btn.btn.removeClass(this.toThemeProperty('jqx-fill-state-disabled'));
            }
        },

        _handleButtonId: function (btn, number) {
            var id = btn[0].id,
                btnId = { btn: btn, num: number, selected: false },
                widgetId;
            if (!id) {
                id = this._baseId + new Date().getTime();
            }
            btn[0].id = id;
            this._buttonId[id] = btnId;
            return id;
        },

        _raiseEvent: function (id, data) {
            var event = $.Event(this._events[id]);
            event.args = data;
            return this.host.trigger(event);
        },

        _unselectAll: function () {
            for (var data in this._buttonId) {
                this._unselectButton(this._buttonId[data].btn, false);
            }
        },

        propertyChangedHandler: function (object, key, oldvalue, value) {
            if (key === 'mode') {
                if (value != 'checkbox') {
                    this._unselectAll();
                }
                return;
            } else if (key === 'disabled') {
                if (value) {
                    this.disable();
                } else {
                    this.enable();
                }
            } else {
                this.refresh();
            }
        }
    });
})(jQuery);