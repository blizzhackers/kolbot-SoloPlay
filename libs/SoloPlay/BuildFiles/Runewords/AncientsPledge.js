(function () {
  if (!me.checkItem({ name: sdk.locale.items.AncientsPledge }).have && !me.hell) {
  // Cube to Ort rune
    if (me.normal && !me.getItem(sdk.items.runes.Ort)) {
      Config.Recipes.push([Recipe.Rune, "Ral Rune"]);
    }

    const apRunes = [
      "[name] == RalRune # # [maxquantity] == 1",
      "[name] == OrtRune # # [maxquantity] == 1",
      "[name] == TalRune # # [maxquantity] == 1",
    ];
    NTIP.buildList(apRunes);
  }

  const apShields = [
    "me.normal && [name] == largeshield && [flag] != ethereal && [quality] >= normal && [quality] <= superior # [sockets] == 3 # [maxquantity] == 1",
    "!me.hell && [name] == kiteshield && [flag] != ethereal && [quality] >= normal && [quality] <= superior # [sockets] == 3 # [maxquantity] == 1",
    "([name] == dragonshield || [name] == scutum) && [flag] != ethereal && [quality] >= normal && [quality] <= superior # [sockets] == 3 # [maxquantity] == 1",
  ];
  NTIP.buildList(apShields);

  if (me.paladin) {
    NTIP.addLine("([name] == targe || [name] == rondache || [name] == heraldicshield || [name] == aerinshield || [name] == akarantarge || [name] == akaranrondache || [name] == gildedshield ||[name] == protectorshield || [name] == sacredtarge) && [flag] != ethereal && [quality] >= normal && [quality] <= superior # [fireresist] > 0 && [sockets] == 3");
    Config.Runewords.push([Runeword.AncientsPledge, "targe"]);
    Config.Runewords.push([Runeword.AncientsPledge, "rondache"]);
    Config.Runewords.push([Runeword.AncientsPledge, "heraldicshield"]);
    Config.Runewords.push([Runeword.AncientsPledge, "aerinshield"]);
    Config.Runewords.push([Runeword.AncientsPledge, "akarantarge"]);
    Config.Runewords.push([Runeword.AncientsPledge, "akaranrondache"]);
    Config.Runewords.push([Runeword.AncientsPledge, "protectorshield"]);
    Config.Runewords.push([Runeword.AncientsPledge, "gildedshield"]);
    Config.Runewords.push([Runeword.AncientsPledge, "sacredtarge"]);

    Config.KeepRunewords.push("[type] == auricshields # [fireresist]+[lightresist]+[coldresist]+[poisonresist] >= 187");
  }

  Config.Runewords.push([Runeword.AncientsPledge, "dragonshield"]);
  Config.Runewords.push([Runeword.AncientsPledge, "scutum"]);
  Config.Runewords.push([Runeword.AncientsPledge, "kiteshield"]);
  Config.Runewords.push([Runeword.AncientsPledge, "largeshield"]);

  Config.KeepRunewords.push("[type] == shield # [fireresist]+[lightresist]+[coldresist]+[poisonresist] >= 187");
})();
