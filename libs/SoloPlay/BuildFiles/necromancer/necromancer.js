/**
*  @filename    necromancer.js
*  @author      theBGuy
*  @desc        Necromancer specifics
*
*/

const CharInfo = {
  respecOne: 26,
  respecTwo: 0,
  levelCap: (function() {
    const currentDiff = sdk.difficulty.nameOf(me.diff);
    const softcoreMode = {
      "Normal": me.expansion ? 33 : 33,
      "Nightmare": me.expansion ? 70 : 70,
      "Hell": 100,
    };
    const hardcoreMode = {
      "Normal": me.expansion ? 36 : 33,
      "Nightmare": me.expansion ? 71 : 70,
      "Hell": 100,
    };

    return me.softcore ? softcoreMode[currentDiff] : hardcoreMode[currentDiff];
  })(),

  getActiveBuild: function () {
    const nSkills = me.getStat(sdk.stats.NewSkills);
    const currLevel = me.charlvl;
    const justRepeced = (nSkills >= currLevel);

    switch (true) {
    case currLevel < this.respecOne && !me.checkSkill(sdk.skills.BonePrison, sdk.skills.subindex.HardPoints):
      return "Start";
    case Check.finalBuild().respec() && justRepeced:
    case Check.finalBuild().active():
      return SetUp.finalBuild;
    default:
      return "Leveling";
    }
  },
};
