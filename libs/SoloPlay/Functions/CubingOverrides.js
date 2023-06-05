/**
*  @filename    CubingOverrides.js
*  @author      theBGuy
*  @desc        Cubing improvments
*
*/

includeIfNotIncluded("core/Cubing.js");

Recipe.Reroll.Charm = 56;
Recipe.Socket.LowMagic = 57;
Recipe.Socket.HighMagic = 58;
Recipe.Socket.Rare = 59;

Cubing.buildRecipes = function () {
  this.recipes = [];

  for (let i = 0; i < Config.Recipes.length; i += 1) {
    if (typeof Config.Recipes[i] !== "object"
      || (Config.Recipes[i].length > 2
      && ((Config.Recipes[i][0] !== Recipe.Reroll.Charm && typeof Config.Recipes[i][2] !== "number") || (Config.Recipes[i][0] === Recipe.Reroll.Charm && typeof Config.Recipes[i][2] !== "object")))
      || Config.Recipes[i].length < 1) {
      throw new Error("Cubing.buildRecipes: Invalid recipe format.");
    }

    switch (Config.Recipes[i][0]) {
    case Recipe.Gem:
      this.recipes.push({ Ingredients: [Config.Recipes[i][1], Config.Recipes[i][1], Config.Recipes[i][1]], Index: Recipe.Gem, AlwaysEnabled: true });

      break;
    // Crafting Recipes----------------------------------------------------------------------------------------------------------------------------------//
    case Recipe.HitPower.Helm:
      this.recipes.push({ Ingredients: [Config.Recipes[i][1], sdk.items.runes.Ith, sdk.items.Jewel, sdk.items.gems.Perfect.Sapphire], Level: 84, Index: Recipe.HitPower.Helm });

      break;
    case Recipe.HitPower.Boots:
      this.recipes.push({ Ingredients: [Config.Recipes[i][1], sdk.items.runes.Ral, sdk.items.Jewel, sdk.items.gems.Perfect.Sapphire], Level: 71, Index: Recipe.HitPower.Boots });

      break;
    case Recipe.HitPower.Gloves:
      this.recipes.push({ Ingredients: [Config.Recipes[i][1], sdk.items.runes.Ort, sdk.items.Jewel, sdk.items.gems.Perfect.Sapphire], Level: 79, Index: Recipe.HitPower.Gloves });

      break;
    case Recipe.HitPower.Belt:
      this.recipes.push({ Ingredients: [Config.Recipes[i][1], sdk.items.runes.Tal, sdk.items.Jewel, sdk.items.gems.Perfect.Sapphire], Level: 71, Index: Recipe.HitPower.Belt });

      break;
    case Recipe.HitPower.Shield:
      this.recipes.push({ Ingredients: [Config.Recipes[i][1], sdk.items.runes.Eth, sdk.items.Jewel, sdk.items.gems.Perfect.Sapphire], Level: 82, Index: Recipe.HitPower.Shield });

      break;
    case Recipe.HitPower.Body:
      this.recipes.push({ Ingredients: [Config.Recipes[i][1], sdk.items.runes.Nef, sdk.items.Jewel, sdk.items.gems.Perfect.Sapphire], Level: 85, Index: Recipe.HitPower.Body });

      break;
    case Recipe.HitPower.Amulet:
      this.recipes.push({ Ingredients: [sdk.items.Amulet, sdk.items.runes.Thul, sdk.items.Jewel, sdk.items.gems.Perfect.Sapphire], Level: 90, Index: Recipe.HitPower.Amulet });

      break;
    case Recipe.HitPower.Ring:
      this.recipes.push({ Ingredients: [sdk.items.Ring, sdk.items.runes.Amn, sdk.items.Jewel, sdk.items.gems.Perfect.Sapphire], Level: 77, Index: Recipe.HitPower.Ring });

      break;
    case Recipe.HitPower.Weapon:
      this.recipes.push({ Ingredients: [Config.Recipes[i][1], sdk.items.runes.Tir, sdk.items.Jewel, sdk.items.gems.Perfect.Sapphire], Level: 85, Index: Recipe.HitPower.Weapon });

      break;
    case Recipe.Blood.Helm:
      this.recipes.push({ Ingredients: [Config.Recipes[i][1], sdk.items.runes.Ral, sdk.items.Jewel, sdk.items.gems.Perfect.Ruby], Level: 84, Index: Recipe.Blood.Helm });

      break;
    case Recipe.Blood.Boots:
      this.recipes.push({ Ingredients: [Config.Recipes[i][1], sdk.items.runes.Eth, sdk.items.Jewel, sdk.items.gems.Perfect.Ruby], Level: 71, Index: Recipe.Blood.Boots });

      break;
    case Recipe.Blood.Gloves:
      this.recipes.push({ Ingredients: [Config.Recipes[i][1], sdk.items.runes.Nef, sdk.items.Jewel, sdk.items.gems.Perfect.Ruby], Level: 79, Index: Recipe.Blood.Gloves });

      break;
    case Recipe.Blood.Belt:
      this.recipes.push({ Ingredients: [Config.Recipes[i][1], sdk.items.runes.Tal, sdk.items.Jewel, sdk.items.gems.Perfect.Ruby], Level: 71, Index: Recipe.Blood.Belt });

      break;
    case Recipe.Blood.Shield:
      this.recipes.push({ Ingredients: [Config.Recipes[i][1], sdk.items.runes.Ith, sdk.items.Jewel, sdk.items.gems.Perfect.Ruby], Level: 82, Index: Recipe.Blood.Shield });

      break;
    case Recipe.Blood.Body:
      this.recipes.push({ Ingredients: [Config.Recipes[i][1], sdk.items.runes.Thul, sdk.items.Jewel, sdk.items.gems.Perfect.Ruby], Level: 85, Index: Recipe.Blood.Body });

      break;
    case Recipe.Blood.Amulet:
      this.recipes.push({ Ingredients: [sdk.items.Amulet, sdk.items.runes.Amn, sdk.items.Jewel, sdk.items.gems.Perfect.Ruby], Level: 90, Index: Recipe.Blood.Amulet });

      break;
    case Recipe.Blood.Ring:
      this.recipes.push({ Ingredients: [sdk.items.Ring, sdk.items.runes.Sol, sdk.items.Jewel, sdk.items.gems.Perfect.Ruby], Level: 77, Index: Recipe.Blood.Ring });

      break;
    case Recipe.Blood.Weapon:
      this.recipes.push({ Ingredients: [Config.Recipes[i][1], sdk.items.runes.Ort, sdk.items.Jewel, sdk.items.gems.Perfect.Ruby], Level: 85, Index: Recipe.Blood.Weapon });

      break;
    case Recipe.Caster.Helm:
      this.recipes.push({ Ingredients: [Config.Recipes[i][1], sdk.items.runes.Nef, sdk.items.Jewel, sdk.items.gems.Perfect.Amethyst], Level: 84, Index: Recipe.Caster.Helm });

      break;
    case Recipe.Caster.Boots:
      this.recipes.push({ Ingredients: [Config.Recipes[i][1], sdk.items.runes.Thul, sdk.items.Jewel, sdk.items.gems.Perfect.Amethyst], Level: 71, Index: Recipe.Caster.Boots });

      break;
    case Recipe.Caster.Gloves:
      this.recipes.push({ Ingredients: [Config.Recipes[i][1], sdk.items.runes.Ort, sdk.items.Jewel, sdk.items.gems.Perfect.Amethyst], Level: 79, Index: Recipe.Caster.Gloves });

      break;
    case Recipe.Caster.Belt:
      this.recipes.push({ Ingredients: [Config.Recipes[i][1], sdk.items.runes.Ith, sdk.items.Jewel, sdk.items.gems.Perfect.Amethyst], Level: 71, Index: Recipe.Caster.Belt });

      break;
    case Recipe.Caster.Shield:
      this.recipes.push({ Ingredients: [Config.Recipes[i][1], sdk.items.runes.Eth, sdk.items.Jewel, sdk.items.gems.Perfect.Amethyst], Level: 82, Index: Recipe.Caster.Shield });

      break;
    case Recipe.Caster.Body:
      this.recipes.push({ Ingredients: [Config.Recipes[i][1], sdk.items.runes.Tal, sdk.items.Jewel, sdk.items.gems.Perfect.Amethyst], Level: 85, Index: Recipe.Caster.Body });

      break;
    case Recipe.Caster.Amulet:
      this.recipes.push({ Ingredients: [sdk.items.Amulet, sdk.items.runes.Ral, sdk.items.Jewel, sdk.items.gems.Perfect.Amethyst], Level: 90, Index: Recipe.Caster.Amulet });

      break;
    case Recipe.Caster.Ring:
      this.recipes.push({ Ingredients: [sdk.items.Ring, sdk.items.runes.Amn, sdk.items.Jewel, sdk.items.gems.Perfect.Amethyst], Level: 77, Index: Recipe.Caster.Ring });

      break;
    case Recipe.Caster.Weapon:
      this.recipes.push({ Ingredients: [Config.Recipes[i][1], sdk.items.runes.Tir, sdk.items.Jewel, sdk.items.gems.Perfect.Amethyst], Level: 85, Index: Recipe.Caster.Weapon });

      break;
    case Recipe.Safety.Helm:
      this.recipes.push({ Ingredients: [Config.Recipes[i][1], sdk.items.runes.Ith, sdk.items.Jewel, sdk.items.gems.Perfect.Emerald], Level: 84, Index: Recipe.Safety.Helm });

      break;
    case Recipe.Safety.Boots:
      this.recipes.push({ Ingredients: [Config.Recipes[i][1], sdk.items.runes.Ort, sdk.items.Jewel, sdk.items.gems.Perfect.Emerald], Level: 71, Index: Recipe.Safety.Boots });

      break;
    case Recipe.Safety.Gloves:
      this.recipes.push({ Ingredients: [Config.Recipes[i][1], sdk.items.runes.Ral, sdk.items.Jewel, sdk.items.gems.Perfect.Emerald], Level: 79, Index: Recipe.Safety.Gloves });

      break;
    case Recipe.Safety.Belt:
      this.recipes.push({ Ingredients: [Config.Recipes[i][1], sdk.items.runes.Tal, sdk.items.Jewel, sdk.items.gems.Perfect.Emerald], Level: 71, Index: Recipe.Safety.Belt });

      break;
    case Recipe.Safety.Shield:
      this.recipes.push({ Ingredients: [Config.Recipes[i][1], sdk.items.runes.Nef, sdk.items.Jewel, sdk.items.gems.Perfect.Emerald], Level: 82, Index: Recipe.Safety.Shield });

      break;
    case Recipe.Safety.Body:
      this.recipes.push({ Ingredients: [Config.Recipes[i][1], sdk.items.runes.Eth, sdk.items.Jewel, sdk.items.gems.Perfect.Emerald], Level: 85, Index: Recipe.Safety.Body });

      break;
    case Recipe.Safety.Amulet:
      this.recipes.push({ Ingredients: [sdk.items.Amulet, sdk.items.runes.Thul, sdk.items.Jewel, sdk.items.gems.Perfect.Emerald], Level: 90, Index: Recipe.Safety.Amulet });

      break;
    case Recipe.Safety.Ring:
      this.recipes.push({ Ingredients: [sdk.items.Ring, sdk.items.runes.Amn, sdk.items.Jewel, sdk.items.gems.Perfect.Emerald], Level: 77, Index: Recipe.Safety.Ring });

      break;
    case Recipe.Safety.Weapon:
      this.recipes.push({ Ingredients: [Config.Recipes[i][1], sdk.items.runes.Sol, sdk.items.Jewel, sdk.items.gems.Perfect.Emerald], Level: 85, Index: Recipe.Safety.Weapon });

      break;
    // Upgrading Recipes----------------------------------------------------------------------------------------------------------------------------------//
    case Recipe.Unique.Weapon.ToExceptional:
      this.recipes.push({ Ingredients: [Config.Recipes[i][1], sdk.items.runes.Ral, sdk.items.runes.Sol, sdk.items.gems.Perfect.Emerald], Index: Recipe.Unique.Weapon.ToExceptional, Ethereal: Config.Recipes[i][2] });

      break;
    case Recipe.Unique.Weapon.ToElite: // Ladder only
      if (me.ladder || Developer.addLadderRW) {
        this.recipes.push({ Ingredients: [Config.Recipes[i][1], sdk.items.runes.Lum, sdk.items.runes.Pul, sdk.items.gems.Perfect.Emerald], Index: Recipe.Unique.Weapon.ToElite, Ethereal: Config.Recipes[i][2] });
      }

      break;
    case Recipe.Unique.Armor.ToExceptional:
      this.recipes.push({ Ingredients: [Config.Recipes[i][1], sdk.items.runes.Tal, sdk.items.runes.Shael, sdk.items.gems.Perfect.Diamond], Index: Recipe.Unique.Armor.ToExceptional, Ethereal: Config.Recipes[i][2] });

      break;
    case Recipe.Unique.Armor.ToElite: // Ladder only
      if (me.ladder || Developer.addLadderRW) {
        this.recipes.push({ Ingredients: [Config.Recipes[i][1], sdk.items.runes.Lem, sdk.items.runes.Ko, sdk.items.gems.Perfect.Diamond], Index: Recipe.Unique.Armor.ToElite, Ethereal: Config.Recipes[i][2] });
      }

      break;
    case Recipe.Rare.Weapon.ToExceptional:
      this.recipes.push({ Ingredients: [Config.Recipes[i][1], sdk.items.runes.Ort, sdk.items.runes.Amn, sdk.items.gems.Perfect.Sapphire], Index: Recipe.Rare.Weapon.ToExceptional, Ethereal: Config.Recipes[i][2] });

      break;
    case Recipe.Rare.Weapon.ToElite:
      this.recipes.push({ Ingredients: [Config.Recipes[i][1], sdk.items.runes.Fal, sdk.items.runes.Um, sdk.items.gems.Perfect.Sapphire], Index: Recipe.Rare.Weapon.ToElite, Ethereal: Config.Recipes[i][2] });

      break;
    case Recipe.Rare.Armor.ToExceptional:
      this.recipes.push({ Ingredients: [Config.Recipes[i][1], sdk.items.runes.Ral, sdk.items.runes.Thul, sdk.items.gems.Perfect.Amethyst], Index: Recipe.Rare.Armor.ToExceptional, Ethereal: Config.Recipes[i][2] });

      break;
    case Recipe.Rare.Armor.ToElite:
      this.recipes.push({ Ingredients: [Config.Recipes[i][1], sdk.items.runes.Ko, sdk.items.runes.Pul, sdk.items.gems.Perfect.Amethyst], Index: Recipe.Rare.Armor.ToElite, Ethereal: Config.Recipes[i][2] });

      break;
    // Socketing Recipes----------------------------------------------------------------------------------------------------------------------------------//
    case Recipe.Socket.Shield:
      this.recipes.push({ Ingredients: [Config.Recipes[i][1], sdk.items.runes.Tal, sdk.items.runes.Amn, sdk.items.gems.Perfect.Ruby], Index: Recipe.Socket.Shield, Ethereal: Config.Recipes[i][2] });

      break;
    case Recipe.Socket.Weapon:
      this.recipes.push({ Ingredients: [Config.Recipes[i][1], sdk.items.runes.Ral, sdk.items.runes.Amn, sdk.items.gems.Perfect.Amethyst], Index: Recipe.Socket.Weapon, Ethereal: Config.Recipes[i][2] });

      break;
    case Recipe.Socket.Armor:
      this.recipes.push({ Ingredients: [Config.Recipes[i][1], sdk.items.runes.Tal, sdk.items.runes.Thul, sdk.items.gems.Perfect.Topaz], Index: Recipe.Socket.Armor, Ethereal: Config.Recipes[i][2] });

      break;
    case Recipe.Socket.Helm:
      this.recipes.push({ Ingredients: [Config.Recipes[i][1], sdk.items.runes.Ral, sdk.items.runes.Thul, sdk.items.gems.Perfect.Sapphire], Index: Recipe.Socket.Helm, Ethereal: Config.Recipes[i][2] });

      break;
    case Recipe.Socket.LowMagic:
      this.recipes.push({ Ingredients: [Config.Recipes[i][1], "cgem", "cgem", "cgem"], Level: 25, Index: Recipe.Socket.LowMagic });

      break;
    case Recipe.Socket.HighMagic:
      this.recipes.push({ Ingredients: [Config.Recipes[i][1], "fgem", "fgem", "fgem"], Level: 30, Index: Recipe.Socket.HighMagic });

      break;
    case Recipe.Socket.Rare:
      this.recipes.push({ Ingredients: [Config.Recipes[i][1], sdk.items.Ring, sdk.items.gems.Perfect.Skull, sdk.items.gems.Perfect.Skull, sdk.items.gems.Perfect.Skull], Index: Recipe.Socket.Rare });

      break;
    // Re-rolling Recipes----------------------------------------------------------------------------------------------------------------------------------//
    case Recipe.Reroll.Magic: // Hacky solution ftw
      this.recipes.push({ Ingredients: [Config.Recipes[i][1], "pgem", "pgem", "pgem"], Level: 91, Index: Recipe.Reroll.Magic });

      break;
    case Recipe.Reroll.Charm:
      this.recipes.push({ Ingredients: [Config.Recipes[i][1], "pgem", "pgem", "pgem"], Level: Object.assign({ "cm1": 95, "cm2": 91, "cm3": 91 }, Config.Recipes[i][2]), Index: Recipe.Reroll.Charm });

      break;
    case Recipe.Reroll.Rare:
      this.recipes.push({ Ingredients: [Config.Recipes[i][1], sdk.items.gems.Perfect.Skull, sdk.items.gems.Perfect.Skull, sdk.items.gems.Perfect.Skull, sdk.items.gems.Perfect.Skull, sdk.items.gems.Perfect.Skull, sdk.items.gems.Perfect.Skull], Index: Recipe.Reroll.Rare });

      break;
    case Recipe.Reroll.HighRare:
      this.recipes.push({ Ingredients: [Config.Recipes[i][1], sdk.items.gems.Perfect.Skull, sdk.items.Ring], Index: Recipe.Reroll.HighRare, Enabled: false });

      break;
    case Recipe.LowToNorm.Weapon:
      this.recipes.push({ Ingredients: [Config.Recipes[i][1], sdk.items.runes.Eld, "cgem"], Index: Recipe.LowToNorm.Weapon });

      break;
    case Recipe.LowToNorm.Armor:
      this.recipes.push({ Ingredients: [Config.Recipes[i][1], sdk.items.runes.El, "cgem"], Index: Recipe.LowToNorm.Armor });

      break;
    // Rune Recipes----------------------------------------------------------------------------------------------------------------------------------//
    case Recipe.Rune:
      switch (Config.Recipes[i][1]) {
      case sdk.items.runes.El:
      case sdk.items.runes.Eld:
      case sdk.items.runes.Tir:
      case sdk.items.runes.Nef:
      case sdk.items.runes.Eth:
      case sdk.items.runes.Ith:
      case sdk.items.runes.Tal:
      case sdk.items.runes.Ral:
      case sdk.items.runes.Ort:
        this.recipes.push({ Ingredients: [Config.Recipes[i][1], Config.Recipes[i][1], Config.Recipes[i][1]], Index: Recipe.Rune, AlwaysEnabled: true });

        break;
      case sdk.items.runes.Thul: // thul->amn
        this.recipes.push({ Ingredients: [sdk.items.runes.Thul, sdk.items.runes.Thul, sdk.items.runes.Thul, sdk.items.gems.Chipped.Topaz], Index: Recipe.Rune });

        break;
      case sdk.items.runes.Amn: // amn->sol
        this.recipes.push({ Ingredients: [sdk.items.runes.Amn, sdk.items.runes.Amn, sdk.items.runes.Amn, sdk.items.gems.Chipped.Amethyst], Index: Recipe.Rune });

        break;
      case sdk.items.runes.Sol: // sol->shael
        this.recipes.push({ Ingredients: [sdk.items.runes.Sol, sdk.items.runes.Sol, sdk.items.runes.Sol, sdk.items.gems.Chipped.Sapphire], Index: Recipe.Rune });

        break;
      case sdk.items.runes.Shael: // shael->dol
        this.recipes.push({ Ingredients: [sdk.items.runes.Shael, sdk.items.runes.Shael, sdk.items.runes.Shael, sdk.items.gems.Chipped.Ruby], Index: Recipe.Rune });

        break;
      case sdk.items.runes.Dol: // dol->hel
        if (me.ladder || Developer.addLadderRW) {
          this.recipes.push({ Ingredients: [sdk.items.runes.Dol, sdk.items.runes.Dol, sdk.items.runes.Dol, sdk.items.gems.Chipped.Emerald], Index: Recipe.Rune });
        }

        break;
      case sdk.items.runes.Hel: // hel->io
        if (me.ladder || Developer.addLadderRW) {
          this.recipes.push({ Ingredients: [sdk.items.runes.Hel, sdk.items.runes.Hel, sdk.items.runes.Hel, sdk.items.gems.Chipped.Diamond], Index: Recipe.Rune });
        }

        break;
      case sdk.items.runes.Io: // io->lum
        if (me.ladder || Developer.addLadderRW) {
          this.recipes.push({ Ingredients: [sdk.items.runes.Io, sdk.items.runes.Io, sdk.items.runes.Io, sdk.items.gems.Flawed.Topaz], Index: Recipe.Rune });
        }

        break;
      case sdk.items.runes.Lum: // lum->ko
        if (me.ladder || Developer.addLadderRW) {
          this.recipes.push({ Ingredients: [sdk.items.runes.Lum, sdk.items.runes.Lum, sdk.items.runes.Lum, sdk.items.gems.Flawed.Amethyst], Index: Recipe.Rune });
        }

        break;
      case sdk.items.runes.Ko: // ko->fal
        if (me.ladder || Developer.addLadderRW) {
          this.recipes.push({ Ingredients: [sdk.items.runes.Ko, sdk.items.runes.Ko, sdk.items.runes.Ko, sdk.items.gems.Flawed.Sapphire], Index: Recipe.Rune });
        }

        break;
      case sdk.items.runes.Fal: // fal->lem
        if (me.ladder || Developer.addLadderRW) {
          this.recipes.push({ Ingredients: [sdk.items.runes.Fal, sdk.items.runes.Fal, sdk.items.runes.Fal, sdk.items.gems.Flawed.Ruby], Index: Recipe.Rune });
        }

        break;
      case sdk.items.runes.Lem: // lem->pul
        if (me.ladder || Developer.addLadderRW) {
          this.recipes.push({ Ingredients: [sdk.items.runes.Lem, sdk.items.runes.Lem, sdk.items.runes.Lem, sdk.items.gems.Flawed.Emerald], Index: Recipe.Rune });
        }

        break;
      case sdk.items.runes.Pul: // pul->um
        if (me.ladder || Developer.addLadderRW) {
          this.recipes.push({ Ingredients: [sdk.items.runes.Pul, sdk.items.runes.Pul, sdk.items.gems.Flawed.Diamond], Index: Recipe.Rune });
        }

        break;
      case sdk.items.runes.Um: // um->mal
        if (me.ladder || Developer.addLadderRW) {
          this.recipes.push({ Ingredients: [sdk.items.runes.Um, sdk.items.runes.Um, sdk.items.gems.Normal.Topaz], Index: Recipe.Rune });
        }

        break;
      case sdk.items.runes.Mal: // mal->ist
        if (me.ladder || Developer.addLadderRW) {
          this.recipes.push({ Ingredients: [sdk.items.runes.Mal, sdk.items.runes.Mal, sdk.items.gems.Normal.Amethyst], Index: Recipe.Rune });
        }

        break;
      case sdk.items.runes.Ist: // ist->gul
        if (me.ladder || Developer.addLadderRW) {
          this.recipes.push({ Ingredients: [sdk.items.runes.Ist, sdk.items.runes.Ist, sdk.items.gems.Normal.Sapphire], Index: Recipe.Rune });
        }

        break;
      case sdk.items.runes.Gul: // gul->vex
        if (me.ladder || Developer.addLadderRW) {
          this.recipes.push({ Ingredients: [sdk.items.runes.Gul, sdk.items.runes.Gul, sdk.items.gems.Normal.Ruby], Index: Recipe.Rune });
        }

        break;
      case sdk.items.runes.Vex: // vex->ohm
        if (me.ladder || Developer.addLadderRW) {
          this.recipes.push({ Ingredients: [sdk.items.runes.Vex, sdk.items.runes.Vex, sdk.items.gems.Normal.Emerald], Index: Recipe.Rune });
        }

        break;
      case sdk.items.runes.Ohm: // ohm->lo
        if (me.ladder || Developer.addLadderRW) {
          this.recipes.push({ Ingredients: [sdk.items.runes.Ohm, sdk.items.runes.Ohm, sdk.items.gems.Normal.Diamond], Index: Recipe.Rune });
        }

        break;
      case sdk.items.runes.Lo: // lo->sur
        if (me.ladder || Developer.addLadderRW) {
          this.recipes.push({ Ingredients: [sdk.items.runes.Lo, sdk.items.runes.Lo, sdk.items.gems.Flawless.Topaz], Index: Recipe.Rune });
        }

        break;
      case sdk.items.runes.Sur: // sur->ber
        if (me.ladder || Developer.addLadderRW) {
          this.recipes.push({ Ingredients: [sdk.items.runes.Sur, sdk.items.runes.Sur, sdk.items.gems.Flawless.Amethyst], Index: Recipe.Rune });
        }

        break;
      case sdk.items.runes.Ber: // ber->jah
        if (me.ladder || Developer.addLadderRW) {
          this.recipes.push({ Ingredients: [sdk.items.runes.Ber, sdk.items.runes.Ber, sdk.items.gems.Flawless.Sapphire], Index: Recipe.Rune });
        }

        break;
      case sdk.items.runes.Jah: // jah->cham
        if (me.ladder || Developer.addLadderRW) {
          this.recipes.push({ Ingredients: [sdk.items.runes.Jah, sdk.items.runes.Jah, sdk.items.gems.Flawless.Ruby], Index: Recipe.Rune });
        }

        break;
      case sdk.items.runes.Cham: // cham->zod
        if (me.ladder || Developer.addLadderRW) {
          this.recipes.push({ Ingredients: [sdk.items.runes.Cham, sdk.items.runes.Cham, sdk.items.gems.Flawless.Emerald], Index: Recipe.Rune });
        }

        break;
      }

      break;
    case Recipe.Token:
      this.recipes.push({ Ingredients: [sdk.quest.item.TwistedEssenceofSuffering, sdk.quest.item.ChargedEssenceofHatred, sdk.quest.item.BurningEssenceofTerror, sdk.quest.item.FesteringEssenceofDestruction], Index: Recipe.Token, AlwaysEnabled: true });

      break;
    }
  }
};

