/**
*  @filename    maggotlair.js
*  @author      theBGuy
*  @desc        early leveling in maggot lair by clearing the beetles worth good exp
*
*/

function maggotlair () {
  const clearBeetles = function () {
    let room = getRoom();
    if (!room) return false;

    let rooms = [];

    do {
      rooms.push([room.x * 5 + room.xsize / 2, room.y * 5 + room.ysize / 2]);
    } while (room.getNext());

    while (rooms.length > 0) {
      rooms.sort(Sort.points);
      room = rooms.shift();

      let result = Pather.getNearestWalkable(room[0], room[1], 15, 2);

      if (result) {
        Pather.moveTo(result[0], result[1], 3);

        let monList = [];
        let monster = Game.getMonster();

        if (monster) {
          do {
            if ((monster.isBeetle || monster.isSpecial)
              && monster.distance <= 30
              && monster.attackable) {
              monList.push(copyUnit(monster));
            }
          } while (monster.getNext());
        }

        if (!Attack.clearList(monList)) return false;
      }
    }

    return true;
  };

  // START
  Town.doChores(false, { fullChores: true });
  myPrint("starting maggot lair beetle bursting");

  Pather.checkWP(sdk.areas.FarOasis, true)
    ? Pather.useWaypoint(sdk.areas.FarOasis)
    : Pather.getWP(sdk.areas.FarOasis);
  Precast.doPrecast(true);
  [sdk.areas.MaggotLairLvl1, sdk.areas.MaggotLairLvl2, sdk.areas.MaggotLairLvl3].forEach((mLair, i) => {
    Pather.moveToExit(mLair, true) && clearBeetles();
    console.log("Cleared mLair " + (i + 1));
  });

  return true;
}
