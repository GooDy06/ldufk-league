# LDUFK Cams

Безплатний WebRTC camera router для CS2 HUD. Frontend живе в цьому Next.js проєкті на Vercel, signaling server запускається окремо на Render/Fly.io/Railway, metadata зберігається в Supabase.

## Архітектура

- `cams.ldufk.com/admin` -> `/cams/admin`: створення camera rooms, гравців, токенів і join links.
- `cams.ldufk.com/join/[token]` -> `/cams/join/[token]`: приватна сторінка гравця для camera permission і preview.
- `cams.ldufk.com/view/[steamid]` -> `/cams/view/[steamid]`: чиста OBS/HUD webcam view без UI.
- `cams.ldufk.com/room/[roomId]` -> `/cams/room/[roomId]`: одна OBS Browser Source сторінка з усіма камерами room у grid.
- `cams.ldufk.com/hud/active?steamid=...` -> `/cams/hud/active`: iframe endpoint із fallback.
- `components/cams/active-player-camera.tsx`: React компонент `<ActivePlayerCamera steamid={observedSteamId} />`.
- `signaling-server/`: Socket.IO signaling, який перевіряє join token через Supabase і пересилає тільки SDP/ICE.

Відео не йде через Vercel API і не пишеться в базу. WebRTC передає media peer-to-peer, а TURN використовується тільки коли пряме P2P з'єднання недоступне.

## Supabase

Виконай SQL з `supabase/cameras.sql` у Supabase SQL editor.

Таблиці:

- `camera_rooms`
- `camera_players`
- `camera_sessions`

RLS увімкнено без anon policies. Next.js server actions і signaling server працюють через `SUPABASE_SERVICE_ROLE_KEY`.

## Env для Vercel frontend

```env
NEXT_PUBLIC_SUPABASE_URL=https://your-project.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=your-anon-key
SUPABASE_SERVICE_ROLE_KEY=your-service-role-key

CAMS_ADMIN_PASSWORD=strong-admin-password
CAMS_ADMIN_SESSION_SECRET=random-long-secret
CAMS_SIGNALING_ADMIN_SECRET=random-shared-signaling-secret
NEXT_PUBLIC_CAMS_ORIGIN=https://cams.ldufk.com
NEXT_PUBLIC_CAMS_SIGNALING_URL=https://your-cams-signaling.onrender.com

NEXT_PUBLIC_CAMS_STUN_URLS=stun:stun.l.google.com:19302,stun:global.stun.twilio.com:3478
CAMS_TURN_URLS=turn:your-turn.example.com:3478
CAMS_TURN_USERNAME=turn-user
CAMS_TURN_CREDENTIAL=turn-password
```

TURN env можна не ставити на старті. STUN вистачить для частини мереж, але для турнірів краще мати TURN.

## Env для signaling server

```env
PORT=4000
NEXT_PUBLIC_SUPABASE_URL=https://your-project.supabase.co
SUPABASE_SERVICE_ROLE_KEY=your-service-role-key
CAMS_ALLOWED_ORIGINS=http://localhost:3000,https://cams.ldufk.com,https://ldufk.com
CAMS_SIGNALING_ADMIN_SECRET=random-shared-signaling-secret
```

## Локальний запуск

```bash
npm install
npm run dev
```

В іншому терміналі:

```bash
cd signaling-server
npm install
cp .env.example .env
npm run dev
```

Локальні URLs:

- Admin: `http://localhost:3000/cams/admin`
- Join: `http://localhost:3000/cams/join/[token]`
- Viewer: `http://localhost:3000/cams/view/[steamid]?mode=cover&rounded=true&muted=true`
- HUD endpoint: `http://localhost:3000/cams/hud/active?steamid=[steamid]`

## Vercel deploy

1. Deploy основний repo як звичайний Next.js проєкт.
2. Додай env vars з секції frontend.
3. У Vercel Project Domains додай `cams.ldufk.com`.
4. Middleware автоматично rewrite-ить `cams.ldufk.com/admin` у `/cams/admin`, `cams.ldufk.com/join/...` у `/cams/join/...`, `cams.ldufk.com/view/...` у `/cams/view/...`.

Vercel Functions не підходять для Socket.IO/WebSocket server, тому `signaling-server/` деплоїться окремо.

## Render/Fly.io/Railway deploy для signaling

Render:

- Root directory: `signaling-server`
- Build command: `npm install && npm run build`
- Start command: `npm run start`
- Environment: Node
- Health check path: `/health`

Railway/Fly.io аналогічно: запускається Node app з `signaling-server`, порт береться з `PORT`.

## Cloudflare DNS

1. Для Vercel frontend створи `CNAME`:
   - Name: `cams`
   - Target: `cname.vercel-dns.com`
   - Proxy: DNS only або Proxied, якщо Vercel domain verification проходить коректно.
2. У Vercel додай domain `cams.ldufk.com` і дочекайся Valid Configuration.
3. Для signaling server використовуй окремий піддомен, наприклад `cams-signal.ldufk.com`, який вказує на Render/Fly/Railway target.
4. У Vercel env встанови `NEXT_PUBLIC_CAMS_SIGNALING_URL=https://cams-signal.ldufk.com`.

## HUD integration

```tsx
import { ActivePlayerCamera } from "@/components/cams";
import { getObservedSteamId } from "@/lib/cams/observed";

export function HudOverlay({ gameState }: { gameState: unknown }) {
  const observedSteamId = getObservedSteamId(gameState);

  return (
    <div className="h-40 w-72">
      <ActivePlayerCamera steamid={observedSteamId} />
    </div>
  );
}
```

