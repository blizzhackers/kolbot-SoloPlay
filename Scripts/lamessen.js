/**
*  @filename    lamessen.js
*  @author      theBGuy
*  @desc        Get lamessen's tome
*
*/

function lamessen () {
  Town.doChores(false, { fullChores: true });
  myPrint("starting lamessen");

  Pather.checkWP(sdk.areas.KurastBazaar, true) ? Pather.useWaypoint(sdk.areas.KurastBazaar) : Pather.getWP(sdk.areas.KurastBazaar);
  Precast.doPrecast(true);

  if (!Pather.moveToExit(sdk.areas.RuinedTemple, true) || !Pather.moveToPresetObject(me.area, sdk.quest.chest.LamEsensTomeHolder)) {
    throw new Error("Failed to move to LamEssen Tome");
  }

  if (!Misc.checkQuest(sdk.quest.id.LamEsensTome, sdk.quest.states.Completed)) {
    Quest.collectItem(sdk.items.quest.LamEsensTome, sdk.quest.chest.LamEsensTomeHolder);
  }
  Quest.unfinishedQuests();

  return true;
}
