/*
*	@filename	DynamicTiers.js
*	@author		theBGuy, isid0re
*	@desc		Dynamic tiers calculators for Kolbot-SoloPlay
*/

let mercscore = function (item) {
	const mercWeights = {
		IAS: 3.5,
		MINDMG:	3, // min damage
		MAXDMG: 3, // max damage
		SECMINDMG: 3, // secondary min damage
		SECMAXDMG: 3, // secondary max damage
		ELEDMG: 2, // elemental damage
		AR:	0.5, // attack rating
		CB: 3, // crushing blow
		OW: 3, // open wounds
		LL: 1.5, //lifeleach
		// CTC on attack
		CTCOAAMP: 5,
		CTCOADECREP: 10,
		// CTC on striking
		CTCOSAMP: 3,
		CTCOSDECREP: 8,
		// regen
		HPREGEN: 2,
		FHR: 3, // faster hit recovery
		DEF: 0.05, // defense
		HP:	2,
		STR: 1.5,
		DEX: 1.5,
		ALL: 180, // + all skills
		FR: 2, // fire resist
		LR: 2, // lightning resist
		CR: 1.5, // cold resist
		PR: 1, // poison resist
	};

	let mercRating = 1;

	if (item.prefixnum === 20653) { //treachery
		mercRating += item.getStatEx(201, 2) * 1000; // fade
	}

	mercRating += item.getStatEx(151, 120) * 100; // meditation aura
	mercRating += item.getStatEx(151, 123) * 1000; // conviction aura
	mercRating += item.getStatEx(93) * mercWeights.IAS; // add IAS
	mercRating += item.getStatEx(21) * mercWeights.MINDMG; // add MIN damage
	mercRating += item.getStatEx(22) * mercWeights.MAXDMG; // add MAX damage
	mercRating += item.getStatEx(23) * mercWeights.SECMINDMG; // add MIN damage	//Note: two-handed weapons i.e spears, polearms, ect use secondary min + max damage. Keeping regular min + max for a1 merc
	mercRating += item.getStatEx(24) * mercWeights.SECMAXDMG; // add MAX damage	//Note: two-handed weapons i.e spears, polearms, ect use secondary min + max damage. Keeping regular min + max for a1 merc
	mercRating += (item.getStatEx(48) + item.getStatEx(49) + item.getStatEx(50) + item.getStatEx(51) + item.getStatEx(52) + item.getStatEx(53) + item.getStatEx(54) + item.getStatEx(55) + (item.getStatEx(57) * 125 / 512)) * mercWeights.ELEDMG; // add elemental damage
	mercRating += item.getStatEx(19) * mercWeights.AR; // add AR
	mercRating += item.getStatEx(136) * mercWeights.CB; // add crushing blow
	mercRating += item.getStatEx(135) * mercWeights.OW; // add open wounds
	mercRating += item.getStatEx(60) * mercWeights.LL; // add LL
	mercRating += item.getStatEx(74) * mercWeights.HPREGEN; // add hp regeneration
	mercRating += item.getStatEx(99) * mercWeights.FHR; // add faster hit recovery
	mercRating += item.getStatEx(31) * mercWeights.DEF; //	add Defense
	mercRating += (item.getStatEx(3) + item.getStatEx(7) + (item.getStatEx(216) / 2048 * me.charlvl)) * mercWeights.HP; // add HP
	mercRating += item.getStatEx(0) * mercWeights.STR; // add STR
	mercRating += item.getStatEx(2) * mercWeights.DEX; // add DEX
	mercRating += item.getStatEx(127) * mercWeights.ALL; // add all skills
	mercRating += item.getStatEx(39) * mercWeights.FR; // add FR
	mercRating += item.getStatEx(43) * mercWeights.CR; // add CR
	mercRating += item.getStatEx(41) * mercWeights.LR; // add LR
	mercRating += item.getStatEx(45) * mercWeights.PR; // add PR

	if (!me.sorceress && !me.necromancer && !me.assassin) {
		mercRating += item.getStatEx(195, 4238) * mercWeights.CTCOAAMP; // add CTC amplify damage on attack
		mercRating += item.getStatEx(195, 4225) * mercWeights.CTCOAAMP; // add CTC amplify damage on attack (magic items)
		mercRating += item.getStatEx(195, 5583) * mercWeights.CTCOADECREP; // add CTC decrepify on attack
		mercRating += item.getStatEx(195, 5631) * mercWeights.CTCOADECREP; // add CTC decrepify on attack (magic items)
		mercRating += item.getStatEx(198, 4238) * mercWeights.CTCOSAMP; // add CTC amplify damage on strikng
		mercRating += item.getStatEx(198, 4225) * mercWeights.CTCOSAMP; // add CTC amplify damage on strikng (magic items)
		mercRating += item.getStatEx(198, 5583) * mercWeights.CTCOSDECREP; // add CTC decrepify on strikng
		mercRating += item.getStatEx(198, 5631) * mercWeights.CTCOSDECREP; // add CTC decrepify on strikng (magic items)
	}

	let rwBase;

	for (let x = 0; x < Config.Runewords.length; x += 1) {
		let sockets = Config.Runewords[x][0].length;
		let baseCID = Config.Runewords[x][1];

		if (item.classid === baseCID && item.quality < 4 && item.getStat(194) === sockets && !item.isRuneword) {
			rwBase = true;
		}
	}

	if (rwBase) {
		mercRating = -1;
	}

	return mercRating;
};

