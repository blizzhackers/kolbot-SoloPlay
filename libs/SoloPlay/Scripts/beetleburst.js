/**
*  @filename    beetleburst.js
*  @author      isid0re, theBGuy
*  @desc        kill beetleburst for exp
*
*/

function beetleburst () {
  // const clearBeetles = function () {
  //   let room = getRoom();
  //   if (!room) return false;

  //   const rooms = [];
  //   /** @param {Monster} monster */
  //   const check = function (monster) {
  //     return [
  //       sdk.monsters.DungSoldier,
  //       sdk.monsters.DeathBeetle,
  //       sdk.monsters.BlackVultureNest
  //     ].includes(monster.classid) && monster.distance <= 30;
  //   };

  //   do {
  //     rooms.push([room.x * 5 + room.xsize / 2, room.y * 5 + room.ysize / 2]);
  //   } while (room.getNext());

  //   while (rooms.length > 0) {
  //     rooms.sort(Sort.points);
  //     room = rooms.shift();

  //     let result = Pather.getNearestWalkable(room[0], room[1], 15, 2);

  //     if (result) {
  //       Pather.moveTo(result[0], result[1], 3);

  //       let monList = Attack.buildMonsterList(check);
  //       if (!monList.length) continue;

  //       if (!Attack.clearList(monList)) {
  //         return false;
  //       }
  //     }
  //   }

  //   return true;
  // };
  
  Town.doChores();
  myPrint("ÿc8Kolbot-SoloPlayÿc0: starting beetleburst");

  Pather.checkWP(sdk.areas.FarOasis, true)
    ? Pather.useWaypoint(sdk.areas.FarOasis)
    : Pather.getWP(sdk.areas.FarOasis);
  Precast.doPrecast(true);

  // clearBeetles();
  Pather.moveToPreset(me.area, sdk.unittype.Monster, sdk.monsters.preset.Beetleburst);
  Attack.clear(15, 0, getLocaleString(sdk.locale.monsters.Beetleburst));
  
  if (!me.haveWaypoint(sdk.areas.LostCity)) {
    Pather.moveToExit(sdk.areas.LostCity, true);
    if (Pather.moveToPresetMonster(me.area, sdk.monsters.preset.DarkElder)) {
      Attack.clear(15, 0, getLocaleString(sdk.locale.monsters.DarkElder));
    }
    Pather.getWP(sdk.areas.LostCity);
  }

  return true;
}
