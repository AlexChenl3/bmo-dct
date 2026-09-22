import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Brush,
  ResponsiveContainer,
} from "recharts";

/**
 * Fit the Y axis to the data instead of Recharts' default, which starts at 0.
 */
function getPriceDomain(series) {
  const values = series
    .map((point) => Number(point.price))
    .filter((value) => Number.isFinite(value));

  if (values.length === 0) {
    return [0, 1];
  }

  const min = Math.min(...values);
  const max = Math.max(...values);
  const span = max - min;

  // 5% of the range; fall back to a small pad if every price is identical.
  const pad = span > 0 ? span * 0.05 : Math.abs(max) * 0.05 || 1;

  return [min - pad, max + pad];
}

/**
 * Zoomable time series of the reconstructed fund price.
 *
 * The Recharts <Brush> component adds a draggable range selector under the
 * chart, which gives the user zoom + pan over the full date range.
 *
 * Props:
 *  - series: [{ date: "2017-01-01", price: 48.123 }, ...]
 */
export default function FundPriceChart({ series }) {
  if (!series || series.length === 0) {
    return null;
  }

  const yDomain = getPriceDomain(series);
  // A wide price range doesn't need cents on the axis labels.
  const yDecimals = yDomain[1] - yDomain[0] >= 10 ? 0 : 2;

  return (
    <section className="panel">
      <h2>Reconstructed fund price</h2>
      <p className="muted">
        Time series of weighted sum of holding prices. Drag the handles below the chart to zoom;
        drag the shaded window to pan.
      </p>
      <div className="chart-wrap">
        <ResponsiveContainer width="100%" height={360}>
          <LineChart
            data={series}
            margin={{ top: 10, right: 24, bottom: 40, left: 8 }}
          >
            <CartesianGrid strokeDasharray="3 3" stroke="#e6e6e6" />
            <XAxis
              dataKey="date"
              tick={{ fontSize: 12 }}
              minTickGap={40}
              tickFormatter={(value) => value.slice(5)}
            />
            <YAxis
              tick={{ fontSize: 12 }}
              width={64}
              domain={yDomain}
              tickFormatter={(value) => `$${Number(value).toFixed(yDecimals)}`}
            />
            <Tooltip
              formatter={(value) => [`$${Number(value).toFixed(2)}`, "Price"]}
              labelFormatter={(label) => `Date: ${label}`}
            />
            <Line
              type="monotone"
              dataKey="price"
              stroke="#0079c1"
              strokeWidth={2}
              dot={false}
              activeDot={{ r: 4 }}
            />
            <Brush
              dataKey="date"
              height={28}
              stroke="#0079c1"
              tickFormatter={(value) => value.slice(5)}
            />
          </LineChart>
        </ResponsiveContainer>
      </div>
    </section>
  );
}