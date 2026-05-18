const TOTAL_POKEMON = 151;
const API_BASE      = "https://pokeapi.co/api/v2/pokemon";

const TIPO_ICONE = {
    grass:    "img/Grama.webp",
    poison:   "img/Veneno.webp",
    fire:     "img/Fogo.webp",
    flying:   "img/Voador.webp",
    water:    "img/Agua.webp",
    bug:      "img/Inseto.webp",
    normal:   "img/Normal.webp",
    electric: "img/Eletrico.webp",
    ground:   "img/Terra.webp",
    fairy:    "img/Fada.webp",
    fighting: "img/Lutador.webp",
    psychic:  "img/Psiquico.webp",
    rock:     "img/Pedra.webp",
    ghost:    "img/Fantasma.webp",
    ice:      "img/Gelo.webp",
    dragon:   "img/Dragao.webp",
    dark:     "img/Sombrio.webp",
    steel:    "img/steel.png",
};

const TIPO_CLASSE = {
    grass:    "grama",
    poison:   "veneno",
    fire:     "fogo",
    flying:   "voador",
    water:    "agua",
    bug:      "inseto",
    normal:   "normal",
    electric: "eletrico",
    ground:   "terra",
    fairy:    "fada",
    fighting: "lutador",
    psychic:  "psiquico",
    rock:     "pedra",
    ghost:    "fantasma",
    ice:      "gelo",
    dragon:   "dragao",
    dark:     "sombrio",
    steel:    "aco",
};

function gerarClasseCor(tipos) {
    return tipos.map(t => TIPO_CLASSE[t] || t).join("-");
}

const CLASSES_VALIDAS = new Set([
    "normal","fogo","agua","grama","eletrico","gelo","lutador","veneno",
    "terra","voador","psiquico","inseto","pedra","fada","fantasma","dragao",
    "sombrio","aco",
    "grama-veneno","fogo-voador","inseto-voador","inseto-veneno","normal-voador",
    "veneno-terra","fada-normal","veneno-voador","inseto-grama",
    "normal-fada","voador-fogo","voador-inseto","veneno-inseto","voador-normal",
    "terra-veneno","voador-veneno","grama-inseto",
    "pedra-terra","agua-gelo","pedra-agua","lutador-psiquico","grama-psiquico",
    "agua-psiquico","fogo-pedra","fantasma-veneno","psiquico-voador",
    "gelo-psiquico","dragao-voador","agua-voador","eletrico-aco","terra-pedra",
]);

function aplicarCorFallback(card, tipos) {
    const classe = gerarClasseCor(tipos);
    if (!CLASSES_VALIDAS.has(classe)) {
        const primario = TIPO_CLASSE[tipos[0]] || tipos[0];
        card.classList.remove(classe);
        card.classList.add(primario);
    }
}

function formatarNumero(n) {
    return String(n).padStart(3, "0");
}

