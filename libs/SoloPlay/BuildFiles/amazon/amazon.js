/**
*  @filename    amazon.js
*  @author      theBGuy
*  @desc        Zon specifics
*
*/

const CharInfo = {
	respecOne: me.expansion ? 30 : 30,
	respecTwo: me.expansion ? 64 : 64,
	levelCap: (function() {
		const currentDiff = sdk.difficulty.nameOf(me.diff);
		const softcoreMode = {
			"Normal": me.expansion ? 33 : 33,
			"Nightmare": me.expansion ? 70 : 70,
			"Hell": 100,
		};
		const hardcoreMode = {
			"Normal": me.expansion ? 33 : 33,
			"Nightmare": me.expansion ? 65 : 65,
			"Hell": 100,
		};

		return me.softcore ? softcoreMode[currentDiff] : hardcoreMode[currentDiff];
	})(),

	getActiveBuild: function () {
		const nSkills = me.getStat(sdk.stats.NewSkills);
		const currLevel = me.charlvl;
		const justRepeced = (nSkills >= currLevel);

		switch (true) {
		case currLevel < this.respecOne && !me.getSkill(sdk.skills.LightningStrike, sdk.skills.subindex.HardPoints):
			return "Start";
		case currLevel >= this.respecOne && currLevel < this.respecTwo && justRepeced:
		case currLevel >= this.respecOne && currLevel < this.respecTwo && me.getSkill(sdk.skills.LightningStrike, sdk.skills.subindex.HardPoints) && !me.getSkill(sdk.skills.PlagueJavelin, sdk.skills.subindex.HardPoints):
			return "Stepping";
		case Check.finalBuild().respec() && justRepeced:
		case Check.finalBuild().active():
			return SetUp.finalBuild;
		default:
			return "Leveling";
		}
	},
};
