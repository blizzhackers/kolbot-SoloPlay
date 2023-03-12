/**
*  @filename    RunewordsOverrides.js
*  @author      theBGuy
*  @desc        Runeword.js improvments and enable offline ladder runewords
*
*/

!includeIfNotIncluded("core/Runewords.js");

Runeword.PDiamondShield = Runeword.addRuneword(
	"PDiamondShield", 3,
	[sdk.items.gems.Perfect.Diamond, sdk.items.gems.Perfect.Diamond, sdk.items.gems.Perfect.Diamond],
	[sdk.items.type.AnyShield]
);

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
					|| (reroll && item.getItem() && !NTIP.CheckItem(item, this.pickitEntries) && !Item.autoEquipCheckMerc(item, true) && !Item.autoEquipCheck(item, true))) {
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
