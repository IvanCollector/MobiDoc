/*
jQWidgets v2.7.0 (2013-Feb-08)
Copyright (c) 2011-2013 jQWidgets.
License: http://jqwidgets.com/license/
*/

(function ($) {
    $.jqx.jqxWidget("jqxChart", "", {});

    $.extend($.jqx._jqxChart.prototype,
    {
        createInstance: function (args) {
            if (!$.jqx.dataAdapter) {
                throw 'jqxdata.js is not loaded';
                return;
            }

            this._refreshOnDownloadComlete();

            var self = this;
            this.host.on('mousemove', function (event) {
                if (self.enabled == false)
                    return;

                event.preventDefault();
                var x = event.pageX || event.clientX || event.screenX;
                var y = event.pageY || event.clientY || event.screenY;

                var pos = self.host.offset();
                x -= pos.left;
                y -= pos.top;

                self.onmousemove(x, y);
            });

            this.host.on('mouseleave', function (event) {
                if (self.enabled == false)
                    return;

                self._cancelTooltipTimer();
                self._hideToolTip();
            });
            this.host.on('click', function (event) {
                if (self.enabled == false)
                    return;

                self._cancelTooltipTimer();
                self._hideToolTip();

                if (self._pointMarker && self._pointMarker.element) {
                    var group = self.seriesGroups[self._pointMarker.gidx];
                    var serie = group.series[self._pointMarker.sidx];
                    self._raiseEvent('click', group, serie, self._pointMarker.iidx);
                }
            });

            if (this.element.style) {
                var sizeInPercentage = false;
                if (this.element.style.width != null) {
                    sizeInPercentage |= this.element.style.width.toString().indexOf('%') != -1;
                }
                if (this.element.style.height != null) {
                    sizeInPercentage |= this.element.style.height.toString().indexOf('%') != -1;
                }
                if (sizeInPercentage) {
                    $(window).resize(function () {
                        if (self.timer) {
                            clearTimeout(self.timer);
                        }
                        var delay = $.jqx.browser.msie ? 200 : 1;
                        self.timer = setTimeout(function () {
                            var tmp = self.enableAnimations;
                            self.enableAnimations = false;
                            self.refresh();
                            self.enableAnimations = tmp;
                        }, delay);
                    });
                }
            }
        }, // createInstance

        _refreshOnDownloadComlete: function () {
            if (this.source instanceof $.jqx.dataAdapter) {
                var me = this;
                var adapteroptions = this.source._options;
                if (adapteroptions == undefined || (adapteroptions != undefined && !adapteroptions.autoBind)) {
                    this.source.autoSync = false;
                    this.source.dataBind();
                }
                if (this.source.records.length == 0) {
                    var updateFunc = function () {
                        // sends a callback function to the user. This allows him to add additional initialization logic before the chart is rendered.
                        if (me.ready) {
                            me.ready();
                        }
                        me.refresh();
                    }
                    this.source.unbindDownloadComplete(this.element.id);
                    this.source.bindDownloadComplete(this.element.id, updateFunc);
                }
                else {
                    // sends a callback function to the user. This allows him to add additional initialization logic before the chart is rendered.
                    if (me.ready) {
                        me.ready();
                    }
                }
                this.source.unbindBindingUpdate(this.element.id);
                this.source.bindBindingUpdate(this.element.id, function () {
                    me.refresh();
                });
            }
        },

        defineInstance: function () {
            this.source = new Array();
            this.seriesGroups = new Array();
            this.categoryAxis = {};
        }, // defineInstance

        propertyChangedHandler: function (object, key, oldvalue, value) {
            if (this.isInitialized == undefined || this.isInitialized == false)
                return;

            if (key == 'source') {
                this._refreshOnDownloadComlete();
            }

            this.refresh();
        },

        //[optimize]
        _internalRefresh: function () {
            this._stopAnimations();
            this.host.empty();

            // clears the data.
            this._renderData = new Array();
            var renderer = null;

            if (document.createElementNS && (this.renderEngine == 'SVG' || this.renderEngine == undefined)) {
                renderer = new $.jqx.svgRenderer();
                if (!renderer.init(this.host)) {
                    if (this.renderEngine == 'SVG')
                        throw 'Your browser does not support SVG';

                    return;
                }
            }

            if (renderer == null && this.renderEngine != 'HTML5') {
                renderer = new $.jqx.vmlRenderer();
                if (!renderer.init(this.host)) {
                    if (this.renderEngine == 'VML')
                        throw 'Your browser does not support VML';

                    return;
                }
                this._isVML = true;
            }

            if (renderer == null && (this.renderEngine == 'HTML5' || this.renderEngine == undefined)) {
                renderer = new $.jqx.HTML5Renderer();
                if (!renderer.init(this.host)) {
                    throw 'Your browser does not support HTML5 Canvas';
                }
            }

            this.renderer = renderer;
            var rect = this.renderer.getRect();
            this._render({ x: 1, y: 1, width: rect.width, height: rect.height });

            if (this.renderer instanceof $.jqx.HTML5Renderer) {
                this.renderer.refresh();
            }
        },

        saveAsPNG: function (filename, exportServer) {
            return this._saveAsImage('png', filename, exportServer);
        },

        saveAsJPEG: function (filename, exportServer) {
            return this._saveAsImage('jpeg', filename, exportServer);
        },

        //[optimize]
        _saveAsImage: function (type, fileName, exportServer) {
            if (fileName == undefined || fileName == '')
                fileName = 'chart.' + type;

            if (exportServer == undefined || exportServer == '')
                exportServer = 'http://www.jqwidgets.com/export_server/export.php';

            var rendererEngineSaved = this.rendererEngine;
            var enableAnimationsSaved = this.enableAnimations;

            this.enableAnimations = false;

            // try switching to HTML5
            this.renderEngine = 'HTML5';

            if (this.renderEngine != rendererEngineSaved) {
                try {
                    this.refresh();
                }
                catch (e) {
                    this.renderEngine = rendererEngineSaved;
                    this.refresh();
                    this.enableAnimations = enableAnimationsSaved;
                }
            }

            try {
                var canvas = this.renderer.getContainer()[0];
                if (canvas) {
                    var data = canvas.toDataURL("image/" + type);

                    //data = data.replace("image/png;", "image/octet-stream;");
                    //document.location = data;

                    data = data.replace("data:image/" + type + ";base64,", "");
                    var form = document.createElement('form');
                    form.method = 'POST';
                    form.action = exportServer;
                    form.style.display = 'none';
                    document.body.appendChild(form);

                    var inputFName = document.createElement('input');
                    inputFName.name = 'fname';
                    inputFName.value = fileName;
                    inputFName.style.display = 'none';

                    var inputContent = document.createElement('input');
                    inputContent.name = 'content';
                    inputContent.value = data;
                    inputContent.style.display = 'none';

                    form.appendChild(inputFName);
                    form.appendChild(inputContent);

                    form.submit();

                    document.body.removeChild(form);
                }
            }
            catch (e) {
            }

            // switch back to existing engine
            if (this.renderEngine != rendererEngineSaved) {
                this.renderEngine = rendererEngineSaved;
                this.refresh();
                this.enableAnimations = enableAnimationsSaved;
            }

            return true;
        },

        refresh: function () {
            this._internalRefresh();
        },

        //[optimize]
        _seriesTypes: [
            'line', 'stackedline', 'stackedline100',
            'spline', 'stackedspline', 'stackedspline100',
            'stepline', 'stackedstepline', 'stackedstepline100',
            'area', 'stackedarea', 'stackedarea100',
            'splinearea', 'stackedsplinearea', 'stackedsplinearea100',
            'steparea', 'stackedsteparea', 'stackedsteparea100',
            'column', 'stackedcolumn', 'stackedcolumn100',
            'pie', 'donut', 'scatter', 'bubble'],

        //[optimize]
        _render: function (rect) {
            this.renderer.clear();
            //if (this._getDataLen() == 0)
            //    return;

            var bckgImg = this.backgroundImage;
            if (bckgImg == undefined || bckgImg == '')
                this.host.css({ 'background-image': '' });
            else
                this.host.css({ 'background-image': (bckgImg.indexOf('(') != -1 ? bckgImg : "url('" + bckgImg + "')") });

            // build stats
            this._buildStats();
            var padding = this.padding || { left: 5, top: 5, right: 5, bottom: 5 };
            var rFill = this.renderer.rect(rect.x, rect.y, rect.width - 1, rect.height - 1);

            var groupAll = this.renderer.beginGroup();
            var clipAll = this.renderer.createClipRect(rect);
            this.renderer.setClip(groupAll, clipAll);

            if (bckgImg == undefined || bckgImg == '')
                this.renderer.attr(rFill, { fill: this.background || this.backgroundColor || 'white' });
            else
                this.renderer.attr(rFill, { fill: 'transparent' });

            if (this.showBorderLine != false) {
                var borderColor = this.borderLineColor == undefined ? this.borderColor : this.borderLineColor;
                if (borderColor == undefined)
                    borderColor = '#888888';

                var borderLineWidth = this.borderLineWidth;
                if (isNaN(borderLineWidth) || borderLineWidth < 0.5 || borderLineWidth > 10)
                    borderLineWidth = 1;

                this.renderer.attr(rFill, { 'stroke-width': borderLineWidth, stroke: borderColor });
            }

            var paddedRect = { x: padding.left, y: padding.top, width: rect.width - padding.left - padding.right, height: rect.height - padding.top - padding.bottom };
            this._paddedRect = paddedRect;
            var titlePadding = this.titlePadding || { left: 2, top: 2, right: 2, bottom: 2 };
            if (this.title && this.title.length > 0) {
                var cssTitle = this.toThemeProperty('jqx-chart-title-text', null);
                var sz = this.renderer.measureText(this.title, 0, { 'class': cssTitle });
                this.renderer.text(this.title, paddedRect.x + titlePadding.left, paddedRect.y + titlePadding.top, paddedRect.width - (titlePadding.left + titlePadding.right), sz.height, 0, { 'class': cssTitle }, true, 'center', 'center');
                paddedRect.y += sz.height;
                paddedRect.height -= sz.height;
            }
            if (this.description && this.description.length > 0) {
                var cssDesc = this.toThemeProperty('jqx-chart-title-description', null);
                var sz = this.renderer.measureText(this.description, 0, { 'class': cssDesc });
                this.renderer.text(this.description, paddedRect.x + titlePadding.left, paddedRect.y + titlePadding.top, paddedRect.width - (titlePadding.left + titlePadding.right), sz.height, 0, { 'class': cssDesc }, true, 'center', 'center');

                paddedRect.y += sz.height;
                paddedRect.height -= sz.height;
            }

            if (this.title || this.description) {
                paddedRect.y += (titlePadding.bottom + titlePadding.top);
                paddedRect.height -= (titlePadding.bottom + titlePadding.top);
            }

            var plotRect = { x: paddedRect.x, y: paddedRect.y, width: paddedRect.width, height: paddedRect.height };

            var isPieOnly = this._isPieOnlySeries();

            // axis validation
            var hashCatAxis = {};
            for (var i = 0; i < this.seriesGroups.length && !isPieOnly; i++) {
                if (this.seriesGroups[i].type == 'pie' || this.seriesGroups[i].type == 'donut')
                    continue;

                var swap = this.seriesGroups[i].orientation == 'horizontal';
                var sgvx = this.seriesGroups[i].valueAxis;
                if (!sgvx) {
                    throw 'seriesGroup[' + i + '] is missing ' + (swap ? 'categoryAxis' : 'valueAxis') + ' definition';
                }
                var sghx = this._getCategoryAxis(i);
                if (!sghx) {
                    throw 'seriesGroup[' + i + '] is missing ' + (!swap ? 'categoryAxis' : 'valueAxis') + ' definition';
                }

                var catId = sghx == this.categoryAxis ? -1 : i;
                hashCatAxis[catId] = 0x00;
            }

            // get vertical axis width
            var wYAxis = 0;
            var wYAxisArr = [];

            for (var i = 0; i < this.seriesGroups.length; i++) {
                if (this.seriesGroups[i].type == 'pie' || this.seriesGroups[i].type == 'donut') {
                    wYAxisArr.push(0);
                    continue;
                }
                var swap = this.seriesGroups[i].orientation == 'horizontal';

                var catId = this._getCategoryAxis(i) == this.categoryAxis ? -1 : i;

                var w = sgvx.axisSize;
                var axisR = { x: 0, y: plotRect.y, width: plotRect.width, height: plotRect.height };
                if (!w || w == 'auto') {
                    if (swap) {
                        w = this._renderCategoryAxis(i, axisR, true, plotRect).width;
                        if ((hashCatAxis[catId] & 0x01) == 0x01)
                            w = 0;
                        else
                            hashCatAxis[catId] |= 0x01;
                    }
                    else
                        w = this._renderValueAxis(i, axisR, true, plotRect).width;
                }

                if (i > 0 && w > 0)
                    wYAxis += 5;

                wYAxisArr.push(w);
                wYAxis += w;
            }

            // get horizontal axis height
            var hXAxis = 0;
            var hXAxisArr = [];
            for (var i = 0; i < this.seriesGroups.length; i++) {
                if (this.seriesGroups[i].type == 'pie' || this.seriesGroups[i].type == 'donut') {
                    hXAxisArr.push(0);
                    continue;
                }
                var swap = this.seriesGroups[i].orientation == 'horizontal';
                var sghx = this._getCategoryAxis(i);
                var catId = sghx == this.categoryAxis ? -1 : i;

                var h = sghx.axisSize;
                if (!h || h == 'auto') {
                    if (swap)
                        h = this._renderValueAxis(i, { x: 0, y: 0, width: 10000000, height: 0 }, true, plotRect).height;
                    else {
                        h = this._renderCategoryAxis(i, { x: 0, y: 0, width: 10000000, height: 0 }, true).height;
                        if ((hashCatAxis[catId] & 0x02) == 0x02)
                            h = 0;
                        else
                            hashCatAxis[catId] |= 0x02;
                    }
                }

                hXAxisArr.push(h + 5);
                hXAxis += h + 5;
            }

            this._plotRect = plotRect;

            var showLegend = (this.showLegend != false);
            var szLegend = !showLegend || this.legendLayout ? { width: 0, height: 0} : this._renderLegend(paddedRect, true);

            if (paddedRect.height < hXAxis + szLegend.height || paddedRect.width < wYAxis)
                return;

            plotRect.height -= hXAxis + szLegend.height;

            if (!this.rtl) {
                plotRect.x += wYAxis;
            }
            plotRect.width -= wYAxis;

            if (!isPieOnly) {
                var lineColor = this.categoryAxis.tickMarksColor || '#888888';
                if (wYAxis == 0) {
                    var x = $.jqx._ptrnd(plotRect.x);
                    //var vline = this.renderer.line(x, $.jqx._ptrnd(plotRect.y), x, $.jqx._ptrnd(plotRect.y + plotRect.height + 5), { stroke: lineColor, 'stroke-width': 1 });
                }

                var h = 0;
                for (var i = 0; i < this.seriesGroups.length; i++) {
                    var swap = this.seriesGroups[i].orientation == 'horizontal';
                    var catId = this._getCategoryAxis(i) == this.categoryAxis ? -1 : i;
                    var axisR = { x: plotRect.x, y: plotRect.y + plotRect.height + h, width: plotRect.width, height: hXAxisArr[i] - 5 };
                    if (swap)
                        this._renderValueAxis(i, axisR, false, plotRect);
                    else {
                        if ((hashCatAxis[catId] & 0x04) == 0x04)
                            continue;
                        this._renderCategoryAxis(i, axisR, false, plotRect);
                        hashCatAxis[catId] |= 0x04;
                    }

                    h += hXAxisArr[i];
                }
            }

            if (showLegend) {
                var x = plotRect.x + $.jqx._ptrnd((plotRect.width - szLegend.width) / 2);
                var y = plotRect.y + plotRect.height + hXAxis;
                var w = plotRect.width;
                var h = szLegend.height;
                if (this.legendLayout) {
                    x = this.legendLayout.left || x;
                    y = this.legendLayout.top || y;
                    w = this.legendLayout.width || w;
                    h = this.legendLayout.height || h;
                }
                if (x + w > paddedRect.x + paddedRect.width)
                    w = paddedRect.x + paddedRect.width - x;
                if (y + h > paddedRect.y + paddedRect.height)
                    h = paddedRect.y + paddedRect.height - y;

                this._renderLegend({ x: x, y: y, width: w, height: h });
            }

            this._hasHorizontalLines = false;
            if (!isPieOnly) {
                var xOffset = plotRect.x - wYAxis;
                for (var i = 0; i < this.seriesGroups.length; i++) {
                    var swap = this.seriesGroups[i].orientation == 'horizontal';
                    var w = wYAxisArr[i];
                    if (i > 0 && w > 0)
                        xOffset += 5;
                    var axisR = { x: xOffset, y: plotRect.y, width: w, height: plotRect.height };
                    if (swap) {
                        if ((hashCatAxis[this._getCategoryAxis(i)] & 0x08) == 0x08)
                            continue;

                        this._renderCategoryAxis(i, axisR, false, plotRect);
                        hashCatAxis[this._getCategoryAxis(i)] |= 0x08;
                    }
                    else
                        this._renderValueAxis(i, axisR, false, plotRect);

                    xOffset += w;
                }
            }

            if (plotRect.width <= 0 || plotRect.height <= 0)
                return;

            this._plotRect = { x: plotRect.x, y: plotRect.y, width: plotRect.width, height: plotRect.height };

            var g = this.renderer.beginGroup();
            var clip = this.renderer.createClipRect({ x: plotRect.x, y: plotRect.y, width: plotRect.width, height: plotRect.height });
            this.renderer.setClip(g, clip);

            this._createAnimationGroup("series");

            for (var i = 0; i < this.seriesGroups.length; i++) {
                var sg = this.seriesGroups[i];
                var isValid = false;
                for (var validtype in this._seriesTypes) {
                    if (this._seriesTypes[validtype] == sg.type) {
                        isValid = true;
                        break;
                    }
                }
                if (!isValid) {
                    throw 'jqxChart: invalid series type "' + sg.type + '"';
                    continue;
                }

                if (sg.type.indexOf('column') != -1)
                    this._renderColumnSeries(i, plotRect);
                else if (sg.type.indexOf('pie') != -1 || sg.type.indexOf('donut') != -1)
                    this._renderPieSeries(i, plotRect);
                else if (sg.type.indexOf('line') != -1 || sg.type.indexOf('area') != -1)
                    this._renderLineSeries(i, plotRect);
                else if (sg.type == 'scatter' || sg.type == 'bubble')
                    this._renderScatterSeries(i, plotRect);
            }

            this._startAnimation("series");

            this.renderer.endGroup();

            if (this.enabled == false) {
                var el = this.renderer.rect(rect.x, rect.y, rect.width, rect.height);
                this.renderer.attr(el, { fill: '#777777', opacity: 0.5, stroke: '#00FFFFFF' });
            }

            this.renderer.endGroup();
        },

        _isPieOnlySeries: function () {
            if (this.seriesGroups.length == 0)
                return false;

            for (var i = 0; i < this.seriesGroups.length; i++) {
                if (this.seriesGroups[i].type != 'pie' && this.seriesGroups[i].type != 'donut')
                    return false;
            }

            return true;
        },

        //[optimize]
        _renderChartLegend: function (data, rect, isMeasure, isVerticalFlow) {
            var r = { x: rect.x + 3, y: rect.y + 3, width: rect.width - 6, height: rect.height - 6 };

            var szMeasure = { width: r.width, height: 0 };

            var x = 0, y = 0;
            var rowH = 20;
            var rowW = 0;
            var barSize = 10;
            var space = 10;
            var maxWidth = 0;
            for (var i = 0; i < data.length; i++) {
                var css = data[i].css;
                if (!css)
                    css = this.toThemeProperty('jqx-chart-legend-text', null);

                var text = data[i].text;
                var sz = this.renderer.measureText(text, 0, { 'class': css });
                if (sz.height > rowH)
                    rowH = sz.height;

                if (sz.width > maxWidth)
                    maxWidth = sz.width;

                if (isVerticalFlow) {
                    if (i != 0)
                        y += rowH;

                    if (y > r.height) {
                        y = 0;
                        x += maxWidth + space;
                        maxWidth = sz.width;
                        szMeasure.width = x + maxWidth;
                    }
                }
                else {
                    if (x != 0)
                        x += space;

                    if (x + 2 * barSize + sz.width > r.width && sz.width < r.width) {
                        x = 0;
                        y += rowH;
                        rowH = 20;
                        rowW = r.width;
                        szMeasure.heigh = y + rowH;
                    }
                }

                if (!isMeasure) {
                    var color = data[i].color;
                    var elem = this.renderer.rect(r.x + x, r.y + y + barSize / 2, barSize, barSize);
                    this.renderer.attr(elem, { fill: color, stroke: color, 'stroke-width': 1 });
                    this.renderer.text(text, r.x + x + 1.5 * barSize, r.y + y, sz.width, rowH, 0, { 'class': css }, false, 'center', 'center');

                    /*
                    var g = this.seriesGroups[data[i].groupIndex];
                    var s = g.series[data[i].seriesIndex];

                    var enableSeriesToggle = s.enableSeriesToggle;
                    if (enableSeriesToggle == undefined)
                    enableSeriesToggle = g.enableSeriesToggle == true;

                    if (enableSeriesToggle && data[i].itemIndex == undefined) {
                    var self = this;
                    this.renderer.addHandler(elem, 'click', function (e) {
                    e.preventDefault();
                    });
                    }*/

                }

                if (isVerticalFlow) {
                }
                else {
                    x += sz.width + 2 * barSize;
                    if (rowW < x)
                        rowW = x;
                }

            }

            if (isMeasure) {
                szMeasure.height = $.jqx._ptrnd(y + rowH);
                szMeasure.width = $.jqx._ptrnd(rowW);
                return szMeasure;
            }
        },


        //[optimize]
        _renderLegend: function (rect, isMeasure) {
            var legendData = [];
            for (var gidx = 0; gidx < this.seriesGroups.length; gidx++) {
                var g = this.seriesGroups[gidx];
                if (g.showLegend == false)
                    continue;

                var categoryAxis = this._getCategoryAxis(gidx);
                var catfs = categoryAxis.toolTipFormatSettings || categoryAxis.formatSettings;
                var catff = categoryAxis.toolTipFormatFunction || categoryAxis.formatFunction;

                for (var sidx = 0; sidx < g.series.length; sidx++) {
                    var s = g.series[sidx];
                    if (s.showLegend == false)
                        continue;

                    if (g.type == 'pie' || g.type == 'donut') {
                        var colorScheme = s.colorScheme || g.colorScheme || this.colorScheme;
                        var dataLength = this._getDataLen(gidx);
                        for (var i = 0; i < dataLength; i++) {
                            var legendText = this._getDataValue(i, s.displayText, gidx);
                            legendText = this._formatValue(legendText, catfs, catff);

                            var color = this._getColor(colorScheme, sidx * dataLength + i, gidx, sidx);

                            legendData.push({ groupIndex: gidx, seriesIndex: sidx, itemIndex: i, text: legendText, css: s.displayTextClass, color: color });
                        }

                        continue;
                    }

                    var text = s.displayText || s.dataField || '';
                    var color = this._getSeriesColor(gidx, sidx);

                    legendData.push({ groupIndex: gidx, seriesIndex: sidx, text: text, css: s.displayTextClass, color: color });
                }
            }

            return this._renderChartLegend(legendData, rect, isMeasure, (this.legendLayout && this.legendLayout.flow == 'vertical'));
        },

        //[optimize]
        _renderCategoryAxis: function (groupIndex, rect, isMeasure, chartRect) {
            var axis = this._getCategoryAxis(groupIndex);
            var swapXY = this.seriesGroups[groupIndex].orientation == 'horizontal';
            var szMeasure = { width: 0, height: 0 };
            if (!axis || axis.visible == false)
                return szMeasure;

            var text = axis.text;

            var gridLinesSettings = { visible: (axis.showGridLines != false), color: (axis.gridLinesColor || '#888888'), unitInterval: (axis.gridLinesInterval || axis.unitInterval) };
            var tickMarksSettings = { visible: (axis.showTickMarks != false), color: (axis.tickMarksColor || '#888888'), unitInterval: (axis.tickMarksInterval || axis.unitInterval) };

            var textRotationAngle = axis.textRotationAngle || 0;

            var offsetR = rect;
            if (swapXY)
                offsetR = { x: rect.x, y: rect.y, width: rect.height, height: rect.width };
            var offsets = this._calculateXOffsets(groupIndex, offsetR);
            var ui = axis.unitInterval;
            if (isNaN(ui))
                ui = 1; // Math.max(1, Math.round(offsets.rangeLength / 10));

            var hTextAlign = axis.horizontalTextAlignment;
            var valuesOnTicks = this._alignValuesWithTicks(groupIndex);

            var widgetRect = this.renderer.getRect();
            var paddingRight = widgetRect.width - rect.x - rect.width;
            var len = this._getDataLen(groupIndex);

            var items = [];
            if (axis.type != 'date') {
                var isCustomRange = offsets.customRange != false;
                var step = ui;
                for (var i = offsets.min; i <= offsets.max; i += step) {
                    if (isCustomRange || axis.dataField == undefined || axis.dataField == '') {
                        value = i;
                    }
                    else {
                        var idx = Math.round(i);

                        value = this._getDataValue(idx, axis.dataField);
                    }

                    var text = this._formatValue(value, axis.formatSettings, axis.formatFunction);
                    if (text == undefined)
                        text = !isCustomRange ? value.toString() : (i).toString();

                    items.push(text);

                    if (i + step > offsets.max) {
                        step = offsets.max - i;
                        if (step <= ui / 2)
                            break;
                    }
                }
            }
            else {
                var arr = this._getDatesArray(offsets.min, offsets.max, axis.baseUnit, valuesOnTicks);
                for (var i = 0; i < arr.length; i += ui)
                    items.push(this._formatValue(arr[i], axis.formatSettings, axis.formatFunction));
            }

            if (axis.flip == true || this.rtl)
                items.reverse();

            var cssDesc = axis.descriptionClass;
            if (!cssDesc)
                cssDesc = this.toThemeProperty('jqx-chart-axis-description', null);

            var cssItems = axis['class'];
            if (!cssItems)
                cssItems = this.toThemeProperty('jqx-chart-axis-text', null);

            if (swapXY)
                textRotationAngle -= 90;

            var axisTextSettings = { text: axis.description, style: cssDesc, halign: axis.horizontalDescriptionAlignment || 'center', valign: axis.verticalDescriptionAlignment || 'center', textRotationAngle: swapXY ? -90 : 0 };
            var itemsTextSettings = { textRotationAngle: textRotationAngle, style: cssItems, halign: hTextAlign, valign: axis.verticalTextAlignment || 'center' };

            return this._renderAxis(swapXY, axisTextSettings, itemsTextSettings, { x: rect.x, y: rect.y, width: rect.width, height: rect.height }, chartRect, ui, false, valuesOnTicks, items, offsets, gridLinesSettings, tickMarksSettings, isMeasure);
        },

        _renderAxis: function (isVertical, axisTextSettings, textSettings, rect, chartRect, ui, isLogAxis, valuesOnTicks, items, offsets, gridLinesSettings, tickMarksSettings, isMeasure) {
            var tickMarkSize = tickMarksSettings.visible ? 4 : 0;
            var padding = 2;

            var szMeasure = { width: 0, height: 0 };
            var szMeasureDesc = { width: 0, height: 0 };

            if (isVertical)
                szMeasure.height = szMeasureDesc.height = rect.height;
            else
                szMeasure.width = szMeasureDesc.width = rect.width;

            if (axisTextSettings.text != undefined && axisTextSettings != '') {
                var textRotationAngle = axisTextSettings.textRotationAngle;
                var sz = this.renderer.measureText(axisTextSettings.text, textRotationAngle, { 'class': axisTextSettings.style });
                szMeasureDesc.width = sz.width;
                szMeasureDesc.height = sz.height;

                if (!isMeasure) {
                    this.renderer.text(
                        axisTextSettings.text,
                        rect.x + (isVertical ? (!this.rtl ? padding : 3 * padding + rect.width + szMeasureDesc.width + tickMarkSize) : 0),
                        rect.y + (!isVertical ? rect.height - padding - szMeasureDesc.height : 0),
                        isVertical ? szMeasureDesc.width : rect.width,
                        !isVertical ? szMeasureDesc.height : rect.height,
                        textRotationAngle,
                        { 'class': axisTextSettings.style },
                        true,
                        axisTextSettings.halign,
                        axisTextSettings.valign);
                }
            }

            var offset = 0;
            var textXAdjust = valuesOnTicks ? -offsets.itemWidth / 2 : 0;

            if (valuesOnTicks && !isVertical) {
                textSettings.halign = 'center';
            }

            var h = 0;
            var w = 0;
            var itemWidth = offsets.itemWidth;
            for (var i = 0; i < items.length; i++, offset += itemWidth) {
                var text = items[i];

                var textAngle = textSettings.textRotationAngle;

                var sz = this.renderer.measureText(text, textAngle, { 'class': textSettings.style });
                if (sz.width > w)
                    w = sz.width;
                if (sz.height > h)
                    h = sz.height;

                if (!isMeasure && (!sz || (!isVertical && offset + sz.width + textXAdjust < rect.x + rect.width) || (isVertical && offset + sz.height + textXAdjust < chartRect.y + chartRect.height))) {
                    var x = rect.x + offset + textXAdjust;
                    var y = rect.y + (valuesOnTicks ? tickMarkSize : tickMarkSize / 4);
                    if (isVertical) {
                        x = rect.x + padding + (szMeasureDesc.width > 0 ? (szMeasureDesc.width + padding) : 0) + (this.rtl ? rect.width - szMeasureDesc.width : 0);
                        y = rect.y + offset + textXAdjust;
                    }

                    if (!isLogAxis || (isLogAxis && (i % ui) == 0)) {

                        this.renderer.text(
                        text,
                        x,
                        y,
                        !isVertical ? itemWidth : rect.width - 2 * padding - tickMarkSize - ((szMeasureDesc.width > 0) ? szMeasureDesc.width + padding : 0),
                        isVertical ? itemWidth : rect.height - 2 * padding - tickMarkSize - ((szMeasureDesc.height > 0) ? szMeasureDesc.height + padding : 0),
                        textAngle,
                        { 'class': textSettings.style },
                        true,
                        textSettings.halign,
                        textSettings.valign);
                    }
                }
            }

            szMeasure.width += 2 * padding + tickMarkSize + szMeasureDesc.width + w + (isVertical && szMeasureDesc.width > 0 ? padding : 0);
            szMeasure.height += 2 * padding + tickMarkSize + szMeasureDesc.height + h + (!isVertical && szMeasureDesc.height > 0 ? padding : 0);

            var gridLinePts = {};

            if (!isMeasure) {
                var y = $.jqx._ptrnd(rect.y);
                if (isVertical)
                    this.renderer.line($.jqx._ptrnd(rect.x + rect.width), rect.y, $.jqx._ptrnd(rect.x + rect.width), rect.y + rect.height, { stroke: gridLinesSettings.color, 'stroke-width': 1 });
                else
                    this.renderer.line($.jqx._ptrnd(rect.x), y, $.jqx._ptrnd(rect.x + rect.width + 1), y, { stroke: gridLinesSettings.color, 'stroke-width': 1 });
            }

            // render vertical grid lines
            if (!isMeasure && gridLinesSettings.visible != false) {
                var gridLinesInterval = gridLinesSettings.unitInterval;
                if (isNaN(gridLinesInterval) || gridLinesInterval <= 0)
                    gridLinesInterval = ui;

                var len = isLogAxis ? items.length : offsets.rangeLength;
                var step = isLogAxis ? 1 : gridLinesInterval;
                var offsetStep = isLogAxis ? itemWidth : (isVertical ? rect.height : rect.width) / offsets.rangeLength;
                var i = 0;
                while (i <= len) {
                    if (isLogAxis && (i % gridLinesInterval) != 0) {
                        i += step;
                        continue;
                    }

                    var lineOffset = 0;

                    if (isVertical) {
                        lineOffset = $.jqx._ptrnd(rect.y + i * offsetStep);
                        if (lineOffset > rect.y + rect.height)
                            break;
                    }
                    else {
                        lineOffset = $.jqx._ptrnd(rect.x + i * offsetStep);
                        if (lineOffset > rect.x + rect.width)
                            break;
                    }

                    if (isVertical)
                        this.renderer.line($.jqx._ptrnd(chartRect.x), lineOffset, $.jqx._ptrnd(chartRect.x + chartRect.width), lineOffset, { stroke: gridLinesSettings.color, 'stroke-width': 1.0 });
                    else
                        this.renderer.line(lineOffset, $.jqx._ptrnd(chartRect.y), lineOffset, $.jqx._ptrnd(chartRect.y + chartRect.height), { stroke: gridLinesSettings.color, 'stroke-width': 1.0 });

                    gridLinePts[lineOffset] = true;

                    i += step;
                    if (i > len && i != len + step)
                        i = len;
                }
            }

            // render category axis tick marks
            if (!isMeasure && tickMarksSettings.visible) {
                var tickMarksInterval = tickMarksSettings.unitInterval;
                if (isNaN(tickMarksInterval) || tickMarksInterval <= 0)
                    tickMarksInterval = ui;

                var len = isLogAxis ? items.length : offsets.rangeLength + tickMarksInterval;
                var step = isLogAxis ? 1 : tickMarksInterval;
                var offsetStep = isLogAxis ? itemWidth : (isVertical ? rect.height : rect.width) / offsets.rangeLength;

                for (var i = 0; i <= len; i += step) {
                    if (isLogAxis && (i % tickMarksInterval / ui) != 0)
                        continue;

                    var lineOffset = $.jqx._ptrnd((isVertical ? rect.y : rect.x) + i * offsetStep);

                    if (gridLinePts[lineOffset - 1])
                        lineOffset--;
                    else if (gridLinePts[lineOffset + 1])
                        lineOffset++;

                    if (isVertical) {
                        if (lineOffset > rect.y + rect.height)
                            break;
                    }
                    else {
                        if (lineOffset > rect.x + rect.width)
                            break;
                    }

                    if (isVertical) {
                        var tickSize = !this.rtl ? -tickMarkSize : tickMarkSize;
                        this.renderer.line(rect.x + rect.width, lineOffset, rect.x + rect.width + tickSize, lineOffset, { stroke: gridLinesSettings.color, 'stroke-width': 1.0 });
                    }
                    else
                        this.renderer.line(lineOffset, rect.y, lineOffset, rect.y + tickMarkSize, { stroke: gridLinesSettings.color, 'stroke-width': 1.0 });
                }
            }

            szMeasure.width = $.jqx._rup(szMeasure.width);
            szMeasure.height = $.jqx._rup(szMeasure.height);

            return szMeasure;
        },

        //[optimize]
        _renderValueAxis: function (groupIndex, rect, isMeasure, chartRect) {
            var g = this.seriesGroups[groupIndex];
            var swapXY = g.orientation == 'horizontal';
            var axis = g.valueAxis;
            if (!axis)
                throw 'SeriesGroup ' + groupIndex + ' is missing valueAxis definition';

            var szMeasure = { width: 0, height: 0 };

            if (this._isPieOnlySeries()) {
                if (isMeasure)
                    return szMeasure;

                return;
            }

            var gstat = this._stats.seriesGroups[groupIndex];
            if (!gstat || !gstat.isValid || false == axis.displayValueAxis || false == axis.visible) {
                if (isMeasure)
                    return szMeasure;
                return;
            }

            var cssDesc = axis.descriptionClass;
            if (!cssDesc)
                cssDesc = this.toThemeProperty('jqx-chart-axis-description', null);

            var axisTextSettings = {
                text: axis.description,
                style: cssDesc,
                halign: axis.horizontalDescriptionAlignment || 'center',
                valign: axis.verticalDescriptionAlignment || 'center',
                textRotationAngle: swapXY ? 0 : (!this.rtl ? -90 : 90)
            };

            var cssItems = axis.itemsClass;
            if (!cssItems)
                cssItems = this.toThemeProperty('jqx-chart-axis-text', null);

            var itemsTextSettings =
            {
                style: cssItems,
                halign: axis.horizontalTextAlignment || 'center',
                valign: axis.verticalTextAlignment || 'center',
                textRotationAngle: axis.textRotationAngle || 0
            };

            var valuesOnTicks = axis.valuesOnTicks != false;

            var field = axis.dataField;
            var ints = gstat.intervals;

            var min = gstat.min;
            var mu = gstat.mu;

            var format = axis.formatSettings;
            var isStacked100 = g.type.indexOf("stacked") != -1 && g.type.indexOf("100") != -1;
            if (isStacked100 && !format)
                format = { sufix: '%' };

            if (!valuesOnTicks) {
                ints = Math.max(ints - 1, 1);
            }

            var logAxis = axis.logarithmicScale == true;
            var logBase = axis.logarithmicScaleBase || 10;

            if (logAxis) {
                mu = !isNaN(axis.unitInterval) ? axis.unitInterval : 1;
            }

            var unitH = (swapXY ? rect.width : rect.height) / ints;
            var yOffset = rect.y + rect.height - unitH;

            var items = [];
            var offsets = {};
            offsets.data = [];
            offsets.itemWidth = unitH;

            for (var i = 0; i <= ints; i++) {
                var value = 0;
                if (logAxis) {
                    if (isStacked100)
                        value = gstat.max / Math.pow(logBase, ints - i);
                    else
                        value = min * Math.pow(logBase, i);
                }
                else {
                    value = valuesOnTicks ? min + i * mu : min + (i + 0.5) * mu;
                }

                var text = (axis.formatFunction) ? axis.formatFunction(value) : this._formatNumber(value, format);

                items.push(text);
                offsets.data.push(yOffset + unitH / 2);

                yOffset -= unitH;
            }

            offsets.rangeLength = logAxis && !isStacked100 ? gstat.intervals : (gstat.intervals) * mu;

            if (g.valueAxis.flip != true) {
                offsets.data = offsets.data.reverse();
                items = items.reverse();
            }

            var gridLinesInterval = axis.gridLinesInterval || axis.unitInterval;
            if (isNaN(gridLinesInterval) || (logAxis && gridLinesInterval < mu))
                gridLinesInterval = mu;

            var gridLinesSettings = { visible: (axis.showGridLines != false), color: (axis.gridLinesColor || '#888888'), unitInterval: gridLinesInterval };

            var tickMarksInterval = axis.tickMarksInterval || axis.unitInterval;
            if (isNaN(tickMarksInterval) || (logAxis && tickMarksInterval < mu))
                tickMarksInterval = mu;

            var tickMarksSettings = { visible: (axis.showTickMarks != false), color: (axis.tickMarksColor || '#888888'), unitInterval: tickMarksInterval };

            if (this.rtl) {
                rect.x = chartRect.width + rect.x;
            }

            return this._renderAxis(!swapXY, axisTextSettings, itemsTextSettings, rect, chartRect, mu, logAxis, valuesOnTicks, items, offsets, gridLinesSettings, tickMarksSettings, isMeasure);
        },

        //[optimize]
        _buildStats: function () {
            var stat = { seriesGroups: new Array() };
            this._stats = stat;

            for (var g = 0; g < this.seriesGroups.length; g++) {
                var group = this.seriesGroups[g];
                stat.seriesGroups[g] = {};
                var grst = stat.seriesGroups[g];
                grst.isValid = true;

                var hasValueAxis = group.valueAxis != undefined;

                var logAxis = false;
                var logBase = 10;

                if (hasValueAxis) {
                    logAxis = group.valueAxis.logarithmicScale == true;
                    logBase = group.valueAxis.logarithmicScaleBase;
                    if (isNaN(logBase))
                        logBase = 10;
                }

                var isStacked = -1 != group.type.indexOf("stacked");
                var isStacked100 = isStacked && -1 != group.type.indexOf("100");

                if (isStacked100) {
                    grst.psums = new Array();
                    grst.nsums = new Array();
                }

                var gmin = NaN, gmax = NaN;
                var gsumP = NaN, gsumN = NaN;
                var gbase = group.baselineValue;
                if (isNaN(gbase))
                    gbase = logAxis && !isStacked100 ? 1 : 0;

                var len = this._getDataLen(g);
                var gMaxRange = 0;
                var minPercent = NaN;
                for (var i = 0; i < len && grst.isValid; i++) {
                    var min = hasValueAxis ? group.valueAxis.minValue : Infinity;
                    var max = hasValueAxis ? group.valueAxis.maxValue : -Infinity;
                    var sumP = 0, sumN = 0;

                    for (var s = 0; s < group.series.length; s++) {
                        var val = this._getDataValueAsNumber(i, group.series[s].dataField, g);
                        if (isNaN(val) || (logAxis && val <= 0))
                            continue;

                        if ((isNaN(max) || val > max) && ((!hasValueAxis || isNaN(group.valueAxis.maxValue)) ? true : val <= group.valueAxis.maxValue))
                            max = val;
                        if ((isNaN(min) || val < min) && ((!hasValueAxis || isNaN(group.valueAxis.minValue)) ? true : val >= group.valueAxis.minValue))
                            min = val;

                        if (val > gbase)
                            sumP += val;
                        else if (val < gbase)
                            sumN += val;
                    }

                    if (logAxis && isStacked100) {
                        for (var s = 0; s < group.series.length; s++) {
                            var val = this._getDataValueAsNumber(i, group.series[s].dataField, g);
                            if (isNaN(val) || val <= 0)
                                continue;

                            var p = sumP == 0 ? 0 : val / sumP;
                            if (isNaN(minPercent) || p < minPercent)
                                minPercent = p;
                        }
                    }

                    var range = sumP - sumN;
                    if (gMaxRange < range)
                        gMaxRange = range;

                    if (isStacked100) {
                        grst.psums[i] = sumP;
                        grst.nsums[i] = sumN;
                    }

                    if (max > gmax || isNaN(gmax))
                        gmax = max;
                    if (min < gmin || isNaN(gmin))
                        gmin = min;

                    if (sumP > gsumP || isNaN(gsumP))
                        gsumP = sumP;
                    if (sumN < gsumN || isNaN(gsumN))
                        gsumN = sumN;
                }

                if (isStacked100) {
                    gsumP = gsumP == 0 ? 0 : Math.max(gsumP, -gsumN);
                    gsumN = gsumN == 0 ? 0 : Math.min(gsumN, -gsumP);
                }

                var mu = hasValueAxis ? group.valueAxis.unitInterval : 0;
                if (!mu) {
                    mu = isStacked ? (gsumP - gsumN) / 10 : (gmax - gmin) / 10;
                }

                var intervals = NaN;

                ///
                // log axis scale
                var minPow = 0;
                var maxPow = 0;
                if (logAxis) {
                    if (isStacked100) {
                        intervals = 0;
                        var p = 1;
                        minPow = maxPow = $.jqx.log(100, logBase);

                        while (p > minPercent) {
                            p /= logBase;
                            minPow--;
                            intervals++;
                        }
                        gmin = Math.pow(logBase, minPow);

                    }
                    else {
                        if (isStacked)
                            gmax = Math.max(gmax, gsumP);

                        maxPow = $.jqx._rnd($.jqx.log(gmax, logBase), 1, true);
                        gmax = Math.pow(logBase, maxPow);

                        minPow = $.jqx._rnd($.jqx.log(gmin, logBase), 1, false);
                        gmin = Math.pow(logBase, minPow);
                    }

                    mu = logBase;
                }
                ////

                var tickMarksInterval = hasValueAxis ? group.valueAxis.tickMarksInterval || mu : 0;
                var gridLinesInterval = hasValueAxis ? group.valueAxis.gridLinesInterval || mu : 0;

                if (gmin < gsumN)
                    gsumN = gmin;
                if (gmax > gsumP)
                    gsumP = gmax;

                var mn = logAxis ? gmin : $.jqx._rnd(isStacked ? gsumN : gmin, mu, false);
                var mx = logAxis ? gmax : $.jqx._rnd(isStacked ? gsumP : gmax, mu, true);
                if (isStacked100 && mx > 100)
                    mx = 100;

                if (isStacked100 && !logAxis) {
                    mx = (mx > 0) ? 100 : 0;
                    mn = (mn < 0) ? -100 : 0;
                    mu = hasValueAxis ? group.valueAxis.unitInterval : 10;
                    if (isNaN(mu) || mu <= 0 || mu >= 100)
                        mu = 10;
                    if (tickMarksInterval <= 0 || tickMarksInterval >= 100)
                        tickMarksInterval = 10;
                    if (gridLinesInterval <= 0 || gridLinesInterval >= 100)
                        gridLinesInterval = 10;
                }

                if (isNaN(mx) || isNaN(mn) || isNaN(mu))
                    continue;

                if (isNaN(intervals))
                    intervals = (mx - mn) / (mu == 0 ? 1 : mu);

                if (logAxis && !isStacked100) {
                    intervals = maxPow - minPow;
                    gMaxRange = Math.pow(logBase, intervals);
                }

                if (intervals < 1)
                    continue;

                var diff = mx - mn;
                grst.rmax = isStacked ? gsumP : gmax;
                grst.rmin = isStacked ? gsumN : gmin;
                grst.min = mn;
                grst.max = mx;
                grst.minPow = minPow;
                grst.maxPow = maxPow;
                grst.mu = mu;
                grst.maxRange = gMaxRange;
                grst.intervals = intervals;
                grst.tickMarksInterval = tickMarksInterval;
                grst.tickMarksIntervals = tickMarksInterval == 0 ? 0 : diff / tickMarksInterval;
                grst.gridLinesInterval = gridLinesInterval;
                grst.gridLinesIntervals = gridLinesInterval == 0 ? 0 : diff / gridLinesInterval;
                if (diff == 0)
                    diff = 1;
                grst.scale = isStacked ? (gsumP - gsumN) / diff : (gmax - gmin) / diff;
            }
        },

        //[optimize]
        _getDataLen: function (groupIndex) {
            var ds = this.source;
            if (groupIndex != undefined && groupIndex != -1 && this.seriesGroups[groupIndex].source)
                ds = this.seriesGroups[groupIndex].source;

            if (ds instanceof $.jqx.dataAdapter)
                ds = ds.records;

            if (ds)
                return ds.length;

            return 0;
        },

        //[optimize]
        _getDataValue: function (index, dataField, groupIndex) {
            var ds = this.source;
            if (groupIndex != undefined && groupIndex != -1)
                ds = this.seriesGroups[groupIndex].source || ds;

            if (ds instanceof $.jqx.dataAdapter)
                ds = ds.records;

            if (!ds || index < 0 || index > ds.length - 1)
                return NaN;

            return (dataField && dataField != '') ? ds[index][dataField] : ds[index];
        },

        //[optimize]
        _getDataValueAsNumber: function (index, dataField, groupIndex) {
            var val = this._getDataValue(index, dataField, groupIndex);
            if (this._isDate(val))
                return val.valueOf();

            if (typeof (val) != 'number')
                val = parseFloat(val);
            if (typeof (val) != 'number')
                val = undefined;
            return val;
        },

        //[optimize]
        _renderPieSeries: function (groupIndex, rect) {
            var dataLength = this._getDataLen(groupIndex);
            var group = this.seriesGroups[groupIndex];

            while (this._renderData.length < groupIndex + 1)
                this._renderData.push(null);

            this._renderData[groupIndex] = [];

            for (var sidx = 0; sidx < group.series.length; sidx++) {
                var s = group.series[sidx]
                var colorScheme = s.colorScheme || group.colorScheme || this.colorScheme;
                var initialAngle = s.initialAngle || 0;
                var currentAngle = initialAngle;
                var radius = s.radius || Math.min(rect.width, rect.height) * 0.4;
                if (isNaN(radius))
                    radius = 1;

                var innerRadius = s.innerRadius || 0;
                if (isNaN(innerRadius) || innerRadius >= radius)
                    innerRadius = 0;

                var centerOffset = s.centerOffset || 0;
                var offsetX = $.jqx.getNum([s.offsetX, group.offsetX, rect.width / 2]);
                var offsetY = $.jqx.getNum([s.offsetY, group.offsetY, rect.height / 2]);

                var anim = this._getAnimProps(groupIndex, sidx);
                var duration = anim.enabled && dataLength < 5000 && this._isVML != true ? anim.duration : 0;
                if ($.jqx.mobile.isMobileBrowser() && (this.renderer instanceof $.jqx.HTML5Renderer))
                    duration = 0;

                this._renderData[groupIndex].push([]);

                // compute the sum
                var sumP = 0;
                var sumN = 0;
                for (var i = 0; i < dataLength; i++) {
                    var val = this._getDataValueAsNumber(i, s.dataField, groupIndex);
                    if (typeof (val) != 'number')
                        continue;
                    if (val > 0)
                        sumP += val;
                    else
                        sumN += val;
                }

                var range = sumP - sumN;
                if (range == 0)
                    range = 1;

                // render
                for (var i = 0; i < dataLength; i++) {
                    var val = this._getDataValueAsNumber(i, s.dataField, groupIndex);
                    if (typeof (val) != 'number')
                        continue;

                    var angle = Math.round(Math.abs(val) / range * 360.0);
                    if (i + 1 == dataLength)
                        angle = 360 + initialAngle - currentAngle;

                    var x = rect.x + offsetX;
                    var y = rect.y + offsetY;

                    var sliceRenderData = { x1: x, y1: y, innerRadius: innerRadius, outerRadius: radius, key: groupIndex + '_' + sidx + '_' + i };
                    this._renderData[groupIndex][sidx].push(sliceRenderData);


                    var pieSliceElement = this.renderer.pieslice(x, y, innerRadius, radius, currentAngle, duration == 0 ? currentAngle + angle : currentAngle, centerOffset);

                    var centerOffsetValue = centerOffset;
                    if ($.isFunction(centerOffset)) {
                        centerOffsetValue = centerOffset({ seriesIndex: sidx, seriesGroupIndex: groupIndex, itemIndex: i });
                    }
                    if (isNaN(centerOffsetValue))
                        centerOffsetValue = 0;

                    var ctx = { x: x, y: y, innerRadius: innerRadius, outerRadius: radius, fromAngle: currentAngle, toAngle: currentAngle + angle, centerOffset: centerOffsetValue };
                    var self = this;
                    this._enqueueAnimation(
                        "series",
                        pieSliceElement,
                        undefined,
                        duration,
                        function (element, ctx, percent) {
                            var toAngle = ctx.fromAngle + percent * (ctx.toAngle - ctx.fromAngle);
                            var cmd = self.renderer.pieSlicePath(ctx.x, ctx.y, ctx.innerRadius, ctx.outerRadius, ctx.fromAngle, toAngle, ctx.centerOffset);
                            self.renderer.attr(element, { 'd': cmd });
                        },
                        ctx);

                    var colors = this._getColors(groupIndex, sidx, i, 'radialGradient', radius);

                    this.renderer.attr(pieSliceElement, { fill: colors.fillColor, stroke: colors.lineColor, 'stroke-width': 1 });

                    ///////////////////////////////
                    // render label
                    var angleFrom = currentAngle, angleTo = currentAngle + angle;
                    var diff = Math.abs(angleFrom - angleTo);
                    var lFlag = diff > 180 ? 1 : 0;
                    if (diff > 360) {
                        angleFrom = 0;
                        angleTo = 360;
                    }

                    var radFrom = angleFrom * Math.PI * 2 / 360;
                    var radTo = angleTo * Math.PI * 2 / 360;
                    var midAngle = diff / 2 + angleFrom;
                    var radMid = midAngle * Math.PI * 2 / 360;

                    // measure
                    var sz = this._showLabel(groupIndex, sidx, i, { x: 0, y: 0, width: 0, height: 0 }, 'left', 'top', true);
                    var labelRadius = s.labelRadius || radius + Math.max(sz.width, sz.height);
                    labelRadius += centerOffset;
                    var x = $.jqx._ptrnd(rect.x + offsetX + labelRadius * Math.cos(radMid) - sz.width / 2);
                    var y = $.jqx._ptrnd(rect.y + offsetY - labelRadius * Math.sin(radMid) - sz.height / 2);

                    // render
                    this._showLabel(groupIndex, sidx, i, { x: x, y: y, width: sz.width, height: sz.height }, 'left', 'top');
                    /////////////////////////////////

                    // Install mouse event handlers
                    this._installHandlers(pieSliceElement, groupIndex, sidx, i);

                    currentAngle += angle;
                }
            }
        },

        //[optimize]
        _renderColumnSeries: function (groupIndex, rect) {
            var group = this.seriesGroups[groupIndex];
            if (!group.series || group.series.length == 0)
                return;

            var isStacked = group.type.indexOf('stacked') != -1;
            var isStacked100 = isStacked && group.type.indexOf('100') != -1;

            var dataLength = this._getDataLen(groupIndex);

            var columnGap = group.columnsGapPercent;
            if (isNaN(columnGap) || columnGap < 0 || columnGap > 100)
                columnGap = 25;

            var seriesGap = group.seriesGapPercent;
            if (isNaN(seriesGap) || seriesGap < 0 || seriesGap > 100)
                seriesGap = 10;

            var inverse = group.orientation == 'horizontal';

            var gRect = rect;
            if (inverse)
                gRect = { x: rect.y, y: rect.x, width: rect.height, height: rect.width };

            var renderData = this._calcGroupOffsets(groupIndex, gRect);
            if (!renderData || renderData.xoffsets.length == 0)
                return;

            for (var sidx = 0; sidx < group.series.length; sidx++) {
                var s = group.series[sidx];
                var dataField = s.dataField;

                var anim = this._getAnimProps(groupIndex, sidx);
                var duration = anim.enabled && renderData.xoffsets.length < 100 ? anim.duration : 0;

                var valuesOnTicks = this._alignValuesWithTicks(groupIndex);

                var columnElements = [];
                for (var i = renderData.xoffsets.first; i <= renderData.xoffsets.last; i++) {
                    var val = this._getDataValueAsNumber(i, dataField, groupIndex);
                    if (typeof (val) != 'number')
                        continue;

                    var x1 = renderData.xoffsets.data[i];
                    if (valuesOnTicks)
                        x1 -= renderData.xoffsets.itemWidth / 2;

                    var x2 = x1 + renderData.xoffsets.itemWidth;
                    var wGroup = (x2 - x1 + 1);
                    var wGroupRender = (x2 - x1 + 1) / (1 + columnGap / 100);
                    var seriesSpace = (!isStacked && group.series.length > 1) ? (wGroupRender * seriesGap / 100) / (group.series.length - 1) : 0;
                    var wColumn = (wGroupRender - seriesSpace * (group.series.length - 1));
                    if (wGroupRender < 1)
                        wGroupRender = 1;

                    var col = 0;
                    if (!isStacked && group.series.length > 1) {
                        wColumn /= group.series.length;
                        col = sidx;
                    }

                    var x = x1 + (wGroup - wGroupRender) / 2 + col * (seriesSpace + wColumn);
                    if (col == group.series.length)
                        wColumn = wGroup - x1 + wGroupRender - x;

                    var to = renderData.offsets[sidx][i].to;
                    var from = renderData.offsets[sidx][i].from;
                    var base = renderData.baseOffset;
                    var h = from - to;

                    var elRect = { x: rect.x + x, y: Math.min(to, from), width: wColumn, height: Math.abs(h) };
                    if (inverse) {
                        elRect = { height: wColumn, y: rect.y + x };
                        elRect.x = from;
                        elRect.width = Math.abs(h);
                        if (h > 0)
                            elRect.x -= h;
                    }

                    columnElements.push({ itemIndex: i, rect: elRect, size: h, vertical: !inverse });
                }

                var ctx = { groupIndex: groupIndex, seriesIndex: sidx, items: columnElements };
                this._animateColumns(ctx, duration == 0 ? 1 : 0);
                var self = this;
                this._enqueueAnimation(
                        "series",
                        undefined,
                        undefined,
                        duration,
                        function (element, ctx, percent) {
                            self._animateColumns(ctx, percent);
                        },
                        ctx);
            }
        },

        _calcStackedItemSize: function (gidx, sidx, iidx, percent) {
            var data = this._renderData[gidx];
            var sum = 0, nsum = 0;
            for (var si = 0; si < data.offsets.length; si++) {
                var d = Math.abs(data.offsets[si][iidx].to - data.offsets[si][iidx].from);
                if (data.offsets[si][iidx].to < data.baseOffset)
                    sum += d;
                else
                    nsum += d;
            }

            var nstop = nsum * percent;
            var stop = sum * percent;
            sum = 0;
            nsum = 0;
            var sz = 0;
            for (var si = 0; si <= sidx; si++) {
                sz = Math.abs(data.offsets[si][iidx].to - data.offsets[si][iidx].from);
                if (data.offsets[si][iidx].to < data.baseOffset)
                    sum += sz;
                else
                    nsum += sz;
            }

            var diff = Math.abs(data.offsets[sidx][iidx].to - data.offsets[sidx][iidx].from);
            if (data.offsets[sidx][iidx].to >= data.baseOffset) {
                sum = nsum;
                stop = nstop;
            }

            if (stop < sum - diff)
                return 0;
            if (stop >= sum)
                return diff;

            return stop - (sum - diff);
        },

        _animateColumns: function (context, percent) {
            var gidx = context.groupIndex;
            var sidx = context.seriesIndex;

            var group = this.seriesGroups[gidx];
            var s = group.series[sidx];

            var colors = this._getColors(gidx, sidx, undefined, this._getGroupGradientType(gidx));

            var opacity = s.opacity || group.opacity;
            if (!opacity || opacity < 0 || opacity > 1)
                opacity = 1;

            var isStacked = group.type.indexOf('stacked') != -1;
            var items = context.items;
            for (var i = 0; i < items.length; i++) {
                var rect = items[i].rect;
                var size = $.jqx._ptrnd(items[i].size * percent);

                if (isStacked) {
                    size = this._calcStackedItemSize(gidx, sidx, i, percent);
                    if (size == 0)
                        continue;
                    if (items[i].size < 0)
                        size *= -1;
                }

                if (items[i].element == undefined) {
                    items[i].element = this.renderer.rect(rect.x, rect.y, items[i].vertical ? rect.width : 0, items[i].vertical ? 0 : rect.height);
                    this.renderer.attr(items[i].element, { fill: colors.fillColor, 'fill-opacity': opacity, stroke: colors.lineColor, 'stroke-width': 1 });
                }

                size = Math.abs(size);

                if (items[i].vertical == true) {
                    if (items[i].size < 0)
                        this.renderer.attr(items[i].element, { height: size });
                    else
                        this.renderer.attr(items[i].element, { y: rect.y + rect.height - size, height: size });
                }
                else {
                    if (items[i].size < 0)
                        this.renderer.attr(items[i].element, { width: size });
                    else
                        this.renderer.attr(items[i].element, { x: rect.x + rect.width - size, width: size });

                }

                if (percent == 1.0) {
                    this._installHandlers(items[i].element, gidx, sidx, i);
                    this._showLabel(gidx, sidx, i, rect);
                }
            }
        },

        //[optimize]
        _renderScatterSeries: function (groupIndex, rect) {
            var group = this.seriesGroups[groupIndex];
            if (!group.series || group.series.length == 0)
                return;

            var isBubble = group.type == 'bubble';

            var inverse = group.orientation == 'horizontal';

            var gRect = rect;
            if (inverse)
                gRect = { x: rect.y, y: rect.x, width: rect.height, height: rect.width };

            var renderData = this._calcGroupOffsets(groupIndex, gRect);

            if (!renderData || renderData.xoffsets.length == 0)
                return;

            var valuesOnTicks = this._alignValuesWithTicks(groupIndex);

            for (var sidx = 0; sidx < group.series.length; sidx++) {
                var colors = this._getColors(groupIndex, sidx, undefined, this._getGroupGradientType(groupIndex));
                var s = group.series[sidx];
                var dataField = s.dataField;

                var opacity = s.opacity || group.opacity;
                if (!opacity || opacity < 0 || opacity > 1)
                    opacity = 1;

                var min = NaN, max = NaN;
                if (isBubble) {
                    for (var i = renderData.xoffsets.first; i <= renderData.xoffsets.last; i++) {
                        var val = this._getDataValueAsNumber(i, s.radiusDataField, groupIndex);
                        if (typeof (val) != 'number')
                            throw 'Invalid radiusDataField value at [' + i + ']';

                        if (isNaN(min) || val < min)
                            min = val;
                        if (isNaN(max) || val > max)
                            max = val;
                    }
                }

                var minRadius = s.minRadius;
                if (isNaN(minRadius))
                    minRadius = rect.width / 50;

                var maxRadius = s.maxRadius;
                if (isNaN(maxRadius))
                    maxRadius = rect.width / 25;

                if (minRadius > maxRadius)
                    throw 'Invalid settings: minRadius must be less than or equal to maxRadius';

                var radius = s.radius || 5;

                var anim = this._getAnimProps(groupIndex, sidx);
                var duration = anim.enabled && renderData.xoffsets.length < 5000 ? anim.duration : 0;

                for (var i = renderData.xoffsets.first; i <= renderData.xoffsets.last; i++) {
                    var val = this._getDataValueAsNumber(i, dataField, groupIndex);
                    if (typeof (val) != 'number')
                        continue;

                    var x = renderData.xoffsets.data[i];
                    var y = renderData.offsets[sidx][i].to;

                    if (isNaN(x) || isNaN(y))
                        continue;

                    if (inverse) {
                        var tmp = x;
                        x = y;
                        y = tmp + rect.y;
                    }
                    else {
                        x += rect.x;
                    }

                    x = $.jqx._ptrnd(x);
                    y = $.jqx._ptrnd(y);


                    var r = radius;
                    if (isBubble) {
                        var rval = this._getDataValueAsNumber(i, s.radiusDataField, groupIndex);
                        if (typeof (rval) != 'number')
                            continue;
                        r = minRadius + (maxRadius - minRadius) * (rval - min) / Math.max(1, max - min);
                        if (isNaN(r))
                            r = minRadius;
                    }

                    var elem = this.renderer.circle(x, y, duration == 0 ? r : 0);
                    this.renderer.attr(elem, { fill: colors.fillColor, 'fill-opacity': opacity, stroke: colors.lineColor, 'stroke-width': 1 });

                    var ctx = { from: 0, to: r, groupIndex: groupIndex, seriesIndex: sidx, itemIndex: i, x: x, y: y };
                    var self = this;

                    this._enqueueAnimation("series", elem, undefined, duration,
                        function (element, context, percent) {
                            self._animR(element, context, percent);
                            if (percent >= 1) {
                                var r = isBubble ? context.to : 0;
                                self._showLabel(context.groupIndex, context.seriesIndex, context.itemIndex, { x: context.x - r, y: context.y - r, width: 2 * r, height: 2 * r });
                            }
                        }, ctx);

                    this._installHandlers(elem, groupIndex, sidx, i);

                }
            }
        },

        _animR: function (element, context, percent) {
            var r = Math.round((context.to - context.from) * percent + context.from);
            if (this._isVML) {
                this.renderer.updateCircle(element, undefined, undefined, r);
            }
            else {
                this.renderer.attr(element, { r: r });
            }
        },

        //[optimize]
        _showToolTip: function (x, y, gidx, sidx, iidx) {
            if (this.showToolTips == false)
                return;

            var categoryAxis = this._getCategoryAxis(gidx);

            if (this._toolTipElement &&
                gidx == this._toolTipElement.gidx &&
                sidx == this._toolTipElement.sidx &&
                iidx == this._toolTipElement.iidx)
                return;

            if (this._pointMarker) {
                // make it relative to the marker instead of cursor
                x = parseInt(this._pointMarker.x + 5);
                y = parseInt(this._pointMarker.y - 5);
            }

            var group = this.seriesGroups[gidx];
            var series = group.series[sidx];

            var valfs = series.toolTipFormatSettings || group.toolTipFormatSettings;
            var valff = series.toolTipFormatFunction || group.toolTipFormatFunction;

            var colors = this._getColors(gidx, sidx, iidx);
            var text = this._getFormattedValue(gidx, sidx, iidx, valfs, valff);
            var catvalue = this._getDataValue(iidx, categoryAxis.dataField, gidx);
            if (categoryAxis.dataField == undefined || categoryAxis.dataField == '')
                catvalue = iidx;

            var catfs = categoryAxis.toolTipFormatSettings || categoryAxis.formatSettings;
            var catff = categoryAxis.toolTipFormatFunction || categoryAxis.formatFunction;
            if (categoryAxis.type == 'date')
                catvalue = this._castAsDate(catvalue);
            var categoryText = this._formatValue(catvalue, catfs, catff);

            if (group.type != 'pie' && group.type != 'donut')
                text = (series.displayText || series.dataField || '') + ', ' + categoryText + ': ' + text;
            else {
                catvalue = this._getDataValue(iidx, series.displayText || series.dataField, gidx);
                categoryText = this._formatValue(catvalue, catfs, catff);
                text = categoryText + ': ' + text;
            }

            var cssToolTip = series.toolTipClass || group.toolTipClass || this.toThemeProperty('jqx-chart-tooltip-text', null);
            var toolTipFill = series.toolTipBackground || group.toolTipBackground || '#FFFFFF';
            var toolTipStroke = series.toolTipLineColor || group.toolTipLineColor || colors.lineColor;
            var sz = this.renderer.measureText(text, 0, { 'class': cssToolTip });
            var szTxt = { width: sz.width, height: sz.height };
            sz.width = sz.width + 5;
            sz.height = sz.height + 6;

            rect = this.renderer.getRect();

            x = Math.max(x - 5, rect.x);
            y = Math.max(y - sz.height, rect.y);

            if (sz.width > rect.width || sz.height > rect.height)
                return;

            if (x + sz.width > rect.x + rect.width)
                x = rect.x + rect.width - sz.width - 2;

            if (y + sz.height > rect.y + rect.height)
                y = rect.y + rect.height - sz.height - 2;

            x = $.jqx._ptrnd(x);
            y = $.jqx._ptrnd(y);

            var isNew = this._toolTipElement == undefined;
            var box = isNew ? this.renderer.rect(x, y, sz.width, sz.height) : this._toolTipElement.box;
            this.renderer.attr(box, { fill: toolTipFill, 'fill-opacity': isNew ? 0 : 0.8, stroke: toolTipStroke, rx: 2, ry: 2, 'stroke-width': 1 });

            var txt = isNew ? this.renderer.text(text, x, y, sz.width, sz.height, 0, { 'class': cssToolTip, 'opacity': 0 }, false, 'center', 'center') : this._toolTipElement.txt;

            this._toolTipElement = { box: box, txt: txt, sidx: sidx, gidx: gidx, iidx: iidx };

            this._createAnimationGroup("tooltip");

            if (isNew) {
                this._enqueueAnimation("tooltip", box,
                    [
                    { key: 'fill-opacity', from: 0, to: 0.8 }
                    ], 200);

                this._enqueueAnimation("tooltip", txt,
                    [
                    { key: 'opacity', from: 0, to: 1 }
                    ], 500);
            }
            else {
                var isSvg = this.renderer instanceof ($.jqx.svgRenderer);
                this.renderer.attr(box, { width: sz.width, height: sz.height });
                this._enqueueAnimation("tooltip", box,
                    [
                    { key: 'x', from: parseInt(this.renderer.getAttr(box, 'x')), to: x },
                    { key: 'y', from: parseInt(this.renderer.getAttr(box, 'y')), to: y }
                    ], 200);

                this.renderer.attr(txt, { textContent: text, 'class': cssToolTip, width: szTxt.width, height: szTxt.height });
                if (isSvg)
                    y += sz.height - 6;
                else {
                    y += (sz.height - szTxt.height) / 2 + 2;
                }

                x += (sz.width - szTxt.width) / 2 + 2;

                this._enqueueAnimation("tooltip", txt,
                    [
                    { key: 'x', from: parseInt(this.renderer.getAttr(txt, 'x')), to: x },
                    { key: 'y', from: parseInt(this.renderer.getAttr(txt, 'y')), to: y }
                    ], 200);

            }

            this._startAnimation("tooltip");
        },

        //[optimize]
        _hideToolTip: function () {
            if (!this._toolTipElement)
                return;

            this.renderer.removeElement(this._toolTipElement.box);
            this.renderer.removeElement(this._toolTipElement.txt);

            this._toolTipElement = undefined;
        },

        //[optimize]
        _showLabel: function (gidx, sidx, iidx, rect, halign, valign, isMeasure) {
            var group = this.seriesGroups[gidx];
            var series = group.series[sidx];
            var sz = { width: 0, height: 0 };
            if (series.showLabels == false || (!series.showLabels && !group.showLabels))
                return sz;

            if (rect.width < 0 || rect.height < 0)
                return sz;

            var labelsAngle = series.labelsAngle || group.labelsAngle || 0;
            var labelOffset = series.labelOffset || group.labelAngle || { x: 0, y: 0 };
            var labelCSS = series.labelClass || group.labelClass || this.toThemeProperty('jqx-chart-label-text', null);

            halign = halign || 'center';
            valign = valign || 'center';
            var text = this._getFormattedValue(gidx, sidx, iidx);
            var w = rect.width;
            var h = rect.height;

            if (w == 0 || h == 0 || isMeasure) {
                sz = this.renderer.measureText(text, labelsAngle, { 'class': labelCSS });
                if (isMeasure)
                    return sz;
                w = sz.width;
                h = sz.height;
            }
            var elemLabel = this.renderer.text(text, rect.x + labelOffset.x, rect.y + labelOffset.y, w, h, labelsAngle, {}, labelsAngle != 0, halign, valign);
            this.renderer.attr(elemLabel, { 'class': labelCSS });
            if (this._isVML) {
                this.renderer.removeElement(elemLabel);
                this.renderer.getContainer()[0].appendChild(elemLabel);
            }
        },

        _getAnimProps: function (gidx, sidx) {
            var g = this.seriesGroups[gidx];
            var s = g.series[sidx];

            var enabled = this.enableAnimations == true;

            if (g.enableAnimations)
                enabled = g.enableAnimations == true;

            if (s.enableAnimations)
                enabled = s.enableAnimations == true;

            var duration = this.animationDuration;
            if (isNaN(duration))
                duration = 1000;

            var gd = g.animationDuration;
            if (!isNaN(gd))
                duration = gd;

            var sd = s.animationDuration;
            if (!isNaN(sd))
                duration = sd;

            if (duration > 5000)
                duration = 1000;

            return { enabled: enabled, duration: duration };
        },

        //[optimize]
        _renderLineSeries: function (groupIndex, rect) {
            var group = this.seriesGroups[groupIndex];
            if (!group.series || group.series.length == 0)
                return;

            var isArea = group.type.indexOf('area') != -1;
            var isStacked = group.type.indexOf('stacked') != -1;
            var isStacked100 = isStacked && group.type.indexOf('100') != -1;
            var isSpline = group.type.indexOf('spline') != -1;
            var isStep = group.type.indexOf('step') != -1;

            if (isStep && isSpline)
                return;

            var dataLength = this._getDataLen(groupIndex);
            var wPerItem = rect.width / dataLength;

            var intervals = Math.round(rect.width / wPerItem);
            var intervalLen = Math.round(dataLength / intervals);

            var swapXY = group.orientation == 'horizontal';
            var flipCategory = this._getCategoryAxis(groupIndex).flip == true;

            var gRect = rect;
            if (swapXY)
                gRect = { x: rect.y, y: rect.x, width: rect.height, height: rect.width };

            var renderData = this._calcGroupOffsets(groupIndex, gRect);

            if (!renderData || renderData.xoffsets.length == 0)
                return;

            var alignWithTicks = this._alignValuesWithTicks(groupIndex);

            for (var s = group.series.length - 1; s >= 0; s--) {
                var settings = this._getLineSettings(groupIndex, s);
                var curr = renderData.xoffsets.first;
                var last = curr;
                do {
                    var points = [];
                    var prev = -1;
                    var px = 0;
                    var xPrev = NaN;
                    var yPrev = NaN;
                    var pyStart = NaN;

                    if (renderData.xoffsets.length < 1)
                        continue;

                    var anim = this._getAnimProps(groupIndex, s);
                    var duration = anim.enabled && renderData.xoffsets.length < 10000 && this._isVML != true ? anim.duration : 0;
                    var first = curr;

                    for (var i = curr; i <= renderData.xoffsets.last; i++) {
                        curr = i;
                        var x = renderData.xoffsets.data[i];

                        if (x == undefined)
                            continue;

                        var py = renderData.offsets[s][i].to;
                        if (py == undefined) {
                            curr++;
                            break;
                        }
                        last = i;

                        if (!isArea && isStacked100) {
                            if (py <= gRect.y)
                                py = gRect.y + 1;
                            if (py >= gRect.y + gRect.height)
                                py = gRect.y + gRect.height - 1;
                        }
                        x = Math.max(x, 1);
                        px = x;

                        if (isStep && !isNaN(xPrev) && !isNaN(yPrev)) {
                            if (yPrev != py) {
                                points.push(swapXY ? { y: gRect.x + px, x: $.jqx._ptrnd(yPrev)} : { x: gRect.x + px, y: $.jqx._ptrnd(yPrev) });
                            }
                        }

                        points.push(swapXY ? { y: gRect.x + px, x: $.jqx._ptrnd(py), index: i} : { x: gRect.x + px, y: $.jqx._ptrnd(py), index: i });

                        xPrev = px;
                        yPrev = py;
                        if (isNaN(pyStart))
                            pyStart = py;

                    }

                    var left = gRect.x + renderData.xoffsets.data[first];
                    var right = gRect.x + renderData.xoffsets.data[last];

                    if (isArea && group.alignEndPointsWithIntervals == true) {
                        var sign = flipCategory ? -1 : 1;
                        if (left > gRect.x) {
                            left = gRect.x;
                        }
                        if (right < gRect.x + gRect.width)
                            right = gRect.x + gRect.width;

                        if (flipCategory) {
                            var tmp = left;
                            left = right;
                            right = tmp;
                        }
                    }
                    right = $.jqx._ptrnd(right);
                    left = $.jqx._ptrnd(left);

                    var yBase = renderData.baseOffset;
                    pyStart = $.jqx._ptrnd(pyStart);
                    var pyEnd = $.jqx._ptrnd(py) || yBase;

                    var lineCmd = this._calculateLine(points, yBase, duration == 0 ? 1.0 : 0, isArea, swapXY);
                    if (lineCmd != '')
                        lineCmd = this._buildLineCmd(lineCmd, left, right, pyStart, pyEnd, yBase, isArea, isSpline && points.length > 3, swapXY);
                    else
                        lineCmd = "M 0 0"; // workaround for errors in Chrome

                    var pathElement = this.renderer.path(
                    lineCmd,
                    {
                        'stroke-width': settings.stroke,
                        'stroke': settings.colors.lineColor,
                        'fill-opacity': settings.opacity,
                        fill: isArea ? settings.colors.fillColor : 'none'
                    }
                    );

                    this._installHandlers(pathElement, groupIndex, s);

                    var ctx = { groupIndex: groupIndex, seriesIndex: s, pointsArray: points, left: left, right: right, pyStart: pyStart, pyEnd: pyEnd, yBase: yBase, isArea: isArea, isSpline: isSpline };
                    var self = this;
                    this._enqueueAnimation(
                        "series",
                        pathElement,
                        undefined,
                        duration,
                        function (element, ctx, percent) {
                            var cmd = self._calculateLine(ctx.pointsArray, ctx.yBase, percent, ctx.isArea, swapXY);
                            if (cmd == '')
                                return;
                            var cnt = ctx.pointsArray.length;
                            if (!ctx.isArea)
                                cnt = Math.round(cnt * percent);
                            cmd = self._buildLineCmd(cmd, ctx.left, ctx.right, ctx.pyStart, ctx.pyEnd, ctx.yBase, ctx.isArea, cnt > 3 && ctx.isSpline, swapXY);
                            self.renderer.attr(element, { 'd': cmd });

                            if (percent == 1.0) {
                                var lineSettings = self._getLineSettings(ctx.groupIndex, ctx.seriesIndex);
                                for (var i = 0; i < ctx.pointsArray.length; i++) {
                                    self._showLabel(ctx.groupIndex, ctx.seriesIndex, ctx.pointsArray[i].index, { x: ctx.pointsArray[i].x, y: ctx.pointsArray[i].y, width: 0, height: 0 });
                                    self._drawSymbol(self._getSymbol(ctx.groupIndex, ctx.seriesIndex), ctx.pointsArray[i].x, ctx.pointsArray[i].y, lineSettings.colors.fillColor, lineSettings.colors.lineColor, 1/*lineSettings.stroke*/, lineSettings.opacity);
                                }
                            }
                        },
                        ctx);

                }
                while (curr < renderData.xoffsets.length - 1);
            } // for s
        },

        _calculateLine: function (pointsArray, yBase, percent, isArea, swapXY) {
            var cmd = '';
            var cnt = pointsArray.length;
            if (!isArea)
                cnt = Math.round(cnt * percent);

            for (var i = 0; i < cnt; i++) {
                if (i > 0)
                    cmd += ' ';
                var y = pointsArray[i].y;
                var x = pointsArray[i].x;
                if (isArea) {
                    if (swapXY)
                        x = $.jqx._ptrnd((x - yBase) * percent + yBase);
                    else
                        y = $.jqx._ptrnd((y - yBase) * percent + yBase);
                }

                cmd += x + ',' + y;
            }

            return cmd;
        },

        _buildLineCmd: function (pointsArray, left, right, pyStart, pyEnd, yBase, isArea, isSpline, swapXY) {
            var cmd = pointsArray;
            if (isSpline)
                cmd = this._getBezierPoints(pointsArray);

            var split = cmd.split(' ');
            var firstPoint = split[0].replace('C', '');

            if (isArea) {
                var ptTopLeft = swapXY ? pyStart + ',' + left : left + ',' + pyStart;
                var ptTopRight = swapXY ? pyEnd + ',' + right : right + ',' + pyEnd;
                var ptBottomLeft = swapXY ? yBase + ',' + left : left + ',' + yBase
                var ptBottomRight = swapXY ? yBase + ',' + right : right + ',' + yBase;

                cmd = 'M ' + ptBottomLeft + ' L ' + firstPoint
                        + (isSpline ? '' : (' L ' + firstPoint + ' '))
                        + cmd
                        + (isSpline ?
                            (' L' + ptBottomRight + ' M ' + ptBottomRight)
                            :
                            (' ' + ptBottomRight + ' ' + ptBottomLeft)
                        );

                cmd += ' Z';
            }
            else {
                if (isSpline)
                    cmd = 'M ' + firstPoint + ' ' + cmd;
                else
                    cmd = 'M ' + firstPoint + ' ' + 'L ' + firstPoint + ' ' + cmd;
            }

            return cmd;
        },

        //[optimize]
        _getLineSettings: function (groupIndex, seriesIndex) {
            var group = this.seriesGroups[groupIndex];
            var isArea = group.type.indexOf('area') != -1;
            var colors = this._getColors(groupIndex, seriesIndex, undefined, this._getGroupGradientType(groupIndex));

            var opacity = group.series[seriesIndex].opacity || group.opacity;
            if (!opacity || opacity < 0 || opacity > 1)
                opacity = 1;

            var stroke = group.series[seriesIndex].lineWidth || group.lineWidth;
            if (!stroke || stroke == 'auto' || isNaN(stroke) || stroke < 1 || stroke > 15) {
                stroke = isArea ? 2 : 3;
            }

            return { colors: colors, stroke: stroke, opacity: opacity };
        },

        //[optimize]
        _getColors: function (gidx, sidx, iidx, gradientType) {
            var group = this.seriesGroups[gidx];
            if (group.type != 'pie' && group.type != 'donut')
                iidx = undefined;

            var useGradient = group.series[sidx].useGradient || group.useGradient;
            if (useGradient == undefined)
                useGradient = true;

            var color;
            if (!isNaN(iidx)) {
                var dataLength = this._getDataLen(gidx);
                color = this._getColor(group.series[sidx].colorScheme || group.colorScheme || this.colorScheme, sidx * dataLength + iidx, gidx, sidx);
            }
            else
                color = this._getSeriesColor(gidx, sidx);

            var colorSelected = $.jqx._adjustColor(color, 1.1);

            var lineColor = $.jqx._adjustColor(color, 0.9);
            var lineSelected = $.jqx._adjustColor(colorSelected, 0.9);
            var fillColor = color;
            var fillSelected = colorSelected;

            var stops2 = [[0, 1.5], [100, 1]];
            var stops4 = [[0, 1], [25, 1.1], [50, 1.5], [100, 1]];
            var stopsR = [[0, 1.3], [90, 1.2], [100, 1.0]];

            if (useGradient) {
                if (gradientType == 'verticalLinearGradient') {
                    fillColor = this.renderer._toLinearGradient(color, true, stops2);
                    fillSelected = this.renderer._toLinearGradient(colorSelected, true, stops2);
                }
                else if (gradientType == 'horizontalLinearGradient') {
                    fillColor = this.renderer._toLinearGradient(color, false, stops4);
                    fillSelected = this.renderer._toLinearGradient(colorSelected, false, stops4);
                }
                else if (gradientType == 'radialGradient') {
                    var params = undefined;
                    var stops = stops2;
                    if ((group.type == 'pie' || group.type == 'donut') && iidx != undefined && this._renderData[gidx] && this._renderData[gidx][sidx]) {
                        params = this._renderData[gidx][sidx][iidx];
                        stops = stopsR;
                    }

                    fillColor = this.renderer._toRadialGradient(color, stops, params);
                    fillSelected = this.renderer._toRadialGradient(colorSelected, stops, params);
                }
            }

            return { baseColor: color, fillColor: fillColor, lineColor: lineColor, fillSelected: fillSelected, lineSelected: lineSelected };
        },

        //[optimize]
        _installHandlers: function (element, gidx, sidx, iidx) {
            var self = this;
            var g = this.seriesGroups[gidx];
            var s = this.seriesGroups[gidx].series[sidx];

            var isLineType = g.type.indexOf('line') != -1 || g.type.indexOf('area') != -1;

            if (!isLineType) {
                this.renderer.addHandler(element, 'mousemove', function (e) {
                    e.preventDefault();
                    self._startTooltipTimer(gidx, sidx, iidx);
                });
            }

            this.renderer.addHandler(element, 'mouseover', function (e) {
                e.preventDefault();
                self._select(element, gidx, sidx, iidx);
                // bypass for line and area series
                if (isLineType)
                    return;

                if (isNaN(iidx))
                    return;

                self._raiseEvent('mouseover', g, s, iidx);
            });

            this.renderer.addHandler(element, 'mouseout', function (e) {
                e.preventDefault();

                if (iidx != undefined)
                    self._cancelTooltipTimer();

                // bypass for line and area series
                if (isLineType)
                    return;

                self._unselect();

                if (isNaN(iidx))
                    return;

                self._raiseEvent('mouseout', g, s, iidx);
            });

            this.renderer.addHandler(element, 'click', function (e) {
                e.preventDefault();

                // bypass for line and area series
                if (isLineType)
                    return;

                if (g.type.indexOf('column') != -1)
                    self._unselect();

                if (isNaN(iidx))
                    return;

                self._raiseEvent('click', g, s, iidx);
            });

        },

        //[optimize]
        _getHorizontalOffset: function (gidx, sidx, x, y) {
            var rect = this._plotRect;
            var dataLength = this._getDataLen(gidx);
            if (dataLength == 0)
                return { index: undefined, value: x };

            var renderData = this._calcGroupOffsets(gidx, this._plotRect);
            if (renderData.xoffsets.length == 0)
                return { index: undefined, value: undefined };

            var px = x - rect.x;
            var py = y - rect.y;

            var g = this.seriesGroups[gidx];
            if (g.orientation == 'horizontal') {
                var tmp = px;
                px = py;
                py = tmp;
            }

            var inverse = this._getCategoryAxis(gidx).flip == true;

            var minDist = undefined;
            var idx = undefined;
            for (var i = 0; i < renderData.xoffsets.length; i++) {
                var x1 = renderData.xoffsets.data[i];
                var y1 = renderData.offsets[sidx][i].to;

                //var dist = Math.sqrt(Math.pow(Math.abs(px - x1), 2) + Math.pow(Math.abs(py - y1), 2));
                var dist = Math.abs(px - x1);
                if (isNaN(minDist) || minDist > dist) {
                    minDist = dist;
                    idx = i;
                }
            }

            return { index: idx, value: renderData.xoffsets.data[idx] };
        },

        //[optimize]
        onmousemove: function (x, y) {
            if (this._mouseX == x && this._mouseY == y)
                return;

            this._mouseX = x;
            this._mouseY = y;

            if (!this._selected)
                return;

            var rect = this._plotRect;

            var rBounds = this._paddedRect;
            if (x < rBounds.x || x > rBounds.x + rBounds.width ||
                y < rBounds.y || y > rBounds.y + rBounds.height) {
                this._unselect();
                return;
            }

            var gidx = this._selected.group;
            var g = this.seriesGroups[gidx];
            var s = g.series[this._selected.series];

            var inverse = g.orientation == 'horizontal';

            var type = this.seriesGroups[gidx].type;
            var rect = this._plotRect;
            if (type.indexOf('line') != -1 || type.indexOf('area') != -1) {
                var offset = this._getHorizontalOffset(gidx, this._selected.series, x, y);
                var i = offset.index;
                if (i == undefined)
                    return;

                if (this._selected.item != i) {
                    if (this._selected.item)
                        this._raiseEvent('mouseout', g, s, this._selected.item);

                    this._selected.item = i;
                    this._raiseEvent('mouseover', g, s, i);
                }

                var symbolType = this._getSymbol(this._selected.group, this._selected.series);
                if (symbolType == 'none')
                    symbolType = 'circle';

                var renderData = this._calcGroupOffsets(gidx, rect);
                y = renderData.offsets[this._selected.series][i].to;
                if (y == undefined)
                    return;

                x = offset.value;

                if (inverse) {
                    var tmp = x;
                    x = y;
                    y = tmp + rect.y;
                }
                else {
                    x += rect.x;
                }

                y = $.jqx._ptrnd(y);
                x = $.jqx._ptrnd(x);

                if (this._pointMarker) {
                    this.renderer.removeElement(this._pointMarker.element);
                }

                var color = this._getSeriesColor(this._selected.group, this._selected.series);
                var strokeColor = $.jqx._adjustColor(color, 0.5);

                this._pointMarker = { type: symbolType, x: x, y: y, gidx: gidx, sidx: this._selected.series, iidx: i };
                this._pointMarker.element = this._drawSymbol(symbolType, x, y, color, strokeColor, 1.0, 1.0, 8);

                this._startTooltipTimer(gidx, this._selected.series, i);
            }
        },

        //[optimize]
        _drawSymbol: function (type, x, y, fill, stroke, lineWidth, opacity, size) {
            var element;
            var sz = size || 6;
            var sz2 = sz / 2;
            switch (type) {
                case 'none':
                    return undefined;
                case 'circle':
                    element = this.renderer.circle(x, y, sz / 2);
                    break;
                case 'square':
                    sz = sz - 1; sz2 = sz / 2;
                    element = this.renderer.rect(x - sz2, y - sz2, sz, sz);
                    break;
                case 'diamond':
                    {
                        var path = 'M ' + (x - sz2) + ',' + (y)
                            + ' L ' + (x) + ',' + (y + sz2)
                            + ' L ' + (x + sz2) + ',' + (y)
                            + ' L ' + (x) + ',' + (y - sz2)
                            + ' Z';
                        element = this.renderer.path(path);
                    } break;
                case 'triangle_up':
                    {
                        var path = 'M ' + (x - sz2) + ',' + (y + sz2)
                            + ' L ' + (x + sz2) + ',' + (y + sz2)
                            + ' L ' + (x) + ',' + (y - sz2)
                            + ' Z';
                        element = this.renderer.path(path);
                    } break;
                case 'triangle_down':
                    {
                        var path = 'M ' + (x - sz2) + ',' + (y - sz2)
                            + ' L ' + (x) + ',' + (y + sz2)
                            + ' L ' + (x + sz2) + ',' + (y - sz2)
                            + ' Z';
                        element = this.renderer.path(path);
                    } break;
                case 'triangle_left':
                    {
                        var path = 'M ' + (x - sz2) + ',' + (y)
                            + ' L ' + (x + sz2) + ',' + (y + sz2)
                            + ' L ' + (x + sz2) + ',' + (y - sz2)
                            + ' Z';
                        element = this.renderer.path(path);
                    } break;
                case 'triangle_right':
                    {
                        var path = 'M ' + (x - sz2) + ',' + (y - sz2)
                            + ' L ' + (x - sz2) + ',' + (y + sz2)
                            + ' L ' + (x + sz2) + ',' + (y)
                            + ' Z';
                        element = this.renderer.path(path);
                    } break;
                default:
                    element = this.renderer.circle(x, y, sz);
            }

            this.renderer.attr(element, { fill: fill, stroke: stroke, 'stroke-width': lineWidth, 'fill-opacity': opacity });
            return element;
        },

        //[optimize]
        _getSymbol: function (groupIndex, seriesIndex) {
            var symbols = ['circle', 'square', 'diamond', 'triangle_up', 'triangle_down', 'triangle_left', 'triangle_right'];
            var g = this.seriesGroups[groupIndex];
            var s = g.series[seriesIndex];
            var symbolType = undefined;
            if (s.symbolType != undefined)
                symbolType = s.symbolType;
            if (symbolType == undefined)
                symbolType = g.symbolType;

            if (symbolType == 'default')
                return symbols[seriesIndex % symbols.length];
            else if (symbolType != undefined)
                return symbolType;

            return 'none';
        },

        //[optimize]
        _startTooltipTimer: function (gidx, sidx, iidx) {
            this._cancelTooltipTimer();
            var self = this;
            var g = self.seriesGroups[gidx];
            var delay = this.toolTipShowDelay || this.toolTipDelay;
            if (isNaN(delay) || delay > 10000 || delay < 0)
                delay = 500;
            if (this._toolTipElement)
                delay = 0;

            this._tttimer = setTimeout(function () {
                self._showToolTip(self._mouseX, self._mouseY - 3, gidx, sidx, iidx);
                var toolTipHideDelay = self.toolTipHideDelay;
                if (isNaN(toolTipHideDelay))
                    toolTipHideDelay = 4000;
                self._tttimer = setTimeout(function () { self._hideToolTip(); }, toolTipHideDelay);
            }, delay);
        },

        //[optimize]
        _cancelTooltipTimer: function () {
            clearTimeout(this._tttimer);
        },

        //[optimize]
        _getGroupGradientType: function (gidx) {
            var g = this.seriesGroups[gidx];
            if (g.type.indexOf('area') != -1)
                return g.orientation == 'horizontal' ? 'horizontalLinearGradient' : 'verticalLinearGradient';
            else if (g.type.indexOf('column') != -1)
                return g.orientation == 'horizontal' ? 'verticalLinearGradient' : 'horizontalLinearGradient';
            else if (g.type.indexOf('scatter') != -1 || g.type.indexOf('bubble') != -1 || g.type.indexOf('pie') != -1 || g.type.indexOf('donut') != -1)
                return 'radialGradient';

            return undefined;
        },

        //[optimize]
        _select: function (element, gidx, sidx, iidx) {
            if (this._selected && this._selected.element != element) {
                this._unselect();
            }

            this._selected = { element: element, group: gidx, series: sidx, item: iidx };
            var g = this.seriesGroups[gidx];

            var colors = this._getColors(gidx, sidx, iidx, this._getGroupGradientType(gidx));
            if (g.type.indexOf('line') != -1 && g.type.indexOf('area') == -1)
                colors.fillSelected = 'none';

            this.renderer.attr(element, { 'stroke': colors.lineSelected, fill: colors.fillSelected });
        },

        //[optimize]
        _unselect: function () {
            if (this._selected) {
                var gidx = this._selected.group;
                var sidx = this._selected.series;
                var iidx = this._selected.item;
                var g = this.seriesGroups[gidx];
                var s = g.series[sidx];

                var colors = this._getColors(gidx, sidx, iidx, this._getGroupGradientType(gidx));
                if (g.type.indexOf('line') != -1 && g.type.indexOf('area') == -1)
                    colors.fillColor = 'none';

                this.renderer.attr(this._selected.element, { 'stroke': colors.lineColor, fill: colors.fillColor });

                if (g.type.indexOf('line') != -1 || g.type.indexOf('area') != -1 && !isNaN(iidx)) {
                    this._raiseEvent('mouseout', g, s, iidx);
                }

                this._selected = undefined;
            }

            if (this._pointMarker) {
                this.renderer.removeElement(this._pointMarker.element);
                this._pointMarker = undefined;
            }
        },

        //[optimize]
        _raiseEvent: function (event, group, serie, index) {
            var fn = serie[event] || group[event];
            var gidx = 0;
            for (; gidx < this.seriesGroups.length; gidx++)
                if (this.seriesGroups[gidx] == group)
                    break;
            if (gidx == this.seriesGroups.length)
                return;

            if (fn && $.isFunction(fn))
                fn({ event: event, seriesGroup: group, serie: serie, elementIndex: index, elementValue: this._getDataValue(index, serie.dataField, gidx) });
        },

        //[optimize]
        _calcGroupOffsets: function (groupIndex, rect) {
            var group = this.seriesGroups[groupIndex];
            if (!group.series || group.series.length == 0)
                return;

            var inverse = group.valueAxis.flip == true;
            var logAxis = group.valueAxis.logarithmicScale == true;
            var logBase = group.valueAxis.logarithmicScaleBase || 10;

            if (!this._renderData)
                this._renderData = new Array();

            while (this._renderData.length < groupIndex + 1)
                this._renderData.push(null);

            if (this._renderData[groupIndex] != null)
                return this._renderData[groupIndex];

            var out = new Array();

            var isStacked = group.type.indexOf("stacked") != -1;
            var isStacked100 = isStacked && group.type.indexOf("100") != -1;

            var dataLength = this._getDataLen(groupIndex);
            var gbase = group.baselineValue || group.valueAxis.baselineValue || 0;
            var stat = this._stats.seriesGroups[groupIndex];
            if (!stat || !stat.isValid)
                return;

            if (gbase > stat.max)
                gbase = stat.max;
            if (gbase < stat.min)
                gbase = stat.min;

            var range = (isStacked100 || logAxis) ? stat.maxRange : stat.max - stat.min;

            var min = stat.min;
            var max = stat.max;

            var scale = rect.height / (logAxis ? stat.intervals : range);

            var yzero = 0;
            if (isStacked100) {
                if (min * max < 0) {
                    range /= 2;
                    yzero = -(range + gbase) * scale;
                }
                else {
                    yzero = -gbase * scale;
                }
            }
            else
                yzero = -(gbase - min) * scale;

            if (inverse)
                yzero = -yzero + rect.y;
            else
                yzero += rect.y + rect.height;

            var yPOffset = new Array();
            var yNOffset = new Array();

            var pIntervals, nIntervals;
            if (logAxis) {
                pIntervals = $.jqx.log(max, logBase) - $.jqx.log(gbase, logBase);
                if (isStacked) // force base value @ min for stacked log series
                {
                    pIntervals = stat.intervals;
                    gbase = isStacked100 ? 0 : min;
                }

                nIntervals = stat.intervals - pIntervals;
                yzero = rect.y + pIntervals / stat.intervals * rect.height;
            }

            yzero = $.jqx._ptrnd(yzero);

            var th = (min * max < 0) ? rect.height / 2 : rect.height;

            var logSums = [];

            for (var j = 0; j < group.series.length; j++) {
                if (!isStacked && logAxis)
                    logSums = [];

                out.push(new Array());
                for (var i = 0; i < dataLength; i++) {
                    var val = this._getDataValueAsNumber(i, group.series[j].dataField, groupIndex);
                    if (isNaN(val) || (logAxis && val <= 0)) {
                        out[j].push({ from: undefined, to: undefined });
                        continue;
                    }

                    if (val > stat.rmax)
                        val = stat.rmax;
                    if (val < stat.rmin)
                        val = stat.rmin;

                    var yOffset = (val > gbase) ? yPOffset : yNOffset;

                    var h = scale * (val - gbase);
                    if (logAxis) {
                        while (logSums.length <= i)
                            logSums.push({ p: { value: 0, height: 0 }, n: { value: 0, height: 0} });

                        var sums = val > gbase ? logSums[i].p : logSums[i].n;

                        sums.value += val;

                        if (isStacked100) {
                            val = sums.value / (stat.psums[i] + stat.nsums[i]) * 100;
                            h = ($.jqx.log(val, logBase) - stat.minPow) * scale;
                        }
                        else {
                            h = $.jqx.log(sums.value, logBase) - $.jqx.log(gbase, logBase);
                            h *= scale;
                        }

                        h -= sums.height;
                        sums.height += h;
                    }

                    var y = yzero;

                    if (isStacked) {
                        if (isStacked100 && !logAxis) {
                            var irange = (stat.psums[i] - stat.nsums[i]);

                            if (val > gbase) {
                                h = (stat.psums[i] / irange) * th;
                                if (stat.psums[i] != 0)
                                    h *= val / stat.psums[i];
                            }
                            else {
                                h = (stat.nsums[i] / irange) * th;
                                if (stat.nsums[i] != 0)
                                    h *= val / stat.nsums[i];
                            }
                        }

                        if (isNaN(yOffset[i])) {
                            yOffset[i] = yzero;
                        }

                        y = yOffset[i];
                    }

                    h = Math.abs(h);
                    h = this._isVML ? Math.round(h) : $.jqx._rup(h);

                    // adjust the height to make sure it span the entire height
                    // otherwise there will be a few pixels inaccuracy
                    if (j == group.series.length - 1 && isStacked100) {
                        var sumH = 0;
                        for (var k = 0; k < j; k++)
                            sumH += Math.abs(out[k][i].to - out[k][i].from);
                        sumH += h;
                        if (sumH < th) {
                            if (h > 0.5)
                                h = $.jqx._ptrnd(h + th - sumH);
                            else {
                                var k = j - 1;
                                while (k >= 0) {
                                    var diff = Math.abs(out[k][i].to - out[k][i].from);
                                    if (diff > 1) {
                                        if (out[k][i].from > out[k][i].to) {
                                            out[k][i].from += th - sumH;
                                        }
                                        break;
                                    }
                                    k--;
                                }
                            }
                        }
                    }

                    if (inverse)
                        h *= -1;

                    if (val < gbase) {
                        yOffset[i] += h;
                        out[j].push({ from: y, to: y + h - 1 });
                    }
                    else {
                        yOffset[i] -= h;
                        out[j].push({ from: y, to: y - h });
                    }
                }
            }

            this._renderData[groupIndex] = { baseOffset: yzero, offsets: out };

            // calculate horizontal offsets
            this._renderData[groupIndex].xoffsets = this._calculateXOffsets(groupIndex, rect);
            // end calculating horizontal offsets

            return this._renderData[groupIndex];
        },

        _isPointSeriesOnly: function () {
            for (var i = 0; i < this.seriesGroups.length; i++) {
                var g = this.seriesGroups[i];
                if (g.type.indexOf('line') == -1 && g.type.indexOf('area') == -1 && g.type.indexOf('scatter') == -1 && g.type.indexOf('bubble') == -1)
                    return false;
            }

            return true;
        },

        _alignValuesWithTicks: function (groupIndex) {
            var psonly = this._isPointSeriesOnly();

            // if categoryAxis
            var xAxis = this._getCategoryAxis(groupIndex);
            var xAxisValuesOnTicks = xAxis.valuesOnTicks == undefined ? psonly : xAxis.valuesOnTicks != false;
            if (groupIndex == undefined)
                return xAxisValuesOnTicks;

            var g = this.seriesGroups[groupIndex];

            if (g.valuesOnTicks == undefined)
                return xAxisValuesOnTicks;

            return g.valuesOnTicks;
        },

        _getYearsDiff: function (from, to) {
            return to.getFullYear() - from.getFullYear(); // this._getMonthsDiff(from, to) / 12;
        },

        _getMonthsDiff: function (from, to) {
            return 12 * (to.getFullYear() - from.getFullYear()) + to.getMonth() - from.getMonth();
        },

        _getDaysDiff: function (from, to) {
            return (to.valueOf() - from.valueOf()) / (1000 * 24 * 3600);
        },

        _getDateDiff: function (from, to, baseUnit) {
            var diff = 0;
            if (baseUnit == 'year')
                diff = this._getYearsDiff(from, to);
            else if (baseUnit == 'month')
                diff = this._getMonthsDiff(from, to);
            else
                diff = this._getDaysDiff(from, to);

            return diff;
        },

        _getDatesArray: function (min, max, baseUnit, inclNext) {
            var arr = [];

            var len = this._getDateDiff(min, max, baseUnit) + 1;
            if (baseUnit == 'year') {
                if (inclNext)
                    len++;
                var val = min.getFullYear();
                for (var i = 0; i < len; i++) {
                    arr.push(new Date(val, 0, 1, 0, 0, 0, 0));
                    val++;
                }
            }
            else if (baseUnit == 'month') {
                if (inclNext)
                    len++;

                var month = min.getMonth();
                var year = min.getFullYear();
                for (var i = 0; i < len; i++) {
                    arr.push(new Date(year, month, 1, 0, 0, 0, 0));
                    month++;
                    if (month > 11) {
                        year++;
                        month = 0;
                    }
                }
            }
            else if (baseUnit == 'day') {
                for (var i = 0; i < len; i++) {
                    var date = new Date(min.valueOf() + i * 1000 * 3600 * 24);
                    arr.push(date);
                }
            }

            return arr;
        },

        _calculateXOffsets: function (groupIndex, rect) {
            var xAxis = this._getCategoryAxis(groupIndex);
            var xoffsets = new Array();
            var dataLength = this._getDataLen(groupIndex);
            var isDate = xAxis.type == 'date';
            var axisMin = isDate ? this._castAsDate(xAxis.minValue) : this._castAsNumber(xAxis.minValue);
            var axisMax = isDate ? this._castAsDate(xAxis.maxValue) : this._castAsNumber(xAxis.maxValue);

            var min = axisMin, max = axisMax;

            if (isNaN(min) || isNaN(max)) {
                for (var i = 0; i < dataLength; i++) {
                    var value = this._getDataValue(i, xAxis.dataField, groupIndex);
                    value = isDate ? this._castAsDate(value) : this._castAsNumber(value);
                    if (value == undefined || isNaN(value))
                        continue;
                    if (value < min || isNaN(min))
                        min = value;
                    if (value > max || isNaN(max))
                        max = value;
                }
            }

            min = axisMin || min;
            max = axisMax || max;

            if (isDate && !(this._isDate(min) && this._isDate(max))) {
                throw 'Invalid Date values';
            }

            var isRange = (xAxis.maxValue != undefined) || (xAxis.minValue != undefined);
            if (isRange && (isNaN(max) || isNaN(min))) {
                isRange = false;
                throw 'Invalid min/max category values';
            }

            if (!isRange && !isDate) {
                min = 0;
                max = dataLength - 1;
            }

            var interval = xAxis.unitInterval;
            if (isNaN(interval) || interval <= 0)
                interval = 1;

            var rangeLength = NaN;
            var valuesOnTicks = this._alignValuesWithTicks(groupIndex);

            if (isRange) {
                if (valuesOnTicks)
                    rangeLength = max - min;
                else
                    rangeLength = max - min + interval;
            }
            else {
                rangeLength = dataLength - 1;
                if (!valuesOnTicks)
                    rangeLength++;
            }

            if (rangeLength == 0)
                rangeLength = interval;

            var dateRangeDays = 0;
            var _max = max;
            var _min = min;

            if (isDate) {
                rangeLength = this._getDateDiff(_min, _max, xAxis.baseUnit);
                rangeLength = $.jqx._rnd(rangeLength, 1, false);

                if (!valuesOnTicks || (valuesOnTicks && (xAxis.baseUnit == 'month' || xAxis.baseUnit == 'year')))
                    rangeLength++;

                if (xAxis.baseUnit != 'day') {
                    if (xAxis.baseUnit == 'month') {
                        _min = new Date(_min.getFullYear(), _min.getMonth(), 1);
                        _max = new Date(_min);
                        _max.setMonth(_max.getMonth() + rangeLength);
                    }
                    else {
                        _min = new Date(_min.getFullYear(), 0, 1);
                        _max = new Date(_min);
                        _max.setYear(_max.getFullYear() + rangeLength);
                    }
                }
                dateRangeDays = $.jqx._rnd(this._getDateDiff(_min, _max, 'day'), 1, false);
                if (!valuesOnTicks) {
                    dateRangeDays++;
                }
            }

            var itemsCount = Math.max(1, rangeLength / interval);
            var itemWidth = rect.width / itemsCount;

            var isColumn = groupIndex != undefined && this.seriesGroups[groupIndex].type.indexOf('column') != -1;

            var xAdjust = 0;
            if (!valuesOnTicks && (!isDate || xAxis.baseUnit == 'day') && !isColumn)
                xAdjust = itemWidth / 2;

            var first = -1, last = -1;
            for (var i = 0; i < dataLength; i++) {
                if (!isRange && !isDate) {
                    xoffsets.push($.jqx._ptrnd(xAdjust + (i - _min) / rangeLength * rect.width));
                    if (first == -1)
                        first = i;
                    if (last == -1 || last < i)
                        last = i;
                    continue;
                }

                var value = this._getDataValue(i, xAxis.dataField, groupIndex);
                value = isDate ? this._castAsDate(value) : this._castAsNumber(value);
                if (isNaN(value) || value < _min || value > _max) {
                    xoffsets.push(-1);
                    continue;
                }

                var diffFromMin = isDate ? $.jqx._rnd(this._getDateDiff(_min, value, 'day'), 1, false) : value - _min;

                var x = $.jqx._ptrnd(xAdjust + diffFromMin / (isDate ? dateRangeDays : rangeLength) * rect.width);

                xoffsets.push(x);
                if (first == -1)
                    first = i;
                if (last == -1 || last < i)
                    last = i;
            }

            if (xAxis.flip == true) {
                xoffsets.reverse();
            }

            return { data: xoffsets, first: first, last: last, length: last == -1 ? 0 : last - first + 1, itemWidth: itemWidth, rangeLength: rangeLength, min: min, max: max, customRange: isRange };
        },

        //[optimize]
        _getCategoryAxis: function (gidx) {
            if (gidx == undefined || this.seriesGroups.length <= gidx)
                return this.categoryAxis;

            return this.seriesGroups[gidx].categoryAxis || this.categoryAxis;
        },

        //[optimize]
        _isGreyScale: function (groupIndex, seriesIndex) {
            var g = this.seriesGroups[groupIndex];
            var s = g.series[seriesIndex];

            if (s.greyScale == true)
                return true;
            else if (s.greyScale == false)
                return false;

            if (g.greyScale == true)
                return true;
            else if (g.greyScale == false)
                return false;

            return this.greyScale == true;
        },



        //[optimize]
        _getSeriesColor: function (groupIndex, seriesIndex) {
            var color = this._getSeriesColorInternal(groupIndex, seriesIndex);

            if (this._isGreyScale(groupIndex, seriesIndex) && color.indexOf('#') == 0) {
                color = $.jqx.toGreyScale(color);
            }

            return color;
        },

        //[optimize]
        _getSeriesColorInternal: function (groupIndex, seriesIndex) {
            var g = this.seriesGroups[groupIndex];
            var s = g.series[seriesIndex];

            if (s.color)
                return s.color;

            var sidx = 0;
            for (var i = 0; i <= groupIndex; i++) {
                for (var j in this.seriesGroups[i].series) {
                    if (i == groupIndex && j == seriesIndex)
                        break;
                    else
                        sidx++;
                }
            }

            var colorScheme = this.colorScheme;
            if (g.colorScheme) {
                colorScheme = g.colorScheme;
                sidex = seriesIndex;
            }

            if (colorScheme == undefined || colorScheme == '')
                colorScheme = this.colorSchemes[0].name;

            if (colorScheme) {
                for (var i = 0; i < this.colorSchemes.length; i++) {
                    var cs = this.colorSchemes[i];
                    if (cs.name == colorScheme) {
                        while (sidx > cs.colors.length) {
                            sidx -= cs.colors.length;
                            if (++i >= this.colorSchemes.length)
                                i = 0;
                            cs = this.colorSchemes[i];
                        }

                        return cs.colors[sidx % cs.colors.length];
                    }
                }
            }

            return '#222222';
        },

        _getColor: function (scheme, index, gidx, sidx) {
            if (scheme == undefined || scheme == '')
                scheme = this.colorSchemes[0].name;

            for (var i = 0; i < this.colorSchemes.length; i++)
                if (scheme == this.colorSchemes[i].name)
                    break;

            var j = 0;
            while (j <= index) {
                if (i == this.colorSchemes.length)
                    i = 0;

                var schLen = this.colorSchemes[i].colors.length;
                if (j + schLen <= index) {
                    j += schLen;
                    i++;
                }
                else {
                    var color = this.colorSchemes[i].colors[index - j];

                    if (this._isGreyScale(gidx, sidx) && color.indexOf('#') == 0)
                        color = $.jqx.toGreyScale(color);

                    return color;
                }
            }
        },

        getColorScheme: function (scheme) {
            for (var i in this.colorSchemes) {
                if (this.colorSchemes[i].name == scheme)
                    return this.colorSchemes[i].colors;
            }

            return undefined;
        },

        addColorScheme: function (scheme, colors) {
            for (var i in this.colorSchemes) {
                if (this.colorSchemes[i].name == scheme) {
                    this.colorSchemes[i].colors = colors;
                    return;
                }
            }

            this.colorSchemes.push({ name: scheme, colors: colors });
        },

        removeColorScheme: function (scheme) {
            for (var i in this.colorSchemes) {
                if (this.colorSchemes[i].name == scheme) {
                    this.colorSchemes.splice(i, 1);
                    break;
                }
            }
        },

        /************* COLOR SCHEMES ************/
        //[optimize]
        colorSchemes: [
            { name: 'scheme01', colors: ['#4572A7', '#AA4643', '#89A54E', '#71588F', '#4198AF'] },
            { name: 'scheme02', colors: ['#7FD13B', '#EA157A', '#FEB80A', '#00ADDC', '#738AC8'] },
            { name: 'scheme03', colors: ['#E8601A', '#FF9639', '#F5BD6A', '#599994', '#115D6E'] },
            { name: 'scheme04', colors: ['#D02841', '#FF7C41', '#FFC051', '#5B5F4D', '#364651'] },
            { name: 'scheme05', colors: ['#25A0DA', '#309B46', '#8EBC00', '#FF7515', '#FFAE00'] },
            { name: 'scheme06', colors: ['#0A3A4A', '#196674', '#33A6B2', '#9AC836', '#D0E64B'] },
            { name: 'scheme07', colors: ['#CC6B32', '#FFAB48', '#FFE7AD', '#A7C9AE', '#888A63'] },
            { name: 'scheme08', colors: ['#2F2933', '#01A2A6', '#29D9C2', '#BDF271', '#FFFFA6'] },
            { name: 'scheme09', colors: ['#1B2B32', '#37646F', '#A3ABAF', '#E1E7E8', '#B22E2F'] },
            { name: 'scheme10', colors: ['#5A4B53', '#9C3C58', '#DE2B5B', '#D86A41', '#D2A825'] },
            { name: 'scheme11', colors: ['#993144', '#FFA257', '#CCA56A', '#ADA072', '#949681']}///,
        //{ name: 'scheme02', colors: ['#105B63', '#FFFAD5', '#FFD34E', '#DB9E36', '#BD4932'] },
        //{ name: 'scheme04', colors: ['#BBEBBC', '#F0EE94', '#F5C465', '#FA7642', '#FF1E54'] },
        //{ name: 'scheme08', colors: ['#40371E', '#F2EEAC', '#BFA575', '#A63841', '#BFB8A3']},
        //{ name: 'scheme11', colors: ['#222526', '#FFBB6E', '#F28D00', '#D94F00', '#7F203B'] },
        //{ name: 'scheme12', colors: ['#381C19', '#472E29', '#948658', '#F0E99A', '#362E29'] },
        //{ name: 'scheme18', colors: ['#142D58', '#447F6E', '#E1B65B', '#C8782A', '#9E3E17'] },
        //{ name: 'scheme20', colors: ['#4D2B1F', '#635D61', '#7992A2', '#97BFD5', '#BFDCF5'] }//,
        //{ name: 'scheme04', colors: ['#844341', '#D5CC92', '#BBA146', '#897B26', '#55591C'] },
        //{ name: 'scheme05', colors: ['#56626B', '#6C9380', '#C0CA55', '#F07C6C', '#AD5472'] },
        //{ name: 'scheme07', colors: ['#96003A', '#FF7347', '#FFBC7B', '#FF4154', '#440203'] },
        //{ name: 'scheme08', colors: ['#5D7359', '#E0D697', '#D6AA5C', '#8C5430', '#661C0E'] },
        //{ name: 'scheme21', colors: ['#16193B', '#35478C', '#4E7AC7', '#7FB2F0', '#ADD5F7'] },
        //{ name: 'scheme24', colors: ['#7B1A25', '#BF5322', '#9DA860', '#CEA457', '#B67818'] },
        //{ name: 'scheme26', colors: ['#0081DA', '#3AAFFF', '#99C900', '#FFEB3D', '#309B46'] },
        //{ name: 'scheme27', colors: ['#0069A5', '#0098EE', '#7BD2F6', '#FFB800', '#FF6800'] },
        //{ name: 'scheme28', colors: ['#FF6800', '#A0A700', '#FF8D00', '#678900', '#0069A5'] }

        ],

        /********** END OF COLOR SCHEMES ********/
        //[optimize]
        _formatValue: function (value, formatSettings, formatFunction) {
            if (value == undefined)
                return '';

            if (formatFunction) {
                if (!$.isFunction(formatFunction))
                    return value.toString();

                try {
                    return formatFunction(value);
                }
                catch (e) {
                    return e.message;
                }
            }

            if (this._isNumber(value))
                return this._formatNumber(value, formatSettings);

            if (this._isDate(value))
                return this._formatDate(value, formatSettings);

            if (formatSettings) {
                return (formatSettings.prefix || '') + value.toString() + (formatSettings.sufix || '');
            }

            return value.toString();
        },

        //[optimize]
        _getFormattedValue: function (groupIndex, seriesIndex, itemIndex, formatSettings, formatFunction) {
            var g = this.seriesGroups[groupIndex];
            var s = g.series[seriesIndex];
            var text = '';

            var fs = formatSettings, fn = formatFunction;
            if (!fn)
                fn = s.formatFunction || g.formatFunction;
            if (!fs)
                fs = s.formatSettings || g.formatSettings;

            // series format settings takes priority over group format function;
            if (!s.formatFunction && s.formatSettings)
                fn = undefined;

            var value = this._getDataValue(itemIndex, s.dataField, groupIndex);
            if (value) {
                // format function is used with priority when available.
                text = this._formatValue(value, fs, fn);
            }

            return text || '';
        },

        //[optimize]
        _isNumberAsString: function (text) {
            if (typeof (text) != 'string')
                return false;

            text = $.trim(text);
            for (var i = 0; i < text.length; i++) {
                var ch = text.charAt(i);
                if ((ch >= '0' && ch <= '9') || ch == ',' || ch == '.')
                    continue;

                if (ch == '-' && i == 0)
                    continue;

                if ((ch == '(' && i == 0) || (ch == ')' && i == text.length - 1))
                    continue;

                return false;
            }

            return true;
        },

        //[optimize]
        _castAsDate: function (value) {
            if (value instanceof Date && !isNaN(value))
                return value;

            if (typeof (value) == 'string') {
                var date = new Date(value);
                if (date != undefined)
                    return date;
            }

            return undefined;
        },


        //[optimize]
        _castAsNumber: function (value) {
            if (value instanceof Date && !isNaN(value))
                return value.valueOf();

            if (typeof (value) == 'string') {
                if (this._isNumber(value)) {
                    value = parseFloat(value);
                }
                else {
                    var date = new Date(value);
                    if (date != undefined)
                        value = date.valueOf();
                }
            }

            return value;
        },

        //[optimize]
        _isNumber: function (value) {
            if (typeof (value) == 'string') {
                if (this._isNumberAsString(value))
                    value = parseFloat(value);
            }
            return typeof value === 'number' && isFinite(value);
        },

        //[optimize]
        _isDate: function (value) {
            return value instanceof Date;
        },

        //[optimize]
        _isBoolean: function (value) {
            return typeof value === 'boolean';
        },

        //[optimize]
        _isObject: function (value) {
            return (value && (typeof value === 'object' || $.isFunction(value))) || false;
        },

        //[optimize]
        _formatDate: function (value, settings) {
            return value.toString();
        },

        //[optimize]
        _formatNumber: function (value, settings) {
            if (!this._isNumber(value))
                return value;

            settings = settings || {};

            var decimalSeparator = settings.decimalSeparator || '.';
            var thousandsSeparator = settings.thousandsSeparator || '';
            var prefix = settings.prefix || '';
            var sufix = settings.sufix || '';
            var decimalPlaces = settings.decimalPlaces || ((value * 100 != parseInt(value) * 100) ? 2 : 0);
            var negativeWithBrackets = settings.negativeWithBrackets || false;

            var negative = (value < 0);

            if (negative && negativeWithBrackets)
                value *= -1;

            var output = value.toString();
            var decimalindex;

            var decimal = Math.pow(10, decimalPlaces);
            output = (Math.round(value * decimal) / decimal).toString();
            if (isNaN(output)) {
                output = '';
            }

            decimalindex = output.lastIndexOf(".");
            if (decimalPlaces > 0) {
                if (decimalindex < 0) {
                    output += decimalSeparator;
                    decimalindex = output.length - 1;
                }
                else if (decimalSeparator !== ".") {
                    output = output.replace(".", decimalSeparator);
                }
                while ((output.length - 1 - decimalindex) < decimalPlaces) {
                    output += "0";
                }
            }

            decimalindex = output.lastIndexOf(decimalSeparator);
            decimalindex = (decimalindex > -1) ? decimalindex : output.length;
            var newoutput = output.substring(decimalindex);
            var cnt = 0;
            for (var i = decimalindex; i > 0; i--, cnt++) {
                if ((cnt % 3 === 0) && (i !== decimalindex) && (!negative || (i > 1) || (negative && negativeWithBrackets))) {
                    newoutput = thousandsSeparator + newoutput;
                }
                newoutput = output.charAt(i - 1) + newoutput;
            }
            output = newoutput;

            if (negative && negativeWithBrackets)
                output = '(' + output + ')';

            return prefix + output + sufix;
        },

        //[optimize]
        _defaultNumberFormat: { prefix: '', sufix: '', decimalSeparator: '.', thousandsSeparator: ',', decimalPlaces: 2, negativeWithBrackets: false },

        _getBezierPoints: function (arr) {
            var points = [];
            var split = arr.split(' ');
            for (var i = 0; i < split.length; i++) {
                var pt = split[i].split(',');
                points.push({ x: parseFloat(pt[0]), y: parseFloat(pt[1]) });
            }

            var result = '';

            for (var i = 0; i < points.length - 1; i++) {
                var p = [];
                if (0 == i) {
                    p.push(points[i]);
                    p.push(points[i]);
                    p.push(points[i + 1]);
                    p.push(points[i + 2]);
                } else if (points.length - 2 == i) {
                    p.push(points[i - 1]);
                    p.push(points[i]);
                    p.push(points[i + 1]);
                    p.push(points[i + 1]);
                } else {
                    p.push(points[i - 1]);
                    p.push(points[i]);
                    p.push(points[i + 1]);
                    p.push(points[i + 2]);
                }

                var out = [];
                var a = i == 0 ? 81 : 9;

                var c1 = { x: ((-p[0].x + a * p[1].x + p[2].x) / a), y: ((-p[0].y + a * p[1].y + p[2].y) / a) };
                var c2 = { x: ((p[1].x + a * p[2].x - p[3].x) / a), y: ((p[1].y + a * p[2].y - p[3].y) / a) };

                out.push({ x: p[1].x, y: p[1].y });
                out.push(c1);
                out.push(c2);
                out.push({ x: p[2].x, y: p[2].y });
                if (i == 0) {
                    out[1].x++;
                    out[1].y++;
                }

                result += "C" + $.jqx._ptrnd(out[1].x) + "," + $.jqx._ptrnd(out[1].y) + " " + $.jqx._ptrnd(out[2].x) + "," + $.jqx._ptrnd(out[2].y) + " " + $.jqx._ptrnd(out[3].x) + "," + $.jqx._ptrnd(out[3].y) + " ";
            }

            return result;
        },

        _animTickInt: 50,

        _createAnimationGroup: function (groupId) {
            if (!this._animGroups) {
                this._animGroups = {};
            }

            this._animGroups[groupId] = { animations: [], startTick: NaN };
        },

        _startAnimation: function (groupId) {
            var d = new Date();
            var currentTick = d.getTime();
            this._animGroups[groupId].startTick = currentTick;
            this._enableAnimTimer();
        },

        _enqueueAnimation: function (groupId, element, properties, duration, fn, context, easing) {
            if (duration == 0)
                duration = 1;

            if (easing == undefined)
                easing = 'easeInOutSine';

            this._animGroups[groupId].animations.push({ key: element, properties: properties, duration: duration, fn: fn, context: context, easing: easing });
        },

        _stopAnimations: function () {
            clearTimeout(this._animtimer);
            this._animtimer = undefined;
            this._animGroups = undefined;
        },

        _enableAnimTimer: function () {
            if (!this._animtimer) {
                var self = this;
                this._animtimer = setTimeout(function () { self._runAnimation(); }, this._animTickInt);
            }
        },

        _runAnimation: function () {
            if (this._animGroups) {
                var d = new Date();
                var currentTick = d.getTime();

                var animGroupsNewList = {};
                for (var j in this._animGroups) {
                    var list = this._animGroups[j].animations;
                    var startTick = this._animGroups[j].startTick;

                    var maxDuration = 0;
                    for (var i = 0; i < list.length; i++) {
                        var item = list[i];

                        var tSince = (currentTick - startTick);
                        if (item.duration > maxDuration)
                            maxDuration = item.duration;

                        var percent = item.duration > 0 ? tSince / item.duration : 0;
                        var easeParecent = percent;
                        if (item.easing)
                            easeParecent = jQuery.easing[item.easing](percent, tSince, 0, 1, item.duration);

                        if (percent > 1) {
                            percent = 1;
                            easeParecent = 1;
                        }

                        if (item.fn) // custom function
                        {
                            item.fn(item.key, item.context, easeParecent);
                            continue;
                        }

                        var params = {};
                        for (var j = 0; j < item.properties.length; j++) {
                            var p = item.properties[j];
                            var val = 0;

                            if (percent == 1) {
                                val = p.to;
                            }
                            else {
                                val = easeParecent * (p.to - p.from) + p.from;
                            }

                            params[p.key] = val;
                        }
                        this.renderer.attr(item.key, params);
                    } // for i

                    if (startTick + maxDuration > currentTick)
                        animGroupsNewList[j] = ({ startTick: startTick, animations: list });
                } // for j

                this._animGroups = animGroupsNewList;

                if (this.renderer instanceof $.jqx.HTML5Renderer)
                    this.renderer.refresh();
            }

            this._animtimer = null;

            for (var j in this._animGroups) {
                this._enableAnimTimer();
                break;
            }

        }

    });

    //[optimize]
    $.jqx.toGreyScale = function (color) {
        var rgb = $.jqx.cssToRgb(color);
        rgb[0] = rgb[1] = rgb[2] = Math.round(0.3 * rgb[0] + 0.59 * rgb[1] + 0.11 * rgb[2]);
        var hex = $.jqx.rgbToHex(rgb[0], rgb[1], rgb[2]);
        return '#' + hex[0] + hex[1] + hex[2];
    },

    //[optimize]
    $.jqx._adjustColor = function (color, adj) {
        var rgb = $.jqx.cssToRgb(color);

        var color = '#'
        for (var i = 0; i < 3; i++) {
            var c = Math.round(adj * rgb[i]);
            if (c > 255)
                c = 255;
            else if (c <= 0)
                c = 0;
            c = $.jqx.decToHex(c);
            if (c.toString().length == 1)
                color += '0';

            color += c;
        }

        return color.toUpperCase();
    }

    //[optimize]
    $.jqx.decToHex = function (dec) {
        return dec.toString(16);
    },

    //[optimize]
        $.jqx.hexToDec = function (hex) {
            return parseInt(hex, 16);
        }

    //[optimize]
    $.jqx.rgbToHex = function (r, g, b) {
        return [$.jqx.decToHex(r), $.jqx.decToHex(g), $.jqx.decToHex(b)];
    }

    //[optimize]
    $.jqx.hexToRgb = function (h, e, x) {
        return [$.jqx.hexToDec(h), $.jqx.hexToDec(e), $.jqx.hexToDec(x)];
    }

    //[optimize]
    $.jqx.cssToRgb = function (color) {
        if (color.indexOf('rgb') <= -1) {
            return $.jqx.hexToRgb(color.substring(1, 3), color.substring(3, 5), color.substring(5, 7));
        }
        return color.substring(4, color.length - 1).split(',');
    }

    $.jqx.swap = function (x, y) {
        var tmp = x;
        x = y;
        y = tmp;
    }

    $.jqx.getNum = function (arr) {
        if (!$.isArray(arr)) {
            if (isNaN(arr))
                return 0;
        }
        else {
            for (var i = 0; i < arr.length; i++)
                if (!isNaN(arr[i]))
                    return arr[i];
        }

        return 0;
    }

    $.jqx._ptrnd = function (val) {
        if (!document.createElementNS) {
            if (Math.round(val) == val)
                return val;
            return $.jqx._rnd(val, 1, false);
        }

        if (Math.abs(Math.round(val) - val) == 0.5)
            return val;

        var rnd = $.jqx._rnd(val, 1, false);
        return rnd - 0.5;
    }

    $.jqx._rup = function (n) {
        var nr = Math.round(n);
        if (n > nr)
            nr++;

        return nr;
    }

    $.jqx.log = function (val, base) {
        return Math.log(val) / (base ? Math.log(base) : 1);
    }


    $.jqx._rnd = function (num, unit, toGreater) {
        if (isNaN(num))
            return num;
        var a = num - num % unit;
        if (num == a)
            return a;

        if (toGreater) {
            if (num > a)
                a += unit;
        }
        else {
            if (a > num)
                a -= unit;
        }

        return a;
    }

    $.jqx.commonRenderer = {
        pieSlicePath: function (x, y, innerRadius, outerRadius, angleFrom, angleTo, centerOffset) {
            if (!outerRadius)
                outerRadius = 1;

            var diff = Math.abs(angleFrom - angleTo);
            var lFlag = diff > 180 ? 1 : 0;
            if (diff >= 360) {
                angleTo = angleFrom + 359.99;
            }
            var radFrom = angleFrom * Math.PI * 2 / 360;
            var radTo = angleTo * Math.PI * 2 / 360;

            var x1 = x, x2 = x, y1 = y, y2 = y;

            var isDonut = !isNaN(innerRadius) && innerRadius > 0;

            if (isDonut)
                centerOffset = 0;

            if (centerOffset + innerRadius > 0) {
                if (centerOffset > 0) {
                    var midAngle = diff / 2 + angleFrom;
                    var radMid = midAngle * Math.PI * 2 / 360;

                    x += centerOffset * Math.cos(radMid);
                    y -= centerOffset * Math.sin(radMid);
                }

                if (isDonut) {
                    var inR = innerRadius;
                    x1 = x + inR * Math.cos(radFrom);
                    y1 = y - inR * Math.sin(radFrom);
                    x2 = x + inR * Math.cos(radTo);
                    y2 = y - inR * Math.sin(radTo);
                }
            }

            var x3 = x + outerRadius * Math.cos(radFrom);
            var x4 = x + outerRadius * Math.cos(radTo);
            var y3 = y - outerRadius * Math.sin(radFrom);
            var y4 = y - outerRadius * Math.sin(radTo);

            var path = '';

            if (isDonut) {
                path = 'M ' + x2 + ',' + y2;
                path += ' a' + innerRadius + ',' + innerRadius;
                path += ' 0 ' + lFlag + ',1 ' + (x1 - x2) + ',' + (y1 - y2);
                path += ' L' + x3 + ',' + y3;
                path += ' a' + outerRadius + ',' + outerRadius;
                path += ' 0 ' + lFlag + ',0 ' + (x4 - x3) + ',' + (y4 - y3);
            }
            else {
                path = 'M ' + x4 + ',' + y4;
                path += ' a' + outerRadius + ',' + outerRadius;
                path += ' 0 ' + lFlag + ',1 ' + (x3 - x4) + ',' + (y3 - y4);
                path += ' L' + x + ',' + y + ' Z';
            }

            return path;
        }
    }

    $.jqx.svgRenderer = function () { }

    $.jqx.svgRenderer.prototype = {
        _svgns: "http://www.w3.org/2000/svg",

        init: function (host) {
            var s = "<table id=tblChart cellspacing='0' cellpadding='0' border='0' align='left' valign='top'><tr><td colspan=2 id=tdTop></td></tr><tr><td id=tdLeft></td><td class='chartContainer'></td></tr></table>";
            host.append(s);
            this.host = host;
            var container = host.find(".chartContainer");
            container[0].style.width = host.width() + 'px';
            container[0].style.height = host.height() + 'px';
            var offset;
            try {
                var svg = document.createElementNS(this._svgns, 'svg');
                svg.setAttribute('id', 'svgChart');
                svg.setAttribute('version', '1.1');
                svg.setAttribute('width', '100%');
                svg.setAttribute('height', '100%');
                //svg.setAttribute('shape-rendering', 'chispEdges'); //crisp-edges
                container[0].appendChild(svg);
                this.canvas = svg;
            }
            catch (e) {
                return false;
            }

            this._id = new Date().getTime();
            this.clear();

            this._layout();
            this._runLayoutFix();

            return true;
        },

        //[optimize]
        _runLayoutFix: function () {
            var self = this;
            this._fixLayout();
        },

        //[optimize]
        _fixLayout: function () {
            var offset = $(this.canvas).position();

            var pxleft = (parseFloat(offset.left) == parseInt(offset.left));
            var pxtop = (parseFloat(offset.top) == parseInt(offset.top));

            if ($.jqx.browser.msie) {
                var pxleft = true, pxtop = true;
                var el = this.host;
                var xdiff = 0, ydiff = 0;
                while (el && el.position && el[0].parentNode) {
                    var pos = el.position();
                    xdiff += parseFloat(pos.left) - parseInt(pos.left);
                    ydiff += parseFloat(pos.top) - parseInt(pos.top);
                    el = el.parent();
                }
                pxleft = parseFloat(xdiff) == parseInt(xdiff);
                pxtop = parseFloat(ydiff) == parseInt(ydiff);
            }

            if (!pxleft)
                this.host.find("#tdLeft")[0].style.width = '0.5px';
            if (!pxtop)
                this.host.find("#tdTop")[0].style.height = '0.5px';

        },

        //[optimize]
        _layout: function () {
            var offset = $(this.canvas).offset();
            var container = this.host.find(".chartContainer");
            this._width = Math.max($.jqx._rup(this.host.width()) - 1, 0);
            this._height = Math.max($.jqx._rup(this.host.height()) - 1, 0);

            container[0].style.width = this._width;
            container[0].style.height = this._height;

            this._fixLayout();
        },

        getRect: function () {
            return { x: 0, y: 0, width: this._width, height: this._height };
        },

        getContainer: function () {
            var container = this.host.find(".chartContainer");
            return container;
        },

        clear: function () {
            while (this.canvas.childElementCount > 0) {
                this.canvas.removeChild(this.canvas.firstElementChild);
            }

            this._defs = document.createElementNS(this._svgns, 'defs');
            this._gradients = {};
            this.canvas.appendChild(this._defs);
        },

        removeElement: function (element) {
            if (element != undefined) {
                try {
                    if (element.parentNode)
                        element.parentNode.removeChild(element);
                    else
                        this.canvas.removeChild(element);
                }
                catch (error) {
                }
            }
        },

        _openGroups: [],

        beginGroup: function () {
            var parent = this._activeParent();
            var g = document.createElementNS(this._svgns, 'g');
            parent.appendChild(g);
            this._openGroups.push(g);

            return g;
        },

        endGroup: function () {
            if (this._openGroups.length == 0)
                return;

            this._openGroups.pop();
        },

        _activeParent: function () {
            return this._openGroups.length == 0 ? this.canvas : this._openGroups[this._openGroups.length - 1];
        },

        //[optimize]
        createClipRect: function (rect) {
            var c = document.createElementNS(this._svgns, 'clipPath');
            var r = document.createElementNS(this._svgns, 'rect');
            this.attr(r, { x: rect.x, y: rect.y, width: rect.width, height: rect.height });

            this._clipId = this._clipId || 0;
            c.id = 'cl' + this._id + '_' + (++this._clipId).toString();
            c.appendChild(r);

            this._defs.appendChild(c);

            return c;
        },

        //[optimize]
        setClip: function (elem, clip) {
            return this.attr(elem, { 'clip-path': 'url(#' + clip.id + ')' });
        },

        _clipId: 0,

        //[optimize]
        addHandler: function (element, event, fn) {
            element['on' + event] = fn;
        },

        //[optimize]
        shape: function (name, params) {
            var s = document.createElementNS(this._svgns, name);
            if (!s)
                return undefined;

            for (var param in params)
                s.setAttribute(param, params[param]);

            this._activeParent().appendChild(s);

            return s;
        },

        //[optimize]
        measureText: function (text, angle, params) {
            var txt = document.createElementNS(this._svgns, 'text');
            this.attr(txt, params);
            txt.appendChild(txt.ownerDocument.createTextNode(text));

            var parent = this._activeParent();
            parent.appendChild(txt);
            var bbox = txt.getBBox();

            if (isNaN(bbox.width) || isNaN(bbox.height) || Math.abs(bbox.width) == Infinity || Math.abs(bbox.height) == Infinity) // fix for Opera SVG
                return { width: 0, height: 0 };

            var tw = $.jqx._rup(bbox.width);
            var th = $.jqx._rup(bbox.height);
            parent.removeChild(txt);

            if (angle == 0)
                return { width: tw, height: th };

            var rads = angle * Math.PI * 2 / 360;
            var sn = Math.abs(Math.sin(rads));
            var cs = Math.abs(Math.cos(rads));
            var bh = Math.abs(tw * sn + th * cs);
            var bw = Math.abs(tw * cs + th * sn);

            return { width: $.jqx._rup(bw), height: $.jqx._rup(bh) };
        },

        //[optimize]
        text: function (text, x, y, width, height, angle, params, clip, halign, valign) {
            var gClip;

            if (!halign)
                halign = 'center';
            if (!valign)
                valign = 'center';
            if (clip) {
                gClip = this.beginGroup();
                var crect = this.createClipRect({ x: $.jqx._rup(x) - 1, y: $.jqx._rup(y) - 1, width: $.jqx._rup(width) + 2, height: $.jqx._rup(height) + 2 });
                this.setClip(gClip, crect);
                //var r = this.rect(x, y, width, height);
                //this.attr(r, { fill: 'rgba(255,0,0,0.1)', stroke: 'red' });
            }

            var txt = document.createElementNS(this._svgns, 'text');
            this.attr(txt, params);
            txt.appendChild(txt.ownerDocument.createTextNode(text));

            var parent = this._activeParent();
            parent.appendChild(txt);
            var bbox = txt.getBBox();
            parent.removeChild(txt);

            var tw = bbox.width;
            var th = bbox.height * 0.6;

            var w = width || 0;
            var h = height || 0;

            if (!angle || angle == 0) {
                if (halign == 'center')
                    x += (w - tw) / 2;
                else if (halign == 'right')
                    x += (w - tw);

                y += th;

                if (valign == 'center')
                    y += (h - th) / 2;
                else if (valign == 'bottom')
                    y += h - th;

                if (!width)
                    width = tw;

                if (!height)
                    height = th;

                this.attr(txt, { x: $.jqx._rup(x), y: $.jqx._rup(y), width: $.jqx._rup(width), height: $.jqx._rup(height), cursor: 'default' });
                parent.appendChild(txt);
                this.endGroup();

                return txt; // parent == this.canvas ? txt : parent;
            }
            var rads = angle * Math.PI * 2 / 360;
            var sn = Math.sin(rads);
            var cs = Math.cos(rads);

            var h2 = th * cs + tw * sn;
            var w2 = tw * cs + th * sn;

            var ySave = y;
            var xSave = x;

            x += (width - w2) / 2;
            y += (height - h2) / 2;

            y += th * cs;

            if (halign == 'left') {
                if (cs > 0) {
                    x = xSave;
                    if (sn < 0)
                        x -= sn * th;
                }
                else {
                    x = xSave - cs * tw;
                    if (sn < 0)
                        x -= sn * th;
                }
            }
            else if (halign == 'right') {
                if (cs > 0) {
                    x = xSave + width - w2;
                    if (sn < 0)
                        x += sn * th;
                }
                else {
                    x = xSave + width;
                    if (sn >= 0)
                        x -= sn * th;
                }
            }

            if (valign == 'top') {
                if (sn < 0) {
                    y = ySave - sn * tw;
                    if (cs > 0)
                        y += cs * th;
                }
                else {
                    y = ySave;
                    if (cs > 0)
                        y = ySave + th * cs;
                }
            }
            else if (valign == 'bottom') {
                if (sn < 0) {
                    y = ySave + height;
                    if (cs <= 0)
                        y += th * cs;
                }
                else {
                    y = ySave + height - tw * sn;
                    if (cs < 0)
                        y += th * cs;
                }
            }

            x = $.jqx._rup(x);
            y = $.jqx._rup(y);

            var gTranslate = this.shape('g', { transform: 'translate(' + x + ',' + y + ')' });
            var gRotate = this.shape('g', { transform: 'rotate(' + angle + ')' });

            gTranslate.appendChild(gRotate);
            gRotate.appendChild(txt);

            parent.appendChild(gTranslate);

            this.endGroup();

            return gTranslate;
        },

        //[optimize]
        line: function (x1, y1, x2, y2, params) {
            var line = this.shape('line', { x1: x1, y1: y1, x2: x2, y2: y2 });
            this.attr(line, params);
        },

        //[optimize]
        path: function (points, params) {
            var s = this.shape('path');
            s.setAttribute('d', points);
            if (params) {
                this.attr(s, params);
            }
            return s;
        },

        //[optimize]
        rect: function (x, y, w, h, params) {
            x = $.jqx._ptrnd(x);
            y = $.jqx._ptrnd(y);
            w = $.jqx._rup(w);
            h = $.jqx._rup(h);
            var s = this.shape('rect', { x: x, y: y, width: w, height: h });
            if (params)
                this.attr(s, params);
            return s;
        },

        //[optimize]
        circle: function (x, y, r) {
            return this.shape('circle', { cx: x, cy: y, r: r });
        },

        //[optimize]
        pieSlicePath: function (x, y, innerRadius, outerRadius, angleFrom, angleTo, centerOffset) {
            return $.jqx.commonRenderer.pieSlicePath(x, y, innerRadius, outerRadius, angleFrom, angleTo, centerOffset);
        },

        //[optimize]
        pieslice: function (x, y, innerRadius, outerRadius, angleFrom, angleTo, centerOffset, params) {
            var pathCmd = this.pieSlicePath(x, y, innerRadius, outerRadius, angleFrom, angleTo, centerOffset);

            var s = this.shape('path');
            s.setAttribute('d', pathCmd);

            if (params)
                this.attr(s, params);

            return s;
        },

        //[optimize]
        attr: function (element, params) {
            if (!element || !params)
                return;
            for (var param in params) {
                if (param == "textContent")
                    element.textContent = params[param];
                else
                    element.setAttribute(param, params[param]);
            }
        },

        //[optimize]
        getAttr: function (element, key) {
            return element['getAttribute'](key);
        },

        //[optimize]
        _gradients: {},

        //[optimize]
        _toLinearGradient: function (color, isVertical, stops) {
            var id = 'grd' + color.replace('#', '') + (isVertical ? 'v' : 'h');
            var url = 'url(#' + id + ')';
            if (this._gradients[url])
                return url;

            var gr = document.createElementNS(this._svgns, 'linearGradient');
            this.attr(gr, { x1: '0%', y1: '0%', x2: isVertical ? '0%' : '100%', y2: isVertical ? '100%' : '0%', id: id });

            for (var stop in stops) {
                var s = document.createElementNS(this._svgns, 'stop');
                var st = 'stop-color:' + $.jqx._adjustColor(color, stops[stop][1]);
                this.attr(s, { offset: stops[stop][0] + '%', style: st });
                gr.appendChild(s);
            }

            this._defs.appendChild(gr);
            this._gradients[url] = true;

            return url;
        },

        //[optimize]
        _toRadialGradient: function (color, stops, coords) {
            var id = 'grd' + color.replace('#', '') + 'r' + (coords != undefined ? coords.key : '');

            var url = 'url(#' + id + ')';
            if (this._gradients[url])
                return url;

            var gr = document.createElementNS(this._svgns, 'radialGradient');
            if (coords == undefined)
                this.attr(gr, { cx: '50%', cy: '50%', r: '100%', fx: '50%', fy: '50%', id: id });
            else
                this.attr(gr, { cx: coords.x1, cy: coords.y1, r: coords.outerRadius, id: id, gradientUnits: 'userSpaceOnUse' });

            for (var stop in stops) {
                var s = document.createElementNS(this._svgns, 'stop');
                var st = 'stop-color:' + $.jqx._adjustColor(color, stops[stop][1]);
                this.attr(s, { offset: stops[stop][0] + '%', style: st });
                gr.appendChild(s);
            }

            this._defs.appendChild(gr);
            this._gradients[url] = true;

            return url;
        }

    } // svgRenderer

    $.jqx.vmlRenderer = function () { };
    $.jqx.vmlRenderer.prototype = {
        init: function (host) {
            var s = "<div class='chartContainer' style=\"position:relative;overflow:hidden;\"><div>";
            host.append(s);
            this.host = host;
            var container = host.find(".chartContainer");
            container[0].style.width = host.width() + 'px';
            container[0].style.height = host.height() + 'px';

            var addNamespace = true;

            try {
                for (var i = 0; i < document.namespaces.length; i++) {
                    if (document.namespaces[i].name == 'v' && document.namespaces[i].urn == "urn:schemas-microsoft-com:vml") {
                        addNamespace = false;
                        break;
                    }
                }
            }
            catch (e) {
                return false;
            }

            if ($.jqx.browser.msie && parseInt($.jqx.browser.version) < 9 &&
                (document.childNodes && document.childNodes.length > 0 && document.childNodes[0].data && document.childNodes[0].data.indexOf('DOCTYPE') != -1)
                ) {
                if (addNamespace) {
                    document.namespaces.add('v', 'urn:schemas-microsoft-com:vml');
                }

                this._ie8mode = true;
            }
            else {
                if (addNamespace) {
                    document.namespaces.add('v', 'urn:schemas-microsoft-com:vml');
                    document.createStyleSheet().cssText = "v\\:* { behavior: url(#default#VML); display: inline-block; }";
                }
            }

            this.canvas = container[0];

            this._width = Math.max($.jqx._rup(container.width()), 0);
            this._height = Math.max($.jqx._rup(container.height()), 0);

            container[0].style.width = this._width + 2;
            container[0].style.height = this._height + 2;

            this._id = new Date().getTime();
            this.clear();
            return true;
        },

        getRect: function () {
            return { x: 0, y: 0, width: this._width, height: this._height };
        },

        getContainer: function () {
            var container = this.host.find(".chartContainer");
            return container;
        },

        clear: function () {
            while (this.canvas.childElementCount > 0) {
                this.canvas.removeChild(this.canvas.firstElementChild);
            }

            this._gradients = {};
        },

        removeElement: function (element) {
            if (element != null) {
                element.parentNode.removeChild(element);
            }
        },

        _openGroups: [],

        beginGroup: function () {
            var parent = this._activeParent();
            var g = document.createElement('v:group');
            g.style.position = 'absolute';
            g.coordorigin = "0,0";
            g.coordsize = this._width + ',' + this._height;
            g.style.left = 0;
            g.style.top = 0;
            g.style.width = this._width;
            g.style.height = this._height;

            parent.appendChild(g);
            this._openGroups.push(g);
            return g;
        },

        endGroup: function () {
            if (this._openGroups.length == 0)
                return;

            this._openGroups.pop();
        },

        _activeParent: function () {
            return this._openGroups.length == 0 ? this.canvas : this._openGroups[this._openGroups.length - 1];
        },

        //[optimize]
        createClipRect: function (rect) {
            var div = document.createElement("div");
            div.style.height = rect.height + 'px';
            div.style.width = rect.width + 'px';
            div.style.position = 'absolute';
            div.style.left = rect.x + 'px';
            div.style.top = rect.y + 'px';
            div.style.overflow = 'hidden';

            this._clipId = this._clipId || 0;
            div.id = 'cl' + this._id + '_' + (++this._clipId).toString();
            this._activeParent().appendChild(div);
            return div;
        },

        //[optimize]
        setClip: function (elem, clip) {
            //if (elem.parentElement)
            //    elem.parentElement.removeChild(elem);

            clip.appendChild(elem);
        },

        _clipId: 0,

        //[optimize]
        addHandler: function (element, event, fn) {
            $(element).on(event, fn);
        },

        //[optimize]
        measureText: function (text, angle, params) {
            var txtbox = document.createElement('v:textbox');
            var span = document.createElement('span');
            span.appendChild(document.createTextNode(text));
            txtbox.appendChild(span);
            if (params['class'])
                span.className = params['class'];

            var parent = this._activeParent();
            parent.appendChild(txtbox);
            var box = $(txtbox);
            var tw = $.jqx._rup(box.width());
            var th = $.jqx._rup(box.height());
            parent.removeChild(txtbox);

            if (th == 0 && $.jqx.browser.msie && parseInt($.jqx.browser.version) < 9) {
                var fontSize = box.css('font-size');
                if (fontSize) {
                    th = parseInt(fontSize);
                    if (isNaN(th)) th = 0;
                }
            }

            if (angle == 0)
                return { width: tw, height: th };

            var rads = angle * Math.PI * 2 / 360;
            var sn = Math.abs(Math.sin(rads));
            var cs = Math.abs(Math.cos(rads));
            var bh = Math.abs(tw * sn + th * cs);
            var bw = Math.abs(tw * cs + th * sn);

            return { width: $.jqx._rup(bw), height: $.jqx._rup(bh) };
        },

        //[optimize]
        text: function (text, x, y, width, height, angle, params, clip, halign, valign) {
            var color = params.stroke || 'black';
            var gClip;

            if (!halign)
                halign = 'center';
            if (!valign)
                valign = 'center';
            clip = false;
            if (clip) {
                gClip = this.beginGroup();
                var crect = this.createClipRect({ x: $.jqx._rup(x), y: $.jqx._rup(y), width: $.jqx._rup(width), height: $.jqx._rup(height) });
                this.setClip(gClip, crect);
            }

            var txtbox = document.createElement('v:textbox');
            txtbox.style.position = 'absolute';

            var span = document.createElement('span');
            span.appendChild(document.createTextNode(text));
            if (params['class']) {
                span.className = params['class'];
            }
            txtbox.appendChild(span);

            var parent = this._activeParent();
            parent.appendChild(txtbox);

            var tw = $(txtbox).width();
            var th = $(txtbox).height();
            parent.removeChild(txtbox);

            var w = width || 0;
            var h = height || 0;

            if (!angle || angle == 0 || Math.abs(angle) != 90) {
                if (halign == 'center')
                    x += (w - tw) / 2;
                else if (halign == 'right')
                    x += (w - tw);

                if (valign == 'center')
                    y = y + (h - th) / 2;
                else if (valign == 'bottom')
                    y = y + h - th;

                if (!width)
                    width = tw;

                if (!height)
                    height = th;

                if (!gClip) {
                    txtbox.style.left = $.jqx._rup(x);
                    txtbox.style.top = $.jqx._rup(y);
                    txtbox.style.width = $.jqx._rup(width);
                    txtbox.style.height = $.jqx._rup(height);
                }
                parent.appendChild(txtbox);

                if (gClip) {
                    this.endGroup();
                    return parent;
                }

                return txtbox;
            }

            var rads = angle * Math.PI * 2 / 360;
            var bh = Math.abs(tw * Math.sin(rads) - th * Math.cos(rads));
            var bw = Math.abs(tw * Math.cos(rads) + th * Math.sin(rads));

            if (halign == 'center')
                x += (w - bw) / 2;
            else if (halign == 'right')
                x += (w - bw);

            if (valign == 'center')
                y = y + (h - bh) / 2;
            else if (valign == 'bottom')
                y = y + h - bh;

            x = $.jqx._rup(x);
            y = $.jqx._rup(y);
            var x2 = $.jqx._rup(x + bw);
            var y2 = $.jqx._rup(y + bh);

            if (Math.abs(angle) == 90) {
                parent.appendChild(txtbox);
                txtbox.style.left = $.jqx._rup(x);
                txtbox.style.top = $.jqx._rup(y);

                txtbox.style.filter = 'progid:DXImageTransform.Microsoft.BasicImage(rotation=3)';

                if (gClip) {
                    this.endGroup();
                    return parent;
                }

                return txtbox;
            }

            return txtbox;
        },

        //[optimize]
        shape: function (name, params) {
            var s = document.createElement(this._createElementMarkup(name));
            if (!s)
                return undefined;

            for (var param in params)
                s.setAttribute(param, params[param]);

            this._activeParent().appendChild(s);

            return s;
        },

        line: function (x1, y1, x2, y2, params) {
            var linePath = 'M ' + x1 + ',' + y1 + ' L ' + x2 + ',' + y2 + ' X E';
            var line = this.path(linePath);
            this.attr(line, params);
            return line;
        },

        _createElementMarkup: function (shape) {
            var str = '<v:' + shape + ' style=\"\">' + '</v:' + shape + '>';
            if (this._ie8mode) {
                str = str.replace('style=\"\"', 'style=\"behavior: url(#default#VML);\"');
            }

            return str;
        },

        //[optimize]
        path: function (points, params) {
            var shape = document.createElement(this._createElementMarkup('shape'));
            shape.style.position = 'absolute';
            shape.coordsize = this._width + ' ' + this._height;
            shape.coordorigin = '0 0';
            shape.style.width = parseInt(this._width);
            shape.style.height = parseInt(this._height);
            shape.style.left = 0;
            shape.style.top = 0;
            var path = document.createElement(this._createElementMarkup('path'));
            path.v = points;
            shape.appendChild(path);
            this._activeParent().appendChild(shape);
            if (params)
                this.attr(shape, params);

            return shape;
        },

        //[optimize]
        rect: function (x, y, w, h, params) {
            x = $.jqx._ptrnd(x);
            y = $.jqx._ptrnd(y);
            w = $.jqx._rup(w);
            h = $.jqx._rup(h);
            var vmlRect = this.shape('rect', params);
            vmlRect.style.position = 'absolute';
            vmlRect.style.left = x;
            vmlRect.style.top = y;
            vmlRect.style.width = w;
            vmlRect.style.height = h;
            vmlRect.strokeweight = 0;
            return vmlRect;
        },

        //[optimize]
        circle: function (x, y, r) {
            var vmlCircle = this.shape('oval');
            x = $.jqx._ptrnd(x - r);
            y = $.jqx._ptrnd(y - r);
            r = $.jqx._rup(r);
            vmlCircle.style.position = 'absolute';
            vmlCircle.style.left = x;
            vmlCircle.style.top = y;
            vmlCircle.style.width = r * 2;
            vmlCircle.style.height = r * 2;
            return vmlCircle;
        },

        updateCircle: function (circle, x, y, r) {
            if (x == undefined)
                x = parseFloat(circle.style.left) + parseFloat(circle.style.width) / 2;
            if (y == undefined)
                y = parseFloat(circle.style.top) + parseFloat(circle.style.height) / 2;
            if (r == undefined)
                r = parseFloat(circle.width) / 2;

            x = $.jqx._ptrnd(x - r);
            y = $.jqx._ptrnd(y - r);
            r = $.jqx._rup(r);
            circle.style.left = x;
            circle.style.top = y;
            circle.style.width = r * 2;
            circle.style.height = r * 2;
        },

        pieSlicePath: function (x, y, innerRadius, outerRadius, angleFrom, angleTo, centerOffset) {
            if (!outerRadius)
                outerRadius = 1;

            var diff = Math.abs(angleFrom - angleTo);
            var lFlag = diff > 180 ? 1 : 0;
            if (diff > 360) {
                angleFrom = 0;
                angleTo = 360;
            }
            var radFrom = angleFrom * Math.PI * 2 / 360;
            var radTo = angleTo * Math.PI * 2 / 360;

            var x1 = x, x2 = x, y1 = y, y2 = y;
            var isDonut = !isNaN(innerRadius) && innerRadius > 0;

            if (isDonut)
                centerOffset = 0;

            if (centerOffset > 0) {
                var midAngle = diff / 2 + angleFrom;
                var radMid = midAngle * Math.PI * 2 / 360;

                x += centerOffset * Math.cos(radMid);
                y -= centerOffset * Math.sin(radMid);
            }

            if (isDonut) {
                var inR = innerRadius;
                x1 = $.jqx._ptrnd(x + inR * Math.cos(radFrom));
                y1 = $.jqx._ptrnd(y - inR * Math.sin(radFrom));
                x2 = $.jqx._ptrnd(x + inR * Math.cos(radTo));
                y2 = $.jqx._ptrnd(y - inR * Math.sin(radTo));
            }

            var x3 = $.jqx._ptrnd(x + outerRadius * Math.cos(radFrom));
            var x4 = $.jqx._ptrnd(x + outerRadius * Math.cos(radTo));
            var y3 = $.jqx._ptrnd(y - outerRadius * Math.sin(radFrom));
            var y4 = $.jqx._ptrnd(y - outerRadius * Math.sin(radTo));

            outerRadius = $.jqx._ptrnd(outerRadius);
            innerRadius = $.jqx._ptrnd(innerRadius);

            x = $.jqx._ptrnd(x);
            y = $.jqx._ptrnd(y);

            var aStart = Math.round(angleFrom * 65535);
            var aEnd = Math.round(angleTo - angleFrom) * 65536;

            var path = '';
            if (isDonut) {
                path = 'M' + x1 + ' ' + y1;
                path += ' AE ' + x + ' ' + y + ' ' + innerRadius + ' ' + innerRadius + ' ' + aStart + ' ' + aEnd;
                path += ' L ' + x4 + ' ' + y4;
                aStart = Math.round(angleFrom - angleTo) * 65535;
                aEnd = Math.round(angleTo) * 65536;
                path += ' AE ' + x + ' ' + y + ' ' + outerRadius + ' ' + outerRadius + ' ' + aEnd + ' ' + aStart;
                path += ' L ' + x1 + ' ' + y1;
            }
            else {
                path = 'M' + x + ' ' + y;
                path += ' AE ' + x + ' ' + y + ' ' + outerRadius + ' ' + outerRadius + ' ' + aStart + ' ' + aEnd;
            }

            path += ' X E';

            return path;
        },

        pieslice: function (x, y, innerRadius, outerRadius, angleFrom, angleTo, centerOffset, params) {

            var pathCmd = this.pieSlicePath(x, y, innerRadius, outerRadius, angleFrom, angleTo, centerOffset);
            var el = this.path(pathCmd, params);

            if (params)
                this.attr(el, params);

            return el;
        },


        _keymap: [
                { svg: 'fill', vml: 'fillcolor' },
                { svg: 'stroke', vml: 'strokecolor' },
                { svg: 'stroke-width', vml: 'strokeweight' },
                { svg: 'fill-opacity', vml: 'fillopacity' },
                { svg: 'opacity', vml: 'opacity' },
                { svg: 'cx', vml: 'style.left' },
                { svg: 'cy', vml: 'style.top' },
                { svg: 'height', vml: 'style.height' },
                { svg: 'width', vml: 'style.width' },
                { svg: 'x', vml: 'style.left' },
                { svg: 'y', vml: 'style.top' },
                { svg: 'd', vml: 'v' }
                ],

        //[optimize]
        _translateParam: function (name) {
            for (var key in this._keymap) {
                if (this._keymap[key].svg == name)
                    return this._keymap[key].vml;
            }

            return name;
        },

        //[optimize]
        attr: function (element, params) {
            if (!element || !params)
                return;
            for (var param in params) {
                var vmlparam = this._translateParam(param);
                if (vmlparam == 'fillcolor' && params[param].indexOf('grd') != -1) {
                    element.type = params[param];
                }
                else if (vmlparam == 'opacity' || vmlparam == 'fillopacity') {
                    if (element.fill) {
                        element.fill.opacity = params[param];
                    }
                }
                else if (vmlparam == 'textContent') {
                    element.children[0].innerText = params[param];
                }
                else {
                    if (vmlparam.indexOf('style.') == -1)
                        element[vmlparam] = params[param];
                    else
                        element.style[vmlparam.replace('style.', '')] = params[param];
                }
            }
        },

        //[optimize]
        getAttr: function (element, key) {
            var vmlparam = this._translateParam(key);
            if (vmlparam == 'opacity' || vmlparam == 'fillopacity')
                if (element.fill) {
                    return element.fill.opacity;
                }
                else {
                    return 1;
                }

            if (vmlparam.indexOf('style.') == -1)
                return element[vmlparam];

            return element.style[vmlparam.replace('style.', '')];
        },

        //[optimize]
        _gradients: {},

        _toRadialGradient: function (color, isVertical, stops) {
            return color;
        },

        //[optimize]
        _toLinearGradient: function (color, isVertical, stops) {
            if (this._ie8mode) {
                return color;
            }

            var id = 'grd' + color.replace('#', '') + (isVertical ? 'v' : 'h');
            var ref = '#' + id + '';
            if (this._gradients[ref])
                return ref;

            var gr = document.createElement(this._createElementMarkup('fill'));
            gr.type = 'gradient';
            gr.method = 'linear';
            gr.angle = isVertical ? 0 : 90;

            var colors = '';
            for (var stop in stops) {
                if (stop > 0)
                    colors += ', ';
                colors += stops[stop][0] + '% ' + $.jqx._adjustColor(color, stops[stop][1]);
            }

            gr.colors = colors;

            var shapetype = document.createElement(this._createElementMarkup('shapetype'));
            shapetype.appendChild(gr);
            shapetype.id = id;

            this.canvas.appendChild(shapetype);

            return ref;
        }
    } // vmlRenderer

    /************************************************
    * jQWidgets HTML5 Canvas Renderer               *
    ************************************************/
    $.jqx.HTML5Renderer = function () { }

    $.jqx.ptrnd = function (val) {
        if (Math.abs(Math.round(val) - val) == 0.5)
            return val;

        var rnd = Math.round(val);
        if (rnd < val)
            rnd = rnd - 1;

        return rnd + 0.5;
    }


    $.jqx.HTML5Renderer.prototype = {
        _elements: {},

        init: function (host) {
            try {
                this.host = host;
                this.host.append("<canvas id='__jqxCanvasWrap' style='width:100%; height: 100%;'/>");
                this.canvas = host.find('#__jqxCanvasWrap');
                this.canvas[0].width = host.width();
                this.canvas[0].height = host.height();
                this.ctx = this.canvas[0].getContext('2d');
            }
            catch (e) {
                return false;
            }

            return true;
        },

        getContainer: function () {
            if (this.canvas && this.canvas.length == 1)
                return this.canvas;

            return undefined;
        },


        getRect: function () {
            return { x: 0, y: 0, width: this.canvas[0].width - 1, height: this.canvas[0].height - 1 };
        },

        beginGroup: function () {
            // TODO
        },

        endGroup: function () {
            // TODO
        },

        setClip: function () {
            // TODO
        },

        createClipRect: function (rect) {
            // TODO
        },

        addHandler: function (element, event, fn) {
            // TODO
            //element['on' + event] = fn;
        },


        clear: function () {
            this._elements = {};
            this._maxId = 0;
            this._renderers._gradients = {};
            this._gradientId = 0;
        },

        removeElement: function (element) {
            if (this._elements[element.id])
                delete this._elements[element, id];
        },

        _maxId: 0,

        shape: function (name, params) {
            var s = { type: name, id: this._maxId++ };

            for (var param in params)
                s[param] = params[param];

            this._elements[s.id] = s;

            return s;
        },

        attr: function (element, params) {
            for (var param in params)
                element[param] = params[param];
        },

        rect: function (x, y, w, h, params) {
            if (isNaN(x))
                throw 'Invalid value for "x"';
            if (isNaN(y))
                throw 'Invalid value for "y"';
            if (isNaN(w))
                throw 'Invalid value for "width"';
            if (isNaN(h))
                throw 'Invalid value for "height"';

            var s = this.shape('rect', { x: x, y: y, width: w, height: h });
            if (params)
                this.attr(s, params);
            return s;
        },

        path: function (pathCmd, params) {
            var s = this.shape('path', params);
            this.attr(s, { d: pathCmd });
            return s;
        },

        line: function (x1, y1, x2, y2, params) {
            return this.path('M ' + x1 + ',' + y1 + ' L ' + x2 + ',' + y2, params);
        },

        circle: function (x, y, r, params) {
            var s = this.shape('circle', { x: x, y: y, r: r });
            if (params)
                this.attr(s, params);
            return s;
        },

        pieSlicePath: function (x, y, innerRadius, outerRadius, angleFrom, angleTo, centerOffset) {
            return $.jqx.commonRenderer.pieSlicePath(x, y, innerRadius, outerRadius, angleFrom, angleTo, centerOffset);
        },

        pieslice: function (x, y, innerRadius, outerRadius, angleFrom, angleTo, centerOffset, params) {
            var element = this.path(this.pieSlicePath(x, y, innerRadius, outerRadius, angleFrom, angleTo, centerOffset), params);
            this.attr(element, { x: x, y: y, innerRadius: innerRadius, outerRadius: outerRadius, angleFrom: angleFrom, angleTo: angleTo });
            return element;
        },

        _getCSSStyle: function (name) {
            var sheets = document.styleSheets;
            try {
                for (var i = 0; i < sheets.length; i++) {
                    for (var j = 0; sheets[i].cssRules && j < sheets[i].cssRules.length; j++) {
                        if (sheets[i].cssRules[j].selectorText.indexOf(name) != -1)
                            return sheets[i].cssRules[j].style;
                    }
                }
            }
            catch (e) {
            }

            return {};
        },

        measureText: function (text, angle, params) {
            var fontFamily = 'Arial';
            var fontSize = '10pt';
            var fontWeight = '';
            if (params['class']) {
                var style = this._getCSSStyle(params['class']);
                if (style['fontSize'])
                    fontSize = style['fontSize'];
                if (style['fontFamily'])
                    fontFamily = style['fontFamily'];
                if (style['fontWeight'])
                    fontWeight = style['fontWeight'];
            }

            this.ctx.font = fontWeight + ' ' + fontSize + ' ' + fontFamily;
            var tw = this.ctx.measureText(text).width;

            var span = document.createElement("span");
            span.font = this.ctx.font;
            span.textContent = text;
            document.body.appendChild(span);
            var th = span.offsetHeight * 0.6;
            document.body.removeChild(span);

            if (angle == 0)
                return { width: tw, height: th };

            var rads = angle * Math.PI * 2 / 360;
            var sn = Math.abs(Math.sin(rads));
            var cs = Math.abs(Math.cos(rads));
            var bh = Math.abs(tw * sn + th * cs);
            var bw = Math.abs(tw * cs + th * sn);

            return { width: $.jqx._rup(bw), height: $.jqx._rup(bh) };
        },

        //[optimize]
        text: function (text, x, y, width, height, angle, params, clip, halign, valign) {
            var t = this.shape('text', { text: text, x: x, y: y, width: width, height: height, angle: angle, clip: clip, halign: halign, valign: valign });
            if (params) {
                this.attr(t, params);
            }

            t.fontFamily = 'Arial';
            t.fontSize = '10pt';
            t.fontWeight = '';
            t.color = '#000000';
            if (params['class']) {
                var style = this._getCSSStyle(params['class']);
                t.fontFamily = style.fontFamily || t.fontFamily;
                t.fontSize = style.fontSize || t.fontSize;
                t.fontWeight = style['fontWeight'] || t.fontWeight;
                t.color = style.color || t.color;
            }

            var sz = this.measureText(text, 0, params);
            t.textWidth = sz.width;
            t.textHeight = sz.height;

            return t;
        },

        _toLinearGradient: function (color, isVertical, stops) {
            if (this._renderers._gradients[color])
                return color;

            var colorStops = [];
            for (var i = 0; i < stops.length; i++)
                colorStops.push({ percent: stops[i][0] / 100, color: $.jqx._adjustColor(color, stops[i][1]) });

            var name = 'gr' + this._gradientId++;
            this.createGradient(name, isVertical ? 'vertical' : 'horizontal', colorStops);
            return name;
        },

        _toRadialGradient: function (color, stops) {
            if (this._renderers._gradients[color])
                return color;

            var colorStops = [];
            for (var i = 0; i < stops.length; i++)
                colorStops.push({ percent: stops[i][0] / 100, color: $.jqx._adjustColor(color, stops[i][1]) });

            var name = 'gr' + this._gradientId++;
            this.createGradient(name, 'radial', colorStops);
            return name;
        },

        _gradientId: 0,

        //[optimize]
        createGradient: function (name, orientation, colorStops) {
            this._renderers.createGradient(name, orientation, colorStops);
        },

        _renderers: {
            _gradients: {},

            //[optimize]
            createGradient: function (name, orientation, colorStops) {
                this._gradients[name] = { orientation: orientation, colorStops: colorStops };
            },

            setStroke: function (ctx, params) {
                ctx.strokeStyle = params['stroke'] || 'transparent';
                ctx.lineWidth = params['stroke-width'] || 1;
            },

            setFillStyle: function (ctx, params) {
                ctx.fillStyle = 'transparent';

                if (params['fill-opacity']) {
                    ctx.globalAlpha = params['fill-opacity'];
                }
                else {
                    ctx.globalAlpha = 1;
                }

                if (params.fill && params.fill.indexOf('#') == -1 && this._gradients[params.fill]) {
                    var isVertical = this._gradients[params.fill].orientation != 'horizontal';
                    var isRadial = this._gradients[params.fill].orientation == 'radial';
                    var x1 = $.jqx.ptrnd(params.x);
                    var y1 = $.jqx.ptrnd(params.y);
                    var x2 = $.jqx.ptrnd(params.x + (isVertical ? 0 : params.width));
                    var y2 = $.jqx.ptrnd(params.y + (isVertical ? params.height : 0));

                    var gradient;

                    if ((params.type == 'circle' || params.type == 'path') && isRadial) {
                        x = $.jqx.ptrnd(params.x);
                        y = $.jqx.ptrnd(params.y);
                        r1 = params.innerRadius || 0;
                        r2 = params.outerRadius || params.r || 0;
                        gradient = ctx.createRadialGradient(x, y, r1, x, y, r2);
                    }

                    if (!isRadial) {
                        if (isNaN(x1) || isNaN(x2) || isNaN(y1) || isNaN(y2)) {
                            x1 = 0;
                            y1 = 0;
                            x2 = isVertical ? 0 : ctx.canvas.width;
                            y2 = isVertical ? ctx.canvas.height : 0;
                        }

                        gradient = ctx.createLinearGradient(x1, y1, x2, y2);
                    }

                    var colorStops = this._gradients[params.fill].colorStops;
                    for (var i = 0; i < colorStops.length; i++)
                        gradient.addColorStop(colorStops[i].percent, colorStops[i].color);

                    ctx.fillStyle = gradient;
                }
                else if (params.fill) {
                    ctx.fillStyle = params.fill;
                }
            },

            rect: function (ctx, params) {
                ctx.fillRect($.jqx.ptrnd(params.x), $.jqx.ptrnd(params.y), params.width, params.height);
                ctx.strokeRect($.jqx.ptrnd(params.x), $.jqx.ptrnd(params.y), params.width, params.height);
            },

            circle: function (ctx, params) {
                if (params.r == 0)
                    return;
                ctx.beginPath();
                ctx.arc($.jqx.ptrnd(params.x), $.jqx.ptrnd(params.y), params.r, 0, Math.PI * 2, false);
                ctx.closePath();
                ctx.fill();
                ctx.stroke();
            },

            _parsePoint: function (str) {
                var x = this._parseNumber(str);
                var y = this._parseNumber(str);
                return ({ x: x, y: y });
            },

            _parseNumber: function (str) {
                var numStarted = false;
                for (var i = this._pos; i < str.length; i++) {
                    if ((str[i] >= '0' && str[i] <= '9') || str[i] == '.' || (str[i] == '-' && !numStarted)) {
                        numStarted = true;
                        continue;
                    }
                    if (!numStarted && (str[i] == ' ' || str[i] == ',')) {
                        this._pos++;
                        continue;
                    }

                    break;
                }

                var val = parseFloat(str.substring(this._pos, i));
                if (isNaN(val))
                    return undefined;

                this._pos = i;
                return val;
            },

            _pos: 0,
            _cmds: "mlcaz",
            _lastCmd: '',

            _isRelativeCmd: function (cmd) {
                return $.jqx.string.contains(this._cmds, cmd);
            },

            _parseCmd: function (string) {
                for (var i = this._pos; i < string.length; i++) {
                    if ($.jqx.string.containsIgnoreCase(this._cmds, string[i])) {
                        this._pos = i + 1;
                        this._lastCmd = string[i];
                        return this._lastCmd;
                    }
                    if (string[i] == ' ') {
                        this._pos++;
                        continue;
                    }
                    if (string[i] >= '0' && string[i] <= '9') {
                        this._pos = i /*+ 1*/;
                        if (this._lastCmd == '')
                            break;
                        else
                            return this._lastCmd;
                    }
                }

                return undefined;
            },

            _toAbsolutePoint: function (point) {
                return { x: this._currentPoint.x + point.x, y: this._currentPoint.y + point.y };
            },

            _currentPoint: { x: 0, y: 0 },

            path: function (ctx, params) {
                var path = params.d;

                this._pos = 0;
                this._lastCmd = '';

                var firstPoint = undefined;
                this._currentPoint = { x: 0, y: 0 };

                ctx.beginPath();

                var i = 0;
                while (this._pos < path.length) {
                    var cmd = this._parseCmd(path);
                    if (cmd == undefined)
                        break;

                    if (cmd == 'M' || cmd == 'm') {
                        var point = this._parsePoint(path);
                        if (point == undefined)
                            break;
                        ctx.moveTo(point.x, point.y);
                        this._currentPoint = point;
                        if (firstPoint == undefined)
                            firstPoint = point;

                        continue;
                    }

                    if (cmd == 'L' || cmd == 'l') {
                        var point = this._parsePoint(path);
                        if (point == undefined)
                            break;

                        ctx.lineTo(point.x, point.y);
                        this._currentPoint = point;
                        continue;
                    }

                    if (cmd == 'A' || cmd == 'a') {
                        var rx = this._parseNumber(path);
                        var ry = this._parseNumber(path);
                        var angle = this._parseNumber(path) * (Math.PI / 180.0);
                        var largeFlag = this._parseNumber(path);
                        var sweepFlag = this._parseNumber(path);
                        var endPoint = this._parsePoint(path);

                        if (this._isRelativeCmd(cmd)) {
                            endPoint = this._toAbsolutePoint(endPoint);
                        }

                        if (rx == 0 || ry == 0)
                            continue;

                        var cp = this._currentPoint;

                        /// START
                        // x1', y1'
                        var cp2 = {
                            x: Math.cos(angle) * (cp.x - endPoint.x) / 2.0 + Math.sin(angle) * (cp.y - endPoint.y) / 2.0,
                            y: -Math.sin(angle) * (cp.x - endPoint.x) / 2.0 + Math.cos(angle) * (cp.y - endPoint.y) / 2.0
                        };

                        // adjust radii
                        var adj = Math.pow(cp2.x, 2) / Math.pow(rx, 2) + Math.pow(cp2.y, 2) / Math.pow(ry, 2);
                        if (adj > 1) {
                            rx *= Math.sqrt(adj);
                            ry *= Math.sqrt(adj);
                        }

                        // cx', cy'
                        var s = (largeFlag == sweepFlag ? -1 : 1) * Math.sqrt(
								((Math.pow(rx, 2) * Math.pow(ry, 2)) - (Math.pow(rx, 2) * Math.pow(cp2.y, 2)) - (Math.pow(ry, 2) * Math.pow(cp2.x, 2))) /
								(Math.pow(rx, 2) * Math.pow(cp2.y, 2) + Math.pow(ry, 2) * Math.pow(cp2.x, 2))
							);

                        if (isNaN(s))
                            s = 0;

                        var cp3 = { x: s * rx * cp2.y / ry, y: s * -ry * cp2.x / rx };

                        // cx, cy
                        var centerPoint = {
                            x: (cp.x + endPoint.x) / 2.0 + Math.cos(angle) * cp3.x - Math.sin(angle) * cp3.y,
                            y: (cp.y + endPoint.y) / 2.0 + Math.sin(angle) * cp3.x + Math.cos(angle) * cp3.y
                        };

                        // vector magnitude
                        var m = function (v) { return Math.sqrt(Math.pow(v[0], 2) + Math.pow(v[1], 2)); }

                        // ratio between two vectors
                        var r = function (u, v) { return (u[0] * v[0] + u[1] * v[1]) / (m(u) * m(v)) }

                        // angle between two vectors
                        var a = function (u, v) { return (u[0] * v[1] < u[1] * v[0] ? -1 : 1) * Math.acos(r(u, v)); }

                        // initial angle
                        var startAngle = a([1, 0], [(cp2.x - cp3.x) / rx, (cp2.y - cp3.y) / ry]);

                        // angle delta
                        var u = [(cp2.x - cp3.x) / rx, (cp2.y - cp3.y) / ry];
                        var v = [(-cp2.x - cp3.x) / rx, (-cp2.y - cp3.y) / ry];
                        var deltaAngle = a(u, v);
                        if (r(u, v) <= -1)
                            deltaAngle = Math.PI;

                        if (r(u, v) >= 1)
                            deltaAngle = 0;

                        if (sweepFlag == 0 && deltaAngle > 0)
                            deltaAngle = deltaAngle - 2 * Math.PI;

                        if (sweepFlag == 1 && deltaAngle < 0)
                            deltaAngle = deltaAngle + 2 * Math.PI;

                        var r = (rx > ry) ? rx : ry;
                        var sx = (rx > ry) ? 1 : rx / ry;
                        var sy = (rx > ry) ? ry / rx : 1;

                        ctx.translate(centerPoint.x, centerPoint.y);
                        ctx.rotate(angle);
                        ctx.scale(sx, sy);
                        ctx.arc(0, 0, r, startAngle, startAngle + deltaAngle, 1 - sweepFlag);
                        ctx.scale(1 / sx, 1 / sy);
                        ctx.rotate(-angle);

                        ctx.translate(-centerPoint.x, -centerPoint.y);

                        continue;
                    }

                    if ((cmd == 'Z' || cmd == 'z') && firstPoint != undefined) {
                        ctx.lineTo(firstPoint.x, firstPoint.y);
                        this._currentPoint = firstPoint;
                        continue;
                    }

                    if (cmd == 'C' || cmd == 'c') {
                        var p1 = this._parsePoint(path);
                        var p2 = this._parsePoint(path);
                        var p3 = this._parsePoint(path);

                        ctx.bezierCurveTo(p1.x, p1.y, p2.x, p2.y, p3.x, p3.y);
                        this._currentPoint = p3;
                        continue;
                    }

                }

                ctx.fill();
                ctx.stroke();
                ctx.closePath();
            },

            text: function (ctx, params) {
                var x = $.jqx.ptrnd(params.x);
                var y = $.jqx.ptrnd(params.y);
                var width = $.jqx.ptrnd(params.width);
                var height = $.jqx.ptrnd(params.height);
                var halign = params.halign;
                var valign = params.valign;
                var angle = params.angle;
                var clip = params.clip || true;

                ctx.save();

                if (!halign)
                    halign = 'center';
                if (!valign)
                    valign = 'center';

                if (clip) {
                    ctx.rect(x - 2, y - 2, width + 5, height + 5);
                    ctx.clip();
                }

                var tw = params.textWidth;
                var th = params.textHeight;

                var w = width || 0;
                var h = height || 0;

                ctx.fillStyle = params.color;
                ctx.font = params.fontWeight + ' ' + params.fontSize + ' ' + params.fontFamily;

                if (!angle || angle == 0) {
                    if (halign == 'center')
                        x += (w - tw) / 2;
                    else if (halign == 'right')
                        x += (w - tw);

                    y += th;

                    if (valign == 'center')
                        y += (h - th) / 2;
                    else if (valign == 'bottom')
                        y += h - th;

                    if (!width)
                        width = tw;

                    if (!height)
                        height = th;

                    ctx.fillText(params.text, x, y);
                    ctx.restore();
                    return;
                }
                var rads = angle * Math.PI * 2 / 360;
                var sn = Math.sin(rads);
                var cs = Math.cos(rads);

                var h2 = th * cs + tw * sn;
                var w2 = tw * cs + th * sn;

                var ySave = y;
                var xSave = x;

                x += (width - w2) / 2;
                y += (height - h2) / 2;

                y += th * cs;

                if (halign == 'left') {
                    if (cs > 0) {
                        x = xSave;
                        if (sn < 0)
                            x -= sn * th;
                    }
                    else {
                        x = xSave - cs * tw;
                        if (sn < 0)
                            x -= sn * th;
                    }
                }
                else if (halign == 'right') {
                    if (cs > 0) {
                        x = xSave + width - w2;
                        if (sn < 0)
                            x += sn * th;
                    }
                    else {
                        x = xSave + width;
                        if (sn >= 0)
                            x -= sn * th;
                    }
                }

                if (valign == 'top') {
                    if (sn < 0) {
                        y = ySave - sn * tw;
                        if (cs > 0)
                            y += cs * th;
                    }
                    else {
                        y = ySave;
                        if (cs > 0)
                            y = ySave + th * cs;
                    }
                }
                else if (valign == 'bottom') {
                    if (sn < 0) {
                        y = ySave + height;
                        if (cs <= 0)
                            y += th * cs;
                    }
                    else {
                        y = ySave + height - tw * sn;
                        if (cs < 0)
                            y += th * cs;
                    }
                }

                x = $.jqx._rup(x);
                y = $.jqx._rup(y);

                ctx.translate(x, y);
                ctx.rotate(rads);
                ctx.fillText(params.text, 0, 0);

                ctx.restore();
            }

        },

        refresh: function () {
            this.ctx.clearRect(0, 0, this.canvas[0].width, this.canvas[0].height);
            for (var element in this._elements) {
                var params = this._elements[element];

                this._renderers.setFillStyle(this.ctx, params);
                this._renderers.setStroke(this.ctx, params);

                this._renderers[this._elements[element].type](this.ctx, params);
            }
        }
    } // End of jQWidgets HTML5 renderer


})(jQuery);
