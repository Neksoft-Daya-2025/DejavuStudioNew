import { useState, useEffect, useRef, createContext, useContext } from "react";
import { createClient } from "@supabase/supabase-js";
import type { Session, User } from "@supabase/supabase-js";
import { motion, AnimatePresence } from "motion/react";
import { RouterProvider, createBrowserRouter, Outlet, useNavigate, useLocation } from "react-router";
import {
  Lock, X, ChevronLeft, ChevronRight, ChevronDown,
  Mic, Music, PenLine, SlidersHorizontal, Activity, Layers,
  TrendingUp, Sparkles, Camera, Globe, MessageSquare,
  Clock, CalendarDays,
} from "lucide-react";
import dvLogo from "../imports/Deja_Vu_DV.jpg";
import dvStudiosLogo from "../imports/Deja_Vu_Deja_Vu_Studios-1.png";
import goldlectiveLogo from "../imports/6725C259-4904-4C9D-A9A3-090F5B426FB4.PNG";
import studioGold1 from "../imports/Studio_gold_1.jpg";
import microfoon1 from "../imports/Microfoon_1.jpg";
import monitorscreen2 from "../imports/Monitorscreen._2.jpg";
import speaker2 from "../imports/Speaker_2.jpg";
import whiteRoom1 from "../imports/White_Room_1.jpg";
import whiteRoom6 from "../imports/White_Room_6.jpg";
import whiteRoom7 from "../imports/White_Room_7.jpg";
import microfoon4 from "../imports/Microfoon_4.jpg";

// ─── TOKENS ──────────────────────────────────────────────────────────────────

const G = "#C9A84C";
const G_LIGHT = "#E8D5A3";
const G_DARK = "#7A5B1A";
const BLACK = "#080808";
const WHITE = "#f0ede6";

// ─── GLOBAL STYLES ───────────────────────────────────────────────────────────

function GlobalStyles() {
  return (
    <style>{`
      html { scroll-behavior: smooth; }
      ::-webkit-scrollbar { display: none; }
      body { font-family: 'Outfit', sans-serif; background: ${BLACK}; overflow-x: hidden; }

      * { cursor: url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='20' height='20' viewBox='0 0 20 20'%3E%3Ccircle cx='4' cy='4' r='3.2' fill='white' stroke='%23C9A84C' stroke-width='0.8' opacity='0.92'/%3E%3C/svg%3E") 4 4, auto !important; }
      .font-display { font-family: 'Playfair Display', serif; }

      ::placeholder { color: rgba(240,237,230,0.2); }

      .initiatives-grid { grid-template-columns: 1fr !important; }
      @media (min-width: 768px) {
        .initiatives-grid { grid-template-columns: repeat(4, calc((100% - 3 * 1.25rem) / 3)) !important; }
      }

      @keyframes shimmer-slide {
        0%   { transform: translateX(-200%) skewX(-12deg); }
        100% { transform: translateX(350%) skewX(-12deg); }
      }
      @keyframes scroll-pulse {
        0%, 100% { transform: scaleY(0.3); }
        50%       { transform: scaleY(1); }
      }
      @keyframes cursor-scale {
        0%, 100% { transform: scale(1); }
        50%       { transform: scale(1.4); }
      }

      .shimmer-wrap {
        position: relative;
        overflow: hidden;
      }
      .shimmer-wrap::after {
        content: '';
        position: absolute;
        inset: 0;
        width: 50%;
        background: linear-gradient(90deg, transparent, rgba(232,213,163,0.35), transparent);
        transform: translateX(-200%) skewX(-12deg);
        pointer-events: none;
      }
      .shimmer-wrap:hover::after {
        animation: shimmer-slide 0.65s ease forwards;
      }

      .gold-shimmer-line {
        position: relative;
        overflow: hidden;
      }
      .gold-shimmer-line::after {
        content: '';
        position: absolute;
        inset: 0;
        width: 40%;
        background: linear-gradient(90deg, transparent, rgba(232,213,163,0.5), transparent);
        animation: shimmer-slide var(--shimmer-dur, 5s) ease-in-out infinite;
        animation-delay: var(--shimmer-delay, 0s);
      }

      .reveal {
        opacity: 0;
        transform: translateY(28px);
        transition: opacity 0.9s cubic-bezier(0.16,1,0.3,1),
                    transform 0.9s cubic-bezier(0.16,1,0.3,1);
      }
      .reveal.visible {
        opacity: 1;
        transform: translateY(0);
      }
      .reveal-delay-1 { transition-delay: 0.1s; }
      .reveal-delay-2 { transition-delay: 0.2s; }
      .reveal-delay-3 { transition-delay: 0.3s; }
      .reveal-delay-4 { transition-delay: 0.4s; }

      .h-scroll {
        display: flex;
        overflow-x: auto;
        scroll-snap-type: x mandatory;
        scrollbar-width: none;
      }
      .h-scroll::-webkit-scrollbar { display: none; }

      .studio-slide {
        flex: 0 0 calc(100vw - 3rem);
        scroll-snap-align: start;
      }
      @media (min-width: 768px)  { .studio-slide { flex: 0 0 82vw; } }
      @media (min-width: 1280px) { .studio-slide { flex: 0 0 72vw; } }

      input:focus, textarea:focus {
        outline: none;
        border-color: ${G} !important;
      }
    `}</style>
  );
}

// ─── GRAIN ───────────────────────────────────────────────────────────────────

function GrainOverlay() {
  return (
    <div
      className="pointer-events-none fixed inset-0 z-[9990]"
      style={{
        backgroundImage: `url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='320' height='320'%3E%3Cfilter id='g'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.72' numOctaves='4' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='320' height='320' filter='url(%23g)'/%3E%3C/svg%3E")`,
        opacity: 0.038,
        mixBlendMode: "overlay" as const,
      }}
    />
  );
}

// cursor handled via CSS in GlobalStyles

// ─── RINGS ────────────────────────────────────────────────────────────────────

interface RingsProps {
  size: number;
  opacity?: number;
  className?: string;
  animateIn?: boolean;
}

function ConcentricRings({ size, opacity = 1, className = "", animateIn = false }: RingsProps) {
  const cx = size / 2;
  const scales = [0.93, 0.79, 0.65, 0.51, 0.38, 0.25];

  return (
    <svg
      width={size}
      height={size}
      viewBox={`0 0 ${size} ${size}`}
      className={className}
      style={{ opacity }}
      aria-hidden
    >
      <defs>
        <linearGradient id={`rg-${size}`} x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%"   stopColor="#3A1E00" />
          <stop offset="40%"  stopColor={G} />
          <stop offset="70%"  stopColor={G_LIGHT} />
          <stop offset="100%" stopColor="#3A1E00" />
        </linearGradient>
      </defs>
      {scales.map((s, i) => {
        const r = (size / 2) * s;
        const op = 0.55 - i * 0.07;
        if (animateIn) {
          return (
            <motion.circle
              key={i}
              cx={cx} cy={cx} r={r}
              fill="none"
              stroke={`url(#rg-${size})`}
              strokeWidth={0.9}
              strokeOpacity={op}
              initial={{ pathLength: 0, opacity: 0 }}
              animate={{ pathLength: 1, opacity: op }}
              transition={{ duration: 1.4, delay: 0.08 + i * 0.14, ease: "easeInOut" }}
            />
          );
        }
        return (
          <circle
            key={i}
            cx={cx} cy={cx} r={r}
            fill="none"
            stroke={`url(#rg-${size})`}
            strokeWidth={0.9}
            strokeOpacity={op}
          />
        );
      })}
    </svg>
  );
}

// ─── INTRO ────────────────────────────────────────────────────────────────────

function IntroAnimation({ onComplete }: { onComplete: () => void }) {
  const [showLogo, setShowLogo] = useState(false);
  const [exiting, setExiting] = useState(false);

  useEffect(() => {
    const t1 = setTimeout(() => setShowLogo(true), 700);
    const t2 = setTimeout(() => setExiting(true), 2600);
    const t3 = setTimeout(onComplete, 3400);
    return () => { clearTimeout(t1); clearTimeout(t2); clearTimeout(t3); };
  }, [onComplete]);

  return (
    <motion.div
      className="fixed inset-0 z-[9500] flex items-center justify-center"
      style={{ background: BLACK }}
      animate={{ opacity: exiting ? 0 : 1 }}
      transition={{ duration: 0.8, ease: "easeInOut" }}
    >
      <div className="relative flex items-center justify-center">
        {/* Animated rings */}
        <div className="absolute inset-0 flex items-center justify-center">
          <ConcentricRings size={420} animateIn opacity={0.85} />
        </div>

        {/* Logo wordmark */}
        <motion.div
          className="relative z-10 text-center select-none"
          initial={{ opacity: 0, scale: 0.97 }}
          animate={{ opacity: showLogo ? 1 : 0, scale: showLogo ? 1 : 0.97 }}
          transition={{ duration: 0.9, ease: [0.16, 1, 0.3, 1] }}
        >
          <div
            className="font-display font-normal text-white tracking-[0.18em]"
            style={{ fontSize: "clamp(44px, 8vw, 76px)" }}
          >
            DÉJÀ VU
          </div>
          <div className="flex items-center justify-center gap-3 mt-1.5">
            <div
              className="h-px w-10 gold-shimmer-line"
              style={{
                background: `linear-gradient(90deg, transparent, ${G})`,
                "--shimmer-delay": "0.8s",
                "--shimmer-dur": "4s",
              } as React.CSSProperties}
            />
            <span
              className="font-display text-[11px] tracking-[0.55em] font-normal"
              style={{ color: G }}
            >
              STUDIOS
            </span>
            <div
              className="h-px w-10 gold-shimmer-line"
              style={{
                background: `linear-gradient(90deg, ${G}, transparent)`,
                "--shimmer-delay": "1.5s",
                "--shimmer-dur": "4s",
              } as React.CSSProperties}
            />
          </div>
        </motion.div>
      </div>
    </motion.div>
  );
}

// ─── GALLERY MODAL ───────────────────────────────────────────────────────────

interface GalleryState { studio: Studio; index: number }

function GalleryModal({ state, onClose }: { state: GalleryState; onClose: () => void }) {
  const { studio, index: initial } = state;
  const gallery = studio.gallery!;
  const [idx, setIdx] = useState(initial);

  // Preload all gallery images immediately on mount
  useEffect(() => {
    gallery.forEach(({ src }) => {
      const img = new Image();
      img.src = src;
    });
  }, [gallery]);

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose();
      if (e.key === "ArrowRight") setIdx((i) => (i + 1) % gallery.length);
      if (e.key === "ArrowLeft") setIdx((i) => (i - 1 + gallery.length) % gallery.length);
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [gallery.length, onClose]);

  return (
    <motion.div
      className="fixed inset-0 z-[8000] flex items-center justify-center"
      style={{ background: "rgba(4,4,4,0.96)" }}
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      transition={{ duration: 0.3 }}
      onClick={onClose}
    >
      {/* Close */}
      <button
        className="absolute top-6 right-6 z-10 flex items-center justify-center w-10 h-10 border transition-all duration-200"
        style={{ borderColor: "rgba(201,168,76,0.3)", color: G }}
        onClick={onClose}
      >
        <X size={16} />
      </button>

      {/* Image */}
      <motion.div
        key={idx}
        className="relative max-w-5xl w-full mx-6 md:mx-16"
        initial={{ opacity: 0, scale: 0.98 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ duration: 0.35, ease: [0.16, 1, 0.3, 1] }}
        onClick={(e) => e.stopPropagation()}
      >
        <img
          src={gallery[idx].src}
          alt={gallery[idx].caption}
          className="w-full object-cover"
          style={{ maxHeight: "78vh", objectFit: "contain" }}
        />
        {/* Caption */}
        <div className="flex items-center justify-between mt-4 px-1">
          <span className="text-[10px] tracking-[0.3em] uppercase" style={{ color: "rgba(240,237,230,0.35)" }}>
            {gallery[idx].caption}
          </span>
          <span className="text-[10px] tracking-[0.25em]" style={{ color: "rgba(201,168,76,0.4)" }}>
            {idx + 1} / {gallery.length}
          </span>
        </div>
      </motion.div>

      {/* Prev / Next */}
      <button
        className="absolute left-4 md:left-8 top-1/2 -translate-y-1/2 flex items-center justify-center w-10 h-10 border transition-all duration-200"
        style={{ borderColor: "rgba(201,168,76,0.25)", color: G }}
        onClick={(e) => { e.stopPropagation(); setIdx((i) => (i - 1 + gallery.length) % gallery.length); }}
      >
        <ChevronLeft size={16} />
      </button>
      <button
        className="absolute right-4 md:right-8 top-1/2 -translate-y-1/2 flex items-center justify-center w-10 h-10 border transition-all duration-200"
        style={{ borderColor: "rgba(201,168,76,0.25)", color: G }}
        onClick={(e) => { e.stopPropagation(); setIdx((i) => (i + 1) % gallery.length); }}
      >
        <ChevronRight size={16} />
      </button>

      {/* Dots */}
      <div className="absolute bottom-6 left-1/2 -translate-x-1/2 flex items-center gap-2">
        {gallery.map((_, i) => (
          <button
            key={i}
            onClick={(e) => { e.stopPropagation(); setIdx(i); }}
            className="transition-all duration-300"
            style={{
              width: i === idx ? 24 : 6,
              height: 2,
              background: i === idx ? G : "rgba(201,168,76,0.25)",
            }}
          />
        ))}
      </div>
    </motion.div>
  );
}

// ─── SCROLL REVEAL ────────────────────────────────────────────────────────────

function useReveal() {
  useEffect(() => {
    const run = () => {
      const els = document.querySelectorAll(".reveal");
      const obs = new IntersectionObserver(
        (entries) => {
          entries.forEach((e) => {
            if (e.isIntersecting) {
              e.target.classList.add("visible");
              obs.unobserve(e.target);
            }
          });
        },
        { threshold: 0.12 }
      );
      els.forEach((el) => obs.observe(el));
      return obs;
    };

    const timer = setTimeout(() => {
      const obs = run();
      return () => obs.disconnect();
    }, 200);

    return () => clearTimeout(timer);
  }, []);
}

// ─── NAV ──────────────────────────────────────────────────────────────────────

const NAV = [
  { label: "Home",        id: "home",      route: null as string | null },
  { label: "Ruimten",     id: "ruimten",   route: null as string | null },
  { label: "Projecten",   id: "projecten", route: null as string | null },
  { label: "Diensten",    id: "diensten",  route: "/diensten" as string | null },
  { label: "Ons Verhaal", id: "verhaal",   route: null as string | null },
  { label: "Contact",     id: "contact",   route: null as string | null },
];

function scrollTo(id: string) {
  document.getElementById(id)?.scrollIntoView({ behavior: "smooth" });
}

// ─── AUTH ─────────────────────────────────────────────────────────────────────

const SUPABASE_URL  = "https://lboovczhagqnzcyclzbl.supabase.co";
const SUPABASE_ANON = "sb_publishable_c0ebXJ9F_jaBdWrXwlsXTA_G0Fo39-A";
// Singleton with custom storageKey to avoid colliding with the platform's own client
const supabase: ReturnType<typeof createClient> =
  (globalThis as any).__dvSupabase ??= createClient(SUPABASE_URL, SUPABASE_ANON, {
    auth: { storageKey: "dv-os-auth" },
  });

type AuthCtx = {
  session: Session | null;
  user: User | null;
  authLoading: boolean;
  signIn: (email: string, password: string) => Promise<string | null>;
  signOut: () => Promise<void>;
};
const AuthContext = createContext<AuthCtx>({
  session: null, user: null, authLoading: true,
  signIn: async () => null, signOut: async () => {},
});
const useAuth = () => useContext(AuthContext);

function AuthProvider({ children }: { children: React.ReactNode }) {
  const [session, setSession] = useState<Session | null>(null);
  const [user, setUser]       = useState<User | null>(null);
  const [authLoading, setLoading] = useState(true);
  useEffect(() => {
    supabase.auth.getSession().then(({ data }) => {
      setSession(data.session); setUser(data.session?.user ?? null); setLoading(false);
    });
    const { data: { subscription } } = supabase.auth.onAuthStateChange((_ev, s) => {
      setSession(s); setUser(s?.user ?? null);
    });
    return () => subscription.unsubscribe();
  }, []);
  const signIn = async (email: string, password: string) => {
    const { error } = await supabase.auth.signInWithPassword({ email, password });
    return error ? error.message : null;
  };
  const signOut = async () => { await supabase.auth.signOut(); };
  return <AuthContext.Provider value={{ session, user, authLoading, signIn, signOut }}>{children}</AuthContext.Provider>;
}

const OpenLoginCtx = createContext<() => void>(() => {});

function Nav() {
  const [solid, setSolid] = useState(false);
  const [open, setOpen] = useState(false);
  const navigate = useNavigate();
  const location = useLocation();
  const isHome = location.pathname === "/";
  const { session } = useAuth();
  const openLogin = useContext(OpenLoginCtx);
  const handleLoginClick = () => session ? navigate("/dashboard") : openLogin();

  useEffect(() => {
    const fn = () => setSolid(window.scrollY > 80);
    window.addEventListener("scroll", fn, { passive: true });
    return () => window.removeEventListener("scroll", fn);
  }, []);

  const handleNav = (n: typeof NAV[0]) => {
    setOpen(false);
    if (n.route) {
      navigate(n.route);
    } else if (isHome) {
      scrollTo(n.id);
    } else {
      navigate("/");
    }
  };

  const handleContact = () => {
    setOpen(false);
    if (isHome) scrollTo("contact");
    else navigate("/");
  };

  return (
    <header
      className="fixed top-0 left-0 right-0 z-[500] transition-all duration-500"
      style={{
        background: solid ? "rgba(8,8,8,0.93)" : "transparent",
        backdropFilter: solid ? "blur(16px)" : "none",
        borderBottom: solid ? `1px solid rgba(201,168,76,0.1)` : "1px solid transparent",
      }}
    >
      <div className="max-w-7xl mx-auto px-6 xl:px-12 flex items-center justify-between h-16 md:h-20">
        {/* Mark */}
        <button
          onClick={() => isHome ? scrollTo("home") : navigate("/")}
          className="flex items-center gap-2.5 shrink-0"
        >
          <img src={dvLogo} alt="DV" className="w-7 h-7 rounded-full object-cover opacity-85" />
          <span className="font-display hidden sm:block text-[11px] tracking-[0.35em] text-white">
            DÉJÀ VU
          </span>
        </button>

        {/* Desktop */}
        <nav className="hidden md:flex items-center gap-8 lg:gap-10">
          {NAV.map((n) => {
            const isActive = n.route ? location.pathname === n.route : false;
            return (
              <button
                key={n.id}
                onClick={() => handleNav(n)}
                className="text-[10px] tracking-[0.28em] uppercase transition-all duration-300"
                style={{ color: isActive ? G : "rgba(240,237,230,0.45)", fontFamily: "'Outfit', sans-serif" }}
                onMouseEnter={(e) => (e.currentTarget.style.color = G)}
                onMouseLeave={(e) => (e.currentTarget.style.color = isActive ? G : "rgba(240,237,230,0.45)")}
              >
                {n.label}
              </button>
            );
          })}
        </nav>

        {/* CTAs */}
        <div className="hidden md:flex items-center gap-3">
          <button
            onClick={handleLoginClick}
            className="text-[10px] tracking-[0.28em] uppercase px-4 py-2.5 border transition-all duration-300"
            style={{ borderColor: `rgba(240,237,230,0.15)`, color: "rgba(240,237,230,0.45)" }}
            onMouseEnter={(e) => { e.currentTarget.style.borderColor = `rgba(201,168,76,0.35)`; e.currentTarget.style.color = G; }}
            onMouseLeave={(e) => { e.currentTarget.style.borderColor = `rgba(240,237,230,0.15)`; e.currentTarget.style.color = "rgba(240,237,230,0.45)"; }}
          >
            {session ? "Dashboard" : "Login"}
          </button>
          <button
            onClick={handleContact}
            className="shimmer-wrap text-[10px] tracking-[0.28em] uppercase px-5 py-2.5 border transition-all duration-300 hover:border-opacity-60"
            style={{ borderColor: `rgba(201,168,76,0.35)`, color: G }}
          >
            Laten we kennismaken
          </button>
        </div>

        {/* Hamburger */}
        <button className="md:hidden flex flex-col gap-[5px] p-1.5" onClick={() => setOpen(!open)}>
          {[0, 1, 2].map((i) => (
            <span
              key={i}
              className="block h-px transition-all duration-300"
              style={{ width: i === 1 ? 14 : 20, background: G }}
            />
          ))}
        </button>
      </div>

      {/* Mobile menu */}
      <AnimatePresence>
        {open && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: "auto" }}
            exit={{ opacity: 0, height: 0 }}
            style={{
              background: "rgba(8,8,8,0.97)",
              borderBottom: `1px solid rgba(201,168,76,0.12)`,
              overflow: "hidden",
            }}
          >
            <div className="px-6 py-8 flex flex-col gap-7">
              {NAV.map((n) => (
                <button
                  key={n.id}
                  onClick={() => handleNav(n)}
                  className="text-left text-[11px] tracking-[0.35em] uppercase"
                  style={{ color: "rgba(240,237,230,0.6)", fontFamily: "'Outfit', sans-serif" }}
                >
                  {n.label}
                </button>
              ))}
              <div className="h-px" style={{ background: `rgba(201,168,76,0.12)` }} />
              <button
                onClick={() => { setOpen(false); handleLoginClick(); }}
                className="text-left text-[10px] tracking-[0.3em] uppercase"
                style={{ color: "rgba(240,237,230,0.45)" }}
              >
                {session ? "Dashboard →" : "Login →"}
              </button>
              <button
                onClick={handleContact}
                className="text-left text-[10px] tracking-[0.3em] uppercase"
                style={{ color: G }}
              >
                Laten we kennismaken →
              </button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </header>
  );
}

// ─── HERO ─────────────────────────────────────────────────────────────────────

function Hero() {
  return (
    <section
      id="home"
      className="relative flex flex-col items-center justify-center overflow-hidden"
      style={{ height: "100svh", minHeight: 600, background: BLACK }}
    >
      {/* Photo */}
      <div className="absolute inset-0">
        <img
          src={studioGold1}
          alt="Déjà Vu Studios — Studio Gold"
          className="w-full h-full object-cover"
          style={{
            filter: "brightness(0.38) saturate(0.55)",
            mixBlendMode: "luminosity",
          }}
        />
        {/* Colour grade — warm gold tint blended back in */}
        <div
          className="absolute inset-0"
          style={{
            background: "rgba(18, 11, 2, 0.55)",
            mixBlendMode: "multiply",
          }}
        />
        {/* Vignette + fade to black at bottom */}
        <div
          className="absolute inset-0"
          style={{
            background:
              "radial-gradient(ellipse at 50% 40%, transparent 30%, rgba(8,8,8,0.55) 100%), linear-gradient(to bottom, rgba(8,8,8,0.25) 0%, rgba(8,8,8,0.5) 50%, rgba(8,8,8,1) 100%)",
          }}
        />
      </div>

      {/* Background rings */}
      <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
        <ConcentricRings size={760} opacity={0.14} className="hidden lg:block" />
      </div>

      {/* Content */}
      <div className="relative z-10 text-center px-6 max-w-5xl">
        <motion.p
          className="text-[10px] tracking-[0.6em] uppercase mb-8"
          style={{ color: G }}
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 1, delay: 0.2 }}
        >
          Meer dan een studio.
        </motion.p>

        <motion.h1
          className="font-display font-normal text-white leading-none mb-5"
          style={{ fontSize: "clamp(52px, 9vw, 108px)", letterSpacing: "-0.02em" }}
          initial={{ opacity: 0, y: 32 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 1.2, delay: 0.4, ease: [0.16, 1, 0.3, 1] }}
        >
          DÉJÀ VU
          <br />
          <span style={{ color: "rgba(240,237,230,0.38)" }}>STUDIOS</span>
        </motion.h1>

        <motion.p
          className="text-sm tracking-[0.08em] mb-12 mx-auto"
          style={{ color: "rgba(240,237,230,0.45)", maxWidth: 320 }}
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 1, delay: 0.8 }}
        >
          Waar passie terugkomt en talent vooruitgaat.
        </motion.p>

        <motion.div
          className="flex flex-col sm:flex-row gap-3 justify-center"
          initial={{ opacity: 0, y: 14 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, delay: 0.95 }}
        >
          <button
            className="shimmer-wrap px-8 py-4 text-[10px] tracking-[0.38em] uppercase font-medium border transition-all duration-300"
            style={{ borderColor: `rgba(201,168,76,0.55)`, color: G }}
            onClick={() => scrollTo("ruimten")}
          >
            Ontdek Déjà Vu
          </button>
          <button
            className="shimmer-wrap px-8 py-4 text-[10px] tracking-[0.38em] uppercase font-medium border transition-all duration-300"
            style={{ borderColor: `rgba(201,168,76,0.3)`, color: "rgba(240,237,230,0.65)" }}
            onClick={() => scrollTo("projecten")}
            onMouseEnter={(e) => { (e.currentTarget as HTMLButtonElement).style.color = G; (e.currentTarget as HTMLButtonElement).style.borderColor = "rgba(201,168,76,0.55)"; }}
            onMouseLeave={(e) => { (e.currentTarget as HTMLButtonElement).style.color = "rgba(240,237,230,0.65)"; (e.currentTarget as HTMLButtonElement).style.borderColor = "rgba(201,168,76,0.3)"; }}
          >
            Bekijk Projecten
          </button>
        </motion.div>
      </div>

      {/* Scroll indicator */}
      <motion.div
        className="absolute bottom-6 left-1/2 -translate-x-1/2 flex flex-col items-center gap-1.5"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 1.8 }}
      >
        <span className="text-[9px] tracking-[0.45em] uppercase" style={{ color: "rgba(201,168,76,0.4)" }}>
          Scroll
        </span>
        <div
          className="w-px origin-top"
          style={{
            height: 40,
            background: `linear-gradient(to bottom, ${G}, transparent)`,
            animation: "scroll-pulse 2.4s ease-in-out infinite",
          }}
        />
      </motion.div>
    </section>
  );
}

