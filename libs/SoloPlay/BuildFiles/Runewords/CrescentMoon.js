(function () {
  const Crescent = [
    "[name] == ShaelRune # # [maxquantity] == 2",
    "[name] == UmRune",
    "[name] == TirRune # # [maxquantity] == 1",
  ];
  NTIP.buildList(Crescent);

  if (me.barbarian) {
  // Cube to Um Rune
    if (!me.getItem(sdk.items.runes.Um)) {
      Config.Recipes.push([Recipe.Rune, "Pul Rune"]);
    }

    // Have Shael and Um runes before looking for base
    if (me.getItem(sdk.items.runes.Shael) && me.getItem(sdk.items.runes.Um)) {
      NTIP.addLine("[type] == sword && [flag] != ethereal && [quality] >= normal && [quality] <= superior && [wsm] <= 10 && [strreq] <= 150 # [sockets] == 3");
      NTIP.addLine("([name] == legendsword || [name] == highlandblade || [name] == balrogblade || [name] == championsword || [name] == colossussword) && [flag] != ethereal && [quality] >= normal && [quality] <= superior # [sockets] == 3");
    } else {
      NTIP.addLine("([name] == legendsword || [name] == highlandblade || [name] == balrogblade || [name] == championsword || [name] == colossussword) && [flag] != ethereal && [quality] == superior # [enhanceddamage] >= 5 && [sockets] == 3");
    }

    Config.Runewords.push([Runeword.CrescentMoon, "dimensionalblade"]);
    Config.Runewords.push([Runeword.CrescentMoon, "battlesword"]);
    Config.Runewords.push([Runeword.CrescentMoon, "runesword"]);
    Config.Runewords.push([Runeword.CrescentMoon, "conquestsword"]);
    Config.Runewords.push([Runeword.CrescentMoon, "crypticsword"]);
    Config.Runewords.push([Runeword.CrescentMoon, "phaseblade"]);
    Config.Runewords.push([Runeword.CrescentMoon, "espandon"]);
    Config.Runewords.push([Runeword.CrescentMoon, "tusksword"]);
    Config.Runewords.push([Runeword.CrescentMoon, "zweihander"]);
    Config.Runewords.push([Runeword.CrescentMoon, "legendsword"]);
    Config.Runewords.push([Runeword.CrescentMoon, "highlandblade"]);
    Config.Runewords.push([Runeword.CrescentMoon, "balrogblade"]);
    Config.Runewords.push([Runeword.CrescentMoon, "championsword"]);
    Config.Runewords.push([Runeword.CrescentMoon, "colossussword"]);
  }

  if (me.paladin) {
    NTIP.addLine("[name] == phaseblade && [quality] == normal # ([sockets] == 0 || [sockets] == 3) # [maxquantity] == 1");

    // Cube to Um rune
    if (!me.getItem(sdk.items.runes.Um)) {
      Config.Recipes.push([Recipe.Rune, "Ko Rune"]);
      Config.Recipes.push([Recipe.Rune, "Fal Rune"]);
      Config.Recipes.push([Recipe.Rune, "Lem Rune"]);
      Config.Recipes.push([Recipe.Rune, "Pul Rune"]);
    }

    Config.Recipes.push([Recipe.Socket.Weapon, "phaseblade", Roll.NonEth]);
    Config.Runewords.push([Runeword.CrescentMoon, "phaseblade"]);
  }

  Config.KeepRunewords.push("[type] == sword # [ias] >= 20 && [passiveltngpierce] >= 35");
})();
