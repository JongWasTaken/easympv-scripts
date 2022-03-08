/*
 * FILEBROWSER.JS (MODULE)
 *
 * Author:              Jong
 * URL:                 https://smto.pw/mpv
 * License:             MIT License
 *
 */

Utils = require("./Utils");
MenuSystem = require("./MenuSystem");
Utils = require("./Utils");
WindowSystem = require("./WindowSystem");
SSA = require("./SSAHelper");

var Browsers = {};

Browsers.Selector = {};
Browsers.FileBrowser = {};
Browsers.DriveBrowser = {};
Browsers.DeviceBrowser = {};

Browsers.Selector.menu = undefined;
Browsers.Selector.menuSettings = {};
Browsers.Selector.cachedParentMenu = undefined;

Browsers.FileBrowser.currentLocation = undefined;
Browsers.FileBrowser.menu = undefined;
Browsers.FileBrowser.menuSettings = {"scrollingEnabled": true};
Browsers.FileBrowser.cachedParentMenu = undefined;

Browsers.DriveBrowser.menu = undefined;
Browsers.DriveBrowser.menuSettings = {"scrollingEnabled": true, "scrollingPosition": 8};
Browsers.DriveBrowser.cachedParentMenu = undefined;
Browsers.DriveBrowser.menuMode = "list";
Browsers.DriveBrowser.cachedDriveName = "";

Browsers.DeviceBrowser.menu = undefined;
Browsers.DeviceBrowser.menuSettings = {"scrollingEnabled": true, "scrollingPosition": 8};
Browsers.DeviceBrowser.cachedParentMenu = undefined;

Browsers.directorySeperator = "/";

