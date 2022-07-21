/**
*  @filename    amazon.js
*  @author      theBGuy
*  @desc        Amazon specifics
*
*/

const Amazon = {
	respecOne: 30,
	respecTwo: 64,
	levelCap: (function() {
		let currentDiff = sdk.difficulty.nameOf(me.diff);
		let softcoreMode = {
			"Normal": me.expansion ? 33 : 33,
			"Nightmare": me.expansion ? 70 : 70,
			"Hell": me.expansion ? 100 : 100,
		};
		let hardcoreMode = {
			"Normal": me.expansion ? 33 : 33,
			"Nightmare": me.expansion ? 65 : 65,
			"Hell": me.expansion ? 100 : 100,
		};

		return me.softcore ? softcoreMode[currentDiff] : hardcoreMode[currentDiff];
	})(),

	getActiveBuild: function () {
		switch (true) {
		case me.charlvl < this.respecOne && !me.getSkill(sdk.skills.LightningStrike, sdk.skills.subindex.HardPoints):
			return "Start";
		case me.charlvl > this.respecOne && me.charlvl < this.respecTwo && me.getSkill(sdk.skills.LightningStrike, sdk.skills.subindex.HardPoints) && me.getSkill(sdk.skills.PlagueJavelin, sdk.skills.subindex.HardPoints) <= 5:
			return "Stepping";
		case (me.charlvl > this.respecOne && me.charlvl > this.respecTwo && me.getSkill(sdk.skills.PlagueJavelin, sdk.skills.subindex.HardPoints) === 20 && !Check.finalBuild().active()):
			return "Leveling";
		}
	},
};
