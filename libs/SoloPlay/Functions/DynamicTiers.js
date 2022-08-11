/**
*  @filename    DynamicTiers.js
*  @author      theBGuy
*  @credit      isid0re
*  @desc        Dynamic tier calculators for Kolbot-SoloPlay
*
*/

const sumElementalDmg = function (item) {
	if (!item) return 0;
	let fire = item.getStatEx(sdk.stats.FireMinDamage) + item.getStatEx(sdk.stats.FireMaxDamage);
	let light = item.getStatEx(sdk.stats.LightMinDamage) + item.getStatEx(sdk.stats.LightMaxDamage);
	let magic = item.getStatEx(sdk.stats.MagicMinDamage) + item.getStatEx(sdk.stats.MagicMaxDamage);
	let cold = item.getStatEx(sdk.stats.ColdMinDamage) + item.getStatEx(sdk.stats.ColdMaxDamage);
	let poison = (item.getStatEx(sdk.stats.PoisonMinDamage) * 125 / 256); // PSN damage adjusted for damage per frame (125/256)
	return (fire + light + magic + cold + poison);
};

const mercscore = function (item) {
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
		ALL: 60, // + all skills
		FR: 2, // fire resist
		LR: 2, // lightning resist
		CR: 1.5, // cold resist
		PR: 1, // poison resist
		ABS: 2.7, // absorb damage (fire light magic cold)
		DR: 2, // Damage resist
		MR: 3, // Magic damage resist
	};

	let mercRating = 1;
	// start
	item.prefixnum === sdk.locale.items.Treachery && (mercRating += item.getStatEx(sdk.stats.SkillWhenStruck, 2) * 1000); // fade
	mercRating += item.getStatEx(sdk.stats.SkillOnAura, sdk.skills.Conviction) * 1000; // conviction aura
	mercRating += item.getStatEx(sdk.stats.SkillOnAura, sdk.skills.Meditation) * 100; // meditation aura
	mercRating += item.getStatEx(sdk.stats.AllSkills) * mercWeights.ALL; // add all skills
	mercRating += item.getStatEx(sdk.stats.IAS) * mercWeights.IAS; // add IAS
	mercRating += item.getStatEx(sdk.stats.ToHit) * mercWeights.AR; // add AR
	mercRating += item.getStatEx(sdk.stats.CrushingBlow) * mercWeights.CB; // add crushing blow
	mercRating += item.getStatEx(sdk.stats.OpenWounds) * mercWeights.OW; // add open wounds
	mercRating += item.getStatEx(sdk.stats.LifeLeech) * mercWeights.LL; // add LL
	mercRating += item.getStatEx(sdk.stats.HpRegen) * mercWeights.HPREGEN; // add hp regeneration
	mercRating += item.getStatEx(sdk.stats.FHR) * mercWeights.FHR; // add faster hit recovery
	mercRating += item.getStatEx(sdk.stats.Defense) * mercWeights.DEF; //	add Defense
	mercRating += item.getStatEx(sdk.stats.Strength) * mercWeights.STR; // add STR
	mercRating += item.getStatEx(sdk.stats.Dexterity) * mercWeights.DEX; // add DEX
	mercRating += item.getStatEx(sdk.stats.FireResist) * mercWeights.FR; // add FR
	mercRating += item.getStatEx(sdk.stats.ColdResist) * mercWeights.CR; // add CR
	mercRating += item.getStatEx(sdk.stats.LightResist) * mercWeights.LR; // add LR
	mercRating += item.getStatEx(sdk.stats.PoisonResist) * mercWeights.PR; // add PR
	mercRating += (item.getStatEx(sdk.stats.Vitality) + item.getStatEx(sdk.stats.MaxHp) + (item.getStatEx(sdk.stats.PerLevelHp) / 2048 * me.charlvl)) * mercWeights.HP; // add HP
	mercRating += sumElementalDmg(item) * mercWeights.ELEDMG; // add elemental damage
	mercRating += (item.getStatEx(sdk.stats.AbsorbFirePercent) + item.getStatEx(sdk.stats.AbsorbLightPercent) + item.getStatEx(sdk.stats.AbsorbMagicPercent) + item.getStatEx(sdk.stats.AbsorbColdPercent)) * mercWeights.ABS; // add absorb damage
	mercRating += item.getStatEx(sdk.stats.NormalDamageReduction) * mercWeights.DR; // add integer damage resist
	mercRating += item.getStatEx(sdk.stats.DamageResist) * mercWeights.DR * 2; // add damage resist %
	mercRating += item.getStatEx(sdk.stats.MagicDamageReduction) * mercWeights.MR; // add integer magic damage resist
	mercRating += item.getStatEx(sdk.stats.MagicResist) * mercWeights.MR * 2; // add magic damage resist %

	if (!myData) {
		myData = CharData.getStats();
	}

	switch (myData.merc.classid) {
	case sdk.mercs.Rogue:
	case sdk.mercs.IronWolf:
		mercRating += item.getStatEx(sdk.stats.MinDamage) * mercWeights.MINDMG; // add MIN damage
		mercRating += item.getStatEx(sdk.stats.MaxDamage) * mercWeights.MAXDMG; // add MAX damage

		break;
	case sdk.mercs.A5Barb:
		if ([item.getStatEx(sdk.stats.SecondaryMinDamage), item.getStatEx(sdk.stats.SecondaryMaxDamage)].includes(0)) {
			mercRating += item.getStatEx(sdk.stats.MinDamage) * mercWeights.MINDMG; // add MIN damage
			mercRating += item.getStatEx(sdk.stats.MaxDamage) * mercWeights.MAXDMG; // add MAX damage

			break;
		}
	// eslint-disable-next-line no-fallthrough
	case sdk.mercs.Guard:
	default:
		mercRating += item.getStatEx(sdk.stats.SecondaryMinDamage) * mercWeights.SECMINDMG;
		mercRating += item.getStatEx(sdk.stats.SecondaryMaxDamage) * mercWeights.SECMAXDMG;

		break;
	}

	if (!me.sorceress && !me.necromancer && !me.assassin) {
		mercRating += item.getStatEx(sdk.stats.SkillOnAttack, 4238) * mercWeights.CTCOAAMP; // add CTC amplify damage on attack
		mercRating += item.getStatEx(sdk.stats.SkillOnAttack, 4225) * mercWeights.CTCOAAMP; // add CTC amplify damage on attack (magic items)
		mercRating += item.getStatEx(sdk.stats.SkillOnAttack, 5583) * mercWeights.CTCOADECREP; // add CTC decrepify on attack
		mercRating += item.getStatEx(sdk.stats.SkillOnAttack, 5631) * mercWeights.CTCOADECREP; // add CTC decrepify on attack (magic items)
		mercRating += item.getStatEx(sdk.stats.SkillOnHit, 4238) * mercWeights.CTCOSAMP; // add CTC amplify damage on strikng
		mercRating += item.getStatEx(sdk.stats.SkillOnHit, 4225) * mercWeights.CTCOSAMP; // add CTC amplify damage on strikng (magic items)
		mercRating += item.getStatEx(sdk.stats.SkillOnHit, 5583) * mercWeights.CTCOSDECREP; // add CTC decrepify on strikng
		mercRating += item.getStatEx(sdk.stats.SkillOnHit, 5631) * mercWeights.CTCOSDECREP; // add CTC decrepify on strikng (magic items)
	}

	for (let x = 0; x < Config.Runewords.length; x += 1) {
		let [sockets, baseCID] = [Config.Runewords[x][0].length, Config.Runewords[x][1]];
		if (item.classid === baseCID && item.isBaseType && item.sockets === sockets && !item.isRuneword) return -1;
	}

	return mercRating;
};

