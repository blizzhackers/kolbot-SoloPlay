(function () {
  const VoiceofReason = [
    "[name] == LemRune",
    "[name] == KoRune",
    "[name] == ElRune # # [maxquantity] == 1",
    "[name] == EldRune # # [maxquantity] == 1",
  ];
  NTIP.buildList(VoiceofReason);

  if (me.barbarian) {
  // Have Lem and Ko runes before looking for normal base
    if (me.getItem(sdk.items.runes.Lem) && me.getItem(sdk.items.runes.Ko)) {
      NTIP.addLine("[type] == sword && [flag] != ethereal && [quality] >= normal && [quality] <= superior && [wsm] <= 10 && [strreq] <= 150 # [sockets] == 4");
      NTIP.addLine("([name] == legendsword || [name] == highlandblade || [name] == balrogblade || [name] == championsword || [name] == colossussword) && [flag] != ethereal && [quality] >= normal && [quality] <= superior # [sockets] == 4");
    } else {
      NTIP.addLine("([name] == legendsword || [name] == highlandblade || [name] == balrogblade || [name] == championsword || [name] == colossussword) && [flag] != ethereal && [quality] == superior # [enhanceddamage] >= 5 && [sockets] == 4");
    }

    Config.Runewords.push([Runeword.VoiceofReason, "dimensionalblade"]);
    Config.Runewords.push([Runeword.VoiceofReason, "battlesword"]);
    Config.Runewords.push([Runeword.VoiceofReason, "runesword"]);
    Config.Runewords.push([Runeword.VoiceofReason, "conquestsword"]);
    Config.Runewords.push([Runeword.VoiceofReason, "crypticsword"]);
    Config.Runewords.push([Runeword.VoiceofReason, "phaseblade"]);
    Config.Runewords.push([Runeword.VoiceofReason, "tusksword"]);
    Config.Runewords.push([Runeword.VoiceofReason, "zweihander"]);
    Config.Runewords.push([Runeword.VoiceofReason, "legendsword"]);
    Config.Runewords.push([Runeword.VoiceofReason, "highlandblade"]);
    Config.Runewords.push([Runeword.VoiceofReason, "balrogblade"]);
    Config.Runewords.push([Runeword.VoiceofReason, "championsword"]);
    Config.Runewords.push([Runeword.VoiceofReason, "colossussword"]);
  }

  if (me.paladin) {
    NTIP.addLine("[name] == phaseblade && [quality] == normal # ([sockets] == 0 || [sockets] == 4) # [maxquantity] == 1");

    // Cube to Lem rune
    if (!me.getItem(sdk.items.runes.Lem)) {
      Config.Recipes.push([Recipe.Rune, "Fal Rune"]);
    }

    Config.Recipes.push([Recipe.Socket.Weapon, "phaseblade", Roll.NonEth]);
    Config.Runewords.push([Runeword.VoiceofReason, "phaseblade"]);
  }

  Config.KeepRunewords.push("[type] == sword # [passivecoldpierce] >= 24");
})();
