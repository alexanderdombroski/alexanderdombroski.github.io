var factionFilter = document.getElementById("faction_filter");
factionFilter.addEventListener("change", applyFilter);

function getOptionsForFaction(keyValue) {
    let cards;
    if (keyValue == "Blob") {
        cards = [
            'Blob Fighter',
            'Battle Pod',
            'Trade Pod',
            'Ram',
            'Blob Wheel',
            'Blob Destroyer',
            'The Hive',
            'Battle Blob',
            'Blob Carrier',
            'Mothership',
            'Blob World'
        ];
    } else if (keyValue == "Trade Federation") {
        cards = [
            'Federation Shuttle',
            'Cutter',
            'Embassy Yacht',
            'Trading Post',
            'Freighter',
            'Barter World',
            'Trade Escort',
            'Defense Center',
            'Flagship',
            'Port of Call',
            'Central Office',
            'Command Ship'
        ];
    } else if (keyValue == "Star Empire") {
        cards = [
            'Imperial Fighter',
            'Corvette',
            'Imperial Frigate',
            'Survey Ship',
            'Space Station',
            'Recycling Station',
            'War World',
            'Battlecruiser',
            'Royal Redoubt',
            'Dreadnaught',
            'Fleet HQ'
        ];
    } else if (keyValue == "Trade Federation") {
        cards = [
            'Trade Bot',
            'Missile Bot',
            'Supply Bot',
            'Battle Station',
            'Patrol Mech',
            'Stealth Needle',
            'Battle Mech',
            'Mech World',
            'Missile Mech',
            'Junkyard',
            'Machine Base',
            'Brain World'
        ];
    } else {
        cards = ['Scout', 'Viper', 'Explorer'];
    }
    return cards
}

function updateDatalistOptions(cardList) {
    var shipDataList = document.getElementById("filtered-card-list")
    shipDataList.innerHTML = ''
    for (var card of cardList) {
        let option = document.createElement('option');
        option.value = card;
        shipDataList.appendChild(option);
    }
}

function applyFilter() {
    // Get the selected faction from the dropdown
    var factionFilter = document.getElementById("faction_filter");
    var selectedFaction = factionFilter.value;

    // Log the selected faction (you can use it as needed)
    console.log("Selected Faction:", selectedFaction);

    // Update datalist options based on the selected faction
    updateDatalistOptions(getOptionsForFaction(selectedFaction));
}