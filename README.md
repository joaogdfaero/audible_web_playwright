# Audible Web – Playwright E2E Test Suite

[![Playwright](https://img.shields.io/badge/Playwright-1.55-2EAD33?logo=playwright&logoColor=white)](https://playwright.dev/)
[![TypeScript](https://img.shields.io/badge/TypeScript-5-3178C6?logo=typescript&logoColor=white)](https://www.typescriptlang.org/)
[![GitHub Actions](https://img.shields.io/badge/CI-GitHub%20Actions-2088FF?logo=githubactions&logoColor=white)](.github/workflows)
[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](LICENSE)

End-to-end test automation for the **[Audible US web store](https://www.audible.com/)**, built with **Playwright + TypeScript**.

The suite covers the real user journeys that matter most in a production e-commerce and streaming platform: authentication, search, wish list, cart, library and the web player. It runs against the **live website** with **your own account**. No credentials are stored in this repository.

> I built this project to show how I approach test automation on a complex, third-party, production system: one I don't control, with A/B tests, pop-ups, anti-bot protection and asynchronous backends. If you are hiring a QA / SDET, see [About the author](#about-the-author).

---

## Table of contents

- [What is tested](#what-is-tested)
- [Engineering highlights](#engineering-highlights)
- [Project structure](#project-structure)
- [Getting started](#getting-started)
- [Running the tests](#running-the-tests)
- [Using multiple accounts (parallel runs)](#using-multiple-accounts-parallel-runs)
- [Continuous Integration](#continuous-integration)
- [Security and privacy](#security-and-privacy)
- [Troubleshooting](#troubleshooting)
- [About the author](#about-the-author)

---

## What is tested

| Area | Scenario | Spec file |
|------|----------|-----------|
| 🔐 Auth | Login successfully on US marketplace | `tests/auth/login.spec.ts` |
| 🔐 Auth | Login with an invalid password is rejected | `tests/auth/login.spec.ts` |
| 🔐 Auth | Logout successfully | `tests/auth/login.spec.ts` |
| ❤️ Wish List | Open a random book from the homepage, add it to the wish list, then remove it | `tests/library/wishlist.spec.ts` |
| ❤️ Wish List | Search a book, add it to the wish list from search results, then remove it | `tests/library/wishlist.spec.ts` |
| 🛒 Cart | Add to cart from the wish list | `tests/library/cart.spec.ts` |
| 🛒 Cart | Add to cart from the search results page | `tests/library/cart.spec.ts` |
| 🛒 Cart | Add to cart from the product detail page (PDP) | `tests/library/cart.spec.ts` |
| 📚 Library | Add a book from the Plus catalog to the library, then remove it | `tests/library/library.spec.ts` |
| 🎧 Player | Open the preview player from the PDP | `tests/player/player.spec.ts` |
| 🎧 Player | Open the web player from the library | `tests/player/player.spec.ts` |
| 🎧 Player | Open the web player from the PDP | `tests/player/player.spec.ts` |

The full backlog of planned scenarios (sign-up, password recovery, filters, subscriptions, accessibility, cross-browser…) is in [`docs/test_scenarios.txt`](docs/test_scenarios.txt).

**Every test cleans up after itself.** Whatever is added to the wish list, cart or library is removed at the end, so the account stays in the same state and the suite can run again and again.

---

## Engineering highlights

The parts of this project that go beyond "record and replay":

- **Page Object Model**: all selectors and page interactions live in [`pages/`](pages). Specs read like user stories.
- **Custom Playwright fixtures** ([`tests/fixtures.ts`](tests/fixtures.ts)): page objects are injected into the tests, credentials are resolved per worker, and an optional `failOnJSError` fixture can fail a test when the page throws uncaught JavaScript errors.
- **Parallel execution with account isolation**: each Playwright worker can use its own account (`US_EMAIL_0`, `US_EMAIL_1`, …), chosen by `testInfo.parallelIndex`. A test can pin an account with an `accountIndex` annotation or `test.use()`. Tests that change shared state don't interfere with each other.
- **Fixing flakiness at the root, not just with retries**:
  - `clickUntilRequestSent()` ([`utils/helpers.ts`](utils/helpers.ts)) clicks and then **waits for the matching backend `POST`** (`/cart/add`, `/wish-list/add`, …). If the click was swallowed because JS handlers weren't attached yet, it clicks again. If the backend answers with an error, the test fails with the HTTP status. This separates *test* problems from *product* problems.
  - Handles real-world obstacles: promotional pop-ups, marketplace redirect banners, and the Amazon anti-bot "Continue shopping" interstitial that shows up after many logins in a short time.
  - Uses `expect.toPass()` for eventually-consistent backend operations (e.g. the library index updates with a delay).
- **Randomized, realistic test data**: searches use a random pool of well-known titles and the homepage/catalog tests pick random books. This finds more issues than one hard-coded product and keeps tests from depending on one item that might disappear.
- **Resilient locators**: role-based and accessible-name locators (`getByRole`, `getByTitle`) are preferred over brittle CSS/XPath. Where the site's markup forces it (e.g. HTML-escaped accessible names), the code scopes locators to the right card or row instead.
- **Debuggable failures**: trace, screenshot and video are kept for failed tests, plus an HTML report.
- **CI/CD with GitHub Actions**: a regression run on every push/PR, and a manual "flaky hunter" workflow that runs one scenario N times (`--repeat-each`).
- **AI-assisted testing**: the repo is set up for **Playwright Test Agents** (planner, generator and healer in [`.github/agents/`](.github/agents)) and the **Playwright MCP server** ([`.vscode/mcp.json`](.vscode/mcp.json)), so an LLM can explore the app, write test plans and repair broken locators.

---

## Project structure

```
audible_web_playwright/
├── .github/
│   ├── agents/                 # Playwright Test Agents (planner / generator / healer)
│   └── workflows/              # CI pipelines (regression + manual runner)
├── docs/
│   ├── BASIC_COMMANDS.txt      # Handy Playwright CLI commands
│   └── test_scenarios.txt      # Test scenario backlog
├── pages/                      # Page Objects
│   ├── CartPage.ts
│   ├── HomePage.ts
│   ├── LibraryPage.ts
│   ├── LoginPage.ts
│   └── ProductsPage.ts
├── specs/                      # Test plans generated by the planner agent
├── tests/
│   ├── fixtures.ts             # Custom fixtures (page objects, accounts, JS errors)
│   ├── auth/                   # Login / logout
│   ├── library/                # Wish list, cart, library
│   ├── player/                 # Preview and web player
│   └── account/                # Work in progress
├── utils/helpers.ts            # Shared helpers (network-aware clicks, test data…)
├── .env.example                # Template for your credentials
└── playwright.config.ts
```

---

## Getting started

### Prerequisites

- **Node.js 18+** (LTS recommended)
- An **Audible US account** (`audible.com`). Any e-mail and password work; it can be a brand new account.

| Tests | Account requirement |
|-------|---------------------|
| Auth, Wish List, Cart, Preview player | Any Audible US account (free is fine) |
| Library, *Open player from PDP* | An active membership with access to the **Plus Catalog** ("Included" titles) |
| *Open player from library* | At least **one title already in your library** |

> ⚠️ Use a **test account**, not your personal one. The tests really add and remove items in the wish list, cart and library. Nothing is ever purchased.
>
> Accounts with **two-step verification (OTP)** turned on can't log in automatically. Turn it off on the test account, or the login step will stop at the code prompt.

### 1. Clone and install

```bash
git clone https://github.com/joaogdfaero/audible_web_playwright.git
cd audible_web_playwright
npm ci
npx playwright install --with-deps chromium
```

### 2. Configure your credentials

Copy the template and put in **your own** e-mail and password:

```bash
cp .env.example .env
```

```dotenv
US_EMAIL=your-email@example.com
US_PASSWORD=your-password
```

That is all you need. Every test uses `US_EMAIL` / `US_PASSWORD` unless you define extra accounts (see [below](#using-multiple-accounts-parallel-runs)).

You can also skip the `.env` file and pass the variables inline:

```bash
# Linux / macOS
US_EMAIL="your-email@example.com" US_PASSWORD="your-password" npx playwright test

# Windows (PowerShell)
$env:US_EMAIL="your-email@example.com"; $env:US_PASSWORD="your-password"; npx playwright test
```

`.env` is in `.gitignore`, so your credentials never get committed.

---

## Running the tests

```bash
# Whole suite (headless)
npm test

# Watch the browser
npm run test:headed

# Playwright UI mode (time-travel debugging)
npm run test:ui

# A single file or a single scenario
npx playwright test tests/auth/login.spec.ts
npx playwright test -g "Add to cart from PDP"

# Hunt for flakiness: repeat a test until it fails
npx playwright test -g "Add new book to library" --repeat-each=20 --max-failures=1

# Open the last HTML report
npm run report
```

More commands are in [`docs/BASIC_COMMANDS.txt`](docs/BASIC_COMMANDS.txt).

---

## Using multiple accounts (parallel runs)

With one account, run serially so tests don't fight over the same cart or wish list:

```bash
npx playwright test --workers=1
```

For faster parallel runs, add one account per worker to `.env`:

```dotenv
US_EMAIL_0=account-a@example.com
US_PASSWORD_0=password-a
US_EMAIL_1=account-b@example.com
US_PASSWORD_1=password-b
```

How the account is chosen (see `tests/fixtures.ts`):

1. If the test has an `accountIndex` annotation (or `test.use({ accountIndex: N })`), it uses `US_EMAIL_N`.
2. Otherwise it uses the worker's `parallelIndex` (`0`, `1`, `2`…).
3. If that numbered account doesn't exist, it **falls back to `US_EMAIL` / `US_PASSWORD`**.

So the suite works with **one account or many**, with no code changes.

---

## Continuous Integration

| Workflow | Trigger | What it does |
|----------|---------|--------------|
| `playwright-regression.yml` | push / PR to `main`, manual | Runs the full suite |
| `playwright-pipeline.yml` | manual (`workflow_dispatch`) | Runs one scenario (`-g`) N times to reproduce flaky behavior |

To run the workflows in your fork, add two **repository secrets** (`Settings → Secrets and variables → Actions`):

- `US_EMAIL`
- `US_PASSWORD`

Credentials are read only from GitHub Secrets. GitHub masks them in logs, and the test code also masks the e-mail before printing it.

---

## Security and privacy

This repository is public, so it is built to **never expose credentials**:

- No e-mail, password or personal data is stored in the code. Everything comes from environment variables / GitHub Secrets.
- `.env` is git-ignored. Only `.env.example` with placeholder values is committed.
- Log lines mask the e-mail (`ja***@example.com`).
- Uploading the HTML report as a CI artifact is **disabled on purpose**. In a public repo anyone can download workflow artifacts, and Playwright traces and videos record what was typed in the login form. Run with the HTML report locally instead.

---

## Troubleshooting

| Symptom | Likely cause / fix |
|---------|--------------------|
| `Missing credentials: set US_EMAIL and US_PASSWORD…` | No `.env` file, or the variables are empty. |
| Login stops at a "Continue shopping" page | Amazon's anti-bot interstitial. The test retries for up to 90 s. Many logins in a short time make it worse, so lower `--workers`. |
| Login stops at a code/OTP or CAPTCHA screen | Turn off two-step verification on the test account, or wait a while before running again. |
| Library / "Open player from PDP" tests loop or time out | The account has no Plus Catalog access. |
| "Open player from library" fails | The library is empty. Add at least one title. |
| Random cart/wish list failures in parallel | Several workers are sharing one account. Use `--workers=1` or [multiple accounts](#using-multiple-accounts-parallel-runs). |

The live site changes often (A/B tests, layout updates), so a selector can break from time to time. That is part of testing a real product, and the Playwright healer agent in `.github/agents/` can help fix it.

---

## About the author

**João Gabriel Dal Forno** – QA Engineer / SDET

I built this project to practice and show production-grade test automation on a real, international product. It shows how I work:

- **Test design**: I pick the user journeys with the highest business risk (login, wish list, cart, library, playback) and write each test so it is independent, repeatable and cleans up after itself.
- **Automation architecture**: Page Object Model, custom fixtures, reusable helpers and a structure that is easy to extend.
- **Flakiness analysis**: I look for the root cause (JS hydration timing, backend latency, anti-bot pages, pop-ups) and fix it with network-aware synchronization, not blind sleeps and retries.
- **CI/CD**: GitHub Actions pipelines for regression and for reproducing flaky tests.
- **AI in QA**: hands-on experience with Playwright Test Agents and the Playwright MCP server for AI-assisted test planning, generation and healing.
- **Security awareness**: credentials handled with environment variables and secrets, and masked logs.

📫 **Get in touch:**

- GitHub: [@joaogdfaero](https://github.com/joaogdfaero)
<!-- - LinkedIn: https://www.linkedin.com/in/<your-profile> -->
<!-- - E-mail: <your-public-email> -->

If this project helped you or you'd like to talk about a role, feel free to reach out. ⭐ Stars are appreciated!

---

## License

[MIT](LICENSE) © João Gabriel Dal Forno

*This project is an independent portfolio work for educational purposes. It is not affiliated with, endorsed by, or sponsored by Audible, Inc. or Amazon.com, Inc.*
