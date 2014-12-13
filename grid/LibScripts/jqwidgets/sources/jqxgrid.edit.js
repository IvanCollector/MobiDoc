/*
jQWidgets v2.7.0 (2013-Feb-08)
Copyright (c) 2011-2013 jQWidgets.
License: http://jqwidgets.com/license/
*/

(function ($) {

    $.extend($.jqx._jqxGrid.prototype, {
        _handledblclick: function (event, self) {
            if (event.target == null) {
                return;
            }

            if (self.disabled) {
                return;
            }

            if ($(event.target).ischildof(this.columnsheader)) {
                return;
            }

            var rightclick;
            if (event.which) rightclick = (event.which == 3);
            else if (event.button) rightclick = (event.button == 2);

            if (rightclick) {
                return;
            }

            var middleclick;
            if (event.which) middleclick = (event.which == 2);
            else if (event.button) middleclick = (event.button == 1);

            if (middleclick) {
                return;
            }

            var columnheaderheight = this.showheader ? this.columnsheader.height() + 2 : 0;
            var groupsheaderheight = this._groupsheader() ? this.groupsheader.height() : 0;

            var hostoffset = this.host.offset();
            var x = event.pageX - hostoffset.left;
            var y = event.pageY - columnheaderheight - hostoffset.top - groupsheaderheight;
            var rowinfo = this._hittestrow(x, y);
            var row = rowinfo.row;
            var index = rowinfo.index;
            var targetclassname = event.target.className;
            var tablerow = this.table[0].rows[index];
            if (tablerow == null)
                return;

            self.mousecaptured = true;
            self.mousecaptureposition = { left: event.pageX, top: event.pageY - groupsheaderheight };

            var hScrollInstance = this.hScrollInstance;
            var horizontalscrollvalue = hScrollInstance.value;
            var cellindex = 0;
            var groupslength = this.groupable ? this.groups.length : 0;

            for (var i = 0; i < tablerow.cells.length; i++) {
                var columnleft = parseInt($(this.columnsrow[0].cells[i]).css('left'));
                var left = columnleft - horizontalscrollvalue;
                if (self.columns.records[i].pinned) {
                    left = columnleft;
                }

                var column = this._getcolumnat(i);
                if (column != null && column.hidden) {
                    continue;
                }

                var right = left + $(this.columnsrow[0].cells[i]).width();
                if (right >= x && x >= left) {
                    cellindex = i;
                    break;
                }
            }

            if (row != null) {
                var column = this._getcolumnat(cellindex);
                if (!(targetclassname.indexOf('jqx-grid-group-expand') != -1 || targetclassname.indexOf('jqx-grid-group-collapse') != -1)) {
                    if (row.boundindex != -1) {
                        self.begincelledit(row.boundindex, column.datafield, column.defaulteditorvalue);
                    }
                }
            }
        },

        _getpreveditablecolumn: function (index) {
            var self = this;
            while (index > 0) {
                index--;
                var column = self.getcolumnat(index);
                if (!column)
                    return null;

                if (!column.editable)
                    continue;

                if (!column.hidden)
                    return column;
            }
            return null;
        },

        _getnexteditablecolumn: function (index) {
            var self = this;
            while (index < this.columns.records.length) {
                index++;
                var column = self.getcolumnat(index);

                if (!column)
                    return null;

                if (!column.editable)
                    continue;

                if (!column.hidden)
                    return column;
            }
            return null;
        },

        _handleeditkeydown: function (event, self) {
            var key = event.charCode ? event.charCode : event.keyCode ? event.keyCode : 0;

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

            if (this.editcell) {
                if (this.editcell.columntype == null || this.editcell.columntype == 'textbox' || this.editcell.columntype == 'numberinput' || this.editcell.columntype == 'combobox' || this.editcell.columntype == 'datetimeinput') {
                    if (key >= 33 && key <= 40 && self.selectionmode == 'multiplecellsadvanced') {
                        var editor = this.editcell.columntype == 'textbox' || this.editcell.columntype == null ? this.editcell.editor : this.editcell.editor.find('input');
                        var selection = self._selection(editor);
                        var strlength = editor.val().length;
                        if (selection.length > 0 && this.editcell.columntype != 'datetimeinput') {
                            self._cancelkeydown = true;
                        }

                        if (selection.start > 0 && key == 37) {
                            self._cancelkeydown = true;
                        }
                        if (selection.start < strlength && key == 39 && this.editcell.columntype != 'datetimeinput') {
                            self._cancelkeydown = true;
                        }
                        if (this.editcell.columntype == 'datetimeinput' && key == 39) {
                            if (selection.start + selection.length < strlength) {
                                self._cancelkeydown = true;
                            }
                        }
                    }
                }
                else if (this.editcell.columntype == 'dropdownlist') {
                    if (key == 37 || key == 39 && self.selectionmode == 'multiplecellsadvanced') {
                        self._cancelkeydown = false;
                    }
                }
                else if (this.selectionmode == 'multiplecellsadvanced' && this.editcell.columntype != 'textbox' && this.editcell.columntype != 'numberinput') {
                    self._cancelkeydown = true;
                }

                if (key == 32) {
                    if (self.editcell.columntype == 'checkbox') {
                        var checked = !self.getcellvalue(self.editcell.row, self.editcell.column);
                        self.setcellvalue(self.editcell.row, self.editcell.column, checked, true);
                        self._raiseEvent(18, { rowindex: self.editcell.row, datafield: self.editcell.column, oldvalue: !checked, value: checked, columntype: 'checkbox' });
                        return false;
                    }
                }
                if (key == 9) {
                    var rowindex = this.editcell.row;
                    var datafield = this.editcell.column;
                    var initialdatafield = datafield;
                    var columnindex = self._getcolumnindex(datafield);
                    var canedit = false;
                    var visibleindex = self.getrowvisibleindex(rowindex);

                    if (this.editcell.validated != false) {
                        if (event.shiftKey) {
                            var column = self._getpreveditablecolumn(columnindex);
                            if (column) {
                                datafield = column.datafield;
                                canedit = true;
                                if (self.selectionmode.indexOf('cell') != -1) {
                                    self.selectprevcell(rowindex, initialdatafield);
                                    setTimeout(function () {
                                        self.ensurecellvisible(visibleindex, datafield);
                                    }, 10);
                                }
                            }
                        }
                        else {
                            var column = self._getnexteditablecolumn(columnindex);
                            if (column) {
                                datafield = column.datafield;
                                canedit = true;
                                if (self.selectionmode.indexOf('cell') != -1) {
                                    self.selectnextcell(rowindex, initialdatafield);
                                    self._oldselectedcell = self.selectedcell;
                                    setTimeout(function () {
                                        self.ensurecellvisible(visibleindex, datafield);
                                    }, 10);
                                }
                            }
                        }

                        if (canedit) {
                            self.begincelledit(rowindex, datafield);
                            if (this.editcell != null && this.editcell.columntype == 'checkbox') {
                                this._renderrows(this.virtualsizeinfo);
                            }
                        }
                    }
                    return false;
                }
                else if (key == 13) {
                    this.endcelledit(this.editcell.row, this.editcell.column, false, true);
                    if (self.selectionmode == 'multiplecellsadvanced') {
                        var cell = self.getselectedcell();
                        if (cell != null) {
                            if (self.selectcell) {
                                if (this.editcell == null) {
                                    if (cell.rowindex + 1 < self.dataview.totalrecords) {
                                        self.clearselection(false);
                                        self.selectcell(cell.rowindex + 1, cell.datafield);
                                        self.ensurecellvisible(cell.rowindex + 1, cell.datafield);
                                    }
                                }
                            }
                        }
                    }
                    return false;
                }
                else if (key == 27) {
                    this.endcelledit(this.editcell.row, this.editcell.column, true, true);
                    return false;
                }
            }
            else {
                var startedit = false;
                if (key == 113) {
                    startedit = true;
                }
                if (!event.ctrlKey && !event.altKey) {
                    if (key >= 48 && key <= 57) {
                        this.editchar = String.fromCharCode(key);
                        startedit = true;
                    }
                    if (key >= 65 && key <= 90) {
                        this.editchar = String.fromCharCode(key);
                        if (!event.shiftKey) {
                            this.editchar = this.editchar.toLowerCase();
                        }
                        startedit = true;
                    }
                    else if (key >= 96 && key <= 105) {
                        this.editchar = key - 96;
                        this.editchar = this.editchar.toString();
                        startedit = true;
                    }
                }

                if (key == 13 || startedit) {
                    if (self.getselectedrowindex) {
                        var rowindex = self.getselectedrowindex();

                        switch (self.selectionmode) {
                            case 'singlerow':
                            case 'multiplerows':
                            case 'multiplerowsextended':
                                {
                                    if (rowindex >= 0) {
                                        var datafield = "";
                                        for (var m = 0; m < self.columns.records.length; m++) {
                                            var column = self.getcolumnat(m);
                                            if (column.editable) {
                                                datafield = column.datafield;
                                                break;
                                            }
                                        }

                                        self.begincelledit(rowindex, datafield);
                                    }
                                    break;
                                }
                            case 'singlecell':
                            case 'multiplecells':
                            case 'multiplecellsextended':
                                var cell = self.getselectedcell();
                                if (cell != null) {
                                    var column = self._getcolumnbydatafield(cell.datafield);
                                    if (column.columntype != 'checkbox') {
                                        self.begincelledit(cell.rowindex, cell.datafield);
                                    }
                                }
                                break;
                            case "multiplecellsadvanced":
                                var cell = self.getselectedcell();
                                if (cell != null) {
                                    if (key == 13) {
                                        if (self.selectcell) {
                                            if (cell.rowindex + 1 < self.dataview.totalrecords) {
                                                self.clearselection(false);
                                                self.selectcell(cell.rowindex + 1, cell.datafield);
                                                self.ensurecellvisible(cell.rowindex + 1, cell.datafield);
                                            }
                                        }
                                    }
                                    else {
                                        self.begincelledit(cell.rowindex, cell.datafield);
                                    }
                                }

                                break;
                        }
                        return false;
                    }
                }
                if (key == 46) {
                    var cells = self.getselectedcells();
                    if (self.selectionmode.indexOf('cell') == -1) {
                        if (self._getcellsforcopypaste) {
                            cells = self._getcellsforcopypaste();
                        }
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
                        return false;
                    }
                }
                if (key == 32) {
                    var cell = self.getselectedcell();
                    if (cell != null) {
                        var column = self.getcolumn(cell.datafield);
                        if (column.columntype == 'checkbox') {
                            var checked = !self.getcellvalue(cell.rowindex, cell.datafield);
                            self._raiseEvent(17, { rowindex: cell.rowindex, datafield: cell.datafield, value: !checked, columntype: 'checkbox' });
                            self.setcellvalue(cell.rowindex, cell.datafield, checked, true);
                            self._raiseEvent(18, { rowindex: cell.rowindex, datafield: cell.datafield, oldvalue: !checked, value: checked, columntype: 'checkbox' });
                            return false;
                        }
                    }
                }
            }

            return true;
        },

        // begins cell editing.
        begincelledit: function (row, datafield, defaultvalue) {
            var column = this.getcolumn(datafield);

            if (datafield == null)
                return;

            if (column.columntype == "number" || column.columntype == "button") {
                return;
            }

            if (this.editrow != undefined) return;

            if (this.editcell) {
                if (this.editcell.row == row && this.editcell.column == datafield) {
                    return true;
                }

                var validated = this.endcelledit(this.editcell.row, this.editcell.column, false, true);
                if (false == validated)
                    return;
            }

            var isembeddededitor = column.columntype == 'checkbox' || column.columntype == 'button';
            this.host.removeClass('jqx-disableselect');
            this.content.removeClass('jqx-disableselect');

            if (column.editable) {
                if (column.cellbeginedit) {
                    var cell = this.getcell(row, datafield);
                    var beginEdit = column.cellbeginedit(row, datafield, column.columntype, cell != null ? cell.value : null);
                    if (beginEdit == false)
                        return;
                }

                var visiblerowindex = this.getrowvisibleindex(row);
                this.editcell = this.getcell(row, datafield);
                this.editcell.visiblerowindex = visiblerowindex;
                if (!this.editcell.editing) {
                    if (!isembeddededitor) {
                        this.editcell.editing = true;
                    }
                    this.editcell.columntype = column.columntype;
                    this.editcell.defaultvalue = defaultvalue;
                    if (column.defaultvalue != undefined) {
                        this.editcell.defaultvalue = column.defaultvalue;
                    }
                    this.editcell.init = true;
                    // raise begin cell edit event.
                    if (column.columntype != "checkbox") {
                        this._raiseEvent(17, { rowindex: row, datafield: column.datafield, value: this.editcell.value, columntype: column.columntype });
                    }

                    if (!isembeddededitor) {
                        this.ensurecellvisible(row, column.datafield);
                        this._renderrows(this.virtualsizeinfo);
                    }
                    if (this.editcell) {
                        this.editcell.init = false;
                        return true;
                    }
                }
            }
            else {
                if (!this.editcell) {
                    return;
                }
                this.editcell.editor = null;
                this.editcell.editing = false;
                this._renderrows(this.virtualsizeinfo);
                this.editcell = null;
            }
        },

        endcelledit: function (row, datafield, cancelchanges, refresh) {
            var column = this.getcolumn(datafield);
            var me = this;

            if (me.editrow != undefined) return;

            var setfocus = function () {
                if (!me.isNestedGrid) {
                    me.element.focus();
                    me.content.focus();
                    setTimeout(function () {
                        me.element.focus();
                        me.content.focus();
                    }, 10);
                }
            }

            if (column.columntype == 'checkbox' || column.columntype == 'button') {
                this.editcell.editor = null;
                this.editcell.editing = false;
                this.editcell = null;
                return true;
            }

            var editorvalue = this._geteditorvalue(column);

            var cancelchangesfunc = function (me) {
                me._hidecelleditor();
                me.editcell.editor = null;
                me.editcell.editing = false;
                me.editcell = null;
                if (refresh || refresh == undefined) {
                    me._renderrows(me.virtualsizeinfo);
                }
                setfocus();
                if (!me.enablebrowserselection) {
                    me.host.addClass('jqx-disableselect');
                    me.content.addClass('jqx-disableselect');
                }
            }

            if (cancelchanges) {
                cancelchangesfunc(this);
                return false;
            }

            if (this.validationpopup) {
                this.validationpopup.hide();
                this.validationpopuparrow.hide();
            }

            if (column.cellvaluechanging) {
                var newcellvalue = column.cellvaluechanging(row, datafield, column.columntype, this.editcell.value, editorvalue);
                if (newcellvalue != undefined) {
                    editorvalue = newcellvalue;
                }
            }

            if (column.validation) {
                var cell = this.getcell(row, datafield);
                try {
                    var validationobj = column.validation(cell, editorvalue);
                    var validationmessage = this.gridlocalization.validationstring;
                    if (validationobj.message != undefined) {
                        validationmessage = validationobj.message;
                    }
                    var result = typeof validationobj == "boolean" ? validationobj : validationobj.result;

                    if (!result) {
                        if (validationobj.showmessage == undefined || validationobj.showmessage == true) {
                            this._showvalidationpopup(row, datafield, validationmessage);
                        }
                        this.editcell.validated = false;
                        return false;
                    }
                }
                catch (error) {
                    this._showvalidationpopup(row, datafield, this.gridlocalization.validationstring);
                    this.editcell.validated = false;
                    return false;
                }
            }

            if (column.displayfield != column.datafield) {
                var label = this.getcellvalue(this.editcell.row, column.displayfield);
                var value = this.editcell.value;
                oldvalue = { value: value, label: label };
            }
            else oldvalue = this.editcell.value;

            if (column.cellendedit) {
                var cellendeditresult = column.cellendedit(row, datafield, column.columntype, this.editcell.value, editorvalue);
                if (cellendeditresult == false) {
                    this._raiseEvent(18, { rowindex: row, datafield: datafield, displayfield: column.displayfield, oldvalue: oldvalue, value: oldvalue, columntype: column.columntype });
                    cancelchangesfunc(this);
                    return false;
                }
            }

            this._raiseEvent(18, { rowindex: row, datafield: datafield, displayfield: column.displayfield, oldvalue: oldvalue, value: editorvalue, columntype: column.columntype });

            this._hidecelleditor();
            if (this.editcell != undefined) {
                this.editcell.editor = null;
                this.editcell.editing = false;
            }
            this.editcell = null;
            this.setcellvalue(row, datafield, editorvalue, refresh);
            if (!this.enablebrowserselection) {
                this.host.addClass('jqx-disableselect');
                this.content.addClass('jqx-disableselect');
            }
            setfocus();

            // raise end cell edit event.
            return true;
        },

        beginrowedit: function (row) {
            if (!this.editcells) {
                this.editcells = new Array();
            }

            if (this.editcells.length > 0) {
                if (this.editcells[0].row == row) {
                    return;
                }

                var validated = this.endrowedit(this.editcells[0].row, false, true);
                if (false == validated)
                    return;
            }

            this.host.removeClass('jqx-disableselect');
            this.content.removeClass('jqx-disableselect');
            var me = this;
            this.editcells = new Array();
            $.each(this.columns.records, function () {
                if (me.editable) {
                    var cell = me.getcell(row, this.datafield);
                    cell.editing = true;
                    if (this.defaultvalue != undefined) {
                        cell.defaultvalue = column.defaultvalue;
                    }
                    cell.init = true;
                    me.editcells[this.datafield] = cell;
                }
            });
            me.editrow = row;
            me._renderrows(this.virtualsizeinfo);
            $.each(this.columns.records, function () {
                me.editcells[this.datafield].init = false;
            });
        },

        endrowedit: function (row) {
            if (this.editcell.editor == undefined) {
                return false;
            }

            // raise end cell edit event.
            return true;
        },

        _selection: function (textbox) {
            if ('selectionStart' in textbox[0]) {
                var e = textbox[0];
                var selectionLength = e.selectionEnd - e.selectionStart;
                return { start: e.selectionStart, end: e.selectionEnd, length: selectionLength, text: e.value };
            }
            else {
                var r = document.selection.createRange();
                if (r == null) {
                    return { start: 0, end: e.value.length, length: 0 }
                }

                var re = textbox[0].createTextRange();
                var rc = re.duplicate();
                re.moveToBookmark(r.getBookmark());
                rc.setEndPoint('EndToStart', re);
                var selectionLength = r.text.length;

                return { start: rc.text.length, end: rc.text.length + r.text.length, length: selectionLength, text: r.text };
            }
        },

        _setSelection: function (start, end, textbox) {
            if ('selectionStart' in textbox[0]) {
                textbox[0].focus();
                textbox[0].setSelectionRange(start, end);
            }
            else {
                var range = textbox[0].createTextRange();
                range.collapse(true);
                range.moveEnd('character', end);
                range.moveStart('character', start);
                range.select();
            }
        },

        // finds the index to select in the jqxDropDownList editor.
        findRecordIndex: function (value, datafield, records) {
            var records = records;

            if (value && datafield) {
                var length = records.length;

                // loop through all records.
                for (var urec = 0; urec < length; urec++) {
                    var datarow = records[urec];
                    var currentValue = datarow['label'];
                    if (value == currentValue)
                        return urec;
                }
            }

            return -1;
        },

        _destroyeditors: function () {
            var me = this;
            $.each(this.columns.records, function (i, value) {
                var datafieldname = $.trim(this.datafield).split(" ").join("");

                switch (this.columntype) {
                    case "dropdownlist":
                        var dropdownlist = me.editors["dropdownlist" + "_" + datafieldname];
                        if (dropdownlist) {
                            dropdownlist.jqxDropDownList('destroy');
                            me.editors["dropdownlist" + "_" + datafieldname] = null;
                        }
                        break;
                    case "combobox":
                        var combobox = me.editors["combobox" + "_" + datafieldname];
                        if (combobox) {
                            combobox.jqxComboBox('destroy');
                            me.editors["combobox" + "_" + datafieldname] = null;
                        }
                        break;
                    case "datetimeinput":
                        var datetimeinput = me.editors["datetimeinput" + "_" + this.datafield];
                        if (datetimeinput) {
                            datetimeinput.jqxDateTimeInput('destroy');
                            me.editors["datetimeinput" + "_" + datafieldname] = null;
                        }
                        break;
                    case "numberinput":
                        var numberinput = me.editors["numberinput" + "_" + datafieldname];
                        if (numberinput) {
                            numberinput.jqxNumberInput('destroy');
                            me.editors["numberinput" + "_" + datafieldname] = null;
                        }
                        break;
                }
            });
            me.editors = new Array();
        },

        _showcelleditor: function (row, column, element, init, focusable) {
            if (this.editrow != undefined) {
                this.editcell = this.editcells[column.datafield];
            }

            if (element == undefined)
                return;

            if (this.editcell == null)
                return;

            if (column.columntype == 'checkbox' && column.editable) {
                return;
            }

            if (focusable == undefined) focusable = true;

            var datafield = column.datafield;
            var $element = $(element);
            var me = this;
            var editor = this.editcell.editor;
            var cellvalue = this.getcellvalue(row, datafield);
            var hScrollInstance = this.hScrollInstance;
            var horizontalscrollvalue = hScrollInstance.value;
            var left = parseInt(horizontalscrollvalue);

            this.editcell.element = element;

            if (this.editcell.validated == false) {
                this._showvalidationpopup();
            }

            var focuseditor = function (editor) {
                if (me.hScrollInstance.isScrolling() || me.vScrollInstance.isScrolling())
                    return;

                if (!focusable)
                    return;

                if (!me.isNestedGrid) {
                    editor.focus();
                }

                if (me.gridcontent[0].scrollTop != 0) {
                    me.scrolltop(Math.abs(me.gridcontent[0].scrollTop));
                    me.gridcontent[0].scrollTop = 0;
                }

                if (me.gridcontent[0].scrollLeft != 0) {
                    me.gridcontent[0].scrollLeft = 0;
                }
            }

            switch (column.columntype) {
                case "dropdownlist":
                    if (this.host.jqxDropDownList) {
                        element.innerHTML = "";
                        var dropdownlisteditor = this.editors["dropdownlist" + "_" + column.datafield];
                        editor = dropdownlisteditor == undefined ? $("<div style='z-index: 99999; top: 0px; left: 0px; position: absolute;' id='dropdownlisteditor'></div>") : dropdownlisteditor;
                        editor.css('top', $(element).parent().position().top);
                        if (this.oldhscroll) {
                            editor.css('left', -left + parseInt($(element).position().left));
                        }
                        else {
                            editor.css('left', parseInt($(element).position().left));
                        }
                        var datafieldname = $.trim(column.datafield).split(" ").join("");
                        var displayfield = $.trim(column.displayfield).split(" ").join("");
                        if (dropdownlisteditor == undefined) {
                            editor.prependTo(this.table);
                            editor[0].id = "dropdownlisteditor" + this.element.id + datafieldname;
                            var isdataadapter = this.source._source ? true : false;
                            var dataadapter = null;

                            if (!isdataadapter) {
                                dataadapter = new $.jqx.dataAdapter(this.source,
                                {
                                    autoBind: false,
                                    uniqueDataFields: [displayfield],
                                    async: false
                                });
                            }
                            else {
                                var dataSource =
                                {
                                    localdata: this.source.records,
                                    datatype: this.source.datatype,
                                    async: false
                                }

                                dataadapter = new $.jqx.dataAdapter(dataSource,
                                {
                                    autoBind: false,
                                    async: false,
                                    uniqueDataFields: [displayfield]
                                });
                            }

                            var autoheight = true;
                            editor.jqxDropDownList({ keyboardSelection: false, source: dataadapter, rtl: this.rtl, autoDropDownHeight: autoheight, theme: this.theme, width: $element.width() - 2, height: $element.height() - 2, displayMember: displayfield, valueMember: datafield });
                            this.editors["dropdownlist" + "_" + datafieldname] = editor;
                            if (column.createeditor) {
                                column.createeditor(row, cellvalue, editor);
                            }
                        }
                        if (column._requirewidthupdate) {
                            editor.jqxDropDownList({ width: $element.width() - 2 });
                        }

                        var dropdownitems = editor.jqxDropDownList('listBox').visibleItems;
                        if (dropdownitems.length < 8) {
                            editor.jqxDropDownList('autoDropDownHeight', true);
                        }
                        else {
                            editor.jqxDropDownList('autoDropDownHeight', false);
                        }
                        var cellvalue = this.getcellvalue(row, displayfield);
                        var selectedIndex = this.findRecordIndex(cellvalue, displayfield, dropdownitems);
                        if (init) {
                            if (cellvalue != "") {
                                editor.jqxDropDownList('selectIndex', selectedIndex, true);
                            }
                            else {
                                editor.jqxDropDownList('selectIndex', -1);
                            }
                        }

                        if (this.editcell.defaultvalue != undefined) {
                            editor.jqxDropDownList('selectIndex', this.editcell.defaultvalue, true);
                        }

                        if (focusable) {
                            editor.jqxDropDownList('focus');
                        }
                    }
                    break;
                case "combobox":
                    if (this.host.jqxComboBox) {
                        element.innerHTML = "";
                        var comboboxeditor = this.editors["combobox" + "_" + column.datafield];
                        editor = comboboxeditor == undefined ? $("<div style='z-index: 99999; top: 0px; left: 0px; position: absolute;' id='comboboxeditor'></div>") : comboboxeditor;
                        editor.css('top', $(element).parent().position().top);
                        if (this.oldhscroll) {
                            editor.css('left', -left + parseInt($(element).position().left));
                        }
                        else {
                            editor.css('left', parseInt($(element).position().left));
                        }
                        var datafieldname = $.trim(column.datafield).split(" ").join("");
                        var displayfield = $.trim(column.displayfield).split(" ").join("");
                        if (comboboxeditor == undefined) {
                            editor.prependTo(this.table);
                            editor[0].id = "comboboxeditor" + this.element.id + datafieldname;
                            var isdataadapter = this.source._source ? true : false;
                            var dataadapter = null;
                            if (!isdataadapter) {
                                dataadapter = new $.jqx.dataAdapter(this.source,
                                {
                                    autoBind: false,
                                    uniqueDataFields: [displayfield],
                                    async: false
                                });
                            }
                            else {
                                var dataSource =
                                {
                                    localdata: this.source.records,
                                    datatype: this.source.datatype,
                                    async: false
                                }

                                dataadapter = new $.jqx.dataAdapter(dataSource,
                                {
                                    autoBind: false,
                                    async: false,
                                    uniqueDataFields: [displayfield]
                                });
                            }

                            var autoheight = true;
                            editor.jqxComboBox({ keyboardSelection: false, source: dataadapter, rtl: this.rtl, autoDropDownHeight: autoheight, theme: this.theme, width: $element.width() - 2, height: $element.height() - 2, displayMember: displayfield, valueMember: datafield });
                            this.editors["combobox" + "_" + datafieldname] = editor;
                            if (column.createeditor) {
                                column.createeditor(row, cellvalue, editor);
                            }
                        }
                        if (column._requirewidthupdate) {
                            editor.jqxComboBox({ width: $element.width() - 2 });
                        }

                        var dropdownitems = editor.jqxComboBox('listBox').visibleItems;
                        if (dropdownitems.length < 8) {
                            editor.jqxComboBox('autoDropDownHeight', true);
                        }
                        else {
                            editor.jqxComboBox('autoDropDownHeight', false);
                        }

                        var cellvalue = this.getcellvalue(row, displayfield);
                        var selectedIndex = this.findRecordIndex(cellvalue, displayfield, dropdownitems);
                        if (init) {
                            if (cellvalue != "") {
                                editor.jqxComboBox('selectIndex', selectedIndex, true);
                                editor.jqxComboBox('val', cellvalue);
                            }
                            else {
                                editor.jqxComboBox('selectIndex', -1);
                                editor.jqxComboBox('val', cellvalue);
                            }
                        }

                        if (this.editcell.defaultvalue != undefined) {
                            editor.jqxComboBox('selectIndex', this.editcell.defaultvalue, true);
                        }

                        if (this.editchar && this.editchar.length > 0) {
                            editor.jqxComboBox('input').val(this.editchar);
                        }

                        if (focusable) {
                            setTimeout(function () {
                                focuseditor(editor.jqxComboBox('input'));
                                editor.jqxComboBox('_setSelection', 0, 0);
                                if (me.editchar) {
                                    editor.jqxComboBox('_setSelection', 1, 1);
                                    me.editchar = null;
                                }
                                else {
                                    var val = editor.jqxComboBox('input').val();
                                    editor.jqxComboBox('_setSelection', 0, val.length);
                                }
                            }, 10);
                        }
                    }
                    break;
                case "datetimeinput":
                    if (this.host.jqxDateTimeInput) {
                        element.innerHTML = "";
                        var dateeditor = this.editors["datetimeinput" + "_" + column.datafield];
                        editor = dateeditor == undefined ? $("<div style='z-index: 99999; top: 0px; left: 0px; position: absolute;' id='datetimeeditor'></div>") : dateeditor;
                        editor.show();
                        editor.css('top', $(element).parent().position().top);
                        if (this.oldhscroll) {
                            editor.css('left', -left + parseInt($(element).position().left));
                        }
                        else {
                            editor.css('left', parseInt($(element).position().left));
                        }

                        var datafieldname = $.trim(column.datafield).split(" ").join("");
                        if (dateeditor == undefined) {
                            editor.prependTo(this.table);
                            editor[0].id = "datetimeeditor" + this.element.id + datafieldname;
                            editor.jqxDateTimeInput({_editor: true, theme: this.theme, rtl: this.rtl, width: $element.width(), height: $element.height(), formatString: column.cellsformat });
                            this.editors["datetimeinput" + "_" + datafieldname] = editor;
                            if (column.createeditor) {
                                column.createeditor(row, cellvalue, editor);
                            }
                        }
                        if (column._requirewidthupdate) {
                            editor.jqxDateTimeInput({ width: $element.width() - 2 });
                        }
                        if (init) {
                            if (cellvalue != "" && cellvalue != null) {
                                var date = new Date(cellvalue);
                                if (date == "Invalid Date") {
                                    if (this.source.getvaluebytype) {
                                        date = this.source.getvaluebytype(cellvalue, { name: column.datafield, type: 'date' });
                                    }
                                }

                                editor.jqxDateTimeInput('setDate', date);
                            }
                            else {
                                editor.jqxDateTimeInput('setDate', null);
                            }

                            if (this.editcell.defaultvalue != undefined) {
                                editor.jqxDateTimeInput('setDate', this.editcell.defaultvalue);
                            }
                        }
                        if (focusable) {
                            setTimeout(function () {
                                focuseditor(editor.jqxDateTimeInput('dateTimeInput'));
                            }, 10);
                        }
                    }
                    break;
                case "numberinput":
                    if (this.host.jqxNumberInput) {
                        element.innerHTML = "";
                        var numbereditor = this.editors["numberinput" + "_" + column.datafield];
                        editor = numbereditor == undefined ? $("<div style='z-index: 99999; top: 0px; left: 0px; position: absolute;' id='numbereditor'></div>") : numbereditor;
                        editor.show();
                        editor.css('top', $(element).parent().position().top);
                        if (this.oldhscroll) {
                            editor.css('left', -left + parseInt($(element).position().left));
                        }
                        else {
                            editor.css('left', parseInt($(element).position().left));
                        }

                        var datafieldname = $.trim(column.datafield).split(" ").join("");
                        if (numbereditor == undefined) {
                            editor.prependTo(this.table);
                            editor[0].id = "numbereditor" + this.element.id + datafieldname;
                            var symbol = '';
                            var symbolPosition = 'left';
                            if (column.cellsformat) {
                                if (column.cellsformat.indexOf('c') != -1) {
                                    symbol = this.gridlocalization.currencysymbol;
                                }
                                else if (column.cellsformat.indexOf('p') != -1) {
                                    symbol = this.gridlocalization.percentsymbol;
                                    symbolPosition = 'right';
                                }
                            }
                            editor.jqxNumberInput({ inputMode: 'simple', theme: this.theme, rtl: this.rtl, width: $element.width() - 1, height: $element.height() - 1, spinButtons: true, symbol: symbol, symbolPosition: symbolPosition });
                            this.editors["numberinput" + "_" + datafieldname] = editor;
                            if (column.createeditor) {
                                column.createeditor(row, cellvalue, editor);
                            }
                        }
                        if (column._requirewidthupdate) {
                            editor.jqxNumberInput({ width: $element.width() - 2 });
                        }
                        if (init) {
                            if (cellvalue != "" && cellvalue != null) {
                                var decimal = cellvalue;
                                editor.jqxNumberInput('setDecimal', decimal);
                            }
                            else {
                                editor.jqxNumberInput('setDecimal', 0);
                            }

                            if (this.editcell.defaultvalue != undefined) {
                                editor.jqxNumberInput('setDecimal', this.editcell.defaultvalue);
                            }

                            if (this.editchar && this.editchar.length > 0) {
                                var digit = parseInt(this.editchar);
                                if (!isNaN(digit)) {
                                    editor.jqxNumberInput('setDecimal', digit);
                                }
                            }

                            if (focusable) {
                                setTimeout(function () {
                                    focuseditor(editor.jqxNumberInput('numberInput'));
                                    editor.jqxNumberInput('_setSelectionStart', 0);
                                    if (me.editchar) {
                                        if (column.cellsformat.length > 0) {
                                            editor.jqxNumberInput('_setSelectionStart', 2);
                                        }
                                        else {
                                            editor.jqxNumberInput('_setSelectionStart', 1);
                                        }
                                        me.editchar = null;
                                    }
                                    else {
                                        var spinbuttons = editor.jqxNumberInput('spinButtons');
                                        if (spinbuttons) {
                                            var val = editor.jqxNumberInput('numberInput').val();
                                            me._setSelection(editor.jqxNumberInput('numberInput')[0], val.length, val.length);
                                        }
                                        else {
                                            var val = editor.jqxNumberInput('numberInput').val();
                                            me._setSelection(editor.jqxNumberInput('numberInput')[0], 0, val.length);
                                        }
                                    }
                                }, 10);
                            }
                        }
                    }
                    break;
                case "textbox":
                default:
                    element.innerHTML = "";
                    editor = this.editors["textboxeditor" + "_" + column.datafield] || $("<input 'type='textbox' id='textboxeditor'/>");
                    editor[0].id = "textboxeditor" + this.element.id + column.datafield;
                    editor.appendTo($element);

                    if (this.rtl) {
                        editor.css('direction', 'rtl');
                    }

                    if (init) {
                        editor.addClass(this.toThemeProperty('jqx-input'));
                        editor.addClass(this.toThemeProperty('jqx-widget-content'));
                        if (this.editchar && this.editchar.length > 0) {
                            editor.val(this.editchar);
                        }
                        else {
                            editor.val(cellvalue);
                        }

                        if (this.editcell.defaultvalue != undefined) {
                            editor.val(this.editcell.defaultvalue);
                        }
                        editor.width($element.width());
                        editor.height($element.height());

                        if (column.createeditor) {
                            column.createeditor(row, cellvalue, editor);
                        }
                    }

                    this.editors["textboxeditor" + "_" + column.datafield] = editor;

                    if (init) {
                        if (focusable) {
                            setTimeout(function () {
                                focuseditor(editor);
                                if (me.editchar) {
                                    me._setSelection(editor[0], 1, 1);
                                    me.editchar = null;
                                }
                                else {
                                    me._setSelection(editor[0], 0, editor.val().length);
                                }
                            }, 10);
                        }
                    }
                    break;
            }

            if (init) {
                if (column.initeditor) {
                    column.initeditor(row, cellvalue, editor);
                }
            }

            if (editor) {
                editor.css('display', 'block');
                this.editcell.editor = editor;
            }
        },

        _setSelection: function (textbox, start, end) {
            try {
                if ('selectionStart' in textbox) {
                    textbox.setSelectionRange(start, end);
                }
                else {
                    var range = textbox.createTextRange();
                    range.collapse(true);
                    range.moveEnd('character', end);
                    range.moveStart('character', start);
                    range.select();
                }
            }
            catch (error) {
                var err = error;
            }
        },

        _hideeditors: function () {
            if (this.editcells != null) {
                var me = this;
                for (var obj in this.editcells) {
                    me.editcell = me.editcells[obj];
                    me._hidecelleditor();
                }
            }
        },

        _hidecelleditor: function () {
            if (!this.editcell) {
                return;
            }

            if (this.editcell.columntype == 'checkbox') {
                return;
            }

            if (this.editcell.editor) {
                this.editcell.editor.hide();
                switch (this.editcell.columntype) {
                    case "dropdownlist":
                        this.editcell.editor.jqxDropDownList({ closeDelay: 0 });
                        this.editcell.editor.jqxDropDownList('hideListBox');
                        this.editcell.editor.jqxDropDownList({ closeDelay: 400 });
                        break;
                    case "combobox":
                        this.editcell.editor.jqxComboBox({ closeDelay: 0 });
                        this.editcell.editor.jqxComboBox('hideListBox');
                        this.editcell.editor.jqxComboBox({ closeDelay: 400 });
                        break;
                    case "datetimeinput":
                        var datetimeeiditor = this.editcell.editor;
                        if (datetimeeiditor.jqxDateTimeInput('isOpened')) {
                            datetimeeiditor.jqxDateTimeInput({ closeDelay: 0 });
                            datetimeeiditor.jqxDateTimeInput('hideCalendar');
                            datetimeeiditor.jqxDateTimeInput({ closeDelay: 400 });
                        }
                        break;
                }
            }

            if (this.validationpopup) {
                this.validationpopup.hide();
                this.validationpopuparrow.hide();
            }
            if (!this.isNestedGrid) {
                this.element.focus();
            }
        },

        _geteditorvalue: function (column) {
            var value = new String();
            if (this.editcell.editor) {
                switch (column.columntype) {
                    case "textbox":
                    default:
                        value = this.editcell.editor.val();
                        if (column.cellsformat != "") {
                            if (column.cellsformat.indexOf('p') != -1 || column.cellsformat.indexOf('c') != -1 || column.cellsformat.indexOf('n') != -1 || column.cellsformat.indexOf('f') != -1) {
                                value = parseFloat(value);
                            }
                        }
                        if (column.displayfield != column.datafield) {
                            value = { label: value, value: value };
                        }
                        break;
                    case "datetimeinput":
                        if (this.editcell.editor.jqxDateTimeInput) {
                            this.editcell.editor.jqxDateTimeInput({ isEditing: false });
                            value = this.editcell.editor.jqxDateTimeInput('getDate');
                            if (value == null) return "";
                            value = new Date(value.toString());
                            if (value == null) {
                                value == "";
                            }
                            if (column.displayfield != column.datafield) {
                                value = { label: value, value: value };
                            }
                        }
                        break;
                    case "dropdownlist":
                        if (this.editcell.editor.jqxDropDownList) {
                            var selectedIndex = this.editcell.editor.jqxDropDownList('selectedIndex');
                            var item = this.editcell.editor.jqxDropDownList('listBox').getVisibleItem(selectedIndex);
                            if (column.displayfield != column.datafield) {
                                if (item) {
                                    value = { label: item.label, value: item.value };
                                }
                                else value = "";
                            }
                            else {
                                if (item) value = item.label;
                                else value = "";
                            }

                            if (value == null) {
                                value = "";
                            }
                        }
                        break;
                    case "combobox":
                        if (this.editcell.editor.jqxComboBox) {
                            value = this.editcell.editor.jqxComboBox('val');
                            if (column.displayfield != column.datafield) {
                                var item = this.editcell.editor.jqxComboBox('getSelectedItem');
                                if (item != null) {
                                    value = { label: value, value: item.value };
                                }
                            }
                            //var selectedIndex = this.editcell.editor.jqxComboBox('selectedIndex');
                            //var autoComplete = this.editcell.editor.jqxComboBox('autoComplete');
                            //var item = this.editcell.editor.jqxComboBox('getItem', selectedIndex);
                            //if (autoComplete) {
                            //     item = this.editcell.editor.jqxComboBox('val');
                            //}

                            //if (item) {
                            //    value = item.label;
                            //}
                            //else value = "";

                            if (value == null) {
                                value = "";
                            }
                        }
                        break;
                    case "numberinput":
                        if (this.editcell.editor.jqxNumberInput) {
                            var decimal = this.editcell.editor.jqxNumberInput('getDecimal');
                            value = new Number(decimal);
                            value = parseFloat(value);
                            if (isNaN(value)) {
                                value = 0;
                            }
                            if (column.displayfield != column.datafield) {
                                value = { label: value, value: value };
                            }
                        }
                        break;
                }
            }
            return value;
        },

        hidevalidationpopups: function () {
            if (this.popups) {
                $.each(this.popups, function () {
                    this.validation.remove();
                    this.validationrow.remove();
                });
                this.popups = new Array();
            }
            if (this.validationpopup) {
                this.validationpopuparrow.hide();
                this.validationpopup.hide();
            }
        },


        showvalidationpopup: function (row, datafield, message) {
            if (message == undefined) {
                var message = this.gridlocalization.validationstring;
            }

            var validationpopup = $("<div style='z-index: 99999; top: 0px; left: 0px; position: absolute;'></div>");
            var validationpopuparrow = $("<div style='width: 20px; height: 20px; z-index: 999999; top: 0px; left: 0px; position: absolute;'></div>");
            validationpopup.html(message);
            validationpopuparrow.addClass(this.toThemeProperty('jqx-grid-validation-arrow-up'));
            validationpopup.addClass(this.toThemeProperty('jqx-grid-validation'));
            validationpopup.addClass(this.toThemeProperty('jqx-rc-all'));
            validationpopup.prependTo(this.table);
            validationpopuparrow.prependTo(this.table);

            var hScrollInstance = this.hScrollInstance;
            var horizontalscrollvalue = hScrollInstance.value;
            var left = parseInt(horizontalscrollvalue);
            var element = this.getcolumn(datafield).uielement;
            var rowElement = $(this.hittestinfo[row].visualrow);
            validationpopup.css('top', parseInt(rowElement.position().top) + 30 + 'px');

            var topposition = parseInt(validationpopup.css('top'));

            validationpopuparrow.css('top', topposition - 12);
            validationpopuparrow.removeClass();
            validationpopuparrow.addClass(this.toThemeProperty('jqx-grid-validation-arrow-up'));

            if (topposition > this._gettableheight()) {
                validationpopuparrow.removeClass(this.toThemeProperty('jqx-grid-validation-arrow-up'));
                validationpopuparrow.addClass(this.toThemeProperty('jqx-grid-validation-arrow-down'));
                topposition = parseInt($(element).parent().position().top) - 30;
                validationpopup.css('top', topposition + 'px');
                validationpopuparrow.css('top', topposition + validationpopup.outerHeight() - 9);
            }
            var leftposition = -left + parseInt($(element).position().left);

            validationpopuparrow.css('left', left + leftposition + 30);

            var width = validationpopup.width();
            if (width + leftposition > this.host.width() - 20) {
                var offset = width + leftposition - this.host.width() + 40;
                leftposition -= offset;
            }

            validationpopup.css('left', left + leftposition);
            validationpopup.show();
            validationpopuparrow.show();
            if (!this.popups) {
                this.popups = new Array();
            }
            this.popups[this.popups.length] = { validation: validationpopup, validationrow: validationpopuparrow };
        },

        _showvalidationpopup: function (row, datafield, message) {
            var editor = this.editcell.editor;
            if (!editor)
                return;

            if (!this.validationpopup) {
                var validationpopup = $("<div style='z-index: 99999; top: 0px; left: 0px; position: absolute;'></div>");
                var validationpopuparrow = $("<div style='width: 20px; height: 20px; z-index: 999999; top: 0px; left: 0px; position: absolute;'></div>");
                validationpopup.html(message);
                validationpopuparrow.addClass(this.toThemeProperty('jqx-grid-validation-arrow-up'));
                validationpopup.addClass(this.toThemeProperty('jqx-grid-validation'));
                validationpopup.addClass(this.toThemeProperty('jqx-rc-all'));
                validationpopup.prependTo(this.table);
                validationpopuparrow.prependTo(this.table);
                this.validationpopup = validationpopup;
                this.validationpopuparrow = validationpopuparrow;
            }
            else {
                this.validationpopup.html(message);
            }

            var hScrollInstance = this.hScrollInstance;
            var horizontalscrollvalue = hScrollInstance.value;
            var left = parseInt(horizontalscrollvalue);

            this.validationpopup.css('top', parseInt($(this.editcell.element).parent().position().top) + (this.rowsheight + 5) + 'px');

            var topposition = parseInt(this.validationpopup.css('top'));

            this.validationpopuparrow.css('top', topposition - 12);
            this.validationpopuparrow.removeClass();
            this.validationpopuparrow.addClass(this.toThemeProperty('jqx-grid-validation-arrow-up'));

            if (topposition > this._gettableheight()) {
                this.validationpopuparrow.removeClass(this.toThemeProperty('jqx-grid-validation-arrow-up'));
                this.validationpopuparrow.addClass(this.toThemeProperty('jqx-grid-validation-arrow-down'));
                topposition = parseInt($(this.editcell.element).parent().position().top) - this.rowsheight - 5;
                this.validationpopup.css('top', topposition + 'px');
                this.validationpopuparrow.css('top', topposition + this.validationpopup.outerHeight() - 9);
            }
            var leftposition = -left + parseInt($(this.editcell.element).position().left);

            this.validationpopuparrow.css('left', left + leftposition + 30);

            var width = this.validationpopup.width();
            if (width + leftposition > this.host.width() - 20) {
                var offset = width + leftposition - this.host.width() + 40;
                leftposition -= offset;
            }

            this.validationpopup.css('left', left + leftposition);
            this.validationpopup.show();
            this.validationpopuparrow.show();
        }
    });
})(jQuery);


