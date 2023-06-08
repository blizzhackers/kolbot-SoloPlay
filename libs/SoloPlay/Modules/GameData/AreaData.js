/**
*  @filename    AreaData.js
*  @author      theBGuy
*  @credits     Nishimura-Katsuo (orignal module), kolton (data from pather.js)
*  @desc        area data library
*
*/

(function (module, require) {
  const MonsterData = require("../../../core/GameData/MonsterData");
  const ShrineData = require("../../../core/GameData/ShrineData");
  const QuestData = require("../../../core/GameData/QuestData");
  const MONSTER_KEYS = [
    ["mon1", "mon2", "mon3", "mon4", "mon5", "mon6", "mon7", "mon8", "mon9", "mon10"],
    ["nmon1", "nmon2", "nmon3", "nmon4", "nmon5", "nmon6", "nmon7", "nmon8", "nmon9", "nmon10"],
  ][me.diff && 1]; // mon is for normal, nmon is for nm/hell, umon is specific to picking champion/uniques in normal
  const AREA_INDEX_COUNT = 137;

  /**
   * @todo Still need to handle exits
   */
  const AreaData = (function () {
    /** @type {Map<number, AreaDataInstance>} */
    const _map = new Map();
    /** @type {Map<number, number>} */
    const wps = new Map();
    
    /**
     * @typedef {Object} AreaInterface
     * @property {number[]} [previousArea]
     * @property {number[]} [nextArea]
     * @property {number[]} [presetMonsters]
     * @property {number[]} [presetChests]
     * @property {number[]} [poi]
     * @property {function(): boolean} [preReq]
     */
    
    /** @type {Map<number, AreaInterface>} */
    const _areaData = new Map([
      // Act 1
      [sdk.areas.RogueEncampment, {
        nextArea: [sdk.areas.BloodMoor],
        preReq: function () {
          return true;
        }, // always able to access
      }],
      [sdk.areas.BloodMoor, {
        previousArea: [sdk.areas.RogueEncampment],
        nextArea: [sdk.areas.ColdPlains, sdk.areas.DenofEvil],
        presetChests: [sdk.objects.SuperChest],
      }],
      [sdk.areas.ColdPlains, {
        previousArea: [sdk.areas.BloodMoor],
        nextArea: [sdk.areas.StonyField, sdk.areas.BurialGrounds, sdk.areas.CaveLvl1],
      }],
      [sdk.areas.StonyField, {
        previousArea: [sdk.areas.ColdPlains],
        nextArea: [sdk.areas.UndergroundPassageLvl1, sdk.areas.Tristram],
        presetMonsters: [sdk.monsters.preset.Rakanishu],
        poi: [
          sdk.objects.StoneAlpha, sdk.objects.StoneBeta,
          sdk.objects.StoneGamma, sdk.objects.StoneDelta,
          sdk.objects.StoneLambda, sdk.objects.StoneTheta,
          sdk.objects.MoldyTome,
        ],
      }],
      [sdk.areas.DarkWood, {
        previousArea: [sdk.areas.UndergroundPassageLvl1],
        nextArea: [sdk.areas.BlackMarsh],
        presetMonsters: [sdk.monsters.preset.TreeheadWoodFist],
        poi: [sdk.objects.InifussTree],
      }],
      [sdk.areas.BlackMarsh, {
        previousArea: [sdk.areas.DarkWood],
        nextArea: [sdk.areas.ForgottenTower, sdk.areas.HoleLvl1],
      }],
      [sdk.areas.TamoeHighland, {
        previousArea: [sdk.areas.BlackMarsh],
        nextArea: [sdk.areas.MonasteryGate, sdk.areas.PitLvl1],
      }],
      [sdk.areas.DenofEvil, {
        previousArea: [sdk.areas.BloodMoor],
        presetMonsters: [sdk.monsters.preset.Corpsefire],
      }],
      [sdk.areas.CaveLvl1, {
        previousArea: [sdk.areas.ColdPlains],
        nextArea: [sdk.areas.CaveLvl2],
        presetMonsters: [sdk.monsters.preset.Coldcrow],
      }],
      [sdk.areas.UndergroundPassageLvl1, {
        previousArea: [sdk.areas.StonyField],
        nextArea: [sdk.areas.UndergroundPassageLvl2, sdk.areas.DarkWood],
      }],
      [sdk.areas.HoleLvl1, {
        previousArea: [sdk.areas.BlackMarsh],
        nextArea: [sdk.areas.HoleLvl2],
      }],
      [sdk.areas.PitLvl1, {
        previousArea: [sdk.areas.TamoeHighland],
        nextArea: [sdk.areas.PitLvl2],
      }],
      [sdk.areas.CaveLvl2, {
        previousArea: [sdk.areas.CaveLvl1],
        presetChests: [sdk.objects.SmallSparklyChest],
      }],
      [sdk.areas.UndergroundPassageLvl2, {
        previousArea: [sdk.areas.UndergroundPassageLvl1],
        presetChests: [sdk.objects.SmallSparklyChest],
      }],
      [sdk.areas.HoleLvl2, {
        previousArea: [sdk.areas.HoleLvl1],
        presetChests: [sdk.objects.SmallSparklyChest],
      }],
      [sdk.areas.PitLvl2, {
        previousArea: [sdk.areas.PitLvl1],
        presetChests: [sdk.objects.SmallSparklyChest],
      }],
      [sdk.areas.BurialGrounds, {
        previousArea: [sdk.areas.ColdPlains],
        nextArea: [sdk.areas.Crypt, sdk.areas.Mausoleum],
        presetMonsters: [sdk.monsters.preset.BloodRaven],
      }],
      [sdk.areas.Crypt, {
        previousArea: [sdk.areas.BurialGrounds],
        presetMonsters: [sdk.monsters.preset.Bonebreak],
        presetChests: [sdk.objects.SmallSparklyChest],
      }],
      [sdk.areas.Mausoleum, {
        previousArea: [sdk.areas.BurialGrounds],
        presetChests: [sdk.objects.SmallSparklyChest],
      }],
      [sdk.areas.ForgottenTower, {
        previousArea: [sdk.areas.BlackMarsh],
        nextArea: [sdk.areas.TowerCellarLvl1],
      }],
      [sdk.areas.TowerCellarLvl1, {
        previousArea: [sdk.areas.ForgottenTower],
        nextArea: [sdk.areas.TowerCellarLvl2],
      }],
      [sdk.areas.TowerCellarLvl2, {
        previousArea: [sdk.areas.TowerCellarLvl1],
        nextArea: [sdk.areas.TowerCellarLvl3],
      }],
      [sdk.areas.TowerCellarLvl3, {
        previousArea: [sdk.areas.TowerCellarLvl2],
        nextArea: [sdk.areas.TowerCellarLvl4],
      }],
      [sdk.areas.TowerCellarLvl4, {
        previousArea: [sdk.areas.TowerCellarLvl3],
        nextArea: [sdk.areas.TowerCellarLvl5],
      }],
      [sdk.areas.TowerCellarLvl5, {
        previousArea: [sdk.areas.TowerCellarLvl4],
        presetMonsters: [sdk.monsters.preset.TheCountess],
        presetChests: [sdk.objects.SuperChest],
      }],
      [sdk.areas.MonasteryGate, {
        previousArea: [sdk.areas.TamoeHighland],
        nextArea: [sdk.areas.OuterCloister],
      }],
      [sdk.areas.OuterCloister, {
        previousArea: [sdk.areas.MonasteryGate],
        nextArea: [sdk.areas.Barracks],
      }],
      [sdk.areas.Barracks, {
        previousArea: [sdk.areas.OuterCloister],
        nextArea: [sdk.areas.JailLvl1],
        presetMonsters: [sdk.monsters.preset.TheSmith],
        poi: [sdk.quest.chest.MalusHolder],
      }],
      [sdk.areas.JailLvl1, {
        previousArea: [sdk.areas.Barracks],
        nextArea: [sdk.areas.JailLvl2],
      }],
      [sdk.areas.JailLvl2, {
        previousArea: [sdk.areas.JailLvl1],
        nextArea: [sdk.areas.JailLvl3],
        presetMonsters: [sdk.monsters.preset.PitspawnFouldog],
      }],
      [sdk.areas.JailLvl3, {
        previousArea: [sdk.areas.JailLvl2],
        nextArea: [sdk.areas.InnerCloister],
      }],
      [sdk.areas.InnerCloister, {
        previousArea: [sdk.areas.JailLvl3],
        nextArea: [sdk.areas.Cathedral],
      }],
      [sdk.areas.Cathedral, {
        previousArea: [sdk.areas.InnerCloister],
        nextArea: [sdk.areas.CatacombsLvl1],
        presetMonsters: [sdk.monsters.preset.BoneAsh],
      }],
      [sdk.areas.CatacombsLvl1, {
        previousArea: [sdk.areas.Cathedral],
        nextArea: [sdk.areas.CatacombsLvl2],
      }],
      [sdk.areas.CatacombsLvl2, {
        previousArea: [sdk.areas.CatacombsLvl1],
        nextArea: [sdk.areas.CatacombsLvl3],
      }],
      [sdk.areas.CatacombsLvl3, {
        previousArea: [sdk.areas.CatacombsLvl2],
        nextArea: [sdk.areas.CatacombsLvl4],
      }],
      [sdk.areas.CatacombsLvl4, {
        previousArea: [sdk.areas.CatacombsLvl3],
        presetMonsters: [sdk.monsters.Andariel],
      }],
      [sdk.areas.Tristram, {
        previousArea: [sdk.areas.StonyField],
        presetMonsters: [sdk.monsters.preset.Griswold],
        presetChests: [sdk.quest.chest.Wirt],
        poi: [sdk.quest.chest.CainsJail],
        preReq: function () {
          let quest = QuestData.get(sdk.quest.id.TheSearchForCain);
          // what to do if its in a state of unable to complete but the portal is open because it's someone elses game?
          return quest.complete() || quest.checkState(4, true);
        },
      }],
      [sdk.areas.MooMooFarm, {
        previousArea: [sdk.areas.RogueEncampment],
        presetMonsters: [sdk.monsters.preset.TheCowKing],
      }],
      // Act 2
      [sdk.areas.LutGholein, {
        nextArea: [sdk.areas.A2SewersLvl1, sdk.areas.RockyWaste, sdk.areas.HaremLvl1],
        preReq: function () {
          return QuestData.get(sdk.quest.id.AbleToGotoActII).complete();
        },
      }],
      [sdk.areas.A2SewersLvl1, {
        previousArea: [sdk.areas.LutGholein],
        nextArea: [sdk.areas.A2SewersLvl2],
      }],
      [sdk.areas.A2SewersLvl2, {
        previousArea: [sdk.areas.A2SewersLvl1],
        nextArea: [sdk.areas.A2SewersLvl3],
      }],
      [sdk.areas.A2SewersLvl3, {
        previousArea: [sdk.areas.A2SewersLvl2],
        presetMonsters: [sdk.monsters.preset.Radament],
        presetChests: [sdk.quest.chest.HoradricScrollChest],
      }],
      [sdk.areas.RockyWaste, {
        previousArea: [sdk.areas.LutGholein],
        nextArea: [sdk.areas.DryHills, sdk.areas.StonyTombLvl1],
      }],
      [sdk.areas.DryHills, {
        previousArea: [sdk.areas.RockyWaste],
        nextArea: [sdk.areas.FarOasis, sdk.areas.HallsoftheDeadLvl1],
      }],
      [sdk.areas.FarOasis, {
        previousArea: [sdk.areas.DryHills],
        nextArea: [sdk.areas.LostCity, sdk.areas.MaggotLairLvl1],
        presetMonsters: [sdk.monsters.preset.Beetleburst],
      }],
      [sdk.areas.LostCity, {
        previousArea: [sdk.areas.FarOasis],
        nextArea: [sdk.areas.ValleyofSnakes, sdk.areas.AncientTunnels],
        presetMonsters: [sdk.monsters.preset.DarkElder],
        presetChests: [sdk.objects.SuperChest],
      }],
      [sdk.areas.ValleyofSnakes, {
        previousArea: [sdk.areas.LostCity],
        nextArea: [sdk.areas.ClawViperTempleLvl1],
      }],
      [sdk.areas.ClawViperTempleLvl1, {
        previousArea: [sdk.areas.ValleyofSnakes],
        nextArea: [sdk.areas.ClawViperTempleLvl2],
      }],
      [sdk.areas.ClawViperTempleLvl2, {
        previousArea: [sdk.areas.ClawViperTempleLvl1],
        presetMonsters: [sdk.monsters.preset.Fangskin],
        presetChests: [sdk.quest.chest.ViperAmuletChest],
      }],
      [sdk.areas.StonyTombLvl1, {
        previousArea: [sdk.areas.RockyWaste],
        nextArea: [sdk.areas.StonyTombLvl2],
      }],
      [sdk.areas.StonyTombLvl2, {
        previousArea: [sdk.areas.StonyTombLvl1],
        presetMonsters: [sdk.monsters.preset.CreepingFeature],
        presetChests: [sdk.objects.SmallSparklyChest],
      }],
      [sdk.areas.HallsoftheDeadLvl1, {
        previousArea: [sdk.areas.DryHills],
        nextArea: [sdk.areas.HallsoftheDeadLvl2],
      }],
      [sdk.areas.HallsoftheDeadLvl2, {
        previousArea: [sdk.areas.HallsoftheDeadLvl1],
        nextArea: [sdk.areas.HallsoftheDeadLvl3],
      }],
      [sdk.areas.HallsoftheDeadLvl3, {
        previousArea: [sdk.areas.HallsoftheDeadLvl2],
        presetMonsters: [sdk.monsters.preset.BloodwitchtheWild],
        presetChests: [sdk.quest.chest.HoradricCubeChest],
      }],
      [sdk.areas.MaggotLairLvl1, {
        previousArea: [sdk.areas.FarOasis],
        nextArea: [sdk.areas.MaggotLairLvl2],
      }],
      [sdk.areas.MaggotLairLvl2, {
        previousArea: [sdk.areas.MaggotLairLvl1],
        nextArea: [sdk.areas.MaggotLairLvl3],
      }],
      [sdk.areas.MaggotLairLvl3, {
        previousArea: [sdk.areas.MaggotLairLvl2],
        presetMonsters: [sdk.monsters.preset.ColdwormtheBurrower],
        presetChests: [sdk.quest.chest.ShaftoftheHoradricStaffChest],
      }],
      [sdk.areas.AncientTunnels, {
        previousArea: [sdk.areas.LostCity],
        presetChests: [sdk.objects.SmallSparklyChest],
      }],
      [sdk.areas.HaremLvl1, {
        previousArea: [sdk.areas.LutGholein],
        nextArea: [sdk.areas.HaremLvl2],
        preReq: function () {
          return QuestData.get(sdk.quest.id.TheTaintedSun).complete();
        },
      }],
      [sdk.areas.HaremLvl2, {
        previousArea: [sdk.areas.HaremLvl1],
        nextArea: [sdk.areas.PalaceCellarLvl1],
        preReq: function () {
          return QuestData.get(sdk.quest.id.TheTaintedSun).complete();
        },
      }],
      [sdk.areas.PalaceCellarLvl1, {
        previousArea: [sdk.areas.HaremLvl2],
        nextArea: [sdk.areas.PalaceCellarLvl2],
        preReq: function () {
          return QuestData.get(sdk.quest.id.TheTaintedSun).complete();
        },
      }],
      [sdk.areas.PalaceCellarLvl2, {
        previousArea: [sdk.areas.PalaceCellarLvl1],
        nextArea: [sdk.areas.PalaceCellarLvl3],
        preReq: function () {
          return QuestData.get(sdk.quest.id.TheTaintedSun).complete();
        },
      }],
      [sdk.areas.PalaceCellarLvl3, {
        previousArea: [sdk.areas.PalaceCellarLvl2],
        nextArea: [sdk.areas.ArcaneSanctuary],
        presetMonsters: [sdk.monsters.preset.FireEye],
        // poi the portal - add this later
        preReq: function () {
          return QuestData.get(sdk.quest.id.TheTaintedSun).complete();
        },
      }],
      [sdk.areas.ArcaneSanctuary, {
        previousArea: [sdk.areas.PalaceCellarLvl3],
        nextArea: [sdk.areas.CanyonofMagic],
        presetMonsters: [sdk.monsters.preset.TheSummoner],
        poi: [sdk.quest.chest.Journal],
        preReq: function () {
          return QuestData.get(sdk.quest.id.TheTaintedSun).complete();
        },
      }],
      [sdk.areas.CanyonofMagic, {
        nextArea: [
          sdk.areas.TalRashasTomb1, sdk.areas.TalRashasTomb2, sdk.areas.TalRashasTomb3, sdk.areas.TalRashasTomb4,
          sdk.areas.TalRashasTomb5, sdk.areas.TalRashasTomb6, sdk.areas.TalRashasTomb7,
        ],
        preReq: function () {
          return QuestData.get(sdk.quest.id.TheSummoner).complete();
        },
      }],
      [sdk.areas.TalRashasTomb1, {
        previousArea: [sdk.areas.CanyonofMagic],
        presetChests: [sdk.objects.SmallSparklyChest],
        preReq: function () {
          return QuestData.get(sdk.quest.id.TheSummoner).complete();
        },
      }],
      [sdk.areas.TalRashasTomb2, {
        previousArea: [sdk.areas.CanyonofMagic],
        presetChests: [sdk.objects.SmallSparklyChest],
        preReq: function () {
          return QuestData.get(sdk.quest.id.TheSummoner).complete();
        },
      }],
      [sdk.areas.TalRashasTomb3, {
        previousArea: [sdk.areas.CanyonofMagic],
        presetChests: [sdk.objects.SmallSparklyChest],
        preReq: function () {
          return QuestData.get(sdk.quest.id.TheSummoner).complete();
        },
      }],
      [sdk.areas.TalRashasTomb4, {
        previousArea: [sdk.areas.CanyonofMagic],
        presetChests: [sdk.objects.SmallSparklyChest],
        preReq: function () {
          return QuestData.get(sdk.quest.id.TheSummoner).complete();
        },
      }],
      [sdk.areas.TalRashasTomb5, {
        previousArea: [sdk.areas.CanyonofMagic],
        presetChests: [sdk.objects.SmallSparklyChest],
        preReq: function () {
          return QuestData.get(sdk.quest.id.TheSummoner).complete();
        },
      }],
      [sdk.areas.TalRashasTomb6, {
        previousArea: [sdk.areas.CanyonofMagic],
        presetChests: [sdk.objects.SmallSparklyChest],
        preReq: function () {
          return QuestData.get(sdk.quest.id.TheSummoner).complete();
        },
      }],
      [sdk.areas.TalRashasTomb7, {
        previousArea: [sdk.areas.CanyonofMagic],
        presetChests: [sdk.objects.SmallSparklyChest],
        preReq: function () {
          return QuestData.get(sdk.quest.id.TheSummoner).complete();
        },
      }],
      [sdk.areas.DurielsLair, {
        presetMonsters: [sdk.monsters.Duriel],
        preReq: function () {
          return QuestData.get(sdk.quest.id.TheSummoner).complete();
        },
      }],
      // Act 3
      [sdk.areas.KurastDocktown, {
        nextArea: [sdk.areas.SpiderForest],
        preReq: function () {
          return QuestData.get(sdk.quest.id.AbleToGotoActIII).complete();
        },
      }],
      [sdk.areas.SpiderForest, {
        previousArea: [sdk.areas.KurastDocktown],
        nextArea: [sdk.areas.GreatMarsh],
      }],
      [sdk.areas.GreatMarsh, {
        previousArea: [sdk.areas.SpiderForest],
        presetChests: [sdk.objects.SmallSparklyChest],
      }],
      [sdk.areas.SpiderCave, {
        previousArea: [sdk.areas.SpiderForest],
        presetChests: [sdk.objects.SmallSparklyChest],
      }],
      [sdk.areas.SpiderCavern, {
        previousArea: [sdk.areas.SpiderForest],
        presetMonsters: [sdk.monsters.preset.SszarktheBurning],
        presetChests: [sdk.quest.chest.KhalimsEyeChest],
      }],
      [sdk.areas.FlayerJungle, {
        previousArea: [sdk.areas.SpiderForest, sdk.areas.GreatMarsh],
        nextArea: [sdk.areas.LowerKurast, sdk.areas.FlayerDungeonLvl1, sdk.areas.SwampyPitLvl1],
        presetMonsters: [sdk.monsters.preset.Stormtree],
        poi: [sdk.quest.chest.GidbinnAltar],
      }],
      [sdk.areas.SwampyPitLvl1, {
        previousArea: [sdk.areas.FlayerJungle],
        nextArea: [sdk.areas.SwampyPitLvl2],
      }],
      [sdk.areas.SwampyPitLvl2, {
        previousArea: [sdk.areas.SwampyPitLvl1],
        nextArea: [sdk.areas.SwampyPitLvl3],
      }],
      [sdk.areas.SwampyPitLvl3, {
        previousArea: [sdk.areas.SwampyPitLvl2],
        presetChests: [sdk.objects.SmallSparklyChest],
      }],
      [sdk.areas.FlayerDungeonLvl1, {
        previousArea: [sdk.areas.FlayerJungle],
        nextArea: [sdk.areas.FlayerDungeonLvl2],
      }],
      [sdk.areas.FlayerDungeonLvl2, {
        previousArea: [sdk.areas.FlayerDungeonLvl1],
        nextArea: [sdk.areas.FlayerDungeonLvl3],
      }],
      [sdk.areas.FlayerDungeonLvl3, {
        previousArea: [sdk.areas.FlayerDungeonLvl2],
        presetMonsters: [sdk.monsters.preset.WitchDoctorEndugu],
        presetChests: [sdk.quest.chest.KhalimsBrainChest],
      }],
      [sdk.areas.LowerKurast, {
        previousArea: [sdk.areas.FlayerJungle],
        nextArea: [sdk.areas.KurastBazaar],
        presetChests: [sdk.objects.SuperChest],
      }],
      [sdk.areas.KurastBazaar, {
        previousArea: [sdk.areas.LowerKurast],
        nextArea: [
          sdk.areas.UpperKurast, sdk.areas.RuinedTemple,
          sdk.areas.DisusedFane, sdk.areas.A3SewersLvl1
        ],
      }],
      [sdk.areas.RuinedTemple, {
        previousArea: [sdk.areas.KurastBazaar],
        presetMonsters: [sdk.monsters.preset.BattlemaidSarina],
        presetChests: [sdk.objects.SmallSparklyChest],
        poi: [sdk.quest.chest.LamEsensTomeHolder],
      }],
      [sdk.areas.DisusedFane, {
        previousArea: [sdk.areas.KurastBazaar],
        presetChests: [sdk.objects.SmallSparklyChest],
      }],
      [sdk.areas.A3SewersLvl1, {
        previousArea: [sdk.areas.KurastBazaar],
        nextArea: [sdk.areas.A3SewersLvl2],
        presetMonsters: [sdk.monsters.preset.IcehawkRiftwing],
        poi: [sdk.objects.SewerLever],
      }],
      [sdk.areas.A3SewersLvl2, {
        previousArea: [sdk.areas.A3SewersLvl1],
        presetChests: [sdk.quest.chest.KhalimsHeartChest],
      }],
      [sdk.areas.UpperKurast, {
        previousArea: [sdk.areas.KurastBazaar],
        nextArea: [
          sdk.areas.KurastCauseway,
          sdk.areas.ForgottenReliquary,
          sdk.areas.ForgottenTemple],
      }],
      [sdk.areas.ForgottenReliquary, {
        previousArea: [sdk.areas.UpperKurast],
        presetChests: [sdk.objects.SmallSparklyChest],
      }],
      [sdk.areas.ForgottenTemple, {
        previousArea: [sdk.areas.UpperKurast],
        presetChests: [sdk.objects.SmallSparklyChest],
      }],
      [sdk.areas.KurastCauseway, {
        previousArea: [sdk.areas.UpperKurast],
        nextArea: [sdk.areas.Travincal, sdk.areas.RuinedFane, sdk.areas.DisusedReliquary],
      }],
      [sdk.areas.DisusedReliquary, {
        previousArea: [sdk.areas.KurastCauseway],
        presetChests: [sdk.objects.SmallSparklyChest],
      }],
      [sdk.areas.RuinedFane, {
        previousArea: [sdk.areas.KurastCauseway],
        presetChests: [sdk.objects.SmallSparklyChest],
      }],
      [sdk.areas.Travincal, {
        previousArea: [sdk.areas.KurastCauseway],
        nextArea: [sdk.areas.DuranceofHateLvl1],
        presetMonsters: [
          sdk.monsters.preset.IsmailVilehand,
          sdk.monsters.preset.GelebFlamefinger,
          sdk.monsters.preset.ToorcIcefist
        ],
        poi: [sdk.objects.CompellingOrb, sdk.objects.DuranceEntryStairs],
      }],
      [sdk.areas.DuranceofHateLvl1, {
        previousArea: [sdk.areas.Travincal],
        nextArea: [sdk.areas.DuranceofHateLvl2],
        preReq: function () {
          return QuestData.get(sdk.quest.id.TheBlackenedTemple).complete()
            || QuestData.get(sdk.quest.id.KhalimsWill).complete();
        },
      }],
      [sdk.areas.DuranceofHateLvl2, {
        previousArea: [sdk.areas.DuranceofHateLvl1],
        nextArea: [sdk.areas.DuranceofHateLvl3],
        preReq: function () {
          return QuestData.get(sdk.quest.id.TheBlackenedTemple).complete()
            || QuestData.get(sdk.quest.id.KhalimsWill).complete();
        },
      }],
      [sdk.areas.DuranceofHateLvl3, {
        previousArea: [sdk.areas.DuranceofHateLvl2],
        nextArea: [sdk.areas.PandemoniumFortress],
        presetMonsters: [
          sdk.monsters.preset.BremmSparkfist,
          sdk.monsters.preset.WyandVoidfinger,
          sdk.monsters.preset.MafferDragonhand,
          sdk.monsters.Mephisto
        ],
        presetChests: [sdk.objects.SuperChest],
        poi: [sdk.objects.RedPortalToAct4],
        preReq: function () {
          return QuestData.get(sdk.quest.id.TheBlackenedTemple).complete()
            || QuestData.get(sdk.quest.id.KhalimsWill).complete();
        },
      }],
      // Act 4
      [sdk.areas.PandemoniumFortress, {
        nextArea: [sdk.areas.OuterSteppes],
        poi: [sdk.objects.RedPortalToAct5],
        preReq: function () {
          return QuestData.get(sdk.quest.id.TheGuardian).complete()
            || QuestData.get(sdk.quest.id.AbleToGotoActIV).complete();
        },
      }],
      [sdk.areas.OuterSteppes, {
        previousArea: [sdk.areas.PandemoniumFortress],
        nextArea: [sdk.areas.PlainsofDespair],
      }],
      [sdk.areas.PlainsofDespair, {
        previousArea: [sdk.areas.OuterSteppes],
        nextArea: [sdk.areas.CityoftheDamned],
        presetMonsters: [sdk.monsters.preset.Izual],
      }],
      [sdk.areas.CityoftheDamned, {
        previousArea: [sdk.areas.PlainsofDespair],
        nextArea: [sdk.areas.RiverofFlame],
      }],
      [sdk.areas.RiverofFlame, {
        previousArea: [sdk.areas.CityoftheDamned],
        nextArea: [sdk.areas.ChaosSanctuary],
        presetMonsters: [sdk.monsters.preset.Hephasto],
        poi: [sdk.quest.chest.HellForge],
      }],
      [sdk.areas.ChaosSanctuary, {
        previousArea: [sdk.areas.RiverofFlame],
        presetMonsters: [
          sdk.monsters.preset.GrandVizierofChaos,
          sdk.monsters.preset.LordDeSeis,
          sdk.monsters.preset.InfectorofSouls,
          sdk.monsters.Diablo
        ],
        poi: [
          sdk.objects.DiabloSealSeis, sdk.objects.DiabloStar,
          sdk.objects.DiabloSealInfector, sdk.objects.DiabloSealInfector2,
          sdk.objects.DiabloSealVizier, sdk.objects.DiabloSealVizier2,
        ],
      }],
      // Act 5
      [sdk.areas.Harrogath, {
        nextArea: [sdk.areas.BloodyFoothills, sdk.areas.NihlathaksTemple],
        poi: [sdk.objects.Act5Gate],
        preReq: function () {
          return QuestData.get(sdk.quest.id.AbleToGotoActV).complete();
        },
      }],
      [sdk.areas.NihlathaksTemple, {
        previousArea: [sdk.areas.Harrogath],
        nextArea: [sdk.areas.HallsofAnguish],
        presetMonsters: [sdk.monsters.preset.Pindleskin],
        preReq: function () {
          return QuestData.get(sdk.quest.id.PrisonofIce).complete(true);
        },
      }],
      [sdk.areas.HallsofAnguish, {
        previousArea: [sdk.areas.NihlathaksTemple],
        nextArea: [sdk.areas.HallsofPain],
        presetChests: [sdk.objects.LargeSparklyChest],
        preReq: function () {
          return QuestData.get(sdk.quest.id.PrisonofIce).complete(true);
        },
      }],
      [sdk.areas.HallsofPain, {
        previousArea: [sdk.areas.HallsofAnguish],
        nextArea: [sdk.areas.HallsofVaught],
        presetChests: [sdk.objects.LargeSparklyChest],
        preReq: function () {
          return QuestData.get(sdk.quest.id.PrisonofIce).complete(true);
        },
      }],
      [sdk.areas.HallsofVaught, {
        previousArea: [sdk.areas.HallsofPain],
        presetMonsters: [sdk.monsters.preset.Nihlathak],
        poi: [sdk.objects.NihlathaksPlatform],
        preReq: function () {
          return QuestData.get(sdk.quest.id.PrisonofIce).complete(true);
        },
      }],
      [sdk.areas.BloodyFoothills, {
        previousArea: [sdk.areas.Harrogath],
        nextArea: [sdk.areas.FrigidHighlands],
        presetMonsters: [
          sdk.monsters.preset.DacFarren,
          sdk.monsters.preset.ShenktheOverseer
        ],
      }],
      [sdk.areas.FrigidHighlands, {
        previousArea: [sdk.areas.BloodyFoothills],
        nextArea: [sdk.areas.ArreatPlateau, sdk.areas.Abaddon],
        presetMonsters: [
          sdk.monsters.preset.EldritchtheRectifier,
          sdk.monsters.preset.EyebacktheUnleashed,
          sdk.monsters.preset.SharpToothSayer
        ],
        presetChests: [sdk.objects.LargeSparklyChest],
      }],
      [sdk.areas.Abaddon, {
        previousArea: [sdk.areas.FrigidHighlands],
        presetChests: [sdk.objects.SmallSparklyChest],
      }],
      [sdk.areas.ArreatPlateau, {
        previousArea: [sdk.areas.FrigidHighlands],
        nextArea: [sdk.areas.CrystalizedPassage, sdk.areas.PitofAcheron],
        presetMonsters: [sdk.monsters.preset.ThreshSocket],
      }],
      [sdk.areas.PitofAcheron, {
        previousArea: [sdk.areas.ArreatPlateau],
        presetChests: [sdk.objects.SmallSparklyChest],
      }],
      [sdk.areas.CrystalizedPassage, {
        previousArea: [sdk.areas.ArreatPlateau],
        nextArea: [sdk.areas.GlacialTrail, sdk.areas.FrozenRiver],
      }],
      [sdk.areas.FrozenRiver, {
        previousArea: [sdk.areas.CrystalizedPassage],
        presetMonsters: [sdk.monsters.preset.Frozenstein],
        poi: [sdk.objects.FrozenAnyasPlatform],
      }],
      [sdk.areas.GlacialTrail, {
        previousArea: [sdk.areas.CrystalizedPassage],
        nextArea: [sdk.areas.FrozenTundra, sdk.areas.DrifterCavern],
        presetMonsters: [sdk.monsters.preset.BonesawBreaker],
        presetChests: [sdk.objects.LargeSparklyChest],
      }],
      [sdk.areas.DrifterCavern, {
        previousArea: [sdk.areas.GlacialTrail],
        presetChests: [sdk.objects.SmallSparklyChest],
      }],
      [sdk.areas.FrozenTundra, {
        previousArea: [sdk.areas.GlacialTrail],
        nextArea: [sdk.areas.AncientsWay, sdk.areas.InfernalPit],
      }],
      [sdk.areas.InfernalPit, {
        previousArea: [sdk.areas.FrozenTundra],
        presetChests: [sdk.objects.SmallSparklyChest],
      }],
      [sdk.areas.AncientsWay, {
        previousArea: [sdk.areas.FrozenTundra],
        nextArea: [sdk.areas.ArreatSummit, sdk.areas.IcyCellar],
      }],
      [sdk.areas.IcyCellar, {
        previousArea: [sdk.areas.AncientsWay],
        presetMonsters: [sdk.monsters.preset.SnapchipShatter],
        presetChests: [sdk.objects.SmallSparklyChest],
      }],
      [sdk.areas.ArreatSummit, {
        previousArea: [sdk.areas.AncientsWay],
        nextArea: [sdk.areas.WorldstoneLvl1],
        presetMonsters: [
          sdk.monsters.preset.TalictheDefender,
          sdk.monsters.preset.MadawctheGuardian,
          sdk.monsters.preset.KorlictheProtector
        ],
        poi: [
          sdk.objects.KorlictheProtectorStatue,
          sdk.objects.MadawctheGuardianStatue,
          sdk.objects.TalictheDefenderStatue,
          sdk.objects.AncientsAltar,
          sdk.objects.AncientsDoor,
        ],
      }],
      [sdk.areas.WorldstoneLvl1, {
        previousArea: [sdk.areas.ArreatSummit],
        nextArea: [sdk.areas.WorldstoneLvl2],
        preReq: function () {
          return QuestData.get(sdk.quest.id.RiteofPassage).complete();
        },
      }],
      [sdk.areas.WorldstoneLvl2, {
        previousArea: [sdk.areas.WorldstoneLvl1],
        nextArea: [sdk.areas.WorldstoneLvl3],
        preReq: function () {
          return QuestData.get(sdk.quest.id.RiteofPassage).complete();
        },
      }],
      [sdk.areas.WorldstoneLvl3, {
        previousArea: [sdk.areas.WorldstoneLvl2],
        nextArea: [sdk.areas.ThroneofDestruction],
        preReq: function () {
          return QuestData.get(sdk.quest.id.RiteofPassage).complete();
        },
      }],
      [sdk.areas.ThroneofDestruction, {
        previousArea: [sdk.areas.WorldstoneLvl3],
        nextArea: [sdk.areas.WorldstoneChamber],
        presetMonsters: [
          sdk.monsters.preset.ColenzotheAnnihilator,
          sdk.monsters.preset.AchmeltheCursed,
          sdk.monsters.preset.BartuctheBloody,
          sdk.monsters.preset.VentartheUnholy,
          sdk.monsters.preset.ListertheTormentor
        ],
        poi: [sdk.objects.WorldstonePortal],
        preReq: function () {
          return QuestData.get(sdk.quest.id.RiteofPassage).complete();
        },
      }],
      [sdk.areas.WorldstoneChamber, {
        previousArea: [sdk.areas.ThroneofDestruction],
        presetMonsters: [sdk.monsters.Baal],
        preReq: function () {
          return QuestData.get(sdk.quest.id.RiteofPassage).complete();
        },
      }],
      [sdk.areas.MatronsDen, {
        // previousArea: [sdk.areas.Harrogath],
        presetMonsters: [sdk.monsters.Lilith],
        presetChests: [sdk.objects.SmallSparklyChest],
      }],
      [sdk.areas.FurnaceofPain, {
        // previousArea: [sdk.areas.Harrogath],
        presetMonsters: [sdk.monsters.UberIzual],
        presetChests: [sdk.objects.SmallSparklyChest],
      }],
      [sdk.areas.ForgottenSands, {
        // previousArea: [sdk.areas.Harrogath],
        presetMonsters: [sdk.monsters.UberDuriel],
      }],
      [sdk.areas.UberTristram, {
        // previousArea: [sdk.areas.Harrogath],
        presetMonsters: [
          sdk.monsters.UberDiablo,
          sdk.monsters.UberMephisto,
          sdk.monsters.UberBaal
        ],
      }],
    ]);

    /** @type {Map<number, ExitInstance} */
    const specialTransit = (function () {
      const special = new Map();

      // Act 1
      special.set(sdk.areas.StonyField, function () {
        let stoneBeta = Game.getPresetObject(sdk.areas.StonyField, sdk.objects.StoneBeta);
        stoneBeta = stoneBeta.realCoords();
        return new ExitInstance({
          x: stoneBeta.x,
          y: stoneBeta.y,
          target: sdk.areas.Tristram,
          type: sdk.objects.RedPortal,
          tileid: -1, // not sure how to get this
        });
      });

      // Act 2
      special.set(sdk.areas.CanyonofMagic, function () {
        let canyonRoom = getRoom(sdk.areas.CanyonofMagic);
        let correctTomb = canyonRoom.correcttomb;
        _map.get(correctTomb).NextArea.push(sdk.areas.DurielsLair);
        let tombEntrace = _map.get(sdk.areas.CanyonofMagic).Exits
          .find(function (t) {
            return t.target === correctTomb;
          });
        tombEntrace.correcttomb = true;

        // handle special transit from the correct tomb to duriels lair now
        special.set(correctTomb, function () {
          let staffHolder = Game.getPresetObject(correctTomb, sdk.objects.HoradricStaffHolder);
          staffHolder = staffHolder.realCoords();
          return new ExitInstance({
            x: staffHolder.x,
            y: staffHolder.y,
            target: sdk.areas.DurielsLair,
            type: sdk.exits.type.Stairs, // not really correct
            tileid: -1, // not sure how to get this
          });
        });

        return tombEntrace;
      });

      // Act 3
      special.set(sdk.areas.GreatMarsh, function () {
        let flayerJungle = _map.get(sdk.areas.GreatMarsh).Exits
          .find(function (t) {
            return t.target === sdk.areas.FlayerJungle;
          });
        if (!flayerJungle) {
          // fix previous areas - entrance changes on some maps
          _areaData.get(sdk.areas.FlayerJungle).previousArea = [sdk.areas.SpiderForest];
          _map.get(sdk.areas.FlayerJungle).PreviousArea = [sdk.areas.SpiderForest];
        }
        return null;
      });

      // Act 5
      [sdk.areas.Abaddon, sdk.areas.PitofAcheron, sdk.areas.InfernalPit].forEach(function (area) {
        let wildernessArea = _areaData.get(area).previousArea.first();
        special.set(wildernessArea, function () {
          let redPortal = Game.getPresetObject(wildernessArea, sdk.objects.RedPortal);
          redPortal = redPortal.realCoords();
          return new ExitInstance({
            x: redPortal.x,
            y: redPortal.y,
            target: area,
            type: sdk.objects.RedPortal,
            tileid: -1, // not sure how to get this
          });
        });
      });

      return special;
    })();

    /**
     * @typedef {object} PresetObjectUnit
     * @property {number} x
     * @property {number} y
     * @property {number} area
     * @property {number} classid
     * @property {number} type
     */

    /**
     * Create a new Shrine object
     * @constructor
     * @param {ObjectUnit} shrine 
     */
    function Shrine (shrine) {
      this.type = shrine.objtype;
      this.classid = shrine.classid;
      this.state = ShrineData.getState(shrine.objtype);
      this.duration = ShrineData.getDuration(shrine.objtype);
      this.regenTime = ShrineData.getRegenTime(shrine.objtype);
      this.area = shrine.area;
      this.x = shrine.x;
      this.y = shrine.y;
      this.gid = shrine.gid;
      this.interactedAt = 0;
    }

    Shrine.prototype.useable = function () {
      return getTickCount() - this.interactedAt > this.regenTime;
    };

    /**
     * @constructor
     * @param {Exit} exit 
     */
    function ExitInstance (exit) {
      this.x = exit.x;
      this.y = exit.y;
      this.target = exit.target;
      this.type = exit.type;
      this.tileid = exit.tileid;
    }

    /**
     * @constructor
     * @param {number} index 
     */
    function AreaDataInstance (index) {
      let _aData = _areaData.get(index);

      this.LocaleString = getAreaName(index);
      this.Index = index; // why index and not area id?
      this.Act = getBaseStat("levels", index, "Act") + 1;
      this.Level = getBaseStat("levels", index, ["MonLvl1Ex", "MonLvl2Ex", "MonLvl3Ex"][me.diff]);
      this.Size = (function () {
        // frigid highlands doesn't specify size, manual measurement
        if (index === sdk.areas.FrigidHighlands) return { x: 210, y: 710 };

        // arreat plateau doesn't specify size, manual measurement
        if (index === sdk.areas.ArreatPlateau) return { x: 690, y: 230 };

        return {
          x: getBaseStat("leveldefs", index, ["SizeX", "SizeX(N)", "SizeX(H)"][me.diff]),
          y: getBaseStat("leveldefs", index, ["SizeY", "SizeY(N)", "SizeY(H)"][me.diff])
        };
      })();
      this.SuperUnique = (_aData.presetMonsters || []);
      this.Monsters = (MONSTER_KEYS
        .map(function (key) {
          return getBaseStat("levels", index, key);
        })
        .filter(function (key) {
          return key !== 65535;
        })
      );
      this.MonsterDensity = getBaseStat("levels", index, ["MonDen", "MonDen(N)", "MonDen(H)"][me.diff]);
      this.ChampionPacks = {
        Min: getBaseStat("levels", index, ["MonUMin", "MonUMin(N)", "MonUMin(H)"][me.diff]),
        Max: getBaseStat("levels", index, ["MonUMax", "MonUMax(N)", "MonUMax(H)"][me.diff])
      };
      this.SuperChests = (_aData.presetChests || []);
      this.Poi = (_aData.poi || []);
      this.QuestPreReq = (_aData.preReq || null);
      /** 
       * @private
       * @type {PresetObjectUnit | null} 
       */
      this._Waypoint = null;
      let wp = getBaseStat("levels", index, "Waypoint");
      if (wp !== 255) {
        wps.set(this.Index, wp);
      }
      /** @type {Array<Shrine>} */
      this.Shrines = [];
      /** @type {Array<PresetObjectUnit>} */
      this.Chests = [];
      /** @type {number[]} */
      this.NextArea = (_aData.nextArea || []);
      /** @type {number[]} */
      this.PreviousArea = (_aData.previousArea || []);
      /** @type {Array<ExitInstance>} */
      this.Exits = [];
      /** @private */
      this._Accessible = false;
    }
    
    /**
     * Check if this area has a monster of a certain type
     * @param {number} type - monster type to check for
     * @returns {boolean}
     */
    AreaDataInstance.prototype.hasMonsterType = function (type) {
      return this.Monsters.some(function (monId) {
        return MonsterData[monId].Type === type;
      });
    };
    /**
     * Iterate through each monster in this area and apply a callback function
     * @param {function} cb - callback function to apply to each monster
     */
    AreaDataInstance.prototype.forEachMonster = function (cb) {
      if (typeof cb === "function") {
        this.Monsters.forEach(function (monID) {
          const _monster = MonsterData[monID];
          return cb(
            _monster,
            _monster.Rarity * (_monster.GroupCount.Min + _monster.GroupCount.Max) / 2
          );
        });
      }
    };
    /**
     * Iterate through each monster and minion in this area and apply a callback function
     * @param {function} cb - callback function to apply to each monster
     */
    AreaDataInstance.prototype.forEachMonsterAndMinion = function (cb) {
      if (typeof cb === "function") {
        this.Monsters.forEach(function (monID) {
          const _monster = MonsterData[monID];
          let rarity = _monster.Rarity * (_monster.GroupCount.Min + _monster.GroupCount.Max) / 2;
          cb(_monster, rarity, null);
          _monster.Minions.forEach(function (minionID) {
            // eslint-disable-next-line max-len
            let minionrarity = (_monster.Rarity * (_monster.MinionCount.Min + _monster.MinionCount.Max) / 2 / _monster.Minions.length);
            cb(MonsterData[minionID], minionrarity, _monster);
          });
        });
      }
    };
    /**
     * Check whether this area is accessible by quest pre-reqs
     * @this AreaDataInstance
     * @returns {boolean}
     */
    AreaDataInstance.prototype.canAccess = function () {
      if (this._Accessible) return true;
      let check = this.QuestPreReq || _areaData.get(sdk.areas.townOfAct(this.Act)).preReq;
      if (check()) {
        this._Accessible = true;
      }
      return this._Accessible;
    };
    /**
     * Get town of area
     */
    AreaDataInstance.prototype.townArea = function () {
      return _map.get(sdk.areas.townOfAct(this.Act));
    };
    /**
     * Get exits of the area
     * @function
     */
    AreaDataInstance.prototype.getExits = function () {
      if (this.Exits.length) return this.Exits;
      const _areaId = this.Index;
      /** @type {Area} */
      const area = Misc.poll(function () {
        return getArea(_areaId);
      });
      if (!area) return [];
      this.Exits = area.exits
        .map(function (exit) {
          return new ExitInstance(exit);
        });
      if (specialTransit.has(_areaId)) {
        let _specialExit = specialTransit.get(_areaId)();
        if (_specialExit) {
          this.Exits.push(_specialExit);
        }
      }
      return this.Exits;
    };
    /**
     * @private
     * @param {PresetUnit} wp 
     */
    AreaDataInstance.prototype.setWaypoint = function (wp) {
      if (wp && wp instanceof PresetUnit) {
        this._Waypoint = wp.realCoords();
        this._Waypoint.classid = wp.id;
      }
    };
    /**
     * Get wp of area if it exists
     * @this {AreaDataInstance}
     * @returns {PresetObjectUnit | null}
     */
    AreaDataInstance.prototype.waypointCoords = function () {
      if (this._Waypoint) return this._Waypoint;
      if (!this.hasWaypoint()) return null;
      // check first that we are currently in the same act
      if (me.act !== this.Act) return null;
      // try to find the wp
      try {
        const _areaId = this.Index;
        let wp = Game.getPresetObjects(_areaId)
          .filter(function (preset) {
            return sdk.waypoints.Ids.includes(preset.id);
          })
          .find(function (preset) {
            return preset.level === _areaId;
          });
        if (wp) {
          this.setWaypoint(wp);
          return this._Waypoint;
        }
      } catch (e) {
        console.error(e);
      }
      return null;
    };
    /**
     * Check if this area as a waypoint
     * @returns {boolean}
     */
    AreaDataInstance.prototype.hasWaypoint = function () {
      return wps.has(this.Index);
    };
    /**
    * Find nearest waypoint in area
    * @returns {number}
    * @todo Fix this, the nearest waypoint could be the next area but this only
    * checks up to the current area.
    */
    AreaDataInstance.prototype.nearestWaypointArea = function () {
      if (this.hasWaypoint() && this.waypointCoords()) return this.Index;
      if (!Pather.plotCourse_openedWpMenu) {
        return [].concat(this.PreviousArea, this.NextArea)
          .find(function (area) {
            return wps.has(area) && _map.get(area).waypointCoords();
          });
      }
      // plot toward this area
      const plot = Pather.plotCourse(this.Index, this.townArea().Index);

      // get the last area that got a WP
      return plot.course.filter(function (el) {
        return wps.has(el);
      }).last();
    };
    /** 
     * @this {AreaDataInstance}
     * @return {PresetObjectUnit | null}
     * @todo Check more than just the direct next area for a waypoint, consider the example of Tamoe Highland,
     * where the waypoint isn't the direct next area (Monastery Gate) but the next area after that (Outer Cloister)
     * we may be in a spot where we are actually closer to Outer Cloisers wp than Black Marsh wp
     */
    AreaDataInstance.prototype.nearestWaypointCoords = function () {
      let waypoints = [];
      let dist = Infinity;
      let prev = this.PreviousArea.first();
      let next = this.NextArea.filter(function (el) {
        return wps.has(el);
      }).first();

      // check our current area
      if (this._Waypoint) {
        if (this._Waypoint.distance < 60) return this._Waypoint;
        dist = this._Waypoint.distance;
        waypoints.push(this._Waypoint);
      }

      // check the previous area
      if (_map.get(prev) && _map.get(prev).waypointCoords()) {
        let wp = _map.get(prev).waypointCoords();
        if (wp.distance < dist) {
          dist = wp.distance;
          if (dist < 60) return wp;
          waypoints.push(wp);
        }
      }

      // check the next area
      if (_map.get(next) && _map.get(next).waypointCoords()) {
        let wp = _map.get(next).waypointCoords();
        if (wp.distance < dist) {
          dist = wp.distance;
          if (dist < 60) return wp;
          waypoints.push(wp);
        }
      }

      // this returns the nearest waypoint from town to the current area
      let wpArea = this.nearestWaypointArea();
      if (wpArea === prev || wpArea === next) {
        return waypoints.find(function (el) {
          return el.distance === dist;
        });
      }
      
      let check = _map.get(wpArea).waypointCoords();
      
      if (check.distance < dist) {
        return check;
      }

      return null;
    };
    /**
     * Get the chests in this area
     * @todo Add support for chests that are not preset objects
     * @todo Add opened property to chests so we can ignore them as chests don't regen
     * @returns {Array<PresetObjectUnit>}
     */
    AreaDataInstance.prototype.getChests = function () {
      if (this.Chests.length) return this.Chests;
      
      try {
        let chests = Game.getPresetObjects(this.Index)
          .filter(function (preset) {
            return sdk.objects.chestIds.includes(preset.id);
          });
        if (chests.length) {
          this.Chests = chests.map(function (preset) {
            return preset.realCoords();
          });
          return this.Chests;
        }
      } catch (e) {
        console.error(e);
      }

      return [];
    };

    /**
     * Add shrine to our list of seen shrines for this area
     * @param {ObjectUnit} shrine 
     */
    AreaDataInstance.prototype.addShrine = function (shrine) {
      if (!shrine || !ShrineData.has(shrine.objtype)) return;
      // we've already added this shrine
      if (this.Shrines.find((s) => s.gid === shrine.gid)) return;
      this.Shrines.push(new Shrine(shrine));
    };
    /**
     * Update a shrine to our list of seen shrines for this area
     * @param {ObjectUnit} shrine 
     */
    AreaDataInstance.prototype.updateShrine = function (shrine) {
      if (!shrine || !ShrineData.has(shrine.objtype)) return;
      // We don't already have this shrine, so add it
      if (!this.Shrines.find(s => s.gid === shrine.gid)) {
        this.Shrines.push(new Shrine(shrine));
      } else {
        this.Shrines.find(s => s.gid === shrine.gid).interactedAt = getTickCount();
      }
    };
    /**
     * Get the shrines we have seen in this area
     * @returns {Array<Shrine>}
     */
    AreaDataInstance.prototype.getShrines = function () {
      if (this.Shrines.length) return this.Shrines;
      
      // this only works for a1 and a2 /:
      // try {
      // 	let shrines = Game.getPresetObjects(this.Index);
      // 	if (shrines) {
      // 		shrines = shrines.filter(preset => sdk.shrines.Ids.includes(preset.id));
      // 		if (shrines) {
      // 			this.Shrines = shrines.map(preset => preset.realCoords());
      // 		}
      // 	}
      // } catch (e) {
      // 	console.error(e);

      // 	return [];
      // }

      return [];
    };

    for (let i = 1; i < AREA_INDEX_COUNT; i++) {
      _map.set(i, (new AreaDataInstance(i)));
    }

    /** @type {Array<number>} */
    const _nonTownWps = wps.keys()
      .filter(function (a) {
        return !sdk.areas.Towns.includes(a);
      });

    return {
      wps: wps,

      set: function (key, value) {
        _map.set(key, value);
      },
      
      get: function (key) {
        return _map.get(key);
      },

      has: function (key) {
        return _map.has(key);
      },

      forEach: function (callbackFn, thisArg) {
        thisArg = thisArg || this;
        for (let [key, value] of _map.entries()) {
          callbackFn.call(thisArg, value, key, this);
        }
      },

      keys: function () {
        return _map.keys();
      },

      entries: function () {
        return _map.entries();
      },

      randomWpArea: function (checkValid = false) {
        return checkValid
          ? _nonTownWps.filter(function (a) {
            return me.haveWaypoint(a);
          }).random()
          : _nonTownWps.random();
      },

      getAreasWithShrine: function (shrineType) {
        let areas = [];

        _map.forEach(function (area) {
          if (area.getShrines().find(s => s.type === shrineType && s.useable())) {
            areas.push(area);
          }
        });

        return areas;
      },
    };
  })();

  module.exports = AreaData;
})(module, require);
