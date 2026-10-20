// Remplacée par la moyenne calculée sur les données quand elles sont chargées
let HISTORICAL_AVERAGE = 17;

function calculateCAPE() {
    // 1. Récupération des valeurs
    let priceInput = document.getElementById("inputPrice");
    let earningsInput = document.getElementById("inputEarnings");
    
    let price = parseFloat(priceInput.value);
    let earnings = parseFloat(earningsInput.value);
    
    // 2. Vérification des erreurs
    // On vérifie si ce ne sont pas des nombres (isNaN) ou si le bénéfice est 0
    if (isNaN(price) || isNaN(earnings) || earnings === 0) {
        alert("Veuillez entrer des chiffres valides (et pas de bénéfice à 0).");
        return;
    }

    // 3. Calcul
    let ratio = price / earnings;
    let finalRatio = Math.round(ratio * 100) / 100; // Arrondi 2 décimales

    // 4. Logique de couleur et texte
    let message = "";
    let color = "";

    if (finalRatio < 15) {
        message = "Excellent ! C'est une valorisation historiquement basse.";
        color = "#28CD41"; // Vert
    } else if (finalRatio >= 15 && finalRatio <= 25) {
        message = "Le prix semble juste (Fair Value).";
        color = "#FF9500"; // Orange
    } else {
        message = "Attention, le prix est élevé par rapport aux bénéfices.";
        color = "#FF3B30"; // Rouge
    }

    // 5. Affichage
    let resultArea = document.getElementById("resultArea");
    let resultValue = document.getElementById("resultValue");
    let resultText = document.getElementById("resultText");

    resultValue.innerText = finalRatio;
    resultValue.style.color = color;
    resultText.innerText = message;

    // Position par rapport à la moyenne historique
    let gap = Math.round((finalRatio / HISTORICAL_AVERAGE - 1) * 100);
    let compare = gap >= 0 ? gap + " % au-dessus" : Math.abs(gap) + " % en dessous";
    document.getElementById("resultCompare").innerText = compare + " de la moyenne historique (" + HISTORICAL_AVERAGE + ").";

    // Faire apparaître la boîte (modification de la classe CSS)
    resultArea.classList.add("result-visible");
}

// --- DONNÉES ---

// Shiller PE du S&P 500 aux grands pics et creux (multpl.com)
const HISTORY = [
    { year: "1929", month: "1929-09", event: "Avant le krach", value: 32.56 },
    { year: "1932", month: "1932-06", event: "Grande Dépression", value: 5.57 },
    { year: "1966", month: "1966-01", event: "Pic des années 60", value: 24.06 },
    { year: "1982", month: "1982-07", event: "Creux des années 80", value: 6.64 },
    { year: "2000", month: "1999-12", event: "Bulle Internet", value: 44.19 },
    { year: "2009", month: "2009-03", event: "Crise de 2008", value: 13.32 },
    { year: "2021", month: "2021-11", event: "Pic post-Covid", value: 38.58 }
];

// Ratios PE par pays (présentation Shiller PE)
const REGIONS = [
    { name: "Amériques", color: "#2a78d6", countries: [["États-Unis", 32.87], ["Canada", 22.89]] },
    { name: "Europe", color: "#eb6834", countries: [["Allemagne", 24.32], ["Espagne", 19.92], ["Italie", 19.71], ["Royaume-Uni", 18.59]] },
    { name: "Asie", color: "#1baf7a", countries: [["Inde", 35.76], ["Japon", 24.99], ["Corée du Sud", 15.76], ["Chine", 15.41], ["Hong Kong", 10.25]] },
    { name: "Océanie", color: "#eda100", countries: [["Australie", 21.16]] }
];

const fmt = (v) => v.toLocaleString("fr-FR", { minimumFractionDigits: 1, maximumFractionDigits: 2 });


// --- INFOBULLE ---

const tooltip = document.getElementById("tooltip");

function attachTooltip(el, html) {
    const show = (x, y) => {
        tooltip.innerHTML = html;
        tooltip.classList.add("tooltip-visible");
        const w = tooltip.offsetWidth;
        tooltip.style.left = Math.min(Math.max(8, x - w / 2), window.innerWidth - w - 8) + "px";
        tooltip.style.top = (y - tooltip.offsetHeight - 12) + "px";
    };
    el.addEventListener("mousemove", (e) => show(e.clientX, e.clientY));
    el.addEventListener("mouseleave", () => tooltip.classList.remove("tooltip-visible"));
    el.addEventListener("focus", () => {
        const r = el.getBoundingClientRect();
        show(r.left + r.width / 2, r.top);
    });
    el.addEventListener("blur", () => tooltip.classList.remove("tooltip-visible"));
}


