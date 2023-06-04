(function (module) {
  // these builds are not possible to do on classic
  const impossibleClassicBuilds = [
    "Bumper", "Socketmule", "Witchyzon",
    "Auradin", "Torchadin", "Immortalwhirl",
    "Sancdreamer", "Faithbowzon", "Wfzon"
  ];
  // these builds are not possible to do without ladder runewords
  const impossibleNonLadderBuilds = ["Auradin", "Sancdreamer", "Faithbowzon"];

  // SoloPlay general gameplay items
  const nipItems = {
    General: [
      "[name] == tomeoftownportal",
      "[name] == tomeofidentify",
      "[name] == gold # [gold] >= me.charlvl * 3 * me.diff",
      "[name] == gold && [distance] < 5 # [gold] >= 1",
      "(me.charlvl < 20 || me.gold < 500) && [name] == minorhealingpotion",
      "(me.charlvl < 25 || me.gold < 2000) && [name] == lighthealingpotion",
      "(me.charlvl < 29 || me.gold < 5000) && [name] == healingpotion",
      "[name] == greaterhealingpotion",
      "[name] == superhealingpotion",
      "(me.charlvl < 20 || me.gold < 1000) && [name] == minormanapotion",
      "[name] == lightmanapotion",
      "[name] == manapotion",
      "[name] == greatermanapotion",
      "[name] == supermanapotion",
      "[name] == rejuvenationpotion",
      "[name] == fullrejuvenationpotion",
      "[name] == scrolloftownportal # # [maxquantity] == 20",
      "[name] == scrollofidentify # # [maxquantity] == 20",
      "[name] == key # # [maxquantity] == 12",
    ],

    Quest: [
      "[name] == mephisto'ssoulstone",
      "[name] == hellforgehammer",
      "[name] == scrollofinifuss",
      "[name] == keytothecairnstones",
      "[name] == bookofskill",
      "[name] == horadriccube",
      "[name] == shaftofthehoradricstaff",
      "[name] == topofthehoradricstaff",
      "[name] == horadricstaff",
      "[name] == ajadefigurine",
      "[name] == thegoldenbird",
      "[name] == potionoflife",
      "[name] == lamesen'stome",
      "[name] == khalim'seye",
      "[name] == khalim'sheart",
      "[name] == khalim'sbrain",
      "[name] == khalim'sflail",
      "[name] == khalim'swill",
      "[name] == scrollofresistance",
    ],
  };
  
  const addSocketableObj = (classid, socketWith = [], temp = [], useSocketQuest = false, condition = () => {}) => ({
    classid: classid,
    socketWith: socketWith,
    temp: temp,
    useSocketQuest: useSocketQuest,
    condition: condition
  });
  const basicSocketables = {
    caster: [],
    all: [],
  };
  // insight base
  basicSocketables.all.push(addSocketableObj(sdk.items.Bill, [], [], true, (item) =>
    me.nightmare && item.ilvl >= 26 && item.isBaseType && item.ethereal
  ));
  // insight base
  basicSocketables.all
    .push(addSocketableObj(sdk.items.ColossusVoulge, [], [], true, (item) =>
      me.nightmare && item.ilvl >= 26 && item.isBaseType && item.ethereal
    ));
  // Crown of Ages
  basicSocketables.caster
    .push(addSocketableObj(sdk.items.Corona, [sdk.items.runes.Ber, sdk.items.runes.Um], [sdk.items.gems.Perfect.Ruby],
      false, (item) => item.unique
    ));
  // Moser's
  basicSocketables.caster
    .push(addSocketableObj(sdk.items.RoundShield, [sdk.items.runes.Um], [sdk.items.gems.Perfect.Diamond],
      false, (item) => item.unique && !item.ethereal
    ));
  // Spirit Forge
  basicSocketables.caster
    .push(addSocketableObj(sdk.items.LinkedMail, [sdk.items.runes.Shael], [sdk.items.gems.Perfect.Ruby],
      false, (item) => item.unique && !item.ethereal
    ));
  // Dijjin Slayer
  basicSocketables.caster
    .push(addSocketableObj(sdk.items.Ataghan, [sdk.items.runes.Amn], [sdk.items.gems.Perfect.Skull],
      false, (item) => !Check.currentBuild().caster && item.unique && !item.ethereal
    ));
  // Bone Hew - for merc
  basicSocketables.caster
    .push(addSocketableObj(sdk.items.OgreAxe,
      [sdk.items.runes.Hel, sdk.items.runes.Amn], [sdk.items.gems.Perfect.Skull],
      false, (item) => item.unique
    ));
  // spirit base
  basicSocketables.caster
    .push(addSocketableObj(sdk.items.BroadSword, [], [], true,
      (item) => me.normal && !Check.haveBase("sword", 4)
      && !me.checkItem({ name: sdk.locale.items.Spirit, itemtype: sdk.items.type.Sword }).have
      && item.ilvl >= 26 && item.isBaseType && !item.ethereal
    ));
  // spirit base
  basicSocketables.caster
    .push(addSocketableObj(sdk.items.CrystalSword, [], [], true,
      (item) => me.normal && !Check.haveBase("sword", 4)
      && !me.checkItem({ name: sdk.locale.items.Spirit, itemtype: sdk.items.type.Sword }).have
    && item.ilvl >= 26 && item.ilvl <= 40 && item.isBaseType && !item.ethereal
    ));
  // Lidless
  basicSocketables.caster
    .push(addSocketableObj(sdk.items.GrimShield,
      [sdk.items.runes.Um], [sdk.items.gems.Perfect.Diamond], !me.hell,
      (item) => item.unique && (item.isInStorage || (item.isEquipped && !item.isOnSwap)) && !item.ethereal
    ));

  const buildAutoBuildTempObj = (update = () => {}) => ({
    SkillPoints: [-1],
    StatPoints: [-1, -1, -1, -1, -1],
    Update: update
  });

  module.exports = {
    impossibleClassicBuilds: impossibleClassicBuilds,
    impossibleNonLadderBuilds: impossibleNonLadderBuilds,
    nipItems: nipItems,
    basicSocketables: basicSocketables,
    addSocketableObj: addSocketableObj,
    buildAutoBuildTempObj: buildAutoBuildTempObj,
  };
})(module);
