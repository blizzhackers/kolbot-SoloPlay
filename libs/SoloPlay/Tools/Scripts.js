/**
*  @filename    Scripts.js
*  @author      theBGuy
*  @desc        Script index of SoloPlay
*
*/

const Scripts = {
	scripts: [
		// Act 1
		"corpsefire", "den", "bloodraven", "tristram", "treehead", "countess", "smith", "pits", "jail", "boneash", "andariel", "a1chests", "cows",
		// Act 2
		"cube", "radament", "amulet", "summoner", "tombs", "ancienttunnels", "staff", "duriel",
		// Act 3
		"lamessen", "templeruns", "lowerkurast", "eye", "heart", "brain", "travincal", "mephisto",
		// Act 4
		"izual", "hellforge", "river", "hephasto", "diablo",
		// Act 5
		"shenk", "savebarby", "anya", "ancients", "baal", "a5chests",
	],
	
	index: [
		{
			name: "corpsefire",
			preReq: function () {
				return me.den && me.hell;
			},
			skipIf: function () {
				return me.druid && me.paladin;
			},
			shouldRun: function () {
				if (!this.preReq() || this.skipIf()) return false;
				return (!me.andariel || Check.brokeAf());
			}
		},
		{
			name: "den",
			shouldRun: function () {
				return !me.den;
			}
		},
		{
			name: "bloodraven",
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
			}
		},
		{
			name: "tristram",
			skipIf: function () {
				switch (me.classid) {
				case sdk.charclass.Paladin:
					return Pather.accessToAct(3) || Attack.auradin || me.checkItem({name: sdk.locale.items.Enigma}).have;
				case sdk.charclass.Barbarian:
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
			}
		},
		{
			name: "treehead",
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
		{
			name: "countess",
			skipIf: function () {
				if (me.classic && me.hell) return true;
				return false;
			},
			shouldRun: function () {
				if (!this.preReq() || this.skipIf()) return false;
				// Farm for runes if we have a lawbringer because then we don't have to worry about phys immunes
				if (me.barbarian && me.hell && me.checkItem({name: sdk.locale.items.Lawbringer}).have) return true;
				return (Check.runes() || Check.brokeAf());
			}
		},
		{
			name: "smith",
			skipIf: function () {
				// todo - test leveling/experience potential
				return (!!Misc.checkQuest(3, 1) || me.smith);
			},
			shouldRun: function () {
				if (this.skipIf()) return false;
				return true;
			}
		},
		{
			name: "pits",
			preReq: function () {
				return me.hell;
			},
			skipIf: function () {
				switch (me.classid) {
				case sdk.charclass.Amazon:
					return SetUp.currentBuild !== SetUp.finalBuild || me.charlvl < 85;
				case sdk.charclass.Sorceress:
					return me.charlvl < 85;
				case sdk.charclass.Paladin:
				case sdk.charclass.Druid:
					return !Check.currentBuild().caster;
				}
				return false;
			},
			shouldRun: function () {
				if (!this.preReq() || this.skipIf()) return false;
				return true;
			}
		},
		{
			name: "jail",
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
		{
			name: "boneash",
			preReq: function () {
				return me.hell && me.classic && !me.diablo;
			},
			shouldRun: function () {
				if (!this.preReq()) return false;
				return true;
			}
		},
		{
			name: "andariel",
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
		{
			name: "a1chests",
			preReq: function () {
				return !me.classic && !me.normal;
			},
			skipIf: function () {
				if (me.barbarian && (!me.hell || Pather.accessToAct(3)
					|| (Item.getEquippedItem(5).tier > 1270
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
		{
			name: "cows",
			preReq: function () {
				return !me.cows && me.diffCompleted;
			},
			skipIf: function () {
				if (me.normal && !Check.brokeAf()) return true;
				switch (me.classid) {
				case sdk.charclass.Barbarian:
					return ["Whirlwind", "Immortalwhirl", "Singer"].indexOf(SetUp.currentBuild) === -1;
				case sdk.charclass.Druid:
					return me.nightmare && me.charlvl > 65;
				case sdk.charclass.Sorceress:
					return me.nightmare && me.expansion && me.charlvl > 62;
				}
				return false;
			},
			shouldRun: function () {
				if (!this.preReq() || this.skipIf()) return false;
				return true;
			}
		},
		{
			name: "cube",
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
		{
			name: "radament",
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
		{
			name: "staff",
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
		{
			name: "amulet",
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
		{
			name: "ancienttunnels",
			preReq: function () {
				return me.hell && Pather.accessToAct(2);
			},
			skipIf: function () {
				switch (me.classid) {
				case sdk.charclass.Amazon:
					return SetUp.currentBuild !== SetUp.finalBuild;
				case sdk.charclass.Paladin:
					return !Check.currentBuild().caster;
				}
				return false;
			},
			shouldRun: function () {
				if (!this.preReq() || this.skipIf()) return false;
				return true;
			}
		},
		{
			name: "summoner",
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
		{
			name: "tombs",
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
		{
			name: "duriel",
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
	]
};
