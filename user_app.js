/* ═══════════════════════════════════════════════════════════
   CIPHER SYNDICATE · USER APP  (index_user.html)
   Vanilla JS + Firebase Firestore · no frameworks
   ═══════════════════════════════════════════════════════════ */

import { initializeApp } from "https://www.gstatic.com/firebasejs/10.12.2/firebase-app.js";
import {
  getFirestore, collection, addDoc, serverTimestamp
} from "https://www.gstatic.com/firebasejs/10.12.2/firebase-firestore.js";

/* ─────────────────────────────────────────────────────
   ① FIREBASE CONFIG — REPLACE THE PLACEHOLDERS BELOW
   Firebase console → Project settings → Your apps → SDK
   ───────────────────────────────────────────────────── */
const firebaseConfig = {
  apiKey: "AIzaSyB7oQgXLbCtqdCkcuLlq-4VwoiX0gUtsOc",
  authDomain: "anon404join.firebaseapp.com",
  projectId: "anon404join",
  storageBucket: "anon404join.firebasestorage.app",
  messagingSenderId: "5827899279",
  appId: "1:5827899279:web:bab6e4bb82226bda8a25fa"
};
const IS_CONFIGURED = !Object.values(firebaseConfig)
  .some(v => v === "YOUR_FIREBASE_CONFIG_HERE");

let db = null;
if (IS_CONFIGURED) {
  db = getFirestore(initializeApp(firebaseConfig));
} else {
  console.warn("%c[SYNDICATE] Firebase config missing — paste your project keys into user_app.js", "color:#ffc25e");
}

/* ── tiny helpers ── */
const $     = s => document.querySelector(s);
const sleep = ms => new Promise(r => setTimeout(r, ms));

/* ── toast notifications ── */
let toastTimer;
function toast(msg, type = "info") {
  const t = $("#toast");
  t.textContent = msg;
  t.className = `toast show ${type}`;
  clearTimeout(toastTimer);
  toastTimer = setTimeout(() => t.classList.remove("show"), 3800);
}

/* ── HUD live clock ── */
function tickClock() {
  const el = $("#hudClock");
  if (!el) return;
  const d = new Date();
  el.textContent =
    d.toLocaleDateString("en-GB", { day: "2-digit", month: "short" }).toUpperCase() +
    " · " + d.toLocaleTimeString("en-GB");
}
tickClock();
setInterval(tickClock, 1000);

/* ── ambient matrix rain ── */
(function matrixRain() {
  const canvas = $("#matrix");
  if (!canvas) return;
  const ctx = canvas.getContext("2d");
  const reduced = matchMedia("(prefers-reduced-motion: reduce)").matches;
  const glyphs = "01<>[]{}$#%&@!/*+=?アカサタナハマヤラワ";
  let cols, drops;

  const resize = () => {
    canvas.width  = innerWidth;
    canvas.height = innerHeight;
    cols  = Math.floor(canvas.width / 18);
    drops = Array.from({ length: cols }, () => Math.random() * -60);
  };
  resize();
  addEventListener("resize", resize);

  function frame() {
    ctx.fillStyle = "rgba(4,6,12,0.14)";
    ctx.fillRect(0, 0, canvas.width, canvas.height);
    ctx.font = "13px 'JetBrains Mono', monospace";
    for (let i = 0; i < cols; i++) {
      const g = glyphs[(Math.random() * glyphs.length) | 0];
      ctx.fillStyle = Math.random() > 0.975 ? "rgba(60,224,255,.75)" : "rgba(65,255,161,.42)";
      ctx.fillText(g, i * 18, drops[i] * 18);
      drops[i] = drops[i] * 18 > canvas.height && Math.random() > 0.975 ? 0 : drops[i] + 1;
    }
  }
  if (reduced) { frame(); return; }
  setInterval(frame, 55);
})();

/* ── scroll reveals ── */
const io = new IntersectionObserver(entries => {
  entries.forEach(e => {
    if (e.isIntersecting) { e.target.classList.add("in"); io.unobserve(e.target); }
  });
}, { threshold: 0.12 });
document.querySelectorAll(".reveal").forEach(el => io.observe(el));

/* ── terminal boot / typing sequence ── */
async function typeInto(el, text, speed = 42) {
  for (const ch of text) { el.textContent += ch; await sleep(speed + Math.random() * 38); }
}
(async function bootTerminal() {
  const c1 = $("#cmdWho"), c2 = $("#cmdStatus");
  const caret1 = $("#caret1"), caret2 = $("#caret2");
  const about = $("#aboutBlock");

  await sleep(600);
  await typeInto(c1, "whoami");
  await sleep(350);
  caret1.classList.add("hidden");
  about.classList.add("show");

  await sleep(1500);
  caret2.classList.remove("hidden");
  await typeInto(c2, "./status --all-systems");
  await sleep(300);
  const line = document.createElement("p");
  line.className = "cmd result";
  line.innerHTML = '<span style="color:var(--green)">✔</span> all systems operational — recruiting open';
  c2.closest(".cmd").after(line);
})();

/* ── application form ── */
const form = $("#applyForm");
const fields = {
  name:      $("#fName"),
  email:     $("#fEmail"),
  phone:     $("#fPhone"),
  instagram: $("#fInsta"),
  youtube:   $("#fYT")
};

/* validator returns true OR an error message */
const validators = {
  name:  v => v.trim().length >= 2                          || "enter your name (min 2 characters)",
  email: v => /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/.test(v.trim()) || "that doesn't look like a valid email",
  phone: v => /^[+]?[\d\s()-]{7,17}$/.test(v.trim())         || "enter a valid phone number"
};

function setError(key, msg) {
  const wrap = fields[key].closest(".field");
  wrap.classList.toggle("error", !!msg);
  wrap.querySelector(".msg").textContent = msg || "";
}
Object.entries(fields).forEach(([key, input]) =>
  input.addEventListener("input", () => setError(key, "")));

form.addEventListener("submit", async e => {
  e.preventDefault();

  const data = {
    name:      fields.name.value.trim(),
    email:     fields.email.value.trim(),
    phone:     fields.phone.value.trim(),
    instagram: fields.instagram.value.trim(),
    youtube:   fields.youtube.value.trim()
  };

  /* required-field validation */
  let firstBad = null;
  for (const key of ["name", "email", "phone"]) {
    const result = validators[key](data[key]);
    const msg = result === true ? "" : result;
    setError(key, msg);
    if (msg && !firstBad) firstBad = fields[key];
  }
  if (firstBad) { firstBad.focus(); toast("⚠ fix the highlighted fields", "error"); return; }

  if (!IS_CONFIGURED) {
    toast("⚠ Firebase not configured — paste your keys in user_app.js", "warn");
    return;
  }

  const btn = $("#submitBtn");
  btn.classList.add("loading");
  btn.disabled = true;

  try {
    await addDoc(collection(db, "applications"), {
      ...data,
      status: "pending",
      createdAt: serverTimestamp()
    });
    form.reset();
    $("#successOverlay").classList.add("show");
    toast("✔ application transmitted — welcome, operator", "ok");
    setTimeout(() => $("#successOverlay").classList.remove("show"), 4200);
  } catch (err) {
    console.error("[SYNDICATE] submit failed:", err);
    toast("✖ transmission failed — check console & Firestore rules", "error");
  } finally {
    btn.classList.remove("loading");
    btn.disabled = false;
  }
});