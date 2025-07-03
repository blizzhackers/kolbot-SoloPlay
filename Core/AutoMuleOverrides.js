/**
*  @filename    AutoMuleOverrides.js
*  @author      theBGuy
*  @desc        Automule fix to not mule wanted autoequip items
*
*/

/**
 * @todo Would be interesting to have soloplay get a list of items on the mule when we join it's game to check if we need anything it currently has
 * essentially a basic form of item sharing
 */

includeIfNotIncluded("systems/automule/Automule.js");

/**
* @param {ItemUnit} item 
* @param {string[] | number[]} list 
* @returns {boolean}
*/
AutoMule.matchItem = function (item, list) {
  let parsedPickit = new NTIPList();
  let classIDs = [];

  for (let i = 0; i < list.length; i += 1) {
    let info = {
      file: "Character Config",
      line: list[i]
    };

    // classids
    if (typeof list[i] === "number") {
      classIDs.push(list[i]);
    } else if (typeof list[i] === "string") {
      // pickit entries
      let parsedLine = NTIP.ParseLineInt(list[i], info);
      if (parsedLine) {
        parsedPickit.add(parsedLine, info);
      }
    }
  }

  return (classIDs.includes(item.classid) || NTIP.CheckItem(item, parsedPickit));
};

AutoMule.getMuleItems = function () {
  // can't mule on single player
  if (!me.gameserverip) return [];
  let info = this.getInfo();

  if (!info || !info.hasOwnProperty("muleInfo")) {
    return false;
  }
  
  const muleOrphans = !!(info.muleInfo.hasOwnProperty("muleOrphans") && info.muleInfo.muleOrphans);
  
  /**
   * @param {ItemUnit} item 
   */
  const questItem = function (item) {
    return [
      sdk.items.quest.KeytotheCairnStones, sdk.items.quest.ScrollofInifuss,
      sdk.items.quest.HoradricMalus, sdk.items.quest.WirtsLeg,
      sdk.items.quest.HoradricStaff, sdk.items.quest.ShaftoftheHoradricStaff,
      sdk.items.quest.ViperAmulet, sdk.items.quest.Cube,
      sdk.items.quest.KhalimsBrain, sdk.items.quest.KhalimsEye,
      sdk.items.quest.KhalimsHeart, sdk.items.quest.KhalimsFlail,
      sdk.items.quest.DecoyGidbinn, sdk.items.quest.TheGidbinn,
      sdk.items.quest.KhalimsWill, sdk.items.quest.PotofLife,
      sdk.items.quest.MephistosSoulstone, sdk.items.quest.HellForgeHammer,
      sdk.items.quest.MalahsPotion, sdk.items.quest.ScrollofResistance,
    ].includes(item.classid);
  };

  /**
   * @param {ItemUnit} item 
   */
  const isAKey = function (item) {
    return [
      sdk.items.quest.KeyofTerror,
      sdk.items.quest.KeyofHate,
      sdk.items.quest.KeyofDestruction
    ].includes(item.classid);
  };
  
  /**
   * check if wanted by any of the systems
   * @param {ItemUnit} item
   * @returns {boolean} if item is wanted by various systems
   */
  const isWanted = function (item) {
    return (AutoMule.cubingIngredient(item)
      || AutoMule.runewordIngredient(item)
      || AutoMule.utilityIngredient(item)
      || SoloWants.keepItem(item));
  };

  const checkTorchSystem = TorchSystem.getFarmers() && TorchSystem.isFarmer();

  // lets be more explicit about what we want to mule
  let items = me.getItemsEx()
    .filter(function (item) {
      // we don't mule items that are equipped or are junk
      if (!item.isInStorage || Town.ignoreType(item.itemType)) return false;
      // don't mule excluded items
      if (AutoMule.matchItem(item, Config.AutoMule.Exclude)) return false;
      // don't mule quest items
      if (questItem(item)) return false;
      // don't mule wanted autoequip items
      if (AutoEquip.wanted(item)) return false;
      // don't mule items in locked spots - not exactly applicable for soloplay but including it
      if (item.isInInventory && Storage.Inventory.IsLocked(item, Config.Inventory)) return false;
      // don't mule items wanted by one of the various systems - checks that it's not on the force mule list
      if (isWanted(item) && !AutoMule.matchItem(item, Config.AutoMule.Force.concat(Config.AutoMule.Trigger))) {
        return false;
      }
      // don't mule keys if part of torchsystem, again shouldn't really be used with soloplay but still including it
      if (isAKey(item) && checkTorchSystem) return false;
      // we've gotten this far, mule items that are on the force list
      if (AutoMule.matchItem(item, Config.AutoMule.Force.concat(Config.AutoMule.Trigger))) return true;
      // alright that handles the basics -- now normal pickit check
      return (Pickit.checkItem(item).result > 0
        && NTIP.CheckItem(item, NTIP.CheckList) === 1) || (item.isInStash && muleOrphans);
    });

  return items;
};
