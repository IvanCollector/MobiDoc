/*
jQWidgets v2.7.0 (2013-Feb-08)
Copyright (c) 2011-2013 jQWidgets.
License: http://jqwidgets.com/license/
*/

try
{
    (function ($, ko) {
        ko.jqwidgets = ko.jqwidgets || {};

        ko.jqwidgets.knockout = function (settings) {
            var me = this;
            var binding = {},
            name = settings.name;
     
            binding.init = function (element, valueAccessor, allBindingAccessor, viewModel) {
                var unwrappedValue = ko.utils.unwrapObservable(valueAccessor());
                var modelOptions = ko.toJS(unwrappedValue);
            
                if (settings['reset']) {
                    settings['reset']();
                }
                if ($.data(element)[name] == undefined) {
                    var options = [];
                    $(element)[name]();
                    widget = $.data(element)[name].instance;
                    $.each(settings, function (name, value) {
                        if (widget.hasOwnProperty(name) && modelOptions.hasOwnProperty(name)) {
                            if (!widget["koupdating"]) {
                                widget["koupdatingFromObservable"] = true;
                                if (ko.toJSON(modelOptions[name]) != ko.toJSON(widget[name])) {
                                    settings.setProperty(widget, name, widget[name], modelOptions[name]);
                                }
                                options[name] = name;
                                widget["koupdatingFromObservable"] = false;
                            }
                        }
                    });
                    var widgetSettings = {};
                    $.each(modelOptions, function(name, value)
                    {
                        if (options[name] == undefined) {
                            widgetSettings[name] = modelOptions[name];
                        }
                    });
                    widget.host[name](widgetSettings);
                }
                widget = $.data(element)[name].instance;
                widget["koupdatingFromObservable"] = false;
                widget["koupdating"] = false;

                if (settings.events) {
                    $.each(settings.events, function () {
                        var eventName = this;
                        $(element).on(eventName + '.' + element.id, function (event) {
                            widget = $.data(element)[name].instance;
                            if (!widget["koupdatingFromObservable"]) {
                                widget["koupdating"] = true;
                                var val = valueAccessor();
                                var property = settings.getProperty(widget, event, eventName, unwrappedValue);
                                if (property != undefined) {
                                    if (val.hasOwnProperty(property.name) && $.isFunction(val[property.name])) {
                                        if (ko.isObservable(val[property.name]) && val[property.name].push) {
                                            valueAccessor(property.value);
                                        }
                                        else {
                                            val[property.name](property.value);
                                        }
                                    }
                                    else if (val[property.name]) {
                                        valueAccessor(property.value);
                                    }
                                }
                                widget["koupdating"] = false;
                            }
                        });
                    });
                }
            };

            binding.update = function (element, valueAccessor, allBindingAccessor, viewModel, bindingContext) {
                var unwrappedValue = ko.utils.unwrapObservable(valueAccessor());
                var modelOptions = ko.toJS(unwrappedValue);
                widget = $.data(element)[name].instance;
                if (widget["koupdating"])
                    return;

                $.each(settings, function (name, value) {
                    if (widget.hasOwnProperty(name) && modelOptions.hasOwnProperty(name)) {
                        if (!widget["koupdating"]){
                            widget["koupdatingFromObservable"] = true;
                            if (ko.toJSON(modelOptions[name]) != ko.toJSON(widget[name])) {
                                settings.setProperty(widget, name, widget[name], modelOptions[name]);
                            }
                            widget["koupdatingFromObservable"] = false;
                        }
                    }
                });
            };

            ko.bindingHandlers[settings.name] = binding;
        };

        // jqxGauge
        var jqxGauge = new ko.jqwidgets.knockout({
            name: "jqxGauge",
            disabled: false,
            min: 0,
            max: 220,
            value: 0,
            reset: function()
            {
                this.value = 0;
                this.max = 220;
                this.min = 0;
                this.disabled = false;
            },
            getProperty: function (object, event, eventName) {
            },
            setProperty: function (object, key, value, newValue) {
                if (key == 'disabled') {
                    object.host.jqxGauge({ disabled: newValue });
                }
                if (key == 'min') {
                    object.host.jqxGauge({ min: newValue });
                }
                if (key == 'max') {
                    object.host.jqxGauge({ max: newValue });
                }
                if (key == 'value') {
                    object.host.jqxGauge({ value: newValue });
                }
            }
        });

        // jqxLinearGauge
        var jqxLinearGauge = new ko.jqwidgets.knockout({
            name: "jqxLinearGauge",
            disabled: false,
            min: 0,
            max: 220,
            value: 0,
            reset: function () {
                this.value = 0;
                this.max = 220;
                this.min = 0;
                this.disabled = false;
            },
            getProperty: function (object, event, eventName) {
            },
            setProperty: function (object, key, value, newValue) {
                if (key == 'disabled') {
                    object.host.jqxLinearGauge({ disabled: newValue });
                }
                if (key == 'min') {
                    object.host.jqxLinearGauge({ min: newValue });
                }
                if (key == 'max') {
                    object.host.jqxLinearGauge({ max: newValue });
                }
                if (key == 'value') {
                    object.host.jqxLinearGauge({ value: newValue });
                }
            }
        });

        // jqxSlider
        var jqxSlider = new ko.jqwidgets.knockout({
            name: "jqxSlider",
            disabled: false,
            min: 0,
            max: 10,
            value: 0,
            reset: function () {
                this.value = 0;
                this.max = 10;
                this.min = 0;
                this.disabled = false;
            },
            events: ['change'],
            getProperty: function (object, event, eventName) {
                if (eventName == 'change') {
                    return { name: "value", value: event.args.value };
                }
            },
            setProperty: function (object, key, value, newValue) {
                if (key == 'disabled') {
                    object.host.jqxSlider({ disabled: newValue });
                }
                if (key == 'min') {
                    object.host.jqxSlider({ min: parseFloat(newValue) });
                }
                if (key == 'max') {
                    object.host.jqxSlider({ max: parseFloat(newValue) });
                }
                if (key == 'value') {
                    object.host.jqxSlider({ value: parseFloat(newValue) });
                }
            }
        });

        // jqxScrollBar
        var jqxScrollBar = new ko.jqwidgets.knockout({
            name: "jqxScrollBar",
            disabled: false,
            min: 0,
            max: 10,
            value: 0,
            reset: function () {
                this.value = 0;
                this.max = 10;
                this.min = 0;
                this.disabled = false;
            },
            events: ['valuechanged'],
            getProperty: function (object, event, eventName) {
                if (eventName == 'valuechanged') {
                    return { name: "value", value: parseInt(event.currentValue) };
                }
            },
            setProperty: function (object, key, value, newValue) {
                if (key == 'disabled') {
                    object.host.jqxScrollBar({ disabled: newValue });
                }
                if (key == 'min') {
                    object.host.jqxScrollBar({ min: parseFloat(newValue) });
                }
                if (key == 'max') {
                    object.host.jqxScrollBar({ max: parseFloat(newValue) });
                }
                if (key == 'value') {
                    object.host.jqxScrollBar({ value: parseFloat(newValue) });
                }
            }
        });

        // jqxProgressBar
        var jqxProgressBar = new ko.jqwidgets.knockout({
            name: "jqxProgressBar",
            disabled: false,
            value: 0,
            reset: function () {
                this.value = 0;
                this.disabled = false;
            },
            events: ['valuechanged'],
            getProperty: function (object, event, eventName) {
                if (eventName == 'valuechanged') {
                    return { name: "value", value: parseInt(event.currentValue) };
                }
            },
            setProperty: function (object, key, value, newValue) {
                if (key == 'disabled') {
                    object.host.jqxProgressBar({ disabled: newValue });
                }
                if (key == 'value') {
                    object.host.jqxProgressBar({ value: parseFloat(newValue) });
                }
            }
        });
        // jqxButton
        var jqxButton = new ko.jqwidgets.knockout({
            name: "jqxButton",
            disabled: false,
            reset: function () {
                this.disabled = false;
            },
            getProperty: function (object, event, eventName) {
            },
            setProperty: function (object, key, value, newValue) {
                if (key == 'disabled') {
                    object.host.jqxButton({ disabled: newValue });
                }
            }
        });

        // jqxCheckBox
        var jqxCheckBox = new ko.jqwidgets.knockout({
            name: "jqxCheckBox",
            checked: false,
            disabled: false,
            reset: function () {
                this.checked = false;
                this.disabled = false;
            },
            events: ['change'],
            getProperty: function (object, event, eventName) {
                if (eventName == 'change') {
                    return { name: "checked", value: event.args.checked };
                }
            },
            setProperty: function (object, key, value, newValue) {
                if (key == 'disabled') {
                    object.host.jqxCheckBox({ disabled: newValue });
                }
                if (key == 'checked') {
                    if (value != newValue) {
                        object.host.jqxCheckBox({ checked: newValue });
                    }
                }
            }
        });

        // jqxRadioButton
        var jqxRadioButton = new ko.jqwidgets.knockout({
            name: "jqxRadioButton",
            checked: false,
            disabled: false,
            reset: function () {
                this.checked = false;
                this.disabled = false;
            },
            events: ['change'],
            getProperty: function (object, event, eventName) {
                if (eventName == 'change') {
                    return { name: "checked", value: event.args.checked };
                }
            },
            setProperty: function (object, key, value, newValue) {
                if (key == 'disabled') {
                    object.host.jqxRadioButton({ disabled: newValue });
                }
                if (key == 'checked') {
                    if (value != newValue) {
                        object.host.jqxRadioButton({ checked: newValue });
                    }
                }
            }
        });

        // jqxDateTimeInput
        var jqxDateTimeInput = new ko.jqwidgets.knockout({
            name: "jqxDateTimeInput",
            value: null,
            disabled: false,
            reset: function () {
                this.value = null;
                this.disabled = false;
            },
            events: ['valuechanged'],
            getProperty: function (object, event, eventName) {
                if (eventName == 'valuechanged') {
                    return { name: "value", value: event.args.date };
                }
            },
            setProperty: function (object, key, value, newValue) {
                if (key == 'value') {
                    object.setDate(newValue);
                }
                if (key == 'disabled') {
                    object.host.jqxDateTimeInput({ disabled: newValue });
                }
            }
        });

        // jqxCalendar
        var jqxCalendar = new ko.jqwidgets.knockout({
            name: "jqxCalendar",
            value: null,
            disabled: false,
            reset: function () {
                this.value = null;
                this.disabled = false;
            },
            events: ['valuechanged'],
            getProperty: function (object, event, eventName) {
                if (eventName == 'valuechanged') {
                    return { name: "value", value: event.args.date };
                }
            },
            setProperty: function (object, key, value, newValue) {
                if (key == 'value') {
                    object.setDate(newValue);
                }
                if (key == 'disabled') {
                    object.host.jqxCalendar({ disabled: newValue });
                }
            }
        });

        // jqxNumberInput
        var jqxNumberInput = new ko.jqwidgets.knockout({
            name: "jqxNumberInput",
            value: null,
            events: ['valuechanged'],
            disabled: false,
            reset: function () {
                this.value = null;
                this.disabled = false;
            },
            getProperty: function (object, event, eventName) {
                if (eventName == 'valuechanged') {
                    return { name: "value", value: object.val() };
                }
            },
            setProperty: function (object, key, value, newValue) {
                if (key == 'value') {
                    object.host.jqxNumberInput('val', newValue);
                }
                if (key == 'disabled') {
                    object.host.jqxNumberInput({ disabled: newValue });
                }
            }
        });

        // jqxMaskedInput
        var jqxMaskedInput = new ko.jqwidgets.knockout({
            name: "jqxMaskedInput",
            value: null,
            events: ['valuechanged'],
            disabled: false,
            reset: function () {
                this.value = null;
                this.disabled = false;
            },
            getProperty: function (object, event, eventName) {
                if (eventName == 'valuechanged') {
                    return { name: "value", value: object.val() };
                }
            },
            setProperty: function (object, key, value, newValue) {
                if (key == 'value') {
                    object.host.jqxMaskedInput('val', newValue);
                }
                if (key == 'disabled') {
                    object.host.jqxMaskedInput({ disabled: newValue });
                }
            }
        });

        // jqxListBox
        var jqxListBox = new ko.jqwidgets.knockout({
            name: "jqxListBox",
            source: null,
            disabled: false,
            selectedIndex: -1,
            reset: function () {
                this.disabled = false;
                this.selectedIndex = -1;
                this.source = null;
            },
            events: ['change'],
            getProperty: function (object, event, eventName) {
                if (eventName == 'change') {
                    this.selectedIndex = object.selectedIndex;
                    return { name: 'selectedIndex', value: object.selectedIndex };
                }

            },
            setProperty: function (object, key, value, newValue) {
                if (key == 'source') {
                    object.source = newValue;
                    object.refresh();
                }
                if (key == 'disabled') {
                    object.disabled = newValue;
                    object._renderItems();
                }
                if (key == 'selectedIndex') {
                    var disabled = object.disabled;
                    object.disabled = false;
                    object.selectIndex(newValue);
                    object.disabled = disabled;
                    if (disabled) object._renderItems();
                }
            }
        });
        //jqxDropDownList
        var jqxDropDownList = new ko.jqwidgets.knockout({
            name: "jqxDropDownList",
            source: null,
            disabled: false,
            selectedIndex: -1,
            reset: function () {
                this.disabled = false;
                this.selectedIndex = -1;
                this.source = null;
            },
            events: ['change'],
            getProperty: function (object, event, eventName) {
                if (eventName == 'change') {
                    this.selectedIndex = object.selectedIndex;
                    return { name: 'selectedIndex', value: object.selectedIndex };
                }
            },
            setProperty: function (object, key, value, newValue) {
                if (key == 'source') {
                    if (this.source != newValue) {
                        this.source = newValue;
                        object.host.jqxDropDownList({ source: newValue });
                    }
                }
                if (key == 'disabled') {
                    if (newValue != this.disabled) {
                        this.disabled = newValue;
                        object.host.jqxDropDownList({ disabled: newValue });
                    }
                }
                if (key == 'selectedIndex') {
                    if (newValue != this.selectedIndex) {
                        this.selectedIndex = newValue;
                        object.host.jqxDropDownList({ selectedIndex: newValue });
                    }
                }
            }
        });

        //jqxComboBox
        var jqxComboBox = new ko.jqwidgets.knockout({
            name: "jqxComboBox",
            source: null,
            disabled: false,
            selectedIndex: -1,
            reset: function () {
                this.disabled = false;
                this.selectedIndex = -1;
                this.source = null;
            },
            events: ['change'],
            getProperty: function (object, event, eventName) {
                if (eventName == 'change') {
                    this.selectedIndex = object.selectedIndex;
                    return { name: 'selectedIndex', value: object.selectedIndex };
                }
            },
            setProperty: function (object, key, value, newValue) {
                if (key == 'source') {
                    if (this.source != newValue) {
                        this.source = newValue;
                        object.host.jqxComboBox({ source: newValue });
                    }
                }
                if (key == 'disabled') {
                    if (newValue != this.disabled) {
                        this.disabled = newValue;
                        object.host.jqxComboBox({ disabled: newValue });
                    }
                }
                if (key == 'selectedIndex') {
                    if (newValue != this.selectedIndex) {
                        this.selectedIndex = newValue;
                        object.host.jqxComboBox({ selectedIndex: newValue });
                    }
                }
            }
        });

        //jqxTree
        var jqxTree = new ko.jqwidgets.knockout({
            name: "jqxTree",
            source: null,
            disabled: false,
            reset: function () {
                this.disabled = false;
                this.source = null;
            },
            getProperty: function (object, event, eventName) {
            },
            setProperty: function (object, key, value, newValue) {
                if (key == 'source') {
                    if (this.source != newValue) {
                        this.source = newValue;
                        object.host.jqxTree({ source: newValue });
                    }
                }
                if (key == 'disabled') {
                    if (newValue != this.disabled) {
                        this.disabled = newValue;
                        object.host.jqxTree({ disabled: newValue });
                    }
                }
            }
        });


        //jqxMenu
        var jqxMenu = new ko.jqwidgets.knockout({
            name: "jqxMenu",
            source: null,
            disabled: false,
            reset: function () {
                this.disabled = false;
                this.source = null;
            },
            getProperty: function (object, event, eventName) {
            },
            setProperty: function (object, key, value, newValue) {
                if (key == 'source') {
                    if (this.source != newValue) {
                        this.source = newValue;
                        object.host.jqxMenu({ source: newValue });
                    }
                }
                if (key == 'disabled') {
                    if (newValue != this.disabled) {
                        this.disabled = newValue;
                        object.host.jqxMenu({ disabled: newValue });
                    }
                }
            }
        });

        //jqxChart
        var jqxChart = new ko.jqwidgets.knockout({
            name: "jqxChart",
            source: null,
            disabled: false,
            reset: function () {
                this.disabled = false;
                this.source = null;
            },
            getProperty: function (object, event, eventName) {
            },
            setProperty: function (object, key, value, newValue) {
                if (key == 'source') {
                    if (newValue != this.source) {
                        this.source = newValue;
                        var animations = object.host.jqxChart('enableAnimations');
                        object.host.jqxChart({ enableAnimations: false });
                        object.host.jqxChart({ source: newValue });
                        setTimeout(function () {
                            object.host.jqxChart({ enableAnimations: animations });
                        }, 1000);
                    }
                }
                if (key == 'disabled') {
                    if (newValue != this.disabled) {
                        this.disabled = newValue;
                        object.host.jqxChart({ disabled: newValue });
                    }
                }
            }
        });

        //jqxGrid
        var jqxGrid = new ko.jqwidgets.knockout({
            name: "jqxGrid",
            source: null,
            disabled: false,
            selectedRowIndex: -1,
            reset: function () {
                this.disabled = false;
                this.source = null;
                this.selectedRowIndex = -1;
            },
            events: ['cellvaluechanged', 'cellselect', 'rowselect'],
            getProperty: function (object, event, eventName, modelOptions) {
                if (eventName == 'cellvaluechanged') {
                    var rowId = object.host.jqxGrid("getrowid", event.args.rowindex);
                    var rowdata = object.host.jqxGrid("getrowdata", rowId);
                    var source = modelOptions['source'];
                    if (source != undefined) {
                        var updateObj = {};
                        var hasObservable = false;
                        var hasComputed = false;
                        $.each(source()[rowId], function (index, value) {
                            updateObj[index] = value;
                            if (ko.isObservable(value) && !ko.isComputed(value)) {
                                hasObservable = true;
                                value(rowdata[index]);
                            }
                            if (ko.isObservable(value) && ko.isComputed(value)) {
                                hasComputed = true;
                            }
                        });

                        if (!hasObservable) {
                            updateObj = rowdata;
                            source.replace(source()[rowId], updateObj);
                        }
                        else {
                            source.replace(source()[rowId], updateObj);
                        }
                        if (hasComputed) {
                            object.host.jqxGrid("updaterow", rowId, ko.toJS(source)[rowId]);
                        }

                        return { name: 'source', value: source };
                    }
                }
            },
            setProperty: function (object, key, value, newValue) {
                if (key == 'selectedRowIndex') {
                    object.host.jqxGrid('selectrow', newValue);
                }
                if (key == 'source') {
                    if (this.source == null || newValue == null) {
                        if (this.source != newValue) {
                            this.source = newValue;
                            var source = {
                                localdata: newValue,
                                datatype: 'local'
                            }

                            var dataAdapter = new $.jqx.dataAdapter(source);
                            object.host.jqxGrid({ source: dataAdapter });
                        }
                    }
                    else {
                        var source = {
                            localdata: newValue,
                            datatype: 'local'
                        }

                        var dataAdapter = new $.jqx.dataAdapter(source);
                        dataAdapter.dataBind();
                 
                        if (!value.records || !dataAdapter.records) return;

                        
                        var itemsLength = Math.max(value.records.length, dataAdapter.records.length);
                        var changedRecords = Math.abs(value.records.length - dataAdapter.records.length);
                        if (changedRecords > 1) {
                            object.host.jqxGrid("beginupdate");
                        }

                        for (var i = 0; i < itemsLength; i++) {
                            var record = dataAdapter.records[i];
                            if (record == undefined) {
                                var rowId = object.host.jqxGrid("getrowid", i);
                                object.host.jqxGrid("deleterow", rowId);
                            }
                            else {
                                var update = value.records[i] != undefined;
                                if (update) {                           
                                    if (ko.toJSON(record) != ko.toJSON(value.records[i])) {
                                        if (value.records[i].uid != undefined) {
                                            record.uid = value.records[i].uid;
                                            if (ko.toJSON(record) == ko.toJSON(value.records[i])) {
                                                continue;
                                            }
                                        }

                                        var rowId = object.host.jqxGrid("getrowid", i);
                                        object.host.jqxGrid("updaterow", rowId, record);
                                    }
                                }
                                else {
                                    object.host.jqxGrid("addrow", null, record);
                                }
                            }
                        }
                        if (changedRecords > 1) {
                            object.host.jqxGrid("endupdate");
                        }
                    }
                }
                if (key == 'disabled') {
                    if (newValue != this.disabled) {
                        this.disabled = newValue;
                        object.host.jqxGrid({ disabled: newValue });
                    }
                }
            }
        });
    } (jQuery, ko));
}
catch(error){

}