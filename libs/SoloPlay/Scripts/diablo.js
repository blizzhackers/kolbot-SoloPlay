/**
*  @filename    diablo.js
*  @author      theBGuy
*  @desc        Diablo
*
*/

// todo: clean this up, listen for lights game packet while opening/checking seals

function diablo () {
	// Start Diablo Quest
	this.diabloPrep = function () {
		let tick = getTickCount(), decoyDuration = (10 + me.getSkill(sdk.skills.Decoy, 1) * 5) * 1000;

		while (getTickCount() - tick < 17500) {
			me.getMobCount(20) > 1 && Attack.clear(20);
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
						if (me.skillDelay) {
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

	// START
	Town.townTasks();
	myPrint('starting diablo');

	Pather.checkWP(sdk.areas.RiverofFlame, true) ? Pather.useWaypoint(sdk.areas.RiverofFlame) : Pather.getWP(sdk.areas.RiverofFlame);
	Precast.doPrecast(true);
	Pather.clearToExit(sdk.areas.RiverofFlame, sdk.areas.ChaosSanctuary, true) && Pather.moveTo(7790, 5544);

	if (me.coldRes < 75 || me.poisonRes < 75) {
		Town.doChores(null, {thawing: me.coldRes < 75, antidote: me.poisonRes < 75});
		Town.move("portalspot");
		Pather.usePortal(sdk.areas.ChaosSanctuary, me.name);
	}

	Common.Diablo.initLayout();

	let oldCP = Object.assign({}, Config.ClearPath);
	let oldBP = Config.BossPriority;

	try {
		!me.diablo && me.barbarian && (Config.BossPriority = true);

		if (me.baal && me.normal && me.sorceress && me.charlvl > 28) {
			// try running fast diablo - may neeed work
			Config.Diablo.Fast = true;
			Config.ClearPath.Range = 15;
			Config.ClearPath.Spectype = 0xF; // skip normal mobs
			console.debug("CP Settings: ", Config.ClearPath);
		}

		Common.Diablo.vizierSeal();
		Common.Diablo.seisSeal();
		Common.Diablo.infectorSeal();
	} catch (e) {
		//
	} finally {
		oldCP.Range !== Config.ClearPath.Range && (Object.assign(Config.ClearPath, oldCP));
		oldBP !== Config.BossPriority && (Config.BossPriority = oldBP);
	}

	Config.MercWatch = false;

	try {
		if (!Pather.canTeleport() && (me.necromancer && ["Poison", "Summon"].includes(SetUp.currentBuild) || !me.sorceress)) {
			Messaging.sendToScript(SoloEvents.filePath, 'addDiaEvent');
		}

		if (!me.sorceress && !me.necromancer && !me.assassin) {
			Pather.moveTo(7788, 5292, 3, 30);
		} else {
			Pather.moveNear(7792, 5292, 35);
		}
		
		this.diabloPrep();
		let theD = getUnit(sdk.unittype.Monster, sdk.monsters.Diablo);

		if (!theD) {
			print("ÿc8Kolbot-SoloPlayÿc0: Diablo not found. Checking seal bosses.");
			try {
				Common.Diablo.vizierSeal();
				Common.Diablo.seisSeal();
				Common.Diablo.infectorSeal();
			} catch (e) {
				//
			}

			if (!me.sorceress && !me.necromancer && !me.assassin) {
				Pather.moveTo(7788, 5292, 3, 30);
			} else {
				Pather.moveNear(7792, 5292, 35);
			}

			this.diabloPrep();
		}

		if (!Attack.pwnDia()) {
			Attack.killTarget(sdk.monsters.Diablo);
		}

		Pickit.pickItems();
	} catch (e) {
		//
	} finally {
		Messaging.sendToScript(SoloEvents.filePath, 'removeDiaEvent');
	}

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