Browsers.FileBrowser.fileExtensionWhitelist = 
[
    //DVD/Blu-ray audio formats
    {"type": "audio", "name": "AC-3 Audio", "extension": ".ac3"},
    {"type": "audio", "name": "AC-3 Audio", "extension": ".a52"},
    {"type": "audio", "name": "E-AC-3 Audio", "extension": ".eac3"},
    {"type": "audio", "name": "MLP Audio", "extension": ".mlp"},
    {"type": "audio", "name": "DTS Audio", "extension": ".dts"},
    {"type": "audio", "name": "DTS-HD Audio", "extension": ".dts-hd"},
    {"type": "audio", "name": "DTS-HD Audio", "extension": ".dtshd"},
    {"type": "audio", "name": "TrueHD Audio", "extension": ".true-hd"},
    {"type": "audio", "name": "TrueHD Audio", "extension": ".thd"},
    {"type": "audio", "name": "TrueHD Audio", "extension": ".truehd"},
    {"type": "audio", "name": "TrueHD Audio", "extension": ".thd+ac3"},
    {"type": "audio", "name": "True Audio", "extension": ".tta"},
    
    //Uncompressed formats
    {"type": "audio", "name": "PCM Audio", "extension": ".pcm"},
    {"type": "audio", "name": "Wave Audio", "extension": ".wav"},
    {"type": "audio", "name": "AIFF Audio", "extension": ".aiff"},
    {"type": "audio", "name": "AIFF Audio", "extension": ".aif"},
    {"type": "audio", "name": "AIFF Audio", "extension": ".aifc"},
    {"type": "audio", "name": "AMR Audio", "extension": ".amr"},
    {"type": "audio", "name": "AMR-WB Audio", "extension": ".awb"},
    {"type": "audio", "name": "AU Audio", "extension": ".au"},
    {"type": "audio", "name": "AU Audio", "extension": ".snd"},
    {"type": "audio", "name": "Linear PCM Audio", "extension": ".lpcm"},
    {"type": "video", "name": "Raw YUV Video", "extension": ".yuv"},
    {"type": "video", "name": "YUV4MPEG2 Video", "extension": ".y4m"},
    
    //Free lossless formats
    {"type": "audio", "name": "Monkey's Audio", "extension": ".ape"},
    {"type": "audio", "name": "WavPack Audio", "extension": ".wv"},
    {"type": "audio", "name": "Shorten Audio", "extension": ".shn"},
    
    //MPEG formats
    {"type": "video", "name": "MPEG-2 Transport Stream", "extension": ".m2ts"},
    {"type": "video", "name": "MPEG-2 Transport Stream", "extension": ".m2t"},
    {"type": "video", "name": "MPEG-2 Transport Stream", "extension": ".mts"},
    {"type": "video", "name": "MPEG-2 Transport Stream", "extension": ".mtv"},
    {"type": "video", "name": "MPEG-2 Transport Stream", "extension": ".ts"},
    {"type": "video", "name": "MPEG-2 Transport Stream", "extension": ".tsv"},
    {"type": "video", "name": "MPEG-2 Transport Stream", "extension": ".tsa"},
    {"type": "video", "name": "MPEG-2 Transport Stream", "extension": ".tts"},
    {"type": "video", "name": "MPEG-2 Transport Stream", "extension": ".trp"},
    {"type": "audio", "name": "ADTS Audio", "extension": ".adts"},
    {"type": "audio", "name": "ADTS Audio", "extension": ".adt"},
    {"type": "audio", "name": "MPEG Audio", "extension": ".mpa"},
    {"type": "audio", "name": "MPEG Audio", "extension": ".m1a"},
    {"type": "audio", "name": "MPEG Audio", "extension": ".m2a"},
    {"type": "audio", "name": "MPEG Audio", "extension": ".mp1"},
    {"type": "audio", "name": "MPEG Audio", "extension": ".mp2"},
    {"type": "audio", "name": "MP3 Audio", "extension": ".mp3"},
    {"type": "video", "name": "MPEG Video", "extension": ".mpeg"},
    {"type": "video", "name": "MPEG Video", "extension": ".mpg"},
    {"type": "video", "name": "MPEG Video", "extension": ".mpe"},
    {"type": "video", "name": "MPEG Video", "extension": ".mpeg2"},
    {"type": "video", "name": "MPEG Video", "extension": ".m1v"},
    {"type": "video", "name": "MPEG Video", "extension": ".m2v"},
    {"type": "video", "name": "MPEG Video", "extension": ".mp2v"},
    {"type": "video", "name": "MPEG Video", "extension": ".mpv"},
    {"type": "video", "name": "MPEG Video", "extension": ".mpv2"},
    {"type": "video", "name": "MPEG Video", "extension": ".mod"},
    {"type": "video", "name": "MPEG Video", "extension": ".tod"},
    {"type": "video", "name": "Video Object", "extension": ".vob"},
    {"type": "video", "name": "Video Object", "extension": ".vro"},
    {"type": "video", "name": "Enhanced VOB", "extension": ".evob"},
    {"type": "video", "name": "Enhanced VOB", "extension": ".evo"},
    {"type": "video", "name": "MPEG-4 Video", "extension": ".mpeg4"},
    {"type": "video", "name": "MPEG-4 Video", "extension": ".m4v"},
    {"type": "video", "name": "MPEG-4 Video", "extension": ".mp4"},
    {"type": "video", "name": "MPEG-4 Video", "extension": ".mp4v"},
    {"type": "video", "name": "MPEG-4 Video", "extension": ".mpg4"},
    {"type": "audio", "name": "MPEG-4 Audio", "extension": ".m4a"},
    {"type": "audio", "name": "Raw AAC Audio", "extension": ".aac"},
    {"type": "video", "name": "Raw H.264/AVC Video", "extension": ".h264"},
    {"type": "video", "name": "Raw H.264/AVC Video", "extension": ".avc"},
    {"type": "video", "name": "Raw H.264/AVC Video", "extension": ".x264"},
    {"type": "video", "name": "Raw H.264/AVC Video", "extension": ".264"},
    {"type": "video", "name": "Raw H.265/HEVC Video", "extension": ".hevc"},
    {"type": "video", "name": "Raw H.265/HEVC Video", "extension": ".h265"},
    {"type": "video", "name": "Raw H.265/HEVC Video", "extension": ".x265"},
    {"type": "video", "name": "Raw H.265/HEVC Video", "extension": ".265"},
    
    //Xiph formats
    {"type": "audio", "name": "FLAC Audio", "extension": ".flac"},
    {"type": "audio", "name": "Ogg Audio", "extension": ".oga"},
    {"type": "audio", "name": "Ogg Audio", "extension": ".ogg"},
    {"type": "audio", "name": "Opus Audio", "extension": ".opus"},
    {"type": "audio", "name": "Speex Audio", "extension": ".spx"},
    {"type": "video", "name": "Ogg Video", "extension": ".ogv"},
    {"type": "video", "name": "Ogg Video", "extension": ".ogm"},
    {"type": "video", "name": "Ogg Video", "extension": ".ogx"},
    
    //Matroska formats
    {"type": "video", "name": "Matroska Video", "extension": ".mkv"},
    {"type": "video", "name": "Matroska 3D Video", "extension": ".mk3d"},
    {"type": "audio", "name": "Matroska Audio", "extension": ".mka"},
    {"type": "video", "name": "WebM Video", "extension": ".webm"},
    {"type": "audio", "name": "WebM Audio", "extension": ".weba"},
    
    //Misc formats
    {"type": "video", "name": "Video Clip", "extension": ".avi"},
    {"type": "video", "name": "Video Clip", "extension": ".vfw"},
    {"type": "video", "name": "DivX Video", "extension": ".divx"},
    {"type": "video", "name": "3ivx Video", "extension": ".3iv"},
    {"type": "video", "name": "XVID Video", "extension": ".xvid"},
    {"type": "video", "name": "NUT Video", "extension": ".nut"},
    {"type": "video", "name": "FLIC Video", "extension": ".flic"},
    {"type": "video", "name": "FLIC Video", "extension": ".fli"},
    {"type": "video", "name": "FLIC Video", "extension": ".flc"},
    {"type": "video", "name": "Nullsoft Streaming Video", "extension": ".nsv"},
    {"type": "video", "name": "General Exchange Format", "extension": ".gxf"},
    {"type": "video", "name": "Material Exchange Format", "extension": ".mxf"},
    
    //Windows Media formats
    {"type": "audio", "name": "Windows Media Audio", "extension": ".wma"},
    {"type": "video", "name": "Windows Media Video", "extension": ".wm"},
    {"type": "video", "name": "Windows Media Video", "extension": ".wmv"},
    {"type": "video", "name": "Windows Media Video", "extension": ".asf"},
    {"type": "video", "name": "Microsoft Recorded TV Show", "extension": ".dvr-ms"},
    {"type": "video", "name": "Microsoft Recorded TV Show", "extension": ".dvr"},
    {"type": "video", "name": "Windows Recorded TV Show", "extension": ".wtv"},
    
    //DV formats
    {"type": "video", "name": "DV Video", "extension": ".dv"},
    {"type": "video", "name": "DV Video", "extension": ".hdv"},
    
    //Flash Video formats
    {"type": "video", "name": "Flash Video", "extension": ".flv"},
    {"type": "video", "name": "Flash Video", "extension": ".f4v"},
    {"type": "audio", "name": "Flash Audio", "extension": ".f4a"},
    
    //QuickTime formats
    {"type": "video", "name": "QuickTime Video", "extension": ".qt"},
    {"type": "video", "name": "QuickTime Video", "extension": ".mov"},
    {"type": "video", "name": "QuickTime HD Video", "extension": ".hdmov"},
    
    //Real Media formats
    {"type": "video", "name": "Real Media Video", "extension": ".rm"},
    {"type": "video", "name": "Real Media Video", "extension": ".rmvb"},
    {"type": "audio", "name": "Real Media Audio", "extension": ".ra"},
    {"type": "audio", "name": "Real Media Audio", "extension": ".ram"},
    
    //3GPP formats
    {"type": "audio", "name": "3GPP Audio", "extension": ".3ga"},
    {"type": "audio", "name": "3GPP Audio", "extension": ".3ga2"},
    {"type": "video", "name": "3GPP Video", "extension": ".3gpp"},
    {"type": "video", "name": "3GPP Video", "extension": ".3gp"},
    {"type": "video", "name": "3GPP Video", "extension": ".3gp2"},
    {"type": "video", "name": "3GPP Video", "extension": ".3g2"},
    
    //Video game formats
    {"type": "audio", "name": "AY Audio", "extension": ".ay"},
    {"type": "audio", "name": "GBS Audio", "extension": ".gbs"},
    {"type": "audio", "name": "GYM Audio", "extension": ".gym"},
    {"type": "audio", "name": "HES Audio", "extension": ".hes"},
    {"type": "audio", "name": "KSS Audio", "extension": ".kss"},
    {"type": "audio", "name": "NSF Audio", "extension": ".nsf"},
    {"type": "audio", "name": "NSFE Audio", "extension": ".nsfe"},
    {"type": "audio", "name": "SAP Audio", "extension": ".sap"},
    {"type": "audio", "name": "SPC Audio", "extension": ".spc"},
    {"type": "audio", "name": "VGM Audio", "extension": ".vgm"},
    {"type": "audio", "name": "VGZ Audio", "extension": ".vgz"},
    
    //Playlist formats
    {"type": "audio", "name": "M3U Playlist", "extension": ".m3u"},
    {"type": "audio", "name": "M3U Playlist", "extension": ".m3u8"},
    {"type": "audio", "name": "PLS Playlist", "extension": ".pls"},
    {"type": "audio", "name": "CUE Sheet", "extension": ".cue"}
]

