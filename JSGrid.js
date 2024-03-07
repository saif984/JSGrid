var ControlType = { "InputTextBox": 1, "ComboBox": 2, "AutoComplete": 3, "Calender": 4, "ColorPicker": 5, "CheckBox": 6, "Label": 7, "Hidden": 8, "RadioButtonList": 9, "CheckBoxList": 10, "Password": 11, "MultiLineTextBox": 12, "Tree": 13, "Button": 14, "Grid": 15, "Tabs": 16, "ButtonsList": 17, "Script": 18, "HiddenWithObject": 19 };
var _CheckedField = "CheckedStatus", _OperationField = "OperationType", _ElmIndexField = "ElmIndex", CurrentDataField, CurrentFilter, CurrentFilter1, FirstValue, CurrentCheckTemp, Grid, ColumnHeader, ColumnContent, ColumnSummary, ColumnExtraFooter, isdrag, x, nn6 = ElmById && !document.all;
var defaultOptions = {
    RowCount: 10, EnableAdd: true, EnableDelete: true, SelectRowOnClick: true,
    ShowSelectCheckBox: true, MultiSelect: true, CallOnUnSelect: true, ShowFixedRows: false, EnableFiltering: true, EnableQFilter: false,
    EnableExport: false, OnRowSelectEvent: undefined, OnNewRow: undefined, OnDataBound: undefined, Controls:[]
};
function JSGrid(GParams) {
    this.Grid = { ...defaultOptions, ...GParams };
    this.Grid.Controls = this.Grid.Controls.filter(obj => obj.ControlType !== ControlType.Hidden && obj.ControlType !== ControlType.HiddenWithObject && obj.Width !== 0);
    this.id = "obj" + this.Grid.id;
    let referencePage = ElmById(this.Grid.id).closest('#Page');
    if (referencePage != null) {
        this.pageId = referencePage.dataset.pageid;
        this.id = referencePage.dataset.pageid + '.' + this.id;
    }
    if (this.Grid.ShowSelectCheckBox) {
        this.Grid.Controls.unshift({ id: this.Grid.id + "RowStatus",
            LabelText: "",
            dataField: _CheckedField,
            Width: 22,
            ControlType: ControlType.CheckBox,
            MultiCheck: this.Grid.MultiSelect,
            Align: "Center",
            TabStop: false
        });
    }
    this.CurrentChecked = null;
    this._GridElement = [];
    this._OrignalGridElement = [];
    this.FilterCriteria = [];
    this.DeletedDocument = [];
    this.GenerateGrid();
    this._CurrentGridPage = 0;
    this.SetPager();
    this.NextElmIndex = 0;
    
    //if (GParams.data != null)
        this.DataBind(isNull(GParams.data,[]));
}
JSGrid.prototype.SetColumnsResizing = function () {
    var that = this,
        handel = $("#" + that.Grid.id + "_DiV .GridHeaderResizeHandle");
    $("#" + this.Grid.id + "_HeaderTR>td.GridHeaderColumn:not([data-colid='" + this.Grid.id + "RowStatus'],:hidden) .GridHeaderResizeBar")
        .bind("mousedown", function (event) {
            var left = event.pageX + ElmById(that.Grid.id + "_DiV").scrollLeft;// 8 is body padding, 1 for cell border
        var currentTD = $(this).parent().parent();
        handel.css("left", left + "px").data("currentTD", currentTD).trigger(event);
        ShowResizeHandle();
    }).bind("mouseup", HideResizeHandle);

    //handel.draggable({
    //    axis: "x", iframeFix: true, zIndex: 1000, containment: "parent", scroll: false,
    //    stop: function () {
    //        var currentTD = $(this).data("currentTD");
    //        var newWidth = handel.data("newWidth");
    //        currentTD.width(newWidth);
    //        var colIndex = currentTD.index();
    //        that.Grid.Controls[colIndex].Width = newWidth + "px";
    //        $("#" + that.Grid.id + '_ContentCols :eq(' + colIndex + ')').width(newWidth+1);
    //        $("#" + that.Grid.id + '_DiV>.GridFooterTable td:eq(' + colIndex + ')').width(newWidth);
    //        HideResizeHandle();
    //    },
    //    drag: function (e, ui) {
    //        var currentTD = handel.data("currentTD"),
    //         newPosition = ui.position,
    //         currentWidth = currentTD.width(),
    //         newWidth;
    //        if (dir == "ltr") {
    //            if (newPosition.left > ui.originalPosition.left) //minimize
    //                newWidth = currentWidth - (ui.originalPosition.left - newPosition.left);
    //            else
    //                newWidth = currentWidth + (newPosition.left - ui.originalPosition.left);
    //        }
    //        else {
    //            if (newPosition.left < ui.originalPosition.left) //minimize
    //                newWidth = currentWidth + (ui.originalPosition.left - newPosition.left);
    //            else
    //                newWidth = currentWidth - (newPosition.left - ui.originalPosition.left);
    //        }
    //        if (newWidth <= 60) {
    //            newPosition.left = ui.originalPosition.left - currentWidth + 60;
    //            newWidth = 60;
    //        }
    //        handel.data("newWidth", newWidth);
    //        return newPosition
    //    }
    //}).bind("mouseup", HideResizeHandle);
    function HideResizeHandle() {
        handel.hide();
    }
    function ShowResizeHandle() {
        handel.height(handel.parent().height()).show();
    }
}
JSGrid.prototype.SetColumnsOrdering = function () {
    var that = this;
    //$("#" + this.Grid.id + "_HeaderTR").sortable({
    //    containment: "parent",cancel: ".GridHeaderResizeBar",delay:200,forceHelperSize: true,scrollSensitivity: "1",axis: "x",opacity: 0.6,
    //    items: ">td.GridHeaderColumn:not([data-colid='" + this.Grid.id + "RowStatus'],:hidden)",
    //    placeholder: {
    //        element: function (item) {
    //            return $(document.createElement(item[0].nodeName))
    //            .addClass( item[0].className+ " ").width(item.width());
    //        },
    //        update: function (self, p) {}
    //    },
    //    helper: function (event, item) {
    //       return  item.clone().addClass("ui-state-hover");
    //    },
    //    update: function (event, ui) {
    //        var p = $(ui.item).parent(),
				//	td = $(">td.GridHeaderColumn", p),
    //                cmMap = {},
    //            newColumns = [];
    //        that.Grid.Controls.forEach(obj=> { cmMap[this.id] = obj; });
    //        $(td).each(function () {
    //            var id = $(this).attr("data-colID")
    //            newColumns.push(cmMap[id]);
    //        });
    //        that.Grid.Controls = newColumns;
    //        $("#tblCont" + that.Grid.id).replaceWith(that.GenerateContents());
    //        //that.tblGrid = ElmById("tbl" + that.Grid.id);
    //        that.tblContentGrid = ElmById("tblCont" + that.Grid.id);

    //        if (that.isSummaryExist())
    //            $("#" + that.Grid.id+ "_DiV>.GridFooterTable").replaceWith(that.GenerateSummary());

    //        var length = newColumns.length;

    //        for (var x = 0; x < length; x++) {
    //            $('input[id^="' + that.Grid.id + '_' + newColumns[x].id + '_"]').data('DataType', newColumns[x].DataType);
    //        }
    //        that.SetDDLColumns();   
    //        that.DataBind(that._GridElement);
    //        that.SetGridContentEvents();
    //    }
    //}).disableSelection();
}
JSGrid.prototype.SetGridContentEvents = function () {
    var GridObj = this;
    GridObj.tblContentGrid.addEventListener('click', event => {
        let target = event.target;
        if (target.tagName == "TBODY")
            return;
        let ColIndex;
        if (target.tagName == "td")
            ColIndex = target.cellIndex;
        else
            ColIndex = target.closest("td")?.cellIndex;
        let RowIndex = target.closest("tr")?.rowIndex;
        GridColumn = GridObj.Grid.Controls[ColIndex];
        if (!GridColumn) return;// last td empty 
        if (GridColumn.ControlType != ControlType.Button && (target.nodeName == "TD" || target.nodeName == "SPAN" || (GridColumn.ControlType == ControlType.CheckBox && GridColumn.dataField == _CheckedField))) {// || target.is(".GridContentlblTD>span")) {
            if (GridObj.Grid.SelectRowOnClick)
                GridObj.CheckItem(RowIndex);
        }
        else if (GridColumn.ControlType == ControlType.CheckBox || GridColumn.ControlType == ControlType.Button) {
            GridObj.ChangeValue(ColIndex, RowIndex);
        }
    });
    GridObj.tblContentGrid.addEventListener('dblclick', event => {
        let target = event.target;
        let ColIndex;
        if (target.tagName == "td")
            ColIndex = target.cellIndex;
        else
            ColIndex = target.closest("td").cellIndex;
        let RowIndex = target.closest("tr").rowIndex;
        GridColumn = GridObj.Grid.Controls[ColIndex];
        if (!GridColumn) return;// last td empty 
        if (target.nodeName == "TD" || target.nodeName == "SPAN") {
            if (GridObj.Grid.ondblClick) {
                Object.assign(event, { grid: GridObj, rowNo: RowIndex, columnIndex: ColIndex });
                handleEvent(GridObj.Grid.ondblClick, event);
                //window[GridObj.Grid.ondblClick](event);
            }
        } else if (GridObj.Grid.Controls[ColIndex].ondblclick && GridObj.Grid.Controls[ColIndex]["data-disable"] != "1") {
            event.controlID = GridObj.Grid.Controls[ColIndex].id;
            event.gridID = GridObj.id;
            event.rowNo = RowIndex;
            handleEvent(GridObj.Grid.Controls[ColIndex].ondblclick, event);
        }
    });
    GridObj.tblContentGrid.addEventListener('change', event => {
        let target = event.target;
        let ColIndex;
        if (target.tagName == "td")
            ColIndex = target.cellIndex;
        else
            ColIndex = target.closest("td").cellIndex;
        let RowIndex = target.closest("tr").rowIndex;
        GridColumn = GridObj.Grid.Controls[ColIndex];
        if (!GridColumn) return;// last td empty 
        if (GridColumn.ControlType == ControlType.InputTextBox || GridColumn.ControlType == ControlType.ComboBox || GridColumn.ControlType == ControlType.AutoComplete) {
            GridObj.ChangeValue(ColIndex, RowIndex, true);
        }
    });
    GridObj.tblContentGrid.addEventListener('keydown', event => {
        let target = event.target;
        let ColIndex;
        if (target.tagName == "td")
            ColIndex = target.cellIndex;
        else
            ColIndex = target.closest("td").cellIndex;
        let RowIndex = target.closest("tr").rowIndex;
        GridColumn = GridObj.Grid.Controls[ColIndex];
        if (!GridColumn) return;// last td empty 
        if (GridColumn.ControlType == ControlType.Label || GridColumn.ControlType == ControlType.InputTextBox || GridColumn.ControlType == ControlType.ComboBox || GridColumn.ControlType == ControlType.AutoComplete || GridColumn.ControlType == ControlType.CheckBox) {
            GridObj.CellKeyDown(ColIndex, RowIndex);
        }
    });
}
JSGrid.prototype.SetHeaderEvents = function () {
    var GridObj = this;
    document.querySelector(`#${this.Grid.id} .GridHeaderTable`).addEventListener('keyup', event => {
        let target = event.target;
        let ColIndex;
        if (target.tagName == "td")
            ColIndex = target.cellIndex;
        else
            ColIndex = target.closest("td").cellIndex;
        if (window.GridFilterTimeOut)
            clearTimeout(window.GridFilterTimeOut);
        window.GridFilterTimeOut = setTimeout(() => { GridObj.QFilter(ColIndex); }, 400);
    });
    document.querySelector(`#${this.Grid.id} .GridHeaderTable`).addEventListener('change', event => {
        let target = event.target;
        let ColIndex;
        if (target.tagName == "td")
            ColIndex = target.cellIndex;
        else
            ColIndex = target.closest("td").cellIndex;
        if (target.tagName == "select") {
            if (window.GridFilterTimeOut)
                clearTimeout(window.GridFilterTimeOut);
            window.GridFilterTimeOut = setTimeout(() => { GridObj.QFilter(ColIndex); }, 400);
        }
    });
    document.querySelector(`#${this.Grid.id} .GridHeaderTable`).addEventListener('click', event => {
        let target = event.target;
        let ColIndex;
        if (target.tagName == "td")
            ColIndex = target.cellIndex;
        else
            ColIndex = target.closest("td").cellIndex;
        if (target.tagName == "LABEL" || target.tagName == "IMG") {
            GridObj.SortDataByIndex(ColIndex);
        } else if (target.tagName == "INPUT" && target.type == "checkbox") {
            GridObj.CheckAll(target.checked, ColIndex);
        }
    });

    //$(".GridHeaderTable").delegate("td", "click change keyup mouseover", function (event) {

    //    var $obj = $(event.target),
    //        index = this.cellIndex;

    //    if (event.type == "click") {
    //        if ($obj.is("label") || $obj.is("img"))
    //            GridObj.SortDataByIndex(index);
    //        else if ($obj.is("input[type=checkbox]"))
    //            GridObj.CheckAll($obj[0].checked, index);
    //    }
    //    else if (event.type == "change") {
    //        if ($obj.is("select"))
    //            GridObj.QFilter(index);
    //    }
    //    else if (event.type == "keyup") {
    //        if ($obj.is("input[type=text]")) {
    //            //if (window.GridFilterTimeOut)
    //            //    clearTimeout(window.GridFilterTimeOut);
    //            window.GridFilterTimeOut = setTimeout(function () { GridObj.QFilter(index); }, 400);
    //            //  GridObj.QFilter(index);
    //        }
    //    }
    //    else if (event.type == "mouseover") {
    //        if (GridObj.ColumsOrdering !== false)
    //            GridObj.SetColumnsOrdering();
    //        if (GridObj.SortableResizing !== false)
    //            GridObj.SetColumnsResizing();
    //        $(".GridHeaderTable").undelegate("td", "mouseover");
    //    }

    //});
}
JSGrid.prototype.SetSuperHeader = function (Index, NoOfColumns, Title) {
    if (this.Grid.SuperHeader == null) {
        this.Grid.SuperHeader = new Array();
        this.Grid.SuperHeader[this.Grid.SuperHeader.length] = new Array();
    }
    this.Grid.SuperHeader[this.Grid.SuperHeader.length - 1][Index] = new Array();
    this.Grid.SuperHeader[this.Grid.SuperHeader.length - 1][Index][0] = NoOfColumns;
    this.Grid.SuperHeader[this.Grid.SuperHeader.length - 1][Index][1] = Title;
}
JSGrid.prototype.SetHeader = function (ColID, NewTitle) {
    var ColInd = this.GetIndex(ColID);
    this.Grid.Controls[ColInd].LabelText = NewTitle;
    ElmById("hdr" + this.Grid.id + "_" + ColID).innerText = NewTitle;
}
JSGrid.prototype.GenerateSummary = function () {
    var CellTDs = "",
        CellCols = "",
        Width,
        length= this.Grid.Controls.length;
    for (var x = 0; x < length; x++) {
        Width = this.Grid.Controls[x].Width;
        CellTDs += "<td id='" + this.Grid.id + '_' + this.Grid.Controls[x].id + "_footer' class='footerCell' style='width:" + Width + "px;"+(this.Grid.Controls[x].Visible == false ? " display:none; " : "") + "text-align:right;'>&nbsp;</td>";
    }
    return "<table class='GridFooterTable' cellpadding='0' cellspacing='0'><tr>" + CellTDs + "<td style='width:100%;'></td></tr></table>";
}
JSGrid.prototype.GenerateExtraFooter = function () {
    var ExtraFooter = "";
    var CellCols = "";
    var ToRowIndex = 1;
    var ExtraFooterFlag = false;
    for (var y = 0; y < ToRowIndex; y++) {

        ExtraFooter += "<tr>"
        for (var x = 0; x < this.Grid.Controls.length; x++) {
            if (this.Grid.Controls[x].ExtraFooter == null || this.Grid.Controls[x].ExtraFooter[y] == null) {
                if (y == 0)
                    CellCols += "<col style='height:15px; width:" + this.Grid.Controls[x].Width + "px;" + (this.Grid.Controls[x].Visible == false ? " display:none; " : "") + "' />";
                ExtraFooter += "<td></td>";
            }
            else {
                ExtraFooterFlag = true;
                if (this.Grid.Controls[x].ExtraFooter.length > ToRowIndex)
                    ToRowIndex = this.Grid.Controls[x].ExtraFooter.length;
                if (y == 0)
                    CellCols += "<col class='GridTotal' style='height:15px; width:" + this.Grid.Controls[x].Width + "px;" + (this.Grid.Controls[x].Visible == false ? " display:none; " : "") + "' />";
                ExtraFooter += "<td " + (this.Grid.Controls[x].ExtraFooter[y].DIR == null ? "" : "dir='" + this.Grid.Controls[x].ExtraFooter[y].DIR + "'") + ">";
                ExtraFooter += "<input style='width:100%; height:100%' " + (this.Grid.Controls[x].ExtraFooter[y].CTRLID == null ? "" : "id='" + this.Grid.Controls[x].ExtraFooter[y].id + "' ") + (this.Grid.Controls[x].ExtraFooter[y].AddProperty == null ? "" : this.Grid.Controls[x].ExtraFooter[y].AddProperty) + (this.Grid.Controls[x].ExtraFooter[y].ControlType != ControlType.InputTextBox ? " readonly='true' tabindex='-1'" : "") + " value='" + (this.Grid.Controls[x].ExtraFooter[y].Text == null ? "" : this.Grid.Controls[x].ExtraFooter[y].Text) + "' " + (this.Grid.Controls[x].ExtraFooter[y].DIR == null ? "" : "dir='" + this.Grid.Controls[x].ExtraFooter[y].DIR) + "' class='GridTotal' type='text' />";
                ExtraFooter += "</td>";
            }
        }
        ExtraFooter += "</tr>";
    }
    if (ExtraFooterFlag)
        return `<tr><td><table cellpadding='0' class="summary" cellspacing='0' style='table-layout:fixed'><colgroup id='${this.Grid.id}_ExtraFooter'>${CellCols}</colgroup>${ExtraFooter}</table></td></tr>`;
    else
        return ""
}
JSGrid.prototype.GenerateHeader = function () {
    var CellTDs = "";
    var CellQFilter = "";
    var length = this.Grid.Controls.length;
    for (var x = 0; x < length; x++) {
        if (this.Grid.Controls[x].Width == null) this.Grid.Controls[x].Width = "100px";
        if (this.Grid.Controls[x].ControlType == null) this.Grid.Controls[x].ControlType = ControlType.Label;
        CellTDs += "<td data-colID='" + (this.Grid.Controls[x].id) + "' class='GridHeaderColumn' style='" + (this.Grid.Controls[x].Visible == false ? " display:none;" : "") + "width:" + this.Grid.Controls[x].Width + "px;' ><div>"
        if (this.Grid.Controls[x].ControlType == ControlType.CheckBox && this.Grid.Controls[x].MultiCheck != false)
            CellTDs += "<input id='" + this.Grid.id + '_' + this.Grid.Controls[x].id + "_All' type='checkbox' />";
        if (((this.Grid.Controls[x].ControlType == ControlType.CheckBox && !this.Grid.Controls[x].DataType && this.Grid.Controls[x].LabelText != null) || !(this.Grid.Controls[x].ControlType == ControlType.CheckBox && !this.Grid.Controls[x].DataType))) {
            CellTDs += "<label id='hdr" + this.Grid.id + '_' + this.Grid.Controls[x].id + "' style='cursor:hand; ' >" + this.Grid.Controls[x].LabelText + "</label><img src='' style='display:none;' title='Sort' />";
            if (this.Grid.Controls[x].QFilterType == ControlType.ComboBox)
                CellQFilter += "<td style='overflow:hidden;'><select id='QF" + this.Grid.id + '_' + this.Grid.Controls[x].id + "' class='GridDropDownlist textBoxFilter' style='width:100%'></select></td>";
            else {
                if (this.Grid.Controls[x].ControlType != ControlType.CheckBox && this.Grid.Controls[x].ControlType != ControlType.ButtonsList)
                    CellQFilter += "<td class='textBoxFilter' style='overflow:hidden;'><input id='QF" + this.Grid.id + '_' + this.Grid.Controls[x].id + "' type='text' style='width:100%' /><i class='fa-solid fa-filter'></i></td>";
                else
                    CellQFilter += "<td style='overflow:hidden;'></td>";
            }
                
        }
        else {
            CellQFilter += "<td></td>";
        }
        CellTDs += "<span class='GridHeaderResizeBar'></span></div></td>";

        //CellCols += "<col id='hdrCol" + this.Grid.id + '_' + this.Grid.Controls[x].id + "1'  style='height:20px;text-align:center;vertical-align:middle;width:2px;" + (this.Grid.Controls[x].Visible == false ? " display:none; " : "") + "' />";
        //CellTDs += "<td style='padding:0 0 0 0; border-width:0; margin:0 0 0 0;' ><img class='GridHeaderResizeBar' alt='' onmouseup='isdrag=false;' onmousedown='" + this.id + ".ResizeColumn(" + x + ")' src='" + RootPre + "StaticTheme/Images/Splitter.PNG' /></td>";

    }

    var HeaderTR = "<tr id='" + this.Grid.id + "_HeaderTR' >" + CellTDs + "<td style='width:100%'></td></tr>";
    var QFilterTR = "<tr id='" + this.Grid.id + "_QFilterTR' " + (this.Grid.EnableQFilter == true ? "" : "style='display:none;'") + ">" + CellQFilter + "<td style='width:100%'></tr>";
    var SuperTRs = "";
    var CurrColumnIndex = 0;
    
    var length = this.Grid.SuperHeader ? this.Grid.SuperHeader.length : 0;
    for (var SuperID = 0; SuperID < length; SuperID++) {
        SuperTRs += "<tr>";
        var ID = 0;
        var length2=this.Grid.SuperHeader[SuperID].length;
        for (; ID < length2; ID++) {
            if (this.Grid.SuperHeader[SuperID][ID] == null) {
                SuperTRs += "<td></td>";
                CurrColumnIndex++;
            }
            else {
                SuperTRs += "<td style='vertical-align:middle; text-align: center;' colspan='" + ((this.Grid.SuperHeader[SuperID][ID][0] * 2) - 1) + "' >" + this.Grid.SuperHeader[SuperID][ID][1] + "</td>";
                CurrColumnIndex = CurrColumnIndex + this.Grid.SuperHeader[SuperID][ID][0];
                //                ID += this.Grid.SuperHeader[SuperID][ID][0] - 1;
            }
            SuperTRs += "<td style='padding:0 0 0 0; border-width:0; margin:0 0 0 0;' ><img class='GridHeaderResizeBar' alt='' onmouseup='isdrag=false;' onmousedown='" + this.id + ".ResizeColumn(" + (CurrColumnIndex - 1) + ")' src='" + RootPre + "StaticTheme/Images/Splitter.PNG'></td>";
            //            SuperTRs += "<td><img class='GridHeaderResizeBar' alt='' onmouseup='isdrag=false;' onmousedown='" + this.id + ".ResizeColumn(" + ID + ")' src='../../images/Splitter.PNG'></td>";
        }
        SuperTRs += "</tr>";
    }
    return "<tr><td><table id='tblHeader" + this.Grid.id + "' cellspacing='0' cellpadding='0' class='GridHeaderTable'>" + SuperTRs + HeaderTR + QFilterTR + "</table></td></tr>";
    //return "<tr><td><table id='tblHeader" + this.Grid.id + "' cellpadding='0' cellspacing='0' style='table-layout:fixed; width:100%;'><colgroup id='" + this.Grid.id + "_HeaderCols'>" + CellCols + "</colgroup>" + SuperTRs + HeaderTR + QFilterTR + "</table></td></tr>";
}
JSGrid.prototype.ChangeDataType = function (ColID, NewDataType) {
    var ColIND = this.GetIndex(ColID);
    this.Grid.Controls[ColIND].DataType = NewDataType;
    var x = 0;
    for (; x < this.Grid.RowCount; x++) {
        this.GetCTRLByIndex(ColIND, x).DataType = NewDataType;
    }
}
JSGrid.prototype.GenerateCells = function () {
    var CellTemplate = "";
    var tdDetail;
    var x = 0;
    var length = this.Grid.Controls.length;
    for (; x < length; x++) {
        tdDetail = "";
        let ctrl = this.Grid.Controls[x];
        if (ctrl.AddProperty == null) ctrl.AddProperty = "";
        for (let option in ctrl) {
            if (option.indexOf("data-") == 0)
                ctrl.AddProperty += " " + option + "=\"" + ctrl[option] + "\"";
        }

        if (this.Grid.Controls[x].dir != null) {
            tdDetail += ` dir='${this.Grid.Controls[x].dir}'`;
            this.Grid.Controls[x].AddProperty += ` dir='${this.Grid.Controls[x].dir}'`;
        }
        if (this.Grid.Controls[x].ControlType == ControlType.InputTextBox) {
            var Validation = "";

            if (this.Grid.Controls[x].min)
                Validation += " min=" + this.Grid.Controls[x].min;
            if (this.Grid.Controls[x].max)
                Validation += " max=" + this.Grid.Controls[x].max;
            if (this.Grid.Controls[x].maxlength)
                Validation += " maxlengths=" + this.Grid.Controls[x].maxlength;
            if (this.Grid.Controls[x].step)
                Validation += " step=" + this.Grid.Controls[x].step;

            Validation += " type=" + isNull(this.Grid.Controls[x].type, 'text');

            CellTemplate += "<td class='GridContenttxtTD' " + tdDetail + "><input id='" + this.Grid.id + '_' + this.Grid.Controls[x].id + "_" + "~RowNo~' class='GridTextBox " + (this.Grid.Controls[x].DataType && this.Grid.Controls[x].DataType.toLowerCase() == "date" ? "Calendar'" : (this.Grid.Controls[x].DataType && this.Grid.Controls[x].DataType.toLowerCase() == "datetime" ? "CalendarWTime'" : "'")) + Validation + ' ' + this.Grid.Controls[x].AddProperty + " style='width:100%;height:100%' " + tdDetail + "/></td>";
        }
        else if (this.Grid.Controls[x].ControlType == ControlType.AutoComplete) {
            CellTemplate += "<td class='GridContenttxtTD' " + tdDetail + "><input id='" + this.Grid.id + '_' + this.Grid.Controls[x].id + "_" + "~RowNo~' type='text' class='GridTextBox search-code float' " + this.Grid.Controls[x].AddProperty + " style='height:100%' " + tdDetail + "/><input class=\"GridTextBox search-description float\" tabindex=\"-1\" readonly=\"readonly\" type=\"text\" " + this.Grid.Controls[x].AddProperty + " /></td>";
        }
        else if (this.Grid.Controls[x].ControlType == ControlType.Label)
            CellTemplate += "<td class='GridContentlblTD' " + tdDetail + "><span id='" + this.Grid.id + '_' + this.Grid.Controls[x].id + "_" + "~RowNo~' class='GridTextBox' " + this.Grid.Controls[x].AddProperty + " style='width:100%;height:18px;' " + tdDetail + "></span></td>";
        else if (this.Grid.Controls[x].ControlType == ControlType.ComboBox)
            CellTemplate += "<td " + tdDetail + "><select id='" + this.Grid.id + '_' + this.Grid.Controls[x].id + "_" + "~RowNo~' class='GridDropDownlist' " + this.Grid.Controls[x].AddProperty + " style='width:100%;height:100%'></select></td>";
        else if (this.Grid.Controls[x].ControlType == ControlType.CheckBox)
            CellTemplate += "<td class='GridContentcbxTD'" + tdDetail + "><input id='" + this.Grid.id + '_' + this.Grid.Controls[x].id + "_" + "~RowNo~' type='checkbox' " + this.Grid.Controls[x].AddProperty + (this.Grid.Controls[x].dataField == "CheckedStatus" ? "tabindex='-1'" : "") + " /></td>";
        else if (this.Grid.Controls[x].ControlType == ControlType.Button)
            CellTemplate += "<td class='GridContentcbxTD'" + tdDetail + " ><span id='" + this.Grid.id + '_' + this.Grid.Controls[x].id + "_" + "~RowNo~' style='width:90%;cursor:hand;' " + this.Grid.Controls[x].AddProperty + " /></td>";
        else if (this.Grid.Controls[x].ControlType == ControlType.ButtonsList)
            CellTemplate += `<td ${tdDetail}><div class="ButtonList"><label id='${this.Grid.id}_${this.Grid.Controls[x].id}_~RowNo~' onclick="return ${this.id}.ToggleButtonList(${x}, ~RowNo~);" ${this.Grid.Controls[x].AddProperty}>⋮</label><div id='${this.Grid.id}_${this.Grid.Controls[x].id}_bl_~RowNo~'></div></td>`;
        else if (this.Grid.Controls[x].ControlType == ControlType.CheckBoxList)
            CellTemplate += "<td " + tdDetail + "><select id='" + this.Grid.id + '_' + this.Grid.Controls[x].id + "_" + "~RowNo~' class='GridDropDownlist' " + this.Grid.Controls[x].AddProperty + " style='width:100%;height:100%'></select></td>";
        else if (this.Grid.Controls[x].ControlType == "tmp")
            CellTemplate += "<td class='GridContentcbxTD'" + tdDetail + " ><div id='" + this.Grid.id + '_' + this.Grid.Controls[x].id + "_" + "~RowNo~'></div>";
    }
    return CellTemplate + "<td style='width:100%;'></td>";
}
JSGrid.prototype.ToggleButtonList = function (colind, RowNo) {
    let ctrl = ElmById(`${this.Grid.id}_${this.Grid.Controls[colind].id}_bl_${RowNo}`);
    let opened = ctrl.classList.contains('buttonListOpened');
    Array.from(document.getElementsByClassName('buttonListOpened')).forEach(ctrl => ctrl.classList.remove('buttonListOpened'));
    if (!opened) {
        let html = "<ul>";
        window[this.pageId].GetActions(this.GetValue('SystemStateID', RowNo), null, true).forEach(action => {
            html += `<li><a href=\"#\" onclick=\"return handleEvent('${action.Action}',{elements:[${this.id}.GetElement(${RowNo})]})\"><i class="${action.icon}"></i> ${action.ActionName}</a></li>`;
        })
        html += "</ul>";
        ctrl.innerHTML = html;
        ctrl.classList.add('buttonListOpened');
    }
    event.preventDefault();
    event.stopPropagation()
    return false;
}
JSGrid.prototype.GenerateContents = function () {
    var RowHTML = this.GenerateCells();

    var ContentHTML = "<table id='tblCont" + this.Grid.id + "' class='GridContentTable' cellpadding='0' cellspacing='0' style='margin:0 0 0 0; table-layout:fixed !important; width:100%;' >";
    ContentHTML += "<colgroup id ='" + this.Grid.id + "_ContentCols' >";
    for (var x = 0; x < this.Grid.Controls.length; x++) {
        var Width;
        //        if (this.Grid.Controls[x].ControlType == ControlType.InputTextBox)
        //            Width = this.Grid.Controls[x].Width + 1;
        //        else
        Width = this.Grid.Controls[x].Width;
        ContentHTML += "<col id='ContCol" + this.Grid.id + '_' + this.Grid.Controls[x].id + "' style='width:" + Width + "px;" + (this.Grid.Controls[x].Visible == false ? " display:none; " : "") + "' />";
    }
    ContentHTML += "</colgroup>";

    for (var x = 0; x < this.Grid.RowCount; x++) {
        ContentHTML += "<tr  style='cursor:pointer;' >" + RowHTML.replace(/~RowNo~/g, x) + "</tr>";
    }
    return ContentHTML + "</table>";
}
JSGrid.prototype.ChangeStyle = function (i) {
    var ElmIndex = (this._CurrentGridPage * this.Grid.RowCount);
    if (ElmIndex + i < this._GridElement.length && isNull(this._GridElement[ElmIndex + i][_CheckedField], false))
        this.tblContentGrid.rows[i].className = 'GridSelectedRow';
    else
        this.tblContentGrid.rows[i].className = 'GridDefaultRow'
}
JSGrid.prototype.GenerateGrid = function () {
    if (ElmById(this.Grid.id) == null) alert("JSGrid Error: No Div with ID '" + this.Grid.id + "' Found.");
    var Width = this.Grid.Controls.length + 1;
    var x = 0;
    var length = this.Grid.Controls.length;
    for ( ; x < length; x++)
        Width += isNull(this.Grid.Controls[x].Width, 0);
    var GridHTML = [];
    //GridHTML.push("<div class=''><table cellpadding='0' cellspacing='0' style='width:100%;' ><tr><td><div id='" + this.Grid.id + "_DiV' class='GridDiv' style='overflow-x:auto; width: " + ElmById(this.Grid.id).style.width + "; height: " + ElmById(this.Grid.id).style.height + "'><div class='GridHeaderResizeHandle' style='display:none;'></div><table id='tbl" + this.Grid.id + "' cellpadding='0' cellspacing='0' style='margin:0 0 0 0; table-layout:fixed; width:100%'>");
    GridHTML.push("<div class='JSGrid'><div id='" + this.Grid.id + "_DiV' class='GridDiv' style='width: " + ElmById(this.Grid.id).style.width + "; height: " + ElmById(this.Grid.id).style.height + "; '><div class='GridHeaderResizeHandle' style='display:none;'></div>");
    GridHTML.push(this.GenerateHeader());
    GridHTML.push(this.GenerateContents());
    if (this.isSummaryExist())
        GridHTML.push(this.GenerateSummary());
    GridHTML.push(this.GenerateExtraFooter());
    GridHTML.push("</div>");
    GridHTML.push(this.GeneratePager());
    GridHTML.push("</div>");
    ElmById(this.Grid.id).innerHTML = GridHTML.join('');
    /*$*/("#"+this.Grid.id)[0].innerHTML= GridHTML.join('');
    //$('.Calendar').datepicker({ beforeShow: function (input, inst) { if (!input.readOnly && !input.disabled) $(input).datepicker('enable'); else { $(input).datepicker('disable'); setTimeout(function () { $(input).datepicker('hide'); }, 1); } }, dateFormat: 'dd/mm/yy', changeMonth: true, changeYear: true });
    //$('.CalendarWTime').datetimepicker({ beforeShow: function (input, inst) { if (!input.readOnly && !input.disabled) $(input).datepicker('enable'); else { $(input).datepicker('disable'); setTimeout(function () { $(input).datepicker('hide'); }, 1); } }, dateFormat: 'dd/mm/yy', changeMonth: true, changeYear: true });
    x = 0;
    //for (; x < length; x++) {
    //    $('input[id^="' + this.Grid.id + '_' + this.Grid.Controls[x].id + '_"]').data('DataType', this.Grid.Controls[x].DataType);
    //}
    //ElmById(this.Grid.id).style.width = "";
    if (ElmById(this.Grid.id).OriginalHeight == null)
        ElmById(this.Grid.id).OriginalHeight = ElmById(this.Grid.id).style.height;
    ElmById(this.Grid.id).style.height = "";

    this.tblGrid = ElmById("tbl" + this.Grid.id);
    this.tblContentGrid = ElmById("tblCont" + this.Grid.id);
    this._PagerCell = ElmById("Pager_" + this.Grid.id);
    this.RowCount = ElmById("PagerRowCount_" + this.Grid.id);
    this.SetDDLColumns();
    this.SetHeaderEvents();
    this.SetGridContentEvents();
}
JSGrid.prototype.isSummaryExist = function() {
    return this.Grid.ShowSummary || this.Grid.Controls.some(ctrl => ctrl.FooterType != undefined);
}
JSGrid.prototype.GeneratePager = function () {
    var PagerHTML = '';
    PagerHTML += '<div anchor="Grid_ExtraFooter" id=pager class="GridPager" ' + (this.Grid.ShowPager == false ? ' style="display:none;" ' : '') + '><div><table style="width: 100%; table-layout: fixed;" border="0" cellspacing="0" cellpadding="0"><tbody><tr>';
    PagerHTML += '<td id="pager_left" class="float">' + this.GeneratePagerLeft() + '</td>';
    PagerHTML += '<td style="width: 242px; WHITE-SPACE: pre" align=middle>' + this.GeneratePagerCenter() + '</td>'
    PagerHTML += '<td class="floatInverse">' + this.GeneratePagerRight() + '</td></tr></tbody></table></div></div>';
    return PagerHTML;
}
JSGrid.prototype.GeneratePagerLeft = function () {
    return '<div class="GridPagerButton" onclick="' + this.id + '.AddNewRow();" ' + (this.Grid.EnableAdd == false ? 'style="display:none"' : '') + ' title="' + getMessage("Add Record") + '"><i class="fas fa-plus"></i></div>'
        + '<div class="GridPagerButton" onclick="' + this.id + '.DeleteSelectedRows();" ' + (this.Grid.EnableDelete == false ? 'style="display:none"' : '') + ' title="' + getMessage("Delete Record") + '"><i class="fas fa-trash"></i></div>'
        //+ '<td class="GridPagerButton" onclick="' + this.id + '.FilterData();" ' + (this.Grid.EnableFiltering == false ? 'style="display:none"' : '') + ' title="' + getMessage("Filter records") + '"><div><i class="fas fa-filter"></i></div></td>'
        //+ '<td class="GridPagerButton" onclick="' + this.id + '.DeleteFilter();"  title="' + getMessage("Clear Filter") + '"><div><i class="fas fa-sync-alt"></i></div></td>'
        + '<td class="GridPagerButton" onclick="' + this.id + '.ShowHideQFilter();"  title="' + getMessage("Show/Hide Quick Filter") + '"><div><i class="fas fa-filter"></i></div></td>'
        + '<td class="GridPagerButton" onclick="' + this.id + '.ExportData();" ' + (this.Grid.EnableExport == true ? '' : 'style="display:none"') + ' title="' + getMessage("Export Data") + '"><div><i class="fas fa-file-export"></i></div></td>'
}
JSGrid.prototype.GeneratePagerCenter = function () {
    var HTML = '';
    HTML += '<table style="table-layout: auto" border="0" cellspacing="0" cellpadding="0"><tbody><tr>';
    HTML += '<td id="' + this.Grid.id + '_FirstPage" class="GridPagerButton ui-state-disabled" onclick="' + this.id + '.ChangePageIndex(0);"><i class="' + (document.dir == 'rtl' ? 'fas fa-fast-forward' : 'fas fa-fast-backward') + '"></i></td>';
    HTML += '<td id="' + this.Grid.id + '_PrevPage" style="cursor: default" class="GridPagerButton ui-state-disabled" onclick="' + this.id + '.ChangePageIndex(' + this.id + '._CurrentGridPage - 1);" ><i class="' + (document.dir == 'rtl' ? 'fas fa-step-forward' : 'fas fa-step-backward') + '"></i></td>';
    if (document.dir == 'rtl')
        HTML += '<td>صفحه <input id="' + this.Grid.id + '_CurrentPage" value="1" onblur="' + this.id + '.ChangePageIndex(this.value - 1);" maxLength="7" size="2" type="text" /> من <span id="' + this.Grid.id + '_PageCount"></span></td>';
    else
        HTML += '<td>Page <input id="' + this.Grid.id + '_CurrentPage" value="1" onblur="' + this.id + '.ChangePageIndex(this.value - 1);" maxLength="7" size="2" type="text" /> of <span id="' + this.Grid.id + '_PageCount"></span></td>';
    HTML += '<td id="' + this.Grid.id + '_NextPage" class="GridPagerButton" onclick="' + this.id + '.ChangePageIndex(' + this.id + '._CurrentGridPage + 1);" ><i class="' + (document.dir == 'rtl' ? 'fas fa-step-backward' : 'fas fa-step-forward') + '"></i></td>';
    HTML += '<td id="' + this.Grid.id + '_LastPage" style="CURSOR: default" class="GridPagerButton" onclick="' + this.id + '.ChangePageIndex(' + this.id + '.GetPageCount() - 1);"><i class="' + (document.dir == 'rtl' ? 'fas fa-fast-backward' : 'fas fa-fast-forward') + '"></i></td>';
    HTML += '</tr></tbody></table>';
    return HTML;
}
JSGrid.prototype.GeneratePagerRight = function () {
    return '<div id="' + this.Grid.id + '_PageInfo" class="floatInverse"></div>';
}
JSGrid.prototype.AttachEvent = function (ColID, Event, FunctionName) {
    var x = 0;
    for (; x < this.Grid.RowCount; x++) {
        AddEventToControl(ElmById(this.Grid.Controls[_ColIndx].id + "_" + x), Event, FunctionName.replace(/~RowNo~/g, x));
    }
}
JSGrid.prototype.GetColumn = function (ColID){
    return this.Grid.Controls[this.GetIndex(ColID)];
}
JSGrid.prototype.GetIndex = function (ColID) {
    return this.Grid.Controls.findIndex(ctrl => ctrl.id == ColID)
}
JSGrid.prototype.SetNullValue = function (ColID, Value) {
    this.Grid.Controls[ColID][10] = Value;
}
JSGrid.prototype.CheckItem = function (GridIndex, Currentvalue, CheckBox) {
    if (!this.Grid.SelectRowOnClick || !CheckBox) {
        var ElmIndex = this.GetElmIndex() + GridIndex;
        return this.CheckItemByElmIndex(ElmIndex, Currentvalue);
    }
}
JSGrid.prototype.CheckItemByElmIndex = function (ElmIndex, Currentvalue) {
    var GridIndex = ElmIndex - this.GetElmIndex();
    if (ElmIndex < this._GridElement.length) {
        if (Currentvalue == null)
            Currentvalue = !(isNull(this._GridElement[ElmIndex][_CheckedField], false) != 0);
        if (this.Grid.OnRowSelectEvent && (Currentvalue || this.Grid.CallOnUnSelect)) {
            let currentevent = { grid: this, element: this._GridElement[ElmIndex], rowNo: ElmIndex, select: Currentvalue };
            if (handleEvent(this.Grid.OnRowSelectEvent, currentevent) == false)
                ElmById(this.Grid.id + "_" + this.Grid.Controls[0].id + "_" + GridIndex).checked = false;
        }
        if (!this.Grid.MultiSelect && Currentvalue) {
            this.ClearSelected();
            this.CurrentChecked = ElmIndex;
        }
        this._GridElement[ElmIndex][_CheckedField] = FromBoolean(Currentvalue);
        if (GridIndex >= 0) {
            ElmById(this.Grid.id + "_" + this.Grid.Controls[0].id + "_" + GridIndex).checked = Currentvalue;
            this.ChangeStyle(GridIndex);
        }

        if (!!this.Grid.Controls[0].AfterCheck)
            this.Grid.Controls[0].AfterCheck(ElmIndex);
        return true;
    }
    return false;
}
JSGrid.prototype.ClearSelected = function () {
    if (this.CurrentChecked != null) {
        this._GridElement[this.CurrentChecked][_CheckedField] = false;
        if (parseInt(this.CurrentChecked / this.Grid.RowCount) == this._CurrentGridPage) {
            ElmById(this.Grid.id + "_" + this.Grid.Controls[0].id + "_" + (this.CurrentChecked - (parseInt(this.CurrentChecked / this.Grid.RowCount) * this.Grid.RowCount))).checked = false;
            this.ChangeStyle(this.CurrentChecked - (parseInt(this.CurrentChecked / this.Grid.RowCount) * this.Grid.RowCount));
        }
    }
}
JSGrid.prototype.GetCTRLValue = function (ColID, RowNo) {
    return this.GetCTRLValueByIndex(this.GetIndex(ColID), RowNo);
}
JSGrid.prototype.GetCTRLValueByIndex = function (ColInd, RowInd) {
    if (this.Grid.Controls[ColInd].ControlType == ControlType.InputTextBox || this.Grid.Controls[ColInd].ControlType == ControlType.ComboBox) {
        return ElmById(this.Grid.id + '_' + this.Grid.Controls[ColInd].id + "_" + RowInd).value;
    }
    else if (this.Grid.Controls[ColInd].ControlType == ControlType.Label || this.Grid.Controls[ColInd].ControlType == ControlType.Button) {
        return ElmById(this.Grid.id + '_' + this.Grid.Controls[ColInd].id + "_" + RowInd).innerText;
    }
    else if (this.Grid.Controls[ColInd].ControlType == ControlType.CheckBox || this.Grid.Controls[ColInd].ControlType == ControlType.CheckBox) {
        return ElmById(this.Grid.id + '_' + this.Grid.Controls[ColInd].id + "_" + RowInd).checked;
    }
    else if (this.Grid.Controls[ColInd].ControlType == ControlType.AutoComplete) {
        return ElmById(this.Grid.id + '_' + this.Grid.Controls[ColInd].id + "_" + RowInd).value;
    }
}
JSGrid.prototype.SetCTRLValue = function (ColID, RowNo, Value) {
    this.SetCTRLValueByIndex(this.GetIndex(ColID), RowNo, Value);
}
JSGrid.prototype.SetCTRLValueByIndex = function (ColInd, RowInd, Value) {
    if (this.Grid.Controls[ColInd].ControlType == ControlType.InputTextBox || this.Grid.Controls[ColInd].ControlType == ControlType.AutoComplete || this.Grid.Controls[ColInd].ControlType == ControlType.ComboBox) {
        ElmById(this.Grid.id + '_' + this.Grid.Controls[ColInd].id + "_" + RowInd).value = Value;
    }
    else if (this.Grid.Controls[ColInd].ControlType == ControlType.Label || this.Grid.Controls[ColInd].ControlType == ControlType.Button) {
        ElmById(this.Grid.id + '_' + this.Grid.Controls[ColInd].id + "_" + RowInd).innerText = Value;
    }
    else if (this.Grid.Controls[ColInd].ControlType == ControlType.CheckBox || this.Grid.Controls[ColInd].ControlType == ControlType.CheckBox) {
        ElmById(this.Grid.id + '_' + this.Grid.Controls[ColInd].id + "_" + RowInd).checked = Value;
    }
}
JSGrid.prototype.ChangeValue = function (ColInd, RowInd, CreateIfNotExist, CallChangeFunction) {
    var FirstChanging = false;
    if (this.Grid.ChangingValue != true) {
        this.Grid.ChangingValue = true;
        FirstChanging = true;
    }

    ColInd = parseInt(ColInd, 10);
    RowInd = parseInt(RowInd, 10);
    var x = this.GetElmIndex();
    var ElmIndex = (this._ElementOrder != null) ? this._ElementOrder[x] : x;
    if (this._GridElement.length > ElmIndex + RowInd || (this.Grid.Controls[ColInd].NewRow != false && this._GridElement.length == ElmIndex + RowInd)) {
        let currentevent = { id: this.Grid.Controls[ColInd].id, grid : this, rowNo: RowInd, columnIndex: ColInd, control: ElmById(this.Grid.id + '_' + this.Grid.Controls[ColInd].id + "_" + RowInd) };
        if (!this.DataBindingOpertion && CallChangeFunction != false && this.Grid.Controls[ColInd].onchange != null && handleEvent(this.Grid.Controls[ColInd].onchange, currentevent) == false) {
            if (this.Grid.Controls[ColInd].ControlType != ControlType.Button)
            if (this._GridElement.length > RowInd + x)
                this.SetCTRLValueByIndex(ColInd, RowInd, isNull(this._GridElement[RowInd + x][this.Grid.Controls[ColInd].dataField], this.getNullValue(ColInd)));
            else
                this.SetCTRLValueByIndex(ColInd, RowInd, "");
            this.Grid.ChangingValue = false;
            return false;
        }
        if (this.Grid.Controls[ColInd].CallOnChange != null && this.Grid.Controls[ColInd].CallOnChange(RowInd) == false) {
            if (this._GridElement.length > RowInd + x)
                this.SetCTRLValueByIndex(ColInd, RowInd, isNull(this._GridElement[RowInd + x][this.Grid.Controls[ColInd].dataField], this.getNullValue(ColInd)));
            else
                this.SetCTRLValueByIndex(ColInd, RowInd, "");
            this.Grid.ChangingValue = false;
            return false;
        }
    }

    var NewValue;
    if (this.Grid.Controls[ColInd].ControlType == ControlType.ComboBox) {
        if (ElmById(this.Grid.id + '_' + this.Grid.Controls[ColInd].id + "_" + RowInd).value == '')
            NewValue = null;
        else
            NewValue = ElmById(this.Grid.id + '_' + this.Grid.Controls[ColInd].id + "_" + RowInd).value;
    }
    else if (this.Grid.Controls[ColInd].ControlType == ControlType.InputTextBox) {
        let ctrlinput = ElmById(this.Grid.id + '_' + this.Grid.Controls[ColInd].id + "_" + RowInd)
        setFixed(ctrlinput);
        if (ctrlinput.type == "date")
            NewValue = ctrlinput.valueAsDate;
        else
            NewValue = ctrlinput.value;
    }
    else if (this.Grid.Controls[ColInd].ControlType == ControlType.Label || this.Grid.Controls[ColInd].ControlType == ControlType.Button) {
        NewValue = ElmById(this.Grid.id + '_' + this.Grid.Controls[ColInd].id + "_" + RowInd).innerText;
    }
    else if (this.Grid.Controls[ColInd].ControlType == ControlType.CheckBox || this.Grid.Controls[ColInd].ControlType == ControlType.CheckBox) {
        NewValue = FromBoolean(ElmById(this.Grid.id + '_' + this.Grid.Controls[ColInd].id + "_" + RowInd).checked);
        if (this.Grid.Controls[ColInd].MultiCheck == false && NewValue && this.Grid.Controls[ColInd].CurrentChecked != null) {
            this._GridElement[this.Grid.Controls[ColInd].CurrentChecked][this.Grid.Controls[ColInd].dataField] = 0;
            var OldRowNo;
            if ((OldRowNo = this.GetRowNo(this.Grid.Controls[ColInd].CurrentChecked)) != -1) {
                ElmById(this.Grid.id + '_' + this.Grid.Controls[ColInd].id + "_" + OldRowNo).checked = false;
            }
        }
        if (NewValue)
            this.Grid.Controls[ColInd].CurrentChecked = ElmIndex + RowInd;
        else
            this.Grid.Controls[ColInd].CurrentChecked = null;
    }

    if (this._GridElement.length > ElmIndex + RowInd) {
        if (NewValue == null || NewValue == "")
            delete this._GridElement[RowInd + ElmIndex][this.Grid.Controls[ColInd].dataField]
        else {
            this.SetValueToElement(this._GridElement[RowInd + ElmIndex], this.Grid.Controls[ColInd].dataField, NewValue);
            //this._GridElement[RowInd + ElmIndex][this.Grid.Controls[ColInd].dataField] = NewValue;  // "-1" --> Checked "0" --> Unchecked
        }
            
        if (this.Grid.Controls[ColInd].dataField != _CheckedField)
            this.UpdateRowStatus(RowInd + ElmIndex, 2) // To Set the Row as Updated
    }
    else if ((this.Grid.Controls[ColInd].NewRow != false && this._GridElement.length == ElmIndex + RowInd) || (CreateIfNotExist != null && CreateIfNotExist)) {
        
        this._GridElement[RowInd + ElmIndex] = {};
        this._GridElement[RowInd + ElmIndex][_ElmIndexField] = this.NextElmIndex++;
        this.SetValueToElement(this._GridElement[RowInd + ElmIndex], this.Grid.Controls[ColInd].dataField, NewValue);
        //this._GridElement[RowInd + ElmIndex][this.Grid.Controls[ColInd].dataField] = NewValue;  // "-1" --> Checked "0" --> Unchecked
        this.UpdateRowStatus(RowInd + ElmIndex, 1); // To Set the Row as NEW
        //below is commented if there is default values
        //if (this.Grid.ShowFixedRows && RowInd < this.Grid.RowCount - 1)
        //    this.EmptyGridRow(RowInd + 1, true);
        var x = 0;
        for (; x < this.Grid.Controls.length; x++) {
            if (this.Grid.Controls[x].data != null && this._GridElement[RowInd + ElmIndex][this.Grid.Controls[x].dataField] == null)
                this._GridElement[RowInd + ElmIndex][this.Grid.Controls[x].dataField] = this.Grid.Controls[x].data[0][this.Grid.Controls[x].dataValueField];
        }
        let newRowEvent = { id: this.Grid.Controls[ColInd].id, grid: this, rowNo: RowInd, ElementIndex: RowInd + ElmIndex, columnIndex: ColInd, control: ElmById(this.Grid.id + '_' + this.Grid.Controls[ColInd].id + "_" + RowInd) };
        if (this.Grid.OnNewRow != null && handleEvent(this.Grid.OnNewRow, newRowEvent) == false)
            this._GridElement.splice(RowInd + ElmIndex, 1);
        
        this.SetPager();
    }
    else {
        this.SetData(false);
    }
    flgUpdate = true;
    if (FirstChanging) {
        this.Grid.ChangingValue = false;
    }
    this.SetFooter();
    if (CallChangeFunction != false && this.Grid.Controls[ColInd].AfterChange != null)
        this.Grid.Controls[ColInd].AfterChange(RowInd);
    return true;
}
JSGrid.prototype.GetRowNo = function (ElmIndex) {
    if (ElmIndex >= this._CurrentGridPage * this.Grid.RowCount && (this._CurrentGridPage * this.Grid.RowCount) + this.Grid.RowCount > ElmIndex) {
        return (ElmIndex - (this._CurrentGridPage * this.Grid.RowCount));
    }
    return -1;
}
JSGrid.prototype.UpdateRowStatus = function (ElementIndex, NewValue) {
    var CurrentStatus = parseInt(isNull(this._GridElement[ElementIndex][_OperationField], 0), 10);
    if (CurrentStatus == 0 && !(CurrentStatus == 1 && NewValue == 2))
        this._GridElement[ElementIndex][_OperationField] = NewValue;
}
JSGrid.prototype.CheckAll = function (CheckValue, ColumnInd) {
    if (ColumnInd == null) ColumnInd = "0";
    var DataField = this.Grid.Controls[ColumnInd].dataField;
    if (CheckValue == null) CheckValue = false;
    var length = this._GridElement.length;
    var x = 0;
    for (; x < this._GridElement.length; x++) {
        if (!!this.Grid.OnRowSelectEvent && CheckValue) {
            let result;
            if (typeof (this.Grid.OnRowSelectEvent) == "string")
                result = window[this.Grid.OnRowSelectEvent](this._GridElement[x], x);
            else
                result = this.Grid.OnRowSelectEvent(this._GridElement[x], x);

            if (result == false) {
                continue;
            }
        }
        else if (!!this.Grid.OnRowSelectEvent && this.Grid.CallOnUnSelect) {
            let result;
            if (typeof (this.Grid.OnRowSelectEvent) == "string")
                result = window[this.Grid.OnRowSelectEvent]([], x);
            else
                result = this.Grid.OnRowSelectEvent([], x);
            if (result == false) {
                continue;
            }
        }
        this._GridElement[x][DataField] = (CheckValue ? 1 : 0); // "-1" or 1 --> Checked "0" --> Unchecked
        if (DataField != _CheckedField) {
            this.UpdateRowStatus(x, 2); // To Set the Row as Updated
        }
        if (x >= (this._CurrentGridPage * this.Grid.RowCount) && x < ((this._CurrentGridPage * this.Grid.RowCount) + this.Grid.RowCount)) {
            for (var g = 0; g < this.Grid.Controls.length; g++) {
                if (this.Grid.Controls[g].dataField == DataField) {
                    ElmById(this.Grid.id + '_' + this.Grid.Controls[g].id + "_" + (x - (this._CurrentGridPage * this.Grid.RowCount))).checked = CheckValue;
                    if (DataField == _CheckedField)
                        this.ChangeStyle((x - (this._CurrentGridPage * this.Grid.RowCount)));
                }
            }
        }
    }


    if (!!this.Grid.Controls[ColumnInd].AfterCheck)
        this.Grid.Controls[ColumnInd].AfterCheck(null, CheckValue);
}
JSGrid.prototype.DataBind = function (Elements, ContainDeleted, AllAsNew) {
    this.CurrentChecked = null;
    Elements = CheckArray(Elements);
    this.DeletedDocument = [];
    if (ContainDeleted) {
        for (var x = 0; x < Elements.length; x++) {
            if (Elements[x][_OperationField] == 3) {
                this.DeletedDocument.push(Elements.splice(x, 1));
                x--;
            }
        }
    }
    this._OrignalGridElement = Elements;
    this._GridElement = Elements;
    this.NextElmIndex = 0;
    this.SetElementDefaults(AllAsNew);
    //this.SetDDLColumns(); // it's slow down performance since it should not rebind DDL item on DataBind 
    this.SetData(true);
    this.SetFooter();
    this.SetPager();
    this.DoFilter();
}
JSGrid.prototype.SetElementDefaults = function (AllAsNew) {
    var QFilterColumns = [];
    for (var y = 0; y < this.Grid.Controls.length; y++) {
        if (this.Grid.Controls[y].QFilterType == ControlType.ComboBox) {
            QFilterColumns[QFilterColumns.length] = y;
            this.Grid.Controls[y].QFilterData = [];
        }
    }
    for (var x = 0; x < this._GridElement.length; x++) {
        if (AllAsNew == true)
            this._GridElement[x][_OperationField] = 1; // To Set the Row as Insert (NEW)
        if (AllAsNew != false)
            this._GridElement[x][_CheckedField] = 0; // To Set the Row as Insert (NEW)
        for (var j = 0; j < this.Grid.Controls.length; j++) {
            if (this.Grid.Controls[j].ControlType == ControlType.CheckBox && ToBoolean(this._GridElement[x][this.Grid.Controls[j].dataField]) == true) {
                this.Grid.Controls[j].CurrentChecked = x;
            }
        }
        this._GridElement[x][_ElmIndexField] = this.NextElmIndex++;
        for (var z = 0; z < QFilterColumns.length; z++) {
            if (CheckExist(this.Grid.Controls[QFilterColumns[z]].QFilterData, "Value", this._GridElement[x][this.Grid.Controls[QFilterColumns[z]].dataField]) == -1)
                this.Grid.Controls[QFilterColumns[z]].QFilterData.push({ Value: this._GridElement[x][this.Grid.Controls[QFilterColumns[z]].dataField] });
        }
    }
    for (var z = 0; z < QFilterColumns.length; z++) {
        $("#QF" + this.Grid.id + '_' + this.Grid.Controls[QFilterColumns[z]].id).DataBind(this.Grid.Controls[QFilterColumns[z]].QFilterData, 'Value', 'Value', true);
    }
}
JSGrid.prototype.SetFooter = function () {
    if (this.Grid.ChangingValue != true && this.Grid.SettingData != true && this.Grid.SettingFooter != true) {
        this.Grid.SettingFooter = true;
        for (var y = 0; y < this.Grid.Controls.length; y++) {
            let control = this.Grid.Controls[y];
            if (control.FooterType != null) {
                if (control.FooterType.toUpperCase() == 'SUM') {
                    let sum = 0;
                    if (this._GridElement)
                        this._GridElement.forEach(elm => {
                            sum += parseFloat(this.GetValueFromElement(elm, control.dataField, 0));
                        })
                    if (control.step) {
                        let fraction = control.step.length - 2;
                        fraction = fraction > 3 ? 3 : fraction;
                        sum = parseFloat(sum).toFixed(fraction);
                    }
                    ElmById(this.Grid.id + '_' + this.Grid.Controls[y].id + "_footer").innerText = (this.Grid.Controls[y].OnFooterBind == null ? sum : this.Grid.Controls[y].OnFooterBind(sum));
                }
            }
        }
        this.Grid.SettingFooter = false;
    }
}
JSGrid.prototype.RefreshCell = function (ColID, RowNo) {
    this.RefreshCellByIndex(this.GetIndex(ColID), RowNo);
}
JSGrid.prototype.ColumnVisible = function (ColID, Bool) {
    var ColIndex = this.GetIndex(ColID);
    if (Bool) {
        $('#tblCont' + this.Grid.id + ' td:nth-child(' + (ColIndex + 1) + '), #tblCont' + this.Grid.id + ' col:nth-child(' + (ColIndex + 1) + ')').show();
        $('#tblHeader' + this.Grid.id + ' td:nth-child(' + (ColIndex * 2) + '), #tblHeader' + this.Grid.id + ' col:nth-child(' + (ColIndex * 2) + '), #tblHeader' + this.Grid.id + ' td:nth-child(' + ((ColIndex * 2) + 1) + '), #tblHeader' + this.Grid.id + ' col:nth-child(' + ((ColIndex * 2) + 1) + ')').show();
    }
    else {
        $('#tblCont' + this.Grid.id + ' td:nth-child(' + (ColIndex + 1) + '), #tblCont' + this.Grid.id + ' col:nth-child(' + (ColIndex + 1) + ')').hide();
        $('#tblHeader' + this.Grid.id + ' td:nth-child(' + (ColIndex * 2) + '), #tblHeader' + this.Grid.id + ' col:nth-child(' + (ColIndex * 2) + '), #tblHeader' + this.Grid.id + ' td:nth-child(' + ((ColIndex * 2) + 1) + '), #tblHeader' + this.Grid.id + ' col:nth-child(' + ((ColIndex * 2) + 1) + ')').hide();
    }
}
JSGrid.prototype.RefreshCellByIndex = function (ColInd, RowNo) {
    var CurrentCellTemplate = "";
    if (this.Grid.Controls[ColInd].OnTemplateDesignBind != null)
        CurrentCellTemplate = this.Grid.Controls[ColInd].OnTemplateDesignBind(RowNo);
    else
        CurrentCellTemplate = isNull(this.Grid.Controls[ColInd].TemplateHTML, "");

    //ElmById(this.Grid.id + '_' + this.Grid.Controls[ColInd].id + "_" + RowNo).innerHTML = isNull(CurrentCellTemplate, "").replace(/~RowNo~/g, RowNo);
    $(this.tblContentGrid).find("#" + this.Grid.id + '_' + this.Grid.Controls[ColInd].id + "_" + RowNo)[0].innerHTML = isNull(CurrentCellTemplate, "").replace(/~RowNo~/g, RowNo);

    if (this.Grid.Controls[ColInd].OnTemplateDataBind != null)
        this.Grid.Controls[ColInd].OnTemplateDataBind(RowNo);
}
JSGrid.prototype.SetData = function (CallOnDataBound) {
    this.Grid.SettingData = true;
    var Current_Row = 0;
    var Current_Elm = 0;
    if (this._CurrentGridPage != 0 && (this._CurrentGridPage * this.Grid.RowCount) >= this._GridElement.length) this._CurrentGridPage = parseInt(this._GridElement.length / this.Grid.RowCount);
    if (this.Grid.PreDataBoundFunction && window[this.Grid.PreDataBoundFunction] != null)
        window[this.Grid.PreDataBoundFunction]();

    for (var x = (this._CurrentGridPage * this.Grid.RowCount); Current_Row < this.Grid.RowCount && x < this._GridElement.length; x++) {
        Current_Elm = (this._ElementOrder != null) ? this._ElementOrder[x] : x;
        if ((CallOnDataBound != false) && this.Grid.OnDataBound) {
            this.DataBindingOpertion = true;
            this.Grid.OnDataBound(Current_Row, this._GridElement[Current_Elm]);
            this.DataBindingOpertion = false;
        }
        for (var y = 0; y < this.Grid.Controls.length; y++) {
            if (this.Grid.Controls[y].ControlType == "tmp") {
                this.RefreshCellByIndex(y, Current_Row);
            }
            else {
                if (this.Grid.Controls[y].dataField != null && this.Grid.Controls[y].dataField != "") {
                    var CurrentCTRL = ElmById(this.Grid.id + '_' + this.Grid.Controls[y].id + "_" + Current_Row);
                    if (this.Grid.Controls[y].ControlType == ControlType.InputTextBox) {
                        //var _ColTypeArr = this.Grid.Controls[y].DataType.replace(")", "").split("(");
                        //if (_ColTypeArr[0] == "numeric")
                        //    CurrentCTRL.value = parseFloat(isNull(this._GridElement[Current_Elm][this.Grid.Controls[y].dataField], this.getNullValue(y))).toFixed(_ColTypeArr[1].split(",")[1])
                        ////else if (_ColTypeArr[0].indexOf("datetime") != -1)
                        ////    CurrentCTRL.value = GetDateTime(isNull(this._GridElement[Current_Elm][this.Grid.Controls[y].dataField], this.getNullValue(y)), _ColTypeArr[1]);
                        ////else if (_ColTypeArr[0].indexOf("date") != -1)
                        ////    CurrentCTRL.value = GetDate(isNull(this._GridElement[Current_Elm][this.Grid.Controls[y].dataField], this.getNullValue(y)), _ColTypeArr[1]);
                        ////else if (_ColTypeArr[0].indexOf("time") != -1)
                        ////    CurrentCTRL.value = GetTime(isNull(this._GridElement[Current_Elm][this.Grid.Controls[y].dataField], this.getNullValue(y)), _ColTypeArr[1]);
                        //else
                        let cValue = this.GetValueByElmIndex(this.Grid.Controls[y].dataField, Current_Elm, this.getNullValue(y));
                        if (this.Grid.Controls[y].type == "date") {
                            let dt = new Date(cValue);
                            dt.setMinutes(dt.getMinutes() + (dt.getTimezoneOffset() * -1));
                            CurrentCTRL.valueAsDate = dt;
                        }
                        else
                            CurrentCTRL.value = cValue;
                        CurrentCTRL.title = CurrentCTRL.value;
                        setFixed(CurrentCTRL);
                    } else if (this.Grid.Controls[y].ControlType == ControlType.AutoComplete) {
                        let cValueObject = this.GetValueByElmIndex(this.Grid.Controls[y].dataField + "Object", Current_Elm, this.getNullValue(y));
                        if (cValueObject != "") {
                            cValueObject = CheckArray(cValueObject);
                            CurrentCTRL.value = cValueObject[0][this.Grid.Controls[y].dataCodeField];
                            CurrentCTRL.nextSibling.value = cValueObject[0][this.Grid.Controls[y].dataTextField];
                        }
                    }
                    else if (this.Grid.Controls[y].ControlType == ControlType.ComboBox) {
                        let cValueObject = this.GetValueByElmIndex(this.Grid.Controls[y].dataField, Current_Elm, this.getNullValue(y));

                        CurrentCTRL.value = cValueObject;// isNull(this._GridElement[Current_Elm][this.Grid.Controls[y].dataField], '');
                        //                        if(CurrentCTRL.selectedIndex != -1)
                        //                            CurrentCTRL.parentNode.title = (CurrentCTRL.options.length > 0 ? CurrentCTRL.options[CurrentCTRL.selectedIndex].innerText : "");
                    }
                    else if (this.Grid.Controls[y].ControlType == ControlType.Label || this.Grid.Controls[y].ControlType == ControlType.Button) {
                        var _ColTypeArr = isNull(this.Grid.Controls[y].DataType, '').replace(")", "").split("(");
                        //var cValue = isNull(this._GridElement[Current_Elm][this.Grid.Controls[y].dataField], this.getNullValue(y));
                        let cValue = this.GetValueByElmIndex(this.Grid.Controls[y].dataField, Current_Elm, this.getNullValue(y));
                        if (cValue != "" && this.Grid.Controls[y].data != null && this.Grid.Controls[y].dataTextField != null && this.Grid.Controls[y].dataValueField != null) {
                            cValue = this.Grid.Controls[y].data.find(obj => obj[this.Grid.Controls[y].dataValueField] == cValue)[this.Grid.Controls[y].dataTextField];
                        }
                        if (_ColTypeArr[0] == "numeric" && _ColTypeArr[1].split(',').length == 2) {
                            if (isNaN(cValue))
                                cValue = 0;
                            let fraction = _ColTypeArr[1].split(',')[1];
                            fraction = fraction > 3 ? 3 : fraction;
                            cValue = parseFloat(cValue).toFixed(fraction);
                        }
                        else if (_ColTypeArr[0].indexOf("datetime") != -1)
                            cValue = GetDateTime(isNull(this._GridElement[Current_Elm][this.Grid.Controls[y].dataField], this.getNullValue(y)), _ColTypeArr[1]);
                        else if (_ColTypeArr[0].indexOf("date") != -1 || (this.Grid.Controls[y].type == "date" && cValue != null))
                            cValue = GetDate(isNull(this._GridElement[Current_Elm][this.Grid.Controls[y].dataField], this.getNullValue(y)), _ColTypeArr[1]);
                        ElmById(this.Grid.id + '_' + this.Grid.Controls[y].id + "_" + Current_Row).innerText = cValue;
                        ElmById(this.Grid.id + '_' + this.Grid.Controls[y].id + "_" + Current_Row).title = cValue;
                    }
                    else if (this.Grid.Controls[y].ControlType == ControlType.CheckBox || this.Grid.Controls[y].ControlType == ControlType.CheckBox) {
                        CurrentCTRL.checked = ToBoolean(isNull(this._GridElement[Current_Elm][this.Grid.Controls[y].dataField], 0));
                    }
                }
                else if(this.Grid.Controls[y].ControlType == ControlType.Button) {
                    var cValue = this.Grid.Controls[y].LabelText;
                    ElmById(this.Grid.id + '_' + this.Grid.Controls[y].id + "_" + Current_Row).innerText = cValue;
                    ElmById(this.Grid.id + '_' + this.Grid.Controls[y].id + "_" + Current_Row).title = cValue;
                }
                if (this.Grid.Controls[y].CallOnChange != null) {
                    this.Grid.Controls[y].CallOnChange(Current_Row)
                }
            }
        }
        if ((CallOnDataBound != false) && this.Grid.AfterDatabound) {
            this.DataBindingOpertion = true;
            this.Grid.AfterDatabound(Current_Row, this._GridElement[Current_Elm]);
            this.DataBindingOpertion = false;
        }
        this.tblContentGrid.rows[Current_Row].style.display = "";
        this.ChangeStyle(Current_Row);
        Current_Row++;
    }
    x = Current_Row;
    for (; Current_Row < this.Grid.RowCount; Current_Row++) {
        if (this.Grid.ShowFixedRows)
            this.EmptyGridRow(Current_Row, true);
        else
            this.EmptyGridRow(Current_Row, false);
    }
    this.Grid.SettingData = false
}
JSGrid.prototype.UpdateDDLData = function (ColID, Data) {
    var ColInd = this.GetIndex(ColID);
    this.Grid.Controls[ColInd].data = Data;
    this.RefreshDDLColumn(ColInd);
}
JSGrid.prototype.EmptyGridRow = function (Current_Row, Display) {
    for (var y = 0; y < this.Grid.Controls.length; y++) {
        if (this.Grid.Controls[y].ResetValue != false && this.Grid.Controls[y].ControlType != ControlType.ButtonsList) {
            let ctrl = ElmById(this.Grid.id + '_' + this.Grid.Controls[y].id + "_" + Current_Row);
            ctrl.DisableFlag = null;
            if (this.Grid.Controls[y].ControlType == ControlType.InputTextBox) {
                ctrl.value = ctrl.title = "";
                ctrl.readOnly = (this.Grid.Controls[y].AddProperty.toLowerCase().indexOf("readonly='true'") != -1 ? true : false);
            }
            else if (this.Grid.Controls[y].ControlType == ControlType.ComboBox) {
                if (this.Grid.Controls[y].data == null) {
                    ctrl.options.length = 0;
                    ctrl.value = "";
                }
                else {
                    ctrl.selectedIndex = 0;
                }
                ctrl.parentNode.title = '';
            }
            else if (this.Grid.Controls[y].ControlType == ControlType.Label) {
                ctrl.innerText = "";
                ctrl.title = "";
            }
            else if (this.Grid.Controls[y].ControlType == ControlType.CheckBox || this.Grid.Controls[y].ControlType == ControlType.CheckBox) {
                ctrl.checked = false;
                if (this.Grid.Controls[y].dataField == _CheckedField)
                    this.ChangeStyle(Current_Row);
            }
            else if (this.Grid.Controls[y].ControlType == ControlType.Button) {
                ctrl.innerText = "";
            }
            else if (this.Grid.Controls[y].ControlType == ControlType.AutoComplete) {
                ctrl.value = ctrl.nextSibling.value = "";
            }
            if (!this.AllDisabled)
                ctrl.disabled = (ctrl.dataset.disable || this.Grid.Controls[y].AddProperty.toLowerCase().indexOf("disabled='true'") != -1 ? true : false);
        }
    }
    if (this.Grid.SelectRowOnClick)
        this.ChangeStyle(Current_Row);
    if (Display)
        this.tblContentGrid.rows[Current_Row].style.display = "";
    else
        this.tblContentGrid.rows[Current_Row].style.display = "none";
}
JSGrid.prototype.getNullValue = function (GridCol) {
    if (this.Grid.Controls[GridCol][10] != null) return this.Grid.Controls[GridCol][10];
    var Type = this.Grid.Controls[GridCol].DataType;
    if(Type != null)
        Type = Type.replace(")", "").split("(")[0];
    if (Type == "numeric")
        return "0.000";
    return "";
}
JSGrid.prototype.SetPager = function () {
    var PagesCount = this.GetPageCount();

    ElmById(this.Grid.id + '_PageCount').innerText = PagesCount;
    ElmById(this.Grid.id + '_CurrentPage').value = this._CurrentGridPage + 1;

    var FromElmID = (this.GetRowsCount() > 0 ? ((this._CurrentGridPage * this.Grid.RowCount) + 1) : 0);
    var ToElmID = ((this._CurrentGridPage * this.Grid.RowCount) + this.Grid.RowCount);
    ToElmID = (ToElmID < this.GetRowsCount() ? ToElmID : this.GetRowsCount());
    if (document.dir == 'rtl') {
        ElmById(this.Grid.id + '_PageInfo').innerText = 'عرض ' + FromElmID + ' - ' + ToElmID + ' من ' + this.GetRowsCount();
    }
    else {
        ElmById(this.Grid.id + '_PageInfo').innerText = 'View ' + FromElmID + ' - ' + ToElmID + ' of ' + this.GetRowsCount();
    }

    //if (this._CurrentGridPage > 0) {
    //    ElmById(this.Grid.id + '_FirstPage').removeClass('ui-state-disabled');
    //    ElmById(this.Grid.id + '_PrevPage').removeClass('ui-state-disabled');
    //} else {
    //    ElmById(this.Grid.id + '_FirstPage').addClass('ui-state-disabled').removeClass('ui-state-hover');
    //    ElmById(this.Grid.id + '_PrevPage').addClass('ui-state-disabled').removeClass('ui-state-hover');
    //}

    //if (this._CurrentGridPage < PagesCount - 1) {
    //    ElmById(this.Grid.id + '_NextPage').removeClass('ui-state-disabled');
    //    ElmById(this.Grid.id + '_LastPage').removeClass('ui-state-disabled');
    //} else {
    //    ElmById(this.Grid.id + '_NextPage').addClass('ui-state-disabled').removeClass('ui-state-hover');
    //    ElmById(this.Grid.id + '_LastPage').addClass('ui-state-disabled').removeClass('ui-state-hover');
    //}

    if (this.ReSetDivHeight === undefined) {
        this._SetDivHeight();
    }
}
JSGrid.prototype.GetPageCount = function () {
    if (!this._GridElement) return 0;
    var Count = parseInt(this._GridElement.length / this.Grid.RowCount, 10);
    if (Count * this.Grid.RowCount == this._GridElement.length)
        return Count;
    else
        return Count + 1;
}
JSGrid.prototype.ChangePageIndex = function (i) {
    if (i < 0)
        this._CurrentGridPage = 0;
    else
        this._CurrentGridPage = i;
    this.SetData(true);
    this.SetPager();
}
JSGrid.prototype._SetDivHeight = function () {
    if (ElmById(this.Grid.id + "_DiV").style.height != "" || ElmById(this.Grid.id).OriginalHeight != "")
        ElmById(this.Grid.id + "_DiV").style.height = (this.tblGrid.clientHeight + 18) + "px";
}
JSGrid.prototype.GetRowsCount = function () {
    return this._GridElement.length;
}
JSGrid.prototype.GetSelectedRows = function () {
    return this.GetCheckedRows(_CheckedField);
}
JSGrid.prototype.GetCheckedRows = function (DataField) {
    var ResultDoc = [];
    for (var x = 0; x < this._GridElement.length; x++) {
        if (isNull(this._GridElement[x][DataField], false)) {
            ResultDoc.push(this._GridElement.slice(x, x + 1)[0]);
        }
    }
    return ResultDoc;
}
JSGrid.prototype.DeleteSelectedRows = function () {
    var RowsCount = 0;
    for (var g = 0; g < this._GridElement.length; g++) {
        if (parseInt(isNull(this._GridElement[g][_CheckedField], 0), 10) != 0) {
            this.DeleteRowByElmIndex(g);
            RowsCount++;
            if (g == this.CurrentChecked)
                this.CurrentChecked = null;
            else if (g < this.CurrentChecked)
                this.CurrentChecked--;
            g--;
        }
    }
    if (this.Grid.ShowSelectCheckBox && ElmById(this.Grid.Controls[0].id + "_All") !== null)
        ElmById(this.Grid.Controls[0].id + "_All").checked = false;
    this.SetData(true);
    this.SetPager();
    this.SetFooter();
    return RowsCount;
}
JSGrid.prototype.DeleteRowByElmIndex = function (ELMInd) {
    if (parseInt(isNull(this._GridElement[ELMInd][_OperationField], 0), 10) != 1) {
        this._GridElement[ELMInd][_OperationField] = 3; // To Set the Row as Deleted
        this.DeletedDocument = this.DeletedDocument.concat(this._GridElement.splice(ELMInd, 1));
    }
    else {
        this._GridElement.splice(ELMInd, 1);
    }
}
JSGrid.prototype.DeleteAllRows = function () {
    var RowsCount = 0;
    for (var g = 0; g < this._GridElement.length; g++) {
        if (parseInt(isNull(this._GridElement[g], _OperationField, 0), 10) != 1) {
            this._GridElement[g][_OperationField] = 3; // To Set the Row as Deleted
            this.DeletedDocument.push(this._GridElement[g]);
        }
        RowsCount++;
        this._GridElement.splice(g, 1);
        g--;
    }
    this.CurrentChecked = null;
    this.SetData(true);
    this.SetPager();
    return RowsCount;
}
JSGrid.prototype.GetDeletedRows = function () {
    return this.DeletedDocument;
}
JSGrid.prototype.GetUpdatedRows = function () {
    var ResultDoc = this.DeletedDocument.slice();
    for (var x = 0; x < this._GridElement.length; x++) {
        if (parseInt(isNull(this._GridElement[x][_OperationField], 0), 10) != 0) {
            ResultDoc.push(this._GridElement[x]);
        }
    }
    return ResultDoc;
}
JSGrid.prototype.GetNextActiveColumn = function (_CurrentColumn) {
    for (var x = (_CurrentColumn == this.Grid.Controls.length - 1) ? 0 : _CurrentColumn + 1; x != _CurrentColumn; (x == this.Grid.Controls.length - 1) ? x = 0 : x++)
        if (this.Grid.Controls[x].TabStop != false)
            return x;
    return _CurrentColumn;
}
JSGrid.prototype.GetPreviousActiveColumn = function (_CurrentColumn) {
    for (var x = (_CurrentColumn == 0) ? this.Grid.Controls.length - 1 : _CurrentColumn - 1; x != _CurrentColumn; (x == 0) ? x = this.Grid.Controls.length - 1 : x--)
        if (this.Grid.Controls[x].TabStop === undefined || this.Grid.Controls[x].TabStop)
            return x;
    return _CurrentColumn;
}
JSGrid.prototype.GetVisibleRows = function () {
    var x;
    for (x = 0; x < this.Grid.RowCount; x++) {
        if (this.tblGrid.rows[x + 1].style.display == 'none')
            return x;
    }
    return x;
}
JSGrid.prototype._DoTab = function (ColInd, RowInd, EvenNextRow) {
    if (this.Grid.Controls[ColInd].OnTabEvent != null && this.Grid.Controls[ColInd].OnTabEvent(RowInd) == false)
        return;
    if (event == null || !event.ctrlKey) { // ----> Go Forword Without CTRL (Crtl By Crtl)
        var Loop = -1;
        if (event == null || !event.shiftKey) { // ----> Go Forword
            var CurrentCol;
            var NextCol = ColInd;
            var NextRow = RowInd;
            do {
                CurrentCol = NextCol;
                NextCol = this.GetNextActiveColumn(NextCol);
                NextRow = (NextCol <= CurrentCol) ? ((NextRow == this.Grid.RowCount - 1) ? 0 : (NextRow + 1)) : (NextRow);
                if (EvenNextRow == false && NextRow != RowInd)
                    return;
                if (NextRow != RowInd && Loop == -1)
                    Loop = 0;
                else if (NextRow == RowInd && Loop == 0)
                    break;
            } while (!SetActiveObject(ElmById(this.Grid.id + "_" + this.Grid.Controls[NextCol].id + "_" + NextRow)))
            if (NextCol <= ColInd && RowInd == this.Grid.RowCount - 1)
                if (this.GetPageCount() > this._CurrentGridPage + 1 || (this.Grid.ShowFixedRows)) // ---->Go to New Row With Next
                    this.ChangePageIndex(this._CurrentGridPage + 1);
                else return;
            else if (RowInd == 0)
                this.SetPager();
            SetActiveObject(ElmById(this.Grid.id + "_" + this.Grid.Controls[NextCol].id + "_" + NextRow));
        }
        else {  // ----> Go Backword
            var PreCol = ColInd;
            var PreRow = RowInd;
            do {
                var PreCol = this.GetPreviousActiveColumn(PreCol);
                var PreRow = (PreCol > ColInd) ? ((PreRow == 0) ? this.Grid.RowCount - 1 : (PreRow - 1)) : (PreRow);
                if (PreCol > ColInd && RowInd == 0)
                    if (this._CurrentGridPage > 0)
                        this.ChangePageIndex(this._CurrentGridPage - 1);
                    else return;
            } while (!SetActiveObject(ElmById(this.Grid.id + "_" + this.Grid.Controls[PreCol].id + "_" + PreRow)))
        }
    }
    else {
        if (event == null || !event.shiftKey) { // ----> Go Forword
            var NextRow = RowInd;
            var NextCol = -1;
            NextCol = this.GetNextActiveColumn(NextCol);
            NextRow = ((NextRow == this.Grid.RowCount - 1) ? 0 : (NextRow + 1));
            SetActiveObject(ElmById(this.Grid.id + "_" + this.Grid.Controls[NextCol].id + "_" + NextRow));
        }
        else {
            var PreCol = -1;
            var PreRow = RowInd;
            PreCol = this.GetNextActiveColumn(PreCol);
            PreRow = (PreRow == 0 ? this.Grid.RowCount - 1 : (PreRow - 1));
            SetActiveObject(ElmById(this.Grid.id + "_" + this.Grid.Controls[PreCol].id + "_" + PreRow));
        }
    }
}
JSGrid.prototype.CellKeyDown = function (ColInd, RowInd) {
    switch (event.keyCode) {
        case 9:     // Key Tab
        case 13:    // Key Enter
            event.returnValue = false;
            event.cancel = true;
            if (event.preventDefault) event.preventDefault();
            this._DoTab(ColInd, RowInd);
            break;
        case 38: // Key UP
            if (RowInd != 0 && this.Grid.Controls[ColInd].ControlType != ControlType.ComboBox) {
                event.returnValue = false;
                event.cancel = true;
                GetFocusWSelect(ElmById(this.Grid.id + '_' + this.Grid.Controls[ColInd].id + "_" + (RowInd - 1)));
            }
            break;
        case 40:   // Key Down
            if (RowInd != this.Grid.RowCount - 1 && this.Grid.Controls[ColInd].ControlType != ControlType.ComboBox) {
                event.returnValue = false;
                event.cancel = true;
                GetFocusWSelect(ElmById(this.Grid.id + '_' + this.Grid.Controls[ColInd].id + "_" + (RowInd + 1)));
            }
            break;
        case 33:    // Key PageUP
            if (event.ctrlKey) {
                this.ChangePageIndex(0);
                GetFocusWSelect(ElmById(this.Grid.id + '_' + this.Grid.Controls[ColInd].id + "_" + RowInd));
            }
            else {
                if (this._CurrentGridPage > 0) {
                    this.ChangePageIndex(this._CurrentGridPage - 1);
                    GetFocusWSelect(ElmById(this.Grid.id + '_' + this.Grid.Controls[ColInd].id + "_" + RowInd));
                }
            }
            break;
        case 34:    // Key PageDown
            if (event.ctrlKey) {
                this.ChangePageIndex(this.GetPageCount());
                GetFocusWSelect(ElmById(this.Grid.id + '_' + this.Grid.Controls[ColInd].id + "_" + RowInd));
            }
            else {
                if (this.GetPageCount() > this._CurrentGridPage + 1) {
                    this.ChangePageIndex(this._CurrentGridPage + 1);
                    GetFocusWSelect(ElmById(this.Grid.id + '_' + this.Grid.Controls[ColInd].id + "_" + RowInd))
                }
            }
            break;
        case 119:    // Key Search (F8)
            if (!!ElmById(this.Grid.id + '_' + this.Grid.Controls[ColInd].id + "_" + RowInd).ondblclick)
                ElmById(this.Grid.id + '_' + this.Grid.Controls[ColInd].id + "_" + RowInd).ondblclick();
            event.returnValue = false;
            event.cancel = true;
            break;
        case 120:    // Key Search (F9)
            if (!!ElmById(this.Grid.id + '_' + this.Grid.Controls[this.Grid.Controls.length - 1].id + "_" + RowInd).onclick)
                ElmById(this.Grid.id + '_' + this.Grid.Controls[this.Grid.Controls.length - 1].id + "_" + RowInd).onclick();
            event.returnValue = false;
            event.cancel = true;
            break;
    }
}
JSGrid.prototype.SelectItem = function (DataField, Value) {
    for (var ind = 0; ind < this._GridElement.length; ind++) {
        if (isNull(this._GridElement[ind][DataField], 0).toString().toLowerCase() == Value.toString().toLowerCase()) {
            this._CurrentGridPage = parseInt(ind / this.Grid.RowCount, 10);
            var rowInd = ind - (this._CurrentGridPage * this.Grid.RowCount)
            ElmById(this.Grid.id + '_' + this.Grid.Controls[0].id + "_" + rowInd).checked = true;
            this.CheckItemByElmIndex(ind, true);
            this.SetData();
            this.SetPager();
            this._DoTab(0, rowInd, false);
            return ind;
        }
    }
    return -1;
}
JSGrid.prototype.SelectRow = function (RowNo) {
    this.CheckItem(RowNo);
}
JSGrid.prototype.SetNextFocus = function (ColID, RowInd) {
    this._DoTab(this.GetIndex(ColID), RowInd);
}
JSGrid.prototype.OnSelectEvent = function (_FunctionName, CallOnUnSelect) {
    this.Grid.OnRowSelectEvent = window[_FunctionName];
    if (CallOnUnSelect == true)
        this.Grid.CallOnUnSelect = true;
    else
        this.Grid.CallOnUnSelect = false;
}
JSGrid.prototype.AfterSelectEvent = function (_FunctionName, CallAfterUnSelect) {
    if (this.ShowStatusCheckBox) {
        this.Grid.Controls[0].AfterCheck = window[_FunctionName];
        this.Grid.Controls[0].CallAfterUnSelect = CallAfterUnSelect;
    }
}
JSGrid.prototype.AfterCheckEvent = function (ColInd, _FunctionName, CallAfterUnSelect) {
    this.Grid.Controls[ColInd].AfterCheck = _FunctionName;
    this.Grid.Controls[ColInd].CallAfterUnSelect = CallAfterUnSelect;
}
JSGrid.prototype.GetControl = function (RowNo, ColNo) {
    return ElmById(this.Grid.id + '_' + this.Grid.Controls[ColNo].id + "_" + RowNo);
}
JSGrid.prototype.GetCTRL = function (ColID, RowNo) {
    return ElmById(this.Grid.id + '_' + ColID + "_" + RowNo);
}
JSGrid.prototype.GetCTRLByIndex = function (ColInd, RowNo) {
    return this.GetCTRL(this.Grid.Controls[ColInd].id, RowNo);
}
JSGrid.prototype.SetCodeColumnValue = function (ColumnId, RowNo, Object, datafield) {
    if (datafield == null)
        datafield = this.GetColumn(ColumnId).dataField;
    let ElmIndex = (this._CurrentGridPage * this.Grid.RowCount);
    this.SetValueByElmIndex(datafield + "Object", parseInt(RowNo, 10) + ElmIndex, Object, true);
    this.SetValueByElmIndex(datafield, parseInt(RowNo, 10) + ElmIndex, Object && Object.length > 0 ? Object[0][isNull(datafield, this.GetColumn(ColumnId).dataValueField)] : null, true);
    this.GetCTRL(ColumnId, RowNo).nextSibling.value = Object && Object.length > 0 ? Object[0][this.GetColumn(ColumnId).dataTextField] : '';
}
JSGrid.prototype.SetValue = function (DataField, RowInd, Value, UpdateRowStatus) {
    var ElmIndex = (this._CurrentGridPage * this.Grid.RowCount);
    this.SetValueByElmIndex(DataField, parseInt(RowInd, 10) + ElmIndex, Value, UpdateRowStatus);
}
JSGrid.prototype.SetValueByElmIndex = function (DataField, ELMInd, Value, UpdateRowStatus) {
    if (this._GridElement.length <= ELMInd) {
        this._GridElement[ELMInd] = {};
        this._GridElement[ELMInd][DataField] = Value;  // "-1" --> Checked "0" --> Unchecked
        if (UpdateRowStatus === undefined || UpdateRowStatus)
            this.UpdateRowStatus(ELMInd, 1); // To Set the Row as NEW
        //        if (this.Grid.ShowFixedRows && RowInd < this.Grid.RowCount - 1)
        //            this.EmptyGridRow(RowInd + 1, true);
    }
    else {
        this._GridElement[ELMInd][DataField] = Value;
        if (UpdateRowStatus === undefined || UpdateRowStatus)
            this.UpdateRowStatus(ELMInd, 2); // To Set the Row as NEW
    }
}
JSGrid.prototype.GetValue = function (DataField, RowNo, ValueIfNull) {
    return this.GetValueByElmIndex(DataField, this.GetElmIndex() + parseInt(RowNo, 10), ValueIfNull);
}
JSGrid.prototype.GetValueByElmIndex = function (DataField, ElmInd, ValueIfNull) {
    return this.GetValueFromElement(this._GridElement[ElmInd], DataField, ValueIfNull);
}
JSGrid.prototype.GetValueFromElement = function (Elm, DataField, ValueIfNull) {
    let value = Elm;
    DataField.replace(/\[/g, '.').replace(/]/g, '').split('.').forEach((obj) => {
        if (value != null) {
            if (Array.isArray(value) && isNaN(obj))
                value = value[0];
            value = value[obj];
        }
    });
    return isNull(value, (ValueIfNull != null ? ValueIfNull : ""));
}
JSGrid.prototype.SetValueToElement = function (Elm, DataField, value) {
    let cElm = Elm;
    DataField.replace(/\[/g, '.').replace(/]/g, '').split('.').forEach((obj, index, arr) => {
        if (arr.length == index + 1)
            cElm[obj] = value;
        else {
            if (cElm[obj] == undefined) {
                if (arr.length == index - 1 || isNaN(arr[index+1]))
                    cElm[obj] = {};
                else
                    cElm[obj] = [];
            }
            cElm = cElm[obj];
        }
    });
}
JSGrid.prototype.UpdateCTRL = function (ColID, RowInd, Value, CallOnChange) {
    var ColInd = this.GetIndex(ColID);
    if (this.Grid.Controls[ColInd].ControlType == ControlType.InputTextBox || this.Grid.Controls[ColInd].ControlType == ControlType.AutoComplete || this.Grid.Controls[ColInd].ControlType == ControlType.ComboBox) {
        this.GetCTRL(ColID, RowInd).value = Value;
    }
    else if (this.Grid.Controls[ColInd].ControlType == ControlType.Label || this.Grid.Controls[ColInd].ControlType == ControlType.Button) {
        this.GetCTRL(ColID, RowInd).innerText = Value;
    }
    else if (this.Grid.Controls[ColInd].ControlType == ControlType.CheckBox || this.Grid.Controls[ColInd].ControlType == ControlType.CheckBox) {
        this.GetCTRL(ColID, RowInd).checked = GetBoolean(Value);
    }
    this.ChangeValue(ColInd, RowInd, true, CallOnChange);
}
JSGrid.prototype.GetSubElement = function (DataField, RowNo) {
    return this._GridElement[this.GetElmIndex() + parseInt(RowNo, 10)][DataField];
}
JSGrid.prototype.GetSubElementByElmIndex = function (DataField, ElmIndex) {
    return this._GridElement[ElmIndex][DataField];
}
JSGrid.prototype.SetSubElement = function (DataField, RowNo, NewValue) {
    this.SetSubElementByElmIndex(DataField, this.GetElmIndex() + parseInt(RowNo, 10), NewValue);
}
JSGrid.prototype.SetSubElementByElmIndex = function (DataField, ElmIndex, NewValue) {
    this._GridElement[ElmIndex][DataField] = NewValue;
}
JSGrid.prototype.CutSubElement = function (DataField, RowNo) {
    var ElmIndex = (this._CurrentGridPage * this.Grid.RowCount);
    var Elm = this._GridElement[ElmIndex + parseInt(RowNo, 10)][DataField];
    if (Elm != null)
        this._GridElement[ElmIndex + parseInt(RowNo, 10)][DataField] = null;
    return Elm;
}
JSGrid.prototype.AddSubElements = function (TagName, Elms, RowNo) {
    var ElmIndex = (this._CurrentGridPage * this.Grid.RowCount);
    this.AddSubElementsByElmIndex(TagName, Elms, parseFloat(RowNo) + ElmIndex);
}
JSGrid.prototype.AddSubElementsByElmIndex = function (TagName, Elms, ElmIndex) {
    var SubElem;
    if (this._GridElement[ElmIndex][TagName] == null)
        SubElem = Elms;
    this._GridElement[ElmIndex][TagName] = SubElem;
}
JSGrid.prototype.GetElmIndex = function () {
    return (this._CurrentGridPage * this.Grid.RowCount);
}
JSGrid.prototype.GetElement = function (RowInd) {
    return this.GetElementByElmIndex(this.GetElmIndex() + RowInd);
}
JSGrid.prototype.GetElementByElmIndex = function (ElmInd) {
    return this._GridElement[ElmInd];
}
JSGrid.prototype.GetAllElement = function () {
    return this._GridElement;
}
JSGrid.prototype.SetActiveRow = function (ElmIndex) {
    this.ChangePageIndex(parseInt((ElmIndex / this.Grid.RowCount), 10));
    var RowIND = ElmIndex - parseInt((ElmIndex / this.Grid.RowCount), 10);
    var ColIND = this.GetNextActiveColumn(-1);
    SetActiveObject(ElmById(this.Grid.id + '_' + this.Grid.Controls[ColIND].id + "_" + RowIND));
    return RowIND;
}
JSGrid.prototype.AddElements = function (Elements, RefreshGrid) {
    Elements = CheckArray(Elements);
    for (var x = 0; x < Elements.length; x++) {
        this._GridElement.push(Elements.slice(x, x + 1)[0]);
        this._GridElement[this._GridElement.length - 1][_OperationField] = 1; // To Set the Row as Insert (NEW)
        this._GridElement[this._GridElement.length - 1][_CheckedField] = 0; // To Set the Row as Insert (NEW)
        this._GridElement[this._GridElement.length - 1][_ElmIndexField] = this.NextElmIndex++; // To Set the Row as Insert (NEW)
    }
    if (RefreshGrid != false) {
        this._CurrentGridPage = this.GetPageCount() - 1;
        this.SetData(true);
        this.SetFooter();
        this.SetPager();
    }
}
JSGrid.prototype.Refresh = function (BoolCallEvents) {
    this.SetData((BoolCallEvents == false ? false : true));
    this.SetFooter();
    this.SetPager();
}
JSGrid.prototype.ControlsCount = function () {
    return this.Grid.Controls.length;
}
JSGrid.prototype.DisableAll = function (bool) {
    this.AllDisabled = bool;
    for (var ColNo = 0; ColNo < this.ControlsCount(); ColNo++) {
        if (this.Grid.Controls[ColNo].ControlType == ControlType.CheckBox && !this.Grid.Controls[ColNo].DataType) {
            var CheckAll = ElmById(this.Grid.id + '_' + this.Grid.Controls[ColNo].id + "_All");
            if (CheckAll != null)
                ElmById(this.Grid.id + '_' + this.Grid.Controls[ColNo].id + "_All").disabled = bool;
        }
        for (var RowNo = 0; RowNo < this.Grid.RowCount; RowNo++) {
            if (this.Grid.Controls[ColNo].AddProperty.indexOf('disabled') == -1 && this.Grid.Controls[ColNo].ControlType != ControlType.Button && this.Grid.Controls[ColNo].ControlType != ControlType.Label && !this.GetControl(RowNo, ColNo).DisableFlag)
                this.GetControl(RowNo, ColNo).disabled = bool;
        }
    }
}
JSGrid.prototype.DisableAllFields = function (bool) {
    for (var ColNo = 0; ColNo < this.ControlsCount(); ColNo++) {
        if (this.Grid.Controls[ColNo].ControlType == ControlType.CheckBox && !this.Grid.Controls[ColNo].DataType)
            ElmById(this.Grid.id + '_' + this.Grid.Controls[ColNo].id + "_All").disabled = bool
        for (var RowNo = 0; RowNo < this.Grid.RowCount; RowNo++) {
            if (this.Grid.Controls[ColNo].AddProperty.indexOf('disabled') == -1 && this.Grid.Controls[ColNo].ControlType != ControlType.Button && this.Grid.Controls[ColNo].ControlType != ControlType.Label && this.Grid.Controls[ColNo].ControlType != ControlType.CheckBox && !this.GetControl(RowNo, ColNo).DisableFlag)
                this.GetControl(RowNo, ColNo).disabled = bool;
        }
    }
}
JSGrid.prototype.DisableRow = function (RowNo, bool) {
    for (var ColNo = 0; ColNo < this.ControlsCount(); ColNo++) {
        if (this.Grid.Controls[ColNo].AddProperty.indexOf('disabled') == -1 && this.Grid.Controls[ColNo].ControlType != ControlType.Button) {
            this.GetControl(RowNo, ColNo).disabled = bool;
            this.GetControl(RowNo, ColNo).DisableFlag = bool;
        }
    }
}
JSGrid.prototype.DisableRowFields = function (RowNo, bool) {
    for (var ColNo = 0; ColNo < this.ControlsCount(); ColNo++) {
        if (this.Grid.Controls[ColNo].AddProperty.indexOf('disabled') == -1 && this.Grid.Controls[ColNo].ControlType != ControlType.Button && this.Grid.Controls[ColNo].ControlType != ControlType.CheckBox) {
            this.GetControl(RowNo, ColNo).disabled = bool;
            this.GetControl(RowNo, ColNo).DisableFlag = bool;
        }
    }
}
JSGrid.prototype.Hide = function () {
    ElmById(this.Grid.id).style.display = 'none';
}
JSGrid.prototype.Show = function () {
    ElmById(this.Grid.id).style.display = '';
}
JSGrid.prototype.GetColumnWidth = function (Ind) {
    return ElmById(this.Grid.id + '_HeaderTR').childNodes[Ind].style.width;
}
JSGrid.prototype.ResizeColumn = function (Ind) {
    var fobj = nn6 ? e.target : event.srcElement;
    var topelement = nn6 ? "HTML" : "BODY";

    while (fobj.tagName != topelement && fobj.className != "dragme") {
        fobj = nn6 ? fobj.parentNode : fobj.parentElement;
    }

    isdrag = true;
    Grid = this;
    ColumnHeader = ElmById(this.Grid.id + '_HeaderCols').childNodes[(Ind * 2)];
    ColumnContent = ElmById(this.Grid.id + '_ContentCols').childNodes[Ind];
    if (this.isSummaryExist())
        ColumnSummary = ElmById(this.Grid.id + '_SummaryCols').childNodes[Ind];
    if (ElmById(this.Grid.id + '_ExtraFooter') != null)
        ColumnExtraFooter = ElmById(this.Grid.id + '_ExtraFooter').childNodes[Ind];
    window.document.onmousemove = Do_Resize;
    x = nn6 ? e.clientX : event.clientX;

}
JSGrid.prototype.SortData = function (COLID) {
    this.SortDataByIndex(this.GetIndex(COLID));
}
JSGrid.prototype.SortDataByIndex = function (COL_Index) {
    if (this.Grid.Controls[COL_Index].DataType == null) return;
    if (this.Grid.Controls[COL_Index].dataField === undefined || this.Grid.Controls[COL_Index].dataField.length === 0 || this.Grid.EnableSorting == false || this.Grid.Controls[COL_Index].Sortable == false)
        return;
    //if (COL_Index == null) {
    //    for (var x = 0; x < this.Grid.Controls.length; x++) {
    //        if (ElmById(this.Grid.id + "imgSort_" + COL_Index) != null) {
    //            COL_Index = x;
    //            break;
    //        }
    //    }
    //    if (COL_Index == null) return;
    //}
    objSorted = $("#" + this.Grid.id + "_HeaderTR>td:eq(" + COL_Index + ") img")[0];
    objSorted.style.display = '';
    if (this.SelectedColumn != null && this.SelectedColumn != COL_Index) {
        //ElmById(this.Grid.id + "imgSort_" + this.SelectedColumn).style.display = 'none';
        //this.Grid
    }
    if (objSorted.src.indexOf("UpArrow.gif") != -1 || this.SelectedColumn != COL_Index)
        objSorted.src = RootPre + "StaticTheme/Images/DownArrow.gif";
    else
        objSorted.src = RootPre + "StaticTheme/Images/UpArrow.gif"

    var XMLDoc;
    if (this.SelectedColumn != null && this.SelectedColumn == COL_Index && this.SortedBefore) {
        this._GridElement.reverse();
        if (this.CurrentChecked != null) {
            this.CurrentChecked = this._GridElement.length - this.CurrentChecked - 1;
        }
    }
    else {
        _OrderBy = this.Grid.Controls[COL_Index].dataField;
        _OrderType = this.Grid.Controls[COL_Index].DataType;
        CurrentCheckTemp = this.CurrentChecked;
        this._GridElement = this._GridElement.sort(function (a, b) { return SortJSON(a, b) });
        this.CurrentChecked = CurrentCheckTemp;
        this.SelectedColumn = COL_Index;
        this.SortedBefore = true;
    }
    this.SetData();
}
JSGrid.prototype.GetRowIndex = function (RowNo) {
    return parseInt(this.GetRowIndexByElmIndex(parseInt(this.GetElmIndex() + parseInt(RowNo, 10), 10)), 10);
}
JSGrid.prototype.GetRowIndexByElmIndex = function (ElmIndex) {
    return parseInt(this.GetValue(_ElmIndexField, parseInt(ElmIndex, 10)), 10);
}
JSGrid.prototype.RefreshDDLColumn = function (ColInd) {
    for (var RowNo = 0; RowNo < this.Grid.RowCount; RowNo++) {
        BindDDL(this.GetCTRLByIndex(ColInd, RowNo), this.Grid.Controls[ColInd].data, this.Grid.Controls[ColInd].dataTextField, this.Grid.Controls[ColInd].dataValueField, this.Grid.Controls[ColInd].required != true);
    }
    this.SetData(false);
}
JSGrid.prototype.SetDDLColumns = function () {
    var colcount = this.Grid.Controls.length,
        rowcount = this.Grid.RowCount;
    for (var ColInd = 0; ColInd < colcount; ColInd++)
        if (this.Grid.Controls[ColInd].ControlType == ControlType.ComboBox && this.Grid.Controls[ColInd].data != null)
            for (var RowNo = 0; RowNo < rowcount; RowNo++)
                BindDDL(this.GetCTRLByIndex(ColInd, RowNo), this.Grid.Controls[ColInd].data, this.Grid.Controls[ColInd].dataTextField, this.Grid.Controls[ColInd].dataValueField, this.Grid.Controls[ColInd].required != true);
}
JSGrid.prototype.FillDDLColumn = function (ColID, RowNo, Elms, DataTextField, DateValueField) {
    var ColInd = this.GetIndex(ColID);
    this.Grid.Controls[ColInd].Custom = true;
    BindDDL(this.GetCTRL(ColID, RowNo), Elms, isNull(DataTextField, this.Grid.Controls[ColInd].dataTextField), isNull(DateValueField, this.Grid.Controls[ColInd].dataValueField, this.Grid.Controls[ColInd].required != true));
    if (!this.Grid.SettingData)
        this.ChangeValue(ColInd, RowNo);
}
JSGrid.prototype.FilterData = function () {
    ShowDialog('JS/FilterGridData.aspx?GridID=' + this.id, 555, 300, null, false);
}
JSGrid.prototype.DoFilter = function () {
    OrgElms = this._OrignalGridElement;
    for (var x = 0; x < this.FilterCriteria.length; x++) {
        CurrentDataField = this.FilterCriteria[x].dataField;
        if (this.FilterCriteria[x].ControlType == ControlType.CheckBox) {
            CurrentFilter = (isNull(this.FilterCriteria[x].Condition, 0) == 1 ? 1 : 0)
            OrgElms = OrgElms.filter(Elm => { return isNull(Elm[CurrentDataField], 0) == CurrentFilter; });
        }
        else {
            var DataType = this.FilterCriteria[x].type.toUpperCase();
            if (DataType.indexOf("TEXT") !== -1) {
                CurrentFilter = isNull(this.FilterCriteria[x].Value, "").toString().toUpperCase();
                if (CurrentFilter.length !== 0) {
                    if (isNull(this.FilterCriteria[x].Condition, 1) == 1) {
                        OrgElms = OrgElms.filter(Elm => { return this.GetValueFromElement(Elm, CurrentDataField, "").toUpperCase().match(new RegExp(CurrentFilter.replace("\\", "\\\\").replace("(", "\("))); });
                    }
                    else if (isNull(this.FilterCriteria[x].Condition, 1) == 2) {
                        OrgElms = OrgElms.filter(Elm => { return this.GetValueFromElement(Elm, CurrentDataField, "").toUpperCase().indexOf(CurrentFilter) >= 0 });
                    }
                    else if (isNull(this.FilterCriteria[x].Condition, 1) == 3) {
                        OrgElms = OrgElms.filter(Elm => { let val = this.GetValueFromElement(Elm, CurrentDataField, ""); return val.toUpperCase().indexOf(CurrentFilter) == (val.length - CurrentFilter.length); });
                    }
                }
            }
            else if (DataType.indexOf("NUMBER") !== -1) {
                if (isNull(this.FilterCriteria[x].Condition, 1) == 1) {
                    CurrentFilter = isNull(this.FilterCriteria[x].FromValue, "").toString().toUpperCase();
                    CurrentFilter1 = isNull(this.FilterCriteria[x].ToValue, "").toString().toUpperCase();
                    if (CurrentFilter.length > 0 && CurrentFilter1.length > 0)
                        OrgElms = OrgElms.filter(Elm => { let val = parseFloat(this.GetValueFromElement(Elm, CurrentDataField, 0)); return val >= parseFloat(CurrentFilter) && val <= parseFloat(CurrentFilter1); });
                }
                else if (isNull(this.FilterCriteria[x].Condition, 1) == 2) {
                    CurrentFilter = isNull(this.FilterCriteria[x].Value, "").toString().toUpperCase();
                    if (CurrentFilter.length > 0)
                        OrgElms = OrgElms.filter(Elm => { return parseFloat(this.GetValueFromElement(Elm, CurrentDataField, 0)) >= parseFloat(CurrentFilter); });
                }
                else if (isNull(this.FilterCriteria[x].Condition, 1) == 3) {
                    CurrentFilter = isNull(this.FilterCriteria[x].Value, "").toString().toUpperCase();
                    if (CurrentFilter.length > 0)
                        OrgElms = OrgElms.filter(Elm => { return parseFloat(this.GetValueFromElement(Elm, CurrentDataField, 0)) <= parseFloat(CurrentFilter); });
                }
                else if (isNull(this.FilterCriteria[x].Condition, 1) == 4) {
                    CurrentFilter = isNull(this.FilterCriteria[x].Value, "").toString().toUpperCase();
                    if (CurrentFilter.length > 0)
                        OrgElms = OrgElms.filter(Elm => { return parseFloat(this.GetValueFromElement(Elm, CurrentDataField, 0)) == parseFloat(CurrentFilter); });
                }
            }
            else if (DataType.indexOf("DATE") !== -1) {
                if (isNull(this.FilterCriteria[x].Condition, 1) == 1) {
                    CurrentFilter = isNull(this.FilterCriteria[x].FromValue, "").toString().toUpperCase();
                    CurrentFilter1 = isNull(this.FilterCriteria[x].ToValue, "").toString().toUpperCase();
                    if (CurrentFilter.length > 0 && CurrentFilter1.length > 0)
                        OrgElms = OrgElms.filter(Elm => { let val = this.GetValueFromElement(Elm, CurrentDataField, TodayDate()); return CompareDate(val, CurrentFilter) == 1 && CompareDate(CurrentFilter1, val) == 1; });
                }
                else if (isNull(this.FilterCriteria[x].Condition, 1) == 2) {
                    CurrentFilter = isNull(this.FilterCriteria[x].Value, "").toString().toUpperCase();
                    if (CurrentFilter.length > 0)
                        OrgElms = OrgElms.filter(Elm => { return CompareDate(CurrentFilter, this.GetValueFromElement(Elm, CurrentDataField, TodayDate())) == 1; });
                }
                else if (isNull(this.FilterCriteria[x].Condition, 1) == 3) {
                    CurrentFilter = isNull(this.FilterCriteria[x].Value, "").toString().toUpperCase();
                    if (CurrentFilter.length > 0)
                        OrgElms = OrgElms.filter(Elm => { return CompareDate(this.GetValueFromElement(Elm, CurrentDataField, TodayDate()), CurrentFilter) == 1; });
                }
            }
        }
    }
    this._GridElement = OrgElms
    this.Grid.SelectedRowsCount = 0;
    //    this._UpdateSelectedRowCount();
    this.SetData();
    this.SetPager();
}
JSGrid.prototype.DeleteFilter = function () {
    this.FilterCriteria = [];
    this.Grid.SelectedRowsCount = 0;
    this._GridElement = this._OrignalGridElement;
    for (var x = 0; x < this.Grid.Controls.length; x++) {
        if (ElmById("QF" + this.Grid.id + '_' + this.Grid.Controls[x].id) != null)
            ElmById("QF" + this.Grid.id + '_' + this.Grid.Controls[x].id).value = '';
    }
    this.SetData();
    this.SetPager();
}
JSGrid.prototype.QFilter = function (x) {
    var FilterIndex = this.FilterCriteria.length;
    for (var Ind = 0; Ind < this.FilterCriteria.length; Ind++) {
        if (this.FilterCriteria[Ind].ColumnID == this.Grid.Controls[x].id && this.FilterCriteria[Ind].Condition == 2) {
            FilterIndex = Ind;
            break;
        }
    }
    if (ElmById("QF" + this.Grid.id + '_' + this.Grid.Controls[x].id) == null ||  ElmById("QF" + this.Grid.id + '_' + this.Grid.Controls[x].id).value.length == 0 || (this.Grid.Controls[x].QFilterType == ControlType.ComboBox && ElmById("QF" + this.Grid.id + '_' + this.Grid.Controls[x].id).value == 0)) {
        this.FilterCriteria.splice(FilterIndex,1);
    }
    else {
        this.FilterCriteria[FilterIndex] = { ColumnID: this.Grid.Controls[x].id,
            dataField: this.Grid.Controls[x].dataField,
            ControlType: this.Grid.Controls[x].ControlType,
            type: this.Grid.Controls[x].type,
            Condition: 2,
            Value: ElmById("QF" + this.Grid.id + '_' + this.Grid.Controls[x].id).value
        };
    }
    this.DoFilter();
}
JSGrid.prototype.ShowHideQFilter = function () {
    toggle(ElmById(this.Grid.id + "_QFilterTR"));
}
JSGrid.prototype.AddNewRow = function () {
    this.AddElements({}, true);
    let newRowEvent = { grid: this, rowNo: this.GetRowNo(this._GridElement.length - 1), ElementIndex: this._GridElement.length - 1};
    if (this.Grid.OnNewRow != null)
        if (handleEvent(this.Grid.OnNewRow, newRowEvent) == false)
            this._GridElement.splice(this._GridElement.length - 1, 1);
}
function ToBoolean(Value) {
    if (Value == null || Value == 0 || Value == "false" || Value == false)
        return false;
    return true;
}
function FromBoolean(Value) {
    if (Value)
        return 1;
    else
        return 0;
}
function SortJSON(a, b) {
    if (_OrderType == null) return;
    _OrderType = _OrderType.toUpperCase();
    if (_OrderType.indexOf("CHAR") != -1 || _OrderType.indexOf("TEXT") != -1) {
        FirstValue = isNull(a[_OrderBy], "").toUpperCase();
        return ([FirstValue, isNull(b[_OrderBy], "").toUpperCase()].sort()[0] == FirstValue ? -1 : 1);
    }
    else if (_OrderType.indexOf("DOUBLE") != -1 || _OrderType.indexOf("DECIMAL") != -1 || _OrderType.indexOf("NUMERIC") != -1 || _OrderType.indexOf("INT") != -1) {
        return parseFloat(isNull(a[_OrderBy])) - parseFloat(isNull(b[_OrderBy]));
    }
    else if (_OrderType.indexOf("DATETIME") != -1) {
        return CompareDate(a[_OrderBy], b[_OrderBy]);
    }
    else if (_OrderType.indexOf("BIT") != -1) {
        return (isNull(a[_OrderBy], 0) > isNull(b[_OrderBy], 0) ? 1 : -1);
    }
}
function GetBoolean(Value) {
    return Value;
}
function Do_Resize(e) {
    var Event = nn6 ? e : event;
    var xChange;
    if (isdrag) {
        if (document.dir == 'rtl') {
            xChange = Event.clientX - x;
            if (parseInt(ColumnHeader.style.width.replace('px', ''), 10) - xChange > 0) {
                ColumnHeader.style.width = parseInt(ColumnHeader.style.width.replace('px', ''), 10) - xChange + 'px';
                ColumnContent.style.width = parseInt(ColumnContent.style.width.replace('px', ''), 10) - xChange + 'px';
                if (ColumnSummary !== undefined)
                    ColumnSummary.style.width = parseInt(ColumnSummary.style.width.replace('px', ''), 10) - xChange + 'px';
                if (ColumnExtraFooter != null)
                    ColumnExtraFooter.style.width = parseInt(ColumnExtraFooter.style.width.replace('px', ''), 10) - xChange + 'px';
            }
        }
        else {
            xChange = Event.clientX - x;
            if (xChange + parseInt(ColumnHeader.style.width.replace('px', ''), 10) > 0) {
                ColumnHeader.style.width = parseInt(ColumnHeader.style.width.replace('px', ''), 10) + xChange + 'px';
                ColumnContent.style.width = parseInt(ColumnContent.style.width.replace('px', ''), 10) + xChange + 'px';
                if (ColumnSummary !== undefined)
                    ColumnSummary.style.width = parseInt(ColumnSummary.style.width.replace('px', ''), 10) + xChange + 'px';
                if (ColumnExtraFooter != null)
                    ColumnExtraFooter.style.width = parseInt(ColumnExtraFooter.style.width.replace('px', ''), 10) + xChange + 'px';
            }
        }
        x = Event.clientX;
        Grid._SetDivHeight();
        return false;
    }
}
JSGrid.prototype.ExportData = function () {
    let headers = [], width=[];
    this.Grid.Controls.forEach(control => {
        if (control.dataField && control.dataField != "CheckedStatus") {
            headers.push(control.LabelText);
            width.push({ wch: 10 });
        }
    })
    const rows = this.GetAllElement().map((item) => {
        let newItem = {};
        let index = 0;
        this.Grid.Controls.forEach(control => {
            if (control.dataField && control.dataField != "CheckedStatus") {
                newItem[control.dataField] = this.GetValueFromElement(item, control.dataField, '');

                if (newItem[control.dataField] != "" && control.data != null && control.dataTextField != null && control.dataValueField != null) {
                    newItem[control.dataField] = control.data.find(obj => obj[control.dataValueField] == newItem[control.dataField])[control.dataTextField];
                }
                if (newItem[control.dataField].length > width[index].wch)
                    width[index].wch = newItem[control.dataField].length;
                index++;
            }
        })
        return newItem;
    });

    /* generate worksheet and workbook */
    const worksheet = XLSX.utils.json_to_sheet(rows);
    let workbook;
    if (document.dir == "rtl")
        workbook = { Workbook: { Views: [{ RTL: true }] }, Sheets: {}, SheetNames: [] };
    else
        workbook = { Workbook: { Views: [{ }] }, Sheets: {}, SheetNames: [] };
    XLSX.utils.book_append_sheet(workbook, worksheet, "Data");

    /* fix headers */
    XLSX.utils.sheet_add_aoa(worksheet, [headers], { origin: "A1" });

    ///* calculate column width */
    worksheet["!cols"] = width;
    let d = new Date();
    let datestring = ("0" + d.getDate()).slice(-2) + "-" + ("0" + (d.getMonth() + 1)).slice(-2) + "-" +
        d.getFullYear() + " " + ("0" + d.getHours()).slice(-2) + "-" + ("0" + d.getMinutes()).slice(-2);
    let filename = window.location.pathname;
    filename = `${filename.substr(filename.lastIndexOf('/') + 1)}_${datestring}.xlsx`;
    XLSX.writeFile(workbook, filename);

}
