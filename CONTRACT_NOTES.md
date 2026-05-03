# Contract Notes

## Bot selector description — no component or E2E tests

The client has no test framework configured. The bot selector in `app/play/page.tsx` now renders `bot.description` below the ELO in each card, but there are no automated tests asserting that the description text appears in the rendered output. If a testing framework is added in future, a component test rendering `PlayForm` with mocked `useBots` data should assert that at least one description string is visible.
