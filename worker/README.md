# Paper worker (24/7)

Samostatný **paper** bot bez Vite / Lovable UI.

- Virtuální $10 000 USDT
- Ceny z CoinGecko
- Strategie: `momentum` (default) nebo `mean_reversion`
- Stav v `worker/data/worker-state.json`
- HTTP: `GET /` nebo `/health`

## Railway

1. Service **paper-play-ground-13**
2. **Settings → Builder → Dockerfile**
3. Dockerfile path: (root) `Dockerfile` — už spouští jen worker
4. **Deploy**
5. **Networking → Generate Domain**
6. Otevři `https://….up.railway.app/health`

### Volitelné Variables

| Name | Example |
|------|---------|
| `WORKER_STRATEGY` | `momentum` nebo `mean_reversion` |
| `WORKER_TICK_MS` | `45000` |
| `WORKER_SYMBOLS` | `bitcoin,ethereum,solana,binancecoin` |
| `WORKER_STARTING_BALANCE` | `10000` |

### Clear halt

```http
POST /clear-halt
```

## Lokálně

```bash
node worker/index.mjs
```