Browsers.Selector.menuEventHandler = function (event, item)
{
    if(event == "enter")
    {
        Browsers.Selector.menu.hideMenu();
        Browsers.Selector.menu = undefined;

        if(item == "file")
        {
            Browsers.FileBrowser.open(Browsers.Selector.cachedParentMenu);
        }
        else if(item == "disc")
        {
            Browsers.DriveBrowser.open(Browsers.Selector.cachedParentMenu);
        }
        else if(item == "device")
        {
            Browsers.DeviceBrowser.open(Browsers.Selector.cachedParentMenu);
        }
        else if(item == "url")
        {
            //TODO:
            WindowSystem.Alerts.show("info", "URL Input window has opened!")
            if (Utils.os == "win")
            {
                var r = mp.command_native({
                    name: "subprocess",
                    playback_only: false,
                    capture_stdout: true,
                    args: ["powershell", "-executionpolicy", "bypass", "%APPDATA%\\mpv\\scripts\\easympv.js\\InputBox.ps1"]
                })
            }
            else
            {
                var r = mp.command_native({
                    name: "subprocess",
                    playback_only: false,
                    capture_stdout: true,
                    args: ["zenity", "--title=mpv", "--forms", "--text=Open URL", "--add-entry=Paste URL:"]
                })
            }
            if(r.status == "0")
            {
                var input = r.stdout.trim();
                if(input.includes("://"))
                {
                    if(input.includes("&list="))
                    {
                        mp.commandv("loadlist",input);
                    }
                    else
                    {
                        mp.commandv("loadfile",input);
                    }
                }
            }
        }
    }
}

