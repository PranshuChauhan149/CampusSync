// ─── TTS ENGINE ──────────────────────────────────────────────────────────────
let ttsRate = 1;
let ttsPitch = 1;

export function speak(text, { rate = ttsRate, pitch = ttsPitch, interrupt = true } = {}) {
  if (!window.speechSynthesis) return;
  if (interrupt) window.speechSynthesis.cancel();
  const utt = new SpeechSynthesisUtterance(text);
  utt.rate = rate;
  utt.pitch = pitch;
  utt.lang = "en-US";
  window.speechSynthesis.speak(utt);
  return utt;
}

export function stopSpeaking() {
  if (window.speechSynthesis) window.speechSynthesis.cancel();
}

// ─── PAGE CONTEXT ─────────────────────────────────────────────────────────────
const PAGE_DESCRIPTIONS = {
  "/": {
    name: "Home",
    desc: "The CampusSync home page. Here you can see the hero section, features overview, and navigate to all major sections of the platform.",
    actions: ["Go to marketplace", "Go to lost and found", "Generate notes", "Start interview practice", "Login or register"],
  },
  "/market": {
    name: "Marketplace",
    desc: "The Campus Marketplace. Browse items posted for sale by students. You can search, filter by category, or sell your own item.",
    actions: ["Search for an item", "Filter by category", "Sell an item", "Read the first listing"],
  },
  "/sell": {
    name: "Marketplace",
    desc: "The Campus Marketplace. Browse items posted for sale by students.",
    actions: ["Search for an item", "Filter by category", "Sell an item", "Read the first listing"],
  },
  "/sell/add": {
    name: "Sell Item Form",
    desc: "The post item for sale form. Fill in the title, price, category, condition, description and location to list your item.",
    actions: ["Fill this form for me", "Submit this form"],
  },
  "/lost-found": {
    name: "Lost and Found",
    desc: "The Campus Lost and Found board. Browse lost and found items, filter by type or category, and post your own item.",
    actions: ["Search lost and found", "Post a lost item", "Read first item", "Read next item"],
  },
  "/lost-found/add": {
    name: "Report Lost or Found Item",
    desc: "The report item form. You can report a lost or found item by filling in the type, title, description, category, location and date.",
    actions: ["Fill this form for me", "Submit this form"],
  },
  "/note": {
    name: "AI Notes Generator",
    desc: "The ExamNotes AI study workspace. Enter a topic to generate AI-powered study notes with diagrams and charts.",
    actions: ["Generate notes on a topic", "View my notes history", "Read notes aloud"],
  },
  "/notes/history": {
    name: "Notes History",
    desc: "Your previously generated AI study notes history.",
    actions: ["Go back to notes generator"],
  },
  "/ai-interview": {
    name: "AI Interview Home",
    desc: "The AI Interview Simulator home page. Start a mock interview to practice for jobs.",
    actions: ["Start interview", "View interview history"],
  },
  "/ai-interview/start": {
    name: "Interview Setup",
    desc: "The interview setup form. Choose your job role, experience level, and interview mode to begin a mock interview.",
    actions: ["Set up my interview", "Start interview"],
  },
  "/ai-interview/history": {
    name: "Interview History",
    desc: "Your past AI mock interview results and reports.",
    actions: ["View a report", "Start a new interview"],
  },
  "/profile": {
    name: "My Profile",
    desc: "Your profile page. View and edit your name, email, phone, and profile photo. Also see your post statistics.",
    actions: ["Edit my profile", "View my sell items", "View my lost and found posts"],
  },
  "/login": {
    name: "Login",
    desc: "The login page. Enter your email and password to sign in.",
    actions: ["Fill login form", "Go to register"],
  },
  "/register": {
    name: "Register",
    desc: "The registration page. Create a new account with your name, phone, email and password.",
    actions: ["Fill sign up form"],
  },
  "/pricing": {
    name: "Pricing",
    desc: "The pricing and credits page. Buy AI credits to generate study notes.",
    actions: ["Buy credits"],
  },
  "/chat": {
    name: "Chat",
    desc: "The messaging page. Chat with other students about marketplace items or lost and found.",
    actions: ["Read messages", "Send a message"],
  },
};