const tierscore = function (item, bodyloc) {
	const resistWeights = {
		FR: 3, // fire resist
		LR: 3, // lightning resist
		CR: 1.5, // cold resist
		PR: 1, // poison resist
		ABS: 2.7, // absorb damage (fire light magic cold)
		DR: 2, // Damage resist
		MR: 3, // Magic damage resist
	};

	const generalWeights = {
		CBF: 25, // cannot be frozen
		FRW: 1, // faster run/walk
		FHR: 3, // faster hit recovery
		DEF: 0.05, // defense
		ICB: 2, // increased chance to block
		BELTSLOTS: 1.55, //belt potion storage
		MF: 1, //Magic Find
		// base stats
		HP:	0.5,
		MANA: 0.5,
		STR: 1,
		DEX: 1,
	};

	const casterWeights = {
		//breakpoint stats
		FCR: (me.assassin ? 2 : 5),
		IAS: (me.assassin ? 4 : 0),
		// regen
		HPREGEN: 2,
		MANAREGEN: 2.2,
	};

	const meleeWeights = {
		//breakpoint stats
		FCR: 0.5,
		IAS: 4,
		// Attack
		MINDMG:	3, // min damage
		MAXDMG: 3, // max damage
		SECMINDMG: 2, // secondary min damage
		SECMAXDMG: 2, // secondary max damage
		ELEDMG: 1, // elemental damage
		AR:	0.2, // attack rating
		CB: 4, // crushing blow
		OW: 1, // open wounds
		DS: 1.5, // deadly strike
		DMGTOUNDEAD: 0.5,	// damage % to undead
		DMGTODEMONS: 0.5,	// damage % to demons
		// leaching
		LL: 4, //lifeleach
		ML:	2, //manaleach
		// regen
		HPREGEN: 2,
		MANAREGEN: 2,
	};

	const ctcWeights = {
		whenStruck: 2,
		onAttack: 2,
		onStrike: 1,
		skills: {
			// Sorc skills
			Nova: 2,
			FrostNova: 4,
			IceBlast: 4,
			ChargedBolt: 4,
			StaticField: 5,
			GlacialSpike: 6,
			ChainLightning: 6,
			Blizzard: 4,
			FrozenOrb: 8,
			Hydra: 4,
			// Necro skills
			AmplifyDamage: 5,
			Decrepify: 10,
			LifeTap: 10,
			BoneArmor: 10,
			BoneSpear: 8,
			BoneSpirit: 8,
			PoisonNova: 10,
			// Barb skills
			Taunt: 5,
			Howl: 5,
			// Druid skills
			CycloneArmor: 10,
			Twister: 5,
			// Sin skills
			Fade: 10,
			Venom: 8,
		}
	};

	const skillsWeights = {
		ALL: 200, // + all skills
		CLASS: 175, // + class tab
		TAB: 125, // + skill tab
		WANTED: 45, // + wanted key skills
		USEFUL: 30, // + wanted supportive skills
	};

	const buildInfo = Check.currentBuild();

	this.generalScore = function (item) {
		let generalRating = 0, 
			canTele = !Pather.canTeleport();

		if (!canTele && item.getStatEx(sdk.stats.CannotbeFrozen)) {
			let haveCBF = me.getStat(sdk.stats.CannotbeFrozen) > 0;
			// Cannot be frozen is very important for Melee chars
			!haveCBF && (generalRating += buildInfo.caster ? generalWeights.CBF : generalWeights.CBF * 4);
		}

		// faster run/walk
		!canTele && (generalRating += item.getStatEx(sdk.stats.FRW) * generalWeights.FRW);

		// belt slots
		item.itemType === sdk.itemtype.Belt && (generalRating += Storage.BeltSize() * 4 * generalWeights.BELTSLOTS); // rows * columns * weight

		// start generalRating
		generalRating += item.getStatEx(80) * generalWeights.MF; // add magic find
		generalRating += item.getStatEx(99) * generalWeights.FHR; // add faster hit recovery
		generalRating += item.getStatEx(31) * generalWeights.DEF; //	add Defense
		generalRating += (item.getStatEx(20) + item.getStatEx(102)) * generalWeights.ICB; //add increased chance to block
		generalRating += (item.getStatEx(3) + item.getStatEx(7) + (item.getStatEx(216) / 2048 * me.charlvl)) * generalWeights.HP; // add HP
		generalRating += (item.getStatEx(1) + item.getStatEx(9) + (item.getStatEx(217) / 2048 * me.charlvl)) * generalWeights.MANA;// add mana
		generalRating += item.getStatEx(0) * generalWeights.STR; // add STR
		generalRating += item.getStatEx(2) * generalWeights.DEX; // add DEX

		return generalRating;
	};

	this.resistScore = function (item) {
		let resistRating = 0;
		// current total resists
		let currFR = me.fireRes;
		let currCR = me.coldRes;
		let currLR = me.lightRes;
		let currPR = me.poisonRes;
		// get item body location
		let itembodyloc = Item.getBodyLoc(item);

		if (!itembodyloc) return resistRating;

		bodyloc === undefined && (bodyloc = itembodyloc.last()); // extract bodyloc from array
		// get item resists stats from olditem equipped on body location
		let equippedItem = me.getItemsEx().filter(function (equipped) { return equipped.isEquipped && equipped.bodylocation === bodyloc; }).first();

		let olditemFR = !!equippedItem ? equippedItem.getStatEx(39) : 0; // equipped fire resist
		let olditemCR = !!equippedItem ? equippedItem.getStatEx(43) : 0; // equipped cold resist
		let olditemLR = !!equippedItem ? equippedItem.getStatEx(41) : 0; // equipped lite resist
		let olditemPR = !!equippedItem ? equippedItem.getStatEx(45) : 0; // equipped poison resist
		// subtract olditem resists from current total resists
		let baseFR = currFR - olditemFR;
		let baseCR = currCR - olditemCR;
		let baseLR = currLR - olditemLR;
		let basePR = currPR - olditemPR;
		// if baseRes < max resists give score value upto max resists reached
		let maxRes = !me.classic ? 175 : 125;
		let FRlimit = Math.max(maxRes - baseFR, 0);
		let CRlimit = Math.max(maxRes - baseCR, 0);
		let LRlimit = Math.max(maxRes - baseLR, 0);
		let PRlimit = Math.max(maxRes - basePR, 0);
		// get new item stats
		let newitemFR = Math.max(item.getStatEx(39), 0); // fire resist
		let newitemCR = Math.max(item.getStatEx(43), 0); // cold resist
		let newitemLR = Math.max(item.getStatEx(41), 0); // lite resist
		let newitemPR = Math.max(item.getStatEx(45), 0); // poison resist
		// newitemRes upto reslimit
		let effectiveFR = Math.min(newitemFR, FRlimit);
		let effectiveCR = Math.min(newitemCR, CRlimit);
		let effectiveLR = Math.min(newitemLR, LRlimit);
		let effectivePR = Math.min(newitemPR, PRlimit);
		// sum resistRatings
		resistRating += effectiveFR * resistWeights.FR; // add fireresist
		resistRating += effectiveCR * resistWeights.CR; // add coldresist
		resistRating += effectiveLR * resistWeights.LR; // add literesist
		resistRating += effectivePR * resistWeights.PR; // add poisonresist

		resistRating += (item.getStatEx(142) + item.getStatEx(144) + item.getStatEx(146) + item.getStatEx(148)) * resistWeights.ABS; // add absorb damage
		resistRating += item.getStatEx(34) * resistWeights.DR; // add integer damage resist
		resistRating += item.getStatEx(36) * resistWeights.DR * 2; // add damage resist %
		resistRating += item.getStatEx(35) * resistWeights.MR; // add integer magic damage resist
		resistRating += item.getStatEx(37) * resistWeights.MR * 2; // add magic damage resist %

		return resistRating;
	};

	this.buildScore = function (item) {
		let buildWeights = buildInfo.caster ? casterWeights : meleeWeights;
		let buildRating = 0;

		me.amazon && item.getStatEx(sdk.stats.ReplenishQuantity) && (buildRating += 50);
		!Pather.canTeleport() && item.getStatEx(sdk.stats.ChargedSkill, 3461) && (buildRating += 50);

		buildRating += item.getStatEx(105) * buildWeights.FCR; // add FCR
		buildRating += item.getStatEx(93) * buildWeights.IAS; // add IAS
		buildRating += item.getStatEx(74) * buildWeights.HPREGEN; // add hp regeneration
		buildRating += item.getStatEx(26) * buildWeights.MANAREGEN; // add mana recovery
		!item.isRuneword && (buildRating += (item.getStatEx(sdk.stats.NumSockets) * 10)); // priortize sockets

		// pierce/mastery's not sure how I want to weight this so for now just its base value
		buildInfo.usefulStats.forEach(stat => buildRating += item.getStatEx(stat));

		// Melee Specific
		if (!buildInfo.caster) {
			let eleDmgModifer = [sdk.itemtype.Ring, sdk.itemtype.Amulet].includes(item.itemType) ? 2 : 1;

			item.getStatEx(sdk.stats.ReplenishDurability) && (buildRating += 15);
			item.getStatEx(sdk.stats.IgnoreTargetDefense) && (buildRating += 50);
			buildRating += item.getStatEx(21) * buildWeights.MINDMG; // add MIN damage
			buildRating += item.getStatEx(22) * buildWeights.MAXDMG; // add MAX damage
			//buildRating += item.getStatEx(23) * buildWeights.SECMINDMG; // add MIN damage
			//buildRating += item.getStatEx(24) * buildWeights.SECMAXDMG; // add MAX damage
			buildRating += (item.getStatEx(48) + item.getStatEx(49) + item.getStatEx(50) + item.getStatEx(51) + item.getStatEx(52) + item.getStatEx(53) + item.getStatEx(54) + item.getStatEx(55) + (item.getStatEx(57) * 125 / 256)) * (buildWeights.ELEDMG / eleDmgModifer); // add elemental damage PSN damage adjusted for damage per frame (125/256)
			buildRating += item.getStatEx(19) * buildWeights.AR; // add AR
			buildRating += item.getStatEx(136) * buildWeights.CB; // add crushing blow
			buildRating += item.getStatEx(135) * buildWeights.OW; // add open wounds
			buildRating += item.getStatEx(141) * buildWeights.DS; // add deadly strike
			buildRating += item.getStatEx(60) * buildWeights.LL; // add LL
			buildRating += item.getStatEx(62) * buildWeights.ML; // add ML
			buildRating += item.getStatEx(151, 119) * 10; // sanctuary aura
			buildRating += item.getStatEx(121) * buildWeights.DMGTODEMONS; // add damage % to demons
			buildRating += item.getStatEx(122) * buildWeights.DMGTOUNDEAD; // add damage % to undead
		}

		return buildRating;
	};

	this.skillsScore = function (item) {
		let skillsRating = 0;
		let weaponModifer = !buildInfo.caster && [24, 25, 26, 27, 28, 29, 30, 31, 32, 33, 34, 35, 36].indexOf(item.itemType) ? 4 : 1;

		skillsRating += item.getStatEx(127) * (skillsWeights.ALL / weaponModifer); // + all skills
		skillsRating += item.getStatEx(83, me.classid) * (skillsWeights.CLASS / weaponModifer); // + class skills
		skillsRating += item.getStatEx(188, buildInfo.tabSkills) * (skillsWeights.TAB / weaponModifer); // + TAB skills
		let selectedWeights = [skillsWeights.WANTED, skillsWeights.USEFUL];
		let selectedSkills = [buildInfo.wantedSkills, buildInfo.usefulSkills];

		for (let i = 0; i < selectedWeights.length; i++) {
			for (let j = 0; j < selectedSkills.length; j++) {
				for (let k = 0; k < selectedSkills[j].length; k++) {
					skillsRating += item.getStatEx(107, selectedSkills[j][k]) * selectedWeights[i];
				}
			}
		}

		// Spirit Fix for barb
		if (item.prefixnum === sdk.locale.items.Spirit && !buildInfo.caster) {
			skillsRating -= 400;
		}

		return skillsRating;
	};

	this.ctcScore = function (item) {
		// chance to cast doesn't exist in classic
		if (me.classic) return 0;

		let ctcRating = 0, ctcItems = [];
		let stats = item.getStat(-2);
		let meleeCheck = !buildInfo.caster;

		// TODO: Figure out why all ctc stats are duplicates or a way to check to see if that stat has already been added to the ctcItems array

		if (stats.hasOwnProperty(sdk.stats.SkillWhenStruck)) {
			if (stats[sdk.stats.SkillWhenStruck] instanceof Array) {
				for (let i = 0; i < stats[sdk.stats.SkillWhenStruck].length; i++) {
					if (stats[sdk.stats.SkillWhenStruck][i] !== undefined) {
						ctcItems.push({
							ctcType: sdk.stats.SkillWhenStruck,
							skill: stats[sdk.stats.SkillWhenStruck][i].skill,
							level: stats[sdk.stats.SkillWhenStruck][i].level
						});
					}
				}
			} else {
				ctcItems.push({
					ctcType: sdk.stats.SkillWhenStruck,
					skill: stats[sdk.stats.SkillWhenStruck].skill,
					level: stats[sdk.stats.SkillWhenStruck].level
				});
			}
		}

		if (stats.hasOwnProperty(sdk.stats.SkillOnAttack)) {
			if (stats[sdk.stats.SkillOnAttack] instanceof Array) {
				for (let i = 0; i < stats[sdk.stats.SkillOnAttack].length; i++) {
					if (stats[sdk.stats.SkillOnAttack][i] !== undefined) {
						ctcItems.push({
							ctcType: sdk.stats.SkillOnAttack,
							skill: stats[sdk.stats.SkillOnAttack][i].skill,
							level: stats[sdk.stats.SkillOnAttack][i].level
						});
					}
				}
			} else {
				ctcItems.push({
					ctcType: sdk.stats.SkillOnAttack,
					skill: stats[sdk.stats.SkillOnAttack].skill,
					level: stats[sdk.stats.SkillOnAttack].level
				});
			}
		}

		if (stats.hasOwnProperty(sdk.stats.SkillOnStrike)) {
			if (stats[sdk.stats.SkillOnStrike] instanceof Array) {
				for (let i = 0; i < stats[sdk.stats.SkillOnStrike].length; i++) {
					if (stats[sdk.stats.SkillOnStrike][i] !== undefined) {
						ctcItems.push({
							ctcType: sdk.stats.SkillOnStrike,
							skill: stats[sdk.stats.SkillOnStrike][i].skill,
							level: stats[sdk.stats.SkillOnStrike][i].level
						});
					}
				}
			} else {
				ctcItems.push({
					ctcType: sdk.stats.SkillOnStrike,
					skill: stats[sdk.stats.SkillOnStrike].skill,
					level: stats[sdk.stats.SkillOnStrike].level
				});
			}
		}

		for (let i = 0; i < ctcItems.length; i++) {
			try {
				let skillName = getSkillById(ctcItems[i].skill).split(" ").join("");
				if (!!ctcWeights.skills[skillName]) {
					switch (ctcItems[i].ctcType) {
					case sdk.stats.SkillOnAttack:
						ctcRating += (meleeCheck ? ctcItems[i].level * ctcWeights.skills[skillName] * ctcWeights.onAttack : 0);
						break;
					case sdk.stats.SkillOnStrike:
						ctcRating += (meleeCheck ? ctcItems[i].level * ctcWeights.skills[skillName] * ctcWeights.onStrike : 0);
						break;
					case sdk.stats.SkillWhenStruck:
						ctcRating += ctcItems[i].level * ctcWeights.skills[skillName] * ctcWeights.whenStruck;
						break;
					default:
						break;
					}
				}
			} catch (e) {
				print(e);
			}
		}

		return Math.floor(ctcRating / 2);
	};

	let tier = 1; // set to 1 for native autoequip to use items.
	tier += this.generalScore(item);
	tier += this.resistScore(item);
	tier += this.buildScore(item);
	tier += this.skillsScore(item);
	tier += this.ctcScore(item);

	// TODO: Maybe write chargesScore if I end up untilizing item charges for precast like summons or enchant

	let rwBase; // don't score runeword base armors

	for (let x = 0; x < Config.Runewords.length; x += 1) {
		let sockets = Config.Runewords[x][0].length;
		let baseCID = Config.Runewords[x][1];

		if (item.classid === baseCID && item.quality < 4 && item.getStat(194) === sockets && !item.isRuneword && !item.getItem()) {
			rwBase = true;
		}
	}

	if (rwBase || item.isQuestItem) {
		tier = -1;
	}

	return tier;
};

