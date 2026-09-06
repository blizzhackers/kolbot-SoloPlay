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
    sockets: 5,
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
  const needMal = function () {
    return !me.getItem(sdk.items.runes.Mal);
  };
  if (!me.getItem(sdk.items.runes.Mal)) {
    Config.Recipes.push([Recipe.Rune, "Mal Rune", { condition: needMal }]);
  }

  // Cube to Ohm Rune
  const needOhm = function () {
    return !me.getItem(sdk.items.runes.Ohm);
  };
  if (!me.getItem(sdk.items.runes.Ohm)) {
    Config.Recipes.push([Recipe.Rune, "Pul Rune", { condition: needOhm }]);
    Config.Recipes.push([Recipe.Rune, "Um Rune", { condition: needOhm }]);
    Config.Recipes.push([Recipe.Rune, "Mal Rune", { condition: needOhm }]);
    Config.Recipes.push([Recipe.Rune, "Ist Rune", { condition: needOhm }]);
    Config.Recipes.push([Recipe.Rune, "Gul Rune", { condition: needOhm }]);
    Config.Recipes.push([Recipe.Rune, "Vex Rune", { condition: needOhm }]);

    if (me.checkItem({ name: sdk.locale.items.HeartoftheOak }).have
      || ["Zealer", "Smiter", "Auradin", "Meteorb", "Blizzballer", "Cold"].includes(SetUp.finalBuild)) {
      Config.Recipes.push([Recipe.Rune, "Ohm Rune", { condition: needOhm }]);
    }
  }

  Config.Runewords.push([Runeword.CallToArms, "crystalsword"]);
  Config.KeepRunewords.push("[type] == sword # [plusskillbattleorders] >= 1");
})();
