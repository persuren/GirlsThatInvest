from flask import Flask, jsonify, request
import threading
import yfinance as yf
import requests
import mysql.connector
import pandas as pd
from dictionary import nasdaq_symbols, get_nasdaq_symbols
from datetime import datetime, timedelta, timezone

app = Flask(__name__)

latest_stock_data = {}  # Sadece en güncel veriyi tutacak


def get_db_connection():
    return mysql.connector.connect(
        host="localhost",
        user="root",
        password="04062002pE",
        database="stock2"
    )


"""def create_or_update_nasdaq_table():
    nasdaq_symbols_dict = get_nasdaq_symbols()  # NASDAQ sembollerini al
    conn = get_db_connection()
    cursor = conn.cursor()
    if symbol != "GOOG":
        cursor.execute('''
            CREATE TABLE IF NOT EXISTS nasdaq_symbols (
                symbol VARCHAR(50) PRIMARY KEY,
                logo TEXT
            )
        ''')

        for symbol, logo in nasdaq_symbols_dict.items():
            cursor.execute('''
                INSERT INTO nasdaq_symbols (symbol, logo) 
                VALUES (%s, %s) 
                ON DUPLICATE KEY UPDATE logo=VALUES(logo)
            ''', (symbol, logo))

    conn.commit()
    conn.close()
"""

stocks = nasdaq_symbols  # İzlenen NASDAQ hisseleri


def fetch_and_store_data():
    global latest_stock_data
    conn = get_db_connection()
    cursor = conn.cursor()

    for symbol in stocks:
        create_table_query = f"""
                CREATE TABLE IF NOT EXISTS `{symbol}` (
                    id INT AUTO_INCREMENT PRIMARY KEY,
                    price DECIMAL(10,2),
                    volume BIGINT,
                    high DECIMAL(10,2),
                    low DECIMAL(10,2),
                    open DECIMAL(10,2),
                    adj_close DECIMAL(10,2),
                    timestamp DATETIME UNIQUE
                )
            """
        cursor.execute(create_table_query)
        try:
            data = yf.download(symbol, period='3d', interval='1m')
            data.index = data.index.tz_convert('UTC') if data.index.tz is not None else data.index.tz_localize('UTC')
            start_time = pd.Timestamp.now(tz=data.index.tz) - timedelta(days=3)
            data = data[data.index >= start_time]
            if data.empty:
                print(f"{symbol} için son 3 günlük veri bulunamadı!")
                continue
            latest_entry = None
            rows_to_insert = []
            for index, row in data.iterrows():
                try:
                    price = float(row['Close'].item())
                    volume = int(row['Volume'].item())
                    high = float(row['High'].item())
                    low = float(row['Low'].item())
                    open_value = float(row['Open'].item())
                    adj_close = float(row['Close'].item())
                    timestamp = index.strftime("%Y-%m-%d %H:%M:%S")
                    rows_to_insert.append((price, volume, high, low, open_value, adj_close, timestamp))
                    latest_entry = {
                        "symbol": symbol,
                        "price": price,
                        "volume": volume,
                        "high": high,
                        "low": low,
                        "open": open_value,
                        "adj_close": adj_close,
                        "timestamp": timestamp
                    }
                except Exception as e:
                    print(f"Satır işlenirken hata oluştu: {e}")
            if rows_to_insert:
                insert_query = f"""
                    INSERT INTO `{symbol}` (price, volume, high, low, open, adj_close, timestamp) 
                    VALUES (%s, %s, %s, %s, %s, %s, %s)
                    ON DUPLICATE KEY UPDATE 
                        price = VALUES(price), 
                        volume = VALUES(volume),
                        high = VALUES(high),
                        low = VALUES(low),
                        open = VALUES(open),
                        adj_close = VALUES(adj_close)
                """
                cursor.executemany(insert_query, rows_to_insert)
            if latest_entry:
                latest_stock_data[symbol] = latest_entry
        except Exception as e:
            print(f"Hata oluştu ({symbol}): {e}")
    conn.commit()
    cursor.close()
    conn.close()
    print("Veriler başarıyla güncellendi.")


@app.route('/fetch_data', methods=['GET'])
def fetch_data_api():
    threading.Thread(target=fetch_and_store_data).start()
    return jsonify({"message": "Veri çekme işlemi başlatıldı, arka planda çalışıyor!"})


@app.route('/get_stock_data', methods=['GET'])
def get_stock_data():
    conn = get_db_connection()
    cursor = conn.cursor()
    latest_data = []
    for symbol in stocks:
        cursor.execute(f"SELECT * FROM `{symbol}` ORDER BY timestamp DESC LIMIT 1")
        row = cursor.fetchone()
        if row:
            latest_data.append({
                "symbol": symbol,
                "price": row[1],
                "volume": row[2],
                "high": row[3],
                "low": row[4],
                "open": row[5],
                "adj_close": row[6],
                "timestamp": row[7]
            })
    cursor.close()
    conn.close()
    return jsonify({"data": latest_data})

