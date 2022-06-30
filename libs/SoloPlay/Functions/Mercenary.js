/**
*  @filename    Mercenary.js
*  @author      theBGuy
*  @credit      jaenster
*  @desc        Mercenary functionality and Hiring
*
*/

const Merc = {
	minCost: -1,

	// merc is null fix
	getMercFix: function () {
		if (!Config.UseMerc || me.classic) return null;

		let merc = me.getMerc();

		for (let i = 0; i < 3; i++) {
			if (merc) {
				if (merc.mode === 0 || merc.mode === 12) {
					return null;
				}

				break;
			}

			delay(50 + me.ping);
			merc = me.getMerc();
		}

		return merc;
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
		case typeOfMerc === 1 && (myData.merc.type === "Cold Arrow" || !Misc.checkQuest(2, 0)):
		case me.diff > mercDiff:
		case me.diff === mercDiff && !Pather.accessToAct(mercAct):
		case myData.merc.type === mercAuraWanted:
		case me.diff !== mercDiff && myData.merc.type === "Defiance":
		case (me.charlvl > Config.levelCap + 10 && Merc.checkMercSkill(myData.merc.type)):
		case me.gold < Math.round((((me.charlvl - 1) * (me.charlvl - 1)) / 2) * 7.5):
		case this.minCost > 0 && me.gold < this.minCost:
			return true;
		}
		
		// lets check what our current actually merc is
		let checkMyMerc = Misc.poll(() => me.getMerc(), 50, 500);
		let wantedSkill = (typeOfMerc === 1 ? 'Cold Arrow' : me.normal ? tmpAuraName : mercAuraWanted);
		if (checkMyMerc && Merc.checkMercSkill(wantedSkill, checkMyMerc)) {
			// we have our wanted merc, data file was probably erased so lets re-update it
			myData.merc.act = me.act;
			myData.merc.classid = checkMyMerc.classid;
			myData.merc.difficulty = me.diff;
			myData.merc.type = wantedSkill;
			CharData.updateData("merc", myData) && updateMyData();
			return true;
		} else if (!!checkMyMerc && checkMyMerc.classid === sdk.monsters.mercs.Guard && !checkMyMerc.getStat(sdk.stats.ModifierListSkill)) {
			// aura isn't active so we can't check it
			return true;
		}

		let MercLib_1 = require("../Modules/MercLib");
		try {
			Town.goToTown(typeOfMerc);
			myPrint("ÿc9Mercenaryÿc0 :: getting merc");
			Town.move(Town.tasks[me.act - 1].Merc);
			Town.sortInventory();
			Item.removeItemsMerc(); // strip temp merc gear
			delay(500 + me.ping);
			addEventListener('gamepacket', MercLib_1.mercPacket);
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
				console.log('ÿc9Mercenaryÿc0 :: Found a merc to hire ' + JSON.stringify(wantedMerc));
				wantedMerc === null || wantedMerc === void 0 ? void 0 : wantedMerc.hire();
				let newMerc = Misc.poll(function () {
					let merc = me.getMerc();
					if (!merc) return false;
					if (oldGid_1 && oldGid_1 === merc.gid) return false;
					return merc;
				});
				console.log('Hired a merc?');
				if (newMerc) {
					console.log('Yep');
					myData.merc.act = me.act;
					myData.merc.classid = newMerc.classid;
					myData.merc.difficulty = me.diff;
					myData.merc.type = wantedMerc.skills.find(sk => sk.name === wantedSkill).name;
					CharData.updateData("merc", myData) && updateMyData();
					console.log('ÿc9Mercenaryÿc0 :: ' + myData.merc.type + ' merc hired.');
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
			removeEventListener('gamepacket', MercLib_1.mercPacket);
		}

		Item.autoEquipMerc();
		Pickit.pickItems(); // safetycheck for merc items on ground
		Item.autoEquipMerc();

		return true;
	},
};

