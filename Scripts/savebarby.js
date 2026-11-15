/**
*  @filename    savebarby.js
*  @author      theBGuy
*  @credit      AutoSmurf
*  @desc        rescue barbies for runes for ancient pledge
*
*/

function savebarby () {
  let coords = [];
  let checkedDoorAgain = false;

  Town.doChores(false, { fullChores: true });
  myPrint("starting barbies");

  Pather.checkWP(sdk.areas.FrigidHighlands, true)
    ? Pather.useWaypoint(sdk.areas.FrigidHighlands)
    : Pather.getWP(sdk.areas.FrigidHighlands);
  Precast.doPrecast(true);
  let barbies = (Game.getPresetObjects(me.area, sdk.quest.chest.BarbCage) || []);

  if (!barbies.length) throw new Error("No barbarian cages found");

  for (let cage = 0 ; cage < barbies.length ; cage += 1) {
    coords.push({
      x: barbies[cage].roomx * 5 + barbies[cage].x - 3, //Dark-f: x-3
      y: barbies[cage].roomy * 5 + barbies[cage].y
    });
  }

  for (let k = 0; k < coords.length; k += 1) {
    me.overhead("let my barby go! " + (k + 1) + "/" + barbies.length);
    Pather.moveToUnit(coords[k], 2, 0);
    const cage = coords[k];
    const findDoor = function () {
      return getUnits(sdk.unittype.Monster, sdk.monsters.PrisonDoor)
        .filter(function (unit) {
          return unit.hp > 0 && getDistance(unit, cage.x + 10, cage.y) < 15;
        })
        .sort(function (a, b) {
          return getDistance(a, cage.x + 10, cage.y) - getDistance(b, cage.x + 10, cage.y);
        })[0];
    };
    let door = Misc.poll(findDoor, 1500 + me.ping, 40);
    if (!door) {
      // A door east of the cage may first become visible as its room loads.
      Pather.moveTo(cage.x + 8, cage.y);
      door = Misc.poll(findDoor, 1500 + me.ping, 40);
      checkedDoorAgain = true;
    }

    if (door) {
      Pather.moveToUnit(door, 1, 0);

      for (let i = 0; i < 20 && door.hp; i += 1) {
        Skill.cast(Config.AttackSkill[1], Skill.getHand(Config.AttackSkill[1]), door);
      }
    }

    delay(1500 + me.ping);
  }

  const talked = Town.npcInteract("qual_kehk");
  if (checkedDoorAgain && (!talked || !Misc.poll(function () { return me.savebarby; }, 1200 + me.ping, 100))) {
    throw new Error("Barbarian rescue did not grant quest credit");
  }

  return true;
}
