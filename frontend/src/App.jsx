import React from "react";
import { Navigate, Route, Routes, useNavigate } from "react-router-dom";
import Home from "./pages/Home";
import { DoweitClient, DoweitWidget } from "@doweit/voice";
import { speak, stopSpeaking, getPageContext, readPageText, getVisibleCards, readCard, fillWhenReady as fwr } from "./utils/voiceActions";



const fillWhenReady = fwr;
// voiceActions fillWhenReady replaces the inline version below
import SignUp from "./pages/SignUp";

import { Toaster } from "react-hot-toast";
import Login from "./pages/Login";
import Navbar from "./components/Navbar";
import Footer from "./components/Footer";
import LostAndFound from "./pages/LostAndFound";
import { useEffect, useRef, useState } from "react";
import {  getCurrentuser } from "./servers/api";
import { useDispatch, useSelector } from "react-redux";
import StudyHome from "./pages/StudyHome";
import Contact from "./pages/Contact";
import About from "./pages/About";
import Notes from "./pages/Notes";
import AddItemForm from "./pages/AddItemForm";
import History from "./pages/History";
import Pricing from "./pages/Priceing";
import PaymentSuccess from "./pages/PaymentSuccess";
import PaymentFailed from "./pages/PaymentFailed";
import FloatingActions from "./components/FloatingActions";
import ItemDetailPage from "./pages/itemDetailPage";
import ClaimItemForm from "./pages/ClaimItemForm";
import ClaimRequestPages from "./pages/ClaimRequestPages";
import MyClaim from "./pages/MyClaim";
import MarketPlace from "./pages/MarketPlace";
import AddSellItem from "./pages/AddSellItem";
import MarketItemDetailPage from "./pages/MarketItemDetailPage";
import Profile from "./pages/Profile";
import UserSellPost from "./pages/UserSellPost";
import Chat from "./pages/Chat";
import { useTheme } from "./context/ThemeContext";
import { io } from "socket.io-client";
import { serverUrl } from "./main";
import { setOnlineUsers, setSocket } from "./redux/messageSlice";
import SellLostAndFoundPostedItem from "./pages/SellLostAndFoundPostedItem";
import AiInterviewHome from "./pages/AiInterviewPages/AiInterviewHome";
import InterviewPage from "./pages/AiInterviewPages/InterviewPage";
import InterviewHistory from "./pages/AiInterviewPages/InterviewHistory";
import InterviewReport from "./pages/AiInterviewPages/InterviewReport";


