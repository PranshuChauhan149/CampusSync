# Doweit Voice Assistant — Developer Integration Guide

This guide explains how to add the Doweit AI voice/chat assistant to **your own** website or app.

---

## 1. What you actually get

When you install `@doweit/voice`, you get a **ready-made chat widget** — the floating bubble in the bottom-right corner, the chat panel, the microphone, the text box, all of it.

**You do not build any UI.** You do not design a chat window. The widget *is* the UI. You drop one component (`<DoweitWidget />`) into your app and it renders itself.

What you *do* build is the **list of things the assistant is allowed to do in your app** — adding to a cart, navigating a page, booking something, etc. You write those as normal JavaScript functions and "register" them. The AI then decides, based on what the user says or types, which of your functions to call.

So the split is:

| You provide | Doweit provides |
|---|---|
| Your publishable key | The chat widget UI (bubble, panel, mic, input) |
| A list of JS functions the AI may call ("actions") | The AI itself (Gemini Live), voice streaming, transcription |
| Optionally, your current UI state | The hosted backend that powers all of it |

---

## 2. Requirements

- A **React** app (React 18 or 19). This includes **Next.js**, Vite + React, Create React App, etc.
- A **publishable key** from the Doweit dashboard. It looks like `dw_pub_xxxxxxxx`.
- Your site's **domain added to the whitelist** in the Doweit dashboard (see step 5). This is required — without it the widget will not load on your live site.

> The SDK ships React components. If your site is **not** a React app, it cannot be embedded as-is today — a plain `<script>` / CDN version is not currently available.

---

## 3. Install

```bash
npm install @doweit/voice@latest
```

---

## 4. Add the widget (3 steps)

### Step 1 — Create a client

```jsx
import { DoweitClient } from "@doweit/voice";

const client = new DoweitClient({
    publicKey: "dw_pub_xxxxxxxx", // your key from the Doweit dashboard
});
```

You do **not** need to set a backend URL. The SDK already points at the Doweit hosted backend.

### Step 2 — Register what the assistant can do

Each action has a `description` (the AI reads this to decide when to use it), optional `params`, and a `handler` (your function that actually runs).

```jsx
client.register({
    addToCart: {
        description: "Add a product to the shopping cart.",
        params: {
            productId: { required: true },
            quantity:  { type: "number", required: true },
        },
        handler: async ({ productId, quantity }) => {
            await fetch("/api/cart", {
                method: "POST",
                body: JSON.stringify({ productId, quantity }),
            });
            return { status: "added" };
        },
    },
});
```

You can register as many actions as you want. If you register nothing, the assistant can still chat — it just can't *do* anything in your app.

### Step 3 — Render the widget

```jsx
import { DoweitClient, DoweitWidget } from "@doweit/voice";

const client = new DoweitClient({ publicKey: "dw_pub_xxxxxxxx" });

client.register({ /* ...your actions... */ });

export default function App() {
    return (
        <>
            {/* your normal app */}
            <DoweitWidget client={client} />
        </>
    );
}
```

That is the entire integration. The widget initializes itself, shows a brief "Connecting…" state, then the bubble is live.

**Next.js note:** the widget runs in the browser. Render it from a client component — add `"use client";` at the top of the file that uses `<DoweitWidget>`.

---

## 5. Allow your domain (required before going live)

The widget runs in your users' browsers and calls the Doweit backend. For security, the backend only answers requests from domains you have approved.

1. Go to the **Doweit dashboard** → your app's settings.
2. Find the **domain whitelist**.
3. Add every domain where the widget will run, e.g. `www.yoursite.com`, `app.yoursite.com`.

`localhost` is always allowed, so you can develop locally with no setup. You only need the whitelist for your deployed site.

**If you skip this:** on your live site the widget shows **"Assistant unavailable"** and the browser console shows a domain-authorization or CORS error.

---

## 6. Optional extras

### Give the AI live context

Let the assistant "see" your current UI so users can say "add *this* to my cart" without repeating themselves:

```jsx
client.bindState(() => ({
    currentPage: window.location.pathname,
    cartItemCount: getCart().length,
}));
```

### Let the AI navigate your app

```jsx
import { useRouter } from "next/navigation";

const router = useRouter();
client.enableNavigation(router); // AI can now move users between pages
```

### Identify the user

```jsx
client.setUser({ userId: "user_123", email: "jane@example.com" });
```

### Require confirmation for risky actions

```jsx
client.register({
    deleteAccount: {
        description: "Permanently delete the user's account.",
        dangerous: true, // widget asks the user to confirm before running
        handler: async () => { /* ... */ },
    },
});
```

---

## 7. How it works under the hood

```
  Your website (browser)
  ┌─────────────────────────────┐
  │  <DoweitWidget />            │   the chat bubble UI
  │      │                      │
  │      │ 1. init() + manifest │
  │      ▼                      │
  └──────┼──────────────────────┘
         │  HTTPS  +  WebSocket
         ▼
  Doweit hosted backend
  ┌─────────────────────────────┐
  │  validates your key         │
  │  loads your agent config    │
  │  streams to Gemini Live AI  │
  └─────────────────────────────┘
```

1. **Init** — when the widget mounts, it calls the Doweit backend with your publishable key, which validates the key and your domain, and returns your assistant's configuration (name, voice, greeting).
2. **Manifest sync** — the SDK uploads the list of actions you registered so the dashboard knows your app's capabilities.
3. **Conversation** — when the user speaks or types, audio/text streams over a WebSocket to the backend, which relays it to Gemini Live.
4. **Tool calls** — when the AI decides to use one of your actions, the backend tells the widget, the widget runs *your* `handler` function in the user's browser, and sends the result back. This is why your handlers can touch your own app directly (your cart, your router, your DOM).

Your publishable key is safe to ship in browser code — it only works from domains you whitelisted, and it never has direct access to the AI provider.

---

## 8. Troubleshooting

| Symptom | Cause | Fix |
|---|---|---|
| No bubble appears at all | `<DoweitWidget>` not rendered, or rendered on the server | Ensure it's in a client component (`"use client";` in Next.js) |
| Bubble shows "Assistant unavailable" | Domain not whitelisted, or wrong/inactive key | Add your domain in the dashboard; check the key is correct and the app is "active" |
| Works on `localhost`, fails when deployed | Production domain not whitelisted | Add your live domain to the whitelist |
| "Connecting…" forever | Network blocked, or backend unreachable | Open the browser console — the SDK logs a detailed error |
| AI never calls my action | `description` too vague | Write descriptions the way you'd explain the feature to a person |

Open the browser **developer console** — the SDK logs every step with a `[Doweit ...]` prefix.

---

## 9. Quick reference

```jsx
import { DoweitClient, DoweitWidget, useDoweitVoice } from "@doweit/voice";

const client = new DoweitClient({ publicKey: "dw_pub_..." });

client.register({ actionName: { description, params, handler } });
client.bindState(() => ({ /* live UI state */ }));
client.setUser({ userId, email });
client.enableNavigation(router);

// Render the prebuilt widget:
<DoweitWidget client={client} />

// ...or build your own UI with the hook:
const { status, messages, connect, disconnect, sendText } = useDoweitVoice(client);
```
