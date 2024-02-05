(function () {
  const Myth = [
    "[name] == HelRune # # [maxquantity] == 1",
    "[name] == AmnRune # # [maxquantity] == 1",
    "[name] == NefRune # # [maxquantity] == 1",
  ];
  NTIP.buildList(Myth);

  // Cube to Hel rune
  if (!me.getItem(sdk.items.runes.Hel)) {
    Config.Recipes.push([Recipe.Rune, "Dol Rune"]);
  }

  // Have Hel rune before looking for base
  if (me.getItem(sdk.items.runes.Hel)) {
    NTIP.addLine("([name] == demonhidearmor || [name] == duskshroud || [name] == ghostarmor || [name] == lightplate || [name] == mageplate || [name] == serpentskinarmor || [name] == trellisedarmor || [name] == wyrmhide) && [flag] != ethereal && [quality] >= normal && [quality] <= superior # [sockets] == 3 # [maxquantity] == 1");
  }

  // Have Hel rune and currently equipped armor is low tier
  if (me.getItem(sdk.items.runes.Hel) && me.equipped.get(sdk.body.Armor).tier < 200) {
    NTIP.addLine("[name] == breastplate && [flag] != ethereal && [quality] >= normal && [quality] <= superior # [sockets] == 3 # [maxquantity] == 1");
  }

  Config.Runewords.push([Runeword.Myth, "breastplate"]);
  Config.Runewords.push([Runeword.Myth, "demonhidearmor"]);
  Config.Runewords.push([Runeword.Myth, "duskshroud"]);
  Config.Runewords.push([Runeword.Myth, "ghostarmor"]);
  Config.Runewords.push([Runeword.Myth, "lightplate"]);
  Config.Runewords.push([Runeword.Myth, "mageplate"]);
  Config.Runewords.push([Runeword.Myth, "serpentskinarmor"]);
  Config.Runewords.push([Runeword.Myth, "trellisedarmor"]);
  Config.Runewords.push([Runeword.Myth, "wyrmhide"]);

  Config.KeepRunewords.push("[type] == armor # [barbarianskills] == 2");
})();
