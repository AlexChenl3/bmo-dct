"""FastAPI backend for the ETF price reconstruction app.

Endpoints
---------
POST /api/analyze   -> analyze an uploaded weights CSV

Run with:
    fastapi dev app.py
"""

from __future__ import annotations

import io
from functools import lru_cache

import pandas as pd
from fastapi import FastAPI, File, HTTPException, UploadFile

from compute import WeightsError, load_prices, parse_weights, reconstruct

app = FastAPI(
    title="ETF Price Reconstruction API",
    version="1.0.0",
    description=(
        "Reconstructs an ETF's historical price as the weighted sum of its "
        "holdings' prices."
    ),
)

@lru_cache(maxsize=1)
def get_prices() -> pd.DataFrame:
    """Load and cache the daily price table for the life of the process."""
    return load_prices()


@app.post("/api/analyze")
async def analyze_upload(file: UploadFile = File(...)) -> dict:
    """Analyze an uploaded weights CSV (columns: name, weight)."""
    try:
        contents = await file.read()
    except Exception as exc:
        raise HTTPException(status_code=400, detail=f"Could not read upload: {exc}") from exc

    try:
        holdings = parse_weights(io.BytesIO(contents))
    except WeightsError as exc:
        raise HTTPException(status_code=400, detail=str(exc)) from exc

    return reconstruct(holdings, get_prices())