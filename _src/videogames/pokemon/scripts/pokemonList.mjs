import { getData } from "./cache.mjs";

async function* getAllPokemonNames() {
  let url = "https://pokeapi.co/api/v2/pokemon";

  while (url) {
    const data = await getData(url);

    if (data.results?.length) {
      for (const { name } of data.results) {
        yield name;
      }
    }

    url = data.next;
  }
}

export async function loadNameSuggestions() {
  const list = document.getElementById("pokemon-list");
  for await (const name of getAllPokemonNames()) {
    const html = suggestionTemplate(name);
    list.insertAdjacentHTML("beforeend", html);
  }
}

const suggestionTemplate = (pokemon) => {
  return `<option value="${pokemon}">${pokemon}</option>`;
};

