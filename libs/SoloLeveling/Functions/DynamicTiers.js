/*
*	@filename	DynamicTiers.js
*	@author		isid0re, theBGuy
*	@desc		Dynamic tiers calculators for SoloLeveling
*/

var mercscore = function (item) {
	var mercWeights = {
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

	let rwBase;

	for (let x = 0; x < Config.Runewords.length; x += 1) {
		let sockets = Config.Runewords[x][0].length;
		let baseCID = Config.Runewords[x][1];

		if (item.classid === baseCID && item.quality < 4 && item.getStat(194) === sockets && !item.getFlag(NTIPAliasFlag["runeword"])) {
			rwBase = true;
		}
	}

	if (rwBase) {
		mercRating = -1;
	}

	return mercRating;
};

var tierscore = function (item) {
	var resistWeights = {
		FR: 3, // fire resist
		LR: 3, // lightning resist
		CR: 1.5, // cold resist
		PR: 1, // poison resist
		ABS: 2.7, // absorb damage (fire light magic cold)
		DR: 2, // Damage resist
		MR: 3, // Magic damage resist
	};

	var generalWeights = {
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
		// CTC when struck
		CTCWSNOVA: 5,
		CTCWSFNOVA: 10,
		CTCWSFADE: 20,
		CTCWSHOWL: 10,
		CTCWSBARMOR: 10,
		CTCWSCARMOR: 10,
	};

	var casterWeights = {
		//breakpoint stats
		FCR: 5,
		IAS: (me.assassin ? 4 : 0),
		// regen
		HPREGEN: 2,
		MANAREGEN: 2.2,
	};

	var meleeWeights = {
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
		// CTC on attack
		CTCOANOVA: 5,
		CTCOAFNOVA: 10,
		CTCOAAMP: 5,
		CTCOADECREP: 10,
		CTCOAGSPIKE: 4,
		CTCOACHAINLIGHT: 10,
		// CTC on striking
		CTCOSNOVA: 3,
		CTCOSFNOVA: 8,
		CTCOSAMP: 3,
		CTCOSDECREP: 8,
		CTCOSLIFETAP: 8,
		CTCOSVENOM: 10,
		CTCOSFORB: 8,
		CTCOSIBLAST: 4,
		CTCOSGSPIKE: 4,
		CTCOSBONESPEAR: 10,
		CTCOSBONESPIRIT: 10,
		CTCOSPNOVA: 10,
		CTCOSSTATIC: 10,
		CTCOSCHAINLIGHT: 10,
		CTCOSCHARGEDBOLT: 10,
		CTCOSTAUNT: 10,
		CTCOSTWISTER: 10,
	};

	var skillsWeights = {
		ALL: 200, // + all skills
		CLASS: 175, // + class tab
		TAB: 125, // + skill tab
		WANTED: 45, // + wanted key skills
		USEFUL: 30, // + wanted supportive skills
	};

	this.generalScore = function (item) {
		// cannot be frozen
		let cbfItem = NTIPAliasStat["itemcannotbefrozen"],
			cbfRating = 0,
			needsCBF = !me.getSkill(54, 0),
			body = me.getItems()
				.filter(item => [1].indexOf(item.location) > -1 ) // limit search to equipped body parts
				.sort((a, b) => a.bodylocation - b.bodylocation); // Sort on body, low to high.

		if (needsCBF && item.getStatEx(cbfItem)) {
			let haveCBF = false;

			for (let part = 0; part < body.length; part++) { // total 10 body slots
				if (body[part].getStatEx(cbfItem)) {
					if (item.gid === body[part].gid) {
						break;
					}

					haveCBF = true;

					break;
				}
			}

			if (!haveCBF) {
				cbfRating = Check.currentBuild().caster ? generalWeights.CBF : generalWeights.CBF * 4;	// Cannot be frozen is very important for Melee chars
			}
		}

		// faster run/walk
		let frwRating = 0,
			needsFrw = !me.getSkill(54, 0); // value FRW if no teleport

		if (needsFrw) {
			frwRating = item.getStatEx(96) * generalWeights.FRW;
		}

		// belt slots
		let beltRating = 0,
			isBelt = item.itemType === 19; // check if belt

		if (isBelt) {
			beltRating = Storage.BeltSize() * 4 * generalWeights.BELTSLOTS; // rows * columns * weight
		}

		//start generalRating
		let generalRating = 0;
		generalRating += cbfRating; // add cannot be frozen
		generalRating += frwRating; // add faster run walk
		generalRating += beltRating; // add belt slots
		generalRating += item.getStatEx(80) * generalWeights.MF; // add magic find
		generalRating += item.getStatEx(99) * generalWeights.FHR; // add faster hit recovery
		generalRating += item.getStatEx(31) * generalWeights.DEF; //	add Defense
		generalRating += (item.getStatEx(20) + item.getStatEx(102)) * generalWeights.ICB; //add increased chance to block
		generalRating += (item.getStatEx(3) + item.getStatEx(7) + (item.getStatEx(216) / 2048 * me.charlvl)) * generalWeights.HP; // add HP
		generalRating += (item.getStatEx(1) + item.getStatEx(9) + (item.getStatEx(217) / 2048 * me.charlvl)) * generalWeights.MANA;// add mana
		generalRating += item.getStatEx(0) * generalWeights.STR; // add STR
		generalRating += item.getStatEx(2) * generalWeights.DEX; // add DEX
		generalRating += item.getStatEx(201, 3135) * generalWeights.CTCWSNOVA; // add CTC nova when struck
		generalRating += item.getStatEx(201, 3076) * generalWeights.CTCWSNOVA; // add CTC nova when struck (magic items)
		generalRating += item.getStatEx(201, 2838) * generalWeights.CTCWSFNOVA; // add CTC frost nova when struck
		generalRating += item.getStatEx(201, 2879) * generalWeights.CTCWSFNOVA; // add CTC frost nova when struck (magic items)
		generalRating += item.getStatEx(201, 17103) * generalWeights.CTCWSFADE; // add CTC fade when struck
		generalRating += item.getStatEx(201, 8321) * generalWeights.CTCWSHOWL; // add CTC howl when struck
		generalRating += item.getStatEx(201, 4362) * generalWeights.CTCWSBARMOR; // add CTC bone armor when struck
		generalRating += item.getStatEx(201, 15055) * generalWeights.CTCWSCARMOR; // add CTC cyclone armor when struck

		return generalRating;
	};

	this.resistScore = function (item) {
		let resistRating = 0;
		// current total resists
		let currFR = me.getStat(39); // current fire resist
		let currCR = me.getStat(43); // current cold resist
		let currLR = me.getStat(41); // current lite resist
		let currPR = me.getStat(45); // current poison resist
		// get item body location
		let itembodyloc = Item.getBodyLoc(item);

		if (!itembodyloc) {
			return resistRating;
		}

		if (item.itemType !== 10) {		// Temp fix for ring-loop is to just not do this for rings
			let bodyloc = itembodyloc[0]; // extract bodyloc from array
			// get item resists stats from olditem equipped on body location
			let equippedItems = me.getItems()
				.filter(item =>
					item.bodylocation === bodyloc // filter equipped items to body location
					&& [1].indexOf(item.location) > -1); // limit search to equipped body parts
			let oldItem = equippedItems[0]; // extract oldItem from array
			let olditemFR = oldItem !== undefined ? oldItem.getStatEx(39) : 0; // equipped fire resist
			let olditemCR = oldItem !== undefined ? oldItem.getStatEx(43) : 0; // equipped cold resist
			let olditemLR = oldItem !== undefined ? oldItem.getStatEx(41) : 0; // equipped lite resist
			let olditemPR = oldItem !== undefined ? oldItem.getStatEx(45) : 0; // equipped poison resist
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
		}

		if (item.itemType === 10) {		// Ringss
			resistRating += item.getStatEx(39) * resistWeights.FR; // add fireresist
			resistRating += item.getStatEx(43) * resistWeights.CR; // add coldresist
			resistRating += item.getStatEx(41) * resistWeights.LR; // add literesist
			resistRating += item.getStatEx(35) * resistWeights.PR; // add poisonresist
		}

		resistRating += (item.getStatEx(142) + item.getStatEx(144) + item.getStatEx(146) + item.getStatEx(148)) * resistWeights.ABS; // add absorb damage
		resistRating += item.getStatEx(34) * resistWeights.DR; // add integer damage resist
		resistRating += item.getStatEx(36) * resistWeights.DR * 2; // add damage resist %
		resistRating += item.getStatEx(35) * resistWeights.MR; // add integer magic damage resist
		resistRating += item.getStatEx(37) * resistWeights.MR * 2; // add magic damage resist %

		return resistRating;
	};

	this.buildScore = function (item) {
		var buildWeights = Check.currentBuild().caster ? casterWeights : meleeWeights;

		if (me.amazon) {
			if (item.getStatEx(253)) {
				buildRating += 50;
			}
		}

		let buildRating = 0;
		buildRating += item.getStatEx(105) * buildWeights.FCR; // add FCR
		buildRating += item.getStatEx(93) * buildWeights.IAS; // add IAS
		buildRating += item.getStatEx(74) * buildWeights.HPREGEN; // add hp regeneration
		buildRating += item.getStatEx(26) * buildWeights.MANAREGEN; // add mana recovery

		// Melee Specific
		if (!Check.currentBuild().caster) {
			if (item.getStatEx(252)) {	// replenish durabilty, really only matters for non-casters
				buildRating += 15;
			}

			if (item.getStatEx(115)) {	// ignore target defense, really only matters for non-casters
				buildRating += 50;
			}

			let eleDmgModifer = [10, 12].indexOf(item.itemType) > -1 ? 2 : 1;	// Rings and Amulets

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

			buildRating += item.getStatEx(195, 3135) * buildWeights.CTCOANOVA; // add CTC nova on attack
			buildRating += item.getStatEx(195, 3076) * buildWeights.CTCOANOVA; // add CTC nova on attack (magic items)
			buildRating += item.getStatEx(195, 2838) * buildWeights.CTCOAFNOVA; // add CTC frost nova on attack
			buildRating += item.getStatEx(195, 2879) * buildWeights.CTCOAFNOVA; // add CTC frost nova on attack (magic items)
			buildRating += item.getStatEx(195, 4238) * buildWeights.CTCOAAMP; // add CTC amplify damage on attack
			buildRating += item.getStatEx(195, 4225) * buildWeights.CTCOAAMP; // add CTC amplify damage on attack (magic items)
			buildRating += item.getStatEx(195, 5583) * buildWeights.CTCOADECREP; // add CTC decrepify on attack
			buildRating += item.getStatEx(195, 5631) * buildWeights.CTCOADECREP; // add CTC decrepify on attack (magic items)
			buildRating += item.getStatEx(195, 3538) * buildWeights.CTCOAGSPIKE; // add CTC glacial spike on attack
			buildRating += item.getStatEx(195, 3409) * buildWeights.CTCOACHAINLIGHT; // add CTC chain light on attack
			buildRating += item.getStatEx(195, 3412) * buildWeights.CTCOACHAINLIGHT; // add CTC chain light on attack (magic items)

			buildRating += item.getStatEx(198, 3135) * buildWeights.CTCOSNOVA; // add CTC nova on strikng
			buildRating += item.getStatEx(198, 3076) * buildWeights.CTCOSNOVA; // add CTC nova on strikng (magic items)
			buildRating += item.getStatEx(198, 2838) * buildWeights.CTCOSFNOVA; // add CTC frost nova on strikng
			buildRating += item.getStatEx(198, 2879) * buildWeights.CTCOSFNOVA; // add CTC frost nova on strikng (magic items)
			buildRating += item.getStatEx(198, 4238) * buildWeights.CTCOSAMP; // add CTC amplify damage on strikng
			buildRating += item.getStatEx(198, 4225) * buildWeights.CTCOSAMP; // add CTC amplify damage on strikng (magic items)
			buildRating += item.getStatEx(198, 5583) * buildWeights.CTCOSDECREP; // add CTC decrepify on strikng
			buildRating += item.getStatEx(198, 5631) * buildWeights.CTCOSDECREP; // add CTC decrepify on strikng (magic items)
			buildRating += item.getStatEx(198, 5266) * buildWeights.CTCOSLIFETAP; // add CTC life tap on strikng
			buildRating += item.getStatEx(198, 17807) * buildWeights.CTCOSVENOM; // add CTC venom on strikng
			buildRating += item.getStatEx(198, 4109) * buildWeights.CTCOSFORB; // add CTC frozen orb on strikng
			buildRating += item.getStatEx(198, 4099) * buildWeights.CTCOSFORB; // add CTC frozen orb on strikng (magic items)
			buildRating += item.getStatEx(198, 2900) * buildWeights.CTCOSIBLAST; // add CTC ice blast on strikng
			buildRating += item.getStatEx(198, 3538) * buildWeights.CTCOSGSPIKE; // add CTC glacial spike on strikng
			buildRating += item.getStatEx(198, 5394) * buildWeights.CTCOSBONESPEAR; // add CTC bone spirit on strikng
			buildRating += item.getStatEx(198, 5972) * buildWeights.CTCOSBONESPIRIT; // add CTC bone spirit on strikng
			buildRating += item.getStatEx(198, 5908) * buildWeights.CTCOSPNOVA; // add CTC poison nova on strikng
			buildRating += item.getStatEx(198, 5892) * buildWeights.CTCOSPNOVA; // add CTC poison nova on strikng (magic items)
			buildRating += item.getStatEx(198, 2701) * buildWeights.CTCOSSTATIC; // add CTC static on strikng
			buildRating += item.getStatEx(198, 3409) * buildWeights.CTCOSCHAINLIGHT; // add CTC chain light on strikng
			buildRating += item.getStatEx(198, 3412) * buildWeights.CTCOSCHAINLIGHT; // add CTC chain light on strikng (magic items)
			buildRating += item.getStatEx(198, 2441) * buildWeights.CTCOSCHARGEDBOLT; // add CTC charged bolt on strikng
			buildRating += item.getStatEx(198, 8769) * buildWeights.CTCOSTAUNT; // add CTC taunt on strikng
			buildRating += item.getStatEx(198, 15375) * buildWeights.CTCOSTWISTER; // add CTC twister on strikng

		}

		return buildRating;
	},

	this.skillsScore = function (item) {
		let skillsRating = 0;
		let weaponModifer = !Check.currentBuild().caster && [24, 25, 26, 27, 28, 29, 30, 31, 32, 33, 34, 35, 36].indexOf(item.itemType) ? 4 : 1;

		skillsRating += item.getStatEx(127) * (skillsWeights.ALL / weaponModifer); // + all skills
		skillsRating += item.getStatEx(83, me.classid) * (skillsWeights.CLASS / weaponModifer); // + class skills
		skillsRating += item.getStatEx(188, Check.currentBuild().tabSkills) * (skillsWeights.TAB / weaponModifer); // + TAB skills
		let selectedWeights = [skillsWeights.WANTED, skillsWeights.USEFUL];
		let selectedSkills = [Check.currentBuild().wantedSkills, Check.currentBuild().usefulSkills];

		for (let i = 0; i < selectedWeights.length; i++) {
			for (let j = 0; j < selectedSkills.length; j++) {
				for (let k = 0; k < selectedSkills[j].length; k++) {
					skillsRating += item.getStatEx(107, selectedSkills[j][k]) * selectedWeights[i];
				}
			}
		}

		if (item.prefixnum === 20635 && !Check.currentBuild().caster) {		// Spirit Fix
			skillsRating -= 400;
		}

		return skillsRating;
	};

	let tier = 1; // set to 1 for native autoequip to use items.
	tier += this.generalScore(item);
	tier += this.resistScore(item);
	tier += this.buildScore(item);
	tier += this.skillsScore(item);

	let rwBase; // don't score runeword base armors
	let questItem, itemsList = [521, 92, 173, 174, 90]; // don't score viper amulet, staff of kings, khalim's flail, hellforge hammer

	for (let y = 0; y < itemsList.length; y += 1) {
		if (item.classid === itemsList[y]) {
			questItem = true;
		}
	}

	for (let x = 0; x < Config.Runewords.length; x += 1) {
		let sockets = Config.Runewords[x][0].length;
		let baseCID = Config.Runewords[x][1];

		if (item.classid === baseCID && item.quality < 4 && item.getStat(194) === sockets && !item.getFlag(NTIPAliasFlag["runeword"])) {
			rwBase = true;
		}
	}

	if (rwBase || questItem) {
		tier = -1;
	}

	return tier;
};

var secondaryscore = function (item) {
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

var chargeditemscore = function (item, skillId) {
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

var charmscore = function (item) {
	let generalWeights = {
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
