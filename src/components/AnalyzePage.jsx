import {useState, useEffect} from 'react';
import { useLocalStorage } from '../App';
import { fetchAPI } from '../utils/api';

function AnalyzePage() {
  const [longStock, setLongStock] = useLocalStorage('longStock', '');
  const [shortStock, setShortStock] = useLocalStorage('shortStock', '');
  const [pairAnalysisData, setPairAnalysisData] = useLocalStorage('pairAnalysisData', null);

  const analyzePair = async () => {
    const params = new URLSearchParams({
      long: longStock,
      short: shortStock
    });

    try {
      const response = await fetchAPI(`http://localhost:8000/trade/analyze?${params}`, {
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
        <label className="bold">Long (Buy) Stock:</label>
        <input 
          type="text"
          value={longStock}
          onChange={(e) => setLongStock(e.target.value)}
        />
      </div>
      <div className="center-div">
        <label className="bold">Short (Sell) Stock:</label>
        <input 
          type="text"
          value={shortStock}
          onChange={(e) => setShortStock(e.target.value)}
        />
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