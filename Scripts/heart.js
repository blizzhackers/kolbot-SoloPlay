/**
*  @filename    heart.js
*  @author      theBGuy
*  @desc        get the heart for khalims will
*
*/

function heart () {
  Town.doChores(false, { fullChores: true });
  myPrint("starting heart");

  Pather.checkWP(sdk.areas.KurastBazaar, true)
    ? Pather.useWaypoint(sdk.areas.KurastBazaar)
    : Pather.getWP(sdk.areas.KurastBazaar);
  Precast.doPrecast(true);

  if (!Pather.journeyTo(sdk.areas.A3SewersLvl2)
    || !Pather.moveToPresetObject(me.area, sdk.quest.chest.KhalimsHeartChest)) {
    if (!me.getItem(sdk.items.quest.KhalimsHeart)) {
      console.log("ÿc8Kolbot-SoloPlayÿc0: Failed to get the heart");
      return false;
    }
  }

  Attack.clear(0x7); // clear level
  Quest.collectItem(sdk.items.quest.KhalimsHeart, sdk.quest.chest.KhalimsHeartChest);
  Quest.stashItem(sdk.items.quest.KhalimsHeart);

  return me.getItem(sdk.items.quest.KhalimsHeart);
}
