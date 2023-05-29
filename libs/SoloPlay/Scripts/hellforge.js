/**
*  @filename    hellforge.js
*  @author      theBGuy
*  @desc        get the forge quest for rune drops for gear.
*
*/

function hellforge () {
  if (Misc.checkQuest(sdk.quest.id.HellsForge, sdk.quest.states.ReqComplete)) {
    Town.goToTown(4) && Town.npcInteract("cain");
    if (Misc.poll(() => Misc.checkQuest(sdk.quest.id.HellsForge, sdk.quest.states.Completed), 2000, 500)) return true;
  }
  myPrint("starting hellforge");
  Town.doChores(false, { thawing: me.coldRes < 75, antidote: me.poisonRes < 75, fullChores: true });
  
  Pather.checkWP(sdk.areas.RiverofFlame, true) ? Pather.useWaypoint(sdk.areas.RiverofFlame) : Pather.getWP(sdk.areas.RiverofFlame);
  Precast.doPrecast(true);

  /** 
   * @todo
   * - Calculate safe spots to cast from so we can kill heph from a distance
   * - Possibly try luring the rest of the monsters away from the forge?
   * - Generate path and use callback to stop after we detect heph in range instead of moving all the way to the forge
   */

  if (!Pather.moveToPresetObject(me.area, sdk.quest.chest.HellForge, { callback: () => {
    let heph = Game.getMonster(getLocaleString(sdk.locale.monsters.HephastoTheArmorer));
    return (heph && heph.distance < 30);
  } })) {
    console.warn("ÿc8Kolbot-SoloPlayÿc0: Failed to move to Hephasto");
  }

  try {
    Attack.clear(20, 0, getLocaleString(sdk.locale.monsters.HephastoTheArmorer));
  } catch (err) {
    console.warn("ÿc8Kolbot-SoloPlayÿc0: Failed to kill Hephasto");
  }

  Pickit.pickItems();
  let forge = Game.getObject(sdk.quest.chest.HellForge);
  !!forge && Attack.clearPos(forge.x, forge.y, 25) && Attack.securePosition(forge.x, forge.y, 25, 3000);

  if (!me.getItem(sdk.items.quest.HellForgeHammer)) {
    // we don't have the hammer, is Hephasto dead?
    let heph = getUnits(sdk.unittype.Monster).filter((unit) => unit.classid === sdk.monsters.Hephasto).first();
    !!heph && heph.attackable && Attack.kill(heph);
    // hammer on ground?
    let ham = getUnits(sdk.unittype.Item).filter((unit) => unit.classid === sdk.items.quest.HellForgeHammer).first();
    !!ham && ham.onGroundOrDropping && Pather.moveToUnit(ham) && Pickit.pickItem(ham);
    // do we have the hammer now?
    if (!me.getItem(sdk.items.quest.HellForgeHammer)) {
      console.warn("Failed to collect Hellforge hammer");
      
      return true;
    }
  }

  Town.doChores();
  Town.npcInteract("cain");

  let oldItem = me.getItemsEx().filter(function (item) {
    return item.isEquipped && item.bodylocation === 4 && !item.isOnSwap;
  }).first();

  if (!Quest.equipItem(sdk.items.quest.HellForgeHammer, 4)) {
    console.warn("Failed to equip HellForge Hammer");

    return true;
  }
  
  Pather.usePortal(sdk.areas.RiverofFlame, me.name);

  if (!Pather.moveToPreset(me.area, sdk.unittype.Object, sdk.quest.chest.HellForge)) {
    console.warn("ÿc8Kolbot-SoloPlayÿc0: Failed to move to forge");

    return true;
  }

  Misc.openChest(sdk.quest.chest.HellForge);
  Quest.smashSomething(sdk.quest.chest.HellForge) && delay(4500 + me.ping);
  !!oldItem && oldItem.isInInventory && oldItem.equip(4);
  Pickit.pickItems();
  Item.autoEquip();
  Town.npcInteract("cain");

  return true;
}
