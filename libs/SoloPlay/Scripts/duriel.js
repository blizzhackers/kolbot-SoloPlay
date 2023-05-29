/**
*  @filename    duriel.js
*  @author      isid0re, theBGuy
*  @desc        duriel quest
*
*/

function duriel () {
  // pre-tasks
  Quest.preReqs();
  Quest.cubeItems(sdk.quest.item.HoradricStaff, sdk.quest.item.ShaftoftheHoradricStaff, sdk.quest.item.ViperAmulet);

  // Start
  Town.doChores(false, { fullChores: true });
  myPrint("starting duriel");
  Pather.checkWP(sdk.areas.CanyonofMagic, true) ? Pather.useWaypoint(sdk.areas.CanyonofMagic) : Pather.getWP(sdk.areas.CanyonofMagic);
  Precast.doPrecast(true);
  Pather.moveToExit(getRoom().correcttomb, true);
  Pather.moveToPreset(me.area, sdk.unittype.Object, sdk.objects.HoradricStaffHolder);
  Attack.securePosition(me.x, me.y, 30, 3000, true, me.hell);
  Quest.placeStaff();

  // quest-prep
  let preArea = me.area;
  Town.doChores(null, { thawing: me.coldRes < 75 });

  let oldMercWatch = Config.MercWatch;
  Config.MercWatch = false;

  if (!Pather.usePortal(preArea, me.name)) {
    if (!Pather.journeyTo(preArea)) throw new Error("Failed to move back to duriels tomb");
  }

  // move to and kill dury
  let unit = Misc.poll(() => Game.getObject(sdk.objects.PortaltoDurielsLair));

  if (me.sorceress && unit && Skill.useTK(unit)) {
    for (let i = 0; i < 3; i++) {
      !me.inArea(sdk.areas.DurielsLair) && Packet.telekinesis(unit);
      if (me.inArea(sdk.areas.DurielsLair)) {
        break;
      }
    }

    if (!me.inArea(sdk.areas.DurielsLair) && !Pather.useUnit(sdk.unittype.Object, sdk.objects.PortaltoDurielsLair, sdk.areas.DurielsLair)) {
      Attack.clear(10);
      Pather.useUnit(sdk.unittype.Object, sdk.objects.PortaltoDurielsLair, sdk.areas.DurielsLair);
    }
  } else {
    Pather.useUnit(sdk.unittype.Object, sdk.objects.PortaltoDurielsLair, sdk.areas.DurielsLair);
  }

  me.sorceress && !me.normal ? Attack.pwnDury() : Attack.killTarget("Duriel");
  Pickit.pickItems();

  !me.duriel && !Misc.checkQuest(sdk.quest.id.TheSevenTombs, 3) && Quest.tyraelTomb();

  if (Misc.checkQuest(sdk.quest.id.TheSevenTombs, 3)) {
    for (let i = 0; i < 3; i++) {
      if (!me.duriel && !Misc.checkQuest(sdk.quest.id.TheSevenTombs, 4)) {
        Town.move("palace");
        Town.npcInteract("jerhyn");
      }

      if (Misc.checkQuest(sdk.quest.id.TheSevenTombs, 4)) {
        Pather.moveToExit(sdk.areas.HaremLvl1, true);
        break;
      } else {
        delay(250 + me.ping);
      }
    }
  }

  Pather.changeAct();
  Config.MercWatch = oldMercWatch;

  return true;
}
