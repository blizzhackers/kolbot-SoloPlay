(function () {
  const treach = [
    "[name] == ShaelRune # # [maxquantity] == 1",
    "[name] == ThulRune # # [maxquantity] == 1",
    "[name] == LemRune # # [maxquantity] == 1",
  ];
  NTIP.buildList(treach);

  // Cube to Lem rune
  const needLem = function () {
    return !me.getItem(sdk.items.runes.Lem);
  };
  if (!me.getItem(sdk.items.runes.Lem)) {
    Config.Recipes.push([Recipe.Rune, "Lum Rune", { condition: needLem }]);
    Config.Recipes.push([Recipe.Rune, "Ko Rune", { condition: needLem }]);
    Config.Recipes.push([Recipe.Rune, "Fal Rune", { condition: needLem }]);
    Config.Recipes.push([Recipe.Rune, "Lem Rune", { condition: needLem }]);
  }

  // Have Shael and Lem before looking for base
  if (me.getItem(sdk.items.runes.Lem)) {
    NTIP.addLine("([name] == demonhidearmor || [name] == duskshroud || [name] == ghostarmor || [name] == lightplate || [name] == mageplate || [name] == serpentskinarmor || [name] == trellisedarmor || [name] == wyrmhide) && [flag] != ethereal && [quality] >= normal && [quality] <= superior # [sockets] == 3 # [maxquantity] == 1");
  }

  Config.Runewords.push([Runeword.Treachery, "demonhidearmor", Roll.NonEth, 98]);
  Config.Runewords.push([Runeword.Treachery, "duskshroud", Roll.NonEth, 98]);
  Config.Runewords.push([Runeword.Treachery, "ghostarmor", Roll.NonEth, 98]);
  Config.Runewords.push([Runeword.Treachery, "lightplate", Roll.NonEth, 98]);
  Config.Runewords.push([Runeword.Treachery, "mageplate", Roll.NonEth, 98]);
  Config.Runewords.push([Runeword.Treachery, "serpentskinarmor", Roll.NonEth, 98]);
  Config.Runewords.push([Runeword.Treachery, "trellisedarmor", Roll.NonEth, 98]);
  Config.Runewords.push([Runeword.Treachery, "wyrmhide", Roll.NonEth, 98]);

  Config.KeepRunewords.push("[type] == armor # [ias] == 45 && [coldresist] == 30");
})();
