import { useState, useEffect } from 'react';
import { useLocalStorage } from '../App';
import { fetchAPI } from '../utils/api';

function TradePage() {
  const [longTicker, setLongTicker] = useLocalStorage('longTicker', '');
  const [shortTicker, setShortTicker] = useLocalStorage('shortTicker', '');
  const [ordersData, setOrdersData] = useLocalStorage('ordersData', []);
  const [stockPairs, setStockPairs] = useLocalStorage('stockPairs', []);
  const [cancelStockPair, setCancelStockPair] = useLocalStorage('cancelStockPair', {});

  useEffect(() => {
    if (stockPairs.length > 0 && !cancelStockPair) {
      setCancelStockPair(stockPairs[0]);
    }
  }, [stockPairs, cancelStockPair])

  const handleLongTickerChange = (event) => {
    setLongTicker(event.target.value);
  }

  const handleShortTickerChange = (event) => {
    setShortTicker(event.target.value);
  }

  const handleCancelStockPairChange = (event) => {
    let [a, b] = event.target.value.split('/');
    a = a.trim();
    b = b.trim();
    stockPairs.forEach((pair) => {
      if (pair.long_symbol === a && pair.short_symbol === b) {
        setCancelStockPair(pair);
        console.log('Selected stock pair for cancellation:', pair);
      }
    });
  }

  const submitTickers = async () => {
    try {
      const response = await fetchAPI('/trade', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({longSymbol: longTicker, shortSymbol: shortTicker})
      });

      const data = await response.json();

      if (response.ok) {
        console.log('Tickers submitted successfully:', data);
        setStockPairs(stockPairs.concat(data));
        console.log(stockPairs);
      } else {
        console.error('Error submitting tickers:', data);
      }
    } catch (error) {
      console.error('Network error:', error);
    }
  }

  const submitViewOrders = async () => {
    try {
      const response = await fetchAPI('/trade/all', {
        method: 'GET',
        headers: {
          "Content-Type": 'application/json'
        }
      });

      const data = await response.json();

      if (response.ok) {
        setOrdersData(data);
        console.log('Orders fetched successfully:', data);
      } else {
        console.error('Error fetching orders:', data);
      }
    } catch (error) {
      console.error('Network error:', error);
    }
  }

  const submitCancelOrder = async () => {
    const params = new URLSearchParams({
      longAssetId: cancelStockPair.long_asset_id,
      shortAssetId: cancelStockPair.short_asset_id,
    });

    console.log('Cancelling order for stock pair:', cancelStockPair);

    try {
      const response = await fetchAPI('/trade?' + params, {
        method: 'DELETE',
        headers: {
          "Content-Type": 'application/json'
        }
      })

      const data = await response.json();

      if (response.ok) {
        console.log('Order cancelled successfully:', data);

        const updatedPairs = stockPairs.filter(p => p !== cancelStockPair);
        setStockPairs(updatedPairs);
        
        localStorage.setItem('stockPairs', JSON.stringify(updatedPairs));

        setCancelStockPair(updatedPairs.length > 0 ? updatedPairs[0] : null);
      } else {
        console.error('Error cancelling order:', data);
      }
    } catch (error) {
      console.error('Network error:', error);
    }
  }

  return (
    <div>
      <h2 className="subheading underline">Trade Stocks (Paper Trading So Far)</h2>
      <div className="center-div">
        <label className="bold">Stock To Long: </label>
        <input
          type="text"
          value={longTicker}
          onChange={handleLongTickerChange}
        />
      </div>
      <div className="center-div">
        <label className="bold">Stock To Short: </label>
        <input
          type="text"
          value={shortTicker}
          onChange={handleShortTickerChange}
        />
      </div>
      <div className="center-div">
        <button className="submit-button" onClick={submitTickers}>Submit Stocks</button>
      </div>
      <h2 className="subheading underline">View Open Positions</h2>
      <div className="center-div">
        <button className="submit-button" onClick={submitViewOrders}>View Open Positions</button>
      </div>
      <div className="center-div">
        {ordersData.length > 0 ? <ul>
          {ordersData.map((order, index) => (
            <li key={index} className="order-list-element">
              <b>Asset ID:</b> {order.asset_id} | <b>Symbol:</b> {order.symbol} | <b>Qty:</b> {order.qty} | <b>Side:</b> {order.side}
            </li>
          ))}
        </ul> : <h3 id="no-positions">No positions to display</h3>}
      </div>
      <h2 className="subheading underline">Sell Open Position</h2>
      <div className="center-div">
        <label className="bold">Stock Pair: </label>
        <select 
          value={cancelStockPair ? `${cancelStockPair.long_symbol} / ${cancelStockPair.short_symbol}` : ''} 
          onChange={handleCancelStockPairChange}
        >
          {stockPairs.map((pair, index) => (
            <option key={index} value={`${pair.long_symbol} / ${pair.short_symbol}`}>
              {pair.long_symbol} / {pair.short_symbol}
            </option>
          ))}
        </select>
      </div>
      <div className="center-div">
        <button className="submit-button" onClick={submitCancelOrder}>Sell Pair</button>
      </div>
    </div>
  );
}

export default TradePage;