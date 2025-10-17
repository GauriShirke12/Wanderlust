(() => {
  const palette = {
    primary: '#fe424d',
    secondary: '#ff7780',
    accent: '#ffd1d4',
    muted: '#d3d3d3',
  };

  document.addEventListener('DOMContentLoaded', () => {
    const payload = window.analyticsData || {};
    if (typeof Chart === 'undefined') {
      return;
    }

    renderMarketChart(payload);
    renderPriceBuckets(payload);
    updateMetricBars(payload);
  });

  function renderMarketChart(payload) {
    const ctx = document.getElementById('marketShareChart');
    if (!ctx) return;

    const markets = Array.isArray(payload.topMarkets) ? payload.topMarkets : [];
    const labels = markets.map((market) => market.country);
    const supplyData = markets.map((market) => market.listingCount);
    const rateData = markets.map((market) => Math.round(market.avgPrice || 0));
  const maxSupply = Math.max(1, ...supplyData);
  const maxRate = Math.max(1, ...rateData);

    new Chart(ctx, {
      data: {
        labels,
        datasets: [
          {
            type: 'bar',
            label: 'Listings',
            data: supplyData,
            backgroundColor: palette.primary,
            borderRadius: 8,
            maxBarThickness: 48,
            yAxisID: 'y',
          },
          {
            type: 'line',
            label: 'Avg Nightly Rate ($)',
            data: rateData,
            borderColor: palette.secondary,
            backgroundColor: 'transparent',
            tension: 0.35,
            yAxisID: 'y1',
          },
        ],
      },
      options: {
        responsive: true,
        maintainAspectRatio: false,
        scales: {
          y: {
            beginAtZero: true,
            position: 'left',
            suggestedMax: maxSupply,
            ticks: { precision: 0 },
            grid: {
              color: palette.muted,
              borderDash: [6, 6],
            },
          },
          y1: {
            beginAtZero: true,
            position: 'right',
            suggestedMax: maxRate,
            grid: {
              drawOnChartArea: false,
            },
          },
          x: {
            grid: { display: false },
          },
        },
        plugins: {
          legend: { position: 'bottom' },
          tooltip: {
            callbacks: {
              label(context) {
                if (context.datasetIndex === 0) {
                  const value = context.parsed.y || 0;
                  return `${value} listings`;
                }
                if (context.datasetIndex === 1) {
                  const value = context.parsed.y || 0;
                  return `$${value.toLocaleString('en-IN')} avg rate`;
                }
                return context.parsed.y;
              },
            },
          },
        },
      },
    });

  }

  function renderPriceBuckets(payload) {
    const ctx = document.getElementById('priceBucketChart');
    if (!ctx) return;

    const buckets = Array.isArray(payload.priceBuckets) ? payload.priceBuckets : [];
    const labels = buckets.map((bucket) => bucket.label);
    const data = buckets.map((bucket) => bucket.count);

    new Chart(ctx, {
      type: 'bar',
      data: {
        labels,
        datasets: [
          {
            label: 'Listings',
            data,
            backgroundColor: palette.secondary,
            borderRadius: 8,
            maxBarThickness: 48,
          },
        ],
      },
      options: buildBarOptions('Listings'),
    });
  }

  function buildBarOptions(datasetLabel) {
    return {
      responsive: true,
      maintainAspectRatio: false,
      scales: {
        x: {
          grid: { display: false },
        },
        y: {
          beginAtZero: true,
          ticks: {
            precision: 0,
          },
          grid: {
            color: palette.muted,
            borderDash: [6, 6],
          },
        },
      },
      plugins: {
        legend: { display: false },
        tooltip: {
          callbacks: {
            label(context) {
              const value = context.parsed.y || 0;
              return `${value} ${datasetLabel.toLowerCase()}`;
            },
          },
        },
      },
    };
  }

  function updateMetricBars(payload) {
    const markets = Array.isArray(payload.topMarkets) ? payload.topMarkets : [];
    const leaders = Array.isArray(payload.ratingLeaders) ? payload.ratingLeaders : [];

    const marketMax = {
      listings: Math.max(1, ...markets.map((market) => market.listingCount || 0)),
      rate: Math.max(1, ...markets.map((market) => Math.round(market.avgPrice || 0))),
      reviews: Math.max(1, ...markets.map((market) => market.totalReviews || 0)),
    };

    const leadersMaxReviews = Math.max(1, ...leaders.map((market) => market.reviewCount || 0));

    document.querySelectorAll('.metric-with-bar').forEach((wrapper) => {
      const bar = wrapper.querySelector('.metric-bar');
      if (!bar) return;
      const scope = wrapper.getAttribute('data-bar-scope') || 'markets';
      let maxValue = marketMax.listings;

      if (wrapper.classList.contains('metric-with-bar--rate')) {
        maxValue = marketMax.rate;
      } else if (wrapper.classList.contains('metric-with-bar--reviews')) {
        maxValue = scope === 'leaders' ? leadersMaxReviews : marketMax.reviews;
      }

      bar.style.setProperty('--metric-max', Math.max(1, maxValue));
    });
  }
})();
