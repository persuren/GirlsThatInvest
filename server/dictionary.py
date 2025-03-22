import requests
from bs4 import BeautifulSoup
import re

def get_nasdaq_symbols():
    url = "https://tr.tradingview.com/symbols/NASDAQ-NDX/components/"
    headers = {"User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.124 Safari/537.36"}
    
    response = requests.get(url, headers=headers)
    if response.status_code != 200:
        print(f"Failed to fetch data: {response.status_code}")
        return {}
    
    soup = BeautifulSoup(response.text, "html.parser")
    pattern = re.compile(r'data-rowkey="NASDAQ:(.*?)"')
    symbols = pattern.findall(str(soup))
    
    symbol_dict = {}
    for symbol in symbols:
        img_tag = soup.find("tr", {"data-rowkey": f"NASDAQ:{symbol}"})
        if img_tag:
            img_src = img_tag.find("img", class_="logo-PsAlMQQF")
            if img_src and 'src' in img_src.attrs:
                symbol_dict[symbol] = img_src['src']
    
    return symbol_dict

# Kullanım
nasdaq_symbols_dict = get_nasdaq_symbols()
nasdaq_symbols = list(nasdaq_symbols_dict.keys())
nasdaq_logos = list(nasdaq_symbols_dict.values())
