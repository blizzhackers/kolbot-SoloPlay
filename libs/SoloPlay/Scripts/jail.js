/**
*  @filename    jail.js
*  @author      theBGuy
*  @desc        jail runs for levels
*
*/

function jail () {
  Town.doChores(false, { fullChores: true });
  myPrint("starting jail");
  const levels = [sdk.areas.JailLvl1, sdk.areas.JailLvl2, sdk.areas.JailLvl3];

  Pather.checkWP(sdk.areas.JailLvl1, true) ? Pather.useWaypoint(sdk.areas.JailLvl1) : Pather.getWP(sdk.areas.JailLvl1);

  for (let i = 1; i < levels.length; i++) {
    myPrint("clearing jail level " + i);

    Precast.doPrecast(true);
    Attack.clearLevelEx({ quitWhen: function () {
      if (!me.hell) return false; // don't quit
      let dangerMob = Game.getMonster();

      if (dangerMob) {
        do {
          if (dangerMob.attackable && [sdk.monsters.Tainted, sdk.monsters.Tainted2].includes(dangerMob.classid)) {
            myPrint("Tainted mob found. Moving to next level");
            return true;
          }
        } while (dangerMob.getNext());
      }

      return false;
    } });
    Pather.clearToExit(me.area, levels[i], true);
  }

  return true;
}
