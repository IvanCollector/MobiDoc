/*
jQWidgets v2.7.0 (2013-Feb-08)
Copyright (c) 2011-2013 jQWidgets.
License: http://jqwidgets.com/license/
*/

/*
* Depends:
*   jqxcore.js
*/

(function ($) {

    $.jqx.jqxWidget("jqxInput", "", {});

    $.extend($.jqx._jqxInput.prototype, {
        defineInstance: function () {
            this.disabled = false;
            this.filter = this.filter || this._filter;
            this.sort = this.sort || this._sort;
            this.highlight = this.highlight || this._highlight;
            this.renderer = this.renderer || this._renderer;
            this.shown = false;
            this.$popup = $('<ul></ul>');
            this.items = 8;
            this.item = '<li><a href="#"></a></li>';
            this.minLength = 1;
            this.source = [];
            this.roundedCorners = true;
            this.searchMode = 'default';
            this.placeHolder = "";
            this.width = null;
            this.height = null;
            this.rtl = false;
        },

        createInstance: function (args) {
            this.addHandlers();
            if (this.rtl) {
                this.host.addClass(this.toThemeProperty('jqx-rtl'));
            }

            if (!$.isFunction(this.source)) {
                var self = this;
                var items = new Array;
                items = $.map(this.source, function (item) {
                    if (item == undefined)
                        return null;

                    if (typeof item === "string") {
                        return { label: item, value: item };
                    }

                    if (typeof item != "string") {
                        var label = "";
                        var value = "";

                        if (self.displayMember != "" && self.displayMember != undefined) {
                            if (item[self.displayMember]) {
                                label = item[self.displayMember];
                            }
                        }

                        if (self.valueMember != "" && self.valueMember != undefined) {
                            value = item[self.valueMember];
                        }

                        if (label == "") label = item.label;
                        if (value == "") value = item.value;

                        return { label: label, value: value };
                    }

                    return item;
                });
                this.source = items;
            }
        },

        _refreshClasses: function (add) {
            var func = add ? 'addClass' : 'removeClass';
            this.host[func](this.toThemeProperty('jqx-widget-content'));
            this.host[func](this.toThemeProperty('jqx-input'));
            this.host[func](this.toThemeProperty('jqx-widget'));
            this.$popup[func](this.toThemeProperty('jqx-menu'));
            this.$popup[func](this.toThemeProperty('jqx-menu-vertical'));
            this.$popup[func](this.toThemeProperty('jqx-menu-dropdown'));
            this.$popup[func](this.toThemeProperty('jqx-widget'));
            this.$popup[func](this.toThemeProperty('jqx-widget-content'));
            if (this.roundedCorners) {
                this.host[func](this.toThemeProperty('jqx-rc-all'));
                this.$popup[func](this.toThemeProperty('jqx-rc-all'));
            }
            if (this.disabled) {
                this.host[func](this.toThemeProperty('jqx-fill-state-disabled'));
            }
            else {
                this.host.removeClass(this.toThemeProperty('jqx-fill-state-disabled'));
            }
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

        refresh: function () {
            this._refreshClasses(false);
            this._refreshClasses(true);
            if (this.width) this.host.width(this.width);
            if (this.height) this.host.height(this.height);
            this.host.attr('disabled', this.disabled);

            if (!this.host.attr('placeholder')) {
                if ('placeholder' in this.element) {
                    this.host.attr('placeHolder', this.placeHolder);
                }
                else {
                    var that = this;
                    if (this.host.val() == "") {
                        this.host.val(this.placeHolder);

                        this.host.focus(function () {
                            if (that.host.val() == that.placeHolder) {
                                that.host.val('');
                            }
                        });

                        this.host.blur(function () {
                            if (that.host.val() == '' || that.host.val() == that.placeHolder) {
                                that.host.val(that.placeHolder);
                            }
                        });
                    }
                }
            }
        },

        destroy: function () {
            this.removeHandlers();
        },

        propertyChangedHandler: function (object, key, oldvalue, value) {
            object.refresh();
        },

        select: function (event, ui) {
            var val = this.$popup.find('.jqx-fill-state-pressed').attr('data-value')
            this.host
            .val(this.renderer(val, this.host.val()))
            .change()
            return this.close();
        },

        _renderer: function (item) {
            return item;
        },

        open: function () {
            var position = $.extend({}, this.host.offset(), {
                height: this.host[0].offsetHeight
            })

            this.$popup
            .appendTo($(document.body))
            .css({
                position: 'absolute',
                top: position.top + position.height
            , left: position.left
            })
            .show();
            var height = 0;
            var children = this.$popup.children();
            $.each(children, function () {
                height += $(this).outerHeight(true) - 1;
            });
            this.$popup.height(height);

            this.shown = true;
            return this
        },

        close: function () {
            this.$popup.hide()
            this.shown = false
            return this
        },

        suggest: function (event) {
            var items;
            this.query = this.host.val();

            if (!this.query || this.query.length < this.minLength) {
                return this.shown ? this.close() : this
            }

            items = $.isFunction(this.source) ? this.source(this.query, $.proxy(this.load, this)) : this.source;

            return items ? this.load(items) : this;
        },

        load: function (items) {
            var that = this;

            items = $.grep(items, function (item) {
                return that.filter(item);
            })

            items = this.sort(items)

            if (!items.length) {
                return this.shown ? this.close() : this
            }

            return this.render(items.slice(0, this.items)).open();
        },

        _filter: function (item) {
            var value = this.query;
            var itemValue = item;
            if (item.label != null) {
                itemValue = item.label;
            }

            switch (this.searchMode) {
                case 'containsignorecase':
                default:
                    return $.jqx.string.containsIgnoreCase(itemValue, value);
                case 'contains':
                    return $.jqx.string.contains(itemValue, value);
                case 'equals':
                    return $.jqx.string.equals(itemValue, value);
                case 'equalsignorecase':
                    return $.jqx.string.equalsIgnoreCase(itemValue, value);
                case 'startswith':
                    return $.jqx.string.startsWith(itemValue, value);
                case 'startswithignorecase':
                    return $.jqx.string.startsWithIgnoreCase(itemValue, value);
                case 'endswith':
                    return $.jqx.string.endsWith(itemValue, value);
                case 'endswithignorecase':
                    return $.jqx.string.endsWithIgnoreCase(itemValue, value);
            }
        },

        _sort: function (items) {
            var beginswith = []
            , caseSensitive = []
            , caseInsensitive = []
            , item

            while (item = items.shift()) {
                var itemValue = item;
                if (item.label) {
                    itemValue = item.label;
                }

                if (!itemValue.toLowerCase().indexOf(this.query.toLowerCase())) {
                    beginswith.push(item);
                }
                else if (~itemValue.indexOf(this.query)) {
                    caseSensitive.push(item);
                }
                else {
                    caseInsensitive.push(item);
                }
            }

            return beginswith.concat(caseSensitive, caseInsensitive);
        },

        _highlight: function (item) {
            var query = this.query.replace(/[\-\[\]{}()*+?.,\\\^$|#\s]/g, '\\$&')
            return item.replace(new RegExp('(' + query + ')', 'ig'), function ($1, match) {
                return '<strong>' + match + '</strong>'
            })
        },

        render: function (items) {
            var that = this

            items = $(items).map(function (i, item) {
                var itemValue = item;
                if (item.value != undefined) {
                    i = $(that.item).attr('data-value', item.value);
                }
                else if (item.label != undefined) {
                    i = $(that.item).attr('data-value', item.label);
                }
                else {
                    i = $(that.item).attr('data-value', item);
                }
                if (item.label) {
                    itemValue = item.label;
                }

                i.find('a').html(that.highlight(itemValue));
                var rtlClass = "";
                if (that.rtl) {
                    rtlClass = " " + that.toThemeProperty('jqx-rtl');
                }
                i[0].className = that.toThemeProperty('jqx-item') + " " + that.toThemeProperty('jqx-menu-item') + " " + that.toThemeProperty('jqx-rc-all') + rtlClass;
                return i[0];
            })

            items.first().addClass(this.toThemeProperty('jqx-fill-state-pressed'));
            this.$popup.html(items);
            this.$popup.width(this.host.width() - 4);
            return this;
        },

        next: function (event) {
            var active = this.$popup.find('.jqx-fill-state-pressed').removeClass(this.toThemeProperty('jqx-fill-state-pressed'))
            , next = active.next();

            if (!next.length) {
                next = $(this.$popup.find('li')[0]);
            }

            next.addClass(this.toThemeProperty('jqx-fill-state-pressed'));
        },

        prev: function (event) {
            var active = this.$popup.find('.jqx-fill-state-pressed').removeClass(this.toThemeProperty('jqx-fill-state-pressed'))
        , prev = active.prev()

            if (!prev.length) {
                prev = this.$popup.find('li').last()
            }

            prev.addClass(this.toThemeProperty('jqx-fill-state-pressed'));
        },

        addHandlers: function () {
            this.addHandler(this.host, 'blur', $.proxy(this.blur, this));
            this.addHandler(this.host, 'keypress', $.proxy(this.keypress, this));
            this.addHandler(this.host, 'keyup', $.proxy(this.keyup, this));
            this.addHandler(this.host, 'keydown', $.proxy(this.keydown, this));
            this.addHandler(this.$popup, 'click', $.proxy(this.click, this));
            this.$popup.on('mouseenter', 'li', $.proxy(this.mouseenter, this))
        },

        removeHandlers: function () {
            this.removeHandler(this.host, 'blur', $.proxy(this.blur, this));
            this.removeHandler(this.host, 'keypress', $.proxy(this.keypress, this));
            this.removeHandler(this.host, 'keyup', $.proxy(this.keyup, this));
            this.removeHandler(this.host, 'keydown', $.proxy(this.keydown, this));
            this.removeHandler(this.$popup, 'click', $.proxy(this.click, this));
            this.$popup.off('mouseenter', 'li', $.proxy(this.mouseenter, this))
        },

        move: function (e) {
            if (!this.shown) return

            switch (e.keyCode) {
                case 9: // tab
                case 13: // enter
                case 27: // escape
                    e.preventDefault()
                    break

                case 38: // up arrow
                    e.preventDefault()
                    this.prev()
                    break

                case 40: // down arrow
                    e.preventDefault()
                    this.next()
                    break
            }

            e.stopPropagation()
        },

        keydown: function (e) {
            this.suppressKeyPressRepeat = ~$.inArray(e.keyCode, [40, 38, 9, 13, 27])
            this.move(e)
        },

        keypress: function (e) {
            if (this.suppressKeyPressRepeat) return
            this.move(e)
        },

        keyup: function (e) {
            switch (e.keyCode) {
                case 40: // down arrow
                case 38: // up arrow
                case 16: // shift
                case 17: // ctrl
                case 18: // alt
                    break

                case 9: // tab
                case 13: // enter
                    if (!this.shown) return;
                    this.select(e, this)
                    break

                case 27: // escape
                    if (!this.shown) return;
                    this.close()
                    break

                default:
                    {
                        var me = this;
                        if (this.timer) clearTimeout(this.timer);
                        this.timer = setTimeout(function () {
                            me.suggest();
                        }, 300);
                    }
            }

            e.stopPropagation()
            e.preventDefault()
        },

        blur: function (e) {
            var that = this
            setTimeout(function () { that.close() }, 150)
        },

        click: function (e) {
            e.stopPropagation()
            e.preventDefault()
            this.select(e, this)
        },

        mouseenter: function (e) {
            this.$popup.find('.jqx-fill-state-pressed').removeClass(this.toThemeProperty('jqx-fill-state-pressed'));
            $(e.currentTarget).addClass(this.toThemeProperty('jqx-fill-state-pressed'));
        }

    });
})(jQuery);