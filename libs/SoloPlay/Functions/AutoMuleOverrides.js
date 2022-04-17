/*
*	@filename	AutoMuleOverrides.js
*	@author		theBGuy
*	@desc		Automule fix to not mule wanted autoequip items
*/

if (!isIncluded("Automule.js")) { include("Automule.js"); }

AutoMule.getMuleItems = function () {
	let item, items,
		info = this.getInfo();

	if (!info || !info.hasOwnProperty("muleInfo")) {
		return false;
	}

	item = me.getItem(-1, 0);
	items = [];

	if (item) {
		do {
			if (Town.ignoredItemTypes.indexOf(item.itemType) === -1 &&
				(!item.questItem) && // Don't mule quest items
					(Pickit.checkItem(item).result > 0 || (item.isInStash && info.muleInfo.hasOwnProperty("muleOrphans") && info.muleInfo.muleOrphans)) &&
					!AutoEquip.wanted(item) && // Don't mule wanted auto equip items
					(item.isInStash || (item.isInInventory && !Storage.Inventory.IsLocked(item, Config.Inventory))) && // Don't drop items in locked slots
					((!TorchSystem.getFarmers() && !TorchSystem.isFarmer()) || [sdk.items.KeyofTerror, sdk.items.KeyofHate, sdk.items.KeyofDestruction].indexOf(item.classid) === -1)) { // Don't drop Keys if part of TorchSystem
				if (this.matchItem(item, Config.AutoMule.Force.concat(Config.AutoMule.Trigger)) || // Always drop items on Force or Trigger list
					(!this.matchItem(item, Config.AutoMule.Exclude) && (!this.cubingIngredient(item) && !this.runewordIngredient(item) && !this.utilityIngredient(item)))) { // Don't drop Excluded items or Runeword/Cubing/CraftingSystem ingredients
					items.push(copyUnit(item));
				}
			}
		} while (item.getNext());
	}

	return items;
};
