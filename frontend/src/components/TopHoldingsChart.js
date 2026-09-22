import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  Cell,
} from "recharts";

const BAR_COLORS = ["#0079c1", "#1f9bd1", "#4fb3e0", "#86c9ea", "#b9def4"];

/**
 * Bar chart of the five largest holdings, sized by value (weight x price).
 *
 * Props:
 *  - topHoldings: [{ name, value }] (already sorted desc by the backend)
 */
export default function TopHoldingsChart({ topHoldings }) {
  if (!topHoldings || topHoldings.length === 0) {
    return null;
  }

  const data = topHoldings.map((h) => ({
    name: h.name,
    value: Number(h.value),
  }));

  return (
    <section className="panel">
      <h2>Five largest holdings</h2>
      <p className="muted">
        Size = weight &times; latest close price
      </p>
      <div className="chart-wrap">
        <ResponsiveContainer width="100%" height={320}>
          <BarChart
            data={data}
            margin={{ top: 10, right: 24, bottom: 10, left: 8 }}
          >
            <CartesianGrid strokeDasharray="3 3" stroke="#e6e6e6" vertical={false} />
            <XAxis dataKey="name" tick={{ fontSize: 13 }} />
            <YAxis
              tick={{ fontSize: 12 }}
              width={64}
              tickFormatter={(value) => `$${Number(value).toFixed(0)}`}
            />
            <Tooltip
              formatter={(value) => [`$${Number(value).toFixed(2)}`, "Value"]}
              labelFormatter={(label) => `Holding: ${label}`}
            />
            <Bar dataKey="value" radius={[4, 4, 0, 0]}>
              {data.map((entry, index) => (
                <Cell
                  key={entry.name}
                  fill={BAR_COLORS[index % BAR_COLORS.length]}
                />
              ))}
            </Bar>
          </BarChart>
        </ResponsiveContainer>
      </div>
    </section>
  );
}