const chargeditemscore = function (item, skillId, buildInfo) {
	if (!item) return 0;

	let tier = 0;
	!buildInfo && (buildInfo = Check.currentBuild());

	const chargedWeights = {
		Teleport: Pather.canTeleport() ? 0 : 5,
		Enchant: buildInfo.caster ? 0 : 10,
		InnerSight: me.amazon || buildInfo.caster ? 0 : 10,
		SlowMissiles: me.amazon ? 0 : 10,
	};

	let stats = item.getStat(-2);
	let chargedItems = [];

	if (stats.hasOwnProperty(sdk.stats.ChargedSkill)) {
		if (stats[sdk.stats.ChargedSkill] instanceof Array) {
			for (let i = 0; i < stats[sdk.stats.ChargedSkill].length; i++) {
				if (stats[sdk.stats.ChargedSkill][i] !== undefined) {
					chargedItems.push({
						skill: stats[sdk.stats.ChargedSkill][i].skill,
						level: stats[sdk.stats.ChargedSkill][i].level,
						charges: stats[sdk.stats.ChargedSkill][i].charges,
						maxcharges: stats[sdk.stats.ChargedSkill][i].maxcharges
					});
				}
			}
		} else {
			chargedItems.push({
				skill: stats[sdk.stats.ChargedSkill].skill,
				level: stats[sdk.stats.ChargedSkill].level,
				charges: stats[sdk.stats.ChargedSkill].charges,
				maxcharges: stats[sdk.stats.ChargedSkill].maxcharges
			});
		}
	}

	chargedItems = chargedItems.filter((v, i, a) => a.findIndex(el => ["skill", "level"].every(k => el[k] === v[k])) === i);

	if (skillId > 0) {
		chargedItems = chargedItems.filter(check => check.skill === skillId);
		chargedItems.forEach(el => tier += el.level * 5);
	} else {
		chargedItems.forEach(function (el) {
			try {
				let skillName = getSkillById(el.skill).split(" ").join("");
				if (skillName === "Teleport") {
					chargedWeights[skillName] > 0 && (tier += el.maxcharges * 2);
				} else if (!!chargedWeights[skillName]) {
					tier += el.level * chargedWeights[skillName];
				}
			} catch (e) {
				return;
			}
		});
	}

	return tier;
};

