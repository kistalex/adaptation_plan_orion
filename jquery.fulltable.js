//Редактор таблиц, совместимых с bootstrap

if (typeof jQuery === 'undefined') {
    throw new Error('FullTable requires jQuery library.');
}

if (typeof Array.isArray != "function") {
    Array.isArray = function(obj) {
        if (typeof obj != "object") return false;
        if (typeof obj.length == "undefined") return false;
        for (let i in obj) {
            if (!obj.hasOwnProperty(i)) continue;
            if (isNaN(i)) return false;
        }
        return true;
    };
}

(function($) {
    'use strict';

    $.fn.FullTable = function() {

        if (!this.is('table')) {
            return this;
        }

        let table = $(this);

        table.getKeys = function() {
            if ($(table).data('fulltable-keys') == null) $(table).data('fulltable-keys', []);
            return $(table).data('fulltable-keys');
        };
        table.setKeys = function(val) {
            $(table).data('fulltable-keys', val);
        };

        table.getRows = function() {
            if ($(table).data('fulltable-rows') == null) $(table).data('fulltable-rows', []);
            return $(table).data('fulltable-rows');
        };
        table.setRows = function(val) {
            $(table).data('fulltable-rows', val);
        };

        table.getSorting = function() {
            if ($(table).data('fulltable-sorting') == null) $(table).data('fulltable-sorting', []);
            return $(table).data('fulltable-sorting');
        };
        table.setSorting = function(val) {
            $(table).data('fulltable-sorting', val);
        };

        table.getEvents = function() {
            if ($(table).data('fulltable-events') == null) $(table).data('fulltable-events', {});
            return $(table).data('fulltable-events');
        };
        table.setEvents = function(val) {
            $(table).data('fulltable-events', val);
        };

        let types = {
            "integer":["integer", "number"],
            "decimal":["decimal", "float", "double"],
            "string":["string", "literal"]
        };

        let on = function() {
            return methods['on'].apply(this, arguments);
        };

        let clean = function() {
            return methods['clean'].apply(this, arguments);
        };

        let changeSettings = function() {
            return methods['changeSettings'].apply(this, arguments);
        };

        let drawHeader = function() {
            return methods['drawHeader'].apply(this, arguments);
        };

        let drawBody = function() {
            return methods['drawBody'].apply(this, arguments);
        };

        let draw = function() {
            return methods['draw'].apply(this, arguments);
        };

        let filter = function() {
            return methods['filter'].apply(this, arguments);
        };

        let order = function() {
            return methods['order'].apply(this, arguments);
        };

        let validateRow = function() {
            return methods['validateRow'].apply(this, arguments);
        };

        let addRow = function() {
            return methods['addRow'].apply(this, arguments);
        };

        let editRow = function() {
            return methods['editRow'].apply(this, arguments);
        };

        let removeRow = function() {
            return methods['removeRow'].apply(this, arguments);
        };

        let saveRow = function() {
            return methods['saveRow'].apply(this, arguments);
        };

        let discardRow = function() {
            return methods['discardRow'].apply(this, arguments);
        };

        let checkRow = function() {
            return methods['checkRow'].apply(this, arguments);
        };

        let addSortItem = function(fieldName, fieldSort) {
            let removing_indexes = [];
            for (let index in table.getSorting()) {
                if (!table.getSorting().hasOwnProperty(index)) continue;
                let sortingItem = table.getSorting()[index];
                if (sortingItem.name == fieldName) {
                    removing_indexes.push(index);
                }
            }
            removing_indexes = removing_indexes.reverse();
            for (let index in removing_indexes) {
                if (!removing_indexes.hasOwnProperty(index)) continue;
                index = removing_indexes[index];
                table.getSorting().splice(index, 1);
            }
            table.getSorting().push({
                name: fieldName,
                sort: fieldSort
            });
        }

        let getHeaderFromDom = function() {
            // Init headers and field names.
            $(table).find("thead th").each(function(th_index, th) {
                let fieldName = $(th).attr("fulltable-field-name");
                if (fieldName == null) {
                    fieldName = (new Date()).getTime()+""+(Math.floor(Math.random()*1e8));
                    $(th).attr("fulltable-field-name", fieldName);
                }
                table.getKeys()[th_index] = fieldName;
            });
        };

        let drawRow = function(data, tr) {
            if (typeof data != "object") data = null;
            if (tr == null) {
                tr = $("<tr/>");
                for (let key in table.getKeys()) {
                    if (!table.getKeys().hasOwnProperty(key)) continue;
                    key = table.getKeys()[key];
                    let td = $("<td/>");
                    $(td).attr("fulltable-field-name", key);
                    $(tr).append($(td));
                }
            }
            let row = {};
            $(tr).children("td").each(function(td_index, td) {
                let key = table.getKeys()[td_index];
                if (key != null) $(td).attr("fulltable-field-name", key);
                let value;
                if (data == null) {
                    value = $(td).html();
                } else {
                    value = data[key];
                }
                let text = value;
                let fieldData = options.fields[key];
                if (fieldData == null) fieldData = {};
                // TODO: здесь можно выбрать валидацию: select, checkbox, if (fieldData.options == "boolean")
                if (fieldData.options != null) {
                    text = "";
                    let found = false;
                    for (let option in fieldData.options) {
                        if (!fieldData.options.hasOwnProperty(option)) continue;
                        option = fieldData.options[option];
                        if (option.value == value) {
                            text = option.title;
                            found = true;
                            break;
                        }
                    }
                    if (!found) value = null;
                }
                row[key] = value;
                $(td).html(text);
            });
            row["__dom"] = $(tr);
            row["__filtered"] = false;
            addSelectionControl(row, "body");
            addEditionControl(row, "body");
            return row;
        };

        let getBodyFromDom = function() {
            $(table).find("tbody tr").each(function(tr_index, tr) {
                table.getRows()[tr_index] = drawRow(null, tr);
            });
        };

        let addEditionControl = function(row, type) {
            if (!options.editable) return;
            if (typeof row != "object") return;
            let tr = row["__dom"];
            if (!$(tr).is("tr")) return;
            if ($(tr).find(".fulltable-edition-control").length > 0) return;
            let edition_control = null;
            if ($(tr).parent().is("thead") || type == "head") {
                edition_control = $("<th>", {
                    'class':"fulltable-edition-control"
                });
            }
            if ($(tr).parent().is("tbody") || type == "body") {
                edition_control = $("<td/>", {
                    'class':"fulltable-edition-control"
                });
                edition_control.append($("<a/>", {
                    'class':"fulltable-edit",
                    'text':"E"
                }).click(function() {
                    editRow(row);
                }));
                edition_control.append($("<a/>", {
                    'class':"fulltable-remove",
                    'text':"F"
                }).click(function() {
                    removeRow(row);
                }));
                edition_control.append($("<a/>", {
                    'class':"fulltable-save",
                    'text':"G"
                }).click(function() {
                    saveRow(row);
                }));
                edition_control.append($("<a/>", {
                    'class':"fulltable-create",
                    'text':"I"
                }).click(function() {
                    saveRow(row);
                }));
                edition_control.append($("<a/>", {
                    'class':"fulltable-discard",
                    'text':"H"
                }).click(function() {
                    discardRow(row);
                }));
            }
            $(tr).append($(edition_control));
        };

        let addSelectionControl = function(row, type) {
            if (!options.selectable) return;
            if (typeof row != "object") return;
            let tr = row["__dom"];
            if (!$(tr).is("tr")) return;
            if ($(tr).find(".fulltable-selection-control").length > 0) return;
            let selection_control = null;
            if ($(tr).parent().is("thead") || type == "head") {
                selection_control = $("<th>", {
                    'class':"fulltable-selection-control"
                });
            }
            if ($(tr).parent().is("tbody") || type == "body") {
                selection_control = $("<td/>", {
                    'class':"fulltable-selection-control"
                });
                selection_control.append($("<input/>", {
                    'type':"checkbox",
                    'class':"checkbox",
                    'value':row["__selected"]
                }).change(function() {
                    checkRow(row);
                }));
            }
            $(tr).prepend($(selection_control));
        };

        let showRowForm = function(row) {
            for (let fieldName in row) {
                if (!row.hasOwnProperty(fieldName)) continue;
                if (fieldName.indexOf("__") == 0) continue;
                let value = row[fieldName];
                if (value == "") value = null;
                let td = $(row["__dom"]).find("td[fulltable-field-name='" + fieldName + "']");
                $(td).empty();
                let fieldData = options.fields[fieldName];
                if (fieldData == null) fieldData = {};
                let input;
                // TODO: Here must be validation of input type: select, checkbox, if (fieldData.options == "boolean")
                if (fieldData.options != null) {
                    input = $("<select>", {
                        'disabled':fieldData.disabled
                    });
                    let optionDom = $("<option>", {
                        'disabled':fieldData.mandatory,
                        'selected':'selected',
                        'text':fieldData.placeholder,
                        'value':null
                    });
                    $(input).append($(optionDom));
                    for (let option in fieldData.options) {
                        if (!fieldData.options.hasOwnProperty(option)) continue;
                        option = fieldData.options[option];
                        optionDom = $("<option>", {
                            'text':option.title,
                            'value':option.value
                        });
                        $(input).append($(optionDom));
                    }
                } else {
                    input = $("<input>", {
                        'type':"text",
                        'placeholder':fieldData.placeholder,
                        'disabled':fieldData.disabled
                    });
                }
                if (value != null) $(input).val(value);
                $(input).change(function(event) {
                    $(event.target).removeClass("invalid");
                });
                $(input).keyup(function(event) {
                    $(event.target).removeClass("invalid");
                });
                $(td).append($(input));
            }
            $(row["__dom"]).addClass("fulltable-editing");
        };

        let methods = {
            'on':function(eventName, eventHandler) {
                if (typeof eventName != "string" || typeof eventHandler != "function") return;
                if (eventName != "on" && methods[eventName] != null) {
                    table.getEvents()[eventName] = function() {
                        eventHandler.apply(this, arguments);
                    };
                }
            },
            'clean':function() {
                $(table).find(".fulltable-edition-control, .fulltable-sort, .fulltable-filter").remove();
                $(table).removeClass(function (index, className) {
                    return (className.match("/(^|\s)fulltable-\S+/g") || []).join(' ');
                });
                $(table).find("*").removeClass(function (index, className) {
                    return (className.match("/(^|\s)fultablle-\S+/g") || []).join(' ');
                });
                let dataKeys = ["fulltable-creating", "fulltable-editing"];
                for (let dataKey in dataKeys) {
                    if (!dataKeys.hasOwnProperty(dataKey)) continue;
                    $(table).removeData(dataKey);
                    $(table).find("*").removeData(dataKey);
                }
                $(table).removeData('fulltable');
                if (typeof table.getEvents().clean == "function") table.getEvents().clean();
            },
            'changeSettings':function(newOptionsPart) {
                if (typeof newOptionsPart != "object") return this;
                for (let key in options) {
                    if (!options.hasOwnProperty(key)) continue;
                    if (newOptionsPart[key] == null) continue;
                    if (key == "fields") {
                        let fields = options["fields"]
                        let newFields = newOptionsPart["fields"];
                        if (typeof newFields != "object") continue;
                        for (let newFieldName in newFields) {
                            if (!newFields.hasOwnProperty(newFieldName)) continue;
                            let newField = newFields[newFieldName];
                            if (fields[newFieldName] == null) {
                                fields[newFieldName] = newField;
                                continue;
                            }
                            for (let key in newField) {
                                if (!newField.hasOwnProperty(key)) continue;
                                fields[newFieldName][key] = newFields[newFieldName][key];
                            }
                        }
                        continue;
                    }
                    options[key] = newOptionsPart[key];
                }
                draw();
                if (typeof table.getEvents().changeSettings == "function") table.getEvents().changeSettings(newOptionsPart, options);
                return this;
            },
            'draw':function() {
                drawHeader();
                drawBody();
                return this;
            },
            'drawHeader':function() {
                // Drawing of header
                $(table).find("thead th:not(.fulltable-edition-control):not(.fulltable-selection-control)").each(function(th_index, th) {
                    let fieldName = $(th).attr("fulltable-field-name");
                    let apply_order = function(reverse) {
                        let fieldSort = 0;
                        if ($(th).hasClass("fulltable-asc")) {
                            fieldSort = 1;
                        } else if ($(th).hasClass("fulltable-desc")) {
                            fieldSort = -1;
                        }
                        if (reverse) fieldSort = -fieldSort;
                        addSortItem(fieldName, fieldSort);
                    };
                    apply_order(false);

                    // Insertion of ordenation button.
                    $(th).children("a.fulltable-sort").remove();
                    if (options.orderable) {
                        let fieldData = options.fields[fieldName];
                        if (fieldData == null) fieldData = {};
                        if (fieldData.orderable == null || fieldData.orderable == true) {
                            let sortElement = $("<a/>").addClass("fulltable-sort").addClass("fulltable-sort-asc").html("A");
                            $(sortElement).click(function(event) {
                                apply_order(true);
                                order();
                            });
                            $(th).append(sortElement);
                            let sortElement = $("<a/>").addClass("fulltable-sort").addClass("fulltable-sort-desc").html("C");
                            $(sortElement).click(function(event) {
                                apply_order(true);
                                order();
                            });
                            $(th).append(sortElement);
                        }
                    }
                    // Вставка фильрующих fields.
                    $(th).children("span.fulltable-filter, input.fulltable-filter, select.fulltable-filter").remove();
                    if (options.filterable) {
                        let fieldData = options.fields[fieldName];
                        if (fieldData == null) fieldData = {};
                        if (fieldData.filterable == null || fieldData.filterable == true) {
                            let filterFieldElement;
                            // TODO: Here must be validation of input type: select, checkbox, if (fieldData.options == "boolean")
                            if (fieldData.options != null) {
                                filterFieldElement = $("<select>", {
                                    'class':"fulltable-filter"
                                });
                                let optionDom = $("<option>", {
                                    'text':"", // TODO: Implement a placeholder for combo filter.
                                    'value':null
                                });
                                $(filterFieldElement).append($(optionDom));
                                // TODO: Here must be validation of input type: select, checkbox, if (fieldData.options == "boolean")
                                for (let option in fieldData.options) {
                                    if (!fieldData.options.hasOwnProperty(option)) continue;
                                    option = fieldData.options[option];
                                    optionDom = $("<option>", {
                                        'text':option.title,
                                        'value':option.value
                                    });
                                    $(filterFieldElement).append($(optionDom));
                                }
                            } else {
                                filterFieldElement = $("<input/>", {
                                    'class':"fulltable-filter",
                                    'type':"text"
                                });
                            }
                            let filterSpanWrapper = $("<span>", {
                                'class':"fulltable-filter"
                            });
                            $(th).append(filterSpanWrapper);
                            $(filterSpanWrapper).append(filterFieldElement);
                        }
                    }
                }).removeClass("fulltable-asc").removeClass("fulltable-desc").addClass("fulltable-asc");

                $(table).find("input, select").change(function(event) {
                    filter();
                });
                $(table).find("input, select").keyup(function(event) {
                    filter();
                });

                let pseudoRow = {"__dom":$(table).find("thead tr")};

                // Appending of header for edition controls
                addEditionControl(pseudoRow, "head");
                addSelectionControl(pseudoRow, "head");
                if (typeof table.getEvents().drawHeader == "function") table.getEvents().drawHeader(pseudoRow);
                return this;
            },
            'drawBody':function() {
                $(table).find("tbody tr").detach();
                for (let row in table.getRows()) {
                    if (!table.getRows().hasOwnProperty(row)) continue;
                    row = table.getRows()[row];
                    if ((row["__filtered"] && !row["__creating"]) || row["__removed"]) continue;
                    row["__invalidOptionRemoved"] = false;
                    for (let fieldName in row) {
                        if (!row.hasOwnProperty(fieldName)) continue;
                        $(row["__dom"]).find("td[fulltable-field-name='" + fieldName + "']").empty();
                        if (row["__creating"] || $(row["__dom"]).data("fulltable-editing")) continue;
                        let value = row[fieldName];
                        let text = value;
                        let fieldData = options.fields[fieldName];
                        if (fieldData == null) fieldData = {};
                        if (fieldData.options != null) {
                            // TODO: Here must be validation of input type: select, checkbox, if (fieldData.options == "boolean")
                            let found = false;
                            if (value == null) {
                                if (!fieldData.mandatory) found = true;
                            } else {
                                for (let option in fieldData.options) {
                                    if (!fieldData.options.hasOwnProperty(option)) continue;
                                    option = fieldData.options[option];
                                    if (option.value == value) {
                                        found = true;
                                        text = option.title;
                                        break;
                                    }
                                }
                            }
                            row["__invalidOptionRemoved"] = row["__invalidOptionRemoved"] || !found; // If option is not in option list, this restriction must be activated.
                        } else {
                            row["__invalidOptionRemoved"] = row["__invalidOptionRemoved"] || false; // If options has been removed from field settings, this restriction must be also removed.
                        }
                        if (value == null) text = "";
                        $(row["__dom"]).find("td[fulltable-field-name='" + fieldName + "']").html(text);
                        if (row["__invalidOptionRemoved"]) break;
                    }
                    if (row["__invalidOptionRemoved"] && !row["__creating"]) continue;
                    if ($(row["__dom"]).data("fulltable-editing")) {
                        showRowForm(row);
                    }
                    $(table).find("tbody").append(row["__dom"]);
                }
                if (typeof table.getEvents().drawBody == "function") table.getEvents().drawBody(table.getRows());
                return this;
            },
            'filter':function() {
                for (let row in table.getRows()) {
                    if (!table.getRows().hasOwnProperty(row)) continue;
                    row = table.getRows()[row];
                    if (row["__removed"] == true) {
                        $(row["__dom"]).remove();
                        continue;
                    }
                    row["__filtered"] = false;
                    $(table).find("tbody").append($(row["__dom"]));
                }
                $(table).find("thead th input.fulltable-filter, thead th select.fulltable-filter").each(function (i, e) {
                    let filtering_value = $(e).val();
                    let fieldName = $(e).parents("th").first().attr("fulltable-field-name");
                    for (let row in table.getRows()) {
                        if (!table.getRows().hasOwnProperty(row)) continue;
                        row = table.getRows()[row];
                        let filtered_value = row[fieldName];
                        let filtered = false;
                        if ($(row["__dom"]).data("fulltable-editing")) continue;
                        let fieldData = options.fields[fieldName];
                        if (fieldData == null) fieldData = {};
                        // TODO: Here must be validation of input type: select, checkbox, if (fieldData.options == "boolean")
                        if (fieldData.options != null) {
                            filtered = (filtering_value != null && filtering_value != '' && filtered_value != filtering_value);
                        } else {
                            if (filtered_value == null) filtered_value = '';
                            filtered = (filtering_value != null && filtering_value != '' && filtered_value.toUpperCase().indexOf(filtering_value.toUpperCase()) < 0);
                        }
                        if (filtered) {
                            $(row["__dom"]).detach();
                            row["__filtered"] = true;
                        }
                    }
                });
                if (typeof table.getEvents().filter == "function") table.getEvents().filter();
                order();
                return this;
            },
            'order':function(sorting) {
                let fields = table.getSorting();
                if (Array.isArray(sorting)) {
                    sorting = sorting.reverse();
                    for (let sortingItem in sorting) {
                        if (!sorting.hasOwnProperty(sortingItem)) continue;
                        sortingItem = sorting[sortingItem];
                        if (sortingItem.name != null && typeof(sortingItem.sort) == "number") {
                            addSortItem(sortingItem.name, sortingItem.sort);
                        }
                    }
                }
                let compareFunction = function(field, order) {
                    if (order == null) order = 1;
                    let result = function (a, b) {
                        if (a["__creating"] == true) return 1;
                        if (b["__creating"] == true) return -1;
                        if (a == null || b == null) return 0;
                        let fieldData = options.fields[field];
                        if (fieldData == null) fieldData = {};
                        // TODO: Here must be validation of input type: select, checkbox, if (fieldData.options == "boolean")
                        if (fieldData.options != null) {
                            let foundA = false, foundB = false;
                            for (let option in fieldData.options) {
                                if (!fieldData.options.hasOwnProperty(option)) continue;
                                option = fieldData.options[option];
                                if (!foundA && option["value"] == a[field]) {
                                    a = option["title"];
                                    foundA = true;
                                }
                                if (!foundB && option["value"] == b[field]) {
                                    b = option["title"];
                                    foundB = true;
                                }
                                if (foundA && foundB) break;
                            }
                        } else {
                            a = a[field];
                            b = b[field];
                        }
                        if (typeof a == "string") a = a.toUpperCase();
                        if (typeof b == "string") b = b.toUpperCase();
                        if (a == null || b == null) return 0;
                        if (!isNaN(a) && !isNaN(b)) {
                            a = Number(a);
                            b = Number(b);
                            return order*(a - b);
                        } else {
                            if (a < b)
                                return order*(-1);
                            else if (a == b)
                                return 0;
                            else
                                return order*(1);
                        }
                    };
                    return result;
                };
                if (!Array.isArray(fields) || fields.length == 0) return this;
                for (let field in fields) {
                    if (!fields.hasOwnProperty(field)) continue;
                    field = fields[field];
                    table.setRows(table.getRows().sort(compareFunction(field.name, field.sort)));
                    let head = $(table).find("thead th[fulltable-field-name='" + field.name + "']"); // TODO: Improve saving header in all rows by reference.
                    $(head).removeClass("fulltable-asc").removeClass("fulltable-desc");
                    if (field.sort >= 0) $(head).addClass("fulltable-asc");
                    else $(head).addClass("fulltable-desc");
                }
                drawBody();
                if (typeof table.getEvents().order == "function") table.getEvents().order();
                return this;
            },
            'validateRow':function(row, writeRow) {
                if (typeof row != "object") return this;
                let error = false;
                let errors = [];
                let values = {};
                let texts = {};
                row["__validated_texts"] = texts;
                row["__validated_values"] = values;
                for (let fieldName in row) {
                    if (!row.hasOwnProperty(fieldName)) continue;
                    let fieldError = false;
                    if (fieldName.indexOf("__") == 0) continue;
                    let fieldData = options.fields[fieldName] || {};
                    let td = $(row["__dom"]).find("td[fulltable-field-name='" + fieldName + "']");
                    let value = null;
                    let text = null;
                    if ($(td).find("input").length > 0) {
                        value = $(td).find("input").val();
                        text = value;
                    } else if ($(td).find("select").length > 0) {
                        value = $(td).find("select").val();
                    } else {
                        text = $(td).html();
                    }
                    // TODO: Here must be validation of input type: select, checkbox, if (fieldData.options == "boolean")
                    if (fieldData.options != null) {
                        let found = false;
                        for (let option in fieldData.options) {
                            if (!fieldData.options.hasOwnProperty(option)) continue;
                            option = fieldData.options[option];
                            if (option["value"] == value) {
                                text = option["title"];
                                found = true;
                                break;
                            } else {
                                if (text = "") text = null;
                                if (option["value"] == text) {
                                    value = option["value"];
                                    text = option["title"];
                                    found = true;
                                    break;
                                }
                            }
                        }
                        if (!found) {
                            value = null;
                        }
                    }
                    if (value == "") value = null;

                    // Validations:
                    if (value == null && fieldData.mandatory) {
                        fieldError = true;
                        if (fieldData.errors != null && fieldData.errors.mandatory != null) {
                            errors.push(fieldData.errors.mandatory);
                        }
                    }
                    if (value != null && fieldData.type != null) {
                        let type = null;
                        for (let typeEntry in types) {
                            if (!types.hasOwnProperty(typeEntry)) continue;
                            let typeNames = types[typeEntry];
                            if (typeNames.indexOf(fieldData.type) >= 0) {
                                type = typeEntry;
                                break;
                            }
                        }
                        switch (type) {
                            case "decimal":
                                if (isNaN(value)) {
                                    fieldError = true;
                                    if (fieldData.errors != null && fieldData.errors.type != null) {
                                        errors.push(fieldData.errors.type);
                                        value = null;
                                    }
                                    break;
                                }
                                value = Number(value);
                                break;
                            case "integer":
                                if (isNaN(value)) {
                                    fieldError = true;
                                    if (fieldData.errors != null && fieldData.errors.type != null) {
                                        errors.push(fieldData.errors.type);
                                        value = null;
                                    }
                                    break;
                                }
                                value = Number(value);
                                if (Math.floor(value) != value) {
                                    fieldError = true;
                                    if (fieldData.errors != null && fieldData.errors.type != null) {
                                        errors.push(fieldData.errors.type);
                                        value = null;
                                    }
                                    break;
                                }
                                break;
                            case "string":
                            default:

                                break;
                        }
                    }
                    if (value != null && typeof fieldData.validator == "function") {
                        if (!(fieldData.validator(value, row, table.getRows(), table) === true)) {
                            fieldError = true;
                            if (fieldData.errors != null && fieldData.errors.validator != null) {
                                errors.push(fieldData.errors.validator);
                                value = null;
                            }
                        }
                    }

                    if (value == null) text = "";
                    values[fieldName] = value;
                    texts[fieldName] = text;

                    if (writeRow == null) writeRow = false;
                    if (writeRow) {
                        for (let fieldName in values) {
                            if (!values.hasOwnProperty(fieldName)) continue;
                            if ($(td).find("input, select").length > 0) {
                                $(td).find("input, select").val(value);
                            } else {
                                $(td).empty();
                                $(td).html(text);
                            }
                        }
                    }
                    if (fieldError) {
                        $(td).find("input, select").addClass("invalid");
                        error = true;
                    }
                }
                if (error) {
                    if (typeof table.getEvents().error == "function") table.getEvents().error(errors);
                }
                return !error;
            },
            'addRow':function() {
                if (!options.editable) return this;
                if ($(table).data("fulltable-creating")) return this;
                $(table).data("fulltable-creating", true);
                let row = {};
                let row_index = table.getRows().length;
                table.getRows()[row_index] = row;
                row["__creating"] = true;
                row["__dom"] = $("<tr/>");
                row["__filtering"] = false;
                row["__invalidOptionRemoved"] = false;
                for (let fieldName in table.getKeys()) {
                    if (!table.getKeys().hasOwnProperty(fieldName)) continue;
                    fieldName = table.getKeys()[fieldName];
                    let td = $("<td/>", {
                        'fulltable-field-name': fieldName
                    });
                    $(row["__dom"]).append($(td));
                    row[fieldName] = "";
                }
                $(table).children("tbody").append($(row["__dom"]));
                addEditionControl(row, "body");
                addSelectionControl(row, "body");
                $(row["__dom"]).find("td.fulltable-selection-control input[type='checkbox']").prop("disabled", true);
                $(row["__dom"]).data("fulltable-editing", true);
                showRowForm(row);
                $(row["__dom"]).addClass("fulltable-creating");
                if (typeof table.getEvents().addRow == "function") table.getEvents().addRow(row);
                return this;
            },
            'editRow':function(row) {
                if (!options.editable) return this;
                if (typeof row != "object") return this;
                $(row["__dom"]).data("fulltable-editing", true);
                showRowForm(row);
                if (typeof table.getEvents().editRow == "function") table.getEvents().editRow(row);
                if (options.alwaysCreating === true) addRow(); // Here this invocation should not be needed, but it cannot cause problems because method idenpontency.
                return this;
            },
            'removeRow':function(row) {
                if (!options.editable) return this;
                if (typeof row != "object") return this;
                row["__removed"] = true;
                $(row["__dom"]).detach();
                for (let fieldName in row) {
                    if (!row.hasOwnProperty(fieldName)) continue;
                    if (fieldName.indexOf("__") == 0) continue;
                    let value = row[fieldName];
                    let td = $(row["__dom"]).find("td[fulltable-field-name='" + fieldName + "']");
                    $(td).empty();
                    let input = $("<input>", {
                        'type':"text",
                        'value':value
                    });
                    $(td).append($(input));
                }
                if (typeof table.getEvents().removeRow == "function") table.getEvents().removeRow(row);
                if (options.alwaysCreating === true) addRow();
                return this;
            },
            'saveRow':function(row) {
                if (!options.editable) return this;
                if (typeof row != "object") return this;
                if (!validateRow(row)) return this;
                $(row["__dom"]).removeClass("fulltable-editing");
                $(row["__dom"]).data("fulltable-editing", false);
                if (row["__creating"]) {
                    $(table).data("fulltable-creating", false);
                    $(row["__dom"]).removeClass("fulltable-creating");
                    $(row["__dom"]).find("td.fulltable-selection-control input[type='checkbox']").prop("disabled", false);
                    row["__creating"] = false;
                }
                for (let fieldName in row) {
                    if (!row.hasOwnProperty(fieldName)) continue;
                    if (fieldName.indexOf("__") == 0) continue;
                    let td = $(row["__dom"]).find("td[fulltable-field-name='" + fieldName + "']");
                    $(td).empty();
                    $(td).html(row["__validated_texts"][fieldName]);
                    row[fieldName] = row["__validated_values"][fieldName];
                }
                if (typeof table.getEvents().saveRow == "function") table.getEvents().saveRow(row);
                if (options.alwaysCreating === true) addRow();
                return this;
            },
            'discardRow': function(row) {
                if (!options.editable) return this;
                if (typeof row != "object") return this;
                $(row["__dom"]).data("fulltable-editing", false);
                $(row["__dom"]).removeClass("fulltable-editing");
                if (row["__creating"]) {
                    $(table).data("fulltable-creating", false);
                    row["__creating"] = false;
                    row["__removed"] = true;
                    $(row["__dom"]).detach();
                } else {
                    for (let fieldName in row) {
                        if (!row.hasOwnProperty(fieldName)) continue;
                        if (fieldName.indexOf("__") == 0) continue;
                        let value = row[fieldName];
                        let text = value;
                        if (text == null) text = "";
                        let fieldData = options.fields[fieldName] || {};
                        // TODO: Here must be validation of input type: select, checkbox, if (fieldData.options == "boolean")
                        if (fieldData.options != null) {
                            text = "";
                            for (let option in fieldData.options) {
                                if (!fieldData.options.hasOwnProperty(option)) continue;
                                option = fieldData.options[option];
                                if (option["value"] == value) {
                                    text = option["title"];
                                    break;
                                }
                            }
                        }
                        let td = $(row["__dom"]).find("td[fulltable-field-name='" + fieldName + "']");
                        $(td).empty();
                        $(td).html(text);
                    }
                }
                if (typeof table.getEvents().discardRow == "function") table.getEvents().discardRow(row);
                if (options.alwaysCreating === true) addRow();
                return this;
            },
            'checkRow': function(row) {
                if (row["__selected"] == null) row["__selected"] = false;
                row["__selected"] = !row["__selected"];
                if (typeof table.getEvents().checkRow == "function") table.getEvents().checkRow(row);
            },
            'getData':function(selected) {
                let result = [];
                for (let row in table.getRows()) {
                    if (!table.getRows().hasOwnProperty(row)) continue;
                    row = table.getRows()[row];
                    if (row["__selected"] == null) row["__selected"] = false;
                    if (selected === false && row["__selected"] == true) continue;
                    if (selected === true && row["__selected"] == false) continue;
                    let resultRow = {};
                    if (row["__creating"] === true) continue;
                    if (row["__removed"] === true || row["__invalidOptionRemoved"] === true) continue;
                    result.push(resultRow);
                    for (let fieldName in row) {
                        if (!row.hasOwnProperty(fieldName)) continue;
                        if (fieldName.indexOf("__") == 0) continue;
                        let value = row[fieldName];
                        resultRow[fieldName] = value;
                    }
                }
                if (typeof table.getEvents().getData == "function") table.getEvents().getData();
                return result;
            },
            'setData':function(data) {
                if (!Array.isArray(data)) {
                    return this;
                }
                let oldData = table.getRows().splice(0, table.getRows().length);
                let newData = data;
                for (let rowData in data) {
                    if (!data.hasOwnProperty(rowData)) continue;
                    rowData = data[rowData];
                    let row = drawRow(rowData, null);
                    if (!validateRow(row)) continue;
                    table.getRows().push(row);
                }
                drawBody();
                if (typeof table.getEvents().setData == "function") table.getEvents().setData(oldData, newData);
                return this;
            },
            'error': function() {
                return this;
            }
        };

        // DEPRECATED: Compatibility, uncomment if needed
        /*
        methods['create'] = methods['addRow'];
        methods['edit'] = methods['editRow'];
        methods['remove'] = methods['removeRow'];
        methods['save'] = methods['saveRow'];
        methods['discard'] = methods['discardRow'];
        methods['getValue'] = methods['getData'];
        */

        let defaults = {
            "editable":true,
            "filterable":true,
            "orderable":true,
            "selectable":false,
            "fields":{},
            "on":{
                "update":function() {

                }
            }
        };

        let options = $(table).data('options');

        let method = null;
        let methodArguments = null;

        if (typeof arguments[0] == "string") {
            if ($(table).data('fulltable') != true) return;
            if (options == null) return this;
            method = methods[arguments[0]];
            methodArguments = Array.prototype.slice.call(arguments, 1);
            if (typeof method != "function") return this;
            return method.apply(this, methodArguments);
        }

        if (options == null) {
            if (typeof arguments[0] == "object") {
                options = arguments[0];
                options = $.extend(true, defaults, options);
            } else {
                options = defaults;
            }
            $(table).data('options', options);
        }

        $(table).data('fulltable', true);
        $(table).addClass("fulltable");
        if (options.editable) {
            $(table).addClass("fulltable-editable");
        }

        getHeaderFromDom();
        drawHeader();
        getBodyFromDom();
        drawBody();
        if (options.alwaysCreating === true) addRow();
        filter();

        return this;
    };
}(jQuery));
