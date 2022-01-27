/*
 * MENUSYSTEM.JS (MODULE)
 *
 * Author:              Jong
 * URL:                 https://smto.pw/mpv
 * License:             MIT License
 *
 */

/*
TODO:

(overlay) Scaling issues
AutoClose
Mouse support?
--> Calculate boundaries for each menuitem
--> Hook MouseClick mpv event, check if in any boundary, handle as 'open' event if yes

*/

/*----------------------------------------------------------------
How to use:

Create a new instance of MenuSystem.Menu(Settings,Items[,Parent])

Settings must be an object and can have the following properties:
    autoClose
    fontSize
    image
    title
    titleColor
    description
    descriptionColor
    itemPrefix
    itemSuffix
    itemColor
    selectedItemColor
    enableMouseSupport
All of these have default values.

Items is an array of objects that can have the following properties:
    title
    item
    [description]
    [color]
title and item are required.

Parent is another instance of MenuSystem.Menu, if provided, a Back button
will appear as the first item of the Menu.

Then just assign a function the instance handler:
<MenuInstance>.handler = function (event, action) {};
where event is the pressed key (left,right or enter) and
action is the item value of the menu entry.

Optional: Set MenuSystem.displatMethod = "overlay" (default is "message")
This will use mpv's osd-overlay system instead of just using the regular mp.osd_message().
The main benefit is that all other messages will appear below the menu,
making it "unbreakable".
----------------------------------------------------------------*/

var Ass = require("./AssFormat");
var OSD = require("./OSD");

var Menus = {};
Menus.displayMethod = "message";

Menus.keybindOverrides = [
    // Normal
    {
        key: "up",
        id: "kbd_up",
        action: "up"
    },
    {
        key: "down",
        id: "kbd_down",
        action: "down"
    },
    {
        key: "left",
        id: "kbd_left",
        action: "left"
    },
    {
        key: "right",
        id: "kbd_right",
        action: "right"
    },
    {
        key: "enter",
        id: "kbd_enter",
        action: "enter"
    },

    // Keypad
    {
        key: "kp8",
        id: "kbd_kp8",
        action: "up"
    },
    {
        key: "kp2",
        id: "kbd_kp2",
        action: "down"
    },
    {
        key: "kp4",
        id: "kbd_kp4",
        action: "left"
    },
    {
        key: "kp6",
        id: "kbd_kp6",
        action: "right"
    },
    {
        key: "kp0",
        id: "kbd_kp0",
        action: "enter"
    },
    {
        key: "kp_enter",
        id: "kbd_kp_enter",
        action: "enter"
    },
    {
        key: "kp_ins",
        id: "kbd_kp_ins",
        action: "enter"
    },
    {
        key: "8",
        id: "kbd_8",
        action: "up"
    },
    {
        key: "2",
        id: "kbd_2",
        action: "down"
    },
    {
        key: "4",
        id: "kbd_4",
        action: "left"
    },
    {
        key: "6",
        id: "kbd_6",
        action: "right"
    },
    {
        key: "0",
        id: "kbd_0",
        action: "enter"
    },
];

