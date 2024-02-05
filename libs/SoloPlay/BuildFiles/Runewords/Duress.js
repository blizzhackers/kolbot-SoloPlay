(function () {
  const Duress = [
    "[name] == ShaelRune # # [maxquantity] == 1",
    "[name] == UmRune # # [maxquantity] == 1",
    "[name] == ThulRune # # [maxquantity] == 1",
  ];
  NTIP.buildList(Duress);

  // Cube to Um rune
  if (!me.getItem(sdk.items.runes.Um)) {
    Config.Recipes.push([Recipe.Rune, "Io Rune"]);
    Config.Recipes.push([Recipe.Rune, "Lum Rune"]);
    Config.Recipes.push([Recipe.Rune, "Ko Rune"]);
    Config.Recipes.push([Recipe.Rune, "Fal Rune"]);
    Config.Recipes.push([Recipe.Rune, "Lem Rune"]);
    Config.Recipes.push([Recipe.Rune, "Pul Rune"]);
  }

  // Have Um and Shael runes before looking for base
  if (me.getItem(sdk.items.runes.Um) && me.getItem(sdk.items.runes.Shael)) {
    NTIP.addLine("([name] == archonplate || [name] == demonhidearmor || [name] == duskshroud || [name] == ghostarmor || [name] == boneweave || [name] == serpentskinarmor || [name] == trellisedarmor || [name] == wyrmhide) && [flag] != ethereal && [quality] >= normal && [quality] <= superior # [sockets] == 3 # [maxquantity] == 1");
  }

  Config.Runewords.push([Runeword.Duress, "archonplate"]);
  Config.Runewords.push([Runeword.Duress, "demonhidearmor"]);
  Config.Runewords.push([Runeword.Duress, "duskshroud"]);
  Config.Runewords.push([Runeword.Duress, "ghostarmor"]);
  Config.Runewords.push([Runeword.Duress, "boneweave"]);
  Config.Runewords.push([Runeword.Duress, "serpentskinarmor"]);
  Config.Runewords.push([Runeword.Duress, "trellisedarmor"]);
  Config.Runewords.push([Runeword.Duress, "wyrmhide"]);

  Config.KeepRunewords.push("[type] == armor # [coldresist] == 45");
})();
