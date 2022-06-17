/**
*  @filename    AutoMuleOverrides.js
*  @author      theBGuy
*  @desc        Automule fix to not mule wanted autoequip items
*
*/

!isIncluded("Automule.js") && include("Automule.js");

AutoMule.getMuleItems = function () {
	let info = this.getInfo();

	if (!info || !info.hasOwnProperty("muleInfo")) {
		return false;
	}
	
	let items = [];

	me.getItemsEx()
		.filter(function (item) {
			return (
				item.isInStorage && Town.ignoredItemTypes.indexOf(item.itemType) === -1 && !item.questItem
				&& ((Pickit.checkItem(item).result > 0 && NTIP.CheckItem(item, NTIP_CheckListNoTier, true) === 1) || (item.isInStash && info.muleInfo.hasOwnProperty("muleOrphans") && info.muleInfo.muleOrphans)
				&& !AutoEquip.wanted(item) // Don't mule wanted auto equip items
				&& (item.isInStash || (item.isInInventory && !Storage.Inventory.IsLocked(item, Config.Inventory))) // Don't drop items in locked slots
				&& ((!TorchSystem.getFarmers() && !TorchSystem.isFarmer()) || [sdk.items.quest.KeyofTerror, sdk.items.quest.KeyofHate, sdk.items.quest.KeyofDestruction].indexOf(item.classid) === -1) // Don't drop Keys if part of TorchSystem
				));
		})
		.forEach(function (item) {
			// Always drop items on Force or Trigger list
			if (AutoMule.matchItem(item, Config.AutoMule.Force.concat(Config.AutoMule.Trigger)) ||
				(!AutoMule.matchItem(item, Config.AutoMule.Exclude)
				&& !AutoMule.cubingIngredient(item) // Don't mule cubing ingredients
				&& !AutoMule.runewordIngredient(item) // Don't mule runeword ingredients
				&& !AutoMule.utilityIngredient(item) // Don't mule crafting system ingredients
				&& !SoloWants.keepItem(item))) { // Don't mule SoloWants system ingredients
				items.push(copyUnit(item));
			}
		});

	return items;
};
