/*
jQWidgets v2.7.0 (2013-Feb-08)
Copyright (c) 2011-2013 jQWidgets.
License: http://jqwidgets.com/license/
*/

(function ($) {

    $.jqx.jqxWidget("jqxDateTimeInput", "", {});

    $.extend($.jqx._jqxDateTimeInput.prototype, {

        defineInstance: function () {
            if (this.value == undefined) {
                this.value = $.jqx._jqxDateTimeInput.getDateTime(new Date());
                this.value._setHours(0);
                this.value._setMinutes(0);
                this.value._setSeconds(0);
                this.value._setMilliseconds(0);
            }
            if (this.minDate == undefined) {
                this.minDate = $.jqx._jqxDateTimeInput.getDateTime(new Date());
                this.minDate._setYear(1900);
                this.minDate._setMonth(1);
                this.minDate._setDay(1);
                this.minDate._setHours(1);
                this.minDate._setMinutes(1);
                this.minDate._setSeconds(1);
                this.minDate._setMilliseconds(1);
            }

            if (this.maxDate == undefined) {
                this.maxDate = $.jqx._jqxDateTimeInput.getDateTime(new Date());
                this.maxDate._setYear(2100);
                this.maxDate._setMonth(1);
                this.maxDate._setDay(1);
                this.maxDate._setHours(1);
                this.maxDate._setMinutes(1);
                this.maxDate._setSeconds(1);
                this.maxDate._setMilliseconds(1);
            }
            // Type: Number.
            // Default: 0
            // Gets or sets the first day of the week - Sunday = 0, Monday = 1, Tuesday = 2, Wednesday = 3, Thursday = 4, Friday = 5, Saturday = 6.
            if (this.firstDayOfWeek == undefined) {
                this.firstDayOfWeek = 0;
            }
            // Type: Boolean.
            // Default: false.
            // Shows or hides the week numbers.
            if (this.showWeekNumbers == undefined) {
                this.showWeekNumbers = false;
            }
            // store value in cookie
            this.cookies = false;
            this.cookieoptions = null;
            this.showFooter = false;
            //Type: String.
            //Default: null.
            //Sets the masked input's formatString.
            // Available ready to use patterns:
            // short date pattern: "d",
            // long date pattern: "D"
            // short time pattern: "t"
            // long time pattern: "T"
            // long date, short time pattern: "f"
            // long date, long time pattern: "F"
            // month/day pattern: "M"
            // month/year pattern: "Y"    
            // sortable format that does not vary by culture: "S"
            if (this.formatString == undefined) {
                this.formatString = "dd/MM/yyyy";
            }
            //Type: Number.
            //Default: 0.
            //Sets width of the masked input in pixels. Only positive values have effect.
            if (this.width == undefined) {
                this.width = null;
            }

            //Type: Number.
            //Default: 0.
            //Sets height of the masked input in pixels. 
            if (this.height == undefined) {
                this.height = null;
            }

            // Type: String.
            // Gets or sets the string format of the day names.
            // Possible values: default, shortest, firstTwoLetters, firstLetter, full
            if (this.dayNameFormat == undefined) {
                this.dayNameFormat = 'firstTwoLetters';
            }

            // Type: String
            // Sets the  text alignment.
            if (this.textAlign == undefined) {
                this.textAlign = 'left';
            }

            // Type: Boolean
            // Default: false
            // Sets the readonly state of the input.
            if (this.readonly == undefined) {
                this.readonly = false;
            }

            // Type: String
            // sets the culture.
            // Default: 'default'
            if (this.culture == undefined) {
                this.culture = "default";
            }

            this.activeEditor = this.activeEditor || null;

            // Type: Boolean
            // Default:true.
            // shows or hides the calendar's button.
            if (this.showCalendarButton == undefined) {
                this.showCalendarButton = true;
            }
            // Type: Number
            // Default: 100
            // Sets the animation's duration when the calendar is displayed.
            if (this.openDelay == undefined) {
                this.openDelay = 350;
            }

            // Type: Number
            // Default: 200
            // Sets the animation's duration when the calendar is going to be hidden.
            if (this.closeDelay == undefined) {
                this.closeDelay = 400;
            }

            // Type: Boolean
            // Default: true
            // Sets whether to close the calendar after selecting a date.
            if (this.closeCalendarAfterSelection == undefined) {
                this.closeCalendarAfterSelection = true;
            }
            // internal property
            this.isEditing = false;
            // Type: Boolean.
            // enables the browser window bounds detection.
            // Default: false.
            this.enableBrowserBoundsDetection = false;
            this.dropDownHorizontalAlignment = 'left';
            // Type: Boolean
            // Enables absolute date selection. When this property is true, the user selects one symbol at a time instead of a group of symbols.
            // Default: false
            this.enableAbsoluteSelection = false;
            // Type: Boolean
            // Enables or disables the DateTimeInput.
            // Default: false
            this.disabled = false;
            // Type: Number
            // Default: 18
            // Sets the button's size.
            this.buttonSize = 18;
            // default, none
            // Type: String.
            // enables or disables the animation.
            this.animationType = 'slide';
            // Type: String
            // Default: auto ( the drop down takes the combobox's width.)
            // Sets the popup's width.
            this.dropDownWidth = '200px';
            // Type: String
            // Default: 200px ( the height is 200px )
            // Sets the popup's height.
            this.dropDownHeight = '200px';
            // 'none', 'range', 'default'
            this.selectionMode = 'default';
            this.rtl = false;
            this._editor = false;
            this.todayString = 'Today';
            this.clearString = 'Clear';

            // DateTimeInput events.
            this.events =
			[
            // Occurs when the value is changed.
		  	   'valuechanged',
            // Occurs when the text is changed.
               'textchanged',
            // Occurs when the mouse button is clicked.
               'mousedown',
            // Occurs when the mouse button is clicked.
               'mouseup',
            // Occurs when the user presses a key. 
               'keydown',
            // Occurs when the user presses a key. Fired after keydown and keypress
               'keyup',
            // Occurs when the user presses a key.
               'keypress',
            // Occurs when the calendar is opened.
               'open',
            // Occurs when the calendar is hidden.
               'close'
			];
        },

        // creates the masked input's instance. 
        createInstance: function (args) {
            this.render();
        },

        render: function () {
            this._removeHandlers();
            this.element.innerHTML = "";
            this.host
		    .attr({
		        role: "dateTimeInput"
		    });
            this.id = $.jqx.utilities.createId();
            var id = this.createID();
            var buttonid = this.createID();
            var dateTimeInputStructure = $("<div style='overflow: hidden; border: 0px;'>" +
                "<div id='dateTimeWrapper' style='float: none; position: relative; width: 100%; height: 100%;'>" +
                "<div id='dateTimeContent" + id + "' style='position: relative; overflow: hidden; float: left;'/>" +
                "<div id='dateTimeButton" + buttonid + "' style='position: relative; float: right;'/>" +
                "</div>" +
                "</div>");

            this._setSize();
            if (this.width == null) {
                this.width = this.host.width();
                this.host.width(this.width);
            }

            this.touch = $.jqx.mobile.isTouchDevice();

            this.host.append(dateTimeInputStructure);
            this.dateTimeWrapper = this.host.find('#dateTimeWrapper');
            this.inputElement = this.host.find("#dateTimeContent" + id);
            this.calendarElement = this.host.find("#dateTimeButton" + buttonid);
            this.dateTimeInput = $("<input autocomplete='off' style='position: relative; border: none; margin: 0; padding: 0;' id='inputElement' class='jqx-input-content' type='textarea'/>").appendTo(this.inputElement);
            this.dateTimeInput.removeClass(this.toThemeProperty("jqx-input-content"));
            this.dateTimeInput.addClass(this.toThemeProperty("jqx-input-content"));
            this.dateTimeInput.addClass(this.toThemeProperty("jqx-widget-content"));
            var name = this.host.attr('name');
            if (!name) name = this.element.id;
            this.dateTimeInput.attr('name', name);
            if (this.rtl) {
                this.dateTimeInput.css('direction', 'rtl');
                this.dateTimeInput.addClass('jqx-rtl');
                this.inputElement.css('float', 'right');
                this.calendarElement.css('float', 'left');
            }

            this.inputElement.addClass(this.toThemeProperty("jqx-input"));
            this.inputElement.addClass(this.toThemeProperty("jqx-widget-content"));
            this.inputElement.addClass(this.toThemeProperty("jqx-rc-all"));
            this.inputElement.height(this.host.height() - 2);

            this.calendarButton = $("<div style='padding: 0px; margin: 0px; top: 0; font-size: 3px; position: relative;' class='jqx-input-button-header'>"
            + "<div style='position: relative; font-size: 3px;' class='jqx-input-button-innerheader'></div></div><div style='padding: 0px; margin: 0px; top: 0; position: relative;' class='jqx-input-button-content'/>").appendTo(this.calendarElement);
            this.calendarButtonContent = this.host.find(".jqx-input-button-content");
            this.calendarButtonHeader = this.host.find(".jqx-input-button-header");
            this.calendarButtonInnerHeader = this.host.find(".jqx-input-button-innerheader");
            this.calendarButtonContent.removeClass(this.toThemeProperty("jqx-input-button-content"));
            this.calendarButtonContent.addClass(this.toThemeProperty("jqx-input-button-content"));
            this.calendarButtonContent.removeClass(this.toThemeProperty("jqx-widget-content"));
            this.calendarButtonContent.addClass(this.toThemeProperty("jqx-widget-content"));
            this.calendarButtonHeader.removeClass(this.toThemeProperty("jqx-input-button-header"));
            this.calendarButtonHeader.addClass(this.toThemeProperty("jqx-input-button-header"));
            this.calendarButtonHeader.removeClass(this.toThemeProperty("jqx-widget-header"));
            this.calendarButtonHeader.addClass(this.toThemeProperty("jqx-widget-header"));
            this.calendarButtonInnerHeader.removeClass(this.toThemeProperty("jqx-input-button-innerHeader"));
            this.calendarButtonInnerHeader.addClass(this.toThemeProperty("jqx-input-button-innerHeader"));

            var me = this;
            this._arrange();
            this.addHandler(this.host, 'loadContent', function (event) {
                me._arrange();
            });

            if (this.showCalendarButton) {
                this.calendarButton.css('display', 'block');
            }
            else {
                this.calendarButton.css('display', 'none');
            }

            if ($.jqx._jqxCalendar != null && $.jqx._jqxCalendar != undefined) {
                try {
                    var calendarID = 'calendar' + this.id;
                    var oldContainer = $($.find('#' + calendarID));
                    if (oldContainer.length > 0) {
                        oldContainer.remove();
                    }

                    var container = $("<div style='overflow: hidden; background: transparent; position: absolute;' id='calendar" + this.id + "'><div id='innerCalendar" + this.id + "'></div></div>");
                    if ($.jqx.utilities.getBrowser().browser == 'opera') {
                        container.hide();
                    }
                    container.appendTo(document.body);
                    this.container = container;
                    this.calendarContainer = $($.find('#innerCalendar' + this.id)).jqxCalendar({ todayString: this.todayString, clearString: this.clearString, dayNameFormat: this.dayNameFormat, rtl: this.rtl, culture: this.culture, showFooter: this.showFooter, selectionMode: this.selectionMode, firstDayOfWeek: this.firstDayOfWeek, showWeekNumbers: this.showWeekNumbers, width: this.dropDownWidth, height: this.dropDownHeight, theme: this.theme });
                    this.calendarContainer.css({ position: 'absolute', zIndex: 100000, top: 0, left: 0 });
                    this.calendar = $.data(this.calendarContainer[0], "jqxCalendar").instance;
                    var me = this;
                    this.calendar.today = function () {
                        me.setDate(new Date);
                        me.hideCalendar();
                    }
                    this.calendar.clear = function () {
                        me.setDate(null);
                        me.hideCalendar();
                    }

                    this.calendar.render();
                    if ($.jqx.utilities.getBrowser().browser == 'opera') {
                        container.show();
                    }
                    container.height(parseInt(this.calendarContainer.height()) + 25);
                    container.width(parseInt(this.calendarContainer.width()) + 25);

                    if (this.selectionMode == 'range') {
                        this.readonly = true;
                    }

                    if (this.animationType == 'none') {
                        this.container.css('display', 'none');
                    }
                    else {
                        this.container.hide();
                    }

                }
                catch (e) {

                }
            }

            if ($.global == null || $.global == undefined) {
                throw "jquery.global.js is not loaded.";
            }

            $.global.preferCulture(this.culture);

            this.selectedText = "";

            this._addHandlers();
            this.self = this;
            this.oldValue = this.getDate();
            this.items = new Array();
            this.editors = new Array();

            if (this.value) {
                this.calendarButtonContent.html("<div style='line-height: 16px;  color: inherit; background: transparent; margin: 0; border: 0; padding: 0px; text-align: center; vertical-align: middle;'>" + "<b style='border: 0; padding: 0px; margin: 0px; background: transparent;'>" + this.value.day + "</b>" + "</div>");
            }
            this._loadItems();
            this.editorText = "";

            if (this.readonly == true) {
                this.dateTimeInput.css("readonly", this.readonly);
            }

            this.dateTimeInput.css("text-align", this.textAlign);
            this.host.addClass(this.toThemeProperty('jqx-widget'));

            this.propertyChangeMap['disabled'] = function (instance, key, oldVal, value) {
                if (value) {
                    instance.host.addClass(me.toThemeProperty('jqx-input-disabled'));
                    instance.dateTimeInput.addClass(me.toThemeProperty('jqx-input-disabled'));
                    instance.host.addClass(me.toThemeProperty('jqx-fill-state-disabled'));
                }
                else {
                    instance.host.removeClass(me.toThemeProperty('jqx-fill-state-disabled'));
                    instance.host.removeClass(me.toThemeProperty('jqx-input-disabled'));
                    instance.dateTimeInput.removeClass(me.toThemeProperty('jqx-input-disabled'));
                }
            }

            if (this.disabled) {
                this.host.addClass(this.toThemeProperty('jqx-input-disabled'));
                this.host.addClass(this.toThemeProperty('jqx-input-disabled'));
                this.dateTimeInput.addClass(this.toThemeProperty('jqx-input-disabled'));
            }

            if (this.host.parents('form').length > 0) {
                this.host.parents('form').on('reset', function () {
                    setTimeout(function () {
                        me.setDate(new Date());
                    }, 10);
                });
            }

            if (this.cookies) {
                var date = $.jqx.cookie.cookie("jqxDateTimeInput" + this.element.id);
                if (date != null) {
                    this.setDate(new Date(date));
                }
            }

            // fix for IE7
            if ($.jqx.browser.msie && $.jqx.browser.version < 8) {
                if (this.host.parents('.jqx-window').length > 0) {
                    var zIndex = this.host.parents('.jqx-window').css('z-index');
                    container.css('z-index', zIndex + 10);
                    this.calendarContainer.css('z-index', zIndex + 10);
                }
            }
        },

        _setSize: function () {
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

            var isPercentage = false;
            if (this.width != null && this.width.toString().indexOf("%") != -1) {
                isPercentage = true;
                this.host.width(this.width);
            }

            if (this.height != null && this.height.toString().indexOf("%") != -1) {
                isPercentage = true;
                this.host.height(this.height);
            }

            if (isPercentage) {
                var me = this;
                if (this.calendarContainer) {
                    this.refresh(false);
                    var width = this.host.width();
                    if (this.dropDownWidth != 'auto') {
                        width = this.dropDownWidth;
                    }
                    this.calendarContainer.jqxCalendar({ width: width });
                    this.container.width(parseInt(width) + 25);
                }

                var resizeFunc = function () {
                    if (me.calendarContainer) {
                        me._arrange();
                        if (me.dropDownWidth == 'auto') {
                            var width = me.host.width();
                            me.calendarContainer.jqxCalendar({ width: width });
                            me.container.width(parseInt(width) + 25);
                        }
                    }
                }

                $(window).off('resize.' + this.id);
                $(window).on('resize.' + this.id, function () {
                    resizeFunc();
                });
            }
        },

        _arrange: function () {
            var width = parseInt(this.host.width());
            var height = parseInt(this.host.height());
            var buttonSize = this.buttonSize;
            var rightOffset = 3;
            this.calendarButtonHeader.width(buttonSize);
            this.calendarButtonContent.height(buttonSize - rightOffset);
            this.calendarButtonContent.width(buttonSize);
            this.inputElement.height(height - 2);

            var inputElementOffset = parseInt(this.inputElement.outerHeight()) - parseInt(this.inputElement.height());
            inputElementOffset = 0;

            var contentWidth = width - parseInt(this.calendarButton.outerWidth()) - 1 * rightOffset;
            if (contentWidth > 0) {
                this.inputElement.width(contentWidth + 'px');
            }

            this.dateTimeInput.width(contentWidth - rightOffset + 'px');
            this.dateTimeInput.css('left', 0);
            this.dateTimeInput.css('top', 0);
            this.inputElement.css('left', 0);
            this.inputElement.css('top', 0);

            var buttonMiddle = parseInt(this.calendarButtonHeader.outerWidth()) / 2 - parseInt(this.calendarButtonInnerHeader.outerWidth()) / 2;
            this.calendarButtonInnerHeader.css('left', buttonMiddle);
            var buttonsHeight = parseInt(this.calendarButtonContent.outerHeight()) + parseInt(this.calendarButtonHeader.outerHeight());
            var top = parseInt(this.inputElement.outerHeight()) / 2 - buttonsHeight / 2;
            this.calendarElement.css('top', parseInt(top) + 'px');

            var inputHeight = this.dateTimeInput.outerHeight();
            if (inputHeight == 0) {
                inputHeight = parseInt(this.dateTimeInput.css('font-size')) + 3;
            }
            var inputTop = parseInt(this.inputElement.height()) / 2 - parseInt(inputHeight) / 2;
            this.dateTimeInput.css('margin', '0px');
            this.dateTimeInput.css('padding', '0px');
            this.dateTimeInput.css('top', parseInt(inputTop));
        },

        _removeHandlers: function () {
            var me = this;
            this.removeHandler($(document), 'mousedown.' + this.id);
            if (this.dateTimeInput) {
                this.removeHandler(this.dateTimeInput, 'keydown.' + this.id);
                this.removeHandler(this.dateTimeInput, 'blur');
                this.removeHandler(this.dateTimeInput, 'focus');
                this.removeHandler(this.dateTimeInput, 'mousedown');
                this.removeHandler(this.dateTimeInput, 'mouseup');
                this.removeHandler(this.dateTimeInput, 'keydown');
                this.removeHandler(this.dateTimeInput, 'keyup');
                this.removeHandler(this.dateTimeInput, 'keypress');
            }
            if (this.calendarButton != null) {
                this.removeHandler(this.calendarButton, 'mousedown');
            }
            if (this.calendarContainer != null) {
                this.removeHandler(this.calendarContainer, 'cellSelected');
                this.removeHandler(this.calendarContainer, 'cellMouseDown');
            }
        },

        isOpened: function () {
            var me = this;
            var openedCalendar = $.data(document.body, "openedJQXCalendar" + this.id);
            if (openedCalendar != null && openedCalendar == me.calendarContainer) {
                return true;
            }

            return false;
        },

        wheel: function (event, self) {
            var delta = 0;
            if (!event) /* For IE. */
                event = window.event;
            if (event.originalEvent && event.originalEvent.wheelDelta) {
                event.wheelDelta = event.originalEvent.wheelDelta;
            }
            if (event.wheelDelta) { /* IE/Opera. */
                delta = event.wheelDelta / 120;
            } else if (event.detail) { /** Mozilla case. */
                delta = -event.detail / 3;
            }

            if (delta) {
                var result = self._handleDelta(delta);
                if (!result) {
                    if (event.preventDefault)
                        event.preventDefault();
                    event.returnValue = false;
                    return result;
                }
                else return false;
            }

            if (event.preventDefault)
                event.preventDefault();
            event.returnValue = false;
        },

        _handleDelta: function (delta) {
            if (delta < 0) {
                this.spinDown();
            }
            else this.spinUp();

            return false;
        },

        focus: function () {
            try {

                this.dateTimeInput.focus();
            }
            catch (error) {
            }
        },

        _addHandlers: function () {
            var id = this.element.id;
            var el = this.element;
            var me = this;

            this.addHandler(this.host, 'mousewheel', function (event) {
                me.wheel(event, me);
            });

            this.addHandler($(document), 'mousedown.' + this.id, this._closeOpenedCalendar, { me: this });

            this.addHandler(this.dateTimeInput, 'keydown.' + this.id, function (event) {
                var openedCalendar = $.data(document.body, "openedJQXCalendar" + me.id);
                if (openedCalendar != null && openedCalendar == me.calendarContainer) {
                    var result = me.handleCalendarKey(event, me);
                    return result;
                }
            });

            if (this.calendarContainer != null) {
                this.addHandler(this.calendarContainer, 'keydown', function (event) {
                    if (event.keyCode == 13) {
                        if (me.isOpened()) {
                            me.hideCalendar('selected');
                            me.dateTimeInput.focus();
                            return false;
                        }
                        return true;
                    }
                    else if (event.keyCode == 27) {
                        if (me.isOpened()) {
                            me.hideCalendar();
                            me.dateTimeInput.focus();
                            return false;
                        }
                        return true;
                    }
                    if (event.keyCode == 115) {
                        if (me.isOpened()) {
                            me.hideCalendar();
                            me.dateTimeInput.focus();
                            return false;
                        }
                        else if (!me.isOpened()) {
                            me.showCalendar();
                            me.dateTimeInput.focus();
                            return false;
                        }
                    }

                    if (event.altKey) {
                        if (event.keyCode == 38) {
                            if (me.isOpened()) {
                                me.hideCalendar();
                                me.dateTimeInput.focus();
                                return false;
                            }
                        }
                        else if (event.keyCode == 40) {
                            if (!me.isOpened()) {
                                me.showCalendar();
                                me.dateTimeInput.focus();
                                return false;
                            }
                        }
                    }
                });

                this.addHandler(this.calendarContainer, 'cellSelected',
                function (event) {
                    if (me.closeCalendarAfterSelection) {
                        var calendarOldValue = $.data(document.body, "openedJQXCalendarValue");
                        if (event.args.selectionType == 'mouse') {
                            if (me.selectionMode == 'default') {
                                me.hideCalendar('selected');
                            }
                            else {
                                if (me.calendar._clicks == 0) {
                                    me.hideCalendar('selected');
                                }
                            }
                        }
                    }
                });

                this.addHandler(this.calendarContainer, 'cellMouseDown',
                function (event) {
                    if (me.closeCalendarAfterSelection) {
                        if (me.calendar.value) {
                            $.data(document.body, "openedJQXCalendarValue", new $.jqx._jqxDateTimeInput.getDateTime(me.calendar.value.dateTime));
                        }
                    }
                });
            }

            this.addHandler(this.dateTimeInput, 'blur', function () {
                if (me.value != null) {
                    me.isEditing = false;
                    me._validateValue();
                    me._updateText();
                    me.inputElement.removeClass(me.toThemeProperty('jqx-fill-state-focus'));
                }
            });

            this.addHandler(this.dateTimeInput, 'focus', function (event) {
                if (me.value != null) {
                    var selection = me._selection();
                    me.isEditing = true;
                    me._validateValue();
                    me._updateText();
                    me._setSelectionStart(selection.start);
                    me._selectGroup(-1);
                    me.inputElement.addClass(me.toThemeProperty('jqx-fill-state-focus'));
                }
                if (event.preventDefault) {
                    event.preventDefault();
                    return false;
                }
            });

            var eventName = 'mousedown';
            if (this.touch) {
                eventName = $.jqx.mobile.getTouchEventName('touchstart');
            }

            this.addHandler(this.calendarButton, eventName,
                function (event) {
                    var calendar = me.container;
                    var isOpen = calendar.css('display') == 'block';
                    if (!me.disabled) {
                        if (!me.isanimating) {
                            if (isOpen) {
                                me.hideCalendar();
                            }
                            else {
                                me.showCalendar();
                                event.preventDefault();
                            }
                        }
                    }
                });

            this.addHandler(this.dateTimeInput, 'mousedown',
            function (event) {
                return me._raiseEvent(2, event)
            });

            this.addHandler(this.dateTimeInput, 'mouseup',
            function (event) {
                return me._raiseEvent(3, event)
            });

            this.addHandler(this.dateTimeInput, 'keydown',
            function (event) {
                return me._raiseEvent(4, event)
            });

            this.addHandler(this.dateTimeInput, 'keyup',
            function (event) {
                return me._raiseEvent(5, event)
            });

            this.addHandler(this.dateTimeInput, 'keypress',
            function (event) {
                return me._raiseEvent(6, event)
            });
        },

        createID: function () {
            var id = Math.random() + '';
            id = id.replace('.', '');
            id = '99' + id;
            id = id / 1;
            return 'dateTimeInput' + id;
        },

        setMaxDate: function (date) {
            if (date == null)
                return;

            this.maxDate = $.jqx._jqxDateTimeInput.getDateTime(date);
            if (this.calendar != null) {
                this.calendar.setMaxDate(date);
            }
        },

        getMaxDate: function () {
            if (this.maxDate != null && this.maxDate != undefined) {
                return this.maxDate.dateTime;
            }

            return null;
        },

        setMinDate: function (date) {
            if (date == null)
                return;

            this.minDate = $.jqx._jqxDateTimeInput.getDateTime(date);
            if (this.calendar != null) {
                this.calendar.setMinDate(date);
            }
        },

        getMinDate: function () {
            if (this.minDate != null && this.minDate != undefined) {
                return this.minDate.dateTime;
            }

            return null;
        },

        propertyChangedHandler: function (object, key, oldvalue, value) {
            if (object.isInitialized == undefined || object.isInitialized == false)
                return;

            if (key == 'rtl') {
                object.calendarContainer.jqxCalendar({ rtl: value });
                if (value) {
                    object.dateTimeInput.css('direction', 'rtl');
                    object.dateTimeInput.addClass('jqx-rtl');
                    object.inputElement.css('float', 'right');
                    object.calendarElement.css('float', 'left');
                }
                else {
                    object.dateTimeInput.css('direction', 'ltr');
                    object.dateTimeInput.removeClass('jqx-rtl');
                    object.inputElement.css('float', 'left');
                    object.calendarElement.css('float', 'right');
                }
            }

            if (key == 'todayString' || key == 'clearString') {
                object.calendarContainer.jqxCalendar({ clearString: object.clearString, todayString: object.todayString });
            }

            if (key == 'dayNameFormat') {
                object.calendarContainer.jqxCalendar({ dayNameFormat: value });
            }

            if (key == 'firstDayOfWeek') {
                object.calendarContainer.jqxCalendar({ firstDayOfWeek: value });
            }
            if (key == 'showWeekNumbers') {
                object.calendarContainer.jqxCalendar({ showWeekNumbers: value });
            }

            if (key == 'culture') {
                object._loadItems();
                if (object.calendar != null) {
                    object.calendar.culture = value;
                    object.calendar.render();
                }
            }
            else if (key == 'formatString') {
                object._loadItems();
            }

            if (key == "theme") {
                if (object.dateTimeInput) {
                    object.host.removeClass();
                    object.host.addClass(object.toThemeProperty('jqx-widget'));

                    object.dateTimeInput.removeClass();
                    object.dateTimeInput.addClass(object.toThemeProperty("jqx-input-content"));
                    object.dateTimeInput.addClass(object.toThemeProperty("jqx-widget-content"));

                    object.inputElement.removeClass();
                    object.inputElement.addClass(object.toThemeProperty("jqx-input"));
                    object.inputElement.addClass(object.toThemeProperty("jqx-widget-content"));
                    object.inputElement.addClass(object.toThemeProperty("jqx-rc-all"));

                    object.calendarButtonContent.removeClass();
                    object.calendarButtonContent.addClass(object.toThemeProperty("jqx-input-button-content"));
                    object.calendarButtonContent.addClass(object.toThemeProperty("jqx-widget-content"));
                    object.calendarButtonHeader.removeClass();
                    object.calendarButtonHeader.addClass(object.toThemeProperty("jqx-input-button-header"));
                    object.calendarButtonHeader.addClass(object.toThemeProperty("jqx-widget-header"));
                    object.calendarButtonInnerHeader.removeClass();
                    object.calendarButtonInnerHeader.addClass(object.toThemeProperty("jqx-input-button-innerHeader"));

                    object.calendarContainer.jqxCalendar({ theme: value });
                }
            }

            if (key == "width" || key == "height") {
                object.refresh();
            }

            object._setOption(key, value);
            if (key == 'dropDownWidth' || key == 'dropDownHeight') {
                object.calendarContainer.jqxCalendar({ width: object.dropDownWidth, height: object.dropDownHeight });
                object.calendar.render();
                object.container.height(object.calendarContainer.height());
                object.container.width(object.calendarContainer.width());
            }
        },

        setDate: function (date) {
            if (date == null || date == 'null' || date == 'undefined') {
                if (this.value != null) {
                    this.value = null;
                    this.calendar.setDate(null);
                    this._refreshValue();
                    if (this.cookies) {
                        if (this.value != null) {
                            $.jqx.cookie.cookie("jqxDateTimeInput" + this.element.id, this.value.dateTime.toString(), this.cookieoptions);
                        }
                    }
                    this._raiseEvent('0', date);
                }
                return;
            }

            if (date < this.getMinDate() || date > this.getMaxDate()) {
                return;
            }

            if (this.value == null) {
                this.value = new $.jqx._jqxDateTimeInput.getDateTime(new Date());
                this.value._setHours(0);
                this.value._setMinutes(0);
                this.value._setSeconds(0);
                this.value._setMilliseconds(0);
            }

            if (date.getFullYear) {
                this.value._setYear(date.getFullYear());
                this.value._setDay(1);
                this.value._setMonth(date.getMonth() + 1);
                this.value._setHours(date.getHours());
                this.value._setMinutes(date.getMinutes());
                this.value._setSeconds(date.getSeconds());
                this.value._setMilliseconds(date.getMilliseconds());
                this.value._setDay(date.getDate());
            }

            this._refreshValue();

            if (this.cookies) {
                if (this.value != null) {
                    $.jqx.cookie.cookie("jqxDateTimeInput" + this.element.id, this.value.dateTime.toString(), this.cookieoptions);
                }
            }
            this._raiseEvent('0', date);
        },

        getDate: function () {
            if (this.value == undefined)
                return null;

            return new Date(this.value.dateTime); ;
        },

        getText: function()
        {
            return this.dateTimeInput.val();
        },

        setRange: function (from, to) {
            this.calendar.setRange(from, to);
            var date = from;
            if (date.getFullYear) {
                this.value._setYear(date.getFullYear());
                this.value._setMonth(date.getMonth() + 1);
                this.value._setHours(date.getHours());
                this.value._setMinutes(date.getMinutes());
                this.value._setSeconds(date.getSeconds());
                this.value._setMilliseconds(date.getMilliseconds());
                this.value._setDay(date.getDate());
            }

            this._raiseEvent('0', this.value.dateTime);
        },

        getRange: function () {
            return this.calendar.getRange();
        },

        _validateValue: function () {
            var needValueUpdate = false;
            for (i = 0; i < this.items.length; i++) {
                var editValue = this.editors[i].value;
                switch (this.items[i].type) {
                    case 'FORMAT_AMPM':
                        if (editValue < 0) {
                            editValue = 0;
                        }
                        else if (editValue > 1) {
                            editValue = 1;
                        }
                        break;
                    case 'Character':
                        break;
                    case 'Day':
                        if (editValue < 1) {
                            editValue = 1;
                        }
                        else if (editValue > 31) {
                            editValue = 31;
                        }
                        break;
                    case 'FORMAT_hh':
                    case 'FORMAT_HH':
                        if (editValue < 0) {
                            editValue = 0;
                        }
                        else if (editValue > 23) {
                            editValue = 23;
                        }
                        break;
                    case 'Millisecond':
                        if (editValue < 0) {
                            editValue = 0;
                        }
                        else if (editValue > 99) {
                            editValue = 99;
                        }
                        break;
                    case 'Minute':
                        if (editValue < 0) {
                            editValue = 0;
                        }
                        else if (editValue > 59) {
                            editValue = 59;
                        }
                        break;
                    case 'Month':
                        if (editValue < 1) {
                            editValue = 1;
                        }
                        else if (editValue > 12) {
                            editValue = 12;
                        }
                        break;
                    case 'ReadOnly':
                        break;
                    case 'Second':
                        if (editValue < 0) {
                            editValue = 0;
                        }
                        else if (editValue > 59) {
                            editValue = 59;
                        }
                        break;
                    case 'Year':
                        if (editValue < this.minDate.year) {
                            editValue = this.minDate.year;
                        }
                        else if (editValue > this.maxDate.year) {
                            editValue = this.maxDate.year;
                        }
                        break;
                }

                if (this.editors[i].value != editValue) {
                    this.editors[i].value = editValue;
                    needValueUpdate = true;
                }
            }

            this.updateValue();

            if (this.value != null) {
                if (this.value.dateTime > this.maxDate.dateTime) {
                    this._internalSetValue(this.maxDate);
                    this._updateEditorsValue();
                }
                else if (this.value.dateTime < this.minDate.dateTime) {
                    this._internalSetValue(this.minDate);
                    this._updateEditorsValue();
                }
            }
        },

        spinUp: function () {
            var value = this.value;
            if (value == null)
                return;

            if (this.activeEditor != null) {
                var currentEditorIndex = this.editors.indexOf(this.activeEditor);
                if (currentEditorIndex == -1) return;
                if (this.items[currentEditorIndex].type == 'Day') {
                    if (this.value != null) {
                        this.activeEditor.maxValue = this.value._daysInMonth(this.value.year, this.value.month);
                    }
                }

                var positions = this.activeEditor.positions;
                this.activeEditor.increaseValue(this.enableAbsoluteSelection);

                this.activeEditor.positions = positions;
            }

            if (this.isEditing) this.isEditing = false;

            this.updateValue();
            this.isEditing = true;
            this._updateText();

            var index1 = this.editors.indexOf(this.activeEditor);
            if (index1 >= 0) {
                this._selectGroup(index1);
            }
        },

        spinDown: function () {
            var value = this.value;
            if (value == null)
                return;

            if (this.activeEditor != null) {
                var currentEditorIndex = this.editors.indexOf(this.activeEditor);
                if (currentEditorIndex == -1) return;
                if (this.items[currentEditorIndex].type == 'Day') {
                    if (this.value != null) {
                        this.activeEditor.maxValue = this.value._daysInMonth(this.value.year, this.value.month);
                    }
                }

                var positions = this.activeEditor.positions;
                this.activeEditor.decreaseValue(this.enableAbsoluteSelection);
                this.activeEditor.positions = positions;
            }

            if (this.isEditing) this.isEditing = false;

            this.updateValue();
            this.isEditing = true;
            this._updateText();

            var index1 = this.editors.indexOf(this.activeEditor);
            if (index1 >= 0) {
                this._selectGroup(index1);
            }
        },

        _passKeyToCalendar: function (event) {
            if (event.keyCode == 13) {
                this.hideCalendar('selected');
                return true;
            }
            else if (event.keyCode == 27) {
                var calendar = this.calendarContainer;
                var calendarInstace = this.calendar;
                var closeAfterSelection = this.closeCalendarAfterSelection;
                this.closeCalendarAfterSelection = false;
                calendarInstace.setDate(this.value.dateTime);
                this.closeCalendarAfterSelection = closeAfterSelection;
                this.hideCalendar();
            }

            var closeAfterSelection = this.closeCalendarAfterSelection;
            this.closeCalendarAfterSelection = false;
            var result = this.calendar._handleKey(event);
            this.closeCalendarAfterSelection = closeAfterSelection;
            return result;
        },

        handleCalendarKey: function (event, me) {
            var $target = $(event.target);
            var openedCalendar = $.data(document.body, "openedJQXCalendar" + this.id);
            if (openedCalendar != null) {
                if (openedCalendar.length > 0) {
                    var result = me._passKeyToCalendar(event);
                    return result;
                }
            }

            return true;
        },

        _findPos: function (obj) {
            if (obj == null)
                return;

            while (obj && (obj.type == 'hidden' || obj.nodeType != 1 || $.expr.filters.hidden(obj))) {
                obj = obj['nextSibling'];
            }
            var position = $(obj).offset();
            return [position.left, position.top];
        },

        testOffset: function (element, offset, inputHeight) {
            var dpWidth = element.outerWidth();
            var dpHeight = element.outerHeight();
            var viewWidth = $(window).width() + $(window).scrollLeft();
            var viewHeight = $(window).height() + $(window).scrollTop();
            if (offset.left + dpWidth > viewWidth) {
                if (dpWidth > this.host.width()) {
                    var hostLeft = this.host.offset().left;
                    var hOffset = dpWidth - this.host.width();
                    offset.left = hostLeft - hOffset + 2;
                }
            }
            if (offset.left < 0) {
                offset.left = parseInt(this.host.offset().left) + 'px'
            }

            offset.top -= Math.min(offset.top, (offset.top + dpHeight > viewHeight && viewHeight > dpHeight) ?
                Math.abs(dpHeight + inputHeight + 23) : 0);

            return offset;
        },

        open: function () {
            this.showCalendar();
        },

        close: function (reason) {
            this.hideCalendar();
        },

        //OBSOLETE use close instead. 
        hide: function () {
            this.close();
        },

        //OBSOLETE use open instead. 
        show: function () {
            this.open();
        },

        _getBodyOffset: function () {
            var top = 0;
            var left = 0;
            if ($('body').css('border-top-width') != '0px') {
                top = parseInt($('body').css('border-top-width'));
                if (isNaN(top)) top = 0;
            }
            if ($('body').css('border-left-width') != '0px') {
                left = parseInt($('body').css('border-left-width'));
                if (isNaN(left)) left = 0;
            }
            return { left: left, top: top };
        },

        showCalendar: function () {
            var calendar = this.calendarContainer;
            var calendarInstace = this.calendar;
            var container = this.container;
            var self = this;
            var scrollPosition = $(window).scrollTop();
            var scrollLeftPosition = $(window).scrollLeft();
            var top = parseInt(this._findPos(this.inputElement[0])[1]) + parseInt(this.inputElement.outerHeight()) - 1 + 'px';
            var left = parseInt(this.host.offset().left) + 'px';
            var isMobileBrowser = $.jqx.mobile.isSafariMobileBrowser() || $.jqx.mobile.isWindowsPhone();

            if ($('body').css('border-top-width') != '0px') {
                top = parseInt(top) + this._getBodyOffset().top + 'px';
            }
            if ($('body').css('border-left-width') != '0px') {
                left = parseInt(left) + this._getBodyOffset().left + 'px';
            }

            var hasTransform = $.jqx.utilities.hasTransform(this.host);

            if (hasTransform || (isMobileBrowser != null && isMobileBrowser)) {
                left = $.jqx.mobile.getLeftPos(this.element);
                top = $.jqx.mobile.getTopPos(this.element) + parseInt(this.inputElement.outerHeight());
            }

            this.container.css('left', left);
            this.container.css('top', top);

            var closeAfterSelection = this.closeCalendarAfterSelection;
            this.closeCalendarAfterSelection = false;
            this.isEditing = false;
            this._validateValue();
            this._updateText();
            var value = this.value != null ? this.value.dateTime : new Date();
            if (self.selectionMode == 'default') {
                calendarInstace.setDate(value);
            }
            this.closeCalendarAfterSelection = closeAfterSelection;

            var positionChanged = false;

            if (this.dropDownHorizontalAlignment == 'right' || this.rtl) {
                var containerWidth = this.container.outerWidth();
                var containerLeftOffset = Math.abs(containerWidth - this.host.outerWidth() + 1);
                if ($.jqx.browser.chrome) containerLeftOffset++;
                if (containerWidth > this.host.width()) {
                    var offset = this.rtl ? 23 : 2;
                    this.container.css('left', offset + parseInt(left) - containerLeftOffset + "px");
                }
                else this.container.css('left', 25 + parseInt(left) + containerLeftOffset + "px");
            }

            if (this.enableBrowserBoundsDetection) {
                var newOffset = this.testOffset(calendar, { left: parseInt(this.container.css('left')), top: parseInt(top) }, parseInt(this.host.outerHeight()));
                if (parseInt(this.container.css('top')) != newOffset.top) {
                    positionChanged = true;
                    calendar.css('top', 23);
                }
                else calendar.css('top', 0);

                this.container.css('top', newOffset.top);
                if (parseInt(this.container.css('left')) != newOffset.left) {
                    this.container.css('left', newOffset.left);
                }
            }

            this._raiseEvent(7, calendar);

            if (this.animationType != 'none') {
                this.container.css('display', 'block');
                var height = parseInt(calendar.outerHeight());
                calendar.stop();

                this.isanimating = true;
                this.opening = true;
                if (this.animationType == 'fade') {
                    calendar.css('margin-top', 0);
                    calendar.css('opacity', 0);
                    calendar.animate({ 'opacity': 1 }, this.openDelay, function () {
                        self.isanimating = false;
                        self.opening = false;
                        $.data(document.body, "openedJQXCalendar" + self.id, calendar);
                        self.calendarContainer.focus();
                    });
                }
                else {
                    calendar.css('opacity', 1);
                    if (positionChanged) {
                        calendar.css('margin-top', height);
                    }
                    else {
                        calendar.css('margin-top', -height);
                    }
                    calendar.animate({ 'margin-top': 0 }, this.openDelay, function () {
                        self.isanimating = false;
                        self.opening = false;
                        $.data(document.body, "openedJQXCalendar" + self.id, calendar);
                        self.calendarContainer.focus();
                    });
                }
            }
            else {
                calendar.stop();
                self.isanimating = false;
                self.opening = false;
                calendar.css('opacity', 1);
                calendar.css('margin-top', 0);
                this.container.css('display', 'block');
                $.data(document.body, "openedJQXCalendar" + self.id, calendar);
                this.calendarContainer.focus();
            }

            if (this.value == null) {
                if (this.calendar && this.calendar._getSelectedCell()) {
                    this.calendar._getSelectedCell().isSelected = false;
                }
            }
        },

        hideCalendar: function (reason) {
            var calendar = this.calendarContainer;
            var container = this.container;
            var self = this;
            $.data(document.body, "openedJQXCalendar" + this.id, null);
            if (this.animationType != 'none') {
                var height = calendar.outerHeight();
                calendar.css('margin-top', 0);
                this.isanimating = true;
                var animationValue = -height;
                if (parseInt(this.container.offset().top) < parseInt(this.host.offset().top)) {
                    animationValue = height;
                }
                if (this.animationType == 'fade') {
                    calendar.animate({ 'opacity': 0 }, this.closeDelay, function () { container.css('display', 'none'); self.isanimating = false; });
                }
                else {
                    calendar.animate({ 'margin-top': animationValue }, this.closeDelay, function () { container.css('display', 'none'); self.isanimating = false; });
                }
            }
            else {
                container.css('display', 'none');
            }

            if (reason != undefined) {
                this._updateSelectedDate();
            }

            this._raiseEvent(8, calendar);
        },

        _updateSelectedDate: function () {
            var value = this.value;
            if (value == null) {
                value = new $.jqx._jqxDateTimeInput.getDateTime(new Date());
                value._setHours(0);
                value._setMinutes(0);
                value._setSeconds(0);
                value._setMilliseconds(0);
            }

            var hour = value.hour;
            var minute = value.minute;
            var second = value.second;
            var milisecond = value.millisecond;
            if (this.selectionMode == 'range' && this.calendar.getRange().from == null) {
                this.setDate(null);
                return;
            }

            var date = new $.jqx._jqxDateTimeInput.getDateTime(this.calendar.value.dateTime);

            date._setHours(hour);
            date._setMinutes(minute);
            date._setSeconds(second);
            date._setMilliseconds(milisecond);
            this.setDate(date.dateTime);
        },

        _closeOpenedCalendar: function (event) {
            var $target = $(event.target);
            var openedCalendar = $.data(document.body, "openedJQXCalendar" + event.data.me.id);
            var isCalendar = false;
            $.each($target.parents(), function () {
                if (this.className.indexOf('jqx-calendar') != -1) {
                    isCalendar = true;
                    return false;
                }
                if (this.className.indexOf('jqx-input') != -1) {
                    isCalendar = true;
                    return false;
                }
            });

            if ($(event.target).ischildof(event.data.me.host)) {
                return true;
            }

            if (event.target != null && (event.target.tagName == "B" || event.target.tagName == 'b')) {
                var hostOffset = event.data.me.host.offset();
                var hostWidth = event.data.me.host.width();
                var hostHeight = event.data.me.host.height();
                var top = parseInt(hostOffset.top);
                var left = parseInt(hostOffset.left);

                if (top <= event.pageY && event.pageY <= top + hostHeight) {
                    if (left <= event.pageX && event.pageX <= left + hostWidth) {
                        return true;
                    }
                }
            }

            if (openedCalendar != null && !isCalendar) {
                if (openedCalendar.length > 0) {
                    var calendarID = openedCalendar[0].id.toString();
                    var inputID = calendarID.toString().substring(13);
                    var datetimeinput = $(document).find("#" + inputID);
                    event.data.me.hideCalendar();
                    $.data(document.body, "openedJQXCalendar" + event.data.me.id, null);
                }
            }
        },

        _loadItems: function () {
            if (this.value != null) {
                this.items = new Array();
                var expandedMask = this._getFormatValue(this.formatString);
                this.items = this._parseFormatValue(expandedMask);
                this.editors = new Array();
                for (i = 0; i < this.items.length; i++) {
                    var editor = this.items[i].getDateTimeEditorByItemType(this.value);
                    this.editors[i] = editor;
                }
            }

            this._updateEditorsValue();
            this._updateText();
        },

        _updateText: function () {
            var text = "";
            if (this.items.length == 0 && this.value != null) {
                this._loadItems();
            }

            if (this.value != null) {
                if (this.items.length >= 1) {
                    text = this.format(this.value, 0, this.items.length);
                }


                var oldText = this.dateTimeInput.val();
                if (oldText != text) {
                    this._raiseEvent(1, this.value);
                }
            }

            if (this.selectionMode == 'range') {
                var range = this.getRange();
                fromText = this.format(this.value, 0, this.items.length);
                if (range.to) {
                    var from = $.jqx._jqxDateTimeInput.getDateTime(range.from);
                    fromText = this.format(from, 0, this.items.length);
                    var to = $.jqx._jqxDateTimeInput.getDateTime(range.to);
                    toText = this.format(to, 0, this.items.length);
                    var text = fromText + " - " + toText;
                }
            }

            this.dateTimeInput.val(text)
        },


        format: function (value, startFormatIndex, endFormatIndex) {
            var result = "";
            for (i = startFormatIndex; i < endFormatIndex; ++i) {
                var parsedValue = this.items[i].dateParser(value);

                if (this.isEditing && this.items[i].type != 'ReadOnly') {
                    var isReadOnlyDay = this.items[i].type == 'Day' && this.items[i].format.length > 2;
                    if (this.items[i].type == 'FORMAT_AMPM') {
                        isReadOnlyDay = true;
                    }

                    if (!isReadOnlyDay) {
                        parsedValue = this.items[i].dateParserInEditMode(new Number(this.editors[i].value), "d" + this.editors[i].maxEditPositions);
                        while (parsedValue.length < this.editors[i].maxEditPositions) {
                            parsedValue = '0' + parsedValue;
                        }
                    }
                }
                result += parsedValue;
            }
            return result;
        },

        _getFormatValueGroupLength: function (item) {
            for (i = 1; i < item.toString().length; ++i) {
                if (item.substring(i, i + 1) != item.substring(0, 1))
                    return i;
            }
            return item.length;
        },

        _parseFormatValue: function (value) {
            var myResult = new Array();
            var currentValue = value.toString();
            var i = 0;
            while (currentValue.length > 0) {
                var formatItemLength = this._getFormatValueGroupLength(currentValue);
                var myItem = null;

                switch (currentValue.substring(0, 1)) {
                    case ':':
                    case '/':
                        formatItemLength = 1;
                        myItem = $.jqx._jqxDateTimeInput.DateTimeFormatItem._create(currentValue.substring(0, 1), 'ReadOnly', this.culture);
                        break;
                    case '"':
                    case '\'':
                        var closingQuotePosition = currentValue.indexOf(currentValue[0], 1);
                        myItem = $.jqx._jqxDateTimeInput.DateTimeFormatItem._create(currentValue.substring(1, 1 + Math.max(1, closingQuotePosition - 1)), 'ReadOnly', this.culture);
                        formatItemLength = Math.max(1, closingQuotePosition + 1);
                        break;
                    case '\\':
                        if (currentValue.length >= 2) {
                            myItem = $.jqx._jqxDateTimeInput.DateTimeFormatItem._create(currentValue.substring(1, 1), 'ReadOnly', this.culture);
                            formatItemLength = 2;
                        }
                        break;
                    case 'd':
                    case 'D':
                        if (formatItemLength > 2) {
                            myItem = $.jqx._jqxDateTimeInput.DateTimeFormatItem._create(currentValue.substring(0, formatItemLength), 'Day', this.culture);
                        }
                        else {
                            myItem = $.jqx._jqxDateTimeInput.DateTimeFormatItem._create(currentValue.substring(0, formatItemLength), 'Day', this.culture);

                        }
                        break;
                    case 'f':
                    case 'F':
                        if (formatItemLength > 7) {
                            formatItemLength = 7;
                        }
                        if (formatItemLength > 3) {
                            myItem = $.jqx._jqxDateTimeInput.DateTimeFormatItem._create(currentValue.substring(0, formatItemLength), 'ReadOnly', this.culture);
                        }
                        else {
                            myItem = $.jqx._jqxDateTimeInput.DateTimeFormatItem._create(currentValue.substring(0, formatItemLength), 'Millisecond', this.culture);
                        }
                        break;
                    case 'g':
                        myItem = $.jqx._jqxDateTimeInput.DateTimeFormatItem._create(currentValue.substring(0, formatItemLength), 'ReadOnly', this.culture);
                        break;
                    case 'h':
                        myItem = $.jqx._jqxDateTimeInput.DateTimeFormatItem._create(currentValue.substring(0, formatItemLength), 'FORMAT_hh', this.culture);
                        break;
                    case 'H':
                        myItem = $.jqx._jqxDateTimeInput.DateTimeFormatItem._create(currentValue.substring(0, formatItemLength), 'FORMAT_HH', this.culture);
                        break;
                    case 'm':
                        myItem = $.jqx._jqxDateTimeInput.DateTimeFormatItem._create(currentValue.substring(0, formatItemLength), 'Minute', this.culture);
                        break;
                    case 'M':
                        if (formatItemLength > 4)
                            formatItemLength = 4;
                        myItem = $.jqx._jqxDateTimeInput.DateTimeFormatItem._create(currentValue.substring(0, formatItemLength), 'Month', this.culture);
                        break;
                    case 's':
                    case 'S':
                        myItem = $.jqx._jqxDateTimeInput.DateTimeFormatItem._create(currentValue.substring(0, formatItemLength), 'Second', this.culture);
                        break;
                    case 't':
                    case 'T':
                        myItem = $.jqx._jqxDateTimeInput.DateTimeFormatItem._create(currentValue.substring(0, formatItemLength), 'FORMAT_AMPM', this.culture);
                        break;
                    case 'y':
                    case 'Y':
                        if (formatItemLength > 1) {
                            myItem = $.jqx._jqxDateTimeInput.DateTimeFormatItem._create(currentValue.substring(0, formatItemLength), 'Year', this.culture);
                        }
                        else {
                            formatItemLength = 1;
                            myItem = $.jqx._jqxDateTimeInput.DateTimeFormatItem._create(currentValue.substring(0, 1), dateTimeFormatInfo, 'ReadOnly', this.culture);
                        }
                        break;
                    case 'z':
                        myItem = $.jqx._jqxDateTimeInput.DateTimeFormatItem._create(currentValue.substring(0, formatItemLength), 'ReadOnly', this.culture);
                        break;

                    default:
                        formatItemLength = 1;
                        myItem = $.jqx._jqxDateTimeInput.DateTimeFormatItem._create(currentValue.substring(0, 1), 'ReadOnly', this.culture);
                        break;
                }

                myResult[i] = $.extend(true, {}, myItem);
                currentValue = currentValue.substring(formatItemLength);
                i++;
            }

            return myResult;
        },

        _getFormatValue: function (format) {
            if (format == null || format.length == 0)
                format = "d";

            if (format.length == 1) {
                switch (format.substring(0, 1)) {
                    case "d":
                        return $.global.culture.calendar.patterns.d;
                    case "D":
                        return $.global.culture.calendar.patterns.D;
                    case "t":
                        return $.global.culture.calendar.patterns.t;
                    case "T":
                        return $.global.culture.calendar.patterns.T;
                    case "f":
                        return $.global.culture.calendar.patterns.f;
                    case "F":
                        return $.global.culture.calendar.patterns.F;
                    case "M":
                        return $.global.culture.calendar.patterns.M;
                    case "Y":
                        return $.global.culture.calendar.patterns.Y;
                    case "S":
                        return $.global.culture.calendar.patterns.S;
                }
            }
            if (format.length == 2 && format.substring(0, 1) == '%')
                format = format.substring(1);
            return format;
        },

        _updateEditorsValue: function () {
            var value = this.value;

            if (value == null)
                return;

            var year = value.year;
            var day = value.day;
            var hour = value.hour;
            var millisecond = value.millisecond;
            var second = value.second;
            var minute = value.minute;
            var month = value.month;

            if (this.items == null)
                return;

            for (i = 0; i < this.items.length; i++) {
                switch (this.items[i].type) {
                    case 'FORMAT_AMPM':
                        this.editors[i].value = 0;
                        break;
                    case 'Day':
                        this.editors[i].value = day;
                        break;
                    case 'FORMAT_hh':
                        this.editors[i].value = hour;
                        break;
                    case 'FORMAT_HH':
                        this.editors[i].value = hour;
                        break;
                    case 'Millisecond':
                        this.editors[i].value = millisecond;
                        break;
                    case 'Minute':
                        this.editors[i].value = minute;
                        break;
                    case 'Month':
                        this.editors[i].value = month;
                        break;
                    case 'Second':
                        this.editors[i].value = second;
                        break;
                    case 'Year':
                        this.editors[i].value = year;
                        break;
                }
            }
        },


        updateValue: function () {
            if (this.isEditing)
                return;

            var dateTime = 0;
            var year = 1;
            var day = 1;
            var hour = 0;
            var milisecond = 0;
            var second = 0;
            var minute = 0;
            var month = 1;
            var amPmOffset = 0;
            var hasYear = false;
            var hasMonth = false;
            var hasDay = false;

            var dayEditors = new Array();
            var amPmEditor = null;

            var k = 0;
            for (var i = 0; i < this.items.length; i++) {
                switch (this.items[i].type) {
                    case 'FORMAT_AMPM':
                        amPmOffset = this.editors[i].value;
                        amPmEditor = this.editors[i];
                        break;
                    case 'Character':

                        break;
                    case 'Day':
                        if (this.items[i].format.length < 4) {
                            day = this.editors[i].value;
                            dayEditors[k++] = this.editors[i];
                            if (day == 0)
                                day = 1;

                            hasDay = true;
                        }
                        break;
                    case 'FORMAT_hh':
                        var hoursEditor = this.editors[i];
                        hour = hoursEditor.value;
                        break;
                    case 'FORMAT_HH':
                        hour = this.editors[i].value;
                        break;
                    case 'Millisecond':
                        milisecond = this.editors[i].value;
                        break;
                    case 'Minute':
                        minute = this.editors[i].value;
                        break;
                    case 'Month':
                        month = this.editors[i].value;
                        hasMonth = true;
                        if (month == 0)
                            month = 1; break;
                    case 'ReadOnly':
                        break;
                    case 'Second':
                        second = this.editors[i].value;
                        break;
                    case 'Year':
                        hasYear = true;
                        year = this.editors[i].value;

                        var yearFormatValue = this.editors[i].getDateTimeItem().format;
                        if (yearFormatValue.length < 3) {
                            var yearString = "1900";
                            if (yearString.Length == 4) {
                                var baseYearString = "" + yearString[0] + yearString[1];
                                var baseYear;
                                baseYear = parseInt(baseYearString);
                                year = year + (baseYear * 100);
                            }
                        }

                        if (year == 0)
                            year = 1;
                        break;
                }
            }

            var oldDate = this.value != null ? new Date(this.value.dateTime) : null;

            if (year > 0 && month > 0 && day > 0 && minute >= 0 && hour >= 0 && second >= 0 && milisecond >= 0) {
                var val = this.value;
                if (val != null) {
                    if (!hasYear) {
                        year = val.year;
                    }

                    if (!hasMonth) {
                        month = val.month;
                    }

                    if (!hasDay) {
                        day = val.day;
                    }
                }

                try {
                    if (month > 12) month = 12;
                    if (month < 1) month = 1;
                    if (val._daysInMonth(year, month) <= day) {
                        day = val._daysInMonth(year, month);
                        if (dayEditors != null && dayEditors.length > 0) {
                            for (i = 0; i < dayEditors.length; i++) {
                                dayEditors[i].value = day;
                            }
                        }
                    }

                    if (amPmEditor != null) {
                        amPmEditor.value = hour < 12 ? 0 : 1;
                    }

                    this.value._setYear(parseInt(year));
                    this.value._setDay(day);
                    this.value._setMonth(month);
                    this.value._setHours(hour);
                    this.value._setMinutes(minute);
                    this.value._setSeconds(second);
                    this.value._setMilliseconds(milisecond);
                }
                catch (err) {
                    this.value = val;
                }

                if (oldDate != null) {
                    var areEqual = this.value.dateTime.getFullYear() == oldDate.getFullYear() && this.value.dateTime.getDate() == oldDate.getDate() && this.value.dateTime.getMonth() == oldDate.getMonth() && this.value.dateTime.getHours() == oldDate.getHours() && this.value.dateTime.getMinutes() == oldDate.getMinutes() && this.value.dateTime.getSeconds() == oldDate.getSeconds();
                    if (!areEqual) {
                        this._raiseEvent('0', this.value.dateTime);
                        if (this.cookies) {
                            if (this.value != null) {
                                $.jqx.cookie.cookie("jqxDateTimeInput" + this.element.id, this.value.dateTime.toString(), this.cookieoptions);
                            }
                        }
                    }

                    this.calendarButtonContent.html("<div style='line-height: 16px; background: transparent; margin: 0; border: 0; padding: 0px; text-align: center; vertical-align: middle;'>" + "<b style='border: 0; padding: 0px; margin: 0px; background: transparent;'>" + this.value.day + "</b>" + "</div>");
                }
                else {
                    this.calendarButtonContent.html("<div style='line-height: 16px; background: transparent; margin: 0; border: 0; padding: 0px; text-align: center; vertical-align: middle;'>" + "<b style='border: 0; padding: 0px; margin: 0px; background: transparent;'>" + '' + "</b>" + "</div>");
                }
            }

            var editorIndex = this.editors.indexOf(this.activeEditor);
            var currentItem = this.items[editorIndex];
        },

        _internalSetValue: function (date) {
            this.value._setYear(parseInt(date.year));
            this.value._setDay(date.day);
            this.value._setMonth(date.month);
            this.value._setHours(date.hour);
            this.value._setMinutes(date.minute);
            this.value._setSeconds(date.second);
            this.value._setMilliseconds(date.milisecond);
        },

        _raiseEvent: function (id, arg) {
            var evt = this.events[id];
            var args = {};
            args.owner = this;
            if (arg == null) {
                arg = new Date();
            }
            var key = arg.charCode ? arg.charCode : arg.keyCode ? arg.keyCode : 0;
            var result = true;
            var isreadOnly = this.readonly;
            var event = new jQuery.Event(evt);
            event.owner = this;
            event.args = args;
            event.args.date = this.getDate();
            if (this.selectionMode == 'range') {
                event.args.date = this.getRange();
            }

            if (this.host.css('display') == 'none')
                return true;

            if (id != 2 && id != 3) {
                result = this.host.trigger(event);
            }
            var me = this;

            if (!isreadOnly) {
                if (id == 2 && !this.disabled) {
                    setTimeout(function () {
                        me.isEditing = true;
                        me._selectGroup(-1);
                    }, 25);
                }
            }


            if (id == 4) {
                if (isreadOnly || this.disabled) {
                    if (key == 8 || key == 46) {
                        this.isEditing = false;
                        this.setDate(null);
                    }
                    return false;
                }

                result = this._handleKeyDown(arg, key);
            }

            else if (id == 5) {
                if (isreadOnly || this.disabled) {
                    return false;
                }


            }
            else if (id == 6) {
                if (isreadOnly || this.disabled) {
                    return false;
                }

                result = this._handleKeyPress(arg, key)
            }

            return result;
        },

        _doLeftKey: function () {
            if (this.activeEditor != null) {
                if (!this.isEditing) this.isEditing = true;

                var lastEditor = this.activeEditor;
                var newEditor = false;
                var index3 = this.editors.indexOf(this.activeEditor);
                var tmpIndex3 = index3;

                if (this.enableAbsoluteSelection) {
                    if (index3 >= 0 && this.activeEditor.positions > 0) {
                        this.activeEditor.positions--;
                        this._selectGroup(index3);
                        return;
                    }
                }

                while (index3 > 0) {
                    this.activeEditor = this.editors[--index3];
                    this._selectGroup(index3);
                    if (this.items[index3].type != 'ReadOnly') {
                        newEditor = true;
                        break;
                    }
                }
                if (!newEditor) {
                    if (tmpIndex3 >= 0) {
                        this.activeEditor = this.editors[tmpIndex3];
                    }
                }
                if (this.activeEditor != null && lastEditor != this.activeEditor) {
                    if (this.items[index3].type != 'ReadOnly') {
                        if (this.enableAbsoluteSelection) {
                            this.activeEditor.positions = this.activeEditor.maxEditPositions - 1;
                        }
                        else {
                            this.activeEditor.positions = 0;
                        }
                    }
                }

                if (this.activeEditor != lastEditor) {
                    this._validateValue();
                    this._updateText();
                    this._selectGroup(this.editors.indexOf(this.activeEditor));
                    return true;
                }
                else return false;
            }
        },

        _doRightKey: function () {
            if (this.activeEditor != null) {
                if (!this.isEditing) this.isEditing = true;

                var lastEditor = this.activeEditor;
                var newEditor = false;
                var index4 = this.editors.indexOf(this.activeEditor);
                var tmpIndex3 = index4;

                if (this.enableAbsoluteSelection) {
                    if (index4 >= 0 && this.activeEditor.positions < this.activeEditor.maxEditPositions - 1) {
                        this.activeEditor.positions++;
                        this._selectGroup(index4);
                        return;
                    }
                }

                while (index4 <= this.editors.length - 2) {
                    this.activeEditor = this.editors[++index4];
                    this._selectGroup(index4);
                    if (this.items[index4].type != 'ReadOnly') {
                        if (this.items[index4].type == 'Day' && this.items[index4].format.length > 2)
                            break;

                        if (this.items[index4].type == 'FORMAT_AMPM')
                            break;

                        newEditor = true;
                        break;
                    }
                }
                if (!newEditor) {
                    if (tmpIndex3 >= 0) {
                        this.activeEditor = this.editors[tmpIndex3];
                    }
                }
                if (this.activeEditor != null && this.activeEditor != lastEditor) {
                    if (this.items[index4].type != 'ReadOnly') {
                        this.activeEditor.positions = 0;
                    }
                }

                if (this.activeEditor != lastEditor) {
                    this._validateValue();
                    this._updateText();
                    this._selectGroup(this.editors.indexOf(this.activeEditor));
                    return true;
                }
                else return false;
            }
        },


        _saveSelectedText: function () {
            var selection = this._selection();
            var text = "";
            var allText = this.dateTimeInput.val();
            if (selection.start > 0 || selection.length > 0) {
                for (i = selection.start; i < selection.end; i++) {
                    text += allText[i];
                }
            }
            window.clipboardData.setData("Text", text);
            return text;
        },

        _selectWithAdvancePattern: function () {
            var editorIndex = this.editors.indexOf(this.activeEditor);
            var canAdvance = false;
            if (this.items[editorIndex].type != 'ReadOnly' && this.items[editorIndex].type != 'Format_AMPM') {
                canAdvance = true;
            }

            if (!canAdvance)
                return;

            var numericEditor = this.activeEditor;

            if (numericEditor != null) {
                var canSelectRight = numericEditor.positions == numericEditor.maxEditPositions;
                if (canSelectRight) {
                    this.editorText = "";
                    var editValue = numericEditor.value;
                    var needValueUpdate = false;

                    switch (this.items[editorIndex].type) {
                        case 'FORMAT_AMPM':
                            if (editValue < 0) {
                                editValue = 0;
                            }
                            else if (editValue > 1) {
                                editValue = 1;
                            }
                            break;
                        case 'Character':
                            break;
                        case 'Day':
                            if (editValue < 1) {
                                editValue = 1;
                            }
                            else if (editValue > 31) {
                                editValue = 31;
                            }
                            break;
                        case 'FORMAT_hh':
                        case 'FORMAT_HH':
                            if (editValue < 0) {
                                editValue = 0;
                            }
                            else if (editValue > 23) {
                                editValue = 23;
                            }
                            break;
                        case 'Millisecond':
                            if (editValue < 0) {
                                editValue = 0;
                            }
                            else if (editValue > 99) {
                                editValue = 99;
                            }
                            break;
                        case 'Minute':
                            if (editValue < 0) {
                                editValue = 0;
                            }
                            else if (editValue > 59) {
                                editValue = 59;
                            }
                            break;
                        case 'Month':
                            if (editValue < 1) {
                                editValue = 1;
                            }
                            else if (editValue > 12) {
                                editValue = 12;
                            }
                            break;
                        case 'ReadOnly':
                            break;
                        case 'Second':
                            if (editValue < 0) {
                                editValue = 0;
                            }
                            else if (editValue > 59) {
                                editValue = 59;
                            }
                            break;
                        case 'Year':
                            if (editValue < this.minDate.year) {
                                editValue = this.minDate.year;
                            }
                            else if (editValue > this.maxDate.year) {
                                editValue = this.maxDate.year;
                            }
                            break;
                    }

                    if (numericEditor.value != editValue) {
                        needValueUpdate = true;
                    }

                    if (!needValueUpdate) {
                        this.isEditing = false;
                        this._validateValue();
                        this._updateText();
                        this.isEditing = true;
                        this._doRightKey();
                        return true;
                    }

                    return false;
                }
            }
        },


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

            if (selection.start >= 0) {
                var letter = String.fromCharCode(key);
                var digit = parseInt(letter);
                if (!isNaN(digit)) {
                    if (this.container.css('display') == 'block') {
                        this.hideCalendar();
                    }

                    this.updateValue();
                    this._updateText();
                    var inserted = false;
                    var activeItem = this.editors.indexOf(this.activeEditor);
                    var dateTimeEditor = null;
                    this.isEditing = true;
                    if (activeItem.type != "ReadOnly" && activeItem.type != "FORMAT_AMPM") {
                        dateTimeEditor = this.activeEditor;
                    }

                    if (dateTimeEditor != null && dateTimeEditor.positions == 0) {
                        this.editorText = "";
                    }

                    if (this.activeEditor == null) {
                        this.activeEditor = this.editors[0];
                    }
                    if (this.activeEditor == null) return false;
                    this.activeEditor.insert(letter);
                    if (dateTimeEditor != null && this.editorText.length >= dateTimeEditor.maxEditPositions) {
                        this.editorText = "";
                    }

                    this.editorText += letter;
                    var advanced = this._selectWithAdvancePattern();

                    if (this.activeEditor.positions == this.activeEditor.maxEditPositions) {
                        var lastEditorIndex = this._getLastEditableEditorIndex();
                        if (this.editors.indexOf(this.activeEditor) == lastEditorIndex && advanced && this.enableAbsoluteSelection) {
                            this.activeEditor.positions = this.activeEditor.maxEditPositions - 1;
                        }
                        else {
                            this.activeEditor.positions = 0;
                        }
                    }

                    inserted = true;

                    this.updateValue();
                    this._updateText();
                    this._selectGroup(this.editors.indexOf(this.activeEditor));

                    return false;
                }
            }
            var specialKey = this._isSpecialKey(key);
            return specialKey;
        },

        _getLastEditableEditorIndex: function () {
            var i = 0;
            var me = this;
            for (itemIndex = this.items.length - 1; itemIndex >= 0; itemIndex--) {
                if (this.items[itemIndex].type != 'ReadOnly') {
                    return itemIndex;
                }
            }

            return -1;
        },

        _handleKeyDown: function (e, key) {
            if (e.keyCode == 115) {
                if (this.isOpened()) {
                    this.hideCalendar();
                    return false;
                }
                else if (!this.isOpened()) {
                    this.showCalendar();
                    return false;
                }
            }

            if (e.altKey) {
                if (e.keyCode == 38) {
                    if (this.isOpened()) {
                        this.hideCalendar();
                        return false;
                    }
                }
                else if (e.keyCode == 40) {
                    if (!this.isOpened()) {
                        this.showCalendar();
                        return false;
                    }
                }
            }

            if (this.isOpened()) {
                return;
            }

            var selection = this._selection();
            if ((e.ctrlKey && key == 99 /* firefox */) || (e.ctrlKey && key == 67) /* opera */) {
                this._saveSelectedText(e);
                return false;
            }

            if ((e.ctrlKey && key == 122 /* firefox */) || (e.ctrlKey && key == 90) /* opera */) return false;

            if ((e.ctrlKey && key == 118 /* firefox */) || (e.ctrlKey && key == 86) /* opera */
            || (e.shiftKey && key == 45)) {

                return false;
            }

            if (key == 8 || key == 46) {
                if (!e.altKey && !e.ctrlKey && key == 46) {
                    this.isEditing = false;
                    this.setDate(null);
                }
                else {
                    if (this.activeEditor != null) {
                        var activeEditorIndex = this.editors.indexOf(this.activeEditor);
                        if (this.activeEditor.positions >= 0) {
                            var formattedValue = $.global.format(Number(this.activeEditor.value), "d" + this.activeEditor.maxEditPositions, this.culture)
                            tmp = formattedValue;
                            tmp = tmp.substring(0, this.activeEditor.positions) + '0' + tmp.substring(this.activeEditor.positions + 1);
                            if (parseInt(tmp) < this.activeEditor.minValue) {
                                tmp = $.global.format(Number(this.activeEditor.minValue), "d" + this.activeEditor.maxEditPositions, this.culture)
                            }

                            if (this.enableAbsoluteSelection) {
                                this.activeEditor.value = tmp;
                            }
                            else this.activeEditor.value = this.activeEditor.minValue;

                            this._validateValue();
                            this._updateText();

                            if (key == 8) {
                                var myself = this;

                                if (this.enableAbsoluteSelection && this.activeEditor.positions > 0) {
                                    setTimeout(function () {
                                        myself.activeEditor.positions = myself.activeEditor.positions - 1;
                                        myself._selectGroup(activeEditorIndex);
                                    }, 10);
                                }
                                else {
                                    setTimeout(function () {
                                        myself._doLeftKey();
                                    }, 10);
                                }
                            }
                            else this._selectGroup(activeEditorIndex);
                        }
                        else this._doLeftKey();
                    }
                }
                return false;
            }

            if (key == 38) {
                this.spinUp();
                return false;
            }
            else if (key == 40) {
                this.spinDown();
                return false;
            }

            if (key == 37) {
                if (this._editor) {
                    var result = this._doLeftKey();
                    if (!result) {
                        this.isEditing = false;
                        this._validateValue();
                    }
                    return !result;
                }
                else {
                    this._doLeftKey()
                    return false;
                }
            }
            else if (key == 39) {
                if (this._editor) {
                    var result = this._doRightKey();
                    if (!result) {
                        this.isEditing = false;
                        this._validateValue();
                    }
                    return !result;
                }
                else {
                    this._doRightKey();
                    return false;
                }
            }

            var specialKey = this._isSpecialKey(key);

            if (!$.jqx.browser.mozilla)
                return true;

            return specialKey;
        },


        _isSpecialKey: function (key) {
            if (key != 8 /* backspace */ &&
			key != 9 /* tab */ &&
			key != 13 /* enter */ &&
			key != 35 /* end */ &&
			key != 36 /* home */ &&
			key != 37 /* left */ &&
			key != 39 /* right */ &&
			key != 27 /* right */ &&
			key != 46 /* del */
		    ) {
                return false;
            }

            return true;
        },


        _selection: function () {
            if ('selectionStart' in this.dateTimeInput[0]) {
                var e = this.dateTimeInput[0];
                var selectionLength = e.selectionEnd - e.selectionStart;
                return { start: e.selectionStart, end: e.selectionEnd, length: selectionLength, text: e.value };
            }
            else {
                var r = document.selection.createRange();
                if (r == null) {
                    return { start: 0, end: e.value.length, length: 0 }
                }

                var re = this.dateTimeInput[0].createTextRange();
                var rc = re.duplicate();
                re.moveToBookmark(r.getBookmark());
                rc.setEndPoint('EndToStart', re);
                var selectionLength = r.text.length;

                return { start: rc.text.length, end: rc.text.length + r.text.length, length: selectionLength, text: r.text };
            }
        },

        _selectGroup: function (value) {
            if (this.host.css('display') == 'none')
                return;

            if (this.readonly) return;

            var selection = this._selection();
            var str = "";
            var currentString = "";
            var activeEditor = null;
            for (i = 0; i < this.items.length; i++) {
                currentString = this.items[i].dateParser(this.value);
                if (this.isEditing && this.items[i].type != 'ReadOnly') {
                    var isReadOnlyDay = this.items[i].type == 'Day' && this.items[i].format.length > 2;
                    if (this.items[i].type == 'FORMAT_AMPM') {
                        isReadOnlyDay = true;
                    }

                    if (!isReadOnlyDay) {
                        currentString = this.items[i].dateParserInEditMode(new Number(this.editors[i].value), "d" + this.editors[i].maxEditPositions);
                        while (currentString.length < this.editors[i].maxEditPositions) {
                            currentString = '0' + currentString;
                        }
                    }
                }

                str += currentString;

                if (this.items[i].type == 'ReadOnly')
                    continue;

                if (this.items[i].type == 'Day' && this.items[i].format.length > 2)
                    continue;

                if (this.items[i].type == 'FORMAT_AMPM')
                    continue;

                if (value != undefined && value != -1) {
                    if (i >= value) {
                        var selectionStart = str.length - currentString.length;
                        var selectionLength = currentString.length;

                        if (this.enableAbsoluteSelection) {
                            if (!isNaN(parseInt(currentString)) && this.isEditing && value != -1) {
                                selectionLength = 1;
                                selectionStart += this.editors[i].positions;
                            }
                        }

                        if (selectionStart == this.dateTimeInput.val().length) {
                            selectionStart--;
                        }

                        this._setSelection(selectionStart, selectionStart + selectionLength);
                        activeEditor = this.editors[i];
                        this.activeEditor = activeEditor;
                        break;
                    }
                }
                else if (str.length >= selection.start) {
                    activeEditor = this.editors[i];
                    this.activeEditor = activeEditor;
                    var selectionStart = str.length - currentString.length;
                    var selectionLength = 1;
                    if (this.enableAbsoluteSelection) {
                        if (!isNaN(parseInt(currentString)) && this.isEditing && value != -1) {
                            selectionLength = 1;
                            selectionStart += this.editors[i].positions;
                        }
                    }
                    else selectionLength = currentString.length;

                    this._setSelection(selectionStart, selectionStart + selectionLength);
                    break;
                }
            }

            if (i < this.items.length && value == -1) {
                if (this.items[i].type != 'ReadOnly') {
                    this.activeEditor.positions = 0;
                }
            }

            var newSelection = this._selection();
            if (newSelection.length == 0) {
                if (newSelection.start > 0) {
                    var editorIndex = this._getLastEditableEditorIndex();
                    if (editorIndex >= 0) {
                        this._selectGroup(editorIndex);
                    }
                }
            }
        },

        _getLastEditableEditorIndex: function () {
            var editorIndex = -1;
            for (i = 0; i < this.editors.length; i++) {
                if (this.items[i].type == 'ReadOnly')
                    continue;

                if (this.items[i].type == 'Day' && this.items[i].format.length > 2)
                    continue;

                if (this.items[i].type == 'FORMAT_AMPM')
                    continue;

                editorIndex = i;
            }

            return editorIndex;
        },

        _setSelection: function (start, end) {
            if ('selectionStart' in this.dateTimeInput[0]) {
                //  this.dateTimeInput[0].focus();
                this.dateTimeInput[0].setSelectionRange(start, end);
            }
            else {
                var range = this.dateTimeInput[0].createTextRange();
                range.collapse(true);
                range.moveEnd('character', end);
                range.moveStart('character', start);
                range.select();
            }
        },

        _setSelectionStart: function (start) {
            this._setSelection(start, start);
        },

        destroy: function () {
            this.host
			.removeClass("jqx-rc-all")
			;
            this.calendar.destroy();
            this.container.remove();
            this._removeHandlers();
            this.dateTimeInput.remove();
            this.host.remove();
        },

        refresh: function (initialRefresh) {
            if (initialRefresh != true) {
                this._setSize();
                this._arrange();
            }
        },

        _setOption: function (key, value) {
            if (key === "value") {
                if (value == null) {
                    this.value = value;
                    this._refreshValue();
                }
                else {
                    if (!this.value._equalDate(value.dateTime)) {
                        this.value = value;
                        this._refreshValue();
                    }
                }
            }
            if (key == 'maxDate') {
                this.calendar.maxDate = value;
            }

            if (key == 'minDate') {
                this.calendar.minDate = value;
            }

            if (key == 'showCalendarButton') {
                if (value) {
                    this.calendarButton.css('display', 'block');
                }
                else {
                    this.calendarButton.css('display', 'none');
                }
            }

            if (key == "disabled") {
                this.dateTimeInput.attr("disabled", value);
            }

            if (key == "readonly") {
                this.readonly = value;
                this.dateTimeInput.css("readonly", value);
            }

            if (key == "textAlign") {
                this.dateTimeInput.css("text-align", value);
                this.textAlign = value;
            }

            if (key == "width") {
                this.width = value;
                this.width = parseInt(this.width);
                this._arrange();
            }
            else if (key == "height") {
                this.height = value;
                this.height = parseInt(this.height);
                this._arrange();
            }
        },


        _refreshValue: function () {
            this._updateEditorsValue();
            this.updateValue();
            this._validateValue();
            this._updateText();
        }
    })
})(jQuery);


