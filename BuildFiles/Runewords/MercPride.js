(function () {
  const Pride = [
    "[name] == ChamRune",
    "[name] == SurRune",
    "[name] == IoRune ## [maxquantity] == 1",
    "[name] == LoRune",
    "([name] == thresher || [name] == crypticaxe || [name] == greatpoleaxe || [name] == giantthresher) && [flag] == ethereal && [quality] == normal # [Sockets] == 0 # [maxquantity] == 1",
    "([name] == thresher || [name] == crypticaxe || [name] == greatpoleaxe || [name] == giantthresher) && [quality] >= normal && [quality] <= Superior # [Sockets] == 4 # [maxquantity] == 1",
  ];
  NTIP.buildList(Pride);

  // Cube to Sur/Lo rune
  if (!me.getItem(sdk.items.runes.Sur) || !me.getItem(sdk.items.runes.Lo)) {
    if (me.checkItem({ name: sdk.locale.items.CalltoArms }).have || me.barbarian) {
      Config.Recipes.push([Recipe.Rune, "Mal Rune"]);
      Config.Recipes.push([Recipe.Rune, "Ist Rune"]);
      Config.Recipes.push([Recipe.Rune, "Gul Rune"]);
      Config.Recipes.push([Recipe.Rune, "Vex Rune"]);
      Config.Recipes.push([Recipe.Rune, "Ohm Rune"]);
    }
    
    !me.getItem(sdk.items.runes.Sur) && Config.Recipes.push([Recipe.Rune, "Lo Rune"]);
  }

  Config.Recipes.push([Recipe.Socket.Weapon, "giantthresher"]);
  Config.Recipes.push([Recipe.Socket.Weapon, "greatpoleaxe"]);
  Config.Recipes.push([Recipe.Socket.Weapon, "crypticaxe"]);
  Config.Recipes.push([Recipe.Socket.Weapon, "thresher"]);

  Config.Runewords.push([Runeword.Pride, "giantthresher"]);
  Config.Runewords.push([Runeword.Pride, "greatpoleaxe"]);
  Config.Runewords.push([Runeword.Pride, "crypticaxe"]);
  Config.Runewords.push([Runeword.Pride, "thresher"]);

  Config.KeepRunewords.push("[type] == polearm # [concentrationaura] >= 16");
})();