@app.route('/get_stock_history/<symbol>', methods=['GET'])
def get_stock_history(symbol):
    conn = get_db_connection()
    cursor = conn.cursor(dictionary=True)
    try:
        chart_type = request.args.get('type', 'minute')
        
        if chart_type == 'minute':
            query = f"SELECT * FROM `{symbol}` ORDER BY timestamp DESC"
            cursor.execute(query)
            data = cursor.fetchall()
        else:
            # En son dakikalık veriyi al
            latest_minute_query = f"SELECT * FROM `{symbol}` ORDER BY timestamp DESC LIMIT 1"
            cursor.execute(latest_minute_query)
            latest_minute_data = cursor.fetchone()
            
            # Saatlik veriler için
            query = f"""
                SELECT 
                    DATE_FORMAT(timestamp, '%Y-%m-%d %H:00:00') as hour,
                    MIN(low) as low,
                    MAX(high) as high,
                    SUBSTRING_INDEX(GROUP_CONCAT(open ORDER BY timestamp), ',', 1) as open,
                    SUBSTRING_INDEX(GROUP_CONCAT(adj_close ORDER BY timestamp DESC), ',', 1) as adj_close,
                    SUM(volume) as volume
                FROM `{symbol}`
                GROUP BY DATE_FORMAT(timestamp, '%Y-%m-%d %H:00:00')
                ORDER BY hour DESC
            """
            cursor.execute(query)
            data = cursor.fetchall()
            
            # Verileri orijinal formata dönüştür
            formatted_data = []
            for row in data:
                formatted_data.append({
                    'timestamp': row['hour'],
                    'low': float(row['low']),
                    'high': float(row['high']),
                    'open': float(row['open']),
                    'adj_close': float(row['adj_close']),
                    'volume': int(row['volume'])
                })
            
            # En son dakikalık veriyi ekle
            if latest_minute_data:
                formatted_data.insert(0, {
                    'timestamp': latest_minute_data['timestamp'],
                    'low': float(latest_minute_data['low']),
                    'high': float(latest_minute_data['high']),
                    'open': float(latest_minute_data['open']),
                    'adj_close': float(latest_minute_data['adj_close']),
                    'volume': int(latest_minute_data['volume'])
                })
            
            data = formatted_data

        if not data:
            return jsonify({"error": "No data found for the given stock symbol."}), 404
        return jsonify(data)
    except Exception as e:
        return jsonify({"error": str(e)}), 500
    finally:
        cursor.close()
        conn.close()

@app.route('/get_stock_logo/<symbol>', methods=['GET'])
def get_stock_logo(symbol):
    conn = get_db_connection()
    cursor = conn.cursor(dictionary=True)
    try:
        query = "SELECT logo FROM nasdaq_symbols WHERE symbol = %s"
        cursor.execute(query, (symbol,))
        data = cursor.fetchone()
        if not data:
            return jsonify({"error": "No logo found for the given stock symbol."}), 404
        return jsonify(data)
    except Exception as e:
        return jsonify({"error": str(e)}), 500
    finally:
        cursor.close()
        conn.close()
@app.route('/get_stock_news/<symbol>', methods=['GET'])
def get_stock_news(symbol):
    api_key = "e84d7f84035f46e5ba0704fc9f44c300"
    url = f"https://newsapi.org/v2/everything?q={symbol}&apiKey={api_key}&pageSize=5"
    try:
        response = requests.get(url)
        if response.status_code != 200:
            return jsonify({"error": "Failed to fetch news"}), 500
        news_data = response.json()
        articles = news_data.get("articles", [])
        if not articles:
            return jsonify({"error": "No news found for this stock."}), 404
        latest_news = []
        for article in articles:
            latest_news.append({
                "title": article["title"],
                "link": article["url"]
            })
        return jsonify({"symbol": symbol, "news": latest_news})
    except Exception as e:
        return jsonify({"error": str(e)}), 500

# Kullanıcı tablosunu oluştur (varsa atla)
def create_users_table():
    conn = get_db_connection()
    cursor = conn.cursor()
    cursor.execute('''
        CREATE TABLE IF NOT EXISTS users (
            id INT AUTO_INCREMENT PRIMARY KEY,
            username VARCHAR(255) UNIQUE NOT NULL,
            email VARCHAR(255) UNIQUE NOT NULL,
            password VARCHAR(255) NOT NULL
        )
    ''')
    conn.commit()
    cursor.close()
    conn.close()

create_users_table()

@app.route('/register', methods=['POST'])
def register():
    data = request.get_json()
    username = data.get('username')
    email = data.get('email')
    password = data.get('password')
    if not username or not email or not password:
        return jsonify({'error': 'Kullanıcı adı, e-posta ve şifre zorunlu!'}), 400
    conn = get_db_connection()
    cursor = conn.cursor()
    try:
        cursor.execute('SELECT id FROM users WHERE username = %s', (username,))
        if cursor.fetchone():
            return jsonify({'error': 'Bu kullanıcı adı zaten alınmış!'}), 409
        cursor.execute('SELECT id FROM users WHERE email = %s', (email,))
        if cursor.fetchone():
            return jsonify({'error': 'Bu e-posta adresi zaten alınmış!'}), 409
        cursor.execute('INSERT INTO users (username, email, password) VALUES (%s, %s, %s)', (username, email, password))
        conn.commit()
        return jsonify({'message': 'Kayıt başarılı!'}), 201
    except Exception as e:
        return jsonify({'error': str(e)}), 500
    finally:
        cursor.close()
        conn.close()

@app.route('/login', methods=['POST'])
def login():
    data = request.get_json()
    username = data.get('username')
    password = data.get('password')
    if not username or not password:
        return jsonify({'error': 'Kullanıcı adı ve şifre zorunlu!'}), 400
    conn = get_db_connection()
    cursor = conn.cursor()
    try:
        cursor.execute('SELECT id FROM users WHERE username = %s AND password = %s', (username, password))
        user = cursor.fetchone()
        if user:
            return jsonify({'message': 'Giriş başarılı!'}), 200
        else:
            return jsonify({'error': 'Kullanıcı adı veya şifre hatalı!'}), 401
    except Exception as e:
        return jsonify({'error': str(e)}), 500
    finally:
        cursor.close()
        conn.close()

if __name__ == '__main__':
    threading.Thread(target=fetch_and_store_data).start()
    app.run(host="0.0.0.0", port=5001, debug=True)
