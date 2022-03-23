/*
*	@filename	SkillOverrides.js
*	@author		theBGuy
*	@desc		Skill improvments for SoloPlay
*/

if (!isIncluded("common/Misc.js")) { include("common/Misc.js"); }
if (!isIncluded("SoloPlay/Tools/Developer.js")) { include("SoloPlay/Tools/Developer.js"); }

Skill.getHand = function (skillId) {
	switch (skillId) {
	case 6: // Magic Arrow
	case 7: // Fire Arrow
	case 9: // Critical Strike
	case 11: // Cold Arrow
	case 12: // Multiple Shot
	case 13: // Dodge
	case 15: // Poison Javelin
	case 16: // Exploding Arrow
	case 18: // Avoid
	case 19: // Impale
	case 20: // Lightning Bolt
	case 21: // Ice Arrow
	case 22: // Guided Arrow
	case 23: // Penetrate
	case 25: // Plague Javelin
	case 26: // Strafe
	case 27: // Immolation Arrow
	case 29: // Evade
	case 30: // Fend
	case 31: // Freezing Arrow
	case 33: // Pierce
	case 35: // Lightning Fury
	case 36: // Fire Bolt
	case 37: // Warmth
	case 38: // Charged Bolt
	case 39: // Ice Bolt
	case 41: // Inferno
	case 45: // Ice Blast
	case 47: // Fire Ball
	case 49: // Lightning
	case 53: // Chain Lightning
	case 55: // Glacial Spike
	case 61: // Fire Mastery
	case 63: // Lightning Mastery
	case 64: // Frozen Orb
	case 65: // Cold Mastery
	case 67: // Teeth
	case 73: // Poison Dagger
	case 79: // Golem Mastery
	case 84: // Bone Spear
	case 89: // Summon Resist
	case 93: // Bone Spirit
	case 101: // Holy Bolt
	case 107: // Charge
	case 112: // Blessed Hammer
	case 121: // Fist of the Heavens
	case 132: // Leap
	case 140: // Double Throw
	case 143: // Leap Attack
	case 151: // Whirlwind
	case 225: // Firestorm
	case 229: // Molten Boulder
	case 230: // Arctic Blast
	case 240: // Twister
	case 243: // Shock Wave
	case 245: // Tornado
	case 251: // Fire Trauma
	case 254: // Tiger Strike
	case 256: // Shock Field
	case 257: // Blade Sentinel
	case 259: // Fists of Fire
	case 263: // Weapon Block
	case 265: // Cobra Strike
	case 266: // Blade Fury
	case 269: // Claws of Thunder
	case 274: // Blades of Ice
	case 275: // Dragon Flight
		return 1;
	case 0: // Normal Attack
	case 10: // Jab
	case 14: // Power Strike
	case 24: // Charged Strike
	case 34: // Lightning Strike
	case 96: // Sacrifice
	case 97: // Smite
	case 106: // Zeal
	case 111: // Vengeance
	case 116: // Conversion
	case 126: // Bash
	case 133: // Double Swing
	case 139: // Stun
	case 144: // Concentrate
	case 147: // Frenzy
	case 152: // Berserk
	case 232: // Feral Rage
	case 233: // Maul
	case 238: // Rabies
	case 239: // Fire Claws
	case 242: // Hunger
	case 248: // Fury
	case 255: // Dragon Talon
	case 260: // Dragon Claw
	case 270: // Dragon Tail
		return 2; // Shift bypass
	}
	// Every other skill
	return 0;
};

