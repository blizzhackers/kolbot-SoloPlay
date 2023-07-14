(function () {
  const Fortitude = [
    "[name] == ElRune # # [maxquantity] == 1",
    "[name] == SolRune # # [maxquantity] == 1",
    "[name] == DolRune # # [maxquantity] == 1",
    "[name] == LoRune",
  ];
  NTIP.buildList(Fortitude);

  /** @type {GetOwnedSettings} */
  const wanted = {
    itemType: sdk.items.type.Armor,
    mode: sdk.items.mode.inStorage,
    ethereal: false,
    sockets: 4,
    /** @param {ItemUnit} item */
    cb: function (item) {
      return item.isBaseType
        && [sdk.items.ArchonPlate, sdk.items.DuskShroud, sdk.items.Wyrmhide].includes(item.classid);
    }
  };

  // Have Lo rune before looking for normal base
  if (me.getItem(sdk.items.runes.Lo)) {
    if (!me.getOwned(wanted).length) {
      NTIP.addLine("([name] == archonplate || [name] == duskshroud || [name] == wyrmhide) && [flag] != ethereal && [quality] >= normal && [quality] <= superior # [sockets] == 0 # [maxquantity] == 1");
    }

    NTIP.addLine("([name] == archonplate || [name] == duskshroud || [name] == wyrmhide) && [flag] != ethereal && [quality] >= normal && [quality] <= superior # [sockets] == 4 # [maxquantity] == 1");
  } else {
    NTIP.addLine("([name] == archonplate || [name] == duskshroud || [name] == wyrmhide) && [flag] != ethereal && [quality] == superior # [enhanceddefense] >= 10 && [sockets] == 4 # [maxquantity] == 1");
  }

  // Cube to Lo rune
  if (!me.getItem(sdk.items.runes.Lo)) {
    Config.Recipes.push([Recipe.Rune, "Ist Rune"]);
    Config.Recipes.push([Recipe.Rune, "Gul Rune"]);
    Config.Recipes.push([Recipe.Rune, "Vex Rune"]);
    Config.Recipes.push([Recipe.Rune, "Ohm Rune"]);
  }

  Config.Recipes.push([Recipe.Socket.Armor, "archonplate", Roll.NonEth]);
  Config.Recipes.push([Recipe.Socket.Armor, "duskshroud", Roll.NonEth]);
  Config.Recipes.push([Recipe.Socket.Armor, "wyrmhide", Roll.NonEth]);

  Config.Runewords.push([Runeword.Fortitude, "archonplate"]);
  Config.Runewords.push([Runeword.Fortitude, "duskshroud"]);
  Config.Runewords.push([Runeword.Fortitude, "wyrmhide"]);

  Config.KeepRunewords.push("[type] == armor # [enhanceddefense] >= 200 && [enhanceddamage] >= 300");
})();
