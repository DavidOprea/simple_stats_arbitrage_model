import { useState, useEffect } from 'react';
import { useLocalStorage } from '../App';

function TradePage() {
  const [longTicker, setLongTicker] = useLocalStorage('longTicker', '');
  const [shortTicker, setShortTicker] = useLocalStorage('shortTicker', '');
  const [ordersData, setOrdersData] = useLocalStorage('ordersData', []);
  const [stockPairs, setStockPairs] = useLocalStorage('stockPairs', []);
  const [cancelStockPair, setCancelStockPair] = useLocalStorage('cancelStockPair', {});

  const handleLongTickerChange = (event) => {
    setLongTicker(event.target.value);
  }

  const handleShortTickerChange = (event) => {
    setShortTicker(event.target.value);
  }

  const handleCancelStockPairChange = (event) => {
    setCancelStockPair(event.target.value);
  }

  const submitTickers = async () => {
    try {
      const response = await fetch('http://localhost:8000/trade', {
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
      } else {
        console.error('Error submitting tickers:', data);
      }
    } catch (error) {
      console.error('Network error:', error);
    }
  }

  const submitViewOrders = async () => {
    try {
      const response = await fetch ('http://localhost:8000/trade/all', {
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
      stockPair: cancelStockPair
    });

    console.log('Cancelling order for stock pair:', cancelStockPair);

    try {
      const response = await fetch('http://localhost:8000/trade?' + params, {
        method: 'DELETE',
        headers: {
          "Content-Type": 'application/json'
        }
      })

      const data = await response.json();

      if (response.ok) {
        console.log('Order cancelled successfully:', data);
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
        <select value={cancelStockPair} onChange={handleCancelStockPairChange}>
          {stockPairs.map((pair, index) => (
            <option key={index} value={pair.order_id}>{pair.longSymbol} / {pair.shortSymbol}</option>
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