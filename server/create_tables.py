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

            # Son 7 günlük veriyi al (saatlik veriler için yeterli veri olsun)
            data = yf.download(symbol, period='7d', interval='1m')
            if data.empty:
                print(f"{symbol} için veri bulunamadı!")
                continue

            # Zaman dilimini UTC'ye çevir
            data.index = data.index.tz_convert('UTC') if data.index.tz is not None else data.index.tz_localize('UTC')
            
            # NaN değerleri forward fill ile doldur
            data = data.ffill().bfill()  # Önce forward fill, sonra backward fill ile kalan boşlukları doldur
            
            # Sadece market saatlerindeki verileri al (9:30 - 16:00 ET)
            data = data.between_time('14:30', '21:00')  # UTC'de market saatleri
            
            if data.empty:
                print(f"{symbol} için market saatlerinde veri bulunamadı!")
                continue

            # Eski verileri temizle (7 günden eski)
            cursor.execute(f"""
                DELETE FROM `{symbol}` 
                WHERE timestamp < DATE_SUB(NOW(), INTERVAL 7 DAY)
            """)

            rows_to_insert = []
            latest_entry = None
            
            for index, row in data.iterrows():
                try:
                    # Veri doğrulama
                    if any(pd.isna(val) for val in [row['Close'], row['Volume'], row['High'], row['Low'], row['Open']]):
                        continue
                        
                    price = float(row['Close'])
                    volume = int(row['Volume'])
                    high = float(row['High'])
                    low = float(row['Low'])
                    open_value = float(row['Open'])
                    adj_close = float(row['Close'])
                    timestamp = index.strftime("%Y-%m-%d %H:%M:%S")

                    # Veri tutarlılık kontrolü
                    if not (low <= price <= high and low <= open_value <= high):
                        continue

                    rows_to_insert.append((price, volume, high, low, open_value, adj_close, timestamp))
                    
                    if not latest_entry or index > latest_entry['timestamp']:
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
                except (ValueError, KeyError) as e:
                    print(f"Satır işlenirken hata oluştu ({symbol}, {index}): {e}")
                    continue

            if rows_to_insert:
                try:
                    # Yeni verileri ekle veya güncelle
                    insert_query = f"""
                        INSERT INTO `{symbol}` 
                        (price, volume, high, low, open, adj_close, timestamp) 
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
                    print(f"Veri eklenirken hata oluştu ({symbol}): {e}")
                    continue
                    
        except Exception as e:
            print(f"Hata oluştu ({symbol}): {e}")
            continue

    conn.commit()
    cursor.close()
    conn.close()
    print("Veriler başarıyla güncellendi.")

fetch_and_store_data()
