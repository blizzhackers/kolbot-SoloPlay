/**
*  @filename    AutoMuleOverrides.js
*  @author      theBGuy
*  @desc        Automule fix to not mule wanted autoequip items
*
*/

includeIfNotIncluded("Automule.js");

AutoMule.getMuleItems = function () {
	let info = this.getInfo();

	if (!info || !info.hasOwnProperty("muleInfo")) {
		return false;
	}
	
	let items = [];
	const isAKey = (item) => [sdk.items.quest.KeyofTerror, sdk.items.quest.KeyofHate, sdk.items.quest.KeyofDestruction].includes(item.classid);
	// check if wanted by any of the systems
	const isWanted = (item) => (AutoMule.cubingIngredient(item) || AutoMule.runewordIngredient(item) || AutoMule.utilityIngredient(item) || SoloWants.keepItem(item));

	me.getItemsEx()
		.filter(function (item) {
			return (
				item.isInStorage && Town.ignoredItemTypes.indexOf(item.itemType) === -1 && !item.questItem
				&& !AutoEquip.wanted(item) // Don't mule wanted auto equip items
				&& ((Pickit.checkItem(item).result > 0 && NTIP.CheckItem(item, NTIP_CheckListNoTier, true) === 1) || (item.isInStash && info.muleInfo.hasOwnProperty("muleOrphans") && info.muleInfo.muleOrphans)
				&& (item.isInStash || (item.isInInventory && !Storage.Inventory.IsLocked(item, Config.Inventory))) // Don't drop items in locked slots
				&& ((!TorchSystem.getFarmers() && !TorchSystem.isFarmer()) || !isAKey(item)) // Don't drop Keys if part of TorchSystem
				));
		})
		.forEach(function (item) {
			// Always drop items on Force or Trigger list
			if (AutoMule.matchItem(item, Config.AutoMule.Force.concat(Config.AutoMule.Trigger))
				|| (!AutoMule.matchItem(item, Config.AutoMule.Exclude) && !isWanted(item))) {
				items.push(copyUnit(item));
			}
		});

	return items;
};
