const cardSelectors = document.getElementsByClassName("card-dropdown");
for (let i=0; i < cardSelectors.length; i++) {
    cardSelectors[i].addEventListener('change', handleCardChange);
};

function handleCardChange(event) {
    // Access the selected value using event.target.value
    const selectedValue = event.target.value;
    const rowNumber = event.target.className.split(' ')[1];
    
    // Change color
    const cells = document.querySelectorAll(`.${rowNumber} td`);
    const color = getColor(selectedValue)
    event.target.style.color = color;
    cells.forEach(cell => {
        cell.style.color = color;
    });

    
};

function getColor() {
    return 'green'
};