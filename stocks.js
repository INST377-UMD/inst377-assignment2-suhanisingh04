const polygonApiKey = '9iF1uLwpApnVe20M6YTCiMRFxdbflpBQ';
const chartContext = document.getElementById('myChart').getContext('2d');
let stockChart;

function convertEpochToDate(epoch) {
  const date = new Date(epoch);
  return date.toLocaleDateString();
}

async function lookupStock() {
  const ticker = document.getElementById('stock-input').value.toUpperCase();
  const range = parseInt(document.getElementById('date-range').value);
  const today = new Date();
  const pastDate = new Date();
  pastDate.setDate(today.getDate() - range);

  const from = pastDate.toISOString().split('T')[0];
  const to = today.toISOString().split('T')[0];

  const url = `https://api.polygon.io/v2/aggs/ticker/${ticker}/range/1/day/${from}/${to}?adjusted=true&sort=asc&limit=120&apiKey=${polygonApiKey}`;

  try {
    const res = await fetch(url);
    const data = await res.json();

    if (!data.results || data.results.length === 0) {
      alert("No data found for this stock.");
      return;
    }

    const labels = data.results.map(point => convertEpochToDate(point.t));
    const values = data.results.map(point => point.c);

    if (stockChart) stockChart.destroy();

    stockChart = new Chart(chartContext, {
      type: 'line',
      data: {
        labels: labels,
        datasets: [{
          label: `${ticker} Closing Prices`,
          data: values,
          borderColor: 'blue',
          fill: false
        }]
      },
      options: {
        responsive: true,
        scales: {
          y: { beginAtZero: false }
        }
      }
    });
  } catch (err) {
    alert('Failed to load stock data.');
    console.error(err);
  }
}

async function loadRedditStocks() {
  try {
    const res = await fetch('https://tradestie.com/api/v1/apps/reddit?date=2022-04-03');
    const data = await res.json();
    const top5 = data.slice(0, 5);
    const table = document.getElementById('redditTable');
    table.innerHTML = '';

    top5.forEach(stock => {
      const icon = stock.sentiment === 'Bullish'
        ? '<img src="bullish.png" width="200" />'
        : '<img src="bearish.jpg" width="200" />';

      const row = document.createElement('tr');
      row.innerHTML = `
        <td><a href="https://finance.yahoo.com/quote/${stock.ticker}" target="_blank">${stock.ticker}</a></td>
        <td>${stock.no_of_comments}</td>
        <td>${stock.sentiment || 'N/A'} ${icon}</td>
      `;
      table.appendChild(row);
    });
  } catch (err) {
    console.error('Failed to load Reddit stocks', err);
  }
}

loadRedditStocks();

// Annyang command for Lookup <stock>
if (annyang) {
  annyang.addCommands({
    'lookup *stock': (stock) => {
      document.getElementById('stock-input').value = stock.toUpperCase();
      document.getElementById('date-range').value = '30';
      lookupStock();
    }
  });
}