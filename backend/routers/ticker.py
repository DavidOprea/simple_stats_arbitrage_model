from fastapi import APIRouter, HTTPException, status
from pydantic import BaseModel
import yfinance as yf
from functions import calculate_cointegration, normalize_spread

class TickerRequest(BaseModel):
    tickerA: str
    tickerB: str
    startDate: str
    endDate: str

router = APIRouter()

@router.post("/ticker")
async def get_ticker(request: TickerRequest):
    tickerA = request.tickerA
    tickerB = request.tickerB
    tickers_data = yf.download([tickerA, tickerB], start=request.startDate, end=request.endDate, auto_adjust=True, group_by="ticker").dropna()
    if yf.Ticker(tickerA).info.get("regularMarketPrice") is None or yf.Ticker(tickerB).info.get("regularMarketPrice") is None:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail=f"Ticker '{request.tickerA}' or '{request.tickerB}' not found or has no data"
        )
    else:
        tickerA_data = tickers_data[tickerA]
        tickerB_data = tickers_data[tickerB]
        spread, hedge_ratio, p_value = calculate_cointegration(tickerA_data, tickerB_data)
        normalized_spread = normalize_spread(spread)
        data = {"StockA": [], "StockB": [], "Spread": [], "HedgeRatio": hedge_ratio, "PValue": p_value}
        for index, row in tickerA_data.iterrows():
            data["StockA"].append({
                'time': index.strftime('%Y-%m-%d'),
                'value': row['Close'].item()
            })
        for index, row in tickerB_data.iterrows():
            data["StockB"].append({
                'time': index.strftime('%Y-%m-%d'),
                'value': row['Close'].item()
            })
        for index, value in normalized_spread.items():
            data["Spread"].append({
                'time': index.strftime('%Y-%m-%d'),
                'value': value
            })
        return {'data': data}