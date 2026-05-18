
const TIPO_ICONE = {
    grass:"img/Grama.webp",    poison:"img/Veneno.webp",   fire:"img/Fogo.webp",
    flying:"img/Voador.webp",  water:"img/Agua.webp",      bug:"img/Inseto.webp",
    normal:"img/Normal.webp",  electric:"img/Eletrico.webp",ground:"img/Terra.webp",
    fairy:"img/Fada.webp",     fighting:"img/Lutador.webp", psychic:"img/Psiquico.webp",
    rock:"img/Pedra.webp",     ghost:"img/Fantasma.webp",  ice:"img/Gelo.webp",
    dragon:"img/Dragao.webp",  dark:"img/Sombrio.webp",    steel:"img/steel.png",
};

const TIPO_CLASSE = {
    grass:"grama", poison:"veneno", fire:"fogo", flying:"voador", water:"agua",
    bug:"inseto", normal:"normal", electric:"eletrico", ground:"terra", fairy:"fada",
    fighting:"lutador", psychic:"psiquico", rock:"pedra", ghost:"fantasma",
    ice:"gelo", dragon:"dragao", dark:"sombrio", steel:"aco",
};

const STATS = [
    { label: "HP",       key: "hp",       cor: "#30d860" },
    { label: "ATTACK",   key: "attack",   cor: "#f04040" },
    { label: "DEFENSE",  key: "defense",  cor: "#f04040" },
    { label: "SP. ATK",  key: "spAtk",    cor: "#78d050" },
    { label: "SP. DEF",  key: "spDef",    cor: "#f04040" },
    { label: "SPEED",    key: "speed",    cor: "#f8d030" },
];

const MSGS = [
    p => `<span>${p.name.toUpperCase()}</span>&nbsp;quer batalhar!`,
    p => `Um&nbsp;<span>${p.name.toUpperCase()}</span>&nbsp;selvagem apareceu!`,
    p => `<span>${p.name.toUpperCase()}</span>&nbsp;está pronto para lutar!`,
];

const GRADIENTES = {
    "normal":"radial-gradient(circle at top, white, gray)",
    "fogo":"radial-gradient(circle at top, khaki, orangered)",
    "agua":"radial-gradient(circle at top, rgb(122,176,228), rgb(5,91,172))",
    "grama":"radial-gradient(circle at top, limegreen, seagreen)",
    "eletrico":"radial-gradient(circle at top, khaki, orange)",
    "gelo":"radial-gradient(circle at top, aliceblue, lightskyblue)",
    "lutador":"radial-gradient(circle at top, tomato, darkred)",
    "veneno":"radial-gradient(circle at top, plum, purple)",
    "terra":"radial-gradient(circle at top, chocolate, sienna)",
    "voador":"radial-gradient(circle at top, paleturquoise, steelblue)",
    "psiquico":"radial-gradient(circle at top, lightsalmon, palevioletred)",
    "inseto":"radial-gradient(circle at top, lawngreen, olivedrab)",
    "pedra":"radial-gradient(circle at top, lemonchiffon, brown)",
    "fada":"radial-gradient(circle at top, lightpink, fuchsia)",
    "fantasma":"radial-gradient(circle at top, orchid, indigo)",
    "dragao":"radial-gradient(circle at top, royalblue, darkblue)",
    "sombrio":"radial-gradient(circle at top, slategray, #1a1a2e)",
    "aco":"radial-gradient(circle at top, lightsteelblue, steelblue)",
    "grama-veneno":"linear-gradient(to right, limegreen, purple)",
    "fogo-voador":"linear-gradient(to right, orangered, paleturquoise)",
    "inseto-voador":"linear-gradient(to right, olivedrab, paleturquoise)",
    "inseto-veneno":"linear-gradient(to right, olivedrab, purple)",
    "normal-voador":"linear-gradient(to right, gray, paleturquoise)",
    "veneno-terra":"linear-gradient(to right, purple, chocolate)",
    "fada-normal":"linear-gradient(to right, gray, lightpink)",
    "normal-fada":"linear-gradient(to right, gray, lightpink)",
    "veneno-voador":"linear-gradient(to right, purple, paleturquoise)",
    "inseto-grama":"linear-gradient(to right, olivedrab, limegreen)",
};

let pokemons = [];
let pokeAtual = 0;
let statAtual = 0;


function getSalvos() {
    const logado   = localStorage.getItem("missingmon_logado");
    const usuarios = JSON.parse(localStorage.getItem("missingmon_usuarios") || "{}");
    if (!logado || !usuarios[logado]) return [];
    return usuarios[logado].salvos || [];
}


async function buscarPokemon(id) {
    const r = await fetch(`https://pokeapi.co/api/v2/pokemon/${id}`);
    const d = await r.json();
    const stats = {};
    d.stats.forEach(s => {
        const key = s.stat.name
            .replace("special-attack", "spAtk")
            .replace("special-defense", "spDef")
            .replace("-", "");
        stats[key] = s.base_stat;
    });
    return {
        id:      d.id,
        name:    d.name.charAt(0).toUpperCase() + d.name.slice(1),
        sprite:  d.sprites.front_default,
        tipos:   d.types.map(t => t.type.name),
        ...stats,
    };
}


function gradienteDeTipos(tipos) {
    const classes = tipos.map(t => TIPO_CLASSE[t] || t);
    const chave   = classes.join("-");
    return GRADIENTES[chave] || GRADIENTES[classes[0]] || "radial-gradient(circle at top, #555, #222)";
}

