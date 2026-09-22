# Analyst Full Stack Take-Home

**BMO Capital Markets · Data Cognition Team · Business Solutions**

---

## About this exercise

You will build a small web application that reconstructs the historical
price of an ETF from the prices of the securities it holds.

There is no single correct solution. Your submission is the starting
point for a conversation — we will review it together and discuss the
choices you made, so your reasoning matters more than how much you
completed.

**Please spend no more than four to six hours on this.** That is a
ceiling, not an estimate of how long it should take. If you finish
sooner, submit it. We do not give credit for additional time spent, and
a partial submission with clear notes on what you left out and why is
evaluated as a good outcome.

**Please submit within 7 days** of receiving this.

---

## Background

**No finance background is required.** Everything you need is below.

An ETF (Exchange Traded Fund) is a security that holds a basket of other
securities, such as stocks or bonds. Each security it holds is called a
**holding**, and each holding has a **weight** — the fraction of the fund
it represents.

The price of the fund on any given day can be reconstructed as the
weighted sum of its holdings' prices:

```
fund_price(date) = Σ  weight(holding) × price(holding, date)
```

That is the complete calculation. For this exercise, assume the weights
do not change over time.

---

## Data provided

Everything you need is included. No external APIs are required.

| File | Contents |
|---|---|
| `ETF1.csv` | 15 holdings and their weights |
| `ETF2.csv` | 20 holdings and their weights |
| `prices.csv` | Daily close prices for 26 securities (`A`–`Z`), January to April 2017 |

`prices.csv` contains prices for **all** securities, not only those in a
single fund.

---

## What to build

A **single-page application** — one view, with no page navigation or
routing. The user does everything on one screen.

Use any frontend framework you are comfortable with: React, Angular, Vue,
Svelte, or anything else. The backend is entirely your choice. We mostly
use Python, but use whatever lets you do your best work.

The application should:

1. **Accept an uploaded weights file** (`ETF1.csv` or `ETF2.csv`).

2. **Display an interactive table** of the fund's holdings, with three
   columns:
   - Holding name (for example `A`)
   - Weight (for example `0.087`)
   - Most recent close price (for example `$27.03`)

3. **Plot the reconstructed fund price over time** as a zoomable time
   series, calculated as the weighted sum of holding prices.

4. **Show a bar chart of the five largest holdings** as of the latest
   close. A holding's size is its weight multiplied by its price.

**Partial solutions are expected and acceptable.** What you do submit
needs to run.

---

## Assumptions

The requirements above are deliberately incomplete. Part of what we are
interested in is what you do when something has not been specified.

Where you had to decide something for yourself, note it in your README.
If anything in the data was unexpected, tell us what you noticed and what
you did about it — including if you decided to leave it alone.

---

## Using AI tools

You are welcome to use AI coding assistants. We use them ourselves.

We ask two things:

- Note briefly in your README where you used them.
- Submit only code you understand. In the review session we will ask you
  to explain a function and make a change to it, and that applies
  regardless of how the code was produced.

---

## What to submit

A Git repository, or a ZIP file if you prefer, containing:

- Your source code, with a clear project structure
- A `README.md` covering:
  - **How to run it** — ideally one documented command from a clean
    checkout
  - **Your design** — a short description of the technologies you chose
    and how the pieces fit together
  - **Your assumptions** — anything you decided that we did not specify
  - **What is missing** — what you did not get to, and what you would do
    next
  - **AI usage** — a sentence or two, as above

Please do not commit `node_modules` or virtual environments.

---

## How we evaluate

Approximately in order of what matters most:

1. **Reasoning** — the quality of the assumptions you surfaced and the
   decisions you documented
2. **Design choices** — whether your technology and structure choices
   make sense, and whether you can explain why you made them
3. **Correctness** — whether the calculations do what you say they do
4. **Clarity** — readable code and a README we can follow
5. **Scope judgment** — if you did not finish, whether you cut the right
   things

---

## What happens next

If successfully completed, and if we think your submission is a good fit for the team, we'll
invite you for an on-site interview of roughly 2 hours. We'll review your submission together,
and then give you a short coding exercise to complete on the spot. The interview will also include
a discussion of your experience and background, and a chance for you to ask questions about the team
and the work we do.