Skill.getRange = function (skillId) {
	switch (skillId) {
	case 0: // Normal Attack
		return Attack.usingBow() ? 20 : 3;
	case 1: // Kick
	case 5: // Left Hand Swing
	case 10: // Jab
	case 14: // Power Strike
	case 19: // Impale
	case 24: // Charged Strike
	case 30: // Fend
	case 34: // Lightning Strike
	case 46: // Blaze
	case 73: // Poison Dagger
	case 96: // Sacrifice
	case 97: // Smite
	case 106: // Zeal
	case 111: // Vengeance
	case 112: // Blessed Hammer
	case 116: // Conversion
	case 126: // Bash
	case 131: // Find Potion
	case 133: // Double Swing
	case 139: // Stun
	case 142: // Find Item
	case 144: // Concentrate
	case 147: // Frenzy
	case 150: // Grim Ward
	case 152: // Berserk
	case 232: // Feral Rage
	case 233: // Maul
	case 238: // Rabies
	case 239: // Fire Claws
	case 242: // Hunger
	case 248: // Fury
	case 255: // Dragon Talon
	case 260: // Dragon Claw
	case 270: // Dragon Tail
		return 3;
	case 146: // Battle Cry
	case 154: // War Cry
		return 4;
	case 44: // Frost Nova
	case 240: // Twister
	case 245: // Tornado
	case 500: // Summoner
		return 5;
	case 38: // Charged Bolt
		return !!this.usePvpRange ? 11 : 6;
	case 48: // Nova
	case 151: // Whirlwind
		return 7;
	case 92: // Poison Nova
		return 8;
	case 249: // Armageddon
		return 9;
	case 15: // Poison Javelin
	case 25: // Plague Javelin
	case 101: // Holy Bolt
	case 107: // Charge
	case 130: // Howl
	case 225: // Firestorm
	case 229: // Molten Boulder
	case 243: // Shock Wave
		return 10;
	case 8: // Inner Sight
	case 17: // Slow Missiles
		return 13;
	case 35: // Lightning Fury
	case 64: // Frozen Orb
	case 67: // Teeth
	case 234: // Fissure
	case 244: // Volcano
	case 251: // Fire Blast
	case 256: // Shock Web
	case 257: // Blade Sentinel
	case 266: // Blade Fury
		return 15;
	case 7: // Fire Arrow
	case 12: // Multiple Shot
	case 16: // Exploding Arrow
	case 22: // Guided Arrow
	case 27: // Immolation Arrow
	case 31: // Freezing Arrow
	case sdk.skills.IceBolt:
	case sdk.skills.IceBlast:
	case sdk.skills.FireBolt:
	case sdk.skills.FireBall:
	case 95: // Revive
	case 121: // Fist of the Heavens
	case 140: // Double Throw
	case 253: // Psychic Hammer
	case 275: // Dragon Flight
		return 20;
	case 91: // Lower Resist
		return 50;
	// Variable range
	case 42: // Static Field
		return Math.floor((me.getSkill(sdk.skills.StaticField, 1) + 3) * 2 / 3);
	case 132: // Leap
		{
			let skLvl = me.getSkill(sdk.skills.Leap, 1);
			return Math.floor(Math.min(4 + (26 * ((110 * skLvl / (skLvl + 6)) / 100)), 30) * (2 / 3));
		}
	case 230: // Arctic Blast
		{
			let skLvl = me.getSkill(sdk.skills.ArcticBlast, 1);
			let range = Math.floor(((33 + (2 * skLvl)) / 4) * (2 / 3));
			// Druid using this on physical immunes needs the monsters to be within range of hurricane
			range > 6 && Config.AttackSkill[5] === sdk.skills.ArcticBlast && (range = 6);
	
			return range;
		}
	case 49: // Lightning
	case 84: // Bone Spear
	case 93: // Bone Spirit
		return !!this.usePvpRange ? 30 : 15;
	case 47: // Fire Ball
	case 51: // Fire Wall
	case 53: // Chain Lightning
	case 56: // Meteor
	case 59: // Blizzard
	case 273: // Mind Blast
		return !!this.usePvpRange ? 30 : 20;
	}

	// Every other skill
	return !!this.usePvpRange ? 30 : 20;
};

// Thank you @sakana
Skill.getManaCost = function (skillId = -1) {
	// first skills dont use mana
	if (skillId < 6) return 0;
	// Decoy wasn't reading from skill bin
	if (skillId === sdk.skills.Decoy) return Math.max(19.75 - (0.75 * me.getSkill(sdk.skills.Decoy, 1)), 1);
	if (this.manaCostList.hasOwnProperty(skillId)) return this.manaCostList[skillId];

	let skillLvl = me.getSkill(skillId, 1), effectiveShift = [1, 2, 4, 8, 16, 32, 64, 128, 256, 512, 1024],
		lvlmana = getBaseStat(3, skillId, "lvlmana") === 65535 ? -1 : getBaseStat(3, skillId, "lvlmana"), // Correction for skills that need less mana with levels (kolton)
		ret = Math.max((getBaseStat(3, skillId, "mana") + lvlmana * (skillLvl - 1)) * (effectiveShift[getBaseStat(3, skillId, "manashift")] / 256), getBaseStat(3, skillId, "minmana"));

	if (!this.manaCostList.hasOwnProperty(skillId)) {
		this.manaCostList[skillId] = ret;
	}

	return ret;
};

