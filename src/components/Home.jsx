function Home() {
  return (
    <>
      <h1 className="heading">Welcome to My Simple Statical Arbitrage Model!</h1>
      <h3 id="name">By David Oprea</h3>
      <h2 className="subheading underline">Strategy</h2>
      <ol className="border-div">
        <li className="home-list-element">Calculate the conintegration on one stock using the Augmented Dickey-Fuller Test to see if it's stationary.</li>
        <li className="home-list-element">If the stock is stationary, then find other relavent stocks which are also stationary.</li>
        <li className="home-list-element">Calculate the spread between the two stocks and normalize it.</li>
        <li className="home-list-element">Check whether the spread is also stationary as well based on the Augmented Dickey-Fuller Test again.</li>
        <li className="home-list-element">Use the normalized spread to identify trading signals for the pairs trading strategy.</li>
        <li className="home-list-element">If the spread is +2 standard devations above the mean, then short the first stock and long the second stock, and vice versa.</li>
        <li className="home-list-element">Hopefully profit :D</li>
      </ol>
      <h2 className="subheading underline">Implementation</h2>
      <ol className="border-div">
        <li className="home-list-element">Find the best pairs in a sector of the S&P 500 through the <b>Find Pairs</b> page.</li>
        <li className="home-list-element">Plot the stocks and their spread through the <b>Plotter</b> page.</li>
        <li className="home-list-element">Implement trades on the <b>Trade</b> page!</li>
        <li className="home-list-element">See if the trading pairs are working or not on the <b>Analyze</b> page!</li>
      </ol>
    </>
  )
}

export default Home;