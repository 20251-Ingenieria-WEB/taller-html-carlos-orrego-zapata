let allPokemonNames = [];

async function buscarPokemon(nombre) {
    const input = document.getElementById("searchInput");
    const resultado = document.getElementById("resultado");
    const query = nombre || input.value.toLowerCase();
    resultado.innerHTML = "Buscando...";
    document.getElementById("galeriaTipo").innerHTML = "";

    try {
        const res = await fetch(`https://pokeapi.co/api/v2/pokemon/${query}`);
        if (!res.ok) throw new Error("Pokémon no encontrado");

        const data = await res.json();
        resultado.innerHTML = `
            <h2>${data.name.toUpperCase()}</h2>
            <img src="${data.sprites.front_default}" alt="${data.name}">
            <p><strong>ID:</strong> ${data.id}</p>
            <p><strong>Tipo:</strong> ${data.types.map(t => t.type.name).join(", ")}</p>
            <p><strong>Altura:</strong> ${data.height / 10} m</p>
            <p><strong>Peso:</strong> ${data.weight / 10} kg</p>
        `;
    } catch (error) {
        resultado.innerHTML = `<p style="color: red;">Error: ${error.message}</p>`;
    }
}

async function cargarTodosLosNombres() {
    let nextUrl = "https://pokeapi.co/api/v2/pokemon?limit=10000";
    const lista = document.getElementById("pokemonList");

    try {
        const res = await fetch(nextUrl);
        const data = await res.json();
        allPokemonNames = data.results.map(p => p.name);

        allPokemonNames.forEach(name => {
            const li = document.createElement("li");
            li.textContent = name;
            li.onclick = () => {
                document.getElementById("searchInput").value = name;
                buscarPokemon(name);
            };
            lista.appendChild(li);
        });
    } catch (error) {
        console.error("Error cargando nombres de Pokémon:", error);
    }
}

function setupAutocomplete() {
    const input = document.getElementById("searchInput");
    const autoList = document.getElementById("autocompleteList");

    input.addEventListener("input", () => {
        const val = input.value.toLowerCase();
        autoList.innerHTML = "";
        if (!val) return;

        const matches = allPokemonNames.filter(name => name.startsWith(val)).slice(0, 10);
        matches.forEach(match => {
            const div = document.createElement("div");
            div.textContent = match;
            div.onclick = () => {
                input.value = match;
                autoList.innerHTML = "";
                buscarPokemon(match);
            };
            autoList.appendChild(div);
        });
    });
}

function generarBotonesTipos() {
    const tipos = [
        { nombre: "fire", emoji: "🔥" },
        { nombre: "water", emoji: "💧" },
        { nombre: "grass", emoji: "🌿" },
        { nombre: "electric", emoji: "⚡" },
        { nombre: "psychic", emoji: "🪐" },
        { nombre: "ghost", emoji: "👻" },
        { nombre: "flying", emoji: "🕊️" },
        { nombre: "ice", emoji: "🧊" },
        { nombre: "dragon", emoji: "🐉" },
        { nombre: "rock", emoji: "🪨" },
        { nombre: "ground", emoji: "🪵" },
        { nombre: "poison", emoji: "☠️" },
        { nombre: "fighting", emoji: "🥊" },
        { nombre: "dark", emoji: "🌑" },
        { nombre: "steel", emoji: "⚙️" },
        { nombre: "bug", emoji: "🐛" },
        { nombre: "fairy", emoji: "🧚" },
        { nombre: "normal", emoji: "🤍" }
    ];

    const contenedor = document.getElementById("typeButtons");
    tipos.forEach(tipo => {
        const btn = document.createElement("button");
        btn.textContent = `${tipo.emoji} ${tipo.nombre}`;
        btn.onclick = () => cargarGaleriaPorTipo(tipo.nombre);
        contenedor.appendChild(btn);
    });
}

async function cargarGaleriaPorTipo(tipo) {
    const contenedor = document.getElementById("galeriaTipo");
    const resultado = document.getElementById("resultado");
    resultado.innerHTML = "";
    contenedor.innerHTML = "Cargando galería...";

    try {
        const res = await fetch(`https://pokeapi.co/api/v2/type/${tipo}`);
        const data = await res.json();

        contenedor.innerHTML = "";
        const lista = data.pokemon.slice(0, 40); // limitamos a 40 para no saturar

        for (let item of lista) {
            const resPokemon = await fetch(item.pokemon.url);
            const poke = await resPokemon.json();

            const div = document.createElement("div");
            div.innerHTML = `
                <img src="${poke.sprites.front_default}" alt="${poke.name}">
                <p>${poke.name}</p>
            `;
            contenedor.appendChild(div);
        }
    } catch (error) {
        contenedor.innerHTML = `<p style="color:red;">Error al cargar el tipo: ${error.message}</p>`;
    }
}

window.onload = () => {
    cargarTodosLosNombres();
    setupAutocomplete();
    generarBotonesTipos();
};
