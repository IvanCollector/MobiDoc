/*
jQWidgets v2.7.0 (2013-Feb-08)
Copyright (c) 2011-2013 jQWidgets.
License: http://jqwidgets.com/license/
*/

/*****************************************************************************************************************
 *
 *  Dependencies (only if the plugin 
 *  must be integrated with the jQWidgets framework, otherwise it can work independently):
 *      1) jquery.js
 *      2) jqxcore.js
 *      3) jqxdata.js
 *
 *  This file defines few objects used for exportation of arrays (meeting common format) to strings (and files)
 *  with structure same as different file formats (CSV, TSV, XLS, XML, HTML).
 *
 *  The base module which is responsible for the exportation is $.jqx.dataAdapter.ArrayExporter. This module is
 *  coupled with the array format. ArrayExporter can be extended with different modules used for convertion.
 *  Here is a sample, how the module can be extended with custom exporter:
 *
 *      $.jqx.dataAdapter.ArrayExporter.extend('custom-format', new CustomExporter());
 *
 *  The first parameter of the extend method is the format name and the second one is the exportation module.
 *  All exportation modules must implement the DataExportModuleBase interface for working properly.
 *  The exportation modules are not coupled with the array format.
 *
 *  Array meeting required format can be exported to the "custom-format", defined above, using:
 *
 *      var exporter = $.jqx.dataAdapter.ArrayExporter(data, dataFields, styles);
 *      exporter.exportTo('custom-format');
 *
 *  For saving the file using server side PHP can be used the following method:
 *
 *      exporter.exportToFile('format', 'filename');
 *
 *  For saving the file using only JavaScript:
 *
 *      exporter.exportToLocalFile('format', 'filename');
 *
 *****************************************************************************************************************/

(function ($) {
    var ArrayExporter = (function () {

        var exportModules = {},
            data, dataFields, styles, exporter, stylesArray;

        function exportData(exporter) {
            exporter.beginFile();
            exportHeader(exporter);
            exportContent(exporter);
            exporter.endFile();
            return exporter.getFile();
        }

        function exportHeader(exporter) {
            var exportHeaders = true;
            $.each(dataFields, function () {
                if (this.hidden) {
                    exportHeaders = false;
                    return false;
                }
            });

            exporter.beginHeader(exportHeaders);
            for (var cellContent in dataFields) {
                var style = getHeaderStyle(cellContent, dataFields[cellContent]);
                exporter.appendHeaderCell(dataFields[cellContent], cellContent, style, exportHeaders);
            }
            exporter.endHeader(exportHeaders);
        }

        function exportContent(exporter) {
            exporter.beginBody();
            for (var i = 0; i < data.length; i += 1) {
                exportRow(exporter, data[i], i);
            }
            exporter.endBody();
        }

        function exportRow(exporter, data, rowId) {
            var style;
            exporter.beginRow();
            for (var column in dataFields) {
                style = getRowCellStyle(rowId, column);
                if (data.hasOwnProperty(column)) {
                    exporter.appendBodyCell(data[column], dataFields[column], style);
                }
                else {
                    exporter.appendBodyCell("", dataFields[column], style);
                }
            }
            exporter.endRow();
        }

        function getHeaderStyle(columnName, dataField) {
            if (dataField.style) {
                return styles[dataField.style];
            }

            var rowStyles = getStylesArray();
            if (rowStyles.length > 0) {
                return rowStyles[0].style;
            }
            return null;
        }

        function getStylesArray() {
            if (!stylesArray) {
                stylesArray = new Array();
                $.each(styles, function (index, value) {
                    stylesArray[stylesArray.length] = { name: index, style: value };
                });
            }

            return stylesArray;
        }

        function getRowCellStyle(rowId, column) {
            if (dataFields[column]) {
                if (dataFields[column].cellStyle) {
                    var dataField = dataFields[column];
                    if (dataFields[column].cellAltStyle) {
                        var styleId = rowId % 2;
                        if (styleId == 0)
                            return styles[dataField.cellStyle];
                        return styles[dataField.cellAltStyle];
                    }
                    return styles[dataField.cellStyle];
                }
                else {
                    var rowStyles = getStylesArray();
                    if (rowStyles.length > 0) {
                        var styleId = rowId % (rowStyles.length - 1);
                        var style = rowStyles[styleId + 1].style;
                        return style;
                    }
                }
            }
            return null;
        }

        function createHiddenInput(value, name, form) {
            var input = document.createElement('input');
            input.name = name;
            input.value = value;
            input.type = 'hidden';
            form.appendChild(input);
            return input;
        }

        function createHiddenTextArea(value, name, form) {
            var textArea = document.createElement('textarea');
            textArea.name = name;
            textArea.value = value;
            //      textArea.type = 'hidden';
            form.appendChild(textArea);
            return textArea;
        }

        function createForm(filename, format, content, exportServer) {
            var form = document.createElement('form');
            createHiddenInput(filename, 'filename', form);
            createHiddenInput(format, 'format', form);
            createHiddenTextArea(content, 'content', form);
            if (exportServer == undefined || exportServer == '')
                exportServer = 'http://jquerygrid.net/export_server/save-file.php';

            form.action = exportServer;
            form.method = 'post';
            document.body.appendChild(form);
            return form;
        }

        exporter = function (inputData, inputDataFields, inputStyles, exportServer) {
            if (!(this instanceof ArrayExporter)) {
                return new ArrayExporter(inputData, inputDataFields, inputStyles);
            }
            data = inputData;
            dataFields = inputDataFields;
            styles = inputStyles;

            this.exportTo = function (format) {
                format = format.toString().toLowerCase();
                var module = exportModules[format];
                if (typeof module === 'undefined') {
                    throw 'You can\'t export to ' + format + ' format.';
                }
                return exportData(module, data, dataFields, styles);
            };

            this.exportToFile = function (format, filename, exportServer) {
                var content = this.exportTo(format),
                    form = createForm(filename, format, content, exportServer);
                form.submit();
                document.body.removeChild(form);
            };

            this.exportToLocalFile = function (format, filename) {
                var content = this.exportTo(format);
                document.location.href = 'data:application/octet-stream;filename=' + filename + ',' + encodeURIComponent(content);
            };

        };

        exporter.extend = function (exportFormat, exporter) {
            if (exporter instanceof $.jqx.dataAdapter.DataExportModuleBase) {
                exportModules[exportFormat] = exporter;
            } else {
                throw 'The module ' + exportFormat + ' is not instance of DataExportModuleBase.';
            }
        };

        return exporter;

    }());

    $.jqx.dataAdapter.ArrayExporter = ArrayExporter;

})(jQuery);


