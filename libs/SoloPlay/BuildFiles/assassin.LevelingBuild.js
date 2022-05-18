/**
*  @filename    assassin.LevelingBuild.js
*  @author      theBGuy
*  @desc        lightning trap build for after respecOne
*
*/

let build = {
	caster: true,
	skillstab: sdk.skills.tabs.Traps,
	wantedskills: [sdk.skills.FireBlast, sdk.skills.LightningSentry, sdk.skills.DeathSentry, sdk.skills.ShadowMaster],
	usefulskills: [sdk.skills.ChargedBoltSentry, sdk.skills.BladeShield, sdk.skills.Fade],
	mercDiff: sdk.difficulty.Nightmare,
	mercAct: 2,
	mercAuraWanted: "Holy Freeze",
	stats: [
		["strength", 47], ["dexterity", 46], ["vitality", 166],
		["strength", 61], ["vitality", 241], ["strength", 79],
		["dexterity", 79], ["strength", 156], ["vitality", "all"]
	],
	skills: [
		// Skills points at respec 33
		[sdk.skills.FireBlast, 3], 			// points left 30
		[sdk.skills.ShockWeb, 8], 			// points left 23
		[sdk.skills.ChargedBoltSentry, 1], 	// points left 21
		[sdk.skills.ClawMastery, 1], 		// points left 20
		[sdk.skills.PsychicHammer, 1], 		// points left 19
		[sdk.skills.BurstofSpeed, 1], 		// points left 18
		[sdk.skills.Fade, 1], 				// points left 17
		[sdk.skills.WeaponBlock, 1], 		// points left 16
		[sdk.skills.CloakofShadows, 1], 	// points left 15
		[sdk.skills.ShadowMaster, 1], 		// points left 13
		[sdk.skills.DeathSentry, 1], 		// points left 11
		[sdk.skills.MindBlast, 1], 			// points left 10
		[sdk.skills.LightningSentry, 7], 	// points left 4
		[sdk.skills.FireBlast, 6], 			// points left 3
		[sdk.skills.ShockWeb, 8], 			// points left 1
		[sdk.skills.WakeofFire, 1], 		// points left 0
		[sdk.skills.LightningSentry, 20, false],
		[sdk.skills.DeathSentry, 10],
		[sdk.skills.ShockWeb, 9],
		[sdk.skills.FireBlast, 8],
		[sdk.skills.DeathSentry, 12],
		[sdk.skills.ShockWeb, 11],
		[sdk.skills.FireBlast, 11],
		[sdk.skills.DeathSentry, 13],
		[sdk.skills.ShockWeb, 13],
		[sdk.skills.FireBlast, 12],
		[sdk.skills.DeathSentry, 14],
		[sdk.skills.ShockWeb, 15],
		[sdk.skills.FireBlast, 14],
		[sdk.skills.DeathSentry, 15],
		[sdk.skills.ShockWeb, 16],
		[sdk.skills.FireBlast, 15],
		[sdk.skills.DeathSentry, 16],
		[sdk.skills.ShockWeb, 18],
		[sdk.skills.FireBlast, 16],
		[sdk.skills.DeathSentry, 17],
		[sdk.skills.ShockWeb, 20],
		[sdk.skills.FireBlast, 18],
		[sdk.skills.DeathSentry, 20],
		[sdk.skills.ShockWeb, 20],
		[sdk.skills.FireBlast, 20],
		[sdk.skills.ChargedBoltSentry, 20],
	],

	active: function () {
		return (me.charlvl > Config.respecOne && me.charlvl > Config.respecOneB && me.getSkill(sdk.skills.LightningSentry, 0) === 20 && !Check.finalBuild().active());
	},
};
