from app import app, db, MarketHistory

# On doit se mettre dans le "contexte" de l'application pour accéder à la DB
with app.app_context():
    # La commande SQL équivalente à "SELECT * FROM market_history"
    records = MarketHistory.query.order_by(MarketHistory.date_record.desc()).all()
    
    print(f"--- Il y a {len(records)} enregistrements en base ---")
    
    for record in records:
        print(f"Date : {record.date_record} | Prix : {record.sp500_price}")