/*
*	@filename	baal.js
*	@author		theBGuy
*	@desc		clear throne and kill baal
*/

function baal () {
	Config.BossPriority = false;

	this.preattack = function () {// Start Baal
		var decoyTick = getTickCount();
    	var decoyDuration = (10 + me.getSkill(28, 1) * 5) * 1000;

		switch (me.classid) {
		case 0: // Amazon
			if(me.getSkill(28, 1)) {	
				let decoy = getUnit(1, 356);

				if(!decoy || (getTickCount() - decoyTick >= decoyDuration)){
					Skill.cast(28, 0, 15092, 5028);
				}
			}

			break;
		case 1: // Sorceress
			switch (Config.AttackSkill[3]) {
			case 49:
			case 53:
			case 56:
			case 59:
			case 64:
				if (me.getState(121)) {
					while (me.getState(121)) {
						delay(100 + me.ping);
					}
				} else {
					return Skill.cast(Config.AttackSkill[1], 0, 15094 + rand(-1, 1), 5028);
				}

				break;
			}

			break;
		case 3: // Paladin
			if (Config.AttackSkill[3] === 112) {
				if (Config.AttackSkill[4] > 0) {
					Skill.setSkill(Config.AttackSkill[4], 0);
				}

				return Skill.cast(Config.AttackSkill[3], 1);
			}

			break;
		case 5: // Druid
			if (Config.AttackSkill[3] === 245) {
				return Skill.cast(Config.AttackSkill[3], 0, 15094 + rand(-1, 1), 5028);
			}

			break;
		case 6: // Assassin
			if (Config.UseTraps) {
				let check = ClassAttack.checkTraps({x: 15094, y: 5028});

				if (check) {
					return ClassAttack.placeTraps({x: 15094, y: 5028}, 5);
				}
			}

			if (Config.AttackSkill[3] === 256) { // shock-web
				return Skill.cast(Config.AttackSkill[3], 0, 15094, 5028);
			}

			break;
		}

		return false;
	};

	this.checkThrone = function () {
		let monster = getUnit(1);

		if (monster) {
			do {
				if (Attack.checkMonster(monster) && monster.y < 5080) {
					switch (monster.classid) {
					case 23:
					case 62:
						return 1;
					case 105:
					case 381:
						return 2;
					case 557:
						return 3;
					case 558:
						return 4;
					case 571:
						return 5;
					default:
						Attack.getIntoPosition(monster, 10, 0x4);
						Attack.clear(15);

						return false;
					}
				}
			} while (monster.getNext());
		}

		return false;
	};

	this.clearThrone = function () {
		let monsterList = [];
		let position = [15094, 5022, 15094, 5041, 15094, 5060, 15094, 5041, 15094, 5022];

		if (Config.AvoidDolls) {
			let monster = getUnit(1, 691);

			if (monster) {
				do {
					if (monster.x >= 15072 && monster.x <= 15118 && monster.y >= 5002 && monster.y <= 5079 && Attack.checkMonster(monster) && Attack.skipCheck(monster)) {
						monsterList.push(copyUnit(monster));
					}
				} while (monster.getNext());
			}

			if (monsterList.length) {
				Attack.clearList(monsterList);
			}
		}

		if (me.barbarian) {
			Pather.moveTo(15093, 5066);
			this.tauntBaalsMinions();
		}

		for (let location = 0; location < position.length; location += 2) {
			Pather.moveTo(position[location], position[location + 1]);
			Attack.clear(25);
		}
	};

	this.checkHydra = function () {
		var hydra = getUnit(1, getLocaleString(3325));

		if (hydra) {
			do {
				if (hydra.mode !== 12 && hydra.getStat(172) !== 2) {
					Pather.moveTo(15072, 5002);

					while (hydra.mode !== 12) {
						delay(500 + me.ping);

						if (!copyUnit(hydra).x) {
							break;
						}
					}

					break;
				}
			} while (hydra.getNext());
		}

		return true;
	};

	this.tauntBaalsMinions = function () {
		if (!me.getSkill(137, 0) || me.area !== 131) {
			return;
		}

		let mobTypes = [641, 23, 62, 105, 381, 557, 558];
		let retry = 0;

		Pather.moveTo(15093, 5065);

		let list = Attack.buildMonsterList();
		let checkList = list.filter(mob => mob.y < 5080);
		//print("checkList length: " + checkList.length);

		if (!checkList.length || checkList.length === 0) {
			Attack.clear(5);
			delay(1000 + me.ping);
			return;
		}

		list.sort(Sort.units);
		let newList = list.filter(mob => mobTypes.indexOf(mob.classid) > -1 && [0, 8].indexOf(mob.spectype) > -1 && mob.y < 5080);

		//print("List length after sorting: " + newList.length);

		for (let i = 0; i < newList.length; i++) {
			if (!newList[i].getState(27) && !newList[i].getState(56) && !newList[i].getState(21) && Skill.getManaCost(137) < me.mp && !checkCollision(me, newList[i], 0x4)) {
				print("Casting on: " + newList[i].name);
				Skill.cast(137, Skill.getHand(137), newList[i]);
			}

			if (newList[i].getState(27)) {
				print("Casting worked, Now waiting for mob to reach me");
				let tick = getTickCount();

				while (Math.round(getDistance(me, newList[i])) > 3) {
					Attack.clear(6);

					if ((getTickCount() - tick) > 6000) {
						break;
					}

					delay(50 + me.ping);
				}
				
				Attack.clear(5);
				Pather.moveTo(15093, 5065);
			} else {
				retry++;
				delay(100 + me.ping);

				if (retry > 3) {
					retry = 0;
					continue;
				}

				i--;
			}
		}

		if (checkList.length > 0) {
			Pather.moveTo(15094, 5038);
			Attack.clear(30);
		}

		Pather.moveTo(15093, 5065);
	};

	this.lureLister = function () {
		while (Attack.getMonsterCount(me.x, 5070, 20) > 1) {
			Pather.moveTo(15092, 5054);
			Pather.moveTo(15092, 5073);
			Attack.clear(5);
			delay(50 + me.ping);
		}
	};

	Town.townTasks();
	print('ÿc9SoloLevelingÿc0: starting baal');
	me.overhead("baal");

	if (!Pather.checkWP(129)) {
		Pather.getWP(129, true);
	} else {
		Pather.useWaypoint(129);
	}

	Precast.doPrecast(true);
	Pather.clearToExit(129, 130, true); 	//WS2 -> WS3
	Pather.clearToExit(130, 131, true); 	//WS3 -> Throne
	Pather.moveTo(15095, 5029);

	if (me.hell && getUnit(1, 691)) {
		print("ÿc9SoloLevelingÿc0: Dolls found! NG.");
		me.overhead("Dolls found! NG.");

		return true;
	}

	if (me.hell && getUnit(1, 641) && !me.barbarian || (me.amazon && !Attack.checkInfinity())) {
		print("ÿc9SoloLevelingÿc0: Souls found! NG.");
		me.overhead("Souls found! NG.");

		return true;
	}

	if (me.amazon && getUnit(1, 641) && !Attack.checkInfinity()) {
		print("ÿc9SoloLevelingÿc0: Souls found! NG.");
		me.overhead("Souls found! NG.");

		return true;
	}

	this.clearThrone();
	let tick = getTickCount();

	if (!me.barbarian) {
		Pather.moveTo(15094, me.classid === 3 ? 5029 : 5038);
	}

	MainLoop:
	while (true) {
		if (!me.barbarian) {
			if (getDistance(me, 15094, me.classid === 3 ? 5029 : 5038) > 3) {
				Pather.moveTo(15094, me.classid === 3 ? 5029 : 5038);
			}
		}

		if (!getUnit(1, 543)) {
			break MainLoop;
		}

		if (me.barbarian && this.checkThrone() !== 5) {
			this.tauntBaalsMinions();
		} else {
			switch (this.checkThrone()) {
			case 1:
				Attack.clear(40);

				tick = getTickCount();

				Precast.doPrecast(true);

				break;
			case 2:
				Attack.clear(40);

				tick = getTickCount();

				break;
			case 4:
				Attack.clear(40);

				tick = getTickCount();

				break;
			case 3:
				Attack.clear(40);
				this.checkHydra();

				tick = getTickCount();

				break;
			case 5:
				if (me.barbarian) {
					this.lureLister();
				}

				Attack.clear(40);

				break MainLoop;
			default:
				if (getTickCount() - tick < 7e3) {
					if (me.getState(2)) {
						Skill.setSkill(109, 0);
					}

					break;
				}

				if (!this.preattack()) {
					delay(100 + me.ping);
				}

				break;
			}
		}

		delay(10 + me.ping);
	}

	Pather.moveTo(15094, me.classid === 3 ? 5029 : 5038);
	Pickit.pickItems();

	Pather.moveTo(15090, 5008);
	delay(5000 + me.ping);
	Precast.doPrecast(true);

	while (getUnit(1, 543)) {
		delay(500 + me.ping);
	}

	if (SetUp.finalBuild === "Bumper") {
		return true;
	}

	let portal = getUnit(2, 563);

	if (portal) {
		Pather.usePortal(null, null, portal);
	} else {
		print("ÿc9SoloLevelingÿc0: Couldn't access portal.");
	}

	Config.BossPriority = true;
	Pather.moveTo(15134, 5923);
	Attack.killTarget(544); // Baal	
	Pickit.pickItems();

	return true;
}
