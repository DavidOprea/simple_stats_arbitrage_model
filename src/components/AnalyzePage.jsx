import {useState, useEffect} from 'react';
import { useLocalStorage } from '../App';
import { fetchAPI } from '../utils/api';

function AnalyzePage() {
  const [cancelStockPair, setCancelStockPair] = useLocalStorage('cancelStockPair', null);
  const [stockPairs, setStockPairs] = useLocalStorage('stockPairs', []);
  const [pairAnalysisData, setPairAnalysisData] = useLocalStorage('pairAnalysisData', null);

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

  const analyzePair = async () => {
    const params = new URLSearchParams({
      long_symbol: cancelStockPair.long_symbol,
      short_symbol: cancelStockPair.short_symbol
    });

    try {
      const response = await fetchAPI(`/trade/analyze?${params}`, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
        }
      });

      const data = await response.json();

      if (response.ok) {
        setPairAnalysisData(data);
        console.log('Pair analysis fetched successfully:', data);
      } else {
        console.error('Error fetching pair analysis:', data);
      }
    } catch (error) {
      console.log('Network error:', error);
    }
  }

  return (
    <div>
      <h3 className="subheading underline">Check Pair Performance</h3>
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
        <button className="submit-button" onClick={analyzePair}>Analyze Pair</button>
      </div>
      <h3 className="subheading underline">Pair Analysis Results</h3>
      <div className="center-div">
        {pairAnalysisData ? 
          <ul>
            {Object.entries(pairAnalysisData).map(([key, value]) => (
                <li key={key}><b>{key}:</b> {value.toString()}</li>
              ))} 
          </ul> : <h3>No analysis data to display</h3>
        }
      </div>
    </div>
  )
}

export default AnalyzePage;