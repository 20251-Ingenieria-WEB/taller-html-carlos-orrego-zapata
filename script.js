let allPokemonNames = [];

// ============================
// CARGA INICIAL
// ============================
window.onload = () => {
  cargarTodosLosNombres();
  generarBotonesTipos();
  setupAutocompletado("searchInput", buscarPokemon);
  setupAutocompletado("comparar1");
  setupAutocompletado("comparar2");

  document
    .getElementById("toggleTema")
    .addEventListener("change", toggleTema);
};

// ============================
// TEMA CLARO / OSCURO
// ============================
function toggleTema() {
  const body = document.body;
  body.classList.toggle("dark");
  body.classList.toggle("light");
}

// ============================
// AUTOCOMPLETADO
// ============================
function setupAutocompletado(inputId, onSelect) {
  const input = document.getElementById(inputId);
  const autoListId = inputId === "searchInput" ? "autocompleteList" : `auto${inputId.slice(-1)}`;
  const autoList = document.getElementById(autoListId);

  input.addEventListener("input", () => {
    const val = input.value.toLowerCase();
    autoList.innerHTML = "";
    if (!val) return;

    const matches = allPokemonNames
      .filter((name) => name.startsWith(val))
      .slice(0, 10);
    matches.forEach((match) => {
      const div = document.createElement("div");
      div.textContent = match;
      div.onclick = () => {
        input.value = match;
        autoList.innerHTML = "";
        if (onSelect) onSelect(match);
      };
      autoList.appendChild(div);
    });
  });
}

// ============================
// CARGA DE NOMBRES
// ============================
async function cargarTodosLosNombres() {
  const res = await fetch("https://pokeapi.co/api/v2/pokemon?limit=10000");
  const data = await res.json();
  allPokemonNames = data.results.map((p) => p.name);

  const lista = document.getElementById("pokemonList");
  allPokemonNames.forEach((name) => {
    const li = document.createElement("li");
    li.textContent = name;
    li.onclick = () => {
      document.getElementById("galeriaTipo").style.display = "none";
      buscarPokemon(name);
    };
    lista.appendChild(li);
  });
}

// ============================
// BUSCAR POKÉMON INDIVIDUAL
// ============================
async function buscarPokemon(nombre) {
  const resultado = document.getElementById("resultado");
  resultado.innerHTML = "Buscando...";
  document.getElementById("galeriaTipo").style.display = "none";

  try {
    const res = await fetch(`https://pokeapi.co/api/v2/pokemon/${nombre}`);
    const data = await res.json();

    const staticSprite = data.sprites.front_default;
    const animatedSprite =
      data?.sprites?.versions?.["generation-v"]?.["black-white"]?.animated
        ?.front_default;

    const habilidades = data.abilities
      .map((h) => `<li>${h.ability.name}</li>`)
      .join("");

    const stats = data.stats
      .map(
        (s) => `
      <div class="stats-bar">
        <span>${s.stat.name}</span>
        <div class="bar" style="width:${s.base_stat}px"></div>
        ${s.base_stat}
      </div>`
      )
      .join("");

    resultado.innerHTML = `
      <h2>${data.name.toUpperCase()}</h2>
      <img id="pokemonImage" src="${staticSprite}" alt="${data.name}">
      ${
        animatedSprite
          ? `<br><button onclick="mostrarAnimacion('${animatedSprite}')">🎞️ Ver animación</button>`
          : ""
      }
      <button onclick="pronunciarNombre('${data.name}')">🔊 Escuchar nombre</button>
      <p><strong>ID:</strong> ${data.id}</p>
      <p><strong>Tipo:</strong> ${data.types.map((t) => t.type.name).join(", ")}</p>
      <p><strong>Altura:</strong> ${data.height / 10} m</p>
      <p><strong>Peso:</strong> ${data.weight / 10} kg</p>

      <h3>🧠 Habilidades</h3>
      <ul>${habilidades}</ul>

      <h3>📊 Estadísticas</h3>
      ${stats}

      <div id="evoluciones"></div>
    `;

    mostrarCadenaEvolutiva(data.species.url);
  } catch (err) {
    resultado.innerHTML = `<p style="color:red;">${err.message}</p>`;
  }
}

