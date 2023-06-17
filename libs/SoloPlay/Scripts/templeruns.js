/**
*  @filename    templeruns.js
*  @author      theBGuy
*  @desc        temple runs for exp
*
*/

function templeruns () {
  myPrint("starting temple runs");
  // todo - calculate effort required to clear temple and decide whether to run it or move to next
  Town.doChores(false, { fullChores: true });
  Pather.useWaypoint(sdk.areas.LowerKurast);
  Misc.openChestsInArea(sdk.areas.LowerKurast);

  // START
  [
    {
      base: sdk.areas.KurastBazaar,
      temples: [sdk.areas.RuinedTemple, sdk.areas.DisusedFane]
    },
    {
      base: sdk.areas.UpperKurast,
      temples: [sdk.areas.ForgottenReliquary, sdk.areas.ForgottenTemple]
    },
    {
      base: sdk.areas.KurastCauseway,
      temples: [sdk.areas.RuinedFane, sdk.areas.DisusedReliquary]
    },
  ].forEach(function (area) {
    try {
      if (!me.inArea(area.base)) {
        if (!Pather.moveToExit(area.base, true)) throw new Error("Failed to change area");
      }
      const precastTimeout = getTickCount() + Time.minutes(2);
      if (Pather.wpAreas.includes(area.base)
        && !getWaypoint(Pather.wpAreas.indexOf(area.base))) {
        Pather.getWP(area.base);
      }
      /** @type {Map<number, { x: number, y: number }} */
      const _temples = new Map();
      getArea().exits
        .forEach(function (exit) {
          _temples.set(exit.target, { x: exit.x, y: exit.y });
        });
      area.temples
        .sort(function (a, b) {
          return _temples.get(a).distance - _temples.get(b).distance;
        })
        .forEach(function (temple) {
          if (!Pather.moveToExit(temple, true)) throw new Error("Failed to move to the temple");
          Attack.clearLevel(0xF);
          if (me.inArea(sdk.areas.RuinedTemple) && !me.lamessen) {
            me.overhead("lamessen");
            Pather.moveToPreset(sdk.areas.RuinedTemple, sdk.unittype.Object, sdk.quest.chest.LamEsensTomeHolder);
            Quest.collectItem(sdk.quest.item.LamEsensTome, sdk.quest.chest.LamEsensTomeHolder);
            Quest.unfinishedQuests();
          }
          if (!Pather.moveToExit(area.base, true)) throw new Error("Failed to move out of the temple");
          Precast.doPrecast((getTickCount() > precastTimeout));
        });
    } catch (e) {
      console.error(e);
    }
  });

  if (!Pather.checkWP(sdk.areas.Travincal)) {
    Pather.getWP(sdk.areas.Travincal);
    Town.goToTown();
  }

  return true;
}
