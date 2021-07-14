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
		FR: 2, // fire resist
		LR: 2, // lightning resist
		CR: 1.5, // cold resist
		PR: 1, // poison resist
		ABS: 2.7 // absorb damage (fire light magic cold)
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
	};

	var casterWeights = {
		//breakpoint stats
		FCR: 5,
		IAS: 0,
		// Attack
		MINDMG:	0, // min damage
		MAXDMG: 0, // max damage
		SECMINDMG: 0, // secondary min damage
		SECMAXDMG: 0, // secondary max damage
		ELEDMG: 0, // elemental damage
		AR:	0, // attack rating
		CB: 0, // crushing blow
		OW: 0, // open wounds
		// leaching
		LL:	0, //lifeleach
		ML:	0, //manaleach
		// regen
		HPREGEN: 2,
		MANAREGEN: 2.2,
	};

	var meleeWeights = {
		//breakpoint stats
		FCR: 1,
		IAS: 3.5,
		// Attack
		MINDMG:	3, // min damage
		MAXDMG: 3, // max damage
		SECMINDMG: 2, // secondary min damage
		SECMAXDMG: 2, // secondary max damage
		ELEDMG: 1, // elemental damage
		AR:	0.5, // attack rating
		CB: 3, // crushing blow
		OW: 3, // open wounds
		// leaching
		LL: 1.5, //lifeleach
		ML:	1.5, //manaleach
		// regen
		HPREGEN: 2,
		MANAREGEN: 2,
		// CTC on attack
		CTCOANOVA: 5,
		CTCOAFNOVA: 10,
		CTCOAAMP: 5,
		CTCOADECREP: 10,
		// CTC on striking
		CTCOSNOVA: 3,
		CTCOSFNOVA: 8,
		CTCOSAMP: 3,
		CTCOSDECREP: 8,
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
				cbfRating = generalWeights.CBF;
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

		resistRating += (item.getStatEx(142) + item.getStatEx(144) + item.getStatEx(146) + item.getStatEx(148)) * resistWeights.ABS; // add absorb damage

		return resistRating;
	};

	this.buildScore = function (item) {
		var buildWeights = Check.currentBuild().caster ? casterWeights : meleeWeights;

		if (me.amazon === 0) {
			if (item.getStatEx(253)) {
				buildRating += 50;
			}
		}

		let buildRating = 0;
		buildRating += item.getStatEx(105) * buildWeights.FCR; // add FCR
		buildRating += item.getStatEx(93) * buildWeights.IAS; // add IAS
		buildRating += item.getStatEx(21) * buildWeights.MINDMG; // add MIN damage
		buildRating += item.getStatEx(22) * buildWeights.MAXDMG; // add MAX damage
		buildRating += item.getStatEx(23) * buildWeights.SECMINDMG; // add MIN damage
		buildRating += item.getStatEx(24) * buildWeights.SECMAXDMG; // add MAX damage
		buildRating += (item.getStatEx(48) + item.getStatEx(49) + item.getStatEx(50) + item.getStatEx(51) + item.getStatEx(52) + item.getStatEx(53) + item.getStatEx(54) + item.getStatEx(55) + (item.getStatEx(57) * 125 / 256)) * buildWeights.ELEDMG; // add elemental damage PSN damage adjusted for damage per frame (125/256)
		buildRating += item.getStatEx(19) * buildWeights.AR; // add AR
		buildRating += item.getStatEx(136) * buildWeights.CB; // add crushing blow
		buildRating += item.getStatEx(135) * buildWeights.OW; // add open wounds
		buildRating += item.getStatEx(60) * buildWeights.LL; // add LL
		buildRating += item.getStatEx(62) * buildWeights.ML; // add ML
		buildRating += item.getStatEx(74) * buildWeights.HPREGEN; // add hp regeneration
		buildRating += item.getStatEx(26) * buildWeights.MANAREGEN; // add mana recovery

		// Melee Specific
		if (!Check.currentBuild().caster) {
			buildRating += item.getStatEx(195, 3135) * buildWeights.CTCOANOVA; // add CTC nova on attack
			buildRating += item.getStatEx(195, 2879) * buildWeights.CTCOAFNOVA; // add CTC frost nova on attack
			buildRating += item.getStatEx(195, 4225) * buildWeights.CTCOAAMP; // add CTC amplify damage on attack
			buildRating += item.getStatEx(195, 5631) * buildWeights.CTCOADECREP; // add CTC decrepify on attack
			buildRating += item.getStatEx(198, 3135) * buildWeights.CTCOSNOVA; // add CTC nova on strikng
			buildRating += item.getStatEx(198, 2879) * buildWeights.CTCOSFNOVA; // add CTC frost nova on strikng
			buildRating += item.getStatEx(198, 4225) * buildWeights.CTCOSAMP; // add CTC amplify damage on strikng
			buildRating += item.getStatEx(198, 5631) * buildWeights.CTCOSDECREP; // add CTC decrepify on strikng

		}

		return buildRating;
	},

	this.skillsScore = function (item) {
		let skillsRating = 0;
		skillsRating += item.getStatEx(127) * skillsWeights.ALL; // + all skills
		skillsRating += item.getStatEx(83, me.classid) * skillsWeights.CLASS; // + class skills
		skillsRating += item.getStatEx(188, Check.currentBuild().tabSkills) * skillsWeights.TAB; // + TAB skills
		let selectedWeights = [skillsWeights.WANTED, skillsWeights.USEFUL];
		let selectedSkills = [Check.currentBuild().wantedSkills, Check.currentBuild().usefulSkills];

		for (let i = 0; i < selectedWeights.length; i++) {
			for (let j = 0; j < selectedSkills.length; j++) {
				for (let k = 0; k < selectedSkills[j].length; k++) {
					skillsRating += item.getStatEx(107, selectedSkills[j][k]) * selectedWeights[i];
				}
			}
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

	return tier;
};

var charmscore = function (item) {
	let generalWeights = {
		ALL:	180, // + all skills
		CLASS:	175, // + class tab
		TAB: 300, // + skill tab
		FR: 2, // fire resist
		LR: 2, // lightning resist
		CR: 2, // cold resist
		PR: 1, // poison resist
		FRW: 1, // faster run/walk
		FHR: 2, // faster hit recovery
		DEF: 0.05, // defense
		MF: 2, //Magic Find
		// base stats
		HP:	1.75,
		MANA: 0.8,
		STR: 1.0,
		DEX: 1.0,
	};

	let charmRating = 0;
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
