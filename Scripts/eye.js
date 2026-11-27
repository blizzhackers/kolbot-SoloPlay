/**
*  @filename    eye.js
*  @author      isid0re, theBGuy
*  @desc        get the eye for khalims will
*
*/

function eye () {
  Town.doChores(false, { fullChores: true });
  myPrint("starting eye");

  Pather.checkWP(sdk.areas.SpiderForest, true)
    ? Pather.useWaypoint(sdk.areas.SpiderForest)
    : Pather.getWP(sdk.areas.SpiderForest);
  Precast.doPrecast(true);

  if (!Pather.moveToExit([sdk.areas.SpiderForest, sdk.areas.SpiderCavern], true)) {
    if (!me.inArea(sdk.areas.SpiderCavern)) {
      if (!Pather.journeyTo(sdk.areas.SpiderCavern)) {
        console.log("ÿc8Kolbot-SoloPlayÿc0: Failed to get the eye");
        return false;
      }
    }
  }

  Town.doChores(null, { antidote: me.poisonRes < 75 });
  Pather.usePortal(sdk.areas.SpiderCavern, me.name);
  Pather.moveToPreset(me.area, sdk.unittype.Object, sdk.quest.chest.KhalimsEyeChest);
  Attack.clear(0x7);
  Quest.collectItem(sdk.items.quest.KhalimsEye, sdk.quest.chest.KhalimsEyeChest);
  Quest.stashItem(sdk.items.quest.KhalimsEye);

  return me.getItem(sdk.items.quest.KhalimsEye);
}