(function ($) {
    $.jqx._jqxDateTimeInput.DateTimeFormatItem = {};
       $.extend($.jqx._jqxDateTimeInput.DateTimeFormatItem, { 

    _create: function(format, type, culture)
    {
        this.format = format;
        this.type = type;
        this.culture = culture;
        return this;
    },

    _itemValue: function()
    {
        switch (this.format.length)
        {
            case 1:
                return 9;
            case 2:
                return 99;
            case 3:
            default:
                return 999;
        }
    },

    _maximumValue: function()
    {
        switch (this.format.length)
        {
            case 1:
                return 9;
            case 2:
                return 99;
            case 3:
            default:
                return 999;
        }     
    },

    dateParser: function(formattedDateTime)
    {
        if (formattedDateTime == null)
            return "";
        var value = $.global.format(formattedDateTime.dateTime, this.format.length == 1 ? '%' + this.format: this.format, this.culture);
        return value;
    },

    dateParserInEditMode: function(val, format)
    {
        if (val == null)
            return "";

        var value = $.global.format(val.toString(), format.length == 1 ? '%' + format: format, this.culture);
        return value;
    },

    getDateTimeEditorByItemType: function(value)
    {
        switch (this.type)
        {
            case 'FORMAT_AMPM':
                var aMpMEditor = $.jqx._jqxDateTimeInput.AmPmEditor._createAmPmEditor(this.format, value.hour / 12, $.global.culture.calendar.AM[0], $.global.culture.calendar.PM[0], this);
                var newEditor = $.extend({}, aMpMEditor); 
                return newEditor;
             case 'Character':
                return null;
            case 'Day':
                var year = value.year;
                var month = value.month;
                var dayNames;
                if (this.format.length == 3)
                    dayNames = $.global.culture.calendar.days.namesAbbr;
                else if (this.format.length > 3)
                    dayNames = $.global.culture.calendar.days.names;
                else
                    dayNames = null;

                var val = value.day;
                if (dayNames != null)
                    val =  value.dayOfWeek + 1;

                var dayEditor = $.jqx._jqxDateTimeInput.DateEditor._createDayEditor(value, value.day, 1, value._daysInMonth(year, month), this.format.length == 1 ? 1 : 2, 2, dayNames, this);
                var newEditor = $.extend({}, dayEditor); 
                return newEditor;
            case 'FORMAT_hh':
                var initialValue = value.hour % 12;
                if (initialValue == 0)
                    initialValue = 12;
                var hhEditor = $.jqx._jqxDateTimeInput.NumberEditor._createNumberEditor(initialValue, 0, 23, this.format.length == 1 ? 1 : 2, 2, this);
                var newEditor = $.extend({}, hhEditor); 
                return newEditor;
            case 'FORMAT_HH':
                var HHEditor = $.jqx._jqxDateTimeInput.NumberEditor._createNumberEditor(value.hour, 0, 23, this.format.length == 1 ? 1 : 2, 2, this);
                var newEditor = $.extend({}, HHEditor); 
                return newEditor;
            case 'Millisecond':
                var milisecondEditor = $.jqx._jqxDateTimeInput.NumberEditor._createNumberEditor(value.millisecond / this._itemValue(), 0, this._maximumValue(), this.format.length, this.format.length, this);
                var newEditor = $.extend({}, milisecondEditor); 
                return newEditor;
            case 'Minute':
                var minuteEditor = $.jqx._jqxDateTimeInput.NumberEditor._createNumberEditor(value.minute, 0, 59, this.format.length == 1 ? 1 : 2, 2, this);
                var newEditor = $.extend({}, minuteEditor); 
                return newEditor;
           case 'Month':
                var monthNames;
                if (this.format.length == 3)
                    monthNames = $.global.culture.calendar.months.namesAbbr;
                else if (this.format.length > 3)
                    monthNames = $.global.culture.calendar.months.names;
                else
                    monthNames = null;
                var monthEditor = $.jqx._jqxDateTimeInput.DateEditor._createMonthEditor(value.month, this.format.length == 2 ? 2 : 1, monthNames, this);
                var newEditor = $.extend({}, monthEditor); 
                return newEditor;
            case 'ReadOnly':
                return $.jqx._jqxDateTimeInput.DisabledEditor._create(this.format.length, value.day, this);
            case 'Second':
                var secondEditor = $.jqx._jqxDateTimeInput.NumberEditor._createNumberEditor(value.second, 0, 59, this.format.length == 1 ? 1 : 2, 2, this);
                var newEditor = $.extend({}, secondEditor); 
                return newEditor;
          case 'Year':
               var yearEditor = $.jqx._jqxDateTimeInput.DateEditor._createYearEditor(value.year, this.format.length, this);
               var newEditor = $.extend({}, yearEditor); 
               return newEditor;
        }

        return null;
    },
    //[optimize]
    getDateTimeWithOffset: function(offset, value)
    {
        if (offset == null || value == null)
        {
		    throw 'Invalid arguments';
        }

        var hours = value.hour;
        var minutes = value.minute;
        var seconds = value.second;
        var days = value.day();
        var months = value.month();
        var years = value.year();

        var dateTime = value;
        var newDateTime = value;

        switch (this.type)
        {
            case 'FORMAT_AMPM':
                hours = 12 * (offset - hours / 12);
                break;
            case 'Day':
                days = offset - days;
                if (days != offset)
                {
                    if (offset == 29 && months == 2)
                    {
                        newDateTime = dateTime;
                        while (!DateTime._isLeapYear(newDateTime.year))
                        {
                            newDateTime = newDateTime._addYears(1);
                        }

                            newDateTime = newDateTime._addDays(offset - newDateTime.day);
                    }
                    else
                    {
                        newDateTime = dateTime._addMonths(1 - dateTime.month);
                        newDateTime = newDateTime._addDays(offset - dateTime.day);
                    }
                }
                break;
            case 'FORMAT_hh':
                var res = offset == 12 ? 0 : offset;
                dateTime = dateTime._addHours(res - (dateTime.hour % 12));
                break;
            case 'FORMAT_HH':
                dateTime = dateTime._addHours(offset - dateTime.hour);
                break;
            case 'Millisecond':
                dateTime = dateTime._addMilliseconds(offset * this._itemValue() - dateTime.millisecond);
                break;
            case 'Minute':
                dateTime = dateTime._addMinutes(offset - dateTime.minute);
                break;
            case 'Month':
                newDateTime = dateTime._addMonths(offset - dateTime.month);
                if (offset == 2 && dateTime.day == 29 && dateTime.day != newDateTime.day
                    )
                {
                    newDateTime = dateTime;
                    while (!dateTime.IsLeapYear(newDateTime.year))
                    {
                        newDateTime = newDateTime._addYears(1);
                    }

                    newDateTime = newDateTime._addMonths(offset - newDateTime.month);
                }

                dateTime = newDateTime;
                break;
            case 'ReadOnly':
                break;
            case 'Second':
                dateTime = dateTime._addSeconds(offset - dateTime.second);

                break;
            case 'Year':
                if (offset == 0)
                    offset = 1;

                dateTime = dateTime._addYears(offset - value.year);
                break;
        }
        return dateTime;
    }
    });
})(jQuery);

