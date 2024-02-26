function init_cards() {
    // Read in the cards.csv file and initialize the datalist of cards.
    var shipDataList = document.getElementById("filtered-card-list")
    shipDataList.innerHTML = ''
    
    fetch("https://alexanderdombroski.github.io/personal/cardgames/sr-calculator/data/cards.csv")
        .then(response => response.text())
        .then(csvText => {
            const rows = csvText.split('\n').map(row => row.trim().split(','));
            const headers = rows.shift(); // Removes the headers
            
            // Add each card to the datalist
            rows.forEach(card => {
                let option = document.createElement('option');
                option.value = card[1];
                option.setAttribute("card-id", card[0]);
                option.setAttribute("deck", card[2]);
                option.setAttribute("faction", card[3]);
                option.setAttribute("cost", card[4]);
                option.setAttribute("defense", card[5]);
                shipDataList.appendChild(option);
            });
        })
        .catch(error => console.error('Error fetching CSV:', error));
}
init_cards();