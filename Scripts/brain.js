/**
*  @filename    brain.js
*  @author      isid0re, theBGuy
*  @desc        get brain for khalims will
*
*/

function brain () {
  Town.doChores(false, { fullChores: true });
  myPrint("starting brain");

  Pather.checkWP(sdk.areas.FlayerJungle, true)
    ? Pather.useWaypoint(sdk.areas.FlayerJungle)
    : Pather.getWP(sdk.areas.FlayerJungle);
  Precast.doPrecast(true);
  Pather.clearToExit(sdk.areas.FlayerJungle, sdk.areas.FlayerDungeonLvl1, Pather.useTeleport());
  Pather.clearToExit(sdk.areas.FlayerDungeonLvl1, sdk.areas.FlayerDungeonLvl2, Pather.useTeleport());
  Pather.clearToExit(sdk.areas.FlayerDungeonLvl2, sdk.areas.FlayerDungeonLvl3, Pather.useTeleport());

  if (!Pather.moveToPreset(me.area, sdk.unittype.Object, sdk.quest.chest.KhalimsBrainChest)) {
    console.log("ÿc8Kolbot-SoloPlayÿc0: Failed to get the Brain");
  }

  Attack.kill(getLocaleString(sdk.locale.monsters.WitchDoctorEndugu));
  Quest.collectItem(sdk.items.quest.KhalimsBrain, sdk.quest.chest.KhalimsBrainChest);
  Quest.stashItem(sdk.items.quest.KhalimsBrain);

  return true;
}
