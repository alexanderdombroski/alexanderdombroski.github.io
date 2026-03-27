var factionFilter = document.getElementById("faction_filter");
factionFilter.addEventListener("change", applyFilter);
var cardFilter = document.getElementById("deck_filter");
cardFilter.addEventListener("change", applyFilter);

function transferDatalistOptions(beginList, destList) {
    // Moves all options from the datalist associated with beginList to the datalist associated with destList
    const options = beginList.querySelectorAll('option');
    options.forEach(option => {
        destList.appendChild(option);
    });
}

function applyFilter() {
    // Get the selected deck and faction from the dropdown
    var factionFilter = document.getElementById("faction_filter");
    const selectedFaction = parseInt(factionFilter.value);
    var deckFilter = document.getElementById("deck_filter");
    const selectedDeck = parseInt(deckFilter.value);

    var shipDataList = document.getElementById("filtered-card-list");
    var removedDataList = document.getElementById("removed-card-list");

    // Transfer the all cards to the shipDataList
    transferDatalistOptions(removedDataList, shipDataList);

    // Update datalist options based on the selected faction
    if (selectedFaction || selectedDeck) {
        const cards = shipDataList.querySelectorAll('option');
        cards.forEach(card => {
            const cardFaction = parseInt(card.getAttribute("faction"));
            const cardDeck = parseInt(card.getAttribute("deck"));
            if (selectedFaction !== cardFaction && selectedFaction) {
                removedDataList.appendChild(card);
            } else if (selectedDeck !== cardDeck && selectedDeck) {
                removedDataList.appendChild(card);
            }
        });
    }
}