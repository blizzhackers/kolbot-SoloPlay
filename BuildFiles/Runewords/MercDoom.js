(function () {
  const Doom = [
    "[name] == HelRune # # [maxquantity] == 1",
    "[name] == OhmRune",
    "[name] == LoRune",
    "[name] == UmRune",
    "[name] == ChamRune",
  ];
  NTIP.buildList(Doom);

  /** @type {GetOwnedSettings} */
  const wanted = {
    itemType: sdk.items.type.Polearm,
    mode: sdk.items.mode.inStorage,
    sockets: 5,
    ethereal: true,
    /** @param {ItemUnit} item */
    cb: function (item) {
      return item.isBaseType;
    }
  };

  // Have Cham, Lo, and Ohm Rune before looking for normal base
  if (me.haveRunes([sdk.items.runes.Cham, sdk.items.runes.Lo, sdk.items.runes.Ohm])) {
    if (!me.getOwned(wanted).length) {
      NTIP.addLine("([name] == thresher || [name] == crypticaxe || [name] == greatpoleaxe || [name] == giantthresher) && [flag] == ethereal && [quality] == normal # [sockets] == 0 # [maxquantity] == 1");
    }
    NTIP.addLine("([name] == thresher || [name] == crypticaxe || [name] == greatpoleaxe || [name] == giantthresher) && [flag] == ethereal && [quality] >= normal && [quality] <= superior # [sockets] == 5 # [maxquantity] == 1");
  } else {
    NTIP.addLine("([name] == thresher || [name] == crypticaxe || [name] == greatpoleaxe || [name] == giantthresher) && [flag] == ethereal && [quality] == superior # [enhanceddamage] >= 10 && [sockets] == 5 # [maxquantity] == 1");
  }
  // Cube to Cham
  if (!me.getItem(sdk.items.runes.Cham)) {
    Config.Recipes.push([Recipe.Rune, "Mal Rune"]);
    Config.Recipes.push([Recipe.Rune, "Ist Rune"]);
    Config.Recipes.push([Recipe.Rune, "Gul Rune"]);
    Config.Recipes.push([Recipe.Rune, "Vex Rune"]);
    Config.Recipes.push([Recipe.Rune, "Ohm Rune"]);
    if ((me.barbarian && me.haveAll([{ name: sdk.locale.items.Grief }, { name: sdk.locale.items.Fortitude }]))
      || (["Witchyzon", "Wfzon"].includes(SetUp.finalBuild) && me.checkItem({ name: sdk.locale.items.ChainsofHonor }).have)
      || (SetUp.currentBuild === "Faithbowzon")) {
      Config.Recipes.push([Recipe.Rune, "Lo Rune"]);
    }
    Config.Recipes.push([Recipe.Rune, "Sur Rune"]);
    Config.Recipes.push([Recipe.Rune, "Ber Rune"]);
    Config.Recipes.push([Recipe.Rune, "Jah Rune"]);
  }
  // Cube to Lo
  if (!me.getItem(sdk.items.runes.Lo)) {
    if (me.barbarian
      || (SetUp.currentBuild === "Faithbowzon" && me.checkItem({ name: sdk.locale.items.CalltoArms }).have)
      || (["Witchyzon", "Wfzon"].includes(SetUp.finalBuild)
      && me.haveAll([{ name: sdk.locale.items.ChainsofHonor }, { name: sdk.locale.items.CalltoArms }]))) {
      Config.Recipes.push([Recipe.Rune, "Mal Rune"]);
      Config.Recipes.push([Recipe.Rune, "Ist Rune"]);
      Config.Recipes.push([Recipe.Rune, "Gul Rune"]);
      Config.Recipes.push([Recipe.Rune, "Vex Rune"]);
      Config.Recipes.push([Recipe.Rune, "Ohm Rune"]);
    }
  }
  // Cube to Ohm
  if (!me.getItem(sdk.items.runes.Ohm)) {
    Config.Recipes.push([Recipe.Rune, "Mal Rune"]);
    Config.Recipes.push([Recipe.Rune, "Ist Rune"]);
    Config.Recipes.push([Recipe.Rune, "Gul Rune"]);
    Config.Recipes.push([Recipe.Rune, "Vex Rune"]);
  }
  Config.Recipes.push([Recipe.Socket.Weapon, "giantthresher"]);
  Config.Recipes.push([Recipe.Socket.Weapon, "greatpoleaxe"]);
  Config.Recipes.push([Recipe.Socket.Weapon, "crypticaxe"]);
  Config.Recipes.push([Recipe.Socket.Weapon, "thresher"]);
  Config.Runewords.push([Runeword.Doom, "giantthresher"]);
  Config.Runewords.push([Runeword.Doom, "greatpoleaxe"]);
  Config.Runewords.push([Runeword.Doom, "crypticaxe"]);
  Config.Runewords.push([Runeword.Doom, "thresher"]);
  Config.KeepRunewords.push("[type] == polearm # [holyfreezeaura] == 12");
})();