function criarCard(pokemon) {
    const tipos   = pokemon.types.map(t => t.type.name);
    const numero  = formatarNumero(pokemon.id);
    const nome    = pokemon.name.charAt(0).toUpperCase() + pokemon.name.slice(1);
    const sprite  = pokemon.sprites.front_default;
    const classe  = gerarClasseCor(tipos);

    const card = document.createElement("div");
    card.classList.add("card", classe);
    setTimeout(() => aplicarCorFallback(card, tipos), 0);
    card.dataset.nome      = nome.toLowerCase();
    card.dataset.pokemonId = pokemon.id;
    card.dataset.tipos     = tipos.join(",");

    
    pokemon.stats.forEach(s => {
        const key = s.stat.name.replace("-", "");
        card.dataset[key] = s.base_stat;
    });

    
    card._pokemon = pokemon;

    
    const btnFav = document.createElement("button");
    btnFav.classList.add("card-fav");
    btnFav.setAttribute("aria-label", "Favoritar");

    const favImg = document.createElement("img");
    favImg.src = "img/favorite-icon-button.png";
    favImg.alt = "Favoritar";
    favImg.classList.add("card-fav-img");
    btnFav.appendChild(favImg);

    
    function atualizarFavBtn() {
        const logado   = localStorage.getItem("missingmon_logado");
        const usuarios = JSON.parse(localStorage.getItem("missingmon_usuarios") || "{}");
        const salvos   = logado && usuarios[logado] ? (usuarios[logado].salvos || []) : [];
        const salvo    = salvos.includes(pokemon.id);
        btnFav.classList.toggle("card-fav--salvo", salvo);
        favImg.style.opacity = salvo ? "1" : "0.5";
    }
    atualizarFavBtn();

    btnFav.addEventListener("click", (e) => {
        e.stopPropagation();
        const logado = localStorage.getItem("missingmon_logado");
        if (!logado) {
            
            window.abrirLogin();
            return;
        }
        const usuarios = JSON.parse(localStorage.getItem("missingmon_usuarios") || "{}");
        if (!usuarios[logado]) return;
        const salvos = usuarios[logado].salvos || [];
        const idx    = salvos.indexOf(pokemon.id);
        if (idx === -1) salvos.push(pokemon.id);
        else            salvos.splice(idx, 1);
        usuarios[logado].salvos = salvos;
        localStorage.setItem("missingmon_usuarios", JSON.stringify(usuarios));
        atualizarFavBtn();
    });

    
    const img = document.createElement("img");
    img.classList.add("img_pokemon");
    img.src = sprite;
    img.alt = nome;

    
    const nomeParagrafo = document.createElement("p");
    nomeParagrafo.classList.add("card-name");
    nomeParagrafo.textContent = nome;

    
    const tiposDiv = document.createElement("div");
    tiposDiv.classList.add("card-types");
    tipos.forEach(tipo => {
        const icone = document.createElement("img");
        icone.classList.add("type-icon");
        icone.src = TIPO_ICONE[tipo] || "";
        icone.alt = tipo;
        tiposDiv.appendChild(icone);
    });

    card.appendChild(btnFav);
    card.appendChild(img);
    card.appendChild(nomeParagrafo);
    card.appendChild(tiposDiv);

    
    card.addEventListener("click", () => {
        window.abrirPopup(pokemon);
    });

    return card;
}

async function buscarPokemon(id) {
    const res = await fetch(`${API_BASE}/${id}`);
    if (!res.ok) throw new Error(`Erro ao buscar pokémon ${id}`);
    return res.json();
}

async function carregarPokedex() {
    const container = document.getElementById("pokedex-container");
    const ids = Array.from({ length: TOTAL_POKEMON }, (_, i) => i + 1);
    const resultados = await Promise.allSettled(ids.map(buscarPokemon));

    resultados.forEach(resultado => {
        if (resultado.status === "fulfilled") {
            container.appendChild(criarCard(resultado.value));
        }
    });
}

document.getElementById("searchInput").addEventListener("input", function () {
    const termo = this.value.toLowerCase().trim();
    document.querySelectorAll(".card").forEach(card => {
        card.style.display = card.dataset.nome.includes(termo) ? "" : "none";
    });
});

window.atualizarTodosFavs = function() {
    document.querySelectorAll(".card").forEach(card => {
        const btn  = card.querySelector(".card-fav");
        const img  = card.querySelector(".card-fav-img");
        if (!btn || !img) return;
        const id       = parseInt(card.dataset.pokemonId);
        const logado   = localStorage.getItem("missingmon_logado");
        const usuarios = JSON.parse(localStorage.getItem("missingmon_usuarios") || "{}");
        const salvos   = logado && usuarios[logado] ? (usuarios[logado].salvos || []) : [];
        const salvo    = salvos.includes(id);
        btn.classList.toggle("card-fav--salvo", salvo);
        img.style.opacity = salvo ? "1" : "0.5";
    });
};

carregarPokedex();
