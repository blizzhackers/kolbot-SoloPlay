(function () {
  const CTA = [
    "[name] == AmnRune # # [maxquantity] == 1",
    "[name] == RalRune # # [maxquantity] == 1",
    "[name] == MalRune",
    "[name] == IstRune",
    "[name] == OhmRune",
  ];
  NTIP.buildList(CTA);

  /** @type {GetOwnedSettings} */
  const wanted = {
    classid: sdk.items.CrystalSword,
    mode: sdk.items.mode.inStorage,
    sockets: 6,
    /** @param {ItemUnit} item */
    cb: function (item) {
      return item.isBaseType;
    }
  };

  // Have Ohm before collecting base
  if (me.getItem(sdk.items.runes.Ohm)) {
    NTIP.addLine("[name] == crystalsword && [quality] >= normal && [quality] <= superior # [sockets] == 5 # [maxquantity] == 1");

    // Have Ohm+Mal+Ist rune but do not have a base yet
    if (me.getItem(sdk.items.runes.Ist)
      && me.getItem(sdk.items.runes.Mal)
      && !me.getOwned(wanted).length) {
      NTIP.addLine("[name] == crystalsword && [quality] == normal # [sockets] == 0 # [maxquantity] == 1");
      Config.Recipes.push([Recipe.Socket.Weapon, "crystalsword"]);
    }
  }

  // Cube to Mal rune
  if (!me.getItem(sdk.items.runes.Mal)) {
    Config.Recipes.push([Recipe.Rune, "Um Rune"]);
  }

  // Cube to Ohm Rune
  if (!me.getItem(sdk.items.runes.Ohm)) {
    Config.Recipes.push([Recipe.Rune, "Lem Rune"]);
    Config.Recipes.push([Recipe.Rune, "Pul Rune"]);
    Config.Recipes.push([Recipe.Rune, "Um Rune"]);
    Config.Recipes.push([Recipe.Rune, "Mal Rune"]);
    Config.Recipes.push([Recipe.Rune, "Ist Rune"]);
    Config.Recipes.push([Recipe.Rune, "Gul Rune"]);

    if (me.checkItem({ name: sdk.locale.items.HeartoftheOak }).have
      || ["Zealer", "Smiter", "Auradin", "Meteorb", "Blizzballer", "Cold"].includes(SetUp.finalBuild)) {
      Config.Recipes.push([Recipe.Rune, "Vex Rune"]);
    }
  }

  Config.Runewords.push([Runeword.CallToArms, "crystalsword"]);
  Config.KeepRunewords.push("[type] == sword # [plusskillbattleorders] >= 1");
})();
