const catalog = {"itemCatalog":{"bent_nail":{"name":"Bent Nail","rarity":"Trash"},"torn_wrap":{"name":"Torn Wrap","rarity":"Trash"},"dull_shard":{"name":"Dull Shard","rarity":"Trash"},"leather_cap":{"name":"Leather Cap","rarity":"Common","slot":"head","armorType":"Leather"},"copper_pendant":{"name":"Copper Pendant","rarity":"Common","slot":"neck"},"padded_mantle":{"name":"Padded Mantle","rarity":"Common","slot":"shoulders","armorType":"Cloth"},"quilted_vest":{"name":"Quilted Vest","rarity":"Common","slot":"chest","armorType":"Cloth"},"leather_bracer":{"name":"Leather Bracer","rarity":"Common","slot":"bracer","armorType":"Leather"},"work_gloves":{"name":"Work Gloves","rarity":"Common","slot":"hands","armorType":"Leather"},"utility_belt":{"name":"Utility Belt","rarity":"Common","slot":"belt","armorType":"Leather"},"travel_trousers":{"name":"Travel Trousers","rarity":"Common","slot":"legs","armorType":"Cloth"},"trail_boots":{"name":"Trail Boots","rarity":"Common","slot":"boots","armorType":"Leather"},"wool_cloak":{"name":"Wool Cloak","rarity":"Common","slot":"cloak","armorType":"Cloth"},"copper_band":{"name":"Copper Band","rarity":"Common","slot":"ring_1"},"bone_token":{"name":"Bone Token","rarity":"Common","slot":"trinket_1"},"iron_sword":{"name":"Iron Shortsword","rarity":"Common","slot":"main_hand"},"wood_buckler":{"name":"Wooden Buckler","rarity":"Common","slot":"off_hand"},"ash_staff":{"name":"Ashwood Staff","rarity":"Common","slot":"main_hand","twoHanded":true},"iron_mail_shirt":{"name":"Iron Mail Shirt","rarity":"Common","slot":"chest","armorType":"Mail"},"iron_plate_helm":{"name":"Iron Plate Helm","rarity":"Common","slot":"head","armorType":"Plate"},"ragged_shirt":{"name":"Ragged Shirt","rarity":"Trash","slot":"chest"},"ragged_trousers":{"name":"Ragged Trousers","rarity":"Trash","slot":"legs"},"ragged_boots":{"name":"Ragged Boots","rarity":"Trash","slot":"boots"}},"lootTiers":{"Artifact":{"color":16730368,"icon":"🔥","item":"Heart of the First Ember"},"Legendary":{"color":16752640,"icon":"🟠","item":"Crown of Cinders"},"Epic":{"color":10901479,"icon":"🟣","item":"Emberglass Prism"},"Rare":{"color":4361471,"icon":"🔵","item":"Runed Flint"},"Uncommon":{"color":4962668,"icon":"🟢","item":"Silverthorn Sprig"},"Common":{"color":16777215,"icon":"⚪","item":"Iron Shard"},"Trash":{"color":8751505,"icon":"⚙️","item":"Charred Scraps"}},"slots":{"head":"Head","neck":"Neck","shoulders":"Shoulders","chest":"Chest","bracer":"Bracer","hands":"Hands","belt":"Belt","legs":"Legs","boots":"Boots","cloak":"Cloak","ring_1":"Ring 1","ring_2":"Ring 2","trinket_1":"Trinket 1","trinket_2":"Trinket 2","main_hand":"Main hand","off_hand":"Off-hand"},"gearItems":{"cinderfang":{"name":"Cinderfang Charm","slot":"trinket_1","rarity":"Rare"},"crown":{"name":"Crown of Cinders","slot":"head","rarity":"Legendary"},"prism":{"name":"Emberglass Prism","slot":"main_hand","twoHanded":true,"rarity":"Epic"},"leather_cap":{"name":"Leather Cap","rarity":"Common","slot":"head","armorType":"Leather"},"copper_pendant":{"name":"Copper Pendant","rarity":"Common","slot":"neck"},"padded_mantle":{"name":"Padded Mantle","rarity":"Common","slot":"shoulders","armorType":"Cloth"},"quilted_vest":{"name":"Quilted Vest","rarity":"Common","slot":"chest","armorType":"Cloth"},"leather_bracer":{"name":"Leather Bracer","rarity":"Common","slot":"bracer","armorType":"Leather"},"work_gloves":{"name":"Work Gloves","rarity":"Common","slot":"hands","armorType":"Leather"},"utility_belt":{"name":"Utility Belt","rarity":"Common","slot":"belt","armorType":"Leather"},"travel_trousers":{"name":"Travel Trousers","rarity":"Common","slot":"legs","armorType":"Cloth"},"trail_boots":{"name":"Trail Boots","rarity":"Common","slot":"boots","armorType":"Leather"},"wool_cloak":{"name":"Wool Cloak","rarity":"Common","slot":"cloak","armorType":"Cloth"},"copper_band":{"name":"Copper Band","rarity":"Common","slot":"ring_1"},"bone_token":{"name":"Bone Token","rarity":"Common","slot":"trinket_1"},"iron_sword":{"name":"Iron Shortsword","rarity":"Common","slot":"main_hand"},"wood_buckler":{"name":"Wooden Buckler","rarity":"Common","slot":"off_hand"},"ash_staff":{"name":"Ashwood Staff","rarity":"Common","slot":"main_hand","twoHanded":true},"iron_mail_shirt":{"name":"Iron Mail Shirt","rarity":"Common","slot":"chest","armorType":"Mail"},"iron_plate_helm":{"name":"Iron Plate Helm","rarity":"Common","slot":"head","armorType":"Plate"},"ragged_shirt":{"name":"Ragged Shirt","rarity":"Trash","slot":"chest"},"ragged_trousers":{"name":"Ragged Trousers","rarity":"Trash","slot":"legs"},"ragged_boots":{"name":"Ragged Boots","rarity":"Trash","slot":"boots"},"flint":{"name":"Runed Flint","slot":"off_hand","rarity":"Rare"}}};
const { itemCatalog, lootTiers, slots, gearItems } = catalog;
export function rarityColor(rarity) {
  const tier = Object.hasOwn(lootTiers, rarity) ? lootTiers[rarity] : null;
  return tier ? '#' + tier.color.toString(16).padStart(6,'0') : '';
}
const bonus = { Cloth: [1,0], Leather: [0,1], Mail: [0,2], Plate: [0,3] };
const stats = id => id === 'cinderfang' ? [1,0] : bonus[gearItems[id]?.armorType] ?? [0,0];
const signed = n => n > 0 ? '+' + n : String(n);
const delta = (p,g) => p || g ? [p ? signed(p) + ' Power' : '', g ? signed(g) + ' Guard' : ''].filter(Boolean).join(' · ') : 'No stat change';
const details = id => {
  const item = gearItems[id];
  const [p,g] = stats(id);
  return [item?.armorType, item?.twoHanded ? 'Two-handed' : '', p || g ? delta(p,g) : ''].filter(Boolean).join(' · ');
};

