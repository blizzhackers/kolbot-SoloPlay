/**
*  @filename    tombs.js
*  @author      theBGuy
*  @desc        leveling in act 2 tombs
*
*/

/**
*  @todo:
*   - before going to town after reaching chest, whether we need to do town chores
*   - If not
*     - check distance from curr position to tomb exit + curr tomb exit -> next tomb exit
*     - will also need to know distance from current tomb exit to next tomb exit in comparison to town portalspot -> wp + canyon wp -> next tomb
*     - choose shortest path
*/

function tombs () {
  myPrint("starting tombs");

  const tombID = [
    sdk.areas.TalRashasTomb4, sdk.areas.TalRashasTomb3, sdk.areas.TalRashasTomb2, sdk.areas.TalRashasTomb1,
    sdk.areas.TalRashasTomb5, sdk.areas.TalRashasTomb6, sdk.areas.TalRashasTomb7
  ];
  Town.doChores(false, { fullChores: true });

  for (let number = 0; number < tombID.length; number++) {
    if (SoloIndex.index.duriel.skipIf()) return true;
    Pather.checkWP(sdk.areas.CanyonofMagic, true)
      ? Pather.useWaypoint(sdk.areas.CanyonofMagic)
      : Pather.getWP(sdk.areas.CanyonofMagic);
    Precast.doPrecast(true);

    if (Pather.moveToExit(tombID[number], true, true)) {
      me.overhead("Tomb #" + (number + 1));
      const duryTomb = getRoom().correcttomb === me.area;

      let obj = Game.getPresetObject(
        me.area,
        (!duryTomb ? sdk.objects.SmallSparklyChest : sdk.objects.HoradricStaffHolder)
      );
      !!obj && Pather.moveToUnit(obj);

      Attack.clear(50);
      Pickit.pickItems();

      if (me.duriel && Game.getObject(sdk.objects.PortaltoDurielsLair)) {
        Pather.useUnit(sdk.unittype.Object, sdk.objects.PortaltoDurielsLair, sdk.areas.DurielsLair);
        me.sorceress && !me.normal ? Attack.pwnDury() : Attack.killTarget("Duriel");
        Pickit.pickItems();
      }
    }

    Town.goToTown();
    Town.heal();
  }

  return true;
}
