from fastapi import APIRouter
from dotenv import load_dotenv
from functions import evaluate_pairs_trade
from alpaca.trading.client import TradingClient
from alpaca.trading.requests import MarketOrderRequest, GetOrdersRequest
from alpaca.trading.enums import OrderSide, TimeInForce, QueryOrderStatus
from pydantic import BaseModel
from uuid import UUID
import time
import os

load_dotenv()

ALPACA_API_KEY=os.getenv("ALPACA_API_KEY") 
ALPACA_API_SECRET=os.getenv("ALPACA_API_SECRET")
trading_client = TradingClient(ALPACA_API_KEY, ALPACA_API_SECRET, paper=True)

router = APIRouter()

class TraderRequest(BaseModel):
    longSymbol: str
    shortSymbol: str

@router.get("/trade/all")
async def get_all_trades_endpoint():
    return trading_client.get_all_positions()

@router.get("/trade/analyze")
async def analyze_pair_endpoint(long_symbol: str, short_symbol: str):
    positions = trading_client.get_all_positions()
    long_position = next((p for p in positions if p.symbol == long_symbol), None)
    short_position = next((p for p in positions if p.symbol == short_symbol), None)
    if long_position is None or short_position is None:
        return {"detail": f"One or both positions not found for symbols: {long_symbol}, {short_symbol}"}
    evaluation = evaluate_pairs_trade(long_position, short_position)
    return evaluation

@router.post("/trade")
async def trade_endpoint(request: TraderRequest):
    buy_market_order_request = MarketOrderRequest(
        symbol=request.longSymbol,
        qty=1,
        side=OrderSide.BUY,
        time_in_force=TimeInForce.DAY
    )
    sell_market_order_request = MarketOrderRequest(
        symbol=request.shortSymbol,
        qty=1,
        side=OrderSide.SELL,
        time_in_force=TimeInForce.DAY
    )

    trading_client.submit_order(buy_market_order_request)
    trading_client.submit_order(sell_market_order_request)

    time.sleep(5)

    positions = trading_client.get_all_positions()
    long_position = [p for p in positions if p.symbol == request.longSymbol][-1]
    short_position = [p for p in positions if p.symbol == request.shortSymbol][-1]

    return {"long_symbol" : request.longSymbol, "long_asset_id": long_position.asset_id, "short_symbol": request.shortSymbol, "short_asset_id": short_position.asset_id}

@router.delete("/trade")
async def sell_trade_endpoint(longAssetId: str, shortAssetId: str):
    positions = trading_client.get_all_positions()
    long_position = next((p for p in positions if p.asset_id == UUID(longAssetId)), None)
    short_position = next((p for p in positions if p.asset_id == UUID(shortAssetId)), None)
    if long_position is None or short_position is None:
        return {"detail": f"No open position found for asset ids: {longAssetId}, {shortAssetId}"}
    close_order_long = MarketOrderRequest(
        symbol=long_position.symbol,
        qty=1, 
        side=OrderSide.SELL,
        time_in_force=TimeInForce.DAY
    )
    close_order_short = MarketOrderRequest(
        symbol=short_position.symbol,
        qty=1, 
        side=OrderSide.BUY,
        time_in_force=TimeInForce.DAY
    )
    trading_client.submit_order(close_order_long)
    trading_client.submit_order(close_order_short)
    return {"detail": f"Closed position for asset id: {longAssetId} and {shortAssetId}"}