(function ($) {

    //Defines common interface for all modules used for exportation
    var DataExportModuleBase = function () {

        this.formatData = function (data, type, formatString, localization) {
            if (type === 'date') {
                var tmpdate = "";
                if (typeof data === 'string') {
                    tmpdate = $.jqx.dataFormat.tryparsedate(data);
                    data = tmpdate;
                }
                if (data === "" || data == null) return "";
                tmpdate = $.jqx.dataFormat.formatdate(data, formatString, localization);
                if (tmpdate.toString() == "NaN" || tmpdate == null) return "";
                data = tmpdate;
            } else if (type === 'number') {
                if (data === "" || data == null) return "";

                if (!isNaN(new Number(data))) {
                    var tmpdata = $.jqx.dataFormat.formatnumber(data, formatString, localization);
                    if (tmpdata.toString() == "NaN") return "";
                    else data = tmpdata;
                }
            } else {
                data = data;
            }
            if (data == null) return "";
            return data;
        };

        this.getFormat = function (dataOptions) {
            var formatString = dataOptions ? dataOptions['formatString'] : "";
            var localization = dataOptions ? dataOptions['localization'] : "";
            var dataType = 'string';
            dataType = dataOptions ? dataOptions['type'] : 'string';

            if (dataType == 'number') {
                if (!formatString) formatString = 'n2';
            }
            if (dataType == 'date') {
                if (!formatString) formatString = 'd';
            }
            return { type: dataType, formatString: formatString, localization: localization };
        };

        this.beginFile = function () {
            throw 'Not implemented!';
        };

        this.beginHeader = function () {
            throw 'Not implemented!';
        };

        this.appendHeaderCell = function () {
            throw 'Not implemented!';
        };

        this.endHeader = function () {
            throw 'Not implemented!';
        };

        this.beginBody = function () {
            throw 'Not implemented!';
        };

        this.beginRow = function () {
            throw 'Not implemented!';
        };

        this.appendBodyCell = function () {
            throw 'Not implemented!';
        };

        this.endRow = function () {
            throw 'Not implemented!';
        };

        this.endBody = function () {
            throw 'Not implemented!';
        };

        this.endFile = function () {
            throw 'Not implemented!';
        };

        this.getFile = function () {
            throw 'Not implemented!';
        };
    }

    $.jqx.dataAdapter.DataExportModuleBase = DataExportModuleBase;

})(jQuery);

