
async function buscarPokemon() {
    const input = document.getElementById("searchInput").value.toLowerCase();
    const resultado = document.getElementById("resultado");
    resultado.innerHTML = "Buscando...";

    try {
        const res = await fetch(`https://pokeapi.co/api/v2/pokemon/${input}`);
        if (!res.ok) {
            throw new Error("Pokémon no encontrado");
        }

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
