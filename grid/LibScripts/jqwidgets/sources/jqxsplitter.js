/*
jQWidgets v2.7.0 (2013-Feb-08)
Copyright (c) 2011-2013 jQWidgets.
License: http://jqwidgets.com/license/
*/

(function ($) {

    $.jqx.jqxWidget('jqxSplitter', '', {});

    $.extend($.jqx._jqxSplitter.prototype, {

        defineInstance: function () {
            // Type: Number
            // Default: null
            // Gets or sets the splitter's width.
            this.width = null;
            // Type: height
            // Default: null
            // Gets or sets the splitter's height.
            this.height = null;
            // Type: Boolean
            // Default: true
            // Gets or sets whether the splitter is with rounded corners.         
            this.roundedcorners = false;
            // Type: Array
            // Default: []
            // Sets or gets properties for all the panels
            this.panels = [];
            // Type: String
            // Default: vertical
            // Sets or gets splitter's orientation
            this.orientation = 'vertical';
            // Type: Bool
            // Default: false
            // Sets or gets whether the splitter is disabled
            this.disabled = false;
            // Type: Number/String
            // Default: 5
            // Sets or gets splitbar's size
            this.splitBarSize = 5;
            // Type: Bool
            // Default: false
            // Sets or gets whether the collapse/expand animation is enabled
            this.enableCollapseAnimation = false;
            // Type: Number
            // Default: 100
            // Sets or gets collapse/expand animation duration
            this.animationDuration = 'fast';
            // Type: Bool
            // Default: false
            // Sets or gets whether the cookies are enabled
            this.cookies = false;
            // Type: Object
            // Default: {}
            // Sets or gets cookie options
            this.cookieOptions = {};
            // Type: Number
            // Default: 15
            // Sets or gets splitter's split bar size when a touch device is used
            this.touchSplitBarSize = 15;
            // Private properties
            this._dimentions = {
                'horizontal': {
                    'size': 'height',
                    'outerSize': 'outerHeight',
                    'dimention': 'top',
                    'start': '_startY',
                    'mouse': '_mouseStartY',
                    'page': 'pageY',
                    'opposite': 'vertical'
                },
                'vertical': {
                    'size': 'width',
                    'outerSize': 'outerWidth',
                    'dimention': 'left',
                    'start': '_startX',
                    'mouse': '_mouseStartX',
                    'page': 'pageX',
                    'opposite': 'horizontal'
                }
            };
            this._touchEvents = {
                'mousedown': $.jqx.mobile.getTouchEventName('touchstart'),
                'mouseup': $.jqx.mobile.getTouchEventName('touchend'),
                'mousemove': $.jqx.mobile.getTouchEventName('touchmove'),
                'mouseenter': 'mouseenter',
                'mouseleave': 'mouseleave'
            };
            this._isTouchDevice = false;
            this.touchMode = 'auto';
            this._splitBars = [];
            this._splitPanels = [];
            this._cursor = '';
            this._panelWrapper = null;
            this._events = ['resize', 'expanded', 'collapsed', 'resizeStart'];
            this._exceptions = {
                'invalidArgument': 'Invalid ',
                'invalidOrientation': 'Invalid orientation!',
                'invalidStructure': 'Invalid structure!',
                'invalidSplitBarSize': 'Invalid splitbar size!'
            };
        },

        createInstance: function () {
            this._cursor = this.host.css('cursor');
            this._setSplitterSize();
            //this._cursor = (this._cursor === 'auto') ? 'default' : this._cursor;
            this._isTouchDevice = $.jqx.mobile.isTouchDevice();
            this._validateProperties();
            this._defaultLayout = true;
            this._refresh(true);
            this._defaultLayout = false;
            var splitters = $.data(document.body, 'jqx-splitters') || [];
            splitters.push(this.host);
            $.data(document.body, 'jqx-splitters', splitters);
            if (this.disabled) {
                this.disabled = false;
                this.disable();
            }
            this._splittersLayout();
            var me = this;
            //setTimeout(function () {
            //    me.refresh();
            //}, 10);
            this.isInitialized = false;
            this.render();
            this.isInitialized = true;
        },

        render: function()
        {
            var me = this;
            if (this.element.style.height == "" || this.element.style.width == "") {
                var setSplitBarSize = function (size) {
                    $.each(me._splitBars, function () {
                        if (me.orientation == 'vertical') {
                            this.splitBar.css('height', size);
                        }
                        else {
                            this.splitBar.css('width', size);
                        }
                    });
                }

                me._splliterAutoSizeTimer = setInterval(function () {
                    setSplitBarSize('100%');
                    if (me.host.width() != me._oldWidth || me.host.height() != me._oldHeight) {
                        me._performLayout();
                    }
                    else {
                        setSplitBarSize(me.orientation == 'vertical' ? me.host.height() : me.host.width());
                    }

                    me._oldWidth = me.host.width();
                    me._oldHeight = me.host.height();
                }, 100);
            }
            this.windowWidth = $(window).width();
            this.windowHeight = $(window).height();

            if (this._hiddenParent()) {
                this._displayTimer = setInterval(function () {
                    if (!me._hiddenParent()) {
                        clearInterval(me._displayTimer);
                        me.updateLayout();
                    }
                }, 100);
            }
            this.updateLayout();
            if (this.isInitialized) {
                var hasPercentageSize = false;
                for (var i = 0; i < this.panels.length; i += 1) {
                    if (this.panels[i]["_size"] != undefined) {
                        this.panels[i]["size"] = this.panels[i]["_size"];
                        this._validatePanel("size", this.panels[i]);
                        hasPercentageSize = true;
                    }
                }
                if (hasPercentageSize) {
                    this._addPanelSizeProperties();
                }
            }
        },

        destroy: function () {
            this.host.remove();
        },

        _hiddenParent: function () {
            var me = this;
            if (me.host.css('display') != 'block')
                return true;
            var hiddenParent = false;
            $.each(me.host.parents(), function () {
                if ($(this).css('display') != 'block') {
                    hiddenParent = true;
                    return false;
                }
            });
            return hiddenParent;
        },

        _setSplitterSize: function () {
            var minSize = 0,
                panel, ratio, panelMinSize = 0, panelMaxSize = 0, setMaxSize = true;
            if (this.width === 'auto' || !isNaN(parseInt(this.width, 10))) {
                this.host.css('width', this.width);
            }
            if (this.height === 'auto' || !isNaN(parseInt(this.height, 10))) {
                this.host.css('height', this.height);
            }
            for (var i = 0; i < this.panels.length; i += 1) {
                panelMinSize = parseInt(this.panels[i].min, 10);
                if (!this.panels[i].max) {
                    setMaxSize = false;
                } else {
                    panelMaxSize += parseInt(this.panels[i].max, 10);
                }
                if (!isNaN(panelMinSize)) {
                    minSize += panelMinSize;
                }
            }
            this.host.css('min-' + this._getDimention('size'), minSize);
            if (setMaxSize) {
                if (panelMaxSize < 9999) {
                    this.host.css('max-' + this._getDimention('size'), panelMaxSize);
                }
            }
        },

        _getDimention: function (dimention) {
            return this._dimentions[this.orientation][dimention];
        },

        _validateProperties: function () {
            try {
                this._validatePanels();
                this._validateOptions();
            } catch (exception) {
                alert(exception);
            }
        },

        _validatePanels: function () {
            var properties = ['max', 'min', 'size', 'collapsed', 'collapsible', 'resizable'],
                temp;
            for (var j = 0; j < properties.length; j += 1) {
                for (var i = 0; i < this.panels.length; i += 1) {
                    if (typeof this.panels[i][properties[j]] !== 'undefined') {
                        this._validatePanel(properties[j], this.panels[i]);
                    }
                }
            }
        },

        _validatePanel: function (property, panel) {
            var temp;
            if (property !== 'collapsed' && property !== 'collapsible' && property !== 'resizable') {
                temp = panel[property];
                panel[property] = parseInt(panel[property], 10);
                if (isNaN(panel[property])) {
                    throw new Error(this._exceptions['invalidArgument'] + property + ' for panel ' + (i + 1) + '.');
                } else {
                    if (typeof temp === 'string' && temp.indexOf('%') >= 0) {
                        panel["_" + property] = temp;
                        panel[property] = this.host[this._getDimention('size')]() * panel[property] / 100;
                    }
                }
            } else {
                panel[property] = this._parseBoolean(panel[property]);
            }
        },

        _parseBoolean: function (str) {
            return /^true$/i.test(str);
        },

        _validateOptions: function () {
            if (this.orientation !== 'vertical' && this.orientation !== 'horizontal') {
                throw new Error(this._exceptions['invalidOrientation']);
            }
            if (parseInt(this.splitBarSize, 10) < 0 || isNaN(parseInt(this.splitBarSize, 10))) {
                throw new Error(this._exceptions['invalidSplitBarSize']);
            }
            if (parseInt(this.touchSplitBarSize, 10) < 0 || isNaN(parseInt(this.touchSplitBarSize, 10))) {
                throw new Error(this._exceptions['invalidSplitBarSize']);
            }
        },

        _refresh: function (creation) {
            this._render();
            this._startupLayout(creation);
            this._removeEventHandlers();
            this._addEventHandlers();
        },

        updateLayout: function () {
            this._setSplitterSize();
            this._addPanelProperties();
            this._refresh(true);
            this._splittersLayout();
            this._performLayout();
        },

        refresh: function () {
            this.updateLayout();
        },

        _startupLayout: function (creation) {
            var layoutImported = false;
            if (creation) {
                if (this.cookies) {
                    var layout = $.jqx.cookie.cookie("jqxSplitter" + this.element.id);
                    if (layout !== null) {
                        this.importLayout(layout);
                        layoutImported = true;
                    }
                }
            }
            if (!layoutImported) {
                this._refreshWidgetLayout();
            }
        },

        _render: function () {
            this.host.addClass(this.toThemeProperty('jqx-splitter'));
            this.host.addClass(this.toThemeProperty('jqx-widget'));
            this.host.addClass(this.toThemeProperty('jqx-widget-content'));

            if (this.roundedcorners) {
                this.host.addClass(this.toThemeProperty('jqx-rc-all'));
            }
            var splitChildren = this.host.children('div'), panel;
            if (this._panelWrapper) {
                splitChildren = this._panelWrapper.children('.jqx-splitter-panel');
            }

            if (this._splitPanels.length < 1) {
                for (var i = 0; i < splitChildren.length; i += 1) {
                    panel = $(splitChildren[i]);
                    panel.options = { max: 9007199254740992, min: 0, collapsible: true, resizable: true,
                        collapsed: false, size: panel[this._getDimention('size')]()
                    };
                    this._splitPanels.push(panel);
                }
                this._createSplitBars();
                this._addCollapseButtons();
                this._addPanelProperties();
                var previous, next, splitBar;
                for (var i = 0; i < this._splitPanels.length; i += 1) {
                    if (i + 1 < this._splitPanels.length) {
                        previous = this._splitPanels[i];
                        next = this._splitPanels[i + 1];
                        var splitBar = this._splitBars[i];
                        if (!previous.options.resizable || !next.options.resizable) {
                            splitBar.splitBar.css('cursor', 'default');
                        }
                    }
                }
            }
            this._wrapperHandler();
        },

        _createSplitBars: function () {
            var previous, next, splitBar;
            for (var i = 0; i < this._splitPanels.length; i += 1) {
                if (i + 1 < this._splitPanels.length) {
                    previous = this._splitPanels[i];
                    next = this._splitPanels[i + 1];
                    splitBar = { previous: previous, next: next };
                    splitBar.splitBar = this._addSplitBar(previous, next);
                    this._splitBars.push(splitBar);
                }
            }
        },

        _addSplitBar: function (previous, next) {
            var splitBar = $('<div/>');
            splitBar.insertAfter(previous);
            if (this.orientation === 'horizontal') {
                splitBar.width(previous.width());
            } else {
                splitBar.height(previous.height());
            }
            return splitBar;
        },

        _addCollapseButtons: function () {
            var count = this._splitBars.length;
            for (var i = 0; i < count; i += 1) {
                var button = $('<div/>');
                this._splitBars[i].splitBar.append(button);
                if (i !== 0 && i !== count - 1) {
                    button.css('visibility', 'hidden');
                }
            }
        },

        _refreshWidgetLayout: function () {
            this._setSplitterSize();
            this._removeClasses();
            this._addClasses();
            //this._performLayout();            
            this._validateSize();
            if (this._defaultLayout == true) {
                this._applyOptions();
            }
            this._performLayout();
        },

        _addClasses: function () {
            var button, splitBar;
            for (var i = 0; i < this._splitPanels.length; i += 1) {
                this._splitPanels[i].addClass(this.toThemeProperty('jqx-splitter-panel'));
                this._splitPanels[i].addClass(this.toThemeProperty('jqx-widget-content'));
                if (i < this._splitBars.length) {
                    splitBar = this._splitBars[i].splitBar;
                    button = splitBar.children(0);
                    splitBar.addClass(this.toThemeProperty('jqx-splitter-splitbar-' + this.orientation));
                    splitBar.addClass(this.toThemeProperty('jqx-fill-state-normal'));
                    splitBar.removeClass(this.toThemeProperty('jqx-splitter-splitbar-' + this._getDimention('opposite')));
                    button.addClass(this.toThemeProperty('jqx-splitter-collapse-button-' + this.orientation));
                    button.addClass(this.toThemeProperty('jqx-fill-state-pressed'));
                    button.removeClass(this.toThemeProperty('jqx-splitter-collapse-button-' + this._getDimention('opposite')));
                    if ($.jqx.browser.msie && $.jqx.browser.version <= 7) {
                        this._splitBars[i].previous.css('position', 'relative');
                        this._splitBars[i].next.css('position', 'relative');
                    }
                }
            }
        },

        _removeClasses: function (theme) {
            var temp = this.theme;
            this.theme = theme;
            for (var i = 0; i < this._splitPanels.length; i += 1) {
                this._splitPanels[i].removeClass(this.toThemeProperty('jqx-splitter-panel'));
                this._splitPanels[i].removeClass(this.toThemeProperty('jqx-widget-content'));
                if (i < this._splitBars.length) {
                    var button = this._splitBars[i].splitBar.children(0);
                    this._splitBars[i].splitBar.removeClass(this.toThemeProperty('jqx-splitter-splitbar-' + this.orientation));
                    this._splitBars[i].splitBar.removeClass(this.toThemeProperty('jqx-fill-state-normal'));
                    button.removeClass(this.toThemeProperty('jqx-splitter-collapse-button-' + this.orientation));
                    button.removeClass(this.toThemeProperty('jqx-fill-state-pressed'));
                }
            }
            this.theme = temp;
        },

        _addPanelProperties: function () {
            var properties = ['max', 'min', 'size', 'collapsed', 'collapsible', 'resizable'],
                panels = (this.panels instanceof Array) ? this.panels : [];
            for (var i = 0; i < this._splitPanels.length; i += 1) {
                for (var j = 0; j < properties.length; j += 1) {
                    if (typeof panels[i] !== 'undefined' && typeof panels[i][properties[j]] !== 'undefined') {
                        this._splitPanels[i].options[properties[j]] = panels[i][properties[j]];
                    } else if (properties[j] === 'size') {
                        if (this._splitPanels[i][0].style[this._getDimention('size')] !== 'auto' &&
                            this._splitPanels[i][0].style[this._getDimention('size')] !== '') {
                            this._splitPanels[i].options.size = this._splitPanels[i][this._getDimention('size')]();
                        } else {
                            if (this.orientation == 'horizontal') {
                                this._splitPanels[i].options.size = Math.floor(this.host.height() / this._splitPanels.length);
                            }
                            else {
                                this._splitPanels[i].options.size = Math.floor(this.host.width() / this._splitPanels.length);
                            }
                        }
                    }
                }
            }
        },

        _addPanelSizeProperties: function()
        {
           panels = (this.panels instanceof Array) ? this.panels : [];
            for (var i = 0; i < this._splitPanels.length; i += 1) {
                var size = this._splitPanels[i][0].style[this._getDimention('size')];
                if (size !== 'auto' && size !== '') {
                    if (panels[i] != undefined) {
                        this._splitPanels[i].options.size = panels[i].size;
                    }
                }
                else {
                    if (this.orientation == 'horizontal') {
                        this._splitPanels[i].options.size = Math.floor(this.host.height() / this._splitPanels.length);
                    }
                    else {
                        this._splitPanels[i].options.size = Math.floor(this.host.width() / this._splitPanels.length);
                    }
                }
            }
        },

        _wrapperHandler: function () {
            if (this._panelWrapper === null) {
                this._panelWrapper = $('<div class="jqx-splitter-panel-wrapper" style="height: 100%;"></div>');
                this.host.wrapInner(this._panelWrapper);
                this._panelWrapper = this.host.children();
            }
        },

        _performLayout: function () {
            var count = this._splitBars.length;
            while (count) {
                count -= 1;
                this._performSplitterLayout(this._splitBars[count]);
            }
            this._refreshLayout();
        },

        _performSplitterLayout: function (splitBar) {
            if (this.orientation === 'horizontal') {
                splitBar.previous.css('float', 'none');
                splitBar.splitBar.css('float', 'none');
                splitBar.next.css('float', 'none');
                splitBar.splitBar.css('width', '100%');
                splitBar.next.css('width', '100%');
                splitBar.previous.css('width', '100%');
            } else {
                splitBar.previous.css('float', 'left');
                splitBar.splitBar.css('float', 'left');
                splitBar.next.css('float', 'left');
                splitBar.next.css('height', '100%');
                splitBar.previous.css('height', '100%');
            }
        },

        _refreshLayout: function () {
            //            if (this.orientation === 'vertical') {
            //               this._panelWrapper.width(this.host.width());
            //            } else {
            //               this._panelWrapper.width(this.host.width());       
            //            }
            this._panelWrapper.css('width', '100%');
            this._panelWrapper.css('height', '100%');

            this._performSplitBarsLayout();
            this._performPanelLayout();
        },

        _performSplitBarsLayout: function () {
            var hostHeight = this.host.height(), hostWidth = this.host.width(),
                size = (this._isTouchDevice) ? this.touchSplitBarSize : this.splitBarSize;
            for (var i = 0; i < this._splitBars.length; i += 1) {
                if (this.orientation === 'vertical') {
                    this._splitBars[i].splitBar.height(hostHeight);
                    this._splitBars[i].splitBar.width(size);
                } else {
                    this._splitBars[i].splitBar.width(hostWidth);
                    this._splitBars[i].splitBar.height(size);
                }
                this._centerChild(this._splitBars[i].splitBar.children(0));
            }
        },

        _centerChild: function (element) {
            var size = (this._isTouchDevice) ? this.touchSplitBarSize : this.splitBarSize;
            if (size != 5) {
                if (this.orientation === 'vertical') {
                    element.width(size);
                    element.height(45);
                }
                else {
                    element.height(size);
                    element.width(45);
                }
            }

            var displacementY = ($(element.parent()).height() - element.outerHeight()) / 2,
                displacementX = ($(element.parent()).width() - element.outerWidth()) / 2;
     //       element.css('margin-top', displacementY);
       //     element.css('margin-left', displacementX);
            element.css('position', 'relative');
            if (this.orientation === 'vertical') {
                element.css('top', '50%');
                element.css('left', '0');
                element.css('margin-top', '-23px');
                element.css('margin-left', '-0px');
            }
            else
            {
                element.css('left', '50%');
                element.css('top', '0');
                element.css('margin-left', '-23px');
                element.css('margin-top', '-0px');
            }
                //     element.css('margin-left', '50%');
            return element;
        },

        _performPanelLayout: function () {
            var count = this._splitPanels.length,
                i = 0,
                sizeSum = (count - 1) * this._splitBars[0].splitBar[this._getDimention('outerSize')](true),
                hostSize = this.host[this._getDimention('size')](),
                currentPanel;
           // hostSize -= 1;
            while (i < count) {
                currentPanel = this._splitPanels[i];
                i++;
                if (!currentPanel.options.collapsed) {
                    sizeSum += this._handlerPanelSize(currentPanel, sizeSum, hostSize);
                }
            }
            if (sizeSum < hostSize) {
                this._fillContainer(hostSize, sizeSum, count - 1);
            }
        },

        _getBorderSize: function (element) {
            if (element == null) {
                return 0;
            }
            var borderSize = this.orientation == 'vertical' ? parseInt(element.css('border-left-width')) : parseInt(element.css('border-top-width'));
            return borderSize;
        },

        _handlerPanelSize: function (currentPanel, sizeSum, hostSize) {
            this._setPanelSize(currentPanel, currentPanel.options.size);
            var panelWidth = currentPanel.options.size, size;
            if (sizeSum + panelWidth >= hostSize && !currentPanel.options.collapsed) {
                size = hostSize - sizeSum;
                var bordersize = this._getBorderSize(currentPanel),
                    difference = sizeSum + size - hostSize;
                if (!isNaN(bordersize)) {
                    size -= bordersize;
                }
                size = Math.min(size, currentPanel.options.max);
                size = Math.max(size, currentPanel.options.min);
                if (!currentPanel.options.collapsed) {
                    currentPanel[this._getDimention('size')](size);
                    currentPanel.options.size = size;
                }
            }
            return currentPanel[this._getDimention('outerSize')](true);
        },

        _fillContainer: function (hostSize, sizeSum, index) {
            if (typeof index === 'undefined') {
                index = 0;
            }
            var lastPanel = this._splitPanels[index],
                sizeDifference = hostSize - sizeSum,
                size = lastPanel[this._getDimention('size')](),
                sizeTotal = sizeDifference + size;
            if (index <= this._splitPanels.length) {
                if (lastPanel.options.collapsed) {
                    this._fillHelper(sizeSum, hostSize);
                } else {
                    if (sizeTotal > lastPanel.options.max) {
                        lastPanel.options.max = sizeTotal;
                    }
                    lastPanel[this._getDimention('size')](sizeTotal);
                    lastPanel.options.size = sizeTotal;
                }
                return;
            }
            sizeTotal = Math.min(sizeTotal, lastPanel.options.max);
            if (!lastPanel.options.collapsed) {
                lastPanel[this._getDimention('size')](sizeTotal);
                lastPanel.options.size = sizeTotal;
            } else {
                sizeTotal = size = 0;
            }
            if (sizeTotal + (sizeSum - size) < hostSize ||
                lastPanel.options.collapsed) {
                this._fillContainer(hostSize, (sizeSum - size) + sizeTotal, index - 1);
            }
        },

        _fillHelper: function (sizeSum, hostSize) {
            var panel,
                found = false;
            for (var i = 0; i < this._splitPanels.length && !found; i += 1) {
                panel = this._splitPanels[i];
                if (!panel.options.collapsed) {
                    found = true;
                }
            }
            panel[this._getDimention('size')](hostSize - sizeSum + panel[this._getDimention('size')]());
        },

        _applyOptions: function () {
            for (var i = 0; i < this._splitPanels.length; i += 1) {
                var options = this._splitPanels[i].options;
                if (options.collapsed) {
                    options.collapsed = false;
                    this.collapseAt(i, true);
                }
                if (!options.collapsible) {
                    if (i < this._splitPanels.length - 1) {
                        this.hideCollapseButtonAt(i);
                    } else {
                        if (this._splitPanels.length > 2) {
                            this.hideCollapseButtonAt(i - 1);
                        }
                    }
                }
                else if (options.collapsible) {
                    if (i < this._splitPanels.length - 1) {
                        this.showCollapseButtonAt(i);
                    } else {
                        this.showCollapseButtonAt(i - 1);
                    }
                }
            }
        },

        _validateSize: function () {
            var options, dim = this._getDimention('size');
            for (var i = 0; i < this._splitPanels.length; i += 1) {
                options = this._splitPanels[i].options;
                if (options.max < options.size) {
                    options.size = options.max;
                } else if (options.min > options.size) {
                    options.min = options.size;
                }
                this._splitPanels[i][dim](options.size);
                //this._splitPanels[i].css('min-' + dim, options.min);
                //this._splitPanels[i].css('max-' + dim, options.max);
            }
        },

        _getEvent: function (event) {
            if (this._isTouchDevice) {
                return this._touchEvents[event];
            } else {
                return event;
            }
        },

        _removeEventHandlers: function () {
            var count = this._splitBars.length;
            var self = this;

            this.removeHandler($(document), this._getEvent('mouseup') + '.' + this.host.attr('id'));
            this.removeHandler($(document), this._getEvent('mousemove') + '.' + this.host.attr('id'));
            this.removeHandler($(window), 'resize.' + this.element.id);
            this.removeHandler(this.host, 'loadContent');

            while (count) {
                count -= 1;
                this._removeSplitBarHandlers(this._splitBars[count]);
                this._removeCollapseButtonHandlers($(this._splitBars[count].splitBar.children(0)), count);
            }
        },

        _removeSplitBarHandlers: function (splitBar) {
            this.removeHandler(splitBar.splitBar, this._getEvent('mouseenter'));
            this.removeHandler(splitBar.splitBar, this._getEvent('mouseleave'));
            this.removeHandler(splitBar.splitBar, this._getEvent('mousedown'));
        },

        _removeCollapseButtonHandlers: function (button) {
            this.removeHandler(button, this._getEvent('mouseenter'));
            this.removeHandler(button, this._getEvent('mouseleave'));
            this.removeHandler(button, this._getEvent('mousedown'));
        },

        _addEventHandlers: function () {
            var count = this._splitBars.length, self = this;
            self.autoResize = true;
            this.addHandler($(document), this._getEvent('mouseup') + '.' + this.host.attr('id'), function () {
                self.autoResize = false;
                self._stopDrag(self);
                self.autoResize = true;
            });

            //this.addHandler(this.host, 'loadContent', function () {
            //    if (self._hiddenParent()) {
            //        return true;
            //    }
            //    var hasPercentageSize = false;
            //    if ((typeof self.width === 'string' && self.width.indexOf('%') >= 0 && self.orientation == 'vertical') ||
            //       (typeof self.height === 'string' && self.height.indexOf('%') >= 0 && self.orientation == 'horizontal')) {
            //        for (var i = 0; i < self.panels.length; i += 1) {
            //            if (self.panels[i]["_size"] != undefined) {
            //                self.panels[i]["size"] = self.panels[i]["_size"];
            //                self._validatePanel("size", self.panels[i]);
            //                hasPercentageSize = true;
            //            }
            //        }
            //        if (hasPercentageSize) {
            //            self._addPanelSizeProperties();
            //        }
            //    }
            //    self._refreshLayout();
            //    if (self._refreshWindowResizeTimer) clearTimeout(self._refreshWindowResizeTimer);
            //    self._refreshWindowResizeTimer = setTimeout(function () {
            //        self._refreshLayout();
            //    }, 100);
            //});

            this.addHandler($(document), this._getEvent('mousemove') + '.' + this.host.attr('id'), function (event) {
                self._performDrag(self, event);
            });

            this.addHandler($(window), 'resize.' + this.element.id, function (event) {
                if (event.owner && event.owner.control && event.owner.control == 'jqxsplitter') return;

                var doWindowResize = function () {
                    if (self._hiddenParent()) {
                        return true;
                    }

                    if (!self.windowWidth) {
                        self.windowWidth = $(window).width();
                    }
                    if (!self.windowHeight) {
                        self.windowHeight = $(window).height();
                    }

                    var windowWidth = $(window).width();
                    var windowHeight = $(window).height();

                    if (self.autoResize) {
                        if (windowWidth != self.windowWidth || windowHeight != self.windowHeight || self.hostWidth != self.host.width() || self.hostHeight != self.host.height()) {
                            if ((typeof self.width === 'string' && self.width.indexOf('%') >= 0 && self.orientation == 'vertical') ||
                        (typeof self.height === 'string' && self.height.indexOf('%') >= 0 && self.orientation == 'horizontal')) {
                                var hasPercentageSize = false;
                                for (var i = 0; i < self.panels.length; i += 1) {
                                    if (self.panels[i]["_size"] != undefined) {
                                        self.panels[i]["size"] = self.panels[i]["_size"];
                                        self._validatePanel("size", self.panels[i]);
                                        hasPercentageSize = true;
                                    }
                                }
                                if (hasPercentageSize) {
                                    self._addPanelSizeProperties();
                                }
                            }
                            self._refreshLayout();
                            if (self._refreshWindowResizeTimer) clearTimeout(self._refreshWindowResizeTimer);
                            self._refreshWindowResizeTimer = setTimeout(function () {
                                self._refreshLayout();
                            }, 100);
                        }
                    }

                    self.windowWidth = $(window).width();
                    self.windowHeight = $(window).height();
                    self.hostWidth = self.host.width();
                    self.hostHeight = self.host.height();
                }

                doWindowResize();
                setTimeout(function () {
                    doWindowResize();
                }, 10);
            });
            while (count) {
                count -= 1;
                this._addSplitBarHandlers(this._splitBars[count]);
                this._addCollapseButtonHandlers($(this._splitBars[count].splitBar.children(0)), count);
            }

            if (document.referrer != "" || window.frameElement) {
                if (window.top != null && window.top != window.self) {
                    var parentLocation = null;
                    if (window.parent && document.referrer) {
                        parentLocation = document.referrer;
                    }

                    if (parentLocation && parentLocation.indexOf(document.location.host) != -1) {
                        var eventHandle = function (event) {
                            self._stopDrag(self);
                        };

                        if (window.top.document.addEventListener) {
                            window.top.document.addEventListener('mouseup', eventHandle, false);

                        } else if (window.top.document.attachEvent) {
                            window.top.document.attachEvent("on" + 'mouseup', eventHandle);
                        }
                    }
                }
            }
        },

        _addSplitBarHandlers: function (splitBar) {
            var self = this;

            this.addHandler(splitBar.splitBar, this._getEvent('mousedown'), this._startDrag, { self: this });
            this.addHandler(splitBar.splitBar, this._getEvent('mouseenter'), function () {
                $(this).addClass(self.toThemeProperty('jqx-splitter-splitbar-hover'));
                $(this).addClass(self.toThemeProperty('jqx-fill-state-hover'));
            });
            this.addHandler(splitBar.splitBar, this._getEvent('mouseleave'), function () {
                $(this).removeClass(self.toThemeProperty('jqx-splitter-splitbar-hover'));
                $(this).removeClass(self.toThemeProperty('jqx-fill-state-hover'));
            });
        },

        _addCollapseButtonHandlers: function (button, index) {
            var self = this;
            this.addHandler(button, this._getEvent('mouseenter'), function () {
                button.addClass(self.toThemeProperty('jqx-splitter-collapse-button-hover'));
                button.addClass(self.toThemeProperty('jqx-fill-state-hover'));
            });
            this.addHandler(button, this._getEvent('mouseleave'), function () {
                button.removeClass(self.toThemeProperty('jqx-splitter-collapse-button-hover'));
                button.removeClass(self.toThemeProperty('jqx-fill-state-hover'));
            });
            this.addHandler(button, this._getEvent('mousedown'), function (event) {
                var splitbars = self._splitBars.length;
                if (splitbars == 1) {
                    $.each(self._splitPanels, function (i) {
                        var options = self._splitPanels[i].options;
                        if (options.collapsible) {
                            self._collapseButtonClickHandler(i);
                            return false;
                        }
                    });
                } else {
                    if (index < splitbars / 2) {
                        self._collapseButtonClickHandler(index);
                    } else {
                        self._collapseButtonClickHandler(1 + index);
                    }
                }
                if (event.stopPropagation != undefined) {
                    event.stopPropagation();
                }
                if (event.preventDefault != undefined) {
                    event.preventDefault();
                }
                return false;
            });
        },

        _collapseButtonClickHandler: function (index) {
            if (this._splitPanels[index].options.collapsed) {
                this.expandAt(index);
            } else {
                this.collapseAt(index);
            }
        },

        _initOverlay: function (create) {
            var self = this;
            if (self.overlay || create == 'undefined') {
                self.overlay.remove();
                self.overlay = null;
            }
            else if (create == true) {
                self.overlay = $("<div style='background: #999999;'></div>");
                self.overlay.css('opacity', 0.01);
                self.overlay.width(self.host.width());
                self.overlay.height(self.host.height());
                self.overlay.css('position', 'absolute');
                self.overlay.appendTo($(document.body));
                var offset = self.host.offset();
                self.overlay.css('left', offset.left);
                self.overlay.css('top', offset.top);
            }
        },

        _startDrag: function (event) {
            var self = event.data.self;

            var splitBarIndex = self._indexOf($(event.target));
            self._resizeArea = self._splitBars[splitBarIndex];

            if (self._resizeArea != null) {
                self._initOverlay(true);

                if ((typeof self._resizeArea.previous.options.resizable === 'undefined' || self._resizeArea.previous.options.resizable) &&
                (typeof self._resizeArea.next.options.resizable === 'undefined' || self._resizeArea.next.options.resizable)) {
                    var previous = self._resizeArea.previous,
                next = self._resizeArea.next;
                    if ((!previous.options.collapsed && !next.options.collapsed) &&
                !(next.options.max <= next[self._getDimention('outerSize')]() &&
                  previous.options.max <= previous[self._getDimention('outerSize')]())) {
                        self._capturedElement = self._makeClone(event.target);
                        self._startX = self._capturedElement.offset().left;
                        self._startY = self._capturedElement.offset().top;
                        var touches = $.jqx.mobile.getTouches(event);
                        var touch = touches[0];

                        self._mouseStartX = touch.pageX;
                        self._mouseStartY = touch.pageY;

                        var panelOptions = self._getPanelOptions();
                        self._raiseEvent(3, { firstPanel: { index: splitBarIndex, size: previous.options.size },
                            secondPanel: { index: splitBarIndex + 1, size: next.options.size }, panels: panelOptions
                        });
                    }
                }
                return false;
            }
        },

        _makeClone: function (splitBar) {
            var clone = $(splitBar).clone();
            clone.css({
                'position': 'absolute',
                'top': $(splitBar).offset().top,
                'left': $(splitBar).offset().left
            });
            clone.fadeTo(0, 0.7);
            clone.css('z-index', 9999);
            $(document.body).append(clone);
            return clone;
        },

        _clickCollapse: function (event) {
            var self = event.data.self;
            self.collapseAt(0);
        },

        _performDrag: function (self, event) {
            var touches = $.jqx.mobile.getTouches(event);
            var touch = touches[0];

            var eventCoordinates = touch[self._getDimention('page')];
            if (event.which === 0 && $.jqx.browser.msie && $.jqx.browser.version < 9) {
                self._stopDrag(self);
                return false;
            }
            if (self._capturedElement !== null && typeof self._capturedElement !== 'undefined') {
                var position = (eventCoordinates - self[self._getDimention('mouse')]) + self[self._getDimention('start')];
                self._moveSplitBar(position);
                return false;
            }
            return true;
        },

        _moveSplitBar: function (position) {
            position = this._validatePosition(position);
            if (position.invalid) {
                this._capturedElement.addClass(this.toThemeProperty('jqx-splitter-invalid'));
            } else {
                this._capturedElement.removeClass(this.toThemeProperty('jqx-splitter-invalid'));
            }
            this._capturedElement.css(this._getDimention('dimention'), position.position);
        },

        _validatePosition: function (position) {
            var resizeArea = this._resizeArea,
                rightBound = this._getNextBoundary(resizeArea),
                leftBound = this._getPreviousBoundary(resizeArea),
                maxRight = Math.min(rightBound, rightBound - resizeArea.next.options.min, leftBound + resizeArea.previous.options.max),
                maxLeft = Math.max(leftBound, leftBound + resizeArea.previous.options.min, rightBound - resizeArea.next.options.max),
                invalidPosition;
            if (maxLeft > maxRight) {
                invalidPosition = resizeArea.next.offset()[this._getDimention('dimention')] - this._capturedElement[this._getDimention('outerSize')](true)
                return { position: invalidPosition, invalid: true };
            }
            if (position < maxLeft) {
                return { position: maxLeft, invalid: true };
            }
            if (position > maxRight) {
                return { position: maxRight, invalid: true };
            }
            return { position: position, invalid: false };
        },

        _getNextBoundary: function (splitArea) {
            var boundary = splitArea.next.offset()[this._getDimention('dimention')] +
                           splitArea.next[this._getDimention('size')]() -
                           this._capturedElement[this._getDimention('outerSize')](true),
                next = this._nextPanel(splitArea.next);
            if (next !== null && next.options.collapsed) {
                boundary -= next.options.min;
            }
            return boundary;
        },

        _getPreviousBoundary: function (splitArea) {
            var boundary = splitArea.previous.offset()[this._getDimention('dimention')],
                prev = this._previousPanel(splitArea.previous);
            if (prev !== null && prev.options.collapsed) {
                boundary += prev.options.min;
            }
            return boundary;
        },

        _previousPanel: function (splitPanel) {
            var index = this._indexOfSplitPanel(splitPanel);
            if (index === 0) {
                return null;
            } else {
                return this._splitPanels[index - 1];
            }
        },

        _nextPanel: function (splitPanel) {
            var index = this._indexOfSplitPanel(splitPanel);
            if (index === this._splitPanels.length - 1) {
                return null;
            } else {
                return this._splitPanels[index + 1];
            }
        },

        _indexOfSplitPanel: function (splitPanel) {
            var count = this._splitPanels.length;
            while (count) {
                count -= 1;
                if (this._splitPanels[count][0] === splitPanel[0]) {
                    return count;
                }
            }
            return -1;
        },

        _stopDrag: function (self) {
            if (self._capturedElement) {
                self._performAreaResize();
                self._capturedElement.remove();
            }
            self._capturedElement = null;
            self._initOverlay();
        },

        _performAreaResize: function () {
            var splitArea = this._resizeArea,
                displacement = this._capturedElement.offset()[this._getDimention('dimention')] - this[this._getDimention('start')],
                prevSize = splitArea.previous[this._getDimention('size')]() + displacement,
                nextSize = splitArea.next[this._getDimention('size')]() - displacement,
                splitBarIndex = this._indexOf(splitArea.splitBar),
                prevPanelOldSize = splitArea.previous[this._getDimention('size')]();
            this._setPanelSize(splitArea.previous, prevSize);
            this._setPanelSize(splitArea.next, nextSize);
            this._splittersLayout();
            if (this.cookies) {
                $.jqx.cookie.cookie("jqxSplitter" + this.element.id, this.exportLayout(), this.cookieOptions);
            }
            if (prevPanelOldSize !== prevSize) {
                var panelOptions = this._getPanelOptions();
                this._raiseEvent(0, { firstPanel: { index: splitBarIndex, size: prevSize },
                    secondPanel: { index: splitBarIndex + 1, size: nextSize }, panels: panelOptions
                });
            }

            var panelIndex = -1;
            for (var i = 0; i < this._splitPanels.length; i++) {
                if (this._splitPanels[i] == splitArea.previous) {
                    panelIndex = i;
                }
            }

            if (panelIndex >= 0) {
                if (this.panels[panelIndex]) {
                    if (this.panels[panelIndex]['_size']) {
                        if (this.orientation == 'horizontal') {
                            var percentage = displacement / (this.host.height() - 2) * 100;
                        }
                        else {
                            var percentage = displacement / (this.host.width() - 2) * 100;
                        }
                        percentage = Math.round(percentage);
                        this.panels[panelIndex]['_size'] = parseInt(this.panels[panelIndex]['_size']) + percentage + '%';
                        if (this.panels[panelIndex + 1]) {
                            this.panels[panelIndex + 1]['_size'] = parseInt(this.panels[panelIndex + 1]['_size']) - percentage + '%';
                        }
                        this.autoResize = true;
                    }
                }
            }
        },

        _splittersLayout: function () {
            var splitters = $.data(document.body, 'jqx-splitters') || [];

            for (var i = 0; i < splitters.length; i += 1) {
                if (splitters[i][0] !== this.element) {
                    $(splitters[i]).jqxSplitter('_performLayout');
                }
            }
        },

        _raiseEvent: function (eventId, data) {
            var event = new $.Event(this._events[eventId]);
            this.control = "jqxsplitter";
            event.owner = this;
            event.args = data; 
            return this.host.trigger(event);
        },

        _setPanelSize: function (panel, size) {
            if (!panel.options.collapsed) {
                panel.options.size = parseInt(size);
                panel[this._getDimention('size')](size);
            } else {
                panel[this._getDimention('size')](0);
            }
        },

        _indexOf: function (splitBar) {
            var count = this._splitBars.length;
            while (count) {
                count -= 1;
                if (this._splitBars[count].splitBar[0] === splitBar[0]) {
                    return count;
                }
            }
            return -1;
        },

        _neighborPanel: function (index) {
            var neighbor;
            if (index === this._splitPanels.length - 1) {
                neighbor = this._splitPanels[index - 1];
            } else {
                neighbor = this._splitPanels[index + 1];
            }
            return neighbor;
        },


        _animateResize: function (panel, size, duration, callback) {
            var animationProperties = {}, self = this;
            animationProperties[this._getDimention('size')] = size;
            panel.animate(animationProperties, { step: function () {
                self._splittersLayout.call(self);
            }, duration: duration, complete: function () {
                self._splittersLayout.call(self);
                if (callback && callback instanceof Function) {
                    callback();
                }
            }
            });
        },

        _addDisabledClasses: function () {
            var splitbar;
            for (var i = 0; i < this._splitBars.length; i += 1) {
                splitbar = this._splitBars[i].splitBar;
                splitbar.addClass(this.toThemeProperty('jqx-splitter-splitbar-disabled'));
                splitbar.children(0).addClass(this.toThemeProperty('jqx-splitter-collapse-button-disabled'));
            }
            this.host.addClass(this.toThemeProperty('jqx-fill-state-disabled'));
        },

        _removeDisabledClasses: function () {
            var splitbar;
            for (var i = 0; i < this._splitBars.length; i += 1) {
                splitbar = this._splitBars[i].splitBar;
                splitbar.removeClass(this.toThemeProperty('jqx-splitter-splitbar-disabled'));
                splitbar.children(0).removeClass(this.toThemeProperty('jqx-splitter-collapse-button-disabled'));
            }
            this.host.removeClass(this.toThemeProperty('jqx-fill-state-disabled'));
        },

        _closestSplitBar: function (firstPanel, secondPanel) {
            for (var i = 0; i < this._splitBars.length; i += 1) {
                if ((this._splitBars[i].previous[0] === firstPanel[0] &&
                    this._splitBars[i].next[0] === secondPanel[0]) ||
                    (typeof secondPanel === 'undefined' && this._splitBars[i].previous[0] === firstPanel[0]) ||
                    (this._splitBars[i].next[0] === firstPanel[0] &&
                    this._splitBars[i].previous[0] === secondPanel[0])) {
                    return this._splitBars[i].splitBar;
                }
            }
            return null;
        },

        propertyChangedHandler: function (object, key, oldvalue, value) {
            if (key == 'touchMode') {
                if (value) {
                    object.splitBarSize = object.touchSplitBarSize;
                    object._performLayout();
                }
            }
            if (key === 'disabled') {
                if (value) {
                    this.disable();
                } else {
                    this.enable();
                }
            } else if (key === 'theme') {
                $.jqx.utilities.setTheme(oldvalue, value, this.host);
            } else if (key === 'panels') {
                this._validatePanels();
                this._addPanelProperties();
                this._refreshWidgetLayout();
            } else {
                this._refreshWidgetLayout();
            }
        },

        /**
        * Exporting splitter's layout as a JSON string
        */
        exportLayout: function () {
            var jSON = '{ "panels": [';
            for (var i = 0; i < this._splitPanels.length; i += 1) {
                jSON += '{';
                for (var property in this._splitPanels[i].options) {
                    jSON += '"' + property + '":';
                    jSON += '"' + this._splitPanels[i].options[property] + '",'
                }
                jSON = jSON.substring(0, jSON.length - 1) + ' },';
            }
            jSON = jSON.substring(0, jSON.length - 1) + '],\
                 "orientation": "' + this.orientation + '" }';
            return jSON;
        },

        /**
        * Importing splitter layout as a JSON string. This string should have the following format: { panels: [Array with panel's properties], orientation: 'horizontal/vertical' }
        */
        importLayout: function (jSON) {
            try {
                var config = $.parseJSON(jSON);
                this.panels = config.panels;
                this.orientation = config.orientation;
                this._validatePanels();
//                this._addPanelProperties();
//                this._refreshWidgetLayout();

                this._setSplitterSize();
                this._addPanelProperties();
                this._refresh(false);
                this._splittersLayout();
                this._performLayout();
            } catch (exception) {
                alert(exception);
            }
        },

        /**
        * Expanding panel with specific index
        */
        expandAt: function (index) {
            if (index <= this._splitPanels.length && index >= 0 &&
                this._splitPanels[index].options.collapsed) {
                var toResize = this._neighborPanel(index), toExpand = this._splitPanels[index], self = this,
                    animationDuration = (this.enableCollapseAnimation) ? this.animationDuration : 0, splitBar;
                toExpand.options.collapsed = false;
                toExpand.options.size = Math.min(toExpand.options.size, toResize[this._getDimention('size')]());
                toResize.options.size = toResize[this._getDimention('size')]() - toExpand.options.size;
                splitBar = this._closestSplitBar(toExpand, toResize);
                splitBar.removeClass(this.toThemeProperty('jqx-splitter-splitbar-collapsed'));
                this._animateResize(toResize, toResize.options.size, animationDuration);
                this._animateResize(toExpand, toExpand.options.size, animationDuration, function () {
                    var panelOptions = self._getPanelOptions();
                    self._raiseEvent(0, { firstPanel: { index: index, size: toExpand.options.size }, secondPanel: { index: index + 1, size: toResize.options.size } });
                    self._raiseEvent(1, { index: index, expandedPanel: panelOptions[index], panels: panelOptions });            
                });

                if (this.panels[index]) {
                    if (this.panels[index]['_size']) {
                        var toResizeIndex = index === this._splitPanels.length - 1 ? index - 1 : index + 1;
                        var panelToResize = this.panels[toResizeIndex];
                        if (panelToResize && panelToResize['_size']) {
                            var percentage = this.orientation == 'vertical' ? parseInt(toExpand.options.size) / this.host.width() * 100 : parseInt(toExpand.options.size) / this.host.height() * 100;
                        
                            if (this.panels[index]['__size'] != undefined) {
                                percentage = this.panels[index]['__size'];
                            }
                            percentage = parseInt(percentage);

                            panelToResize['_size'] = parseInt(panelToResize['_size']) - percentage + '%';
                            this.panels[index]['_size'] = percentage + '%';

                            if (toExpand.options.size == 0) {
                                var barSize = (this.splitBarSize * this.panels.length - 1);

                                var size = this.orientation == 'vertical' ? this.host.width() - barSize : this.host.height() - barSize;
                                size = (percentage * size)/100;
                                this.panels[index]['size'] = size;
                                toExpand.options.size = size;
                                toResize.options.size = toResize[this._getDimention('size')]() - size;
                                this._animateResize(toResize, toResize.options.size, animationDuration);
                                this._animateResize(toExpand, toExpand.options.size, animationDuration);
                            }

                            this.autoResize = true;
                        }
                    }
                }
                if (this.cookies) {
                    $.jqx.cookie.cookie("jqxSplitter" + this.element.id, this.exportLayout(), this.cookieOptions);
                }
            }
        },

        _getPanelOptions: function () {
            var panelOptions = new Array();
            $.each(this._splitPanels, function () {
                panelOptions[panelOptions.length] = this.options;
            });

            return panelOptions;
        },

        collapseAt: function (index, refreshed) {
            var panelOptions = this._splitPanels[index].options;
            if (index < this._splitPanels.length && index >= 0 &&
                !panelOptions.collapsed && panelOptions.collapsible) {
                var toCollapse = this._splitPanels[index],
                    width = toCollapse[this._getDimention('size')](),
                    animationDuration = (this.enableCollapseAnimation) ? this.animationDuration : 0,
                    toResize = this._neighborPanel(index), self = this, splitBar;
                //fix when there is a collapsed item and we change the orientation
                toCollapse.options.size = (width) ? width : toCollapse.options.size;
                toCollapse.options.collapsed = true;

                splitBar = this._closestSplitBar(toCollapse, toResize);
                splitBar.addClass(this.toThemeProperty('jqx-splitter-splitbar-collapsed'));
                toResize.options.size = toResize[this._getDimention('size')]() + width;
                this._animateResize(toResize, toResize.options.size, animationDuration);
                this._animateResize(toCollapse, 0, animationDuration, function () {
                    if (refreshed == undefined) {
                        var panelOptions = self._getPanelOptions();
                        self._raiseEvent(0, { firstPanel: { index: index, size: 0 }, secondPanel: { index: index + 1, size: toResize.options.size } });
                        self._raiseEvent(2, { index: index, collapsedPanel: panelOptions[index], panels: panelOptions });
                    }
                });
                if (this.panels[index]) {
                    if (this.panels[index]['_size']) {
                        var toResizeIndex = index === this._splitPanels.length - 1 ? index - 1 : index + 1;
                        var panelToResize = this.panels[toResizeIndex];
                        if (panelToResize && panelToResize['_size']) {
                            var percentage = parseInt(this.panels[index]['_size']);
                            panelToResize['_size'] = parseInt(panelToResize['_size']) + percentage + '%';
                            this.panels[index]['__size'] = this.panels[index]['_size'];
                            this.panels[index]['_size'] = '0%';
                        }
                        this.autoResize = true;
                    }
                }
                if (this.cookies) {
                    $.jqx.cookie.cookie("jqxSplitter" + this.element.id, this.exportLayout(), this.cookieOptions);
                }
            }
        },

        disable: function () {
            this._removeEventHandlers();
            this.disabled = true;
            this._addDisabledClasses();
        },

        /**
        * Enabling the splitter
        */
        enable: function () {
            this._addEventHandlers();
            this.disabled = false;
            this._removeDisabledClasses();
        },

        showCollapseButtonAt: function (index) {
            if (index >= 0 && index < this._splitBars.length) {
                this._splitBars[index].splitBar.children(0).css('visibility', 'inherit');
            }
        },

        hideCollapseButtonAt: function (index) {
            if (index >= 0 && index < this._splitBars.length) {
                this._splitBars[index].splitBar.children(0).css('visibility', 'hidden');
            }
        }
    });
} (jQuery));