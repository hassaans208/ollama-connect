# Backend — Laravel API (Ollama Suite)

This is the Laravel backend powering API connectivity with a local **Ollama** instance — handling model listing, chat, and session management.

---

## Tech Stack

| Component | Version |
|---|---|
| PHP | ^8.3 |
| Laravel Framework | ^13.8 |
| Laravel Sanctum | ^4.0 |
| Pest (testing) | ^4.7 |
| Pint (code style) | ^1.27 |

---

## Prerequisites

- PHP 8.3+
- Composer
- MySQL (or update `DB_CONNECTION` in `.env` to your preferred driver)
- Node.js + npm (for asset building via Vite)
- A running [Ollama](https://ollama.com) instance (see root [README.md](../README.md) for local setup)

---

## Setup

### 1. Install dependencies

```bash
composer install
```

### 2. Environment configuration

Copy the example env file and generate an app key:

```bash
cp .env.example .env
php artisan key:generate
```

Update the following values in `.env` to match your environment:

```env
DB_DATABASE=ollama_suit
DB_USERNAME=root
DB_PASSWORD=

OLLAMA_BASE_URL=http://localhost:11434
CONNECT_APP=
```

> `OLLAMA_BASE_URL` should point to your local or remote Ollama server (default: `http://localhost:11434`).
> `CONNECT_APP` is used by `VerifyAppToken` middleware if you wire it up to an external auth service — see [Authentication Middleware](#authentication-middleware) below.

### 3. Run migrations

```bash
php artisan migrate
```

### 4. (Optional) One-shot setup

The `composer.json` includes a convenience script that does install → env copy → key:generate → migrate → npm install → npm build in one go:

```bash
composer run setup
```

### 5. Run the development server

This project ships with a `composer dev` script that runs the server, queue listener, log viewer (Pail), and Vite dev server concurrently:

```bash
composer run dev
```

Or run them individually:

```bash
php artisan serve
php artisan queue:listen --tries=1 --timeout=0
php artisan pail --timeout=0
npm run dev
```

---

## API Routes

All routes below are protected by the `verify.app.token` middleware.

| Method | Endpoint | Controller Method | Description |
|---|---|---|---|
| GET | `/models` | `OllamaController@models` | List available Ollama models |
| POST | `/chat` | `OllamaController@chat` | Send a chat message to a model |
| GET | `/sessions` | `OllamaController@sessions` | List chat sessions |
| GET | `/sessions/{id}` | `OllamaController@sessionDetail` | Get details of a specific session |
| DELETE | `/sessions/{id}` | `OllamaController@deleteSession` | Delete a chat session |

---

## Authentication Middleware

Requests are gated by `App\Http\Middleware\VerifyAppToken`, registered under the `verify.app.token` alias.

By default, this middleware is a **pass-through stub** — it does not currently enforce authentication:

```php
public function handle(Request $request, Closure $next)
{
    // Use your custom Authentication Logic
    // $token = $request->bearerToken() ?? null;
    // $response = Http::withToken($token)->post(config('app.connect.baseUrl') . '/user/verify', []);

    // if ($response->status() !== 200) {
    //     return response()->json([
    //         'success' => false,
    //         'message' => 'Unauthorized. Invalid or expired token.',
    //     ], 403);
    // }

    return $next($request);
}
```

To enable real token verification:
1. Uncomment the logic in `VerifyAppToken`.
2. Set `CONNECT_APP` in `.env` to your auth service's base URL.
3. Ensure `config('app.connect.baseUrl')` resolves correctly (add a `connect.baseUrl` key to `config/app.php` pointing at `env('CONNECT_APP')` if not already present).

> ⚠️ **Do not deploy to production with this middleware left as a pass-through** — every route under it is currently open to any caller.

---

## Environment Variables Reference

| Variable | Description | Default |
|---|---|---|
| `APP_NAME` | Application name | `Laravel` |
| `APP_ENV` | Environment | `local` |
| `APP_URL` | Base URL | `http://localhost` |
| `DB_CONNECTION` | Database driver | `mysql` |
| `DB_HOST` | Database host | `127.0.0.1` |
| `DB_PORT` | Database port | `3306` |
| `DB_DATABASE` | Database name | `ollama_suit` |
| `DB_USERNAME` | Database user | `root` |
| `DB_PASSWORD` | Database password | _(empty)_ |
| `QUEUE_CONNECTION` | Queue driver | `database` |
| `CACHE_STORE` | Cache driver | `database` |
| `OLLAMA_BASE_URL` | Ollama server URL | `http://localhost:11434` |
| `CONNECT_APP` | External auth service base URL (used by `VerifyAppToken`) | _(empty)_ |

> Never commit a populated `.env` file. Only `.env.example` should be tracked in version control.

---

## Testing

This project uses [Pest](https://pestphp.com):

```bash
composer run test
```

## Code Style

```bash
./vendor/bin/pint
```

---

## Project Structure (relevant parts)

```
backend/
├── app/
│   ├── Http/
│   │   ├── Controllers/Api/OllamaController.php
│   │   └── Middleware/VerifyAppToken.php
├── routes/
│   └── api.php
├── .env.example
└── composer.json
```

---

## Related Docs

- [Setup Ollama - README](../README.md) — Ollama / LM Studio / Qwen Code local AI stack setup
- [Frontend - README](../frontend/README.md) — React app setup