Browsers.Selector.open = function (parentMenu)
{
    if (parentMenu == undefined)
    {
        parentMenu = Browsers.Selector.cachedParentMenu;
    }
    else
    {
        Browsers.Selector.cachedParentMenu = parentMenu;
    }
    if (Utils.os == "win")
    {
        Browsers.directorySeperator = "\\";
    }

    var items = [];

    items.push({
        title: SSA.insertSymbolFA(" ",26,30) + "File",
        item: "file",
        color: "ffffff"
    });
    items.push({
        title: SSA.insertSymbolFA(" ",26,30) + "Disc",
        item: "disc",
        color: "ffffff"
    });
    items.push({
        title: SSA.insertSymbolFA(" ",26,30) + "Device",
        item: "device",
        color: "ffffff"
    });

    items.push({
        title: SSA.insertSymbolFA(" ",26,30) + "URL",
        item: "url",
        color: "ffffff"
    });


    Browsers.Selector.menuSettings.title = "Selector placeholder title";
    Browsers.Selector.menuSettings.description = "What do you want to open?";
    Browsers.Selector.menu = new MenuSystem.Menu(Browsers.Selector.menuSettings,items,parentMenu);
    Browsers.Selector.menu.eventHandler = Browsers.Selector.menuEventHandler;
    Browsers.Selector.menu.showMenu();
}