Menus.Menu = function (settings, items, parentMenu) // constructor
{
    this.settings = {};
    /*
    autoClose
    fontSize
    image
    title
    titleColor
    description
    descriptionColor
    itemPrefix
    itemSuffix
    itemColor
    selectedItemColor
    enableMouseSupport
    */
    this.items = items;
    /*
    title
    item
    [description]
    [color]
    */

    if (settings.autoClose != undefined)
    {
        this.settings.autoClose = settings.autoClose;
    } else { this.settings.autoClose = 5; }

    if (settings.fontSize != undefined)
    {
        this.settings.fontSize = settings.fontSize;
    } 
    else 
    { 
        if(Menus.displayMethod == "message")
        {
            this.settings.fontSize = 11;
        }
        else if(Menus.displayMethod == "overlay")
        {
            this.settings.fontSize = 33;
        }
    }

    if (settings.image != undefined)
    {
        this.settings.image = settings.image;
    } else { this.settings.image = undefined; }

    if (settings.title != undefined)
    {
        this.settings.title = settings.title;
    } else { this.settings.title = "no title defined"; }

    if (settings.titleColor != undefined)
    {
        this.settings.titleColor = settings.titleColor;
    } else { this.settings.titleColor = "FFFFFF"; }

    if (settings.description != undefined)
    {
        this.settings.description = settings.description;
    } else { this.settings.description = undefined; }

    if (settings.descriptionColor != undefined)
    {
        this.settings.descriptionColor = settings.descriptionColor;
    } else { this.settings.descriptionColor = "FFFFFF"; }

    if (settings.itemPrefix != undefined)
    {
        this.settings.itemPrefix = settings.itemPrefix + " ";
    } else { this.settings.itemPrefix = "➤ "; }

    if (settings.itemSuffix != undefined)
    {
        this.settings.itemSuffix = settings.itemSuffix;
    } else { this.settings.itemSuffix = "✓"; }

    if (settings.itemColor != undefined)
    {
        this.settings.itemColor = settings.itemColor;
    } else { this.settings.itemColor = "FFFFFF"; }

    if (settings.selectedItemColor != undefined)
    {
        this.settings.selectedItemColor = settings.selectedItemColor;
    } else { this.settings.selectedItemColor = "740a58"} //"EB4034"

    if (settings.enableMouseSupport != undefined)
    {
        this.settings.enableMouseSupport = settings.enableMouseSupport;
    } else { this.settings.enableMouseSupport = false; }

    if (parentMenu != undefined)
    {
        this.hasBackButton = true;
        this.parentMenu = parentMenu;
        this.items.unshift({
            title: Ass.insertSymbolFA("",this.settings.fontSize-3,this.settings.fontSize) +" Back\n\n", // ↑ 
            item: "@back@",
            color: "999999"
        });
    } else { this.hasBackButton = false; this.parentMenu = undefined; }

    this.cachedMenuText = "";
    this.isMenuVisible = false;
    this.suffixCacheIndex = -1;
}

Menus.Menu.prototype.setDescription = function (text) {
    this.settings.description = text;
}

Menus.Menu.prototype.redrawMenu = function () {
    this._constructMenuCache();
    this._drawMenu();
}

