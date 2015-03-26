
/*jslint browser: true, node: true */
/*global $, PAPAYA_MENU_ICON_CSS, PAPAYA_MENU_BUTTON_CSS, PAPAYA_MENU_UNSELECTABLE, PAPAYA_MENU_TITLEBAR_CSS,
 PAPAYA_TITLEBAR_CSS, PAPAYA_MENU_LABEL_CSS, PAPAYA_MENU_CSS, PAPAYA_MENU_BUTTON_HOVERING_CSS */

"use strict";

/*** Imports ***/
var papaya = papaya || {};
papaya.ui = papaya.ui || {};


/*** Constructor ***/
papaya.ui.Menu = papaya.ui.Menu || function (viewer, menuData, callback, dataSource, modifier) {
    this.viewer = viewer;
    this.method = menuData.method;
    this.isTitleBar = menuData.titleBar;
    this.label = menuData.label;
    this.icons = menuData.icons;
    this.callback = callback;
    this.dataSource = dataSource;
    this.items = [];
    this.rangeItem = null;
    this.menuOnHover = menuData.menuOnHover;

    if ((modifier === undefined) || (modifier === null)) {
        this.imageIndex = -1;
        this.modifier = this.viewer.container.containerIndex;
    } else {
        this.imageIndex = modifier;
        this.modifier = modifier + this.viewer.container.containerIndex;
    }

    this.buttonId = this.label.replace(/ /g, "_").replace("...", "_") + (this.modifier || "");
    this.menuId = (this.label + "Menu").replace(/ /g, "_").replace("...", "_") + (this.modifier || "");
    this.isRight = (menuData.icons !== null);
    this.isImageButton = menuData.imageButton;
};


/*** Static Methods ***/
// adapted from: http://stackoverflow.com/questions/158070/jquery-how-to-position-one-element-relative-to-another
papaya.ui.Menu.doShowMenu = function (viewer, el, menu, right) {
    var posV, pos, eWidth, mWidth, left, top;

    //get the position of the placeholder element
    posV = $(viewer.canvas).offset();
    pos = $(el).offset();
    eWidth = $(el).outerWidth();
    mWidth = $(menu).outerWidth();
    left = (right ? ((-1 * mWidth) + eWidth + 5) : 5) +  "px";//- 420

    top = (posV.top) + "px";
    //show the menu directly over the placeholder
    $(menu).css({
        position: 'absolute',
        zIndex: 100,
        left: left,
        top: '28px'//"36px"
    });

    $(menu).hide().fadeIn(200);
};



papaya.ui.Menu.getColorComponents = function (rgbStr) {
    if (rgbStr) {
        return rgbStr.match(/\d+/g);
    }

    return [0, 0, 0, 255];
};



papaya.ui.Menu.getNiceForegroundColor = function (rgbStr) {
    var colors = papaya.ui.Menu.getColorComponents(rgbStr);

    var avg = (parseInt(colors[0]) + parseInt(colors[1]) + parseInt(colors[2])) / 3;

    if (avg > 127) {
        colors[0] = colors[1] = colors[2] = 0;
    } else {
        colors[0] = colors[1] = colors[2] = 255;
    }

    return ("rgb(" + colors[0] + ", " + colors[1] + ", " + colors[2] + ")");
};


/*** Prototype Methods ***/

