from flask import Flask, render_template
from flask_sqlalchemy import SQLAlchemy
from datetime import datetime, date
import yfinance as yf

# 1. Initialisation de l'app et de la Base de Données
app = Flask(__name__)
app.config['SQLALCHEMY_DATABASE_URI'] = 'sqlite:///finance.db' # Le fichier sera créé ici
app.config['SQLALCHEMY_TRACK_MODIFICATIONS'] = False

db = SQLAlchemy(app)

# 2. Création du Modèle (Le plan de notre table Excel virtuelle)
class MarketHistory(db.Model):
    id = db.Column(db.Integer, primary_key=True)
    date_record = db.Column(db.Date, nullable=False) # La date du jour
    sp500_price = db.Column(db.Float, nullable=False) # Le prix enregistré

    def __repr__(self):
        return f'<Record {self.date_record}: {self.sp500_price}>'

def get_sp500_price():
    """
    Récupère le prix via fast_info (plus fiable pour le temps réel).
    """
    try:
        ticker = yf.Ticker("^GSPC")
        # fast_info donne souvent un résultat même si le marché est fermé
        price = ticker.fast_info['last_price']
        return round(price, 2)
    except Exception as e:
        print(f"Erreur API Yahoo: {e}")
        return 0.00

def save_price_if_needed(current_price):
    """
    Sauvegarde le prix en base SEULEMENT si on n'a rien enregistré aujourd'hui.
    """
    if current_price <= 0:
        return # On n'enregistre pas les erreurs (0.00)

    today = date.today()
    # On vérifie si on a déjà une ligne pour aujourd'hui
    existing_record = MarketHistory.query.filter_by(date_record=today).first()
    
    if not existing_record:
        # Si non, on crée une nouvelle entrée
        new_record = MarketHistory(date_record=today, sp500_price=current_price)
        db.session.add(new_record)
        db.session.commit()
        print(f"✅ Nouveau prix enregistré pour le {today} : {current_price}")
    else:
        # Si oui, on ne fait rien (ou on pourrait mettre à jour le prix)
        print(f"ℹ️ Prix déjà en base pour aujourd'hui.")

@app.route('/')
def home():
    # 1. Récupération du prix live
    current_price = get_sp500_price()
    
    # 2. Sauvegarde en base de données (Magie !)
    save_price_if_needed(current_price)
    
    # 3. Envoi au template HTML
    return render_template('index.html', sp500_price=current_price)

if __name__ == '__main__':
    # Cette astuce permet de créer la BDD automatiquement au premier lancement
    with app.app_context():
        db.create_all()
        
    app.run(debug=True)