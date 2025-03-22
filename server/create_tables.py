import mysql.connector
import yfinance as yf
from dictionary import nasdaq_symbols, get_nasdaq_symbols  # Varsayımsal dictionary.py
from datetime import datetime, timedelta
import pandas as pd

latest_stock_data = {}  # Global değişkeni tanımla

# 📌 Veritabanı bağlantısını açan fonksiyon
def get_db_connection():
    return mysql.connector.connect(
        host="localhost",
        user="root",
        password="04062002pE",
        database="stock2"
    )

stocks = nasdaq_symbols  # İzlenen NASDAQ hisseleri

def fetch_and_store_data():
    global latest_stock_data
    conn = get_db_connection()
    cursor = conn.cursor()

    for symbol in stocks:
        print(f"Fetching data for {symbol}...")
        try:
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
            print(f"Tablo oluşturuldu: stock2.{symbol}")

            data = yf.download(symbol, period='5d', interval='1m')
            if data.empty:
                print(f"{symbol} için veri bulunamadı!")
                continue

            # Zaman dilimi kontrolü (gerekirse)
            data.index = data.index.tz_localize(None)

            now = datetime.now()
            start_time = now - timedelta(days=1)
            data = data[data.index >= start_time]

            if data.empty:
                print(f"{symbol} için son 24 saatlik veri bulunamadı!")
                continue

            rows_to_insert = []
            for index, row in data.iterrows():
                try:
                    price = float(row['Close'])
                    volume = int(row['Volume'])
                    high = float(row['High'])
                    low = float(row['Low'])
                    open_value = float(row['Open'])
                    adj_close = float(row['Close'])
                    timestamp = index.strftime("%Y-%m-%d %H:%M:%S")

                    rows_to_insert.append((price, volume, high, low, open_value, adj_close, timestamp))
                    latest_stock_data[symbol] = {
                        "symbol": symbol,
                        "price": price,
                        "volume": volume,
                        "high": high,
                        "low": low,
                        "open": open_value,
                        "adj_close": adj_close,
                        "timestamp": timestamp
                    }
                except (ValueError, KeyError) as e:
                    print(f"Satır işlenirken hata oluştu ({symbol}): {e}")

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

        except mysql.connector.Error as db_err:
            print(f"Veritabanı hatası ({symbol}): {db_err}")
        except Exception as e:
            print(f"Genel hata ({symbol}): {e}")

    conn.commit()
    cursor.close()
    conn.close()
    print("Veriler başarıyla güncellendi.")

fetch_and_store_data()
