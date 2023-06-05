/**
*  @filename    RunewordsOverrides.js
*  @author      theBGuy
*  @desc        Runeword.js improvments and enable offline ladder runewords
*
*/

includeIfNotIncluded("core/Runewords.js");
includeIfNotIncluded("SoloPlay/Functions/NTIPOverrides.js");

Runeword.PDiamondShield = Runeword.addRuneword(
  "PDiamondShield", 3,
  [sdk.items.gems.Perfect.Diamond, sdk.items.gems.Perfect.Diamond, sdk.items.gems.Perfect.Diamond],
  [sdk.items.type.AnyShield]
);

Runewords.pickitEntries = new NTIPList();

Runewords.init = function () {
  if (!Config.MakeRunewords) return;

  Runewords.pickitEntries.clear();

  // initiate pickit entries
  for (let entry of Config.KeepRunewords) {
    let info = {
      file: "Character Config",
      line: entry
    };

    let parsedLine = NTIP.ParseLineInt(entry, info);
    if (parsedLine) {
      Runewords.pickitEntries.add(parsedLine, info);
    }
  }

  // change text to classid
  for (let i = 0; i < Config.Runewords.length; i += 1) {
    const [runeword, base] = Config.Runewords[i];

    if (!runeword.ladderRestricted()) {
      if (isNaN(base)) {
        if (NTIPAliasClassID.hasOwnProperty(base.replace(/\s+/g, "").toLowerCase())) {
          Config.Runewords[i][1] = NTIPAliasClassID[base.replace(/\s+/g, "").toLowerCase()];
        } else {
          Misc.errorReport("ÿc1Invalid runewords entry:ÿc0 " + base);
          Config.Runewords.splice(i, 1);

          i -= 1;
        }
      }
    }
  }

  this.buildLists();
};

Runewords.checkRunewords = function () {
  // keep a const reference of our items so failed checks don't remove items from the list
  const itemsRef = me.findItems(-1, sdk.items.mode.inStorage);

  for (let i = 0; i < Config.Runewords.length; i += 1) {
    let itemList = []; // reset item list
    let items = itemsRef.slice(); // copy itemsRef

    const [runeword, wantedBase, ethFlag] = Config.Runewords[i];
    if (runeword.reqLvl > me.charlvl) continue; // skip runeword if we don't meet the level requirement
    let base = this.getBase(runeword, wantedBase, (ethFlag || 0)); // check base

    if (base) {
      itemList.push(base); // push the base

      for (let j = 0; j < runeword.runes.length; j += 1) {
        for (let k = 0; k < items.length; k += 1) {
          if (items[k].classid === runeword.runes[j]) { // rune matched
            itemList.push(items[k]); // push into the item list
            items.splice(k, 1); // remove from item list as to not count it twice

            k -= 1;

            break; // stop item cycle - we found the item
          }
        }

        // can't complete runeword - go to next one
        if (itemList.length !== j + 2) {
          break;
        }

        if (itemList.length === runeword.runes.length + 1) { // runes + base
          return itemList; // these items are our runeword
        }
      }
    }
  }

  return false;
};

/**
 * Get the base item based on classid and runeword recipe
 * @param {runeword} runeword 
 * @param {ItemUnit | number} base - item or classid
 * @param {number} [ethFlag] 
 * @param {boolean} [reroll] - optional reroll argument = gets a runeword that needs rerolling
 * @returns {ItemUnit | false}
 */
Runewords.getBase = function (runeword, base, ethFlag, reroll) {
  let item = typeof base === "object"
    ? base
    : me.getItem(base, sdk.items.mode.inStorage);

  if (item) {
    do {
      if (item && item.quality < sdk.items.quality.Magic
        && item.sockets === runeword.sockets && runeword.itemTypes.includes(item.itemType)) {
        /**
         * check if item has items socketed in it
         * better check than getFlag(sdk.items.flags.Runeword) because randomly socketed items return false for it
         */

        if ((!reroll && !item.getItem() && Item.betterBaseThanWearing(item, Developer.debugging.baseCheck))
          || (reroll && item.getItem() && !NTIP.CheckItem(item, this.pickitEntries)
          && !Item.autoEquipCheckMerc(item, true) && !Item.autoEquipCheck(item, true))) {
          if (!ethFlag || (ethFlag === Roll.Eth && item.ethereal) || (ethFlag === Roll.NonEth && !item.ethereal)) {
            return copyUnit(item);
          }
        }
      }
    } while (typeof base !== "object" && item.getNext());
  }

  return false;
};

Runewords.checkRune = function (...runes) {
  if (!Config.MakeRunewords || runes.length < 1) return false;

  for (let classid of runes) {
    if (this.needList.includes(classid)) return true;
  }

  return false;
};
