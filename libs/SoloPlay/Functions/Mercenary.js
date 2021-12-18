/*
*	@filename	Mercenary.js
*	@author		isid0re, theBGuy
*	@desc		Mercenary functionality and Hiring
*/

let Merc = {
	Id: [],

	equipMerc: function () {
		if (!me.classic) {
			Item.autoEquipMerc();
		}

		return true;
	},

	// merc is null fix
	getMercFix: function () {
		if (!Config.UseMerc || me.classic) { return null; }

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

	// mercenary hire list info packets
	listPacket: function (bytes) {
		let id;

		switch (bytes[0]) {
		case 0x4e: // merc list packet
			id = (bytes[2] << 8) + bytes[1];

			if (Merc.Id.indexOf(id) !== -1) {
				Merc.Id.length = 0;
			}

			Merc.Id.push(id);
			break;
		default:
			break;
		}
	},

	hireMerc: function () {
		let mercAuraName = Check.finalBuild().mercAuraName;
		let mercAuraWanted = Check.finalBuild().mercAuraWanted;
		let mercDiff = Check.finalBuild().mercDiff;
		let tempMercAura = mercAuraWanted === 114 ? 99 : 104; // use defiance if mercAuraWanted is not gonna be holy freeze. Use prayer otherwise as holy freeze and defiance return as the same aura for some reason
		let mercAura = [[104, 99, 108], [103, 98, 114]];
		let mercenary;

		function getmercAura () {
			let merc = Merc.getMercFix();

			if (!merc) {
				return null;
			}

			for (let range = 0; range < mercAura.length; range++) {
				if (Array.isArray(mercAura[range])) {
					for (let selection = 0; selection < mercAura[range].length; selection++) {
						if (merc.getSkill(mercAura[range][selection], 1)) {
							return mercAura[range][selection];
						}
					}
				} else if (merc.getSkill(mercAura[range], 1)) {
					return mercAura[range];
				}
			}

			return true;
		}

		// don't hire if classic, no access to act 2, or passed merc hire difficulty
		if (me.classic || !Pather.accessToAct(2) || me.diff > mercDiff) {
			return true;
		}

		let mercSelected = getmercAura();

		if (mercSelected === mercAuraWanted || (me.diff !== mercDiff && mercSelected === tempMercAura)) {
			return true;
		}

		if (me.charlvl > SetUp.levelCap + 10) {
			print("ÿc9Mercenaryÿc0 :: I went back a difficulty, don't hire another merc");

			return true;
		}

		if (me.normal && me.gold < 10000 || !me.normal && me.gold < 100000) {
			print("ÿc9Mercenaryÿc0 :: I don't have enough gold to hire merc. My current gold amount: " + me.gold);

			return true;
		}

		addEventListener("gamepacket", Merc.listPacket);
		Pather.getWP(me.area);
		me.overhead('getting merc');
		print("ÿc9Mercenaryÿc0 :: getting merc");
		Town.cancelFlags.forEach(function(flag) { getUIFlag(flag) && delay(500) && me.cancel() && Misc.getUIFlags() > 1 && delay(500) && me.cancel() });	// cancel out any uiflags currently up
		Town.goToTown(2);
		Pather.moveTo(5041, 5055);
		Town.move(NPC.Greiz);

		// replace merc
		if ((mercSelected !== mercAuraWanted && me.diff === mercDiff) || (mercSelected !== tempMercAura && me.normal)) {
			me.overhead('replacing merc');
			print("ÿc9Mercenaryÿc0 :: replacing merc");
			Town.sortInventory();
			Item.removeItemsMerc(); // strip temp merc gear
			delay(500 + me.ping);
		}

		let greiz = getUnit(1, NPC.Greiz);

		if (greiz && greiz.openMenu()) {
			while (Merc.Id.length > 0) {
				Misc.useMenu(0x0D45);
				sendPacket(1, 0x36, 4, greiz.gid, 4, Merc.Id[0]);
				delay(500 + me.ping);
				mercenary = Merc.getMercFix();

				if (me.diff === mercDiff) {
					if (mercenary.getSkill(mercAuraWanted, 1)) {
						print('ÿc9ÿc9Mercenaryÿc0 :: ' + mercAuraName + ' merc hired.');

						break;
					}
				}

				if (me.diff !== mercDiff && me.normal) {
					if (mercenary.getSkill(tempMercAura, 1)) {
						if (tempMercAura === 99) {
							print('ÿc9ÿc9Mercenaryÿc0 :: prayer merc hired.');
						} else {
							print('ÿc9ÿc9Mercenaryÿc0 :: defiance merc hired.');
						}

						break;
					}
				}
				
				delay(500 + me.ping);
			}
		}

		mercenary = Merc.getMercFix();

		if (me.diff !== mercDiff && me.normal && mercenary && !mercenary.getSkill(tempMercAura, 1)) {
			print('ÿc9ÿc9Mercenaryÿc0 :: temp merc not available, will try again later');
		}

		if (me.diff === mercDiff && mercenary && !mercenary.getSkill(mercAuraWanted, 1)) {
			print('ÿc9ÿc9Mercenaryÿc0 :: ' + mercAuraName + ' merc not available, try again later.');
		}

		this.equipMerc();
		Pickit.pickItems(); // safetycheck for merc items on ground
		this.equipMerc();
		removeEventListener("gamepacket", Merc.listPacket);

		return true;
	},
};