/** @this Cubing */
Cubing.buildLists = function () {
  CraftingSystem.checkSubrecipes();
  SoloWants.checkSubrecipes();

  this.validIngredients = [];
  this.neededIngredients = [];
  let items = me.getItemsEx()
    .filter(item => [sdk.items.mode.inStorage, sdk.items.mode.Equipped].includes(item.mode))
    .sort((a, b) => b.ilvl - a.ilvl);
  /**
   * @param {ItemUnit} item
   * @param {*} recipe
   */
  const ingredientObj = (item, recipe) => ({
    classid: item.classid,
    type: item.itemType,
    quality: item.quality,
    ilvl: item.ilvl,
    gid: item.gid,
    recipe: recipe,
  });

  for (let i = 0; i < this.recipes.length; i += 1) {
    // Set default Enabled property - true if recipe is always enabled, false otherwise
    this.recipes[i].Enabled = this.recipes[i].hasOwnProperty("AlwaysEnabled");

    IngredientLoop:
    for (let j = 0; j < this.recipes[i].Ingredients.length; j += 1) {
      for (let k = 0; k < items.length; k += 1) {
        if (((this.recipes[i].Ingredients[j] === "pgem" && this.gemList.includes(items[k].classid))
          || (this.recipes[i].Ingredients[j] === "fgem" && [sdk.items.gems.Flawless.Amethyst, sdk.items.gems.Flawless.Topaz, sdk.items.gems.Flawed.Sapphire, sdk.items.gems.Flawless.Emerald, sdk.items.gems.Flawless.Ruby, sdk.items.gems.Flawless.Diamond, sdk.items.gems.Flawless.Skull].includes(items[k].classid))
          || (this.recipes[i].Ingredients[j] === "cgem" && this.chippedGems.includes(items[k].classid))
          || items[k].classid === this.recipes[i].Ingredients[j]) && this.validItem(items[k], this.recipes[i])) {

          // push the item's info into the valid ingredients array. this will be used to find items when checking recipes
          this.validIngredients.push(ingredientObj(items[k], Cubing.recipes[i]));

          // Remove from item list to prevent counting the same item more than once
          items.splice(k, 1);

          k -= 1;

          // Enable recipes for gem/jewel pickup
          // Enable rune recipe after 2 bases are found
          if (this.recipes[i].Index !== Recipe.Rune || (this.recipes[i].Index === Recipe.Rune && j >= 1)) {
            this.recipes[i].Enabled = true;
          }

          continue IngredientLoop;
        }
      }

      // add the item to needed list - enable pickup
      this.neededIngredients.push({ classid: this.recipes[i].Ingredients[j], recipe: this.recipes[i] });

      // skip flawless gems adding if we don't have the main item (Recipe.Gem and Recipe.Rune for el-ort are always enabled)
      if (!this.recipes[i].Enabled) {
        break;
      }

      // if the recipe is enabled (we have the main item), add flawless gem recipes (if needed)

      if (this.subRecipes.indexOf(sdk.items.gems.Perfect.Amethyst) === -1
        && (this.recipes[i].Ingredients[j] === sdk.items.gems.Perfect.Amethyst
        || (this.recipes[i].Ingredients[j] === "pgem"
        && this.gemList.indexOf(sdk.items.gems.Perfect.Amethyst) > -1))) {
        this.recipes.push({
          Ingredients: [
            sdk.items.gems.Flawless.Amethyst,
            sdk.items.gems.Flawless.Amethyst,
            sdk.items.gems.Flawless.Amethyst
          ],
          Index: Recipe.Gem,
          AlwaysEnabled: true,
          MainRecipe: this.recipes[i].Index
        });
        this.subRecipes.push(sdk.items.gems.Perfect.Amethyst);
      }

      // Make flawless amethyst
      if (this.subRecipes.indexOf(sdk.items.gems.Flawless.Amethyst) === -1
        && (this.recipes[i].Ingredients[j] === sdk.items.gems.Flawless.Amethyst
        || (this.recipes[i].Ingredients[j] === "fgem"
        && this.gemList.indexOf(sdk.items.gems.Flawless.Amethyst) > -1))) {
        this.recipes.push({
          Ingredients: [
            sdk.items.gems.Normal.Amethyst,
            sdk.items.gems.Normal.Amethyst,
            sdk.items.gems.Normal.Amethyst
          ],
          Index: Recipe.Gem,
          AlwaysEnabled: true,
          MainRecipe: this.recipes[i].Index
        });
        this.subRecipes.push(sdk.items.gems.Flawless.Amethyst);
      }

      // Make perf topaz
      if (this.subRecipes.indexOf(sdk.items.gems.Perfect.Topaz) === -1 && (this.recipes[i].Ingredients[j] === sdk.items.gems.Perfect.Topaz || (this.recipes[i].Ingredients[j] === "pgem" && this.gemList.indexOf(sdk.items.gems.Perfect.Topaz) > -1))) {
        this.recipes.push({ Ingredients: [sdk.items.gems.Flawless.Topaz, sdk.items.gems.Flawless.Topaz, sdk.items.gems.Flawless.Topaz], Index: Recipe.Gem, AlwaysEnabled: true, MainRecipe: this.recipes[i].Index });
        this.subRecipes.push(sdk.items.gems.Perfect.Topaz);
      }

      // Make flawless topaz
      if (this.subRecipes.indexOf(sdk.items.gems.Flawless.Topaz) === -1 && (this.recipes[i].Ingredients[j] === sdk.items.gems.Flawless.Topaz || (this.recipes[i].Ingredients[j] === "fgem" && this.gemList.indexOf(sdk.items.gems.Flawless.Topaz) > -1))) {
        this.recipes.push({ Ingredients: [sdk.items.gems.Normal.Topaz, sdk.items.gems.Normal.Topaz, sdk.items.gems.Normal.Topaz], Index: Recipe.Gem, AlwaysEnabled: true, MainRecipe: this.recipes[i].Index });
        this.subRecipes.push(sdk.items.gems.Flawless.Topaz);
      }

      // Make perf sapphire
      if (this.subRecipes.indexOf(sdk.items.gems.Perfect.Sapphire) === -1 && (this.recipes[i].Ingredients[j] === sdk.items.gems.Perfect.Sapphire || (this.recipes[i].Ingredients[j] === "pgem" && this.gemList.indexOf(sdk.items.gems.Perfect.Sapphire) > -1))) {
        this.recipes.push({ Ingredients: [sdk.items.gems.Flawless.Sapphire, sdk.items.gems.Flawless.Sapphire, sdk.items.gems.Flawless.Sapphire], Index: Recipe.Gem, AlwaysEnabled: true, MainRecipe: this.recipes[i].Index });
        this.subRecipes.push(sdk.items.gems.Perfect.Sapphire);
      }

      // Make flawless sapphire
      if (this.subRecipes.indexOf(sdk.items.gems.Flawless.Sapphire) === -1 && (this.recipes[i].Ingredients[j] === sdk.items.gems.Flawless.Sapphire || (this.recipes[i].Ingredients[j] === "fgem" && this.gemList.indexOf(sdk.items.gems.Flawless.Sapphire) > -1))) {
        this.recipes.push({ Ingredients: [sdk.items.gems.Normal.Sapphire, sdk.items.gems.Normal.Sapphire, sdk.items.gems.Normal.Sapphire], Index: Recipe.Gem, AlwaysEnabled: true, MainRecipe: this.recipes[i].Index });
        this.subRecipes.push(sdk.items.gems.Flawless.Sapphire);
      }

      // Make perf emerald
      if (this.subRecipes.indexOf(sdk.items.gems.Perfect.Emerald) === -1 && (this.recipes[i].Ingredients[j] === sdk.items.gems.Perfect.Emerald || (this.recipes[i].Ingredients[j] === "pgem" && this.gemList.indexOf(sdk.items.gems.Perfect.Emerald) > -1))) {
        this.recipes.push({ Ingredients: [sdk.items.gems.Flawless.Emerald, sdk.items.gems.Flawless.Emerald, sdk.items.gems.Flawless.Emerald], Index: Recipe.Gem, AlwaysEnabled: true, MainRecipe: this.recipes[i].Index });
        this.subRecipes.push(sdk.items.gems.Perfect.Emerald);
      }

      // Make flawless emerald
      if (this.subRecipes.indexOf(sdk.items.gems.Flawless.Emerald) === -1 && (this.recipes[i].Ingredients[j] === sdk.items.gems.Flawless.Emerald || (this.recipes[i].Ingredients[j] === "fgem" && this.gemList.indexOf(sdk.items.gems.Flawless.Emerald) > -1))) {
        this.recipes.push({ Ingredients: [sdk.items.gems.Normal.Emerald, sdk.items.gems.Normal.Emerald, sdk.items.gems.Normal.Emerald], Index: Recipe.Gem, AlwaysEnabled: true, MainRecipe: this.recipes[i].Index });
        this.subRecipes.push(sdk.items.gems.Flawless.Emerald);
      }

      // Make perf ruby
      if (this.subRecipes.indexOf(sdk.items.gems.Perfect.Ruby) === -1 && (this.recipes[i].Ingredients[j] === sdk.items.gems.Perfect.Ruby || (this.recipes[i].Ingredients[j] === "pgem" && this.gemList.indexOf(sdk.items.gems.Perfect.Ruby) > -1))) {
        this.recipes.push({ Ingredients: [sdk.items.gems.Flawless.Ruby, sdk.items.gems.Flawless.Ruby, sdk.items.gems.Flawless.Ruby], Index: Recipe.Gem, AlwaysEnabled: true, MainRecipe: this.recipes[i].Index });
        this.subRecipes.push(sdk.items.gems.Perfect.Ruby);
      }

      // Make flawless ruby
      if (this.subRecipes.indexOf(sdk.items.gems.Flawless.Ruby) === -1 && (this.recipes[i].Ingredients[j] === sdk.items.gems.Flawless.Ruby || (this.recipes[i].Ingredients[j] === "fgem" && this.gemList.indexOf(sdk.items.gems.Flawless.Ruby) > -1))) {
        this.recipes.push({ Ingredients: [sdk.items.gems.Normal.Ruby, sdk.items.gems.Normal.Ruby, sdk.items.gems.Normal.Ruby], Index: Recipe.Gem, AlwaysEnabled: true, MainRecipe: this.recipes[i].Index });
        this.subRecipes.push(sdk.items.gems.Flawless.Ruby);
      }

      // Make perf diamond
      if (this.subRecipes.indexOf(sdk.items.gems.Perfect.Diamond) === -1 && (this.recipes[i].Ingredients[j] === sdk.items.gems.Perfect.Diamond || (this.recipes[i].Ingredients[j] === "pgem" && this.gemList.indexOf(sdk.items.gems.Perfect.Diamond) > -1))) {
        this.recipes.push({ Ingredients: [sdk.items.gems.Flawless.Diamond, sdk.items.gems.Flawless.Diamond, sdk.items.gems.Flawless.Diamond], Index: Recipe.Gem, AlwaysEnabled: true, MainRecipe: this.recipes[i].Index });
        this.subRecipes.push(sdk.items.gems.Perfect.Diamond);
      }

      // Make flawless diamond
      if (this.subRecipes.indexOf(sdk.items.gems.Flawless.Diamond) === -1 && (this.recipes[i].Ingredients[j] === sdk.items.gems.Flawless.Diamond || (this.recipes[i].Ingredients[j] === "fgem" && this.gemList.indexOf(sdk.items.gems.Flawless.Diamond) > -1))) {
        this.recipes.push({ Ingredients: [sdk.items.gems.Normal.Diamond, sdk.items.gems.Normal.Diamond, sdk.items.gems.Normal.Diamond], Index: Recipe.Gem, AlwaysEnabled: true, MainRecipe: this.recipes[i].Index });
        this.subRecipes.push(sdk.items.gems.Flawless.Diamond);
      }

      // Make perf skull
      if (this.subRecipes.indexOf(sdk.items.gems.Perfect.Skull) === -1 && (this.recipes[i].Ingredients[j] === sdk.items.gems.Perfect.Skull || (this.recipes[i].Ingredients[j] === "pgem" && this.gemList.indexOf(sdk.items.gems.Perfect.Skull) > -1))) {
        this.recipes.push({ Ingredients: [sdk.items.gems.Flawless.Skull, sdk.items.gems.Flawless.Skull, sdk.items.gems.Flawless.Skull], Index: Recipe.Gem, AlwaysEnabled: true, MainRecipe: this.recipes[i].Index });
        this.subRecipes.push(sdk.items.gems.Perfect.Skull);
      }

      // Make flawless skull
      if (this.subRecipes.indexOf(sdk.items.gems.Flawless.Skull) === -1 && (this.recipes[i].Ingredients[j] === sdk.items.gems.Flawless.Skull || (this.recipes[i].Ingredients[j] === "fgem" && this.gemList.indexOf(sdk.items.gems.Flawless.Skull) > -1))) {
        this.recipes.push({ Ingredients: [sdk.items.gems.Normal.Skull, sdk.items.gems.Normal.Skull, sdk.items.gems.Normal.Skull], Index: Recipe.Gem, AlwaysEnabled: true, MainRecipe: this.recipes[i].Index });
        this.subRecipes.push(sdk.items.gems.Flawless.Skull);
      }
    }
  }
};