// ─── RUIMTEN ──────────────────────────────────────────────────────────────────

interface Studio {
  num: string;
  name: string;
  slogan: string;
  body: string;
  tags: string[];
  img: string;
  alt: string;
  gallery?: { src: string; caption: string }[];
  comingSoon?: boolean;
}

const STUDIOS: Studio[] = [
  {
    num: "01",
    name: "Studio Gold",
    slogan: "Waar creativiteit begint en muziek tot leven komt.",
    body: "Het creatieve hart van Déjà Vu Studios. De thuisbasis voor artiesten, producers en engineers — een omgeving waar schrijven, produceren en opnemen samenkomen en kwaliteit de standaard is.",
    tags: ["Schrijven", "Produceren", "Opnemen", "Project Goldlective"],
    img: studioGold1,
    alt: "Studio Gold — volledig overzicht van de opnamestudio",
    gallery: [
      { src: studioGold1,     caption: "Studio Gold — totaaloverzicht" },
      { src: microfoon1,      caption: "Neumann condensatormicrofoon" },
      { src: monitorscreen2,  caption: "Mixing desk & DAW setup" },
      { src: speaker2,        caption: "JBL studiomonitor" },
    ],
  },
  {
    num: "02",
    name: "Diamond Studio",
    slogan: "Luxe omgeving voor premium producties.",
    body: "Een exclusieve studio voor labels, internationale artiesten en grootschalige producties. Hoogwaardige opnameapparatuur in een omgeving die de standaard zet.",
    tags: ["Labels", "Majorproducties", "Internationale artiesten", "Exclusief"],
    img: "",
    alt: "Diamond Studio — binnenkort beschikbaar",
    comingSoon: true,
  },
  {
    num: "03",
    name: "White Room",
    slogan: "Waar mensen samenkomen en nieuwe ideeën ontstaan.",
    body: "De creatieve ontmoetingsruimte voor writers camps, masterclasses en communitybijeenkomsten — en een veelzijdige studio voor foto- en videoproducties rondom muziek en releases.",
    tags: ["Writers camps", "Masterclasses", "Community", "Content & visueel"],
    img: whiteRoom1,
    alt: "White Room — open creatieve ruimte",
    gallery: [
      { src: whiteRoom1, caption: "White Room — totaaloverzicht" },
      { src: whiteRoom6, caption: "Open vloerruimte voor productie en events" },
      { src: whiteRoom7, caption: "Zithoek langs de wand" },
    ],
  },
];

function Ruimten() {
  const scrollRef = useRef<HTMLDivElement>(null);
  const [active, setActive] = useState(0);
  const [gallery, setGallery] = useState<GalleryState | null>(null);

  useEffect(() => {
    const el = scrollRef.current;
    if (!el) return;
    const fn = () => {
      setActive(Math.round(el.scrollLeft / el.clientWidth));
    };
    el.addEventListener("scroll", fn, { passive: true });
    return () => el.removeEventListener("scroll", fn);
  }, []);

  const goTo = (i: number) => {
    const el = scrollRef.current;
    if (!el) return;
    const slide = el.children[i] as HTMLElement;
    slide.scrollIntoView({ behavior: "smooth", block: "nearest", inline: "start" });
  };

  const prev = () => goTo(Math.max(0, active - 1));
  const next = () => goTo(Math.min(STUDIOS.length - 1, active + 1));

  return (
    <section id="ruimten" style={{ background: BLACK, paddingTop: "5rem", paddingBottom: "4rem" }}>
      {/* Header */}
      <div className="max-w-7xl mx-auto px-6 xl:px-12 mb-10">
        <div className="reveal flex items-end gap-4 md:gap-6">
          <span
            className="font-display font-normal leading-none select-none"
            style={{ fontSize: "clamp(72px,12vw,128px)", color: "rgba(201,168,76,0.07)" }}
          >
            01
          </span>
          <div className="pb-3 -mt-3">
            <p className="text-[10px] tracking-[0.5em] uppercase mb-3" style={{ color: G }}>
              Onze Ruimten
            </p>
            <h2
              className="font-display font-normal text-white"
              style={{ fontSize: "clamp(28px,4vw,48px)", lineHeight: 1.15 }}
            >
              Drie werelden.
              <br />
              Één merk.
            </h2>
          </div>
          {/* Dots + Arrows */}
          <div className="hidden md:flex items-center gap-4 pb-4 ml-auto">
            <div className="flex items-center gap-2">
              {STUDIOS.map((_, i) => (
                <button
                  key={i}
                  onClick={() => goTo(i)}
                  className="transition-all duration-400 rounded-full"
                  style={{
                    width: active === i ? 28 : 6,
                    height: 2,
                    background: active === i ? G : "rgba(201,168,76,0.22)",
                  }}
                />
              ))}
            </div>
            <div className="flex items-center gap-2">
              <button
                onClick={prev}
                disabled={active === 0}
                className="flex items-center justify-center rounded-full transition-all duration-200"
                style={{
                  width: 32, height: 32,
                  border: `1px solid ${active === 0 ? "rgba(201,168,76,0.15)" : "rgba(201,168,76,0.45)"}`,
                  background: "transparent",
                  color: active === 0 ? "rgba(201,168,76,0.25)" : G,
                  cursor: active === 0 ? "default" : "pointer",
                }}
              >
                <svg width="14" height="14" viewBox="0 0 14 14" fill="none">
                  <path d="M9 2L4 7L9 12" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
                </svg>
              </button>
              <button
                onClick={next}
                disabled={active === STUDIOS.length - 1}
                className="flex items-center justify-center rounded-full transition-all duration-200"
                style={{
                  width: 32, height: 32,
                  border: `1px solid ${active === STUDIOS.length - 1 ? "rgba(201,168,76,0.15)" : "rgba(201,168,76,0.45)"}`,
                  background: "transparent",
                  color: active === STUDIOS.length - 1 ? "rgba(201,168,76,0.25)" : G,
                  cursor: active === STUDIOS.length - 1 ? "default" : "pointer",
                }}
              >
                <svg width="14" height="14" viewBox="0 0 14 14" fill="none">
                  <path d="M5 2L10 7L5 12" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
                </svg>
              </button>
            </div>
          </div>
        </div>
        <div
          className="mt-5 h-px"
          style={{ background: `linear-gradient(90deg, rgba(201,168,76,0.4), transparent)` }}
        />
      </div>

      {/* Horizontal scroll */}
      <div ref={scrollRef} className="h-scroll px-6 xl:px-12 gap-5" style={{ paddingRight: "80px" }}>
        {STUDIOS.map((s, i) => (
          <div key={s.num} className="studio-slide reveal" style={{ transitionDelay: `${i * 0.08}s` }}>

            {/* ── Coming Soon card (Diamond Studio) ── */}
            {s.comingSoon ? (
              <div
                className="relative overflow-hidden"
                style={{ height: "clamp(360px, 62vh, 680px)" }}
              >
                {/* Dark layered background */}
                <div
                  className="absolute inset-0"
                  style={{
                    background: "linear-gradient(135deg, #0d0b09 0%, #110e0a 40%, #0a0807 100%)",
                  }}
                />
                {/* Subtle noise texture */}
                <div
                  className="absolute inset-0"
                  style={{
                    backgroundImage: `url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='200' height='200'%3E%3Cfilter id='n'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.65' numOctaves='3' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='200' height='200' filter='url(%23n)'/%3E%3C/svg%3E")`,
                    opacity: 0.04,
                  }}
                />
                {/* Gold ring halo */}
                <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
                  <ConcentricRings size={320} opacity={0.12} />
                </div>
                {/* Ghost number */}
                <div className="absolute top-6 right-7">
                  <span className="font-display font-normal leading-none" style={{ fontSize: 72, color: "rgba(201,168,76,0.06)" }}>
                    {s.num}
                  </span>
                </div>
                {/* Top — naam & slogan */}
                <div className="absolute top-0 left-0 right-0 p-7 md:p-9">
                  <div className="flex items-center gap-3 mb-4">
                    <span className="font-display text-xs tracking-[0.35em]" style={{ color: "rgba(201,168,76,0.3)" }}>{s.num}</span>
                    <div className="h-px w-8" style={{ background: G, opacity: 0.15 }} />
                  </div>
                  <h3 className="font-display font-normal text-white mb-1.5" style={{ fontSize: "clamp(20px,2.8vw,30px)" }}>
                    {s.name}
                  </h3>
                  <p className="text-sm italic font-display" style={{ color: "rgba(240,237,230,0.35)" }}>
                    {s.slogan}
                  </p>
                </div>

                {/* Center — slot exact in het midden */}
                <div className="absolute inset-0 flex items-center justify-center">
                  <div
                    className="flex items-center justify-center w-14 h-14 border"
                    style={{ borderColor: "rgba(201,168,76,0.35)" }}
                  >
                    <Lock size={18} color={G} strokeWidth={1.2} />
                  </div>
                </div>

                {/* Bottom — body, tags & status */}
                <div className="absolute bottom-0 left-0 right-0 p-7 md:p-9">
                  <p className="text-[13px] leading-relaxed mb-4" style={{ color: "rgba(240,237,230,0.3)", maxWidth: 380 }}>
                    {s.body}
                  </p>
                  <div className="flex flex-wrap gap-2 mb-4">
                    {s.tags.map((tag) => (
                      <span
                        key={tag}
                        className="text-[9px] tracking-[0.25em] uppercase px-2.5 py-1 border"
                        style={{ borderColor: "rgba(201,168,76,0.12)", color: "rgba(201,168,76,0.3)" }}
                      >
                        {tag}
                      </span>
                    ))}
                  </div>
                  <p className="text-[10px] tracking-[0.4em] uppercase" style={{ color: "rgba(201,168,76,0.4)" }}>
                    Binnenkort beschikbaar
                  </p>
                </div>
              </div>
            ) : (
              /* ── Regular studio card with gallery ── */
              <div
                className="relative overflow-hidden group"
                style={{ height: "clamp(360px, 62vh, 680px)", cursor: s.gallery ? "pointer" : "default" }}
                onClick={() => s.gallery && setGallery({ studio: s, index: 0 })}
              >
                <img
                  src={s.img}
                  alt={s.alt}
                  className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-[1.04]"
                  style={{ filter: "brightness(0.6) saturate(0.8)" }}
                />
                <div
                  className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-500"
                  style={{ background: "rgba(201,168,76,0.06)" }}
                />
                <div
                  className="absolute inset-0"
                  style={{ background: "linear-gradient(to top, rgba(8,8,8,0.9) 0%, transparent 55%)" }}
                />

                {/* Click to explore hint — top left, fades on hover */}
                {s.gallery && (
                  <div className="absolute top-5 left-7 flex items-center gap-2 transition-opacity duration-300 group-hover:opacity-0">
                    <div
                      className="w-5 h-5 border flex items-center justify-center shrink-0"
                      style={{ borderColor: G }}
                    >
                      <div className="w-1.5 h-1.5 rounded-full" style={{ background: G }} />
                    </div>
                    <span className="text-[10px] tracking-[0.35em] uppercase font-medium" style={{ color: G }}>
                      Klik om te ontdekken
                    </span>
                  </div>
                )}

                {/* Ghost number */}
                <div className="absolute top-6 right-7">
                  <span className="font-display font-normal leading-none" style={{ fontSize: 72, color: "rgba(201,168,76,0.1)" }}>
                    {s.num}
                  </span>
                </div>

                {/* Info bottom */}
                <div className="absolute bottom-0 left-0 right-0 p-7 md:p-9">
                  <div className="flex items-center gap-3 mb-3">
                    <span className="font-display text-xs tracking-[0.35em]" style={{ color: G }}>{s.num}</span>
                    <div className="h-px w-8" style={{ background: G, opacity: 0.45 }} />
                  </div>
                  <h3 className="font-display font-normal text-white mb-1.5" style={{ fontSize: "clamp(20px,2.8vw,30px)" }}>
                    {s.name}
                  </h3>
                  <p className="text-sm mb-3 italic font-display" style={{ color: "rgba(240,237,230,0.45)" }}>
                    {s.slogan}
                  </p>
                  <p className="text-[13px] leading-relaxed mb-4 hidden md:block" style={{ color: "rgba(240,237,230,0.42)", maxWidth: 400 }}>
                    {s.body}
                  </p>
                  <div className="flex flex-wrap gap-2">
                    {s.tags.map((tag) => (
                      <span
                        key={tag}
                        className="text-[9px] tracking-[0.25em] uppercase px-2.5 py-1 border"
                        style={{ borderColor: "rgba(201,168,76,0.2)", color: "rgba(201,168,76,0.55)" }}
                      >
                        {tag}
                      </span>
                    ))}
                  </div>
                </div>
              </div>
            )}
          </div>
        ))}
      </div>

      {/* Gallery modal */}
      <AnimatePresence>
        {gallery && <GalleryModal state={gallery} onClose={() => setGallery(null)} />}
      </AnimatePresence>

      {/* Mobile dots */}
      <div className="flex md:hidden items-center justify-center gap-2 mt-8">
        {STUDIOS.map((_, i) => (
          <button
            key={i}
            onClick={() => goTo(i)}
            className="transition-all duration-300"
            style={{
              width: active === i ? 24 : 6,
              height: 2,
              background: active === i ? G : "rgba(201,168,76,0.22)",
            }}
          />
        ))}
      </div>

      {/* Bridge → Projecten */}
      <div className="max-w-7xl mx-auto px-6 xl:px-12 mt-16 md:mt-20">
        <div className="reveal flex flex-col md:flex-row items-start md:items-center justify-between gap-6 py-10 border-t border-b" style={{ borderColor: "rgba(201,168,76,0.1)" }}>
          <div className="flex items-center gap-5">
            <img src={dvStudiosLogo} alt="Déjà Vu Studios" className="w-16 object-contain" style={{ opacity: 0.65 }} />
            <div>
              <p className="text-[10px] tracking-[0.4em] uppercase mb-1" style={{ color: G }}>Van de studio</p>
              <p className="font-display text-base font-normal text-white">naar de wereld.</p>
            </div>
          </div>
          <p className="text-xs leading-relaxed max-w-xs" style={{ color: "rgba(240,237,230,0.38)" }}>
            Muziek die hier ontstaat, verdient een podium. Project Goldlective is de brug tussen creatie en release.
          </p>
          <button
            className="shimmer-wrap text-[10px] tracking-[0.3em] uppercase px-5 py-2.5 border shrink-0 transition-all duration-300"
            style={{ borderColor: "rgba(201,168,76,0.3)", color: G }}
            onClick={() => scrollTo("projecten")}
          >
            Ontdek Goldlective →
          </button>
        </div>
      </div>
    </section>
  );
}

// ─── PROJECTEN ────────────────────────────────────────────────────────────────

function Projecten() {
  return (
    <section id="projecten" style={{ background: "#050505", overflow: "hidden" }}>

      {/* ── 1. Section header ── */}
      <div className="max-w-7xl mx-auto px-6 xl:px-12 pt-20 md:pt-28">
        <div className="reveal flex items-end gap-4 md:gap-6 mb-10">
          <span
            className="font-display font-normal leading-none select-none"
            style={{ fontSize: "clamp(72px,12vw,128px)", color: "rgba(201,168,76,0.07)" }}
          >
            02
          </span>
          <div className="pb-3 -mt-3">
            <p className="text-[10px] tracking-[0.5em] uppercase mb-3" style={{ color: G }}>
              Projecten
            </p>
            <h2
              className="font-display font-normal text-white"
              style={{ fontSize: "clamp(28px,4vw,48px)", lineHeight: 1.15 }}
            >
              Van creatie
              <br />
              naar release.
            </h2>
          </div>
        </div>
        <div className="h-px" style={{ background: `linear-gradient(90deg, rgba(201,168,76,0.4), transparent)` }} />
      </div>

      {/* ── 2. Vision — why DV builds initiatives ── */}
      <div className="max-w-7xl mx-auto px-6 xl:px-12 py-16 md:py-20">
        <div className="grid md:grid-cols-2 gap-12 md:gap-20 items-start">

          {/* Left — statement */}
          <div className="reveal">
            <p
              className="font-display font-normal text-white leading-snug"
              style={{ fontSize: "clamp(20px,2.6vw,28px)" }}
            >
              Talent heeft meer nodig dan een goede opname.
            </p>
          </div>

          {/* Right — context */}
          <div className="reveal reveal-delay-2">
            <p className="text-sm leading-loose mb-5" style={{ color: "rgba(240,237,230,0.5)" }}>
              Muziek vraagt om begeleiding, richting en een sterk verhaal — zodat het ook daadwerkelijk de mensen bereikt die het verdienen te horen.
            </p>
            <p className="text-sm leading-loose" style={{ color: "rgba(240,237,230,0.5)" }}>
              Vanuit die visie ontwikkelt Déjà Vu Studio meerdere creatieve initiatieven — elk met een eigen focus, elk gericht op een specifiek moment in de groei van een artiest. Goldlective is het eerste actieve project. Nieuwe projecten volgen.
            </p>
          </div>
        </div>

        {/* Subtle divider with label */}
        <div className="reveal mt-14 flex items-center gap-5">
          <div className="h-px flex-1" style={{ background: `linear-gradient(90deg, rgba(201,168,76,0.2), transparent)` }} />
          <span className="text-[9px] tracking-[0.5em] uppercase shrink-0" style={{ color: "rgba(201,168,76,0.35)" }}>
            Onze initiatieven
          </span>
          <div className="h-px flex-1" style={{ background: `linear-gradient(90deg, transparent, rgba(201,168,76,0.2))` }} />
        </div>
      </div>

      {/* ── 3. Projects grid — equal weight ── */}
      <div className="max-w-7xl mx-auto px-6 xl:px-12 pb-24" style={{ overflow: "visible" }}>
        <div className="initiatives-grid grid gap-5">

          {/* ── Project 01: Goldlective — actief ── */}
          <div
            className="reveal relative overflow-hidden flex flex-col "
            style={{
              minHeight: "clamp(400px, 55vh, 580px)",
              border: "1px solid rgba(201,168,76,0.28)",
              background: "linear-gradient(160deg, rgba(201,168,76,0.06) 0%, rgba(8,8,8,0) 60%)",
            }}
          >
            {/* Ghost rings background */}
            <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
              <ConcentricRings size={340} opacity={0.08} />
            </div>

            {/* Top */}
            <div className="relative z-10 p-7 md:p-8 flex-1 flex flex-col">
              <div className="flex items-center justify-between mb-8">
                <span className="font-display text-[10px] tracking-[0.45em] uppercase" style={{ color: "rgba(201,168,76,0.5)" }}>
                  Project 01
                </span>
                <div className="flex items-center gap-1.5">
                  <span className="block w-1.5 h-1.5 rounded-full" style={{ background: G }} />
                  <span className="text-[9px] tracking-[0.3em] uppercase" style={{ color: G }}>Actief</span>
                </div>
              </div>

              {/* Goldlective logo — center feature */}
              <div className="flex-1 flex items-center justify-center py-6">
                <img
                  src={goldlectiveLogo}
                  alt="The Goldlective"
                  className="w-full max-w-[200px] object-contain"
                  style={{ filter: "drop-shadow(0 0 40px rgba(201,168,76,0.22))" }}
                />
              </div>

              {/* Bottom info */}
              <div className="mt-auto">
                <div className="h-px mb-6" style={{ background: "rgba(201,168,76,0.12)" }} />
                <p className="text-[11px] leading-relaxed mb-6" style={{ color: "rgba(240,237,230,0.42)", maxWidth: 300 }}>
                  Artiesten begeleiden van het eerste idee tot een professionele release — creatief, visueel en strategisch.
                </p>
                <button
                  className="shimmer-wrap text-[9px] tracking-[0.38em] uppercase px-5 py-3 border transition-all duration-300"
                  style={{ borderColor: "rgba(201,168,76,0.35)", color: G }}
                >
                  Meer over Goldlective
                </button>
              </div>
            </div>
          </div>

          {/* ── Project 02: Beats to Vinyl — binnenkort ── */}
          <div
            className="reveal relative overflow-hidden flex flex-col "
            style={{
              minHeight: "clamp(400px, 55vh, 580px)",
              border: "1px solid rgba(201,168,76,0.1)",
              background: "linear-gradient(160deg, rgba(201,168,76,0.02) 0%, rgba(8,8,8,0) 60%)",
            }}
          >
            {/* Noise texture */}
            <div
              className="absolute inset-0 pointer-events-none"
              style={{
                backgroundImage: `url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='200' height='200'%3E%3Cfilter id='n'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.65' numOctaves='3' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='200' height='200' filter='url(%23n)'/%3E%3C/svg%3E")`,
                opacity: 0.03,
              }}
            />

            <div className="relative z-10 p-7 md:p-8 flex-1 flex flex-col">
              <div className="flex items-center justify-between mb-8">
                <span className="font-display text-[10px] tracking-[0.45em] uppercase" style={{ color: "rgba(201,168,76,0.2)" }}>
                  Project 02
                </span>
                <span className="text-[9px] tracking-[0.3em] uppercase" style={{ color: "rgba(240,237,230,0.2)" }}>Binnenkort</span>
              </div>

              {/* Lock — center feature */}
              <div className="flex-1 flex items-center justify-center py-6">
                <div
                  className="flex items-center justify-center w-14 h-14 border"
                  style={{ borderColor: "rgba(201,168,76,0.2)" }}
                >
                  <Lock size={18} color="rgba(201,168,76,0.4)" strokeWidth={1.2} />
                </div>
              </div>

              {/* Bottom info */}
              <div className="mt-auto">
                <div className="h-px mb-6" style={{ background: "rgba(201,168,76,0.07)" }} />
                <p
                  className="font-display font-normal mb-2"
                  style={{ fontSize: "clamp(16px,1.6vw,20px)", color: "rgba(240,237,230,0.6)" }}
                >
                  Beats to Vinyl
                </p>
                <p className="text-[11px] leading-relaxed mb-6" style={{ color: "rgba(240,237,230,0.28)" }}>
                  Nieuwe muziek — digitaal en op vinyl. Van productie tot fysieke release.
                </p>
                <span className="text-[9px] tracking-[0.4em] uppercase" style={{ color: "rgba(201,168,76,0.3)" }}>
                  Binnenkort beschikbaar
                </span>
              </div>
            </div>
          </div>

          {/* ── Project 03: Beat Drop — binnenkort ── */}
          <div
            className="reveal reveal-delay-1 relative overflow-hidden flex flex-col "
            style={{
              minHeight: "clamp(400px, 55vh, 580px)",
              border: "1px solid rgba(201,168,76,0.1)",
              background: "linear-gradient(160deg, rgba(201,168,76,0.02) 0%, rgba(8,8,8,0) 60%)",
            }}
          >
            {/* Noise texture */}
            <div
              className="absolute inset-0 pointer-events-none"
              style={{
                backgroundImage: `url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='200' height='200'%3E%3Cfilter id='n'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.65' numOctaves='3' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='200' height='200' filter='url(%23n)'/%3E%3C/svg%3E")`,
                opacity: 0.03,
              }}
            />

            <div className="relative z-10 p-7 md:p-8 flex-1 flex flex-col">
              <div className="flex items-center justify-between mb-8">
                <span className="font-display text-[10px] tracking-[0.45em] uppercase" style={{ color: "rgba(201,168,76,0.2)" }}>
                  Project 03
                </span>
                <span className="text-[9px] tracking-[0.3em] uppercase" style={{ color: "rgba(240,237,230,0.2)" }}>Binnenkort</span>
              </div>

              {/* Lock — center feature */}
              <div className="flex-1 flex items-center justify-center py-6">
                <div
                  className="flex items-center justify-center w-14 h-14 border"
                  style={{ borderColor: "rgba(201,168,76,0.2)" }}
                >
                  <Lock size={18} color="rgba(201,168,76,0.4)" strokeWidth={1.2} />
                </div>
              </div>

              {/* Bottom info */}
              <div className="mt-auto">
                <div className="h-px mb-6" style={{ background: "rgba(201,168,76,0.07)" }} />
                <p
                  className="font-display font-normal mb-2"
                  style={{ fontSize: "clamp(16px,1.6vw,20px)", color: "rgba(240,237,230,0.6)" }}
                >
                  Beat Drop
                </p>
                <p className="text-[11px] leading-relaxed mb-6" style={{ color: "rgba(240,237,230,0.28)" }}>
                  Een platform voor producers en beatmakers om beats professioneel uit te brengen op streamingdiensten.
                </p>
                <span className="text-[9px] tracking-[0.4em] uppercase" style={{ color: "rgba(201,168,76,0.3)" }}>
                  Binnenkort beschikbaar
                </span>
              </div>
            </div>
          </div>

          {/* ── Meer volgt kaart ── */}
          <div
            className="reveal reveal-delay-2 relative overflow-hidden flex flex-col items-center justify-center "
            style={{
              minHeight: "clamp(400px, 55vh, 580px)",
              border: "1px dashed rgba(201,168,76,0.12)",
              background: "transparent",
            }}
          >
            <div className="relative z-10 flex flex-col items-center gap-6 px-8 text-center">
              {/* Animated rings */}
              <ConcentricRings size={120} opacity={0.18} />
              <div>
                <p
                  className="font-display font-normal mb-3"
                  style={{ fontSize: "clamp(16px,1.6vw,20px)", color: "rgba(240,237,230,0.25)" }}
                >
                  Wordt vervolgd.
                </p>
                <p className="text-[10px] leading-relaxed" style={{ color: "rgba(240,237,230,0.14)", maxWidth: 200 }}>
                  Déjà Vu Studio blijft bouwen. Nieuwe initiatieven volgen.
                </p>
              </div>
              <div className="flex items-center gap-2">
                {[0, 1, 2].map((i) => (
                  <span
                    key={i}
                    className="block rounded-full"
                    style={{
                      width: 3,
                      height: 3,
                      background: `rgba(201,168,76,${0.15 + i * 0.08})`,
                    }}
                  />
                ))}
              </div>
            </div>
          </div>

        </div>
      </div>
    </section>
  );
}

