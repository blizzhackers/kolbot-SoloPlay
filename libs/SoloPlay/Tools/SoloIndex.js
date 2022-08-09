/**
*  @filename    SoloIndex.js
*  @author      theBGuy
*  @desc        Script index of SoloPlay
*
*/

const SoloIndex = {
	// this controls the order
	scripts: [
		// Act 1
		"corpsefire", "den", "bishibosh", "bloodraven", "tristram", "treehead",
		"countess", "smith", "pits", "jail", "boneash", "andariel", "a1chests", "cows",
		// Act 2
		"cube", "radament", "amulet", "summoner", "tombs", "ancienttunnels", "staff", "duriel",
		// Act 3
		"lamessen", "templeruns", "lowerkurast", "eye", "heart", "brain", "travincal", "mephisto",
		// Act 4
		"izual", "hellforge", "river", "hephasto", "diablo",
		// Act 5
		"shenk", "savebarby", "anya", "ancients", "baal", "a5chests",
	],

	index: {
		"corpsefire": {
			preReq: function () {
				return (me.den && me.hell);
			},
			skipIf: function () {
				return (me.druid && me.paladin);
			},
			shouldRun: function () {
				if (!this.preReq() || this.skipIf()) return false;
				return (!me.andariel || Check.brokeAf());
			}
		},
		"den": {
			skipIf: function () {
				return me.den;
			},
			shouldRun: function () {
				if (this.skipIf()) return false;
				return true;
			}
		},
		"bishibosh": {
			preReq: function () {
				return false; // figure out if this would be good to run
				// return me.normal && me.charlvl < 6;
			},
			skipIf: function () {
				return me.sorceress;
			},
			shouldRun: function () {
				if (!this.preReq() || this.skipIf()) return false;
				return true;
			}
		},
		"bloodraven": {
			skipIf: function () {
				// too many light immunes - although come back to this cause maybe just kill raven
				return ["Lightning", "Trapsin", "Javazon"].includes(SetUp.currentBuild);
			},
			shouldRun: function () {
				switch (me.diff) {
				case sdk.difficulty.Normal:
					return !me.bloodraven || (!me.summoner && Check.brokeAf()) || (!me.tristram && me.barbarian);
				case sdk.difficulty.Nightmare:
					return !me.bloodraven;
				case sdk.difficulty.Hell:
					return !this.skipIf();
				}
				return false;
			}
		},
		"tristram": {
			skipIf: function () {
				switch (me.classid) {
				case sdk.player.class.Paladin:
					return Pather.accessToAct(3) || Attack.auradin || me.checkItem({name: sdk.locale.items.Enigma}).have;
				case sdk.player.class.Barbarian:
					return Pather.accessToAct(3) || me.checkItem({name: sdk.locale.items.Lawbringer}).have;
				}
				return false;
			},
			shouldRun: function () {
				switch (me.diff) {
				case sdk.difficulty.Normal:
					return (!me.tristram || me.charlvl < (me.barbarian ? 6 : 12) || Check.brokeAf());
				case sdk.difficulty.Nightmare:
				case sdk.difficulty.Hell:
					return (!me.tristram && me.diffCompleted) || !this.skipIf();
				}
				return false;
			}
		},
		"treehead": {
			preReq: function () {
				return me.hell && !Pather.accessToAct(3);
			},
			skipIf: function () {
				return !me.paladin || Attack.auradin || me.checkItem({name: sdk.locale.items.Enigma}).have;
			},
			shouldRun: function () {
				if (!this.preReq() || this.skipIf()) return false;
				return true;
			}
		},
		"countess": {
			skipIf: function () {
				if (me.classic && me.hell) return true;
				return false;
			},
			shouldRun: function () {
				if (this.skipIf()) return false;
				// Farm for runes if we have a lawbringer because then we don't have to worry about phys immunes
				if (me.barbarian && me.hell && me.checkItem({name: sdk.locale.items.Lawbringer}).have) return true;
				return (Check.runes() || Check.brokeAf());
			}
		},
		"smith": {
			skipIf: function () {
				// todo - test leveling/experience potential
				return (!!Misc.checkQuest(sdk.quest.id.ToolsoftheTrade, sdk.quest.states.ReqComplete) || me.smith);
			},
			shouldRun: function () {
				if (this.skipIf()) return false;
				return true;
			}
		},
		"pits": {
			preReq: function () {
				return me.hell;
			},
			skipIf: function () {
				switch (me.classid) {
				case sdk.player.class.Amazon:
					return SetUp.currentBuild !== SetUp.finalBuild || me.charlvl < 85;
				case sdk.player.class.Sorceress:
					return me.charlvl < 85;
				case sdk.player.class.Paladin:
				case sdk.player.class.Druid:
					return !Check.currentBuild().caster;
				}
				return false;
			},
			shouldRun: function () {
				if (!this.preReq() || this.skipIf()) return false;
				return true;
			}
		},
		"jail": {
			preReq: function () {
				return me.hell && me.amazon && !me.mephisto;
			},
			skipIf: function () {
				return SetUp.currentBuild === SetUp.finalBuild;
			},
			shouldRun: function () {
				if (!this.preReq() || this.skipIf()) return false;
				return true;
			}
		},
		"boneash": {
			preReq: function () {
				return me.hell && me.classic && !me.diablo;
			},
			shouldRun: function () {
				if (!this.preReq()) return false;
				return true;
			}
		},
		"andariel": {
			skipIf: function () {
				if (me.hell && me.amazon && SetUp.currentBuild !== SetUp.finalBuild) return true;
				if (!me.normal && (!Pather.canTeleport() || me.charlvl > 60)) return true;
				return false;
			},
			shouldRun: function () {
				// always if not completed or classic hell
				if (!me.andariel || (me.classic && me.hell)) return true;
				// now for checks
				if (this.skipIf()) return false;
				return true;
			}
		},
		"a1chests": {
			preReq: function () {
				return !me.classic && !me.normal;
			},
			skipIf: function () {
				if (me.barbarian && (!me.hell || Pather.accessToAct(3)
					|| (Item.getEquippedItem(sdk.body.LeftArm).tier > 1270
					|| me.checkItem({name: sdk.locale.items.Lawbringer}).have))) {
					return true;
				}
				
				return (me.charlvl < 70 || !Pather.canTeleport());
			},
			shouldRun: function () {
				if (!this.preReq() || this.skipIf()) return false;
				return true;
			}
		},
		"cows": {
			preReq: function () {
				return !me.cows && me.diffCompleted;
			},
			skipIf: function () {
				if (me.normal && !Check.brokeAf()) return true;
				switch (me.classid) {
				case sdk.player.class.Barbarian:
					return ["Whirlwind", "Immortalwhirl", "Singer"].indexOf(SetUp.currentBuild) === -1;
				case sdk.player.class.Druid:
					return me.nightmare && me.charlvl > 65;
				case sdk.player.class.Sorceress:
					return me.nightmare && me.expansion && me.charlvl > 62;
				}
				return false;
			},
			shouldRun: function () {
				if (!this.preReq() || this.skipIf()) return false;
				return true;
			}
		},
		"cube": {
			preReq: function () {
				return Pather.accessToAct(2);
			},
			skipIf: function () {
				return me.cube;
			},
			shouldRun: function () {
				if (!this.preReq() || this.skipIf()) return false;
				return true;
			}
		},
		"radament": {
			preReq: function () {
				return Pather.accessToAct(2);
			},
			shouldRun: function () {
				if (!this.preReq()) return false;
				if (!me.radament) return true; // always run if we haven't done the q yet
				switch (true) {
				case me.hell && me.amazon && SetUp.currentBuild !== SetUp.finalBuild:
				case me.hell && me.sorceress && me.classic && !me.diablo:
					return true;
				default:
					return false;
				}
			}
		},
		"staff": {
			preReq: function () {
				return Pather.accessToAct(2);
			},
			skipIf: function () {
				return me.horadricstaff || me.shaft || me.completestaff;
			},
			shouldRun: function () {
				if (!this.preReq() || this.skipIf()) return false;
				return true;
			}
		},
		"amulet": {
			preReq: function () {
				return Pather.accessToAct(2);
			},
			skipIf: function () {
				return me.horadricstaff || me.amulet || me.completestaff;
			},
			shouldRun: function () {
				if (!this.preReq() || this.skipIf()) return false;
				return true;
			}
		},
		"ancienttunnels": {
			preReq: function () {
				return me.hell && Pather.accessToAct(2);
			},
			skipIf: function () {
				switch (me.classid) {
				case sdk.player.class.Amazon:
					return SetUp.currentBuild !== SetUp.finalBuild;
				case sdk.player.class.Paladin:
					return !Check.currentBuild().caster;
				}
				return false;
			},
			shouldRun: function () {
				if (!this.preReq() || this.skipIf()) return false;
				return true;
			}
		},
		"summoner": {
			preReq: function () {
				return Pather.accessToAct(2);
			},
			skipIf: function () {
				return me.summoner;
			},
			shouldRun: function () {
				// does summoner have leveling potential?
				if (!this.preReq() || this.skipIf()) return false;
				return true;
			}
		},
		"tombs": {
			preReq: function () {
				return Pather.accessToAct(2);
			},
			skipIf: function () {
				return !me.normal || me.charlvl > 24;
			},
			shouldRun: function () {
				if (!this.preReq() || this.skipIf()) return false;
				return true;
			}
		},
		"duriel": {
			preReq: function () {
				return Pather.accessToAct(2) && me.horadricstaff;
			},
			skipIf: function () {
				return me.duriel;
			},
			shouldRun: function () {
				// does duriel have leveling potential?
				if (!this.preReq() || this.skipIf()) return false;
				return true;
			}
		},
		"eye": {
			preReq: function () {
				return Pather.accessToAct(3);
			},
			skipIf: function () {
				return (me.eye || me.khalimswill || me.travincal);
			},
			shouldRun: function () {
				if (!this.preReq() || this.skipIf()) return false;
				return true;
			}
		},
		"templeruns": {
			preReq: function () {
				return Pather.accessToAct(3);
			},
			skipIf: function () {
				return (me.paladin && Check.currentBuild().caster);
			},
			shouldRun: function () {
				if (!this.preReq() || this.skipIf()) return false;
				return (!me.lamessen || (me.nightmare && me.charlvl < 50) || (me.hell && !me.classic && me.charlvl > 80));
			}
		},
		"lamessen": {
			preReq: function () {
				return Pather.accessToAct(3);
			},
			skipIf: function () {
				return ((me.paladin && Check.currentBuild().caster) || !me.classic);
			},
			shouldRun: function () {
				if (!this.preReq() || this.skipIf()) return false;
				return !me.lamessen;
			}
		},
		"lowerkurast": {
			preReq: function () {
				return Pather.accessToAct(3);
			},
			skipIf: function () {
				return (!me.barbarian);
			},
			shouldRun: function () {
				if (!this.preReq() || this.skipIf()) return false;
				return (me.nightmare && me.charlvl >= 50 && !me.checkItem({name: sdk.locale.items.VoiceofReason}).have);
			}
		},
		"heart": {
			preReq: function () {
				return Pather.accessToAct(3);
			},
			skipIf: function () {
				return (me.heart || me.khalimswill || me.travincal);
			},
			shouldRun: function () {
				if (!this.preReq() || this.skipIf()) return false;
				return true;
			}
		},
		"brain": {
			preReq: function () {
				return Pather.accessToAct(3);
			},
			skipIf: function () {
				return (me.brain || me.khalimswill || me.travincal);
			},
			shouldRun: function () {
				if (!this.preReq() || this.skipIf()) return false;
				return true;
			}
		},
		"travincal": {
			preReq: function () {
				return Pather.accessToAct(3);
			},
			skipIf: function () {
				return false;
			},
			shouldRun: function () {
				if (!this.preReq() || this.skipIf()) return false;
				switch (true) {
				case !me.travincal:
				case (me.charlvl < 25 || (me.charlvl >= 25 && me.normal && !me.baal && !Check.gold())):
				case (me.nightmare && !me.diablo && me.barbarian && !me.checkItem({name: sdk.locale.items.Lawbringer}).have):
				case (me.hell && me.paladin && me.charlvl > 85 && (!Attack.auradin || !me.checkItem({name: sdk.locale.items.Enigma}).have)):
					return true;
				}
				return false;
			}
		},
		"mephisto": {
			preReq: function () {
				return Pather.accessToAct(3) && me.mephisto;
			},
			skipIf: function () {
				return false;
			},
			shouldRun: function () {
				if (!this.preReq() || this.skipIf()) return false;
				switch (true) {
				case !me.mephisto:
				case (me.normal && !Check.gold() || !me.diffCompleted):
				case (me.nightmare && Pather.canTeleport() || me.charlvl <= 65):
				case (me.hell):
					return true;
				}
				return false;
			}
		},
		"izual": {
			preReq: function () {
				return Pather.accessToAct(4);
			},
			skipIf: function () {
				return (me.izual);
			},
			shouldRun: function () {
				if (!this.preReq() || this.skipIf()) return false;
				return true;
			}
		},
		"river": {
			preReq: function () {
				return Pather.accessToAct(4);
			},
			skipIf: function () {
				return (me.diablo || me.normal);
			},
			shouldRun: function () {
				if (!this.preReq() || this.skipIf()) return false;
				switch (true) {
				case (me.barbarian && !me.checkItem({name: sdk.locale.items.Lawbringer}).have):
				case (me.sorceress && me.classic):
					return true;
				}
				return false;
			}
		},
		"hephasto": {
			preReq: function () {
				return Pather.accessToAct(4);
			},
			skipIf: function () {
				return (!me.barbarian || me.normal || me.diablo);
			},
			shouldRun: function () {
				if (!this.preReq() || this.skipIf()) return false;
				switch (true) {
				case (me.charlvl <= 70 && !me.checkItem({name: sdk.locale.items.Lawbringer}).have):
					return true;
				}
				return false;
			}
		},
		"diablo": {
			preReq: function () {
				return Pather.accessToAct(4);
			},
			skipIf: function () {
				return false;
			},
			shouldRun: function () {
				if (!this.preReq() || this.skipIf()) return false;
				switch (true) {
				case !me.diablo:
				case (me.normal && (me.charlvl < 35 || me.classic)):
				case (me.nightmare && (Pather.canTeleport() || me.charlvl <= 65)):
				case (me.hell):
					return true;
				}
				return false;
			}
		},
		"hellforge": {
			preReq: function () {
				return Pather.accessToAct(4);
			},
			skipIf: function () {
				return (me.hellforge);
			},
			shouldRun: function () {
				if (!this.preReq() || this.skipIf()) return false;
				return true;
			}
		},
		"shenk": {
			preReq: function () {
				return (me.expansion && Pather.accessToAct(5));
			},
			skipIf: function () {
				return false;
			},
			shouldRun: function () {
				if (!this.preReq() || this.skipIf()) return false;
				switch (true) {
				case !me.shenk:
				case (!me.druid || me.charlvl <= 70):
					return true;
				}
				return false;
			}
		},
		"savebarby": {
			preReq: function () {
				return (me.expansion && Pather.accessToAct(5));
			},
			skipIf: function () {
				return me.savebarby;
			},
			shouldRun: function () {
				if (!this.preReq() || this.skipIf()) return false;
				switch (true) {
				case Runewords.checkRune(sdk.items.runes.Tal, sdk.items.runes.Ral, sdk.items.runes.Ort):
					return true;
				}
				return false;
			}
		},
		"anya": {
			preReq: function () {
				return (me.expansion && Pather.accessToAct(5));
			},
			skipIf: function () {
				return false;
			},
			shouldRun: function () {
				if (!this.preReq() || this.skipIf()) return false;
				return true;
			}
		},
		"ancients": {
			preReq: function () {
				return (me.expansion && Pather.accessToAct(5));
			},
			skipIf: function () {
				return me.ancients;
			},
			shouldRun: function () {
				if (!this.preReq() || this.skipIf()) return false;
				return true;
			}
		},
		"baal": {
			preReq: function () {
				return (me.expansion && Pather.accessToAct(5));
			},
			skipIf: function () {
				return !me.ancients;
			},
			shouldRun: function () {
				if (!this.preReq() || this.skipIf()) return false;
				return true;
			}
		},
		"a5chests": {
			preReq: function () {
				return (me.expansion && Pather.accessToAct(5) && me.baal);
			},
			skipIf: function () {
				return me.normal;
			},
			shouldRun: function () {
				if (!this.preReq() || this.skipIf()) return false;
				return true;
			}
		},
		"getkeys": {
			preReq: function () {
				return (me.expansion && Pather.accessToAct(5) && me.hell);
			},
			skipIf: function () {
				return (["Zealer", "Smiter", "Uberconc"].indexOf(SetUp.currentBuild) === -1);
			},
			shouldRun: function () {
				if (!this.preReq() || this.skipIf()) return false;
				return true;
			}
		},
		"orgtorch": {
			preReq: function () {
				return (me.expansion && Pather.accessToAct(5) && me.hell);
			},
			skipIf: function () {
				return (["Zealer", "Smiter", "Uberconc"].indexOf(SetUp.currentBuild) === -1);
			},
			shouldRun: function () {
				if (!this.preReq() || this.skipIf()) return false;
				return true;
			}
		},
	}
};
