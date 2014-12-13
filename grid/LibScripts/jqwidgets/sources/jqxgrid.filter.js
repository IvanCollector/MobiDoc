/*
jQWidgets v2.7.0 (2013-Feb-08)
Copyright (c) 2011-2013 jQWidgets.
License: http://jqwidgets.com/license/
*/

(function ($) {

    $.extend($.jqx._jqxGrid.prototype, {
        _updatefilterrowui: function (forceupdateui) {
            var columnslength = this.columns.records.length;
            var left = 0;
            for (var j = 0; j < columnslength; j++) {
                var columnrecord = this.columns.records[j];
                var width = columnrecord.width;
                if (width < columnrecord.minwidth) width = columnrecord.minwidth;
                if (width > columnrecord.maxwidth) width = columnrecord.maxwidth;
                var tablecolumn = $(this.filterrow[0].cells[j]);
                tablecolumn.css('left', left);
                var updateui = true;
                if (tablecolumn.width() == width)
                    updateui = false;
                if (forceupdateui) updateui = true;
                tablecolumn.width(width);
                tablecolumn[0].left = left;
                if (!(columnrecord.hidden && columnrecord.hideable)) {
                    left += width;
                }
                else {
                    tablecolumn.css('display', 'none');
                }
                if (!updateui)
                    continue;

                if (columnrecord.createfilterwidget && columnrecord.filtertype == 'custom') {
                    columnrecord.createfilterwidget(columnrecord, tablecolumn);
                }
                else {
                    if (columnrecord.filterable) {
                        var addtextfilter = function (me, tablecolumn) {
                            var textbox = $(tablecolumn.children()[0]);
                            textbox.width(width - 10);
                        }

                        switch (columnrecord.filtertype) {
                            case 'number':
                                $(tablecolumn.children()[0]).width(width);
                                tablecolumn.find('input').width(width - 30);
                                break;
                            case 'date':
                                if (this.host.jqxDateTimeInput) {
                                    $(tablecolumn.children()[0]).jqxDateTimeInput({ width: width - 10 });
                                }
                                else addtextfilter(this, tablecolumn);
                                break;
                            case 'textbox':
                            case 'default':
                                addtextfilter(this, tablecolumn);
                                break;
                            case 'list':
                            case 'checkedlist':
                                if (this.host.jqxDropDownList) {
                                    $(tablecolumn.children()[0]).jqxDropDownList({ width: width - 10 });
                                }
                                else addtextfilter(this, tablecolumn);
                                break;
                            case 'bool':
                            case 'boolean':
                                if (!this.host.jqxCheckBox) {
                                    addtextfilter(this, tablecolumn);
                                }
                                break;
                        }
                    }
                }
            }
            var tablerow = $(this.filterrow.children()[0]);
            tablerow.width(parseInt(left) + 2);
            tablerow.height(this.filterrowheight);
        },

        clearfilterrow: function () {
            this._disablefilterrow = true;
            var columnslength = this.columns.records.length;
            var left = 0;
            for (var j = 0; j < columnslength; j++) {
                var columnrecord = this.columns.records[j];
                var tablecolumn = $(this.filterrow[0].cells[j]);

                if (columnrecord.filterable) {
                    var addtextfilter = function (me, tablecolumn) {
                        var textbox = $(tablecolumn.children()[0]);
                        textbox.val("");
                        me["_oldWriteText" + textbox[0].id] = "";
                    }

                    switch (columnrecord.filtertype) {
                        case 'number':
                            tablecolumn.find('input').val("");
                            break;
                        case 'date':
                            if (this.host.jqxDateTimeInput) {
                                $(tablecolumn.children()[0]).jqxDateTimeInput('setDate', null);
                            }
                            else addtextfilter(this, tablecolumn);
                            break;
                        case 'textbox':
                        case 'default':
                            addtextfilter(this, tablecolumn);
                            break;
                        case 'list':
                            if (this.host.jqxDropDownList) {
                                $(tablecolumn.children()[0]).jqxDropDownList('clearSelection');
                            }
                            else addtextfilter(this, tablecolumn);
                            break;
                        case 'checkedlist':
                            if (this.host.jqxDropDownList) {
                                $(tablecolumn.children()[0]).jqxDropDownList('checkAll', false);
                            }
                            else addtextfilter(this, tablecolumn);
                            break;
                        case 'bool':
                        case 'boolean':
                            if (!this.host.jqxCheckBox) {
                                addtextfilter(this, tablecolumn);
                            }
                            else $(tablecolumn.children()[0]).jqxCheckBox({ checked: null });
                            break;
                    }

                }
            }
            this._disablefilterrow = false;
        },

        _applyfilterfromfilterrow: function () {
            if (this._disablefilterrow == true)
                return;

            var columnslength = this.columns.records.length;
            var me = this;

            for (var j = 0; j < columnslength; j++) {
                var filtergroup = new $.jqx.filter();
                var columnrecord = this.columns.records[j];
                if (!columnrecord.filterable) continue;

                var type = me._getcolumntypebydatafield(columnrecord);
                var filtertype = me._getfiltertype(type);
                var filter_or_operator = 1;
                var hasFilter = true;
                var columnrecordfiltertype = columnrecord.filtertype;
                var addstringfilter = function (columnrecord, filtertype, filtergroup) {
                    var result = true;
                    if (columnrecord._filterwidget) {
                        var filtervalue = columnrecord._filterwidget.val();
                        if (filtervalue != "") {
                            var filtercondition = 'equal';
                            if (filtertype == 'stringfilter') {
                                var filtercondition = 'contains';
                            }
                            if (filtertype != 'stringfilter') {
                                var hasoperator = 0;
                                if (filtervalue.indexOf('>') != -1) {
                                    filtercondition = "greater_than";
                                    hasoperator = 1;
                                }
                                if (filtervalue.indexOf('<') != -1) {
                                    filtercondition = "less_than";
                                    hasoperator = 1;
                                }
                                if (filtervalue.indexOf('=') != -1) {
                                    if (filtercondition == "greater_than") {
                                        filtercondition = "greater_than_or_equal";
                                        hasoperator = 2;
                                    }
                                    else if (filtercondition == "less_than") {
                                        filtercondition = "less_than_or_equal";
                                        hasoperator = 2;
                                    }
                                    else {
                                        filtercondition = "equal";
                                        hasoperator = 1;
                                    }
                                }
                                if (hasoperator != 0) {
                                    filtervalue = filtervalue.substring(hasoperator);
                                    if (filtervalue.length < 1) return false;
                                }
                            }

                            if (columnrecord.filtercondition != undefined) filtercondition = columnrecord.filtercondition;
                            var filter = filtergroup.createfilter(filtertype, filtervalue, filtercondition);
                            filtergroup.addfilter(filter_or_operator, filter);
                        }
                        else result = false;
                    }
                    return result;
                }

                switch (columnrecord.filtertype) {
                    case 'date':
                        if (columnrecord._filterwidget.jqxDateTimeInput) {
                            var filtervalue = columnrecord._filterwidget.jqxDateTimeInput('getRange');
                            if (filtervalue != null && filtervalue.from != null && filtervalue.to != null) {
                                var filtercondition = 'GREATER_THAN_OR_EQUAL';
                                var date1 = new Date(0);
                                date1.setHours(0);
                                date1.setFullYear(filtervalue.from.getFullYear(), filtervalue.from.getMonth(), filtervalue.from.getDate());
                                var date2 = new Date(0);
                                date2.setHours(0);
                                date2.setFullYear(filtervalue.to.getFullYear(), filtervalue.to.getMonth(), filtervalue.to.getDate());
                                date2.setHours(filtervalue.to.getHours());
                                date2.setMinutes(filtervalue.to.getMinutes());
                                date2.setSeconds(filtervalue.to.getSeconds());

                                var filter1 = filtergroup.createfilter(filtertype, date1, filtercondition);
                                filtergroup.addfilter(0, filter1);

                                var filtercondition2 = 'LESS_THAN_OR_EQUAL';
                                var filter2 = filtergroup.createfilter(filtertype, date2, filtercondition2);
                                filtergroup.addfilter(0, filter2);
                            }
                            else hasFilter = false;
                        }
                        else {
                            hasFilter = addstringfilter(columnrecord, filtertype, filtergroup);
                        }
                        break;
                    case 'number':
                        if (columnrecord._filterwidget) {
                            var filtervalue = columnrecord._filterwidget.find('input').val();
                            var index = columnrecord._filterwidget.find('.filter').jqxDropDownList('selectedIndex');
                            var condition = filtergroup.getoperatorsbyfiltertype(filtertype)[index];
                            if (me.updatefilterconditions) {
                                var newfilterconditions = me.updatefilterconditions(filtertype, filtergroup.getoperatorsbyfiltertype(filtertype));
                                if (newfilterconditions != undefined) {
                                    filtergroup.setoperatorsbyfiltertype(filtertype, newfilterconditions);
                                }
                                var condition = filtergroup.getoperatorsbyfiltertype(filtertype)[index];
                            }
                            var nullcondition1 = condition == "NULL" || condition == "NOT_NULL";
                            var emptycondition1 = condition == "EMPTY" || condition == "NOT_EMPTY";
                            if (filtervalue != undefined && filtervalue.length > 0 || nullcondition1 || emptycondition1) {
                                filter1 = filtergroup.createfilter(filtertype, filtervalue, condition, null, columnrecord.cellsformat, me.gridlocalization);
                                filtergroup.addfilter(0, filter1);
                            }
                            else hasFilter = false;
                        }
                        else {
                            hasFilter = false;
                        }
                        break;
                    case 'textbox':
                    case 'default':
                        hasFilter = addstringfilter(columnrecord, filtertype, filtergroup);
                        break;
                    case 'bool':
                    case 'boolean':
                        if (columnrecord._filterwidget.jqxCheckBox) {
                            var filtervalue = columnrecord._filterwidget.jqxCheckBox('checked');
                            if (filtervalue != null) {
                                var filtercondition = 'equal';
                                var filter = filtergroup.createfilter(filtertype, filtervalue, filtercondition);
                                filtergroup.addfilter(filter_or_operator, filter);
                            }
                            else hasFilter = false;
                        } else hasFilter = addstringfilter(columnrecord, filtertype, filtergroup);
                        break;
                    case 'list':
                        var widget = columnrecord._filterwidget.jqxDropDownList('listBox');
                        if (widget.selectedIndex > 0) {
                            var selectedItem = widget.getItem(widget.selectedIndex);
                            var filtervalue = selectedItem.value;
                            var filtercondition = 'equal';
                            var filter = filtergroup.createfilter(filtertype, filtervalue, filtercondition);
                            filtergroup.addfilter(filter_or_operator, filter);
                        } else {
                            hasFilter = false;
                        }
                        break;
                    case 'checkedlist':
                        if (columnrecord._filterwidget.jqxDropDownList) {
                            var widget = columnrecord._filterwidget.jqxDropDownList('listBox');
                            var checkedItems = widget.getCheckedItems();
                            if (checkedItems.length == 0) {
                                for (var i = 1; i < widget.items.length; i++) {
                                    var filtervalue = widget.items[i].value;
                                    var filtercondition = 'not_equal';
                                    var filter = filtergroup.createfilter(filtertype, filtervalue, filtercondition);
                                    filtergroup.addfilter(0, filter);
                                }

                                hasFilter = true;
                            }
                            else {
                                if (checkedItems.length != widget.items.length) {
                                    for (var i = 0; i < checkedItems.length; i++) {
                                        var filtervalue = checkedItems[i].value;
                                        var filtercondition = 'equal';
                                        var filter = filtergroup.createfilter(filtertype, filtervalue, filtercondition);
                                        filtergroup.addfilter(filter_or_operator, filter);
                                    }
                                }
                                else hasFilter = false;
                            }
                        }
                        else hasFilter = addstringfilter(columnrecord, filtertype, filtergroup);
                        break;
                }

                if (!this._loading) {
                    if (hasFilter) {
                        this.addfilter(columnrecord.displayfield, filtergroup, false);
                    }
                    else {
                        this.removefilter(columnrecord.displayfield, false);
                    }
                }
            }
            if (!this._loading) {
                this.applyfilters();
            }
        },

        _updatefilterrow: function () {
            var tablerow = $('<div style="position: relative;" id="row00' + this.element.id + '"></div>');
            var left = 0;
            var columnslength = this.columns.records.length;
            var cellclass = this.toThemeProperty('jqx-grid-cell');
            cellclass += ' ' + this.toThemeProperty('jqx-grid-cell-pinned');
            var zindex = columnslength + 10;
            var cells = new Array();
            var me = this;
            this.filterrow[0].cells = cells;
            tablerow.height(this.filterrowheight);
            this.filterrow.children().detach();
            this.filterrow.append(tablerow);
            if (!this._filterrowcache)
                this._filterrowcache = new Array();

            var usefromcache = false;
            var _newfilterrowcache = new Array();
            for (var j = 0; j < columnslength; j++) {
                var columnrecord = this.columns.records[j];
                var width = columnrecord.width;
                if (width < columnrecord.minwidth) width = columnrecord.minwidth;
                if (width > columnrecord.maxwidth) width = columnrecord.maxwidth;

                var tablecolumn = $('<div style="overflow: hidden; position: absolute; height: 100%;" class="' + cellclass + '"></div>');
                tablerow.append(tablecolumn);
                tablecolumn.css('left', left);
                if (this.rtl) {
                    tablecolumn.css('z-index', zindex++);
                    tablecolumn.css('border-left-width', '1px');
                }
                else {
                    tablecolumn.css('z-index', zindex--);
                }
                tablecolumn.width(width);
                tablecolumn[0].left = left;
                if (!(columnrecord.hidden && columnrecord.hideable)) {
                    left += width;
                }
                else {
                    tablecolumn.css('display', 'none');
                }
                cells[cells.length] = tablecolumn[0];

                var addFilterWidget = true;
                if (this.groupable) {
                    var detailsoffset = this.rowdetails ? 1 : 0;
                    if (this.groups.length + detailsoffset > j) {
                        addFilterWidget = false;
                    }
                }
                if (this.rowdetails && j == 0) addFilterWidget = false;

                if (addFilterWidget) {
                    if (columnrecord.filtertype == 'custom' && columnrecord.createfilterwidget) {
                        var applyfilter = function () {
                            me._applyfilterfromfilterrow();
                        }
                        columnrecord.createfilterwidget(columnrecord, tablecolumn, applyfilter);
                    }
                    else {
                        if (columnrecord.filterable) {
                            if (this._filterrowcache[columnrecord.datafield]) {
                                usefromcache = true;
                                tablecolumn.append(this._filterrowcache[columnrecord.datafield]);
                                columnrecord._filterwidget = this._filterrowcache[columnrecord.datafield];
                            }
                            else {
                                this._addfilterwidget(columnrecord, tablecolumn, width);
                                _newfilterrowcache[columnrecord.datafield] = columnrecord._filterwidget;
                            }
                        }
                    }
                }
            }
            this._filterrowcache = _newfilterrowcache;
            if ($.jqx.browser.msie && $.jqx.browser.version < 8) {
                tablerow.css('z-index', zindex--);
            }

            tablerow.width(parseInt(left) + 2);
            this.filterrow.addClass(cellclass);
            this.filterrow.css('border-top-width', '1px');
            if (usefromcache) {
                this._updatefilterrowui(true);
            }
        },

        _addfilterwidget: function (columnrecord, tablecolumn, width) {
            var me = this;
            var filtervalue = "";
            for (var f = 0; f < me.dataview.filters.length; f++) {
                var currentfilter = me.dataview.filters[f];
                if (currentfilter.datafield && currentfilter.datafield == columnrecord.datafield) {
                    filtervalue = currentfilter.filter.getfilters()[0].value;
                    break;
                }
            }

            var addtextfilter = function (me, tablecolumn) {
                var textbox = $('<input autocomplete="off" type="textarea"/>');
                textbox[0].id = $.jqx.utilities.createId();
                textbox.addClass(me.toThemeProperty('jqx-input'));
                textbox.addClass(me.toThemeProperty('jqx-widget-content'));
                if (me.rtl) {
                    textbox.css('direction', 'rtl');
                }

                textbox.appendTo(tablecolumn);
                textbox.width(width - 10);
                textbox.height(me.filterrowheight - 10);
                textbox.css('margin', '4px');
                if (columnrecord.createfilterwidget) {
                    columnrecord.createfilterwidget(columnrecord, tablecolumn, textbox);
                }
                columnrecord._filterwidget = textbox;

                textbox.focus(function () {
                    me.focusedfilter = textbox;
                });

                textbox.on('keydown', function (event) {
                    if (event.keyCode == '13')
                        me._applyfilterfromfilterrow();
                    if (textbox[0]._writeTimer) clearTimeout(textbox[0]._writeTimer);
                    textbox[0]._writeTimer = setTimeout(function () {
                        if (!me._loading) {
                            if (me["_oldWriteText" + textbox[0].id] != textbox.val()) {
                                me._applyfilterfromfilterrow();
                                me["_oldWriteText" + textbox[0].id] = textbox.val();
                            }
                        }
                    }, 400);
                    me.focusedfilter = textbox;
                });
                me.host.removeClass('jqx-disableselect');
                me.content.removeClass('jqx-disableselect');
                textbox.val(filtervalue);
            }

            switch (columnrecord.filtertype) {
                case 'number':
                    var numberwidget = $("<div></div>");
                    numberwidget.width(tablecolumn.width());
                    numberwidget.height(this.filterrowheight);
                    tablecolumn.append(numberwidget);
                    var width = tablecolumn.width() - 20;
                    var addInput = function (element, width, sign) {
                        var textbox = $('<input style="float: left;" autocomplete="off" type="textarea"/>');
                        if (me.rtl) {
                            textbox.css('float', 'right');
                            textbox.css('direction', 'rtl');
                        }
                        textbox[0].id = $.jqx.utilities.createId();
                        textbox.addClass(me.toThemeProperty('jqx-input'));
                        textbox.addClass(me.toThemeProperty('jqx-widget-content'));
                        textbox.appendTo(element);
                        textbox.width(width - 10);
                        textbox.height(me.filterrowheight - 10);
                        textbox.css('margin', '4px');
                        textbox.css('margin-right', '2px');
                        textbox.on('keydown', function (event) {
                            if (event.keyCode == '13')
                                me._applyfilterfromfilterrow();
                            if (textbox[0]._writeTimer) clearTimeout(textbox[0]._writeTimer);
                            textbox[0]._writeTimer = setTimeout(function () {
                                if (!me._loading) {

                                    if (me["_oldWriteText" + textbox[0].id] != textbox.val()) {
                                        me._applyfilterfromfilterrow();
                                        me["_oldWriteText" + textbox[0].id] = textbox.val();
                                    }
                                }
                            }, 400);
                            me.focusedfilter = textbox;
                        });
                        textbox.val(filtervalue);
                        return textbox;
                    }

                    addInput(numberwidget, width);
                    var source = me._getfiltersbytype('number');
                    var dropdownlist = $("<div class='filter' style='float: left;'></div>");
                    dropdownlist.css('margin-top', '4px');
                    dropdownlist.appendTo(numberwidget);
                    if (me.rtl) {
                        dropdownlist.css('float', 'right');
                    }

                    var selectedIndex = 2;
                    if (columnrecord.filtercondition != null) {
                        var newIndex = source.indexOf(columnrecord.filtercondition);
                        if (newIndex != -1)
                            selectedIndex = newIndex;
                    }

                    dropdownlist.jqxDropDownList({rtl: me.rtl, dropDownHorizontalAlignment: 'right', enableBrowserBoundsDetection: true, selectedIndex: selectedIndex, width: 18, height: 20, dropDownHeight: 150, dropDownWidth: 170, source: source, theme: me.theme });
                    dropdownlist.jqxDropDownList({
                        selectionRenderer: function (element) {
                            return "";
                        }
                    });
                    dropdownlist.jqxDropDownList('setContent', "");
                    dropdownlist.find('.jqx-dropdownlist-content').hide();
                    if (columnrecord.createfilterwidget) {
                        columnrecord.createfilterwidget(columnrecord, tablecolumn, numberwidget);
                    }
                    columnrecord._filterwidget = numberwidget;
                    dropdownlist.on('select', function () {
                        if (columnrecord._filterwidget.find('input').val().length > 0) {
                            me._applyfilterfromfilterrow();
                        }
                    });
                    break;
                case 'textbox':
                case 'default':
                default:
                    addtextfilter(this, tablecolumn);
                    break;
                case 'date':
                    if (this.host.jqxDateTimeInput) {
                        var datetimeinput = $("<div></div>");
                        datetimeinput.css('margin', '4px');
                        datetimeinput.appendTo(tablecolumn);
                        datetimeinput.jqxDateTimeInput({ rtl: me.rtl, showFooter: true, formatString: columnrecord.cellsformat, selectionMode: 'range', value: null, theme: this.theme, width: width - 10, height: this.filterrowheight - 10 });
                        if (columnrecord.createfilterwidget) {
                            columnrecord.createfilterwidget(columnrecord, tablecolumn, datetimeinput);
                        }
                        columnrecord._filterwidget = datetimeinput;
                        datetimeinput.on('valuechanged', function (event) {
                            me._applyfilterfromfilterrow();
                            me.focusedfilter = null;
                        });
                    }
                    else addtextfilter(this, tablecolumn);
                    break;
                case 'list':
                case 'checkedlist':
                    if (this.host.jqxDropDownList) {
                        var dataadapter = this._getfilterdataadapter(columnrecord);

                        var autoheight = true;
                        var dropdownlist = $("<div></div>");
                        dropdownlist.css('margin', '4px');
                        var datafield = columnrecord.datafield;
                        var checkboxes = columnrecord.filtertype == 'checkedlist' ? true : false;
                        dropdownlist.jqxDropDownList({ rtl: me.rtl, checkboxes: checkboxes, source: dataadapter, autoDropDownHeight: autoheight, theme: this.theme, width: width - 10, height: this.filterrowheight - 10, displayMember: columnrecord.displayfield, valueMember: datafield });
                        dropdownlist.appendTo(tablecolumn);
                        var dropdownitems = dropdownlist.jqxDropDownList('getItems');
                        var listbox = dropdownlist.jqxDropDownList('listBox');
                        if (dropdownitems.length < 8) {
                            dropdownlist.jqxDropDownList('autoDropDownHeight', true);
                        }
                        else {
                            dropdownlist.jqxDropDownList('autoDropDownHeight', false);
                            autoheight = false;
                        }
                        if (checkboxes) {
                            dropdownlist.jqxDropDownList({
                                selectionRenderer: function () {
                                    return me.gridlocalization.filterselectstring;
                                }
                            });
                            var spanElement = $('<span style="top: 2px; position: relative; color: inherit; border: none; background-color: transparent;">' + me.gridlocalization.filterselectstring + '</span>');
                            spanElement.addClass(this.toThemeProperty('jqx-item'));
                            if (listbox != undefined) {
                                if (!autoheight) {
                                    listbox.host.height(200);
                                }
                                listbox.insertAt(me.gridlocalization.filterselectallstring, 0);
                                dropdownlist.jqxDropDownList('setContent', spanElement);
                                var handleCheckChange = true;
                                var checkedItems = new Array();
                                listbox.checkAll(false);
                                listbox.host.on('checkChange', function (event) {
                                    dropdownlist[0]._selectionChanged = true;
                                    if (!handleCheckChange)
                                        return;

                                    if (event.args.label != me.gridlocalization.filterselectallstring) {
                                        handleCheckChange = false;
                                        listbox.host.jqxListBox('checkIndex', 0, true, false);
                                        var checkedItems = listbox.host.jqxListBox('getCheckedItems');
                                        var items = listbox.host.jqxListBox('getItems');

                                        if (checkedItems.length == 1) {
                                            listbox.host.jqxListBox('uncheckIndex', 0, true, false);
                                        }
                                        else if (items.length != checkedItems.length) {
                                            listbox.host.jqxListBox('indeterminateIndex', 0, true, false);
                                        }
                                        handleCheckChange = true;
                                    }
                                    else {
                                        handleCheckChange = false;
                                        if (event.args.checked) {
                                            listbox.host.jqxListBox('checkAll', false);
                                        }
                                        else {
                                            listbox.host.jqxListBox('uncheckAll', false);
                                        }

                                        handleCheckChange = true;
                                    }
                                });
                            }
                        }
                        else {
                            listbox.insertAt({ label: this.gridlocalization.filterchoosestring, value: "" }, 0);
                            dropdownlist.jqxDropDownList({ selectedIndex: 0 });
                        }

                        if (columnrecord.createfilterwidget) {
                            columnrecord.createfilterwidget(columnrecord, tablecolumn, dropdownlist);
                        }
                        columnrecord._filterwidget = dropdownlist;

                        var dropdownlistWrapper = dropdownlist.jqxDropDownList('dropdownlistWrapper');
                        if (columnrecord.filtertype == 'list') {
                            this.addHandler(dropdownlist, 'select', function (event) {
                                if (event.args && event.args.type != 'none') {
                                    me._applyfilterfromfilterrow();
                                    me.focusedfilter = null;
                                }
                            });
                        }
                        else {
                            this.addHandler(dropdownlist, 'close', function (event) {
                                if (dropdownlist[0]._selectionChanged) {
                                    me._applyfilterfromfilterrow();
                                    me.focusedfilter = null;
                                    dropdownlist[0]._selectionChanged = false;
                                }
                            });
                        }
                    }
                    else addtextfilter(this, tablecolumn);
                    break;
                case 'bool':
                case 'boolean':
                    if (this.host.jqxCheckBox) {
                        var checkbox = $('<div tabIndex=0 style="opacity: 0.99; position: absolute; top: 50%; left: 50%; margin-top: -7px; margin-left: -10px;"></div>');
                        checkbox.appendTo(tablecolumn);
                        checkbox.jqxCheckBox({ enableContainerClick: false, animationShowDelay: 0, animationHideDelay: 0, hasThreeStates: true, theme: this.theme, checked: null });
                        if (columnrecord.createfilterwidget) {
                            columnrecord.createfilterwidget(columnrecord, tablecolumn, checkbox);
                        }
                        if (filtervalue === true || filtervalue == "true") {
                            checkbox.jqxCheckBox({ checked: true });
                        }
                        else if (filtervalue === false || filtervalue == "false") {
                            checkbox.jqxCheckBox({ checked: false });
                        }

                        columnrecord._filterwidget = checkbox;
                        checkbox.on('change', function (event) {
                            if (event.args) {
                                me.focusedfilter = null;
                                me._applyfilterfromfilterrow();
                            }
                        });
                    }
                    else addtextfilter(this, tablecolumn);
                    break;
            }
        },

        _getfilterdataadapter: function (columnrecord) {
            var isdataadapter = this.source._source ? true : false;

            if (!isdataadapter) {
                dataadapter = new $.jqx.dataAdapter(this.source,
                            {
                                autoBind: false,
                                uniqueDataFields: [columnrecord.displayfield],
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
                    uniqueDataFields: [columnrecord.displayfield]
                });
            }
            if (columnrecord.filteritems && columnrecord.filteritems.length > 0) {
                var dataSource =
                {
                    localdata: columnrecord.filteritems,
                    datatype: this.source.datatype,
                    async: false
                }

                dataadapter = new $.jqx.dataAdapter(dataSource,
                {
                    autoBind: false,
                    async: false
                });
            }
            return dataadapter;
        },

        refreshfilterrow: function () {
            this._updatefilterrowui();
            this._updatelistfilters();
            var me = this;
            var columnslength = this.columns.records.length;
            for (var j = 0; j < columnslength; j++) {
                var column = this.columns.records[j];
                if (column.filterable) {
                    if (column.filter) {
                        var filters = column.filter.getfilters();
                        if (filters.length > 0) {
                            var value = filters[0].value;
                            var widget = column._filterwidget;
                            var tablecolumn = column._filterwidget.parent();
                            if (widget != null) {
                                switch (column.filtertype) {
                                    case 'number':
                                        tablecolumn.find('input').val(value);
                                        if (this.host.jqxDropDownList) {
                                            var conditions = column.filter.getoperatorsbyfiltertype('numericfilter');
                                            widget.find('.filter').jqxDropDownList('selectIndex', conditions.indexOf(filters[0].condition));
                                        }
                                        break;
                                    case 'date':
                                        if (this.host.jqxDateTimeInput) {
                                            var value2 = data.filters['filtervalue' + (i + 1)];
                                            var filtertype = data.filters['filtertype' + i];
                                            var filter = filtergroup.createfilter(filtertype, value2, "LESS_THAN_OR_EQUAL");
                                            filtergroup.addfilter(operator, filter);

                                            $(tablecolumn.children()[0]).jqxDateTimeInput('setRange', new Date(value), new Date(value2));
                                            i++;
                                        }
                                        else widget.val(value);
                                        break;
                                    case 'textbox':
                                    case 'default':
                                        widget.val(value);
                                        me["_oldWriteText" + widget[0].id] = value;
                                        break;
                                    case 'bool':
                                    case 'boolean':
                                        if (!this.host.jqxCheckBox) {
                                            widget.val(value);
                                        }
                                        else $(tablecolumn.children()[0]).jqxCheckBox({ checked: value });
                                        break;
                                }
                            }
                        }
                    }
                }
            }
        },

        _destroyedfilters: function ()
        {
                var me = this;
                var columnslength = this.columns.records.length;
                for (var j = 0; j < columnslength; j++) {
                    var columnrecord = this.columns.records[j];
                    if (columnrecord.filterable) {
                        var widget = columnrecord._filterwidget;
                        if (columnrecord.filtertype == 'list' || columnrecord.filtertype == 'checkedlist') {
                            this.removeHandler(widget, 'select');
                            this.removeHandler(widget, 'close');
                            widget.jqxDropDownList('destroy');
                        }
                        else if (columnrecord.filtertype == 'date') {
                            this.removeHandler(widget, 'valuechanged');
                            widget.jqxDateTimeInput('destroy');
                        }
                        else if (columnrecord.filtertype == 'bool') {
                            this.removeHandler(widget, 'change');
                            widget.jqxCheckBox('destroy');
                        }
                        else if (columnrecord.filtertype == 'number') {
                            var input = widget.find('.jqx-input');
                            this.removeHandler(input, 'keydown');
                            var dropdownlist = $(widget.children()[1]);
                            dropdownlist.jqxDropDownList('destroy');
                        }
                        else {
                            this.removeHandler(widget, 'keydown');
                        }
                        widget.remove();
                    }
                }
        },

        _updatelistfilters: function (endcelledit) {
            var me = this;
            var columnslength = this.columns.records.length;
            for (var j = 0; j < columnslength; j++) {
                var columnrecord = this.columns.records[j];
                if (columnrecord.filterable) {
                    if (columnrecord.filtertype == 'list' || columnrecord.filtertype == 'checkedlist') {
                        var dropdownlist = columnrecord._filterwidget;
                        if (!endcelledit) {
                            if (columnrecord.filter == undefined) {
                                dropdownlist.jqxDropDownList('renderSelection');
                                continue;
                            }
                        }
                        else {
                            var dataadapter = this._getfilterdataadapter(columnrecord);
                            dataadapter.dataBind();
                            var dropdownitems = dropdownlist.jqxDropDownList('getItems');
                            var equalSources = true;
                            if (dropdownitems.length != dataadapter.records.length + 1)
                                equalSources = false;

                            if (equalSources) {
                                for (var i = 1; i < dropdownitems.length; i++) {
                                    if (dropdownitems[i].label != dataadapter.records[i - 1][columnrecord.displayfield]) {
                                        equalSources = false;
                                        break;
                                    }
                                }
                            }
                            if (equalSources)
                                continue;
                        }

                        dropdownlist.jqxDropDownList('dataBind');
                        var checkboxes = columnrecord.filtertype == 'checkedlist' ? true : false;
                        var dropdownitems = dropdownlist.jqxDropDownList('getItems');
                        var listbox = dropdownlist.jqxDropDownList('listBox');

                        if (checkboxes) {
                            dropdownlist.jqxDropDownList({
                                selectionRenderer: function () {
                                    return me.gridlocalization.filterselectstring;
                                }
                            });
                            var spanElement = $('<span style="top: 2px; position: relative; color: inherit; border: none; background-color: transparent;">' + this.gridlocalization.filterselectstring + '</span>');
                            spanElement.addClass(this.toThemeProperty('jqx-item'));
                            listbox.insertAt(this.gridlocalization.filterselectallstring, 0);
                            dropdownlist.jqxDropDownList('setContent', spanElement);
                            listbox.checkAll(false);
                            if (columnrecord.filter) {
                                listbox.uncheckAll(false);
                                var filters = columnrecord.filter.getfilters();

                                for (var i = 0; i < listbox.items.length; i++) {
                                    var label = listbox.items[i].label;
                                    $.each(filters, function () {
                                        if (this.condition == "NOT_EQUAL") return true;
                                        if (label == this.value) {
                                            listbox.checkIndex(i, false, false);
                                        }
                                    });
                                }
                                listbox._updateCheckedItems();
                                var checkedItemsLength = listbox.getCheckedItems().length;
                                if (listbox.items.length != checkedItemsLength && checkedItemsLength > 0) {
                                    listbox.host.jqxListBox('indeterminateIndex', 0, true, false);
                                }
                            }
                        }
                        else {
                            listbox.insertAt({ label: this.gridlocalization.filterchoosestring, value: "" }, 0);
                            dropdownlist.jqxDropDownList({ selectedIndex: 0 });
                        }
                        if (dropdownitems.length < 8) {
                            dropdownlist.jqxDropDownList('autoDropDownHeight', true);
                        }
                        else {
                            dropdownlist.jqxDropDownList('autoDropDownHeight', false);
                        }
                    }
                }
            }
        },

        _renderfiltercolumn: function () {
            var self = this;

            if (this.filterable) {
                $.each(this.columns.records, function (i, value) {
                    if (self.autoshowfiltericon) {
                        if (this.filter) {
                            $(this.filtericon).show();
                        }
                        else {
                            $(this.filtericon).hide();
                        }
                    }
                    else {
                        if (this.filterable) {
                            $(this.filtericon).show();
                        }
                    }
                });
            }
        },

        _getcolumntypebydatafield: function (column) {
            var me = this;
            var type = 'string';
            var datafields = me.source.datafields || ((me.source._source) ? me.source._source.datafields : null);

            if (datafields) {
                var foundType = "";
                $.each(datafields, function () {
                    if (this.name == column.displayfield) {
                        if (this.type) {
                            foundType = this.type;
                        }
                        return false;
                    }
                });
                if (foundType)
                    return foundType;
            }

            if (column != null) {
                if (this.dataview.cachedrecords == undefined) {
                    return type;
                }

                var cell = null;

                if (!this.virtualmode) {
                    if (this.dataview.cachedrecords.length == 0)
                        return type;

                    cell = this.dataview.cachedrecords[0][column.displayfield];
                    if (cell != null && cell.toString() == "") {
                        return "string";
                    }
                }
                else {
                    $.each(this.dataview.cachedrecords, function () {
                        cell = this[column.displayfield];
                        return false;
                    });
                }

                if (cell != null) {
                    if (typeof cell == 'boolean') {
                        type = 'boolean';
                    }
                    else if ($.jqx.dataFormat.isNumber(cell)) {
                        type = 'number';
                    }
                    else {
                        var tmpvalue = new Date(cell);

                        if (tmpvalue.toString() == 'NaN' || tmpvalue.toString() == "Invalid Date") {
                            if ($.jqx.dataFormat) {
                                tmpvalue = $.jqx.dataFormat.tryparsedate(cell);
                                if (tmpvalue != null) {
                                    return 'date';
                                }
                                else {
                                    type = 'string';
                                }
                            }
                            else type = 'string';
                        }
                        else {
                            type = 'date';
                        }
                    }
                }
            }
            return type;
        },

        _getfiltersbytype: function (type) {
            var me = this;
            var source = '';
            switch (type) {
                case "number":
                case "float":
                case "int":
                    source = me.gridlocalization.filternumericcomparisonoperators;
                    break;
                case "date":
                    source = me.gridlocalization.filterdatecomparisonoperators;
                    break;
                case "boolean":
                case "bool":
                    source = me.gridlocalization.filterbooleancomparisonoperators;
                    break;
                case "string":
                default:
                    source = me.gridlocalization.filterstringcomparisonoperators;
                    break;

            }
            return source;
        },

        _updatefilterpanel: function (me, element, column) {
            if (me == null || me == undefined) me = this;
            var type = me._getcolumntypebydatafield(column);
            var source = me._getfiltersbytype(type);

            if (!me.host.jqxDropDownList) {
                alert('jqxdropdownlist is not loaded.');
                return;
            }

            var $element = $(element);
            var clearbutton = $element.find('#filterclearbutton' + me.element.id);
            var filterbutton = $element.find('#filterbutton' + me.element.id);
            var condition = $element.find('#filter1' + me.element.id);
            var filteroperator = $element.find('#filter2' + me.element.id);
            var condition2 = $element.find('#filter3' + me.element.id);
            var input1 = $element.find('.filtertext1' + me.element.id);
            var input2 = $element.find('.filtertext2' + me.element.id);
            input1.val('');
            input2.val('');

            this.removeHandler(filterbutton, 'click');
            this.addHandler(filterbutton, 'click', function () {
                me._buildfilter(me, element, column);
                me._closemenu();
            });

            this.removeHandler(clearbutton, 'click');
            this.addHandler(clearbutton, 'click', function () {
                me._clearfilter(me, element, column);
                me._closemenu();
            });

            if (condition.jqxDropDownList('source') != source) {
                condition.jqxDropDownList({ enableBrowserBoundsDetection: false, source: source });
                condition2.jqxDropDownList({ enableBrowserBoundsDetection: false, source: source });
            }

            if (type == 'boolean' || type == 'bool') {
                condition.jqxDropDownList({ autoDropDownHeight: true, selectedIndex: 0 });
                condition2.jqxDropDownList({ autoDropDownHeight: true, selectedIndex: 0 });
            }
            else {
                var autoDropDownHeight = false;
                if (source && source.length) {
                    if (source.length < 5) {
                        autoDropDownHeight = true;
                    }
                }

                condition.jqxDropDownList({ autoDropDownHeight: autoDropDownHeight, selectedIndex: 2 });
                condition2.jqxDropDownList({ autoDropDownHeight: autoDropDownHeight, selectedIndex: 2 });
            }
            filteroperator.jqxDropDownList({ selectedIndex: 0 });

            var filter = column.filter;
            if (filter != null) {
                var filter1 = filter.getfilterat(0);
                var filter2 = filter.getfilterat(1);
                var operator = filter.getoperatorat(0);
                var conditions = [];
                var filtertype = "";
                switch (type) {
                    case "number":
                    case "int":
                    case "float":
                    case "decimal":
                        filtertype = 'numericfilter';
                        conditions = filter.getoperatorsbyfiltertype('numericfilter');
                        break;
                    case "boolean":
                    case "bool":
                        filtertype = 'booleanfilter';
                        conditions = filter.getoperatorsbyfiltertype('booleanfilter');
                        break;
                    case "date":
                    case "time":
                        filtertype = 'datefilter';
                        conditions = filter.getoperatorsbyfiltertype('datefilter');
                        break;
                    case "string":
                        filtertype = 'stringfilter';
                        conditions = filter.getoperatorsbyfiltertype('stringfilter');
                        break;
                }
                if (me.updatefilterconditions) {
                    var newfilterconditions = me.updatefilterconditions(filtertype, conditions);
                    if (newfilterconditions != undefined) {
                        filter.setoperatorsbyfiltertype(filtertype, newfilterconditions);
                        conditions = newfilterconditions;
                    }
                }

                var animationtype = this.enableanimations ? 'default' : 'none';
                if (filter1 != null) {
                    var index1 = conditions.indexOf(filter1.comparisonoperator);
                    var value1 = filter1.filtervalue;
                    input1.val(value1);
                    condition.jqxDropDownList({ selectedIndex: index1, animationType: animationtype });
                }
                if (filter2 != null) {
                    var index2 = conditions.indexOf(filter2.comparisonoperator);
                    var value2 = filter2.filtervalue;
                    input2.val(value2);
                    condition2.jqxDropDownList({ selectedIndex: index2, animationType: animationtype });
                }
                if (filter.getoperatorat(0) == undefined) {
                    filteroperator.jqxDropDownList({ selectedIndex: 0, animationType: animationtype });
                }
                else {
                    if (filter.getoperatorat(0) == 'and' || filter.getoperatorat(0) == 0) {
                        filteroperator.jqxDropDownList({ selectedIndex: 0 });
                    }
                    else {
                        filteroperator.jqxDropDownList({ selectedIndex: 1 });
                    }
                }
            }
            if (me.updatefilterpanel) {
                me.updatefilterpanel(condition, condition2, filteroperator, input1, input2, filterbutton, clearbutton, filter, filtertype, conditions);
            }
            input1.focus();
            setTimeout(function () {
                input1.focus();
            }, 10);
        },

        _getfiltertype: function (type) {
            var filtertype = "stringfilter";
            switch (type) {
                case "number":
                case "int":
                case "float":
                case "decimal":
                    filtertype = 'numericfilter';
                    break;
                case "boolean":
                case "bool":
                    filtertype = 'booleanfilter';
                    break;
                case "date":
                case "time":
                    filtertype = 'datefilter';
                    break;
                case "string":
                    filtertype = 'stringfilter';
                    break;
            }
            return filtertype;
        },

        _buildfilter: function (me, element, column) {
            var condition = $(element).find('#filter1' + me.element.id);
            var operator = $(element).find('#filter2' + me.element.id);
            var condition2 = $(element).find('#filter3' + me.element.id);
            var input1 = $(element).find('.filtertext1' + me.element.id);
            var input2 = $(element).find('.filtertext2' + me.element.id);
            var value1 = input1.val();
            var value2 = input2.val();
            var type = me._getcolumntypebydatafield(column);
            var source = me._getfiltersbytype(type);
            var index1 = condition.jqxDropDownList('selectedIndex');
            var operatorindex = operator.jqxDropDownList('selectedIndex');
            var index2 = condition2.jqxDropDownList('selectedIndex');
            var filtergroup = new $.jqx.filter();

            var filter1 = null;
            var filter2 = null;
            var filtertype = me._getfiltertype(type);

            if (me.updatefilterconditions) {
                var newfilterconditions = me.updatefilterconditions(filtertype, filtergroup.getoperatorsbyfiltertype(filtertype));
                if (newfilterconditions != undefined) {
                    filtergroup.setoperatorsbyfiltertype(filtertype, newfilterconditions);
                }
            }

            var isvalidfilter = false;
            var condition1 = filtergroup.getoperatorsbyfiltertype(filtertype)[index1];
            var condition2 = filtergroup.getoperatorsbyfiltertype(filtertype)[index2];
            var nullcondition1 = condition1 == "NULL" || condition1 == "NOT_NULL";
            var emptycondition1 = condition1 == "EMPTY" || condition1 == "NOT_EMPTY";

            if (condition1 == undefined) condition1 = filtergroup.getoperatorsbyfiltertype(filtertype)[0];
            if (condition2 == undefined) condition2 = filtergroup.getoperatorsbyfiltertype(filtertype)[0];

            if (value1.length > 0 || nullcondition1 || emptycondition1) {
                filter1 = filtergroup.createfilter(filtertype, value1, condition1, null, column.cellsformat, me.gridlocalization);
                filtergroup.addfilter(operatorindex, filter1);
                isvalidfilter = true;
            }

            var nullcondition2 = condition2 == "NULL" || condition2 == "NOT_NULL";
            var emptycondition2 = condition2 == "EMPTY" || condition2 == "NOT_EMPTY";

            if (value2.length > 0 || nullcondition2 || emptycondition2) {
                filter2 = filtergroup.createfilter(filtertype, value2, condition2, null, column.cellsformat, me.gridlocalization);
                filtergroup.addfilter(operatorindex, filter2);
                isvalidfilter = true;
            }

            if (isvalidfilter) {
                var datafield = column.displayfield;
                this.addfilter(datafield, filtergroup, true);
            }
            else {
                this._clearfilter(me, element, column);
            }
        },

        _clearfilter: function (me, element, column) {
            var datafield = column.displayfield;
            this.removefilter(datafield, true);
        },

        addfilter: function (datafield, filter, apply) {
            if (this._loading) {
                alert(this.loadingerrormessage);
                return false;
            }

            var columnbydatafield = this.getcolumn(datafield);
            var _columnbydatafield = this._getcolumn(datafield);
            if (columnbydatafield == undefined || columnbydatafield == null)
                return;

            columnbydatafield.filter = filter;
            _columnbydatafield.filter = filter;

            this.dataview.addfilter(datafield, filter);
            if (apply == true && apply != undefined) {
                this.applyfilters();
            }
        },

        // removes a filter.
        removefilter: function (datafield, apply) {
            if (this._loading) {
                alert(this.loadingerrormessage);
                return false;
            }

            var columnbydatafield = this.getcolumn(datafield);
            var _columnbydatafield = this._getcolumn(datafield);
            if (columnbydatafield == undefined || columnbydatafield == null)
                return;

            if (columnbydatafield.filter == null)
                return;

            this.dataview.removefilter(datafield, columnbydatafield.filter);
            columnbydatafield.filter = null;
            _columnbydatafield.filter = null;

            if (apply == true || apply != undefined) {
                this.applyfilters();
            }
        },

        applyfilters: function () {
            var customfilter = false;
            if (this.dataview.filters.length >= 0 && (this.virtualmode || !this.source.localdata)) {
                if (this.source != null && this.source.filter) {
                    var tmppage = -1;
                    if (this.pageable) {
                        tmppage = this.dataview.pagenum;
                        this.dataview.pagenum = 0;
                    }
                    this.source.filter(this.dataview.filters, this.dataview.records, this.dataview.records.length);
                    if (this.pageable) {
                        this.dataview.pagenum = tmppage;
                    }
                }
            }

            if (!this.virtualmode) {
                var selectedrowindexes = this.selectedrowindexes;
                var me = this;
                if (selectedrowindexes.length > 0) {
                    if (this.dataview.filters && this.dataview.filters.length == 0) {
                        var newSelectedRowIndexes = new Array();
                        $.each(selectedrowindexes, function () {
                            var datarow = me.getrowdata(this);
                            if (datarow && datarow.dataindex) {
                                newSelectedRowIndexes[newSelectedRowIndexes.length] = datarow.dataindex;
                            }
                        });
                        this.selectedrowindexes = newSelectedRowIndexes;
                        this.selectedrowindex = this.selectedrowindexes.length > 0 ? this.selectedrowindexes[0] : -1;
                    }
                }

                this.dataview.refresh();
                if (selectedrowindexes.length > 0) {
                    if (this.dataview.filters && this.dataview.filters.length > 0) {
                        var newSelectedRowIndexes = new Array();
                        $.each(selectedrowindexes, function () {
                            var data = me.dataview._dataIndexToBoundIndex[this];
                            if (data != null) {
                                newSelectedRowIndexes[newSelectedRowIndexes.length] = data.boundindex;
                            }
                        });
                        this.selectedrowindexes = newSelectedRowIndexes;
                        this.selectedrowindex = this.selectedrowindexes.length > 0 ? this.selectedrowindexes[0] : -1;
                    }
                }
            }
            else {
                if (this.pageable) {
                    this.dataview.updateview();
                    if (this.gotopage) {
                        this.gotopage(0);
                    }
                }
                this.rendergridcontent(false, false);
                this._raiseEvent(13, { filters: this.dataview.filters });
                return;
            }

            if (this.pageable) {
                this.dataview.updateview();
                if (this.gotopage) {
                    this.gotopage(0);
                    this.updatepagerdetails();
                }
            }
            this._updaterowsproperties();
            if (!this.groupable || (this.groupable && this.groups.length == 0)) {
                this._rowdetailscache = new Array();
                this.virtualsizeinfo = null;
                this._pagescache = new Array();
                this.rendergridcontent(true, true);
                this._updatecolumnwidths();
                this._updatecellwidths();
                this._renderrows(this.virtualsizeinfo);
                if (this.showaggregates && this._updatecolumnsaggregates) {
                    this._updatecolumnsaggregates();
                }
            }
            else {
                this._rowdetailscache = new Array();
                this._render(true, true, false, false, false);
                if (this.showfilterrow) this._updatefocusedfilter();
                this._updatecolumnwidths();
                this._updatecellwidths();
                this._renderrows(this.virtualsizeinfo);
            }
            this._raiseEvent(13, { filters: this.dataview.filters });
        },

        getfilterinformation: function () {
            var filters = new Array();
            for (var i = 0; i < this.dataview.filters.length; i++) {
                var column = this.getcolumn(this.dataview.filters[i].datafield);
                filters[i] = { filter: this.dataview.filters[i].filter, filtercolumn: column.datafield, filtercolumntext: column.text };
            }
            return filters;
        },

        clearfilters: function (apply) {
            var me = this;
            if (this.showfilterrow) {
                this.clearfilterrow();
            }

            if (this.columns.records) {
                $.each(this.columns.records, function () {
                    me.removefilter(this.displayfield);
                });
            }
            if (apply == true || apply != undefined) {
                this.applyfilters();
            }
        },

        _destroyfilterpanel: function () {
            var clearbutton = $($.find('#filterclearbutton' + this.element.id));
            var filterbutton = $($.find('#filterbutton' + this.element.id));
            var condition = $($.find('#filter1' + this.element.id));
            var filteroperator = $($.find('#filter2' + this.element.id));
            var condition2 = $($.find('#filter3' + this.element.id));
            var input1 = $($.find('.filtertext1' + this.element.id));
            var input2 = $($.find('.filtertext2' + this.element.id));
            if (input1.length > 0 && input2.length > 0) {
                input1.removeClass();
                input2.removeClass();
                input1.remove();
                input2.remove();
            }

            if (clearbutton.length > 0) {
                clearbutton.jqxButton('destroy');
                filterbutton.jqxButton('destroy');
                this.removeHandler(clearbutton, 'click');
                this.removeHandler(filterbutton, 'click');
            }

            if (condition.length > 0) {
                condition.jqxDropDownList('destroy');
            }
            if (filteroperator.length > 0) {
                filteroperator.jqxDropDownList('destroy');
            }
            if (condition2 > 0) {
                condition2.jqxDropDownList('destroy');
            }
        },

        _initfilterpanel: function (me, element, column, width) {
            if (me == null || me == undefined) me = this;
            element[0].innerHTML = "";
            var filterpanelcontainer = $("<div class='filter' style='margin-left: 7px;'></div>");

            element.append(filterpanelcontainer);
            var showwhere = $("<div class='filter' style='margin-top: 3px; margin-bottom: 3px;'></div>");
            showwhere.text(me.gridlocalization.filtershowrowstring);
            var condition = $("<div class='filter' id='filter1" + me.element.id + "'></div>");
            var operator = $("<div class='filter' id='filter2" + me.element.id + "' style='margin-bottom: 3px;'></div>");
            var condition2 = $("<div class='filter' id='filter3" + me.element.id + "'></div>");
            var type = me._getcolumntypebydatafield(column);

            if (!condition.jqxDropDownList) {
                alert('jqxdropdownlist is not loaded.');
                return;
            }

            var source = me._getfiltersbytype(type);

            var input = $("<div class='filter'><input class='filtertext1" + me.element.id + "' style='height: 20px; margin-top: 3px; margin-bottom: 3px;' type='text'></input></div>");
            var textField = input.find('input');
            textField.addClass(this.toThemeProperty('jqx-input'));
            textField.addClass(this.toThemeProperty('jqx-widget-content'));
            textField.addClass(this.toThemeProperty('jqx-rc-all'));
            textField.width(width - 15);
            var input2 = $("<div class='filter'><input class='filtertext2" + me.element.id + "' style='height: 20px; margin-top: 3px;' type='text'></input></div>");
            var textField2 = input2.find('input');
            textField2.addClass(this.toThemeProperty('jqx-input'));
            textField2.addClass(this.toThemeProperty('jqx-widget-content'));
            textField2.addClass(this.toThemeProperty('jqx-rc-all'));
            textField2.width(width - 15);

            if (me.rtl) {
                textField.css('direction', 'rtl');
                textField2.css('direction', 'rtl');
            }

            var applyinput = $("<div class='filter' style='height: 25px; margin-left: 20px; margin-top: 7px;'></div>");
            var filterbutton = $('<span tabIndex=0 id="filterbutton' + me.element.id + '" class="filterbutton" style="padding: 4px 12px; margin-left: 2px;">' + me.gridlocalization.filterstring + '</span>');
            applyinput.append(filterbutton);
            var filterclearbutton = $('<span tabIndex=0 id="filterclearbutton' + me.element.id + '" class="filterclearbutton" style="padding: 4px 12px; margin-left: 5px;">' + me.gridlocalization.filterclearstring + '</span>');
            applyinput.append(filterclearbutton);

            filterbutton.jqxButton({ height: 20, theme: me.theme });
            filterclearbutton.jqxButton({ height: 20, theme: me.theme });

            var selectionrenderer = function (selectionelement) {
                if (selectionelement) {
                    if (selectionelement.text().indexOf("case sensitive") != -1) {
                        var selectiontext = selectionelement.text();
                        selectiontext = selectiontext.replace("case sensitive", "match case");
                        selectionelement.text(selectiontext);
                    }
                    selectionelement.css('font-family', me.host.css('font-family'));
                    selectionelement.css('font-size', me.host.css('font-size'));

                    return selectionelement;
                }
                return "";
            }

            filterpanelcontainer.append(showwhere);
            filterpanelcontainer.append(condition);
            condition.jqxDropDownList({rtl: me.rtl, enableBrowserBoundsDetection: false, selectedIndex: 2, width: width - 15, height: 20, dropDownHeight: 150, dropDownWidth: width - 15, selectionRenderer: selectionrenderer, source: source, theme: me.theme });
            filterpanelcontainer.append(input);
            var operators = new Array();
            operators[0] = me.gridlocalization.filterandconditionstring;
            operators[1] = me.gridlocalization.filterorconditionstring;
            operator.jqxDropDownList({ rtl: me.rtl, enableBrowserBoundsDetection: false, autoDropDownHeight: true, selectedIndex: 0, width: 60, height: 20, source: operators, selectionRenderer: selectionrenderer, theme: me.theme });
            filterpanelcontainer.append(operator);
            condition2.jqxDropDownList({ rtl: me.rtl, enableBrowserBoundsDetection: false, selectedIndex: 2, width: width - 15, height: 20, dropDownHeight: 150, dropDownWidth: width - 15, selectionRenderer: selectionrenderer, source: source, theme: me.theme });
            filterpanelcontainer.append(condition2);
            filterpanelcontainer.append(input2);
            filterpanelcontainer.append(applyinput);
            if (me.updatefilterpanel) {
                me.updatefilterpanel(condition, condition2, operator, input, input2, filterbutton, filterclearbutton, null, null, source);
            }
        }
    });

    $.jqx.filter = function () {
        this.operator = 'and';
        var and_operator = 0;
        var or_operator = 1;
        var stringcomparisonoperators = ['EMPTY', 'NOT_EMPTY', 'CONTAINS', 'CONTAINS_CASE_SENSITIVE',
        'DOES_NOT_CONTAIN', 'DOES_NOT_CONTAIN_CASE_SENSITIVE', 'STARTS_WITH', 'STARTS_WITH_CASE_SENSITIVE',
        'ENDS_WITH', 'ENDS_WITH_CASE_SENSITIVE', 'EQUAL', 'EQUAL_CASE_SENSITIVE', 'NULL', 'NOT_NULL'];
        var numericcomparisonoperators = ['EQUAL', 'NOT_EQUAL', 'LESS_THAN', 'LESS_THAN_OR_EQUAL', 'GREATER_THAN', 'GREATER_THAN_OR_EQUAL', 'NULL', 'NOT_NULL'];
        var datecomparisonoperators = ['EQUAL', 'NOT_EQUAL', 'LESS_THAN', 'LESS_THAN_OR_EQUAL', 'GREATER_THAN', 'GREATER_THAN_OR_EQUAL', 'NULL', 'NOT_NULL'];
        var booleancomparisonoperators = ['EQUAL', 'NOT_EQUAL'];

        var filters = new Array();
        var comparisonoperators = new Array();

        this.evaluate = function (value) {
            var result = true;
            for (var i = 0; i < filters.length; i++) {
                var currentResult = filters[i].evaluate(value);
                if (i == 0) {
                    result = currentResult;
                }
                else {
                    if (comparisonoperators[i] == or_operator || comparisonoperators[i] == "or")
                        result = result || currentResult;
                    else
                        result = result && currentResult;
                }
            }

            return result;
        }

        this.getfilterscount = function () {
            return filters.length;
        }

        this.setoperatorsbyfiltertype = function (type, array) {
            switch (type) {
                case "numericfilter":
                    numericcomparisonoperators = array;
                    break;
                case "stringfilter":
                    stringcomparisonoperators = array;
                    break;
                case "datefilter":
                    datecomparisonoperators = array;
                    break;
                case "booleanfilter":
                    booleancomparisonoperators = array;
                    break;
            }
        }

        this.getoperatorsbyfiltertype = function (type) {
            var array = new Array();
            switch (type) {
                case "numericfilter":
                    array = numericcomparisonoperators.slice(0);
                    break;
                case "stringfilter":
                    array = stringcomparisonoperators.slice(0);
                    break;
                case "datefilter":
                    array = datecomparisonoperators.slice(0);
                    break;
                case "booleanfilter":
                    array = booleancomparisonoperators.slice(0);
                    break;
            }
            return array;
        }

        var generatefilterkey = function () {
            var S4 = function () {
                return (((1 + Math.random()) * 0x10000) | 0).toString(16).substring(1);
            };
            return (S4() + "-" + S4() + "-" + S4());
        }

        this.createfilter = function (filtertype, filtervalue, filtercomparisonoperator, customfilter, formatstring, localization) {
            if (filtertype == null || filtertype == undefined)
                return null;

            switch (filtertype) {
                case 'numericfilter':
                    return new numericfilter(filtervalue, filtercomparisonoperator.toUpperCase());
                case 'stringfilter':
                    return new stringfilter(filtervalue, filtercomparisonoperator.toUpperCase());
                case 'datefilter':
                    return new datefilter(filtervalue, filtercomparisonoperator.toUpperCase(), formatstring, localization);
                case 'booleanfilter':
                    return new booleanfilter(filtervalue, filtercomparisonoperator.toUpperCase());
                case 'custom':
                    return new filter(filtervalue, filtercomparisonoperator.toUpperCase(), customfilter);
            }

            return null;
        }

        this.getfilters = function () {
            var filtersarray = new Array();
            for (var i = 0; i < filters.length; i++) {
                var filter = { value: filters[i].filtervalue, condition: filters[i].comparisonoperator, operator: comparisonoperators[i], type: filters[i].type };
                filtersarray[i] = filter;
            }
            return filtersarray;
        }

        this.addfilter = function (comparisonoperator, filter) {
            filters[filters.length] = filter;
            filter.key = generatefilterkey();
            comparisonoperators[comparisonoperators.length] = comparisonoperator;
        }

        this.removefilter = function (filter) {
            for (var i = 0; i < filters.length; i++) {
                if (filters[i].key == filter.key) {
                    filters.splice(i, 1);
                    comparisonoperators.splice(i, 1);
                    break;
                }
            }
        }

        this.getoperatorat = function (index) {
            if (index == undefined || index == null)
                return null;

            if (index < 0 || index > filters.length)
                return null;

            return comparisonoperators[index];
        }

        this.setoperatorat = function (index, comparisonoperator) {
            if (index == undefined || index == null)
                return null;

            if (index < 0 || index > filters.length)
                return null;

            comparisonoperators[comparisonoperator] = comparisonoperator;
        }

        this.getfilterat = function (index) {
            if (index == undefined || index == null)
                return null;

            if (index < 0 || index > filters.length)
                return null;

            return filters[index];
        }

        this.setfilterat = function (index, filter) {
            if (index == undefined || index == null)
                return null;

            if (index < 0 || index > filters.length)
                return null;

            filter.key = generatefilterkey();
            filters[index] = filter;
        }

        this.clear = function () {
            filters = new Array();
            comparisonoperators = new Array();
        }

        var stringfilter = function (filtervalue, comparisonoperator) {
            this.filtervalue = filtervalue;
            this.comparisonoperator = comparisonoperator;
            this.type = 'stringfilter';
            this.evaluate = function (value) {
                var filtervalue = this.filtervalue;
                var comparisonoperator = this.comparisonoperator;
                if (value == null || value == undefined) {
                    if (comparisonoperator == 'NULL')
                        return true;

                    return false;
                }

                var val = "";
                try {
                    val = value.toString();
                }
                catch (error) {
                    return true;
                }

                switch (comparisonoperator) {
                    case 'EQUAL':
                        return $.jqx.string.equalsIgnoreCase(val, filtervalue);
                    case 'EQUAL_CASE_SENSITIVE':
                        return $.jqx.string.equals(val, filtervalue);
                    case 'NOT_EQUAL':
                        return !$.jqx.string.equalsIgnoreCase(val, filtervalue);
                    case 'NOT_EQUAL_CASE_SENSITIVE':
                        return !$.jqx.string.equals(val, filtervalue);
                    case 'CONTAINS':
                        return $.jqx.string.containsIgnoreCase(val, filtervalue);
                    case 'CONTAINS_CASE_SENSITIVE':
                        return $.jqx.string.contains(val, filtervalue);
                    case 'DOES_NOT_CONTAIN':
                        return !$.jqx.string.containsIgnoreCase(val, filtervalue);
                    case 'DOES_NOT_CONTAIN_CASE_SENSITIVE':
                        return !$.jqx.string.contains(val, filtervalue);
                    case 'EMPTY':
                        return val == '';
                    case 'NOT_EMPTY':
                        return val != '';
                    case 'NOT_NULL':
                        return val != null;
                    case 'STARTS_WITH':
                        return $.jqx.string.startsWithIgnoreCase(val, filtervalue);
                    case 'ENDS_WITH':
                        return $.jqx.string.endsWithIgnoreCase(val, filtervalue);
                    case 'ENDS_WITH_CASE_SENSITIVE':
                        return $.jqx.string.endsWith(val, filtervalue);
                    case 'STARTS_WITH_CASE_SENSITIVE':
                        return $.jqx.string.startsWith(val, filtervalue);
                    default:
                        return false;
                }
            }
        }

        var booleanfilter = function (filtervalue, comparisonoperator) {
            this.filtervalue = filtervalue;
            this.comparisonoperator = comparisonoperator;
            this.type = 'booleanfilter';
            this.evaluate = function (value) {
                var filtervalue = this.filtervalue;
                var comparisonoperator = this.comparisonoperator;
                if (value == null || value == undefined) {
                    if (comparisonoperator == 'NULL')
                        return true;

                    return false;
                }

                var val = value;

                switch (comparisonoperator) {
                    case 'EQUAL':
                        return val == filtervalue || val.toString() == filtervalue.toString();
                    case 'NOT_EQUAL':
                        return val != filtervalue && val.toString() != filtervalue.toString();
                    default:
                        return false;
                }
            }
        }

        var numericfilter = function (filtervalue, comparisonoperator) {
            this.filtervalue = filtervalue;
            this.comparisonoperator = comparisonoperator;
            this.type = 'numericfilter';
            this.evaluate = function (value) {
                var filtervalue = this.filtervalue;
                var comparisonoperator = this.comparisonoperator;
                if (value == null || value == undefined) {
                    if (comparisonoperator == 'NOT_NULL')
                        return false;

                    if (comparisonoperator == 'NULL')
                        return true;
                    else
                        return false;
                }
                else {
                    if (comparisonoperator == 'NULL')
                        return false;

                    if (comparisonoperator == 'NOT_NULL')
                        return true;
                }

                var val = value;

                try {
                    val = parseFloat(val);
                }
                catch (error) {
                    if (value.toString() != "")
                        return false;
                }

                switch (comparisonoperator) {
                    case 'EQUAL':
                        return val == filtervalue;
                    case 'NOT_EQUAL':
                        return val != filtervalue;
                    case 'GREATER_THAN':
                        return val > filtervalue;
                    case 'GREATER_THAN_OR_EQUAL':
                        return val >= filtervalue;
                    case 'LESS_THAN':
                        return val < filtervalue;
                    case 'LESS_THAN_OR_EQUAL':
                        return val <= filtervalue;
                    default:
                        return true;
                }
            }
        }

        var datefilter = function (filtervalue, comparisonoperator, formatstring, localization) {
            this.filtervalue = filtervalue;
            this.type = 'datefilter';

            if (formatstring != undefined && localization != undefined) {
                var parsedDate = $.jqx.dataFormat.parsedate(filtervalue, formatstring, localization);
                if (parsedDate != null) {
                    this.filterdate = parsedDate;
                }
                else {
                    var result = $.jqx.dataFormat.tryparsedate(filtervalue, localization);
                    if (result != null) this.filterdate = result;
                }

            }
            else {
                var tmpvalue = new Date(filtervalue);
                if (tmpvalue.toString() == 'NaN' || tmpvalue.toString() == "Invalid Date") {
                    this.filterdate = $.jqx.dataFormat.tryparsedate(filtervalue);
                }
                else {
                    this.filterdate = tmpvalue;
                }
            }

            this.comparisonoperator = comparisonoperator;
            this.evaluate = function (value) {
                var filtervalue = this.filtervalue;
                var comparisonoperator = this.comparisonoperator;
                if (value == null || value == undefined) {
                    if (comparisonoperator == 'NOT_NULL')
                        return false;

                    if (comparisonoperator == 'NULL')
                        return true;
                    else
                        return false;
                }
                else {
                    if (comparisonoperator == 'NULL')
                        return false;

                    if (comparisonoperator == 'NOT_NULL')
                        return true;
                }

                var val = new Date();
                val.setFullYear(1900, 0, 1);
                val.setHours(12, 0, 0, 0);
                try {
                    var tmpvalue = new Date(value);

                    if (tmpvalue.toString() == 'NaN' || tmpvalue.toString() == "Invalid Date") {
                        value = $.jqx.dataFormat.tryparsedate(value);
                    }
                    else {
                        value = tmpvalue;
                    }
                    val = value;
                }
                catch (error) {
                    if (value.toString() != "")
                        return false;
                }

                if (this.filterdate != null) {
                    filtervalue = this.filterdate;
                }
                else {
                    if (filtervalue.indexOf(':') != -1 || !isNaN(parseInt(filtervalue))) {
                        var tmpFilter = new Date(val);
                        tmpFilter.setHours(12, 0, 0, 0);
                        var timeStrings = filtervalue.split(':');
                        for (var i = 0; i < timeStrings.length; i++) {
                            if (i == 0) {
                                tmpFilter.setHours(timeStrings[i]);
                            }
                            if (i == 1) {
                                tmpFilter.setMinutes(timeStrings[i]);
                            }
                            if (i == 2) {
                                tmpFilter.setSeconds(timeStrings[i]);
                            }
                        }
                        filtervalue = tmpFilter;
                    }
                }

                if (val == null) val = "";
                switch (comparisonoperator) {
                    case 'EQUAL':
                        return val.toString() == filtervalue.toString();
                    case 'NOT_EQUAL':
                        return val.toString() != filtervalue.toString();
                    case 'GREATER_THAN':
                        return val > filtervalue;
                    case 'GREATER_THAN_OR_EQUAL':
                        return val >= filtervalue;
                    case 'LESS_THAN':
                        return val < filtervalue;
                    case 'LESS_THAN_OR_EQUAL':
                        return val <= filtervalue;
                    default:
                        return true;
                }
            }
        }

        var filter = function (filtervalue, comparisonoperator, customfilter) {
            this.filtervalue = filtervalue;
            this.comparisonoperator = comparisonoperator;
            this.evaluate = function (value, comparisonoperator) {
                return customfilter(this.filtervalue, value, this.comparisonoperator);
            }
        }
    };
})(jQuery);


