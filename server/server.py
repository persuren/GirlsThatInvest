from flask import Flask, jsonify
import yfinance as yf
import mysql.connector
import pandas as pd

app = Flask(__name__)

def get_db_connection():
    return mysql.connector.connect(
        host="localhost",
        user="root",
        password="04062002pE",
        database="stock_market_db"
    )

stocks = ["AAPL", "META","INTC","SMCI","PLTR", "AMD", "MSFT", "AMZN", "CSCO", "QCOM", "ORCL", "HPQ", "MU", "ADBE", "CRM", "V", "MA", "PYPL", "SQ", "NFLX", "DIS", "CMCSA", "VZ", "TMUS", "TSLA", "NVDA", "F", "T", "GOOGL", "IBM","BCS", "CCL", "RIG","HOOD", "MARA","SOFI"]

@app.route('/fetch_data', methods=['GET'])
def fetch_and_store():
    conn = get_db_connection()
    cursor = conn.cursor()
    data_list = []

    for symbol in stocks:
        print(f"Fetching data for {symbol}...")

        data = yf.download(symbol, period='1d', interval='1m')
        print(data)

        if not data.empty:
            create_table_query = f"""
                CREATE TABLE IF NOT EXISTS `{symbol}` (
                    id INT AUTO_INCREMENT PRIMARY KEY,
                    price DECIMAL(10,2),
                    volume BIGINT,
                    timestamp DATETIME UNIQUE
                )
            """
            cursor.execute(create_table_query)

            for index, row in data.iterrows():
                close_value = row[('Close', symbol)]
                if pd.notna(close_value):
                    price = float(close_value)
                else:
                    price = None

                volume = int(row[('Volume', symbol)]) if pd.notna(row[('Volume', symbol)]) else None
                timestamp = index.to_pydatetime().strftime("%Y-%m-%d %H:%M:%S")  

                insert_query = f"""
                    INSERT INTO `{symbol}` (price, volume, timestamp) 
                    VALUES (%s, %s, %s)
                    ON DUPLICATE KEY UPDATE 
                        price = VALUES(price), 
                        volume = VALUES(volume)
                """
                cursor.execute(insert_query, (price, volume, timestamp))

                data_list.append({"symbol": symbol, "price": price, "volume": volume, "timestamp": timestamp})

    conn.commit()
    cursor.close()
    conn.close()

    return jsonify({"message": "Veriler güncellendi", "data": data_list})

if __name__ == '__main__':
    app.run(host="0.0.0.0", port=5001, debug=True)