Menus.Menu.prototype._constructMenuCache = function ()
{
    /*
        Differences between displayMethods

        "message" displayMethod:
        - Requires Ass.startSeq() at the beginning and Ass.stopSeq() at the end
        - does not really care about line breaks, \n will always work
        - does not allow much flexibility, but is easy to work with
        - will fight with other mp.osd_message overlays, which causes flicker

        "overlay" displayMethod:
        - Every line is treated as its own SSA object,
            colors and settings do not carry over after \n
            - This is why Ass.startSeq()/Ass.stopSeq() are not needed
        - is much harder to work with because of that
        - will always be on top of every mp.osd_message

        Both _should_ look the same, but ensuring that is not easy.

        Documentation for SSA specification
        http://www.tcax.org/docs/ass-specs.htm
    */

    this.allowDrawImage = false;
    this.itemCount = 0;

    // Start
    this.cachedMenuText = "";
    if(Menus.displayMethod == "message")
    {
        this.cachedMenuText += Ass.startSeq();
        this.cachedMenuText += Ass.setFont("Roboto");
        this.cachedMenuText += Ass.size(this.settings.fontSize);

        // Title
        var title = this.settings.title;
        if(this.settings.image != undefined)
        {
            if(
                mp.get_property("osd-height") >= 1060 &&
                mp.get_property("osd-height") <= 1100 ||
                mp.get_property("osd-height") >= 1420 &&
                mp.get_property("osd-height") <= 1460 ||
                mp.get_property("osd-height") >= 2140 &&
                mp.get_property("osd-height") <= 2180
            )
            {
                title = "        ";
                this.allowDrawImage = true;
            }
        }
        this.cachedMenuText += Ass.size(this.settings.fontSize + 2) + Ass.color(this.settings.titleColor) + title + Ass.size(this.settings.fontSize) + "\n \n";

        // Description
        if(this.settings.description != undefined)
        {
            this.cachedMenuText += Ass.size(this.settings.fontSize - 3) + Ass.color(this.settings.descriptionColor) + this.settings.description + Ass.size(this.settings.fontSize) + "\n \n";
        }

        // Items
        for (var i = 0; i < this.items.length; i++)
        {
            var currentItem = this.items[i];
            var title = currentItem.title;
            var color = "";
            var description = "";

            if (currentItem.color != undefined)
            {
                color = Ass.color(currentItem.color);
            } else { color = Ass.color(this.settings.itemColor); }

            if (currentItem.description != undefined)
            {
                description = Ass.size(this.settings.fontSize - 5) + color + " " + currentItem.description.replaceAll("\n","\n ") + Ass.white() + Ass.size(this.settings.fontSize) + "\n";
            }

            if(this.selectedItemIndex == i)
            {
                color = Ass.color(this.settings.selectedItemColor);
                title = this.settings.itemPrefix + title;
            }

            if(i == this.suffixCacheIndex)
            {
                title += this.settings.itemSuffix;
            }
        
            this.cachedMenuText += color + title + Ass.size(this.settings.fontSize) + Ass.white() + "\n" + description;
        }

        // End
        this.cachedMenuText += Ass.stopSeq();
    }
    
    if(Menus.displayMethod == "overlay")
    {
        var scale = Ass.scale(Math.floor(mp.get_property("osd-height")/10.8)); // Scale to current window height

        this.cachedMenuText += Ass.size(this.settings.fontSize);
        this.cachedMenuText += Ass.setFont("Roboto");

        // Title
        var title = this.settings.title;
        if(this.settings.image != undefined)
        {
            if(
                mp.get_property("osd-height") >= 1060 &&
                mp.get_property("osd-height") <= 1100 ||
                mp.get_property("osd-height") >= 1420 &&
                mp.get_property("osd-height") <= 1460 ||
                mp.get_property("osd-height") >= 2140 &&
                mp.get_property("osd-height") <= 2180
            )
            {
                title = "        ";
                this.allowDrawImage = true;
            }
        }
        this.cachedMenuText += scale + Ass.setFont("Roboto") + Ass.size(this.settings.fontSize + 2) + Ass.color(this.settings.titleColor) + title + Ass.size(this.settings.fontSize)+ "\n \n";

        // Description
        var descriptionSizeModifier = -10;

        if(this.settings.description != undefined)
        {
            var mainDescription = scale + Ass.setFont("Roboto") + Ass.size(this.settings.fontSize + descriptionSizeModifier) + Ass.color(this.settings.descriptionColor) + this.settings.description.replaceAll("\n","\n"+scale+Ass.setFont("Roboto") + Ass.size(this.settings.fontSize + descriptionSizeModifier)+Ass.color(this.settings.descriptionColor));
    
            this.cachedMenuText += mainDescription + Ass.size(this.settings.fontSize) + "\n";
        }

        // Items
        for (var i = 0; i < this.items.length; i++)
        {
            var currentItem = this.items[i];
            var title = currentItem.title.replaceAll("\n\n","\n \n");
            var color = "";
            var description = "";

            if (currentItem.color != undefined)
            {
                color = Ass.color(currentItem.color);
            } else { color = Ass.color(this.settings.itemColor); }

            if (currentItem.description != undefined)
            {
                description = scale + Ass.size(this.settings.fontSize + descriptionSizeModifier) + color + " " + currentItem.description.replaceAll("\n","\n"+scale+Ass.size(this.settings.fontSize + descriptionSizeModifier - 2)+" ") + Ass.white() + Ass.size(this.settings.fontSize) + "\n";
            }

            if(this.selectedItemIndex == i)
            {
                color = Ass.color(this.settings.selectedItemColor);
                title = Ass.size(this.settings.fontSize) + this.settings.itemPrefix + title;
            } else {title = Ass.size(this.settings.fontSize) + title}

            if(i == this.suffixCacheIndex)
            {
                var count = (title.match(/\\n/g) || []).length;
                if(count > 1)
                {
                    title = title.replaceAll("\n","") + this.settings.itemSuffix;
                    for(var i = 0; i < count; i++)
                    {
                        title += "\n";
                    }
                } 
                else
                {
                    title = title.replaceAll("\n","") + this.settings.itemSuffix + "\n";
                }
                
            }
        
            this.cachedMenuText += scale + color + Ass.setFont("Roboto") + title + Ass.size(this.settings.fontSize) + Ass.white() + "\n" + scale + Ass.setFont("Roboto") + description;
        }
    }
    
}

Menus.Menu.prototype.AppendSuffixToCurrentItem = function () {
    this.suffixCacheIndex = this.selectedItemIndex;
    this._constructMenuCache();
    this._drawMenu();
}

Menus.Menu.prototype.RemoveSuffix = function () {
    this.suffixCacheIndex = -1;
    //this._constructMenuCache();
    //this._drawMenu();
}

Menus.Menu.prototype.getSelectedItem = function () {
    return this.items[this.selectedItemIndex];
}

