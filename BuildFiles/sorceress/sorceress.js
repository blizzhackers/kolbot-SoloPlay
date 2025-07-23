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

    if (currLevel < this.respecOne) {
      return "Start";
    }

    if (currLevel < this.respecTwo) {
      if (me.checkSkill(sdk.skills.Nova, sdk.skills.subindex.HardPoints)) {
        // we haven't actually respeced yet
        return "Start";
      }
      return "Stepping";
    }

    if ((Check.finalBuild().respec() && justRepeced) || Check.finalBuild().active()) {
      return SetUp.finalBuild;
    }

    return "Leveling";
  },
};
