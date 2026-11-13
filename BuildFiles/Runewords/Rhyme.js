(function () {
  const rhyme = [
    "[name] == ShaelRune # # [maxquantity] == 1",
    "[name] == EthRune # # [maxquantity] == 1",
    "[type] == voodooheads && [quality] >= normal && [quality] <= superior # [sockets] == 2 # [maxquantity] == 1",
    "[type] == voodooheads && [quality] == normal # ([necromancerskills]+[poisonandboneskilltab]+[skillbonespear]+[skillbonespirit]+[skillteeth]+[skillbonewall]+[skillboneprison]+[skillamplifydamage]) >= 1 && [sockets] == 0 # [maxquantity] == 1",
  ];
  NTIP.buildList(rhyme);

  Config.Runewords.push([Runeword.Rhyme, "preservedhead"]);
  Config.Runewords.push([Runeword.Rhyme, "zombiehead"]);
  Config.Runewords.push([Runeword.Rhyme, "unravellerhead"]);
  Config.Runewords.push([Runeword.Rhyme, "gargoylehead"]);
  Config.Runewords.push([Runeword.Rhyme, "demonhead"]);
  Config.Runewords.push([Runeword.Rhyme, "mummifiedtrophy"]);
  Config.Runewords.push([Runeword.Rhyme, "fetishtrophy"]);
  Config.Runewords.push([Runeword.Rhyme, "sextontrophy"]);
  Config.Runewords.push([Runeword.Rhyme, "cantortrophy"]);
  Config.Runewords.push([Runeword.Rhyme, "hierophanttrophy"]);
  Config.Runewords.push([Runeword.Rhyme, "minionskull"]);
  Config.Runewords.push([Runeword.Rhyme, "hellspawnskull"]);
  Config.Runewords.push([Runeword.Rhyme, "overseerskull"]);
  Config.Runewords.push([Runeword.Rhyme, "succubusskull"]);
  Config.Runewords.push([Runeword.Rhyme, "bloodlordskull"]);

  Config.Recipes.push([Recipe.Socket.Shield, "preservedhead"]);
  Config.Recipes.push([Recipe.Socket.Shield, "zombiehead"]);
  Config.Recipes.push([Recipe.Socket.Shield, "unravellerhead"]);
  Config.Recipes.push([Recipe.Socket.Shield, "gargoylehead"]);
  Config.Recipes.push([Recipe.Socket.Shield, "demonhead"]);
  Config.Recipes.push([Recipe.Socket.Shield, "mummifiedtrophy"]);
  Config.Recipes.push([Recipe.Socket.Shield, "fetishtrophy"]);
  Config.Recipes.push([Recipe.Socket.Shield, "cantortrophy"]);
  Config.Recipes.push([Recipe.Socket.Shield, "hierophanttrophy"]);
  Config.Recipes.push([Recipe.Socket.Shield, "minionskull"]);
  Config.Recipes.push([Recipe.Socket.Shield, "hellspawnskull"]);
  Config.Recipes.push([Recipe.Socket.Shield, "overseerskull"]);
  Config.Recipes.push([Recipe.Socket.Shield, "succubusskull"]);
  Config.Recipes.push([Recipe.Socket.Shield, "bloodlordskull"]);

  Config.KeepRunewords.push("[type] == voodooheads # [fireresist] >= 25 && [itemmagicbonus] >= 25");
})();