// ─── DIENSTEN PREVIEW ────────────────────────────────────────────────────────

function DienstenPreview() {
  const navigate = useNavigate();

  const CATS = [
    {
      num: "01",
      label: "Opnames & Productie",
      tagline: "Van idee naar opname.",
      body: "Studio-opnames, muziekproductie en songwriting — in een omgeving waar klank en gevoel centraal staan.",
      icon: Mic,
    },
    {
      num: "02",
      label: "Audio Services",
      tagline: "Kwaliteit die je hoort.",
      body: "Professioneel mixing en mastering voor een release-ready geluid op ieder platform.",
      icon: SlidersHorizontal,
    },
    {
      num: "03",
      label: "Artist Development",
      tagline: "Bouwen aan een carrière.",
      body: "Branding, contentcreatie, distributiebegeleiding en consultancy — gericht op de artiest als merk.",
      icon: TrendingUp,
    },
  ];

  return (
    <section id="diensten-preview" style={{ background: "#050505" }}>
      <div className="max-w-7xl mx-auto px-6 xl:px-12 pt-20 md:pt-28 pb-16 md:pb-20">

        {/* Header */}
        <div className="reveal flex items-end gap-4 md:gap-6 mb-10">
          <span
            className="font-display font-normal leading-none select-none"
            style={{ fontSize: "clamp(72px,12vw,128px)", color: "rgba(201,168,76,0.07)" }}
          >
            03
          </span>
          <div className="pb-3 -mt-3">
            <p className="text-[10px] tracking-[0.5em] uppercase mb-3" style={{ color: G }}>
              Diensten
            </p>
            <h2
              className="font-display font-normal text-white"
              style={{ fontSize: "clamp(28px,4vw,48px)", lineHeight: 1.15 }}
            >
              Expertise.
              <br />
              Op maat.
            </h2>
          </div>
        </div>
        <div className="h-px mb-12" style={{ background: `linear-gradient(90deg, rgba(201,168,76,0.4), transparent)` }} />

        {/* 3 category cards */}
        <div className="grid md:grid-cols-3 gap-5 mb-12">
          {CATS.map((cat, i) => {
            const Icon = cat.icon;
            return (
              <div
                key={cat.num}
                className={`reveal reveal-delay-${i + 1} p-7 border flex flex-col gap-5`}
                style={{
                  borderColor: "rgba(201,168,76,0.12)",
                  background: "rgba(201,168,76,0.02)",
                }}
              >
                <div className="flex items-start justify-between">
                  <div
                    className="w-10 h-10 flex items-center justify-center border"
                    style={{ borderColor: "rgba(201,168,76,0.2)" }}
                  >
                    <Icon size={15} color="rgba(201,168,76,0.6)" strokeWidth={1.4} />
                  </div>
                  <span
                    className="font-display text-[10px] tracking-[0.4em] uppercase"
                    style={{ color: "rgba(201,168,76,0.25)" }}
                  >
                    {cat.num}
                  </span>
                </div>

                <div>
                  <p className="text-[10px] tracking-[0.4em] uppercase mb-2" style={{ color: G }}>
                    {cat.label}
                  </p>
                  <p
                    className="font-display font-normal text-white mb-3"
                    style={{ fontSize: "clamp(15px,1.4vw,18px)" }}
                  >
                    {cat.tagline}
                  </p>
                  <p className="text-xs leading-relaxed" style={{ color: "rgba(240,237,230,0.4)" }}>
                    {cat.body}
                  </p>
                </div>
              </div>
            );
          })}
        </div>

        {/* CTA */}
        <div className="reveal flex justify-center">
          <button
            className="shimmer-wrap px-8 py-4 text-[10px] tracking-[0.4em] uppercase font-medium border transition-all duration-300"
            style={{ borderColor: "rgba(201,168,76,0.35)", color: G }}
            onClick={() => navigate("/diensten")}
          >
            Bekijk alle diensten →
          </button>
        </div>
      </div>
    </section>
  );
}

// ─── ONS VERHAAL ──────────────────────────────────────────────────────────────

function OnsVerhaal() {
  return (
    <section id="verhaal" style={{ background: BLACK }}>
      {/* Header */}
      <div className="max-w-7xl mx-auto px-6 xl:px-12 pt-20 md:pt-28">
        <div className="reveal flex items-end gap-4 md:gap-6 mb-10">
          <span
            className="font-display font-normal leading-none select-none"
            style={{ fontSize: "clamp(72px,12vw,128px)", color: "rgba(201,168,76,0.07)" }}
          >
            04
          </span>
          <div className="pb-3 -mt-3">
            <p className="text-[10px] tracking-[0.5em] uppercase mb-3" style={{ color: G }}>
              Ons Verhaal
            </p>
            <h2
              className="font-display font-normal text-white"
              style={{ fontSize: "clamp(24px,3.5vw,44px)", lineHeight: 1.2 }}
            >
              Waar passie terugkomt
              <br />
              en talent vooruitgaat.
            </h2>
          </div>
        </div>
        <div
          className="h-px"
          style={{ background: `linear-gradient(90deg, rgba(201,168,76,0.4), transparent)` }}
        />
      </div>

      {/* Full-width photo */}
      <div className="reveal mt-14 relative overflow-hidden" style={{ height: "clamp(380px, 65vh, 720px)" }}>
        <img
          src="https://images.unsplash.com/photo-1493225457124-a3eb161ffa5f?w=1920&h=900&fit=crop&auto=format"
          alt="Artiesten bij Déjà Vu Studios"
          className="w-full h-full object-cover"
          style={{ filter: "brightness(0.55) saturate(0.65)" }}
        />
        <div
          className="absolute inset-0"
          style={{ background: "linear-gradient(to right, rgba(8,8,8,0.75) 0%, transparent 55%)" }}
        />
        <div className="absolute inset-0 flex items-end p-10 md:p-16">
          <div className="reveal">
            <div
              className="h-px w-10 mb-5 gold-shimmer-line"
              style={{
                background: `linear-gradient(90deg, ${G}, transparent)`,
                "--shimmer-delay": "0s",
                "--shimmer-dur": "4s",
              } as React.CSSProperties}
            />
            <p
              className="font-display font-normal text-white"
              style={{ fontSize: "clamp(18px,2.8vw,30px)", lineHeight: 1.5, maxWidth: 480 }}
            >
              &#8220;Déjà Vu Studios is meer
              <br />
              dan een opnamestudio.&#8221;
            </p>
          </div>
        </div>
      </div>

      {/* Text */}
      <div className="max-w-7xl mx-auto px-6 xl:px-12 pt-16 md:pt-20 pb-8">
        <div className="grid md:grid-cols-2 gap-14 md:gap-16 items-start">
          <div className="reveal">
            <p
              className="font-display font-normal text-white leading-relaxed mb-5"
              style={{ fontSize: "clamp(18px,2.2vw,24px)" }}
            >
              Meer dan een studio
            </p>
            <p className="text-sm leading-loose mb-8" style={{ color: "rgba(240,237,230,0.52)" }}>
              Déjà Vu Studios is ontstaan vanuit een passie die nooit echt is verdwenen. Jaren geleden waren wij al actief bezig met muziek en alles wat daarbij komt kijken. Hoewel het leven veranderde en andere prioriteiten op ons pad kwamen, bleef die passie altijd ergens aanwezig. Toen we opnieuw begonnen te bouwen aan iets rondom muziek, ontstond een bijzonder gevoel — alsof we iets opnieuw ontdekten wat we ergens diep van binnen al kenden. Precies dat gevoel vormde de inspiratie voor de naam Déjà Vu.
            </p>
            <div
              className="h-px"
              style={{ background: `linear-gradient(90deg, rgba(201,168,76,0.3), transparent)` }}
            />
          </div>
          <div className="reveal reveal-delay-2">
            <p className="text-sm leading-loose mb-6" style={{ color: "rgba(201,168,76,0.75)", fontStyle: "italic" }}>
              Een plek voor de volgende generatie
            </p>
            <p className="text-sm leading-loose mb-6" style={{ color: "rgba(240,237,230,0.52)" }}>
              Vanuit die passie is Déjà Vu Studios meer geworden dan alleen een opnamestudio. We willen een omgeving creëren waar artiesten, producers, engineers, beatmakers en songwriters samenkomen, elkaar inspireren en samen groeien.
            </p>
            <p className="text-sm leading-loose" style={{ color: "rgba(240,237,230,0.52)" }}>
              Want soms voelt het begin van iets nieuws verrassend bekend. Een idee, een samenwerking of een moment in de studio kan datzelfde gevoel oproepen — alsof je hier al eerder had moeten zijn. Dat is wat Déjà Vu Studios voor ons betekent: een plek waar passie opnieuw wordt herkend en waar nieuwe verhalen kunnen beginnen.
            </p>
          </div>

        </div>
        <div className="flex justify-center pt-12">
          <img
            src={dvStudiosLogo}
            alt="Déjà Vu Studios"
            className="w-52 object-contain"
            style={{ opacity: 0.85 }}
          />
        </div>
      </div>

    </section>
  );
}

// ─── CONTACT ──────────────────────────────────────────────────────────────────

function ContactSuccessModal({ onClose }: { onClose: () => void }) {
  return (
    <motion.div
      className="fixed inset-0 z-[8000] flex items-center justify-center p-6"
      style={{ background: "rgba(4,4,4,0.88)", backdropFilter: "blur(12px)" }}
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      transition={{ duration: 0.3 }}
      onClick={onClose}
    >
      <motion.div
        className="relative w-full max-w-sm text-center p-10"
        style={{ background: "#0E0E0E", border: "1px solid rgba(201,168,76,0.22)" }}
        initial={{ opacity: 0, scale: 0.96, y: 16 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        exit={{ opacity: 0, scale: 0.96, y: 16 }}
        transition={{ duration: 0.4, ease: [0.16, 1, 0.3, 1] }}
        onClick={e => e.stopPropagation()}
      >
        <button
          onClick={onClose}
          className="absolute top-4 right-4 transition-opacity hover:opacity-60"
          style={{ color: "rgba(240,237,230,0.3)" }}
        >
          <X size={14} />
        </button>

        <div className="flex justify-center mb-6">
          <ConcentricRings size={80} opacity={0.5} />
        </div>

        <p className="text-[9px] tracking-[0.55em] uppercase mb-3" style={{ color: G }}>
          Bericht ontvangen
        </p>
        <h3 className="font-display font-normal text-white mb-4" style={{ fontSize: "clamp(20px,3vw,26px)" }}>
          Bedankt!
        </h3>
        <p className="text-sm leading-relaxed mb-8" style={{ color: "rgba(240,237,230,0.45)" }}>
          We hebben je bericht ontvangen en nemen zo snel mogelijk contact met je op.
        </p>
        <button
          onClick={onClose}
          className="shimmer-wrap w-full py-3.5 text-[10px] tracking-[0.4em] uppercase transition-all duration-300"
          style={{ borderColor: "rgba(201,168,76,0.35)", color: G, border: "1px solid rgba(201,168,76,0.35)" }}
        >
          Sluiten
        </button>
      </motion.div>
    </motion.div>
  );
}

function Contact() {
  const [form, setForm] = useState({ naam: "", email: "", bericht: "" });
  const [sending, setSending] = useState(false);
  const [sent, setSent] = useState(false);
  const [sendError, setSendError] = useState<string | null>(null);

  const inputStyle: React.CSSProperties = {
    background: "transparent",
    borderBottom: "1px solid rgba(201,168,76,0.18)",
    color: WHITE,
    fontFamily: "'Outfit', sans-serif",
    fontSize: 14,
    padding: "12px 0",
    width: "100%",
    outline: "none",
  };

  return (
    <section id="contact" style={{ background: "#050505" }}>
      <div className="max-w-7xl mx-auto px-6 xl:px-12 pt-20 md:pt-28">
        <div className="reveal flex items-end gap-4 md:gap-6 mb-10">
          <span
            className="font-display font-normal leading-none select-none"
            style={{ fontSize: "clamp(72px,12vw,128px)", color: "rgba(201,168,76,0.07)" }}
          >
            05
          </span>
          <div className="pb-3 -mt-3">
            <p className="text-[10px] tracking-[0.5em] uppercase mb-3" style={{ color: G }}>
              Contact
            </p>
            <h2
              className="font-display font-normal text-white"
              style={{ fontSize: "clamp(28px,4vw,48px)", lineHeight: 1.15 }}
            >
              Laten we
              <br />
              kennismaken.
            </h2>
          </div>
        </div>
        <div
          className="h-px mb-12"
          style={{ background: `linear-gradient(90deg, rgba(201,168,76,0.4), transparent)` }}
        />

        <div className="grid lg:grid-cols-2 gap-16 lg:gap-20 mb-24">
          {/* Form */}
          <div className="reveal">
            <h3 className="font-display text-xl font-normal text-white mb-8">
              Stuur een bericht
            </h3>
            <form
              className="flex flex-col gap-7"
              onSubmit={async (e) => {
                e.preventDefault();
                if (!form.naam || !form.email || !form.bericht) return;
                setSending(true); setSendError(null);
                const { error } = await supabase.from("contact_submissions").insert({
                  naam: form.naam.trim(),
                  email: form.email.trim().toLowerCase(),
                  bericht: form.bericht.trim(),
                });
                setSending(false);
                if (error) { setSendError("Er ging iets mis. Probeer het opnieuw of mail ons direct."); }
                else { setSent(true); setForm({ naam: "", email: "", bericht: "" }); }
              }}
            >
              {[
                { key: "naam", label: "Naam", type: "text", placeholder: "Jouw naam" },
                { key: "email", label: "E-mail", type: "email", placeholder: "jouw@email.com" },
              ].map((f) => (
                <div key={f.key}>
                  <label
                    className="block text-[10px] tracking-[0.35em] uppercase mb-2"
                    style={{ color: "rgba(240,237,230,0.35)" }}
                  >
                    {f.label}
                  </label>
                  <input
                    type={f.type}
                    value={form[f.key as keyof typeof form]}
                    onChange={(e) => setForm({ ...form, [f.key]: e.target.value })}
                    placeholder={f.placeholder}
                    style={inputStyle}
                  />
                </div>
              ))}
              <div>
                <label
                  className="block text-[10px] tracking-[0.35em] uppercase mb-2"
                  style={{ color: "rgba(240,237,230,0.35)" }}
                >
                  Bericht
                </label>
                <textarea
                  rows={4}
                  value={form.bericht}
                  onChange={(e) => setForm({ ...form, bericht: e.target.value })}
                  placeholder="Vertel ons over jouw project..."
                  style={{ ...inputStyle, resize: "none" }}
                />
              </div>
              {sendError && (
                <p className="text-[11px] px-3 py-2" style={{ background: "rgba(239,68,68,0.07)", color: "#EF4444", border: "1px solid rgba(239,68,68,0.18)" }}>
                  {sendError}
                </p>
              )}
              <button
                type="submit"
                disabled={sending || !form.naam || !form.email || !form.bericht}
                className="shimmer-wrap mt-2 py-4 text-[10px] tracking-[0.45em] uppercase font-medium transition-all duration-300"
                style={{
                  background: `linear-gradient(135deg, ${G_DARK}, ${G} 50%, ${G_LIGHT})`,
                  color: "#080808",
                  opacity: (sending || !form.naam || !form.email || !form.bericht) ? 0.5 : 1,
                  cursor: sending ? "not-allowed" : "pointer",
                }}
              >
                {sending ? "Versturen…" : "Verstuur bericht"}
              </button>
            </form>
          </div>

          {/* Info */}
          <div className="reveal reveal-delay-2 flex flex-col gap-0">
            <h3 className="font-display text-xl font-normal text-white mb-8">
              Contactgegevens
            </h3>

            {[
              { label: "E-mail", value: "dejavustudio036@gmail.com" },
              { label: "Adres",  value: "Argonweg 40, Almere" },
            ].map((item) => (
              <div
                key={item.label}
                className="flex items-start gap-6 py-5 border-b"
                style={{ borderColor: "rgba(201,168,76,0.1)" }}
              >
                <span
                  className="text-[10px] tracking-[0.35em] uppercase pt-0.5 shrink-0 w-20"
                  style={{ color: G }}
                >
                  {item.label}
                </span>
                <span className="text-sm" style={{ color: "rgba(240,237,230,0.55)" }}>
                  {item.value}
                </span>
              </div>
            ))}

            {/* Social */}
            <div className="mt-8">
              <p
                className="text-[10px] tracking-[0.4em] uppercase mb-4"
                style={{ color: G }}
              >
                Volg ons
              </p>
              <div className="flex flex-wrap gap-2">
                <a
                  href="https://www.instagram.com/dejavustudio.nl?igsh=MWs3MzhxYXBuNWU3dA=="
                  target="_blank"
                  rel="noopener noreferrer"
                  className="shimmer-wrap text-[9px] tracking-[0.25em] uppercase px-4 py-2.5 border transition-all duration-300"
                  style={{ borderColor: "rgba(201,168,76,0.35)", color: G, textDecoration: "none" }}
                >
                  Instagram
                </a>
                {["YouTube", "TikTok", "Spotify"].map((p) => (
                  <button
                    key={p}
                    className="shimmer-wrap text-[9px] tracking-[0.25em] uppercase px-4 py-2.5 border transition-all duration-300"
                    style={{ borderColor: "rgba(201,168,76,0.22)", color: "rgba(240,237,230,0.45)" }}
                    onMouseEnter={(e) => (e.currentTarget.style.color = G)}
                    onMouseLeave={(e) => (e.currentTarget.style.color = "rgba(240,237,230,0.45)")}
                  >
                    {p}
                  </button>
                ))}
              </div>
            </div>

            {/* Google Maps */}
            <div className="mt-8 overflow-hidden" style={{ border: "1px solid rgba(201,168,76,0.12)" }}>
              <iframe
                title="Déjà Vu Studios locatie"
                src="https://maps.google.com/maps?q=Argonweg+40,+Almere,+Netherlands&output=embed&z=15"
                width="100%"
                height="200"
                style={{ border: "none", display: "block", filter: "grayscale(1) brightness(0.75) contrast(1.1)" }}
                loading="lazy"
                referrerPolicy="no-referrer-when-downgrade"
              />
            </div>
          </div>
        </div>
      </div>

      {/* Footer */}
      <div style={{ borderTop: "1px solid rgba(201,168,76,0.09)" }}>
        <div className="max-w-7xl mx-auto px-6 xl:px-12 py-8 flex flex-col md:flex-row items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <img src={dvLogo} alt="DV" className="w-6 h-6 rounded-full object-cover opacity-55" />
            <span
              className="font-display text-[10px] tracking-[0.35em]"
              style={{ color: "rgba(240,237,230,0.28)" }}
            >
              DÉJÀ VU STUDIOS
            </span>
          </div>
          <p className="text-[10px] tracking-[0.2em]" style={{ color: "rgba(240,237,230,0.2)" }}>
            © 2026 Déjà Vu Studios. Alle rechten voorbehouden.
          </p>
          <p className="text-[10px] tracking-[0.2em]" style={{ color: "rgba(201,168,76,0.38)" }}>
            Meer dan een studio.
          </p>
        </div>
      </div>
      <AnimatePresence>
        {sent && <ContactSuccessModal onClose={() => setSent(false)} />}
      </AnimatePresence>
    </section>
  );
}

// ─── MAIN CONTENT ─────────────────────────────────────────────────────────────

function MainContent() {
  useReveal();
  return (
    <>
      <Nav />
      <Hero />
      <Ruimten />
      <Projecten />
      <DienstenPreview />
      <OnsVerhaal />
      <Contact />
    </>
  );
}

// ─── HOME PAGE ────────────────────────────────────────────────────────────────

function HomePage() {
  const alreadySeen = sessionStorage.getItem("introSeen") === "true";
  const [done, setDone] = useState(alreadySeen);

  const handleIntroComplete = () => {
    sessionStorage.setItem("introSeen", "true");
    setDone(true);
  };

  useEffect(() => {
    if (done) {
      const target = sessionStorage.getItem("scrollTarget");
      if (target) {
        sessionStorage.removeItem("scrollTarget");
        setTimeout(() => scrollTo(target), 150);
      }
    }
  }, [done]);

  return (
    <div style={{ background: BLACK, minHeight: "100svh" }}>
      <AnimatePresence>
        {!done && <IntroAnimation onComplete={handleIntroComplete} />}
      </AnimatePresence>

      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: done ? 1 : 0 }}
        transition={{ duration: 0.7 }}
      >
        {done && <MainContent />}
      </motion.div>
    </div>
  );
}

// ─── DIENSTEN DATA ────────────────────────────────────────────────────────────

interface DienstService {
  id: string;
  icon: React.ComponentType<{ size?: number; color?: string; strokeWidth?: number }>;
  name: string;
  short: string;
  detail: string;
  tags: string[];
}

interface DienstCategory {
  num: string;
  label: string;
  headline: string;
  bg: string;
  services: DienstService[];
}

