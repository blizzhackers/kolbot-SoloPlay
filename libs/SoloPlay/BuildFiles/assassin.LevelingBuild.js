/*
 *    @filename   assassin.TrapsinBuild.js
 *	  @author	  theBGuy
 *    @desc       assassin build for after respecOne
 */

var build = {
	caster: true,
	skillstab: 48, // traps
	wantedskills: [251, 271, 276, 279], // fireblast, lightning sentry, death sentry, shadow master
	usefulskills: [261, 277, 267], // charged bolt sentry, blade shield, fade
	mercAuraName: "Holy Freeze",
	mercAuraWanted: 114,
	mercDiff: 1,
	stats: [
		["strength", 47], ["dexterity", 46], ["vitality", 166],
		["strength", 61], ["vitality", 241], ["strength", 79],
		["dexterity", 79], ["strength", 156], ["vitality", "all"]
	],
	skills: [
		// Skills points at respec 33
		[251, 3], // fireblast	-> points left 30
		[256, 8], // shock web -> points left 23
		[261, 1], // charged bolt sentry -> points left 21
		[252, 1], // claw mastery -> points left 20
		[253, 1], // psychic hammer -> points left 19
		[258, 1], // burst of speed -> points left 18
		[267, 1], // fade -> points left 17
		[263, 1], // weapon block -> points left 16
		[264, 1], // cloak of shadows -> points left 15
		[279, 1], // shadow master -> points left 13
		[276, 1], // death sentry -> points left 11
		[273, 1], // mind blast -> points left 10
		[271, 7], // lightning sentry -> points left 4
		[251, 6], // fireblast	-> points left 3
		[256, 8], // shock web -> points left 1
		[262, 1], // wake of fire -> points left 0
		[271, 20, false], // lightning sentry
		[276, 10], // death sentry
		[256, 9], // shock web
		[251, 8], // fireblast
		[276, 12], // death sentry
		[256, 11], // shock web
		[251, 11], // fireblast
		[276, 13], // death sentry
		[256, 13], // shock web
		[251, 12], // fireblast
		[276, 14], // death sentry
		[256, 15], // shock web
		[251, 14], // fireblast
		[276, 15], // death sentry
		[256, 16], // shock web
		[251, 15], // fireblast
		[276, 16], // death sentry
		[256, 18], // shock web
		[251, 16], // fireblast
		[276, 17], // death sentry
		[256, 20], // shock web
		[251, 18], // fireblast
		[276, 20], // death sentry
		[256, 20], // shock web
		[251, 20], // fireblast
		[261, 20], // charged bolt sentry
	]
};
