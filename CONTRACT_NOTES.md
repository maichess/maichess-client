# Contract Notes

## Bot selector description — no component or E2E tests

The client has no test framework configured. The bot selector in `app/play/page.tsx` now renders `bot.description` below the ELO in each card, but there are no automated tests asserting that the description text appears in the rendered output. If a testing framework is added in future, a component test rendering `PlayForm` with mocked `useBots` data should assert that at least one description string is visible.

## Globe View — no real location data

The Global View (watch page globe toggle) uses deterministic fake locations hashed from usernames/bot IDs (see `lib/utils/geoHash.ts`). For production accuracy, the following contract changes would be needed:

- Add `country?: string` (ISO 3166-1 alpha-2) to the `User` proto and REST response (`user-service`)
- Propagate `country` through `MatchSummary.white` / `MatchSummary.black` in the match-manager REST response
- Add `country?: string` to the bot registry
- Update `geoHash.ts` to use a country-centroid lookup table (with a small per-user random offset seeded by user ID) when a country code is present, falling back to the current hash for users without a country set
