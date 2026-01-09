

function queryAPI(endpoint) {
    const url = "https://pokeapi.co/api/v2/" + endpoint

    fetch(url)
        .then((response) => response.json())
        // .then((pokemon)) add more if neccessary
}

/*
fetch('https://api.example.com/data')
    .then(response => response.json())  // First `.then()` to parse the JSON
    .then(data => {
        console.log(data);  // Second `.then()` to access the parsed data
    })
    .catch(error => {
        console.error('Fetch error:', error);  // `.catch()` to handle any error
    });
*/