// --- GRAPHIQUE HISTORIQUE (colonnes) ---

function renderHistory() {
    const root = document.getElementById("historyChart");
    const max = 50;
    const pct = (v) => (v / max) * 100;

    let html = '<div class="cols">';
    html += '<div class="ref-line" style="bottom:' + pct(HISTORICAL_AVERAGE) + '%"><span>Moyenne ' + HISTORICAL_AVERAGE + '</span></div>';
    HISTORY.forEach((d, i) => {
        html += '<div class="col-slot" tabindex="0" data-i="' + i + '">' +
            '<span class="col-value">' + fmt(d.value) + '</span>' +
            '<div class="col-bar" style="height:' + pct(d.value) + '%"></div>' +
            '</div>';
    });
    html += '</div><div class="col-labels">';
    HISTORY.forEach((d) => {
        html += '<div><strong>' + d.year + '</strong><span>' + d.event + '</span></div>';
    });
    html += '</div>';
    root.innerHTML = html;

    root.querySelectorAll(".col-slot").forEach((el) => {
        const d = HISTORY[el.dataset.i];
        const gap = Math.round((d.value / HISTORICAL_AVERAGE - 1) * 100);
        attachTooltip(el, '<strong>' + d.year + ' · ' + d.event + '</strong><br>Shiller PE : ' + fmt(d.value) +
            '<br>' + (gap >= 0 ? '+' : '') + gap + ' % vs moyenne');
    });

    document.getElementById("historyTable").innerHTML =
        '<thead><tr><th>Année</th><th>Contexte</th><th>Shiller PE</th></tr></thead><tbody>' +
        HISTORY.map((d) => '<tr><td>' + d.year + '</td><td>' + d.event + '</td><td>' + fmt(d.value) + '</td></tr>').join("") +
        '</tbody>';
}


// --- GRAPHIQUE MONDE (barres horizontales groupées) ---

function renderWorld() {
    const max = 45;
    const pct = (v) => (v / max) * 100;

    document.getElementById("worldLegend").innerHTML = REGIONS.map((r) =>
        '<span class="legend-item"><i style="background:' + r.color + '"></i>' + r.name + '</span>'
    ).join("");

    let html = "";
    REGIONS.forEach((r) => {
        html += '<div class="region"><div class="region-name">' + r.name + '</div>';
        r.countries.forEach(([country, value]) => {
            html += '<div class="hbar-row" tabindex="0" data-tip="' + r.name + '|' + country + '|' + value + '">' +
                '<span class="hbar-label">' + country + '</span>' +
                '<div class="hbar-track">' +
                '<div class="hbar-ref" style="left:' + pct(HISTORICAL_AVERAGE) + '%"></div>' +
                '<div class="hbar" style="width:' + pct(value) + '%;background:' + r.color + '"></div>' +
                '<span class="hbar-value">' + fmt(value) + '</span>' +
                '</div></div>';
        });
        html += '</div>';
    });
    document.getElementById("worldChart").innerHTML = html;

    document.querySelectorAll(".hbar-row").forEach((el) => {
        const [region, country, value] = el.dataset.tip.split("|");
        attachTooltip(el, '<strong>' + country + '</strong> · ' + region + '<br>PE : ' + fmt(parseFloat(value)));
        // La valeur suit la fin de la barre
        el.querySelector(".hbar-value").style.left = "calc(" + pct(parseFloat(value)) + "% + 8px)";
    });

    document.getElementById("worldTable").innerHTML =
        '<thead><tr><th>Région</th><th>Pays</th><th>PE</th></tr></thead><tbody>' +
        REGIONS.flatMap((r) => r.countries.map(([c, v]) => '<tr><td>' + r.name + '</td><td>' + c + '</td><td>' + fmt(v) + '</td></tr>')).join("") +
        '</tbody>';
}

// --- DONNÉES DU JOUR (docs/data/market.json, mis à jour par une GitHub Action) ---

const MONTH_NAMES = ["janv.", "févr.", "mars", "avr.", "mai", "juin", "juil.", "août", "sept.", "oct.", "nov.", "déc."];
const monthLabel = (ym) => MONTH_NAMES[parseInt(ym.slice(5, 7), 10) - 1] + " " + ym.slice(0, 4);
const dateLabel = (iso) => new Date(iso + "T12:00:00Z").toLocaleDateString("fr-FR", { day: "numeric", month: "long", year: "numeric" });

