/*
jQWidgets v2.7.0 (2013-Feb-08)
Copyright (c) 2011-2013 jQWidgets.
License: http://jqwidgets.com/license/
*/

/*
* jqxPopup.js
*
* This source is property of jqwidgets and/or its partners and is subject to jqwidgets Source Code License agreement and jqwidgets EULA.
* Copyright (c) 2011 jqwidgets.
* <Licensing info>
* 
* http://www.jQWidgets.com
*
*/
/*
* Depends:
*   jqxcore.js*/

// Type: String
// Default: "jqxPopup"
// Gets or sets the Popup's content.
// Name: content 

// Type: Number
// Default: 0
// Gets or sets the horizontal offset of the popup when the location is set to 'absolute' or 'relative.
// Name: horizontalOffset 

// Type: Number
// Default: 0
// Gets or sets the vertical offset of the popup when the location is set to 'absolute' or 'relative.
// Name: verticalOffset 

// Type: Bool.
// Default true.
// Gets or sets whether the fade animation is enabled.
// Name: enableAnimation 

// Type: Number
// Default: 250
// Gets or sets the delay of the fade animation when the popup is going to be opened.
// Name: showDelay

// Type: Number
// Default: 300
// Gets or sets the delay of the fade animation when the popup is going to be closed.
// Name: hideDelay 

// Type: Bool
// Default: false
// Gets or sets whether to display html inside the popup
// Name: showHtml = false;

// Type: Bool
// Default: false
// Gets whether the popup is disabled.
// Name: disabled 

(function ($) {

    $.jqx.jqxWidget("jqxPopup", "", {});

    $.extend($.jqx._jqxPopup.prototype, {
         defineInstance: function () {
             // Type: String
             // Default: "jqxPopup"
             // Gets or sets the Popup's content.
             this.content = "jqxPopup";
             // Type: Number
             // Default: 0
             // Gets or sets the horizontal offset of the popup when the location is set to 'absolute' or 'relative.
             this.horizontalOffset = 0;
             // Type: Number
             // Default: 0
             // Gets or sets the vertical offset of the popup when the location is set to 'absolute' or 'relative.
             this.verticalOffset = 0;
             // Type: Bool.
             // Default true.
             // Gets or sets whether the fade animation is enabled.  
             this.enableAnimation = true;
             // Type: Number
             // Default: 250
             // Gets or sets the delay of the fade animation when the popup is going to be opened.
             this.showDelay = 250,
             // Type: Number
             // Default: 300
             // Gets or sets the delay of the fade animation when the popup is going to be closed. 
             this.hideDelay = 300,
             // Type: Bool
             // Default: false
             // Gets or sets whether to display html inside the popup
             this.showHtml = false;
             // Type: Bool
             // Default: false;
             this.isContainer = false;
             // Type: Bool
             // Default: false
             // Gets whether the popup is opened.           
             this.isOpen = false;
             // Type: Bool
             // Default: false
             // Gets whether the popup is disabled.
             this.disabled = false;

             this.events =
			 [
			    'shown', 'closed'
             ];
         },

        createInstance: function (args) {
            this.host
			.addClass("jqx-popup jqx-rc-all")
            if (this.width != undefined && !isNaN(this.width)) {
                this.host.width(this.width);
            };

            if (this.height != undefined && !isNaN(this.height)) {
                this.host.height(this.height);
            };
        },

        destroy: function () {
            this.host
			.removeClass("jqx-popup jqx-rc-all");
        },

        _raiseEvent: function (id, arg) {
            if (arg == undefined)
                arg = { owner: null };

            var evt = this.events[id];
            args = arg;
            args.owner = this;
            if (id == 0) {
                this.isOpen = true;
            }
            if (id == 1) {
                this.isOpen = false;
            }
            var event = new jQuery.Event(evt);
            event.owner = this;
            var result = this.host.trigger(event);
            return result;
        },

        // closes the popup
        close: function () {
            var popup = $.data(this.element, 'popup');
            if (popup == undefined) {
                popup = $.data(this, 'popup');
            }

            if (popup != null) {
                if ($.jqx.browser.msie) {
                    popup.remove();
                }
                else {
                    if (this.enableAnimation) {
                        popup.stop().fadeOut(this.hideDelay, function () { $(this).remove(); });
                    } else {
                        popup.remove();
                    }
                }
                this._raiseEvent(1);
                $.data(this.element, 'popup', null);
            }
        },

        // opens a popup.
        // 1 param is the content.
        // 2 param is the top offset.
        // 3 param is the left offset.
        open: function () {
            var args = Array.prototype.slice.call(arguments, 0);
            var content = this.content;
            if (args.length > 0) {
                content = args[0];
            }

            var top = this.verticalOffset;
            var left = this.horizontalOffset;

            if (args.length > 1) {
                top = args[1];
            }

            if (args.length > 2) {
                left = args[2];
            }

            var newElement = { element: this.element, content: content };

            var popup = $.data(this.element, "popup");
            if (!popup) {
                popup = $('<div><div class="jqx-popup-content"></div></div>');
                popup.css({ position: 'absolute', zIndex: 100000 });
                $.data(this.element, 'popup', popup);
            }

            popup.remove();
            popup.css({ top: 0, left: 0, visibility: 'hidden', display: 'block' });
            popup.appendTo(document.body);

            if (!this.isContainer) {
                popup.find('.jqx-popup-content')[this.showHtml ? 'html' : 'text'](content);
            }
            else {
                popup.find('.jqx-popup-content').append(content);           
            }
            popup.css({ top: parseInt(top), left: parseInt(left) });

            if ($.jqx.browser.msie) {
                popup.css({ visibility: 'visible', display: 'block' });
            }
            else {
                if (this.enableAnimation) {
                    popup.css({ opacity: 0, display: 'block', visibility: 'visible' }).animate({ opacity: 1 }, this.showDelay,
                function () {
                    // Animation complete.
                    var opacity = popup.css('opacity');
                    popup.css({ visibility: 'visible', display: 'block' });

                }

                );
                }
                else {
                    popup.css({ visibility: 'visible', display: 'block' });
                }
            }
            this._raiseEvent(0);
        },

        propertyChangedHandler: function (key, oldvalue, value) {
            if (this.isInitialized == undefined || this.isInitialized == false)
                return;

        }
    });
})(jQuery);
