/* eslint-disable max-len */
/* eslint-disable no-unused-vars */
/* eslint-disable no-irregular-whitespace */
/**
 *    @filename  GameData.js
 *    @author    Nishimura-Katsuo
 *    @desc      game data library
 *
 */
// todo - remove the magic numbers here
(function (module, require) {
  const MonsterData = require("./MonsterData");
  const AreaData = require("./AreaData");
  const MissileData = require("./MissileData");
  const Coords_1 = require("../Coords");
  const sdk = require("../../../modules/sdk");
  const HPLookup = [
    ["1", "1", "1"], ["7", "107", "830"],
    ["9", "113", "852"], ["12", "120", "875"],
    ["15", "125", "897"], ["17", "132", "920"],
    ["20", "139", "942"], ["23", "145", "965"],
    ["27", "152", "987"], ["31", "157", "1010"],
    ["35", "164", "1032"], ["36", "171", "1055"],
    ["40", "177", "1077"], ["44", "184", "1100"],
    ["48", "189", "1122"], ["52", "196", "1145"],
    ["56", "203", "1167"], ["60", "209", "1190"],
    ["64", "216", "1212"], ["68", "221", "1235"],
    ["73", "228", "1257"], ["78", "236", "1280"],
    ["84", "243", "1302"], ["89", "248", "1325"],
    ["94", "255", "1347"], ["100", "261", "1370"],
    ["106", "268", "1392"], ["113", "275", "1415"],
    ["120", "280", "1437"], ["126", "287", "1460"],
    ["134", "320", "1482"], ["142", "355", "1505"],
    ["150", "388", "1527"], ["158", "423", "1550"],
    ["166", "456", "1572"], ["174", "491", "1595"],
    ["182", "525", "1617"], ["190", "559", "1640"],
    ["198", "593", "1662"], ["206", "627", "1685"],
    ["215", "661", "1707"], ["225", "696", "1730"],
    ["234", "729", "1752"], ["243", "764", "1775"],
    ["253", "797", "1797"], ["262", "832", "1820"],
    ["271", "867", "1842"], ["281", "900", "1865"],
    ["290", "935", "1887"], ["299", "968", "1910"],
    ["310", "1003", "1932"], ["321", "1037", "1955"],
    ["331", "1071", "1977"], ["342", "1105", "2000"],
    ["352", "1139", "2030"], ["363", "1173", "2075"],
    ["374", "1208", "2135"], ["384", "1241", "2222"],
    ["395", "1276", "2308"], ["406", "1309", "2394"],
    ["418", "1344", "2480"], ["430", "1379", "2567"],
    ["442", "1412", "2653"], ["454", "1447", "2739"],
    ["466", "1480", "2825"], ["477", "1515", "2912"],
    ["489", "1549", "2998"], ["501", "1583", "3084"],
    ["513", "1617", "3170"], ["525", "1651", "3257"],
    ["539", "1685", "3343"], ["552", "1720", "3429"],
    ["565", "1753", "3515"], ["579", "1788", "3602"],
    ["592", "1821", "3688"], ["605", "1856", "3774"],
    ["618", "1891", "3860"], ["632", "1924", "3947"],
    ["645", "1959", "4033"], ["658", "1992", "4119"],
    ["673", "2027", "4205"], ["688", "2061", "4292"],
    ["702", "2095", "4378"], ["717", "2129", "4464"],
    ["732", "2163", "4550"], ["746", "2197", "4637"],
    ["761", "2232", "4723"], ["775", "2265", "4809"],
    ["790", "2300", "4895"], ["805", "2333", "4982"],
    ["821", "2368", "5068"], ["837", "2403", "5154"],
    ["853", "2436", "5240"], ["868", "2471", "5327"],
    ["884", "2504", "5413"], ["900", "2539", "5499"],
    ["916", "2573", "5585"], ["932", "2607", "5672"],
    ["948", "2641", "5758"], ["964", "2675", "5844"],
    ["982", "2709", "5930"], ["999", "2744", "6017"],
    ["1016", "2777", "6103"], ["1033", "2812", "6189"],
    ["1051", "2845", "6275"], ["1068", "2880", "6362"],
    ["1085", "2915", "6448"], ["1103", "2948", "6534"],
    ["1120", "2983", "6620"], ["1137", "3016", "6707"],
    ["10000", "10000", "10000"]
  ];

  /** @param {Monster} unit */
  function isAlive (unit) {
    return Boolean(unit && unit.hp);
  }

  /** @param {Monster} unit */
  function isEnemy (unit) {
    return Boolean(
      unit && isAlive(unit)
      && unit.getStat(sdk.stats.Alignment) !== 2
      && typeof unit.classid === "number"
      && MonsterData.get(unit.classid).Killable
    );
  }

  /** @param {ItemUnit} item */
  function onGround (item) {
    return item.onGroundOrDropping;
  }

  const GameData = {
    myReference: me,
    /**
     * @param {number} monsterID 
     * @param {number} areaID 
     */
    monsterLevel: function (monsterID, areaID) {
      return (me.diff
        ? AreaData.has(areaID) && AreaData.get(areaID).Level
        : MonsterData.has(monsterID) && MonsterData.get(monsterID).Level); // levels on nm/hell are determined by area, not by monster data
    },
    /**
     * @param {number} monsterID 
     * @param {number} areaID 
     * @param {number} adjustLevel 
     */
    monsterExp: function (monsterID, areaID, adjustLevel = 0) {
      const mLvl = this.monsterLevel(monsterID, areaID) + adjustLevel;
      const { ExperienceModifier } = MonsterData.get(monsterID);
      return Experience.monsterExp[Math.min(
        Experience.monsterExp.length - 1,
        mLvl
      )][me.diff] * ExperienceModifier / 100;
    },
    /**
     * @param {number} monsterID 
     * @param {number} areaID 
     */
    eliteExp: function (monsterID, areaID) {
      return this.monsterExp(monsterID, areaID, 2) * 3;
    },
    /**
     * @param {number} monsterID 
     * @param {number} areaID 
     * @param {number} adjustLevel 
     */
    monsterAvgHP: function (monsterID, areaID, adjustLevel = 0) {
      const { MinHp, MaxHp } = MonsterData.get(monsterID);
      const mLvl = this.monsterLevel(monsterID, areaID) + adjustLevel;
      return HPLookup[Math.min(HPLookup.length - 1, mLvl)][me.diff] * (MinHp + MaxHp) / 200;
    },
    /**
     * @param {number} monsterID 
     * @param {number} areaID 
     * @param {number} adjustLevel 
     */
    monsterMaxHP: function (monsterID, areaID, adjustLevel = 0) {
      const mLvl = this.monsterLevel(monsterID, areaID) + adjustLevel;
      const { MaxHp } = MonsterData.get(monsterID);
      return HPLookup[Math.min(HPLookup.length - 1, mLvl)][me.diff] * MaxHp / 100;
    },
    eliteAvgHP: function (monsterID, areaID) {
      return (6 - me.diff) / 2 * this.monsterAvgHP(monsterID, areaID, 2);
    },
    monsterDamageModifier: function () {
      return 1 + (this.multiplayerModifier() - 1) * 0.0625;
    },
    monsterMaxDmg: function (monsterID, areaID, adjustLevel = 0) {
      let level = this.monsterLevel(monsterID, areaID) + adjustLevel;
      let { Attack1MaxDmg, Attack2MaxDmg, Skill1MaxDmg } = MonsterData.get(monsterID);
      return Math.max.apply(
        null, [Attack1MaxDmg, Attack2MaxDmg, Skill1MaxDmg]
      ) * level / 100 * this.monsterDamageModifier();
    },
    // https://www.diabloii.net/forums/threads/monster-damage-increase-per-player-count.570346/
    monsterAttack1AvgDmg: function (monsterID, areaID, adjustLevel = 0) {
      let level = this.monsterLevel(monsterID, areaID) + adjustLevel;
      let { Attack1MinDmg, Attack1MaxDmg } = MonsterData.get(monsterID);
      return ((Attack1MinDmg + Attack1MaxDmg) / 2) * level / 100 * this.monsterDamageModifier();
    },
    monsterAttack2AvgDmg: function (monsterID, areaID, adjustLevel = 0) {
      let level = this.monsterLevel(monsterID, areaID) + adjustLevel;
      let { Attack2MinDmg, Attack2MaxDmg } = MonsterData.get(monsterID);
      return ((Attack2MinDmg + Attack2MaxDmg) / 2) * level / 100 * this.monsterDamageModifier();
    },
    monsterSkill1AvgDmg: function (monsterID, areaID, adjustLevel = 0) {
      let level = this.monsterLevel(monsterID, areaID) + adjustLevel;
      let { Skill1MinDmg, Skill1MaxDmg } = MonsterData.get(monsterID);
      return ((Skill1MinDmg + Skill1MaxDmg) / 2) * level / 100 * this.monsterDamageModifier();
    },
    monsterAvgDmg: function (monsterID, areaID, adjustLevel = 0) {
      let attack1 = this.monsterAttack1AvgDmg(monsterID, areaID, adjustLevel);
      let attack2 = this.monsterAttack2AvgDmg(monsterID, areaID, adjustLevel);
      let skill1 = this.monsterSkill1AvgDmg(monsterID, areaID, adjustLevel);
      let dmgs = [attack1, attack2, skill1]
        .filter(function (x) {
          return x > 0;
        });
      // ignore 0 dmg to avoid reducing average
      if (!dmgs.length) return 0;
      return dmgs.reduce(function (acc, v) {
        return acc + v;
      }, 0) / dmgs.length;
    },
    averagePackSize: function (monsterID) {
      let { GroupCount, MinionCount } = MonsterData.get(monsterID);
      return (GroupCount.Min + MinionCount.Min + GroupCount.Max + MinionCount.Max) / 2;
    },
    areaLevel: function (areaID) {
      // levels on nm/hell are determined by area, not by monster data
      if (me.diff) return AreaData.get(areaID).Level;
      
      let levels = 0, total = 0;

      AreaData.get(areaID).forEachMonsterAndMinion(function (mon, rarity) {
        levels += mon.Level * rarity;
        total += rarity;
      });

      return Math.round(levels / total);
    },
    areaImmunities: function (areaID) {
      let resists = { Physical: 0, Magic: 0, Fire: 0, Lightning: 0, Cold: 0, Poison: 0 };

      AreaData.get(areaID).forEachMonsterAndMinion(function (mon) {
        for (let k in resists) {
          resists[k] = Math.max(resists[k], mon[k]);
        }
      });

      return Object.keys(resists)
        .filter(function (key) {
          return resists[key] >= 100;
        });
    },
    levelModifier: function (clvl, mlvl) {
      let bonus;

      if (clvl < 25 || mlvl < clvl) {
        bonus = Experience.expCurve[Math.min(20, Math.max(0, Math.floor(mlvl - clvl + 10)))] / 255;
      } else {
        bonus = clvl / mlvl;
      }

      return bonus * Experience.expPenalty[Math.min(30, Math.max(0, Math.round(clvl - 69)))] / 1024;
    },
    multiplayerModifier: function (count) {
      if (!count) {
        let party = getParty(GameData.myReference);
        if (!party) return 1;

        count = 1;

        while (party.getNext()) {
          count++;
        }
      }

      return (count + 1) / 2;
    },
    partyModifier: function (playerID) {
      let party = getParty(GameData.myReference);
      let level = 0, total = 0;
      if (!party) return 1;

      let partyid = party.partyid;

      do {
        if (party.partyid === partyid) {
          total += party.level;

          if (playerID === party.name || playerID === party.gid) {
            level = party.level;
          }
        }
      } while (party.getNext());

      return level / total;
    },
    killExp: function (playerID, monsterID, areaID) {
      let exp = this.monsterExp(monsterID, areaID);
      let party = getParty(GameData.myReference);
      if (!party) return 0;

      let level = 0, total = 0;
      let gamesize = 0;
      let partyid = party.partyid;

      do {
        gamesize++;

        if (party.partyid === partyid) {
          total += party.level;

          if (playerID === party.name || playerID === party.gid) {
            level = party.level;
          }
        }
      } while (party.getNext());

      return Math.floor(
        exp * this.levelModifier(level, this.monsterLevel(monsterID, areaID))
        * this.multiplayerModifier(gamesize) * level / total
      );
    },
    baseLevel: function (...skillIDs) {
      return skillIDs.reduce(function (total, skillID) {
        return total + GameData.myReference.getSkill(skillID, 0);
      }, 0);
    },
    skillLevel: function (...skillIDs) {
      return skillIDs.reduce(function (total, skillID) {
        return total + GameData.myReference.getSkill(skillID, 1);
      }, 0);
    },
    skillCooldown: function (skillID) {
      return getBaseStat("Skills", skillID, "delay") !== -1;
    },
    stagedDamage: function (l, a, b, c, d, e, f, hitshift = 0, mult = 1) {
      if (l > 28) {
        a += f * (l - 28);
        l = 28;
      }

      if (l > 22) {
        a += e * (l - 22);
        l = 22;
      }

      if (l > 16) {
        a += d * (l - 16);
        l = 16;
      }

      if (l > 8) {
        a += c * (l - 8);
        l = 8;
      }

      a += b * (Math.max(0, l) - 1);

      return (mult * a) << hitshift;
    },
    damageTypes: ["Physical", "Fire", "Lightning", "Magic", "Cold", "Poison", "?", "?", "?", "Physical"], // 9 is Stun, but stun isn't an element
    synergyCalc: { // TODO: add melee skill damage and synergies - they are poop
      // sorc fire spells
      36: [47, 0.16, 56, 0.16],			// fire bolt
      41: [37, 0.13],	// inferno
      46: [37, 0.04, 51, 0.01],	// blaze
      47: [36, 0.14, 56, 0.14],			// fire ball
      51: [37, 0.04, 41, 0.01],	// fire wall
      52: [37, 0.09],						// enchant
      56: [36, 0.05, 47, 0.05],			// meteor
      62: [36, 0.03, 47, 0.03],			// hydra

      // sorc lightning spells
      38: [49, 0.06],						// charged bolt
      49: [38, 0.08, 48, 0.08, 53, 0.08], // lightning
      53: [38, 0.04, 48, 0.04, 49, 0.04], // chain lightning

      // sorc cold spells
      39: [44, 0.15, 45, 0.15, 55, 0.15, 59, 0.15, 64, 0.15],	// ice bolt
      44: [59, 0.10, 64, 0.10],			// frost nova
      45: [39, 0.08, 59, 0.08, 64, 0.08],	// ice blast
      55: [39, 0.05, 45, 0.05, 64, 0.05],	// glacial spike
      59: [39, 0.05, 45, 0.05, 55, 0.05],	// blizzard
      64: [39, 0.02],						// frozen orb

      // assassin traps
      251: [256, 0.09, 261, 0.09, 262, 0.09, 271, 0.09, 272, 0.09, 276, 0.09],	// fireblast
      256: [261, 0.11, 271, 0.11, 276, 0.11],	// shock web
      261: [251, 0.06, 271, 0.06, 276, 0.06],	// charged bolt sentry
      262: [251, 0.08, 272, 0.08],	// wake of fire sentry
      271: [256, 0.12, 261, 0.12, 276, 0.12],	// lightning sentry
      272: [251, 0.10, 276, 0.10, 262, 0.07],	// inferno sentry
      276: [271, 0.12],	// death sentry

      // necro bone spells
      67: [78, 0.15, 84, 0.15, 88, 0.15, 93, 0.15],	// teeth
      73: [83, 0.20, 92, 0.20],	// poison dagger
      83: [73, 0.15, 92, 0.15], // poison explosion
      84: [67, 0.07, 78, 0.07, 88, 0.07, 93, 0.07], // bone spear
      92: [73, 0.10, 83, 0.10], // poison nova
      93: [67, 0.06, 78, 0.06, 84, 0.06, 88, 0.06], // bone spirit

      // barb war cry
      154: [130, 0.06, 137, 0.06, 146, 0.06], // war cry

      // paladin combat spells
      101: [112, 0.50, 121, 0.50], // holy bolt
      112: [108, 0.14, 115, 0.14], // blessed hammer
      121: [118, 0.07], // fist of heavens

      // paladin auras
      102: [100, 0.18, 125, 0.06],	// holy fire
      114: [105, 0.15, 125, 0.07],	// holy freeze
      118: [110, 0.12, 125, 0.04],	// holy shock

      // durid elemental skills
      225: [229, 0.23, 234, 0.23],	// firestorm
      229: [244, 0.10, 225, 0.08],	// molten boulder
      234: [225, 0.12, 244, 0.12],	// fissure (eruption)
      244: [229, 0.12, 234, 0.12, 249, 0.12],	// volcano
      249: [225, 0.14, 229, 0.14, 244, 0.14],	// armageddon
      230: [250, 0.15, 235, 0.15],	// arctic blast
      240: [245, 0.10, 250, 0.10],	// twister
      245: [235, 0.09, 240, 0.09, 250, 0.09],	// tornado
      250: [240, 0.09, 245, 0.09],	// hurricane

      // durid feral skills
      238: [222, 0.18],	// rabies
      239: [225, 0.22, 229, 0.22, 234, 0.22, 244, 0.22],	// fire claws

      // amazon bow/xbow skills
      11: [21, 0.12], // cold arrow
      21: [11, 0.08],	// ice arrow
      31: [11, 0.12],	// freezing arrow
      7: [16, 0.12],	// fire arrow
      16: [7, 0.12],	// exploding arrow
      27: [16, 0.10],	// immolation arrow

      // amazon spear/javalin skills
      14: [20, 0.10, 24, 0.10, 34, 0.10, 35, 0.10],	// power strike
      20: [14, 0.03, 24, 0.03, 34, 0.03, 35, 0.03], // lightning bolt
      24: [14, 0.10, 20, 0.10, 34, 0.10, 35, 0.10],	// charged strike
      34: [14, 0.08, 20, 0.08, 24, 0.10, 35, 0.10],	// lightning strike
      35: [14, 0.01, 20, 0.01, 24, 0.01, 34, 0.01],	// lightning fury
      15: [25, 0.12],	// poison javalin
      25: [15, 0.10],	// plague javalin
    },
    noMinSynergy: [14, 20, 24, 34, 35, 49, 53, 118, 256, 261, 271, 276],
    skillMult: {
      15: 25,
      25: 25,
      41: 25,
      46: 75,
      51: 75,
      73: 25,
      83: 25,
      92: 25,
      222: 25,
      225: 75,
      230: 25,
      238: 25,
      272: 25 / 3
    },
    baseSkillDamage: function (skillID) { // TODO: rework skill damage to use both damage fields
      let l = this.skillLevel(skillID);
      let m = this.skillMult[skillID] || 1;
      let dmgFields = [
        [
          "MinDam", "MinLevDam1",
          "MinLevDam2", "MinLevDam3",
          "MinLevDam4", "MinLevDam5",
          "MaxDam", "MaxLevDam1",
          "MaxLevDam2", "MaxLevDam3",
          "MaxLevDam4", "MaxLevDam5"
        ],
        [
          "EMin", "EMinLev1",
          "EMinLev2", "EMinLev3",
          "EMinLev4", "EMinLev5",
          "EMax", "EMaxLev1",
          "EMaxLev2", "EMaxLev3",
          "EMaxLev4", "EMaxLev5"
        ]
      ];

      if (skillID === 70) {
        return {
          type: "Physical",
          pmin: this.stagedDamage(
            l,
            getBaseStat("skills", skillID, dmgFields[1][0]),
            getBaseStat("skills", skillID, dmgFields[1][1]),
            getBaseStat("skills", skillID, dmgFields[1][2]),
            getBaseStat("skills", skillID, dmgFields[1][3]),
            getBaseStat("skills", skillID, dmgFields[1][4]),
            getBaseStat("skills", skillID, dmgFields[1][5]),
            getBaseStat("skills", skillID, "HitShift"),
            m
          ),
          pmax: this.stagedDamage(
            l,
            getBaseStat("skills", skillID, dmgFields[1][0]),
            getBaseStat("skills", skillID, dmgFields[1][1]),
            getBaseStat("skills", skillID, dmgFields[1][2]),
            getBaseStat("skills", skillID, dmgFields[1][3]),
            getBaseStat("skills", skillID, dmgFields[1][4]),
            getBaseStat("skills", skillID, dmgFields[1][5]),
            getBaseStat("skills", skillID, "HitShift"),
            m
          ),
          min: 0,
          max: 0
        };
      } else {
        let type = getBaseStat("skills", skillID, "EType");

        return {
          type: this.damageTypes[type],
          pmin: this.stagedDamage(
            l,
            getBaseStat("skills", skillID, dmgFields[0][0]),
            getBaseStat("skills", skillID, dmgFields[0][1]),
            getBaseStat("skills", skillID, dmgFields[0][2]),
            getBaseStat("skills", skillID, dmgFields[0][3]),
            getBaseStat("skills", skillID, dmgFields[0][4]),
            getBaseStat("skills", skillID, dmgFields[0][5]),
            getBaseStat("skills", skillID, "HitShift"),
            m
          ),
          pmax: this.stagedDamage(
            l,
            getBaseStat("skills", skillID, dmgFields[0][6]),
            getBaseStat("skills", skillID, dmgFields[0][7]),
            getBaseStat("skills", skillID, dmgFields[0][8]),
            getBaseStat("skills", skillID, dmgFields[0][9]),
            getBaseStat("skills", skillID, dmgFields[0][10]),
            getBaseStat("skills", skillID, dmgFields[0][11]),
            getBaseStat("skills", skillID, "HitShift"),
            m
          ),
          min: type
            ? this.stagedDamage(
              l,
              getBaseStat("skills", skillID, dmgFields[1][0]),
              getBaseStat("skills", skillID, dmgFields[1][1]),
              getBaseStat("skills", skillID, dmgFields[1][2]),
              getBaseStat("skills", skillID, dmgFields[1][3]),
              getBaseStat("skills", skillID, dmgFields[1][4]),
              getBaseStat("skills", skillID, dmgFields[1][5]),
              getBaseStat("skills", skillID, "HitShift"),
              m
            )
            : 0,
          max: type
            ? this.stagedDamage(
              l,
              getBaseStat("skills", skillID, dmgFields[1][6]),
              getBaseStat("skills", skillID, dmgFields[1][7]),
              getBaseStat("skills", skillID, dmgFields[1][8]),
              getBaseStat("skills", skillID, dmgFields[1][9]),
              getBaseStat("skills", skillID, dmgFields[1][10]),
              getBaseStat("skills", skillID, dmgFields[1][11]),
              getBaseStat("skills", skillID, "HitShift"),
              m
            )
            : 0
        };
      }
    },
    skillRadius: {
      //47: 8,
      //48: 5, // Nova
      55: 3,
      56: 12,
      92: 24,
      154: 12,
      249: 24,
      250: 24,
      251: 3,
    },
    novaLike: {
      44: true,
      48: true,
      92: true,
      112: true,
      154: true,
      249: true,
      250: true,
    },
    wolfBanned: {
      225: true,
      229: true,
      230: true,
      233: true,
      234: true,
      235: true,
      240: true,
      243: true,
      244: true,
      245: true,
      250: true,
    },
    bearBanned: {
      225: true,
      229: true,
      230: true,
      232: true,
      234: true,
      235: true,
      238: true,
      240: true,
      244: true,
      245: true,
      248: true,
    },
    humanBanned: {
      232: true,
      233: true,
      238: true,
      239: true,
      242: true,
      243: true,
      248: true,
    },
    nonDamage: {
      // Some fakes to avoid these

      54: true, // teleport
      217: true, // scroll identify
      218: true, // portal scroll
      219: true, // I assume this is the book of scroll
      220: true, // book portal. Not really a skill you want to use, do you
      117: true, // Holy shield. Holy shield it self doesnt give damage
      278: true, // venom adds damage, but doesnt do damage on its own

      // Remove all the trap skills, as we prefer to calculate this upon demand
      261: true, // lighting bolt
      271: true, // lighting sentry
      276: true, // Death sentry only works on corpses, we calculate this within attack
      262: true, // wake of fire
      272: true, // inferno
    },
    shiftState: function () {
      if (GameData.myReference.getState(139)) return "wolf";
      if (GameData.myReference.getState(140)) return "bear";
      return "human";
    },
    bestForm: function (skillID) {
      if (this.shiftState() === "human" && this.humanBanned[skillID]) {
        let highest = { ID: 0, Level: 0 };

        if (!this.wolfBanned[skillID] && this.skillLevel(223) > highest.Level) {
          highest.ID = 223;
          highest.Level = this.skillLevel(223);
        }

        if (!this.bearBanned[skillID] && this.skillLevel(228) > highest.Level) {
          highest.ID = 228;
          highest.Level = this.skillLevel(228);
        }

        return highest.ID;
      } else if (this.shiftState() === "wolf" && this.wolfBanned[skillID]) {
        return 223;
      } else if (this.shiftState() === "bear" && this.bearBanned[skillID]) {
        return 228;
      }

      return 0;
    },
    physicalAttackDamage: function (skillID) {
      let dmg = (function () {
        switch (skillID) {
        case sdk.skills.Bash:
          return 45 + (5 + GameData.myReference.getSkill(skillID, 1)) + (5 * GameData.myReference.getSkill(sdk.skills.Stun, 0));
        case sdk.skills.Stun:
          return (8 * GameData.myReference.getSkill(sdk.skills.Bash, 0));
        case sdk.skills.Concentrate:
          return (65 + (5 * GameData.myReference.getSkill(skillID, 1)) + (5 * GameData.myReference.getSkill(sdk.skills.Bash, 0)) + (10 * GameData.myReference.getSkill(sdk.skills.BattleOrders, 0)));
        case sdk.skills.LeapAttack:
          return (70 + (30 * GameData.myReference.getSkill(skillID, 1)) + (10 * GameData.myReference.getSkill(sdk.skills.Leap, 0)));
        case sdk.skills.Whirlwind:
          return (8 * GameData.myReference.getSkill(skillID, 1)) - 58;
        default:
          return 0;
        }
      })();

      // return (((GameData.myReference.getStat(sdk.stats.MaxDamage) + GameData.myReference.getStat(sdk.stats.MinDamage)) / 2) + (GameData.myReference.getStat(sdk.stats.Strength) * dmg)) / 100;
      return dmg;
    },
    dmgModifier: function (skillID, target) {
      let aps = (typeof target === "number" ? this.averagePackSize(target) : 1);
      let eliteBonus = (target.spectype && target.isSpecial) ? 1 : 0, hitcap = 1;

      switch (skillID) { // charged bolt/strike excluded, it's so unreliably random
      case 15: // poison javalin
      case 25: // plague javalin
      case 16: // exploding arrow
      case 27: // immolation arrow
      case 31: // freezing arrow
      case 35: // lightning fury
      case 44: // frost nova
      case 48: // nova
      case 56: // meteor
      case 59: // blizzard
      case 64: // frozen orb
      case 83: // poison explosion
      case 92: // poison nova
      case 112: // blessed hammer
      case 154: // war cry
      case 229: // molten boulder
      case 234: // fissure
      case 249: // armageddon
      case 244: // volcano
      case 250: // hurricane
      case 251: // fireblast
      case 261: // charged bolt sentry
      case 262: // wake of fire
      case 55: // glacial spike
      case 47: // fire ball
      case 42: // Static field.
      case 38: // charged bolt
        hitcap = Infinity;
        break;
      case 34: // lightning strike
        hitcap = 1 + this.skillLevel(34);
        break;
      case 67: // teeth
        hitcap = 1 + this.skillLevel(67);
        break;
      case 53: // chain lightning
        hitcap = 5 + ((this.skillLevel(53) / 5) | 0);
        break;
      case 24:
        hitcap = 3 + ((this.skillLevel(24) / 5) | 0);
        break;
      case 49: // lightning
      case 84: // bone spear
      case 271: // lightning sentry
      case 276: // death sentry
        hitcap = aps ? Math.sqrt(aps / Math.PI) * 2 : 1;
        break;
      default:
        hitcap = 1;
        break;
      }

      if (typeof target !== "number") {
        let unit = Game.getMonster();
        let radius = this.skillRadius[skillID] || 18;

        if (unit) {
          do {
            if (aps >= hitcap) {
              break;
            }

            if (target.gid !== unit.gid
              && getDistance(unit, this.novaLike[skillID] ? GameData.myReference : target) <= radius
              && isEnemy(unit)) {
              aps++;

              if (unit.isSpecial) {
                eliteBonus++;
              }
            }
          } while (unit.getNext());
        }
      } else {
        aps = Math.min(aps, hitcap);
      }

      aps += eliteBonus * (4 - me.diff) / 2;

      return aps;
    },

    /**
     * @typedef skillDmgObj
     * @property {string} type
     * @property {number} pmin
     * @property {number} pmax
     * @property {number} min
     * @property {number} max
     * @property {boolean} [undeadOnly]
     *
     * @param {number} skillID 
     * @param {Monster} unit 
     * @returns {skillDmgObj}
     */
    skillDamage: function (skillID, unit) {
      // TODO: caluclate basic attack damage
      if (skillID === sdk.skills.Attack) {
        return {
          type: "Physical",
          pmin: (GameData.myReference.getStat(sdk.stats.MinDamage) || 2),
          pmax: (GameData.myReference.getStat(sdk.stats.MaxDamage) || 8),
          min: 0,
          max: 0
        }; // short sword, no reqs
      }

      if (this.skillLevel(skillID) < 1) {
        return {
          type: this.damageTypes[getBaseStat("skills", skillID, "EType")],
          pmin: 0,
          pmax: 0,
          min: 0,
          max: 0
        };
      }

      let dmg = this.baseSkillDamage(skillID);
      let mastery = 1, psynergy = 1, synergy = 1, shots = 1, sl = 0;

      if (this.synergyCalc[skillID]) {
        let sc = this.synergyCalc[skillID];

        for (let c = 0; c < sc.length; c += 2) {
          sl = this.baseLevel(sc[c]);

          if (skillID === 229 || skillID === 244) {
            if (sc[c] === 229 || sc[c] === 244) { // molten boulder and volcano
              psynergy += sl * sc[c + 1]; // they only synergize physical with each other
            } else {
              synergy += sl * sc[c + 1]; // all other skills synergize only fire with these skills
            }
          } else {
            psynergy += sl * sc[c + 1];
            synergy += sl * sc[c + 1];
          }
        }
      }

      if (skillID === 227 || skillID === 237 || skillID === 247) {
        sl = this.skillLevel(247);
        psynergy += 0.15 + sl * 0.10;
        synergy += 0.15 + sl * 0.10;
      }

      switch (dmg.type) {
      case "Fire": // fire mastery
      case "Lightning": // lightning mastery
      case "Cold": // cold mastery
      case "Poison": // poison mastery
      case "Magic": // magic mastery
        mastery = 1 + GameData.myReference.getStat(this.masteryMap[dmg.type]) / 100;
        dmg.min *= mastery;
        dmg.max *= mastery;

        break;
      }

      dmg.pmin *= psynergy;
      dmg.pmax *= psynergy;

      if (this.noMinSynergy.indexOf(skillID) < 0) {
        dmg.min *= synergy;
      }

      dmg.max *= synergy;

      switch (skillID) {
      case 102: // holy fire
        dmg.min *= 6; // weapon damage is 6x the aura damage
        dmg.max *= 6;
        break;
      case 114: // holy freeze
        dmg.min *= 5; // weapon damage is 5x the aura damage
        dmg.max *= 5;
        break;
      case 118: // holy shock
        dmg.min *= 6; // weapon damage is 6x the aura damage
        dmg.max *= 6;
        break;
      case 249: // armageddon
        dmg.pmin = dmg.pmax = 0;
        break;
      case 24: // charged strike
        dmg.max *= 3 + ((this.skillLevel(24) / 5) | 0);
      }

      dmg.pmin >>= 8;
      dmg.pmax >>= 8;
      dmg.min >>= 8;
      dmg.max >>= 8;

      switch (skillID) {
      case sdk.skills.ChargedBolt: // more than one bolt can hit but may calc this as splashdamage instead
        if (unit) {
          let baseId = getBaseStat("monstats", unit.classid, "baseid");
          let size = getBaseStat("monstats2", baseId, "sizex");
          (typeof size !== "number" || size < 1 || size > 3) && (size = 3);
          let dist = unit.distance;
          const modifier = size === 1 ? 0.5 : size === 3 ? 1.5 : size === 2 && dist < 5 ? 1.2 : 1;
          dmg.min *= modifier;
          dmg.max *= modifier;
        }

        // need to take into account the amount of bolts released
        // the size of the unit we are targetting
        // the distance from the target
        break;
      case 59: // blizzard - on average hits twice
        dmg.min *= 2;
        dmg.max *= 2;
        break;
      case 62: // hydra - 3 heads
        dmg.min *= 3;
        dmg.max *= 3;
        break;
      case 64: // frozen orb - on average hits ~5 times
        dmg.min *= 5;
        dmg.max *= 5;
        break;
      case 70: // skeleton - a hit per skeleton
        sl = this.skillLevel(70);
        shots = sl < 4 ? sl : (2 + sl / 3) | 0;
        sl = Math.max(0, sl - 3);
        dmg.pmin = shots * (dmg.pmin + 1 + this.skillLevel(69) * 2) * (1 + sl * 0.07);
        dmg.pmax = shots * (dmg.pmax + 2 + this.skillLevel(69) * 2) * (1 + sl * 0.07);
        break;
      case 94: // fire golem
        sl = this.skillLevel(94);
        dmg.min = [10, 15, 18][me.diff] + dmg.min + (this.stagedDamage(sl + 7, 2, 1, 2, 3, 5, 7) >> 1) * 6; // basically holy fire added
        dmg.max = [27, 39, 47][me.diff] + dmg.max + (this.stagedDamage(sl + 7, 6, 1, 2, 3, 5, 7) >> 1) * 6;
        break;
      case 101: // holy bolt
        dmg.undeadOnly = true;
        break;
      case 112: // blessed hammer
        sl = this.skillLevel(113);

        if (sl > 0) {
          mastery = (100 + ((45 + this.skillLevel(113) * 15) >> 1)) / 100;	// hammer gets half concentration dmg bonus
          dmg.min *= mastery;
          dmg.max *= mastery;
        }

        break;
      case sdk.skills.Raven: // raven - a hit per raven
        shots = Math.min(5, this.skillLevel(221)); // 1-5 ravens
        dmg.pmin *= shots;
        dmg.pmax *= shots;
        break;
      case sdk.skills.SummonSpiritWolf: // spirit wolf - a hit per wolf
        shots = Math.min(5, this.skillLevel(227));
        dmg.pmin *= shots;
        dmg.pmax *= shots;
        break;
      case sdk.skills.SummonDireWolf: // dire wolf - a hit per wolf
        shots = Math.min(3, this.skillLevel(237));
        dmg.pmin *= shots;
        dmg.pmax *= shots;
        break;
      case sdk.skills.Twister: // twister
        dmg.pmin *= 3;
        dmg.pmax *= 3;
        break;
      case 261: // charged bolt sentry
      case 262: // wake of fire
      case 271: // lightning sentry
      case 272: // inferno sentry
      case 276: // death sentry
        dmg.min *= 5;	// can have 5 traps out at a time
        dmg.max *= 5;
        break;
      case sdk.skills.StaticField:
        if (!(unit instanceof Unit)) {
          break;
        }
        // No cap in classic
        let staticCap = (me.gametype === sdk.game.gametype.Classic
          ? 0 : [0, 33, 50][me.diff]);
        const [monsterId, areaId] = [unit.classid, unit.area];
        let percentLeft = (unit.hp * 100 / unit.hpmax);
        if (staticCap > percentLeft) {
          break;
        }

        const maxReal = this.monsterMaxHP(monsterId, areaId, unit.charlvl - this.monsterLevel(monsterId, areaId));
        let hpReal = maxReal / 100 * percentLeft;
        let potencialDmg = (hpReal / 100 * percentLeft) * 0.25;

        let tmpDmg = (maxReal / 100 * percentLeft) * (0.25);

        // We do need to calculate the extra damage, or less damage due to resistance
        let resist = this.monsterResist(unit, "Lightning");
        let pierce = GameData.myReference.getStat(this.pierceMap.Lightning);

        let conviction = this.getConviction();
        // if (conviction && !unit.getState(sdk.states.Conviction)) conviction = 0; //ToDo; enable when fixed telestomp
        resist -= (resist >= 100 ? conviction / 5 : conviction);
        resist = (resist < 100 ? Math.max(-100, resist - pierce) : 100);
        tmpDmg = potencialDmg * ((100 - resist) / 100);
        const percentageDamage = 100 / maxReal * tmpDmg;

        let avgDmg = tmpDmg;
        let overCap = percentLeft - staticCap - percentageDamage;
        if (overCap < 0) {
          let maxDmgPercentage = percentageDamage - Math.abs(overCap);
          avgDmg = maxReal / 100 * maxDmgPercentage;
        }
        avgDmg = avgDmg > 0 && avgDmg || 0;
        //console.log('Static will chop off -> ' + (100 / maxReal * avgDmg) + '%');
        dmg.min = avgDmg;
        dmg.max = avgDmg;
        break;
      }

      dmg.pmin |= 0;
      dmg.pmax |= 0;
      dmg.min |= 0;
      dmg.max |= 0;

      return dmg;
    },

    /**
     * Calculate actual average damage this skill does taking into account splash/range of skill
     * @param {number} skillID 
     * @param {Monster | number | string} unit 
     * @returns {number}
     * @todo
     * - build me metadata - then use it to calulate a range of skills rather than redo the exact same calculations.
     * example: trying to check the damage of blizard and then frozen orb,
     * currently it would check our stats, then check amp and conviction - those could all be pre-built as they aren't going to change
     */
    avgSkillDamage: function (skillID, unit) {
      if (!skillID || !unit || !Skill.canUse(skillID)) return 0;
      const ampDmg = Skill.canUse(sdk.skills.AmplifyDamage)
        ? 100
        : (Skill.canUse(sdk.skills.Decrepify)
          ? 50
          : 0);

      /**
       * 
       * @param {skillDmgObj} skillData 
       * @param {Monster | number | string} unit 
       * @returns 
       */
      const getTotalDmg = function (skillData, unit) {
        const isUndead = (typeof unit === "number"
          ? MonsterData.get(unit).Undead
          : MonsterData.get(unit.classid).Undead);
        const conviction = GameData.getConviction();
        let totalDmg = 0;
        let avgPDmg = (skillData.pmin + skillData.pmax) / 2;
        let avgDmg = (skillData.min + skillData.max) / 2;

        if (avgPDmg > 0) {
          let presist = GameData.monsterResist(unit, "Physical");
          presist -= (presist >= 100 ? ampDmg / 5 : ampDmg);
          presist = Math.max(-100, Math.min(100, presist));
          totalDmg += avgPDmg * (100 - presist) / 100;
        }
        if (avgDmg > 0 && (!isUndead || !skillData.undeadOnly)) {
          let resist = GameData.monsterResist(unit, skillData.type);
          let pierce = GameData.myReference.getStat(GameData.pierceMap[skillData.type]);
          if (GameData.convictionEligible[skillData.type]) {
            resist -= (resist >= 100 ? conviction / 5 : conviction);
          }
          resist = (resist < 100 ? Math.max(-100, resist - pierce) : 100);
          totalDmg += avgDmg * (100 - resist) / 100;
        }
        return totalDmg;
      };

      /**
       * @param {number} skill 
       * @param {number} splash 
       * @param {Monster} target 
       * @returns {number}
       */
      const calculateSplashDamage = function (skill, splash, target) {
        return getUnits(sdk.unittype.Monster)
          .filter(function (mon) {
            return mon.attackable && getDistance(target, mon) < splash;
          })
          .reduce(function (acc, cur) {
            let _a = GameData.skillDamage(skill, cur);
            return acc + getTotalDmg(_a, cur);
          }, 0);
      };

      /**
       * @param {number} skill 
       * @param {Monster} target 
       * @returns {number}
       */
      const calculateChainDamage = function (skill, target) {
        skill === undefined && (skill = -1);
        let rawDmg = 0, totalDmg = 0, range = 0, hits = 0;
        switch (skill) {
        case sdk.skills.ChainLightning:
          hits = Math.round((25 + me.getSkill(sdk.skills.ChainLightning, sdk.skills.subindex.SoftPoints)) / 5);
          range = 13;
          break;
        }
        let units = getUnits(sdk.unittype.Monster)
          .filter(function (mon) {
            return mon.attackable && getDistance(mon, target) < range;
          })
          .sort(function (a, b) {
            return getDistance(target, a) - getDistance(target, b);
          });
        if (units.length === 1) {
          rawDmg = GameData.skillDamage(skill, target);
          return getTotalDmg(rawDmg, target);
        } else {
          // console.log("Units to check: " + units.length);
          for (let i = 0; i < units.length; i++) {
            if (units[i] !== undefined) {
              rawDmg = GameData.skillDamage(skill, units[i]);
              totalDmg += getTotalDmg(rawDmg, units[i]);
              if (i > hits) { break; }
            } else {
              units.splice(i, 1);
              i -= 1;
            }
          }
          return totalDmg;
        }
      };
      
      const calculateRawStaticDamage = function (distanceUnit) {
        distanceUnit === undefined && (distanceUnit = me);
        if (!Skill.canUse(sdk.skills.StaticField)) return 0;
        const range = Skill.getRange(sdk.skills.StaticField);
        const cap = (me.gametype === sdk.game.gametype.Classic ? 1 : [1, 25, 50][me.diff]);
        const pierce = me.getStat(sdk.stats.PierceLtng);
        return getUnits(sdk.unittype.Monster)
          .filter(function (mon) {
            return mon.attackable && getDistance(mon, distanceUnit) < range;
          }).reduce(function (acc, unit) {
            let classId = unit.classid, areaId = unit.area;
            let maxHealth = GameData.monsterAvgHP(classId, areaId, unit.charlvl - GameData.monsterLevel(classId, areaId));
            let currentHealth = maxHealth / 100 * (unit.hp * 100 / unit.hpmax), baseDamage = currentHealth * 0.25;
            // monsterRes already considers conviction state
            let monsterRes = unit.getStat(sdk.stats.LightResist);
            let totalRes = Math.min(100, Math.max(-100, monsterRes - pierce));
            // calculate the actual damage we do
            let potentialDamage = baseDamage / (100 / (100 - totalRes));
            let cappedAtHealth = maxHealth / 100 * cap;
            // cap max damage
            let actualDamage = currentHealth - Math.max(cappedAtHealth, (currentHealth - potentialDamage));
            return acc + (actualDamage);
          }, 0);
      };

      const calculateThroughDamage = function () {
        // determine maximum potential distance of this missile
        // build points from me -> monster -> max distance
        // iterate points checking if any monsters are in the path
        // check collision at each point and break if we encounter a missisle blocker
        // special considerations for molten boulder:
        // - check monster size, based on size the boulder may knock back or go through them
        // - if we encounter a collision that causes the boulder to burst, add explosion damage
        // 
      };

      /**
       * 
       * @param {Monster} unit 
       */
      const calcVolcanoDamage = function (unit) {
        let velocity = unit.currentVelocity;
        /** @type {skillDmgObj} */
        let baseDmg = GameData.skillDamage(sdk.skills.Volcano, unit);
        // since these are random, lets take them into account but not at their full value
        let missleDmg = Object.assign({}, baseDmg);
        missleDmg.pmin /= 2;
        missleDmg.pmax /= 2;
        missleDmg.min /= 2;
        missleDmg.max /= 2;
        // sorta guess work for now, needs improvment to really figure out on average how many times the actual
        // volcano damages the monster cast on based on size/speed
        let modifier = (!unit.isMoving || velocity === 1) ? 5 : velocity === 2 ? 3 : 1;
        if (modifier > 1) {
          baseDmg.pmin *= modifier;
          baseDmg.pmax *= modifier;
          baseDmg.min *= modifier;
          baseDmg.max *= modifier;
        }

        // sum the total in the range of the volcano missiles
        // what about monsters just directly on the volcano?
        return getUnits(sdk.unittype.Monster)
          .filter(function (mon) {
            return mon.attackable && getDistance(unit, mon) < 15;
          })
          .reduce(function (acc, cur) {
            return acc + getTotalDmg(missleDmg, cur);
          }, getTotalDmg(baseDmg, unit));
      };

      /**
       * @todo some skills need special handling
       * - Bone spear and Lightning both pierce enemies in a straight path, need to calculate include monsters in that path
       * to the total damage done as this can make the difference between wanting to use this skill vs another
       * - Fire Wall is similar only seems to be a random angle
       * - Inferno/Artic blast same as bonespear/lightning
       * - Molten boulder needs to take into account monster size and angle of cast
       * - Zeal, can hit same enemy multiple times or multiple enemies, would change total damage applied based on enemy targetted so needs to be handled
       * Others?
       */
      switch (skillID) {
      case sdk.skills.Blizzard:
      case sdk.skills.Meteor:
      case sdk.skills.FireBall:
      case sdk.skills.GlacialSpike:
      case sdk.skills.ChargedBolt:
      case sdk.skills.Fissure:
        let { x, y } = unit;
        let rad = skillID === sdk.skills.Volcano ? 15 : skillID === sdk.skills.Fissure ? 10 : 5;
        
        if (!Attack.validSpot(x, y, skillID, unit.classid)) {
          return 0;
        }

        return calculateSplashDamage(skillID, rad, unit);
      case sdk.skills.Volcano:
        if (!Attack.validSpot(unit.x, unit.y, skillID, unit.classid)) {
          return 0;
        }

        return calcVolcanoDamage(unit);
      case sdk.skills.FrostNova:
      case sdk.skills.Nova:
        return calculateSplashDamage(skillID, 6, unit);
      case sdk.skills.StaticField:
        return calculateRawStaticDamage(unit);
      case sdk.skills.ChainLightning:
        return calculateChainDamage(skillID, unit);
      default:
        return getTotalDmg(this.skillDamage(skillID, unit), unit);
      }
    },
    allSkillDamage: function (unit) {
      let skills = {};
      let self = this;
      GameData.myReference.getSkill(4).forEach(function (skill) {
        if (self.nonDamage.hasOwnProperty(skill[0])) {
          return false; // Doesnt do damage
        }
        return skills[skill[0]] = self.skillDamage(skill[0], unit);
      });

      return skills;
    },
    convictionEligible: {
      Fire: true,
      Lightning: true,
      Cold: true,
    },
    lowerResistEligible: {
      Fire: true,
      Lightning: true,
      Cold: true,
      Poison: true,
    },
    resistMap: {
      Physical: 36,
      Fire: 39,
      Lightning: 41,
      Cold: 43,
      Poison: 45,
      Magic: 37,
    },
    masteryMap: {
      Fire: 329,
      Lightning: 330,
      Cold: 331,
      Poison: 332,
      Magic: 357,
    },
    pierceMap: {
      Fire: 333,
      Lightning: 334,
      Cold: 335,
      Poison: 336,
      Magic: 358,
    },
    ignoreSkill: {
      40: true,
      50: true,
      60: true,
    },
    buffs: {
      8: 1,
      9: 1,
      13: 1,
      17: 1,
      18: 1,
      23: 1,
      28: 1,
      29: 1,
      32: 1,
      37: 1,
      40: 2,
      46: 1,
      50: 2,
      52: 1,
      57: 1,
      58: 1,
      60: 2,
      61: 1,
      63: 1,
      65: 1,
      68: 1,
      69: 1,
      79: 1,
      89: 1,
      98: 3,
      99: 3,
      100: 3,
      102: 3,
      103: 3,
      104: 3,
      105: 3,
      108: 3,
      109: 3,
      110: 3,
      113: 3,
      114: 3,
      115: 3,
      118: 3,
      119: 3,
      120: 3,
      122: 3,
      123: 3,
      124: 3,
      125: 3,
      127: 1,
      128: 1,
      129: 1,
      134: 1,
      135: 1,
      136: 1,
      138: 1,
      141: 1,
      145: 1,
      148: 1,
      149: 1,
      153: 1,
      155: 1,
      221: 1,
      222: 4,
      223: 5,
      224: 1,
      226: 6,
      227: 7,
      228: 5,
      231: 4,
      235: 1,
      236: 6,
      237: 7,
      241: 4,
      246: 6,
      247: 7,
      249: 1,
      250: 1,
      258: 8,
      267: 8,
      268: 9,
      279: 9,
    },
    preAttackable: [
      sdk.skills.MagicArrow, sdk.skills.FireArrow,
      sdk.skills.MultipleShot, sdk.skills.ExplodingArrow,
      sdk.skills.IceArrow, sdk.skills.GuidedArrow,
      sdk.skills.ImmolationArrow, sdk.skills.Strafe,
      sdk.skills.PlagueJavelin, sdk.skills.LightningFury,
      sdk.skills.FireBolt, sdk.skills.Inferno,
      sdk.skills.Blaze, sdk.skills.FireBall,
      sdk.skills.FireWall, sdk.skills.Meteor, sdk.skills.Hydra,
      sdk.skills.ChargedBolt, sdk.skills.Nova,
      sdk.skills.Lightning, sdk.skills.ChainLightning,
      sdk.skills.IceBolt, sdk.skills.FrostNova,
      sdk.skills.IceBlast, sdk.skills.Blizzard, sdk.skills.FrozenOrb,
      sdk.skills.AmplifyDamage, sdk.skills.DimVision,
      sdk.skills.Weaken, sdk.skills.IronMaiden,
      sdk.skills.Terror, sdk.skills.Confuse,
      sdk.skills.LifeTap, sdk.skills.Attract,
      sdk.skills.Decrepify, sdk.skills.LowerResist,
      sdk.skills.Teeth, sdk.skills.BoneSpear, sdk.skills.PoisonNova,
      sdk.skills.BlessedHammer,
      sdk.skills.WarCry,
      sdk.skills.Twister, sdk.skills.Tornado,
      sdk.skills.FireBlast, sdk.skills.ShockWeb,
    ],
    monsterResist: function (unit, type) {
      let stat = this.resistMap[type];
      return stat ? (unit.getStat ? unit.getStat(stat) : MonsterData.get(unit)[type]) : 0;
    },
    getConviction: function () {
      let merc = GameData.myReference.getMerc();
      let sl = this.skillLevel(123); // conviction
      /** @param {ItemUnit} item */
      function isInfinity (item) {
        return item.prefixnum === sdk.locale.items.Infinity;
      }
      if (( // Either me, or merc is wearing a conviction
        merc && merc.getItemsEx().filter(isInfinity).first()
        || GameData.myReference.getItemsEx(-1, 1).filter(isInfinity).first())) {
        sl = 12;
      }
      return sl > 0 ? Math.min(150, 30 + (sl - 1) * 5) : 0;
    },
    getAmp: function () {
      return this.skillLevel(66) ? 100 : (this.skillLevel(87) ? 50 : 0);
    },
    monsterEffort: function (unit, areaID, skillDamageInfo = undefined, parent = undefined, preattack = false, all = false) {
      let buffDmg = [];
      const allData = [];
      const buffDamageInfo = {};
      const newSkillDamageInfo = {};
      const eret = { effort: Infinity, skill: -1, type: "Physical" };
      const useCooldown = (typeof unit === "number" ? false : Boolean(me.skillDelay));
      const hp = this.monsterMaxHP(typeof unit === "number" ? unit : unit.classid, areaID);
      const conviction = this.getConviction(), ampDmg = this.getAmp();
      const isUndead = (typeof unit === "number" ? MonsterData.get(unit).Undead : MonsterData.get(unit.classid).Undead);
      skillDamageInfo = skillDamageInfo || this.allSkillDamage(unit);
      console.debug(unit, "---", hp);
      // if (conviction && unit instanceof Unit && !unit.getState(sdk.states.Conviction)) conviction = 0; //ToDo; enable when fixed telestomp

      for (let sk in skillDamageInfo) {
        if (this.buffs[sk]) {
          if (typeof unit === "number") {
            buffDmg[this.buffs[sk]] = 0;
            buffDamageInfo[sk] = skillDamageInfo[sk];
          }
        } else {
          newSkillDamageInfo[sk] = skillDamageInfo[sk];
        }
      }

      skillDamageInfo = newSkillDamageInfo;

      for (let sk in buffDamageInfo) {
        // static field has a fix'd ceiling, calculated already
        if ([sdk.skills.StaticField].indexOf(sk) !== -1) continue;

        let avgPDmg = (buffDamageInfo[sk].pmin + buffDamageInfo[sk].pmax) / 2;
        let avgDmg = (buffDamageInfo[sk].min + buffDamageInfo[sk].max) / 2;
        let tmpDmg = 0;

        if (avgPDmg > 0) {
          let presist = this.monsterResist(unit, "Physical");

          presist -= (presist >= 100 ? ampDmg / 5 : ampDmg);
          presist = Math.max(-100, Math.min(100, presist));
          tmpDmg += avgPDmg * (100 - presist) / 100;
        }

        if (avgDmg > 0 && (!isUndead || !buffDamageInfo[sk].undeadOnly) && sk !== sdk.skills.StaticField) {
          let resist = this.monsterResist(unit, buffDamageInfo[sk].type);
          let pierce = GameData.myReference.getStat(this.pierceMap[buffDamageInfo[sk].type]);

          if (this.convictionEligible[buffDamageInfo[sk].type]) {
            resist -= (resist >= 100 ? conviction / 5 : conviction);
          }

          if (resist < 100) {
            resist = Math.max(-100, resist - pierce);
          } else {
            resist = 100;
          }

          tmpDmg += avgDmg * (100 - resist) / 100;
        }

        if (this.buffs[sk] === 1) {
          buffDmg[this.buffs[sk]] += tmpDmg;
        } else {
          buffDmg[this.buffs[sk]] = Math.max(buffDmg[this.buffs[sk]], tmpDmg);
        }
      }

      buffDmg = buffDmg.reduce(function (t, v) {
        return t + v;
      }, 0);

      for (let sk in skillDamageInfo) {
        if (preattack && this.preAttackable.indexOf(parseInt(sk)) === -1) continue; // cant preattack this skill
        if (!this.ignoreSkill[sk] && (!useCooldown || !this.skillCooldown(sk | 0))) {
          let avgPDmg = (skillDamageInfo[sk].pmin + skillDamageInfo[sk].pmax) / 2, totalDmg = buffDmg;
          let avgDmg = (skillDamageInfo[sk].min + skillDamageInfo[sk].max) / 2;

          if (avgPDmg > 0 && sk !== sdk.skills.StaticField) {
            let presist = this.monsterResist(unit, "Physical");

            presist -= (presist >= 100 ? ampDmg / 5 : ampDmg);
            presist = Math.max(-100, Math.min(100, presist));
            totalDmg += avgPDmg * (100 - presist) / 100;
          }

          if (avgDmg > 0 && (!isUndead || !skillDamageInfo[sk].undeadOnly)) {
            let resist = this.monsterResist(unit, skillDamageInfo[sk].type);
            let pierce = GameData.myReference.getStat(this.pierceMap[skillDamageInfo[sk].type]);

            if (this.convictionEligible[skillDamageInfo[sk].type]) {
              resist -= (resist >= 100 ? conviction / 5 : conviction);
            }

            if (resist < 100) {
              resist = Math.max(-100, resist - pierce);
            } else {
              resist = 100;
            }

            totalDmg += sk !== sdk.skills.StaticField
              && 0
              || avgDmg * (100 - resist) / 100;

          }
          console.debug(hp, "---/", totalDmg);
          let tmpEffort = Math.ceil(hp / totalDmg);

          tmpEffort /= this.dmgModifier(sk | 0, parent || unit);

          // care for mana
          if (GameData.myReference.mp < Skill.getManaCost(sk)) {
            tmpEffort *= 5; // More effort in a skill we dont have mana for
          }

          // check valid location, blizzard and meteor fail over lava
          if (typeof unit === "object") {
            if ([sdk.skills.Blizzard, sdk.skills.Meteor].indexOf(sk) && !Attack.validSpot(unit.x, unit.y, sk, unit.classid)) {
              tmpEffort *= 5;
            }
          }

          // Use less cool down spells, if something better is around
          /* if (this.skillCooldown(sk | 0)) {
            console.log("tmpEffort: " + (Math.ceil(tmpEffort)) + " eretEffor: " + eret.effort);
            tmpEffort *= 5;
          } */
          if (tmpEffort <= eret.effort) {
            eret.effort = tmpEffort;
            eret.skill = sk | 0;
            eret.type = skillDamageInfo[eret.skill].type;
            eret.name = getSkillById(eret.skill);
            eret.cooldown = this.skillCooldown(sk | 0);
            if (all) {
              allData.unshift(copyObj(eret));
            }
          }
        }
      }
      console.log(eret, allData);
      if (all && allData.length) return allData;
      if (eret.skill >= 0) return eret;
      return null;
    },
    effectiveMonsterEffort: function (unit, areaID) {
      if (unit === undefined) return null;
      areaID === undefined && (areaID = me.area);
      const allData = [];
      const buffDamageInfo = {};
      const newSkillDamageInfo = {};
      let buffDmg = [];
      let eret = { effort: Infinity, skill: -1, type: "Physical" };
      let hp = this.monsterMaxHP(typeof unit === "number" ? unit : unit.classid, areaID);
      let conviction = this.getConviction(), ampDmg = this.getAmp();
      let isUndead = (typeof unit === "number" ? MonsterData.get(unit).Undead : MonsterData.get(unit.classid).Undead);
      let skillDamageInfo = this.allSkillDamage(unit);

      for (let sk in skillDamageInfo) {
        if (this.buffs[sk]) {
          if (typeof unit === "number") {
            buffDmg[this.buffs[sk]] = 0;
            buffDamageInfo[sk] = skillDamageInfo[sk];
          }
        } else {
          newSkillDamageInfo[sk] = skillDamageInfo[sk];
        }
      }

      skillDamageInfo = newSkillDamageInfo;

      for (let sk in buffDamageInfo) {
        // static field has a fix'd ceiling, calculated already
        if ([sdk.skills.StaticField].indexOf(sk) !== -1) continue;

        let avgPDmg = (buffDamageInfo[sk].pmin + buffDamageInfo[sk].pmax) / 2;
        let avgDmg = (buffDamageInfo[sk].min + buffDamageInfo[sk].max) / 2;
        let tmpDmg = 0;

        if (avgPDmg > 0) {
          let presist = this.monsterResist(unit, "Physical");

          presist -= (presist >= 100 ? ampDmg / 5 : ampDmg);
          presist = Math.max(-100, Math.min(100, presist));
          tmpDmg += avgPDmg * (100 - presist) / 100;
        }

        if (avgDmg > 0 && (!isUndead || !buffDamageInfo[sk].undeadOnly) && sk !== sdk.skills.StaticField) {
          let resist = this.monsterResist(unit, buffDamageInfo[sk].type);
          let pierce = GameData.myReference.getStat(this.pierceMap[buffDamageInfo[sk].type]);

          if (this.convictionEligible[buffDamageInfo[sk].type]) {
            resist -= (resist >= 100 ? conviction / 5 : conviction);
          }

          if (resist < 100) {
            resist = Math.max(-100, resist - pierce);
          } else {
            resist = 100;
          }

          tmpDmg += avgDmg * (100 - resist) / 100;
        }

        if (this.buffs[sk] === 1) {
          buffDmg[this.buffs[sk]] += tmpDmg;
        } else {
          buffDmg[this.buffs[sk]] = Math.max(buffDmg[this.buffs[sk]], tmpDmg);
        }
      }

      buffDmg = buffDmg.reduce(function (t, v) {
        return t + v;
      }, 0);

      for (let sk in skillDamageInfo) {
        if (!this.ignoreSkill[sk]) {
          let avgPDmg = (skillDamageInfo[sk].pmin + skillDamageInfo[sk].pmax) / 2, totalDmg = buffDmg;
          let avgDmg = (skillDamageInfo[sk].min + skillDamageInfo[sk].max) / 2;

          if (avgPDmg > 0 && sk !== sdk.skills.StaticField) {
            let presist = this.monsterResist(unit, "Physical");

            presist -= (presist >= 100 ? ampDmg / 5 : ampDmg);
            presist = Math.max(-100, Math.min(100, presist));
            totalDmg += avgPDmg * (100 - presist) / 100;
          }

          if (avgDmg > 0 && (!isUndead || !skillDamageInfo[sk].undeadOnly)) {
            let resist = this.monsterResist(unit, skillDamageInfo[sk].type);
            let pierce = GameData.myReference.getStat(this.pierceMap[skillDamageInfo[sk].type]);

            if (this.convictionEligible[skillDamageInfo[sk].type]) {
              resist -= (resist >= 100 ? conviction / 5 : conviction);
            }

            if (resist < 100) {
              resist = Math.max(-100, resist - pierce);
            } else {
              resist = 100;
            }

            totalDmg += sk !== sdk.skills.StaticField && 0 || avgDmg * (100 - resist) / 100;

          }

          let tmpEffort = Math.ceil(hp / totalDmg);

          tmpEffort /= this.dmgModifier(sk | 0, unit);

          // care for mana
          if (GameData.myReference.mp < Skill.getManaCost(sk)) {
            tmpEffort *= 5; // More effort in a skill we dont have mana for
          }

          // check valid location, blizzard and meteor fail over lava
          if ([sdk.skills.Blizzard, sdk.skills.Meteor].indexOf(sk) && !Attack.validSpot(unit.x, unit.y, sk, unit.classid)) {
            tmpEffort *= 5;
          }

          if (tmpEffort <= eret.effort) {
            eret.effort = tmpEffort;
            eret.skill = sk | 0;
            eret.type = skillDamageInfo[eret.skill].type;
            eret.name = getSkillById(eret.skill);
            eret.cooldown = this.skillCooldown(sk | 0);
            allData.unshift(copyObj(eret));
          }
        }
      }
      if (allData.length) return allData;
      if (eret.skill >= 0) return eret;
      return null;
    },
    areaEffort: function (areaID, skills) {
      let effortpool = 0, raritypool = 0, dmgAcc = 0;

      skills = skills || this.allSkillDamage();

      AreaData.get(areaID).forEachMonsterAndMinion(function (mon, rarity, parent) {
        effortpool += rarity * GameData.monsterEffort(mon.Index, areaID, skills, parent && parent.Index).effort;
        raritypool += rarity;

        dmgAcc += rarity * GameData.monsterAvgDmg(mon.Index, areaID);
      });

      // console.debug('avg dmg '+ AreaData.get(areaID).LocaleString+' -- ' + dmgAcc+' -- ' + avgDmg);

      return (raritypool ? effortpool / raritypool : Infinity);
    },
    areaSoloExp: function (areaID, skills) {
      let procentageBroke = ((100 - Math.min(100, Math.max(0, (100 / (Config.LowGold || 1) * me.gold)))));
      let brokeness = 1 + (procentageBroke / 100 / 3 * 1);
      let effortpool = 0, raritypool = 0, dmgAcc = 0;

      skills = skills || this.allSkillDamage();
      AreaData.get(areaID).forEachMonsterAndMinion(function (mon, rarity, parent) {
        let monExp = GameData.monsterExp(mon.Index, areaID);
        let lvlMod = GameData.levelModifier(GameData.myReference.charlvl, GameData.monsterLevel(mon.Index, areaID));
        let monEffort = GameData.monsterEffort(mon.Index, areaID, skills, parent && parent.Index).effort;
        effortpool += rarity * monExp * lvlMod / monEffort;
        raritypool += rarity;

        dmgAcc += (rarity * GameData.monsterAvgDmg(mon.Index, areaID));
      });

      let log = 1, avgDmg = 0;
      if (brokeness !== 1) {
        log = ((5 - Math.log(areaID)) * (brokeness * 0.6));
        avgDmg = (raritypool ? dmgAcc / raritypool : Infinity) * log;
      }

      return (raritypool ? effortpool / raritypool : 0) - (avgDmg);
    },
    mostUsedSkills: function (force = false) {
      if (!force && GameData.myReference.hasOwnProperty("__cachedMostUsedSkills")
        && GameData.myReference.__cachedMostUsedSkills) {
        return GameData.myReference.__cachedMostUsedSkills;
      }

      const effort = [], uniqueSkills = [];
      for (let i = 50; i < 120; i++) {
        try {
          effort.push(GameData.monsterEffort(i, sdk.areas.ThroneofDestruction));
        } catch (e) {
          /*dontcare*/
        }
      }

      effort
        .filter(e => e !== null && typeof e === "object" && e.hasOwnProperty("skill"))
        .filter(x => GameData.myReference.getSkill(x.skill, 0)) // Only skills where we have hard points in
        .filter(x => Skills.class[x.skill] < 7) // Needs to be a skill of a class, not my class but a class
        .map(x =>
          // Search for this unique skill
          (
            uniqueSkills.find(u => u.skillId === x.skill)
            // Or add it and return the value
            || (
              (
                uniqueSkills.push({ skillId: x.skill, used: 0 })
                && false
              )
              || uniqueSkills[uniqueSkills.length - 1]
            )
          ).used++ && false
          // In the end always return x
          || x
        );

      return (GameData.myReference.__cachedMostUsedSkills = uniqueSkills.sort((a, b) => b.used - a.used));
    },

    attackStartingFrame: function (weaponClass, charClass = GameData.myReference.classid) {
      // amazon and sorceress only
      /*
        Weapon:        hth 1hs 2hs 1ht 2ht stf bow xbw
        StartingFrame: 1   2   2   2   2   2   0   0
      */
      if (charClass === sdk.player.class.Amazon || charClass === sdk.player.class.Sorceress) {
        if (weaponClass === "hth") return 1;
        if (["1hs", "2hs", "1ht", "2ht", "stf"].includes(weaponClass)) return 2;
      }
      return 0;
    },

    /*weaponSpeedModifier: function (weapon1Code, charClass = GameData.myReference.classid, weapon2Code = null) {
      let weapons = new CSV("sdk/txt/weapons.txt");
      let weapon1Data = weapons.findObject("code", weapon1Code);
      if (!weapon2Code) {
        return weapon1Data.speed;
      }
      let weapon2Data = weapons.findObject("code", weapon2Code);
      if (!weapon2Data) {
        return weapon1Data.speed;
      }
      return (weapon1Data.speed + weapon2Data.speed) / 2;
    },*/

    attackModeForSkill: function (skillId, charClass = GameData.myReference.classid) {
      //TODO:
      if (skillId === sdk.skills.Smite) return "S1";
      /*
        A1:
        normal attack or attack skills like
        "bow and crossbow" skills, energy strike, chain lightning strike, charged strike,
        opposing tiger strike, cobra strike, phoenix strike
        Slash, paralyze, concentrate, amok
        barbarian rage,
        mangle , fire claws , anger poison dagger
        victim, zeal, revenge, conversion

        A2:
        normal attack

        KK: kick (kick barrel) or assassin skills dragon claw, dragon tail

        S1: skill 1
        (evade, avoid, escape)
        shield attack smite

        S2: skill 2
        stationary traps, fire blast , Shock net, blade guard

        S3: skill 3
        Secondary blow of the barbarian with dual weapons
        Hunger, rabies

        S4:
        Secondary blow of the assassin with dual claws
        Secondary throw of the barbarian dual throwing

        TH:
        Throw
        poison throwing spear, lightning strike, plague throwing spit, flashing mischief
      */
      return "A1";
    },

    weaponAttackAnimationSpeed: function (baseRate, skill, weaponClass, charClass = GameData.myReference.classid, shiftState = null) {
      /*if (shiftState == "bear") {
        let framesPerDirection = this.weaponFramesPerDirection(skill, weaponClass, charClass);
        let baseSpeed = this.weaponAttackAnimationSpeed(baseRate, skill, weaponClass, charClass);
        let weaponIAS = 0;
        let weaponSpeedModifier = 0;
        let delay = baseRate * framesPerDirection / ((256 + weaponIAS - weaponSpeedModifier) * baseSpeed ​​/ 100);
        return baseRate*
      }*/
      //TODO: vampire form or werewolf
      let attackMode = this.attackModeForSkill(skill, charClass);
      switch (true) {
      case charClass === sdk.player.class.Assassin && attackMode.startsWith("A") && weaponClass.startsWith("ht") && weaponClass !== "hth":
        return 208;
      case charClass === sdk.player.class.Assassin && attackMode === "S2":
        return 128;
      case charClass === sdk.player.class.Assassin && attackMode === "S4" && weaponClass === "ht2":
        return 208;
      }
      // wolf or bear :
      //AnimationSpeed ​​= [Hitshift * NeutralFrames / Delay]
      return 256;
    },

    weaponFramesPerDirection: function (skill, weaponClass, charClass = GameData.myReference.classid) {
      let attackMode = this.attackModeForSkill(skill, charClass);
      /*
      2HT = “2 Hand Thrust” Spear
      STF = “Staff” Staff, Large Axe, Maul, Pole arm
      2HS = “2 Hand Swing” 2-Handed Sword
      BOW = “Bow” Bow
      XBW = “Crossbow” Crossbow
      HT1 = “One Hand-to-Hand” Shield + Claws
      HT2 = “”Two Hand-to-Hand” Claws + Claws
      1HT = “1 Hand Thrust” Shield + (Throwing potion, Knife, Throwing Knife, Javelin)
      1HS = “1 Hand Swing” Shield + (Axe, Wand, Club, Scepter, Mace, Hammer, Sword, Throwing Axe, Orb)
      HTH = “Hand To Hand” Shield + no weapon
      1SS = “Left Swing Right Swing” Left = 1HS, Right = 1HS
      1JT = “Left Jab Right Thrust” Left = 1HT, Right = 1HT
      1ST = “Left Swing Right Thrust” Left = 1HS, Right = 1HT
      1JS = “Left Jab Right Swing” Left = 1HT, Right = 1HS
      */

      /*
            Amazon 		Assassin	Barbarian	Druid		Necromancer		Paladin		Sorceress
      A1 HTH      08 13 256   06 11 256   06 12 256   08 16 256   08 15 256       07 14 256   09 16 256
      A2 HTH      ---         06 12 256   ---         ---         ---             ---         08 16 256
      A1 HTx                  06 11 208
      A2 HTx                  06 12 208
      A1 1HS      10 16 256   07 15 256   07 16 256   09 19 256   09 19 256       07 15 256   12 20 256
      A1 2HS      12 20 256   11 23 256   08 18 256   10 21 256   11 23 256       08 18 256   14 24 256
      A2 2HS      ---         ---         ---         ---         ---             08 19 256   ---
      A1 1HT      09 15 256   07 15 256   07 16 256   08 19 256   09 19 256       08 17 256   11 19 256
      A1 2HT      11 18 256   10 23 256   09 19 256   09 23 256   10 24 256       08 20 256   13 23 256
      A2 2HT      ---         ---         ---         ---         ---             09 20 256   ---
      A1 STF      12 20 256   09 19 256   09 19 256   09 17 256   11 20 256       09 18 256   11 18 256
      A1 BOW      06 14 256   07 16 256   07 15 256   08 16 256   09 18 256       08 16 256   09 17 256
      A1 XBW      09 20 256   10 21 256   10 20 256   10 20 256   11 20 256       10 20 256   11 20 256

      TH xxx      09 16 256   07 16 256   08 16 256   08 18 256   10 20 256       08 16 256   10 20 256
      KK xxx                  04 13 256

      S1 xxx      xx 09 256                                                       07 12 256
      S2 xxx                  04 08 128
      S3 1Jx                              08 12 256
      S3 1Sx                              07 12 256
      S4 1Jx                              08 16 256
      S4 1Sx                              09 16 256
      S4 HT2                  06 12 208

      -------------------------------------------------- ------------------------------------------------
            Werewolf      bear           fetish       vampire
      A1 xxx      07 13 xxx     07 12 xxx      08 12 256    09 14 176
      S3 xxx      06 10 xxx     06 10 xxx
      NU xxx      xx 09 xxx     xx 10 xxx

      -------------------------------------------------- ------------------------------------------------
            Rogue         City Guard    Eisenwolf     Barbarian Mercenary
      A1 xxx      06 15 256     11 16 256     06 15 256     05/12 16 256
            */
      switch (true) {
      case charClass === sdk.player.class.Sorceress && attackMode.startsWith("A") && weaponClass === "hth":
        return 16;
      case charClass === sdk.player.class.Sorceress && attackMode === "A1" && weaponClass === "1hs":
        return 20;
      case charClass === sdk.player.class.Sorceress && attackMode.startsWith("A") && weaponClass === "2hs":
        return 24;
      case charClass === sdk.player.class.Sorceress && attackMode === "A1" && weaponClass === "1ht":
        return 19;
      case charClass === sdk.player.class.Sorceress && attackMode.startsWith("A") && weaponClass === "2ht":
        return 23;
      case charClass === sdk.player.class.Sorceress && attackMode === "A1" && weaponClass === "stf":
        return 18;
      case charClass === sdk.player.class.Sorceress && attackMode === "A1" && weaponClass === "bow":
        return 17;
      case charClass === sdk.player.class.Sorceress && attackMode === "A1" && weaponClass === "xbw":
        return 20;
      case charClass === sdk.player.class.Sorceress && attackMode === "TH":
        return 20;

      case charClass === sdk.player.class.Paladin && attackMode.startsWith("A") && weaponClass === "hth":
        return 14;
      case charClass === sdk.player.class.Paladin && attackMode === "A1" && weaponClass === "1hs":
        return 15;
      case charClass === sdk.player.class.Paladin && attackMode === "A1" && weaponClass === "2hs":
        return 18;
      case charClass === sdk.player.class.Paladin && attackMode === "A2" && weaponClass === "2hs":
        return 19;
      case charClass === sdk.player.class.Paladin && attackMode === "A1" && weaponClass === "1ht":
        return 17;
      case charClass === sdk.player.class.Paladin && attackMode === "A1" && weaponClass === "2ht":
        return 20;
      case charClass === sdk.player.class.Paladin && attackMode === "A2" && weaponClass === "2ht":
        return 20;
      case charClass === sdk.player.class.Paladin && attackMode === "A1" && weaponClass === "stf":
        return 18;
      case charClass === sdk.player.class.Paladin && attackMode === "A1" && weaponClass === "bow":
        return 16;
      case charClass === sdk.player.class.Paladin && attackMode === "A1" && weaponClass === "xbw":
        return 20;
      case charClass === sdk.player.class.Paladin && attackMode === "TH":
        return 16;
      case charClass === sdk.player.class.Paladin && attackMode === "S1":
        return 12;

        //TODO: full trag oul set
      case charClass === sdk.player.class.Necromancer && attackMode.startsWith("A") && weaponClass === "hth":
        return 15;
      case charClass === sdk.player.class.Necromancer && attackMode === "A1" && weaponClass === "1hs":
        return 19;
      case charClass === sdk.player.class.Necromancer && attackMode.startsWith("A") && weaponClass === "2hs":
        return 23;
      case charClass === sdk.player.class.Necromancer && attackMode === "A1" && weaponClass === "1ht":
        return 19;
      case charClass === sdk.player.class.Necromancer && attackMode.startsWith("A") && weaponClass === "2ht":
        return 24;
      case charClass === sdk.player.class.Necromancer && attackMode === "A1" && weaponClass === "stf":
        return 20;
      case charClass === sdk.player.class.Necromancer && attackMode === "A1" && weaponClass === "bow":
        return 18;
      case charClass === sdk.player.class.Necromancer && attackMode === "A1" && weaponClass === "xbw":
        return 20;
      case charClass === sdk.player.class.Necromancer && attackMode === "TH":
        return 20;

      case this.shiftState() === "wolf" && attackMode === "A1":
        return 13;
      case this.shiftState() === "wolf" && attackMode === "S3":
        return 10;

      case this.shiftState() === "bear" && attackMode === "A1":
        return 12;
      case this.shiftState() === "bear" && attackMode === "S3":
        return 10;

      case charClass === sdk.player.class.Druid && attackMode.startsWith("A") && weaponClass === "hth":
        return 16;
      case charClass === sdk.player.class.Druid && attackMode === "A1" && weaponClass === "1hs":
        return 19;
      case charClass === sdk.player.class.Druid && attackMode.startsWith("A") && weaponClass === "2hs":
        return 21;
      case charClass === sdk.player.class.Druid && attackMode === "A1" && weaponClass === "1ht":
        return 19;
      case charClass === sdk.player.class.Druid && attackMode.startsWith("A") && weaponClass === "2ht":
        return 23;
      case charClass === sdk.player.class.Druid && attackMode === "A1" && weaponClass === "stf":
        return 17;
      case charClass === sdk.player.class.Druid && attackMode === "A1" && weaponClass === "bow":
        return 16;
      case charClass === sdk.player.class.Druid && attackMode === "A1" && weaponClass === "xbw":
        return 20;
      case charClass === sdk.player.class.Druid && attackMode === "TH":
        return 18;

      case charClass === sdk.player.class.Barbarian && attackMode.startsWith("A") && weaponClass === "hth":
        return 12;
      case charClass === sdk.player.class.Barbarian && attackMode === "A1" && weaponClass === "1hs":
        return 16;
      case charClass === sdk.player.class.Barbarian && attackMode.startsWith("A") && weaponClass === "2hs":
        return 18;
      case charClass === sdk.player.class.Barbarian && attackMode === "A1" && weaponClass === "1ht":
        return 16;
      case charClass === sdk.player.class.Barbarian && attackMode.startsWith("A") && weaponClass === "2ht":
        return 19;
      case charClass === sdk.player.class.Barbarian && attackMode === "A1" && weaponClass === "stf":
        return 19;
      case charClass === sdk.player.class.Barbarian && attackMode === "A1" && weaponClass === "bow":
        return 15;
      case charClass === sdk.player.class.Barbarian && attackMode === "A1" && weaponClass === "xbw":
        return 20;
      case charClass === sdk.player.class.Barbarian && attackMode === "TH":
        return 16;
      case charClass === sdk.player.class.Barbarian && attackMode === "S3":
        return 12;
      case charClass === sdk.player.class.Barbarian && attackMode === "S4":
        return 16;

      case charClass === sdk.player.class.Assassin && attackMode === "A1" && weaponClass.startsWith("ht"):
        return 11;
      case charClass === sdk.player.class.Assassin && attackMode === "A2" && weaponClass.startsWith("ht"):
        return 12;
      case charClass === sdk.player.class.Assassin && attackMode === "A1" && weaponClass === "1hs":
        return 15;
      case charClass === sdk.player.class.Assassin && attackMode.startsWith("A") && weaponClass === "2hs":
        return 23;
      case charClass === sdk.player.class.Assassin && attackMode === "A1" && weaponClass === "1ht":
        return 15;
      case charClass === sdk.player.class.Assassin && attackMode.startsWith("A") && weaponClass === "2ht":
        return 23;
      case charClass === sdk.player.class.Assassin && attackMode === "A1" && weaponClass === "stf":
        return 19;
      case charClass === sdk.player.class.Assassin && attackMode === "A1" && weaponClass === "bow":
        return 16;
      case charClass === sdk.player.class.Assassin && attackMode === "A1" && weaponClass === "xbw":
        return 21;
      case charClass === sdk.player.class.Assassin && attackMode === "TH":
        return 16;
      case charClass === sdk.player.class.Assassin && attackMode === "KK":
        return 13;
      case charClass === sdk.player.class.Assassin && attackMode === "S2":
        return 8;
      case charClass === sdk.player.class.Assassin && attackMode === "S4" && weaponClass === "ht2":
        return 12;

      case charClass === sdk.player.class.Amazon && attackMode.startsWith("A") && weaponClass === "hth":
        return 13;
      case charClass === sdk.player.class.Amazon && attackMode === "A1" && weaponClass === "1hs":
        return 16;
      case charClass === sdk.player.class.Amazon && attackMode.startsWith("A") && weaponClass === "2hs":
        return 20;
      case charClass === sdk.player.class.Amazon && attackMode === "A1" && weaponClass === "1ht":
        return 15;
      case charClass === sdk.player.class.Amazon && attackMode.startsWith("A") && weaponClass === "2ht":
        return 18;
      case charClass === sdk.player.class.Amazon && attackMode === "A1" && weaponClass === "stf":
        return 20;
      case charClass === sdk.player.class.Amazon && attackMode === "A1" && weaponClass === "bow":
        return 14;
      case charClass === sdk.player.class.Amazon && attackMode === "A1" && weaponClass === "xbw":
        return 20;
      case charClass === sdk.player.class.Amazon && attackMode === "TH":
        return 16;
      case charClass === sdk.player.class.Amazon && attackMode === "S1":
        return 9;
      }
      return -1;
    },

    // attackFrames: function (skillId, weaponCode, ias = GameData.myReference.getStat(sdk.stats.Fasterattackrate), charClass = GameData.myReference.classid, weapon2Code = null) {
    // 	// https://diablo3.ingame.de/forum/threads/1218516-FAQ-Bewegungs-und-Animationsgeschwindigkeiten-Teil-2?s=&postid=17610874
    // 	/*
    // 	TODO
    // 		bear or wolf only :

    // 		frames = {(256 * framesPerDirection) / [animationSpeed ​​* (100 + effectiveIAS + skillsIAS - weaponSpeedModifier + coldEffect) / 100]} - 1

    // 		where :
    // 		animationSpeed ​​= 256 * NeutralFrames / delay
    // 		delay = 256 * CharFrames / ((100 + weaponIAS - weaponSpeedModifier) * CharSpeed ​​/ 100)

    // 		framesPerDirection ... The sum of all frames of our attack animation of the Werform.
    // 		NeutralFrames ... Sum of the frames of our neutral animation (use while standing).
    // 		CharFrames ... The sum of all frames of the attack animation that we would use in the unchanged state (with the exception of two-handed swords).
    // 		CharSpeed ​​... This is the animation speed of the attack animation that the unchanged character would use.
    // 		weaponIAS ... All IAS on our weapon or weapon base
    // 	*/
    // 	let weaponData = (new CSV("sdk/txt/weapons.txt")).findObject("code", weaponCode);
    // 	if (!weaponData) {
    // 		console.log(sdk.colors.Orange + "No weapon data found for code " + weaponCode);
    // 	}
    // 	let weaponClass = weaponData.wclass;
    // 	let baseRate = 100;
    // 	const BASE_ANIMATION_SPEED = 256;

    // 	let animationSpeed = this.weaponAttackAnimationSpeed(baseRate, weaponClass, charClass, this.shiftState());
    // 	let effectiveIAS = 120 * ias / (120 + ias);
    // 	let skillsIAS = 0; //TODO: fanaticism or other sills bonus + slowdown skills malus
    // 	let weaponSpeedModifier = (typeof weaponData.speed == "string") ? isNaN(parseInt(weaponData.speed)) ? 0 : parseInt(weaponData.speed) : weaponData.speed;// this.weaponSpeedModifier(weaponCode, charClass, weapon2Code);
    // 	// me.getState(sdk.states.Frozen) or me.getState(sdk.states.Cold) ?
    // 	let coldEffect = GameData.myReference.getState(sdk.states.Frozen) ? -50 : 0; // If we are affected by cold, as a player we receive a penalty of 50.
    // 	let acceleration = baseRate + effectiveIAS + skillsIAS - weaponSpeedModifier + coldEffect;
    // 	acceleration = Math.min(175, Math.max(15, acceleration));
    // 	let startingFrame = this.attackStartingFrame(weaponClass, charClass);
    // 	let framesPerDirection = this.weaponFramesPerDirection(skillId, weaponClass, charClass);
    // 	if (framesPerDirection < 1) {
    // 		console.log(sdk.colors.Orange + "wrong value for framesPerDirection, IAS calculation may be wrong");
    // 	}

    // 	console.log("skillId " + skillId);
    // 	console.log("charClass " + charClass);
    // 	console.log("weaponCode " + weaponCode);
    // 	console.log("weaponClass " + weaponClass);
    // 	console.log("ias " + ias);
    // 	console.log("effectiveIAS " + effectiveIAS);
    // 	console.log("skillsIAS " + skillsIAS);
    // 	console.log("weaponSpeedModifier " + weaponSpeedModifier);
    // 	console.log("coldEffect " + coldEffect);
    // 	console.log("acceleration " + acceleration);
    // 	console.log("startingFrame " + startingFrame);
    // 	console.log("framesPerDirection " + framesPerDirection);
    // 	let frames = Math.ceil(BASE_ANIMATION_SPEED * (framesPerDirection - startingFrame) / Math.floor(animationSpeed * acceleration / 100)) - 1;
    // 	return frames;
    // },

    // attackDuration: function (skillId, weaponCode, ias = GameData.myReference.getStat(sdk.stats.Fasterattackrate), charClass = GameData.myReference.classid, weapon2Code = null) {
    // 	// https://diablo3.ingame.de/forum/threads/1218516-FAQ-Bewegungs-und-Animationsgeschwindigkeiten-Teil-2?s=&postid=17610874
    // 	return this.attackFrames(skillId, weaponCode, ias, charClass) / 25;
    // },
    timeTillMissleImpact: function (skillId, monster) {
      if (monster === undefined || skillId === undefined || !monster.attackable) return 0;
      let missileName = getBaseStat("skills", skillId, "cltmissile");
      let missile = MissileData[missileName];
      if (!missile) {
        missileName = getBaseStat("skills", skillId, "srvmissile");
        missile = MissileData[missileName];
      }
      if (missile && missile.velocity > 0) {
        const missileVelocityTPS = missile.velocity;
        const missileVelocityTPF = missileVelocityTPS / 25;
        const distanceForMissile = getDistance(me, monster);
        // too far for missile to reach this position
        if (distanceForMissile > missile.range) return 0;
        const castTimeS = me.castingDuration(skillId);
        return ((distanceForMissile / ((missileVelocityTPS / 32) * 25)) + castTimeS);
      }
      return 0;
    }
  };

  function calculateKillableFallensByFrostNova () {
    if (!Skill.canUse(sdk.skills.FrostNova)) return 0;
    const fallens = [
      sdk.monsters.Fallen, sdk.monsters.Carver2,
      sdk.monsters.Devilkin2, sdk.monsters.DarkOne1,
      sdk.monsters.WarpedFallen, sdk.monsters.Carver1,
      sdk.monsters.Devilkin, sdk.monsters.DarkOne2
    ];
    let area = me.area;
    return getUnits(sdk.unittype.Monster)
      .filter(function (unit) {
        return !!unit && fallens.includes(unit.classid) && unit.distance < 7;
      })
      .filter(function (unit) {
        return unit.attackable
        && typeof unit.x === "number" // happens if monster despawns
        && !checkCollision(me, unit, Coords_1.Collision.BLOCK_MISSILE)
        && unit.getStat(sdk.stats.ColdResist) < 100;
        //&& !unit.getState(sdk.states.Frozen);
      })
      .reduce(function (acc, cur) {
        let classId = cur.classid, minDmg = GameData.skillDamage(sdk.skills.FrostNova, cur).min;
        //let charLvl = GameData.monsterLevel(classId, area);
        let currentHealth = GameData.monsterMaxHP(classId, area, cur.charlvl - GameData.monsterLevel(classId, area)) / 100 * (cur.hp * 100 / cur.hpmax);
        if (currentHealth < minDmg) {
          acc++;
        }
        return acc;
      }, 0);
  }

  function calculateKillableSummonsByNova () {
    if (!Skill.canUse(sdk.skills.Nova)) return 0;
    const summons = [
      sdk.monsters.Fallen, sdk.monsters.Carver2,
      sdk.monsters.Devilkin2, sdk.monsters.DarkOne1,
      sdk.monsters.WarpedFallen, sdk.monsters.Carver1,
      sdk.monsters.Devilkin, sdk.monsters.DarkOne2,
      sdk.monsters.BurningDead, sdk.monsters.Returned1,
      sdk.monsters.Returned2, sdk.monsters.BoneWarrior1, sdk.monsters.BoneWarrior2
    ];
    return getUnits(sdk.unittype.Monster)
      .filter(function (unit) {
        return !!unit && summons.includes(unit.classid) && unit.distance < 7;
      })
      .filter(function (unit) {
        return unit.attackable
        && typeof unit.x === "number" // happens if monster despawns
        && !checkCollision(me, unit, Coords_1.Collision.BLOCK_MISSILE)
        && Attack.checkResist(unit, "lightning");
      })
      .reduce(function (acc, cur) {
        let classId = cur.classid, areaId = cur.area, minDmg = GameData.skillDamage(sdk.skills.Nova, cur).min;
        let currentHealth = GameData.monsterMaxHP(classId, areaId, cur.charlvl - GameData.monsterLevel(classId, areaId)) / 100 * (cur.hp * 100 / cur.hpmax);
        if (currentHealth < minDmg) {
          acc++;
        }
        return acc;
      }, 0);
  }

  Object.defineProperty(Unit.prototype, "currentVelocity", {
    get: function () {
      if (!this.isMoving || this.isFrozen) return 0;
      const velocity = this.isRunning
        ? MonsterData.get(this.classid).Run
        : MonsterData.get(this.classid).Velocity;
      if (this.isChilled) {
        let malus = MonsterData.get(this.classid).ColdEffect;
        (malus > 0) && (malus = malus - 256);
        return Math.max(1, ~~(velocity * (1 + malus)));
      }
      return velocity;
    }
  });

  /**
   * @param {number} skillId 
   * @param {Monster} monster 
   * @returns {PathNode}
   */
  function targetPointForSkill (skillId, monster) {
    if (!monster || skillId === undefined || !monster.attackable) return null;
    let missileName = getBaseStat("skills", skillId, "cltmissile");
    let missile = MissileData[missileName];
    if (!missile) {
      missileName = getBaseStat("skills", skillId, "srvmissile");
      missile = MissileData[missileName];
    }
    if (!missile || missile.velocity <= 0) return null;
    if (monster.isMoving && (monster.targetx !== me.x || monster.targety !== me.y)) {
      let startX = monster.x;
      let startY = monster.y;
      // tiles per second velocities
      // ToDo: is monster slowed by freeze or something ?
      let monsterVelocityTPS = monster.currentVelocity;
      let missileVelocityTPS = missile.velocity;
      // tiles per frame velocities
      let monsterVelocityTPF = monsterVelocityTPS / 25;
      let missileVelocityTPF = missileVelocityTPS / 25;
      //console.log("monster is moving to "+monster.targetx+", "+monster.targety + " at speed "+monsterVelocity);
      let path = getPath(monster.area, startX, startY, monster.targetx, monster.targety, 2, 1);
      if (path && path.length) {
      // path is reversed from target to monster, we will check from last path position (target) to monster position
        path.reverse();
        let [diffS, diffF, found] = [0, 0, 0];
        let time = { missile: {}, monster: {} };
        for (let i = 0; i < path.length; i++) {
          let pos = path[i];
          // ToDo : does missile spawn at me position ?
          let distanceForMissile = getDistance(me, pos);
          if (distanceForMissile > missile.range) {
          // too far for missile to reach this position
            continue;
          }
          let distanceForMonster = getDistance({ x: startX, y: startY }, pos);
          let timeForMonsterF = distanceForMonster / monsterVelocityTPF;
          // time in seconds
          // let castTimeS = GameData.castingDuration(skillId);
          // let timeForMissileS = distanceForMissile / missileVelocityTPS + castTimeS;
          // time in frames
          let castTimeF = me.castingFrames(skillId);
          let timeForMissileF = distanceForMissile / missileVelocityTPF + castTimeF;
          // let timeForMonsterS = distanceForMonster / monsterVelocityTPS;
          // Todo: missile and monster size
          // diff seconds
          // diffS = timeForMissileS-timeForMonsterS;
          // diff frames
          diffF = timeForMissileF - timeForMonsterF;
          // diff > 0 : missile will reach pos after monster
          // diff < 0 : missile will reach pos before monster
          // console.log("time for monster to reach "+pos+" = "+timeForMonster);
          // console.log("time for missile to reach "+pos+" = "+timeForMissile);
          // console.log("diff = "+diff)
          if (i === 0 && diffF >= 0) {
          // last path position and missile is late, we can't predict next monster target, shoot at last path position
          // it may fail because monster may be moving at other target while missile is arriving
          // console.log("missile will be too late");
            found = pos;
            // time.missile.seconds = timeForMissileS;
            time.missile.frames = timeForMissileF;
            // time.monster.seconds = timeForMonsterS;
            time.monster.frames = timeForMonsterF;
            break;
          }
          // the number of frames needed for unit to move 1 tile
          let timeToMoveOneTileMonsterF = 1 / monsterVelocityTPF;
          // let timeToMoveOneTileMissileF = 1 / missileVelocityTPF;
          // while missile is travelling, monster will continue to move
          // if the difference is greater than the time a monster will move 1 tile, the missile will miss
          // todo: monster size, missile size
          if (diffF >= -1 * timeToMoveOneTileMonsterF && diffF <= 1 * timeToMoveOneTileMonsterF) {
            found = pos;
            // time.missile.seconds = timeForMissileS;
            time.missile.frames = timeForMissileF;
            // time.monster.seconds = timeForMonsterS;
            time.monster.frames = timeForMonsterF;
            break;
          }
        }
        if (found) {
          // console.log("missile will hit monster in "+time.missile.seconds+" ("+time.missile.frames+") at "+found.x+", "+found.y);
          // console.log("time for monster = "+time.monster.seconds+ " ("+time.monster.frames+")")
          // console.log("diff missile-monster = "+diffS+ " ("+diffF+")");
          return found;
        }
      }
    }
    return null;
  }

  // Export data
  GameData.isEnemy = isEnemy;
  GameData.isAlive = isAlive;
  GameData.onGround = onGround;
  GameData.calculateKillableFallensByFrostNova = calculateKillableFallensByFrostNova;
  GameData.calculateKillableSummonsByNova = calculateKillableSummonsByNova;
  GameData.targetPointForSkill = targetPointForSkill;
  module.exports = GameData;
})(module, require);
