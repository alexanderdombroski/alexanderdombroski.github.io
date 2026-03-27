(function init() {
    const today = new Date();
    document.getElementById("date").innerHTML = `${today.getMonth()} / ${today.getDate()} / ${today.getFullYear()}`;
})();