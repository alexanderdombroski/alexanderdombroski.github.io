// Get JSON data
let jsonData
(async function getJsonData() {
     try {
        const response = await fetch("https://alexanderdombroski.github.io/personal/cardgames/sr-calculator/data/abilities.json");
        if (!response.ok) {
            throw new Error('Failed to fetch data');
        }
        jsonData = await response.json();
     } catch (error) {
        console.error('Error fetching data:', error);
     }
})();

// Add event listeners
(function cardInputsListenerSetup() {
    const cardSelectors = document.getElementsByClassName("card-dropdown");
    for (let i=0; i < cardSelectors.length; i++) {
        cardSelectors[i].addEventListener('change', handleCardChange);
    }
})();

function getColor(id) {
    switch (id) {
        case "1":
            return "#0000aa" // Blue
        case "2":
            return "#006600" // Green
        case "3":
            return "#cc9900" // Yellow
        case "4":
            return "#990000" // Red
        case "11":
            return "black"
        case "12": // All factions
            return "#fc5e03" // red-orange
        case "0":
            return "lightgray"
        default:
            console.log("error in color selection id=", id)
    }
}

function getFaction(id) {
    switch (id) {
        case "1":
            return "trade" // Blue
        case "2":
            return "blob" // Green
        case "3":
            return "star" // Yellow
        case "4":
            return "mech" // Red
        case "11":
            return "none"
        case "12": // All factions
            return "multi" // red-orange
        default:
            console.log("error in faction selection id=", id)
            return "IDK"
    }
}

function changeFactionStats() {
    // Reset Faction Numbers
    const counters = document.querySelectorAll('#faction-counters > p');
    counters.forEach(counter => {
        counter.innerHTML = "0";
    });

    // Update Faction Numbers
    const factions = [0, 0, 0, 0, 0];
    const cardInputs = document.querySelectorAll(".card-dropdown");
    cardInputs.forEach(input => {
        const factionId = input.getAttribute("faction");
        switch (factionId) {
            case "1":
                factions[1] += 1;
                break;
            case "2":
                factions[2] += 1;
                break;
            case "3":
                factions[3] += 1;
                break;
            case "4":
                factions[4] += 1;
                break;
            case "11":
                factions[0] += 1;
                break;
            case "12": // All factions
                for (let i = 0; i < factions.length; i++) {
                    factions[i] += 1;
                }
                break;
            case "0":
                break;
            default:
                console.log("unknown faction ID: ", factionId);
        }
    });
    for (let i=0; i<5; i++) {
        counters[i].innerHTML = factions[i];
    }

    // Update Pie Chart
    const pieChart = document.querySelector('.pie-chart');
    const sum = factions.reduce((accumulator, currentValue) => accumulator + currentValue, 0);
    const calcDeg = (amount) => (amount / sum) * 360;
    const grayStop = calcDeg(factions[0]);
    const blueStop = grayStop + calcDeg(factions[1]);
    const greenStop = blueStop + calcDeg(factions[2]);
    const yellowStop = greenStop + calcDeg(factions[3]);
    pieChart.style.backgroundImage = `
        conic-gradient(
            gray 0deg, 
            gray ${grayStop}deg, 
            #0000aa ${grayStop}deg, 
            #0000aa ${blueStop}deg, 
            #006600 ${blueStop}deg, 
            #006600 ${greenStop}deg, 
            #cc9900 ${greenStop}deg, 
            #cc9900 ${yellowStop}deg, 
            #990000 ${yellowStop}deg, 
            #990000 360deg
        )`;
}

function calculateColumnAverage(columnId, deckSize) {
    let columnTotal = 0;
    const cells = document.querySelectorAll(columnId);
    cells.forEach(cell => {
        columnTotal += parseFloat(cell.innerHTML);
    });
    return columnTotal / deckSize;
}

function changeProcessedStats() {
    // Change deck size counter
    const cardInputs = document.querySelectorAll(".card-dropdown");
    let deckSize = 0;
    cardInputs.forEach(card => {
        const cardId = card.getAttribute('card-id');
        if (cardId != "0") {
            deckSize += 1;
        }
    });
    const deckSizeCounter = document.getElementById('deck-size');
    deckSizeCounter.innerHTML = deckSize;
    const handSize = parseInt(document.getElementById('hand-size').value);

    // Calculate Average Draws
    const cardsDrawn = document.getElementById("cards-drawn");
    const baseDrawPower = calculateColumnAverage(".c9", deckSize);
    const drawPower = (handSize+baseDrawPower*handSize); // Accounts for cards being drawn, and the chance each of those draw a card
    cardsDrawn.innerHTML = (baseDrawPower*drawPower).toFixed(2);

    // Other Stats
    const cycling = document.getElementById("cycling");
    cycling.innerHTML = Math.max(1, deckSize / (handSize + baseDrawPower * drawPower)).toFixed(2)
    
    function displayProcessedStat(statId, selector, multiplier=drawPower, divisor=deckSize, fixed=2) {
        const element = document.getElementById(statId);
        element.innerHTML = (calculateColumnAverage(selector, divisor) * multiplier).toFixed(fixed);
    }
    
    displayProcessedStat("deck-value", ".c2", 1, 1, 0);
    displayProcessedStat("hand-value", ".c2");
    displayProcessedStat("trade", ".c3");
    displayProcessedStat("combat", ".c4");
    displayProcessedStat("authority", ".c5");
    displayProcessedStat("discard", ".c6");
    displayProcessedStat("scrap", ".c7");
    displayProcessedStat("t-scrap", ".c8");
    displayProcessedStat("defence", ".c10");

}

