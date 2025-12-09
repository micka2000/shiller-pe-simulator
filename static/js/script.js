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

    // Faire apparaître la boîte (modification de la classe CSS)
    resultArea.classList.add("result-visible");
}