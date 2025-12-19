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
async def analyze_pair_endpoint(long: str, short: str):
    positions = trading_client.get_all_positions()
    long_position = next((p for p in positions if p.symbol == long), None)
    short_position = next((p for p in positions if p.symbol == short), None)
    if long_position is None or short_position is None:
        return {"detail": f"One or both positions not found for symbols: {long}, {short}"}
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
    print(positions)
    long_position = [p for p in positions if p.symbol == request.longSymbol][-1]
    short_position = [p for p in positions if p.symbol == request.shortSymbol][-1]

    return {"longSymbol" : request.longSymbol, "longAssetId": long_position.asset_id, "shortSymbol": request.shortSymbol, "shortAssetId": short_position.asset_id}

@router.delete("/trade")
async def sell_trade_endpoint(orderId: str):
    positions = trading_client.get_all_positions()
    position = next((p for p in positions if p.asset_id == UUID(orderId)), None)
    if position is None:
        return {"detail": f"No open position found for asset id: {orderId}"}
    side = OrderSide.SELL
    if position.side == 'short':
        side = OrderSide.BUY
    close_order = MarketOrderRequest(
        symbol=position.symbol,
        qty=1, 
        side=side,
        time_in_force=TimeInForce.DAY
    )
    trading_client.submit_order(close_order)
    return {"detail": f"Closed position for asset id: {orderId}"}