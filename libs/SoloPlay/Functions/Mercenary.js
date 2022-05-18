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

	// only supports act 2 mercs for now
	hireMerc: function () {
		if (me.classic) return true;
		let {mercAct, mercAuraWanted, mercDiff} = Check.finalBuild();
		let typeOfMerc = (!Pather.accessToAct(2) && me.normal ? 1 : mercAct);
		let _a;
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
		case me.charlvl > Config.levelCap + 10:
		case me.gold < Math.round((((me.charlvl - 1) * (me.charlvl - 1)) / 2) * 7.5):
		case this.minCost > 0 && me.gold < this.minCost:
			return true;
		}

		let MercLib_1 = require("../Modules/MercLib");
		let wantedSkill = (typeOfMerc === 1 ? 'Cold Arrow' : me.normal ? tmpAuraName : mercAuraWanted);
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
				.sort(function (_a, _b) {
					let a = _a.level;
					let b = _b.level;
					return b - a;
				}).first();
			if (wantedMerc) {
				if (wantedMerc.cost > me.gold) {
					this.minCost = wantedMerc.cost;
					throw new Error();
				}
				let oldGid_1 = (_a = me.getMerc()) === null || _a === void 0 ? void 0 : _a.gid;
				console.log('ÿc9ÿc9Mercenaryÿc0 :: Found a merc to hire ' + JSON.stringify(wantedMerc));
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
					console.log('ÿc9ÿc9Mercenaryÿc0 :: ' + myData.merc.type + ' merc hired.');
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

