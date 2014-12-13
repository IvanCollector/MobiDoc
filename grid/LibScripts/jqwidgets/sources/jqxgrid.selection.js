/*
jQWidgets v2.7.0 (2013-Feb-08)
Copyright (c) 2011-2013 jQWidgets.
License: http://jqwidgets.com/license/
*/

(function ($) {

    $.extend($.jqx._jqxGrid.prototype, {
        // selects a row by index.
        selectrow: function (index, refresh) {
            this._applyrowselection(index, true, refresh);
        },

        selectallrows: function () {
            this.clearselection(false);
            var length = this.dataview.records.length;
            if (length > 0) {
                for (var i = 0; i < length; i++) {
                    if (i < length - 1) {
                        this.selectrow(i, false);
                    }
                    else this.selectrow(i, true);
                }
            }
        },

        // unselects a row by index.
        unselectrow: function (index, refresh) {
            this._applyrowselection(index, false, refresh);
        },

        // selects a cell.
        selectcell: function (row, datafield) {
            this._applycellselection(row, datafield, true);
        },

        // unselects a cell.
        unselectcell: function (row, datafield) {
            this._applycellselection(row, datafield, false);
        },

        // clears the selection.
        clearselection: function (refresh) {
            this.selectedrowindex = -1;

            for (var i = 0; i < this.selectedrowindexes.length; i++) {
                this._raiseEvent(3, { rowindex: this.selectedrowindexes[i] });
            }

            this.selectedrowindexes = new Array();
            this.selectedcells = new Array();
            if (!refresh)
                return;

            this._renderrows(this.virtualsizeinfo);
        },

        // gets the selected row index.
        getselectedrowindex: function () {
            return this.selectedrowindex;
        },

        // gets the selected row index.
        getselectedrowindexes: function () {
            return this.selectedrowindexes;
        },

        // gets the selected cell.
        getselectedcell: function () {
            return this.selectedcell;
        },

        // gets the selected cells.
        getselectedcells: function () {
            var cells = new Array();
            for (obj in this.selectedcells) {
                cells[cells.length] = this.selectedcells[obj];
            }

            return cells;
        },

        _getcellsforcopypaste: function () {
            var cells = new Array();
            if (this.selectionmode.indexOf('cell') == -1) {
                var rows = this.selectedrowindexes;
                for (var j = 0; j < rows.length; j++) {
                    var index = rows[j];
                    for (var i = 0; i < this.columns.records.length; i++) {
                        var uniquekey = index + "_" + this.columns.records[i].datafield;
                        var cell = { rowindex: index, datafield: this.columns.records[i].datafield };
                        cells.push(cell);
                    }
                }
            }
            return cells;
        },

        deleteselection: function () {
            var self = this;
            var cells = self.getselectedcells();
            if (this.selectionmode.indexOf('cell') == -1) {
                cells = this._getcellsforcopypaste();
            }
            if (cells != null && cells.length > 0) {
                for (var cellIndex = 0; cellIndex < cells.length; cellIndex++) {
                    var cell = cells[cellIndex];
                    var column = self.getcolumn(cell.datafield);
                    var cellValue = self.getcellvalue(cell.rowindex, cell.datafield);
                    if (cellValue !== "") {
                        var newvalue = null;
                        if (column.columntype == "checkbox") {
                            if (!column.threestatecheckbox) {
                                newvalue = false;
                            }
                        }
                        self._raiseEvent(17, { rowindex: cell.rowindex, datafield: cell.datafield, value: cellValue });
                        if (cellIndex == cells.length - 1) {
                            self.setcellvalue(cell.rowindex, cell.datafield, newvalue, true);
                            if (column.displayfield != column.datafield) {
                                self.setcellvalue(cell.rowindex, column.displayfield, newvalue, true);
                            }
                        }
                        else {
                            self.setcellvalue(cell.rowindex, cell.datafield, newvalue, false);
                            if (column.displayfield != column.datafield) {
                                self.setcellvalue(cell.rowindex, column.displayfield, newvalue, true);
                            } 
                        }
                        self._raiseEvent(18, { rowindex: cell.rowindex, datafield: cell.datafield, oldvalue: cellValue, value: newvalue });
                    }
                }
                this.dataview.updateview();
                this._renderrows(this.virtualsizeinfo);
            }
        },

        copyselection: function () {
            var selectedtext = "";
            var self = this;
            this.clipboardselection = {};
            this._clipboardselection = [];
            var cells = self.getselectedcells();
            if (this.selectionmode.indexOf('cell') == -1) {
                cells = this._getcellsforcopypaste();
            }

            if (cells != null && cells.length > 0) {
                var minrowindex = 999999999999999;
                var maxrowindex = -1;
                for (var cellIndex = 0; cellIndex < cells.length; cellIndex++) {
                    var cell = cells[cellIndex];
                    var column = self.getcolumn(cell.datafield);
                    var cellValue = self.getcellvalue(cell.rowindex, cell.datafield);
                    if (!this.clipboardselection[cell.rowindex]) this.clipboardselection[cell.rowindex] = {};
                    this.clipboardselection[cell.rowindex][cell.datafield] = cellValue;
                    minrowindex = Math.min(minrowindex, cell.rowindex);
                    maxrowindex = Math.max(maxrowindex, cell.rowindex);
                }
                for (var i = minrowindex; i <= maxrowindex; i++) {
                    var x = 0;
                    this._clipboardselection[this._clipboardselection.length] = new Array();
                    if (this.clipboardselection[i] != undefined) {
                        $.each(this.clipboardselection[i], function (index, value) {
                            if (x > 0) selectedtext += "\t";
                            var text = value;
                            if (value == null) text = "";
                            self._clipboardselection[self._clipboardselection.length - 1][x] = text;
                            x++;
                            selectedtext += text;
                        });
                    }
                    if (i < maxrowindex) {
                        selectedtext += '\n';
                    }
                }
            }
            this.clipboardselectedtext = selectedtext;
            return selectedtext;
        },

        pasteselection: function () {
            var cells = this.getselectedcells();
            if (this.selectionmode.indexOf('cell') == -1) {
                cells = this._getcellsforcopypaste();
            }
            if (cells != null && cells.length > 0) {
                var rowindex = cells[0].rowindex;
                var datafield = cells[0].datafield;
                var columnindex = this._getcolumnindex(datafield);
                var x = 0;
                if (!this._clipboardselection) return;
                for (var row = 0; row < this._clipboardselection.length; row++) {
                    for (var c = 0; c < this._clipboardselection[row].length; c++) {
                        var column = this.getcolumnat(columnindex + c);
                        if (!column) continue;

                        var cell = this.getcell(rowindex + row, column.datafield);
                        var cellvalue = null;
                        cellvalue = this._clipboardselection[row][c];
                        if (cellvalue != null) {
                            this._raiseEvent(17, { rowindex: rowindex + row, datafield: cell.datafield, value: cellvalue });
                            this.setcellvalue(cell.row, cell.column, cellvalue, false);
                            this._raiseEvent(18, { rowindex: rowindex + row, datafield: cell.datafield, oldvalue: this.getcellvalue(cell.rowindex, cell.datafield), value: cellvalue });
                            this._applycellselection(rowindex + row, cell.datafield, true, false);
                        }
                    }
                }

                this.dataview.updateview();
                this._renderrows(this.virtualsizeinfo);
            }
        },

        _applyrowselection: function (index, select, refresh, multiplerows, column) {
            if (index == null)
                return false;

            var oldindex = this.selectedrowindex;

            if (this.selectionmode == 'singlerow') {
                if (select) {
                    this._raiseEvent(2, { rowindex: index, row: this.getrowdata(index) });
                }
                else {
                    this._raiseEvent(3, { rowindex: index, row: this.getrowdata(index) });
                }

                this._raiseEvent(3, { rowindex: oldindex });
                this.selectedrowindexes = new Array();
                this.selectedcells = new Array();
            }

            if (multiplerows == true) {
                this.selectedrowindexes = new Array();
            }

            var indexIn = this.selectedrowindexes.indexOf(index);

            if (select) {
                this.selectedrowindex = index;

                if (this.selectedrowindexes.indexOf(index) == -1) {
                    this.selectedrowindexes.push(index);

                    if (this.selectionmode != 'singlerow') {
                        this._raiseEvent(2, { rowindex: index, row: this.getrowdata(index) });
                    }
                }
                else if (this.selectionmode == 'multiplerows') {
                    this.selectedrowindexes.splice(indexIn, 1);
                    this._raiseEvent(3, { rowindex: this.selectedrowindex, row: this.getrowdata(index) });
                    this.selectedrowindex = this.selectedrowindexes.length > 0 ? this.selectedrowindexes[this.selectedrowindexes.length - 1] : -1;
                }
            }
            else if (indexIn >= 0 || this.selectionmode == 'singlerow' || this.selectionmode == 'multiplerowsextended') {
                this.selectedrowindexes.splice(indexIn, 1);
                this._raiseEvent(3, { rowindex: this.selectedrowindex, row: this.getrowdata(index) });
                this.selectedrowindex = -1;
            }

            if (refresh == undefined || refresh) {
                this._rendervisualrows();
            }

            return true;
        },

        _applycellselection: function (index, column, select, refresh) {
            if (index == null)
                return false;

            if (column == null)
                return false;

            var oldindex = this.selectedrowindex;

            if (this.selectionmode == 'singlecell') {
                var oldcell = this.selectedcell;
                if (oldcell != null) {
                    this._raiseEvent(16, { rowindex: oldcell.rowindex, datafield: oldcell.datafield });
                }
                this.selectedcells = new Array();
            }

            if (this.selectionmode == 'multiplecellsextended' || this.selectionmode == 'multiplecellsadvanced') {
                var oldcell = this.selectedcell;
                if (oldcell != null) {
                    this._raiseEvent(16, { rowindex: oldcell.rowindex, datafield: oldcell.datafield });
                }
            }

            var uniquekey = index + "_" + column;

            var cell = { rowindex: index, datafield: column };
            if (select) {
                this.selectedcell = cell;
                if (!this.selectedcells[uniquekey]) {
                    this.selectedcells[uniquekey] = cell;
                    this.selectedcells.length++;
                    this._raiseEvent(15, cell);
                }
                else if (this.selectionmode == "multiplecells") {
                    this.selectedcells[uniquekey] = undefined;
                    this.selectedcells.length--;
                    this._raiseEvent(16, cell);
                }
            }
            else {
                this.selectedcells[uniquekey] = undefined;
                this.selectedcells.length--;
                this._raiseEvent(16, cell);
            }

            if (refresh == undefined || refresh) {
                this._rendervisualrows();
            }

            return true;
        },

        _getcellindex: function (uniquekey) {
            var id = -1;
            $.each(this.selectedcells, function () {
                id++;
                if (this[uniquekey]) {
                    return false;
                }
            });
            return id;
        },

        _clearhoverstyle: function () {
            if (undefined == this.hoveredrow || this.hoveredrow == -1)
                return;

            if (this.vScrollInstance.isScrolling())
                return;

            if (this.hScrollInstance.isScrolling())
                return;

            var cells = this.table.find('.jqx-grid-cell-hover');

            if (cells.length > 0) {
                cells.removeClass(this.toTP('jqx-grid-cell-hover'));
                cells.removeClass(this.toTP('jqx-fill-state-hover'));
            }
            this.hoveredrow = -1;
        },

        _clearselectstyle: function () {
            var rowscount = this.table[0].rows.length;
            var rows = this.table[0].rows;
            var selectclass = this.toTP('jqx-grid-cell-selected');
            var selectclass2 = this.toTP('jqx-fill-state-pressed');
            var hoverclass = this.toTP('jqx-grid-cell-hover');
            var hoverclass2 = this.toTP('jqx-fill-state-hover');

            for (var i = 0; i < rowscount; i++) {
                var tablerow = rows[i];
                var cellslength = tablerow.cells.length;
                var cells = tablerow.cells;
                for (var j = 0; j < cellslength; j++) {
                    var tablecell = cells[j];
                    var $tablecell = $(tablecell);
                    if (tablecell.className.indexOf('jqx-grid-cell-selected') != -1) {
                        $tablecell.removeClass(selectclass);
                        $tablecell.removeClass(selectclass2);
                    }

                    if (tablecell.className.indexOf('jqx-grid-cell-hover') != -1) {
                        $tablecell.removeClass(hoverclass);
                        $tablecell.removeClass(hoverclass2);
                    }
                }
            }
        },

        _selectpath: function (row, column) {
            var self = this;
            var minRow = this._lastClickedCell ? Math.min(this._lastClickedCell.row, row) : 0;
            var maxRow = this._lastClickedCell ? Math.max(this._lastClickedCell.row, row) : 0;
            if (minRow <= maxRow) {
                var index1 = this._getcolumnindex(this._lastClickedCell.column);
                var index2 = this._getcolumnindex(column);
                var minColumn = Math.min(index1, index2);
                var maxColumn = Math.max(index1, index2);
                this.selectedcells = new Array();

                for (var r = minRow; r <= maxRow; r++) {
                    for (var c = minColumn; c <= maxColumn; c++) {
                        this._applycellselection(r, self._getcolumnat(c).datafield, true, false);
                    }
                }
                this._rendervisualrows();
            }
        },

        _selectrowpath: function (row) {
            if (this.selectionmode == 'multiplerowsextended') {
                var self = this;
                var minRow = this._lastClickedCell ? Math.min(this._lastClickedCell.row, row) : 0;
                var maxRow = this._lastClickedCell ? Math.max(this._lastClickedCell.row, row) : 0;
                if (minRow <= maxRow) {
                    this.selectedrowindexes = new Array();
                    for (var r = minRow; r <= maxRow; r++) {
                        this._applyrowselection(r, true, false);
                    }
                    this._rendervisualrows();
                }
            }
        },

        _selectrowwithmouse: function (self, rowinfo, oldindexes, column, ctrlKey, shiftKey) {
            var row = rowinfo.row;

            if (row == undefined)
                return;

            var index = rowinfo.index;
            var tablerow = this.hittestinfo[index].visualrow;

            if (this.hittestinfo[index].details) {
                return;
            }

            var cellclass = tablerow.cells[0].className;
            if (row.group) {
                return;
            }

            if (this.selectionmode == 'multiplerows' || this.selectionmode == 'multiplecells' || (this.selectionmode.indexOf('multiple') != -1 && (shiftKey == true || ctrlKey == true))) {
                var hasindex = oldindexes.indexOf(row.boundindex) != -1;
                var key = row.boundindex + "_" + column;

                if (this.selectionmode.indexOf('cell') != -1) {
                    var hascellindex = this.selectedcells[key] != undefined;
                    if (this.selectedcells[key] != undefined && hascellindex) {
                        this._selectcellwithstyle(self, false, index, column, tablerow);
                    }
                    else {
                        this._selectcellwithstyle(self, true, index, column, tablerow);
                    }
                    if (shiftKey && this._lastClickedCell == undefined) {
                        var cells = this.getselectedcells();
                        if (cells && cells.length > 0) {
                            this._lastClickedCell = { row: cells[0].rowindex, column: cells[0].datafield };
                        }
                    }
                    if (shiftKey && this._lastClickedCell) {
                        this._selectpath(row.boundindex, column);
                        this.mousecaptured = false;
                        if (this.selectionarea.css('visibility') == 'visible') {
                            this.selectionarea.css('visibility', 'hidden');
                        }
                    }
                }
                else {
                    if (hasindex) {
                        if (ctrlKey) {
                            this._applyrowselection(row.boundindex, false);
                        }
                        else {
                            this._selectrowwithstyle(self, tablerow, false, column);
                        }
                    }
                    else {
                        this._selectrowwithstyle(self, tablerow, true, column);
                    }

                    if (shiftKey && this._lastClickedCell == undefined) {
                        var indexes = this.getselectedrowindexes();
                        if (indexes && indexes.length > 0) {
                            this._lastClickedCell = { row: indexes[0], column: column };
                        }
                    }
                    if (shiftKey && this._lastClickedCell) {
                        this.selectedrowindexes = new Array();
                        var minRow = this._lastClickedCell ? Math.min(this._lastClickedCell.row, row.boundindex) : 0;
                        var maxRow = this._lastClickedCell ? Math.max(this._lastClickedCell.row, row.boundindex) : 0;
                        for (var r = minRow; r <= maxRow; r++) {
                            this._applyrowselection(r, true, false, false);
                        }
                        this._rendervisualrows();
                    }
                }
            }
            else {
                this._clearselectstyle();
                this._selectrowwithstyle(self, tablerow, true, column);
                if (this.selectionmode.indexOf('cell') != -1) {
                    this._selectcellwithstyle(self, true, index, column, tablerow);
                }
            }
            if (!shiftKey) {
                this._lastClickedCell = { row: row.boundindex, column: column };
            }
        },

        _selectcellwithstyle: function (self, select, row, column, tablerow) {
            var cell = $(tablerow.cells[self._getcolumnindex(column)]);
            cell.removeClass(this.toTP('jqx-grid-cell-hover'));
            cell.removeClass(this.toTP('jqx-fill-state-hover'));
            if (select) {
                cell.addClass(this.toTP('jqx-grid-cell-selected'));
                cell.addClass(this.toTP('jqx-fill-state-pressed'));
            }
            else {
                cell.removeClass(this.toTP('jqx-grid-cell-selected'));
                cell.removeClass(this.toTP('jqx-fill-state-pressed'));
            }
        },

        _selectrowwithstyle: function (self, tablerow, select, column) {
            var cellslength = tablerow.cells.length;

            var startindex = 0;
            if (self.rowdetails && self.showrowdetailscolumn) {
                startindex = 1;
            }

            for (var i = startindex; i < cellslength; i++) {
                var tablecell = tablerow.cells[i];
                if (select) {
                    $(tablecell).removeClass(this.toTP('jqx-grid-cell-hover'));
                    $(tablecell).removeClass(this.toTP('jqx-fill-state-hover'));

                    if (self.selectionmode.indexOf('cell') == -1) {
                        $(tablecell).addClass(this.toTP('jqx-grid-cell-selected'));
                        $(tablecell).addClass(this.toTP('jqx-fill-state-pressed'));
                    }
                }
                else {
                    $(tablecell).removeClass(this.toTP('jqx-grid-cell-hover'));
                    $(tablecell).removeClass(this.toTP('jqx-grid-cell-selected'));
                    $(tablecell).removeClass(this.toTP('jqx-fill-state-hover'));
                    $(tablecell).removeClass(this.toTP('jqx-fill-state-pressed'));
                }
            }
        },

        _handlemousemoveselection: function (event, self) {
            if ((self.selectionmode == 'multiplerowsextended' || self.selectionmode == 'multiplecellsextended' || self.selectionmode == 'multiplecellsadvanced') && self.mousecaptured) {
                var columnheaderheight = this.showheader ? this.columnsheader.height() + 2 : 0;
                var groupsheaderheight = this._groupsheader() ? this.groupsheader.height() : 0;
                var toolbarheight = this.showtoolbar ? this.toolbarheight : 0;
                groupsheaderheight += toolbarheight;
                var hostoffset = this.host.offset();
                if (this.hasTransform) {
                    hostoffset = $.jqx.utilities.getOffset(this.host);
                }
                var bodyOffset = this._getBodyOffset();
                hostoffset.left += bodyOffset.left;
                hostoffset.top += bodyOffset.top;
                var x = event.pageX;
                var y = event.pageY - groupsheaderheight;

                if (Math.abs(this.mousecaptureposition.left - x) > 3 || Math.abs(this.mousecaptureposition.top - y) > 3) {
                    var columnheadertop = parseInt(this.columnsheader.offset().top);
                    if (this.hasTransform) {
                        columnheadertop = $.jqx.utilities.getOffset(this.columnsheader).top;
                    }
                    if (x < hostoffset.left) {
                        x = hostoffset.left;
                    }

                    if (x > hostoffset.left + this.host.width()) {
                        x = hostoffset.left + this.host.width();
                    }
                    var columnheaderbottom = hostoffset.top + columnheaderheight;
                    if (y < columnheaderbottom) y = columnheaderbottom + 5;
                    var rectleft = parseInt(Math.min(self.mousecaptureposition.left, x));
                    var recttop = -5 + parseInt(Math.min(self.mousecaptureposition.top, y));
                    var rectwidth = parseInt(Math.abs(self.mousecaptureposition.left - x));
                    var rectheight = parseInt(Math.abs(self.mousecaptureposition.top - y));
                    rectleft -= hostoffset.left;
                    recttop -= hostoffset.top;

                    this.selectionarea.css('visibility', 'visible');

                    if (self.selectionmode == 'multiplecellsadvanced') {
                        var x = rectleft;
                        var arearight = x + rectwidth;
                        var arealeft = x;
                        var hScrollInstance = self.hScrollInstance;
                        var horizontalscrollvalue = hScrollInstance.value;
                        var tablerow = self.table[0].rows[0];
                        var p = 0;

                        var leftcellindex = self.mousecaptureposition.clickedcell;
                        var rightcellindex = leftcellindex;
                        var found = false;

                        var starti = 0;
                        var endi = tablerow.cells.length;
                        if (self.mousecaptureposition.left <= event.pageX) {
                            starti = leftcellindex;
                        }

                        for (var i = starti; i < endi; i++) {
                            var columnleft = parseInt($(this.columnsrow[0].cells[i]).css('left'));
                            var left = columnleft - horizontalscrollvalue;
                            if (self.columns.records[i].pinned) {
                                left = columnleft;
                                continue;
                            }

                            var column = this._getcolumnat(i);
                            if (column != null && column.hidden) {
                                continue;
                            }

                            if (self.groupable && self.groups.length > 0) {
                                if (i < self.groups.length) {
                                    continue;
                                }
                            }

                            var right = left + $(this.columnsrow[0].cells[i]).width();
                            if (self.mousecaptureposition.left > event.pageX) {
                                if (right >= x && x >= left) {
                                    rightcellindex = i;
                                    found = true;
                                    break;
                                }
                            }
                            else {
                                if (right >= arearight && arearight >= left) {
                                    rightcellindex = i;
                                    found = true;
                                    break;
                                }
                            }
                        }
                        if (!found) {
                            if (self.mousecaptureposition.left > event.pageX) {
                                $.each(this.columns.records, function (index, value) {
                                    if (self.groupable && self.groups.length > 0) {
                                        if (index < self.groups.length) {
                                            return true;
                                        }
                                    }

                                    if (!this.pinned && !this.hidden) {
                                        rightcellindex = index;
                                        return false;
                                    }
                                });
                            }
                            else {
                                if (!self.groupable || (self.groupable && !self.groups.length > 0)) {
                                    rightcellindex = tablerow.cells.length - 1;
                                }
                            }
                        }
                        var tmpindex = leftcellindex;
                        leftcellindex = Math.min(leftcellindex, rightcellindex);
                        rightcellindex = Math.max(tmpindex, rightcellindex);
                        recttop += 5;
                        recttop += groupsheaderheight;
                        var startrowindex = self.table[0].rows.indexOf(self.mousecaptureposition.clickedrow);
                        var increaseheight = 0;
                        var startrow = -1;
                        var endrow = -1;
                        var offsettop = 0;
                        for (var i = 0; i < self.table[0].rows.length; i++) {
                            var row = $(self.table[0].rows[i]);
                            if (i == 0) offsettop = row.offset().top;
                            var rowheight = row.height();
                            var rowtop = offsettop - hostoffset.top;
                            if (startrow == -1 && rowtop + rowheight >= recttop) {
                                var toContinue = false;
                                for (var q = 0; q < self.groups.length; q++) {
                                    var className = row[0].cells[q].className;
                                    if (className.indexOf('jqx-grid-group-collapse') != -1 || className.indexOf('jqx-grid-group-expand') != -1) {
                                        toContinue = true;
                                        break;
                                    }
                                }
                                if (toContinue) continue;


                                startrow = i;
                            }
                            offsettop += rowheight;

                            if (self.groupable && self.groups.length > 0) {
                                var toContinue = false;
                                for (var q = 0; q < self.groups.length; q++) {
                                    var className = row[0].cells[q].className;
                                    if (className.indexOf('jqx-grid-group-collapse') != -1 || className.indexOf('jqx-grid-group-expand') != -1) {
                                        toContinue = true;
                                        break;
                                    }
                                }
                                if (toContinue) continue;

                                var p = 0;
                                for (var k = self.groups.length; k < row[0].cells.length; k++) {
                                    var cell = row[0].cells[k];
                                    if ($(cell).html() == "") {
                                        p++;
                                    }
                                }
                                if (p == row[0].cells.length - self.groups.length) {
                                    continue;
                                }
                            }

                            if (startrow != -1) {
                                increaseheight += rowheight;
                            }

                            if (rowtop + rowheight > recttop + rectheight) {
                                endrow = i;
                                break;
                            }
                        }


                        if (startrow != -1) {
                            recttop = $(self.table[0].rows[startrow]).offset().top - hostoffset.top - groupsheaderheight - 2;
                            var additionalHeight = 0;
                            if (this.filterable && this.showfilterrow) {
                                additionalHeight = this.filterrowheight;
                            }

                            if (parseInt(self.table[0].style.top) < 0 && recttop < this.rowsheight + additionalHeight) {
                                recttop -= parseInt(self.table[0].style.top);
                                increaseheight += parseInt(self.table[0].style.top);
                            }

                            rectheight = increaseheight;
                            var leftcell = $(this.columnsrow[0].cells[leftcellindex]);
                            var rightcell = $(this.columnsrow[0].cells[rightcellindex]);
                            rectleft = parseInt(leftcell.css('left'));
                            rectwidth = parseInt(rightcell.css('left')) - parseInt(rectleft) + rightcell.width() - 2;
                            rectleft -= horizontalscrollvalue;
                            if (self.editcell && self.editable && self.endcelledit && (leftcellindex != rightcellindex || startrow != endrow)) {
                                if (self.editcell.validated == false) return;
                                self.endcelledit(self.editcell.row, self.editcell.column, true, true);
                            }
                        }
                    }

                    this.selectionarea.width(rectwidth);
                    this.selectionarea.height(rectheight);
                    this.selectionarea.css('left', rectleft);
                    this.selectionarea.css('top', recttop);
                }
            }
        },

        _handlemouseupselection: function (event, self) {
            if (this.selectionarea.css('visibility') != 'visible') {
                self.mousecaptured = false;
                return true;
            }

            if (self.mousecaptured && (self.selectionmode == 'multiplerowsextended' || self.selectionmode == 'multiplecellsextended' || self.selectionmode == 'multiplecellsadvanced')) {
                self.mousecaptured = false;
                if (this.selectionarea.css('visibility') == 'visible') {
                    this.selectionarea.css('visibility', 'hidden');

                    var columnheaderheight = this.showheader ? this.columnsheader.height() + 2 : 0;
                    var groupsheaderheight = this._groupsheader() ? this.groupsheader.height() : 0;
                    var toolbarheight = this.showtoolbar ? this.toolbarheight : 0;
                    groupsheaderheight += toolbarheight;
                    var areaoffset = this.selectionarea.offset();
                    var hostoffset = this.host.offset();
                    if (this.hasTransform) {
                        hostoffset = $.jqx.utilities.getOffset(this.host);
                        areaoffset = $.jqx.utilities.getOffset(this.selectionarea);
                    }

                    var x = areaoffset.left - hostoffset.left;
                    var y = areaoffset.top - columnheaderheight - hostoffset.top - groupsheaderheight;
                    var m = y;
                    var arearight = x + this.selectionarea.width();
                    var arealeft = x;

                    var rows = new Array();
                    var indexes = new Array();

                    if (self.selectionmode == 'multiplerowsextended') {
                        while (y < m + this.selectionarea.height()) {
                            var rowinfo = this._hittestrow(x, y);
                            var row = rowinfo.row;
                            var index = rowinfo.index;
                            if (index != -1) {
                                if (!indexes[index]) {
                                    indexes[index] = true;
                                    rows[rows.length] = rowinfo;
                                }
                            }
                            y += 20;
                        }
                        var m = 0;
                        $.each(rows, function () {
                            var rowinfo = this;
                            var row = this.row;
                            if (self.selectionmode != 'none' && self._selectrowwithmouse) {
                                if (event.ctrlKey) {
                                    self._applyrowselection(row.boundindex, true, false, false);
                                }
                                else {
                                    if (m == 0) {
                                        self._applyrowselection(row.boundindex, true, false, true);
                                    }
                                    else {
                                        self._applyrowselection(row.boundindex, true, false, false);
                                    }
                                }
                                m++;
                            }
                        });
                    }
                    else {
                        if (self.selectionmode == 'multiplecellsadvanced') {
                            y += 2;
                        }
                        var hScrollInstance = self.hScrollInstance;
                        var horizontalscrollvalue = hScrollInstance.value;
                        var tablerow = self.table[0].rows[0];
                        var selectionheight = self.selectionarea.height();
                        if (!event.ctrlKey && selectionheight > 0) {
                            self.selectedcells = new Array();
                        }

                        var selectionHeight = selectionheight;
                        while (y < m + selectionHeight) {
                            var rowinfo = self._hittestrow(x, y);
                            var row = rowinfo.row;
                            var index = rowinfo.index;
                            if (index != -1) {
                                if (!indexes[index]) {
                                    indexes[index] = true;
                                    for (var i = 0; i < tablerow.cells.length; i++) {
                                        var left = parseInt($(self.columnsrow[0].cells[i]).css('left')) - horizontalscrollvalue;
                                        var right = left + $(self.columnsrow[0].cells[i]).width();
                                        if ((arealeft >= left && arealeft <= right) || (arearight >= left && arearight <= right)
                                        || (left >= arealeft && left <= arearight)) {
                                            self._applycellselection(row.boundindex, self._getcolumnat(i).datafield, true, false);
                                        }
                                    }
                                }
                            }
                            y += 5;
                        }
                    }
                    if (self.autosavestate) {
                        if (self.savestate) self.savestate();
                    }
                    self._renderrows(self.virtualsizeinfo);
                }
            }
        },

        selectprevcell: function (row, datafield) {
            var columnindex = this._getcolumnindex(datafield);
            var columnscount = this.columns.records.length;
            var prevcolumn = this._getprevvisiblecolumn(columnindex);
            if (prevcolumn != null) {
                this.clearselection();
                this.selectcell(row, prevcolumn.datafield);
            }
        },

        selectnextcell: function (row, datafield) {
            var columnindex = this._getcolumnindex(datafield);
            var columnscount = this.columns.records.length;
            var nextcolumn = this._getnextvisiblecolumn(columnindex);
            if (nextcolumn != null) {
                this.clearselection();
                this.selectcell(row, nextcolumn.datafield);
            }
        },

        _getfirstvisiblecolumn: function () {
            var self = this;
            var length = this.columns.records.length;
            for (var i = 0; i < length; i++) {
                var column = this.columns.records[i];
                if (!column.hidden && column.datafield != null)
                    return column;
            }

            return null;
        },

        _getlastvisiblecolumn: function () {
            var self = this;
            var length = this.columns.records.length;
            for (var i = length - 1; i >= 0; i--) {
                var column = this.columns.records[i];
                if (!column.hidden && column.datafield != null)
                    return column;
            }

            return null;
        },

        _handlekeydown: function (event, self) {
            var key = event.charCode ? event.charCode : event.keyCode ? event.keyCode : 0;
            if (self.editcell && self.selectionmode != 'multiplecellsadvanced') {
                return true;
            }
            else if (self.editcell && self.selectionmode == 'multiplecellsadvanced') {
                if (key >= 33 && key <= 40) {
                    if (!event.altKey) {
                        if (self._cancelkeydown == undefined || self._cancelkeydown == false) {
                            self.endcelledit(self.editcell.row, self.editcell.column, false, true);
                            self._cancelkeydown = false;
                            if (self.editcell && !self.editcell.validated) {
                                self._rendervisualrows();
                                self.endcelledit(self.editcell.row, self.editcell.column, false, true);
                                return false;
                            }
                        }
                        else {
                            self._cancelkeydown = false;
                            return true;
                        }
                    }
                    else {
                        self._cancelkeydown = false;
                        return true;
                    }
                }
                else return true;
            }

            if (self.selectionmode == 'none')
                return true;

            if (self.showfilterrow && self.filterable) {
                if (this.filterrow) {
                    if ($(event.target).ischildof(this.filterrow))
                        return true;
                }
            }

            if (self.pageable) {
                if ($(event.target).ischildof(this.pager)) {
                    return true;
                }
            }

            if (this.showtoolbar) {
                if ($(event.target).ischildof(this.toolbar)) {
                    return true;
                }
            }
            if (this.showstatusbar) {
                if ($(event.target).ischildof(this.statusbar)) {
                    return true;
                }
            }

            var selectionchanged = false;
            if (event.altKey) {
                return true;
            }

            if (event.ctrlKey) {
                if (this.clipboard) {
                    var pressedkey = String.fromCharCode(key).toLowerCase();

                    if (pressedkey == 'c' || pressedkey == 'x') {
                        var text = this.copyselection();
                        if (window.clipboardData) {
                            window.clipboardData.setData("Text", text);
                        }
                    }
                    else if (pressedkey == 'v') {
                        this.pasteselection();
                    }
                    if (pressedkey == 'x') {
                        this.deleteselection();
                    }
                }
            }

            var hostHeight = Math.round(self._gettableheight());
            // get records per page.
            var pagesize = Math.round(hostHeight / self.rowsheight);
            var datainfo = self.getdatainformation();

            switch (self.selectionmode) {
                case 'singlecell':
                case 'multiplecells':
                case 'multiplecellsextended':
                case 'multiplecellsadvanced':
                    var selectedcell = self.getselectedcell();

                    if (selectedcell != null) {
                        var visibleindex = this.getrowvisibleindex(selectedcell.rowindex);
                        var rowindex = visibleindex;
                        var datafield = selectedcell.datafield;
                        var columnindex = self._getcolumnindex(datafield);
                        var columnscount = self.columns.records.length;
                        var selectgridcell = function (row, datafield, clearselection) {
                            var tryselect = function (row, datafield) {
                                var datarow = self.dataview.loadedrecords[row];
                                if (datarow != undefined && datafield != null) {
                                    if (clearselection || clearselection == undefined) {
                                        self.clearselection();
                                    }
                                    var visibleindex = datarow.boundindex;
                                    self.selectcell(visibleindex, datafield);
                                    self._oldselectedcell = self.selectedcell;
                                    selectionchanged = true;
                                    self.ensurecellvisible(row, datafield);
                                    return true;
                                }
                                return false;
                            }

                            if (!tryselect(row, datafield)) {
                                self.ensurecellvisible(row, datafield);
                                tryselect(row, datafield);
                                if (self.virtualmode) {
                                    self.host.focus();
                                }
                            }

                            if (event.shiftKey && key != 9) {
                                if (self.selectionmode == 'multiplecellsextended' || self.selectionmode == 'multiplecellsadvanced') {
                                    if (self._lastClickedCell) {
                                        self._selectpath(row, datafield);
                                        self.selectedcell = { rowindex: row, datafield: datafield };
                                        return;
                                    }
                                }
                            }
                            else if (!event.shiftKey) {
                                self._lastClickedCell = { row: row, column: datafield };
                            }
                        }
                        var shift = event.shiftKey && self.selectionmode != 'singlecell' && self.selectionmode != 'multiplecells';
                        var home = function () {
                            selectgridcell(0, datafield, !shift);
                        }
                        var end = function () {
                            var newindex = datainfo.rowscount - 1;
                            selectgridcell(newindex, datafield, !shift);
                        }

                        var tab = key == 9 && !event.shiftKey;
                        var shifttab = key == 9 && event.shiftKey;
                        if (tab || shifttab) shift = false;
                        var ctrl = event.ctrlKey;
                        if (ctrl && key == 37) {
                            var previouscolumn = self._getfirstvisiblecolumn(columnindex);
                            if (previouscolumn != null) {
                                selectgridcell(rowindex, previouscolumn.datafield);
                            }
                        }
                        else if (ctrl && key == 39) {
                            var next = self._getlastvisiblecolumn(columnindex);
                            if (next != null) {
                                selectgridcell(rowindex, next.datafield);
                            }
                        }
                        else if (key == 39 || tab) {
                            var nextcolumn = self._getnextvisiblecolumn(columnindex);
                            if (nextcolumn != null) {
                                selectgridcell(rowindex, nextcolumn.datafield, !shift);
                            }
                            else {
                                if (!tab) {
                                    selectionchanged = true;
                                }
                            }
                        }
                        else if (key == 37 || shifttab) {
                            var previouscolumn = self._getprevvisiblecolumn(columnindex);
                            if (previouscolumn != null) {
                                selectgridcell(rowindex, previouscolumn.datafield, !shift);
                            }
                            else {
                                if (!shifttab) {
                                    selectionchanged = true;
                                }
                            }
                        }
                        else if (key == 36) {
                            home();
                        }
                        else if (key == 35) {
                            end();
                        }
                        else if (key == 33) {
                            if (rowindex - pagesize >= 0) {
                                var newindex = rowindex - pagesize;
                                selectgridcell(newindex, datafield, !shift);
                            }
                            else {
                                home();
                            }
                        }
                        else if (key == 34) {
                            if (datainfo.rowscount > rowindex + pagesize) {
                                var newindex = rowindex + pagesize;
                                selectgridcell(newindex, datafield, !shift);
                            }
                            else {
                                end();
                            }
                        }
                        else if (key == 38) {
                            if (ctrl) {
                                home();
                            }
                            else {
                                if (rowindex > 0) {
                                    selectgridcell(rowindex - 1, datafield, !shift);
                                }
                                else selectionchanged = true;
                            }
                        }
                        else if (key == 40) {
                            if (ctrl) {
                                end();
                            }
                            else {
                                if (datainfo.rowscount > rowindex + 1) {
                                    selectgridcell(rowindex + 1, datafield, !shift);
                                }
                                else selectionchanged = true;
                            }
                        }
                    }
                    break;
                case 'singlerow':
                case 'multiplerows':
                case 'multiplerowsextended':
                    var rowindex = self.getselectedrowindex();
                    if (rowindex == null || rowindex == -1)
                        return true;

                    rowindex = this.getrowvisibleindex(rowindex);
                    var selectgridrow = function (index, clearselection) {
                        var tryselect = function (index) {
                            var datarecord = self.dataview.loadedrecords[index];
                            if (datarecord != undefined) {
                                var visibleindex = datarecord.boundindex;
                                var tmpindex = self.selectedrowindex;
                                if (clearselection || clearselection == undefined) {
                                    self.clearselection();
                                }
                                self.selectedrowindex = tmpindex;
                                self.selectrow(visibleindex, false);
                                var scrolled = self.ensurerowvisible(index);
                                if (!scrolled) {
                                    self._rendervisualrows();
                                }
                                selectionchanged = true;
                                return true;
                            }
                            return false;
                        }
                        if (!tryselect(index)) {
                            self.ensurerowvisible(index);
                            tryselect(index, clearselection);
                            if (self.virtualmode) {
                                self.host.focus();
                            }
                        }
                        if (event.shiftKey && key != 9) {
                            if (self.selectionmode == 'multiplerowsextended') {
                                if (self._lastClickedCell) {
                                    self._selectrowpath(index);
                                    self.selectedrowindex = index;
                                    return;
                                }
                            }
                        }
                        else if (!event.shiftKey) {
                            self._lastClickedCell = { row: index };
                        }
                    }
                    var shift = event.shiftKey && self.selectionmode != 'singlerow' && self.selectionmode != 'multiplerows';

                    var home = function () {
                        selectgridrow(0, !shift);
                    }
                    var end = function () {
                        var newindex = datainfo.rowscount - 1;
                        selectgridrow(newindex, !shift);
                    }

                    var ctrl = event.ctrlKey;
                    if (key == 36 || (ctrl && key == 38)) {
                        home();
                    }
                    else if (key == 35 || (ctrl && key == 40)) {
                        end();
                    }
                    else if (key == 33) {
                        if (rowindex - pagesize >= 0) {
                            var newindex = rowindex - pagesize;
                            selectgridrow(newindex, !shift);
                        }
                        else {
                            home();
                        }
                    }
                    else if (key == 34) {
                        if (datainfo.rowscount > rowindex + pagesize) {
                            var newindex = rowindex + pagesize;
                            selectgridrow(newindex, !shift);
                        }
                        else {
                            end();
                        }
                    }
                    else if (key == 38) {
                        if (rowindex > 0) {
                            selectgridrow(rowindex - 1, !shift);
                        }
                        else selectionchanged = true;
                    }
                    else if (key == 40) {
                        if (datainfo.rowscount > rowindex + 1) {
                            selectgridrow(rowindex + 1, !shift);
                        }
                        else selectionchanged = true;
                    }
                    break;
            }

            if (selectionchanged) {
                if (self.autosavestate) {
                    if (self.savestate) self.savestate();
                }

                //if (self.editcell != null && self.endcelledit) {
                //    self.endcelledit(self.editcell.row, self.editcell.column, true, true);
                //}
                return false;
            }
            return true;
        },

        _handlemousemove: function (event, self) {
            if (self.vScrollInstance.isScrolling())
                return;

            if (self.hScrollInstance.isScrolling())
                return;

            var columnheaderheight;
            var groupsheaderheight;
            var hostoffset;
            var x;
            var y;

            if (self.enablehover || self.selectionmode == 'multiplerows') {
                columnheaderheight = this.showheader ? this.columnsheader.height() + 2 : 0;
                groupsheaderheight = this._groupsheader() ? this.groupsheader.height() : 0;
                var toolbarheight = this.showtoolbar ? this.toolbarheight : 0;
                groupsheaderheight += toolbarheight;
                hostoffset = this.host.offset();
                if (this.hasTransform) {
                    hostoffset = $.jqx.utilities.getOffset(this.host);
                }
                var bodyOffset = this._getBodyOffset();
                hostoffset.left += bodyOffset.left;
                hostoffset.top += bodyOffset.top;
                x = event.pageX - hostoffset.left;
                y = event.pageY - columnheaderheight - hostoffset.top - groupsheaderheight;
            }

            if (self.selectionmode == 'multiplerowsextended' || self.selectionmode == 'multiplecellsextended' || self.selectionmode == 'multiplecellsadvanced') {
                if (self.mousecaptured == true) {
                    return;
                }
            }

            if (self.enablehover) {
                if (self.disabled) {
                    return;
                }

                if (this.vScrollInstance.isScrolling() || this.hScrollInstance.isScrolling()) {
                    return;
                }

                var rowinfo = this._hittestrow(x, y);
                if (!rowinfo)
                    return;

                var row = rowinfo.row;
                var index = rowinfo.index;

                // if the new index is the same as the last, do nothing.
                if (this.hoveredrow != -1 && index != -1 && this.hoveredrow == index && this.selectionmode.indexOf('cell') == -1) {
                    return;
                }

                this._clearhoverstyle();

                if (index == -1 || row == undefined)
                    return;

                var tablerow = this.hittestinfo[index].visualrow;
                if (tablerow == null)
                    return;

                if (this.hittestinfo[index].details) {
                    return;
                }

                if (event.clientX > $(tablerow).width() + $(tablerow).offset().left) return;

                var startindex = 0;
                if (self.rowdetails && self.showrowdetailscolumn) {
                    startindex = 1;
                }

                if (tablerow.cells.length == 0)
                    return;

                var cellclass = tablerow.cells[startindex].className;
                if (row.group || cellclass.indexOf('jqx-grid-cell-selected') != -1)
                    return;

                this.hoveredrow = index;

                if (this.selectionmode.indexOf('cell') != -1) {
                    var cellindex = -1;
                    var hScrollInstance = this.hScrollInstance;
                    var horizontalscrollvalue = hScrollInstance.value;
                    if (this.rtl) {
                        if (this.hScrollBar.css('visibility') != 'hidden') {
                            horizontalscrollvalue = hScrollInstance.max - hScrollInstance.value;
                        }
                    }

                    for (var i = 0; i < tablerow.cells.length; i++) {
                        var left = parseInt($(this.columnsrow[0].cells[i]).css('left')) - horizontalscrollvalue;
                        var right = left + $(this.columnsrow[0].cells[i]).width();
                        if (right >= x && x >= left) {
                            cellindex = i;
                            break;
                        }
                    }

                    if (cellindex != -1) {
                        var tablecell = tablerow.cells[cellindex];
                        if (tablecell.className.indexOf('jqx-grid-cell-selected') == -1) {
                            if (tablecell.className.indexOf('jqx-grid-group') == -1) {
                                $(tablecell).addClass(this.toTP('jqx-grid-cell-hover'));
                                $(tablecell).addClass(this.toTP('jqx-fill-state-hover'));
                            }
                        }
                    }
                    return;
                }

                for (var i = startindex; i < tablerow.cells.length; i++) {
                    var tablecell = tablerow.cells[i];
                    if (tablecell.className.indexOf('jqx-grid-group') == -1) {
                        $(tablecell).addClass(this.toTP('jqx-grid-cell-hover'));
                        $(tablecell).addClass(this.toTP('jqx-fill-state-hover'));
                    }
                }
            }
            else return true;
        }
    });
})(jQuery);