(function ($) {
         $.jqx._jqxDateTimeInput.DateEditor = $.extend($.jqx._jqxDateTimeInput.DateEditor, { 

        formatValueLength: 0,
        handleYears: false,
        handleDays: false,
        handleMonths: false,
        positions: 0,
        value: 0,
        minEditPositions : 0,
        maxEditPositions: 0,
        minValue: 0,
        maxValue: 0,
        item: null,
        dateTimeFormatInfo: null,
        days: null,
        dateTimeMonths: null,
        lastDayInput: null,

        minPositions : function()
        {
            if (this.handleYears)
            {
                if (this.formatValueLength == 4)
                {
                    if (this.positions <= 1)
                    {
                        return 1;
                    }
                    else
                    {
                        if (this.positions >= 4)
                        {
                            return 4;
                        }
                    }

                    return this.positions;
                }
                else
                {
                    return this.minEditPositions;
                }
            }
            return this.minEditPositions;   
        },
        //[optimize]
        initializeFields: function(minValue, maxValue, minEditPositions, maxEditPositions, item)
        {
            this.minValue = minValue;
            this.maxValue = maxValue;
            this.minEditPositions = minEditPositions;
            this.maxEditPositions = maxEditPositions;
            this.updateActiveEditor(minValue);
            this.item = item;
        },
        //[optimize]
        _createYearEditor: function(baseYear, formatValueLength, item)
        {
            $.jqx._jqxDateTimeInput.DateEditor = $.extend(true, {}, this);
            this.initializeFields(formatValueLength <= 4 ? 0 : 0, formatValueLength < 4 ? 99 : 9999, (formatValueLength == 2) ? 2 : 1, formatValueLength > 3 ? 4 : 2, item);
            this.initializeYearEditor(baseYear, formatValueLength, item.culture);
            this.handleYears = true;
            return this;
        },
        //[optimize]
        initializeYearEditor: function(baseYear, formatValueLength, info)
        {
            this.formatValueLength = formatValueLength;
            this.dateTimeFormatInfo = info;

            var realYear = baseYear;
            realYear = Math.min(realYear, 9999);
            realYear = Math.max(realYear, 1);
            realYear = this.formatValueLength < 4 ? realYear % 100 : realYear;
            this.updateActiveEditor(realYear);
            this.value = realYear;
        },
        //[optimize]
        updateActiveEditor: function(newValue)
        {
            this.value = newValue;
            this.positions = 0;
        },
        //[optimize]
        _createDayEditor: function(editedValue, initialValue, minValue, maxValue, minEditingPositions, maxEditingPositions, dayKeys, item)
        {
            $.jqx._jqxDateTimeInput.DateEditor = $.extend(true, {}, this);
            this.initializeFields(minValue, maxValue, 1, maxEditingPositions, item);
            this.currentValue = editedValue;
            this.value = initialValue;
            this.days = dayKeys;
            this.handleDays = true;
            return this;
        },
        //[optimize]
        getDayOfWeek: function(val)
        {
            if (typeof this.currentValue == $.jqx._jqxDateTimeInput.DateTime)
            {
                 this.currentValue.dayOfWeek();
            }
            return val;
        },
        //[optimize]
        defaultTextValue: function()
        {
            var value = this.value;
            var minPositions = this.minEditPositions;
            var minFormattedPositions = minPositions;
            var formattedValue = $.global.format(this.value, "d" + minFormattedPositions, "");

            return formattedValue;
        },
        //[optimize]
        textValue : function()
        {
            if (this.handleDays)
            {
                if (this.days == null)
                {
                    return this.defaultTextValue();
                }
                else
                {
                    var val = (this.value % 7) + 1;
                    val = this.getDayOfWeek(val);
                    return this.days[val];
                }
            }
            else if (this.handleMonths)
            {
                if (this.dateTimeMonths == null || this.value < 1 || this.value > 12)
                {
                    return this.defaultTextValue();
                }
                else
                {
                    return this.dateTimeMonths[this.value - 1];
                }
            }
            return this.defaultTextValue();
       },
       //[optimize]
        defaultInsertString: function(inseredValue)
        {
            if (inseredValue == null)
            {
                return this.deleteValue();
            }

            if (inseredValue.length == 0)
            {
                 return this.deleteValue();
            }

           var character = inseredValue.substring(0, 1);
           if (isNaN(character))
           {
              return;
           }

           var res = true;
           var tmp;
           var entries = 1; 
           var formattedValue = $.global.format(Number(this.value), "d" + this.maxEditPositions, this.culture)     
           tmp = formattedValue;
           if (this.positions >= this.maxEditPositions)
           {
              this.positions = 0;
           }
            
           tmp = tmp.substring(0, this.positions) + character + tmp.substring(this.positions + 1);
           tmp = this.setValueByString(tmp, entries);
           return true;
        },
        //[optimize]
        setValueByString: function(tmp, entries)
        {
            tmp = this.fixValueString(tmp);
            var nextValue = new Number(tmp);
            this.value = nextValue;
            this.positions += entries;
            return tmp;
        },
        //[optimize]
        fixValueString: function(tmp)
        {
            if (tmp.length > this.maxEditPositions)
            {
                tmp = tmp.substring(tmp.length - this.maxEditPositions);
            }

//            var enteredDigit = parseInt(tmp[this.positions]);
//            var pos = this.maxEditPositions - 1;
//            while(parseInt(tmp) > this.maxValue)
//            {
//                if (pos < 0)
//                    break;

//                if (tmp[pos] > 0)
//                {
//                    var digit = parseInt(tmp[pos])-1;
//                    tmp = tmp.substring(0, pos) + digit + tmp.substring(pos+1);
//                }
//                else pos--;
//            }

            return tmp;
        },
        //[optimize]
        initializeValueString: function(formattedValue)
        {
            var tmp;
            tmp = "";

            if (this.hasDigits())
            {
                tmp = formattedValue;
            }
            return tmp;
        },
        //[optimize]
        deleteValue: function()
        {
            if (this.value == this.minValue && this.hasDigits() == false)
            {
                return false;
            }

            this.updateActiveEditor(this.minValue);
            return true;
        },
        //[optimize]
        hasDigits: function()
        {
            return this.positions > 0;
        },
        //[optimize]
        insert: function(input)
        {
            if (this.handleDays)
            {
                if (this.days != null)
                {
                    var res = false;
                    res = this.insertLongString(input, res);
                    if (res)
                    {
                        return res;
                    }
                    res = this.insertShortString(input, res);
                    if (res)
                    {
                        return res;
                    }
                }              

                if (this.value == 1 && this.lastDayInput != null && this.lastDayInput.toString().length > 0 && this.lastDayInput.toString() == "0")
                {
                    this.value = 0;
                }
               
                this.lastDayInput = input;

                return this.defaultInsertString(input);
            }
            else if ( this.handleMonths)
            {
                if (this.dateTimeMonths != null)
                {
                    var res = false;
                    res = this.insertLongString2(input, res);

                    if (res)
                    {
                        return res;
                    }

                    res = this.insertShortString2(input, res);

                    if (res)
                    {
                        return res;
                    }
                }
            }

            return this.defaultInsertString(input);     
        },
        //[optimize]
        insertShortString: function(input, res)
        {
            if (input.length == 1)
            {
                for (i = 0; i < 6; ++i)
                {
                    var testedDay = (this.value + i) % 7 + 1;
                    var dayName = this.days[testedDay - 1];
                    if (dayName.substring(0, 1) == input)
                    {
                        this.updateActiveEditor(testedDay);
                        res = true;
                        return res;
                    }
                }
            }
            return res;
        },
        //[optimize]
        insertLongString: function(input, res)
        {
            if (input.length > 0)
            {
                for (i = 0; i < 6; ++i)
                {
                    var testedDay = (this.value + i) % 7 + 1;
                    if (this.days[testedDay - 1] == input)
                    {
                        this.updateActiveEditor(testedDay);
                        res = true;
                        return res;
                    }
                }
            }
            return res;
        },
        //[optimize]
        _createMonthEditor: function(baseValue, positions, monthsNames, item)
        {
            $.jqx._jqxDateTimeInput.DateEditor = $.extend(true, {}, this);

            this.initializeFields(1, 12, positions, 2, item);
            this.dateTimeMonths = monthsNames;
            this.value = baseValue;
            if (this.dateTimeMonths != null && this.dateTimeMonths[12] != null && this.dateTimeMonths[12].length > 0)
                this.dateTimeMonths = null;
            this.handleMonths = true;
            return this;
        }, 
        //[optimize]
        insertLongString2: function(input, res)
        {
            if (input.length > 0)
            {
                for (i = 0; i < 11; ++i)
                {
                    month = (this.value + i) % 12 + 1;
                    if (this.dateTimeMonths[month - 1] == input)
                    {
                        this.updateActiveEditor(month);
                        res = true;
                        return res;
                    }
                }
            }
            return res;
        },
        //[optimize]
        insertShortString2: function(input, res)
        {
            if (input.length == 1)
            {
                for (i = 0; i < 11; ++i)
                {
                    var month = (this.value + i) % 12 + 1;
                    var monthName = this.dateTimeMonths[month - 1];
                    if (monthName.substring(0, 1) == input)
                    {
                        this.updateActiveEditor(month);
                        res = true;
                        return res;
                    }
                }
            }
            return res;
        },
        //[optimize]
        correctMaximumValue : function(val)
        {
            if (val > this.maxValue)
            {
                val = this.minValue;
            }
            return val;
        },
        //[optimize]
        correctMinimumValue: function(val)
        {
            if (val < this.minValue)
            {
                val = this.maxValue;
            }
            return val;
        },
        //[optimize]
        increaseValue: function(byPosition)
        {
            var formattedValue = $.global.format(Number(this.value), "d" + this.maxEditPositions, this.culture)     
            var digit = formattedValue.toString()[this.positions];
            digit = parseInt(digit) + 1;
            if (digit > 9 ) digit = 0;
            
            if (!byPosition)
            {
                var tmpValue = this.value + 1;
                tmpValue = this.correctMaximumValue(tmpValue);
                this.updateActiveEditor(tmpValue);
                return true;          
            }

            var val = formattedValue.substring(0, this.positions) + digit + formattedValue.substring(this.positions + 1);
          
            if (val != this.value || this.hasDigits())
            {
                this.updateActiveEditor(val);
                return true;
            }
            else
            {
                return false;
            }
        },
        //[optimize]
        decreaseValue: function(byPosition)
        {
            var formattedValue = $.global.format(Number(this.value), "d" + this.maxEditPositions, this.culture)     
            var digit = formattedValue.toString()[this.positions];
            digit = parseInt(digit) - 1;
            if (digit < 0 ) digit = 9;

            if (!byPosition)
            {
                var tmpValue = this.value - 1;
                tmpValue = this.correctMinimumValue(tmpValue);
                this.updateActiveEditor(tmpValue);
                return true;          
            }

            var val = formattedValue.substring(0, this.positions) + digit + formattedValue.substring(this.positions + 1);
          
            if (val != this.value || this.hasDigits())
            {
                this.updateActiveEditor(val);
                return true;
            }
            else
            {
                return false;
            }
        },
        //[optimize]
        getDateTimeItem: function()
        {
            return this.item;
        }
    })
})(jQuery);