// Added try again to emptying cube if it fails it will clear inventory then organize it
Cubing.emptyCube = function () {
  let cube = me.getItem(sdk.items.quest.Cube);
  let items = me.findItems(-1, -1, sdk.storage.Cube);
  if (!cube || !items) return false;

  while (items.length) {
    !getUIFlag(sdk.uiflags.Cube) && Cubing.openCube();

    if (!Storage.Stash.MoveTo(items[0]) && !Storage.Inventory.MoveTo(items[0])) {
      Town.clearInventory();
      me.sortInventory();

      if (!Storage.Stash.MoveTo(items[0]) && !Storage.Inventory.MoveTo(items[0])) {
        return false;
      }
    }

    items.shift();
  }

  return true;
};

/** @param {ItemUnit} unit */
Cubing.checkItem = function (unit) {
  if (!Config.Cubing || !unit) return false;

  for (let i = 0; i < this.validIngredients.length; i++) {
    // not the same item but the same type of item
    if (unit.mode !== sdk.items.mode.Equipped && unit.gid !== this.validIngredients[i].gid
      && unit.classid === this.validIngredients[i].classid && unit.quality === this.validIngredients[i].quality) {
      // item is better than the one we currently have, so add it to validIngredient array and remove old item
      if (unit.ilvl > this.validIngredients[i].ilvl && this.validItem(unit, this.validIngredients[i].recipe)) {
        this.validIngredients.push({
          classid: unit.classid,
          quality: unit.quality,
          ilvl: unit.ilvl,
          gid: unit.gid,
          recipe: this.validIngredients[i].recipe
        });
        this.validIngredients.splice(i, 1);
        return true;
      }
    }
    // its an item meant for socketing so lets be sure we have the best base
    if (this.validIngredients[i].recipe.Index >= Recipe.Socket.Shield
      && this.validIngredients[i].recipe.Index <= Recipe.Socket.Helm) {
      // not the same item but the same type of item
      if (!unit.isEquipped && unit.gid !== this.validIngredients[i].gid
        && unit.itemType === this.validIngredients[i].type
        && unit.quality === this.validIngredients[i].quality) {
        // console.debug(this.validIngredients[i], "\n//~~~~//\n", unit, "\n//~~~~~/\n", Item.betterThanStashed(unit, true));
        // item is better than the one we currently have, so add it to validIngredient array and remove old item
        if (Item.betterThanStashed(unit, true) && this.validItem(unit, this.validIngredients[i].recipe)) {
          this.validIngredients.push({
            classid: unit.classid,
            type: unit.itemType,
            quality: unit.quality,
            ilvl: unit.ilvl,
            gid: unit.gid,
            recipe: this.validIngredients[i].recipe
          });
          this.validIngredients.splice(i, 1);
          return true;
        }
      }
    }
  }

  if (this.keepItem(unit)) {
    return true;
  }

  for (let el of this.neededIngredients) {
    if (unit.classid === el.classid && this.validItem(unit, el.recipe)) {
      return true;
    }
  }

  return false;
};

