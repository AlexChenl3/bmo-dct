import { useMemo, useState } from "react";

const COLUMNS = [
  { key: "name", label: "Holding", numeric: false },
  { key: "weight", label: "Weight", numeric: true },
  { key: "latestPrice", label: "Latest Close", numeric: true },
];

function formatWeight(value) {
  if (value === null || value === undefined) return "—";
  return Number(value).toFixed(3);
}

function formatPrice(value) {
  if (value === null || value === undefined) return "—";
  return `$${Number(value).toFixed(3)}`;
}

/**
 * Interactive, sortable table of the fund's holdings.
 *
 * Props:
 *  - holdings: [{ name, weight, latestPrice }]
 */
export default function HoldingsTable({ holdings }) {
  const [sortKey, setSortKey] = useState("weight");
  const [ascending, setAscending] = useState(false);

  const sorted = useMemo(() => {
    if (!holdings) return [];
    const copy = [...holdings];
    copy.sort((a, b) => {
      const av = a[sortKey];
      const bv = b[sortKey];
      if (typeof av === "string" || typeof bv === "string") {
        const cmp = String(av).localeCompare(String(bv));
        return ascending ? cmp : -cmp;
      }
      return ascending ? av - bv : bv - av;
    });
    return copy;
  }, [holdings, sortKey, ascending]);

  function toggleSort(key) {
    if (key === sortKey) {
      setAscending((prev) => !prev);
    } else {
      setSortKey(key);
      setAscending(false);
    }
  }

  if (!holdings || holdings.length === 0) {
    return null;
  }

  return (
    <section className="panel">
      <h2>Holdings ({holdings.length})</h2>
      <div className="table-scroll">
        <table className="holdings-table">
          <thead>
            <tr>
              {COLUMNS.map((col) => (
                <th
                  key={col.key}
                  className={col.numeric ? "numeric" : ""}
                  onClick={() => toggleSort(col.key)}
                  title="Click to sort"
                >
                  {col.label}
                  {sortKey === col.key && (
                    <span className="sort-arrow">{ascending ? " ▲" : " ▼"}</span>
                  )}
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {sorted.map((h) => (
              <tr key={h.name}>
                <td>{h.name}</td>
                <td className="numeric">{formatWeight(h.weight)}</td>
                <td className="numeric">{formatPrice(h.latestPrice)}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </section>
  );
}