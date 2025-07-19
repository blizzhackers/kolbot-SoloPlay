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

  Config.Runewords.push([Runeword.Treachery, "demonhidearmor"]);
  Config.Runewords.push([Runeword.Treachery, "duskshroud"]);
  Config.Runewords.push([Runeword.Treachery, "ghostarmor"]);
  Config.Runewords.push([Runeword.Treachery, "lightplate"]);
  Config.Runewords.push([Runeword.Treachery, "mageplate"]);
  Config.Runewords.push([Runeword.Treachery, "serpentskinarmor"]);
  Config.Runewords.push([Runeword.Treachery, "trellisedarmor"]);
  Config.Runewords.push([Runeword.Treachery, "wyrmhide"]);

  Config.KeepRunewords.push("[type] == armor # [ias] == 45 && [coldresist] == 30");
})();