Browsers.FileBrowser.openFileSafe = function (filename)
{
    for(var i = 0; i < Browsers.FileBrowser.fileExtensionWhitelist.length; i++)
    {
        if(filename.includes(Browsers.FileBrowser.fileExtensionWhitelist[i].extension))
        {
            WindowSystem.Alerts.show("info", "Playing " + Browsers.FileBrowser.fileExtensionWhitelist[i].name + " file:","",filename);
            mp.commandv("loadfile",Browsers.FileBrowser.currentLocation + Browsers.directorySeperator + filename);
            Browsers.FileBrowser.menu.hideMenu();
            Browsers.FileBrowser.menu = undefined;
            break;
        }
    }
}

Browsers.FileBrowser.getParentDirectory = function ()
{
    var newDir = "";
    var workDir = Browsers.FileBrowser.currentLocation;
    if (workDir.charAt(workDir.length - 1) == Browsers.directorySeperator) {
        workDir = workDir.substring(0, workDir.length - 1);
    }
    var workDirTree = workDir.split(Browsers.directorySeperator);

    if(workDirTree.length < 3) 
    {
        workDirTree[0] = "/";
    }

    for (var i = 0; i < workDirTree.length-1; i++)
    {
        if(i == 0)
        {
            newDir = workDirTree[0];
        }
        else
        {
            newDir = newDir + Browsers.directorySeperator + workDirTree[i];
        }
    }
    mp.msg.warn(newDir);
    return newDir;
}

Browsers.FileBrowser.changeDirectory = function (directory)
{
    Browsers.FileBrowser.currentLocation = directory.replaceAll(Browsers.directorySeperator + Browsers.directorySeperator, Browsers.directorySeperator);
    Browsers.FileBrowser.menu.hideMenu();
    Browsers.FileBrowser.menu = undefined;
    Browsers.FileBrowser.open();
}

Browsers.FileBrowser.menuEventHandler = function (event,item)
{
    if(event == "enter")
    {
        if(item == ".." + Browsers.directorySeperator)
        {
            Browsers.FileBrowser.changeDirectory(Browsers.FileBrowser.getParentDirectory());
        }
        else
        {
            var isFolder = mp.utils.file_info(Browsers.FileBrowser.currentLocation + Browsers.directorySeperator + item).is_dir;

            if(isFolder)
            {
                Browsers.FileBrowser.changeDirectory(Browsers.FileBrowser.currentLocation + Browsers.directorySeperator + item);
            }
            else
            {
                Browsers.FileBrowser.openFileSafe(item);
            }

        }
    }
}