function capeStatus(v) {
    if (v < 15) return { text: "Marché bon marché", cls: "green" };
    if (v <= 25) return { text: "Zone d'équilibre", cls: "orange" };
    return { text: "Marché surévalué", cls: "red" };
}

function renderLive(data) {
    const cape = data.cape.current;
    const status = capeStatus(cape);
    const gap = Math.round((cape / HISTORICAL_AVERAGE - 1) * 100);

    document.getElementById("liveCape").innerText = fmt(cape);
    const statusEl = document.getElementById("liveStatus");
    statusEl.innerHTML = '<span class="status-dot ' + status.cls + '"></span>' + status.text;
    document.getElementById("liveGap").innerText = (gap >= 0 ? "+" : "") + gap + " %";
    document.getElementById("livePrice").innerText = data.sp500.price.toLocaleString("fr-FR", { maximumFractionDigits: 2 });
    document.getElementById("liveE10").innerText = fmt(data.e10);
    document.getElementById("liveSource").innerText = "Données du " + dateLabel(data.cape.date) +
        ". Moyenne historique : " + fmt(HISTORICAL_AVERAGE) + " (depuis 1871). Sources : multpl.com, Yahoo Finance.";
    document.getElementById("liveCard").hidden = false;

    // Le simulateur part des valeurs du jour
    document.getElementById("inputPrice").value = data.sp500.price;
    document.getElementById("inputEarnings").value = data.e10;
    document.getElementById("simulatorIntro").innerText =
        "Pré-rempli avec les valeurs du " + dateLabel(data.sp500.date) + ". Modifiez le prix ou les bénéfices pour tester un scénario.";
}


// --- COURBE COMPLÈTE DEPUIS 1871 ---

function renderHistoryLine(history) {
    const root = document.getElementById("historyChart");
    const W = Math.max(root.clientWidth, 280);
    const H = W < 500 ? 240 : 320;
    const pad = { top: 28, right: 12, bottom: 28, left: 32 };
    const max = Math.ceil(Math.max(...history.map((d) => d[1])) / 10) * 10;
    const x = (i) => pad.left + (i / (history.length - 1)) * (W - pad.left - pad.right);
    const y = (v) => pad.top + (1 - v / max) * (H - pad.top - pad.bottom);
    const index = new Map(history.map((d, i) => [d[0], i]));

    let svg = '<svg width="' + W + '" height="' + H + '" viewBox="0 0 ' + W + ' ' + H + '">';

    // Grille et axe Y
    for (let v = 10; v <= max; v += 10) {
        svg += '<line class="grid-line" x1="' + pad.left + '" x2="' + (W - pad.right) + '" y1="' + y(v) + '" y2="' + y(v) + '"/>';
        svg += '<text class="axis-label" x="' + (pad.left - 6) + '" y="' + (y(v) + 4) + '" text-anchor="end">' + v + '</text>';
    }
    svg += '<line class="baseline" x1="' + pad.left + '" x2="' + (W - pad.right) + '" y1="' + y(0) + '" y2="' + y(0) + '"/>';

    // Axe X : une graduation tous les 25 ans (50 sur petit écran)
    const step = W < 500 ? 50 : 25;
    history.forEach((d, i) => {
        const year = parseInt(d[0].slice(0, 4), 10);
        if (d[0].endsWith("-01") && year % step === 0) {
            svg += '<text class="axis-label" x="' + x(i) + '" y="' + (H - 8) + '" text-anchor="middle">' + year + '</text>';
        }
    });

    // Moyenne
    svg += '<line class="mean-line" x1="' + pad.left + '" x2="' + (W - pad.right) + '" y1="' + y(HISTORICAL_AVERAGE) + '" y2="' + y(HISTORICAL_AVERAGE) + '"/>';
    svg += '<text class="mean-label" x="' + (pad.left + 6) + '" y="' + (y(HISTORICAL_AVERAGE) - 6) + '">Moyenne ' + fmt(HISTORICAL_AVERAGE) + '</text>';

    // Courbe
    const path = history.map((d, i) => (i ? "L" : "M") + x(i).toFixed(1) + " " + y(d[1]).toFixed(1)).join("");
    svg += '<path class="line" d="' + path + '"/>';

    // Grands rendez-vous et point du jour
    const marks = HISTORY.filter((h) => index.has(h.month)).map((h) => ({ i: index.get(h.month), label: h.year, value: h.value }));
    marks.push({ i: history.length - 1, label: "Auj.", value: history[history.length - 1][1], current: true });
    marks.forEach((m) => {
        const above = m.value > HISTORICAL_AVERAGE;
        svg += '<circle class="mark' + (m.current ? ' mark-current' : '') + '" cx="' + x(m.i) + '" cy="' + y(m.value) + '" r="4.5"/>';
        if (W >= 500 || m.current || m.value > 40) {
            svg += '<text class="mark-label" x="' + x(m.i) + '" y="' + (y(m.value) + (above ? -10 : 18)) + '" text-anchor="' + (m.current ? 'end' : 'middle') + '">' + m.label + '</text>';
        }
    });

    // Réticule
    svg += '<line class="crosshair" id="crosshair" y1="' + pad.top + '" y2="' + y(0) + '"/>';
    svg += '<circle class="crosshair-dot" id="crosshairDot" r="5"/>';
    svg += '<rect class="hit-area" x="' + pad.left + '" y="0" width="' + (W - pad.left - pad.right) + '" height="' + H + '"/>';
    svg += '</svg>';
    root.innerHTML = svg;

    const hit = root.querySelector(".hit-area");
    const cross = root.querySelector("#crosshair");
    const dot = root.querySelector("#crosshairDot");
    const hide = () => { root.classList.remove("hovering"); tooltip.classList.remove("tooltip-visible"); };

    hit.addEventListener("mousemove", (e) => {
        const box = root.getBoundingClientRect();
        const ratio = (e.clientX - box.left - pad.left) / (W - pad.left - pad.right);
        const i = Math.min(history.length - 1, Math.max(0, Math.round(ratio * (history.length - 1))));
        const d = history[i];
        cross.setAttribute("x1", x(i)); cross.setAttribute("x2", x(i));
        dot.setAttribute("cx", x(i)); dot.setAttribute("cy", y(d[1]));
        root.classList.add("hovering");

        const gap = Math.round((d[1] / HISTORICAL_AVERAGE - 1) * 100);
        tooltip.innerHTML = '<strong>' + monthLabel(d[0]) + '</strong><br>Shiller PE : ' + fmt(d[1]) +
            '<br>' + (gap >= 0 ? '+' : '') + gap + ' % vs moyenne';
        tooltip.classList.add("tooltip-visible");
        const w = tooltip.offsetWidth;
        tooltip.style.left = Math.min(Math.max(8, e.clientX - w / 2), window.innerWidth - w - 8) + "px";
        tooltip.style.top = (box.top + y(d[1]) - tooltip.offsetHeight - 14) + "px";
    });
    hit.addEventListener("mouseleave", hide);
}