// Skills that cn be cast in town
Skill.townSkill = function (skillId = -1) {
	return [32, 40, 43, 50, 52, 58, 60, 68, 75, 85, 94, 117, 221, 222, 226, 227, 231, 235, 236, 237, 241, 246, 247, 258, 267, 268, 277, 278, 279].includes(skillId);
};

// Cast a skill on self, Unit or coords. Always use packet casting for caster skills becasue it's more stable.
Skill.cast = function (skillId, hand, x, y, item) {
	let clickType, shift;
	let casterSkills = [36, 38, 39, 44, 45, 47, 48, 49, 53, 54, 55, 56, 59, 64, 84, 87, 92, 93, 101, 112, 121, 130, 137, 138, 146, 154, 155, 225, 229, 230, 234, 240, 244, 249, 250, 251, 256, 261, 262, 271, 276];
	let forcePacket = Developer.forcePacketCasting.enabled && !Developer.forcePacketCasting.excludeProfiles.includes(me.profile);
	!!me.realm && casterSkills.push(67, 245);

	switch (true) {
	case me.inTown && !this.townSkill(skillId): // cant cast this in town
	case !item && this.getManaCost(skillId) > me.mp: // dont have enough mana for this
	case !item && !me.getSkill(skillId, 1): // Dont have this skill
	case !this.wereFormCheck(skillId): // can't cast in wereform
		return false;
	case skillId === undefined:
		throw new Error("Unit.cast: Must supply a skill ID");
	}

	hand === undefined && (hand = this.getHand(skillId));
	x === undefined && (x = me.x);
	y === undefined && (y = me.y);

	// Check mana cost, charged skills don't use mana
	if (!item && this.getManaCost(skillId) > me.mp) {
		// Maybe delay on ALL skills that we don't have enough mana for?
		if (Config.AttackSkill.concat([42, 54]).concat(Config.LowManaSkill).indexOf(skillId) > -1) {
			delay(300);
		}

		return false;
	}

	if (!this.setSkill(skillId, hand, item)) return false;

	if ((forcePacket && casterSkills.includes(skillId)) || Config.PacketCasting > 1 || skillId === sdk.skills.Teleport) {
		switch (typeof x) {
		case "number":
			Packet.castSkill(hand, x, y);
			delay(250);

			break;
		case "object":
			Packet.unitCast(hand, x);
			delay(250);

			break;
		}
	} else {
		switch (hand) {
		case 0: // Right hand + No Shift
			clickType = 3;
			shift = 0;

			break;
		case 1: // Left hand + Shift
			clickType = 0;
			shift = 1;

			break;
		case 2: // Left hand + No Shift
			clickType = 0;
			shift = 0;

			break;
		case 3: // Right hand + Shift
			clickType = 3;
			shift = 1;

			break;
		}

		MainLoop:
		for (let n = 0; n < 3; n += 1) {
			typeof x === "object" ? clickMap(clickType, shift, x) : clickMap(clickType, shift, x, y);
			delay(20);
			typeof x === "object" ? clickMap(clickType + 2, shift, x) : clickMap(clickType + 2, shift, x, y);

			for (let i = 0; i < 8; i += 1) {
				if (me.attacking) {
					break MainLoop;
				}

				delay(20);
			}
		}

		while (me.attacking) {
			delay(10);
		}
	}

	// account for lag, state 121 doesn't kick in immediately
	if (this.isTimed(skillId)) {
		for (let i = 0; i < 10; i++) {
			if ([4, 9].includes(me.mode) || me.skillDelay) {
				break;
			}

			delay(10);
		}
	}

	return true;
};

