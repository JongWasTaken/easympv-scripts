/*
 * FIRSTTIMEWIZARD.JS (MODULE),
 *
 * Author:         Jong
 * URL:            https://github.com/JongWasTaken/easympv
 * License:        MIT License
 *
 */

var UI = require("./UI");
var Settings = require("./Settings");
Settings.presets.reload();

var Wizard = {};
Wizard.idsToUnblock = [];
Wizard.Menus = {};

var menuColor = "#77dd11";

// temp
var unblock = function () {
    if (Wizard.idsToUnblock.length == 0) {
        return;
    }

    // Unblock quit keys
    for (i = 0; i < Wizard.idsToUnblock.length; i++) {
        mp.remove_key_binding(Wizard.idsToUnblock[i]);
    }
};

var title = function (n1,n2) {
    return Settings.locale["FTW.menu.title"] + n1 + "/" + n2;
}

Wizard.Menus.Page1 = new UI.Menus.Menu(
    {
        title: "",
        description: Settings.locale["FTW.page1.description"],
        selectedItemColor: menuColor,
        autoClose: 0,
        customKeyEvents: [{key: "h", event: "help"}],
        fadeIn: false,
        fadeOut: false
    },
    [
        {
            title: Settings.locale["FTW.continue.title"],
            item: "continue",
            eventHandler: function(event, menu)
            {
                if (event == "enter")
                {
                    Wizard.Menus.Page1.hideMenu();
                    Wizard.Menus.Page2.showMenu();
                }
            }
        },
    ],
    undefined
);

Wizard.Menus.Page1.eventHandler = function (event, action) {
    if (event == "help") {OS.openFile("https://github.com/JongWasTaken/easympv/wiki/Setup#introduction", true);}
};

Wizard.Menus.Page2Options = {
    PerformanceName: [
        Settings.locale["FTW.performance.first.title"],
        Settings.locale["FTW.performance.second.title"],
        Settings.locale["FTW.performance.third.title"]
    ],
    PerformanceDescription: [
        Settings.locale["FTW.performance.first.description"],
        Settings.locale["FTW.performance.second.description"],
        Settings.locale["FTW.performance.third.description"]
    ],
    AudioLanguageNames: [ "none", "Japanese", "English", "German" ],
    AudioLanguageDescription: Settings.locale["FTW.audiolanguage.description"],
    SubLanguageNames: [ "none", "English", "German", "Japanese" ],
    SubLanguageDescription: Settings.locale["FTW.sublanguage.description"]
};

Wizard.Menus.Page2 = new UI.Menus.Menu(
    {
        title: "",
        description: Settings.locale["FTW.page2.description"],
        selectedItemColor: menuColor,
        autoClose: 0,
        customKeyEvents: [{key: "h", event: "help"}],
        fadeIn: false,
        fadeOut: false
    },
    [
        {
            title: Settings.locale["FTW.performance.title"] + "@us10@@br@",
            item: "toggle-performance",
            description: Wizard.Menus.Page2Options.PerformanceName[1] + Wizard.Menus.Page2Options.PerformanceDescription[1],
            data: 1,
            eventHandler: function(event,menu)
            {
                if (event == "enter") return;
                if (event == "left" && this.data != 0)
                {
                    this.data = this.data - 1;
                }
                if (event == "right" && this.data != Wizard.Menus.Page2Options.PerformanceName.length-1)
                {
                    this.data = this.data + 1;
                }
                this.description = Wizard.Menus.Page2Options.PerformanceName[this.data];
                this.description += Wizard.Menus.Page2Options.PerformanceDescription[this.data];
                Wizard.Menus.Page2.redrawMenu();
            }
        },
        {
            title: Settings.locale["FTW.audiolanguage.title"],
            item: "toggle-audio-language",
            description: Wizard.Menus.Page2Options.AudioLanguageNames[1] + Wizard.Menus.Page2Options.AudioLanguageDescription,
            data: 1,
            eventHandler: function(event,menu)
            {
                if (event == "enter") return;
                if (event == "left" && this.data != 0)
                {
                    this.data = this.data - 1;
                }
                if (event == "right" && this.data != Wizard.Menus.Page2Options.AudioLanguageNames.length-1)
                {
                    this.data = this.data + 1;
                }
                this.description = Wizard.Menus.Page2Options.AudioLanguageNames[this.data];
                this.description += Wizard.Menus.Page2Options.AudioLanguageDescription;
                Wizard.Menus.Page2.redrawMenu();
            }
        },
        {
            title: Settings.locale["FTW.sublanguage.title"] + "@us10@@br@",
            item: "toggle-sub-language",
            description: Wizard.Menus.Page2Options.SubLanguageNames[1] + Wizard.Menus.Page2Options.SubLanguageDescription,
            data: 1,
            eventHandler: function(event,menu)
            {
                if (event == "enter") return;
                if (event == "left" && this.data != 0)
                {
                    this.data = this.data - 1;
                }
                if (event == "right" && this.data != Wizard.Menus.Page2Options.SubLanguageNames.length-1)
                {
                    this.data = this.data + 1;
                }
                this.description = Wizard.Menus.Page2Options.SubLanguageNames[this.data];
                this.description += Wizard.Menus.Page2Options.SubLanguageDescription;
                Wizard.Menus.Page2.redrawMenu();
            }
        },
        {
            title: Settings.locale["FTW.continue.title"],
            item: "continue",
            eventHandler: function(event, menu)
            {
                if (event == "enter")
                {
                    Wizard.Menus.Page2.hideMenu();
                    Wizard.Menus.Page3.showMenu();
                }
            }
        },
    ],
    Wizard.Menus.Page1
);

