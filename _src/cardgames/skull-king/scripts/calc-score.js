(function init() {
    const addListener = element => element.addEventListener('change', pullData);
    document.querySelectorAll(".bid").forEach(addListener);
    document.querySelectorAll(".end").forEach(addListener);
    document.querySelectorAll(".bonus").forEach(addListener);
})();

function pullData(event) {
    if (isNaN(event.target.value)) {
        event.target.value = "";
    } else {
        const columnId = event.target.classList[0];
        calcScore(columnId);
    }
}

function calcScore(columnId) {
    // Get the data from the column
    const rounds = [...document.querySelectorAll(".round")].map(element => element.innerHTML);
    const data = [...document.querySelectorAll(`.${columnId}`)];
    function getValues(targetClass) {
        return data.filter(element => element.classList.contains(targetClass)).map(element => element.value);
    }
    const bids = getValues("bid");
    const ends = getValues("end");
    const bonuses = getValues("bonus");
    
    // Calculate the total score
    let totalScore = 0;
    for (let i=0; i<10; i++) {
        // Data Checking
        const bid = bids[i];
        const end = ends[i];
        if (bid === "" || end === "") { continue; } 
        let bonus = bonuses[i];
        bonus = bonus === "" ? 0 : parseInt(bonus);

        // Data Calculations
        const round = parseInt(rounds[i]);
        const difference = Math.abs(parseInt(bid)-parseInt(end));
        if (bid === "0") {
            if (difference === 0) {
                totalScore += round * 10 + bonus;
            } else {
                totalScore += round * -10;
            }
        } else {
            if (difference === 0) {
                totalScore += parseInt(bid) * 20 + bonus;
            } else {
                totalScore += difference * -10;
            }
        }
    }
    data[data.length - 1].innerHTML = totalScore
}