const tierWeights = {
	useHardcoreWeights: !!(me.hardcore),
	resistWeights: {
		FR: (this.useHardcoreWeights ? 5 : 3), // fire resist
		LR: (this.useHardcoreWeights ? 5 : 3), // lightning resist
		CR: (this.useHardcoreWeights ? 3 : 1.5), // cold resist
		PR: (this.useHardcoreWeights ? 5 : 1), // poison resist
		MAXFR: 5,
		MAXLR: 5,
		MAXCR: 3,
		MAXPR: 3,
		ABS: (this.useHardcoreWeights ? 5 : 3), // absorb damage (fire light magic cold)
		DR: (this.useHardcoreWeights ? 4 : 2), // Damage resist
		MR: 3, // Magic damage resist
	},

	generalWeights: {
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
	},
	
	casterWeights: {
		//breakpoint stats
		FCR: (me.assassin ? 2 : 5),
		IAS: (me.assassin ? 4 : 0),
		// regen
		HPREGEN: 2,
		MANAREGEN: 2.2,
	},
	
	meleeWeights: {
		// breakpoint stats - todo actually take breakpoints into account
		FCR: 0.5,
		IAS: 4,
		// Attack
		MINDMG: 3,
		MAXDMG: 3,
		SECMINDMG: 2,
		SECMAXDMG: 2,
		AVGDMG: 3,
		ELEDMG: 0.5,
		AR: 0.2,
		CB: 4,
		OW: 1,
		DS: 1.5,
		DMGTOUNDEAD: 0.5,
		DMGTODEMONS: 0.5,

		// leaching
		LL: 4,
		ML: 2,

		// regen
		HPREGEN: 2,
		MANAREGEN: 2,
	},
	
	ctcWeights: {
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
	},
	
	skillsWeights: {
		ALL: 200,
		CLASS: 175,
		TAB: 125,
		WANTED: 45,
		USEFUL: 30, // + wanted supportive skills
	},

	charmWeights: {
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
	}
};