//Extending the exporter with TSV and CSV exporters
(function ($) {

    //Value exporter. This object is common prototype for TSV and CVS.
    var SvExporter = function (inValueSeparator) {

        var file, valueSeparator, hasHeader;
        var rowIndex = 0;
        var me = this;

        this.beginFile = function () {
            file = '';
        };

        this.beginHeader = function () {
        };

        this.appendHeaderCell = function (data, fieldName, style, exportHeader) {
            hasHeader = exportHeader;
            if (exportHeader) {
                appendCell(data.text);
            }
        };

        this.endHeader = function () {
            this.endRow();
        };

        this.beginBody = function () {
            rowIndex = 0;
        };

        this.beginRow = function () {
            if ((rowIndex > 0) || (rowIndex == 0 && hasHeader)) {
                file += '\n';
            }
            rowIndex++;
        };

        this.appendBodyCell = function (data, dataType) {
            appendCell(data, dataType);
        };

        this.endRow = function () {
            file = file.substring(0, file.length - 1);
        };

        this.endBody = function () {
        };

        this.endFile = function () {
        };

        this.getFile = function () {
            return file;
        };

        function prepareData(data, dataOptions) {
            if (dataOptions) {
                var format = me.getFormat(dataOptions);
                data = me.formatData(data, format.type, format.formatString, format.localization);
            }
            if (data.toString().indexOf(valueSeparator) >= 0) {
                data = '"' + data + '"';
            }
            return data;
        };

        function appendCell(data, dataOptions) {
            data = prepareData(data, dataOptions);
            file += data + inValueSeparator;
        };

    };

    SvExporter.prototype = new $.jqx.dataAdapter.DataExportModuleBase();

    var CsvExporter = function () { };
    CsvExporter.prototype = new SvExporter(',');

    var TsvExporter = function () { };
    TsvExporter.prototype = new SvExporter('\t');

    $.jqx.dataAdapter.ArrayExporter.extend('csv', new CsvExporter());
    $.jqx.dataAdapter.ArrayExporter.extend('tsv', new TsvExporter());

})(jQuery);