/**
 * @param {ItemUnit} unit 
 * @param {*} recipe 
 */
Cubing.validItem = function (unit, recipe) {
  // Excluded items
  // Don't use items in locked inventory space
  if (unit.isInInventory && Storage.Inventory.IsLocked(unit, Config.Inventory)) return false;
  // Don't use items that are wanted by other systems
  if (Runewords.validGids.includes(unit.gid) || CraftingSystem.validGids.includes(unit.gid)) {
    return false;
  }

  // Gems and runes
  if ((unit.itemType >= sdk.items.type.Amethyst
    && unit.itemType <= sdk.items.type.Skull) || unit.itemType === sdk.items.type.Rune) {
    if (!recipe.Enabled && recipe.Ingredients[0] !== unit.classid && recipe.Ingredients[1] !== unit.classid) {
      return false;
    }

    return true;
  }

  // Token
  if (recipe.Index === Recipe.Token) return true;

  // START
  let valid = true;
  const ntipResult = NTIP.CheckItem(unit);
  const ntipNoTierResult = NTIP.CheckItem(unit, NTIP.CheckList);

  if (recipe.Index >= Recipe.HitPower.Helm && recipe.Index <= Recipe.Safety.Weapon) {
    if (Math.floor(me.charlvl / 2) + Math.floor(unit.ilvl / 2) < recipe.Level) {
      if (me.charlvl < 50) {
        // set it equal to ilvl 31 where 60% chance of 2 affixes and 20% chance each of 3 or 4 affixes 
        recipe.Level = 31;
      } else if (me.charlvl > 50 && me.charlvl < 70) {
        // set it equal to ilvl 51 where 80% chance of 3 affixes and 20% chance of 4 affixes 
        recipe.Level = 51;
      } else if (me.charlvl > 70 && me.charlvl < 93) {
        // set it equal to ilvl 71 where 100% chance of 4 affixes
        recipe.Level = 71;
      }
    }
    // Junk jewels (NOT matching a pickit entry)
    if (unit.itemType === sdk.items.type.Jewel) {
      if (recipe.Enabled && ntipResult === Pickit.Result.UNWANTED) return true;
    // Main item, NOT matching a pickit entry
    } else if (unit.magic && Math.floor(me.charlvl / 2) + Math.floor(unit.ilvl / 2) >= recipe.Level
      && ntipNoTierResult === Pickit.Result.UNWANTED) {
      return true;
    }

    return false;
  } else if (recipe.Index >= Recipe.Unique.Weapon.ToExceptional && recipe.Index <= Recipe.Unique.Armor.ToElite) {
    // If item is equipped, ensure we can use the upgraded version
    if (unit.isEquipped) {
      if (me.charlvl < unit.upgradedLvlReq
        || me.trueStr < unit.upgradedStrReq
        || me.trueDex < unit.upgradedDexReq) {
        return false;
      }
    }
    // Unique item matching pickit entry
    if (unit.unique && ntipResult === Pickit.Result.WANTED) {
      // check items name (prevents upgrading lavagout when we want to be upgrading magefist for the second time)
      if (recipe.Name !== undefined) {
        valid = !!unit.fname.toLowerCase().includes(recipe.Name.toLowerCase());
        if (valid) {
          // check to see if we are using this already and if so compare base stats to see if this one would be better
          // ignore things that get re-rolled like defense or min/max dmg just focus on base stats like enhanced defense/damage
          let equipped = me.getItemsEx(-1, sdk.storage.Equipped)
            .find(item => item.fname.toLowerCase().includes(recipe.Name.toLowerCase()));
          if (equipped) {
            switch (recipe.Name.toLowerCase()) {
            case "magefist":
              // compare enhanced defense - keep "equal to" because base defense gets re-rolled so it might turn out better
              valid = (unit.getStat(sdk.stats.ArmorPercent) >= equipped.getStat(sdk.stats.ArmorPercent));
              break;
            }
          }
        }
      }
      switch (recipe.Ethereal) {
      case Roll.All:
      case undefined:
        return valid && ntipResult === Pickit.Result.WANTED;
      case Roll.Eth:
        return valid && unit.ethereal && ntipResult === Pickit.Result.WANTED;
      case Roll.NonEth:
        return valid && !unit.ethereal && ntipResult === Pickit.Result.WANTED;
      }
    }

    return false;
  } else if (recipe.Index >= Recipe.Rare.Weapon.ToExceptional && recipe.Index <= Recipe.Rare.Armor.ToElite) {
    // If item is equipped, ensure we can use the upgraded version
    if (unit.isEquipped) {
      if (me.charlvl < unit.upgradedLvlReq
        || me.trueStr < unit.upgradedStrReq
        || me.trueDex < unit.upgradedDexReq) {
        return false;
      }
    }
    // Rare item matching pickit entry
    if (unit.rare && ntipResult === Pickit.Result.WANTED) {
      switch (recipe.Ethereal) {
      case Roll.All:
      case undefined:
        return ntipResult === Pickit.Result.WANTED;
      case Roll.Eth:
        return unit.ethereal && ntipResult === Pickit.Result.WANTED;
      case Roll.NonEth:
        return !unit.ethereal && ntipResult === Pickit.Result.WANTED;
      }
    }

    return false;
  } else if (recipe.Index >= Recipe.Socket.Shield && recipe.Index <= Recipe.Socket.Helm) {
    // Normal item matching pickit entry, no sockets
    if (unit.normal && unit.sockets === 0) {
      if (Pickit.Result.WANTED === ntipResult
        && [
          sdk.items.type.Wand, sdk.items.type.VoodooHeads,
          sdk.items.type.AuricShields, sdk.items.type.PrimalHelm,
          sdk.items.type.Pelt
        ].includes(unit.itemType)) {
        if (!Item.betterThanStashed(unit) || !Item.betterBaseThanWearing(unit)) return false;
      }
      switch (recipe.Ethereal) {
      case Roll.All:
      case undefined:
        return ntipResult === Pickit.Result.WANTED;
      case Roll.Eth:
        return unit.ethereal && ntipResult === Pickit.Result.WANTED;
      case Roll.NonEth:
        return !unit.ethereal && ntipResult === Pickit.Result.WANTED;
      }
    }

    return false;
  } else if (recipe.Index === Recipe.Reroll.Magic) {
    if (unit.magic && unit.ilvl >= recipe.Level) {
      if (ntipResult === Pickit.Result.UNWANTED) return true;
      // should allow for charms that aren't immeaditly wanted by equip and not nip wanted
      if (unit.isCharm && !CharmEquip.check(unit) && ntipNoTierResult === Pickit.Result.UNWANTED) return true;
      return true;
    }

    return false;
  } else if (recipe.Index === Recipe.Reroll.Charm) {
    if (unit.isCharm && unit.magic
      && (ntipResult === Pickit.Result.UNWANTED
      || (!CharmEquip.check(unit) && ntipNoTierResult === Pickit.Result.UNWANTED))) {
      switch (unit.itemType) {
      case sdk.items.type.SmallCharm:
        if (unit.ilvl >= recipe.Level[unit.code].ilvl) {
          return true;
        }
        break;
      case sdk.items.type.LargeCharm:
        if (unit.ilvl >= recipe.Level.cm2.ilvl) {
          return true;
        }
        break;
      case sdk.items.type.GrandCharm:
        if (unit.ilvl >= recipe.Level.cm2.ilvl) {
          return true;
        }
        break;
      }
    }

    return false;
  } else if (recipe.Index === Recipe.Reroll.Rare) {
    if (unit.rare && ntipResult === Pickit.Result.UNWANTED) {
      return true;
    }

    return false;
  } else if (recipe.Index === Recipe.Reroll.HighRare) {
    if (recipe.Ingredients[0] === unit.classid && unit.rare && ntipResult === Pickit.Result.UNWANTED) {
      recipe.Enabled = true;

      return true;
    }

    if (recipe.Enabled && recipe.Ingredients[2] === unit.classid && unit.itemType === sdk.items.type.Ring
      && unit.getStat(sdk.stats.MaxManaPercent) && !Storage.Inventory.IsLocked(unit, Config.Inventory)) {
      return true;
    }

    return false;
  } else if (recipe.Index === Recipe.LowToNorm.Armor || recipe.Index === Recipe.LowToNorm.Weapon) {
    if (unit.lowquality && ntipResult === Pickit.Result.UNWANTED) {
      return true;
    }
  }

  return false;
};

