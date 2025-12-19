import React, { useEffect, useRef } from 'react';
import { LineSeries, createChart } from 'lightweight-charts';
import './financialCharts.css';

const FinancialCharts = ({ data }) => {
  const stocksChartContainer = useRef(null);
  const spreadChartContainer = useRef(null);

  useEffect(() => {
    if (!data || !stocksChartContainer.current || !spreadChartContainer.current) {
      return;
    }

    /*
    data.StockA.map(point => {
      console.log(point.time)
    });
    */

    const stocksChart = createChart(stocksChartContainer.current, {
      backgroundColor: '#000000ff',
    });
    const spreadChart = createChart(spreadChartContainer.current, {
      backgroundColor: '#000000ff',
    });
    const stockASeries = stocksChart.addSeries(LineSeries, {
      color: '#26a69a', lineWidth: 2, title: 'Stock A'
    });
    const stockBSeries = stocksChart.addSeries(LineSeries, {
      color: '#ff9800', lineWidth: 2, title: 'Stock B'
    });
    const spreadSeries = spreadChart.addSeries(LineSeries, {
      color: '#ff0000', lineWidth: 2, title: 'Spread'
    });
    // console.log('Data received in FinancialChart:', data.StockA);
    // console.log('Data received in FinancialChart:', data.StockB);
    stockASeries.setData(data.StockA);
    stockBSeries.setData(data.StockB);
    spreadSeries.setData(data.Spread);

    stocksChart.timeScale().fitContent();
    spreadChart.timeScale().fitContent();

    return () => {
      stocksChart.remove();
      spreadChart.remove();
    }
  }, [data]);

  return (
    <div className="center-div">
      <div ref={stocksChartContainer} className="chart-container" />
      <div ref={spreadChartContainer} className="chart-container" />
    </div>
  );
}

export default FinancialCharts;