//Number Editor
(function ($) {
     $.jqx._jqxDateTimeInput.NumberEditor = {};
       $.extend($.jqx._jqxDateTimeInput.NumberEditor, { 

        formatValueLength: 0,
        positions: 0,
        value: 0,
        minEditPositions : 0,
        maxEditPositions: 0,
        minValue: 0,
        maxValue: 0,
        item: null,
        //[optimize]
        minPositions : function()
        {
            if (this.handleYears)
            {
                if (this.formatValueLength == 4)
                {
                    if (this.positions <= 1)
                    {
                        return 1;
                    }
                    else
                    {
                        if (this.positions >= 4)
                        {
                            return 4;
                        }
                    }

                    return this.positions;
                }
                else
                {
                    return this.minEditPositions;
                }
            }
            return this.minEditPositions;   
        },
        //[optimize]
        _createNumberEditor: function(value, minValue, maxValue, minEditPositions, maxEditPositions, item)            
        {
            $.jqx._jqxDateTimeInput.NumberEditor = $.extend(true, {}, this);
            this.initializeFields(minValue, maxValue, minEditPositions, maxEditPositions, item);
            return this;
         },
        //[optimize]
        initializeFields: function(minValue, maxValue, minEditPositions, maxEditPositions, item)
        {
            this.minValue = minValue;
            this.maxValue = maxValue;
            this.minEditPositions = minEditPositions;
            this.maxEditPositions = maxEditPositions;
            this.updateActiveEditor(minValue);
            this.item = item;
        },
        //[optimize]
        updateActiveEditor: function(newValue)
        {
            this.value = newValue;
            this.positions = 0;
        },
        //[optimize]
        getDayOfWeek: function(val)
        {
            if (typeof this.currentValue == $.jqx._jqxDateTimeInput.DateTime)
            {
                 this.currentValue.dayOfWeek();
            }
            return val;
        },
        //[optimize]
        textValue: function()
        {
            var value = this.value;
            var minPositions = this.minEditPositions;
            var minFormattedPositions = minPositions;
            var formattedValue = $.global.format(this.value, "d" + minFormattedPositions, "");

            return formattedValue;
        },
        //[optimize]
        insert: function(inseredValue)
        {
            if (inseredValue == null)
            {
                return this.deleteValue();
            }

            if (inseredValue.length == 0)
            {
                 return this.deleteValue();
            }

           var character = inseredValue.substring(0, 1);
           if (isNaN(character))
           {
              return;
           }

           var res = true;
           var tmp;
           var entries = 1; 
           var formattedValue = $.global.format(Number(this.value), "d" + this.maxEditPositions, this.culture)     
           tmp = formattedValue;
           if (this.positions >= this.maxEditPositions)
           {
              this.positions = 0;
           }
            
           tmp = tmp.substring(0, this.positions) + character + tmp.substring(this.positions + 1);
           tmp = this.setValueByString(tmp, entries);
           return true;
        },
        //[optimize]
        setValueByString: function(tmp, entries)
        {
            tmp = this.fixValueString(tmp);
            var nextValue = new Number(tmp);
            this.value = nextValue;
            this.positions += entries;
            return tmp;
        },
        //[optimize]
        fixValueString: function(tmp)
        {
            if (tmp.length > this.maxEditPositions)
            {
                tmp = tmp.substring(tmp.length - this.maxEditPositions);
            }

//            var enteredDigit = parseInt(tmp[this.positions]);
//            var pos = this.maxEditPositions - 1;
//            while(parseInt(tmp) > this.maxValue)
//            {
//                if (pos < 0)
//                    break;

//                if (tmp[pos] > 0)
//                {
//                    var digit = parseInt(tmp[pos])-1;
//                    tmp = tmp.substring(0, pos) + digit + tmp.substring(pos+1);
//                }
//                else pos--;
//            }

            return tmp;
        },
        //[optimize]
        initializeValueString: function(formattedValue)
        {
            var tmp;
            tmp = "";

            if (this.hasDigits())
            {
                tmp = formattedValue;
            }
            return tmp;
        },
        //[optimize]
        deleteValue: function()
        {
            if (this.value == this.minValue && this.hasDigits() == false)
            {
                return false;
            }

            this.updateActiveEditor(this.minValue);
            return true;
        },
        //[optimize]
        hasDigits: function()
        {
            return this.positions > 0;
        },
        //[optimize]
        correctMaximumValue : function(val)
        {
            if (val > this.maxValue)
            {
                val = this.minValue;
            }
            return val;
        },
        //[optimize]
        correctMinimumValue: function(val)
        {
            if (val < this.minValue)
            {
                val = this.maxValue;
            }
            return val;
        },
        //[optimize]
        increaseValue: function(byPosition)
        {
            var formattedValue = $.global.format(Number(this.value), "d" + this.maxEditPositions, this.culture)     
            var digit = formattedValue.toString()[this.positions];
            digit = parseInt(digit) + 1;
            if (digit > 9 ) digit = 0;
            
            if (!byPosition)
            {
                var tmpValue = this.value + 1;
                tmpValue = this.correctMaximumValue(tmpValue);
                this.updateActiveEditor(tmpValue);
                return true;          
            }

            var val = formattedValue.substring(0, this.positions) + digit + formattedValue.substring(this.positions + 1);
          
            if (val != this.value || this.hasDigits())
            {
                this.updateActiveEditor(val);
                return true;
            }
            else
            {
                return false;
            }
        },
        //[optimize]
        decreaseValue: function(byPosition)
        {
            var formattedValue = $.global.format(Number(this.value), "d" + this.maxEditPositions, this.culture)     
            var digit = formattedValue.toString()[this.positions];
            digit = parseInt(digit) - 1;
            if (digit < 0 ) digit = 9;

            if (!byPosition)
            {
                var tmpValue = this.value - 1;
                tmpValue = this.correctMinimumValue(tmpValue);
                this.updateActiveEditor(tmpValue);
                return true;          
            }

            var val = formattedValue.substring(0, this.positions) + digit + formattedValue.substring(this.positions + 1);
          
            if (val != this.value || this.hasDigits())
            {
                this.updateActiveEditor(val);
                return true;
            }
            else
            {
                return false;
            }
        },
        //[optimize]
        getDateTimeItem: function()
        {
            return this.item;
        }
    })
})(jQuery);

