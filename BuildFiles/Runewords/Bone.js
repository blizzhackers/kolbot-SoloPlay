(function () {
  const Bone = [
    "[name] == UmRune # # [maxquantity] == 2",
    "[name] == SolRune # # [maxquantity] == 1",
  ];
  NTIP.buildList(Bone);

  // Cube to Um Rune
  if (me.getOwned({ classid: sdk.items.runes.Um }).length < 2) {
    Config.Recipes.push([Recipe.Rune, "Ko Rune"]);
    Config.Recipes.push([Recipe.Rune, "Fal Rune"]);
    Config.Recipes.push([Recipe.Rune, "Lem Rune"]);
    Config.Recipes.push([Recipe.Rune, "Pul Rune"]);
  }

  // Have Um rune before looking for base
  if (me.getItem(sdk.items.runes.Um)) {
    NTIP.addLine(
      "([name] == demonhidearmor || [name] == duskshroud || [name] == ghostarmor || [name] == lightplate || [name] == mageplate || [name] == serpentskinarmor || [name] == trellisedarmor || [name] == wyrmhide) && [flag] != ethereal && [quality] >= normal && [quality] <= superior # [sockets] == 2 # [maxquantity] == 1"
    );
  }

  Config.Runewords.push([Runeword.Bone, "demonhidearmor"]);
  Config.Runewords.push([Runeword.Bone, "duskshroud"]);
  Config.Runewords.push([Runeword.Bone, "ghostarmor"]);
  Config.Runewords.push([Runeword.Bone, "lightplate"]);
  Config.Runewords.push([Runeword.Bone, "mageplate"]);
  Config.Runewords.push([Runeword.Bone, "serpentskinarmor"]);
  Config.Runewords.push([Runeword.Bone, "trellisedarmor"]);
  Config.Runewords.push([Runeword.Bone, "wyrmhide"]);

  Config.KeepRunewords.push("[type] == armor # [fireresist] == 30 && [normaldamagereduction] == 7");
})();
