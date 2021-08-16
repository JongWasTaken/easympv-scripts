/*
 * SHADERS.JS (MODULE)
 *
 * Author:         Jong
 * URL:            https://smto.pw/mpv
 * License:        MIT License
 */

var Shaders = {};
Shaders.name = "none";
//Shaders.firsttime = true;
Shaders.sets = [];

Shaders.set = function(name,files) {
  this.name = name;
  this.files = files;
  return this;
}

Shaders.populateSets = function() {
  // Parse Shaders.json and add all entries to Shaders.sets
  var file = JSON.parse(mp.utils.read_file(mp.utils.get_user_path("~~/scripts/easympv.js/Shaders.json")));
  for(var set in file) {
    var filelist = "";
    var i = 0;
    for (i = 0; i < file[set].length; i++) {
      filelist = filelist + "~~/shaders/" + file[set][i] + ";";
    }
    filelist = filelist.slice(0, filelist.length-1);
    Shaders.sets.push(new Shaders.set(set,filelist))
  }

  // Sort the array
  Shaders.sets.reverse();
  var i;
  var sorttemp_master = [];
  var sorttemp_sd = [];
  var sorttemp_hd = [];
  var sorttemp2 = [];
  for (i = 0; i < Shaders.sets.length; i++) {
    if(Shaders.sets[i].name.includes("SD")) {
      sorttemp_sd.push(Shaders.sets[i]);
    } else if (Shaders.sets[i].name.includes("HD")) {
      sorttemp_hd.push(Shaders.sets[i]);
    } else {sorttemp2.push(Shaders.sets[i]);}
  }
  sorttemp_sd.reverse();
  sorttemp_hd.reverse();

  for (i = 0; i < sorttemp_sd.length; i++) {sorttemp_master.push(sorttemp_sd[i]);}
  for (i = 0; i < sorttemp_hd.length; i++) {sorttemp_master.push(sorttemp_hd[i]);}
  for (i = 0; i < sorttemp2.length; i++) {sorttemp_master.push(sorttemp2[i]);}
  
  // Done.
  Shaders.sets = sorttemp_master;
}

Shaders.apply = function (shader) {
  if (shader == "a4k_auto")
  {
    var height = mp.get_property("osd-height");
    if (height == 0) {
      height = mp.get_property("height");
    }
    var isHD;
    if (height <= 720) {
      isHD = false;
    } else if (height > 720) {
      isHD = true;
    }
    if (isHD) { Shaders.apply("HD Anime4K Improved & Deblured"); } else { Shaders.apply("SD Anime4K Improved & Deblured"); }

  }
  else if (shader == "clear" || shader == "none" || shader == "" || shader == undefined)
  {
    Shaders.name = "none";
    mp.commandv("change-list", "glsl-shaders", "clr", "");
  }
  else
  {
    mp.commandv("change-list", "glsl-shaders", "clr", "");
    if(shader.includes("none") || shader.includes("undefined")) {
      Shaders.name = "none";
    }
    else
    {
      Shaders.name = shader;
    }

    var i;
    for (i = 0; i < Shaders.sets.length; i++) {
      if (Shaders.sets[i].name == shader)
      {
        mp.commandv(
          "change-list",
          "glsl-shaders",
          "set",
          Shaders.sets[i].files
        );
        break;
      }
    }

    mp.msg.info("Switching to preset: " + Shaders.name);
    try {
      Menu.rebuild();
    } catch (e) {}

  }

};

module.exports = Shaders;
