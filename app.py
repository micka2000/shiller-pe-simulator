from flask import Flask, render_template
import yfinance as yf
import numpy as np

# Initialisation de l'application Flask
app = Flask(__name__)

def get_sp500_price():
    """
    Fonction pour récupérer le prix actuel du S&P 500
    via la librairie yfinance.
    """
    try:
        # Le ticker pour le S&P 500 est ^GSPC
        ticker = yf.Ticker("^GSPC")
        
        # On récupère les données de la journée ('1d')
        data = ticker.history(period="1d")
        
        if not data.empty:
            # On prend le dernier prix de fermeture ('Close')
            latest_price = data['Close'].iloc[-1]
            return round(latest_price, 2)
        else:
            return 0.00
            
    except Exception as e:
        print(f"Erreur lors de la récupération du prix : {e}")
        return 0.00

@app.route('/')
def home():
    """
    Route principale (la page d'accueil).
    Elle récupère le prix et l'envoie au HTML.
    """
    # 1. Récupération du prix réel
    current_price = get_sp500_price()
    
    # 2. Envoi du prix à la page index.html via la variable 'sp500_price'
    # Flask va chercher ce fichier DANS le dossier 'templates'
    return render_template('index.html', sp500_price=current_price)

if __name__ == '__main__':
    # Lance le serveur en mode debug (recharge auto si vous changez le code)
    app.run(debug=True)