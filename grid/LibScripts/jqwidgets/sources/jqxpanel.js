/*
jQWidgets v2.7.0 (2013-Feb-08)
Copyright (c) 2011-2013 jQWidgets.
License: http://jqwidgets.com/license/
*/

(function ($) {

    $.jqx.jqxWidget("jqxPanel", "", {});

    $.extend($.jqx._jqxPanel.prototype, {

        defineInstance: function () {
            //Type: String.
            //Default: null.
            //Sets the panel width.
            this.width = null;
            //Type: String.
            //Default: null.
            //Sets the panel height.
            this.height = null;
            // gets or sets whether the panel is disabled.
            this.disabled = false;
            // Type: Number
            // Default: 15
            // gets or sets the scrollbars size.
            this.scrollBarSize = 15;
            // Type: String
            // Default: 'fixed'
            // Sets the sizing mode. In the 'fixed' mode, the panel displays scrollbars, if its content requires it. 
            // In the wrap mode, the scrollbars are not displayed and the panel automatically changes its size.
            // Possible Values: 'fixed', 'wrap'
            this.sizeMode = 'fixed';
            // Type: Boolean
            // Default: false
            // Automatically updates the panel, if its children size is changed.
            this.autoUpdate = false;
            // Type: Number
            // Default: 500
            // Gets or sets the autoUpdate interval.
            this.autoUpdateInterval = 500;
            this.touchMode = 'auto';
            this.horizontalScrollBarMax = null;
            this.verticalScrollBarMax = null;
            this.touchModeStyle = 'auto';
            this.rtl = false;
            // jqxPanel events.
            this.events =
			[
            // occurs when the layout is performed.
		  	   'layout',
     		];
        },

        // creates a new jqxPanel instance.
        createInstance: function (args) {
            this.render();
        },

        render: function()
        {
            var self = this;
            this.host.addClass(this.toThemeProperty("jqx-panel"));
            this.host.addClass(this.toThemeProperty("jqx-widget"));
            this.host.addClass(this.toThemeProperty("jqx-widget-content"));
            this.host.addClass(this.toThemeProperty("jqx-rc-all"));

            var panelStructure = $("<div id='panelWrapper' style='overflow: hidden; background-color: transparent; -webkit-appearance: none; outline: none; align:left; border: 0px; padding: 0px; margin: 0px; left: 0px; top: 0px; valign:top; position: relative;'>" +
                "<div id='panelContent' style='-webkit-appearance: none; outline: none; border: none; padding: 0px; position: absolute; margin: 0px; align:left; valign:top; left: 0px; top: 0px;'/>" +
                "<div id='verticalScrollBar' style='align:left; valign:top; left: 0px; top: 0px; position: absolute;'/>" +
                "<div id='horizontalScrollBar' style='align:left; valign:top; left: 0px; top: 0px; position: absolute;'/>" +
                "<div id='bottomRight' style='align:left; valign:top; left: 0px; top: 0px; position: absolute;'/>" +
                "</div>");

            var children = this.host.children();
            this._rtl = false;
            if (children.length > 0 && children.css('direction') == 'rtl') {
                this.rtl = true;
                this._rtl = true;
            }
         
            this.host.wrapInner(panelStructure);
            var verticalScrollBar = this.host.find("#verticalScrollBar");
            verticalScrollBar[0].id = this.element.id + 'verticalScrollBar';

            this.vScrollBar = verticalScrollBar.jqxScrollBar({ 'vertical': true, rtl: this.rtl, touchMode: this.touchMode, theme: this.theme });
            var horizontalScrollBar = this.host.find("#horizontalScrollBar");
            horizontalScrollBar[0].id = this.element.id + 'horizontalScrollBar';
            this.hScrollBar = horizontalScrollBar.jqxScrollBar({ 'vertical': false, rtl: this.rtl, touchMode: this.touchMode, theme: this.theme });
            this.content = this.host.find("#panelContent");
            this.wrapper = this.host.find("#panelWrapper");
            this.content.addClass(this.toThemeProperty('jqx-widget-content'));
            if (this.content.width() == 0 || this.width) {
                    this.wrapper.css('width', '100%');
                    this.content.css('width', '100%');
            }
            if (this.content.height() == 0 || this.height) {
                this.wrapper.css('height', '100%');
                this.content.css('height', '100%');
            }
            if (this.content.width() != 0 && !this.width) {
                this.host.width(this.content.width());
            }
            if (this.content.height() != 0 && !this.height) {
                this.host.height(this.content.height());
                this.wrapper.css('height', '100%');
            }

            this.wrapper[0].id = this.wrapper[0].id + this.element.id;
            this.content[0].id = this.content[0].id + this.element.id;
            this.bottomRight = this.host.find("#bottomRight").addClass(this.toThemeProperty('jqx-panel-bottomright'));
            this.bottomRight[0].id = 'bottomRight' + this.element.id;

            this.vScrollBar.css('visibility', 'inherit');
            this.hScrollBar.css('visibility', 'inherit');
            this.vScrollInstance = $.data(this.vScrollBar[0], 'jqxScrollBar').instance;
            this.hScrollInstance = $.data(this.hScrollBar[0], 'jqxScrollBar').instance;

            var me = this;
            this.propertyChangeMap['disabled'] = function (instance, key, oldVal, value) {
                me.vScrollBar.jqxScrollBar({ disabled: me.disabled });
                me.hScrollBar.jqxScrollBar({ disabled: me.disabled });
            };

            this.vScrollBar.jqxScrollBar({ disabled: this.disabled });
            this.hScrollBar.jqxScrollBar({ disabled: this.disabled });

            this._addHandlers();
            this._arrange();


            $(window).resize(function () {
                var width = self.host.width();
                var height = self.host.height();
                if (width != self.__oldwidth || height != self.__oldheight) {
                    self._arrange();
                }

                self.__oldwidth = width;
                self.__oldheight = height;
            });

            this.contentWidth = me.content[0].scrollWidth;
            this.contentHeight = me.content[0].scrollHeight;

            if (this.autoUpdate) {
                me._autoUpdate();
            }

            this.propertyChangeMap['autoUpdate'] = function (instance, key, oldVal, value) {
                if (me.autoUpdate) {
                    me._autoUpdate();
                }
                else {
                    clearInterval(me.autoUpdateId);
                    me.autoUpdateId = null;
                }
            }

            // unload
            $(window).on('unload', function () {
                if (me.autoUpdateId != null) {
                    clearInterval(me.autoUpdateId);
                    me.autoUpdateId = null;
                    me.destroy();
                }
            });

            this._updateTouchScrolling();
            this._render();
        },

        _updateTouchScrolling: function () {
            var self = this;
            if (this.touchMode == true) {
                $.jqx.mobile.setMobileSimulator(this.element);
            }

            var isTouchDevice = this.isTouchDevice();
            if (isTouchDevice) {
                $.jqx.mobile.touchScroll(this.element, self.vScrollInstance.max, function (left, top) {
                    if (self.vScrollBar.css('visibility') != 'hidden') {
                        var oldValue = self.vScrollInstance.value;
                        self.vScrollInstance.setPosition(oldValue + top);
                    }
                    if (self.hScrollBar.css('visibility') != 'hidden') {
                        var oldValue = self.hScrollInstance.value;
                        self.hScrollInstance.setPosition(oldValue + left);
                    }
                }, this.element.id);
            }

            this.vScrollBar.jqxScrollBar({ touchMode: this.touchMode });
            this.hScrollBar.jqxScrollBar({ touchMode: this.touchMode });
        },

        isTouchDevice: function () {
            var isTouchDevice = $.jqx.mobile.isTouchDevice();
            if (this.touchMode == true) {
                isTouchDevice = true;
            }
            else if (this.touchMode == false) {
                isTouchDevice = false;
            }
            if (isTouchDevice && this.touchModeStyle != false) {
                this.scrollBarSize = 10;
            }
            return isTouchDevice;
        },

        // append element.
        // @param element
        append: function (element) {
            if (element != null) {
                this.content.append(element);
                this._arrange();
            }
        },

        setcontent: function (html) {
            this.content[0].innerHTML = html;
        },

        // prepend element.
        // @param element
        prepend: function (element) {
            if (element != null) {
                this.content.prepend(element);
                this._arrange();
            }
        },

        // clears the content.
        clearcontent: function () {
            this.content.text('');
            this.content.children().remove();
            this._arrange();
        },

        // remove element.
        // @param element
        remove: function (element) {
            if (element != null) {
                $(element).remove();
                this._arrange();
            }
        },

        _autoUpdate: function () {
            var me = this;
            this.autoUpdateId = setInterval(function () {
                var newWidth = me.content[0].scrollWidth;
                var newHeight = me.content[0].scrollHeight;
                var doarrange = false;
                if (me.contentWidth != newWidth) {
                    me.contentWidth = newWidth;
                    doarrange = true;
                }

                if (me.contentHeight != newHeight) {
                    me.contentHeight = newHeight;
                    doarrange = true;
                }

                if (doarrange) {
                    me._arrange();
                }
            }, this.autoUpdateInterval);
        },

        _addHandlers: function () {
            var self = this;
            this.addHandler(this.vScrollBar, 'valuechanged', function (event) {
                self._render(self);
            });

            this.addHandler(this.hScrollBar, 'valuechanged', function (event) {
                self._render(self);
            });

            this.addHandler(this.host, 'mousewheel', function (event) {
                self.wheel(event, self);
            });

            this.addHandler(this.content, 'mouseleave', function (event) {
                self.focused = false;
            });

            this.addHandler(this.content, 'focus', function (event) {
                self.focused = true;
            });

            this.addHandler(this.content, 'blur', function (event) {
                self.focused = false;
            });

            this.addHandler(this.content, 'mouseenter', function (event) {
                self.focused = true;
            });
        },

        _removeHandlers: function () {
            var self = this;
            this.removeHandler(this.vScrollBar, 'valuechanged');
            this.removeHandler(this.hScrollBar, 'valuechanged');
            this.removeHandler(this.host, 'mousewheel');
            this.removeHandler(this.content, 'mouseleave');
            this.removeHandler(this.content, 'focus');
            this.removeHandler(this.content, 'blur');
            this.removeHandler(this.content, 'mouseenter');
        },

        // performs mouse wheel.
        wheel: function (event, self) {
            var delta = 0;
            // fix for IE8 and IE7
            if (event.originalEvent && $.jqx.browser.msie && event.originalEvent.wheelDelta) {
                delta = event.originalEvent.wheelDelta / 120;
            }

            if (!event) /* For IE. */
                event = window.event;
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
                }

                if (!result) {
                    return result;
                }
                else return false;
            }

            if (event.preventDefault)
                event.preventDefault();
            event.returnValue = false;
        },

        // scrolls down.
        scrollDown: function () {
            if (this.vScrollBar.css('visibility') == 'hidden')
                return false;

            var vScrollInstance = this.vScrollInstance;
            if (vScrollInstance.value + vScrollInstance.largestep <= vScrollInstance.max) {
                vScrollInstance.setPosition(vScrollInstance.value + vScrollInstance.largestep);
                return true;
            }
            else {
                if (vScrollInstance.value + vScrollInstance.largestep != vScrollInstance.max) {
                    vScrollInstance.setPosition(vScrollInstance.max);
                    return true;
                }
            }

            return false;
        },

        // scrolls up.
        scrollUp: function () {
            if (this.vScrollBar.css('visibility') == 'hidden')
                return false;

            var vScrollInstance = this.vScrollInstance;
            if (vScrollInstance.value - vScrollInstance.largestep >= vScrollInstance.min) {
                vScrollInstance.setPosition(vScrollInstance.value - vScrollInstance.largestep);
                return true;
            }
            else {
                if (vScrollInstance.value - vScrollInstance.largestep != vScrollInstance.min) {
                    vScrollInstance.setPosition(vScrollInstance.min);
                    return true;
                }
            }
            return false;
        },

        _handleDelta: function (delta) {
            if (this.focused) {
                var oldvalue = this.vScrollInstance.value;
                if (delta < 0) {
                    this.scrollDown();
                }
                else this.scrollUp();
                var newvalue = this.vScrollInstance.value;
                if (oldvalue != newvalue) {
                    return false;
                }
            }

            return true;
        },

        _render: function (self) {
            if (self == undefined) self = this;
            var vScroll = self.vScrollInstance.value;
            var hScroll = self.hScrollInstance.value;
            if (this.rtl) {
                if (this.hScrollBar[0].style.visibility != 'hidden') {
                    if (this._rtl == false) {
                        hScroll = self.hScrollInstance.max - hScroll;
                    }
                    else {
                        hScroll = -self.hScrollInstance.value;
                    }
                }
            }
            self.content.css({ left: -hScroll + 'px', top: -vScroll + 'px' });
        },

        // Moves the scrollbars to a specific position.
        // @param left. Specifies the horizontal scrollbar position.
        // @param top. Specifies the vertical scrollbar position.
        scrollTo: function (left, top) {
            if (left == undefined || top == undefined)
                return;

            this.vScrollInstance.setPosition(top);
            this.hScrollInstance.setPosition(left);
        },

        // Gets scrollable height.
        getScrollHeight: function () {
            return this.vScrollInstance.max;
        },

        // Gets vertical scroll position.
        getVScrollPosition: function () {
            return this.vScrollInstance.value;
        },

        // Gets scrollable width.
        getScrollWidth: function () {
            return this.hScrollInstance.max;
        },

        // gets the horizontal scroll position.
        getHScrollPosition: function () {
            return this.hScrollInstance.value;
        },

        _arrange: function () {
            if (this.width != null) {
                this.host.width(this.width);
            }
            if (this.height != null) {
                this.host.height(this.height);
            }

            // scrollbar Size.
            var scrollSize = this.scrollBarSize;
            if (isNaN(scrollSize)) {
                scrollSize = parseInt(scrollSize);
                if (isNaN(scrollSize)) {
                    scrollSize = '17px';
                }
                else scrollSize = scrollSize + 'px';
            }

            scrollSize = parseInt(scrollSize);

            this.content.css('margin-right', '0px');
            var width = this.host.width();
            var height = this.host.height();

            if ($.jqx.browser.msie && $.jqx.browser.version < 10) {
                var contentLeft = parseInt(this.content.css('left'));
                this.content.css('left', 0);
            }

            this.content.css('overflow', 'auto');
            var contentWidth = parseInt(this.content[0].scrollWidth);
            $.each(this.content.children(), function () {
                contentWidth = Math.max(contentWidth, this.scrollWidth);
                contentWidth = Math.max(contentWidth, $(this).outerWidth());
            });

            if ($.jqx.browser.msie && $.jqx.browser.version < 10) {
                this.content.css('left', contentLeft);
            }
            if (contentWidth < parseInt(this.host.width())) {
                contentWidth = parseInt(this.host.width());
            }

            var contentHeight = parseInt(this.content[0].scrollHeight);
            this.content.css('overflow', 'visible');

            if (this.sizeMode == 'wrap') {
                this.host.width(contentWidth);
                this.host.height(contentHeight);
                this.vScrollBar.css('visibility', 'hidden');
                this.hScrollBar.css('visibility', 'hidden');
                return;
            }

            var vScrollMaximum = contentHeight - parseInt(this.host.height());
            var hScrollMaximum = contentWidth - parseInt(this.host.width());
            var scrollSizeAndOffset = 4 + parseInt(this.scrollBarSize);

            if (this.horizontalScrollBarMax != undefined) {
                hScrollMaximum = this.horizontalScrollBarMax;
            }
            if (this.verticalScrollBarMax != undefined) {
                vScrollMaximum = this.verticalScrollBarMax;
            }

            var voffset = 0;
            if (vScrollMaximum > scrollSizeAndOffset) {
                vScrollMaximum += 4;
                this.vScrollBar.jqxScrollBar({ 'max': vScrollMaximum });
                this.vScrollBar.css('visibility', 'inherit');
            }
            else {
                this.vScrollBar.jqxScrollBar('setPosition', 0);
                this.vScrollBar.css('visibility', 'hidden');
            }
            if (hScrollMaximum > scrollSizeAndOffset + voffset) {
                if ($.jqx.browser.msie && $.jqx.browser.version < 9) {
                    if (hScrollMaximum - 10 <= scrollSizeAndOffset + voffset) {
                        this.hScrollBar.css('visibility', 'hidden');
                        this.hScrollBar.jqxScrollBar('setPosition', 0);
                    }
                    else {
                        hScrollMaximum += 4;
                        this.hScrollBar.jqxScrollBar({ 'max': hScrollMaximum });
                        this.hScrollBar.css('visibility', 'inherit');
                    }
                }
                else {
                    hScrollMaximum += 4;
                    this.hScrollBar.jqxScrollBar({ 'max': hScrollMaximum });
                    this.hScrollBar.css('visibility', 'inherit');
                }
            }
            else {
                this.hScrollBar.css('visibility', 'hidden');
                this.hScrollBar.jqxScrollBar('setPosition', 0);
                if (this.vScrollBar.css('visibility') != 'hidden') {
                    this.content.css('margin-right', scrollSizeAndOffset);
                }
            }

            var scrollOffset = 4;
            var bottomSizeOffset = 2;
            var rightSizeOffset = 0;
            // right scroll offset. 
            if (this.vScrollBar.css('visibility') != 'hidden') {
                rightSizeOffset = scrollSize + scrollOffset;
                this.hScrollBar.jqxScrollBar({ 'max': hScrollMaximum + scrollSizeAndOffset });
            }

            // bottom scroll offset.
            if (this.hScrollBar.css('visibility') != 'hidden') {
                bottomSizeOffset = scrollSize + scrollOffset;
                this.vScrollBar.jqxScrollBar({ 'max': vScrollMaximum + scrollSizeAndOffset });
            }

            if (this.content.width() != 0 && !this.width) {
                var offset = 0;
                if (this.vScrollBar.css('visibility') != 'hidden') offset = scrollSizeAndOffset;
                width = this.content.width() + offset
                this.host.width(width);
            }
            if (this.content.height() != 0 && !this.height) {
                var offset = 0;
                if (this.hScrollBar.css('visibility') != 'hidden') offset = scrollSizeAndOffset;
                height = this.content.height() + offset;
                this.host.height(height);
            }

            this.hScrollBar.height(scrollSize);
            this.hScrollBar.css({ top: 1+height - scrollOffset - scrollSize + 'px', left: '0px' });
            this.hScrollBar.width(width + 1 - scrollSize - scrollOffset + 'px');
            if (this.rtl) {
                this.hScrollBar.css({ left: scrollSize + scrollOffset -2 + 'px' });
            }

            if (rightSizeOffset == 0) {
                this.hScrollBar.width(width - 2);
            }

            this.vScrollBar.width(scrollSize);       
            this.vScrollBar.height(parseInt(height) - bottomSizeOffset + 'px');
            this.vScrollBar.css({ left: parseInt(width) - parseInt(scrollSize) - scrollOffset + 'px', top: '0px' });
            if (this.rtl) {
                this.vScrollBar.css({ left: '0px'});
            }

            var vScrollInstance = this.vScrollInstance;
            vScrollInstance.disabled = this.disabled;
            vScrollInstance.refresh();

            var hScrollInstance = this.hScrollInstance;
            hScrollInstance.disabled = this.disabled;
            hScrollInstance.refresh();

            if ((this.vScrollBar.css('visibility') != 'hidden') && (this.hScrollBar.css('visibility') != 'hidden')) {
                this.bottomRight.css('visibility', 'inherit');
                this.bottomRight.css({ left: 1 + parseInt(this.vScrollBar.css('left')), top: 1 + parseInt(this.hScrollBar.css('top')) });
                this.bottomRight.width(parseInt(scrollSize) + 3);
                this.bottomRight.height(parseInt(scrollSize) + 3);
                if (this.rtl) {
                    this.bottomRight.css({ left: '0px' });
                }
            }
            else this.bottomRight.css('visibility', 'hidden');

            this._raiseevent(0);
            var self = this;

            if (this.sizeMode == 'horizontalwrap') {
                this.host.width(contentWidth);
                this.vScrollBar.css({ left: this.host.width() - parseInt(scrollSize) - scrollOffset + 'px', top: '0px' });
                this.hScrollBar.css('visibility', 'hidden');
            }
            else if (this.sizeMode == 'verticalwrap') {
                this.host.height(contentHeight);
                if (this.hScrollBar.css('visibility') != 'hidden') {
                    contentHeight += 20;
                    this.host.height(contentHeight);
                }
                this.hScrollBar.css({ top: contentHeight - scrollOffset - scrollSize + 'px', left: '0px' });
                this.vScrollBar.css('visibility', 'hidden');
            }
            if (this.sizeMode == 'overflowy') {
                this.hScrollBar.css('visibility', 'hidden');
            }
        },

        destroy: function () {
            this._removeHandlers();
            $(window).off('unload');
            this.host.remove();
        },

        _raiseevent: function (id, oldValue, newValue) {
            if (this.isInitialized != undefined && this.isInitialized == true) {
                var evt = this.events[id];
                var event = new jQuery.Event(evt);
                event.previousValue = oldValue;
                event.currentValue = newValue;
                event.owner = this;
                var result = this.host.trigger(event);
                return result;
            }
        },

        beginUpdateLayout: function () {
            this.updating = true;
        },

        resumeUpdateLayout: function () {
            this.updating = false;
            this.vScrollInstance.value = 0;
            this.hScrollInstance.value = 0;
            this._arrange();
            this._render();
        },

        propertyChangedHandler: function (object, key, oldValue, value) {
            if (!object.isInitialized)
                return;

            if (key == 'rtl') {
                this.vScrollBar.jqxScrollBar({ rtl: value });
                this.hScrollBar.jqxScrollBar({ rtl: value });
                object._arrange();
            }

            if (!object.updating) {
                if (key == 'scrollBarSize' || key == 'width' || key == 'height') {
                    object._arrange();
                }
            }
            if (key == 'touchMode') {
                if (value != 'auto') {
                    object._updateTouchScrolling();
                }
            }
            if (key == 'theme') {
                object.host.removeClass();
                object.host.addClass(this.toThemeProperty("jqx-panel"));
                object.host.addClass(this.toThemeProperty("jqx-widget"));
                object.host.addClass(this.toThemeProperty("jqx-widget-content"));
                object.host.addClass(this.toThemeProperty("jqx-rc-all"));
                object.vScrollBar.jqxScrollBar({ theme: this.theme });
                object.hScrollBar.jqxScrollBar({ theme: this.theme });
                object.bottomRight.removeClass();
                object.bottomRight.addClass(this.toThemeProperty('jqx-panel-bottomright'));
                object.content.removeClass();
                object.content.addClass(this.toThemeProperty('jqx-widget-content'));
            }
        },

        refresh: function () {
        }
    });
})(jQuery);