Browsers.FileBrowser.open = function (parentMenu)
{
    if (parentMenu == undefined)
    {
        parentMenu = Browsers.FileBrowser.cachedParentMenu;
    }
    else
    {
        Browsers.FileBrowser.cachedParentMenu = parentMenu;
    }
    if (Utils.os == "win")
    {
        Browsers.directorySeperator = "\\";
    }
    var items = [];
    var currentLocationFolders = mp.utils.readdir(Browsers.FileBrowser.currentLocation,"dirs");
    currentLocationFolders.sort();

    if (Utils.os == "unix" && Browsers.FileBrowser.currentLocation == "/")
    {}
    else if (Utils.os == "win" && Browsers.FileBrowser.currentLocation.includes(":\\"))
    {}
    else
    {
        items.push({
            title: SSA.insertSymbolFA(" ",30,30) + ".." + Browsers.directorySeperator,
            item: ".." + Browsers.directorySeperator,
            color: "909090"
        });
    }
    for (var i = 0; i < currentLocationFolders.length; i++)
    {
        if(currentLocationFolders[i].charAt(0) != ".")
        {
            items.push({
                title: SSA.insertSymbolFA(" ",26,30) + currentLocationFolders[i] + Browsers.directorySeperator,
                item: currentLocationFolders[i] + Browsers.directorySeperator,
                color: "FFFF90"
            });
        }
    }
    var currentLocationFiles = mp.utils.readdir(Browsers.FileBrowser.currentLocation,"files");
    currentLocationFiles.sort();
    for (var i = 0; i < currentLocationFiles.length; i++)
    {
        if(currentLocationFiles[i].charAt(0) != ".")
        {
            var color = "909090";

            for(var j = 0; j < Browsers.FileBrowser.fileExtensionWhitelist.length; j++)
            {
                if(currentLocationFiles[i].includes(Browsers.FileBrowser.fileExtensionWhitelist[j].extension))
                {
                    color = "ffffff";
                    break;
                }
            }

            items.push({
                title: SSA.insertSymbolFA(" ",26,30) + currentLocationFiles[i],
                item: currentLocationFiles[i],
                color: color
            });
        }
    }
    Browsers.FileBrowser.menuSettings.title = "FileBrowser placeholder title";
    Browsers.FileBrowser.menuSettings.description = "Select a file to open.@br@Current directory: " + Browsers.FileBrowser.currentLocation;
    Browsers.FileBrowser.menu = new MenuSystem.Menu(Browsers.FileBrowser.menuSettings,items,parentMenu);
    Browsers.FileBrowser.menu.eventHandler = Browsers.FileBrowser.menuEventHandler;
    Browsers.FileBrowser.menu.showMenu();
}

Browsers.DriveBrowser.menuEventHandler = function (event,item)
{
    if(event == "enter" && Browsers.DriveBrowser.menuMode == "list")
    {
        Browsers.DriveBrowser.cachedDriveName = item;
        Browsers.DriveBrowser.menuMode = "ask";
        Browsers.DriveBrowser.menu.settings.description = "What type of disc are you trying to play?";
        var temp = Browsers.DriveBrowser.menu.items[0];
        Browsers.DriveBrowser.menu.items = [];
        Browsers.DriveBrowser.menu.items.push(temp);
        Browsers.DriveBrowser.menu.items.push({
            title: SSA.insertSymbolFA(" ",26,30) + "CD",
            item: "ccda",
            color: "ffffff"
        });
        Browsers.DriveBrowser.menu.items.push({
            title: SSA.insertSymbolFA(" ",26,30) + "DVD",
            item: "dvd",
            color: "ffffff"
        });
        Browsers.DriveBrowser.menu.items.push({
            title: SSA.insertSymbolFA(" ",26,30) + "BluRay",
            item: "bd",
            color: "ffffff"
        });
        Browsers.DriveBrowser.menu.redrawMenu();
    }
    else if (event == "enter" && Browsers.DriveBrowser.menuMode == "ask")
    {
        //TODO: windows
        mp.commandv("loadfile", item + "://longest//dev/" + Browsers.DriveBrowser.cachedDriveName);
        WindowSystem.Alerts.show("info", "Opening disc drive " + Browsers.DriveBrowser.cachedDriveName + "...","","");
        Browsers.DriveBrowser.cachedDriveName = "";
        Browsers.DriveBrowser.menuMode = "list";
        Browsers.DriveBrowser.menu.hideMenu();
        Browsers.DriveBrowser.menu = undefined;
    }
}

