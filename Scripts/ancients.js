/**
*  @filename    ancients.js
*  @author      theBGuy
*  @credit      sonic
*  @desc        ancients quest
*
*/

function ancients () {
  Town.doChores(false, { fullChores: true });
  myPrint("starting ancients");

  Pather.checkWP(sdk.areas.AncientsWay)
    ? Pather.useWaypoint(sdk.areas.AncientsWay)
    : Pather.getWP(sdk.areas.AncientsWay);
  Precast.doPrecast(true);
  Pather.clearToExit(sdk.areas.AncientsWay, sdk.areas.ArreatSummit, true); // enter Arreat Summit

  // failed to move to Arreat Summit
  if (!me.inArea(sdk.areas.ArreatSummit)) {
    return false;
  }

  // ancients prep
  Town.doChores(false, { thawing: true, antidote: true, stamina: true, fullChores: true });

  let tempConfig = copyObj(Config); // save and update config settings
  // each build's 20+ yard skills hurt every Ancient: Leveling, Blizzballer and Meteorb mix cold and fire for Hell's
  // immunities, and Stepping (cold) plays Nightmare, where no Ancient is natively immune
  const standOff = (me.nightmare || me.hell) && me.sorceress && Pather.canTeleport()
    && ["Leveling", "Stepping", "Blizzballer", "Meteorb"].includes(SetUp.currentBuild);

  Config.TownCheck = false;
  Config.MercWatch = false;
  Config.TownHP = 0;
  Config.TownMP = 0;
  Config.HPBuffer = 15;
  Config.MPBuffer = 15;
  // the stand-off sorceress dodges far more than she gets hit: most of her spare potions are mana
  if (standOff) {
    Config.HPBuffer = 8;
    Config.MPBuffer = 22;
  }
  // lower than the usual chicken so the fight isn't abandoned on every big hit, but a hardcore character still
  // leaves the game before the Ancients can finish her
  Config.LifeChicken = me.hardcore ? 25 : 10;
  CharData.updateConfig();
  me.overhead("updated settings");

  NPCAction.buyPotions();
  if (!Pather.usePortal(sdk.areas.ArreatSummit, me.name)) {
    console.log("ÿc8Kolbot-SoloPlayÿc0: Failed to take portal back to Arreat Summit");
    Pather.clearToExit(sdk.areas.AncientsWay, sdk.areas.ArreatSummit, true); // enter Arreat Summit
  }

  if (standOff) {
    Attack.pwnAncients();
  } else {
    Precast.doPrecast(true);

    // move to altar
    if (!Pather.moveToPreset(sdk.areas.ArreatSummit, sdk.unittype.Object, sdk.quest.chest.AncientsAltar)) {
      console.warn("ÿc8Kolbot-SoloPlayÿc0: Failed to move to ancients' altar");
    }

    Common.Ancients.touchAltar();
    Common.Ancients.startAncients(true, true);
  }
  
  me.cancel();
  Config = tempConfig;
  CharData.updateConfig();
  me.overhead("restored settings");
  Precast.doPrecast(true);

  try {
    if (Misc.checkQuest(sdk.quest.id.RiteofPassage, sdk.quest.states.Completed)) {
      Pather.clearToExit(sdk.areas.ArreatSummit, sdk.areas.WorldstoneLvl1, true);
      Pather.clearToExit(sdk.areas.WorldstoneLvl1, sdk.areas.WorldstoneLvl2, true);
      Pather.getWP(sdk.areas.WorldstoneLvl2);
    }
  } catch (err) {
    console.log("ÿc8Kolbot-SoloPlayÿc0: Cleared Ancients. Failed to get WSK Waypoint");
  }

  return true;
}
