/**
*  @filename    cows.js
*  @author      kolton, theBGuy
*  @desc        clear the Moo Moo Farm without killing the Cow King
*
*/

function cows () {
  const getLeg = function () {
    if (me.getItem(sdk.items.quest.WirtsLeg)) return me.getItem(sdk.items.quest.WirtsLeg);

    // Cain is incomplete, complete it then continue @isid0re
    if (!me.tristram) {
      Loader.runScript("tristram");
      includeIfNotIncluded("SoloPlay/Scripts/tristram.js");
      !me.inTown && Town.goToTown();
    }

    Pather.useWaypoint(sdk.areas.StonyField);
    Precast.doPrecast(true);
    Pather.moveToPreset(sdk.areas.StonyField, sdk.unittype.Monster, sdk.monsters.preset.Rakanishu, 8, 8);
    Pather.usePortal(sdk.areas.Tristram);

    if (me.inArea(sdk.areas.Tristram)) {
      Pather.moveTo(25048, 5177);
      Quest.collectItem(sdk.items.quest.WirtsLeg, sdk.quest.chest.Wirt);
      Pickit.pickItems();
      Town.goToTown();
    } else {
      return false;
    }

    return me.getItem(sdk.items.quest.WirtsLeg);
  };

  const openPortal = function (portalID, ...classIDS) {
    !me.inArea(sdk.areas.RogueEncampment) && Town.goToTown(1);

    let npc, tome, scroll;
    let tpTome = me.findItems(sdk.items.TomeofTownPortal, sdk.items.mode.inStorage, sdk.storage.Inventory);

    try {
      if (tpTome.length < 2) {
        npc = Town.initNPC("Shop", "buyTpTome");
        if (!getInteractedNPC()) throw new Error("Failed to find npc");

        tome = npc.getItem(sdk.items.TomeofTownPortal);

        if (!!tome && tome.getItemCost(sdk.items.cost.ToBuy) < me.gold && tome.buy()) {
          delay(500);
          tpTome = me.findItems(sdk.items.TomeofTownPortal, sdk.items.mode.inStorage, sdk.storage.Inventory);
          scroll = npc.getItem(sdk.items.ScrollofTownPortal);
          let scrollCost = scroll.getItemCost(sdk.items.cost.ToBuy);
          tpTome.forEach(function (book) {
            while (book.getStat(sdk.stats.Quantity) < 20) {
              scroll = npc.getItem(sdk.items.ScrollofTownPortal);
              
              if (!!scroll && scrollCost < me.gold) {
                scroll.buy(true);
              } else {
                break;
              }

              delay(20);
            }
          });
        }
      }
    } finally {
      me.cancelUIFlags();
    }

    !Town.openStash() && console.log("ÿc8Kolbot-SoloPlayÿc0: Failed to open stash. (openPortal)");
    !Cubing.emptyCube() && console.log("ÿc8Kolbot-SoloPlayÿc0: Failed to empty cube. (openPortal)");
    if (!me.getItem(sdk.items.quest.WirtsLeg)) return false;

    for (let classID of classIDS) {
      let cubingItem;
      if (classID === sdk.items.TomeofTownPortal) {
        // select the tome we just bought rather than the one we had by it's position in our invo
        cubingItem = me.getItemsEx(sdk.items.TomeofTownPortal).filter(i => i.isInInventory).sort((a, b) => a.x - b.x).first();
      } else {
        cubingItem = me.getItem(classID);
      }

      if (!cubingItem || !Storage.Cube.MoveTo(cubingItem)) {
        return false;
      }
    }

    Misc.poll(() => Cubing.openCube(), Time.seconds(10), 1000);

    let tick = getTickCount();

    while (getTickCount() - tick < 5000) {
      if (Cubing.openCube()) {
        transmute();
        delay(750);
        let cowPortal = Pather.getPortal(portalID);

        if (cowPortal) {
          break;
        }
      }
    }

    me.cancel();
    me.sortInventory();

    return true;
  };

  if (!me.diffCompleted) throw new Error("Final quest incomplete, cannot make cows yet");

  // START
  Town.doChores(false, { fullChores: true });
  myPrint("starting cows");

  if (!Pather.getPortal(sdk.areas.MooMooFarm) && !getLeg()) return true;
  
  Town.doChores();
  openPortal(sdk.areas.MooMooFarm, sdk.items.quest.WirtsLeg, sdk.items.TomeofTownPortal);
  NPCAction.fillTome(sdk.items.TomeofTownPortal);

  // when does this become not worth it
  if (Pather.canTeleport()) {
    Misc.getExpShrine([sdk.areas.StonyField, sdk.areas.DarkWood, sdk.areas.BlackMarsh]);
  } else {
    Misc.getExpShrine([sdk.areas.BloodMoor]);
  }
  
  Town.move("stash");

  if (Misc.poll(() => Pather.usePortal(sdk.areas.MooMooFarm), Time.seconds(30), Time.seconds(1))) {
    include("core/Common/Cows.js");
    const Worker = require("../../modules/Worker");
    let kingTick = getTickCount();
    let king;
    let kingPreset;

    Worker.runInBackground.kingTracker = function () {
      if (me.inArea(sdk.areas.MooMooFarm)) {
        if (getTickCount() - kingTick < 1000) return true;
        kingTick = getTickCount();
        king = Game.getMonster(getLocaleString(sdk.locale.monsters.TheCowKing));
        // only get the preset unit once
        !kingPreset && (kingPreset = Game.getPresetMonster(me.area, sdk.monsters.preset.TheCowKing));

        if (king && kingPreset) {
          if (getDistance(me.x, me.y, getRoom(kingPreset.roomx * 5 + kingPreset.x), getRoom(kingPreset.roomy * 5 + kingPreset.y)) <= 25) {
            myPrint("exit cows. Near the king");
            throw new Error("exit cows. Near the king");
          }
        }
      }

      return true;
    };

    Precast.doPrecast(true);
    Common.Cows.clearCowLevel();
  }

  return true;
}
