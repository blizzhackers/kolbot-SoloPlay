/**
*  @filename    fireeye.js
*  @author      theBGuy
*  @desc        kill fireye in palace cellar lvl 3
*
*/

function fireeye () {
  Town.doChores(false, { fullChores: true });
  myPrint("starting fireeye");

  if (!me.summoner && !Misc.checkQuest(sdk.quest.id.TheArcaneSanctuary, 3/* talked to Jerhyn */)) {
    Town.npcInteract("jerhyn");
  }

  Pather.checkWP(sdk.areas.ArcaneSanctuary, true)
    ? Pather.useWaypoint(sdk.areas.ArcaneSanctuary)
    : Pather.getWP(sdk.areas.ArcaneSanctuary);
  Precast.doPrecast(true);

  if (!Pather.usePortal(null)) throw new Error("Failed to move to Fire Eye");
  Attack.clear(15, 0, getLocaleString(sdk.locale.monsters.FireEye));

  return true;
}