const secondaryscore = function (item) {
	let tier = 0;

	tier += item.getStatEx(127) * 200; // + all skills
	tier += item.getStatEx(83, me.classid) * 100; // + class skills
	tier += item.getStatEx(188, Check.finalBuild().tabSkills) * 75; // + TAB skills
	let precastSkills = [Check.finalBuild().precastSkills];

	for (let i = 0; i < precastSkills.length; i++) {
		tier += item.getStatEx(107, precastSkills[i]) * 50;
	}

	tier += item.getStatEx(105) * 5; // add FCR
	tier += item.getStatEx(99) * 3; // add faster hit recovery

	return tier;
};

const chargeditemscore = function (item, skillId) {
	let tier = 0;

	let validCharge = function (itemCharge) {
		return itemCharge.skill === skillId && itemCharge.charges > 1;
	};

	let stats = item.getStat(-2);
	let chargedItems = [];

	if (stats.hasOwnProperty(204)) {
		if (stats[204] instanceof Array) {
			for (let i = 0; i < stats[204].length; i += 1) {
				if (stats[204][i] !== undefined) {
					chargedItems.push({
						unit: copyUnit(item),
						gid: item.gid,
						skill: stats[204][i].skill,
						level: stats[204][i].level,
						charges: stats[204][i].charges,
						maxcharges: stats[204][i].maxcharges
					});
				}
			}
		} else {
			chargedItems.push({
				unit: copyUnit(item),
				gid: item.gid,
				skill: stats[204].skill,
				level: stats[204].level,
				charges: stats[204].charges,
				maxcharges: stats[204].maxcharges
			});
		}
	}

	chargedItems = chargedItems.filter(check => check.skill === skillId);

	for (let i = 0; i < chargedItems.length; i++) {
		tier += chargedItems[i].level * 5;
	}

	return tier;
};