//DisabledEditor
(function ($) {

   $.jqx._jqxDateTimeInput.DisabledEditor = {};
       $.extend($.jqx._jqxDateTimeInput.DisabledEditor, { 

         _create: function (format, baseValue, am, pm, item) {
            this.format = format;
            this.value = -1;  
            this.item = item;
            return this;
         },

        textValue: function()
        {
            return "";
        },

        insert: function(val)
        {
            return false;
        },

        deleteValue: function()
        {
           return false;
        },

        increaseValue: function()
        {
           return false;
        },

        decreaseValue: function()
        {
            return false;
        },

        getDateTimeItem: function()
        {
            return this.item;
        }
    })
})(jQuery);

//AmPmEditor
(function ($) {

    $.jqx._jqxDateTimeInput.AmPmEditor = {};
       $.extend($.jqx._jqxDateTimeInput.AmPmEditor, { 
         _createAmPmEditor: function (format, baseValue, am, pm, item) {
            this.format = format;
            this.value = baseValue;
            this.amString = am;
            this.pmString = pm;
            this.item = item;

            if (am == pm)
            {
                this.amString  = "<" + am;
                this.pmString = ">" + pm;
            }
            return this;
        },
        //[optimize]
        textValue: function()
        {
           var res = this.amString;
           if (this.value != 0)
           {
               res = this.pmString;
           }
              
           if (this.format.length == 1 && res.length > 1)
           {
               res = res.substring(0, 1);
           }

            return res;
        },
        //[optimize]
        insert: function(val)
        {
            var inserted = val.toString();
            if (inserted.Length == 0)
            {
                return this.deleteValue();
            }

            var res = false;
            if (this.amString.Length > 0
            && this.pmString.Length > 0)
            {
                var amChar = amString[0];
                var newChar = inserted[0];
                var pmChar = pmString[0];

                if (amChar.toString() == newChar.toString())
                {
                    this.value = 0;
                    res = true;

                }
                else if (pmChar.toString() == newChar.toString())
                {
                    this.value = 1;
                    res = true;
                }
            }
            else if (this.pmString.Length > 0)
            {
                this.value = 1;
                res = true;
            }
            else if (this.amString.Length > 0)
            {
                this.value = 0;
                res = true;
            }
          
            return res;
        },
        //[optimize]
        deleteValue: function()
        {
            var isValid = true;

            if (this.amString.Length == 0
                && this.pmString.Length != 0)
            {
                if (this.value == 0)
                {
                    return false;
                }

                this.value = 0;
            }
            else
            {
                if (this.value == 1)
                {
                    return false;
                }

                this.value = 1;
            }
            return isValid;
        },

        increaseValue: function()
        {
           this.value = 1 - this.value;
           return true;
        },

        decreaseValue: function()
        {
            this.increaseValue();
            return true;
        },

        getDateTimeItem: function()
        {
            return this.item;
        }
    })
})(jQuery);

