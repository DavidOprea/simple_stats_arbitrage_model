import { use, useState, useEffect } from 'react';
import { useLocalStorage } from '../App';
import FinancialChart from './FinancialCharts';
import { fetchApi } from '../utils/api';

function Plotter() {
  const [tickerA, setTickerA] = useLocalStorage('tickerA', '');
  const [tickerB, setTickerB] = useLocalStorage('tickerB', '');
  const [startDate, setStartDate] = useLocalStorage('plotterStartDate', '');
  const [endDate, setEndDate] = useLocalStorage('plotterEndDate', '');
  const [stockData, setStockData] = useLocalStorage('stockData', null);
  const [hedgeRatio, setHedgeRatio] = useLocalStorage('hedgeRatio', null);
  const [pValue, setPValue] = useLocalStorage('pValue', null);
  const [action, setAction] = useLocalStorage('action', '');

  const handleTickerAChange = (event) => {
    setTickerA(event.target.value);
  }

  const handleTickerBChange = (event) => {
    setTickerB(event.target.value);
  }

  const handleStartDateChange = (event) => {
    setStartDate(event.target.value);
  }

  const handleEndDateChange = (event) => {
    setEndDate(event.target.value);
  }

  const submitTicker = async () => {
    // console.log(startDate);
    // console.log(endDate);
    try {
      const response = await fetchAPI('http://localhost:8000/ticker', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({tickerA: tickerA, tickerB: tickerB, startDate: startDate, endDate: endDate})
      });

      const data = await response.json();

      if (response.ok) {
        setStockData(data);
        setHedgeRatio(data.data.HedgeRatio);
        setPValue(data.data.PValue);
        if (data.data.Spread[data.data.Spread.length - 1].value > 2) {
          setAction('Buy Stock A, Sell Stock B');
        } else if (data.data.Spread[data.data.Spread.length - 1].value < -2) {
          setAction('Sell Stock A, Buy Stock B');
        } else {
          setAction('Sell both stocks or hold position');
        }
        console.log('Ticker submitted successfully:', data);
      } else {
        console.error('Error submitting ticker:', data);
      }
    } catch (error) {
      console.error('Network error:', error);
    }
  }

  return (
    <div>
      <h2 className="subheading underline">Plot Stocks</h2>
      <h3 className='input-header'>Date Range</h3>
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
      <div>
      <h3 className="input-header">Stock A</h3>
      <div className="center-div">
        <input
          type="text"
          value={tickerA}
          onChange={handleTickerAChange}
        />
      </div>
      <h3 className="input-header">Stock B</h3>
      <div className="center-div">
        <input
          type="text"
          value={tickerB}
          onChange={handleTickerBChange}
        />
      </div>
      </div>
      <div id="results-div">
        <h3>Hedge Ratio: {hedgeRatio}</h3>
        <h3>P-Value: {pValue}</h3>
        <h3>Action: {action}</h3>
      </div>
      <div className="button-div">
        <button onClick={submitTicker}>
          Submit
        </button>
      </div>
      {stockData && <FinancialChart data={stockData.data} />}
    </div>
  );
}

export default Plotter;