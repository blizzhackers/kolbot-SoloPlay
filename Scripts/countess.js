/**
*  @filename    countess.js
*  @author      kolton, theBGuy
*  @desc        countess runs for rune based gear and Terror keys
*
*/

function countess () {
  const floors = [
    sdk.areas.ForgottenTower, sdk.areas.TowerCellarLvl1,
    sdk.areas.TowerCellarLvl2, sdk.areas.TowerCellarLvl3,
    sdk.areas.TowerCellarLvl4, sdk.areas.TowerCellarLvl5
  ];
  Town.doChores(false, { fullChores: true });
  myPrint("starting countess");

  Pather.checkWP(sdk.areas.BlackMarsh, true)
    ? Pather.useWaypoint(sdk.areas.BlackMarsh)
    : Pather.getWP(sdk.areas.BlackMarsh);
  Precast.doPrecast(true);
  let forQuest = !Misc.checkQuest(sdk.quest.id.ForgottenTower, sdk.quest.states.Completed);

  if (me.charlvl < 12) {
    // @todo - low level, lets take a scenic route and kill those hawk nests
  }

  try {
    if (me.charlvl < 15) {
      for (let i = 0; i < floors.length; i += 1) {
        Pather.moveToExit(floors[i], true);
        Attack.clear(0x7);
      }
    } else {
      Pather.moveToExit(floors, true);
    }

    Pather.moveToPreset(me.area, sdk.unittype.Object, sdk.objects.SuperChest);
    Attack.killTarget(getLocaleString(sdk.locale.monsters.TheCountess));

    if (forQuest) {
      Pather.moveToPreset(me.area, sdk.unittype.Object, sdk.objects.SuperChest);
      let _items = new Set();
      let _oldSize = 0;
      let itemEvent = function (gid, mode) {
        if (gid > 0 && mode === 0) {
          _items.add(gid);
        }
      };
      try {
        addEventListener("itemaction", itemEvent);
        Misc.poll(function () {
          if (_items.size > _oldSize) {
            _oldSize = _items.size;
            return false;
          }

          return _items.size > 0 && _items.size === _oldSize;
        }, Time.seconds(5), Time.seconds(1));
      } finally {
        removeEventListener("itemaction", itemEvent);
      }
    }
  } catch (err) {
    console.log("ÿc8Kolbot-SoloPlayÿc0: Failed to kill Countess: " + err);
  }

  Pickit.pickItems();

  return true;
}