Cubing.doCubing = function () {
  if (!Config.Cubing || !me.getItem(sdk.items.quest.Cube)) return false;

  let wasEquipped = false;

  this.update();
  // Randomize the recipe array to prevent recipe blocking (multiple caster items etc.)
  let tempArray = this.recipes.slice().shuffle();

  for (let i = 0; i < tempArray.length; i++) {
    let string = "Transmuting: ";
    let items = this.checkRecipe(tempArray[i]);

    if (items) {
      // If cube isn't open, attempt to open stash (the function returns true if stash is already open)
      if ((!getUIFlag(sdk.uiflags.Cube) && !Town.openStash()) || !this.emptyCube()) return false;

      this.cursorCheck();

      i = -1;

      while (items.length) {
        string += (items[0].name.trim() + (items.length > 1 ? " + " : ""));
        items[0].isEquipped && (wasEquipped = true);
        if (!Storage.Cube.MoveTo(items[0])) return false;
        items.shift();
      }

      if (!this.openCube()) return false;

      transmute();
      delay(700 + me.ping);
      console.log("ÿc4Cubing: " + string);
      Config.ShowCubingInfo && D2Bot.printToConsole(string, sdk.colors.D2Bot.Green);

      this.update();

      items = me.findItems(-1, -1, sdk.storage.Cube);

      if (items) {
        for (let j = 0; j < items.length; j++) {
          let result = Pickit.checkItem(items[j]);

          switch (result.result) {
          case Pickit.Result.UNWANTED:
            // keep if item is worth selling
            if (items[j].getItemCost(sdk.items.cost.ToSell) / (items[j].sizex * items[j].sizey) >= (me.normal ? 50 : me.nightmare ? 500 : 1000)) {
              if (Storage.Inventory.CanFit(items[j])) {
                Storage.Inventory.MoveTo(items[j]);
              } else {
                Item.logger("Dropped", items[j], "doCubing");
                items[j].drop();
              }
            }

            Developer.debugging.crafting && Item.logItem("Crafted but didn't want", items[j]);

            break;
          case Pickit.Result.WANTED:
          case Pickit.Result.SOLOWANTS:
            Item.logger("Cubing Kept", items[j]);
            Item.logItem("Cubing Kept", items[j], result.line);

            break;
          case Pickit.Result.CRAFTING: // Crafting System
            CraftingSystem.update(items[j]);

            break;
          case Pickit.Result.SOLOSYSTEM: // SoloWants System
            SoloWants.update(items[j]);

            break;
          }
        }
      }

      if (!this.emptyCube()) {
        break;
      }
    }
  }

  if (getUIFlag(sdk.uiflags.Cube) || getUIFlag(sdk.uiflags.Stash)) {
    delay(1000);

    while (getUIFlag(sdk.uiflags.Cube) || getUIFlag(sdk.uiflags.Stash)) {
      me.cancel();
      delay(300);
    }
  }

  wasEquipped && Item.autoEquip();

  return true;
};
