(function () {
  if (!Check.haveItem("helm", "runeword", "Lore")) {
    const loreRunes = [
      "[name] == OrtRune # # [maxquantity] == 1",
      "[name] == SolRune # # [maxquantity] == 1",
    ];
    NTIP.buildList(loreRunes);

    // Cube to Sol rune
    if (!me.getItem(sdk.items.runes.Sol)) {
      Config.Recipes.push([Recipe.Rune, "Ort Rune"]);
      Config.Recipes.push([Recipe.Rune, "Thul Rune"]);
      Config.Recipes.push([Recipe.Rune, "Amn Rune"]);
    }
  } else {
  // Cube to Sol rune
    if (!me.getItem(sdk.items.runes.Sol)) {
      Config.Recipes.push([Recipe.Rune, "Amn Rune"]);
    }
  }

  let classLoreHelm = [];
  const loreHelm = [
    "!me.hell && ([name] == crown || [name] == bonehelm || [name] == fullhelm) && [flag] != ethereal && [quality] >= normal && [quality] <= superior # [sockets] == 2 # [maxquantity] == 1",
    "([name] == casque || [name] == sallet || [name] == deathmask || [name] == grimhelm) && [flag] != ethereal && [quality] >= normal && [quality] <= superior # [sockets] == 2 # [maxquantity] == 1",
  ];

  if (me.druid) {
    classLoreHelm = [
      "[name] == OrtRune # # [maxquantity] == 1",
      "[name] == SolRune # # [maxquantity] == 1",
      "[type] == pelt && [flag] != ethereal && [quality] >= normal && [quality] <= superior # [sockets] == 2",
      "[type] == pelt && [quality] == normal # ([druidskills]+[elementalskilltab]+[skillcyclonearmor]+[skilltwister]+[skilltornado]+[skillhurricane]) >= 1 && [sockets] == 0",
    ];
    NTIP.buildList(classLoreHelm);

    // Normal Helms
    if (me.equipped.get(sdk.body.Head).tier < 150) {
      NTIP.buildList(loreHelm);
    }

    // Pelts
    Config.Runewords.push([Runeword.Lore, "wolfhead"]);
    Config.Runewords.push([Runeword.Lore, "hawkhelm"]);
    Config.Runewords.push([Runeword.Lore, "antlers"]);
    Config.Runewords.push([Runeword.Lore, "falconmask"]);
    Config.Runewords.push([Runeword.Lore, "spiritmask"]);
    Config.Runewords.push([Runeword.Lore, "alphahelm"]);
    Config.Runewords.push([Runeword.Lore, "griffonheaddress"]);
    Config.Runewords.push([Runeword.Lore, "hunter'sguise"]);
    Config.Runewords.push([Runeword.Lore, "sacredfeathers"]);
    Config.Runewords.push([Runeword.Lore, "totemicmask"]);
    Config.Runewords.push([Runeword.Lore, "bloodspirit"]);
    Config.Runewords.push([Runeword.Lore, "sunspirit"]);
    Config.Runewords.push([Runeword.Lore, "earthspirit"]);
    Config.Runewords.push([Runeword.Lore, "skyspirit"]);
    Config.Runewords.push([Runeword.Lore, "dreamspirit"]);

    Config.Recipes.push([Recipe.Socket.Helm, "wolfhead"]);
    Config.Recipes.push([Recipe.Socket.Helm, "hawkhelm"]);
    Config.Recipes.push([Recipe.Socket.Helm, "antlers"]);
    Config.Recipes.push([Recipe.Socket.Helm, "falconmask"]);
    Config.Recipes.push([Recipe.Socket.Helm, "alphahelm"]);
    Config.Recipes.push([Recipe.Socket.Helm, "griffonheaddress"]);
    Config.Recipes.push([Recipe.Socket.Helm, "hunter'sguise"]);
    Config.Recipes.push([Recipe.Socket.Helm, "sacredfeathers"]);
    Config.Recipes.push([Recipe.Socket.Helm, "totemicmask"]);
    Config.Recipes.push([Recipe.Socket.Helm, "bloodspirit"]);
    Config.Recipes.push([Recipe.Socket.Helm, "sunspirit"]);
    Config.Recipes.push([Recipe.Socket.Helm, "earthspirit"]);
    Config.Recipes.push([Recipe.Socket.Helm, "skyspirit"]);
    Config.Recipes.push([Recipe.Socket.Helm, "dreamspirit"]);

    Config.KeepRunewords.push("[type] == pelt # [lightresist] >= 25");
  }

  if (me.barbarian) {
    classLoreHelm = [
      "[name] == OrtRune # # [maxquantity] == 1",
      "[name] == SolRune # # [maxquantity] == 1",
      "[type] == primalhelm && [flag] != ethereal && [quality] >= normal && [quality] <= superior && [strreq] <= 150 # [sockets] == 2",
      "[type] == primalhelm && [flag] != ethereal && [quality] == normal && [strreq] <= 150 # ([barbarianskills]+[barbcombatskilltab]+[skillbattleorders]+[skillfrenzy]+[skilldoubleswing]+[skillnaturalresistance]) >= 1 && [sockets] == 0",
    ];
    NTIP.buildList(classLoreHelm);

    // Normal Helms
    if (me.equipped.get(sdk.body.Head).tier < 150) {
      NTIP.buildList(loreHelm);
    }

    // Primal Helms
    Config.Runewords.push([Runeword.Lore, "jawbonecap"]);
    Config.Runewords.push([Runeword.Lore, "fangedhelm"]);
    Config.Runewords.push([Runeword.Lore, "hornedhelm"]);
    Config.Runewords.push([Runeword.Lore, "assaulthelmet"]);
    Config.Runewords.push([Runeword.Lore, "avengerguard"]);
    Config.Runewords.push([Runeword.Lore, "jawbonevisor"]);
    Config.Runewords.push([Runeword.Lore, "lionhelm"]);
    Config.Runewords.push([Runeword.Lore, "ragemask"]);
    Config.Runewords.push([Runeword.Lore, "savagehelmet"]);
    Config.Runewords.push([Runeword.Lore, "slayerguard"]);
    Config.Runewords.push([Runeword.Lore, "carnagehelm"]);
    Config.Runewords.push([Runeword.Lore, "furyvisor"]);

    Config.Recipes.push([Recipe.Socket.Helm, "jawbonecap"]);
    Config.Recipes.push([Recipe.Socket.Helm, "fangedhelm"]);
    Config.Recipes.push([Recipe.Socket.Helm, "hornedhelm"]);
    Config.Recipes.push([Recipe.Socket.Helm, "assaulthelmet"]);
    Config.Recipes.push([Recipe.Socket.Helm, "avengerguard"]);
    Config.Recipes.push([Recipe.Socket.Helm, "jawbonevisor"]);
    Config.Recipes.push([Recipe.Socket.Helm, "lionhelm"]);
    Config.Recipes.push([Recipe.Socket.Helm, "ragemask"]);
    Config.Recipes.push([Recipe.Socket.Helm, "savagehelmet"]);
    Config.Recipes.push([Recipe.Socket.Helm, "slayerguard"]);
    Config.Recipes.push([Recipe.Socket.Helm, "carnagehelm"]);
    Config.Recipes.push([Recipe.Socket.Helm, "furyvisor"]);

    Config.KeepRunewords.push("[type] == primalhelm # [LightResist] >= 25");
  }

  if (!me.druid && !me.barbarian) {
    NTIP.buildList(loreHelm);
  }

  // Normal helms
  Config.Runewords.push([Runeword.Lore, "crown"]);
  Config.Runewords.push([Runeword.Lore, "grimhelm"]);
  Config.Runewords.push([Runeword.Lore, "bonehelm"]);
  Config.Runewords.push([Runeword.Lore, "sallet"]);
  Config.Runewords.push([Runeword.Lore, "casque"]);
  Config.Runewords.push([Runeword.Lore, "deathmask"]);
  Config.Runewords.push([Runeword.Lore, "fullhelm"]);

  Config.KeepRunewords.push("([type] == circlet || [type] == helm) # [lightresist] >= 25");
})();