const DIENSTEN: DienstCategory[] = [
  {
    num: "01",
    label: "Opnames & Productie",
    headline: "Van idee naar opname.",
    bg: BLACK,
    services: [
      {
        id: "studio-opnames",
        icon: Mic,
        name: "Studio-opnames",
        short: "Professionele opnames in een akoestisch optimale omgeving.",
        detail: "Déjà Vu Studio biedt hoogwaardige studio-opnames voor artiesten op ieder niveau. Met professionele apparatuur, een geoptimaliseerde akoestiek en ervaren engineers zorgen we voor een opnameproces dat klank en gevoel tot hun recht laat komen.",
        tags: ["Zang", "Instrumenten", "Voiceover"],
      },
      {
        id: "muziekproductie",
        icon: Music,
        name: "Muziekproductie",
        short: "Volledige productie — van beat tot eindmix.",
        detail: "Onze producers werken nauw samen met artiesten om een uniek geluid te ontwikkelen. Van arrangement en instrumentatie tot sound design en finishing — elke productie wordt gebouwd rondom het artistieke verhaal van de artiest.",
        tags: ["Arrangement", "Beat productie", "Sound design"],
      },
      {
        id: "songwriting",
        icon: PenLine,
        name: "Songwriting",
        short: "Verhalen die blijven hangen. Teksten die raken.",
        detail: "Songwriting is meer dan woorden op papier. Bij Déjà Vu Studio werken artiesten samen met ervaren songwriters om authentieke nummers te schrijven die aansluiten bij hun identiteit en publiek.",
        tags: ["Co-writing", "Toplining", "Lyrics"],
      },
    ],
  },
  {
    num: "02",
    label: "Audio Services",
    headline: "Kwaliteit die je hoort.",
    bg: "#050505",
    services: [
      {
        id: "mixing",
        icon: SlidersHorizontal,
        name: "Mixing",
        short: "Balans, diepte en karakter — in iedere mix.",
        detail: "Een professionele mix zorgt ervoor dat ieder element in het nummer zijn juiste plek krijgt. Onze mixing engineers werken met oog voor detail en een scherp oor voor klank, zodat het eindresultaat klinkt zoals het bedoeld is.",
        tags: ["Stereo mix", "Stem mixing", "Instrumentale mix"],
      },
      {
        id: "mastering",
        icon: Activity,
        name: "Mastering",
        short: "De laatste stap naar een release-ready geluid.",
        detail: "Mastering is de finishing touch. We zorgen voor een consistent, krachtig en platform-klaar geluid — of het nu voor Spotify, Apple Music of vinyl is. Iedere master wordt afgestemd op het beoogde releaseformaat.",
        tags: ["Streaming mastering", "Vinyl mastering", "Loudness"],
      },
      {
        id: "mix-mastering",
        icon: Layers,
        name: "Mix & Mastering",
        short: "Volledig pakket voor een professionele afwerking.",
        detail: "De combinatie van mixing en mastering als één naadloos project. Ideaal voor artiesten die hun productie van begin tot eind willen afwerken met consistente kwaliteit en één aanspreekpunt gedurende het hele proces.",
        tags: ["All-in pakket", "Efficiënt", "Release-ready"],
      },
    ],
  },
  {
    num: "03",
    label: "Artist Development",
    headline: "Bouwen aan een carrière.",
    bg: BLACK,
    services: [
      {
        id: "artist-development",
        icon: TrendingUp,
        name: "Artist Development",
        short: "Strategische begeleiding voor de groei van een artiest.",
        detail: "Artist development bij Déjà Vu Studio gaat verder dan muziek. We begeleiden artiesten bij het ontwikkelen van hun artistieke identiteit, het bepalen van hun richting en het nemen van de juiste stappen in hun carrière.",
        tags: ["Artistieke visie", "Carrièrebegeleiding", "Strategie"],
      },
      {
        id: "branding",
        icon: Sparkles,
        name: "Branding",
        short: "Een herkenbare identiteit voor iedere artiest.",
        detail: "Een sterke artiestidentiteit begint bij een consistent visueel verhaal. We helpen artiesten bij het ontwikkelen van een merklook die aansluit bij hun muziek en doelgroep — van concept tot totaalplaatje.",
        tags: ["Artiestidentiteit", "Visual identity", "Merkverhaal"],
      },
      {
        id: "contentcreatie",
        icon: Camera,
        name: "Contentcreatie",
        short: "Visuele content die het verhaal van de artiest vertelt.",
        detail: "Content is de brug tussen artiest en publiek. We ondersteunen artiesten bij het creëren van fotografie, videocontent en social media materiaal dat aansluit bij hun muziek en merkidentiteit.",
        tags: ["Fotografie", "Video", "Social media"],
      },
      {
        id: "distributiebegeleiding",
        icon: Globe,
        name: "Distributiebegeleiding",
        short: "Uw muziek op de juiste platformen, op het juiste moment.",
        detail: "Een release verdient de juiste aanpak. We begeleiden artiesten bij het plannen en uitvoeren van een professionele distributie — van het kiezen van het juiste kanaal tot de timing en het releaseproces.",
        tags: ["Streaming", "Distributie", "Release strategie"],
      },
      {
        id: "consultancy",
        icon: MessageSquare,
        name: "Consultancy",
        short: "Advies en begeleiding op maat.",
        detail: "Iedere artiest heeft andere vragen. Onze consultancydienst biedt ruimte voor een persoonlijk gesprek over richting, kansen en de volgende stap — zonder verplichtingen, maar met concrete inzichten.",
        tags: ["Adviesgesprek", "Strategie", "Maatwerk"],
      },
    ],
  },
];

// ─── DIENSTEN PAGE ────────────────────────────────────────────────────────────

function DienstenPage() {
  const navigate = useNavigate();
  const [expandedId, setExpandedId] = useState<string | null>(null);
  useReveal();

  return (
    <div style={{ background: BLACK, minHeight: "100svh" }}>
      <Nav />

      {/* ── Hero ── */}
      <section
        className="relative flex flex-col items-center justify-center overflow-hidden"
        style={{ height: "62svh", minHeight: 480, background: BLACK }}
      >
        {/* Blended photo */}
        <div className="absolute inset-0">
          <img
            src={studioGold1}
            alt="Déjà Vu Studio — diensten"
            className="w-full h-full object-cover"
            style={{ filter: "brightness(0.32) saturate(0.5)", mixBlendMode: "luminosity" }}
          />
          <div className="absolute inset-0" style={{ background: "rgba(18,11,2,0.55)", mixBlendMode: "multiply" }} />
          <div
            className="absolute inset-0"
            style={{
              background:
                "radial-gradient(ellipse at 50% 40%, transparent 30%, rgba(8,8,8,0.6) 100%), linear-gradient(to bottom, rgba(8,8,8,0.2) 0%, rgba(8,8,8,0.45) 50%, rgba(8,8,8,1) 100%)",
            }}
          />
        </div>

        {/* Background rings */}
        <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
          <ConcentricRings size={680} opacity={0.1} className="hidden lg:block" />
        </div>

        {/* Content */}
        <div className="relative z-10 text-center px-6 max-w-4xl">
          <motion.p
            className="text-[10px] tracking-[0.6em] uppercase mb-6"
            style={{ color: G }}
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.1 }}
          >
            Déjà Vu Studio
          </motion.p>
          <motion.h1
            className="font-display font-normal text-white leading-none mb-5"
            style={{ fontSize: "clamp(42px,7.5vw,88px)", letterSpacing: "-0.02em" }}
            initial={{ opacity: 0, y: 28 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 1.1, delay: 0.25, ease: [0.16, 1, 0.3, 1] }}
          >
            Expertise.
            <br />
            <span style={{ color: "rgba(240,237,230,0.32)" }}>Op maat.</span>
          </motion.h1>
          <motion.p
            className="text-sm tracking-[0.06em] mx-auto"
            style={{ color: "rgba(240,237,230,0.42)", maxWidth: 360 }}
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.9, delay: 0.6 }}
          >
            Professionele ondersteuning tijdens iedere stap van het creatieve proces — van opname tot ontwikkeling.
          </motion.p>
        </div>
      </section>

      {/* ── Categories ── */}
      {DIENSTEN.map((cat) => (
        <section key={cat.num} style={{ background: cat.bg }}>
          <div className="max-w-7xl mx-auto px-6 xl:px-12 pt-20 md:pt-24 pb-16 md:pb-20">

            {/* Category header */}
            <div className="reveal flex items-end gap-4 md:gap-6 mb-10">
              <span
                className="font-display font-normal leading-none select-none"
                style={{ fontSize: "clamp(72px,12vw,128px)", color: "rgba(201,168,76,0.07)" }}
              >
                {cat.num}
              </span>
              <div className="pb-3 -mt-3">
                <p className="text-[10px] tracking-[0.5em] uppercase mb-3" style={{ color: G }}>
                  {cat.label}
                </p>
                <h2
                  className="font-display font-normal text-white"
                  style={{ fontSize: "clamp(24px,3.5vw,44px)", lineHeight: 1.15 }}
                >
                  {cat.headline}
                </h2>
              </div>
            </div>
            <div
              className="h-px mb-12"
              style={{ background: `linear-gradient(90deg, rgba(201,168,76,0.4), transparent)` }}
            />

            {/* Services grid */}
            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4">
              {cat.services.map((svc, i) => {
                const Icon = svc.icon;
                const isOpen = expandedId === svc.id;
                return (
                  <div
                    key={svc.id}
                    className={`reveal reveal-delay-${(i % 3) + 1}`}
                    onClick={() => setExpandedId(isOpen ? null : svc.id)}
                    style={{ cursor: "pointer" }}
                  >
                    <div
                      className="h-full p-7 border transition-all duration-400 flex flex-col"
                      style={{
                        borderColor: isOpen ? "rgba(201,168,76,0.35)" : "rgba(201,168,76,0.1)",
                        background: isOpen
                          ? "linear-gradient(160deg, rgba(201,168,76,0.07) 0%, rgba(8,8,8,0) 70%)"
                          : "rgba(201,168,76,0.015)",
                      }}
                    >
                      {/* Top row: icon + chevron */}
                      <div className="flex items-start justify-between mb-6">
                        <div
                          className="w-10 h-10 flex items-center justify-center border transition-all duration-300"
                          style={{
                            borderColor: isOpen ? "rgba(201,168,76,0.45)" : "rgba(201,168,76,0.18)",
                          }}
                        >
                          <Icon
                            size={15}
                            color={isOpen ? G : "rgba(201,168,76,0.45)"}
                            strokeWidth={1.4}
                          />
                        </div>
                        <div
                          className="transition-transform duration-350"
                          style={{
                            color: "rgba(201,168,76,0.4)",
                            transform: isOpen ? "rotate(180deg)" : "rotate(0deg)",
                          }}
                        >
                          <ChevronDown size={14} />
                        </div>
                      </div>

                      {/* Name */}
                      <h3
                        className="font-display font-normal text-white mb-2"
                        style={{ fontSize: "clamp(16px,1.5vw,21px)" }}
                      >
                        {svc.name}
                      </h3>

                      {/* Short description */}
                      <p className="text-xs leading-relaxed" style={{ color: "rgba(240,237,230,0.42)" }}>
                        {svc.short}
                      </p>

                      {/* Expandable detail */}
                      <AnimatePresence>
                        {isOpen && (
                          <motion.div
                            initial={{ opacity: 0, height: 0 }}
                            animate={{ opacity: 1, height: "auto" }}
                            exit={{ opacity: 0, height: 0 }}
                            transition={{ duration: 0.38, ease: [0.16, 1, 0.3, 1] }}
                            style={{ overflow: "hidden" }}
                          >
                            <div className="pt-5 mt-5 border-t" style={{ borderColor: "rgba(201,168,76,0.12)" }}>
                              <p className="text-xs leading-loose mb-5" style={{ color: "rgba(240,237,230,0.52)" }}>
                                {svc.detail}
                              </p>
                              <div className="flex flex-wrap gap-1.5 mb-6">
                                {svc.tags.map((tag) => (
                                  <span
                                    key={tag}
                                    className="text-[9px] tracking-[0.22em] uppercase px-2.5 py-1 border"
                                    style={{
                                      borderColor: "rgba(201,168,76,0.18)",
                                      color: "rgba(201,168,76,0.55)",
                                    }}
                                  >
                                    {tag}
                                  </span>
                                ))}
                              </div>
                              <button
                                className="shimmer-wrap text-[9px] tracking-[0.35em] uppercase px-5 py-3 border transition-all duration-300"
                                style={{ borderColor: "rgba(201,168,76,0.32)", color: G }}
                                onClick={(e) => {
                                  e.stopPropagation();
                                  sessionStorage.setItem("scrollTarget", "contact");
                                  navigate("/");
                                }}
                              >
                                Laten we kennismaken
                              </button>
                            </div>
                          </motion.div>
                        )}
                      </AnimatePresence>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </section>
      ))}

      {/* ── CTA ── */}
      <section style={{ background: "#040404" }}>
        <div className="relative max-w-7xl mx-auto px-6 xl:px-12 py-16 md:py-20 text-center overflow-hidden">
          <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
            <ConcentricRings size={580} opacity={0.08} />
          </div>
          <div className="relative z-10">
            <div className="reveal flex justify-center mb-10">
              <img
                src={dvStudiosLogo}
                alt="Déjà Vu Studio"
                className="w-36 md:w-48 object-contain"
                style={{ opacity: 0.8 }}
              />
            </div>
            <div className="reveal reveal-delay-1">
              <p className="text-[10px] tracking-[0.55em] uppercase mb-5" style={{ color: G }}>
                Persoonlijk gesprek
              </p>
              <h2
                className="font-display font-normal text-white mb-5"
                style={{ fontSize: "clamp(28px,4vw,54px)", lineHeight: 1.12 }}
              >
                Laten we
                <br />
                kennismaken.
              </h2>
              <p
                className="text-sm leading-loose mx-auto mb-10"
                style={{ color: "rgba(240,237,230,0.42)", maxWidth: 340 }}
              >
                Bespreek uw project in een persoonlijk gesprek. Geen verplichtingen — wel concrete inzichten.
              </p>
              <button
                className="shimmer-wrap px-10 py-4 text-[10px] tracking-[0.42em] uppercase font-medium transition-all duration-300"
                style={{
                  background: `linear-gradient(135deg, ${G_DARK}, ${G} 50%, ${G_LIGHT})`,
                  color: BLACK,
                }}
                onClick={() => {
                  sessionStorage.setItem("scrollTarget", "contact");
                  navigate("/");
                }}
              >
                Neem contact op
              </button>
            </div>
          </div>
        </div>
      </section>

      {/* ── Footer ── */}
      <div style={{ borderTop: "1px solid rgba(201,168,76,0.09)", background: BLACK }}>
        <div className="max-w-7xl mx-auto px-6 xl:px-12 py-8 flex flex-col md:flex-row items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <img src={dvLogo} alt="DV" className="w-6 h-6 rounded-full object-cover opacity-55" />
            <span className="font-display text-[10px] tracking-[0.35em]" style={{ color: "rgba(240,237,230,0.28)" }}>
              DÉJÀ VU STUDIO
            </span>
          </div>
          <p className="text-[10px] tracking-[0.2em]" style={{ color: "rgba(240,237,230,0.2)" }}>
            © 2026 Déjà Vu Studio. Alle rechten voorbehouden.
          </p>
          <p className="text-[10px] tracking-[0.2em]" style={{ color: "rgba(201,168,76,0.38)" }}>
            Meer dan een studio.
          </p>
        </div>
      </div>
    </div>
  );
}

// ─── ROOT LAYOUT ──────────────────────────────────────────────────────────────

// ─── LOGIN MODAL ─────────────────────────────────────────────────────────────

function LoginModal({ onClose }: { onClose: () => void }) {
  const { signIn, session } = useAuth();
  const navigate = useNavigate();
  const [email, setEmail]       = useState("");
  const [password, setPassword] = useState("");
  const [err, setErr]           = useState<string | null>(null);
  const [busy, setBusy]         = useState(false);

  useEffect(() => { if (session) { navigate("/dashboard"); onClose(); } }, [session]);

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email || !password) { setErr("Vul je e-mail en wachtwoord in."); return; }
    setBusy(true); setErr(null);
    const error = await signIn(email.trim().toLowerCase(), password);
    setBusy(false);
    if (error) setErr(error.includes("Invalid") || error.includes("credentials") ? "Onjuiste inloggegevens." : error);
  };

  const inp: React.CSSProperties = {
    background: "#0A0A0A", border: "1px solid rgba(201,168,76,0.2)",
    color: "rgba(240,237,230,0.85)", borderRadius: 4, padding: "10px 14px",
    fontSize: 13, width: "100%", outline: "none",
  };

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center p-4"
      style={{ background: "rgba(0,0,0,0.82)", backdropFilter: "blur(10px)" }}
      onClick={(e) => { if (e.target === e.currentTarget) onClose(); }}>
      <motion.div initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: 16 }}
        className="relative w-full max-w-sm p-8 rounded"
        style={{ background: "#0E0E0E", border: "1px solid rgba(201,168,76,0.18)" }}>
        <button onClick={onClose} className="absolute top-4 right-4 p-1.5 transition-opacity hover:opacity-70"
          style={{ color: "rgba(240,237,230,0.35)" }}>
          <X size={15} />
        </button>
        <p className="text-[9px] tracking-[0.45em] uppercase mb-2" style={{ color: "#C9A84C" }}>Déjà Vu OS</p>
        <h2 className="font-display text-2xl font-normal mb-8" style={{ color: "rgba(240,237,230,0.92)" }}>Inloggen</h2>
        <form onSubmit={submit} className="space-y-4">
          <div>
            <label className="block text-[9px] tracking-[0.35em] uppercase mb-2" style={{ color: "rgba(240,237,230,0.3)" }}>E-mailadres</label>
            <input type="email" value={email} onChange={e => setEmail(e.target.value)} style={inp} autoComplete="email" autoFocus />
          </div>
          <div>
            <label className="block text-[9px] tracking-[0.35em] uppercase mb-2" style={{ color: "rgba(240,237,230,0.3)" }}>Wachtwoord</label>
            <input type="password" value={password} onChange={e => setPassword(e.target.value)} style={inp} autoComplete="current-password" />
          </div>
          {err && (
            <p className="text-[11px] px-3 py-2 rounded" style={{ background: "rgba(239,68,68,0.08)", color: "#EF4444", border: "1px solid rgba(239,68,68,0.18)" }}>
              {err}
            </p>
          )}
          <button type="submit" disabled={busy}
            className="w-full py-3 mt-2 text-[10px] tracking-[0.35em] uppercase transition-opacity"
            style={{ background: "rgba(201,168,76,0.1)", border: "1px solid rgba(201,168,76,0.35)", color: "#C9A84C", opacity: busy ? 0.5 : 1, cursor: busy ? "not-allowed" : "pointer" }}>
            {busy ? "Bezig…" : "Inloggen"}
          </button>
        </form>
      </motion.div>
    </div>
  );
}

function Root() {
  const { pathname } = useLocation();
  const [loginOpen, setLoginOpen] = useState(false);
  useEffect(() => { window.scrollTo(0, 0); }, [pathname]);
  return (
    <OpenLoginCtx.Provider value={() => setLoginOpen(true)}>
      <GlobalStyles />
      <GrainOverlay />
      <Outlet />
      <AnimatePresence>
        {loginOpen && <LoginModal onClose={() => setLoginOpen(false)} />}
      </AnimatePresence>
    </OpenLoginCtx.Provider>
  );
}

// ─── DASHBOARD ───────────────────────────────────────────────────────────────

const DB_GOLD    = "#C9A84C";
const DB_SURFACE = "#111111";
const DB_BORDER  = "rgba(201,168,76,0.12)";
const SERVER     = "https://lboovczhagqnzcyclzbl.supabase.co/functions/v1/make-server-742d9a67";
const apiFetch   = (path: string, opts?: RequestInit, token?: string) => {
  const key = token ?? SUPABASE_ANON;
  return fetch(`${SERVER}${path}`, {
    ...opts,
    headers: { "Authorization": `Bearer ${key}`, "Content-Type": "application/json", ...(opts?.headers ?? {}) },
  });
};

type Profile = {
  id: string; organization_id: string; display_name: string; full_name: string | null;
  email: string | null; is_active: boolean; auth_user_id?: string;
  user_roles?: { role: { name: string; slug: string } }[];
  user_programs?: { program: { name: string; slug: string } }[];
};
type Booking = {
  id: string; date: string; start_time: string; end_time: string;
  duration_hours: number; notes: string | null; artist_id?: string;
  artist?: { display_name: string }; studio?: { id?: string; name: string };
  booking_type?: { name: string }; program?: { name: string } | null;
  status?: { name: string; color: string; slug: string };
};
type StudioDB = {
  id: string; name: string; slug: string;
  description?: string; is_active: boolean; is_bookable: boolean;
  opens_at?: string; closes_at?: string;
};
type ServiceOption = {
  role_id: string; is_required: boolean; is_optional: boolean;
  label: string | null; role: { name: string; slug: string };
};
type Service = {
  id: string; name: string; slug: string; description?: string;
  options?: ServiceOption[];
};

const DASH_MODULES = [
  { id: "dashboard",       label: "Dashboard",       icon: Activity },
  { id: "boekingen",       label: "Boekingen",       icon: Music },
  { id: "agenda",          label: "Agenda",          icon: Sparkles },
  { id: "artiesten",       label: "Artiesten",       icon: Mic },
  { id: "medewerkers",     label: "Medewerkers",     icon: MessageSquare },
  { id: "studios",         label: "Studio's",        icon: Layers },
  { id: "programmas",      label: "Programma's",     icon: TrendingUp },
  { id: "wallet",          label: "Studiotijd",      icon: Clock },
  { id: "beschikbaarheid", label: "Beschikbaarheid", icon: CalendarDays },
  { id: "berichten",       label: "Berichten",       icon: MessageSquare },
  { id: "profiel",         label: "Profiel",         icon: Globe },
];


const DEV_PROFILE: Profile = {
  id: "dev-preview", organization_id: "00000000-0000-0000-0000-000000000001",
  display_name: "Dev Preview", full_name: "Dev Preview (no auth)",
  email: "dev@preview.local", is_active: true,
  user_roles: [{ role: { name: "Administrator", slug: "administrator" } }],
  user_programs: [],
};