Skill.switchCast = function (skillId, hand, x, y, switchBack = true) {
	let clickType, shift;
	let casterSkills = [36, 38, 39, 44, 45, 47, 48, 49, 53, 54, 55, 56, 59, 64, 84, 87, 92, 93, 101, 112, 121, 130, 137, 138, 146, 154, 155, 225, 229, 230, 234, 240, 244, 249, 250, 251, 256, 261, 262, 271, 276];
	let forcePacket = Developer.forcePacketCasting.enabled && !Developer.forcePacketCasting.excludeProfiles.includes(me.profile);
	!!me.realm && casterSkills.push(67, 245);

	switch (true) {
	case me.classic: // No switch in classic
	case me.inTown && !this.townSkill(skillId): // cant cast this in town
	case this.getManaCost(skillId) > me.mp: // dont have enough mana for this
	case !me.getSkill(skillId, 1): // Dont have this skill
	case !this.wereFormCheck(skillId): // can't cast in wereform
		return false;
	case skillId === undefined:
		throw new Error("Unit.cast: Must supply a skill ID");
	}

	hand === undefined && (hand = this.getHand(skillId));
	x === undefined && (x = me.x);
	y === undefined && (y = me.y);

	// Check mana cost, charged skills don't use mana
	if (this.getManaCost(skillId) > me.mp) {
		// Maybe delay on ALL skills that we don't have enough mana for?
		if (Config.AttackSkill.concat([42, 54]).concat(Config.LowManaSkill).indexOf(skillId) > -1) {
			delay(300);
		}

		return false;
	}

	// switch to secondary
	me.weaponswitch === 0 && me.switchWeapons(1);

	// Failed to set the skill, switch back
	if (!this.setSkill(skillId, hand)) {
		me.switchWeapons(0);
		return false;
	}

	if ((forcePacket && casterSkills.includes(skillId)) || Config.PacketCasting > 1 || skillId === sdk.skills.Teleport) {
		switch (typeof x) {
		case "number":
			Packet.castSkill(hand, x, y);
			delay(250);

			break;
		case "object":
			Packet.unitCast(hand, x);
			delay(250);

			break;
		}
	} else {
		switch (hand) {
		case 0: // Right hand + No Shift
			clickType = 3;
			shift = 0;

			break;
		case 1: // Left hand + Shift
			clickType = 0;
			shift = 1;

			break;
		case 2: // Left hand + No Shift
			clickType = 0;
			shift = 0;

			break;
		case 3: // Right hand + Shift
			clickType = 3;
			shift = 1;

			break;
		}

		MainLoop:
		for (let n = 0; n < 3; n += 1) {
			typeof x === "object" ? clickMap(clickType, shift, x) : clickMap(clickType, shift, x, y);
			delay(20);
			typeof x === "object" ? clickMap(clickType + 2, shift, x) : clickMap(clickType + 2, shift, x, y);

			for (let i = 0; i < 8; i++) {
				if (me.attacking) {
					break MainLoop;
				}

				delay(20);
			}
		}

		while (me.attacking) {
			delay(10);
		}
	}

	// account for lag, state 121 doesn't kick in immediately
	if (this.isTimed(skillId)) {
		for (let i = 0; i < 10; i++) {
			if ([4, 9].includes(me.mode) || me.skillDelay) {
				break;
			}

			delay(10);
		}
	}

	// switch back to main secondary
	me.weaponswitch === 1 && switchBack && me.switchWeapons(0);

	return true;
};

Skill.wereformAllowed = function (skillId = -1) {
	if (!Config.Wereform) return true;
	if (skillId < 0) return false;

	let wolf = false;
	let bear = false;

	switch (Config.Wereform.toString().toLowerCase()) {
	case "1":
	case "werewolf":
		wolf = true;

		break;
	case "2":
	case "werebear":
		bear = true;

		break;
	default:
		return false;
	}

	// Can be cast by both
	if ([0, 1, 221, 222, 226, 227, 231, 236, 237, 239, 241, 242, 246, 247, 249].includes(skillId)) {
		return true;
	}

	// Can be cast by werewolf only
	if (wolf && [223, 232, 238, 248].includes(skillId)) {
		return true;
	}

	// Can be cast by werebear only
	if (bear && [228, 233, 243].includes(skillId)) {
		return true;
	}

	return false;
};
