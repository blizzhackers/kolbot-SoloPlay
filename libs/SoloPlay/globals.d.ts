// @ts-nocheck
declare global {
  interface Math {
    percentDifference(value1: number, value2: number): number;
  }

  interface Object {
    mobCount(givenSettings?: {
      range?: number,
      coll?: number,
      type: number,
      ignoreClassids: number[],
    }): number;
  }
  
  interface ItemUnit {
    readonly isCharm: boolean;
    readonly isGem: boolean;
    readonly isInsertable: boolean;
    readonly isRuneword: boolean;
    readonly isBroken: boolean;
    readonly isBaseType: boolean;
    readonly upgradedStrReq: boolean;
    readonly upgradedDexReq: boolean;
    readonly upgradedLvlReq: boolean;
    readonly allRes: boolean;
    readonly quantityPercent: number;

    getItemType(): string;
  }

  interface Monster {
    readonly isStunned: boolean;
    readonly isUnderCoS: boolean;
    readonly isUnderLowerRes: boolean;
  }

  interface Unit {
    getResPenalty(difficulty: number): number;
    castChargedSkillEx(...args: any[]): boolean;
    castSwitchChargedSkill(...args: any[]): boolean;
    haveRunes(itemInfo: number[]): boolean;
  }

  type MercObj = {
    classid: number,
    skill: number,
    skillName: string,
    act: number,
    difficulty: number,
  };

  interface Build {
    caster: boolean;
    skillstab: number;
    wantedskills: number[];
    usefulskills: number[];
    precastSkills: number[];
    wantedMerc: MercObj;
    stats: Array<[string, number | "block" | "all"]>;
    skills: Array<[number, number, boolean?]>;
    charms: Record<string, {
      max: number;
      have: number[];
      classid: number;
      stats: (check: ItemUnit) => boolean;
    }>;
    AutoBuildTemplate: Record<number, { Update: () => void }>;
    respec: () => boolean;
    active: () => boolean;
  }

  interface MyData {
    initialized: boolean;
    normal: {
      respecUsed: boolean;
      imbueUsed: boolean;
      socketUsed: boolean;
    };
    nightmare: {
      respecUsed: boolean;
      imbueUsed: boolean;
      socketUsed: boolean;
    };
    hell: {
      respecUsed: boolean;
      imbueUsed: boolean;
      socketUsed: boolean;
    };
    task: string;
    startTime: number;
    charName: string;
    classid: number;
    level: number;
    strength: number;
    dexterity: number;
    currentBuild: string;
    finalBuild: string;
    highestDifficulty: string;
    setDifficulty: string;
    charms: Record<string, { max: number; have: number[]; classid: number; stats: (check: ItemUnit) => boolean; }>;
    charmGids: number[];
    merc: {
      act: number;
      classid: number;
      difficulty: number;
      strength: number;
      dexterity: number;
      skill: number;
      skillName: string;
      gear: number[];
    };
  }

  interface EquippedItem extends ItemUnit {
    location: number;
    durability: number;
    tier: number;
    tierScore: number;
    secondaryTier: number;
    socketed: boolean;
    twoHandedCheck: (strict?: boolean) => boolean;
  }

  type EquippedMap = Map<number, EquippedItem>;

  type GetOwnedSettings = {
    itemType?: number,
    classid?: number,
    mode?: number,
    quality?: number,
    sockets?: number,
    location?: number,
    ethereal?: boolean,
    cb?: (item: ItemUnit) => boolean,
  };

  interface MeType {
    readonly maxNearMonsters: number;
    readonly dualWielding: boolean;
    readonly realFR: number;
    readonly realCR: number;
    readonly realPR: number;
    readonly realLR: number;
    readonly FR: number;
    readonly CR: number;
    readonly LR: number;
    readonly PR: number;
    readonly onFinalBuild: boolean;
    readonly trueStr: number;
    readonly trueDex: number;

    finalBuild: Build;
    currentBuild: Build;
    data: MyData;
    equipped: {
      get: (bodylocation: number) => EquippedItem | undefined;
      has: (bodylocation: number) => boolean;
      set: (bodylocation: number, item: ItemUnit) => void;
      init: () => void;
    };

    switchToPrimary(): boolean;
    switchToSecondary(): boolean;
    canTpToTown(): boolean;
    getMercEx(): MercUnit | null;
    getEquippedItem(bodyLoc: number): ItemUnit | null;
    getSkillTabs(classid: number): number[];
    inDanger(checkLoc?: {x: number, y: number} | MeType, range?: number): boolean;
    checkSkill(skillId: number, subId: number): boolean;
    cleanUpInvoPotions(beltSize: number): boolean;
    needPotions(): boolean;
    needBeltPots(): boolean;
    needBufferPots(): boolean;
    getIdTool(): ItemUnit | null;
    getTpTool(): ItemUnit | null;
    getUnids(): ItemUnit[];
    fieldID(): boolean;
    getWeaponQuantity(weaponLoc: number): number;
    getItemsForRepair(repairPercent: number, chargedItems?: boolean): ItemUnit[];
    needRepair(): string[];
    needMerc(): boolean;
    clearBelt(): boolean;
    sortInventory(): boolean;
    cleanUpScrolls(tome: ItemUnit, scrollId: number): number;
    update(): void;
    getOwned(itemInfo: ItemUnit | GetOwnedSettings): ItemUnit[];
  }

  interface Container {
    /**
     * A function that checks if the cube is located at { x: 0, y: 0 } in the stash and moves it there if not
     * @param name 
     */
    CubeSpot(name: string): boolean;

    /**
     * A function that sorts items with optional priority
     * @param itemIdsLeft 
     * @param itemIdsRight 
     */
    SortItems(itemIdsLeft: number[], itemIdsRight: number[]): boolean;
    
    /**
     * A function that moves an item to a location in a container
     * @param item 
     * @param reverseX 
     * @param reverseY 
     * @param priorityClassIds 
     */
    MoveTo(item: ItemUnit, reverseX: boolean, reverseY: boolean, priorityClassIds: number[]): boolean

    /**
     * @param item 
     * @param location 
     * @param force 
     */
    MakeSpot(item: ItemUnit, location: { x: number, y: number }, force: boolean): boolean;

    /**
     * @param item 
     * @param mX 
     * @param mY 
     */
    MoveToSpot(item: ItemUnit, mX: number, mY: number): boolean;
  }

  class Merc {
    constructor(classid: number, skill: number, act: number, difficulty?: number);
    classid: number;
    skill: number;
    skillName: string;
    act: number;
    difficulty: number;
  }

  class MercData {
    [sdk.skills.FireArrow]: Merc;
    [sdk.skills.ColdArrow]: Merc;
    [sdk.skills.Prayer]: Merc;
    [sdk.skills.BlessedAim]: Merc;
    [sdk.skills.Defiance]: Merc;
    [sdk.skills.HolyFreeze]: Merc;
    [sdk.skills.Might]: Merc;
    [sdk.skills.Thorns]: Merc;
    [sdk.skills.IceBlast]: Merc;
    [sdk.skills.FireBall]: Merc;
    [sdk.skills.Lightning]: Merc;
    [sdk.skills.Bash]: Merc;
    actMap: Map<number | symbol, number | Merc[]>;
  }

  namespace Mercenary {
    let minCost: number;

    function getMercSkill(merc?: MercUnit): string | false;
    function getMercDifficulty(merc?: MercUnit): number;
    function getMercAct(merc?: MercUnit): number;
    function getMercInfo(merc?: MercUnit): { classid: number, act: number, difficulty: number, type: string | false };
    function checkMercSkill(wanted: string, merc?: MercUnit): boolean;
    function hireMerc(): boolean;
  }

  namespace Misc {
    let townEnabled: boolean;
    let openChestsEnabled: boolean;
    const shrineStates: number[];

    function openChestsInArea(area: number, chestIds: number[], sort?: Function): boolean;
    function getExpShrine(shrineLocs: number[]): boolean;
    function unsocketItem(item: ItemUnit): boolean;
    function checkItemsForSocketing(): ItemUnit | boolean;
    function checkItemsForImbueing(): ItemUnit | boolean;
    function addSocketablesToItem(item: ItemUnit, runes: ItemUnit[]): boolean;
    function getSocketables(
      item: ItemUnit,
      itemInfo?: {
        classid: number,
        socketWith: number[],
        temp: number[],
        useSocketQuest: boolean,
        condition: Function
      }
    ): boolean;
    function checkSocketables(): void;
  }

  namespace Skill {
    function switchCast(
      skillId: number,
      givenSettings: { hand?: number, x?: number, y?: number, switchBack?: boolean, oSkill?: boolean }
    ): boolean;
  }

  type pathSettings = {
    allowNodeActions?: boolean;
    allowTeleport?: boolean;
    allowClearing?: boolean;
    allowTown?: boolean;
    allowPicking?: boolean;
    minDist?: number;
    retry?: number;
    pop?: boolean;
    returnSpotOnError?: boolean;
    callback?: Function;
    clearSettings?: clearSettings;
  };
  type clearSettings = {
    clearPath?: boolean;
    range?: number;
    specType?: number;
    sort?: Function;
  };

  namespace Pather {
    let initialized: boolean;
    function canTeleport(): boolean;
    function teleUsingCharges(x: number, y: number, maxRange: number): boolean;
    function changeAct(act: number): boolean;
    function checkWP(area: number, keepMenuOpen?: boolean): boolean;
    function clearToExit(currentarea: number, targetarea: number, givenSettings: pathSettings): boolean;
  }

  namespace NodeAction {
    const shrinesToIgnore: number[];
    let enabled: boolean;

    function go(arg: clearSettings): void;
  }

  namespace PathDebug {
    function coordsInPath(path: PathNode[], x: number, y: number): boolean;
  }

  namespace Pickit {
    function pickItem(
      unit: ItemUnit,
      status: PickitResult,
      keptLine?: string,
      givenSettings?: { allowClear: boolean, allowMove: boolean }
    ): boolean;
  }

  namespace Attack {
    function clearPos(
      x: number,
      y: number,
      range?: number,
      pickit?: boolean,
      cb?: function(): boolean,
    ): boolean;
    function killTarget(name: Monster | string | number): boolean;
  }

  namespace ClassAttack {
    function doAttack(unit: Monster): AttackResult;
    function doAttack(unit: Monster, precast?: boolean): AttackResult;
    function doAttack(unit: Monster, recheck?: boolean): AttackResult;
    function doAttack(unit: Monster, precast?: boolean, once?: boolean): AttackResult;
    function doCast(unit: Monster, timedSkill: number, untimedSkill: number): AttackResult;
    function doCast(
      unit: Monster,
      choosenSkill: { have: boolean, skill: number, range: number, mana: number, timed: boolean }
    ): AttackResult;
    function afterAttack(pickit?: boolean): void;
  }

  namespace CollMap {
    function checkColl(unitA: Unit, unitB: Unit, coll: number, thickness: number): boolean;
  }

  namespace Town {
    function doChores(repair?: boolean, givenTasks?: extraTasks): boolean;
  }

  namespace Precast {
    function checkCTA(): boolean;
  }

  namespace CharData {
    const filePath: string;
    const threads: string[];

    namespace login {
      function create(): any;
      function getObj(): any;
      function getStats(): any;
      function updateData(arg: string, property: object | string, value: any): boolean;
    }

    // ignoring the sub objs for now
    function updateConfig(): void;
    function create(): MyData;
    function getObj(): MyData;
    function getStats(): MyData;
    function updateData(arg: string, property: object | string, value: any): boolean;
    /** @alias CharData.delete */
    function _delete(deleteMain: boolean): boolean;
  }

  namespace Developer {
    const plugyMode: boolean;
    const logPerformance: boolean;
    const overlay: boolean;
    const displayClockInConsole: boolean;
    const logEquipped: boolean;
    const hideChickens: boolean;
    const addLadderRW: boolean;
    const forcePacketCasting: {
      enabled: boolean;
      excludeProfiles: string[];
    };
    const fillAccount: {
      bumpers: boolean;
      socketMules: boolean;
      imbueMule: boolean;
    };
    const imbueStopLevel: number;
    const stopAtLevel: {
      enabled: boolean;
      profiles: Array<[string, number]>;
    };
    const developerMode: {
      enabled: boolean;
      profiles: string[];
    };
    const testingMode: {
      enabled: boolean;
      profiles: string[];
    };
    const setEmail: {
      enabled: boolean;
      profiles: string[];
      realms: string[];
    };
    const debugging: {
      smallCharm: boolean;
      largeCharm: boolean;
      grandCharm: boolean;
      baseCheck: boolean;
      junkCheck: boolean;
      autoEquip: boolean;
      crafting: boolean;
      pathing: boolean;
      skills: boolean;
      showStack: {
        enabled: boolean;
        profiles: string[];
      };
    };
  }

  namespace Tracker {
    const GTPath: string;
    const LPPath: string;
    const SPPath: string;
    const LPHeader: string;
    const SPHeader: string;
    const tick: number;
    interface GameTracker {
      Total: number;
      InGame: number;
      OOG: number;
      LastLevel: number;
      LastSave: number;
    }
    const _default: GameTracker;
    function initialize(): boolean;
    function getObj(path: string): GameTracker | false;
    function readObj(jsonPath: string): GameTracker | false;
    function writeObj(obj: GameTracker, path: string): boolean;
    function resetGameTime(): void;
    function reset(): void;
    function checkValidity(): void;
    function totalDays(milliseconds: number): string;
    function script(starttime: number, subscript: string, startexp: number): boolean;
    function leveling(): boolean;
    function update(oogTick?: number): boolean;
  }

  namespace SetUp {
    let mercEnabled: boolean;
    const currentBuild: string;
    const finalBuild: string;
    const stopAtLevel: number | false;

    function init(): void;
    function include(): void;
    function finalRespec(): number;
    function getTemplate(): { buildType: string, template: string };
    function specPush(specType: string): number[];
    function makeNext(): void;
    function belt(): void;
    function buffers(): void;
    function bowQuiver(): void;
    function imbueItems(): string[];
    function config(): void;
  }

  namespace Check {
    let lowGold: boolean;

    function gold(): boolean;
    function brokeAf(): boolean;
    function broken(): 0 | 1 | 2;
    function brokeCheck(): boolean;
    function resistance(): { Status: boolean, FR: number, CR: number, LR: number, PR: number };
    function nextDifficulty(announce: boolean): string | false;
    function runes(): boolean;
    function haveItem(type: string | number, flag?: string | number, iName?: string): boolean;
    function currentBuild(): Build;
    function finalBuild(): Build;
  }

  namespace SoloWants {
  }

  namespace NPCAction {
    function shopAt(npcName: string): boolean;
    function buyPotions(): boolean;
    function fillTome(classid: number, force?: boolean): boolean;
    function cainID(force?: boolean): boolean;
    function shopItems(force?: boolean): boolean;
    function gamble(): boolean;
    function repair(force?: boolean): boolean;
    function reviveMerc(): boolean;
  }

  namespace AutoEquip {
  }

  type extraTasks = {
    thawing?: boolean,
    antidote?: boolean,
    stamina?: boolean,
    fullChores?: boolean,
  };

  namespace LocationAction {
    function run(): void;
  }

  type PresetObjectUnit = {
    x: number;
    y: number;
    area: number;
    classid: number;
    type: number;
	};

  class ShrineInstance {
    constructor (shrine: ObjectUnit);

    type: number;
    classid: number;
    state: number;
    duration: number;
    regenTime: number;
    area: number;
    x: number;
    y: number;
    gid: number;
    interactedAt: number;

    useable(): boolean;
  }
  class AreaDataInstance {
    constructor (index: number);

    LocaleString: string;
    Index: number;
    Act: number;
    Level: number;
    Size: {
      x: number;
      y: number;
    };
    SuperUnique: number[];
    Monsters: number[];
    MonsterDensity: number;
    ChampionPacks: {
      Min: number;
      Max: number;
    };
    private _Waypoint: PresetObjectUnit | null;
    Shrines: ShrineInstance[];
    Chests: PresetObjectUnit[];

    hasMonsterType (type: number): boolean;
    forEachMonster (callback: (monster: number) => void): void;
    forEachMonsterAndMinion (callback: (monster: number) => void): void;
    canAccess(): boolean;
    townArea(): AreaDataInstance;
    getExits(): Exit[];
    setWaypoint(wp: PresetUnit): void;
    waypointCoords(): PresetObjectUnit | null;
    haveWaypoint(): boolean;
    hasWaypoint(): boolean;
    nearestWaypointArea(): number;
    nearestWaypointCoords(): PresetObjectUnit | null;
    getChests(): PresetObjectUnit[];
    addShrine(shrine: ObjectUnit): void;
    updateShrine(shrine: ObjectUnit): void;
    getShrines(): ShrineInstance[];
  }

  namespace AreaData {
    /** @private */
    const _map: Map<number, AreaDataInstance>;
    const wps: Map<number, number>;
    const nextAreas: Map<number, number[]>;
    const previousAreas: Map<number, number>;

    function set(key: number, value: AreaDataInstance): void;
    function get(key: number): AreaDataInstance | undefined;
    function has(key: number): boolean;
    function forEach(callback: (value: AreaDataInstance, key: number) => void): void;
    /**
     * @description returns a random non town wp area
     */
    function randomWpArea(checkValid: boolean): number;
    function getAreasWithShrine(shrineType: number): AreaDataInstance[];
  }

  namespace GameData {
    const myReference: Unit;
    const townAreas: number[];

    function monsterLevel(monsterID: number, areaID: number, adjustLevel: number): number;
    function eliteExp(monsterID: number, areaID: number): number;
    function monsterAvgHP(monsterID: number, areaID: number, adjustLevel: number): number;
    function monsterMaxHP(monsterID: number, areaID: number, adjustLevel: number): number;
    function eliteAvgHP(monsterID: number, areaID: number): number;
    function monsterDamageModifier(): number;
    function monsterMaxDmg(monsterID: number, areaID: number, adjustLevel: number): number;
    function monsterAttack1AvgDmg(monsterID: number, areaID: number, adjustLevel: number): number;
    function monsterAttack2AvgDmg(monsterID: number, areaID: number, adjustLevel: number): number;
    function monsterSkill1AvgDmg(monsterID: number, areaID: number, adjustLevel: number): number;
    function monsterAvgDmg(monsterID: number, areaID: number, adjustLevel: number): number;
    function averagePackSize(monsterID: number): number;
    function areaLevel(areaID: number): number;
    function areaImmunites(areaID: number): string[];
    function levelModifier(clvl: number, mlvl: number): number;
    function multiplayerModifier(count: number): number;
    function partyModifier(playerID: number): number;
    function killExp(playerID: number, monsterID: number, areaID: number): number;
    function baseLevel(...skillIDs: number[]): number;
    function skillLevel(...skillIDs: number[]): number;
    function skillCooldown(skillId: number): boolean;
    function stagedDamage(
      l: number,
      a: number,
      b: number,
      c: number,
      d: number,
      e: number,
      f: number,
      hitshift: number,
      mult: number,
    ): number;
    const damageTypes: string[];
    const synergyCalc: Record<number, nuumber[]>;
    const noMinSynergy: number[];
    const skillMult: Record<number, number>;
    function baseSkillDamage(skillId: number): number;
    const skillRadius: Record<number, number>;
    const novaLike: Record<number, boolean>;
    const wolfBanned: Record<number, boolean>;
    const bearBanned: Record<number, boolean>;
    const humanBanned: Record<number, boolean>;
    const nonDamage: Record<number, boolean>;
    function shiftState(): string;
    function bestForm(skillID: number): number;
    function physicalAttackDamage(skillID: number): number;
    function dmgModifier(skillID: number, target: Monster): number;

    interface SkillDamage {
      type: string;
      pmin: number;
      pmax: number;
      min: number;
      max: number;
      undeadOnly?: boolean;
    }
    function skillDamage(skillID: number, unit?: Monster): SkillDamage;
    function avgSkillDamage(skillID: number, unit?: Monster): number;
    function allSkillDamage(unit: Monster): SkillDamage[];
    const convictionEligible: Record<string, boolean>;
    const lowerResistEligible: Record<string, boolean>;
    const resistMap: Record<string, number>;
    const masteryMap: Record<string, number>;
    const pierceMap: Record<string, number>;
    const ignoreSkill: Record<number, boolean>;
    const buffs: Record<number, number>;
    const preAttackable: number[];
    function monsterResist(unit: Monster, type: string): number;
    function getConviction(): number;
    function getAmp(): number;
    function monsterEffort(
      unit: Monster,
      areaID: number,
      skillDamageInfo?: SkillDamage,
      parent?: Monster,
      preattack?: boolean,
      all?: boolean,
    ): { effort: number, skill: number, type: string, name?: string, cooldown?: boolean };
    function effectiveMonsterEffort(
      unit: Monster,
      areaID: number
    ): { effort: number, skill: number, type: string, name?: string, cooldown?: boolean };
    function areaEffort(areaID: number, skills?: SkillDamage[]): number;
    function areaSoloExp(areaID: number, skills?: SkillDamage[]): number;
    function timeTillMissileImpact(skillId: number, monster: Monster): number;
    function calculateKillableFallensByFrostNova(): number;
    function calculateKillableSummonsByNova(): number;
    function targetPointForSkill(skillId: number, monster: Monster): PathNode;
  }
}
export{};