// DateTime 
(function ($) {
    $.jqx._jqxDateTimeInput.getDateTime = function (date)
    {
        var result =
        {
            dateTime: new Date(date),
            daysPer4Years: 0x5b5,
            daysPerYear: 0x16d,
            daysToMonth365:  { 0:0, 1:0x1f, 2:0x3b, 3:90, 4:120, 5:0x97, 6:0xb5, 7:0xd4, 8:0xf3, 9:0x111, 10:0x130, 11:0x14e, 12:0x16d },
            daysToMonth366: { 0:0, 1:0x1f, 2:60, 3:0x5b, 4:0x79, 5:0x98, 6:0xb6, 7:0xd5, 8:0xf4, 9:0x112, 10:0x131, 11:0x14f, 12:0x16e },
            maxValue: 0x2bca2875f4373fff,
            millisPerDay: 0x5265c00,
            millisPerHour: 0x36ee80,
            millisPerMinute: 0xea60,
            millisPerSecond: 0x3e8,
            minTicks: 0,
            minValue: 0,
            ticksPerDay: 0xc92a69c000,
            ticksPerHour: 0x861c46800,
            ticksPerMillisecond: 0x2710,
            ticksPerMinute: 0x23c34600,
            ticksPerSecond: 0x989680,
            hour: date.getHours(),
            minute:  date.getMinutes(),                
            day: date.getDate(),                
            second: date.getSeconds(),
            month: 1+date.getMonth(),
            year: date.getFullYear(),
            millisecond:date.getMilliseconds(),
            dayOfWeek: date.getDay(),
            isWeekend: function(value)
            {
                if (value == undefined || value == null)
                    value = this.dateTime;

                var isWeekend = value.getDay()%6 == 0;
                return isWeekend;
            },
            dayOfYear: function(value)
            {
                if (value == undefined || value == null)
                    value = this.dateTime;

                var firstDay = new Date(value.getFullYear(), 0, 1);
                return Math.ceil((value - firstDay) / 86400000);
            },
            _setDay: function(value)
            {
                if (value == undefined || value == null)
                    value = 0;

                this.dateTime.setDate(value);
                this.day = this.dateTime.getDate();
            },
            _setMonth: function(value)
            {
                if (value == undefined || value == null)
                    value = 0;

                this.dateTime.setMonth(value-1);
                this.month = 1 + this.dateTime.getMonth();
            },
            _setYear: function(value)
            {
                if (value == undefined || value == null)
                    value = 0;

                this.dateTime.setFullYear(value);
                this.year = this.dateTime.getFullYear();
            },
            _setHours: function(value)
            {
                if (value == undefined || value == null)
                    value = 0;

                this.dateTime.setHours(value);
                this.hour = this.dateTime.getHours();
            },
            _setMinutes: function(value)
            {
                if (value == undefined || value == null)
                    value = 0;

                this.dateTime.setMinutes(value);
                this.minute = this.dateTime.getMinutes();
            },
            _setSeconds: function(value)
            {
                if (value == undefined || value == null)
                    value = 0;

                this.dateTime.setSeconds(value);
                this.second = this.dateTime.getSeconds();
            },
            _setMilliseconds: function(value)
            {
                if (value == undefined || value == null)
                  value = 0;

                this.dateTime.setMilliseconds(value);
                this.millisecond = this.dateTime.getMilliseconds();
            },
            _addDays: function(value)
            {
                var newDate = this.dateTime;
                newDate.setDate(newDate.getDate() + value);
                return newDate;
            },
             _addWeeks: function(value)
            {
                var newDate = this.dateTime;
                newDate.setDate(newDate.getDate() + 7*value);
                return newDate;
            },
            _addMonths: function(value)
            {
                var newDate = this.dateTime;
                newDate.setMonth(newDate.getMonth() + value);
                return newDate;
            },
            _addYears: function(value)
            {
                var newDate = this.dateTime;
                newDate.setFullYear(newDate.getFullYear() + value);
                return newDate;
            },
            _addHours: function(value)
            {
                var newDate = this.dateTime;
                newDate.setHours(newDate.getHours() + value);
                return newDate;
            },
            _addMinutes: function(value)
            {
                var newDate = this.dateTime;
                newDate.setMinutes(newDate.getMinutes() + value);
                return newDate;
            },
            _addSeconds: function(value)
            {
                var newDate = this.dateTime;
                newDate.setSeconds(newDate.getSeconds() + value);
                return newDate;
            },
            _addMilliseconds: function(value)
            {
                var newDate = this.dateTime;
                newDate.setMilliseconds(newDate.getMilliseconds() + value);
                return newDate;
            },
            _isLeapYear: function(year)
            {
                if ((year < 1) || (year > 0x270f))
                {
                    throw "invalid year";
                }
                if ((year % 4) != 0)
                {
                    return false;
                }
                if ((year % 100) == 0)
                {
                    return ((year % 400) == 0);
                }
                return true;
            },
            _dateToTicks: function(year, month, day)
            {
                if (((year >= 1) && (year <= 0x270f)) && ((month >= 1) && (month <= 12)))
                {
                    var numArray = this._isLeapYear(year) ? this.daysToMonth366 : this.daysToMonth365;
                    if ((day >= 1) && (day <= (numArray[month] - numArray[month - 1])))
                    {
                        var year = year - 1;
                        var ticks = ((((((year * 0x16d) + (year / 4)) - (year / 100)) + (year / 400)) + numArray[month - 1]) + day) - 1;
                        return (ticks * 0xc92a69c000);
                    }
                }
            },
            _daysInMonth: function(year, month)
            {
                if ((month < 1) || (month > 12))
                {
                    throw("Invalid month.");
                }
                var arr = this._isLeapYear(year) ? this.daysToMonth366 : this.daysToMonth365;
                return (arr[month] - arr[month - 1]);
            },
            _timeToTicks: function(hour, minute, second)
            {
                var ticks = ((hour * 0xe10) + (minute * 60)) + second;
                return (ticks * 0x989680);
            },
            _equalDate: function(date)
            {
                if (this.year == date.getFullYear() && this.day == date.getDate() && this.month == date.getMonth() + 1)
                    return true;
                      
                return false;
            }
         }
        return result;
    }
})(jQuery);