`getObservedSteamId(gameState)` перевіряє типові LHM/CS2 GSI поля: `observed`, `observer`, `active_player`, `current_player`, `player.steamid`.

## OBS Browser Source

Чиста камера:

```text
https://cams.ldufk.com/view/7656119XXXXXXXXXX?mode=cover&rounded=true&muted=true
```

Цей OBS link генерується автоматично для кожного player в `/admin`.

Для OBS зі звуком мікрофона і nickname overlay:

```text
https://cams.ldufk.com/view/7656119XXXXXXXXXX?mode=cover&rounded=true&muted=false&name=true
```

Гравець має увімкнути `Enable microphone for OBS` на join page. HUD links лишай з `muted=true`.

Auto-switch iframe:

```text
https://cams.ldufk.com/hud/active?steamid=7656119XXXXXXXXXX&mode=cover&rounded=true&muted=true
```

Усі камери room однією OBS Browser Source:

```text
https://cams.ldufk.com/room/ROOM_UUID?mode=cover&rounded=true&names=true
```

У власному React HUD краще використовувати `<ActivePlayerCamera />`, бо він перемикає stream без reload всієї HUD сторінки.

## Тестовий сценарій

1. Admin відкриває `http://localhost:3000/cams/admin`, вводить `CAMS_ADMIN_PASSWORD`, створює room.
2. Admin додає player вручну: nickname, team, SteamID64, avatar optional.
3. Admin копіює generated join link.
4. Player відкриває join link, обирає камеру, натискає `Enable camera`.
5. Signaling server ставить `camera_players.is_online = true` і створює `camera_sessions`.
6. HUD отримує active observed player SteamID64 через LHM/CS2 GSI.
7. HUD передає SteamID у `<ActivePlayerCamera steamid={observedSteamId} />`.
8. Component підключається до signaling server як viewer і показує правильний WebRTC stream.
9. Якщо player offline, HUD показує avatar або initials placeholder і не ламається.

## Emergency / Rollback

Якщо треба швидко вимкнути LDUFK Cams і повернути HUD до старих LHM webcams:

1. У HUD settings увімкнути `Disable LDUFK cams service`, якщо цей flag доступний.
2. Або перед build/start HUD поставити:

```env
REACT_APP_USE_LDUFK_CAMS=false
```

3. У Vercel можна тимчасово зламати тільки нову camera integration без впливу на сайт:

```env
NEXT_PUBLIC_CAMS_SIGNALING_URL=
```

Після зміни env потрібен redeploy. Старий LHM HUD має продовжити працювати, якщо HUD fallback зроблений правильно.

Щоб прибрати окрему камеру:

- `Remove camera` в `/admin` тільки відключає live stream/player session, але player лишається у списку.
- `Delete player` повністю видаляє player row, join link і OBS link для нього.

Щоб тимчасово не використовувати cams у трансляції:

- Видалити або сховати OBS Browser Sources із `https://cams.ldufk.com/view/...`.
- У HUD вимкнути `USE_LDUFK_CAMS`.
- Render signaling server можна не чіпати, він не передає відео без активних viewers.

Корисні production URLs:

```text
Admin:
https://cams.ldufk.com/admin

Player join:
https://cams.ldufk.com/join/[token]

Single OBS camera:
https://cams.ldufk.com/view/[steamid]?mode=cover&rounded=true&muted=true

Auto-switch HUD iframe:
https://cams.ldufk.com/hud/active?steamid=[steamid]&mode=cover&rounded=true&muted=true

Room grid:
https://cams.ldufk.com/room/[roomId]?mode=cover&rounded=true&names=true

Signaling health:
https://ldufk-cams-signal.onrender.com/health
```

Env checklist:

Vercel:

```env
NEXT_PUBLIC_CAMS_ORIGIN=https://cams.ldufk.com
NEXT_PUBLIC_CAMS_SIGNALING_URL=https://ldufk-cams-signal.onrender.com
CAMS_ADMIN_PASSWORD=...
CAMS_ADMIN_SESSION_SECRET=...
CAMS_SIGNALING_ADMIN_SECRET=...
NEXT_PUBLIC_SUPABASE_URL=...
NEXT_PUBLIC_SUPABASE_ANON_KEY=...
SUPABASE_SERVICE_ROLE_KEY=...
NEXT_PUBLIC_CAMS_STUN_URLS=stun:stun.l.google.com:19302,stun:global.stun.twilio.com:3478
```

Render:

```env
NEXT_PUBLIC_SUPABASE_URL=...
SUPABASE_SERVICE_ROLE_KEY=...
CAMS_ALLOWED_ORIGINS=https://cams.ldufk.com,https://ldufk.com
CAMS_SIGNALING_ADMIN_SECRET=...
```

Якщо camera page працює, але HUD не показує камеру:

1. Перевірити `https://cams.ldufk.com/hud/active?steamid=STEAMID64&mode=cover&rounded=true&muted=true`.
2. Якщо прямий URL показує камеру, проблема у HUD mapping/fallback.
3. У HUD console перевірити `Observed SteamID: ...`.
4. Якщо SteamID `null` або не той, треба поправити `getObservedSteamId(gameState)`.
5. Якщо SteamID правильний, але LDUFK stream offline, HUD має показати старий LHM webcam або avatar.