function renderHistoryTableFull(data) {
    const rows = HISTORY.map((h) => [h.year + " · " + h.event, h.value]);
    rows.push(["Aujourd'hui (" + dateLabel(data.cape.date) + ")", data.cape.current]);
    document.getElementById("historyTable").innerHTML =
        '<thead><tr><th>Moment</th><th>Shiller PE</th></tr></thead><tbody>' +
        rows.map((r) => '<tr><td>' + r[0] + '</td><td>' + fmt(r[1]) + '</td></tr>').join("") +
        '</tbody>';
}

async function loadMarketData() {
    try {
        const response = await fetch("data/market.json", { cache: "no-cache" });
        if (!response.ok) throw new Error(response.status);
        const data = await response.json();

        HISTORICAL_AVERAGE = data.cape.mean;
        renderLive(data);

        document.getElementById("historyHeading").innerText = "150 ans de marché.";
        document.getElementById("historyDesc").innerText =
            "Shiller PE mensuel du S&P 500 depuis 1871. La ligne pointillée marque la moyenne, les points les grands rendez-vous.";
        document.getElementById("historySource").innerText = "Source : multpl.com, d'après les données de Robert Shiller.";
        document.getElementById("historyChart").setAttribute("aria-label",
            "Courbe du Shiller PE du S&P 500 de 1871 à aujourd'hui, actuellement à " + fmt(data.cape.current));
        renderHistoryLine(data.history);
        renderHistoryTableFull(data);
        renderWorld();

        let resizeTimer;
        window.addEventListener("resize", () => {
            clearTimeout(resizeTimer);
            resizeTimer = setTimeout(() => renderHistoryLine(data.history), 150);
        });
    } catch (e) {
        // Sans données (fichier absent, page ouverte en local) : on garde les colonnes
        console.warn("Données du jour indisponibles :", e);
    }
}

renderHistory();
renderWorld();
loadMarketData();