export function getPageContext(pathname) {
  // Match dynamic routes
  if (pathname.startsWith("/sell/") && pathname !== "/sell/add") return {
    name: "Item Detail", desc: "A marketplace item detail page. View the product info, price, seller details and contact options.",
    actions: ["Read product details", "Contact seller", "Go back to marketplace"],
  };
  if (pathname.startsWith("/item/")) return {
    name: "Lost & Found Item Detail", desc: "A lost or found item detail page. View all details and contact the poster.",
    actions: ["Read item details", "Claim this item", "Contact item owner"],
  };
  if (pathname.startsWith("/ai-interview/report/")) return {
    name: "Interview Report", desc: "Your interview analytics report with scores, skill evaluation and AI feedback.",
    actions: ["Read my score", "Read feedback", "Explain my mistakes"],
  };
  return PAGE_DESCRIPTIONS[pathname] || {
    name: "CampusSync Page",
    desc: `You are on the page: ${pathname}.`,
    actions: ["Go home", "Open marketplace", "Open lost and found"],
  };
}

// ─── DOM READERS ──────────────────────────────────────────────────────────────
export function readPageText() {
  const main = document.querySelector("main") || document.querySelector(".min-h-screen") || document.body;
  const clone = main.cloneNode(true);
  // Remove nav, footer, buttons
  clone.querySelectorAll("nav, footer, button, script, style, svg").forEach(el => el.remove());
  const text = clone.innerText || clone.textContent || "";
  return text.replace(/\s+/g, " ").trim().slice(0, 800);
}

export function getVisibleCards() {
  // Try to find item cards on the page
  const cards = Array.from(document.querySelectorAll(
    "[class*='rounded-2xl'], [class*='rounded-xl'], article, [class*='card']"
  )).filter(el => {
    const rect = el.getBoundingClientRect();
    return rect.width > 100 && rect.height > 60 && rect.top < window.innerHeight;
  });
  return cards;
}

export function readCard(card) {
  if (!card) return "No item found.";
  const clone = card.cloneNode(true);
  clone.querySelectorAll("button, svg, script").forEach(el => el.remove());
  return (clone.innerText || clone.textContent || "").replace(/\s+/g, " ").trim().slice(0, 300);
}

// ─── REACT-AWARE FILL HELPER ──────────────────────────────────────────────────
// React controlled inputs store state in React's fiber - setting .value directly
// doesn't update it. We must use React's native setter + dispatch a React-compatible
// input event to properly trigger onChange handlers.
const nativeInputSetter = Object.getOwnPropertyDescriptor(window.HTMLInputElement?.prototype, "value")?.set;
const nativeTextAreaSetter = Object.getOwnPropertyDescriptor(window.HTMLTextAreaElement?.prototype, "value")?.set;
const nativeSelectSetter = Object.getOwnPropertyDescriptor(window.HTMLSelectElement?.prototype, "value")?.set;

function setNativeValue(el, value) {
  if (!el) return;
  if (el.tagName === "TEXTAREA" && nativeTextAreaSetter) {
    nativeTextAreaSetter.call(el, value);
  } else if (el.tagName === "SELECT" && nativeSelectSetter) {
    nativeSelectSetter.call(el, value);
  } else if (nativeInputSetter) {
    nativeInputSetter.call(el, value);
  } else {
    el.value = value;
  }
  el.dispatchEvent(new Event("input", { bubbles: true }));
  el.dispatchEvent(new Event("change", { bubbles: true }));
}

export async function fillWhenReady(selectorsAndValues, submitSelector = null, delay = 120) {
  // Wait up to a few times for elements to appear
  for (let retries = 0; retries < 15; retries++) {
    const allFound = Object.entries(selectorsAndValues).every(([selector, val]) => {
      if (val === undefined || val === null) return true;
      return !!document.querySelector(selector);
    });
    if (allFound) break;
    await new Promise(r => setTimeout(r, delay));
  }

  for (const [selector, value] of Object.entries(selectorsAndValues)) {
    if (value === undefined || value === null) continue;
    const el = document.querySelector(selector);
    if (!el) continue;
    
    // Instantly set the value to avoid any perceived lag
    const valStr = String(value);
    if (el.value !== valStr) {
      setNativeValue(el, value);
    }
  }

  if (submitSelector) {
    await new Promise(r => setTimeout(r, 100)); // Minimal delay for submit
    const btn = document.querySelector(submitSelector);
    if (btn) {
      btn.click();
      return { success: true, submitted: true };
    }
    return { success: true, submitted: false };
  }

  return { success: true };
}

export function setNativeField(selector, value) {
  const el = document.querySelector(selector);
  if (el) setNativeValue(el, value);
  return !!el;
}
