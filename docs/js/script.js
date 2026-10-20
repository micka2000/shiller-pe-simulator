const HISTORICAL_AVERAGE = 17;

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

// Shiller PE du S&P 500 à quelques pics et creux (valeurs approximatives, multpl.com)
const HISTORY = [
    { year: "1929", event: "Avant le krach", value: 32.6 },
    { year: "1932", event: "Grande Dépression", value: 5.6 },
    { year: "1966", event: "Pic des années 60", value: 24.1 },
    { year: "1982", event: "Creux des années 80", value: 6.6 },
    { year: "2000", event: "Bulle Internet", value: 44.2 },
    { year: "2009", event: "Crise de 2008", value: 13.3 },
    { year: "2021", event: "Pic post-Covid", value: 38.6 }
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

renderHistory();
renderWorld();
