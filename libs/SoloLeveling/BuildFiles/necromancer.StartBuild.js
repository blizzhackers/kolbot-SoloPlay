/**
 *    @filename   necromancer.StartBuild.js
 *	  @author	  theBGuy, isid0re
 *    @desc       necro build for before respecOne
 */

var build = {
	caster: true,
	skillstab: 17, //bone
	wantedskills: [67, 84], // teeth, bonespear
	usefulskills: [66, 68, 87], //ampdamage, bone armor, decrepify
	mercAuraName: "Might",
	mercAuraWanted: 98,
	mercDiff: 1,
	stats: [
		["strength", 20], ["vitality", 70], ["strength", 35],
		["energy", 85], ["vitality", "all"]
	],
	skills: [
		[67, 4], // teeth -> Charlvl 4
		[66, 1], // amplified damage - > Charlvl 5
		[68, 1], // bone armor -> Charlvl 6
		[71, 1], // dim vision -> Charlvl 7
		[72, 1], // weaken -> Charlvl 8
		[75, 1], // clay golem -> Charlvl 9
		[67, 7], // teeth -> Charlvl 11
		[79, 1], // Golem Mastery -> Charlvl 12
		[76, 1], // iron maiden -> Charlvl 13
		[74, 1], // corpse explosion -> Charlvl 14
		[78, 3], // Bone Wall -> Charlvl 17
		//[67, 10], // teeth -> Charlvl 17
		[84, 6], // bone spear -> Charlvl 23
		[87, 1], // decrep -> Charlvl 24
		[84, 20], // bone spear -> Charlvl -> Until respec at 26
	]
};