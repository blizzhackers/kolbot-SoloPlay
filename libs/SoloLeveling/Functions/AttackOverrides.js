/*
*	@filename	AttackOverrides.js
*	@author		isid0re
*	@desc		Attack.js fixes to improve functionality
*/

if (!isIncluded("common/Attack.js")) {
	include("common/Attack.js");
}

Attack.killTarget = function (name) {
	var target,	attackCount = 0;

	for (let i = 0; !target && i < 5; i += 1) {
		target = getUnit(1, name);

		if (target) {
			break;
		}

		delay(200);
	}

	if (!target) {
		print("ÿc9SoloLevelingÿc0: Target not found. Performing Attack.Clear(25)");
		Attack.clear(25);
		Pickit.pickItems();

		return true;
	}

	if (target && !Attack.canAttack(target)) { // exit if target is immune
		print("ÿc9SoloLevelingÿc0: Attack failed. " + target.name + " is immune.");

		return true;
	}

	while (attackCount < Config.MaxAttackCount) {
		if (Misc.townCheck()) {
			for (let i = 0; !target && i < 5; i += 1) {
				target = getUnit(1, name);

				if (target) {
					break;
				}

				delay(200);
			}
		}

		if (!target || !copyUnit(target).x) { // Check if unit got invalidated, happens if necro raises a skeleton from the boss's corpse.
			target = getUnit(1, name);

			if (!target) {
				break;
			}
		}

		if (Config.Dodge && me.hp * 100 / me.hpmax <= Config.DodgeHP) {
			this.deploy(target, Config.DodgeRange, 5, 9);
		}

		if (attackCount > 0 && attackCount % 15 === 0 && Skill.getRange(Config.AttackSkill[1]) < 4) {
			Packet.flash(me.gid);
		}

		if (!ClassAttack.doAttack(target, attackCount % 15 === 0)) {
			Packet.flash(me.gid);
		}

		attackCount += 1;
		ClassAttack.afterAttack();

		if ( !target || !copyUnit(target).x || target.dead) {
			break;
		}
	}

	if ( !target || !copyUnit(target).x || target.dead) {
		Pickit.pickItems();
	}

	return true;
};

Attack.clearLocations = function (list) {
	for (let x = 0; x < list.length; x++) {
		Attack.clear(20);
		Pather.moveTo(list[x][0], list[x][1]);
		Attack.clear(20);
		Pickit.pickItems();
	}

	return true;
};

Attack.IsAuradin = false;

Attack.init = function () {
	if (Config.Wereform) {
		include("common/Attacks/wereform.js");
	} else if (Config.CustomClassAttack && FileTools.exists('libs/common/Attacks/'+Config.CustomClassAttack+'.js')) {
		print('Loading custom attack file');
		include('common/Attacks/'+Config.CustomClassAttack+'.js')
	} else {
		include("common/Attacks/" + this.classes[me.classid] + ".js");
	}

	if (Config.AttackSkill[1] < 0 || Config.AttackSkill[3] < 0) {
		showConsole();
		print("ÿc1Bad attack config. Don't expect your bot to attack.");
	}

	if (me.gametype === 1) {
		this.checkInfinity();
		this.getCharges();
		this.getPrimarySlot();
		this.checkIsAuradin();
	}
};

Attack.checkIsAuradin = function () {
	let i, item;

	// Check player Dragon or Dream
	item = me.getItem(-1, 1);

	if (item) {
		do {
			if (item.getPrefix(20533) || item.getPrefix(20535)) {
				this.IsAuradin = true;

				return true;
			}
		} while (item.getNext());
    }
    
    return false;
};
  
Attack.getSkillElement = function (skillId) {
	this.elements = ["physical", "fire", "lightning", "magic", "cold", "poison", "none"];

	switch (skillId) {
	case 74: // Corpse Explosion
	case 139: // Stun
	case 144: // Concentrate
	case 147: // Frenzy
	case 273: // Minge Blast
	case 500: // Summoner
		return "physical";
	case 101: // Holy Bolt
		return "holybolt"; // no need to use this.elements array because it returns before going over the array
	}

	var eType = getBaseStat("skills", skillId, "etype");

	if (typeof (eType) === "number") {
		return this.elements[eType];

	}

	return false;
};

Attack.checkResist = function (unit, val, maxres) {
	// Ignore player resistances
	if (unit.type === 0) {
		return true;
	}

	var damageType = typeof val === "number" ? this.getSkillElement(val) : val;

	if (maxres === undefined) {
		maxres = 100;
	}

	// Static handler
	if (val === 42 && this.getResist(unit, damageType) < 100) {
		return (unit.hp * 100 / 128) > Config.CastStatic;
	}

	if (this.infinity && ["fire", "lightning", "cold"].indexOf(damageType) > -1 && unit.getState) { // baal in throne room doesn't have getState
		if (!unit.getState(28)) {
			return this.getResist(unit, damageType) < 117;
		}

		return this.getResist(unit, damageType) < maxres;
	}

	if (this.IsAuradin && ["physical"].indexOf(damageType) > -1 && unit.getState) { // baal in throne room doesn't have getState
		return true;
	}

	return this.getResist(unit, damageType) < maxres;
};
