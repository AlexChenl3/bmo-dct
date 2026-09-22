**How to run it** — ideally one documented command from a clean checkout

From a clean checkout:

```
1.) cd frontend
2.) npm install
3.) npm run dev
```

- `npm install` installs the frontend dependencies **and** the backend Python
  dependencies.
- `npm run dev` starts both servers together:
  - Backend (FastAPI): http://127.0.0.1:8000
  - Frontend (React):  http://localhost:3000

- http://localhost:3000 wil automatically 

- Upload `data/ETF1.csv` or `data/ETF2.csv`.


**Your design** — a short description of the technologies you chose and how the pieces fit together

**Frontend — React** 
- React + Recharts

- Recharts gives the zoom/pan on the time series through its `Brush` component, so there is 
no hand written interaction code

- It is a single-page app with no routing.

- The user uploads a weights file, and the same screen renders the holdings table, the 
reconstructed price time series, and the bar chart of the five largest holdings.

**Backend — Python + FastAPI + pandas.** 
- FastAPI gives file upload handling (`UploadFile`), and request validation.

- There is one endpoint, `POST /api/analyze`: it takes the uploaded weights and returns the holdings,
the reconstructed series, the top-five holdings, and any data warnings

- The uploaded CSV is required to have `name` and `weight` columns anything else comes back 
as HTTP 400 Bad Request

- I put the calculation on the server rather than in the browser so the formula has 
one testable implementation and the frontend stays a thin view layer.


**Your assumptions** — anything you decided that we did not specify
- `data/Prices.csv` is read once and cached with `lru_cache` because it never
  changes.

- Upload only allows ETF CSV files. Uploading `Price.csv` would return an error.
  `name` and `weight` are matched case insensitively with whitespace trimmed. 
  A file with the wrong columns returns an error.

- Every row in the price file is a valid observation date. The file includes 
  weekdays and weekends. I did not filter or remove them. Dropping rows would
  remove any underlying pattern in the data.

- A holding's size is `weight × latest close`, exactly as the instructions
  defines it as. The bar chart shows five bars, or fewer if the fund has fewer
  than five holdings.

- Zero weight holdings are kept and displayed. `ETF1.csv` contains holding `T` at
  weight 0.000. It contributes nothing to the reconstruction, but removing 
  it would also remove any underlying patterns in the data, so it remains in the
  table and an warning is given.

- A holding missing from the price file is a warning, not an error. It is
  listed with no price and excluded from the sum. The request only fails if
  none of the holdings can be found.

- Calculations of Fund prices remain rounded to 3 decimal places, and all display 
  formatting is in 3-decimal places (`x.xxx`).

- The table is sortable on every column and defaults to descending by weight.

- "Zoomable" is implemented as a brush, drag the handles to narrow the
  date range, drag the window to pan across the whole series.

- No authentication, no authorization, no persistent storage, no database. The app is 
  stateless, each request recomputes from the uploaded CSV files.

Things I noticed in the data:

- `Prices.csv` is a superset, it carries all 26 holdings `A`–`Z`, while
  `ETF1` uses 15 and `ETF2` uses 20. The reconstruction intersects
  the holdings with the price columns rather than assuming they line up.

- `ETF1.csv` contains a zero-weight row in Holding `T`

- `ETF1.csv` weights summed up to 0.9990

- `ETF2.csv` weights summed up to 1.0010


**What is missing** — what you did not get to, and what you would do next

- The table sorts but does not filter.
  -> Next steps is to implement a text or search filter over the columns.
  
- No automated testing or unit tests. 
  -> For real world applications, ways of testing the application will be needed. 

- `ETF1.csv` and `ETF2.csv` work because they directly relate to `Prices.csv`. 
  -> Next steps would be to either allow users to upload their own verison of `Prices.csv`
     or implement multiple uploads. 

- The given instructions says to assume the weights remain constant.
  -> Real world ETF applications would need to be able to support dynamic weights. 

- Dates not in the right format (YYYY-MM-DD) or non-numeric price cells are not specifically handled. 
  They would either fail the file load or produce NaN.
  -> Implement data checking for CSV files

- Polishing the UI. Currently there is no loading skeleton, no export of the results, 
  and no state preserved across a page reload.
  
- No Docker or Package manager. The backend dependencies install into the
  global Python environment rather than a virtual environment.
  -> Implement some sort of Package manager.

- User creation/login is missing.
  -> Depending on additional features and how the application is used, login 
     features might be necessary. 


**AI usage**

Built with Cline.bot + DeepSeek v4.1-flash. I used it to scaffold the React
components and the FastAPI endpoint and to help draft this README. I set the
direction, ran everything end to end against both CSVs, and reviewed and edited
the result.
