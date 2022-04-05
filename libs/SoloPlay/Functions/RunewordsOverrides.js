/*
*	@filename	RunewordsOverrides.js
*	@author		theBGuy
*	@desc		Runewords.js patch for offline ladder runewords, and Runeword.js improvements for leveling
*	@credits	kolton, theBGuy (this was my idea)
*/

if (!isIncluded("common/Runewords.js")) { include("common/Runewords.js"); }

// Don't use ladder-only on NL
Runeword.Brand = (me.ladder || Developer.addLadderRW) ? [640, 637, 632, 634] : false; // Jah + Lo + Mal + Gul
Runeword.Death = (me.ladder || Developer.addLadderRW) ? [624, 610, 635, 618, 634] : false; // Hel + El + Vex + Ort + Gul
Runeword.Destruction = (me.ladder || Developer.addLadderRW) ? [635, 637, 639, 640, 627] : false; // Vex + Lo + Ber + Jah + Ko
Runeword.Dragon = (me.ladder || Developer.addLadderRW) ? [638, 637, 621] : false; // Sur + Lo + Sol
Runeword.Dream = (me.ladder || Developer.addLadderRW) ? [625, 640, 630] : false; // Io + Jah + Pul
Runeword.Edge = (me.ladder || Developer.addLadderRW) ? [612, 616, 620] : false; // Tir + Tal + Amn
Runeword.Faith = (me.ladder || Developer.addLadderRW) ? [636, 640, 629, 611] : false; // Ohm + Jah + Lem + Eld
Runeword.Fortitude = (me.ladder || Developer.addLadderRW) ? [610, 621, 623, 637] : false; // El + Sol + Dol + Lo
Runeword.Grief = (me.ladder || Developer.addLadderRW) ? [614, 612, 637, 632, 617] : false; // Eth + Tir + Lo + Mal + Ral
Runeword.Harmony = (me.ladder || Developer.addLadderRW) ? [612, 615, 621, 627] : false; // Tir + Ith + Sol + Ko
Runeword.Ice = (me.ladder || Developer.addLadderRW) ? [620, 622, 640, 637] : false; // Amn + Shael + Jah + Lo
Runeword.Infinity = (me.ladder || Developer.addLadderRW) ? [639, 632, 639, 633] : false; // Ber + Mal + Ber + Ist
Runeword.Insight = (me.ladder || Developer.addLadderRW) ? [617, 612, 616, 621] : false; // Ral + Tir + Tal + Sol
Runeword.LastWish = (me.ladder || Developer.addLadderRW) ? [640, 632, 640, 638, 640, 639] : false; // Jah + Mal + Jah + Sur + Jah + Ber
Runeword.Lawbringer = (me.ladder || Developer.addLadderRW) ? [620, 629, 627] : false; // Amn + Lem + Ko
Runeword.Oath = (me.ladder || Developer.addLadderRW) ? [622, 630, 632, 626] : false; // Shael + Pul + Mal + Lum
Runeword.Obedience = (me.ladder || Developer.addLadderRW) ? [624, 627, 619, 614, 628] : false; // Hel + Ko + Thul + Eth + Fal
Runeword.Phoenix = (me.ladder || Developer.addLadderRW) ? [635, 635, 637, 640] : false; // Vex + Vex + Lo + Jah
Runeword.Pride = (me.ladder || Developer.addLadderRW) ? [641, 638, 625, 637] : false; // Cham + Sur + Io + Lo
Runeword.Rift = (me.ladder || Developer.addLadderRW) ? [624, 627, 629, 634] : false; // Hel + Ko + Lem + Gul
Runeword.Spirit = (me.ladder || Developer.addLadderRW) ? [616, 619, 618, 620] : false; // Tal + Thul + Ort + Amn
Runeword.VoiceofReason = (me.ladder || Developer.addLadderRW) ? [629, 627, 610, 611] : false; // Lem + Ko + El + Eld
Runeword.Wrath = (me.ladder || Developer.addLadderRW) ? [630, 626, 639, 632] : false; // Pul + Lum + Ber + Mal

Runewords.getBase = function (runeword, base, ethFlag, reroll) {
	let item = typeof base === "object" ? base : me.getItem(base, 0);

	if (item) {
		do {
			if (item && item.quality < 4 && item.getStat(194) === runeword.length) {
				/* check if item has items socketed in it
					better check than getFlag(0x4000000) because randomly socketed items return false for it
				*/

				if ((!reroll && !item.getItem() && Town.betterBaseThanWearing(item, Developer.debugging.junkCheck)) ||
					(reroll && item.getItem() && !NTIP.CheckItem(item, this.pickitEntries) && !Item.autoEquipKeepCheckMerc(item) && !Item.autoEquipKeepCheck(item))) {
					if (!ethFlag || (ethFlag === 1 && item.getFlag(0x400000)) || (ethFlag === 2 && !item.getFlag(0x400000))) {
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
