/**
*  @filename    EventHandler.js
*  @author      theBGuy
*  @desc        worker thread to handle in game events for Kolbot-SoloPlay
*
*/

(function (module, require, Worker) {
  // Only load this in global scope
  if (getScript(true).name.toLowerCase() === "libs\\soloplay\\soloplay.js") {

    let tickDelay = 0;
    let [actions, profiles] = [[], []];

    me.on("soloEvent", function msgEvent (msg) {
      switch (msg) {
      case "testing":
        console.debug(msg, actions);

        break;
      case "finishDen":
      case "dodge":
      case "skip":
      case "killdclone":
        actions.push(msg);
        console.debug(actions);

        break;
      }
    });
    
    me.on("processProfileEvent", function copyDataProcessing (id, info) {
      console.debug(id, info);
      // Torch
      if (id === 55) {
        let { profile, ladder, torchType } = JSON.parse(info);
        console.log("Mesage recived for torch...processing");

        if (profile !== me.profile && (me.hell || (me.nightmare && me.baal)) && me.ladder === ladder) {
          if (torchType === me.classid && !me.findItem(604, 0, null, 7)) {
            console.log("Sent Response");
            SoloEvents.sendToProfile(profile, { profile: me.profile, level: me.charlvl, event: 604 });
          }
        }

        return;
      }

      // Annhilus
      if (id === 60) {
        let { profile, ladder } = JSON.parse(info);
        console.log("Mesage recived for Annhilus...processing");

        if (profile !== me.profile && (me.hell || (me.nightmare && me.baal)) && me.ladder === ladder) {
          if (!me.findItem(603, 0, null, 7)) {
            console.log("Sent Response");
            SoloEvents.sendToProfile(profile, { profile: me.profile, level: me.charlvl, event: 603 });
          }
        }

        return;
      }

      if (id === 65) {
        let { profile, level, event } = JSON.parse(info);

        console.log("Sucess: profile that contacted me: " + profile + " level of char: " + level);
        SoloEvents.profileResponded = true;
        profiles.push({ profile: profile, level: level, event: event });
        tickDelay += 1000;
      }
    });

    let waitTick = getTickCount();

    // Start
    Worker.runInBackground.EventWorker = function () {
      if (getTickCount() - waitTick < 100 || SoloEvents.townChicken.running) return true;
      waitTick = getTickCount();

      try {
        while (actions.length) {
          let wasDisabled = SoloEvents.townChicken.disabled;
          try {
            SoloEvents[actions.shift()]();
          } catch (e) {
            console.warn(e);
          } finally {
            // if we disabled townchicken, re-enable it
            if (!wasDisabled && SoloEvents.townChicken.disabled) {
              SoloEvents.townChicken.disabled = false;
            }
          }
        }

        if (profiles.length > 0) {
          let tick = getTickCount();

          while (getTickCount() - tick < tickDelay) {
            delay(500);
          }

          let lowestLevelProf = profiles.sort((a, b) => a.level - b.level).first();

          SoloEvents.sendToProfile(lowestLevelProf.profile, lowestLevelProf.event, 70);
          D2Bot.joinMe(lowestLevelProf.profile, me.gamename.toLowerCase(), "", me.gamepassword.toLowerCase(), true);
          profiles = [];
        }
      } catch (e) {
        console.error(e);
      }

      return true;
    };

    // should there be a heartbeat for the workers?
    console.log("ÿc8Kolbot-SoloPlayÿc0: Start EventHandler");
  }
})(module, require, typeof Worker === "object" && Worker || require("../../modules/Worker"));
