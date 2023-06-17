/**
*  @filename    summoner.js
*  @author      theBGuy
*  @desc        summoner quest and Hate key hunting
*
*/

function summoner () {
  // @isid0re
  const teleportPads = function () {
    if (!me.inArea(sdk.areas.ArcaneSanctuary) || Pather.useTeleport()) return true;

    let tppPath;
    let [wpX, wpY] = [25449, 5449];
    let ntppPath = [[53, 2], [103, -3], [113, -68], [173, -58], [243, -73], [293, -58], [353, -68], [372, -62], [342, -17]];
    let stppPath = [[-56, 2], [-128, -7], [-98, 78], [-176, 62], [-243, 58], [-296, 62], [-372, 62], [-366, 12]];
    let etppPath = [[28, 52], [-12, 92], [53, 112], [72, 118], [88, 172], [54, 227], [43, 247], [88, 292], [82, 378], [-16, 332], [2, 353]];
    let wtppPath = [[-26, -63], [2, -121], [3, -133], [62, -117], [34, -183], [54, -228], [43, -243], [34, -303], [72, -351], [64, -368], [23, -338]];
    let stand = Game.getPresetObject(me.area, sdk.objects.Journal);
    let [tppPathX, tppPathY] = [(stand.roomx * 5 + stand.x), (stand.roomy * 5 + stand.y)];
    console.debug(tppPathX, tppPathY);
    let tppID = [192, 304, 305, 306];

    switch (tppPathX) {
    case 25011:
      tppPath = ntppPath;
      break;
    case 25866:
      tppPath = stppPath;
      break;
    case 25431:
      switch (tppPathY) {
      case 5011:
        tppPath = etppPath;
        break;
      case 5861:
        tppPath = wtppPath;
        break;
      }

      break;
    }

    if (getPath(me.area, me.x, me.y, tppPathX, tppPathY, 0, 10).length === 0) {
      me.overhead("Using telepad layout");

      for (let i = 0; i < tppPath.length; i += 1) {
        for (let h = 0; h < 5; h += 1) {
          Pather.moveTo(wpX - tppPath[i][0], wpY - tppPath[i][1]);

          for (let activate = 0; activate < tppID.length; activate += 1) {
            let telepad = Game.getObject(tppID[activate]);

            if (telepad) {
              do {
                if (Math.abs((telepad.x - (wpX - tppPath[i][0]) + (telepad.y - (wpY - tppPath[i][1])))) <= 0) {
                  delay(100 + me.ping);
                  telepad.interact();
                }
              } while (telepad.getNext());
            }
          }
        }
      }
    }

    return true;
  };

  // START
  Town.doChores(false, { fullChores: true });
  myPrint("starting summoner");

  if (!Misc.checkQuest(sdk.quest.id.TheArcaneSanctuary, 3/* talked to Jerhyn */)) {
    Town.npcInteract("jerhyn");
  }

  Pather.checkWP(sdk.areas.ArcaneSanctuary, true)
    ? Pather.useWaypoint(sdk.areas.ArcaneSanctuary)
    : Pather.getWP(sdk.areas.ArcaneSanctuary);
  Precast.doPrecast(true);
  teleportPads();

  try {
    Pather.moveNearPreset(sdk.areas.ArcaneSanctuary, sdk.unittype.Object, sdk.objects.Journal, 10);
  } catch (err) {
    console.log("ÿc8Kolbot-SoloPlayÿc0: Failed to reach Summoner. Retry");

    if (!Pather.moveToPreset(sdk.areas.ArcaneSanctuary, sdk.unittype.Object, sdk.objects.Journal, -3, -3)) {
      throw new Error("Failed to reach summoner");
    }
  }

  try {
    Attack.killTarget(sdk.monsters.TheSummoner);
  } catch (e) {
    console.log("ÿc8Kolbot-SoloPlayÿc0: Failed to kill summoner");

    return false;
  }

  let journal = Game.getObject(sdk.objects.Journal);

  if (journal) {
    while (!Pather.getPortal(sdk.areas.CanyonofMagic)) {
      Misc.openChest(journal);
      delay(1000 + me.ping);
      me.cancel();
    }
  }

  Pather.usePortal(sdk.areas.CanyonofMagic);

  if (!Pather.checkWP(sdk.areas.CanyonofMagic)) {
    Pather.getWP(sdk.areas.CanyonofMagic);
    Pather.useWaypoint(sdk.areas.LutGholein);
  } else {
    Pather.useWaypoint(sdk.areas.LutGholein);
  }

  !me.summoner && Town.npcInteract("drognan");

  return true;
}
