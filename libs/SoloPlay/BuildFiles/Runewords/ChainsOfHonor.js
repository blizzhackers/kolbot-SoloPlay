(function () {
  const CoH = [
    "[name] == DolRune # # [maxquantity] == 1",
    "[name] == UmRune",
    "[name] == BerRune",
    "[name] == IstRune",
  ];
  NTIP.buildList(CoH);

  /** @type {GetOwnedSettings} */
  const wanted = {
    itemType: sdk.items.type.Armor,
    mode: sdk.items.mode.inStorage,
    sockets: 4,
    ethereal: false,
    /** @param {ItemUnit} item */
    cb: function (item) {
      return item.isBaseType
        && [sdk.items.ArchonPlate, sdk.items.DuskShroud, sdk.items.Wyrmhide].includes(item.classid);
    }
  };

  // Cube to Ber rune
  if (!me.getItem(sdk.items.runes.Ber)) {
    if (me.checkItem({ name: sdk.locale.items.CalltoArms }).have || ["Plaguewolf", "Wolf", "Uberconc"].includes(SetUp.finalBuild)) {
      Config.Recipes.push([Recipe.Rune, "Mal Rune"]);
      Config.Recipes.push([Recipe.Rune, "Ist Rune"]);
      Config.Recipes.push([Recipe.Rune, "Gul Rune"]);
      Config.Recipes.push([Recipe.Rune, "Vex Rune"]);
      Config.Recipes.push([Recipe.Rune, "Ohm Rune"]);
    }

    if (me.checkItem({ name: sdk.locale.items.Grief }).have || ["Uberconc"].indexOf(SetUp.finalBuild) === -1) {
      Config.Recipes.push([Recipe.Rune, "Lo Rune"]);
    }

    Config.Recipes.push([Recipe.Rune, "Sur Rune"]);
  }

  // Cube to Um rune
  if (!me.getItem(sdk.items.runes.Um)) {
    Config.Recipes.push([Recipe.Rune, "Lem Rune"]);
    Config.Recipes.push([Recipe.Rune, "Pul Rune"]);
  }

  // Have Ber rune before looking for normal base
  if (me.getItem(sdk.items.runes.Ber)) {
    if (!me.getOwned(wanted).length) {
      NTIP.addLine("([name] == archonplate || [name] == duskshroud || [name] == wyrmhide) && [flag] != ethereal && [quality] >= normal && [quality] <= superior # [sockets] == 0 # [maxquantity] == 1");
    }

    NTIP.addLine("([name] == archonplate || [name] == duskshroud || [name] == wyrmhide) && [flag] != ethereal && [quality] >= normal && [quality] <= superior # [sockets] == 4 # [maxquantity] == 1");
  } else {
    NTIP.addLine("([name] == archonplate || [name] == duskshroud || [name] == wyrmhide) && [flag] != ethereal && [quality] == superior # [enhanceddefense] >= 10 && [sockets] == 4 # [maxquantity] == 1");
  }

  Config.Recipes.push([Recipe.Socket.Armor, "archonplate", Roll.NonEth]);
  Config.Recipes.push([Recipe.Socket.Armor, "duskshroud", Roll.NonEth]);
  Config.Recipes.push([Recipe.Socket.Armor, "wyrmhide", Roll.NonEth]);

  Config.Runewords.push([Runeword.ChainsofHonor, "archonplate"]);
  Config.Runewords.push([Runeword.ChainsofHonor, "duskshroud"]);
  Config.Runewords.push([Runeword.ChainsofHonor, "wyrmhide"]);

  Config.KeepRunewords.push("[type] == armor # [fireresist] == 65 && [hpregen] == 7");
})();
