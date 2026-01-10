import { loadNameSuggestions } from "./pokemonList.mjs";
import { updatePokemonData } from "./pokemonData.mjs";

loadNameSuggestions();

const selector = document.getElementById("pokemon-search");
selector.addEventListener("change", (event) =>
  updatePokemonData(event.currentTarget.value)
);
