# LDUFK Replay Events

## Current LOTGaming / MatchZy API check

Checked against the endpoints currently used by `lib/lotgaming.ts` on 2026-05-21:

- `GET https://matches.lotgaming.xyz/api/matches/limit/20`
- `GET https://matches.lotgaming.xyz/api/matches/2724`
- `GET https://matches.lotgaming.xyz/api/mapstats/2724`
- `GET https://matches.lotgaming.xyz/api/playerstats/match/2724`
- `GET https://matches.lotgaming.xyz/api/seasons`
- `GET https://matches.lotgaming.xyz/api/leaderboard/players`

Also probed likely event/log endpoints:

- `/events/:matchId`
- `/matches/:matchId/events`
- `/matches/:matchId/match-events`
- `/match-events/:matchId`
- `/matchevents/:matchId`
- `/killfeed/:matchId`
- `/kills/:matchId`
- `/deaths/:matchId`
- `/rounds/:matchId`
- `/roundstats/:matchId`
- `/logs/:matchId`
- `/gamelogs/:matchId`
- `/game-logs/:matchId`
- `/events/map/:mapId`
- `/rounds/map/:mapId`

Those endpoints returned `404 Not Found`, except `/mapstats/:mapId/events`, which returned a server error and did not expose event data.

## Verdict

The current API is enough for:

- live/finished match listing;
- map score and map metadata;
- team names and match status;
- aggregate player stats such as `kills`, `deaths`, `headshot_kills`, `firstkill_ct`, `firstkill_t`, `roundsplayed`;
- post-match pages and rankings.

It is not enough for automatic replay switching because it does not expose real-time event-level data:

- no `player_death` event stream;
- no killfeed endpoint;
- no killer SteamID per kill;
- no victim SteamID per kill;
- no weapon per kill;
- no headshot flag per kill event;
- no round timestamp or server tick per kill;
- no live `round_end` event stream.

The local `public/demo-data/matches/*.json` files can contain detailed round/kill data after a demo is parsed, but that is post-match/demo data, not live data from LOTGaming.

## Plan: CounterStrikeSharp plugin `LDUFKReplayEvents`

Build a small CounterStrikeSharp server plugin that sends only the replay-relevant live events to our infrastructure or directly to the local replay controller.

### Events to emit

1. `kill`
   - Fired from the CS2 `player_death` game event.
   - Include killer/victim SteamID64, names, teams, weapon, headshot flag, round number, map, server tick, and round timestamp.

2. `round_end`
   - Fired from the CS2 `round_end` game event.
   - Include winning side/team, reason, round number, map, server tick, and timestamp.

3. Optional later events:
   - `round_start`
   - `bomb_planted`
   - `bomb_defused`
   - `bomb_exploded`
   - `player_blind`

### Payload shape

```json
{
  "type": "kill",
  "matchId": "matchzy-or-lot-match-id",
  "serverId": "ldufk-server-1",
  "map": "de_mirage",
  "round": 12,
  "tick": 123456,
  "roundTimeMs": 74620,
  "occurredAt": "2026-05-21T18:30:12.120Z",
  "killer": {
    "steamid64": "7656119...",
    "name": "Player A",
    "team": "CT"
  },
  "victim": {
    "steamid64": "7656119...",
    "name": "Player B",
    "team": "T"
  },
  "weapon": "ak47",
  "headshot": true
}
```

```json
{
  "type": "round_end",
  "matchId": "matchzy-or-lot-match-id",
  "serverId": "ldufk-server-1",
  "map": "de_mirage",
  "round": 12,
  "tick": 130000,
  "occurredAt": "2026-05-21T18:31:01.200Z",
  "winnerSide": "CT",
  "reason": "ct_win_elimination"
}
```

### Recommended transport

For production reliability:

1. Plugin posts events to a public HTTPS endpoint:
   - `POST https://ldufk.com/api/replay/events`
   - Header: `x-ldufk-replay-secret: <secret>`

2. The Next.js route validates the secret and forwards only `kill` and `round_end` to:
   - `REPLAY_CONTROLLER_URL`, for example `http://127.0.0.1:47321/events`

3. The local replay controller decides what to do:
   - mark replay candidates;
   - switch OBS scenes/sources;
   - trigger clipping;
   - ignore low-value kills if needed.

If the CS2 server and replay controller are on the same private machine/network, the plugin can post directly to the local controller. For tournaments, the HTTPS relay is usually easier to monitor and secure.

### Replay automation rules

Start simple:

- Trigger candidate replay on every headshot kill.
- Trigger stronger replay on multi-kill windows, for example 2 kills within 6 seconds by the same SteamID64.
- Ignore kills during warmup/freezetime.
- Close/flush replay candidate on `round_end`.
- Use SteamID64 as the stable identity for camera/HUD matching.

### Config

Plugin config:

```json
{
  "EndpointUrl": "https://ldufk.com/api/replay/events",
  "SharedSecret": "change-me",
  "ServerId": "ldufk-main-1",
  "SendWarmupEvents": false
}
```

Website env vars for the relay route if/when implemented:

```bash
REPLAY_EVENTS_SECRET=change-me
REPLAY_CONTROLLER_URL=http://127.0.0.1:47321/events
```