Wizard.Menus.Page2.eventHandler = function (event, action) {
    if (event == "help") {OS.openFile("https://github.com/JongWasTaken/easympv/wiki/Setup#choosing-default-settings", true);}
};

Wizard.Menus.Page3 = new UI.Menus.Menu(
    {
        title: "",
        description: Settings.locale["FTW.page3.description"],
        selectedItemColor: menuColor,
        autoClose: 0,
        customKeyEvents: [{key: "h", event: "help"}],
        fadeIn: false,
        fadeOut: false
    },
    [
        {
            title: Settings.locale["FTW.finish.title"],
            item: "finish",
            eventHandler: function(event, menu)
            {
                if (event == "enter")
                {
                    Wizard.Menus.Page3.hideMenu();

                    Settings.mpvConfig.load();

                    var ppreset = Wizard.Menus.Page2Options.PerformanceName[Wizard.Menus.Page2.items[1].data];
                    if (ppreset == Settings.locale["FTW.performance.first.title"])
                    {
                        Settings.mpvConfig.Data.scale = "bilinear";
                        Settings.mpvConfig.Data.cscale = "bilinear";
                        Settings.mpvConfig.Data.dscale = "bilinear";
                        Settings.mpvConfig.Data.tscale = "oversample";
                        Settings.mpvConfig.Data.deband = "no";
                        Settings.mpvConfig.Data.demuxer_mkv_subtitle_preroll = "no";
                        Settings.mpvConfig.Data.sigmoid_upscaling = "no";
                        Settings.mpvConfig.Data.correct_downscaling = "no";
                        Settings.mpvConfig.Data.video_sync = "audio";
                    }
                    else if (ppreset == Settings.locale["FTW.performance.second.title"])
                    {
                        Settings.mpvConfig.Data.scale = "spline36";
                        Settings.mpvConfig.Data.cscale = "spline36";
                        Settings.mpvConfig.Data.dscale = "spline36";
                        Settings.mpvConfig.Data.tscale = "linear";
                        Settings.mpvConfig.Data.deband = "yes";
                        Settings.mpvConfig.Data.demuxer_mkv_subtitle_preroll = "no";
                        Settings.mpvConfig.Data.sigmoid_upscaling = "yes";
                        Settings.mpvConfig.Data.correct_downscaling = "no";
                        Settings.mpvConfig.Data.video_sync = "audio";
                    }
                    else if (ppreset == Settings.locale["FTW.performance.third.title"])
                    {
                        Settings.mpvConfig.Data.scale = "ewa_lanczossharp";
                        Settings.mpvConfig.Data.cscale = "ewa_lanczossharp";
                        Settings.mpvConfig.Data.dscale = "mitchell";
                        Settings.mpvConfig.Data.tscale = "mitchell";
                        Settings.mpvConfig.Data.deband = "yes";
                        Settings.mpvConfig.Data.demuxer_mkv_subtitle_preroll = "yes";
                        Settings.mpvConfig.Data.sigmoid_upscaling = "yes";
                        Settings.mpvConfig.Data.correct_downscaling = "yes";
                        Settings.mpvConfig.Data.video_sync = "display-resample";
                    }

                    var alang = Wizard.Menus.Page2Options.AudioLanguageNames[Wizard.Menus.Page2.items[2].data];
                    if (alang == "Japanese")
                    {
                        Settings.mpvConfig.Data.alang = "Japanese,ja,jap,jpn,日本,日本語";
                    } else if (alang == "German")
                    {
                        Settings.mpvConfig.Data.alang = "German,ger,Deutsch,deu,de";
                    } else if (alang == "English")
                    {
                        Settings.mpvConfig.Data.alang = "English,eng,en";
                    } else { Settings.mpvConfig.Data.alang= ""; }

                    var slang = Wizard.Menus.Page2Options.SubLanguageNames[Wizard.Menus.Page2.items[3].data];
                    if (slang == "Japanese")
                    {
                        Settings.mpvConfig.Data.slang = "Japanese,ja,jap,jpn,日本,日本語";
                    } else if (slang == "German")
                    {
                        Settings.mpvConfig.Data.slang = "German,ger,Deutsch,deu,de";
                    } else if (slang == "English")
                    {
                        Settings.mpvConfig.Data.slang = "Full,English,eng,en,Subtitles";
                    } else { Settings.mpvConfig.Data.slang= ""; }

                    Settings.mpvConfig.save();

                    Settings.Data.isFirstLaunch = false;
                    Settings.save();
                    unblock();
                }
            }
        },
    ],
    Wizard.Menus.Page2
);

Wizard.Menus.Page3.eventHandler = function (event, action) {
    if (event == "help") {OS.openFile("https://github.com/JongWasTaken/easympv/wiki/Setup#finishing-up", true);}
};

Wizard.Start = function () {
    Settings.load();
    var pageTotal = Object.keys(Wizard.Menus).length-1;
    Wizard.Menus.Page1.settings.title = title(1,pageTotal);
    Wizard.Menus.Page2.settings.title = title(2,pageTotal);
    Wizard.Menus.Page3.settings.title = title(3,pageTotal);
    // disable all menus keys
    var bindings = JSON.parse(mp.get_property("input-bindings"));
    var keysToBlock = [];
    Wizard.idsToUnblock = [];
    for (i = 0; i < bindings.length; i++) {
        if (bindings[i].cmd.includes("script_binding easympv")) {
            keysToBlock.push(bindings[i]);
        }
    }
    for (i = 0; i < keysToBlock.length; i++) {
        mp.add_forced_key_binding(
            keysToBlock[i].key,
            "prevent_menu_" + i,
            function () {}
        );
        Wizard.idsToUnblock.push("prevent_menu_" + i);
    }
    // open page1
    Wizard.Menus.Page1.showMenu();
};

module.exports = Wizard;

