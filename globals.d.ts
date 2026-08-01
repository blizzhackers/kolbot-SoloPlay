/// <reference path="./Types/script-types.d.ts" />

// @ts-nocheck
declare global {
  /** Core/Globals.js myPrint - ambient declaration guarantees resolution program-wide. */
  function myPrint(str?: string, toConsole?: boolean, color?: number): void;

  // --- Ambient value declarations for MAIN-repo singletons ---------------------------------
  // This PROGRAM includes main's d.ts (types-only interfaces) but not main's .js, so these
  // names have no value symbol here without the consts below. They live in THIS file, not
  // main's d.ts, deliberately: main's program has the implementing js consts and an ambient
  // const there can TS2451 (observed for CollMap) - main's tsconfig excludes SoloPlay, so
  // this placement is collision-free in both programs.
  const Item: Item;
  const Cubing: ICubing;
  const Loader: Loader;
  const Recipe: IRecipe;
  const AutoSkill: AutoSkill;
  const AutoStat: AutoStat;
  const Precast: Precast;
  const Town: Town;
  const Pather: Pather;
  const Pickit: Pickit;
  const CollMap: CollMapInstance;
  const NPC: NPCList;
  const Packet: Packet;
  const PathDebug: PathDebug;
  const Experience: Experience;
  const ClassAttack: IClassAttack;
  const TorchSystem: ITorchSystem;
  const CraftingSystem: ICraftingSystem;
  const Scripts: Scripts;

  // SoloPlay-added members on main singletons that have no namespace history - declared here
  // so the ambient consts (interface-authoritative) keep every runtime addition visible.
  interface Item {
    autoEquipCheckMerc(item: ItemUnit, basicCheck?: boolean): boolean;
    autoEquipCheckSecondary(item: ItemUnit): boolean;
    autoEquipMerc(): boolean;
    autoEquipSecondary(task?: string): boolean;
    canEquipMerc(item: ItemUnit, bodyLoc: number): boolean;
    equipMerc(item: ItemUnit, bodyLoc: number): boolean;
    getBodyLocMerc(item: ItemUnit): number[];
    getMercEquipped(bodyLoc?: number): { classid: number; prefixnum: number; tier: number; name: string; str: number; dex: number };
    getSecondaryBodyLoc(item: ItemUnit): number[];
    hasDependancy(item: ItemUnit): 526 | 528 | false;
    hasMercTier(item: ItemUnit): boolean;
    hasSecondaryTier(item: ItemUnit): boolean;
    helmTypes: Set<number>;
    identify(item: ItemUnit): boolean;
    removeItem(bodyLoc?: number, item?: ItemUnit): boolean;
    removeItemsMerc(droppedItems?: ItemUnit[]): boolean;
    secondaryEquip(item: ItemUnit, bodyLoc: 11 | 12): boolean;
    shieldTypes: Set<number>;
    weaponTypes: Set<number>;
  }

  /** Instance shape of the NTIPList constructor in Core/NTIPOverrides.js. Named -Instance, not
   * NTIPList: a same-named ambient type merging with a this-assignment constructor function is
   * the TS 5.9 getConstructorDefinedThisAssignmentTypes crash shape (see IPathNode). */
  interface NTIPListInstance {
    list: ((item: ItemUnit) => boolean)[][];
    strArray: { line: string; file: string; string: string }[];
    add(parsedLine: ((item: ItemUnit) => boolean)[], info: { line: string; file: string; string: string }): void;
    remove(index: number): void;
    clear(): void;
  }

  interface NTIP {
    CheckList: NTIPListInstance;
    FinalGear: NTIPListInstance;
    GetCharmTier(item: ItemUnit): number;
    GetSecondaryTier(item: ItemUnit): number;
    MAX_TIER: number;
    NoTier: NTIPListInstance;
    Runtime: NTIPListInstance;
    SoloList: NTIPListInstance;
    _evaluateRuleMatch(item: ItemUnit, type: (item: ItemUnit) => boolean, stat: (item: ItemUnit) => boolean): -1 | 0 | 1;
    addToRuntime(itemString: string): boolean;
    buildFinalGear(arr: string[]): boolean;
    buildList(...arraystoloop: string[][]): boolean;
    getInvoQuantity(item: ItemUnit, entryList?: NTIPListInstance): number;
    getMaxQuantity(item: ItemUnit, entryList?: NTIPListInstance): number;
    hasStats(item: ItemUnit, entryList?: NTIPList, verbose?: boolean): boolean;
  }

  interface Loader {
    run(): boolean;
  }

  interface Math {
    percentDifference(value1: number, value2: number): number;
  }

  interface Object {
    mobCount(givenSettings?: { range?: number; coll?: number; type: number; ignoreClassids: number[] }): number;
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
    bodyLocation(): number[];
  }

  interface Monster {
    readonly isStunned: boolean;
    readonly isUnderCoS: boolean;
    readonly isUnderLowerRes: boolean;
    readonly size: number;
    readonly speed: number;
  }

  interface Unit {
    getResPenalty(difficulty: number): number;
    castChargedSkillEx(...args: any[]): boolean;
    castSwitchChargedSkill(...args: any[]): boolean;
    haveRunes(itemInfo: number[]): boolean;
  }

  type MercObj = {
    classid: number;
    skill: number;
    skillName: string;
    act: number;
    difficulty: number;
  };

  type StandardBuild = "Start" | "Stepping" | "Leveling";
  type FinalBuild = import("./Types/build-types").SoloBuild;

  interface Build {
    caster: boolean;
    skillstab: number;
    wantedskills: number[];
    usefulskills: number[];
    precastSkills: number[];
    wantedMerc: MercObj;
    stats: Array<[string, number | "block" | "all"]>;
    skills: Array<[number, number, boolean?]>;
    charms: Record<
      string,
      {
        max: number;
        have: number[];
        classid: number;
        stats: (check: ItemUnit) => boolean;
      }
    >;
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
    currentBuild: StandardBuild | FinalBuild;
    finalBuild: FinalBuild;
    highestDifficulty: string;
    setDifficulty: string;
    charms: Record<string, { max: number; have: number[]; classid: number; stats: (check: ItemUnit) => boolean }>;
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
    itemType?: number;
    classid?: number;
    mode?: number;
    quality?: number;
    sockets?: number;
    location?: number;
    ethereal?: boolean;
    cb?: (item: ItemUnit) => boolean;
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
    getEquippedItems(): ItemUnit[];
    getSkillTabs(classid: number): number[];
    inDanger(checkLoc?: { x: number; y: number } | MeType, range?: number): boolean;
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
    MoveTo(item: ItemUnit, reverseX: boolean, reverseY: boolean, priorityClassIds: number[]): boolean;

    /**
     * @param item
     * @param location
     * @param force
     */
    MakeSpot(item: ItemUnit, location: { x: number; y: number }, force: boolean): boolean;

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

  interface Mercenary {
    minCost: number;

    getMercSkill(merc?: MercUnit): string | false;
    getMercDifficulty(merc?: MercUnit): number;
    getMercAct(merc?: MercUnit): number;
    getMercInfo(merc?: MercUnit): { classid: number; act: number; difficulty: number; type: string | false };
    checkMercSkill(wanted: string, merc?: MercUnit): boolean;
    hireMerc(): boolean;
    timeout: number;
  }
  const Mercenary: Mercenary;

  interface Misc {
    townEnabled: boolean;
    openChestsEnabled: boolean;
    shrineStates: number[];

    openChestsInArea(area: number, chestIds: number[], sort?: (a: Unit, b: Unit) => number): boolean;
    getExpShrine(shrineLocs: number[]): boolean;
    recursiveSearch(o: Record<string, unknown>, n: Record<string, unknown>, changed?: Record<string, unknown>): Record<string, unknown>;
    updateRecursively(oldObj: Record<string, unknown>, newObj: Record<string, unknown>, path?: string[]): void;
  }

  interface Skill {
    switchCast(
      skillId: number,
      givenSettings: { hand?: number; x?: number; y?: number; switchBack?: boolean; oSkill?: boolean },
    ): boolean;
    casterSkills: number[];
    forcePacket: boolean;
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

  interface Pather {
    initialized: boolean;
    canTeleport(): boolean;
    teleUsingCharges(x: number, y: number, maxRange: number): boolean;
    changeAct(act: number): boolean;
    checkWP(area: number, keepMenuOpen?: boolean): boolean;
    clearToExit(currentarea: number, targetarea: number, givenSettings: pathSettings): boolean;
    canUseTeleCharges(): boolean;
    checkForTeleCharges(): void;
    clearUIFlags(): void;
    currentWalkingPath: IPathNode[];
    forceRun: boolean;
    forceWalk: boolean;
    haveTeleCharges: boolean;
    inAnnoyingArea(currArea: number, includeArcane?: boolean): boolean;
    move(target: IPathNode | Unit | PresetUnit, givenSettings?: PathSettings): boolean;
  }

  interface Pickit {
    pickItem(
      unit: ItemUnit,
      status: PickitResult,
      keptLine?: string,
      givenSettings?: { allowClear: boolean; allowMove: boolean },
    ): boolean;
    amountOfPotsNeeded(): Record<number, Record<number, number>>;
    canFit(item: ItemUnit): boolean;
    checkSpotForItems(spot: IPathNode | { x: number; y: number }, checkVsMyDist?: boolean, range?: number): boolean;
    readonly classicMode: boolean;
    essentialList: ItemUnit[];
    essessntialsPick(clearBeforePick?: boolean, builtList?: ItemUnit[], once?: boolean): boolean;
    minItemKeepGoldValue(): number;
  }

  interface Attack {
    clearPos(x: number, y: number, range?: number, pickit?: boolean, cb?: () => boolean): boolean;
    killTarget(name: Monster | string | number): boolean;
    castCharges(skillId: number, unit: Monster): boolean;
    castableSpot(x?: number, y?: number): boolean;
    checkBowOnSwitch(firstInit?: boolean): void;
    clearCoordList(list: { x: number; y: number; radius: number }[], pick?: number): void;
    clearLevelEx(givenSettings?: { spectype?: number; quitWhen?: () => boolean }): boolean;
    clearLevelUntilLevel(charlvl?: number, spectype?: number): boolean;
    clearLocations(list?: Array<[number, number]>): boolean;
    decideSkill(unit: Monster): { timed: number; untimed: number };
    dollAvoid(unit: Monster): boolean;
    getCurrentChargedSkillIds(init?: boolean): boolean;
    getItemCharges(skillId: number): boolean;
    haveDependancy(itemType: number): ItemUnit | false;
    inverseSpotDistance(spot: { x: number; y: number }, distance: number, otherSpot?: Unit): IPathNode | { x: number; y: number };
    pwnAncients(): void;
    pwnDia(): Monster | false;
    pwnDury(): boolean;
    pwnMeph(): void;
    shouldDodge(coord: { x: number; y: number }, monster: Monster): boolean;
    stopClear: boolean;
    switchCastCharges(skillId: number, unit: Monster): boolean;
    useBowOnSwitch(unit: Monster, skillId?: number, switchBack?: boolean): boolean;
    walkingSortMonsters(unitA: Monster, unitB: Monster): number;
  }

  interface ClassAttack {
    doAttack(unit: Monster): AttackResult;
    doAttack(unit: Monster, precast?: boolean): AttackResult;
    doAttack(unit: Monster, recheck?: boolean): AttackResult;
    doAttack(unit: Monster, precast?: boolean, once?: boolean): AttackResult;
    doCast(unit: Monster, timedSkill: number, untimedSkill: number): AttackResult;
    doCast(
      unit: Monster,
      choosenSkill: { have: boolean; skill: number; range: number; mana: number; timed: boolean },
    ): AttackResult;
    afterAttack(pickit?: boolean): void;
    lightFuryTick: number;
  }

  interface Town {
    doChores(repair?: boolean, givenTasks?: extraTasks): boolean;
    clearJunk(): boolean;
    fillTomes(): void;
    haveItemsToSell(): number;
    itemResult(item: ItemUnit, result: { result: PickitResult; line: string | null }, system?: string, sell?: boolean): void;
    lastShopped: { who: string; tick: number };
    needForceID(item: ItemUnit): boolean;
    sell: ItemUnit[];
    sellItems(itemList?: ItemUnit[]): boolean;
    sortStash(force?: boolean): boolean;
    systemsKeep(item: ItemUnit): boolean;
  }

  interface CharData {
    filePath: string;
    threads: string[];

    login: {
      create(): any;
      getObj(): any;
      getStats(): any;
      updateData(arg: string, property: object | string, value: any): boolean;
    };

    // ignoring the sub objs for now
    updateConfig(): void;
    create(): MyData;
    getObj(): MyData;
    getStats(): MyData;
    updateData(arg: string, property: object | string, value: any): boolean;
    /** @alias CharData.delete */
    _delete(deleteMain: boolean): boolean;
    _default: MyData;
    charms: Map<number | string, { classid: number; count(): { curr: number; max: number } }>;
    pots: Map<number | string, { state: number; check: () => boolean; tick: number; duration: number; active(): boolean; timeLeft(): number; need(): boolean }>;
    skillData: {
        skills: number[];
        currentChargedSkills: number[];
        chargedSkills: { skill: number; level: number; charges: number; maxcharges: number; gid: number }[];
        chargedSkillsOnSwitch: { skill: number; level: number; charges: number; maxcharges: number; gid: number }[];
        bow: {
            initialized: boolean;
            onSwitch: boolean;
            bowGid: number;
            bowType: number;
            bowOnSwitch: boolean;
            arrows: number;
            quiverType: number;
            setBowInfo(bow: ItemUnit, init?: boolean): void;
            setArrowInfo(quiver: ItemUnit): void;
            resetBowData(): void;
        };
        init(skillIds: number[], mainSkills: { skill: number; level: number; charges: number; maxcharges: number; gid: number }[], switchSkills: { skill: number; level: number; charges: number; maxcharges: number; gid: number }[]): void;
        update(): void;
        haveChargedSkill(skillid?: number | number[]): boolean;
        haveChargedSkillOnSwitch(skillid?: number): boolean;
    };
    delete(deleteMain?: boolean): boolean;
  }
  const CharData: CharData;


  interface GameTracker {
    Total: number;
    InGame: number;
    OOG: number;
    LastLevel: number;
    LastSave: number;
  }

  interface Tracker {
    GTPath: string;
    LPPath: string;
    SPPath: string;
    LPHeader: string;
    SPHeader: string;
    tick: number;
    _default: GameTracker;
    initialize(): boolean;
    getObj(path: string): GameTracker | false;
    readObj(jsonPath: string): GameTracker | false;
    writeObj(obj: GameTracker, path: string): boolean;
    resetGameTime(): void;
    reset(): void;
    checkValidity(): void;
    totalDays(milliseconds: number): string;
    script(starttime: number, subscript: string, startexp: number): boolean;
    leveling(): boolean;
    update(oogTick?: number): boolean;
    IPPath: string;
    scriptStart(script: string, tick: number, expStart: number): void;
    clearInProgress(): void;
    scriptChicken(): boolean;
    recoverFromCrash(): boolean;
  }
  const Tracker: Tracker;

  interface SetUp {
    mercEnabled: boolean;
    currentBuild: StandardBuild | FinalBuild;
    finalBuild: FinalBuild;
    stopAtLevel: number | false;

    init(): void;
    include(): void;
    finalRespec(): number;
    getTemplate(): { buildType: string; template: string };
    specPush(specType: string): number[];
    makeNext(): void;
    belt(): void;
    buffers(): void;
    bowQuiver(): void;
    imbueItems(): string[];
    config(): void;
    _buildTemplate: string;
    readonly mercwatch: boolean;
    autoBuild(): boolean;
  }
  const SetUp: SetUp;

  interface Check {
    lowGold: boolean;

    gold(): boolean;
    brokeAf(): boolean;
    broken(): 0 | 1 | 2;
    brokeCheck(): boolean;
    resistance(): { Status: boolean; FR: number; CR: number; LR: number; PR: number };
    nextDifficulty(announce: boolean): string | false;
    runes(): boolean;
    haveItem(type: string | number, flag?: string | number, iName?: string): boolean;
    currentBuild(): Build;
    finalBuild(): Build;
    itemSockables(type: string | number, quality?: string | number, iName?: string): boolean;
    checkSpecialCase(): void;
    usePreviousSocketQuest(): void;
  }
  const Check: Check;

  interface SoloWantsNeedEntry {
    classid: number;
    /** Socketable classids still needed to fill this item's sockets. */
    needed: number[];
  }

  // Value shape of the global `SoloWants` const in SoloWants.js (bound there via JSDoc @type).
  // Declaring the const here as well would collide: both files are global scripts.
  interface SoloWants {
    needList: SoloWantsNeedEntry[];
    validGids: number[];

    checkItem(item: ItemUnit): boolean;
    keepItem(item: ItemUnit): boolean;
    buildList(): void;
    addToList(item: ItemUnit): boolean;
    update(item: ItemUnit): boolean;
    ensureList(): void;
    checkSubrecipes(): boolean;
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
  const SoloWants: SoloWants;

  // Value shape of the global `AutoEquip` const in ItemOverrides.js (bound there via JSDoc @type).
  // Declaring the const here as well would collide: both files are global scripts.
  interface AutoEquip {
    hasTier(item: ItemUnit): boolean;
    wanted(item: ItemUnit): boolean;
    run(): void;
  }

  type extraTasks = {
    thawing?: boolean;
    antidote?: boolean;
    stamina?: boolean;
    fullChores?: boolean;
  }
  const AutoEquip: AutoEquip;

  interface LocationAction {
    run(): void;
  }
  const LocationAction: LocationAction;

  type PresetObjectUnit = {
    x: number;
    y: number;
    area: number;
    classid: number;
    type: number;
  };

  class ShrineInstance {
    constructor(shrine: ObjectUnit);

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
    constructor(index: number);

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

    hasMonsterType(type: number): boolean;
    forEachMonster(callback: (monster: number) => void): void;
    forEachMonsterAndMinion(callback: (monster: number) => void): void;
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

  const AreaData: typeof import("./Modules/GameData/AreaData");

  interface CoordinatePoint {
    x: number;
    y: number;
  }

  /**
   * Block bits enumeration for collision detection
   */
  enum BlockBits {
    BlockWall = 1,
    LineOfSight = 2,
    Ranged = 4,
    PlayerToWalk = 8,
    DarkArea = 16,
    Casting = 32,
    Unknown_NeverSeen = 64,
    Players = 128,
    Monsters = 256,
    Items = 512,
    Objects = 1024,
    ClosedDoor = 2048,
    IsOnFloor = 4096,
    FriendlyNPC = 8192,
    Unknown_3 = 16384,
    DeadBodies = 32768,
  }

  /**
   * Collision enumeration for specific collision types
   */
  enum Collision {
    BLOCK_MISSILE = 2062,
  }

  interface Coords {
    /**
     * Block bits enumeration for collision detection
     */
    BlockBits: typeof BlockBits;

    /**
     * Collision enumeration for missile blocking
     */
    Collision: typeof Collision;

    /**
     * Get coordinates between two points using line algorithm
     * @param {number} x1 - Starting X coordinate
     * @param {number} y1 - Starting Y coordinate
     * @param {number} x2 - Ending X coordinate
     * @param {number} y2 - Ending Y coordinate
     * @returns {CoordinatePoint[]} Array of coordinate points
     */
    getCoordsBetween(x1: number, y1: number, x2: number, y2: number): CoordinatePoint[];

    /**
     * Convert arguments to coordinate array
     * @param {any[]} args - Arguments to convert
     * @param {string} caller - Name of calling function
     * @param {number} [length=2] - Expected length of coordinate array
     * @returns {CoordinatePoint[]} Array of coordinate points
     */
    convertToCoordArray(args: any[], caller: string, length?: number): CoordinatePoint[];

    /**
     * Get collision flags between coordinates
     * @param {...any} args - Coordinate arguments (x1, y1, x2, y2 or two coordinate objects)
     * @returns {number} Collision flags as bitmask
     */
    getCollisionBetweenCoords(...args: any[]): number;

    /**
     * Check if path between coordinates is blocked
     * @param {...any} args - Coordinate arguments (x1, y1, x2, y2 or two coordinate objects)
     * @returns {boolean} True if path is blocked
     */
    isBlockedBetween(...args: any[]): boolean;

    /**
     * Check collision between two units with specific collision flags
     * @param {Unit} unit1 - First unit
     * @param {Unit} unit2 - Second unit
     * @param {number} coll - Collision flags to check
     * @returns {boolean} True if collision exists
     */
    checkCollisionBetween(unit1: Unit, unit2: Unit, coll: number): boolean;

    /**
     * Find casting spot for a specific skill
     * @param {number} skill - Skill ID
     * @param {Unit} unit - Target unit
     * @param {number} [minRange=5] - Minimum casting range
     * @param {number} [thickness=5] - Collision thickness
     * @param {number} [collision=Collision.BLOCK_MISSILE] - Collision type to check
     * @returns {CoordinatePoint | undefined} Casting spot coordinates or undefined if none found
     */
    findCastingSpotSkill(
      skill: number,
      unit: Unit,
      minRange?: number,
      thickness?: number,
      collision?: number,
    ): CoordinatePoint | undefined;

    /**
     * Find casting spot within specified range
     * @param {number} range - Maximum casting range
     * @param {Unit} unit - Target unit
     * @param {number} [minRange=5] - Minimum casting range
     * @param {number} [thickness=5] - Collision thickness
     * @param {number} [collision=Collision.BLOCK_MISSILE] - Collision type to check
     * @returns {CoordinatePoint | undefined} Casting spot coordinates or undefined if none found
     */
    findCastingSpotRange(
      range: number,
      unit: Unit,
      minRange?: number,
      thickness?: number,
      collision?: number,
    ): CoordinatePoint | undefined;

    /**
     * Get valid spots around a unit for casting/positioning
     * @param {number} collision - Collision flags to avoid
     * @param {number} thickness - Collision thickness to check
     * @param {Unit} unit - Reference unit
     * @returns {CoordinatePoint[]} Array of valid coordinate spots
     */
    getSpotsFor(collision: number, thickness: number, unit: Unit): CoordinatePoint[];
  }

  /**
   * Room extension for coordinate checking
   */
  interface Room {
    /**
     * Check if coordinates are within this room
     * @param {...any} args - Coordinate arguments (x, y or coordinate object)
     * @returns {boolean} True if coordinates are in room
     */
    isInRoom(...args: any[]): boolean;
  }

  /**
   * Coordinate utilities module
   */
  const Coords: Coords;

  const GameData: typeof import("./Modules/GameData/GameData");

  const Settings: SettingsInterface;

  interface SoloEvents {
    filePath: string;
    check: boolean;
    inGame: boolean;
    cloneWalked: boolean;
    townChicken: {
      disabled: boolean;
      running: boolean;
    };
    profileResponded: boolean;
    gameInfo: {
      gameName: string;
      gamePass: string;
    };

    outOfGameCheck(): boolean;
    inGameCheck(): boolean;
    getProfiles(): string[];
    getCharacterNames(): string[];
    sendToProfile(profile: string, message: any, mode?: number): void;
    sendToList(message: any, mode?: number): void;
    dropCharm(charm: ItemUnit): boolean;
    killdclone(): void;
    moveSettings: {
      allowTeleport: boolean;
      allowClearing: boolean;
      allowPicking: boolean;
      allowTown: boolean;
      allowNodeActions: boolean;
      retry: number;
    };
    moveTo(x: number, y: number, givenSettings?: pathSettings): boolean;
    skip(): void;
    dodge(): void;
    finishDen(): void;
    bugAndy(): void;
    diaEvent(bytes?: any[]): void;
    skippedWaves: number[];
    baalEvent(bytes?: any[]): void;
  }

  const SoloEvents: SoloEvents;

  interface Quest {
    preReqs(): void;
    cubeItems(outcome: number, ...classids: number[]): boolean;
    placeStaff(): boolean;
    tyraelTomb(): boolean;
    stashItem(classid: number | ItemUnit): boolean;
    collectItem(classid: number, chestID?: number): ItemUnit | boolean;
    equipItem(classid: number, loc: number): boolean;
    smashSomething(classid: number): boolean;
    npcAction(npcName: string, action: number | number[]): boolean;
    characterRespec(): void;
    useSocketQuest(item?: ItemUnit): boolean;
    useImbueQuest(item?: ItemUnit): boolean;
    unfinishedQuests(): boolean;
  }

  const Quest: Quest;
}
export {};