Menus.Menu.prototype._overrideKeybinds = function () 
{
    var tempFunction = function (x, action) {
        return function () {
          x._keyPressHandler(action);
        };
      };

    for(var i = 0; i < Menus.keybindOverrides.length; i++)
    {
        var currentKey = Menus.keybindOverrides[i];

        mp.add_forced_key_binding(
            currentKey.key,
            currentKey.id,
            tempFunction(this, currentKey.action),
            { repeatable: true }
          );
    }
}

Menus.Menu.prototype._revertKeybinds = function () 
{
    for(var i = 0; i < Menus.keybindOverrides.length; i++)
    {
        var currentKey = Menus.keybindOverrides[i];

        mp.remove_key_binding(
            currentKey.id
          );
    }
}

Menus.Menu.prototype._keyPressHandler = function (action) 
{
    if (action == "up")
    {
        if(this.selectedItemIndex != 0) {this.selectedItemIndex = this.selectedItemIndex - 1;}
        this._constructMenuCache();
        this._drawMenu();
    }
    else if (action == "down")
    {
        if(this.selectedItemIndex != this.items.length - 1) {this.selectedItemIndex += 1;}
        this._constructMenuCache();
        this._drawMenu();
    }
    else
    {
        var item = this.items[this.selectedItemIndex].item
        if(item == "@back@")
        {
            this.toggleMenu();
            this.parentMenu.toggleMenu();
        } 
        else 
        {
            this.handler(action,item);
            if (action != "enter")
            {
                this._constructMenuCache();
                this._drawMenu();
            }
        }
    }

}

Menus.Menu.prototype._initOSD = function () {
    if(Menus.displayMethod == "overlay")
    {
        if (this.OSD == undefined)
        {
            this.OSD = mp.create_osd_overlay("ass-events");
            this.OSD.res_y = mp.get_property("osd-height");
            this.OSD.res_x = mp.get_property("osd-width");
        }
    }
}

Menus.Menu.prototype._drawMenu = function () {

    if(Menus.displayMethod == "message")
    {
        mp.osd_message(this.cachedMenuText, 1000);
    }

    if(Menus.displayMethod == "overlay")
    {
        this._initOSD()
        this.OSD.data = this.cachedMenuText;
        this.OSD.update();
    }
}

Menus.Menu.prototype._startTimer = function () {
    if(Menus.displayMethod == "message") 
    {
        var x = this;
        if (this.menuInterval != undefined) clearInterval(this.menuInterval);
        this.menuInterval = setInterval(function () {
            x._constructMenuCache();
            x._drawMenu();
        }, 1000);
    }
}

Menus.Menu.prototype._stopTimer = function () {
    if(Menus.displayMethod == "message") 
    {
        if (this.menuInterval != undefined) {
            clearInterval(this.menuInterval);
            this.menuInterval = undefined;
        }
    }

}

Menus.Menu.prototype.showMenu = function ()
{
    if(!this.isMenuVisible)
    {
        this._overrideKeybinds();
        this.selectedItemIndex = 0;
        this.isMenuVisible = true;
        this._constructMenuCache();
        this._drawMenu();
        this._startTimer();
        if(this.allowDrawImage)
        {
            OSD.show(this.settings.image,25,25);
        }
    }
}
Menus.Menu.prototype.hideMenu = function ()
{
    if(Menus.displayMethod == "message")
    {        
        mp.osd_message("");
        if(this.isMenuVisible)
        {
            this._stopTimer();
            this._revertKeybinds();
            this.isMenuVisible = false;
            this.RemoveSuffix();
            if(this.allowDrawImage)
            {
                OSD.hide(this.settings.image)
            };
        }
        mp.osd_message("");
    }

    if(Menus.displayMethod == "overlay")
    {
        if(this.isMenuVisible)
        {
            mp.commandv("osd-overlay",this.OSD.id,"none","",0,0,0,"no","no");
            this._revertKeybinds();
            this.isMenuVisible = false;
            this.RemoveSuffix();
            if(this.allowDrawImage)
            {
                OSD.hide(this.settings.image)
            };
            this.OSD = undefined;
        }
    }
    OSD.hideAll(); // fix
}

Menus.Menu.prototype.toggleMenu = function ()
{
    if(!this.isMenuVisible)
    {
        this.showMenu();
    }
    else 
    {
        this.hideMenu();
    }
}

Menus.Menu.prototype.handler = undefined;

module.exports = Menus;