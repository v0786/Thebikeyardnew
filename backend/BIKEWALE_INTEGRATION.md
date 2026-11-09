# BikeWale licensed catalogue integration

The backend exposes `GET /api/catalog/bikewale` as a **disabled-by-default** adapter for an approved JSON feed. It does not scrape BikeWale directly and does not claim that a feed is currently connected.

## Configuration

Set these environment variables in the backend deployment:

- `BIKEWALE_APPROVED_FEED_URL`: HTTPS URL of your approved, normalized JSON feed.
- `BIKEWALE_APPROVED_FEED_HOST`: exact hostname of that feed URL.

The feed must return a JSON array (maximum 100 records) with objects like:

```json
[
  {
    "brand": "Example Brand",
    "model": "Example Model",
    "variant": "Example Variant",
    "engineCc": 350,
    "imageUrl": "https://images.bikewale.com/approved-image.jpg",
    "sourceUrl": "https://www.bikewale.com/"
  }
]
```

Image and source links must be HTTPS and hosted on an approved BikeWale subdomain. The server checks the JSON shape and returns an empty catalogue when not configured. A failed upstream request returns HTTP 503. No real dealership stock, pricing or payments are modified.

## API Anything

[API Anything](https://github.com/goodnight000/api-anything) is an optional **discovery tool**, not a verified BikeWale API. It requires Node 22.13+ and can be installed in an operator environment using `npx -y api-anything setup --local-only`. Verify an approved read-only BikeWale operation and transform its output into the JSON format above before configuring the feed. Do not run browser automation, website learning, or credential-dependent scraping in a production Vercel request.

## Remaining work

1. Confirm the actual approved BikeWale endpoint, permitted fields, image rights and rate limits.
2. Build and deploy a feed normalizer if the upstream schema differs.
3. Connect the frontend catalogue to this endpoint with loading and error states.
4. Run builds, integration tests and a real feed smoke test before calling the integration live.