//Extending the exporter with HTML exporter
(function ($) {

    var HtmlExporter = function () {
        var isPDF = false;
        var file;
        var hasHeader;
        var rowIndex = 0;

        this.setPDF = function () {
            isPDF = true;
        };

        this.beginFile = function () {
            if (isPDF) {
                file = '<table style="empty-cells: show;" cellspacing="0" cellpadding="2">';
            }
            else {
                file = '<html>\n\t<head>\n\t\t<title></title>\n' +
					   '\t\t<meta http-equiv=Content-type content=\"text/html; charset=UTF-8\">\n\t</head>\n\t<body>\n' +
					   '\t\t<table style="empty-cells: show;" cellspacing="0" cellpadding="2">';
            }
        };

        this.beginHeader = function () {
            if (isPDF) {
                file += '\n\t<thead><tr>';
            }
            else {
                file += '\n\t\t\t<thead>';
            }
        };

        this.appendHeaderCell = function (data, fieldName, style, exportHeader) {
            hasHeader = exportHeader;
            if (!exportHeader) return;

            if (isPDF) {
                file += '\n\t\t\t\t<th style="' + buildStyle(style) + '">' + data.text + '</th>';
            }
            else {
                if (data.width) {
                    file += '\n\t\t\t\t<th style="width: ' + data.width + 'px; ' + buildStyle(style) + '">' + data.text + '</th>';
                }
                else {
                    file += '\n\t\t\t\t<th style="' + buildStyle(style) + '">' + data.text + '</th>';
                }
            }
        };

        this.endHeader = function () {
            if (isPDF) {
                file += '\n\t</tr></thead>';
            }
            else {
                file += '\n\t\t\t</thead>';
            }
        };

        this.beginBody = function () {
            if (isPDF) {
                file += '\n\t<tbody>';
            }
            else {
                file += '\n\t\t\t<tbody>';
            }
            rowIndex = 0;
        };

        this.beginRow = function () {
            if (isPDF) {
                file += '\n\t<tr>';
            }
            else {
                file += '\n\t\t\t\t<tr>';
            }
            rowIndex++;
        };

        this.appendBodyCell = function (data, dataOptions, style) {
            var format = this.getFormat(dataOptions);
            if (data === "") data = "&nbsp;";
            if (isPDF) {
                if (rowIndex == 1 && !hasHeader) {
                    file += '\n\t\t\t\t\t<td style="' + buildStyle(style) + ' border-top-width: 1px;">' + this.formatData(data, format.type, format.formatString, format.localization) + '</td>';
                }
                else {
                    file += '\n\t\t\t\t\t<td style="' + buildStyle(style) + '">' + this.formatData(data, format.type, format.formatString, format.localization) + '</td>';
                }    
            }
            else {
                if (rowIndex == 1 && !hasHeader) {
                    file += '\n\t\t\t\t\t<td style="' + buildStyle(style) + ' border-top-width: 1px;">' + this.formatData(data, format.type, format.formatString, format.localization) + '</td>';
                }
                else {
                    file += '\n\t\t\t\t\t<td style="' + buildStyle(style) + '">' + this.formatData(data, format.type, format.formatString, format.localization) + '</td>';
                }
            }
        };

        this.endRow = function () {
            if (isPDF) {
                file += '\n\t</tr>';
            }
            else {
                file += '\n\t\t\t\t</tr>';
            }
        };

        this.endBody = function () {
            if (isPDF) {
                file += '\n\t</tbody>';
            }
            else {
                file += '\n\t\t\t</tbody>';
            }
        };

        this.endFile = function () {
            if (isPDF) {
                file += '\n</table>';
            }
            else {
                file += '\n\t\t</table>\n\t</body>\n</html>\n';
            }
        };

        this.getFile = function () {
            return file;
        };

        function buildStyle(styles) {
            var result = '';
            for (var style in styles) {
                if (styles.hasOwnProperty(style)) {
                    if (isPDF && style == 'font-size') {
                        styles[style] = '100%';
                    }
                    result += style + ':' + styles[style] + ';';
                }
            }
            return result;
        }
    }

    HtmlExporter.prototype = new $.jqx.dataAdapter.DataExportModuleBase();

    var TableExporter = function () { };
    TableExporter.prototype = new HtmlExporter();

    var PDFExporter = function () { };
    PDFExporter.prototype = new HtmlExporter();
    var exporter = new PDFExporter();
    exporter.setPDF();

    $.jqx.dataAdapter.ArrayExporter.extend('html', new TableExporter());
    $.jqx.dataAdapter.ArrayExporter.extend('pdf', exporter);

})(jQuery);

