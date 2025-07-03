(function () {
  const _wands = ("[type] == wand && ([name] != wand && [name] != yewwand && [name] != burntwand)");
  const _skills = ("[necromancerskills]+[poisonandboneskilltab]+[skillbonespear]+[skillbonespirit]+[skillteeth]+[skillbonewall]+[skillboneprison]+[skillamplifydamage]");
  const white = [
    "[name] == DolRune # # [maxquantity] == 1",
    "[name] == IoRune # # [maxquantity] == 1",
    (_wands + " && [quality] >= normal && [quality] <= superior # [sockets] == 2"),
    (_wands + " && [quality] == normal # (" + _skills + ") >= 1 && [sockets] == 0 # [maxquantity] == 1"),
  ];
  NTIP.buildList(white);

  // if (me.equipped.get(sdk.body.RightArm).tier < NTIP.MAX_TIER) {
  //   NTIP.addLine((_wands + " && [quality] >= normal && [quality] <= superior # [sockets] == 2 # [maxquantity] == 1"));
  // }

  // Cube to Io rune
  if (!me.getItem(sdk.items.runes.Io)) {
    Config.Recipes.push([Recipe.Rune, "Hel Rune"]);
  }
  
  Config.Runewords.push([Runeword.White, "bonewand"]);
  Config.Runewords.push([Runeword.White, "grimwand"]);
  Config.Runewords.push([Runeword.White, "petrifiedwand"]);
  Config.Runewords.push([Runeword.White, "tombwand"]);
  Config.Runewords.push([Runeword.White, "gravewand"]);
  Config.Runewords.push([Runeword.White, "polishedwand"]);
  Config.Runewords.push([Runeword.White, "ghostwand"]);
  Config.Runewords.push([Runeword.White, "lichwand"]);
  Config.Runewords.push([Runeword.White, "unearthedwand"]);

  Config.Recipes.push([Recipe.Socket.Weapon, "bonewand"]);
  Config.Recipes.push([Recipe.Socket.Weapon, "petrifiedwand"]);
  Config.Recipes.push([Recipe.Socket.Weapon, "tombwand"]);
  Config.Recipes.push([Recipe.Socket.Weapon, "Grave wand"]);
  Config.Recipes.push([Recipe.Socket.Weapon, "polishedwand"]);
  Config.Recipes.push([Recipe.Socket.Weapon, "ghostwand"]);
  Config.Recipes.push([Recipe.Socket.Weapon, "lichwand"]);
  Config.Recipes.push([Recipe.Socket.Weapon, "unearthedwand"]);

  Config.KeepRunewords.push("[type] == wand # [fcr] >= 20");
})();
