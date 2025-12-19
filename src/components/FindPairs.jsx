import { use, useState, useEffect } from 'react';
import { useLocalStorage } from '../App';
import { fetchAPI } from '../utils/api';

function FindPairs() {
  const [startDate, setStartDate] = useLocalStorage('pairsStartDate', '')
  const [endDate, setEndDate] = useLocalStorage('pairsEndDate', '')
  const [numRows, setNumRows] = useLocalStorage('numRows', 0);
  const [sectorValue, setSectorValue] = useLocalStorage('sectorValue', 'Health Care');
  const [bestPairs, setBestPairs] = useLocalStorage('bestPairs', []);
  const [isLoading, setIsLoading] = useLocalStorage('isLoading', false);

  const handleStartDateChange = (event) => {
    setStartDate(event.target.value);
  }

  const handleEndDateChange = (event) => {
    setEndDate(event.target.value);
  }

  const handleNumRowsChange = (event) => {
    setNumRows(event.target.value);
  }

  const findBestPairs = async () => {
    setIsLoading(true);
    console.log(sectorValue)
    try {
      const params = new URLSearchParams({
        sector: sectorValue,
        startDate: startDate,
        endDate: endDate,
        numRows: numRows
      });

      const response = await fetchAPI('http://localhost:8000/best_pairs?' + params, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
        }
      });

      const data = await response.json();

      if (response.ok) {
        setBestPairs(data.best_pairs);
        console.log('Best pairs fetched successfully:', data);
      } else {
        console.error('Error fetching best pairs:', data);
      }
    } catch (error) {
      console.error('Network error:', error);
    }
    setIsLoading(false);
  }

  return (
    <div>
      <h2 className="subheading underline">Find Most Cointegrated Pairs</h2>
      <div className="center-div">
        <label className="bold">Start Date: </label>
        <input
          type="date"
          value={startDate}
          onChange={handleStartDateChange}
        />
        <label className="bold"> End Date: </label>
        <input
          type="date"
          value={endDate}
          onChange={handleEndDateChange}
        />
      </div>
      <div className="center-div">
        <label className="bold">Number of Rows to Display: </label>
        <input
          type="number"
          value={numRows}
          onChange={handleNumRowsChange}
        />
      </div>
      <h2 className="subheading underline">Find Most Cointegrated Pairs In Sector</h2>
      <div className="center-div">
        <label className="bold">Sector: </label>
        <select value={sectorValue} onChange={(e) => setSectorValue(e.target.value)}>
          <option value="Health Care">Health Care</option>
          <option value="Financials">Financials</option>
          <option value="Consumer Discretionary">Consumer Discretionary</option>
          <option value="Industrials">Industrials</option>
          <option value="Utilities">Utilities</option>
          <option value="Real Estate">Real Estate</option>
          <option value="Energy">Energy</option>
          <option value="Materials">Materials</option>
          <option value="Communication Services">Communication Services</option>
          <option value="Consumer Staples">Consumer Staples</option>
        </select>
      </div>
      <div className="button-div">
        <button onClick={findBestPairs}>
          Find Best Pairs
        </button>
      </div>
      {bestPairs.length > 0 && !isLoading ? (
        <li id="bestPairsList">
          {bestPairs.map((pair, index) => (
            <div className="center-div border-div" key={index}>
              <p className="bold">Pair {index + 1}:</p>
              <p>Ticker 1: {pair[1]}</p>
              <p>Ticker 2: {pair[2]}</p>
              <p>Hedge Ratio: {pair[3]}</p>
              <p>P-Value: {pair[0]}</p>
            </div>
          ))}
        </li>
      ) : (isLoading ? <h3 id="pairs-info">Loading...</h3> : <h3 id="pairs-info">No best pairs found yet</h3>)}
    </div>
  );
}

export default FindPairs;
