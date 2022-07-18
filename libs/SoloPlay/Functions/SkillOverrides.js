/**
*  @filename    SkillOverrides.js
*  @author      theBGuy
*  @desc        Skill improvments for SoloPlay
*
*/

!isIncluded("common/Misc.js") && include("common/Misc.js");
!isIncluded("SoloPlay/Tools/Developer.js") && include("SoloPlay/Tools/Developer.js");

Skill.casterSkills = [
	36, 38, 39, 44, 45, 47, 48, 49, 53, 54, 55, 56, 59, 64, 84,
	87, 92, 93, 101, 112, 121, 130, 137, 146, 154, 225,
	229, 230, 234, 240, 244, 249, 250, 251, 256, 261, 262, 271, 276
];
Skill.forcePacket = (Developer.forcePacketCasting.enabled && !Developer.forcePacketCasting.excludeProfiles.includes(me.profile));

let Overrides = require('../../modules/Override');

new Overrides.Override(Skill, Skill.getRange, function (orignal, skillId) {
	switch (skillId) {
	case sdk.skills.ChargedBolt:
		return !!this.usePvpRange ? 11 : 6;
	case sdk.skills.Lightning:
	case sdk.skills.BoneSpear:
	case sdk.skills.BoneSpirit:
		return !!this.usePvpRange ? 30 : 15;
	case sdk.skills.FireBall:
	case sdk.skills.FireWall:
	case sdk.skills.ChainLightning:
	case sdk.skills.Meteor:
	case sdk.skills.Blizzard:
	case sdk.skills.MindBlast:
		return !!this.usePvpRange ? 30 : 20;
	default:
		return orignal(skillId);
	}
}).apply();

// Thank you @sakana
Skill.getManaCost = function (skillId = -1) {
	// first skills dont use mana
	if (skillId < 6) return 0;
	// Decoy wasn't reading from skill bin
	if (skillId === sdk.skills.Decoy) return Math.max(19.75 - (0.75 * me.getSkill(sdk.skills.Decoy, sdk.skills.subindex.softpoints)), sdk.skills.subindex.softpoints);
	if (this.manaCostList.hasOwnProperty(skillId)) return this.manaCostList[skillId];

	let skillLvl = me.getSkill(skillId, sdk.skills.subindex.softpoints), effectiveShift = [1, 2, 4, 8, 16, 32, 64, 128, 256, 512, 1024];
	let lvlmana = getBaseStat(3, skillId, "lvlmana") === 65535 ? -1 : getBaseStat(3, skillId, "lvlmana"); // Correction for skills that need less mana with levels (kolton)
	let ret = Math.max((getBaseStat(3, skillId, "mana") + lvlmana * (skillLvl - 1)) * (effectiveShift[getBaseStat(3, skillId, "manashift")] / 256), getBaseStat(3, skillId, "minmana"));

	if (!this.manaCostList.hasOwnProperty(skillId)) {
		this.manaCostList[skillId] = ret;
	}

	return ret;
};

// Cast a skill on self, Unit or coords. Always use packet casting for caster skills becasue it's more stable.
Skill.cast = function (skillId, hand, x, y, item) {
	let clickType, shift;

	switch (true) {
	case me.inTown && !this.townSkill(skillId): // cant cast this in town
	case !item && (!Skill.canUse(skillId) || this.getManaCost(skillId) > me.mp): // Dont have this skill or dont have enough mana for this
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

	if (Config.PacketCasting > 1 || [sdk.skills.Teleport, sdk.skills.Telekinesis].includes(skillId)
		|| (this.forcePacket && this.casterSkills.includes(skillId) && (!!me.realm || [67, 245].indexOf(skillId) === -1))) {
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

Skill.switchCast = function (skillId, givenSettings = {}) {
	let settings = Object.assign({}, {
		hand: undefined,
		x: undefined,
		y: undefined,
		switchBack: true,
		oSkill: false
	}, givenSettings);

	switch (true) {
	case me.classic: // No switch in classic
	case me.inTown && !this.townSkill(skillId): // cant cast this in town
	case this.getManaCost(skillId) > me.mp: // dont have enough mana for this
	case !this.wereFormCheck(skillId): // can't cast in wereform
	//case (!me.getSkill(skillId, sdk.skills.subindex.softpoints) && !settings.oSkill): // Dont have this skill
		return false;
	case skillId === undefined:
		throw new Error("Unit.cast: Must supply a skill ID");
	}

	settings.hand === undefined && (settings.hand = this.getHand(skillId));
	settings.x === undefined && (settings.x = me.x);
	settings.y === undefined && (settings.y = me.y);

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
	if (!this.setSkill(skillId, settings.hand)) {
		me.switchWeapons(0);
		return false;
	}

	if ((this.forcePacket && this.casterSkills.includes(skillId) && (!!me.realm || [67, 245].indexOf(skillId) === -1))
		|| Config.PacketCasting > 1
		|| skillId === sdk.skills.Teleport) {
		switch (typeof settings.x) {
		case "number":
			Packet.castSkill(settings.hand, settings.x, settings.y);

			break;
		case "object":
			Packet.unitCast(settings.hand, settings.x);

			break;
		}
		// make sure we give enough time back so we don't fail our next cast
		delay(250);
	} else {
		let clickType, shift;

		switch (settings.hand) {
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
			typeof settings.x === "object" ? clickMap(clickType, shift, settings.x) : clickMap(clickType, shift, settings.x, settings.y);
			delay(20);
			typeof settings.x === "object" ? clickMap(clickType + 2, shift, settings.x) : clickMap(clickType + 2, shift, settings.x, settings.y);

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
	me.weaponswitch === 1 && settings.switchBack && me.switchWeapons(0);

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