//Exporting to XLS format (MS Office Excel 2003)
(function ($) {

    var ExcelExporter = function () {

        var header, content, headerFields, headerStyles, existingStyles, styleCounter,
            styleBuilder = {

                style: '',

                stylesMap: {
                    'font': {
                        'color': 'Color',
                        'font-family': 'FontName',
                        'font-style': 'Italic',
                        'font-weight': 'Bold'
                    },
                    'interior': {
                        'background-color': 'Color',
                        'background': 'Color'
                    },
                    'alignment': {
                        'left': 'Left',
                        'center': 'Center',
                        'right': 'Right'
                    }
                },

                startStyle: function (styleName) {
                    this.style += '\n\t\t<ss:Style ss:ID="' + styleName + '" ss:Name="' + styleName + '">';
                },

                buildAlignment: function (styles) {
                    if (styles['text-align']) {
                        var alignment = this.stylesMap['alignment'][styles['text-align']];
                        var style = '\n\t\t\t<ss:Alignment ss:Vertical="Bottom" ss:Horizontal="' + alignment + '"/>';
                        this.style += style;
                    }
                },

                buildBorder: function (styles) {
                    if (styles['border-color']) {
                        var border = '\n\t\t\t<ss:Borders>';
                        var bottomBorder = '\n\t\t\t\t<Border ss:Position="Bottom" ss:LineStyle="Continuous" ss:Weight="1" ss:Color="' + styles['border-color'] + '"/>';
                        var leftBorder = '\n\t\t\t\t<Border ss:Position="Left" ss:LineStyle="Continuous" ss:Weight="1" ss:Color="' + styles['border-color'] + '"/>';
                        var rightBorder = '\n\t\t\t\t<Border ss:Position="Right" ss:LineStyle="Continuous" ss:Weight="1" ss:Color="' + styles['border-color'] + '"/>';
                        var topBorder = '\n\t\t\t\t<Border ss:Position="Top" ss:LineStyle="Continuous" ss:Weight="1" ss:Color="' + styles['border-color'] + '"/>';

                        border += bottomBorder;
                        border += leftBorder;
                        border += rightBorder;
                        border += topBorder;
                        border += '\n\t\t\t</ss:Borders>';
                        this.style += border;
                    }
                },

                buildFont: function (styles) {
                    var map = this.stylesMap['font'],
                        font = '\n\t\t\t<ss:Font ';
                    for (var prop in map) {
                        if (typeof styles[prop] !== 'undefined') {
                            if (prop === 'font-style' && styles[prop].toString().toLowerCase() === 'italic') {
                                font += 'ss:Italic="1" ';
                            } else if (prop === 'font-weight' && styles[prop].toString().toLowerCase() === 'bold') {
                                font += 'ss:Bold="1" ';
                            } else if (prop === 'color') {
                                font += 'ss:' + map[prop] + '="' + styles[prop] + '" ';
                            }
                        }
                    }
                    font += '/>';
                    this.style += font;
                },

                buildInterior: function (styles) {
                    var map = this.stylesMap['interior'],
                        interior = '\n\t\t\t<ss:Interior ';
                    var hasInterior = false;
                    for (var prop in map) {
                        if (typeof styles[prop] !== 'undefined') {
                            interior += 'ss:' + map[prop] + '="' + styles[prop] + '" ';
                            hasInterior = true;
                        }
                    }
                    if (hasInterior)
                        interior += 'ss:Pattern="Solid"';

                    interior += '/>';
                    this.style += interior;
                },

                buildFormat: function (styles) {
                    if (styles['dataType'] == 'number') {
                        var formatString = styles['formatString'];
                        if (formatString == "" || formatString.indexOf('n') != -1) {
                            this.style += '\n\t\t\t<ss:NumberFormat ss:Format="#,##0.00_);[Red]\(#,##0.00\)"/>';
                        }
                        else if (formatString.indexOf('p') != -1) {
                            this.style += '\n\t\t\t<ss:NumberFormat ss:Format="Percent"/>';
                        }
                        else if (formatString.indexOf('c') != -1) {
                            if (parseInt(styles['currencysymbol'].charCodeAt(0)) == 8364)
                            {
                                 this.style += '\n\t\t\t<ss:NumberFormat ss:Format="Euro Currency"/>';
                            }
                            else
                            {
                                this.style += '\n\t\t\t<ss:NumberFormat ss:Format="Currency"/>';
                            }
                        }
                    }
                    else if (styles['dataType'] == 'date') {
                        this.style += '\n\t\t\t<ss:NumberFormat ss:Format="Short Date"/>';
                    }
                },

                closeStyle: function () {
                    this.style += '\n\t\t</ss:Style>';
                },

                toString: function () {
                    var temp = this.style;
                    this.style = '';
                    return temp;
                }
            };

        this.beginFile = function () {
            existingStyles = {};
            styleCounter = 0;
            header = '<?xml version="1.0"?>' +
                            '\n\t<?mso-application progid="Excel.Sheet"?> ' +
                            '\n\t<Workbook xmlns="urn:schemas-microsoft-com:office:spreadsheet" ' +
                            '\n\txmlns:o="urn:schemas-microsoft-com:office:office" ' +
                            '\n\txmlns:x="urn:schemas-microsoft-com:office:excel" ' +
                            '\n\txmlns:ss="urn:schemas-microsoft-com:office:spreadsheet" ' +
                            '\n\txmlns:html="http://www.w3.org/TR/REC-html40"> ' +
                            '\n\t<DocumentProperties xmlns="urn:schemas-microsoft-com:office:office"> ' +
                            '\n\t<Version>12.00</Version> ' +
                            '\n\t</DocumentProperties> ' +
                            '\n\t<ExcelWorkbook xmlns="urn:schemas-microsoft-com:office:excel"> ' +
                            '\n\t<WindowHeight>8130</WindowHeight> ' +
                            '\n\t<WindowWidth>15135</WindowWidth> ' +
                            '\n\t<WindowTopX>120</WindowTopX> ' +
                            '\n\t<WindowTopY>45</WindowTopY> ' +
                            '\n\t<ProtectStructure>False</ProtectStructure> ' +
                            '\n\t<ProtectWindows>False</ProtectWindows> ' +
                            '\n\t</ExcelWorkbook> ' +
                        '\n\t<ss:Styles>';
        };

        this.beginHeader = function () {
            content = '\n\t<ss:Worksheet ss:Name="Sheet1">\n\t\t<ss:Table>';
            headerFields = [];
            headerStyles = [];
        };

        this.appendHeaderCell = function (data, fieldName, style) {
            var width = data.width != undefined ? data.width : data.text.length * 10;
            content += '\n\t\t\t<ss:Column ss:Width="' + width + '"/>';
            headerFields.push(data);
            headerStyles.push(style);
        };

        this.endHeader = function (exportHeader) {
            if (exportHeader) {
                this.beginRow();
                for (var i = 0; i < headerFields.length; i += 1) {
                    appendCell.call(this, headerFields[i]['text'], null, headerStyles[i]);
                }
                this.endRow();
            }
        };

        this.beginBody = function () {
        };

        this.beginRow = function () {
            content += '\n\t\t\t<ss:Row>';
        };

        this.appendBodyCell = function (data, dataType, style) {
            appendCell.call(this, data, dataType, style);
        };

        this.endRow = function () {
            content += '\n\t\t\t</ss:Row>';
        };

        this.endBody = function () {
            content += '\n\t\t</ss:Table>';
        };

        this.endFile = function () {
            content += '\n\t</ss:Worksheet>\n</ss:Workbook>';
            header += '\n\t</ss:Styles>';
        };

        this.getFile = function () {
            return header + content;
        };

        function appendCell(data, dataOptions, style) {
            var columnType = "String";

            var format = this.getFormat(dataOptions);
            
            if (format.type == 'date')
            {
                data = this.formatData(data, format.type, format.formatString, format.localization);
            }

            if (style.dataType == 'number')
            {
                columnType = "Number";
                data = parseFloat(data);
                style.currencysymbol = dataOptions.localization.currencysymbol;
            }
            var styleId = getStyleId(style);
            content += '\n\t\t\t\t<ss:Cell ss:StyleID="' + styleId + '"><ss:Data ss:Type="' + columnType + '">' + data + '</ss:Data></ss:Cell>';
        }

        function generateStyleId() {
            styleCounter += 1;
            return 'xls-style-' + styleCounter;
        }

        function findStyle(style) {
            for (var s in existingStyles) {
                if (isSubset(style, existingStyles[s]) && isSubset(existingStyles[s], style)) {
                    return s;
                }
            }
            return undefined;
        }

        function isSubset(first, second) {
            var subset = true;
            for (var p in first) {
                if (first[p] !== second[p]) {
                    subset = false;
                }
            }
            return subset;
        }

        function appendStyle(id, style) {
            styleBuilder.startStyle(id);
            styleBuilder.buildAlignment(style);
            styleBuilder.buildBorder(style);
            styleBuilder.buildFont(style);
            styleBuilder.buildInterior(style);
            styleBuilder.buildFormat(style);
            styleBuilder.closeStyle();
            header += styleBuilder.toString();
        }

        function getStyleId(style) {
            if (!style) {
                return '';
            }
            var id = findStyle(style);
            if (typeof id === 'undefined') {
                id = generateStyleId();
                existingStyles[id] = style;
                appendStyle(id, style);
            }
            return id;
        }
    }

    ExcelExporter.prototype = new $.jqx.dataAdapter.DataExportModuleBase();
    $.jqx.dataAdapter.ArrayExporter.extend('xls', new ExcelExporter());
})(jQuery);

