/**
*  @filename    savebarby.js
*  @author      theBGuy
*  @credit      AutoSmurf
*  @desc        rescue barbies for runes for ancient pledge
*
*/

function savebarby () {
  let coords = [];

  Town.doChores(false, { fullChores: true });
  myPrint("starting barbies");

  Pather.checkWP(sdk.areas.FrigidHighlands, true) ? Pather.useWaypoint(sdk.areas.FrigidHighlands) : Pather.getWP(sdk.areas.FrigidHighlands);
  Precast.doPrecast(true);
  let barbies = (Game.getPresetObjects(me.area, sdk.quest.chest.BarbCage) || []);

  if (!barbies) return false;

  for (let cage = 0 ; cage < barbies.length ; cage += 1) {
    coords.push({
      x: barbies[cage].roomx * 5 + barbies[cage].x - 3, //Dark-f: x-3
      y: barbies[cage].roomy * 5 + barbies[cage].y
    });
  }

  for (let k = 0; k < coords.length; k += 1) {
    me.overhead("let my barby go! " + (k + 1) + "/" + barbies.length);
    Pather.moveToUnit(coords[k], 2, 0);
    let door = Game.getMonster(sdk.monsters.PrisonDoor);

    if (door) {
      Pather.moveToUnit(door, 1, 0);

      for (let i = 0; i < 20 && door.hp; i += 1) {
        Skill.cast(Config.AttackSkill[1], Skill.getHand(Config.AttackSkill[1]), door);
      }
    }

    delay(1500 + me.ping);
  }

  Town.npcInteract("qual_kehk");

  return true;
}
