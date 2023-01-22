/**
*  @filename    RunewordsOverrides.js
*  @author      theBGuy
*  @desc        Runeword.js improvments and enable offline ladder runewords
*
*/

!includeIfNotIncluded("common/Runewords.js");

// Don't use ladder-only on NL
Runeword.Brand = (me.ladder || Developer.addLadderRW) ? [sdk.items.runes.Jah, sdk.items.runes.Lo, sdk.items.runes.Mal, sdk.items.runes.Gul] : false; // Jah + Lo + Mal + Gul
Runeword.Death = (me.ladder || Developer.addLadderRW) ? [sdk.items.runes.Hel, sdk.items.runes.El, sdk.items.runes.Vex, sdk.items.runes.Ort, sdk.items.runes.Gul] : false; // Hel + El + Vex + Ort + Gul
Runeword.Destruction = (me.ladder || Developer.addLadderRW) ? [sdk.items.runes.Vex, sdk.items.runes.Lo, sdk.items.runes.Ber, sdk.items.runes.Jah, sdk.items.runes.Ko] : false; // Vex + Lo + Ber + Jah + Ko
Runeword.Dragon = (me.ladder || Developer.addLadderRW) ? [sdk.items.runes.Sur, sdk.items.runes.Lo, sdk.items.runes.Sol] : false; // Sur + Lo + Sol
Runeword.Dream = (me.ladder || Developer.addLadderRW) ? [sdk.items.runes.Io, sdk.items.runes.Jah, sdk.items.runes.Pul] : false; // Io + Jah + Pul
Runeword.Edge = (me.ladder || Developer.addLadderRW) ? [sdk.items.runes.Tir, sdk.items.runes.Tal, sdk.items.runes.Amn] : false; // Tir + Tal + Amn
Runeword.Faith = (me.ladder || Developer.addLadderRW) ? [sdk.items.runes.Ohm, sdk.items.runes.Jah, sdk.items.runes.Lem, sdk.items.runes.Eld] : false; // Ohm + Jah + Lem + Eld
Runeword.Fortitude = (me.ladder || Developer.addLadderRW) ? [sdk.items.runes.El, sdk.items.runes.Sol, sdk.items.runes.Dol, sdk.items.runes.Lo] : false; // El + Sol + Dol + Lo
Runeword.Grief = (me.ladder || Developer.addLadderRW) ? [sdk.items.runes.Eth, sdk.items.runes.Tir, sdk.items.runes.Lo, sdk.items.runes.Mal, sdk.items.runes.Ral] : false; // Eth + Tir + Lo + Mal + Ral
Runeword.Harmony = (me.ladder || Developer.addLadderRW) ? [sdk.items.runes.Tir, sdk.items.runes.Ith, sdk.items.runes.Sol, sdk.items.runes.Ko] : false; // Tir + Ith + Sol + Ko
Runeword.Ice = (me.ladder || Developer.addLadderRW) ? [sdk.items.runes.Amn, sdk.items.runes.Shael, sdk.items.runes.Jah, sdk.items.runes.Lo] : false; // Amn + Shael + Jah + Lo
Runeword.Infinity = (me.ladder || Developer.addLadderRW) ? [sdk.items.runes.Ber, sdk.items.runes.Mal, sdk.items.runes.Ber, sdk.items.runes.Ist] : false; // Ber + Mal + Ber + Ist
Runeword.Insight = (me.ladder || Developer.addLadderRW) ? [sdk.items.runes.Ral, sdk.items.runes.Tir, sdk.items.runes.Tal, sdk.items.runes.Sol] : false; // Ral + Tir + Tal + Sol
Runeword.LastWish = (me.ladder || Developer.addLadderRW) ? [sdk.items.runes.Jah, sdk.items.runes.Mal, sdk.items.runes.Jah, sdk.items.runes.Sur, sdk.items.runes.Jah, sdk.items.runes.Ber] : false; // Jah + Mal + Jah + Sur + Jah + Ber
Runeword.Lawbringer = (me.ladder || Developer.addLadderRW) ? [sdk.items.runes.Amn, sdk.items.runes.Lem, sdk.items.runes.Ko] : false; // Amn + Lem + Ko
Runeword.Oath = (me.ladder || Developer.addLadderRW) ? [sdk.items.runes.Shael, sdk.items.runes.Pul, sdk.items.runes.Mal, sdk.items.runes.Lum] : false; // Shael + Pul + Mal + Lum
Runeword.Obedience = (me.ladder || Developer.addLadderRW) ? [sdk.items.runes.Hel, sdk.items.runes.Ko, sdk.items.runes.Thul, sdk.items.runes.Eth, sdk.items.runes.Fal] : false; // Hel + Ko + Thul + Eth + Fal
Runeword.Phoenix = (me.ladder || Developer.addLadderRW) ? [sdk.items.runes.Vex, sdk.items.runes.Vex, sdk.items.runes.Lo, sdk.items.runes.Jah] : false; // Vex + Vex + Lo + Jah
Runeword.Pride = (me.ladder || Developer.addLadderRW) ? [sdk.items.runes.Cham, sdk.items.runes.Sur, sdk.items.runes.Io, sdk.items.runes.Lo] : false; // Cham + Sur + Io + Lo
Runeword.Rift = (me.ladder || Developer.addLadderRW) ? [sdk.items.runes.Hel, sdk.items.runes.Ko, sdk.items.runes.Lem, sdk.items.runes.Gul] : false; // Hel + Ko + Lem + Gul
Runeword.Spirit = (me.ladder || Developer.addLadderRW) ? [sdk.items.runes.Tal, sdk.items.runes.Thul, sdk.items.runes.Ort, sdk.items.runes.Amn] : false; // Tal + Thul + Ort + Amn
Runeword.VoiceofReason = (me.ladder || Developer.addLadderRW) ? [sdk.items.runes.Lem, sdk.items.runes.Ko, sdk.items.runes.El, sdk.items.runes.Eld] : false; // Lem + Ko + El + Eld
Runeword.Wrath = (me.ladder || Developer.addLadderRW) ? [sdk.items.runes.Pul, sdk.items.runes.Lum, sdk.items.runes.Ber, sdk.items.runes.Mal] : false; // Pul + Lum + Ber + Mal
Runeword.PDiamondShield = [sdk.items.gems.Perfect.Diamond, sdk.items.gems.Perfect.Diamond, sdk.items.gems.Perfect.Diamond];

Runewords.getBase = function (runeword, base, ethFlag, reroll) {
	let item = typeof base === "object" ? base : me.getItem(base, sdk.items.mode.inStorage);

	if (item) {
		do {
			if (item && item.quality < sdk.items.quality.Magic && item.sockets === runeword.length) {
				/* check if item has items socketed in it
					better check than getFlag(sdk.items.flags.Runeword) because randomly socketed items return false for it
				*/

				if ((!reroll && !item.getItem() && Item.betterBaseThanWearing(item, Developer.debugging.baseCheck)) ||
					(reroll && item.getItem() && !NTIP.CheckItem(item, this.pickitEntries) && !Item.autoEquipCheckMerc(item, true) && !Item.autoEquipCheck(item, true))) {
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
