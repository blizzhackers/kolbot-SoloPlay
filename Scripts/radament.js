/**
*  @filename    radament.js
*  @author      theBGuy
*  @desc        kill radament
*
*/

function radament () {
  Town.doChores(false, { fullChores: true });
  myPrint("starting radament");

  if (!Pather.checkWP(sdk.areas.A2SewersLvl2, true)) {
    Town.goToTown(2);
    Pather.moveToExit(sdk.areas.A2SewersLvl1, true);
    Pather.getWP(sdk.areas.A2SewersLvl2);
  } else {
    Pather.useWaypoint(sdk.areas.A2SewersLvl2);
  }

  Precast.doPrecast(true);
  Pather.clearToExit(sdk.areas.A2SewersLvl2, sdk.areas.A2SewersLvl3, true);
  Pather.moveToPreset(me.area, sdk.unittype.Object, sdk.quest.chest.HoradricScrollChest);
  Attack.killTarget("Radament");
  let book = Game.getItem(sdk.quest.item.BookofSkill);
  !!book ? Pickit.pickItem(book) : Attack.killTarget("Radament");
  Pickit.pickItems();

  if (Misc.checkQuest(sdk.quest.id.RadamentsLair, sdk.quest.states.ReqComplete)) {
    Town.npcInteract("atma");
    me.cancelUIFlags();

    let book = me.getItem(sdk.items.quest.BookofSkill);
    if (book) {
      book.isInStash && Town.openStash() && delay(300);
      book.use() && delay(500) && AutoSkill.init(Config.AutoSkill.Build, Config.AutoSkill.Save);
    }
  }

  return true;
}
