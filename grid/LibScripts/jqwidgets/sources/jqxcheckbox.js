/*
jQWidgets v2.7.0 (2013-Feb-08)
Copyright (c) 2011-2013 jQWidgets.
License: http://jqwidgets.com/license/
*/

(function ($) {

    $.jqx.jqxWidget("jqxCheckBox", "", {});

    $.extend($.jqx._jqxCheckBox.prototype, {
        defineInstance: function () {
            // Type: Number
            // Default: 250
            // Gets or sets the delay of the fade animation when the CheckBox is going to be opened.
            this.animationShowDelay = 300,
            // Type: Number
            // Default: 300
            // Gets or sets the delay of the fade animation when the CheckBox is going to be closed. 
             this.animationHideDelay = 300,
            // Type: Number.
            // Default: null.
            // Sets the width.
            this.width = null;
            // Type: Number.
            // Default: null.
            // Sets the height.
            this.height = null;
            // Type: String
            // Default: '13px'
            // Gets or sets the checkbox's size.
            this.boxSize = '13px';
            // Type: Bool and Null
            // Default: false
            // Gets or sets the ckeck state.
            // Possible Values: true, false and null.
            this.checked = false;
            // Type: Bool
            // Default: false
            // Gets or sets whether the checkbox has 3 states - checked, unchecked and indeterminate.
            this.hasThreeStates = false;
            // Type: Bool
            // Default: false
            // Gets whether the CheckBox is disabled.
            this.disabled = false;
            // Type: Bool
            // Default: true
            // Gets or sets whether the clicks on the container are handled as clicks on the check box.
            this.enableContainerClick = true;
            // Type: Bool
            // Default: true
            // Gets or sets whether the checkbox is locked. In this mode the user is not allowed to check/uncheck the checkbox.
            this.locked = false;
            // Type: String
            // Default: ''
            // Gets or sets the group name. When this property is set, the checkboxes in the same group behave as radio buttons.
            this.groupName = '';
            this.keyboardCheck = true;
            this.enableHover = true;
            this.hasInput = true;
            this.rtl = false;
            // 'checked' is triggered when the checkbox is checked.
            // 'unchecked' is triggered when the checkbox is unchecked.
            // 'indeterminate' is triggered when the checkbox's ckecked property is going to be null.
            // 'change' is triggered when the checkbox's state is changed.
            this.events =
			 [
			    'checked', 'unchecked', 'indeterminate', 'change'
             ];
        },

        createInstance: function (args) {
            this.render();
        },

        _addInput: function()
        {
            if (this.hasInput) {
                var name = this.host.attr('name');
                if (!name) name = this.element.id;
                this.input = $("<input type='hidden'/>");
                this.host.append(this.input);
                this.input.attr('name', name);
                this.input.val(this.checked);
            }
        },

        render: function()
        {
            this.init = true;
            var me = this;
            this.setSize();
            this.propertyChangeMap['width'] = function (instance, key, oldVal, value) {
                me.setSize();
            };

            this.propertyChangeMap['height'] = function (instance, key, oldVal, value) {
                me.setSize();
            };
            if (this.checkbox) {
                this.checkbox.remove();
            }

            this.checkbox = $('<div><div><span></span></div></div>');
            this.host.attr('tabIndex', 0);
            this.host.prepend(this.checkbox);
            this.host.append($('<div style="clear: both;"></div>'));

            this.checkMark = $(this.checkbox).find('span');
            this.box = $(this.checkbox).find('div');

            this.box.addClass(this.toThemeProperty('jqx-checkbox-default'));
            this.box.addClass(this.toThemeProperty('jqx-fill-state-normal'));
            this.box.addClass(this.toThemeProperty('jqx-rc-all'));

            if (this.disabled) {
                this.disable();
            }

            this.host.addClass(this.toThemeProperty('jqx-widget'));
            this.host.addClass(this.toThemeProperty('jqx-checkbox'));

            if (this.locked) {
                this.host.css('cursor', 'auto');
            }

            var checked = this.element.getAttribute('checked');
            if (checked == 'checked' || checked == 'true' || checked == true) {
                this.checked = true;
            }

            this._addInput();
            this._render();
            this._addHandlers();
            this.init = false;
        },

        refresh: function (initialRefresh) {
            if (!initialRefresh) {
                this.setSize();
                this._render();
            }
        },

        setSize: function () {
            if (this.width != null && this.width.toString().indexOf("px") != -1) {
                this.host.width(this.width);
            }
            else
                if (this.width != undefined && !isNaN(this.width)) {
                    this.host.width(this.width);
                };

            if (this.height != null && this.height.toString().indexOf("px") != -1) {
                this.host.height(this.height);
            }
            else if (this.height != undefined && !isNaN(this.height)) {
                this.host.height(this.height);
            };
        },

        _addHandlers: function () {
            var me = this;

            var isTouchDevice = $.jqx.mobile.isTouchDevice();
            var eventName = 'click';
            if (isTouchDevice) eventName = 'touchend';

            this.addHandler(this.box, eventName, function (event) {
                if (!me.disabled && !me.enableContainerClick && !me.locked) {
                    me.toggle();
                    if (me.updated) {
                        event.owner = me;
                        me.updated(event, me.checked, me.oldChecked);
                    }
                    event.preventDefault();
                    return false;
                }
            });

            this.addHandler(this.host, 'keydown', function (event) {
                if (!me.disabled && !me.locked && me.keyboardCheck) {
                    if (event.keyCode == 32) {
                        me.toggle();
                        event.preventDefault();
                        return false;
                    }
                }
            });

            this.addHandler(this.host, eventName, function (event) {
                if (!me.disabled && me.enableContainerClick && !me.locked) {
                    me.toggle();
                    event.preventDefault();
                    return false;
                }
            });

            this.addHandler(this.host, 'selectstart', function (event) {
                if (!me.disabled && me.enableContainerClick) {
                    event.preventDefault();
                    return false;
                }
            });

            this.addHandler(this.host, 'mouseup', function (event) {
                if (!me.disabled && me.enableContainerClick) {
                    event.preventDefault();
                }
            });


            this.addHandler(this.host, 'focus', function (event) {
                if (!me.disabled && !me.locked) {
                    if (me.enableHover) {
                        me.box.addClass(me.toThemeProperty('jqx-checkbox-hover'));
                    }
                    me.box.addClass(me.toThemeProperty('jqx-fill-state-focus'));
                    event.preventDefault();
                    me.hovered = true;
                    return false;
                }
            });

            this.addHandler(this.host, 'blur', function (event) {
                if (!me.disabled && !me.locked) {
                    if (me.enableHover) {
                        me.box.removeClass(me.toThemeProperty('jqx-checkbox-hover'));
                    }
                    me.box.removeClass(me.toThemeProperty('jqx-fill-state-focus'));
                    event.preventDefault();
                    me.hovered = false;
                    return false;
                }
            });

            this.addHandler(this.host, 'mouseenter', function (event) {
                if (me.locked) {
                    me.host.css('cursor', 'arrow')
                }
                if (me.enableHover) {
                    if (!me.disabled && me.enableContainerClick && !me.locked) {
                        me.box.addClass(me.toThemeProperty('jqx-checkbox-hover'));
                        me.box.addClass(me.toThemeProperty('jqx-fill-state-hover'));
                        event.preventDefault();
                        me.hovered = true;
                        return false;
                    }
                }
            });

            this.addHandler(this.host, 'mouseleave', function (event) {
                if (me.enableHover) {
                    if (!me.disabled && me.enableContainerClick && !me.locked) {
                        me.box.removeClass(me.toThemeProperty('jqx-checkbox-hover'));
                        me.box.removeClass(me.toThemeProperty('jqx-fill-state-hover'));
                        event.preventDefault();
                        me.hovered = false;
                        return false;
                    }
                }
            });


            this.addHandler(this.box, 'mouseenter', function () {
                if (me.locked) {
                    return;
                }

                if (!me.disabled && !me.enableContainerClick) {
                    me.box.addClass(me.toThemeProperty('jqx-checkbox-hover'));
                    me.box.addClass(me.toThemeProperty('jqx-fill-state-hover'));
                }
            });

            this.addHandler(this.box, 'mouseleave', function () {
                if (!me.disabled && !me.enableContainerClick) {
                    me.box.removeClass(me.toThemeProperty('jqx-checkbox-hover'));
                    me.box.removeClass(me.toThemeProperty('jqx-fill-state-hover'));
                }
            });
        },

        focus: function () {
            try {
                this.host.focus();
            }
            catch (error) {
            }
        },

        _removeHandlers: function () {
            var isTouchDevice = $.jqx.mobile.isTouchDevice();
            var eventName = 'click';
            if (isTouchDevice) eventName = 'touchend';

            this.removeHandler(this.box, eventName);
            this.removeHandler(this.box, 'mouseenter');
            this.removeHandler(this.box, 'mouseleave');
            this.removeHandler(this.host, eventName);
            this.removeHandler(this.host, 'mouseup');
            this.removeHandler(this.host, 'selectstart');
            this.removeHandler(this.host, 'mouseenter');
            this.removeHandler(this.host, 'mouseleave');
            this.removeHandler(this.host, 'keydown');
            this.removeHandler(this.host, 'blur');
            this.removeHandler(this.host, 'focus');
        },

        _render: function () {
            if (this.boxSize == null) this.boxSize = 13;

            this.box.width(this.boxSize);
            this.box.height(this.boxSize);
            this.checkMark.width(this.boxSize);
            this.checkMark.height(this.boxSize);

            if (!this.disabled) {
                if (this.enableContainerClick) {
                    this.host.css('cursor', 'pointer');
                }
                else this.host.css('cursor', 'auto');
            }
            else {
                this.disable();
            }
            if (this.rtl) {
                this.box.addClass(this.toThemeProperty('jqx-checkbox-rtl'));
                this.host.addClass(this.toThemeProperty('jqx-rtl'));
            }

            this.updateStates();
        },

        _setState: function (checked) {
            if (this.checked != checked) {
                this.checked = checked;
                this.checkMark.removeClass();
                if (this.checked) {
                    this.checkMark.addClass(this.toThemeProperty('jqx-checkbox-check-checked'));
                    this.checkMark.css('opacity', 1);
                }
                else if (this.checked == null) {
                    this.checkMark.addClass(this.toThemeProperty('jqx-checkbox-check-indeterminate'));
                    this.checkMark.css('opacity', 1);
                }
            }
        },

        // checks the ckeckbox.
        check: function () {
            this.checked = true;
            var me = this;
            this.checkMark.removeClass();

            if ($.jqx.browser.msie) {
                this.checkMark.addClass(this.toThemeProperty('jqx-checkbox-check-checked'));
            }
            else {
                this.checkMark.addClass(this.toThemeProperty('jqx-checkbox-check-checked'));
                this.checkMark.css('opacity', 0);
                this.checkMark.stop().animate({ opacity: 1 }, this.animationShowDelay, function () {
                });
            }

            var checkboxes = $.find(this.toThemeProperty('.jqx-checkbox', true));

            if (this.groupName != null && this.groupName.length > 0) {
                $.each(checkboxes, function () {
                    var groupName = $(this).jqxCheckBox('groupName');
                    if (groupName == me.groupName && this != me.element) {
                        $(this).jqxCheckBox('uncheck')
                    }
                });
            }

            this._raiseEvent('0', true);
            this._raiseEvent('3', { checked: true });
            if (this.input != undefined) {
                this.input.val(this.checked);
            }
        },

        // unchecks the checkbox.
        uncheck: function () {
            this.checked = false;
            var me = this;

            if ($.jqx.browser.msie) {
                me.checkMark.removeClass();
            }
            else {
                this.checkMark.css('opacity', 1);
                this.checkMark.stop().animate({ opacity: 0 }, this.animationHideDelay, function () {
                    me.checkMark.removeClass();
                });
            }

            this._raiseEvent('1');
            this._raiseEvent('3', { checked: false });
            if (this.input != undefined) {
                this.input.val(this.checked);
            }
        },

        // sets the indeterminate state.
        indeterminate: function () {
            this.checked = null;
            this.checkMark.removeClass();

            if ($.jqx.browser.msie) {
                this.checkMark.addClass(this.toThemeProperty('jqx-checkbox-check-indeterminate'));
            }
            else {
                this.checkMark.addClass(this.toThemeProperty('jqx-checkbox-check-indeterminate'));
                this.checkMark.css('opacity', 0);
                this.checkMark.stop().animate({ opacity: 1 }, this.animationShowDelay, function () {
                });
            }

            this._raiseEvent('2');
            this._raiseEvent('3', { checked: null });
            if (this.input != undefined) {
                this.input.val(this.checked);
            }
        },

        // toggles the check state.
        toggle: function () {
            if (this.disabled)
                return;

            if (this.locked)
                return;

            if (this.groupName != null && this.groupName.length > 0) {
                if (this.checked != true) {
                    this.checked = true;
                    this.updateStates();
                }
                return;
            }

            this.oldChecked = this.checked;
            if (this.checked == true) {
                this.checked = this.hasThreeStates ? null : false;
            }
            else {
                this.checked = this.checked != null;
            }

            this.updateStates();
            if (this.input != undefined) {
                this.input.val(this.checked);
            }
        },

        // updates check states depending on the value of the 'checked' property.
        updateStates: function () {
            if (this.checked) {
                this.check();
            }
            else if (this.checked == false) {
                this.uncheck();
            }
            else if (this.checked == null) {
                this.indeterminate();
            }
        },

        // disables the checkbox.
        disable: function () {
            this.disabled = true;

            if (this.checked == true) {
                this.checkMark.addClass(this.toThemeProperty('jqx-checkbox-check-disabled'));
            }
            else if (this.checked == null) {
                this.checkMark.addClass(this.toThemeProperty('jqx-checkbox-check-indeterminate-disabled'));
            }
            this.box.addClass(this.toThemeProperty('jqx-checkbox-disabled-box'));
            this.host.addClass(this.toThemeProperty('jqx-checkbox-disabled'));
            this.host.addClass(this.toThemeProperty('jqx-fill-state-disabled'));
            this.box.addClass(this.toThemeProperty('jqx-checkbox-disabled'));
        },

        // enables the checkbox.
        enable: function () {
            if (this.checked == true) {
                this.checkMark.removeClass(this.toThemeProperty('jqx-checkbox-check-disabled'));
            }
            else if (this.checked == null) {
                this.checkMark.removeClass(this.toThemeProperty('jqx-checkbox-check-indeterminate-disabled'));
            }
            this.box.removeClass(this.toThemeProperty('jqx-checkbox-disabled-box'));
            this.host.removeClass(this.toThemeProperty('jqx-checkbox-disabled'));
            this.host.removeClass(this.toThemeProperty('jqx-fill-state-disabled'));
            this.box.removeClass(this.toThemeProperty('jqx-checkbox-disabled'));
            this.disabled = false;
        },

        destroy: function () {
            this.host.remove();
        },

        _raiseEvent: function (id, args) {
            if (this.init) return;
            var evt = this.events[id];
            var event = new jQuery.Event(evt);
            event.owner = this;
            event.args = args;

            try {
                var result = this.host.trigger(event);
            }
            catch (error) {
            }

            return result;
        },

        propertyChangedHandler: function (object, key, oldvalue, value) {
            if (this.isInitialized == undefined || this.isInitialized == false)
                return;

            if (key == object.enableContainerClick && !object.disabled && !object.locked) {
                if (value) {
                    object.host.css('cursor', 'pointer');
                }
                else object.host.css('cursor', 'auto');
            }

            if (key == "rtl") {
                if (value) {
                    object.box.addClass(object.toThemeProperty('jqx-checkbox-rtl'));
                    object.host.addClass(object.toThemeProperty('jqx-rtl'));
                }
                else
                {
                    object.box.removeClass(object.toThemeProperty('jqx-checkbox-rtl'));
                    object.host.removeClass(object.toThemeProperty('jqx-rtl'));
                }
            }

            if (key == 'theme') {
                $.jqx.utilities.setTheme(oldvalue, value, object.host);
            }

            if (key == 'checked') {
                if (value != oldvalue) {
                    switch (value) {
                        case true:
                            object.check();
                            break;
                        case false:
                            object.uncheck();
                            break;
                        case null:
                            object.indeterminate();
                            break;
                    }
                }
            }

            if (key == 'disabled') {
                if (value != oldvalue) {
                    if (value) {
                        object.disable();
                    } else object.enable();
                }
            }
        }
    });
})(jQuery);