function clearRow(cells, defaultValue="0.00") {
    cells.forEach(cell => {
        cell.innerHTML = defaultValue;
    });
}

function transferDataFromDatalist(target, targetValue, cells) {
    // Check if the ship is in either datalist, if so, transfer the data attributes of the selected option
    const shipDataList = document.getElementById("filtered-card-list");
    const removedDataList = document.getElementById("removed-card-list");

    var optionNotFound = true;
    function checkDatalist(datalist) {
        const options = datalist.querySelectorAll('option')
        options.forEach(option => {
            if (option.value === targetValue) {
                target.setAttribute("card-id", option.getAttribute("card-id"));
                target.setAttribute("faction", option.getAttribute("faction"));
                cells[0].innerHTML = getFaction(option.getAttribute("faction"));
                cells[1].innerHTML = option.getAttribute("cost");
                cells[9].innerHTML = option.getAttribute("defense");
                optionNotFound = false;
            }
        });
    }
    checkDatalist(shipDataList)
    optionNotFound && checkDatalist(removedDataList);
    // Remove the card if it doesn't exist in the datalists
    if (optionNotFound) {
        target.value = "";
        target.setAttribute("faction", "0");
        target.setAttribute("card-id", "0");
        clearRow(cells)
    }
}

function calculateAllyActivationChance(handSize, drawChance, cardsAlreadyDrawn=1, expectedDraws=0) {
    return 1 - (1-drawChance)**(handSize+expectedDraws-cardsAlreadyDrawn);
}

function makeCardIdList() {
    const cardIds = [];
    const cardInputs = document.querySelectorAll(".card-dropdown");
    cardInputs.forEach(card => {
        const cardId = card.getAttribute('card-id');
        if (cardId === "") {
            cardIds.push(0);
        } else {
            cardIds.push(parseInt(cardId));
        }
    });
    return cardIds;
}

function makeFactionIdList() {
    const factionIds = [];
    const cardInputs = document.querySelectorAll(".card-dropdown");
    cardInputs.forEach(card => {
        const cardId = card.getAttribute('faction');
        if (cardId === "") {
            factionIds.push(0);
        } else {
            factionIds.push(parseInt(cardId));
        }
    });
    return factionIds;
}

function countBases() {
    const defences = document.querySelectorAll(".c10");
    let bases = 0;
    defences.forEach(unit => {
        if (parseInt(unit.innerHTML) !== 0) {
            bases += 1;
        }
    });
    return bases;
}