Browsers.DriveBrowser.open = function (parentMenu)
{
    var items = [];
    if (parentMenu == undefined)
    {
        parentMenu = Browsers.DriveBrowser.cachedParentMenu;
    }
    else
    {
        Browsers.DriveBrowser.cachedParentMenu = parentMenu;
    }
    if (Utils.os == "win")
    {
        Browsers.directorySeperator = "\\";
        //TODO:
        var r = mp.command_native({
            name: "subprocess",
            playback_only: false,
            capture_stdout: true,
            args: ["powershell", "-executionpolicy", "bypass", "%APPDATA%\\mpv\\scripts\\easympv.js\\GetDiscDrives.ps1"]
        })

        if(r.status == "0")
        {
            drives = r.stdout.split("\n");
            drives.sort();
            for (var i = 0; i < drives.length; i++)
            {
                items.push({
                    title: SSA.insertSymbolFA(" ",26,30) + drives[i],
                    item: drives[i],
                    color: "ffffff"
                });
            }
        }
    }
    else
    {
        var deviceList = mp.utils.readdir("/dev/","all");
        deviceList.sort();
        for (var i = 0; i < deviceList.length; i++)
        {
            if(deviceList[i].includes("sr"))
            {
                items.push({
                    title: SSA.insertSymbolFA(" ",26,30) + deviceList[i],
                    item: deviceList[i],
                    color: "ffffff"
                });
            }
        }
    }
    Browsers.DriveBrowser.menuMode = "list";
    Browsers.DriveBrowser.menuSettings.title = "DriveBrowser placeholder title";
    Browsers.DriveBrowser.menuSettings.description = "Select a drive to open.";
    Browsers.DriveBrowser.menu = new MenuSystem.Menu(Browsers.DriveBrowser.menuSettings,items,parentMenu);
    Browsers.DriveBrowser.menu.eventHandler = Browsers.DriveBrowser.menuEventHandler;
    Browsers.DriveBrowser.menu.showMenu();
}

Browsers.DeviceBrowser.menuEventHandler = function (event,item)
{
    if(event == "enter")
    {
        /*
        var tmp = JSON.parse(mp.get_property("profile-list"));

        for(var i = 0; i < tmp.length; i++)
        {
            mp.msg.warn(tmp[i].name);
        }
        */
        mp.commandv("apply-profile", "low-latency");
        
        if (Utils.os == "win")
        {
            mp.commandv("loadfile", "av://dshow:video=\"" + item + "\"")
        }
        else
        {
            mp.commandv("loadfile", "av://v4l2:/dev/" + item)
        }
        WindowSystem.Alerts.show("info", "Opening device " + item + "...","","");
        Browsers.DeviceBrowser.menu.hideMenu();
        Browsers.DeviceBrowser.menu = undefined;
    }
}

Browsers.DeviceBrowser.open = function (parentMenu)
{
    var items = [];
    if (parentMenu == undefined)
    {
        parentMenu = Browsers.DeviceBrowser.cachedParentMenu;
    }
    else
    {
        Browsers.DeviceBrowser.cachedParentMenu = parentMenu;
    }
    if (Utils.os == "win")
    {
        Browsers.directorySeperator = "\\";
        var deviceList = Utils.executeCommand(["%APPDATA%\\mpv\\scripts\\easympv.js\\empv.exe","get-video-devices"]).split("|");
        for (var i = 0; i < deviceList.length; i++)
        {
            items.push({
                title: SSA.insertSymbolFA(" ",26,30) + deviceList[i],
                item: deviceList[i],
                color: "ffffff"
            });
        }
    }
    else
    {
        var deviceList = mp.utils.readdir("/dev/","all");
        deviceList.sort();
        for (var i = 0; i < deviceList.length; i++)
        {
            if(deviceList[i].includes("video"))
            {
                var title = SSA.insertSymbolFA(" ",26,30) + deviceList[i];
                title += " - " + Utils.executeCommand(["cat","/sys/class/video4linux/"+deviceList[i]+"/name"]).split(": ")[0];
                items.push({
                    title: title,
                    item: deviceList[i],
                    color: "ffffff"
                });
            }
        }
    }
    Browsers.DeviceBrowser.menuSettings.title = "DeviceBrowser placeholder title";
    Browsers.DeviceBrowser.menuSettings.description = "Select a device to open.@br@Important: If you play a file after playing a device, there might be issues.@br@ It is recommended to restart mpv first!";
    Browsers.DeviceBrowser.menu = new MenuSystem.Menu(Browsers.DeviceBrowser.menuSettings,items,parentMenu);
    Browsers.DeviceBrowser.menu.eventHandler = Browsers.DeviceBrowser.menuEventHandler;
    Browsers.DeviceBrowser.menu.showMenu();
}

module.exports = Browsers;