papaya.ui.Menu.prototype.buildMenuButton = function () {
    var html, menu, buttonHtml, buttonHtmlId, buttonImgHtml, buttonImgHtmlId, toolbarHtml;

    buttonHtmlId = "#" + this.buttonId;
    buttonHtml = $(buttonHtmlId);
    buttonHtml.remove();

    toolbarHtml = this.viewer.container.toolbarHtml;

    html = null;

    if (this.icons) {
        html = "<span class='" + PAPAYA_MENU_BUTTON_CONTAINER + "'" + (this.isRight ? " style='float:right'" : "") +
            "><span id='" + this.buttonId + "' class='" + PAPAYA_MENU_UNSELECTABLE + " " + PAPAYA_MENU_ICON_CSS +
            " " + (this.isImageButton ? PAPAYA_MENU_BUTTON_CSS : "")  + "'>" +
            "<img class='" + PAPAYA_MENU_UNSELECTABLE +
            "' style='width:" + papaya.viewer.ColorTable.ICON_SIZE + "px; height:" +
            papaya.viewer.ColorTable.ICON_SIZE + "px; vertical-align:bottom; ";

        if (this.dataSource.isSelected(parseInt(this.imageIndex, 10))) {
            html += "border:2px solid #FF5A3D;background-color:#eeeeee;padding:1px;";
        } else {
            html += "border:2px outset lightgray;background-color:#eeeeee;padding:1px;";
        }

        if (this.method) {
            html += ("' src='" + this.icons[papaya.utilities.ObjectUtils.bind(this.viewer, papaya.utilities.ObjectUtils.dereferenceIn(this.viewer, this.method))() ? 1 : 0] +
                "' /></span>");
        } else {
            html += ("' src='" + this.icons[0] + "' /></span></span>");
        }
    } else if (this.isTitleBar) {
        html = "<div class='" + PAPAYA_MENU_UNSELECTABLE + " " + PAPAYA_MENU_TITLEBAR_CSS + " " + PAPAYA_TITLEBAR_CSS +
            "' style='z-index:-1;position:absolute;top:" +
            (this.viewer.container.viewerHtml.position().top - 1.25 * papaya.ui.Toolbar.SIZE) + "px;width:" +
            toolbarHtml.width() + "px;text-align:center;color:" + papaya.ui.Menu.getNiceForegroundColor(this.viewer.bgColor) + "'>" +
            this.label + "</div>";
    } else {
        html = "<span class='" + PAPAYA_MENU_BUTTON_CONTAINER + "'><span id='" + this.buttonId + "' class='" + PAPAYA_MENU_UNSELECTABLE + " " +
            PAPAYA_MENU_LABEL_CSS + "'>" + this.label + "</span></span>";
    }

    toolbarHtml.append(html);

    if (!this.isTitleBar) {
        buttonHtml = $(buttonHtmlId);
        buttonImgHtmlId = "#" + this.buttonId + " > img";
        buttonImgHtml = $(buttonImgHtmlId);

        menu = this;

        if (this.menuOnHover) {
            buttonImgHtml.mouseenter(function () { menu.showHoverMenuTimeout = setTimeout(papaya.utilities.ObjectUtils.bind(menu, menu.showMenu),
                500); });
            buttonImgHtml.mouseleave(function () { clearTimeout(menu.showHoverMenuTimeout);
                menu.showHoverMenuTimeout = null; });
        }

        buttonHtml.click(papaya.utilities.ObjectUtils.bind(this, this.doClick));

        if (this.icons) {
            buttonImgHtml.hover(
                function () {
                    if (menu.icons.length > 1) {
                        $(this).css({"border-color": "gray"});
                    } else {
                        $(this).css({"border-color": "#FF5A3D"});
                    }
                },
                papaya.utilities.ObjectUtils.bind(menu, function () {
                    if (menu.dataSource.isSelected(parseInt(menu.imageIndex, 10)) && menu.dataSource.isSelectable()) {
                        $("#" + menu.buttonId + " > img").css({"border": "2px solid #FF5A3D"});
                    } else {
                        $("#" + menu.buttonId + " > img").css({"border": "2px outset lightgray"});
                    }
                })
            );

            buttonImgHtml.mousedown(function () {
                $(this).css({ 'border': '2px inset lightgray' });
            });

            buttonImgHtml.mouseup(function () {
                $(this).css({ 'border': '2px outset lightgray' });
            });
        } else if (!this.isTitleBar) {
            buttonHtml.hover(function () {$(this).toggleClass(PAPAYA_MENU_BUTTON_HOVERING_CSS); });
        }
    }

    return this.buttonId;
};



papaya.ui.Menu.prototype.setMenuButton = function (buttonId) {
    this.buttonId = buttonId;
};



papaya.ui.Menu.prototype.buildMenu = function (element) {
    var ctr, html, buttonHtml;

    html = "<ul id='" + this.menuId + "' class='" + PAPAYA_MENU_CSS + "'></ul>";
    if (element) {
        element.append(html);
    } else {
        this.viewer.container.toolbarHtml.append(html);
    }

    for (ctr = 0; ctr < this.items.length; ctr += 1) {
        buttonHtml = this.items[ctr].buildHTML(this.menuId);
    }
};



papaya.ui.Menu.prototype.addMenuItem = function (menuitem) {
    if (menuitem instanceof papaya.ui.MenuItemRange) {
        this.rangeItem = menuitem;
    }

    this.items.push(menuitem);
};



papaya.ui.Menu.prototype.showMenu = function () {
    var isShowing, button, menuHtml, menuHtmlId;

    if (this.items.length > 0) {
        menuHtmlId = "#" + this.menuId;
        menuHtml = $(menuHtmlId);

        isShowing = menuHtml.is(":visible");

        menuHtml.remove();

        if (!isShowing) {
            button = $("#" + this.buttonId);
            this.buildMenu(button.parent());
            menuHtml = $(menuHtmlId);
            menuHtml.hide();
            papaya.ui.Menu.doShowMenu(this.viewer, button[0], menuHtml[0], this.isRight);
        }
    }
};



papaya.ui.Menu.prototype.doClick = function () {
    var isShowing, menuHtml, menuHtmlId;
    menuHtmlId = "#" + this.menuId;
    menuHtml = $(menuHtmlId);
    isShowing = menuHtml.is(":visible");

    this.callback(this.buttonId);

    if (this.icons) {
        if (this.method) {
            $("#" + this.buttonId + " > img").attr("src", this.icons[papaya.utilities.ObjectUtils.bind(this.viewer,
                papaya.utilities.ObjectUtils.dereferenceIn(this.viewer, this.method))() ? 1 : 0]);
        } else {
            $("#" + this.buttonId + " > img").attr("src", this.icons[0]);
        }
    }

    if (!this.menuOnHover && !isShowing) {
        this.showMenu();
    }
};



papaya.ui.Menu.prototype.updateRangeItem = function (min, max) {
    if (this.rangeItem) {
        $("#" + this.rangeItem.minId).val(min);
        $("#" + this.rangeItem.maxId).val(max);
    }
};
