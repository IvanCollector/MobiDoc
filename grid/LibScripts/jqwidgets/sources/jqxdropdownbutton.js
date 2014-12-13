/*
jQWidgets v2.7.0 (2013-Feb-08)
Copyright (c) 2011-2013 jQWidgets.
License: http://jqwidgets.com/license/
*/

(function ($) {

    $.jqx.jqxWidget("jqxDropDownButton", "", {});

    $.extend($.jqx._jqxDropDownButton.prototype, {
        defineInstance: function () {
            // enables/disables the dropdownlist.
            this.disabled = false;
            // gets or sets the popup width.
            this.width = null;
            // gets or sets the popup height.
            this.height = null;
            // gets or sets the scrollbars size.
            this.arrowSize = 19;
            // enables/disables the hover state.
            this.enableHover = true;
            // Type: Number
            // Default: 100
            // Showing Popup Animation's delay.
            if (this.openDelay == undefined) {
                this.openDelay = 350;
            }
            // Type: Number
            // Default: 200
            // Hiding Popup Animation's delay.
            if (this.closeDelay == undefined) {
                this.closeDelay = 400;
            }
            // default, none
            // Type: String.
            // enables or disables the animation.
            this.animationType = 'default';
            // Type: Boolean
            // Default: false
            // Enables or disables the browser detection.
            this.enableBrowserBoundsDetection = false;
            this.dropDownHorizontalAlignment = 'left';
            this.dropDownZIndex = 9999;
            this.autoOpen = false;
            this.rtl = false;
            this.events =
	   	    [
            // occurs when the dropdownbutton is opened.
		      'open',
            // occurs when the dropdownbutton is closed.
              'close'
            ];
        },

        createInstance: function (args) {
            this.isanimating = false;

            var dropDownButtonStructure = $("<div tabIndex=0 style='background-color: transparent; -webkit-appearance: none; outline: none; width:100%; height: 100%; padding: 0px; margin: 0px; border: 0px; position: relative;'>" +
                "<div id='dropDownButtonWrapper' style='outline: none; background-color: transparent; border: none; float: left; width:100%; height: 100%; position: relative;'>" +
                "<div id='dropDownButtonContent' style='outline: none; background-color: transparent; border: none; float: left; position: relative;'/>" +
                "<div id='dropDownButtonArrow' style='background-color: transparent; border: none; float: right; position: relative;'><div></div></div>" +
                "</div>" +
                "</div>");

            this.popupContent = this.host.children();

            if (this.popupContent.length == 0) {
                this.popupContent = $('<div>' + this.host.text() + '</div>');
                this.popupContent.css('display', 'block');
                this.element.innerHTML = "";
            }
            else {
                this.popupContent.detach();
            }

            var me = this;
            this.addHandler(this.host, 'loadContent', function (event) {
                me._arrange();
            });

            try {
                var popupID = 'dropDownButtonPopup' + this.element.id;
                var oldContainer = $($.find('#' + popupID));
                if (oldContainer.length > 0) {
                    oldContainer.remove();
                }

                var container = $("<div class='dropDownButton' style='overflow: hidden; position: absolute;' id='dropDownButtonPopup" + this.element.id + "'></div>");
                container.addClass(this.toThemeProperty('jqx-widget-content'));
                container.addClass(this.toThemeProperty('jqx-popup'));
                container.addClass(this.toThemeProperty('jqx-rc-all'));
                container.css('z-index', this.dropDownZIndex);
                this.popupContent.appendTo(container);
                container.appendTo(document.body);
                this.container = container;
                if (this.animationType == 'none') {
                    this.container.css('visibility', 'hidden');
                }
                else {
                    this.container.css('visibility', 'hidden');
                }
            }
            catch (e) {

            }

            this.touch = $.jqx.mobile.isTouchDevice();
            this.dropDownButtonStructure = dropDownButtonStructure;
            this.host.append(dropDownButtonStructure);

            this.dropDownButtonWrapper = this.host.find('#dropDownButtonWrapper');
            this.dropDownButtonArrow = this.host.find('#dropDownButtonArrow');
            this.arrow = $(this.dropDownButtonArrow.children()[0]);
            this.dropDownButtonContent = this.host.find('#dropDownButtonContent');
            this.dropDownButtonContent.addClass(this.toThemeProperty('jqx-dropdownlist-content'));
            this.dropDownButtonWrapper.addClass(this.toThemeProperty('jqx-disableselect'));
            if (this.rtl) {
                this.dropDownButtonContent.addClass(this.toThemeProperty('jqx-rtl'));
            }

            this.addHandler(this.dropDownButtonWrapper, 'selectstart', function () { return false; });
            this.dropDownButtonWrapper[0].id = "dropDownButtonWrapper" + this.element.id;
            this.dropDownButtonArrow[0].id = "dropDownButtonArrow" + this.element.id;
            this.dropDownButtonContent[0].id = "dropDownButtonContent" + this.element.id;

            var self = this;
            this.propertyChangeMap['disabled'] = function (instance, key, oldVal, value) {
                if (value) {
                    instance.host.addClass(self.toThemeProperty('jqx-dropdownlist-state-disabled'));
                    instance.host.addClass(self.toThemeProperty('jqx-fill-state-disabled'));
                    instance.dropDownButtonContent.addClass(self.toThemeProperty('jqx-dropdownlist-content-disabled'));
                }
                else {
                    instance.host.removeClass(self.toThemeProperty('jqx-dropdownlist-state-disabled'));
                    instance.host.removeClass(self.toThemeProperty('jqx-fill-state-disabled'));
                    instance.dropDownButtonContent.removeClass(self.toThemeProperty('jqx-dropdownlist-content-disabled'));
                }
            }

            if (this.disabled) {
                this.host.addClass(this.toThemeProperty('jqx-dropdownlist-state-disabled'));
                this.host.addClass(this.toThemeProperty('jqx-fill-state-disabled'));
                this.dropDownButtonContent.addClass(this.toThemeProperty('jqx-dropdownlist-content-disabled'));
            }

            this.host.addClass(this.toThemeProperty('jqx-widget'));
            this.host.addClass(this.toThemeProperty('jqx-widget-content'));
            this.host.addClass(this.toThemeProperty('jqx-dropdownlist-state-normal'));
            this.host.addClass(this.toThemeProperty('jqx-rc-all'));
            this.host.addClass(this.toThemeProperty('jqx-fill-state-normal'));

            this.arrow.addClass(this.toThemeProperty('icon-arrow-down'));
            this.arrow.addClass(this.toThemeProperty('icon'));
            this._setSize();
            this.render();
            // fix for IE7
            if ($.jqx.browser.msie && $.jqx.browser.version < 8) {
                this.container.css('display', 'none');
                if (this.host.parents('.jqx-window').length > 0) {
                    var zIndex = this.host.parents('.jqx-window').css('z-index');
                    container.css('z-index', zIndex + 10);
                    this.container.css('z-index', zIndex + 10);
                }
            }
        },

        // sets the button's content.
        setContent: function (element) {
            this.dropDownButtonContent.children().remove();
            this.dropDownButtonContent[0].innerHTML = "";
            this.dropDownButtonContent.append(element);
        },

        // get the button's content.
        getContent: function () {
            if (this.dropDownButtonContent.children().length > 0) {
                return this.dropDownButtonContent.children();
            }

            return this.dropDownButtonContent.text();
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
                this.refresh(false);
                var me = this;
                var width = this.host.width();

                $(window).resize(function () {
                    me._arrange();
                });
            }
        },

        // returns true when the popup is opened, otherwise returns false.
        isOpened: function () {
            var me = this;
            var openedpopup = $.data(document.body, "openedJQXButton" + this.element.id);
            if (openedpopup != null && openedpopup == me.popupContent) {
                return true;
            }

            return false;
        },

        focus: function()
        {
            try
            {
                this.host.focus();
            }
            catch (error) {
            }
        },

        render: function () {
            this.removeHandlers();
            var self = this;
            var hovered = false;

            if (!this.touch) {
                this.host.hover(function () {
                    if (!self.disabled && self.enableHover) {
                        hovered = true;
                        self.host.addClass(self.toThemeProperty('jqx-dropdownlist-state-hover'));
                        self.arrow.addClass(self.toThemeProperty('icon-arrow-down-hover'));
                        self.host.addClass(self.toThemeProperty('jqx-fill-state-hover'));
                    }
                }, function () {
                    if (!self.disabled && self.enableHover) {
                        self.host.removeClass(self.toThemeProperty('jqx-dropdownlist-state-hover'));
                        self.host.removeClass(self.toThemeProperty('jqx-fill-state-hover'));
                        self.arrow.removeClass(self.toThemeProperty('icon-arrow-down-hover'));
                        hovered = false;
                    }
                });
            }

            if (self.autoOpen) {
                this.addHandler(this.host, 'mouseenter', function () {
                    var isOpened = self.isOpened();
                    if (!isOpened && self.autoOpen) {
                        self.open();
                        self.host.focus();
                    }
                });

                $(document).on('mousemove.' + self.element.id, function (event) {
                    var isOpened = self.isOpened();
                    if (isOpened && self.autoOpen) {
                        var offset = self.host.offset();
                        var top = offset.top;
                        var left = offset.left;
                        var popupOffset = self.container.offset();
                        var popupLeft = popupOffset.left;
                        var popupTop = popupOffset.top;

                        canClose = true;

                        if (event.pageY >= top && event.pageY <= top + self.host.height()) {
                            if (event.pageX >= left && event.pageX < left + self.host.width())
                                canClose = false;
                        }
                        if (event.pageY >= popupTop && event.pageY <= popupTop + self.container.height()) {
                            if (event.pageX >= popupLeft && event.pageX < popupLeft + self.container.width())
                                canClose = false;
                        }

                        if (canClose) {
                            self.close();
                        }
                    }
                });
            }

            this.addHandler(this.dropDownButtonWrapper, 'mousedown',
            function (event) {
                if (!self.disabled) {
                    var isOpen = self.container.css('visibility') == 'visible';
                    if (!self.isanimating) {
                        if (isOpen) {
                            self.close();
                        }
                        else {
                            self.open();
                        }
                    }
                }
            });

            if (this.touch) {
                this.addHandler($(document), $.jqx.mobile.getTouchEventName('touchstart') + '.' + this.element.id, self.closeOpenedDropDown, { me: this, popup: this.container, id: this.element.id });
            }

            this.addHandler($(document), 'mousedown.' + this.element.id, self.closeOpenedDropDown, { me: this, popup: this.container, id: this.element.id });
            if (document.referrer != "" || window.frameElement) {
                if (window.top != null && window.top != window.self) {
                    var parentLocation = null;
                    if (window.parent && document.referrer) {
                        parentLocation = document.referrer;
                    }

                    if (parentLocation != null && parentLocation.indexOf(document.location.host) != -1) {
                        var eventHandle = function (event) {
                            if (self.isOpened()) {
                                var data = { me: self, popup: self.container, id: self.element.id };
                                event.data = data;
                                //self.closeOpenedDropDown(event);
                            }
                        };

                        if (window.top.document.addEventListener) {
                            window.top.document.addEventListener('mousedown', eventHandle, false);

                        } else if (window.top.document.attachEvent) {
                            window.top.document.attachEvent("on" + 'mousedown', eventHandle);
                        }
                    }
                }
            }

            this.addHandler(this.host, 'keydown', function (event) {
                var isOpen = self.container.css('visibility') == 'visible';

                if (self.host.css('display') == 'none') {
                    return true;
                }

                if (event.keyCode == '13') {
                    if (!self.isanimating) {
                        if (isOpen) {
                            self.close();
                        }
                        else {
                            self.open();
                        }
                    }
                }

                if (event.keyCode == 115) {
                    if (!self.isanimating) {
                        if (!self.isOpened()) {
                            self.open();
                        }
                        else if (self.isOpened()) {
                            self.close();
                        }
                    }
                    return false;
                }

                if (event.altKey) {
                    if (self.host.css('display') == 'block') {
                        if (event.keyCode == 38) {
                            if (self.isOpened()) {
                                self.close();
                            }
                        }
                        else if (event.keyCode == 40) {
                            if (!self.isOpened()) {
                                self.open();
                            }
                        }
                    }
                }

                if (event.keyCode == '27') {
                    if (!self.ishiding) {
                        self.close();
                        if (self.tempSelectedIndex != undefined) {
                            self.selectIndex(self.tempSelectedIndex);
                        }
                    }
                }
            });

            this.addHandler(this.host.find('div:first'), 'focus', function () {
                self.host.addClass(self.toThemeProperty('jqx-dropdownlist-state-focus'));
                self.host.addClass(self.toThemeProperty('jqx-fill-state-focus'));
            });
            this.addHandler(this.host.find('div:first'), 'blur', function () {
                self.host.removeClass(self.toThemeProperty('jqx-dropdownlist-state-focus'));
                self.host.removeClass(self.toThemeProperty('jqx-fill-state-focus'));
            });
        },

        removeHandlers: function () {
            var self = this;
            this.removeHandler(this.dropDownButtonWrapper, 'mousedown');
            this.removeHandler(this.host, 'keydown');
            this.removeHandler(this.host.find('div:first'), 'focus');
            this.removeHandler(this.host.find('div:first'), 'blur');
            this.removeHandler(this.host, 'mouseenter');
            $(document).off('mousemove.' + self.element.id);
        },

        _findPos: function (obj) {
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

            // now check if dropdownbutton is showing outside window viewport - move to a better place if so.
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

            if (offset.top + dpHeight > viewHeight) {
                offset.top -= Math.abs(dpHeight + inputHeight);
            }

            return offset;
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

        // shows the popup.
        open: function () {
            var self = this;
            var popup = this.popupContent;
            var scrollPosition = $(window).scrollTop();
            var scrollLeftPosition = $(window).scrollLeft();
            var top = parseInt(this._findPos(this.host[0])[1]) + parseInt(this.host.outerHeight()) - 1 + 'px';
            var left = parseInt(this.host.offset().left) + 'px';
            var isMobileBrowser = $.jqx.mobile.isSafariMobileBrowser() || $.jqx.mobile.isWindowsPhone();
            var hasTransform = $.jqx.utilities.hasTransform(this.host);

            this.ishiding = false;

            this.tempSelectedIndex = this.selectedIndex;

            if ($('body').css('border-top-width') != '0px') {
                top = parseInt(top) + this._getBodyOffset().top + 'px';
            }
            if ($('body').css('border-left-width') != '0px') {
                left = parseInt(left) + this._getBodyOffset().left + 'px';
            }

            if (hasTransform || (isMobileBrowser != null && isMobileBrowser)) {
                left = $.jqx.mobile.getLeftPos(this.element);
                top = $.jqx.mobile.getTopPos(this.element) + parseInt(this.host.outerHeight());
            }

            popup.stop();
            this.host.addClass(this.toThemeProperty('jqx-dropdownlist-state-selected'));
            this.host.addClass(this.toThemeProperty('jqx-fill-state-pressed'));
            this.arrow.addClass(this.toThemeProperty('icon-arrow-down-selected'));

            var ie7 = false;
            if ($.jqx.browser.msie && $.jqx.browser.version < 8) {
                ie7 = true;
            }

            if (ie7) {
                this.container.css('display', 'block');
            }

            this.container.css('left', left);
            this.container.css('top', top);

            var closeAfterSelection = true;

            var positionChanged = false;

            if (this.dropDownHorizontalAlignment == 'right') {
                var containerWidth = this.container.width();
                var containerLeftOffset = Math.abs(containerWidth - this.host.width());
                if (containerWidth > this.host.width()) {
                    this.container.css('left', 25 + parseInt(left) - containerLeftOffset + "px");
                }
                else this.container.css('left', 25 + parseInt(left) + containerLeftOffset + "px");
            }

            if (this.enableBrowserBoundsDetection) {
                var newOffset = this.testOffset(popup, { left: parseInt(this.container.css('left')), top: parseInt(top) }, parseInt(this.host.outerHeight()));
                if (parseInt(this.container.css('top')) != newOffset.top) {
                    positionChanged = true;
                    this.container.height(popup.outerHeight());
                    popup.css('top', 23);

                    if (this.interval)
                        clearInterval(this.interval);

                    this.interval = setInterval(function () {
                        if (popup.outerHeight() != self.container.height()) {
                            var newOffset = self.testOffset(popup, { left: parseInt(self.container.css('left')), top: parseInt(top) }, parseInt(self.host.outerHeight()));
                            self.container.css('top', newOffset.top);
                            self.container.height(popup.outerHeight());
                        }
                    }, 50);
                }
                else popup.css('top', 0);
                this.container.css('top', newOffset.top);
                if (parseInt(this.container.css('left')) != newOffset.left) {
                    this.container.css('left', newOffset.left);
                }
            }

            if (this.animationType == 'none') {
                this.container.css('visibility', 'visible');
                $.data(document.body, "openedJQXButtonParent", self);
                $.data(document.body, "openedJQXButton" + this.element.id, popup);
                popup.css('margin-top', 0);
                popup.css('opacity', 1);
            }
            else {
                this.container.css('visibility', 'visible');
                var height = popup.outerHeight();
                self.isanimating = true;
                if (this.animationType == 'fade') {
                    popup.css('margin-top', 0);
                    popup.css('opacity', 0);
                    popup.animate({ 'opacity': 1 }, this.openDelay, function () {
                        $.data(document.body, "openedJQXButtonParent", self);
                        $.data(document.body, "openedJQXButton" + self.element.id, popup);
                        self.ishiding = false;
                        self.isanimating = false;
                    });
                }
                else {
                    popup.css('opacity', 1);
                    if (positionChanged) {
                        popup.css('margin-top', height);
                    }
                    else {
                        popup.css('margin-top', -height);
                    }

                    popup.animate({ 'margin-top': 0 }, this.openDelay, function () {
                        $.data(document.body, "openedJQXButtonParent", self);
                        $.data(document.body, "openedJQXButton" + self.element.id, popup);
                        self.ishiding = false;
                        self.isanimating = false;
                    });
                }
            }
            this._raiseEvent('0');
        },

        //OBSOLETE use close instead. 
        hide: function () {
            this.close();
        },

        //OBSOLETE use open instead. 
        show: function () {
            this.open();
        },

        // hides the popup.
        close: function () {
            var popup = this.popupContent;
            var container = this.container;
            var me = this;
            var ie7 = false;
            if ($.jqx.browser.msie && $.jqx.browser.version < 8) {
                ie7 = true;
            }

            if (!this.isOpened()) {
                return;
            }

            $.data(document.body, "openedJQXButton" + this.element.id, null);
            if (this.animationType == 'none') {
                this.container.css('visibility', 'hidden');
                if (ie7) {
                    this.container.css('display', 'none');
                }
            }
            else {
                if (!me.ishiding) {
                    me.isanimating = true;
                    popup.stop();
                    var height = popup.outerHeight();
                    popup.css('margin-top', 0);
                    var animationValue = -height;
                    if (parseInt(this.container.offset().top) < parseInt(this.host.offset().top)) {
                        animationValue = height;
                    }
                    if (this.animationType == 'fade') {
                        popup.css({ 'opacity': 1 });
                        popup.animate({ 'opacity': 0 }, this.closeDelay, function () {
                            container.css('visibility', 'hidden');
                            me.isanimating = false;
                            me.ishiding = false;
                            if (ie7) {
                                container.css('display', 'none');
                            }
                        });
                    }
                    else {
                        popup.animate({ 'margin-top': animationValue }, this.closeDelay, function () {
                            container.css('visibility', 'hidden');
                            me.isanimating = false;
                            me.ishiding = false;
                            if (ie7) {
                                container.css('display', 'none');
                            }
                        });
                    }
                }
            }

            this.ishiding = true;
            this.host.removeClass(this.toThemeProperty('jqx-dropdownlist-state-selected'));
            this.host.removeClass(this.toThemeProperty('jqx-fill-state-pressed'));
            this.arrow.removeClass(this.toThemeProperty('icon-arrow-down-selected'));
            this._raiseEvent('1');
        },

        /* Close popup if clicked elsewhere. */
        closeOpenedDropDown: function (event) {
            var self = event.data.me;
            var $target = $(event.target);

            if ($(event.target).ischildof(event.data.me.host)) {
                return true;
            }

            if ($(event.target).ischildof(event.data.me.popupContent)) {
                return true;
            }

            var dropdownlistInstance = self;

            var isPopup = false;
            $.each($target.parents(), function () {
                if (this.className != 'undefined') {
                    if (this.className.indexOf('dropDownButton') != -1 || this.className.indexOf('menu') != -1) {
                        isPopup = true;
                        return false;
                    }
                }
            });

            if (!isPopup) {
                self.close();
            }

            return true;
        },

        refresh: function () {
            this._arrange();
        },

        _arrange: function () {
            var width = parseInt(this.host.width());
            var height = parseInt(this.host.height());
            var arrowHeight = this.arrowSize;
            var arrowWidth = this.arrowSize;
            var rightOffset = 3;
            var contentWidth = width - arrowWidth - 2 * rightOffset;
            if (contentWidth > 0) {
                this.dropDownButtonContent.width(contentWidth + 'px');
            }

            this.dropDownButtonContent.height(height);
            this.dropDownButtonContent.css('left', 0);
            this.dropDownButtonContent.css('top', 0);

            this.dropDownButtonArrow.width(arrowWidth);
            this.dropDownButtonArrow.height(height);
            if (this.rtl) {
                this.dropDownButtonArrow.css('float', 'left');
                this.dropDownButtonContent.css('float', 'right');
                this.dropDownButtonContent.css('left', -rightOffset);
            }
        },

        destroy: function () {
            this.removeHandler(this.dropDownButtonWrapper, 'selectstart');
            this.removeHandler(this.dropDownButtonWrapper, 'mousedown');
            this.removeHandler(this.host, 'keydown');
            this.host.removeClass();
            this.removeHandler($(document), 'mousedown.' + this.element.id, self.closeOpenedDropDown);
            this.host.remove();
            this.container.remove();
        },

        _raiseEvent: function (id, arg) {
            if (arg == undefined)
                arg = { owner: null };

            var evt = this.events[id];
            args = arg;
            args.owner = this;

            var event = new jQuery.Event(evt);
            event.owner = this;
            if (id == 2 || id == 3 || id == 4) {
                event.args = arg;
            }

            var result = this.host.trigger(event);
            return result;
        },

        propertyChangedHandler: function (object, key, oldvalue, value) {
            if (this.isInitialized == undefined || this.isInitialized == false)
                return;

            if (key == "rtl") {
                if (value) {
                    object.dropDownButtonArrow.css('float', 'left');
                    object.dropDownButtonContent.css('float', 'right');
                }
                else {
                    object.dropDownButtonArrow.css('float', 'right');
                    object.dropDownButtonContent.css('float', 'left');
                }
            }

            if (key == 'autoOpen') {
                object.render();
            }

            if (key == 'theme' && value != null) {
                $.jqx.utilities.setTheme(oldvalue, value, object.host);
            }

            if (key == 'width' || key == 'height') {
                object._setSize();
                object._arrange();
            }
        }
    });
})(jQuery);