const BASE_URL = 'https://pokeapi.co/api/v2';
let currentType = null;
let currentPage = 1;
const ITEMS_PER_PAGE = 25;


async function loadPokemonTypes() {
    try {
        const response = await fetch(`${BASE_URL}/type?offset=0&limit=21`);
        const data = await response.json();
        displayTypes(data.results);
    } catch (error) {
        console.error('Erreur lors du chargement des types:', error);
    }
}

function displayTypes(types) {
    const container = document.querySelector('.types-container');
    container.innerHTML = '';
    types.forEach(type => {
        const typeElement = document.createElement('button');
        typeElement.textContent = type.name;
        typeElement.classList.add('type-button', type.name);
        typeElement.addEventListener('click', () => {
            currentType = type.name;
            currentPage = 1;
            loadPokemonByType(type.name);
        });
        container.appendChild(typeElement);
    });
}

async function loadPokemonByType(type) {
    try {
        const response = await fetch(`${BASE_URL}/type/${type}`);
        const data = await response.json();
        const startIndex = (currentPage - 1) * ITEMS_PER_PAGE;
        const endIndex = startIndex + ITEMS_PER_PAGE;
        const pokemonToDisplay = data.pokemon.slice(startIndex, endIndex);
        displayPokemon(pokemonToDisplay);
        updatePagination(data.pokemon.length);
    } catch (error) {
        console.error('Erreur lors du chargement des Pokémon:', error);
    }
}

async function displayPokemon(pokemonList) {
    const container = document.querySelector('.pokemon-list');
    container.innerHTML = '';

    for (const item of pokemonList) {
        const pokemon = item.pokemon;
        const response = await fetch(pokemon.url);
        const data = await response.json();

        const card = document.createElement('div');
        card.classList.add('pokemon-card');
        card.innerHTML = `
            <img src="${data.sprites.front_default}" alt="${data.name}">
            <h3>${data.name}</h3>
        `;
        card.addEventListener('click', () => showPokemonDetails(data));
        container.appendChild(card);
    }
}

function showPokemonDetails(pokemon) {
    const modal = document.getElementById('pokemonModal');
    const details = document.getElementById('pokemonDetails');
    
    details.innerHTML = `
        <h2>${pokemon.name}</h2>
        <img src="${pokemon.sprites.front_default}" alt="${pokemon.name}">
        <p>Taille: ${pokemon.height/10}m</p>
        <p>Poids: ${pokemon.weight/10}kg</p>
        <h3>Capacités:</h3>
        <ul>
            ${pokemon.abilities.map(ability => `<li>${ability.ability.name}</li>`).join('')}
        </ul>
        <h3>Statistiques:</h3>
        <ul>
            ${pokemon.stats.map(stat => `<li>${stat.stat.name}: ${stat.base_stat}</li>`).join('')}
        </ul>
    `;

    modal.style.display = 'block';
}

function updatePagination(totalItems) {
    const totalPages = Math.ceil(totalItems / ITEMS_PER_PAGE);
    document.getElementById('currentPage').textContent = currentPage;
    document.getElementById('prevPage').disabled = currentPage === 1;
    document.getElementById('nextPage').disabled = currentPage === totalPages;
}

document.getElementById('searchInput').addEventListener('input', (e) => {
    const searchTerm = e.target.value.toLowerCase();
    const cards = document.querySelectorAll('.pokemon-card');
    
    cards.forEach(card => {
        const pokemonName = card.querySelector('h3').textContent.toLowerCase();
        card.style.display = pokemonName.includes(searchTerm) ? 'block' : 'none';
    });
});

document.getElementById('prevPage').addEventListener('click', () => {
    if (currentPage > 1) {
        currentPage--;
        loadPokemonByType(currentType);
    }
});

document.getElementById('nextPage').addEventListener('click', () => {
    currentPage++;
    loadPokemonByType(currentType);
});

document.querySelector('.close').addEventListener('click', () => {
    document.getElementById('pokemonModal').style.display = 'none';
});

document.addEventListener('DOMContentLoaded', () => {
    loadPokemonTypes();
});