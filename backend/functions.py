import pandas as pd
import numpy as np
import yfinance as yf
import requests
from io import StringIO
import statsmodels.api as sm
from statsmodels.tsa.stattools import coint
from itertools import combinations

def get_sp500_tickers_by_sector(target_sector):
    url = 'https://en.wikipedia.org/wiki/List_of_S%26P_500_companies'
    headers = {'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/58.0.3029.110 Safari/537.3'}
    response = requests.get(url, headers=headers)
    tables = pd.read_html(StringIO(response.text))
    df = tables[0]
    sector_tickers = df[df['GICS Sector'] == target_sector]['Symbol'].tolist()
    sector_tickers = [ticker.replace('.', '-') for ticker in sector_tickers]
    return sector_tickers

def normalize_spread(spread):
    rolling_mean = spread.expanding().mean()
    rolling_std = spread.expanding().std()

    z_score = (spread - rolling_mean) / rolling_std

    return z_score.dropna()


def calculate_cointegration(stockA, stockB):
    Y = np.log(stockB['Close'])
    X = np.log(stockA['Close'])
    
    # Align data
    aligned = pd.DataFrame({'Y': Y, 'X': X}).dropna()
    
    corr = aligned['X'].corr(aligned['Y'])
    if abs(corr) > 0.985:  # Adjust threshold (0.98 to 0.995)
        # Stocks are too similar - skip cointegration
        return None, None, None
    
    try:
        t_stat, p_value, critical_values = coint(aligned['Y'], aligned['X'], autolag='AIC')
        if (np.isnan(p_value) or np.isinf(p_value) or 
            np.isnan(t_stat) or np.isinf(t_stat)):
            return None, None, None

        X_with_const = sm.add_constant(X)
        ols_result = sm.OLS(Y, X_with_const).fit()
        hedge_ratio = ols_result.params.iloc[1]

        if np.isnan(hedge_ratio) or np.isinf(hedge_ratio):
            return None, None, None

        spread = ols_result.resid

        # print(f'Cointegration test p-value: {p_value}')
        # print(f'Hedge Ratio: {hedge_ratio}')
        # print(f'Spread head:\n{spread.head()}')

        return spread, hedge_ratio, p_value
    except Exception as e:
        return None, None, None

def find_best_pairs(sector_tickers, start_date, end_date, num_rows=0):
    data = yf.download(sector_tickers, start=start_date, end=end_date, group_by='ticker', auto_adjust=True)
    valid_tickers = data.columns.get_level_values(0).unique().tolist()

    ticker_pairs = list(combinations(valid_tickers, 2))
    best_pairs = []

    for t1, t2 in ticker_pairs:
        if t1 == t2:
            continue
        stockA = data[t1]
        stockB = data[t2]
        spread, hedge_ratio, p_value = calculate_cointegration(stockA, stockB)
        if p_value is not None:
            best_pairs.append((p_value, t1, t2, hedge_ratio))
    best_pairs.sort(key=lambda x: x[0])
    return best_pairs[:num_rows]

def evaluate_pairs_trade(long_position, short_position):
    """Evaluate if a pairs trade is working"""
    
    # Calculate price returns (not P&L returns)
    long_price_return = (float(long_position.current_price) - float(long_position.avg_entry_price)) / float(long_position.avg_entry_price)
    short_price_return = (float(short_position.current_price) - float(short_position.avg_entry_price)) / float(short_position.avg_entry_price)
    
    # Spread = Long price return - Short price return
    # For convergence: long goes DOWN relative to short (spread gets smaller)
    spread_return = long_price_return - short_price_return
    
    # P&L calculations (separate from price returns)
    long_pl = float(long_position.unrealized_pl)
    short_pl = float(short_position.unrealized_pl)
    net_pl = long_pl + short_pl
    
    return {
        "long_symbol": long_position.symbol,
        "long_price_return": long_price_return,
        "long_pl": long_pl,
        "short_symbol": short_position.symbol,
        "short_price_return": short_price_return,
        "short_pl": short_pl,
        "net_pl": net_pl,
        "spread_return": spread_return,
        "trade_working": net_pl > 0  # Ultimately, we care about profit
    }