const tierscore = function (item, bodyloc) {
	const buildInfo = Check.currentBuild();

	this.generalScore = function (item) {
		let generalRating = 0;
		let canTele = Pather.canTeleport();

		// get item body location
		let itembodyloc = Item.getBodyLoc(item);
		bodyloc === undefined && (bodyloc = itembodyloc.last()); // extract bodyloc from array
		
		// get item cbf stat from olditem equipped on body location
		let equippedItem = me.getItemsEx().filter((equipped) => equipped.isEquipped && equipped.bodylocation === bodyloc).first();

		if (!canTele && item.getStatEx(sdk.stats.CannotbeFrozen)) {
			// check if we have cbf but make sure its not from the item we are trying to un-equip
			let haveCBF = (me.getStat(sdk.stats.CannotbeFrozen) > 0 && !equippedItem.getStatEx(sdk.stats.CannotbeFrozen));
			// Cannot be frozen is very important for Melee chars
			!haveCBF && (generalRating += buildInfo.caster ? tierWeights.generalWeights.CBF : tierWeights.generalWeights.CBF * 4);
		}

		// faster run/walk
		!canTele && (generalRating += item.getStatEx(sdk.stats.FRW) * tierWeights.generalWeights.FRW);

		// belt slots
		item.itemType === sdk.items.type.Belt && (generalRating += Storage.BeltSize() * 4 * tierWeights.generalWeights.BELTSLOTS); // rows * columns * weight

		// start generalRating
		generalRating += item.getStatEx(sdk.stats.MagicBonus) * tierWeights.generalWeights.MF; // add magic find
		generalRating += item.getStatEx(sdk.stats.FHR) * tierWeights.generalWeights.FHR; // add faster hit recovery
		generalRating += item.getStatEx(sdk.stats.Defense) * tierWeights.generalWeights.DEF; //	add Defense
		generalRating += (item.getStatEx(sdk.stats.ToBlock) + item.getStatEx(sdk.stats.FBR)) * tierWeights.generalWeights.ICB; //add increased chance to block
		generalRating += (item.getStatEx(sdk.stats.Vitality) + item.getStatEx(sdk.stats.MaxHp) + (item.getStatEx(sdk.stats.PerLevelHp) / 2048 * me.charlvl)) * tierWeights.generalWeights.HP; // add HP
		generalRating += (item.getStatEx(sdk.stats.Energy) + item.getStatEx(sdk.stats.MaxMana) + (item.getStatEx(sdk.stats.PerLevelMana) / 2048 * me.charlvl)) * tierWeights.generalWeights.MANA;// add mana
		generalRating += item.getStatEx(sdk.stats.Strength) * tierWeights.generalWeights.STR; // add STR
		generalRating += item.getStatEx(sdk.stats.Dexterity) * tierWeights.generalWeights.DEX; // add DEX

		return generalRating;
	};

	this.resistScore = function (item) {
		let itembodyloc = Item.getBodyLoc(item);
		if (!itembodyloc) return 0;
		bodyloc === undefined && (bodyloc = itembodyloc.last()); // extract bodyloc from array

		let resistRating = 0;
		// current total resists
		let [currFR, currCR, currLR, currPR] = [me.fireRes, me.coldRes, me.lightRes, me.poisonRes];
		// get item resists stats from olditem equipped on body location
		let eqItem = me.getItemsEx().filter(equipped => equipped.isEquipped && equipped.bodylocation === bodyloc).first();
		let [olditemFR, olditemCR, olditemLR, olditemPR] = [0, 0, 0, 0];
		if (eqItem) {
			// equipped resists
			[olditemFR, olditemCR] = [eqItem.getStatEx(sdk.stats.FireResist), eqItem.getStatEx(sdk.stats.ColdResist)];
			[olditemLR, olditemPR] = [eqItem.getStatEx(sdk.stats.LightResist), eqItem.getStatEx(sdk.stats.PoisonResist)];
		}
		// subtract olditem resists from current total resists
		let [baseFR, baseCR, baseLR, basePR] = [(currFR - olditemFR), (currCR - olditemCR), (currLR - olditemLR), (currPR - olditemPR)];
		// if baseRes < max resists give score value upto max resists reached
		let maxRes = me.expansion ? 175 : 125;
		let [FRlimit, CRlimit, LRlimit, PRlimit] = [Math.max(maxRes - baseFR, 0), Math.max(maxRes - baseCR, 0), Math.max(maxRes - baseLR, 0), Math.max(maxRes - basePR, 0)];
		// get new item stats
		let [newitemFR, newitemCR] = [Math.max(item.getStatEx(sdk.stats.FireResist), 0), Math.max(item.getStatEx(sdk.stats.ColdResist), 0)];
		let [newitemLR, newitemPR] = [Math.max(item.getStatEx(sdk.stats.LightResist), 0), Math.max(item.getStatEx(sdk.stats.PoisonResist), 0)];
		// newitemRes upto reslimit
		let [effectiveFR, effectiveCR] = [Math.min(newitemFR, FRlimit), Math.min(newitemCR, CRlimit)];
		let [effectiveLR, effectivePR] = [Math.min(newitemLR, LRlimit), Math.min(newitemPR, PRlimit)];
		// sum resistRatings
		resistRating += effectiveFR * tierWeights.resistWeights.FR; // add fireresist
		resistRating += effectiveCR * tierWeights.resistWeights.CR; // add coldresist
		resistRating += effectiveLR * tierWeights.resistWeights.LR; // add literesist
		resistRating += effectivePR * tierWeights.resistWeights.PR; // add poisonresist
		// sum max resists weights
		resistRating += (item.getStatEx(sdk.stats.MaxFireResist) * tierWeights.resistWeights.MAXFR);
		resistRating += (item.getStatEx(sdk.stats.MaxLightResist) * tierWeights.resistWeights.MAXLR);
		resistRating += (item.getStatEx(sdk.stats.MaxColdResist) * tierWeights.resistWeights.MAXCR);
		resistRating += (item.getStatEx(sdk.stats.MaxPoisonResist) * tierWeights.resistWeights.MAXPR);
		// sum absorb and magic/damage reduction
		resistRating += (item.getStatEx(sdk.stats.AbsorbFirePercent) + item.getStatEx(sdk.stats.AbsorbLightPercent) + item.getStatEx(sdk.stats.AbsorbMagicPercent) + item.getStatEx(sdk.stats.AbsorbColdPercent)) * tierWeights.resistWeights.ABS; // add absorb damage
		resistRating += item.getStatEx(sdk.stats.NormalDamageReduction) * tierWeights.resistWeights.DR / 2; // add integer damage resist
		resistRating += item.getStatEx(sdk.stats.DamageResist) * tierWeights.resistWeights.DR * 2; // add damage resist %
		resistRating += item.getStatEx(sdk.stats.MagicDamageReduction) * tierWeights.resistWeights.MR / 2; // add integer magic damage resist
		resistRating += item.getStatEx(sdk.stats.MagicResist) * tierWeights.resistWeights.MR * 2; // add magic damage resist %

		return resistRating;
	};

	this.buildScore = function (item) {
		let buildRating = 0;
		let buildWeights = buildInfo.caster ? tierWeights.casterWeights : tierWeights.meleeWeights;

		me.amazon && item.getStatEx(sdk.stats.ReplenishQuantity) && (buildRating += 50);
		//!Pather.canTeleport() && item.getStatEx(sdk.stats.ChargedSkill, 3461) && (buildRating += 50);

		buildRating += item.getStatEx(sdk.stats.FCR) * buildWeights.FCR; // add FCR
		buildRating += item.getStatEx(sdk.stats.IAS) * buildWeights.IAS; // add IAS
		buildRating += item.getStatEx(sdk.stats.HpRegen) * buildWeights.HPREGEN; // add hp regeneration
		buildRating += item.getStatEx(sdk.stats.ManaRecovery) * buildWeights.MANAREGEN; // add mana recovery
		!item.isRuneword && (buildRating += (item.sockets * 10)); // priortize sockets

		// pierce/mastery's not sure how I want to weight this so for now just its base value
		buildInfo.usefulStats.forEach(stat => buildRating += item.getStatEx(stat));

		// Melee Specific
		if (!buildInfo.caster || Config.AttackSkill.includes(sdk.skills.Attack) || Config.LowManaSkill.includes(sdk.skills.Attack)) {
			let meleeRating = 0;
			let eleDmgModifer = [sdk.items.type.Ring, sdk.items.type.Amulet].includes(item.itemType) ? 2 : 1;

			item.getStatEx(sdk.stats.ReplenishDurability) && (meleeRating += 15);
			item.getStatEx(sdk.stats.IgnoreTargetDefense) && (meleeRating += 50);

			// should these be added and calc avg dmg instead?
			// Sometimes we replace good weps with 2-300 ED weps that may be high dmg but aren't as good as the item we replaced
			//buildRating += item.getStatEx(sdk.stats.MinDamage) * buildWeights.MINDMG; // add MIN damage
			//buildRating += item.getStatEx(sdk.stats.MaxDamage) * buildWeights.MAXDMG; // add MAX damage
			//buildRating += item.getStatEx(sdk.stats.SecondaryMinDamage) * buildWeights.SECMINDMG; // add MIN damage
			//buildRating += item.getStatEx(sdk.stats.SecondaryMaxDamage) * buildWeights.SECMAXDMG; // add MAX damage
			meleeRating += ((item.getStatEx(sdk.stats.MaxDamage) + item.getStatEx(sdk.stats.MinDamage)) / 2) * tierWeights.meleeWeights.AVGDMG;
			
			meleeRating += sumElementalDmg(item) * (tierWeights.meleeWeights.ELEDMG / eleDmgModifer); // add elemental damage
			meleeRating += item.getStatEx(sdk.stats.ToHit) * tierWeights.meleeWeights.AR; // add AR
			meleeRating += item.getStatEx(sdk.stats.CrushingBlow) * tierWeights.meleeWeights.CB; // add crushing blow
			meleeRating += item.getStatEx(sdk.stats.OpenWounds) * tierWeights.meleeWeights.OW; // add open wounds
			meleeRating += item.getStatEx(sdk.stats.DeadlyStrike) * tierWeights.meleeWeights.DS; // add deadly strike
			meleeRating += item.getStatEx(sdk.stats.LifeLeech) * tierWeights.meleeWeights.LL; // add LL
			meleeRating += item.getStatEx(sdk.stats.ManaDrainMinDamage) * tierWeights.meleeWeights.ML; // add ML
			meleeRating += item.getStatEx(sdk.stats.SkillOnAura, sdk.skills.Sanctuary) * 25; // sanctuary aura
			meleeRating += item.getStatEx(sdk.stats.DemonDamagePercent) * tierWeights.meleeWeights.DMGTODEMONS; // add damage % to demons
			meleeRating += item.getStatEx(sdk.stats.UndeadDamagePercent) * tierWeights.meleeWeights.DMGTOUNDEAD; // add damage % to undead
			
			buildRating += (buildInfo.caster ? (meleeRating / 2) : meleeRating);
		}

		return buildRating;
	};

	this.skillsScore = function (item) {
		let skillsRating = 0;
		let weaponModifer = !buildInfo.caster && item.getItemType() === "Weapon" ? 4 : 1;

		skillsRating += item.getStatEx(sdk.stats.AllSkills) * (tierWeights.skillsWeights.ALL / weaponModifer); // + all skills
		skillsRating += item.getStatEx(sdk.stats.AddClassSkills, me.classid) * (tierWeights.skillsWeights.CLASS / weaponModifer); // + class skills
		skillsRating += item.getStatEx(sdk.stats.AddSkillTab, buildInfo.tabSkills) * (tierWeights.skillsWeights.TAB / weaponModifer); // + TAB skills
		let selectedWeights = [tierWeights.skillsWeights.WANTED, tierWeights.skillsWeights.USEFUL];
		let selectedSkills = [buildInfo.wantedSkills, buildInfo.usefulSkills];

		for (let i = 0; i < selectedWeights.length; i++) {
			for (let j = 0; j < selectedSkills.length; j++) {
				for (let k = 0; k < selectedSkills[j].length; k++) {
					skillsRating += item.getStatEx(107, selectedSkills[j][k]) * selectedWeights[i];
				}
			}
		}

		// Spirit Fix for barb
		(item.prefixnum === sdk.locale.items.Spirit && !buildInfo.caster) && (skillsRating -= 400);

		return skillsRating;
	};

	this.ctcScore = function (item) {
		// chance to cast doesn't exist in classic
		if (me.classic) return 0;

		let ctcRating = 0, ctcItems = [];
		let stats = item.getStat(-2);
		let meleeCheck = !buildInfo.caster;

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

		ctcItems = ctcItems.filter((v, i, a) => a.findIndex(el => ["ctcType", "skill"].every(k => el[k] === v[k])) === i);

		for (let i = 0; i < ctcItems.length; i++) {
			try {
				let skillName = getSkillById(ctcItems[i].skill).split(" ").join("");
				if (!!tierWeights.ctcWeights.skills[skillName]) {
					switch (ctcItems[i].ctcType) {
					case sdk.stats.SkillOnAttack:
						ctcRating += (meleeCheck ? ctcItems[i].level * tierWeights.ctcWeights.skills[skillName] * tierWeights.ctcWeights.onAttack : 0);
						break;
					case sdk.stats.SkillOnStrike:
						ctcRating += (meleeCheck ? ctcItems[i].level * tierWeights.ctcWeights.skills[skillName] * tierWeights.ctcWeights.onStrike : 0);
						break;
					case sdk.stats.SkillWhenStruck:
						ctcRating += ctcItems[i].level * tierWeights.ctcWeights.skills[skillName] * tierWeights.ctcWeights.whenStruck;
						break;
					default:
						break;
					}
				}
			} catch (e) {
				console.log(e);
			}
		}

		return ctcRating;
	};

	let tier = 1; // set to 1 for native autoequip to use items.
	tier += this.generalScore(item);
	tier += this.resistScore(item);
	tier += this.buildScore(item);
	tier += this.skillsScore(item);
	tier += this.ctcScore(item);
	tier += chargeditemscore(item, -1, buildInfo);

	for (let x = 0; x < Config.Runewords.length; x += 1) {
		let [sockets, baseCID] = [Config.Runewords[x][0].length, Config.Runewords[x][1]];
		if (item.classid === baseCID && item.isBaseType && item.sockets === sockets && !item.isRuneword && !item.getItemsEx().length) return -1;
	}

	return item.questItem ? -1 : tier;
};

