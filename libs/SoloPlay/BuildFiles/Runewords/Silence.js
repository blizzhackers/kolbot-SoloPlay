(function () {
  const Silence = [
    "[name] == EldRune # # [maxquantity] == 1",
    "[name] == TirRune # # [maxquantity] == 1",
    "[name] == DolRune # # [maxquantity] == 1",
    "[name] == HelRune # # [maxquantity] == 1",
    "[name] == IstRune",
    "[name] == VexRune",
  ];
  NTIP.buildList(Silence);

  /** @type {GetOwnedSettings} */
  const wanted = {
    classid: sdk.items.PhaseBlade,
    mode: sdk.items.mode.inStorage,
    sockets: 6,
    /** @param {ItemUnit} item */
    cb: function (item) {
      return item.isBaseType;
    }
  };

  // Have Vex before collecting base
  if (me.getItem(sdk.items.runes.Vex)) {
    NTIP.addLine("[name] == phaseblade && [quality] <= superior && [flag] != ethereal # [sockets] == 6 # [maxquantity] == 1");

    // Have Ist+Vex rune but do not have a base yet
    if (me.getItem(sdk.items.runes.Ist) && !me.getOwned(wanted).length) {
      NTIP.addLine("[name] == phaseblade && [quality] == normal && [flag] != ethereal # [sockets] == 0 # [maxquantity] == 1");
      Config.Recipes.push([Recipe.Socket.Weapon, "phaseblade"]);
    }
  }

  // Cube to Ist rune
  if (!me.getItem(sdk.items.runes.Ist)) {
    Config.Recipes.push([Recipe.Rune, "Um Rune"]);
    Config.Recipes.push([Recipe.Rune, "Mal Rune"]);
  }

  // Cube to Vex rune
  if (!me.getItem(sdk.items.runes.Vex)) {
    Config.Recipes.push([Recipe.Rune, "Lem Rune"]);
    Config.Recipes.push([Recipe.Rune, "Pul Rune"]);
    Config.Recipes.push([Recipe.Rune, "Um Rune"]);
    Config.Recipes.push([Recipe.Rune, "Mal Rune"]);
    Config.Recipes.push([Recipe.Rune, "Ist Rune"]);
    Config.Recipes.push([Recipe.Rune, "Gul Rune"]);
  }

  Config.Runewords.push([Runeword.Silence, "phaseblade"]);
  Config.KeepRunewords.push("[type] == sword # [itemallskills] == 2 && [ias] == 20 && [fireresist] == 75");
})();
