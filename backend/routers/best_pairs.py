from fastapi import APIRouter
import yfinance as yf
from itertools import combinations
import requests
import pandas as pd
from io import StringIO
from functions import get_sp500_tickers_by_sector, find_best_pairs

router = APIRouter()

@router.get("/best_pairs")
async def get_best_pairs(sector: str, startDate: str, endDate: str, numRows: int = 0):
    print(f"Finding best pairs for sector: {sector} from {startDate} to {endDate}")
    sector_tickers = get_sp500_tickers_by_sector(sector)
    best_pairs = find_best_pairs(sector_tickers, startDate, endDate, numRows)
    return {"best_pairs": best_pairs}