const secondaryscore = function (item) {
	let tier = 0;

	tier += item.getStatEx(sdk.stats.AllSkills) * 200; // + all skills
	tier += item.getStatEx(sdk.stats.AddClassSkills, me.classid) * 100; // + class skills
	tier += item.getStatEx(sdk.stats.AddSkillTab, Check.finalBuild().tabSkills) * 75; // + TAB skills
	let precastSkills = [Check.finalBuild().precastSkills];

	for (let i = 0; i < precastSkills.length; i++) {
		tier += item.getStatEx(107, precastSkills[i]) * 50;
	}

	tier += item.getStatEx(sdk.stats.FCR) * 5; // add FCR
	tier += item.getStatEx(sdk.stats.FHR) * 3; // add faster hit recovery

	return tier;
};

const charmscore = function (item) {
	if (myData.me.charmGids.includes(item.gid)) return 1000;
	let charmRating = 1;
	let skillerStats = [
		[sdk.skills.tabs.BowandCrossbow, sdk.skills.tabs.PassiveandMagic, sdk.skills.tabs.JavelinandSpear],
		[sdk.skills.tabs.Fire, sdk.skills.tabs.Lightning, sdk.skills.tabs.Cold],
		[sdk.skills.tabs.Curses, sdk.skills.tabs.PoisonandBone, sdk.skills.tabs.NecroSummoning],
		[sdk.skills.tabs.PalaCombat, sdk.skills.tabs.Offensive, sdk.skills.tabs.Defensive],
		[sdk.skills.tabs.BarbCombat, sdk.skills.tabs.Masteries, sdk.skills.tabs.Warcries],
		[sdk.skills.tabs.DruidSummon, sdk.skills.tabs.ShapeShifting, sdk.skills.tabs.Elemental],
		[sdk.skills.tabs.Traps, sdk.skills.tabs.ShadowDisciplines, sdk.skills.tabs.MartialArts]
	][me.classid];
	if (!item.unique && item.classid === sdk.items.GrandCharm && !skillerStats.some(s => item.getStatEx(sdk.stats.AddSkillTab, s))) return -1;
	const buildInfo = Check.currentBuild();

	charmRating += item.getStatEx(sdk.stats.AddSkillTab, buildInfo.tabSkills) * tierWeights.charmWeights.TAB; // + TAB skills
	charmRating += item.getStatEx(sdk.stats.FireResist) * tierWeights.charmWeights.FR; // add FR
	charmRating += item.getStatEx(sdk.stats.ColdResist) * tierWeights.charmWeights.CR; // add CR
	charmRating += item.getStatEx(sdk.stats.LightResist) * tierWeights.charmWeights.LR; // add LR
	charmRating += item.getStatEx(sdk.stats.PoisonResist) * tierWeights.charmWeights.PR; // add PR
	charmRating += item.getStatEx(sdk.stats.FRW) * tierWeights.charmWeights.FRW; // add faster run walk
	charmRating += item.getStatEx(sdk.stats.FHR) * tierWeights.charmWeights.FHR; // add faster hit recovery
	charmRating += item.getStatEx(sdk.stats.Defense) * tierWeights.charmWeights.DEF; //	add Defense
	charmRating += item.getStatEx(sdk.stats.MagicBonus) * tierWeights.charmWeights.MF; // add magic find
	charmRating += (item.getStatEx(sdk.stats.Vitality) + item.getStatEx(sdk.stats.MaxHp) + (item.getStatEx(sdk.stats.PerLevelHp) / 2048 * me.charlvl)) * tierWeights.charmWeights.HP; // add HP
	charmRating += (item.getStatEx(sdk.stats.Energy) + item.getStatEx(sdk.stats.MaxMana) + (item.getStatEx(sdk.stats.PerLevelMana) / 2048 * me.charlvl)) * tierWeights.charmWeights.MANA;// add mana
	charmRating += item.getStatEx(sdk.stats.Strength) * tierWeights.charmWeights.STR; // add STR
	charmRating += item.getStatEx(sdk.stats.Dexterity) * tierWeights.charmWeights.DEX; // add DEX

	if (!buildInfo.caster) {
		charmRating += item.getStatEx(sdk.stats.MinDamage) * 3; // add MIN damage
		charmRating += item.getStatEx(sdk.stats.MaxDamage) * 3; // add MAX damage
		charmRating += sumElementalDmg(item); // add elemental damage 
		charmRating += item.getStatEx(sdk.stats.ToHit) * 0.5; // add AR
	}

	// Gheeds, Torch, annhi
	if (item.unique) {
		charmRating += item.getStatEx(sdk.stats.AllSkills) * tierWeights.charmWeights.ALL; // + all skills
		charmRating += item.getStatEx(sdk.stats.AddClassSkills, me.classid) * tierWeights.charmWeights.CLASS; // + class skills
		charmRating += item.getStatEx(sdk.stats.GoldBonus); // add gold find
		charmRating += item.getStatEx(sdk.stats.ReducedPrices) * 1.5; // add reduced vendor prices
		charmRating += item.getStatEx(sdk.stats.Strength); // add STR
	}

	return charmRating;
};
