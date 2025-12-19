from fastapi import FastAPI
from routers import best_pairs, ticker, trade
from fastapi.middleware.cors import CORSMiddleware

app = FastAPI()

app.include_router(best_pairs.router)
app.include_router(ticker.router)
app.include_router(trade.router)

origins = [
    "http://localhost:5173"
]

app.add_middleware(
    CORSMiddleware,
    allow_origins=origins,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

@app.get("/")
async def read_root():
    return {"Hello": "World"}

'''
def main():
    sectors = ['Technology', 'Healthcare', 'Finance', 'Consumer Discretionary', 'Industrials', 'Utilities', 'Real Estate', 'Energy', 'Materials', 'Telecommunication Services', 'Consumer Staples']
    for sector in sectors:
        print(f"Best pairs for sector: {sector}")
        sector_tickers = get_sp500_tickers_by_sector(sector)
        best_pairs = find_best_pairs(sector_tickers, '2022-01-01', '2023-01-01')
        for p_value, t1, t2, hedge_ratio in best_pairs:
            print(f"Pair: {t1} - {t2}, p-value: {p_value}, hedge ratio: {hedge_ratio}")
        print("\n")

if __name__ == "__main__":
    main()
'''