export function compareGear(id, count, equipment) {
  const item = gearItems[id];
  if (!item) return [];
  const targets = ['ring_1','trinket_1'].includes(item.slot) ? [item.slot, item.slot.replace('1','2')] : [item.slot];
  return targets.map(slot => {
    const old = equipment[slot];
    const copiesElsewhere = Object.entries(equipment).filter(([key,value]) => key !== slot && value === id).length;
    let change;
    if (old === id) change = 'Equipped';
    else if (slot === 'off_hand' && gearItems[equipment.main_hand]?.twoHanded) change = 'Clear main hand first';
    else if (item.twoHanded && equipment.off_hand) change = 'Clear off-hand first';
    else if (count <= copiesElsewhere && id !== 'cinderfang') change = 'No spare copy';
    else {
      const [p,g] = stats(id);
      const [op,og] = stats(old);
      change = delta((id === 'cinderfang' && copiesElsewhere ? 0 : p) - op, g - og);
    }
    return slots[slot] + ': ' + change;
  });
}

const byId = id => document.getElementById(id);
const add = (parent, tag, value, cls) => {
  const node = document.createElement(tag);
  node.textContent = value;
  if (cls) node.className = cls;
  parent.append(node);
  return node;
};
const equipped = byId('equipped-list'), pack = byId('backpack-list'), wallet = byId('inventory-coins'), filter = byId('equipment-only');
let inventory = [];
function renderPack() {
  pack.replaceChildren();
  const visible = inventory.filter(item => !filter.checked || item.id in gearItems);
  if (!visible.length) add(pack, 'p', filter.checked ? 'No equippable items in your backpack.' : 'Your backpack is empty.', 'inventory-meta');
  for (const item of visible) {
    const row = add(pack, 'article', '', 'inventory-row');
    const title = add(row, 'strong', item.name + ' ×' + item.count);
    title.style.color = rarityColor(item.rarity);
    add(row, 'p', [item.rarity, details(item.id)].filter(Boolean).join(' · '), 'inventory-meta');
    for (const comparison of item.comparisons) add(row, 'p', comparison, 'inventory-comparison');
  }
}
filter.addEventListener('change', renderPack);

export function renderEquipment(hero, payload) {
  equipped.replaceChildren();
  const equipment = hero.equipment ?? {};
  for (const [id, label] of Object.entries(slots)) {
    const row = add(equipped, 'div', '', 'inventory-row');
    add(row, 'dt', label);
    const item = gearItems[equipment[id]];
    const occupied = id === 'off_hand' && gearItems[equipment.main_hand]?.twoHanded;
    const name = add(row, 'dd', occupied ? 'Reserved by two-handed weapon' : item?.name ?? 'Empty');
    if (!occupied && item) {
      name.style.color = rarityColor(item.rarity);
      const description = [item.rarity, details(equipment[id])].filter(Boolean).join(' · ');
      if (description) add(row, 'dd', description, 'inventory-meta');
    }
  }
  inventory = [];
  wallet.textContent = '';
  if (!payload) {
    pack.replaceChildren();
    add(pack,'p','The backpack is temporarily unavailable. Refresh to try again.','inventory-meta');
    filter.disabled = true;
    return;
  }
  filter.disabled = false;
  const loot = payload.loot ?? {};
  for (const [rarity, tier] of Object.entries(lootTiers)) {
    if (loot[rarity] > 0) inventory.push({id:({Rare:'flint', Epic:'prism', Legendary:'crown'})[rarity] ?? rarity, name:tier.item, rarity, count:loot[rarity]});
    if (rarity === 'Rare' && hero.charm_owned) inventory.push({id:'cinderfang', name:'Cinderfang Charm', rarity, count:1});
    for (const [id,item] of Object.entries(itemCatalog)) if (item.rarity === rarity && loot[id] > 0) inventory.push({id,...item,count:loot[id]});
  }
  for (const item of inventory) item.comparisons = compareGear(item.id, item.count, equipment);
  wallet.textContent = ['gold','silver','copper'].map(coin => Number(payload[coin]).toLocaleString() + ' ' + coin).join(' · ');
  renderPack();
}

export function clearEquipment() {
  inventory = [];
  equipped.replaceChildren();
  pack.replaceChildren();
  wallet.textContent = '';
  filter.checked = false;
}