async function init() {
    const salvos = getSalvos();

    if (salvos.length === 0) {
        document.getElementById("pokemonCenter").style.display = "none";
        document.getElementById("statusEnemy").style.display   = "none";
        document.querySelector(".carousel-btn.prev").style.display = "none";
        document.querySelector(".carousel-btn.next").style.display = "none";
        document.getElementById("dialogText").innerHTML =
            "Nenhum favorito salvo ainda.";
        document.getElementById("statValue").textContent = "--";
        return;
    }

    pokemons = await Promise.all(salvos.map(id => buscarPokemon(id).catch(() => null)));
    pokemons = pokemons.filter(Boolean);

    if (pokemons.length > 0) renderTudo();
}

function renderTudo() {
    const p = pokemons[pokeAtual];


    document.getElementById("pokemonImg").src = p.sprite;
    document.getElementById("pokemonImg").alt = p.name;


    document.getElementById("pokeName").textContent = p.name.toUpperCase();

    const btnDesfav = document.getElementById("btnDesfav");
    btnDesfav.classList.remove("removido");
    btnDesfav.onclick = () => desfavoritar(p.id);

    const tiposEl = document.getElementById("pokeTypes");
    tiposEl.innerHTML = "";
    p.tipos.forEach(t => {
        if (TIPO_ICONE[t]) {
            const img = document.createElement("img");
            img.src = TIPO_ICONE[t]; img.alt = t;
            tiposEl.appendChild(img);
        }
    });

    document.getElementById("dialogText").innerHTML = MSGS[pokeAtual % MSGS.length](p);

    document.querySelector(".battle-scene").style.background = gradienteDeTipos(p.tipos)
        .replace("linear-gradient(to right,", "linear-gradient(to bottom,")
        + ", " + "transparent";

    document.querySelector(".battle-scene").style.background = "";

    renderStat();
    renderDotsPoke();
    renderDotsStat();
}

function renderStat() {
    const p = pokemons[pokeAtual];
    const s = STATS[statAtual];
    const val = p[s.key] ?? "--";
    document.getElementById("statLabel").textContent    = s.label;
    document.getElementById("statValue").textContent    = val;
    document.getElementById("statBar").style.width      = `${((val || 0) / 255) * 100}%`;
    document.getElementById("statBar").style.background = s.cor;
    document.querySelectorAll(".stat-dot").forEach((d, i) =>
        d.classList.toggle("active", i === statAtual));
}

function renderDotsPoke() {
    const pd = document.getElementById("pokeDots");
    pd.innerHTML = "";
    pokemons.forEach((_, i) => {
        const d = document.createElement("div");
        d.classList.add("poke-dot");
        if (i === pokeAtual) d.classList.add("active");
        d.onclick = () => irPara(i);
        pd.appendChild(d);
    });
}

function renderDotsStat() {
    const sd = document.getElementById("statDots");
    sd.innerHTML = "";
    STATS.forEach((_, i) => {
        const d = document.createElement("div");
        d.classList.add("stat-dot");
        if (i === statAtual) d.classList.add("active");
        d.onclick = () => { statAtual = i; renderStat(); };
        sd.appendChild(d);
    });
}

function irPara(i) {
    if (pokemons.length === 0) return;
    const el = document.getElementById("pokemonCenter");
    el.classList.add("saindo");
    setTimeout(() => {
        pokeAtual = i; statAtual = 0;
        el.classList.remove("saindo");
        el.classList.add("entrando");
        renderTudo();
        requestAnimationFrame(() => requestAnimationFrame(() => el.classList.remove("entrando")));
    }, 280);
}

function pokeProximo()  { irPara((pokeAtual + 1) % pokemons.length); }
function pokeAnterior() { irPara((pokeAtual - 1 + pokemons.length) % pokemons.length); }
function statProximo()  { statAtual = (statAtual + 1) % STATS.length; renderStat(); }
function statAnterior() { statAtual = (statAtual - 1 + STATS.length) % STATS.length; renderStat(); }

document.addEventListener("keydown", e => {
    if (e.key === "ArrowRight") pokeProximo();
    if (e.key === "ArrowLeft")  pokeAnterior();
    if (e.key === "ArrowUp")    statAnterior();
    if (e.key === "ArrowDown")  statProximo();
});

function desfavoritar(pokemonId) {
    const logado   = localStorage.getItem("missingmon_logado");
    const usuarios = JSON.parse(localStorage.getItem("missingmon_usuarios") || "{}");
    if (!logado || !usuarios[logado]) return;

    const salvos = usuarios[logado].salvos || [];
    const idx    = salvos.indexOf(pokemonId);
    if (idx === -1) return;

    const btn = document.getElementById("btnDesfav");
    btn.classList.add("removido");

    salvos.splice(idx, 1);
    usuarios[logado].salvos = salvos;
    localStorage.setItem("missingmon_usuarios", JSON.stringify(usuarios));

    setTimeout(() => {
        pokemons.splice(pokeAtual, 1);
        if (pokemons.length === 0) {
            document.getElementById("pokemonCenter").style.display = "none";
            document.getElementById("statusEnemy").style.display   = "none";
            document.querySelector(".carousel-btn.prev").style.display = "none";
            document.querySelector(".carousel-btn.next").style.display = "none";
            document.getElementById("pokeDots").innerHTML = "";
            document.getElementById("dialogText").innerHTML =
                "Nenhum favorito salvo ainda.";
            document.getElementById("statValue").textContent = "--";
            document.getElementById("statBar").style.width  = "0%";
            document.getElementById("statDots").innerHTML   = "";
            return;
        }

        if (pokeAtual >= pokemons.length) pokeAtual = pokemons.length - 1;
        statAtual = 0;
        renderTudo();
    }, 400);
}

init();
