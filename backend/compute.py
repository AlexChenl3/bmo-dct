"""Core calculations for reconstructing an ETF's price from its holdings.

The reconstruction is the weighted sum of holding prices on each date:

    fund_price(date) = sum over holdings h of  weight(h) * price(h, date)

Weights are assumed constant over time (as stated in the exercise).
"""

from __future__ import annotations

import os
from typing import Dict, List, Union

import pandas as pd

# data/ sits alongside backend/ in the repository root.
DATA_DIR = os.path.normpath(os.path.join(os.path.dirname(__file__), "..", "data"))

# Weights in the provided files do not sum to exactly 1.0; allow a little slack
# before we bother the user with a warning.
WEIGHT_SUM_TOLERANCE = 1e-3


class WeightsError(ValueError):
    """Raised when an uploaded weights file is not usable."""


def _find_data_file(name: str) -> str:
    """Locate a file in the data directory, tolerating case differences.
    """
    if not os.path.isdir(DATA_DIR):
        raise FileNotFoundError(f"Data directory not found: {DATA_DIR}")

    target = name.lower()
    for entry in os.listdir(DATA_DIR):
        if entry.lower() == target:
            return os.path.join(DATA_DIR, entry)
    raise FileNotFoundError(f"Could not find {name!r} in {DATA_DIR}")


def load_prices() -> pd.DataFrame:
    """Load the daily price file into a date-first DataFrame.

    Returns a DataFrame with a ``date`` column (ISO strings, ascending) followed
    by one column per ticker (A..Z).
    """
    path = _find_data_file("prices.csv")
    df = pd.read_csv(path)

    df.columns = [str(c).strip() for c in df.columns]
    date_col = df.columns[0]  # "DATE"
    df = df.rename(columns={date_col: "date"})
    df["date"] = df["date"].astype(str).str.strip()

    df = df.sort_values("date").reset_index(drop=True)
    return df


def parse_weights(source: Union[str, object]) -> List[Dict[str, float]]:
    """Parse a weights CSV into a list of ``{"name", "weight"}`` dicts.

    ``source`` may be a path or any file-like object (e.g. an upload stream).
    """
    try:
        df = pd.read_csv(source)
    except Exception as exc:
        raise WeightsError(f"Could not read weights CSV: {exc}") from exc

    df.columns = [str(c).strip() for c in df.columns]
    lower = {c.lower(): c for c in df.columns}
    if "name" not in lower or "weight" not in lower:
        raise WeightsError(
            "Weights file must contain 'name' and 'weight' columns "
            f"(found: {', '.join(map(str, df.columns))})"
        )

    name_col = lower["name"]
    weight_col = lower["weight"]

    holdings: List[Dict[str, float]] = []
    for _, row in df.iterrows():
        raw_name = row[name_col]
        if pd.isna(raw_name):
            continue
        name = str(raw_name).strip()
        if name == "":
            continue
        try:
            weight = float(row[weight_col])
        except (TypeError, ValueError) as exc:
            raise WeightsError(
                f"Invalid weight for holding {name!r}: {row[weight_col]!r}"
            ) from exc
        holdings.append({"name": name, "weight": weight})

    if not holdings:
        raise WeightsError("No holdings found in weights file")

    return holdings


def reconstruct(holdings: List[Dict[str, float]], prices_df: pd.DataFrame) -> Dict:
    """Build the full analysis payload for a set of holdings.

    Returns a dict with ``holdings``, ``fundSeries``, ``topHoldings`` and
    ``warnings`` keys, ready to be serialised to JSON.
    """
    tickers = [c for c in prices_df.columns if c != "date"]
    ticker_set = set(tickers)

    known = [h for h in holdings if h["name"] in ticker_set]
    unknown = [h["name"] for h in holdings if h["name"] not in ticker_set]

    warnings: List[str] = []

    if unknown:
        warnings.append(
            "Holdings not found in price data (excluded from the reconstruction): "
            + ", ".join(unknown)
        )

    total_weight = sum(h["weight"] for h in holdings)
    if abs(total_weight - 1.0) > WEIGHT_SUM_TOLERANCE:
        warnings.append(f"Weights sum to {total_weight:.4f}, not 1.0.")

    zero_weight = [h["name"] for h in holdings if h["weight"] == 0]
    if zero_weight:
        warnings.append(
            "Zero-weight holdings (shown but contributing nothing): "
            + ", ".join(zero_weight)
        )

    if not known:
        return {
            "holdings": [
                {"name": h["name"], "weight": h["weight"], "latestPrice": None}
                for h in holdings
            ],
            "fundSeries": [],
            "topHoldings": [],
            "warnings": warnings
            + ["None of the holdings were found in the price data."],
        }

    latest_row = prices_df.iloc[-1]

    # Latest price per holding for the table, plus the size (weight x price)
    # used to rank the top five. Size stays internal, it is not sent back.
    holdings_out = []
    sizes = []
    for h in holdings:
        if h["name"] in ticker_set:
            latest_price = float(latest_row[h["name"]])
            sizes.append((h["name"], h["weight"] * latest_price))
        else:
            latest_price = None
        holdings_out.append(
            {
                "name": h["name"],
                "weight": h["weight"],
                "latestPrice": latest_price,
            }
        )

    # Reconstructed fund price for every date.
    weight_series = pd.Series({h["name"]: h["weight"] for h in known})
    sub = prices_df[list(weight_series.index)]
    fund_values = sub.mul(weight_series, axis=1).sum(axis=1)

    fund_series = [
        {"date": date, "price": round(float(price), 3)}
        for date, price in zip(prices_df["date"], fund_values)
    ]

    # Five largest holdings by size.
    ranked = sorted(sizes, key=lambda item: item[1], reverse=True)
    top_holdings = [
        {"name": name, "value": round(float(value), 3)}
        for name, value in ranked[:5]
    ]

    return {
        "holdings": holdings_out,
        "fundSeries": fund_series,
        "topHoldings": top_holdings,
        "warnings": warnings,
    }