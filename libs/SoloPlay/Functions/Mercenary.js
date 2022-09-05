/**
*  @filename    Mercenary.js
*  @author      theBGuy
*  @credit      jaenster
*  @desc        Mercenary functionality and Hiring
*
*/

const Mercenary = {
	minCost: -1,

	// only a2 mercs for now, need to test others to see if ModifierListSkill returns their skill
	getMercSkill: function (merc = undefined) {
		!merc && (merc = Misc.poll(() => me.getMerc(), 1000, 50));
		if (!merc) return false;
		let mercSkill = (() => {
			switch (merc.classid) {
			case sdk.mercs.Rogue:
				return [sdk.skills.FireArrow, sdk.skills.ColdArrow].find(s => merc.getSkill(s, sdk.skills.subindex.HardPoints));
			case sdk.mercs.Guard:
				let checkStat = merc.getStat(sdk.stats.ModifierListSkill);
				// if ([sdk.skills.Meditation, sdk.skills.Conviction, sdk.skills.Concentration, sdk.skills.HolyFire].includes(checkStat)) {
				// 	return [sdk.skills.Prayer, sdk.skills.BlessedAim, sdk.skills.Defiance].find(s => merc.getSkill(s, sdk.skills.subindex.HardPoints));
				// }
				if (![sdk.skills.Prayer, sdk.skills.BlessedAim, sdk.skills.Defiance, sdk.skills.HolyFreeze, sdk.skills.Might, sdk.skills.Thorns].includes(checkStat)) {
					// check items for aura granting one then subtract it's skillId
					merc.getItemsEx().forEach(item => {
						if (!item.unique && !item.runeword) return false;
						switch (true) {
						case (item.getStat(sdk.stats.SkillOnAura, sdk.skills.Meditation)):
							return (checkStat -= sdk.skills.Meditation);
						case (item.getStat(sdk.stats.SkillOnAura, sdk.skills.Conviction)):
							return (checkStat -= sdk.skills.Conviction);
						case (item.getStat(sdk.stats.SkillOnAura, sdk.skills.Concentration)):
							return (checkStat -= sdk.skills.Concentration);
						case (item.getStat(sdk.stats.SkillOnAura, sdk.skills.HolyFreeze)):
							return (checkStat -= sdk.skills.HolyFreeze);
						case (item.getStat(sdk.stats.SkillOnAura, sdk.skills.HolyFire)):
							return (checkStat -= sdk.skills.HolyFire);
						case (item.getStat(sdk.stats.SkillOnAura, sdk.skills.HolyShock)):
							return (checkStat -= sdk.skills.HolyShock);
						}
						return true;
					});
				}
				return checkStat >= sdk.skills.Might ? checkStat : 0;
			case sdk.mercs.IronWolf:
				return [sdk.skills.IceBlast, sdk.skills.FireBall, sdk.skills.Lightning].find(s => merc.getSkill(s, sdk.skills.subindex.HardPoints));
			case sdk.mercs.A5Barb:
				return sdk.skills.Bash;
			default:
				return 0;
			}
		})();

		return mercSkill ? getSkillById(mercSkill) : "";
	},

	// only a2 mercs for now
	getMercDifficulty: function (merc = undefined) {
		!merc && (merc = Misc.poll(() => me.getMerc(), 1000, 50));
		if (!merc) return false;
		let mercSkill = merc.getStat(sdk.stats.ModifierListSkill);

		switch (mercSkill) {
		case sdk.skills.Thorns:
		case sdk.skills.HolyFreeze:
		case sdk.skills.Might:
			return sdk.difficulty.Nightmare;
		default:
			return sdk.difficulty.Normal;
		}
	},

	getMercAct: function (merc) {
		!merc && (merc = Misc.poll(() => me.getMerc(), 1000, 50));
		if (!merc) return 0;
		switch (merc.classid) {
		case sdk.mercs.Rogue:
			return 1;
		case sdk.mercs.Guard:
			return 2;
		case sdk.mercs.IronWolf:
			return 3;
		case sdk.mercs.A5Barb:
			return 5;
		default:
			return 0;
		}
	},

	getMercInfo: function (merc) {
		!merc && (merc = Misc.poll(() => me.getMerc(), 1000, 50));
		if (!merc) return { classid: 0, act: 0, difficulty: 0, type: "" };
		return {
			classid: merc.classid,
			act: this.getMercAct(merc),
			difficulty: this.getMercDifficulty(merc),
			type: this.getMercSkill(merc)
		};
	},

	checkMercSkill: function (wanted = "", merc = undefined) {
		merc = !!merc ? merc : me.getMerc();
		if (!merc) return false;
		let mercSkill = merc.getStat(sdk.stats.ModifierListSkill);

		// only a2 mercs for now, need to test others to see if above returns their skill
		switch (wanted.toLowerCase()) {
		case "defiance":
			return mercSkill === sdk.skills.Defiance;
		case "prayer":
			return mercSkill === sdk.skills.Prayer;
		case "blessed aim":
			return mercSkill === sdk.skills.BlessedAim;
		case "thorns":
			return mercSkill === sdk.skills.Thorns;
		case "holy freeze":
			return mercSkill === sdk.skills.HolyFreeze;
		case "might":
			return mercSkill === sdk.skills.Might;
		case "cold arrow":
			return merc.getSkill(sdk.skills.ColdArrow, sdk.skills.subindex.HardPoints);
		case "fire arrow":
			return merc.getSkill(sdk.skills.FireArrow, sdk.skills.subindex.HardPoints);
		case "fire ball":
			return merc.getSkill(sdk.skills.FireBall, sdk.skills.subindex.HardPoints);
		case "lightning":
			return merc.getSkill(sdk.skills.Lightning, sdk.skills.subindex.HardPoints);
		case "glacial spike":
			return merc.getSkill(sdk.skills.GlacialSpike, sdk.skills.subindex.HardPoints);
		case "bash":
			return merc.getSkill(sdk.skills.Bash, sdk.skills.subindex.HardPoints);
		default:
			return false;
		}
	},

	// only supports act 2 mercs for now
	hireMerc: function () {
		if (me.classic) return true;
		let _a;
		let {mercAct, mercAuraWanted, mercDiff} = Check.finalBuild();
		let typeOfMerc = (!Pather.accessToAct(2) && me.normal ? 1 : mercAct);
		let tmpAuraName = "Defiance";

		// don't hire if using correct a1 merc, or passed merc hire difficulty
		// we've already gotten the correct a1 merc or haven't yet completed Bloodraven
		// we are not in the correct difficulty to hire our wanted merc
		// we don't have access to the act of our wanted merc
		// we've already hired our wanted merc
		// we aren't in our wanted mercs difficulty but we have already hired the correct temp a2 merc
		// we've gone back a difficulty - (with using the data file it shouldn't get here but still handle it just in case)
		// we don't have enough spare gold to buy a1 merc
		// we don't have enough gold to hire our wanted merc
		switch (true) {
		case typeOfMerc === 1 && (myData.merc.type === "Cold Arrow" || !Misc.checkQuest(sdk.quest.id.SistersBurialGrounds, sdk.quest.states.Completed)):
		case me.diff > mercDiff:
		case me.diff === mercDiff && !Pather.accessToAct(mercAct):
		case myData.merc.type === mercAuraWanted:
		case me.diff !== mercDiff && myData.merc.type === "Defiance":
		case (me.charlvl > CharInfo.levelCap + 10 && Mercenary.checkMercSkill(myData.merc.type)):
		case me.gold < Math.round((((me.charlvl - 1) * (me.charlvl - 1)) / 2) * 7.5):
		case this.minCost > 0 && me.gold < this.minCost:
			return true;
		}
		
		// lets check what our current actually merc is
		let checkMyMerc = Misc.poll(() => me.getMerc(), 50, 500);
		let wantedSkill = (typeOfMerc === 1 ? "Cold Arrow" : me.normal ? tmpAuraName : mercAuraWanted);

		if (checkMyMerc && Mercenary.checkMercSkill(wantedSkill, checkMyMerc)) {
			// we have our wanted merc, data file was probably erased so lets re-update it
			myData.merc.act = Mercenary.getMercAct(checkMyMerc);
			myData.merc.classid = checkMyMerc.classid;
			myData.merc.difficulty = Mercenary.getMercDifficulty(checkMyMerc);
			myData.merc.type = wantedSkill;
			CharData.updateData("merc", myData) && updateMyData();
			return true;
		} else if (!!checkMyMerc && checkMyMerc.classid === sdk.mercs.Guard) {
			let checkSkill = checkMyMerc.getStat(sdk.stats.ModifierListSkill);
			// aura isn't active so we can't check it
			if (!checkSkill) return true;
			// or we might have multiple aura's going
			if ([sdk.skills.Meditation, sdk.skills.Conviction, sdk.skills.Concentration].includes(checkSkill)) return true;
			if (checkSkill > 123) return true;
		}

		let MercLib_1 = require("../Modules/MercLib");
		try {
			Town.goToTown(typeOfMerc);
			myPrint("ÿc9Mercenaryÿc0 :: getting merc");
			Town.move(Town.tasks[me.act - 1].Merc);
			Town.sortInventory();
			Item.removeItemsMerc(); // strip temp merc gear
			delay(500 + me.ping);
			addEventListener("gamepacket", MercLib_1.mercPacket);
			Town.initNPC("Merc", "getMerc");
			let wantedMerc = MercLib_1.default
				.filter((merc) => merc.skills.some((skill) => (skill === null || skill === void 0 ? void 0 : skill.name) === wantedSkill))
				.sort((a, b) => b.level - a.level)
				.first();
			if (wantedMerc) {
				if (wantedMerc.cost > me.gold) {
					this.minCost = wantedMerc.cost;
					throw new Error();
				}
				let oldGid_1 = (_a = me.getMerc()) === null || _a === void 0 ? void 0 : _a.gid;
				console.log("ÿc9Mercenaryÿc0 :: Found a merc to hire " + JSON.stringify(wantedMerc));
				wantedMerc === null || wantedMerc === void 0 ? void 0 : wantedMerc.hire();
				let newMerc = Misc.poll(function () {
					let merc = me.getMerc();
					if (!merc) return false;
					if (oldGid_1 && oldGid_1 === merc.gid) return false;
					return merc;
				});
				console.log("Hired a merc?");
				if (newMerc) {
					console.log("Yep");
					myData.merc.act = me.act;
					myData.merc.classid = newMerc.classid;
					myData.merc.difficulty = me.diff;
					myData.merc.type = wantedMerc.skills.find(sk => sk.name === wantedSkill).name;
					CharData.updateData("merc", myData) && updateMyData();
					console.log("ÿc9Mercenaryÿc0 :: " + myData.merc.type + " merc hired.");
				}
				me.cancelUIFlags();
				while (getInteractedNPC()) {
					delay(me.ping || 5);
					me.cancel();
				}
			}
		} catch (e) {
			//
		} finally {
			removeEventListener("gamepacket", MercLib_1.mercPacket);
		}

		Item.autoEquipMerc();
		Pickit.pickItems(); // safetycheck for merc items on ground
		Item.autoEquipMerc();

		return true;
	},
};

