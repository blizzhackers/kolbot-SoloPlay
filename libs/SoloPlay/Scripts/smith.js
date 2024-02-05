/**
*  @filename    smith.js
*  @author      theBGuy, isid0re
*  @desc        Tools of the Trade quest for imbue reward.
*
*/

function smith () {
  Town.doChores(false, { fullChores: true });
  myPrint("starting smith");

  Pather.checkWP(sdk.areas.OuterCloister, true) ? Pather.useWaypoint(sdk.areas.OuterCloister) : Pather.getWP(sdk.areas.OuterCloister);
  Precast.doPrecast(true);
  Pather.moveToExit(sdk.areas.Barracks);

  if (!Pather.moveToPreset(sdk.areas.Barracks, sdk.unittype.Object, sdk.quest.chest.MalusHolder)) {
    console.log("ÿc8Kolbot-SoloPlayÿc0: Failed to move to the Smith");
    return false;
  }

  try {
    Attack.killTarget(sdk.monsters.TheSmith);
  } catch (err) {
    console.log("ÿc8Kolbot-SoloPlayÿc0: Failed to kill Smith");
  }

  Quest.collectItem(sdk.items.quest.HoradricMalus, sdk.quest.chest.MalusHolder);
  Pickit.pickItems();
  Town.goToTown();
  Town.npcInteract("charsi");

  if (!getWaypoint(Pather.wpAreas.indexOf(sdk.areas.JailLvl1))) {
    Pather.usePortal(null, me.name);
    Pather.getWP(sdk.areas.JailLvl1);
    Pather.useWaypoint(sdk.areas.RogueEncampment);
  }

  return true;
}
