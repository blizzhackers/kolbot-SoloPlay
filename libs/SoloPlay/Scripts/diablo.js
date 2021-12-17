/*
*	@filename	Diablo.js
*	@author		isid0re, theBGuy
*	@desc		customized Diablo script
*/

function diablo () {
	// Start Diablo Quest
	this.getLayout = function (seal, value) {
		let sealPreset = getPresetUnit(sdk.areas.ChaosSanctuary, sdk.unittype.Object, seal);

		if (!seal) {
			print("ÿc8Kolbot-SoloPlayÿc0: Seal preset not found");
		}

		if (sealPreset.roomy * 5 + sealPreset.y === value || sealPreset.roomx * 5 + sealPreset.x === value) {
			return 1;
		}

		return 2;
	};

	this.initLayout = function () {
		this.vizLayout = this.getLayout(396, 5275);
		this.seisLayout = this.getLayout(394, 7773);
		this.infLayout = this.getLayout(392, 7893);
	};

	this.getBoss = function (name) {
		let glow = getUnit(sdk.unittype.Object, 131);

		for (let bossbeating = 0; bossbeating < 24; bossbeating += 1) {
			let boss = getUnit(sdk.unittype.Monster, name);

			if (boss) {
				this.chaosPreattack(name, 8);

				try {
					if (boss && boss.hp > 0) {
						Attack.killTarget(name);
					}
				} catch (e) {
					Attack.clear(10, 0, name);
				}

				Pickit.pickItems();

				return true;
			}

			delay(250 + me.ping);
		}

		return !!glow;
	};

	this.chaosPreattack = function (name, amount) {
		let target, position;

		switch (me.classid) {
		case 0:
			break;
		case 1:
			break;
		case 2:
			break;
		case 3:
			target = getUnit(1, name);

			if (!target) {
				return;
			}

			position = [[6, 11], [0, 8], [8, -1], [-9, 2], [0, -11], [8, -8]];

			for (let attackspot = 0; attackspot < position.length; attackspot += 1) {
				// check if we can move there
				if (Attack.validSpot(target.x + position[attackspot][0], target.y + position[attackspot][1])) {
					Pather.moveTo(target.x + position[attackspot][0], target.y + position[attackspot][1]);
					Skill.setSkill(Config.AttackSkill[2], 0);

					for (let n = 0; n < amount; n += 1) {
						Skill.cast(Config.AttackSkill[1], 1);
					}

					break;
				}
			}

			break;
		case 4:
			break;
		case 5:
			break;
		case 6:
			break;
		}
	};

	this.diabloPrep = function () {
		let tick = getTickCount(), decoyDuration = (10 + me.getSkill(sdk.skills.Decoy, 1) * 5) * 1000;

		while (getTickCount() - tick < 17500) {
			if (Attack.getMobCount(me.x, me.y, 20) > 1) { Attack.clear(20); }
			if (getTickCount() - tick >= 8000) {
				switch (me.classid) {
				case sdk.charclass.Amazon:
					if (me.getSkill(sdk.skills.Decoy, 1)) {
						let decoy = getUnit(sdk.unittype.Monster, 356);

						if (!decoy || (getTickCount() - tick >= decoyDuration)) {
							Skill.cast(sdk.skills.Decoy, 0, 7793, 5293);
						}
					}

					break;
				case sdk.charclass.Sorceress:
					if ([56, 59, 64].indexOf(Config.AttackSkill[1]) > -1) {
						if (me.getState(121)) {
							delay(500 + me.ping);
						} else {
							Skill.cast(Config.AttackSkill[1], 0, 7793, 5293);
						}

						break;
					}

					delay(500 + me.ping);

					break;
				case sdk.charclass.Paladin:
					Skill.setSkill(Config.AttackSkill[2]);
					Skill.cast(Config.AttackSkill[1], 1);

					break;
				case sdk.charclass.Druid:
					if (Config.AttackSkill[1] === sdk.skills.Tornado) {
						Skill.cast(Config.AttackSkill[1], 0, 7793, 5293);

						break;
					}

					delay(500 + me.ping);

					break;
				case sdk.charclass.Assassin:
					if (Config.UseTraps) {
						let check = ClassAttack.checkTraps({x: 7793, y: 5293});

						if (check) {
							ClassAttack.placeTraps({x: 7793, y: 5293, classid: 243}, check);

							break;
						}
					}

					delay(500 + me.ping);

					break;
				default:
					delay(500 + me.ping);
				}
			} else {
				delay(500 + me.ping);
			}

			if (getUnit(sdk.unittype.Monster, sdk.monsters.Diablo)) {
				return true;
			}
		}

		return false;
	};

	this.tkSeal = function (unit) {
		if (!me.getSkill(43, 1) || !unit || unit === undefined) {
			return false;
		}

		for (let i = 0; i < 3; i++) {
			if (getDistance(me, unit) > 13) {
				Attack.getIntoPosition(unit, 13, 0x4);
			}

			Skill.cast(43, 0, unit);

			if (unit.mode) {
				return true;
			}
		}

		if (!unit.mode) {
			Pather.moveTo(unit);
			unit.interact();
		}

		return unit.mode;
	};

	this.openSeal = function (classid) {
		for (let sealspot = 0; sealspot < 5; sealspot += 1) {
			Pather.moveToPreset(sdk.areas.ChaosSanctuary, sdk.unittype.Object, classid, classid === 394 ? 5 : 2, classid === 394 ? 5 : 0);
			let seal = Misc.poll(function () { return getUnit(sdk.unittype.Object, classid); });

			// Clear around Infector seal, Any leftover abyss knights casting decrep is bad news with Infector
			if ([392, 393].indexOf(classid) > -1) {
				Attack.clear(25);
				// Move back to seal
				Pather.moveToPreset(sdk.areas.ChaosSanctuary, sdk.unittype.Object, classid, classid === 394 ? 5 : 2, classid === 394 ? 5 : 0);
			}

			if (!seal) {
				print("ÿc8Kolbot-SoloPlayÿc0: Seal not found. Attempting portal trick");
				Town.goToTown();
				delay(25);
				Pather.usePortal(null, me.name);

				for (let a = 0; a < 3; a += 1) {
					seal = getUnit(sdk.unittype.Object, classid);
					if (seal) { break; }
					Packet.flash(me.gid);
					delay(100 + me.ping);
				}

				if (seal === undefined || !seal) {
					print("ÿc8Kolbot-SoloPlayÿc0: Seal not found (id " + classid + ")");
					D2Bot.printToConsole("Kolbot-SoloPlay: Seal not found (id " + classid + ")", 8);
					return false;
				}
			}

			if (seal.mode) {
				return true;
			}

			if (me.sorceress) {
				this.tkSeal(seal);
			} else {
				if (classid === 392 && me.assassin && this.infLayout === 1) {
					if (Config.UseTraps) {
						let check = ClassAttack.checkTraps({x: 7899, y: 5293});

						if (check) {
							ClassAttack.placeTraps({x: 7899, y: 5293}, check);
						}
					}
				}

				if (classid === 394) {
					Misc.click(0, 0, seal);
				} else {
					seal.interact();
				}
			}

			delay(classid === 394 ? 1000 + me.ping : 500 + me.ping);

			if (!seal.mode) {
				// de seis optimization
				if (classid === 394 && Attack.validSpot(seal.x + 15, seal.y)) {
					Pather.moveTo(seal.x + 15, seal.y);
				} else {
					Pather.moveTo(seal.x - 5, seal.y - 5);
				}

				delay(500 + me.ping);
			} else {
				return true;
			}
		}

		print("ÿc8Kolbot-SoloPlayÿc0: Failed to open seal (id " + classid + ")");

		return false;
	};

	this.vizier = function () {
		this.openSeal(395);
		this.openSeal(396);

		if (this.vizLayout === 1) {
			delay(1 + me.ping);
			Pather.moveTo(7691, 5292, 3, 30);
		} else {
			delay(1 + me.ping);
			Pather.moveTo(7695, 5316, 3, 30);
		}

		if (!this.getBoss(getLocaleString(2851))) {
			print("ÿc8Kolbot-SoloPlayÿc0: Failed Vizier");
		}
	};

	this.seis = function () {
		this.openSeal(394);

		if (this.seisLayout === 1) {
			// safe location
			Pather.moveTo(7798, 5194, 3, 30);
		} else {
			// safe location
			Pather.moveTo(7796, 5155, 3, 30);
		}

		if (!this.getBoss(getLocaleString(2852))) {
			print("ÿc8Kolbot-SoloPlayÿc0: Failed Seis");
		}
	};

	this.infector = function () {
		this.openSeal(393);
		this.openSeal(392);

		if (this.infLayout === 1) {
			if (me.sorceress || me.assassin) {
				Pather.moveTo(7876, 5296);
			}

			delay(1 + me.ping);
		} else {
			delay(1 + me.ping);
			Pather.moveTo(7928, 5295, 3, 30); // temp
		}

		if (!this.getBoss(getLocaleString(2853))) {
			print("ÿc8Kolbot-SoloPlayÿc0: Failed Infector");
		}
	};

	Town.townTasks();
	print('ÿc8Kolbot-SoloPlayÿc0: starting diablo');
	me.overhead("diablo");

	if (!Pather.checkWP(sdk.areas.RiverofFlame)) {
		Pather.getWP(sdk.areas.RiverofFlame);
	} else {
		Pather.useWaypoint(sdk.areas.RiverofFlame);
	}

	Precast.doPrecast(true);
	Pather.clearToExit(sdk.areas.RiverofFlame, sdk.areas.ChaosSanctuary, true);

	if (me.coldRes < 75 || me.poisonRes < 75) {
		Town.doChores();
		Town.buyPots(10, "Thawing");
		Town.drinkPots();
		Town.buyPots(10, "Antidote");
		Town.drinkPots();
		Town.move("portalspot");
		Pather.usePortal(108, me.name);
	}

	this.initLayout();

	if (!me.diablo && me.barbarian) {
		Config.BossPriority = true;
		//Config.MercWatch = me.normal ? false : true;
	}

	this.vizier();
	this.seis();
	this.infector();

	if (!me.diablo && (me.paladin || me.barbarian || me.druid || me.amazon)) {
		Town.goToTown();
		Misc.getGoodShrine([2, 3]);
		Pather.useWaypoint(sdk.areas.RiverofFlame);
		Precast.doPrecast(true);
		Pather.clearToExit(sdk.areas.RiverofFlame, sdk.areas.ChaosSanctuary, true);
	}

	Config.MercWatch = false;
	let nearSpot;

	if (!me.sorceress && !me.necromancer && !me.assassin) {
		Pather.moveTo(7788, 5292, 3, 30);
	} else {
		nearSpot = Attack.spotOnDistance({ x: 7792, y: 5292 }, 35);
		Pather.moveToUnit(nearSpot);
	}

	this.diabloPrep();
	let theD = getUnit(sdk.unittype.Monster, sdk.monsters.Diablo);

	if (!theD) {
		print("ÿc8Kolbot-SoloPlayÿc0: Diablo not found. Checking seal bosses.");
		this.infector();
		this.seis();
		this.vizier();

		if (!me.sorceress && !me.necromancer && !me.assassin) {
			Pather.moveTo(7788, 5292, 3, 30);
		} else {
			nearSpot = Attack.spotOnDistance({ x: 7792, y: 5292 }, 35);
			Pather.moveToUnit(nearSpot);
		}

		this.diabloPrep();
	}

	if (!Attack.pwnDia()) {
		Attack.killTarget(sdk.monsters.Diablo);
	}

	Pickit.pickItems();

	if (me.classic) {
		return true;
	}

	try {
		Pather.changeAct();
	} catch (err) {
		Town.npcInteract("tyrael");
		me.cancel();
		delay(500 + me.ping);
		Pather.useUnit(sdk.unittype.Object, 566, 109);
	}

	Config.MercWatch = true;

	return true;
}