function DashboardPage() {
  const navigate = useNavigate();
  const { session, signOut, authLoading } = useAuth();
  const devMode = typeof window !== "undefined" && new URLSearchParams(window.location.search).has("dev");
  const token = devMode ? SUPABASE_ANON : session?.access_token;

  // Redirect to home if not authenticated (skip in dev mode)
  useEffect(() => {
    if (!devMode && !authLoading && !session) navigate("/");
  }, [authLoading, session, devMode]);

  const [sidebarOpen, setSidebarOpen] = useState(true);
  const [overview, setOverview] = useState<{ totalProfiles: number; totalBookings: number; recentBookings: Booking[]; profiles: Profile[] } | null>(null);
  const [bookings, setBookings] = useState<Booking[]>([]);
  const [profiles, setProfiles] = useState<Profile[]>([]);
  const [loadingOverview, setLoadingOverview] = useState(true);
  const [myProfile, setMyProfile] = useState<Profile | null>(null);

  const isAdmin = (devMode ? DEV_PROFILE : myProfile)?.user_roles?.some(r => r.role.slug === "administrator") ?? false;

  const [activeModule, setModule] = useState("dashboard");
  const [selectedProfile, setSelectedProfile] = useState<Profile | null>(null);
  const [loadingProfiles, setLoadingProfiles] = useState(false);
  const [loadingBookings, setLoadingBookings] = useState(false);
  const [dbStudios, setDbStudios] = useState<StudioDB[]>([]);
  const [dbBookingTypes, setDbBookingTypes] = useState<{ id: string; name: string; slug: string }[]>([]);
  const [dbServices, setDbServices] = useState<Service[]>([]);
  const [wallets, setWallets] = useState<Record<string, { hours_total: number; hours_used: number; hours_remaining: number; split_used: boolean; program: { name: string } }[]>>({});
  const [availability, setAvailability] = useState<Record<string, AvailSlot[]>>({});
  const [dbPrograms, setDbPrograms] = useState<{ id: string; name: string; slug: string; description?: string }[]>([]);
  const [contactMessages, setContactMessages] = useState<{ id: string; naam: string; email: string; bericht: string; created_at: string }[]>([]);
  const [loadingMessages, setLoadingMessages] = useState(false);
  const [myProfileLoaded, setMyProfileLoaded] = useState(false);

  // Load everything as soon as we have a token
  useEffect(() => {
    if (!token || !session?.user?.id) return;
    const authUserId = session.user.id;
    const authEmail = session.user.email?.toLowerCase();

    setLoadingOverview(true);
    apiFetch(`/dashboard/overview`, {}, token)
      .then(r => r.json())
      .then(d => { setOverview(d); setLoadingOverview(false); })
      .catch(() => setLoadingOverview(false));

    // Load all profiles, then identify own profile by matching session auth UUID
    setLoadingProfiles(true);
    apiFetch(`/profiles`, {}, token)
      .then(r => r.json())
      .then((d: Profile[]) => {
        if (Array.isArray(d)) {
          setProfiles(d);
          const own = d.find(p => p.auth_user_id === authUserId)
            ?? d.find(p => p.email?.toLowerCase() === authEmail)
            ?? null;
          setMyProfile(own);
        }
        setLoadingProfiles(false);
        setMyProfileLoaded(true);
      })
      .catch(() => { setLoadingProfiles(false); setMyProfileLoaded(true); });

    apiFetch(`/studios`, {}, token).then(r => r.json()).then(d => Array.isArray(d) && setDbStudios(d)).catch(() => {});
    apiFetch(`/booking-types`, {}, token).then(r => r.json()).then(d => Array.isArray(d) && setDbBookingTypes(d)).catch(() => {});
    apiFetch(`/programs`, {}, token).then(r => r.json()).then(d => Array.isArray(d) && setDbPrograms(d)).catch(() => {});
    apiFetch(`/services`, {}, token).then(r => r.json()).then(d => Array.isArray(d) && setDbServices(d)).catch(() => {});
  }, [token, session?.user?.id]);

  // Load bookings when on boekingen/agenda tab
  useEffect(() => {
    if (!token || !["boekingen", "agenda", "artiesten", "studios"].includes(activeModule)) return;
    if (bookings.length > 0) return;
    setLoadingBookings(true);
    apiFetch(`/bookings`, {}, token)
      .then(r => r.json())
      .then(d => { if (Array.isArray(d)) setBookings(d); setLoadingBookings(false); })
      .catch(() => setLoadingBookings(false));
  }, [activeModule, token]);

  // Load wallets when on profiel or wallet tab
  useEffect(() => {
    if (!token || !["profiel", "wallet"].includes(activeModule)) return;
    const ownProfile = devMode ? DEV_PROFILE : myProfile;
    const targets = isAdmin ? profiles : (ownProfile ? [ownProfile] : []);
    targets.forEach(p => {
      if (wallets[p.id] || p.id === "dev-preview") return;
      apiFetch(`/wallet/${p.id}`, {}, token)
        .then(r => r.json())
        .then(d => Array.isArray(d) && setWallets(prev => ({ ...prev, [p.id]: d })))
        .catch(() => {});
    });
  }, [activeModule, profiles, myProfile?.id, isAdmin, token, devMode]);

  // Load contact messages when on berichten tab (admin only)
  useEffect(() => {
    if (!token || activeModule !== "berichten" || !isAdmin) return;
    if (contactMessages.length) return;
    setLoadingMessages(true);
    supabase
      .from("contact_submissions")
      .select("*")
      .order("created_at", { ascending: false })
      .then(({ data }) => { if (data) setContactMessages(data); setLoadingMessages(false); })
      .catch(() => setLoadingMessages(false));
  }, [activeModule, token, isAdmin]);

  // Load availability when on beschikbaarheid tab
  useEffect(() => {
    if (!token || activeModule !== "beschikbaarheid") return;
    const ownProfile = devMode ? DEV_PROFILE : myProfile;
    const targets = isAdmin ? profiles : (ownProfile ? [ownProfile] : []);
    targets.forEach(p => {
      if (availability[p.id] !== undefined || p.id === "dev-preview") return;
      apiFetch(`/availability/${p.id}`, {}, token)
        .then(r => r.json())
        .then(d => {
          const slots: AvailSlot[] = Array.isArray(d) ? d : (Array.isArray(d?.slots) ? d.slots : []);
          setAvailability(prev => ({ ...prev, [p.id]: slots }));
        })
        .catch(() => setAvailability(prev => ({ ...prev, [p.id]: [] })));
    });
  }, [activeModule, profiles, myProfile?.id, isAdmin, token, devMode]);

  // In dev mode, skip auth and use a mock admin profile
  const effectiveMyProfile = devMode ? DEV_PROFILE : myProfile;
  const effectiveMyProfileLoaded = devMode ? true : myProfileLoaded;

  if (!devMode && (authLoading || !effectiveMyProfileLoaded)) {
    return (
      <div className="flex h-screen items-center justify-center" style={{ background: "#0A0A0A" }}>
        <div className="text-center space-y-3">
          <div className="w-8 h-8 rounded-full mx-auto animate-pulse" style={{ background: "rgba(201,168,76,0.15)" }} />
          <p className="text-[10px] tracking-[0.4em] uppercase" style={{ color: "rgba(201,168,76,0.4)" }}>Laden…</p>
        </div>
      </div>
    );
  }

  // Profile not linked to auth account yet — show actionable error
  if (!devMode && !effectiveMyProfile) {
    return (
      <div className="flex h-screen items-center justify-center" style={{ background: "#0A0A0A" }}>
        <div className="text-center space-y-4 max-w-sm px-8">
          <div className="w-12 h-12 rounded-full mx-auto flex items-center justify-center"
            style={{ background: "rgba(239,68,68,0.1)", border: "1px solid rgba(239,68,68,0.2)" }}>
            <Lock size={18} style={{ color: "#EF4444" }} />
          </div>
          <p className="font-display text-lg" style={{ color: "rgba(240,237,230,0.8)" }}>Profiel niet gekoppeld</p>
          <p className="text-[11px] leading-relaxed" style={{ color: "rgba(240,237,230,0.4)" }}>
            Jouw account is nog niet gekoppeld aan een profiel in het systeem. Neem contact op met Clyde om je account te activeren.
          </p>
          <p className="text-[10px] tracking-[0.2em]" style={{ color: "rgba(201,168,76,0.5)" }}>
            {session?.user?.email}
          </p>
          <button onClick={() => { signOut(); }}
            className="text-[10px] tracking-[0.3em] uppercase px-4 py-2 border transition-colors"
            style={{ borderColor: "rgba(240,237,230,0.15)", color: "rgba(240,237,230,0.4)" }}>
            Uitloggen
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="flex h-screen overflow-hidden" style={{ background: "#0A0A0A", fontFamily: "'Outfit', sans-serif" }}>
      {/* Sidebar */}
      <aside className="flex flex-col shrink-0 transition-all duration-300"
        style={{ width: sidebarOpen ? 220 : 64, borderRight: `1px solid ${DB_BORDER}`, background: DB_SURFACE }}>
        <div className="flex items-center gap-3 px-4 h-16 shrink-0" style={{ borderBottom: `1px solid ${DB_BORDER}` }}>
          <img src={dvLogo} alt="DV" className="w-7 h-7 rounded-full object-cover shrink-0" style={{ opacity: 0.85 }} />
          {sidebarOpen && <span className="font-display text-[10px] tracking-[0.35em] text-white whitespace-nowrap">DÉJÀ VU OS</span>}
        </div>
        <nav className="flex flex-col gap-0.5 p-2 flex-1 overflow-y-auto">
          {DASH_MODULES.filter(m => {
            if (isAdmin) return true;
            return ["dashboard", "boekingen", "agenda", "wallet", "beschikbaarheid", "profiel"].includes(m.id);
          }).map(({ id, label, icon: Icon }) => {
            const active = activeModule === id;
            return (
              <button key={id} onClick={() => setModule(id)}
                className="flex items-center gap-3 px-3 py-2.5 rounded transition-all duration-200 text-left"
                style={{ background: active ? "rgba(201,168,76,0.1)" : "transparent", color: active ? DB_GOLD : "rgba(240,237,230,0.4)", borderLeft: active ? `2px solid ${DB_GOLD}` : "2px solid transparent" }}
                onMouseEnter={(e) => { if (!active) e.currentTarget.style.color = "rgba(240,237,230,0.75)"; }}
                onMouseLeave={(e) => { if (!active) e.currentTarget.style.color = "rgba(240,237,230,0.4)"; }}
              >
                <Icon size={15} strokeWidth={1.4} className="shrink-0" />
                {sidebarOpen && <span className="text-[11px] tracking-[0.04em] whitespace-nowrap">{label}</span>}
              </button>
            );
          })}
        </nav>
        <div className="p-2 space-y-0.5 shrink-0" style={{ borderTop: `1px solid ${DB_BORDER}` }}>
          <button onClick={() => navigate("/")}
            className="flex items-center gap-3 px-3 py-2.5 rounded w-full transition-all duration-200"
            style={{ color: "rgba(240,237,230,0.3)" }}
            onMouseEnter={(e) => { e.currentTarget.style.color = "rgba(240,237,230,0.6)"; }}
            onMouseLeave={(e) => { e.currentTarget.style.color = "rgba(240,237,230,0.3)"; }}>
            <ChevronLeft size={14} strokeWidth={1.4} className="shrink-0" />
            {sidebarOpen && <span className="text-[10px] tracking-[0.04em]">Publieke website</span>}
          </button>
          <button onClick={() => { signOut(); navigate("/"); }}
            className="flex items-center gap-3 px-3 py-2.5 rounded w-full transition-all duration-200"
            style={{ color: "rgba(240,237,230,0.25)" }}
            onMouseEnter={(e) => { e.currentTarget.style.color = "#EF4444"; }}
            onMouseLeave={(e) => { e.currentTarget.style.color = "rgba(240,237,230,0.25)"; }}>
            <Lock size={13} strokeWidth={1.4} className="shrink-0" />
            {sidebarOpen && <span className="text-[10px] tracking-[0.04em]">Uitloggen</span>}
          </button>
        </div>
      </aside>

      {/* Main */}
      <div className="flex flex-col flex-1 min-w-0 overflow-hidden">
        <div className="flex items-center justify-between px-6 h-16 shrink-0" style={{ borderBottom: `1px solid ${DB_BORDER}` }}>
          <div className="flex items-center gap-4">
            <button onClick={() => setSidebarOpen(!sidebarOpen)} className="p-1.5 rounded transition-colors"
              style={{ color: "rgba(240,237,230,0.4)" }}
              onMouseEnter={(e) => { e.currentTarget.style.color = DB_GOLD; }}
              onMouseLeave={(e) => { e.currentTarget.style.color = "rgba(240,237,230,0.4)"; }}>
              <Layers size={16} strokeWidth={1.4} />
            </button>
            <h1 className="text-[13px] tracking-[0.08em]" style={{ color: "rgba(240,237,230,0.85)" }}>
              {DASH_MODULES.find(m => m.id === activeModule)?.label ?? "Dashboard"}
            </h1>
          </div>
          <div className="flex items-center gap-3">
            {effectiveMyProfile && (
              <div className="flex items-center gap-2">
                <div className="w-6 h-6 rounded-full flex items-center justify-center text-[9px] font-display"
                  style={{ background: "rgba(201,168,76,0.15)", color: DB_GOLD }}>
                  {effectiveMyProfile.display_name.slice(0, 2).toUpperCase()}
                </div>
                <span className="text-[11px] hidden sm:block" style={{ color: "rgba(240,237,230,0.5)" }}>{effectiveMyProfile.display_name}</span>
              </div>
            )}
            {devMode && (
              <span className="text-[9px] tracking-[0.2em] uppercase px-2 py-1 rounded" style={{ background: "rgba(239,68,68,0.1)", color: "#EF4444", border: "1px solid rgba(239,68,68,0.2)" }}>DEV</span>
            )}
            <div className="h-7 px-3 flex items-center rounded text-[9px] tracking-[0.3em] uppercase"
              style={{ background: "rgba(201,168,76,0.08)", color: DB_GOLD, border: `1px solid rgba(201,168,76,0.2)` }}>
              {isAdmin ? "Admin" : (effectiveMyProfile?.user_roles?.[0]?.role.name ?? "Artiest")}
            </div>
          </div>
        </div>
        <div className="flex-1 overflow-y-auto p-6 md:p-8">
          {activeModule === "dashboard"       && <DashOverview data={overview} loading={loadingOverview} profiles={profiles} loadingProfiles={loadingProfiles} studios={dbStudios} programs={dbPrograms} isAdmin={isAdmin} myProfile={effectiveMyProfile} />}
          {activeModule === "boekingen"       && <DashBoekingen bookings={bookings} loading={loadingBookings} profiles={profiles} studios={dbStudios} services={dbServices} onBookingAdded={b => setBookings(prev => [b, ...prev])} isAdmin={isAdmin} myProfile={effectiveMyProfile} token={token} />}
          {activeModule === "agenda"          && <DashAgenda bookings={bookings} loading={loadingBookings} profiles={profiles} isAdmin={isAdmin} myProfile={effectiveMyProfile} />}
          {activeModule === "artiesten"       && <DashArtiesten profiles={profiles} loading={loadingProfiles} bookings={bookings} />}
          {activeModule === "medewerkers"     && <DashMedewerkers profiles={profiles} loading={loadingProfiles} />}
          {activeModule === "studios"         && <DashStudios studios={dbStudios} bookings={bookings} />}
          {activeModule === "programmas"      && <DashProgrammas programs={dbPrograms} profiles={profiles} wallets={wallets} />}
          {activeModule === "wallet"          && <DashWallet profiles={profiles} loading={loadingProfiles} wallets={wallets} isAdmin={isAdmin} myProfile={effectiveMyProfile} />}
          {activeModule === "beschikbaarheid" && <DashBeschikbaarheid profiles={profiles} loading={loadingProfiles} availability={availability} isAdmin={isAdmin} myProfile={effectiveMyProfile} token={token} onSlotsChanged={(pid, slots) => setAvailability(prev => ({ ...prev, [pid]: slots }))} />}
          {activeModule === "berichten"       && isAdmin && <DashBerichten messages={contactMessages} loading={loadingMessages} />}
          {activeModule === "profiel"         && <DashProfiel profiles={profiles} loading={loadingProfiles} selected={selectedProfile} onSelect={setSelectedProfile} wallets={wallets} isAdmin={isAdmin} myProfile={effectiveMyProfile} />}
        </div>
      </div>
    </div>
  );
}

function DashOverview({ data, loading, profiles, loadingProfiles, studios, programs, isAdmin, myProfile }: {
  data: any; loading: boolean; profiles: Profile[]; loadingProfiles: boolean;
  studios: StudioDB[];
  programs: { id: string; name: string }[];
  isAdmin: boolean; myProfile: Profile | null;
}) {
  const activeStudios = studios.filter(s => s.is_active);
  const bookableStudios = studios.filter(s => s.is_bookable && s.is_active);
  const myRoles = myProfile?.user_roles?.map(r => r.role.name) ?? [];
  const myPrograms = myProfile?.user_programs?.map(p => p.program.name) ?? [];

  const todayStr = new Date().toISOString().split("T")[0];
  const todayBookings = (data?.recentBookings ?? []).filter((b: Booking) => b.date === todayStr);

  const adminStats = [
    { label: "Gebruikers",   value: profiles.length || (data?.totalProfiles ?? "—"), sub: "actieve profielen" },
    { label: "Boekingen",    value: data?.totalBookings ?? 0,                         sub: "totaal" },
    { label: "Studio's",     value: loading ? "—" : activeStudios.length,             sub: `${bookableStudios.length} boekbaar` },
    { label: "Programma's",  value: loading ? "—" : programs.length,                  sub: programs.length > 0 ? "actief" : "—" },
  ];
  const artistStats = [
    { label: "Rollen",       value: myRoles.length || "—",         sub: myRoles[0] ?? "artiest" },
    { label: "Programma's",  value: myPrograms.length || "—",      sub: myPrograms[0] ?? "geen" },
    { label: "Boekbaar",     value: loading ? "—" : bookableStudios.length, sub: "studio's beschikbaar" },
  ];
  const stats = isAdmin ? adminStats : artistStats;

  return (
    <div className="space-y-8 max-w-5xl">
      <div>
        <p className="text-[10px] tracking-[0.4em] uppercase mb-1" style={{ color: DB_GOLD }}>Overzicht</p>
        <h2 className="font-display font-normal" style={{ fontSize: "clamp(22px,3vw,32px)", color: "rgba(240,237,230,0.9)" }}>
          {isAdmin ? "Déjà Vu OS" : `Welkom, ${myProfile?.display_name ?? "—"}`}
        </h2>
      </div>

      {/* KPI grid */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {stats.map(s => (
          <div key={s.label} className="p-5 rounded" style={{ background: DB_SURFACE, border: `1px solid ${DB_BORDER}` }}>
            <p className="text-[10px] tracking-[0.3em] uppercase mb-3" style={{ color: "rgba(240,237,230,0.35)" }}>{s.label}</p>
            <p className="font-display font-normal text-3xl mb-1" style={{ color: loading ? "rgba(201,168,76,0.4)" : DB_GOLD }}>{s.value}</p>
            <p className="text-[10px]" style={{ color: "rgba(240,237,230,0.3)" }}>{s.sub}</p>
          </div>
        ))}
      </div>

      {isAdmin && (
        <>
          {/* Vandaag */}
          <div>
            <p className="text-[10px] tracking-[0.35em] uppercase mb-4" style={{ color: "rgba(240,237,230,0.35)" }}>Vandaag</p>
            {loading ? (
              <p className="text-[11px]" style={{ color: "rgba(240,237,230,0.25)" }}>Laden…</p>
            ) : !todayBookings.length ? (
              <div className="p-5 rounded text-[11px] text-center" style={{ border: "1px dashed rgba(201,168,76,0.12)", color: "rgba(240,237,230,0.25)" }}>
                Geen sessies ingepland voor vandaag.
              </div>
            ) : (
              <div className="space-y-2">
                {todayBookings.sort((a: Booking, b: Booking) => (a.start_time ?? "").localeCompare(b.start_time ?? "")).map((b: Booking) => (
                  <div key={b.id} className="flex items-center gap-4 px-4 py-3 rounded" style={{ background: DB_SURFACE, border: `1px solid ${DB_BORDER}` }}>
                    <div className="w-1.5 h-8 rounded-full shrink-0" style={{ background: b.status?.color ?? DB_GOLD }} />
                    <div className="shrink-0 w-14">
                      <p className="text-[12px] font-medium" style={{ color: DB_GOLD }}>{b.start_time?.slice(0,5)}</p>
                      <p className="text-[10px]" style={{ color: "rgba(240,237,230,0.3)" }}>{b.end_time?.slice(0,5)}</p>
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-[12px] truncate" style={{ color: "rgba(240,237,230,0.85)" }}>{b.artist?.display_name ?? "—"}</p>
                      <p className="text-[10px] truncate" style={{ color: "rgba(240,237,230,0.4)" }}>{b.booking_type?.name} · {b.studio?.name}</p>
                    </div>
                    {b.status && (
                      <span className="text-[9px] tracking-[0.2em] uppercase px-2 py-0.5 rounded-full shrink-0"
                        style={{ background: `${b.status.color}18`, color: b.status.color, border: `1px solid ${b.status.color}30` }}>
                        {b.status.name}
                      </span>
                    )}
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Recente boekingen */}
          <div>
            <p className="text-[10px] tracking-[0.35em] uppercase mb-4" style={{ color: "rgba(240,237,230,0.35)" }}>Recente boekingen</p>
            {!data?.recentBookings?.length ? (
              <div className="p-6 rounded text-center text-[11px]" style={{ border: "1px dashed rgba(201,168,76,0.15)", color: "rgba(240,237,230,0.3)" }}>
                Nog geen boekingen — voeg de eerste boeking toe via Boekingen.
              </div>
            ) : <BookingTable bookings={data.recentBookings} />}
          </div>

          {/* Team */}
          <div>
            <p className="text-[10px] tracking-[0.35em] uppercase mb-4" style={{ color: "rgba(240,237,230,0.35)" }}>Team</p>
            {loadingProfiles ? (
              <p className="text-[11px]" style={{ color: "rgba(240,237,230,0.25)" }}>Laden…</p>
            ) : !profiles.length ? (
              <p className="text-[11px]" style={{ color: "rgba(240,237,230,0.2)" }}>Voer de SQL-migratie uit in Supabase om teamleden te laden.</p>
            ) : (
              <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-3">
                {profiles.map(p => <ProfileCard key={p.id} profile={p} />)}
              </div>
            )}
          </div>
        </>
      )}

      {!isAdmin && myProfile && (
        <div className="p-6 rounded space-y-3" style={{ background: DB_SURFACE, border: `1px solid ${DB_BORDER}` }}>
          <p className="text-[10px] tracking-[0.3em] uppercase mb-4" style={{ color: DB_GOLD }}>Mijn profiel</p>
          <div className="flex items-center gap-4">
            <div className="w-12 h-12 rounded-full flex items-center justify-center font-display text-lg"
              style={{ background: "rgba(201,168,76,0.12)", color: DB_GOLD }}>
              {myProfile.display_name.slice(0, 2).toUpperCase()}
            </div>
            <div>
              <p className="text-[15px]" style={{ color: "rgba(240,237,230,0.9)" }}>{myProfile.display_name}</p>
              <div className="flex flex-wrap gap-1 mt-1">
                {myProfile.user_roles?.map(r => (
                  <span key={r.role.slug} className="text-[9px] tracking-[0.2em] uppercase px-2 py-0.5 rounded-full"
                    style={{ background: "rgba(201,168,76,0.08)", color: DB_GOLD }}>{r.role.name}</span>
                ))}
              </div>
            </div>
          </div>
          {myPrograms.length > 0 && (
            <div className="pt-3" style={{ borderTop: `1px solid ${DB_BORDER}` }}>
              <p className="text-[9px] tracking-[0.25em] uppercase mb-2" style={{ color: "rgba(240,237,230,0.25)" }}>Programma's</p>
              <div className="flex flex-wrap gap-2">
                {myPrograms.map(name => (
                  <span key={name} className="text-[10px] tracking-[0.2em] uppercase px-3 py-1.5 rounded"
                    style={{ background: "rgba(201,168,76,0.06)", color: "rgba(240,237,230,0.5)", border: "1px solid rgba(201,168,76,0.12)" }}>
                    {name}
                  </span>
                ))}
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
}

function BookingWizard({ profiles, studios, services, onBookingAdded, isAdmin, myProfile, token, bookings }: {
  profiles: Profile[]; studios: StudioDB[]; services: Service[];
  onBookingAdded: (b: Booking) => void;
  isAdmin: boolean; myProfile: Profile | null; token?: string; bookings: Booking[];
}) {
  const STEP_LABELS = ["Service", "Artiest", "Studio", "Datum", "Tijd", "Begeleiding", "Bevestigen"];
  const visibleSteps = isAdmin ? [0,1,2,3,4,5,6] : [0,2,3,4,5,6];

  const [step, setStep] = useState(0);
  const [selService, setSelService] = useState<Service | null>(null);
  const [selArtist, setSelArtist] = useState<Profile | null>(null);
  const [selStudio, setSelStudio] = useState<StudioDB | null>(null);
  const [selDate, setSelDate] = useState("");
  const [selSlot, setSelSlot] = useState("");
  const [selDuration, setSelDuration] = useState(4);
  const [selResources, setSelResources] = useState<Profile[]>([]);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);
  const [calMonth, setCalMonth] = useState(() => { const n = new Date(); return { year: n.getFullYear(), month: n.getMonth() }; });

  const artists = profiles.filter(p => p.user_roles?.some(r => r.role.slug === "artist"));
  const bookableStudios = studios.filter(s => s.is_bookable && s.is_active);
  const allResourceRoles = selService?.options ?? [];
  const today = new Date().toISOString().split("T")[0];

  const virtualStep = visibleSteps.indexOf(step);
  const goNext = () => { const i = visibleSteps.indexOf(step); if (i < visibleSteps.length - 1) setStep(visibleSteps[i + 1]); };
  const goPrev = () => { const i = visibleSteps.indexOf(step); if (i > 0) setStep(visibleSteps[i - 1]); };

  const generateSlots = (opens: string, closes: string, dur: number): string[] => {
    const slots: string[] = [];
    const toMins = (t: string) => { const [h, m] = t.split(":").map(Number); return h * 60 + m; };
    const startM = toMins(opens.slice(0, 5));
    const closeM = toMins(closes.slice(0, 5));
    const overnight = closeM < startM;
    const dayEnd = overnight ? 24 * 60 + closeM : closeM;
    for (let c = startM; c + dur * 60 <= dayEnd; c += 30) {
      const h = String(Math.floor(c / 60) % 24).padStart(2, "0");
      const m = String(c % 60).padStart(2, "0");
      slots.push(`${h}:${m}`);
    }
    return slots;
  };

  const availableSlots = (selStudio && selDate) ? (() => {
    const dayBookings = bookings.filter(b => b.date === selDate && (b.studio?.id === selStudio.id || b.studio?.name === selStudio.name) && b.status?.slug !== "cancelled");
    const toMins = (t: string) => { const [h, m] = t.slice(0,5).split(":").map(Number); return h * 60 + m; };
    return generateSlots(selStudio.opens_at ?? "10:00", selStudio.closes_at ?? "22:00", selDuration).filter(slot => {
      const sM = toMins(slot);
      const eM = sM + selDuration * 60;
      const eTime = `${String(Math.floor(eM / 60) % 24).padStart(2, "0")}:${String(eM % 60).padStart(2, "0")}`;
      return !dayBookings.some(b => slot < (b.end_time?.slice(0,5) ?? "00:00") && eTime > (b.start_time?.slice(0,5) ?? "00:00"));
    });
  })() : [];

  const calDays = (() => {
    const { year, month } = calMonth;
    const firstDow = (new Date(year, month, 1).getDay() + 6) % 7;
    const daysInMonth = new Date(year, month + 1, 0).getDate();
    return [...Array(firstDow).fill(null), ...Array.from({ length: daysInMonth }, (_, i) => new Date(year, month, i + 1).toISOString().split("T")[0])];
  })();

  const endTimeStr = (slot: string, dur: number) => {
    const [h, m] = slot.split(":").map(Number);
    const e = h * 60 + m + dur * 60;
    return `${String(Math.floor(e / 60) % 24).padStart(2, "0")}:${String(e % 60).padStart(2, "0")}`;
  };

  const handleSubmit = async () => {
    const artistId = isAdmin ? selArtist?.id : myProfile?.id;
    if (!selService || !selStudio || !selDate || !selSlot || !artistId) return;
    const endT = endTimeStr(selSlot, selDuration);
    const engineerProfile = selResources.find(r => r.user_roles?.some(rr => rr.role.slug === "engineer"));
    const beatmakerProfile = selResources.find(r => r.user_roles?.some(rr => ["beat-creator", "beatmaker"].includes(rr.role.slug)));
    setSaving(true); setError(null);
    try {
      const res = await apiFetch("/bookings", { method: "POST", body: JSON.stringify({
        artist_id: artistId, studio_id: selStudio.id, service_id: selService.id,
        engineer_id: engineerProfile?.id ?? null,
        beatmaker_id: beatmakerProfile?.id ?? null,
        date: selDate, start_time: selSlot + ":00", end_time: endT + ":00",
        duration_hours: selDuration, notes: null,
      }) }, token);
      const d = await res.json();
      if (!res.ok) { setError(d.error ?? "Er is een fout opgetreden."); }
      else {
        onBookingAdded({ id: d.id, date: selDate, start_time: selSlot + ":00", end_time: endT + ":00", duration_hours: selDuration, notes: null, artist_id: artistId, artist: { display_name: (isAdmin ? selArtist?.display_name : myProfile?.display_name) ?? "—" }, studio: { id: selStudio.id, name: selStudio.name }, booking_type: { name: selService.name }, status: { name: "Pending", color: DB_GOLD, slug: "pending" } });
        setSuccess(true);
      }
    } catch (_) { setError("Verbindingsfout. Probeer opnieuw."); }
    setSaving(false);
  };

  const resetWizard = () => { setSuccess(false); setStep(0); setSelService(null); setSelArtist(null); setSelStudio(null); setSelDate(""); setSelSlot(""); setSelResources([]); setError(null); };

  if (success) return (
    <div className="p-8 rounded text-center space-y-4" style={{ background: "rgba(74,222,128,0.05)", border: "1px solid rgba(74,222,128,0.2)" }}>
      <div className="w-11 h-11 rounded-full mx-auto flex items-center justify-center" style={{ background: "rgba(74,222,128,0.12)" }}>
        <span style={{ color: "#4ADE80", fontSize: 20 }}>✓</span>
      </div>
      <p className="font-display text-xl" style={{ color: "#4ADE80" }}>Sessie bevestigd</p>
      <p className="text-[11px]" style={{ color: "rgba(240,237,230,0.5)" }}>{selService?.name} · {selStudio?.name} · {new Date(selDate + "T12:00").toLocaleDateString("nl-NL", { weekday: "long", day: "numeric", month: "long" })} · {selSlot}</p>
      <button onClick={resetWizard} className="text-[10px] tracking-[0.3em] uppercase px-4 py-2 border" style={{ borderColor: "rgba(74,222,128,0.3)", color: "#4ADE80" }}>Nieuwe boeking</button>
    </div>
  );

  return (
    <div className="space-y-6">
      {/* Progress bar */}
      <div className="flex items-center gap-0.5 overflow-x-auto pb-1">
        {visibleSteps.map((s, i) => (
          <div key={s} className="flex items-center gap-0.5 shrink-0">
            <button onClick={() => { if (i < virtualStep) setStep(s); }}
              className="flex items-center gap-1.5 px-2.5 py-1.5 rounded"
              style={{ background: s === step ? "rgba(201,168,76,0.1)" : "transparent", cursor: i < virtualStep ? "pointer" : "default" }}>
              <span className="text-[9px] tracking-[0.3em] font-medium" style={{ color: s === step ? DB_GOLD : i < virtualStep ? "rgba(201,168,76,0.45)" : "rgba(240,237,230,0.18)" }}>
                {String(i + 1).padStart(2, "0")}
              </span>
              <span className="text-[10px] tracking-[0.12em] uppercase" style={{ color: s === step ? DB_GOLD : i < virtualStep ? "rgba(240,237,230,0.45)" : "rgba(240,237,230,0.18)" }}>
                {STEP_LABELS[s]}
              </span>
            </button>
            {i < visibleSteps.length - 1 && <div className="w-3 h-px shrink-0" style={{ background: i < virtualStep ? "rgba(201,168,76,0.35)" : "rgba(240,237,230,0.08)" }} />}
          </div>
        ))}
      </div>

      {/* Step 0: Service */}
      {step === 0 && (
        <div className="space-y-3">
          <p className="text-[10px] tracking-[0.3em] uppercase" style={{ color: "rgba(240,237,230,0.35)" }}>Kies een service</p>
          {!services.length ? (
            <p className="text-[11px]" style={{ color: "rgba(240,237,230,0.25)" }}>Geen services in database — voer de migratie uit en deploy de edge function.</p>
          ) : (
            <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-3">
              {services.map(s => (
                <button key={s.id} onClick={() => { setSelService(s); goNext(); }}
                  className="p-5 rounded text-left transition-all"
                  style={{ background: selService?.id === s.id ? "rgba(201,168,76,0.1)" : "rgba(0,0,0,0.4)", border: `1px solid ${selService?.id === s.id ? DB_GOLD : DB_BORDER}` }}>
                  <p className="text-[13px] mb-1.5" style={{ color: "rgba(240,237,230,0.9)" }}>{s.name}</p>
                  {s.description && <p className="text-[11px] leading-relaxed mb-3" style={{ color: "rgba(240,237,230,0.4)" }}>{s.description}</p>}
                  {!!s.options?.length && (
                    <div className="flex flex-wrap gap-1 mt-2">
                      {s.options.map((o, oi) => (
                        <span key={oi} className="text-[9px] tracking-[0.15em] uppercase px-2 py-0.5 rounded-full"
                          style={{ background: o.is_required ? "rgba(201,168,76,0.1)" : "rgba(240,237,230,0.04)", color: o.is_required ? DB_GOLD : "rgba(240,237,230,0.3)", border: `1px solid ${o.is_required ? "rgba(201,168,76,0.2)" : "rgba(240,237,230,0.07)"}` }}>
                          {o.label ?? o.role.name}
                        </span>
                      ))}
                    </div>
                  )}
                </button>
              ))}
            </div>
          )}
        </div>
      )}

      {/* Step 1: Artist (admin only) */}
      {step === 1 && isAdmin && (
        <div className="space-y-3">
          <p className="text-[10px] tracking-[0.3em] uppercase" style={{ color: "rgba(240,237,230,0.35)" }}>Kies een artiest</p>
          {!artists.length ? (
            <p className="text-[11px]" style={{ color: "rgba(240,237,230,0.25)" }}>Geen artiesten gevonden.</p>
          ) : (
            <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-3">
              {artists.map(p => (
                <button key={p.id} onClick={() => { setSelArtist(p); goNext(); }}
                  className="p-4 rounded text-left transition-all"
                  style={{ background: selArtist?.id === p.id ? "rgba(201,168,76,0.1)" : "rgba(0,0,0,0.4)", border: `1px solid ${selArtist?.id === p.id ? DB_GOLD : DB_BORDER}` }}>
                  <div className="flex items-center gap-3">
                    <div className="w-9 h-9 rounded-full flex items-center justify-center text-[11px] font-medium shrink-0"
                      style={{ background: "rgba(201,168,76,0.12)", color: DB_GOLD }}>
                      {p.display_name.slice(0, 2).toUpperCase()}
                    </div>
                    <div>
                      <p className="text-[13px]" style={{ color: "rgba(240,237,230,0.9)" }}>{p.display_name}</p>
                      {p.full_name && p.full_name !== p.display_name && <p className="text-[10px]" style={{ color: "rgba(240,237,230,0.4)" }}>{p.full_name}</p>}
                    </div>
                  </div>
                  {!!p.user_programs?.length && (
                    <p className="text-[9px] tracking-[0.2em] uppercase mt-2" style={{ color: "rgba(240,237,230,0.3)" }}>{p.user_programs[0].program.name}</p>
                  )}
                </button>
              ))}
            </div>
          )}
        </div>
      )}

      {/* Step 2: Studio */}
      {step === 2 && (
        <div className="space-y-3">
          <p className="text-[10px] tracking-[0.3em] uppercase" style={{ color: "rgba(240,237,230,0.35)" }}>Kies een studio</p>
          {!bookableStudios.length ? (
            <p className="text-[11px]" style={{ color: "rgba(240,237,230,0.25)" }}>Geen boekbare studio's beschikbaar.</p>
          ) : (
            <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-3">
              {bookableStudios.map(s => (
                <button key={s.id} onClick={() => { setSelStudio(s); setSelSlot(""); goNext(); }}
                  className="p-5 rounded text-left transition-all"
                  style={{ background: selStudio?.id === s.id ? "rgba(201,168,76,0.1)" : "rgba(0,0,0,0.4)", border: `1px solid ${selStudio?.id === s.id ? DB_GOLD : DB_BORDER}` }}>
                  <p className="text-[13px] mb-2" style={{ color: "rgba(240,237,230,0.9)" }}>{s.name}</p>
                  {s.description && <p className="text-[11px] leading-relaxed mb-3" style={{ color: "rgba(240,237,230,0.4)" }}>{s.description}</p>}
                  <div className="flex flex-wrap gap-1.5 mb-2">
                    <span className="text-[9px] tracking-[0.15em] uppercase px-2 py-0.5 rounded-full" style={{ background: "rgba(74,222,128,0.1)", color: "#4ADE80", border: "1px solid rgba(74,222,128,0.2)" }}>Actief</span>
                    <span className="text-[9px] tracking-[0.15em] uppercase px-2 py-0.5 rounded-full" style={{ background: "rgba(201,168,76,0.1)", color: DB_GOLD, border: "1px solid rgba(201,168,76,0.2)" }}>Boekbaar</span>
                  </div>
                  {s.opens_at && s.closes_at && <p className="text-[10px]" style={{ color: "rgba(240,237,230,0.3)" }}>{s.opens_at.slice(0,5)} – {s.closes_at.slice(0,5)}</p>}
                </button>
              ))}
            </div>
          )}
        </div>
      )}

      {/* Step 3: Date */}
      {step === 3 && (
        <div className="space-y-4">
          <p className="text-[10px] tracking-[0.3em] uppercase" style={{ color: "rgba(240,237,230,0.35)" }}>Kies een datum</p>
          <div className="inline-block p-5 rounded" style={{ background: "rgba(0,0,0,0.4)", border: `1px solid ${DB_BORDER}` }}>
            <div className="flex items-center justify-between mb-4 gap-8">
              <button onClick={() => setCalMonth(m => { const p = new Date(m.year, m.month - 1); return { year: p.getFullYear(), month: p.getMonth() }; })}
                className="p-1 transition-colors" style={{ color: "rgba(240,237,230,0.35)" }}
                onMouseEnter={e => (e.currentTarget.style.color = DB_GOLD)} onMouseLeave={e => (e.currentTarget.style.color = "rgba(240,237,230,0.35)")}>
                <ChevronLeft size={14} />
              </button>
              <p className="text-[11px] tracking-[0.2em] uppercase" style={{ color: "rgba(240,237,230,0.7)" }}>
                {new Date(calMonth.year, calMonth.month).toLocaleDateString("nl-NL", { month: "long", year: "numeric" })}
              </p>
              <button onClick={() => setCalMonth(m => { const n = new Date(m.year, m.month + 1); return { year: n.getFullYear(), month: n.getMonth() }; })}
                className="p-1 transition-colors" style={{ color: "rgba(240,237,230,0.35)" }}
                onMouseEnter={e => (e.currentTarget.style.color = DB_GOLD)} onMouseLeave={e => (e.currentTarget.style.color = "rgba(240,237,230,0.35)")}>
                <ChevronRight size={14} />
              </button>
            </div>
            <div className="grid grid-cols-7 mb-2">
              {["Ma","Di","Wo","Do","Vr","Za","Zo"].map(d => (
                <p key={d} className="text-center text-[8px] tracking-[0.2em] uppercase py-1" style={{ color: "rgba(240,237,230,0.2)" }}>{d}</p>
              ))}
            </div>
            <div className="grid grid-cols-7 gap-0.5">
              {calDays.map((dateStr, i) => {
                if (!dateStr) return <div key={`b${i}`} />;
                const isPast = dateStr < today;
                const isSelected = dateStr === selDate;
                const isToday2 = dateStr === today;
                return (
                  <button key={dateStr} disabled={isPast}
                    onClick={() => { setSelDate(dateStr); setSelSlot(""); goNext(); }}
                    className="w-8 h-8 rounded flex items-center justify-center text-[11px] transition-all mx-auto"
                    style={{ background: isSelected ? DB_GOLD : isToday2 ? "rgba(201,168,76,0.12)" : "transparent", color: isSelected ? BLACK : isPast ? "rgba(240,237,230,0.12)" : isToday2 ? DB_GOLD : "rgba(240,237,230,0.7)", cursor: isPast ? "not-allowed" : "pointer" }}>
                    {new Date(dateStr + "T12:00:00").getDate()}
                  </button>
                );
              })}
            </div>
          </div>
        </div>
      )}

      {/* Step 4: Time slots */}
      {step === 4 && (
        <div className="space-y-4">
          <div className="flex items-center gap-4 flex-wrap">
            <p className="text-[10px] tracking-[0.3em] uppercase" style={{ color: "rgba(240,237,230,0.35)" }}>Kies een tijdslot</p>
            <div className="flex items-center gap-1.5">
              {[2, 4].map(dur => (
                <button key={dur} onClick={() => { setSelDuration(dur); setSelSlot(""); }}
                  className="text-[10px] tracking-[0.2em] uppercase px-3 py-1.5 rounded transition-all"
                  style={{ background: selDuration === dur ? "rgba(201,168,76,0.12)" : "transparent", color: selDuration === dur ? DB_GOLD : "rgba(240,237,230,0.4)", border: `1px solid ${selDuration === dur ? "rgba(201,168,76,0.3)" : "rgba(240,237,230,0.1)"}` }}>
                  {dur}u
                </button>
              ))}
            </div>
          </div>
          {!availableSlots.length ? (
            <p className="text-[11px]" style={{ color: "rgba(240,237,230,0.3)" }}>Geen beschikbare slots op {selDate} in {selStudio?.name}.</p>
          ) : (
            <div className="flex flex-wrap gap-2">
              {availableSlots.map(slot => (
                <button key={slot} onClick={() => { setSelSlot(slot); goNext(); }}
                  className="px-4 py-2.5 rounded transition-all text-[12px] font-medium"
                  style={{ background: selSlot === slot ? DB_GOLD : "rgba(0,0,0,0.4)", color: selSlot === slot ? BLACK : "rgba(240,237,230,0.8)", border: `1px solid ${selSlot === slot ? DB_GOLD : DB_BORDER}` }}>
                  {slot}
                </button>
              ))}
            </div>
          )}
        </div>
      )}

      {/* Step 5: Begeleiding — engineer and beatmaker are independent selections */}
      {step === 5 && (() => {
        const artistId = isAdmin ? selArtist?.id : myProfile?.id;
        const engineerOpts = allResourceRoles.filter(o => o.role.slug === "engineer");
        const beatmakerOpts = allResourceRoles.filter(o => ["beat-creator", "beatmaker"].includes(o.role.slug));
        const engineerProfiles = profiles.filter(p => p.user_roles?.some(r => r.role.slug === "engineer") && p.id !== artistId);
        const beatmakerProfiles = profiles.filter(p => p.user_roles?.some(r => ["beat-creator", "beatmaker"].includes(r.role.slug)) && p.id !== artistId);
        const selEngineer = selResources.find(r => r.user_roles?.some(rr => rr.role.slug === "engineer")) ?? null;
        const selBeatmaker = selResources.find(r => r.user_roles?.some(rr => ["beat-creator", "beatmaker"].includes(rr.role.slug))) ?? null;

        const toggleEngineer = (p: Profile) => setSelResources(prev => {
          const withoutEng = prev.filter(r => !r.user_roles?.some(rr => rr.role.slug === "engineer"));
          return selEngineer?.id === p.id ? withoutEng : [...withoutEng, p];
        });
        const clearEngineer = () => setSelResources(prev => prev.filter(r => !r.user_roles?.some(rr => rr.role.slug === "engineer")));
        const toggleBeatmaker = (p: Profile) => setSelResources(prev => {
          const withoutBm = prev.filter(r => !r.user_roles?.some(rr => ["beat-creator", "beatmaker"].includes(rr.role.slug)));
          return selBeatmaker?.id === p.id ? withoutBm : [...withoutBm, p];
        });
        const clearBeatmaker = () => setSelResources(prev => prev.filter(r => !r.user_roles?.some(rr => ["beat-creator", "beatmaker"].includes(rr.role.slug))));

        const hasAnyRole = engineerOpts.length > 0 || beatmakerOpts.length > 0 || engineerProfiles.length > 0 || beatmakerProfiles.length > 0;

        const RoleSection = ({ label, required, people, selected, onSelect, onClear }: {
          label: string; required: boolean; people: Profile[];
          selected: Profile | null; onSelect: (p: Profile) => void; onClear: () => void;
        }) => (
          <div className="space-y-2">
            <p className="text-[10px] tracking-[0.25em] uppercase" style={{ color: required ? DB_GOLD : "rgba(240,237,230,0.35)" }}>
              {label}{required && " *"}
            </p>
            <div className="flex flex-wrap gap-2">
              {!required && (
                <button onClick={onClear}
                  className="flex items-center gap-2 px-3 py-2 rounded transition-all"
                  style={{ background: !selected ? "rgba(201,168,76,0.1)" : "rgba(0,0,0,0.4)", border: `1px solid ${!selected ? DB_GOLD : DB_BORDER}` }}>
                  <span className="text-[11px]" style={{ color: !selected ? DB_GOLD : "rgba(240,237,230,0.5)" }}>Solo</span>
                </button>
              )}
              {!people.length ? (
                <p className="text-[10px] self-center" style={{ color: "rgba(240,237,230,0.25)" }}>Geen {label.toLowerCase()} beschikbaar.</p>
              ) : people.map(p => {
                const isSel = selected?.id === p.id;
                const roleLabel = p.user_roles?.find(r => r.role.slug === "engineer")?.role.name
                  ?? p.user_roles?.find(r => ["beat-creator", "beatmaker"].includes(r.role.slug))?.role.name
                  ?? label;
                return (
                  <button key={p.id} onClick={() => onSelect(p)}
                    className="flex items-center gap-2 px-3 py-2 rounded transition-all"
                    style={{ background: isSel ? "rgba(201,168,76,0.1)" : "rgba(0,0,0,0.4)", border: `1px solid ${isSel ? DB_GOLD : DB_BORDER}` }}>
                    <div className="w-7 h-7 rounded-full flex items-center justify-center text-[9px]" style={{ background: "rgba(201,168,76,0.1)", color: DB_GOLD }}>
                      {p.display_name.slice(0, 2).toUpperCase()}
                    </div>
                    <div className="text-left">
                      <p className="text-[12px]" style={{ color: "rgba(240,237,230,0.85)" }}>{p.display_name}</p>
                      <p className="text-[9px] tracking-[0.15em] uppercase" style={{ color: "rgba(240,237,230,0.3)" }}>{roleLabel}</p>
                    </div>
                  </button>
                );
              })}
            </div>
          </div>
        );

        return (
          <div className="space-y-6">
            <p className="text-[10px] tracking-[0.3em] uppercase" style={{ color: "rgba(240,237,230,0.35)" }}>
              {hasAnyRole ? "Kies begeleiding" : "Geen begeleiding vereist voor deze service"}
            </p>
            {engineerProfiles.length > 0 && (
              <RoleSection label="Engineer" required={engineerOpts.some(o => o.is_required)}
                people={engineerProfiles} selected={selEngineer} onSelect={toggleEngineer} onClear={clearEngineer} />
            )}
            {beatmakerProfiles.length > 0 && (
              <RoleSection label="Beatmaker" required={beatmakerOpts.some(o => o.is_required)}
                people={beatmakerProfiles} selected={selBeatmaker} onSelect={toggleBeatmaker} onClear={clearBeatmaker} />
            )}
            <button onClick={goNext} className="text-[10px] tracking-[0.3em] uppercase px-5 py-2.5 rounded transition-all"
              style={{ background: "rgba(201,168,76,0.08)", border: "1px solid rgba(201,168,76,0.25)", color: DB_GOLD }}>
              Doorgaan →
            </button>
          </div>
        );
      })()}

      {/* Step 6: Confirm */}
      {step === 6 && (
        <div className="space-y-4">
          <p className="text-[10px] tracking-[0.3em] uppercase" style={{ color: "rgba(240,237,230,0.35)" }}>Bevestig je boeking</p>
          <div className="p-6 rounded space-y-0" style={{ background: "rgba(0,0,0,0.4)", border: "1px solid rgba(201,168,76,0.2)" }}>
            {[
              ["Service",  selService?.name],
              ["Artiest",  isAdmin ? selArtist?.display_name : myProfile?.display_name],
              ["Studio",   selStudio?.name],
              ["Datum",    selDate ? new Date(selDate + "T12:00").toLocaleDateString("nl-NL", { weekday: "long", day: "numeric", month: "long" }) : ""],
              ["Tijd",     selSlot ? `${selSlot} → ${endTimeStr(selSlot, selDuration)} (${selDuration}u)` : ""],
              ...(selResources.find(r => r.user_roles?.some(rr => rr.role.slug === "engineer")) ? [["Engineer", selResources.find(r => r.user_roles?.some(rr => rr.role.slug === "engineer"))!.display_name]] : []),
              ...(selResources.find(r => r.user_roles?.some(rr => ["beat-creator","beatmaker"].includes(rr.role.slug))) ? [["Beatmaker", selResources.find(r => r.user_roles?.some(rr => ["beat-creator","beatmaker"].includes(rr.role.slug)))!.display_name]] : []),
            ].map(([label, value]) => (
              <div key={label} className="flex items-center justify-between py-3" style={{ borderBottom: `1px solid ${DB_BORDER}` }}>
                <span className="text-[10px] tracking-[0.25em] uppercase" style={{ color: "rgba(240,237,230,0.3)" }}>{label}</span>
                <span className="text-[12px]" style={{ color: label === "Tijd" ? DB_GOLD : "rgba(240,237,230,0.85)" }}>{value}</span>
              </div>
            ))}
          </div>
          {error && (
            <div className="px-4 py-3 rounded text-[11px]" style={{ background: "rgba(239,68,68,0.08)", border: "1px solid rgba(239,68,68,0.25)", color: "#EF4444" }}>⚠ {error}</div>
          )}
          <button onClick={handleSubmit} disabled={saving}
            className="w-full text-[10px] tracking-[0.3em] uppercase py-3.5 rounded transition-all"
            style={{ background: saving ? "rgba(201,168,76,0.08)" : "rgba(201,168,76,0.14)", border: `1px solid ${DB_GOLD}`, color: DB_GOLD }}>
            {saving ? "Boeken…" : "Sessie bevestigen"}
          </button>
        </div>
      )}

      {/* Back button */}
      {virtualStep > 0 && !success && (
        <button onClick={goPrev} className="flex items-center gap-2 text-[10px] tracking-[0.25em] uppercase transition-colors"
          style={{ color: "rgba(240,237,230,0.25)" }}
          onMouseEnter={e => (e.currentTarget.style.color = "rgba(240,237,230,0.55)")}
          onMouseLeave={e => (e.currentTarget.style.color = "rgba(240,237,230,0.25)")}>
          <ChevronLeft size={11} /> Terug
        </button>
      )}
    </div>
  );
}

function DashBoekingen({ bookings, loading, profiles, studios, services, onBookingAdded, isAdmin, myProfile, token }: {
  bookings: Booking[]; loading: boolean; profiles: Profile[];
  studios: StudioDB[]; services: Service[];
  onBookingAdded: (b: Booking) => void;
  isAdmin: boolean; myProfile: Profile | null; token?: string;
}) {
  const [showWizard, setShowWizard] = useState(false);
  const myBookings = isAdmin ? bookings : bookings.filter(b => b.artist_id === myProfile?.id || b.artist?.display_name === myProfile?.display_name);

  return (
    <div className="space-y-6 max-w-5xl">
      <div className="flex items-end justify-between">
        <div>
          <p className="text-[10px] tracking-[0.4em] uppercase mb-1" style={{ color: DB_GOLD }}>Boekingen</p>
          <h2 className="font-display font-normal text-2xl" style={{ color: "rgba(240,237,230,0.9)" }}>
            {isAdmin ? "Alle sessies" : "Mijn sessies"}
          </h2>
        </div>
        <button onClick={() => setShowWizard(!showWizard)}
          className="text-[10px] tracking-[0.3em] uppercase px-4 py-2.5 border transition-colors"
          style={{ borderColor: showWizard ? DB_GOLD : "rgba(201,168,76,0.35)", color: DB_GOLD, background: showWizard ? "rgba(201,168,76,0.08)" : "transparent" }}>
          {showWizard ? "✕ Annuleren" : "+ Nieuwe sessie"}
        </button>
      </div>

      {showWizard && (
        <div className="p-6 rounded" style={{ background: DB_SURFACE, border: "1px solid rgba(201,168,76,0.2)" }}>
          <BookingWizard profiles={profiles} studios={studios} services={services}
            onBookingAdded={b => { onBookingAdded(b); setShowWizard(false); }}
            isAdmin={isAdmin} myProfile={myProfile} token={token} bookings={bookings} />
        </div>
      )}

      {loading ? (
        <p className="text-[11px]" style={{ color: "rgba(240,237,230,0.25)" }}>Laden…</p>
      ) : !myBookings.length ? (
        <div className="p-6 rounded text-center text-[11px]" style={{ border: "1px dashed rgba(201,168,76,0.15)", color: "rgba(240,237,230,0.3)" }}>
          {isAdmin ? "Nog geen boekingen." : "Geen sessies gevonden. Plan hierboven je eerste sessie."}
        </div>
      ) : <BookingTable bookings={myBookings} />}
    </div>
  );
}

function DashAgenda({ bookings, loading, profiles, isAdmin, myProfile }: { bookings: Booking[]; loading: boolean; profiles: Profile[]; isAdmin: boolean; myProfile: Profile | null }) {
  const [view, setView] = useState<"week" | "month">("week");
  const [filterArtist, setFilterArtist] = useState("all");
  const [weekOffset, setWeekOffset] = useState(0);
  const [monthOffset, setMonthOffset] = useState(0);
  const [tooltip, setTooltip] = useState<Booking | null>(null);

  const todayDate = new Date();
  const todayStr = todayDate.toISOString().split("T")[0];

  const visibleBookings = isAdmin
    ? (filterArtist === "all" ? bookings : bookings.filter(b => b.artist_id === filterArtist || b.artist?.display_name === profiles.find(p => p.id === filterArtist)?.display_name))
    : bookings.filter(b => b.artist_id === myProfile?.id || b.artist?.display_name === myProfile?.display_name);

  // Week view
  const weekStart = new Date(todayDate);
  weekStart.setDate(todayDate.getDate() + weekOffset * 7);
  const weekDays = Array.from({ length: 7 }, (_, i) => { const d = new Date(weekStart); d.setDate(weekStart.getDate() + i); return d; });

  const HOUR_START = 10; const HOUR_END = 24; const TOTAL_HOURS = HOUR_END - HOUR_START; const COL_HEIGHT = 320;
  const toPercent = (t: string) => { const [h, m] = t.slice(0, 5).split(":").map(Number); return Math.max(0, Math.min(100, ((h - HOUR_START) * 60 + m) / (TOTAL_HOURS * 60) * 100)); };

  // Month view
  const monthDate = new Date(todayDate.getFullYear(), todayDate.getMonth() + monthOffset, 1);
  const monthYear = monthDate.getFullYear();
  const monthIdx = monthDate.getMonth();
  const firstDow = (new Date(monthYear, monthIdx, 1).getDay() + 6) % 7;
  const daysInMonth = new Date(monthYear, monthIdx + 1, 0).getDate();
  const monthCells: (string | null)[] = [...Array(firstDow).fill(null), ...Array.from({ length: daysInMonth }, (_, i) => new Date(monthYear, monthIdx, i + 1).toISOString().split("T")[0])];
  const monthLabel = monthDate.toLocaleDateString("nl-NL", { month: "long", year: "numeric" });
  const weekLabel = `${weekDays[0].toLocaleDateString("nl-NL", { day: "numeric", month: "short" })} – ${weekDays[6].toLocaleDateString("nl-NL", { day: "numeric", month: "short", year: "numeric" })}`;
  const DOW = ["Ma", "Di", "Wo", "Do", "Vr", "Za", "Zo"];

  const NavBtn = ({ onClick, children }: { onClick: () => void; children: React.ReactNode }) => (
    <button onClick={onClick} className="px-2.5 py-1.5 rounded transition-colors text-[11px]"
      style={{ background: "rgba(240,237,230,0.04)", border: `1px solid ${DB_BORDER}`, color: "rgba(240,237,230,0.5)" }}>
      {children}
    </button>
  );

  return (
    <div className="space-y-6 max-w-5xl">
      <div className="flex items-end justify-between flex-wrap gap-4">
        <div>
          <p className="text-[10px] tracking-[0.4em] uppercase mb-1" style={{ color: DB_GOLD }}>Agenda</p>
          <h2 className="font-display font-normal text-2xl" style={{ color: "rgba(240,237,230,0.9)" }}>
            {view === "week" ? weekLabel : monthLabel.charAt(0).toUpperCase() + monthLabel.slice(1)}
          </h2>
        </div>
        <div className="flex items-center gap-2 flex-wrap">
          {/* View toggle */}
          <div className="flex rounded overflow-hidden" style={{ border: `1px solid ${DB_BORDER}` }}>
            {(["week", "month"] as const).map(v => (
              <button key={v} onClick={() => setView(v)}
                className="px-3 py-1.5 text-[10px] tracking-[0.2em] uppercase transition-colors"
                style={{ background: view === v ? "rgba(201,168,76,0.12)" : "transparent", color: view === v ? DB_GOLD : "rgba(240,237,230,0.35)" }}>
                {v === "week" ? "Week" : "Maand"}
              </button>
            ))}
          </div>
          {/* Navigation */}
          <NavBtn onClick={() => view === "week" ? setWeekOffset(0) : setMonthOffset(0)}>Vandaag</NavBtn>
          <NavBtn onClick={() => view === "week" ? setWeekOffset(w => w - 1) : setMonthOffset(m => m - 1)}>‹</NavBtn>
          <NavBtn onClick={() => view === "week" ? setWeekOffset(w => w + 1) : setMonthOffset(m => m + 1)}>›</NavBtn>
          {/* Artist filter */}
          {isAdmin && (
            <select value={filterArtist} onChange={e => setFilterArtist(e.target.value)}
              style={{ background: DB_SURFACE, border: `1px solid rgba(201,168,76,0.2)`, color: "rgba(240,237,230,0.6)", borderRadius: 4, padding: "6px 10px", fontSize: 11 }}>
              <option value="all">Alle artiesten</option>
              {profiles.filter(p => p.user_roles?.some(r => r.role.slug === "artist")).map(p => (
                <option key={p.id} value={p.id}>{p.display_name}</option>
              ))}
            </select>
          )}
        </div>
      </div>

      {loading ? (
        <p className="text-[11px]" style={{ color: "rgba(240,237,230,0.25)" }}>Laden…</p>
      ) : view === "week" ? (
        /* ── Week timeline ── */
        <div className="overflow-x-auto">
          <div className="flex gap-2" style={{ minWidth: 600 }}>
            <div className="shrink-0 flex flex-col" style={{ width: 32, paddingTop: 44 }}>
              {Array.from({ length: TOTAL_HOURS + 1 }, (_, i) => (
                <div key={i} style={{ height: COL_HEIGHT / TOTAL_HOURS }} className="flex items-start justify-end pr-1">
                  <span className="text-[8px] leading-none" style={{ color: "rgba(240,237,230,0.18)" }}>{String(HOUR_START + i).padStart(2, "0")}</span>
                </div>
              ))}
            </div>
            {weekDays.map((d, di) => {
              const dateStr = d.toISOString().split("T")[0];
              const dayBookings = visibleBookings.filter(b => b.date === dateStr);
              const isToday = dateStr === todayStr;
              return (
                <div key={di} className="flex-1 min-w-[72px]">
                  <div className="text-center pb-2">
                    <p className="text-[8px] tracking-[0.25em] uppercase" style={{ color: isToday ? DB_GOLD : "rgba(240,237,230,0.28)" }}>
                      {d.toLocaleDateString("nl-NL", { weekday: "short" })}
                    </p>
                    <p className="font-display text-base leading-tight" style={{ color: isToday ? DB_GOLD : "rgba(240,237,230,0.5)" }}>{d.getDate()}</p>
                  </div>
                  <div className="relative rounded" style={{ height: COL_HEIGHT, background: isToday ? "rgba(201,168,76,0.035)" : DB_SURFACE, border: `1px solid ${isToday ? "rgba(201,168,76,0.18)" : DB_BORDER}` }}>
                    {Array.from({ length: TOTAL_HOURS - 1 }, (_, hi) => (
                      <div key={hi} className="absolute w-full pointer-events-none" style={{ top: `${((hi + 1) / TOTAL_HOURS) * 100}%`, borderTop: "1px solid rgba(240,237,230,0.04)" }} />
                    ))}
                    {dayBookings.map(b => {
                      const top = toPercent(b.start_time ?? "10:00:00");
                      const ht = Math.max(toPercent(b.end_time ?? "14:00:00") - top, 4);
                      const clr = b.status?.color ?? DB_GOLD;
                      return (
                        <div key={b.id} className="absolute left-1 right-1 rounded overflow-hidden"
                          style={{ top: `${top}%`, height: `${ht}%`, background: `${clr}16`, border: `1px solid ${clr}30`, borderLeft: `2px solid ${clr}`, cursor: "default" }}
                          onMouseEnter={() => setTooltip(b)} onMouseLeave={() => setTooltip(null)}>
                          <p className="text-[8px] font-medium px-1 pt-0.5 leading-tight truncate" style={{ color: clr }}>{b.start_time?.slice(0, 5)}</p>
                          <p className="text-[8px] px-1 leading-tight truncate" style={{ color: "rgba(240,237,230,0.55)" }}>{b.artist?.display_name}</p>
                        </div>
                      );
                    })}
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      ) : (
        /* ── Month calendar ── */
        <div>
          <div className="grid grid-cols-7 mb-1">
            {DOW.map(d => (
              <div key={d} className="text-center py-2 text-[9px] tracking-[0.25em] uppercase" style={{ color: "rgba(240,237,230,0.25)" }}>{d}</div>
            ))}
          </div>
          <div className="grid grid-cols-7 gap-px" style={{ background: DB_BORDER }}>
            {monthCells.map((dateStr, i) => {
              if (!dateStr) return <div key={i} style={{ background: "#0A0A0A", minHeight: 72 }} />;
              const dayBookings = visibleBookings.filter(b => b.date === dateStr);
              const isToday = dateStr === todayStr;
              const dayNum = new Date(dateStr).getDate();
              return (
                <div key={dateStr} className="p-2 flex flex-col gap-1" style={{ background: "#0A0A0A", minHeight: 72, border: isToday ? `1px solid rgba(201,168,76,0.3)` : "none" }}>
                  <p className="text-[11px] font-medium self-start leading-none mb-1"
                    style={{ color: isToday ? DB_GOLD : "rgba(240,237,230,0.4)", background: isToday ? "rgba(201,168,76,0.12)" : "transparent", borderRadius: 3, padding: isToday ? "2px 5px" : "0" }}>
                    {dayNum}
                  </p>
                  {dayBookings.slice(0, 3).map(b => {
                    const clr = b.status?.color ?? DB_GOLD;
                    return (
                      <div key={b.id} className="rounded px-1.5 py-0.5 truncate text-[8px] leading-tight cursor-default"
                        style={{ background: `${clr}16`, borderLeft: `2px solid ${clr}`, color: "rgba(240,237,230,0.7)" }}
                        onMouseEnter={() => setTooltip(b)} onMouseLeave={() => setTooltip(null)}>
                        {b.start_time?.slice(0, 5)} {b.artist?.display_name}
                      </div>
                    );
                  })}
                  {dayBookings.length > 3 && (
                    <p className="text-[8px]" style={{ color: "rgba(240,237,230,0.25)" }}>+{dayBookings.length - 3}</p>
                  )}
                </div>
              );
            })}
          </div>
        </div>
      )}

      {tooltip && (
        <div className="p-4 rounded text-[11px] space-y-1.5" style={{ background: DB_SURFACE, border: `1px solid ${tooltip.status?.color ?? DB_GOLD}30` }}>
          <div className="flex items-center gap-2">
            <div className="w-2 h-2 rounded-full" style={{ background: tooltip.status?.color ?? DB_GOLD }} />
            <span className="font-medium" style={{ color: "rgba(240,237,230,0.8)" }}>{tooltip.booking_type?.name ?? "Sessie"}</span>
            <span style={{ color: "rgba(240,237,230,0.35)" }}>·</span>
            <span style={{ color: tooltip.status?.color ?? DB_GOLD }}>{tooltip.start_time?.slice(0,5)} → {tooltip.end_time?.slice(0,5)}</span>
          </div>
          <p style={{ color: "rgba(240,237,230,0.55)" }}>{tooltip.artist?.display_name} · {tooltip.studio?.name}</p>
          <p style={{ color: "rgba(240,237,230,0.35)" }}>{new Date(tooltip.date + "T12:00").toLocaleDateString("nl-NL", { weekday: "long", day: "numeric", month: "long" })}</p>
        </div>
      )}
    </div>
  );
}

function DashArtiesten({ profiles, loading, bookings }: { profiles: Profile[]; loading: boolean; bookings: Booking[] }) {
  const artists = profiles.filter(p => p.user_roles?.some(r => r.role.slug === "artist"));
  const today = new Date().toISOString().split("T")[0];
  return (
    <div className="space-y-6 max-w-5xl">
      <div>
        <p className="text-[10px] tracking-[0.4em] uppercase mb-1" style={{ color: DB_GOLD }}>Artiesten</p>
        <h2 className="font-display font-normal text-2xl" style={{ color: "rgba(240,237,230,0.9)" }}>Actieve artiesten</h2>
      </div>
      {loading ? (
        <p className="text-[11px]" style={{ color: "rgba(240,237,230,0.25)" }}>Laden…</p>
      ) : !artists.length ? (
        <div className="p-10 rounded text-center text-[11px]" style={{ border: `1px dashed rgba(201,168,76,0.15)`, color: "rgba(240,237,230,0.3)" }}>
          Geen artiesten gevonden. Voer de SQL-migratie uit en deploy de edge function.
        </div>
      ) : (
        <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {artists.map(p => {
            const artistBookings = bookings.filter(b => b.artist_id === p.id || b.artist?.display_name === p.display_name);
            const upcoming = artistBookings.filter(b => b.date >= today && b.status?.slug !== "cancelled");
            const nextSession = upcoming.sort((a, b) => a.date.localeCompare(b.date))[0];
            return (
              <div key={p.id} className="p-5 rounded" style={{ background: DB_SURFACE, border: `1px solid ${DB_BORDER}` }}>
                <ProfileCard profile={p} expanded />
                {nextSession && (
                  <div className="mt-3 pt-3" style={{ borderTop: `1px solid ${DB_BORDER}` }}>
                    <p className="text-[9px] tracking-[0.3em] uppercase mb-1" style={{ color: "rgba(240,237,230,0.25)" }}>Volgende sessie</p>
                    <p className="text-[11px]" style={{ color: DB_GOLD }}>
                      {new Date(nextSession.date).toLocaleDateString("nl-NL", { day: "numeric", month: "short" })} — {nextSession.start_time?.slice(0, 5)} {nextSession.studio?.name}
                    </p>
                  </div>
                )}
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}

function DashMedewerkers({ profiles, loading }: { profiles: Profile[]; loading: boolean }) {
  const staff = profiles.filter(p => p.user_roles?.some(r => ["engineer", "beat-creator", "administrator", "film-director"].includes(r.role.slug)));
  return (
    <div className="space-y-6 max-w-5xl">
      <div>
        <p className="text-[10px] tracking-[0.4em] uppercase mb-1" style={{ color: DB_GOLD }}>Medewerkers</p>
        <h2 className="font-display font-normal text-2xl" style={{ color: "rgba(240,237,230,0.9)" }}>Team</h2>
      </div>
      {loading ? (
        <p className="text-[11px]" style={{ color: "rgba(240,237,230,0.25)" }}>Laden…</p>
      ) : !staff.length ? (
        <div className="p-10 rounded text-center text-[11px]" style={{ border: `1px dashed rgba(201,168,76,0.15)`, color: "rgba(240,237,230,0.3)" }}>
          Geen medewerkers gevonden. Voer de SQL-migratie uit en deploy de edge function.
        </div>
      ) : (
        <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {staff.map(p => <ProfileCard key={p.id} profile={p} expanded />)}
        </div>
      )}
    </div>
  );
}

function DashStudios({ studios, bookings }: { studios: StudioDB[]; bookings: Booking[] }) {
  const today = new Date().toISOString().split("T")[0];
  return (
    <div className="space-y-6 max-w-4xl">
      <div>
        <p className="text-[10px] tracking-[0.4em] uppercase mb-1" style={{ color: DB_GOLD }}>Studio's</p>
        <h2 className="font-display font-normal text-2xl" style={{ color: "rgba(240,237,230,0.9)" }}>Overzicht</h2>
      </div>
      {!studios.length ? (
        <p className="text-[11px]" style={{ color: "rgba(240,237,230,0.25)" }}>Geen studio's gevonden in de database.</p>
      ) : (
        <div className="grid sm:grid-cols-3 gap-4">
          {studios.map(s => {
            const studioBookings = bookings.filter(b => b.studio?.id === s.id || b.studio?.name === s.name);
            const upcoming = studioBookings.filter(b => b.date >= today && b.status?.slug !== "cancelled").sort((a, b) => a.date.localeCompare(b.date));
            return (
              <div key={s.id} className="p-5 rounded" style={{ background: DB_SURFACE, border: `1px solid ${DB_BORDER}` }}>
                <p className="text-[13px] mb-3" style={{ color: "rgba(240,237,230,0.85)" }}>{s.name}</p>
                <div className="flex flex-wrap gap-1.5 mb-3">
                  <span className="text-[9px] tracking-[0.2em] uppercase px-2 py-0.5 rounded-full"
                    style={{ background: s.is_active ? "rgba(74,222,128,0.1)" : "rgba(240,237,230,0.04)", color: s.is_active ? "#4ADE80" : "rgba(240,237,230,0.3)", border: `1px solid ${s.is_active ? "rgba(74,222,128,0.2)" : "rgba(240,237,230,0.07)"}` }}>
                    {s.is_active ? "Actief" : "Inactief"}
                  </span>
                  <span className="text-[9px] tracking-[0.2em] uppercase px-2 py-0.5 rounded-full"
                    style={{ background: s.is_bookable ? "rgba(201,168,76,0.1)" : "rgba(240,237,230,0.04)", color: s.is_bookable ? DB_GOLD : "rgba(240,237,230,0.3)", border: `1px solid ${s.is_bookable ? "rgba(201,168,76,0.2)" : "rgba(240,237,230,0.07)"}` }}>
                    {s.is_bookable ? "Boekbaar" : "Niet boekbaar"}
                  </span>
                </div>
                {s.description && <p className="text-[11px] leading-relaxed mb-3" style={{ color: "rgba(240,237,230,0.35)" }}>{s.description}</p>}
                {s.opens_at && s.closes_at && (
                  <p className="text-[10px] mb-3" style={{ color: "rgba(240,237,230,0.3)" }}>{s.opens_at.slice(0,5)} – {s.closes_at.slice(0,5)}</p>
                )}
                {upcoming.length > 0 && (
                  <div className="pt-3" style={{ borderTop: `1px solid ${DB_BORDER}` }}>
                    <p className="text-[9px] tracking-[0.3em] uppercase mb-2" style={{ color: "rgba(240,237,230,0.2)" }}>Aankomende sessies</p>
                    {upcoming.slice(0, 3).map(b => (
                      <div key={b.id} className="flex items-center justify-between py-1">
                        <span className="text-[10px]" style={{ color: "rgba(240,237,230,0.55)" }}>{b.artist?.display_name}</span>
                        <span className="text-[10px]" style={{ color: DB_GOLD }}>
                          {new Date(b.date).toLocaleDateString("nl-NL", { day: "numeric", month: "short" })} {b.start_time?.slice(0, 5)}
                        </span>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}

function DashProgrammas({ programs, profiles, wallets }: {
  programs: { id: string; name: string; slug: string; description?: string }[];
  profiles: Profile[];
  wallets: Record<string, { hours_total: number; hours_used: number; hours_remaining: number; program: { name: string } }[]>;
}) {
  return (
    <div className="space-y-6 max-w-4xl">
      <div>
        <p className="text-[10px] tracking-[0.4em] uppercase mb-1" style={{ color: DB_GOLD }}>Programma's</p>
        <h2 className="font-display font-normal text-2xl" style={{ color: "rgba(240,237,230,0.9)" }}>Overzicht</h2>
      </div>
      {!programs.length ? (
        <div className="p-10 rounded text-center text-[11px]" style={{ border: `1px dashed rgba(201,168,76,0.15)`, color: "rgba(240,237,230,0.3)" }}>
          Geen programma's gevonden in de database.
        </div>
      ) : (
        <div className="grid sm:grid-cols-2 gap-4">
          {programs.map(prog => {
            const members = profiles.filter(p => p.user_programs?.some(up => up.program.name === prog.name));
            // Derive monthly hours from any wallet row for this program
            const sampleWallet = Object.values(wallets).flat().find(w => w.program.name === prog.name);
            const hoursPerMonth = sampleWallet?.hours_total ?? null;
            return (
              <div key={prog.id} className="p-6 rounded" style={{ background: DB_SURFACE, border: `1px solid ${DB_BORDER}` }}>
                <div className="flex items-start justify-between mb-3">
                  <p className="text-[10px] tracking-[0.3em] uppercase" style={{ color: DB_GOLD }}>{prog.name}</p>
                  <div className="w-1.5 h-1.5 rounded-full mt-1" style={{ background: DB_GOLD }} />
                </div>
                {prog.description && (
                  <p className="text-[11px] leading-relaxed mb-5" style={{ color: "rgba(240,237,230,0.4)" }}>{prog.description}</p>
                )}
                <div className="flex items-center gap-6">
                  <div>
                    <p className="font-display text-xl" style={{ color: DB_GOLD }}>{hoursPerMonth ?? "—"}</p>
                    <p className="text-[9px] tracking-[0.25em] uppercase" style={{ color: "rgba(240,237,230,0.3)" }}>uur/maand</p>
                  </div>
                  <div>
                    <p className="font-display text-xl" style={{ color: "rgba(240,237,230,0.6)" }}>{members.length}</p>
                    <p className="text-[9px] tracking-[0.25em] uppercase" style={{ color: "rgba(240,237,230,0.3)" }}>leden</p>
                  </div>
                </div>
                {members.length > 0 && (
                  <div className="flex flex-wrap gap-1 mt-4 pt-4" style={{ borderTop: `1px solid ${DB_BORDER}` }}>
                    {members.map(m => (
                      <span key={m.id} className="text-[9px] tracking-[0.18em] uppercase px-2 py-0.5 rounded-full"
                        style={{ background: "rgba(201,168,76,0.08)", color: "rgba(201,168,76,0.6)" }}>
                        {m.display_name}
                      </span>
                    ))}
                  </div>
                )}
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}

function DashProfiel({ profiles, loading, selected, onSelect, wallets, isAdmin, myProfile }: { profiles: Profile[]; loading: boolean; selected: Profile | null; onSelect: (p: Profile) => void; wallets: Record<string, { hours_total: number; hours_used: number; hours_remaining: number; program: { name: string } }[]>; isAdmin: boolean; myProfile: Profile | null }) {
  // Non-admins always see their own profile only
  const active = isAdmin ? (selected ?? profiles[0] ?? null) : myProfile;
  if (loading) return <p className="text-[11px]" style={{ color: "rgba(240,237,230,0.25)" }}>Laden…</p>;
  if (!active) return <div className="p-10 rounded text-center text-[11px]" style={{ border: `1px dashed rgba(201,168,76,0.15)`, color: "rgba(240,237,230,0.3)" }}>Voer de SQL-migratie uit om profielen te laden.</div>;
  const programs = active.user_programs?.map(p => p.program.name) ?? [];

  const walletItems = (wallets[active.id] ?? []).map(w => ({
    program: w.program.name,
    total: w.hours_total,
    used: w.hours_used,
    remaining: w.hours_remaining,
  }));

  const fieldStyle = { background: "#0A0A0A", border: `1px solid rgba(201,168,76,0.15)`, color: "rgba(240,237,230,0.7)", borderRadius: 4, padding: "9px 12px", fontSize: 12, width: "100%" };
  const labelStyle = { fontSize: 10, letterSpacing: "0.3em", textTransform: "uppercase" as const, color: "rgba(240,237,230,0.3)", display: "block", marginBottom: 6 };

  return (
    <div className="space-y-6 max-w-3xl">
      <div>
        <p className="text-[10px] tracking-[0.4em] uppercase mb-1" style={{ color: DB_GOLD }}>Profiel</p>
        <h2 className="font-display font-normal text-2xl" style={{ color: "rgba(240,237,230,0.9)" }}>Accountoverzicht</h2>
      </div>

      {/* Profile switcher — admin only */}
      {isAdmin && profiles.length > 1 && (
        <div className="flex flex-wrap gap-2">
          {profiles.map(p => (
            <button key={p.id} onClick={() => onSelect(p)}
              className="flex items-center gap-2 px-3 py-2 rounded transition-all"
              style={{
                background: active.id === p.id ? "rgba(201,168,76,0.12)" : "rgba(240,237,230,0.03)",
                border: `1px solid ${active.id === p.id ? "rgba(201,168,76,0.35)" : "rgba(240,237,230,0.08)"}`,
                color: active.id === p.id ? DB_GOLD : "rgba(240,237,230,0.45)",
              }}>
              <span className="w-6 h-6 rounded-full flex items-center justify-center text-[10px] font-display"
                style={{ background: "rgba(201,168,76,0.15)", color: DB_GOLD }}>
                {p.display_name.slice(0, 2).toUpperCase()}
              </span>
              <span className="text-[11px]">{p.display_name}</span>
            </button>
          ))}
        </div>
      )}

      {/* Profile details */}
      <div className="p-6 rounded space-y-5" style={{ background: DB_SURFACE, border: `1px solid ${DB_BORDER}` }}>
        <div className="flex items-center gap-4 mb-2">
          <div className="w-12 h-12 rounded-full flex items-center justify-center font-display text-lg"
            style={{ background: "rgba(201,168,76,0.12)", color: DB_GOLD }}>
            {active.display_name.slice(0, 2).toUpperCase()}
          </div>
          <div>
            <p className="text-[15px]" style={{ color: "rgba(240,237,230,0.9)" }}>{active.display_name}</p>
            <div className="flex flex-wrap gap-1 mt-1">
              {active.user_roles?.map(r => (
                <span key={r.role.slug} className="text-[9px] tracking-[0.2em] uppercase px-2 py-0.5 rounded-full"
                  style={{ background: "rgba(201,168,76,0.08)", color: DB_GOLD }}>{r.role.name}</span>
              ))}
            </div>
          </div>
        </div>

        <div className="grid sm:grid-cols-2 gap-4">
          <div>
            <label style={labelStyle}>Weergavenaam</label>
            <input style={fieldStyle} defaultValue={active.display_name} readOnly />
          </div>
          <div>
            <label style={labelStyle}>Volledige naam</label>
            <input style={fieldStyle} defaultValue={active.full_name ?? ""} readOnly />
          </div>
          <div>
            <label style={labelStyle}>E-mailadres</label>
            <input style={fieldStyle} defaultValue={active.email ?? ""} readOnly />
          </div>
          <div>
            <label style={labelStyle}>Wachtwoord</label>
            <input type="password" style={fieldStyle} defaultValue="••••••••" readOnly />
          </div>
        </div>
      </div>

      {/* Studio hours wallet */}
      {walletItems.length > 0 && (
        <div className="p-6 rounded" style={{ background: DB_SURFACE, border: `1px solid ${DB_BORDER}` }}>
          <p className="text-[10px] tracking-[0.3em] uppercase mb-5" style={{ color: DB_GOLD }}>Studiotijd</p>
          {walletItems.map(w => (
            <div key={w.program} className="mb-4 last:mb-0">
              <div className="flex items-center justify-between mb-2">
                <span className="text-[11px]" style={{ color: "rgba(240,237,230,0.6)" }}>{w.program}</span>
                <span className="text-[11px]" style={{ color: DB_GOLD }}>{w.remaining}u resterend</span>
              </div>
              {/* Progress bar */}
              <div className="h-1.5 rounded-full overflow-hidden" style={{ background: "rgba(240,237,230,0.06)" }}>
                <div className="h-full rounded-full transition-all" style={{ width: `${((w.total - w.used) / w.total) * 100}%`, background: `linear-gradient(90deg, ${DB_GOLD}, #E8D5A3)` }} />
              </div>
              <div className="flex justify-between mt-1.5">
                <span className="text-[9px]" style={{ color: "rgba(240,237,230,0.25)" }}>{w.used}u gebruikt</span>
                <span className="text-[9px]" style={{ color: "rgba(240,237,230,0.25)" }}>{w.total}u totaal / maand</span>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Programs */}
      {programs.length > 0 && (
        <div className="p-6 rounded" style={{ background: DB_SURFACE, border: `1px solid ${DB_BORDER}` }}>
          <p className="text-[10px] tracking-[0.3em] uppercase mb-3" style={{ color: DB_GOLD }}>Programma's</p>
          <div className="flex flex-wrap gap-2">
            {programs.map(name => (
              <span key={name} className="text-[10px] tracking-[0.2em] uppercase px-3 py-1.5 rounded"
                style={{ background: "rgba(201,168,76,0.06)", color: "rgba(240,237,230,0.5)", border: `1px solid rgba(201,168,76,0.12)` }}>
                {name}
              </span>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}

function DashBerichten({ messages, loading }: {
  messages: { id: string; naam: string; email: string; bericht: string; created_at: string }[];
  loading: boolean;
}) {
  return (
    <div className="space-y-6 max-w-3xl">
      <div>
        <p className="text-[10px] tracking-[0.4em] uppercase mb-1" style={{ color: DB_GOLD }}>Berichten</p>
        <h2 className="font-display font-normal text-2xl" style={{ color: "rgba(240,237,230,0.9)" }}>Contactformulier</h2>
      </div>

      {loading ? (
        <p className="text-[11px]" style={{ color: "rgba(240,237,230,0.25)" }}>Laden…</p>
      ) : !messages.length ? (
        <div className="p-10 rounded text-center text-[11px]" style={{ border: `1px dashed rgba(201,168,76,0.15)`, color: "rgba(240,237,230,0.3)" }}>
          Nog geen berichten ontvangen.
        </div>
      ) : (
        <div className="space-y-3">
          {messages.map(m => (
            <div key={m.id} className="p-5 rounded" style={{ background: DB_SURFACE, border: `1px solid ${DB_BORDER}` }}>
              <div className="flex items-start justify-between gap-4 mb-3">
                <div>
                  <p className="text-[13px] font-medium mb-0.5" style={{ color: "rgba(240,237,230,0.85)" }}>{m.naam}</p>
                  <a
                    href={`mailto:${m.email}`}
                    className="text-[11px] transition-colors"
                    style={{ color: DB_GOLD, textDecoration: "none" }}
                    onMouseEnter={e => (e.currentTarget.style.opacity = "0.7")}
                    onMouseLeave={e => (e.currentTarget.style.opacity = "1")}
                  >
                    {m.email}
                  </a>
                </div>
                <span className="text-[9px] tracking-[0.2em] shrink-0 pt-0.5" style={{ color: "rgba(240,237,230,0.25)" }}>
                  {new Date(m.created_at).toLocaleDateString("nl-NL", { day: "numeric", month: "short", year: "numeric", hour: "2-digit", minute: "2-digit" })}
                </span>
              </div>
              <p className="text-[12px] leading-relaxed" style={{ color: "rgba(240,237,230,0.5)" }}>{m.bericht}</p>
              <div className="mt-4 pt-3" style={{ borderTop: `1px solid ${DB_BORDER}` }}>
                <a
                  href={`mailto:${m.email}?subject=Re: jouw bericht aan Déjà Vu Studios`}
                  className="text-[9px] tracking-[0.28em] uppercase transition-colors"
                  style={{ color: "rgba(201,168,76,0.5)", textDecoration: "none" }}
                  onMouseEnter={e => (e.currentTarget.style.color = DB_GOLD)}
                  onMouseLeave={e => (e.currentTarget.style.color = "rgba(201,168,76,0.5)")}
                >
                  Beantwoorden →
                </a>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

type AvailSlot = { id: string; weekday: number; start_time: string; end_time: string; is_available: boolean };

function DashWallet({ profiles, loading, wallets, isAdmin, myProfile }: {
  profiles: Profile[];
  loading: boolean;
  wallets: Record<string, { hours_total: number; hours_used: number; hours_remaining: number; split_used: boolean; program: { name: string } }[]>;
  isAdmin: boolean; myProfile: Profile | null;
}) {
  const month = new Date().toLocaleDateString("nl-NL", { month: "long", year: "numeric" });
  const visibleProfiles = isAdmin ? profiles : profiles.filter(p => p.id === myProfile?.id);
  const memberWallets = visibleProfiles.flatMap(p =>
    (wallets[p.id] ?? []).map(w => ({ profile: p, wallet: w }))
  );

  return (
    <div className="space-y-6 max-w-4xl">
      <div>
        <p className="text-[10px] tracking-[0.4em] uppercase mb-1" style={{ color: DB_GOLD }}>Studiotijd</p>
        <h2 className="font-display font-normal text-2xl" style={{ color: "rgba(240,237,230,0.9)" }}>
          Uurbudget — {month}
        </h2>
      </div>

      {loading ? (
        <p className="text-[11px]" style={{ color: "rgba(240,237,230,0.25)" }}>Laden…</p>
      ) : !memberWallets.length ? (
        <div className="p-10 rounded text-center text-[11px]" style={{ border: `1px dashed rgba(201,168,76,0.15)`, color: "rgba(240,237,230,0.3)" }}>
          Geen walletdata gevonden. Wallets worden per profiel geladen.
        </div>
      ) : (
        <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {memberWallets.map(({ profile, wallet: w }) => {
            const pct = w.hours_total > 0 ? ((w.hours_total - w.hours_used) / w.hours_total) * 100 : 0;
            const barColor = pct > 50 ? DB_GOLD : pct > 25 ? "#F59E0B" : "#EF4444";
            return (
              <div key={`${profile.id}-${w.program.name}`} className="p-5 rounded" style={{ background: DB_SURFACE, border: `1px solid ${DB_BORDER}` }}>
                <div className="flex items-center gap-3 mb-5">
                  <div className="w-9 h-9 rounded-full flex items-center justify-center shrink-0 font-display text-sm"
                    style={{ background: "rgba(201,168,76,0.12)", color: DB_GOLD }}>
                    {profile.display_name.slice(0, 2).toUpperCase()}
                  </div>
                  <div className="min-w-0">
                    <p className="text-[12px] font-medium" style={{ color: "rgba(240,237,230,0.85)" }}>{profile.display_name}</p>
                    <p className="text-[9px] tracking-[0.2em] uppercase" style={{ color: "rgba(240,237,230,0.3)" }}>{w.program.name}</p>
                  </div>
                </div>

                <div className="flex items-end justify-between mb-2">
                  <span className="font-display text-3xl" style={{ color: barColor }}>{w.hours_remaining}</span>
                  <span className="text-[10px] pb-1" style={{ color: "rgba(240,237,230,0.3)" }}>/ {w.hours_total}u</span>
                </div>

                <div className="h-1.5 rounded-full overflow-hidden mb-2" style={{ background: "rgba(240,237,230,0.06)" }}>
                  <div className="h-full rounded-full" style={{ width: `${pct}%`, background: `linear-gradient(90deg, ${barColor}, ${barColor}99)` }} />
                </div>

                <div className="flex items-center justify-between mt-1">
                  <span className="text-[9px]" style={{ color: "rgba(240,237,230,0.25)" }}>{w.hours_used}u gebruikt</span>
                  {w.split_used && (
                    <span className="text-[9px] tracking-[0.18em] uppercase px-2 py-0.5 rounded-full"
                      style={{ background: "rgba(201,168,76,0.08)", color: "rgba(201,168,76,0.5)" }}>
                      Split ✓
                    </span>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      )}

      <div className="flex items-center gap-6 pt-1">
        {[{ color: DB_GOLD, label: "> 50% resterend" }, { color: "#F59E0B", label: "25 – 50%" }, { color: "#EF4444", label: "< 25%" }].map(({ color, label }) => (
          <div key={label} className="flex items-center gap-2">
            <div className="w-2 h-2 rounded-full" style={{ background: color }} />
            <span className="text-[9px]" style={{ color: "rgba(240,237,230,0.3)" }}>{label}</span>
          </div>
        ))}
      </div>
    </div>
  );
}

function DashBeschikbaarheid({ profiles, loading, availability, isAdmin, myProfile, token, onSlotsChanged }: {
  profiles: Profile[];
  loading: boolean;
  availability: Record<string, AvailSlot[]>;
  isAdmin: boolean; myProfile: Profile | null; token?: string;
  onSlotsChanged: (profileId: string, slots: AvailSlot[]) => void;
}) {
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const [addingDay, setAddingDay] = useState<number | null>(null);
  const [newStart, setNewStart] = useState("09:00");
  const [newEnd, setNewEnd] = useState("17:00");
  const [saving, setSaving] = useState(false);
  const [deletingId, setDeletingId] = useState<string | null>(null);

  const SHORT = ["Ma", "Di", "Wo", "Do", "Vr", "Za", "Zo"];
  const FULL  = ["Maandag", "Dinsdag", "Woensdag", "Donderdag", "Vrijdag", "Zaterdag", "Zondag"];

  // Non-admins always view their own profile
  const editableProfile = isAdmin
    ? (profiles.find(p => p.id === (selectedId ?? profiles[0]?.id)) ?? profiles[0] ?? null)
    : myProfile;

  const slots = editableProfile ? (availability[editableProfile.id] ?? null) : null;

  const handleAddSlot = async (weekday: number) => {
    if (!editableProfile || !token) return;
    setSaving(true);
    try {
      const resp = await apiFetch("/availability", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          profile_id: editableProfile.id,
          weekday,
          start_time: newStart + ":00",
          end_time: newEnd + ":00",
          is_available: true,
        }),
      }, token);
      const body = await resp.json();
      if (!resp.ok) {
        console.error("[DV] availability save error:", body?.error ?? resp.status);
      } else {
        const current = slots ?? [];
        onSlotsChanged(editableProfile.id, [...current, body as AvailSlot]);
      }
    } catch (err) { console.error("[DV] availability fetch error:", err); }
    setSaving(false);
    setAddingDay(null);
    setNewStart("09:00");
    setNewEnd("17:00");
  };

  const handleDeleteSlot = async (slot: AvailSlot) => {
    if (!editableProfile || !token) return;
    setDeletingId(slot.id);
    try {
      const resp = await apiFetch(`/availability/${slot.id}`, { method: "DELETE" }, token);
      if (resp.ok) {
        const current = slots ?? [];
        onSlotsChanged(editableProfile.id, current.filter(s => s.id !== slot.id));
      } else {
        const body = await resp.json().catch(() => ({}));
        console.error("[DV] availability delete error:", body?.error ?? resp.status);
      }
    } catch (err) { console.error("[DV] availability delete error:", err); }
    setDeletingId(null);
  };

  const inputSm = { background: "#0A0A0A", border: `1px solid rgba(201,168,76,0.18)`, color: "rgba(240,237,230,0.8)", borderRadius: 4, padding: "4px 8px", fontSize: 11, outline: "none" };

  return (
    <div className="space-y-6 max-w-5xl">
      <div>
        <p className="text-[10px] tracking-[0.4em] uppercase mb-1" style={{ color: DB_GOLD }}>Beschikbaarheid</p>
        <h2 className="font-display font-normal text-2xl" style={{ color: "rgba(240,237,230,0.9)" }}>Weekrooster</h2>
      </div>

      {/* Profile tabs — admin only */}
      {isAdmin && profiles.length > 1 && (
        <div className="flex flex-wrap gap-2">
          {profiles.map(p => {
            const isActive = (selectedId ?? profiles[0]?.id) === p.id;
            return (
              <button key={p.id} onClick={() => setSelectedId(p.id)}
                className="flex items-center gap-2 px-3 py-2 rounded transition-all"
                style={{
                  background: isActive ? "rgba(201,168,76,0.12)" : "rgba(240,237,230,0.03)",
                  border: `1px solid ${isActive ? "rgba(201,168,76,0.35)" : "rgba(240,237,230,0.08)"}`,
                  color: isActive ? DB_GOLD : "rgba(240,237,230,0.45)",
                }}>
                <span className="w-6 h-6 rounded-full flex items-center justify-center text-[10px] font-display"
                  style={{ background: "rgba(201,168,76,0.15)", color: DB_GOLD }}>
                  {p.display_name.slice(0, 2).toUpperCase()}
                </span>
                <span className="text-[11px]">{p.display_name}</span>
              </button>
            );
          })}
        </div>
      )}

      {!isAdmin && editableProfile && (
        <div className="flex items-center gap-3 px-4 py-3 rounded" style={{ background: DB_SURFACE, border: `1px solid ${DB_BORDER}` }}>
          <div className="w-8 h-8 rounded-full flex items-center justify-center font-display text-sm"
            style={{ background: "rgba(201,168,76,0.12)", color: DB_GOLD }}>
            {editableProfile.display_name.slice(0, 2).toUpperCase()}
          </div>
          <div>
            <p className="text-[12px]" style={{ color: "rgba(240,237,230,0.8)" }}>{editableProfile.display_name}</p>
            <p className="text-[9px] tracking-[0.2em] uppercase" style={{ color: "rgba(240,237,230,0.3)" }}>Jouw rooster — klik op een dag om tijdsloten toe te voegen</p>
          </div>
        </div>
      )}

      {/* Weekly grid with edit capability */}
      {loading || slots === null ? (
        <p className="text-[11px]" style={{ color: "rgba(240,237,230,0.25)" }}>Laden…</p>
      ) : (
        <div className="grid grid-cols-7 gap-2">
          {FULL.map((day, i) => {
            const daySlots = slots.filter(s => s.weekday === i && s.is_available);
            const isAdding = addingDay === i;
            return (
              <div key={day} className="p-3 rounded min-h-[120px] flex flex-col"
                style={{ background: daySlots.length ? "rgba(201,168,76,0.04)" : DB_SURFACE, border: `1px solid ${daySlots.length ? "rgba(201,168,76,0.2)" : DB_BORDER}` }}>
                <p className="text-[9px] tracking-[0.25em] uppercase mb-2"
                  style={{ color: daySlots.length ? DB_GOLD : "rgba(240,237,230,0.25)" }}>
                  {SHORT[i]}
                </p>
                <div className="flex-1 space-y-1">
                  {daySlots.map(s => (
                    <div key={s.id} className="group flex items-center justify-between text-[9px] px-1.5 py-1 rounded"
                      style={{ background: "rgba(201,168,76,0.08)", color: "rgba(240,237,230,0.6)" }}>
                      <span>{s.start_time.slice(0, 5)}–{s.end_time.slice(0, 5)}</span>
                      <button
                        onClick={() => handleDeleteSlot(s)}
                        disabled={deletingId === s.id}
                        className="opacity-0 group-hover:opacity-100 transition-opacity ml-1"
                        style={{ color: "#EF4444", fontSize: 10, lineHeight: 1 }}
                      >×</button>
                    </div>
                  ))}
                  {!daySlots.length && !isAdding && (
                    <div className="flex items-center justify-center mt-3">
                      <div className="w-1.5 h-1.5 rounded-full" style={{ background: "rgba(240,237,230,0.08)" }} />
                    </div>
                  )}
                </div>

                {/* Add slot inline */}
                {isAdding ? (
                  <div className="mt-2 space-y-1">
                    <input type="time" value={newStart} onChange={e => setNewStart(e.target.value)} style={inputSm} className="w-full" />
                    <input type="time" value={newEnd} onChange={e => setNewEnd(e.target.value)} style={inputSm} className="w-full" />
                    <div className="flex gap-1 mt-1">
                      <button onClick={() => handleAddSlot(i)} disabled={saving}
                        className="flex-1 py-1 rounded text-[9px] transition-colors"
                        style={{ background: "rgba(201,168,76,0.2)", color: DB_GOLD, border: `1px solid rgba(201,168,76,0.3)` }}>
                        {saving ? "…" : "✓"}
                      </button>
                      <button onClick={() => setAddingDay(null)}
                        className="flex-1 py-1 rounded text-[9px] transition-colors"
                        style={{ background: "rgba(240,237,230,0.04)", color: "rgba(240,237,230,0.4)", border: `1px solid rgba(240,237,230,0.08)` }}>
                        ✕
                      </button>
                    </div>
                  </div>
                ) : (
                  <button onClick={() => { setAddingDay(i); setNewStart("09:00"); setNewEnd("17:00"); }}
                    className="mt-2 w-full py-1 rounded text-[9px] transition-all opacity-40 hover:opacity-100"
                    style={{ border: `1px dashed rgba(201,168,76,0.25)`, color: DB_GOLD }}>
                    + Toevoegen
                  </button>
                )}
              </div>
            );
          })}
        </div>
      )}

      {/* Team overview matrix — admin only */}
      {isAdmin && (
        <div>
          <p className="text-[10px] tracking-[0.3em] uppercase mb-4" style={{ color: "rgba(240,237,230,0.3)" }}>
            Teamoverzicht
          </p>
          <div className="rounded overflow-hidden" style={{ border: `1px solid ${DB_BORDER}` }}>
            <table className="w-full text-[10px]" style={{ borderCollapse: "collapse" }}>
              <thead>
                <tr style={{ borderBottom: `1px solid ${DB_BORDER}`, background: "rgba(201,168,76,0.04)" }}>
                  <th className="text-left px-4 py-2.5 text-[9px] tracking-[0.3em] uppercase font-normal"
                    style={{ color: "rgba(240,237,230,0.3)" }}>Naam</th>
                  {SHORT.map(d => (
                    <th key={d} className="text-center px-2 py-2.5 text-[9px] tracking-[0.3em] uppercase font-normal"
                      style={{ color: "rgba(240,237,230,0.3)" }}>{d}</th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {profiles.map((p, pi) => (
                  <tr key={p.id} style={{ borderBottom: pi < profiles.length - 1 ? `1px solid rgba(201,168,76,0.06)` : "none" }}>
                    <td className="px-4 py-2.5" style={{ color: "rgba(240,237,230,0.65)" }}>{p.display_name}</td>
                    {[0, 1, 2, 3, 4, 5, 6].map(day => {
                      const avail = availability[p.id];
                      const has = avail?.some(s => s.weekday === day && s.is_available);
                      const unknown = !avail;
                      return (
                        <td key={day} className="px-2 py-2.5 text-center">
                          <div className="inline-block w-2 h-2 rounded-full"
                            style={{ background: unknown ? "rgba(240,237,230,0.06)" : has ? DB_GOLD : "rgba(240,237,230,0.08)" }} />
                        </td>
                      );
                    })}
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );
}

function ProfileCard({ profile, expanded = false }: { profile: Profile; expanded?: boolean }) {
  const initials = profile.display_name.slice(0, 2).toUpperCase();
  const roles = profile.user_roles?.map(r => r.role.name) ?? [];
  const programs = profile.user_programs?.map(p => p.program.name) ?? [];
  return (
    <div className="p-4 rounded" style={{ background: DB_SURFACE, border: `1px solid ${DB_BORDER}` }}>
      <div className="flex items-center gap-3 mb-3">
        <div className="w-9 h-9 rounded-full flex items-center justify-center shrink-0 font-display text-sm"
          style={{ background: "rgba(201,168,76,0.12)", color: DB_GOLD }}>
          {initials}
        </div>
        <div className="min-w-0">
          <p className="text-[12px] font-medium truncate" style={{ color: "rgba(240,237,230,0.85)" }}>{profile.display_name}</p>
          {profile.full_name && profile.full_name !== profile.display_name && (
            <p className="text-[10px] truncate" style={{ color: "rgba(240,237,230,0.3)" }}>{profile.full_name}</p>
          )}
        </div>
      </div>
      <div className="space-y-1.5">
        <div className="flex flex-wrap gap-1">
          {(expanded ? roles : roles.slice(0, 2)).map(r => (
            <span key={r} className="text-[9px] tracking-[0.2em] uppercase px-2 py-0.5 rounded-full"
              style={{ background: "rgba(201,168,76,0.08)", color: DB_GOLD }}>{r}</span>
          ))}
        </div>
        {expanded && programs.length > 0 && (
          <div className="flex flex-wrap gap-1">
            {programs.map(p => (
              <span key={p} className="text-[9px] tracking-[0.2em] uppercase px-2 py-0.5 rounded-full"
                style={{ background: "rgba(240,237,230,0.04)", color: "rgba(240,237,230,0.3)" }}>{p}</span>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

function BookingTable({ bookings }: { bookings: Booking[] }) {
  return (
    <div className="overflow-x-auto rounded" style={{ border: `1px solid ${DB_BORDER}` }}>
      <table className="w-full text-[11px]" style={{ borderCollapse: "collapse" }}>
        <thead>
          <tr style={{ borderBottom: `1px solid ${DB_BORDER}`, background: "rgba(201,168,76,0.04)" }}>
            {["Datum", "Artiest", "Studio", "Type", "Duur", "Status"].map(h => (
              <th key={h} className="text-left px-4 py-3 text-[9px] tracking-[0.3em] uppercase font-normal"
                style={{ color: "rgba(240,237,230,0.35)" }}>{h}</th>
            ))}
          </tr>
        </thead>
        <tbody>
          {bookings.map((b, i) => (
            <tr key={b.id} style={{ borderBottom: i < bookings.length - 1 ? `1px solid rgba(201,168,76,0.06)` : "none" }}>
              <td className="px-4 py-3" style={{ color: "rgba(240,237,230,0.6)" }}>{b.date}</td>
              <td className="px-4 py-3" style={{ color: "rgba(240,237,230,0.7)" }}>{b.artist?.display_name ?? "—"}</td>
              <td className="px-4 py-3" style={{ color: "rgba(240,237,230,0.5)" }}>{b.studio?.name ?? "—"}</td>
              <td className="px-4 py-3" style={{ color: "rgba(240,237,230,0.5)" }}>{b.booking_type?.name ?? "—"}</td>
              <td className="px-4 py-3" style={{ color: "rgba(240,237,230,0.5)" }}>{b.duration_hours}u</td>
              <td className="px-4 py-3">
                {b.status ? (
                  <span className="px-2 py-0.5 rounded text-[9px] tracking-[0.2em] uppercase"
                    style={{ background: `${b.status.color}18`, color: b.status.color }}>{b.status.name}</span>
                ) : "—"}
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

// ─── ROUTER ───────────────────────────────────────────────────────────────────

const router = createBrowserRouter([
  {
    path: "/",
    Component: Root,
    children: [
      { index: true, Component: HomePage },
      { path: "diensten", Component: DienstenPage },
    ],
  },
  {
    path: "/dashboard",
    Component: DashboardPage,
  },
]);

// ─── APP ──────────────────────────────────────────────────────────────────────

export default function App() {
  return (
    <AuthProvider>
      <RouterProvider router={router} />
    </AuthProvider>
  );
}