//Exporting to XML
(function ($) {

    var XmlExporter = function () {

        var file, headerFields, index;

        this.beginFile = function () {
            file = '<?xml version="1.0" encoding="UTF-8" ?>';
            file += '\n<table>';
        }

        this.beginHeader = function () {
            headerFields = [];
        }

        this.appendHeaderCell = function (data, fieldName) {
            headerFields.push(fieldName);
        }

        this.endHeader = function () {
        }

        this.beginBody = function (data, dataType) {
        }

        this.beginRow = function () {
            file += '\n\t<row>';
            index = 0;
        }

        this.appendBodyCell = function (data, dataOptions) {
            var format = this.getFormat(dataOptions);
            data = this.formatData(data, format.type, format.formatString, format.localization);

            file += '\n\t\t<' + headerFields[index] + '>' + data + '</' + headerFields[index] + '>';
            index++;
        }

        this.endRow = function () {
            file += '\n\t</row>';
            index = 0;
        }

        this.endBody = function () {
        }

        this.endFile = function () {
            file += '\n</table>';
        }

        this.getFile = function () {
            return file;
        }
    }

    XmlExporter.prototype = new $.jqx.dataAdapter.DataExportModuleBase();
    $.jqx.dataAdapter.ArrayExporter.extend('xml', new XmlExporter());
})(jQuery);