function updateAllRawAllyStats() {
    // Clear columns affected by ally abilities
    for (let i = 3; i <= 9; i++) {
        document.querySelectorAll(`.c${i}`).forEach(cell => {
            cell.innerHTML = '0.00';
        });
    }

    // Associate rows with card and faction Ids
    const cardIds = makeCardIdList();
    const factionIds = makeFactionIdList();

    // Calculate Base Ally Activation chance
    // Get counts
    const handSize = parseInt(document.getElementById('hand-size').value)
    const deckSize = parseInt(document.getElementById('deck-size').innerHTML)
    
    const unalignedCount = parseInt(document.querySelector(".none-counter").innerHTML);
    const blobCount = parseInt(document.querySelector(".blob-counter").innerHTML);
    const tradeCount = parseInt(document.querySelector(".trade-counter").innerHTML);
    const starCount = parseInt(document.querySelector(".star-counter").innerHTML);
    const mechCount = parseInt(document.querySelector(".mech-counter").innerHTML);

    const baseCount = countBases();
    
    const counts = [
        unalignedCount, 
        tradeCount, 
        blobCount, 
        starCount, 
        mechCount, 
        tradeCount + starCount,
        tradeCount + mechCount,
        mechCount + starCount,
        tradeCount + blobCount,
        blobCount + starCount,
        mechCount + blobCount,
        baseCount
    ];

    function calculateFactionRatio(rowId, factionId, allyReq, allyFac) {
        let duplicateCount = 0
        if (allyFac === 11) {
            const base = document.querySelector(`.${rowId} .c10`);
            duplicateCount = (parseInt(base.innerHTML) === 0) ? 0:1;
        } else if (factionId > 4) {
            duplicateCount = factionId === allyFac ? 2:1; 
        } else {
            duplicateCount = factionId === allyFac ? 1:0;
        }
        return (counts[allyFac] - duplicateCount - allyReq + 1) / (deckSize - allyReq + 1);
    }

    // Calculate Draw Power
    const drawColumn = document.querySelectorAll('.c9');
    for (let i=0; i<30; i++) {
        let drawPower = 0;
        const cardId = cardIds[i];
        if (cardId !== 0) {
            const cardData = jsonData[cardId];
            for (let j=0; j<cardData["abi"].length; j++) {
                if (cardData["abi"][j] === 7) {
                    switch (cardData["req"][j]) {
                        case 0:
                            drawPower += cardData["str"][j];
                            break;
                        case 1:
                            drawPower += cardData["str"][j] * calculateAllyActivationChance(handSize, calculateFactionRatio(`r${i+1}`, factionIds[i], 1, cardData["fac"][j]));
                            break;
                        case 2:
                            drawPower += cardData["str"][j] * calculateAllyActivationChance(handSize, calculateFactionRatio(`r${i+1}`, factionIds[i], 1, cardData["fac"][j])) * calculateAllyActivationChance(handSize, calculateFactionRatio(`r${i+1}`, factionIds[i], 2, cardData["fac"][j]), 2);
                            break;
                        default:
                            console.log("Error in determing ability requirement type for drawpower")
                    }
                }
            }
        drawColumn[i].innerHTML = drawPower.toFixed(2);
        }
    }

    // Update Average Draw Power per turn
    const cardsDrawn = document.getElementById("cards-drawn");
    cardsDrawn.innerHTML = (calculateColumnAverage(".c9", deckSize) * handSize).toFixed(2);

    // Clear Draw Column for recalculation
    clearRow(drawColumn);

    // Factor in drawing an ally, allowing to draw again
    // Calculate all other ability power
    const drawBonus = parseFloat(cardsDrawn.innerHTML);
    for (let i=0; i<30; i++) {
        let drawItself = 0;
        const cardId = cardIds[i];
        const cells = document.querySelectorAll(`.r${i+1} td`);
        if (cardId !== 0) {
            const cardData = jsonData[cardId];
            for (let j=0; j<cardData["abi"].length; j++) {
                let abilityPower = parseFloat(cells[cardData["abi"][j]+1].innerHTML);
                if (cardData["abi"] === 7) {
                    switch (cardData["req"][j]) {
                        case 0:
                            drawItself += cardData["str"][j] / deckSize;
                            break;
                        case 1:
                            drawItself += cardData["str"][j] * calculateAllyActivationChance(handSize, calculateFactionRatio(`r${i+1}`, factionIds[i], 1, cardData["fac"][j])) / deckSize;
                            break;
                        case 2:
                            drawItself += cardData["str"][j] * calculateAllyActivationChance(handSize, calculateFactionRatio(`r${i+1}`, factionIds[i], 1, cardData["fac"][j])) * calculateAllyActivationChance(handSize, calculateFactionRatio(`r${i+1}`, factionIds[i], 2, cardData["fac"][j]), 2) / deckSize;
                            break;
                        default:
                            console.log("Error in determing ability requirement type for drawpower")
                    }
                }
                switch (cardData["req"][j]) {
                    case 0:
                        abilityPower += cardData["str"][j];
                        break;
                    case 1:
                        abilityPower += cardData["str"][j] * calculateAllyActivationChance(handSize, calculateFactionRatio(`r${i+1}`, factionIds[i], 1, cardData["fac"][j]), 1, drawBonus-drawItself);
                        break;
                    case 2:
                        abilityPower += cardData["str"][j] * calculateAllyActivationChance(handSize, calculateFactionRatio(`r${i+1}`, factionIds[i], 1, cardData["fac"][j]), 1, drawBonus-drawItself) * calculateAllyActivationChance(handSize, calculateFactionRatio(`r${i+1}`, factionIds[i], 2, cardData["fac"][j]), 2, drawBonus-drawItself);
                        break;
                    default:
                        console.log("Error in determing ability requirement type for drawpower")
                }
                cells[cardData["abi"][j]+1].innerHTML = abilityPower.toFixed(2);
            }
        }
    }
}

function handleCardChange(event) {
    // Access the selected value using event.target.value
    const selectedValue = event.target.value;
    const rowNumber = event.target.className.split(' ')[1];
    const cells = document.querySelectorAll(`.${rowNumber} td`);
    
    // Verify user input, delete if nonexisting card
    transferDataFromDatalist(event.target, selectedValue, cells);

    changeFactionStats();

    // Change color
    const factionId = event.target.getAttribute("faction");
    const color = getColor(factionId);
    event.target.style.color = color;
    cells.forEach(cell => {
        cell.style.color = color;
    });

    // Finish adding card data
    // const cardId = event.target.getAttribute("card-id");
    // insertAbilities(cardId, factionId, [...cells].slice(2, 9));

    updateAllRawAllyStats()
    changeProcessedStats()
};

