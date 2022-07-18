/**
*  @filename    RunewordsOverrides.js
*  @author      theBGuy
*  @desc        Runeword.js improvments and enable offline ladder runewords
*
*/

if (!isIncluded("common/Runewords.js")) { include("common/Runewords.js"); }

// Don't use ladder-only on NL
Runeword.Brand = (me.ladder || Developer.addLadderRW) ? [sdk.items.runes.Jah, sdk.items.runes.Lo, sdk.items.runes.Mal, sdk.items.runes.Gul] : false;
Runeword.Death = (me.ladder || Developer.addLadderRW) ? [sdk.items.runes.Hel, sdk.items.runes.El, sdk.items.runes.Vex, sdk.items.runes.Ort, sdk.items.runes.Gul] : false;
Runeword.Destruction = (me.ladder || Developer.addLadderRW) ? [sdk.items.runes.Vex, sdk.items.runes.Lo, sdk.items.runes.Ber, sdk.items.runes.Jah, sdk.items.runes.Ko] : false;
Runeword.Dragon = (me.ladder || Developer.addLadderRW) ? [sdk.items.runes.Sur, sdk.items.runes.Lo, sdk.items.runes.Sol] : false;
Runeword.Dream = (me.ladder || Developer.addLadderRW) ? [sdk.items.runes.Io, sdk.items.runes.Jah, sdk.items.runes.Pul] : false;
Runeword.Edge = (me.ladder || Developer.addLadderRW) ? [sdk.items.runes.Tir, sdk.items.runes.Tal, sdk.items.runes.Amn] : false;
Runeword.Faith = (me.ladder || Developer.addLadderRW) ? [sdk.items.runes.Ohm, sdk.items.runes.Jah, sdk.items.runes.Lem, sdk.items.runes.Eld] : false;
Runeword.Fortitude = (me.ladder || Developer.addLadderRW) ? [sdk.items.runes.El, sdk.items.runes.Sol, sdk.items.runes.Dol, sdk.items.runes.Lo] : false;
Runeword.Grief = (me.ladder || Developer.addLadderRW) ? [sdk.items.runes.Eth, sdk.items.runes.Tir, sdk.items.runes.Lo, sdk.items.runes.Mal, sdk.items.runes.Ral] : false;
Runeword.Harmony = (me.ladder || Developer.addLadderRW) ? [sdk.items.runes.Tir, sdk.items.runes.Ith, sdk.items.runes.Sol, sdk.items.runes.Ko] : false;
Runeword.Ice = (me.ladder || Developer.addLadderRW) ? [sdk.items.runes.Amn, sdk.items.runes.Shael, sdk.items.runes.Jah, sdk.items.runes.Lo] : false;
Runeword.Infinity = (me.ladder || Developer.addLadderRW) ? [sdk.items.runes.Ber, sdk.items.runes.Mal, sdk.items.runes.Ber, sdk.items.runes.Ist] : false;
Runeword.Insight = (me.ladder || Developer.addLadderRW) ? [sdk.items.runes.Ral, sdk.items.runes.Tir, sdk.items.runes.Tal, sdk.items.runes.Sol] : false;
Runeword.LastWish = (me.ladder || Developer.addLadderRW) ? [sdk.items.runes.Jah, sdk.items.runes.Mal, sdk.items.runes.Jah, sdk.items.runes.Sur, sdk.items.runes.Jah, sdk.items.runes.Ber] : false;
Runeword.Lawbringer = (me.ladder || Developer.addLadderRW) ? [sdk.items.runes.Amn, sdk.items.runes.Lem, sdk.items.runes.Ko] : false;
Runeword.Oath = (me.ladder || Developer.addLadderRW) ? [sdk.items.runes.Shael, sdk.items.runes.Pul, sdk.items.runes.Mal, sdk.items.runes.Lum] : false;
Runeword.Obedience = (me.ladder || Developer.addLadderRW) ? [sdk.items.runes.Hel, sdk.items.runes.Ko, sdk.items.runes.Thul, sdk.items.runes.Eth, sdk.items.runes.Fal] : false;
Runeword.Phoenix = (me.ladder || Developer.addLadderRW) ? [sdk.items.runes.Vex, sdk.items.runes.Vex, sdk.items.runes.Lo, sdk.items.runes.Jah] : false;
Runeword.Pride = (me.ladder || Developer.addLadderRW) ? [sdk.items.runes.Cham, sdk.items.runes.Sur, sdk.items.runes.Io, sdk.items.runes.Lo] : false;
Runeword.Rift = (me.ladder || Developer.addLadderRW) ? [sdk.items.runes.Hel, sdk.items.runes.Ko, sdk.items.runes.Lem, sdk.items.runes.Gul] : false;
Runeword.Spirit = (me.ladder || Developer.addLadderRW) ? [sdk.items.runes.Tal, sdk.items.runes.Thul, sdk.items.runes.Ort, sdk.items.runes.Amn] : false;
Runeword.VoiceofReason = (me.ladder || Developer.addLadderRW) ? [sdk.items.runes.Lem, sdk.items.runes.Ko, sdk.items.runes.El, sdk.items.runes.Eld] : false;
Runeword.Wrath = (me.ladder || Developer.addLadderRW) ? [sdk.items.runes.Pul, sdk.items.runes.Lum, sdk.items.runes.Ber, sdk.items.runes.Mal] : false;
Runeword.PDiamondShield = [sdk.items.gems.Perfect.Diamond, sdk.items.gems.Perfect.Diamond, sdk.items.gems.Perfect.Diamond];

Runewords.getBase = function (runeword, base, ethFlag, reroll) {
	let item = typeof base === "object" ? base : me.getItem(base, 0);

	if (item) {
		do {
			if (item && item.quality < sdk.itemquality.Magic && item.sockets === runeword.length) {
				/* check if item has items socketed in it
					better check than getFlag(0x4000000) because randomly socketed items return false for it
				*/

				if ((!reroll && !item.getItem() && Town.betterBaseThanWearing(item, Developer.debugging.junkCheck)) ||
					(reroll && item.getItem() && !NTIP.CheckItem(item, this.pickitEntries) && !Item.autoEquipKeepCheckMerc(item) && !Item.autoEquipKeepCheck(item))) {
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
		if (this.needList.includes(classid)) {
			return true;
		}
	}

	return false;
};
