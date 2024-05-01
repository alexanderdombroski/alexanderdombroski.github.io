(function init() {
    document.getElementById("round-picker").addEventListener('change', setRounds);
})();

function setRounds() {
    const choice = document.getElementById("round-picker").value;
    let rounds;
    switch (choice) {
        case "Classic":
            rounds = [1, 2, 3, 4, 5, 6, 7, 8, 9, 10];
            break;
        case "Even Keeled":
            rounds = [2, 2, 4, 4, 6, 6, 8, 8, 10, 10];
            break;
        case "Skip to the Brawl":
            rounds = [6, 7, 8, 9, 10, 0, 0, 0, 0, 0];
            break;
        case "Swift-n-Salty Skirmish":
            rounds = [5, 5, 5, 5, 5, 0, 0, 0, 0, 0];
            break;
        case "Broadside Barrage":
            rounds = new Array(10).fill(10);
            break;
        case "Whirlpool":
            rounds = [9, 9, 7, 7, 5, 5, 3, 3, 1, 1];
            break;
        case "Past Your Bedtime":
            rounds = [1, 0, 0, 0, 0, 0, 0, 0, 0, 0];
            break;
        case "Oddly Quick":
            rounds = [1, 3, 5, 7, 9, 0, 0, 0, 0, 0];
            break;
        default:
            rounds = [0, 0, 0, 0, 0, 0, 0, 0, 0, 0];
            console.log(`Uknown option: ${choice}`);
            break;
    }
    for (let i=1; i<=10; i++) {
        document.querySelector(`.r${i} > td:nth-child(2)`).innerHTML = rounds[i-1];
    }
}