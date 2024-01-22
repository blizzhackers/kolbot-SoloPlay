/**
*  @filename    sorceress.js
*  @author      theBGuy
*  @desc        Sorceress specifics
*
*/

const CharInfo = {
  respecOne: me.expansion ? 26 : 26,
  respecTwo: me.expansion ? 63 : 60,
  levelCap: (function () {
    const currentDiff = sdk.difficulty.nameOf(me.diff);
    const softcoreMode = {
      "Normal": me.expansion ? 33 : 33,
      "Nightmare": me.expansion ? 64 : 60,
      "Hell": 100,
    };
    const hardcoreMode = {
      "Normal": me.expansion ? 36 : 33,
      "Nightmare": me.expansion ? 71 : 67,
      "Hell": 100,
    };

    return me.softcore ? softcoreMode[currentDiff] : hardcoreMode[currentDiff];
  })(),

  getActiveBuild: function () {
    const nSkills = me.getStat(sdk.stats.NewSkills);
    const currLevel = me.charlvl;
    const justRepeced = (nSkills >= currLevel);

    switch (true) {
    case currLevel < this.respecOne && !me.checkSkill(sdk.skills.ColdMastery, sdk.skills.subindex.HardPoints):
      return "Start";
    case currLevel >= this.respecOne && currLevel < this.respecTwo && justRepeced:
    case currLevel >= this.respecOne && currLevel < this.respecTwo && me.checkSkill(sdk.skills.Blizzard, sdk.skills.subindex.HardPoints) && !me.checkSkill(sdk.skills.Nova, sdk.skills.subindex.HardPoints) && !me.checkSkill(sdk.skills.FireMastery, sdk.skills.subindex.HardPoints):
      return "Stepping";
    case Check.finalBuild().respec() && justRepeced:
    case Check.finalBuild().active():
      return SetUp.finalBuild;
    default:
      return "Leveling";
    }
  },
};
