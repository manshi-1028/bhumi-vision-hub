```python
import pandas as pd
import numpy as np

df = pd.read_csv("land_metrics.csv")

metrics = [
    "records_digitized_pct",
    "pending_disputes",
    "avg_resolution_days",
    "women_owned_pct",
    "climate_vuln_index",
    "built_up_pct",
]

future_years = [2025, 2026, 2027]

rows = []

for region_id, g in df.groupby("region_id"):
    g = g.sort_values("year")

    for m in metrics:
        slope, intercept = np.polyfit(g["year"], g[m], 1)

        for y in future_years:
            value = slope * y + intercept

            if m.endswith("_pct") or m.endswith("_index"):
                value = min(max(value, 0), 100)
            else:
                value = max(value, 0)

            rows.append({
                "region_id": int(region_id),
                "metric": m,
                "year": y,
                "value": round(float(value), 2),
                "method": "linear trend",
            })

out = pd.DataFrame(rows)

out.to_csv("forecasts.csv", index=False)

print(out.head(12))
print(len(out), "rows written to forecasts.csv")
```
