/**
*  @filename    Reload.js
*  @author      theBGuy
*  @desc        Simple thread that when loaded will shutdown all other threads and reload the bot
*
*/
js_strict(true);
include("critical.js");

function main () {
  let tick = getTickCount();
  let scripts = [
    "default.dbj", "libs/SoloPlay/SoloPlay.js", "libs/SoloPlay/Threads/Toolsthread.js",
    "libs/SoloPlay/Modules/Guard.js", "libs/SoloPlay/Modules/TownGuard.js"
  ];

  while (scripts.length) {
    let script = getScript(scripts[0]);

    if (script && script.running) {
      script.stop();

      while (script.running) {
        delay(100);
      }
    }
    scripts.shift();
  }

  while (getTickCount() - tick < 5000) {
    delay(100);
  }
  console.log("All threads shutdown ~ Reloading bot");
  load("default.dbj");
}