//Exporting to JSON
(function ($) {

    var escapable = /[\\\"\x00-\x1f\x7f-\x9f\u00ad\u0600-\u0604\u070f\u17b4\u17b5\u200c-\u200f\u2028-\u202f\u2060-\u206f\ufeff\ufff0-\uffff]/g,
        meta = {
            '\b': '\\b',
            '\t': '\\t',
            '\n': '\\n',
            '\f': '\\f',
            '\r': '\\r',
            '"': '\\"',
            '\\': '\\\\'
        };

    function quote(string) {
        return '"' + string.replace(escapable, function (a) {
            var c = meta[a];
            return typeof c === 'string' ? c : '\\u' + ('0000' + a.charCodeAt(0).toString(16)).slice(-4);
        }) + '"';
    }

    function formatNumber(n) {
        return n < 10 ? '0' + n : n;
    }

    function stringifyDate(value) {
        var date;
        if (isFinite(value.valueOf())) {
            date = value.getUTCFullYear() + '-' + formatNumber(value.getUTCMonth() + 1) + '-' +
            formatNumber(value.getUTCDate()) + 'T' + formatNumber(value.getUTCHours()) + ':' +
            formatNumber(value.getUTCMinutes()) + ':' + formatNumber(value.getUTCSeconds()) + 'Z"';
        } else {
            date = 'null';
        }
        return date;
    }

    function stringifyArray(value) {
        var len = value.length,
            partial = [],
            i;
        for (i = 0; i < len; i++) {
            partial.push(str(i, value) || 'null');
        }

        return '[' + partial.join(',') + ']';
    }

    function stringifyObject(value) {
        var partial = [],
            i, v;
        for (i in value) {
            if (Object.prototype.hasOwnProperty.call(value, i)) {
                v = str(i, value);
                if (v) {
                    partial.push(quote(i) + ':' + v);
                }
            }
        }
        return '{' + partial.join(',') + '}';
    }

    function stringifyReference(value) {
        switch (Object.prototype.toString.call(value)) {
            case '[object Date]':
                return stringifyDate(value);
            case '[object Array]':
                return stringifyArray(value);
        }
        return stringifyObject(value);
    }

    function stringifyPrimitive(value, type) {
        switch (type) {
            case 'string':
                return quote(value);
            case 'number':
                return isFinite(value) ? value : 'null';
            case 'boolean':
                return value;
        }
        return 'null';
    }

    function str(key, holder) {
        var value = holder[key], type = typeof value;

        if (value && typeof value === 'object' && typeof value.toJSON === 'function') {
            value = value.toJSON(key);
            type = typeof value;
        }
        if (/(number|string|boolean)/.test(type) || (!value && type === 'object')) {
            return stringifyPrimitive(value, type);
        } else {
            return stringifyReference(value);
        }
    }

    function stringify(value) {
        if (window.JSON && typeof window.JSON.stringify === 'function') {
            return window.JSON.stringify(value);
        }

        return str("", { "": value });
    }

    var JsonExporter = function () {

        var file,
            content,
            currentCell;

        this.beginFile = function () {
            content = [];
        }

        this.beginHeader = function () {
        }

        this.appendHeaderCell = function (data) {
        }

        this.endHeader = function () {
        }

        this.beginBody = function (data, dataType) {
        }

        this.beginRow = function () {
            currentCell = {};
        }

        this.appendBodyCell = function (data, dataType) {
            currentCell[dataType['text']] = data;
        }

        this.endRow = function () {
            content.push(currentCell);
        }

        this.endBody = function () {
        }

        this.endFile = function () {
            file = stringify(content);
        }

        this.getFile = function () {
            return file;
        }
    }

    JsonExporter.prototype = new $.jqx.dataAdapter.DataExportModuleBase();
    $.jqx.dataAdapter.ArrayExporter.extend('json', new JsonExporter());

})(jQuery);