const App = () => {
  const dispatch = useDispatch();
  const itemIndexRef = useRef(0);
  const {userData} = useSelector((state)=>state.user)
  const { isDark, toggleTheme } = useTheme()
  const navigate = useNavigate();
  console.log(userData);

  const [doweitClient] = useState(() => new DoweitClient({
    publicKey: import.meta.env.VITE_DOWEIT_PUBLIC_KEY || "dw_pub_campussync",
  }));
 
  // Store dynamic context values in a Ref to avoid stale closures in registered actions without re-registering
  const stateRef = useRef({ isDark, userData, toggleTheme, navigate });
  useEffect(() => {
    stateRef.current = { isDark, userData, toggleTheme, navigate };
  }, [isDark, userData, toggleTheme, navigate]);
 
  // 1. Setup and Action Registration - RUN ONCE on mount
  useEffect(() => {
    doweitClient.register({
      navigateTo: {
        description: "Navigate to a specific page or section in the CampusSync app.",
        params: {
          path: { 
            required: true, 
            description: "The path to navigate to, e.g., '/' (Home), '/market' (Marketplace), '/lost-found' (Lost & Found), '/profile' (My Profile), '/pricing' (Pricing/Credits), '/ai-interview' (AI Interview Simulator), '/note' (Generate Study Notes)" 
          }
        },
        handler: async ({ path }) => {
          stateRef.current.navigate(path);
          return { status: "success", message: `Navigated to ${path}` };
        }
      },
      listSellItem: {
        description: "Go to the sell item form to post a new item for sale in the marketplace.",
        handler: async () => {
          stateRef.current.navigate("/sell/add");
          return { status: "success", message: "Navigated to sell item page" };
        }
      },
      postLostItem: {
        description: "Go to the form to report a lost or found item.",
        handler: async () => {
          stateRef.current.navigate("/lost-found/add");
          return { status: "success", message: "Navigated to post lost/found item page" };
        }
      },
      startInterview: {
        description: "Go to the AI interview simulator page to start a mock interview.",
        handler: async () => {
          stateRef.current.navigate("/ai-interview");
          return { status: "success", message: "Navigated to AI interview page" };
        }
      },
      generateNotes: {
        description: "Go to the study notes generator page to create AI notes.",
        handler: async () => {
          stateRef.current.navigate("/note");
          return { status: "success", message: "Navigated to notes generator page" };
        }
      },
      searchLostAndFound: {
        description: "Search for lost or found items on campus, optionally filtered by type (lost or found) or category.",
        params: {
          query: { type: "string", required: false, description: "The term to search for (e.g. keys, phone, bottle)" },
          type: { type: "string", required: false, description: "Filter by type: 'lost' or 'found'" },
          category: { type: "string", required: false, description: "Filter by category: electronics, books, clothing, documents, keys, wallet, bag, mobile, laptop, other" }
        },
        handler: async ({ query = "", type = "all", category = "all" }) => {
          stateRef.current.navigate(`/lost-found?search=${encodeURIComponent(query)}&type=${type}&category=${category}`);
          return { status: "success", message: `Searching Lost & Found for '${query}'` };
        }
      },
      searchMarketplace: {
        description: "Search the campus marketplace for items for sale, optionally filtered by category.",
        params: {
          query: { type: "string", required: false, description: "The item name or term to search for (e.g. calculator, mattress, book)" },
          category: { type: "string", required: false, description: "Filter by category: books, electronics, accessories, clothing, stationery, furniture, other" }
        },
        handler: async ({ query = "", category = "all" }) => {
          stateRef.current.navigate(`/market?search=${encodeURIComponent(query)}&category=${category}`);
          return { status: "success", message: `Searching marketplace for '${query}'` };
        }
      },
      toggleAppTheme: {
        description: "Switch the application's appearance between dark mode and light mode.",
        handler: async () => {
          stateRef.current.toggleTheme();
          return { status: "success", message: "Toggled theme." };
        }
      },
      checkCredits: {
        description: "Check how many AI credits the user has available.",
        handler: async () => {
          const credits = stateRef.current.userData?.credits || 0;
          return { status: "success", credits, message: `You have ${credits} credits left.` };
        }
      },
      buyCredits: {
        description: "Go to the pricing page to buy more AI credits.",
        handler: async () => {
          stateRef.current.navigate("/pricing");
          return { status: "success", message: "Navigated to pricing/credits shop page" };
        }
      },
      viewNotesHistory: {
        description: "Go to the history page to view previously generated AI study notes.",
        handler: async () => {
          stateRef.current.navigate("/notes/history");
          return { status: "success", message: "Navigated to notes history page" };
        }
      },
      fillSignUpForm: {
        description: "Fills out the user registration/sign-up form. Extract any and all information the user provides at once. If any required information (Name, Phone, Email, Password) is missing, ask for it. After ALL fields are filled, say 'All fields are ready! Shall I create your account now?' and WAIT for confirmation. Only call with submit:true after user confirms.",
        params: {
          name: { type: "string", required: false, description: "Full Name." },
          phone: { type: "string", required: false, description: "Phone number." },
          email: { type: "string", required: false, description: "Email address." },
          password: { type: "string", required: false, description: "Password." },
          submit: { type: "boolean", required: false, description: "Set to true ONLY after user explicitly confirms they want to create the account." }
        },
        handler: async ({ name, phone, email, password, submit = false }) => {
          if (window.location.pathname !== "/register") {
            stateRef.current.navigate("/register");
            await new Promise(r => setTimeout(r, 400));
          }
          const map = {};
          if (name) map['input[name="name"]'] = name;
          if (phone) map['input[name="phone"]'] = phone;
          if (email) map['input[name="email"]'] = email;
          if (password) map['input[name="password"]'] = password;
          const submitSelector = submit
            ? null  // handled manually below for reliability
            : null;
          await fillWhenReady(map, null);
          if (submit) {
            await new Promise(r => setTimeout(r, 300));
            // Find by button text since button has no type=submit in this form
            const btn = Array.from(document.querySelectorAll("button")).find(
              b => /create account|sign up|register/i.test(b.textContent)
            ) || document.querySelector('button[type="submit"]');
            if (btn) {
              btn.click();
            } else {
              const form = document.querySelector("form");
              if (form) try { form.requestSubmit(); } catch (_) {}
            }
          }
          return { status: "success", submitted: submit };
        }
      },
      fillLoginForm: {
        description: "Fills out the login form. Extract the email and password if the user provides them. If any are missing, ask for them. After both are filled say 'Ready to log in! Shall I sign you in?' and WAIT for the user to confirm. Only call with submit:true after they say yes.",
        params: {
          email: { type: "string", required: false, description: "Email address." },
          password: { type: "string", required: false, description: "Password." },
          submit: { type: "boolean", required: false, description: "Set to true ONLY after user confirms they want to log in." }
        },
        handler: async ({ email, password, submit = false }) => {
          if (window.location.pathname !== "/login") {
            stateRef.current.navigate("/login");
            await new Promise(r => setTimeout(r, 400));
          }
          const map = {};
          if (email) map['input[name="email"]'] = email;
          if (password) map['input[name="password"]'] = password;
          await fillWhenReady(map, null);
          if (submit) {
            await new Promise(r => setTimeout(r, 300));
            const btn = Array.from(document.querySelectorAll("button")).find(
              b => /log in|login|sign in|signin/i.test(b.textContent)
            ) || document.querySelector('button[type="submit"]');
            if (btn) {
              btn.click();
            } else {
              const form = document.querySelector("form");
              if (form) try { form.requestSubmit(); } catch (_) {}
            }
          }
          return { status: "success", submitted: submit };
        }
      },
      fillLostItemForm: {
        description: "Fills out the report lost or found item form. Extract any and all details the user provides from their description and infer the fields as appropriately as you can. Call this action to update the form so they see it typing. If essential fields (Type, Title, Category, Location, Date) are missing, ask for them. Do NOT list or repeat the details of what you filled in the form back to the user; they can see it on screen. Simply say 'I've filled out the form. Ready to post?' or 'All done! Shall I post this item?' and WAIT for confirmation. Only call with submit:true after user confirms.",
        params: {
          type: { type: "string", required: false, description: "Type: 'lost' or 'found'." },
          title: { type: "string", required: false, description: "Title of the item." },
          description: { type: "string", required: false, description: "Description." },
          category: { type: "string", required: false, description: "Category. Must be one of: electronics, books, clothing, accessories, documents, keys, wallet, bag, id_cards, mobile, laptop, pets, jewelry, vehicles, other." },
          location: { type: "string", required: false, description: "Location." },
          date: { type: "string", required: false, description: "Date (YYYY-MM-DD). If user doesn't say, ask them or use today's date." },
          submit: { type: "boolean", required: false, description: "Set to true ONLY after user confirms posting." }
        },
        handler: async ({ type, title, description, category, location, date, submit = false }) => {
          if (window.location.pathname !== "/lost-found/add") {
            stateRef.current.navigate("/lost-found/add");
            await new Promise(r => setTimeout(r, 400));
          }
 
          let finalTitle = title;
          let finalDescription = description || "No description provided.";
          let finalLocation = location;
          let finalDate = date;
          let finalCategory = category;

          if (submit) {
            if (!finalTitle) finalTitle = "Lost/Found Item";
            if (!finalLocation) finalLocation = "Campus";
            if (!finalCategory) finalCategory = "other";
            if (!finalDate || finalDate.toLowerCase() === "today") {
              finalDate = new Date().toISOString().split("T")[0];
            }
          } else if (finalDate && finalDate.toLowerCase() === "today") {
            finalDate = new Date().toISOString().split("T")[0];
          }

          const map = {};
          if (finalTitle) map['input[placeholder="e.g. Black Backpack"]'] = finalTitle;
          if (finalDescription) map['textarea[placeholder="Details about the item..."]'] = finalDescription;
          if (finalLocation) map['input[placeholder="Where lost/found?"]'] = finalLocation;
          if (finalDate) map['input[type="date"]'] = finalDate;
 
          await fillWhenReady(map);

          const nativeSel = Object.getOwnPropertyDescriptor(window.HTMLSelectElement?.prototype, "value")?.set;
          await new Promise(r => setTimeout(r, 200));

          if (type) {
            const label = type.toLowerCase() === "found" ? "Found Item" : "Lost Item";
            const toggleBtn = Array.from(document.querySelectorAll("button")).find(b => b.textContent.includes(label));
            if (toggleBtn) toggleBtn.click();
          }

          if (finalCategory) {
            const select = document.querySelector("select");
            if (select) {
              if (nativeSel) nativeSel.call(select, finalCategory.toLowerCase());
              else select.value = finalCategory.toLowerCase();
              select.dispatchEvent(new Event("input", { bubbles: true }));
              select.dispatchEvent(new Event("change", { bubbles: true }));
            }
          }

          if (submit) {
            await new Promise(r => setTimeout(r, 300));
            const postBtn = Array.from(document.querySelectorAll("button")).find(b => /post item/i.test(b.textContent));
            if (postBtn) { 
              postBtn.click(); 
            } else { 
              const form = document.querySelector("form"); 
              if (form) try { form.requestSubmit(); } catch (_) {}
            }
          }
 
          return { status: "success", submitted: submit };
        }
      },
      // ── ACCESSIBILITY / TTS ACTIONS ────────────────────────────────────────
      stopSpeaking: {
        description: "Stop the assistant from reading aloud. Use when the user says 'stop', 'quiet', 'stop reading', or 'silence'.",
        handler: async () => { stopSpeaking(); return { status: "stopped" }; }
      },
      readCurrentPage: {
        description: "Read aloud the main content of the current page. Use for 'read this page', 'read the screen', 'what does this page say'.",
        handler: async () => {
          const text = readPageText();
          if (!text) { speak("This page appears to be empty."); return { status: "empty" }; }
          speak(text);
          return { status: "reading", preview: text.slice(0, 120) };
        }
      },
      describeThisPage: {
        description: "Describe what the current page is about and what the user can do on it. Use for 'describe this page', 'what is this page', 'summarize this screen'.",
        handler: async () => {
          const ctx = getPageContext(window.location.pathname);
          const msg = `You are on the ${ctx.name} page. ${ctx.desc}`;
          speak(msg);
          return { status: "described", page: ctx.name, description: ctx.desc };
        }
      },
      whatCanIDoHere: {
        description: "Tell the user what actions they can do on the current page. Use for 'what can I do here', 'what features are available', 'help me use this page'.",
        handler: async () => {
          const ctx = getPageContext(window.location.pathname);
          const actions = ctx.actions?.join(", ") || "navigate, search, or contact support";
          const msg = `On the ${ctx.name} page you can: ${actions}.`;
          speak(msg);
          return { status: "ok", page: ctx.name, availableActions: ctx.actions };
        }
      },
      readFirstItem: {
        description: "Read the first item card visible on the current page. Use for 'read first listing', 'read first item', 'start reading items'.",
        handler: async () => {
          itemIndexRef.current = 0;
          const cards = getVisibleCards();
          if (!cards.length) { speak("No items found on this page."); return { status: "empty" }; }
          const text = readCard(cards[0]);
          speak(`Item 1 of ${cards.length}. ${text}`);
          return { status: "reading", index: 1, total: cards.length, text };
        }
      },
      readNextItem: {
        description: "Read the next item card in the list. Use for 'next item', 'next listing', 'continue reading'.",
        handler: async () => {
          const cards = getVisibleCards();
          if (!cards.length) { speak("No items found."); return { status: "empty" }; }
          itemIndexRef.current = Math.min(itemIndexRef.current + 1, cards.length - 1);
          const idx = itemIndexRef.current;
          const text = readCard(cards[idx]);
          speak(`Item ${idx + 1} of ${cards.length}. ${text}`);
          return { status: "reading", index: idx + 1, total: cards.length, text };
        }
      },
      readPreviousItem: {
        description: "Read the previous item card in the list. Use for 'previous item', 'go back', 'read previous listing'.",
        handler: async () => {
          const cards = getVisibleCards();
          if (!cards.length) { speak("No items found."); return { status: "empty" }; }
          itemIndexRef.current = Math.max(itemIndexRef.current - 1, 0);
          const idx = itemIndexRef.current;
          const text = readCard(cards[idx]);
          speak(`Item ${idx + 1} of ${cards.length}. ${text}`);
          return { status: "reading", index: idx + 1, total: cards.length, text };
        }
      },
      readSelectedItem: {
        description: "Read the currently selected or focused item. Use for 'read selected item', 'what is this item', 'read this'.",
        handler: async () => {
          const cards = getVisibleCards();
          if (!cards.length) { speak("No items are currently visible."); return { status: "empty" }; }
          const idx = itemIndexRef.current;
          const text = readCard(cards[Math.min(idx, cards.length - 1)]);
          speak(text);
          return { status: "reading", text };
        }
      },
      howManyItems: {
        description: "Tell the user how many items are visible on the current page. Use for 'how many items', 'how many listings'.",
        handler: async () => {
          const cards = getVisibleCards();
          const n = cards.length;
          speak(n ? `There are ${n} items on this page.` : "No items found on this page.");
          return { status: "ok", count: n };
        }
      },
      openCurrentItem: {
        description: "Open or click the currently selected item to go to its detail page. Use for 'open this item', 'view details', 'open selected item'.",
        handler: async () => {
          const cards = getVisibleCards();
          if (!cards.length) { speak("No items found."); return { status: "empty" }; }
          const idx = Math.min(itemIndexRef.current, cards.length - 1);
          const link = cards[idx].querySelector("a") || cards[idx].closest("a");
          if (link) { link.click(); return { status: "opened" }; }
          cards[idx].click();
          return { status: "clicked" };
        }
      },
      // ── MARKETPLACE ACTIONS ────────────────────────────────────────────────
      fillSellItemForm: {
        description: "Fill out the sell item form. Ask ONE field at a time: title, then price, then category, then condition, then description, then location. After all fields are filled say 'All done! Shall I post this item?' and WAIT. Only call with submit:true after user confirms.",
        params: {
          title: { type: "string", required: false, description: "Item title. Ask first." },
          price: { type: "string", required: false, description: "Price in rupees. Ask second." },
          category: { type: "string", required: false, description: "Category: books, electronics, accessories, clothing, stationery, furniture, other. Ask third." },
          condition: { type: "string", required: false, description: "Condition: new, like_new, good, fair. Ask fourth." },
          description: { type: "string", required: false, description: "Item description. Ask fifth." },
          location: { type: "string", required: false, description: "Location on campus. Ask sixth." },
          submit: { type: "boolean", required: false, description: "Set to true ONLY after user confirms posting." }
        },
        handler: async ({ title, price, category, condition, description, location, submit = false }) => {
          if (window.location.pathname !== "/sell/add") {
            stateRef.current.navigate("/sell/add");
            await new Promise(r => setTimeout(r, 400));
          }
          const map = {};
          if (title) map['input[placeholder="e.g. Engineering Drawing Kit"]'] = title;
          if (price) map['input[placeholder="Enter price"]'] = price;
          if (description) map['textarea[placeholder="Item details..."]'] = description;
          if (location) map['input[placeholder="e.g. Hostel Block A"]'] = location;
          await fillWhenReady(map);
          const nativeSel = Object.getOwnPropertyDescriptor(window.HTMLSelectElement?.prototype, "value")?.set;
          await new Promise(r => setTimeout(r, 200));
          const selects = document.querySelectorAll("select");
          if (category && selects[0]) {
            if (nativeSel) nativeSel.call(selects[0], category);
            else selects[0].value = category;
            selects[0].dispatchEvent(new Event("input", { bubbles: true }));
            selects[0].dispatchEvent(new Event("change", { bubbles: true }));
          }
          if (condition && selects[1]) {
            if (nativeSel) nativeSel.call(selects[1], condition);
            else selects[1].value = condition;
            selects[1].dispatchEvent(new Event("input", { bubbles: true }));
            selects[1].dispatchEvent(new Event("change", { bubbles: true }));
          }
          if (submit) {
            await new Promise(r => setTimeout(r, 300));
            const btn = Array.from(document.querySelectorAll("button")).find(b => /post item/i.test(b.textContent));
            if (btn) { 
              btn.click(); 
            } else {
              const form = document.querySelector("form"); 
              if (form) try { form.requestSubmit(); } catch (_) {}
            }
          }
          return { status: "success", submitted: submit };
        }
      },
      contactSellerVoice: {
        description: "Go to the chat page to message the seller of the currently viewed marketplace item. Use for 'contact seller', 'message the seller'.",
        handler: async () => {
          const msgBtn = Array.from(document.querySelectorAll("button")).find(b => b.textContent.toLowerCase().includes("message"));
          if (msgBtn) { msgBtn.click(); return { status: "ok" }; }
          return { status: "not_found" };
        }
      },
      readProductDetails: {
        description: "Read aloud the details of the currently viewed marketplace item. Use for 'read product details', 'tell me about this item'.",
        handler: async () => {
          const h1 = document.querySelector("h1");
          const price = document.body.innerText.match(/(₹|Rs\.?|INR)?\s*\d[\d,]*/)?.[0] || "";
          const desc = document.querySelector("p")?.innerText || "";
          const text = [h1?.innerText, price ? `Price: ${price}` : "", desc].filter(Boolean).join(". ");
          speak(text || readPageText());
          return { status: "reading", text };
        }
      },
      // ── LOST & FOUND ACTIONS ───────────────────────────────────────────────
      contactItemOwner: {
        description: "Contact the owner of the currently viewed lost or found item via message or email. Use for 'contact owner', 'message the poster'.",
        handler: async () => {
          const msgBtn = Array.from(document.querySelectorAll("button")).find(b => b.textContent.toLowerCase().includes("message"));
          if (msgBtn) { msgBtn.click(); return { status: "ok" }; }
          const emailBtn = Array.from(document.querySelectorAll("button")).find(b => b.textContent.toLowerCase().includes("email"));
          if (emailBtn) { emailBtn.click(); return { status: "ok" }; }
          return { status: "not_found" };
        }
      },
      claimCurrentItem: {
        description: "Claim the currently viewed lost and found item. Use for 'claim this item', 'this is mine'.",
        handler: async () => {
          const claimBtn = Array.from(document.querySelectorAll("button")).find(b => b.textContent.toLowerCase().includes("claim"));
          if (claimBtn) { claimBtn.click(); return { status: "ok" }; }
          return { status: "not_found" };
        }
      },
      // ── NOTES ACTIONS ──────────────────────────────────────────────────────
      generateNotesVoice: {
        description: "Generate AI study notes. Ask ONE field at a time: first the Topic, then the Education Level, then the Exam Type. Do NOT list the available options, just ask the question naturally. After all three are provided, say 'Ready to generate! Shall I start?' and WAIT. Only call with submit:true after user confirms.",
        params: {
          topic: { type: "string", required: true, description: "Topic. Ask first." },
          level: { type: "string", required: false, description: "Education Level (valid: School, Diploma, Undergraduate, Postgraduate, Competitive Exam). Ask second." },
          examType: { type: "string", required: false, description: "Exam Type (valid: Semester, Midterm, Final, Competitive, Revision Only). Ask third." },
          submit: { type: "boolean", required: false, description: "Set true ONLY after user confirms." }
        },
        handler: async ({ topic, level, examType, submit = false }) => {
          // Navigate and wait for page to render
          if (window.location.pathname !== "/note") {
            stateRef.current.navigate("/note");
            await new Promise(r => setTimeout(r, 400));
          }

          // Fill the form so user sees their choices
          const map = {};
          if (topic) map['input[placeholder="Enter topic (e.g. Web Development)"]'] = topic;
          await fillWhenReady(map);

          // Small pause to let React process the input event
          await new Promise(r => setTimeout(r, 100));

          const nativeSel = Object.getOwnPropertyDescriptor(window.HTMLSelectElement?.prototype, "value")?.set;
          const selects = document.querySelectorAll("select");
          
          const setSelectByTextOrValue = (selectEl, val) => {
            if (!selectEl || !val) return;
            const options = Array.from(selectEl.options);
            const found = options.find(o => o.value.toLowerCase() === val.toLowerCase() || o.text.toLowerCase() === val.toLowerCase());
            const targetVal = found ? found.value : val;
            if (nativeSel) nativeSel.call(selectEl, targetVal);
            else selectEl.value = targetVal;
            selectEl.dispatchEvent(new Event("input", { bubbles: true }));
            selectEl.dispatchEvent(new Event("change", { bubbles: true }));
          };

          if (level) setSelectByTextOrValue(selects[0], level);
          if (examType) setSelectByTextOrValue(selects[1], examType);

          if (submit) {
            // Wait for React to process state updates from the filled fields
            await new Promise(r => setTimeout(r, 200));
            // Click the Generate Notes button so the component's own React state handles the result
            const btn = Array.from(document.querySelectorAll("button")).find(b => /generate notes|generating/i.test(b.textContent));
            if (btn && !btn.disabled) {
              btn.click();
            }
            
            // Fallback: safely ensure the form is submitted if the click didn't trigger it
            setTimeout(() => {
              const form = document.querySelector("form");
              if (form) { try { form.requestSubmit(); } catch (_) {} }
            }, 100);
          }

          return { status: "success", submitted: submit };
        }
      },
      readNotesAloud: {
        description: "Read the generated AI notes aloud. Use for 'read notes aloud', 'read my notes', 'read this section'.",
        handler: async () => {
          const notesEl = document.querySelector(".prose, [class*='result'], [class*='content'], main");
          if (!notesEl) { speak("No notes found. Please generate notes first."); return { status: "empty" }; }
          const text = (notesEl.innerText || notesEl.textContent || "").replace(/\s+/g, " ").trim().slice(0, 1200);
          speak(text);
          return { status: "reading", chars: text.length };
        }
      },
      openMyNotes: {
        description: "Open a specific saved note from the user's note history. Use for 'open my notes on X', 'show me my note about X', 'open the latest note', 'open my first note'. If the user doesn't specify which note, ask them. If they say 'latest' or 'last', open the most recent one.",
        params: {
          query: { type: "string", required: false, description: "Topic name or keyword to search for. Use 'latest' for most recent." }
        },
        handler: async ({ query }) => {
          // Navigate to notes history
          if (window.location.pathname !== "/notes/history") {
            stateRef.current.navigate("/notes/history");
            await new Promise(r => setTimeout(r, 500));
          }

          // Fetch all notes from the API to search through them
          try {
            const axios = (await import("axios")).default;
            const apiUrl = import.meta.env.VITE_API_URL || (import.meta.env.DEV ? "http://localhost:4000" : "https://campussync-e49n.onrender.com");
            const res = await axios.get(`${apiUrl}/api/notes/getnotes?t=${Date.now()}`, { withCredentials: true });
            const notes = res.data.notes || [];

            if (notes.length === 0) {
              speak("You don't have any saved notes yet. Would you like to generate some?");
              return { status: "empty" };
            }

            let target = null;
            if (!query || query.toLowerCase() === "latest" || query.toLowerCase() === "last") {
              target = notes[0]; // Most recent first
            } else {
              // Find by topic keyword match
              const q = query.toLowerCase();
              target = notes.find(n => n.topic?.toLowerCase().includes(q));
              if (!target) {
                // Fuzzy: try partial match
                target = notes.find(n => q.split(" ").some(w => n.topic?.toLowerCase().includes(w)));
              }
            }

            if (!target) {
              const topics = notes.slice(0, 5).map(n => n.topic).join(", ");
              speak(`I couldn't find a note matching "${query}". Your recent notes are: ${topics}. Which one would you like to open?`);
              return { status: "not_found", availableTopics: topics };
            }

            // Click the matching note button in the sidebar
            await new Promise(r => setTimeout(r, 200));
            const buttons = document.querySelectorAll("aside button, [class*='sidebar'] button");
            let clicked = false;
            for (const btn of buttons) {
              if (btn.textContent?.toLowerCase().includes(target.topic?.toLowerCase()?.slice(0, 15))) {
                btn.click();
                clicked = true;
                break;
              }
            }

            if (!clicked) {
              // Fallback: fetch the note directly via API and dispatch a custom event
              const noteRes = await axios.get(`${apiUrl}/api/notes/${target._id}`, { withCredentials: true });
              window.dispatchEvent(new CustomEvent("cs-open-note", { detail: { ...noteRes.data, _id: target._id } }));
            }

            return { status: "success", topic: target.topic, id: target._id };
          } catch (err) {
            speak("Failed to load your notes. Please try again.");
            return { status: "error", message: err?.message };
          }
        }
      },
      listMyNotes: {
        description: "List all saved notes by reading their topics aloud. Use for 'what notes do I have', 'list my notes', 'show all my notes'.",
        handler: async () => {
          try {
            const axios = (await import("axios")).default;
            const apiUrl = import.meta.env.VITE_API_URL || (import.meta.env.DEV ? "http://localhost:4000" : "https://campussync-e49n.onrender.com");
            const res = await axios.get(`${apiUrl}/api/notes/getnotes?t=${Date.now()}`, { withCredentials: true });
            const notes = res.data.notes || [];
            if (notes.length === 0) {
              speak("You don't have any saved notes yet.");
              return { status: "empty" };
            }
            const list = notes.slice(0, 10).map((n, i) => `${i + 1}. ${n.topic}`).join(". ");
            speak(`You have ${notes.length} notes. Here are your most recent: ${list}. Which one would you like to open?`);
            return { status: "success", count: notes.length, topics: notes.slice(0, 10).map(n => n.topic) };
          } catch (err) {
            speak("Failed to load your notes.");
            return { status: "error" };
          }
        }
      },
      // ── INTERVIEW ACTIONS ──────────────────────────────────────────────────
      readInterviewFeedback: {
        description: "Read the AI feedback from the interview report aloud. Use for 'read feedback', 'read feedback slowly', 'what did the AI say'.",
        params: { slow: { type: "boolean", required: false, description: "If true, read slowly." } },
        handler: async ({ slow = false }) => {
          const feedbackEls = document.querySelectorAll(".bg-green-50, [class*='feedback']");
          if (!feedbackEls.length) { speak("No feedback found. Please open an interview report."); return { status: "empty" }; }
          const text = Array.from(feedbackEls).map(el => el.innerText).join(". ").slice(0, 1000);
          speak(text, { rate: slow ? 0.7 : 1.0 });
          return { status: "reading", slow };
        }
      },
      explainMistakes: {
        description: "Read out the questions where the user scored poorly and explain the feedback. Use for 'explain my mistakes', 'where did I go wrong'.",
        handler: async () => {
          const scoreEls = Array.from(document.querySelectorAll("[style*='color']")).filter(el => el.innerText.includes("/10"));
          if (!scoreEls.length) { speak("Please open an interview report first."); return { status: "empty" }; }
          const text = readPageText().slice(0, 1000);
          speak(`Here is the breakdown of your interview performance. ${text}`);
          return { status: "reading" };
        }
      },
      readMyInterviewScore: {
        description: "Read the final score from the interview report. Use for 'what was my score', 'read my score'.",
        handler: async () => {
          const scoreMatch = document.body.innerText.match(/(\d+(?:\.\d+)?)\s*\/\s*10/);
          if (scoreMatch) { speak(`Your overall score is ${scoreMatch[1]} out of 10.`); return { score: scoreMatch[1] }; }
          speak("Could not find a score. Please open an interview report page.");
          return { status: "not_found" };
        }
      },
      // ── SMART CONTEXT ACTIONS ──────────────────────────────────────────────
      submitCurrentForm: {
        description: "Submit whatever form is currently on screen. Use for 'submit this form', 'submit now', 'confirm and submit'.",
        handler: async () => {
          const btn = document.querySelector('button[type="submit"]') ||
            Array.from(document.querySelectorAll("button")).find(b =>
              /submit|post|save|register|login|start|generate|create account|sign up|sign in/i.test(b.textContent));
          if (btn) { 
            btn.click(); 
            return { status: "submitted" }; 
          }
          const form = document.querySelector("form");
          if (form) {
            try { form.requestSubmit(); } catch (_) {}
            return { status: "submitted" }; 
          }
          return { status: "not_found" };
        }
      },
      announceError: {
        description: "Read out any visible error messages on the current page. Use for 'what went wrong', 'read the error', 'what is the error'.",
        handler: async () => {
          const errEl = document.querySelector(".text-red-500, .error, [role='alert'], [class*='error']");
          if (errEl) { const msg = errEl.innerText; speak(`Error: ${msg}`); return { status: "ok", error: msg }; }
          speak("No error messages found on this page.");
          return { status: "none" };
        }
      },
      continueWhereLeftOff: {
        description: "Resume the user's last activity based on where they were. If they were generating notes, go to notes. If doing an interview, go to interview. Use for 'continue where I left off', 'what was I doing'.",
        handler: async () => {
          const lastPath = sessionStorage.getItem("cs_lastPath") || "/";
          const ctx = getPageContext(lastPath);
          stateRef.current.navigate(lastPath);
          return { status: "navigated", path: lastPath };
        }
      },
      setUpInterview: {
        description: "Set up and start a mock AI interview. Ask ONE field at a time: first Job Role, then Experience (fresher / 1-2 / 3-5 / 5+), then Mode (technical / hr). After all three, say 'Ready to start! Shall I begin?' and WAIT. Only call with submit:true after user confirms.",
        params: {
          role: { type: "string", required: false, description: "Job Role. Ask first." },
          experience: { type: "string", required: false, description: "Experience level. Ask second." },
          mode: { type: "string", required: false, description: "Interview mode. Ask third." },
          submit: { type: "boolean", required: false, description: "Set true ONLY after user confirms." }
        },
        handler: async ({ role, experience, mode, submit = false }) => {
          if (window.location.pathname !== "/ai-interview/start") {
            stateRef.current.navigate("/ai-interview/start");
          }

          if (!submit) {
            // Just fill the form visually so the user sees it
            if (role) {
              await fillWhenReady({ 'input[placeholder="Frontend Developer"]': role });
            }
            const nativeSelectSetter = Object.getOwnPropertyDescriptor(window.HTMLSelectElement.prototype, "value")?.set;
            if (experience) {
              const expSelect = Array.from(document.querySelectorAll("select")).find(s => s.innerHTML.includes("Select Experience"));
              if (expSelect) {
                if (nativeSelectSetter) nativeSelectSetter.call(expSelect, experience);
                else expSelect.value = experience;
                expSelect.dispatchEvent(new Event("input", { bubbles: true }));
                expSelect.dispatchEvent(new Event("change", { bubbles: true }));
              }
            }
            if (mode) {
              const modeSelect = Array.from(document.querySelectorAll("select")).find(s => s.innerHTML.includes("Select Mode"));
              if (modeSelect) {
                const val = mode.toLowerCase();
                if (nativeSelectSetter) nativeSelectSetter.call(modeSelect, val);
                else modeSelect.value = val;
                modeSelect.dispatchEvent(new Event("input", { bubbles: true }));
                modeSelect.dispatchEvent(new Event("change", { bubbles: true }));
              }
            }
            return { status: "collecting", role, experience, mode };
          }

          // Direct API call to start the interview
          speak("Starting your interview. Generating questions, please wait.");
          try {
            const axios = (await import("axios")).default;
            const apiUrl = import.meta.env.VITE_API_URL || (import.meta.env.DEV ? "http://localhost:4000" : "https://campussync-e49n.onrender.com");
            const { data } = await axios.post(
              `${apiUrl}/api/interview/generate-questions`,
              { role: role?.trim() || "", experience: experience || "", mode: mode || "", resumeText: "", projects: [], skills: [] },
              { withCredentials: true }
            );
            if (typeof data.remainingCredits === "number") {
              const { updateCreadits } = await import("./redux/userSlice");
            }
            // Dispatch custom event so InterviewPage can pick it up
            window.dispatchEvent(new CustomEvent("cs-interview-start", { detail: data.interview }));
            return { status: "success", interviewId: data.interview?._id };
          } catch (err) {
            const msg = err?.response?.data?.message || "Failed to start interview. Check your credits.";
            return { status: "error", message: msg };
          }
        }
      }
    });
 
    doweitClient.bindState(() => {
      sessionStorage.setItem("cs_lastPath", window.location.pathname);
      return {
        userTheme: stateRef.current.isDark ? "dark" : "light",
        userName: stateRef.current.userData?.name,
        userCredits: stateRef.current.userData?.credits || 0,
        currentPath: window.location.pathname,
        pageDescription: (() => { try { const c = getPageContext(window.location.pathname); return `${c.name}: ${c.desc}`; } catch { return ""; } })(),
      };
    });
  }, [doweitClient]);
 
  // 2. User Authentication State Sync - RUN ONLY when userData shifts (login/logout)
  useEffect(() => {
    if (userData) {
      doweitClient.setUser({
        userId: userData._id,
        email: userData.email,
        name: userData.name
      });
    }
  }, [doweitClient, userData?._id]);
  
  useEffect(() => {
    getCurrentuser(dispatch);
  }, [dispatch]);




  useEffect(() => {
    if (!userData?._id) return; // don't connect until we have a userId

    const socketio = io(serverUrl, {
      query: {
        userId: userData._id,
      },
    });

    socketio.on("connect", () => {
      console.log("Connected:", socketio.id);
    });

    dispatch(setSocket(socketio));

    socketio.on("getOnlineUsers", (users) => {
      dispatch(setOnlineUsers(users));
    });

    return () => {
      socketio.disconnect(); // cleanup
      dispatch(setSocket(null));
    };
  }, [userData?._id, dispatch]);

  return (
   
      <div className={`min-h-screen ${isDark ? "bg-linear-to-b from-slate-950 via-blue-950 to-slate-950" : "bg-linear-to-b from-white via-blue-50 to-white"} transition-colors duration-300`}>
        <Toaster position="top-center" reverseOrder={false} />

        <Navbar />

      <Routes>
        <Route path="/" element={<Home />} />

        {/* PROTECTED AUTH ROUTES */}
        <Route
          path="/register"
          element={userData ? <Navigate to="/" /> : <SignUp />}
        />

        <Route
          path="/login"
          element={userData ? <Navigate to="/" /> : <Login />}
        />

        <Route path="/lost-found" element={<LostAndFound />} />
        <Route path="/study-material" element={<StudyHome />} />
        <Route path="/contact" element={<Contact />} />
        <Route path="/about" element={<About />} />
        <Route path="/note" element={<Notes />} />
        <Route path="/notes/history" element={<History />} />
        <Route path="/pricing" element={<Pricing />} />
        <Route path="/payment-success" element={<PaymentSuccess />} />
        <Route path="/payment-failed" element={<PaymentFailed />} />
        <Route path="/lost-found/add" element={<AddItemForm />} />
        <Route path="/item/:id" element={<ItemDetailPage />} />
        <Route path="/claim-item/:id" element={<ClaimItemForm />} />
        <Route path="/item/claim-request" element={<ClaimRequestPages/>} />
        <Route path="/item/myclaim" element={<MyClaim/>} />
        <Route path="/market" element={<MarketPlace/>} />
        <Route path="/sell" element={<MarketPlace/>} />
        <Route path="/sell/:id" element={<MarketItemDetailPage/>} />
        <Route path="/sell/add" element={<AddSellItem/>} />
        <Route path="/profile" element={<Profile/>} />
        <Route path="/all-sell-items" element={<UserSellPost/>} />
        <Route path="/all-lost-found-items" element={<SellLostAndFoundPostedItem/>} />
        <Route path="/chat" element={<Chat/>} />
        <Route path="/ai-interview" element={<AiInterviewHome/>} />
        <Route path="/ai-interview/start" element={<InterviewPage/>} />
        <Route path="/ai-interview/history" element={<InterviewHistory/>} />
        <Route path="/ai-interview/report/:interviewId" element={<InterviewReport/>} />

       
      </Routes>
 <FloatingActions />
 <DoweitWidget client={doweitClient} />
        <Footer />
      </div>
   
  )
};

export default App;