const charmscore = function (item) {
	const generalWeights = {
		ALL:	180, // + all skills
		CLASS:	175, // + class tab
		TAB: 300, // + skill tab
		FR: 2, // fire resist
		LR: 5, // lightning resist
		CR: 2, // cold resist
		PR: 1, // poison resist
		FRW: 1, // faster run/walk
		FHR: (me.barbarian ? 4 : 2), // faster hit recovery
		DEF: 0.05, // defense
		MF: 2, //Magic Find
		// base stats
		HP:	1.75,
		MANA: 0.8,
		STR: 1.0,
		DEX: 1.0,
	};

	let charmRating = 1;
	charmRating += item.getStatEx(188, Check.currentBuild().tabSkills) * generalWeights.TAB; // + TAB skills
	charmRating += item.getStatEx(39) * generalWeights.FR; // add FR
	charmRating += item.getStatEx(43) * generalWeights.CR; // add CR
	charmRating += item.getStatEx(41) * generalWeights.LR; // add LR
	charmRating += item.getStatEx(45) * generalWeights.PR; // add PR
	charmRating += item.getStatEx(96) * generalWeights.FRW; // add faster run walk
	charmRating += item.getStatEx(99) * generalWeights.FHR; // add faster hit recovery
	charmRating += item.getStatEx(31) * generalWeights.DEF; //	add Defense
	charmRating += item.getStatEx(80) * generalWeights.MF; // add magic find
	charmRating += (item.getStatEx(3) + item.getStatEx(7) + (item.getStatEx(216) / 2048 * me.charlvl)) * generalWeights.HP; // add HP
	charmRating += (item.getStatEx(1) + item.getStatEx(9) + (item.getStatEx(217) / 2048 * me.charlvl)) * generalWeights.MANA;// add mana
	charmRating += item.getStatEx(0) * generalWeights.STR; // add STR
	charmRating += item.getStatEx(2) * generalWeights.DEX; // add DEX

	if (!Check.currentBuild().caster) {
		charmRating += item.getStatEx(21) * 3; // add MIN damage
		charmRating += item.getStatEx(22) * 3; // add MAX damage
		charmRating += (item.getStatEx(48) + item.getStatEx(49) + item.getStatEx(50) + item.getStatEx(51) + item.getStatEx(52) + item.getStatEx(53) + item.getStatEx(54) + item.getStatEx(55) + (item.getStatEx(57) * 125 / 256)); // add elemental damage PSN damage adjusted for damage per frame (125/256)
		charmRating += item.getStatEx(19) * 0.5; // add AR
	}

	// Gheeds, Torch, annhi
	if (item.quality === 7) {
		charmRating += item.getStatEx(127) * generalWeights.ALL; // + all skills
		charmRating += item.getStatEx(83, me.classid) * generalWeights.CLASS; // + class skills
		charmRating += item.getStatEx(79); // add gold find
		charmRating += item.getStatEx(87) * 1.5; // add reduced vendor prices
		charmRating += item.getStatEx(0); // add STR
	}

	return charmRating;
};