// ============================
// COMPARACIÓN
// ============================
async function compararPokemon() {
  const p1 = document.getElementById("comparar1").value.toLowerCase().trim();
  const p2 = document.getElementById("comparar2").value.toLowerCase().trim();

  if (!p1 || !p2) return alert("Escribe ambos Pokémon");

  try {
    const [res1, res2] = await Promise.all([
      fetch(`https://pokeapi.co/api/v2/pokemon/${p1}`),
      fetch(`https://pokeapi.co/api/v2/pokemon/${p2}`),
    ]);
    const data1 = await res1.json();
    const data2 = await res2.json();

    mostrarTablaComparacion(data1, data2);
  } catch {
    alert("Uno o ambos Pokémon no existen.");
  }
}

function mostrarTablaComparacion(p1, p2) {
  const tabla = document.getElementById("tablaComparacion");

  tabla.innerHTML = `
    <tr>
      <th>Atributo</th>
      <th>${p1.name.toUpperCase()}</th>
      <th>${p2.name.toUpperCase()}</th>
    </tr>
    <tr>
      <td>Tipo</td>
      <td>${p1.types.map((t) => t.type.name).join(", ")}</td>
      <td>${p2.types.map((t) => t.type.name).join(", ")}</td>
    </tr>
    <tr>
      <td>Altura</td>
      <td>${p1.height / 10} m</td>
      <td>${p2.height / 10} m</td>
    </tr>
    <tr>
      <td>Peso</td>
      <td>${p1.weight / 10} kg</td>
      <td>${p2.weight / 10} kg</td>
    </tr>
    <tr>
      <td>Habilidad principal</td>
      <td>${p1.abilities[0]?.ability.name || "-"}</td>
      <td>${p2.abilities[0]?.ability.name || "-"}</td>
    </tr>
    <tr>
      <td>Movimientos conocidos</td>
      <td>${p1.moves.length}</td>
      <td>${p2.moves.length}</td>
    </tr>
    <tr>
      <td>Total de estadísticas</td>
      <td>${p1.stats.reduce((s, e) => s + e.base_stat, 0)}</td>
      <td>${p2.stats.reduce((s, e) => s + e.base_stat, 0)}</td>
    </tr>
  `;
}

// ============================
// UTILIDADES
// ============================
function mostrarAnimacion(url) {
  const img = document.getElementById("pokemonImage");
  if (img) img.src = url;
}

function pronunciarNombre(nombre) {
  const msg = new SpeechSynthesisUtterance(nombre);
  speechSynthesis.speak(msg);
}

async function mostrarCadenaEvolutiva(urlEspecie) {
  const res = await fetch(urlEspecie);
  const data = await res.json();
  const evoRes = await fetch(data.evolution_chain.url);
  const evoData = await evoRes.json();

  const cadena = [];
  let actual = evoData.chain;
  while (actual) {
    cadena.push(actual.species.name);
    actual = actual.evolves_to[0];
  }

  const html = cadena
    .map((n, i) => `${i > 0 ? "➡️" : ""} ${n.toUpperCase()}`)
    .join(" ");
  document.getElementById("evoluciones").innerHTML = `
    <h3>🧬 Evoluciones</h3>
    <p>${html}</p>
  `;
}

// ============================
// TIPOS Y GALERÍA
// ============================
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
  tipos.forEach((tipo) => {
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
  contenedor.style.display = "flex";

  const res = await fetch(`https://pokeapi.co/api/v2/type/${tipo}`);
  const data = await res.json();

  contenedor.innerHTML = "";
  const lista = data.pokemon.slice(0, 40);

  for (let item of lista) {
    const resPokemon = await fetch(item.pokemon.url);
    const poke = await resPokemon.json();

    const div = document.createElement("div");
    div.innerHTML = `
      <img src="${poke.sprites.front_default}" alt="${poke.name}">
      <p>${poke.name}</p>
    `;
    div.style.cursor = "pointer";
    div.onclick = () => buscarPokemon(poke.name);
    contenedor.appendChild(div);
  }
}

function filtrarGaleria() {
  const filtro = document
    .getElementById("filtroGaleria")
    .value.toLowerCase()
    .trim();
  const cards = document.querySelectorAll("#galeriaTipo > div");
  cards.forEach((card) => {
    const nombre = card.innerText.toLowerCase();
    card.style.display = nombre.includes(filtro) ? "block" : "none";
  });
}

// ============================
// DESCARGA PDF (solo para implementaciones.html)
// ============================
function descargarPDF() {
  const contenedor = document.getElementById("contenido-implementaciones");
  if (!contenedor) return;
  const opciones = {
    margin: 0.5,
    filename: "implementaciones_pokefinder.pdf",
    image: { type: "jpeg", quality: 0.98 },
    html2canvas: { scale: 2 },
    jsPDF: { unit: "in", format: "letter", orientation: "portrait" },
  };
  html2pdf().set(opciones).from(contenedor).save();
}

