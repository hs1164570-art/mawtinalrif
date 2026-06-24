"use client";
// components/consultation/ConsultationClient.tsx
// All interactive sections live here as small focused functions.
// react-hook-form + zod handle the form; framer-motion handles animations.

import { useRef, useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { motion, useInView, AnimatePresence } from "framer-motion";
import {
  FaWhatsapp,
  FaPhone,
  FaCheck,
  FaTruck,
  FaShieldAlt,
  FaStar,
  FaHeart,
  FaAward,
} from "react-icons/fa";
import { HiSparkles, HiCheckCircle, HiArrowSmLeft } from "react-icons/hi";
import { MdDesignServices, MdSupportAgent, MdPriceCheck } from "react-icons/md";
import { BsStars, BsGem } from "react-icons/bs";
import { submitConsultation } from "../actions/contact.action";

// ─── Colour tokens ─────────────────────────────────────────────────────────────
const C = {
  gold: "var(--cyan)",
  goldLight: "var(--cyan-bright)",
  goldBg: "var(--cyan-bg)",
  goldBorder: "var(--cyan-bg)",
  dark: "var(--gold)",
  darkMid: "var(--gold-mid)",
  ivory: "var(--bg)",
  ivoryDeep: "var(--bg-deep)",
  beige: "var(--surface-2)",
  text: "var(--text-1)",
  textMid: "var(--text-2)",
  textLight: "var(--text-3)",
  surface: "var(--surface)",
} as const;

// ─── Zod schema ────────────────────────────────────────────────────────────────
const schema = z.object({
  name: z.string().min(2, "الاسم مطلوب"),
  phone: z
    .string()
    .regex(/^05\d{8}$/, "رقم الجوال غير صحيح — يجب أن يبدأ بـ 05"),
  details: z.enum(["التفاصيل عن التواصل", "كتابة التفاصيل"]),
  desc: z.string().optional(),
});
type FormValues = z.infer<typeof schema>;

// ─── Animation variants ────────────────────────────────────────────────────────
const fadeUp = {
  hidden: { opacity: 0, y: 36 },
  visible: {
    opacity: 1,
    y: 0,
    transition: { duration: 0.7, ease: [0.22, 1, 0.36, 1] },
  },
};
const fadeIn = {
  hidden: { opacity: 0 },
  visible: { opacity: 1, transition: { duration: 0.6 } },
};
const scaleUp = {
  hidden: { opacity: 0, scale: 0.92 },
  visible: {
    opacity: 1,
    scale: 1,
    transition: { duration: 0.55, ease: [0.22, 1, 0.36, 1] },
  },
};
const stagger = { visible: { transition: { staggerChildren: 0.12 } } };

// ─── Shared hover helpers (inline style mutations — avoids re-renders) ─────────
const hoverLift = (
  el: HTMLElement,
  enter: boolean,
  shadow = "var(--shadow-md)",
  border = C.gold,
) => {
  el.style.transform = enter ? "translateY(-6px)" : "translateY(0)";
  el.style.boxShadow = enter ? shadow : "var(--shadow-sm)";
  el.style.borderColor = enter ? border : C.goldBorder;
};

// ─── Scroll-triggered section wrapper ─────────────────────────────────────────
function Reveal({
  children,
  className = "",
  delay = 0,
}: {
  children: React.ReactNode;
  className?: string;
  delay?: number;
}) {
  const ref = useRef(null);
  const seen = useInView(ref, { once: true, margin: "-80px" });
  return (
    <motion.div
      ref={ref}
      variants={fadeUp}
      initial="hidden"
      animate={seen ? "visible" : "hidden"}
      transition={{ delay }}
      className={className}
    >
      {children}
    </motion.div>
  );
}

// ─── Section heading ───────────────────────────────────────────────────────────
function Heading({
  eyebrow,
  title,
  subtitle,
  light = false,
}: {
  eyebrow: string;
  title: string;
  subtitle?: string;
  light?: boolean;
}) {
  return (
    <div className="text-center mb-12 md:mb-16">
      <div className="flex items-center justify-center gap-3 mb-4">
        <span
          style={{
            width: 32,
            height: 1,
            background: `linear-gradient(90deg,${C.gold},transparent)`,
          }}
        />
        <span
          style={{
            color: C.gold,
            fontSize: 11,
            fontWeight: 700,
            letterSpacing: "3px",
            textTransform: "uppercase",
          }}
        >
          {eyebrow}
        </span>
        <span
          style={{
            width: 32,
            height: 1,
            background: `linear-gradient(270deg,${C.gold},transparent)`,
          }}
        />
      </div>
      <h2
        className="text-3xl md:text-4xl font-light leading-snug"
        style={{
          color: light ? "var(--text-inv)" : C.darkMid,
          letterSpacing: "-0.5px",
        }}
      >
        {title}
      </h2>
      {subtitle && (
        <p
          className="mt-4 text-base leading-relaxed max-w-xl mx-auto"
          style={{ color: light ? "var(--text-inv)" : C.textMid }}
        >
          {subtitle}
        </p>
      )}
    </div>
  );
}

// ══════════════════════════════════════════════════════════════════════════════
// 1. HERO
// ══════════════════════════════════════════════════════════════════════════════
function Hero() {
  return (
    <section
      className="relative min-h-screen flex items-center justify-center overflow-hidden"
      style={{
        direction: "rtl",
        background: `linear-gradient(165deg,${C.dark} 0%,${C.darkMid} 50%,${C.dark} 100%)`,
      }}
    >
      {/* Corner ornaments */}
      {(["top-8 right-8", "bottom-8 left-8"] as const).map((pos, i) => (
        <div key={pos} className={`absolute ${pos} opacity-30 hidden md:block`}>
          {[0, 1].map((j) => (
            <div
              key={j}
              style={{
                width: 60 - j * 20,
                height: 60 - j * 20,
                position: "absolute",
                ...(i === 0 ?
                  {
                    borderTop: `1px solid ${C.gold}`,
                    borderRight: `1px solid ${C.gold}`,
                    top: j * 8,
                    right: j * 8,
                  }
                : {
                    borderBottom: `1px solid ${C.gold}`,
                    borderLeft: `1px solid ${C.gold}`,
                    bottom: j * 8,
                    left: j * 8,
                  }),
              }}
            />
          ))}
        </div>
      ))}

      <div className="relative z-10 w-full max-w-4xl mx-auto px-6 text-center">
        <motion.div
          variants={fadeIn}
          initial="hidden"
          animate="visible"
          className="inline-flex items-center gap-2 mb-8"
          style={{
            background: C.goldBg,
            border: `1px solid ${C.goldBorder}`,
            borderRadius: 100,
            padding: "8px 22px",
          }}
        >
          <BsStars style={{ color: C.gold, fontSize: 14 }} />
          <span
            style={{
              color: C.gold,
              fontSize: 12,
              fontWeight: 700,
              letterSpacing: "2px",
            }}
          >
            استشارة مجانية • بدون التزام
          </span>
          <BsStars style={{ color: C.gold, fontSize: 14 }} />
        </motion.div>

        <motion.h1
          variants={fadeUp}
          initial="hidden"
          animate="visible"
          className="text-4xl md:text-6xl lg:text-7xl font-light leading-tight mb-6"
          style={{ color: "var(--text-inv)", letterSpacing: "-1px" }}
        >
          حوّل رؤيتك إلى{" "}
          <span
            style={{
              background: `linear-gradient(135deg,${C.goldLight},${C.gold})`,
              WebkitBackgroundClip: "text",
              WebkitTextFillColor: "transparent",
              fontWeight: 500,
            }}
          >
            مساحة استثنائية
          </span>
        </motion.h1>

        <motion.div
          variants={fadeIn}
          initial="hidden"
          animate="visible"
          transition={{ delay: 0.3 }}
          style={{
            width: 64,
            height: 1,
            background: `linear-gradient(90deg,transparent,${C.gold},transparent)`,
            margin: "0 auto 28px",
          }}
        />

        <motion.p
          variants={fadeUp}
          initial="hidden"
          animate="visible"
          transition={{ delay: 0.35 }}
          className="text-lg md:text-xl leading-loose max-w-2xl mx-auto mb-10"
          style={{ color: "var(--text-inv)" }}
        >
          احجز استشارتك المجانية مع خبرائنا في الأثاث والتصميم الداخلي، ودعنا
          نساعدك في اختيار الحلول المثالية لمنزلك أو مشروعك.
        </motion.p>

        <motion.div
          variants={scaleUp}
          initial="hidden"
          animate="visible"
          transition={{ delay: 0.5 }}
        >
          <a
            href="#book"
            className="inline-flex items-center gap-3 group"
            style={{
              background: `linear-gradient(135deg,${C.gold},${C.goldLight})`,
              color: "var(--text-inv)",
              fontWeight: 700,
              fontSize: 16,
              padding: "18px 44px",
              borderRadius: 14,
              textDecoration: "none",
              letterSpacing: "0.5px",
              boxShadow: "var(--shadow-md)",
              transition: "all 0.3s ease",
            }}
            onMouseEnter={(e) => {
              const el = e.currentTarget;
              el.style.transform = "translateY(-3px)";
              el.style.boxShadow = "var(--shadow-md)";
            }}
            onMouseLeave={(e) => {
              const el = e.currentTarget;
              el.style.transform = "translateY(0)";
              el.style.boxShadow = "var(--shadow-md)";
            }}
          >
            <HiSparkles style={{ fontSize: 20 }} />
            احجز استشارتك الآن
            <HiArrowSmLeft
              style={{ fontSize: 20 }}
              className="group-hover:-translate-x-1 transition-transform duration-300"
            />
          </a>
        </motion.div>

        <motion.div
          variants={fadeIn}
          initial="hidden"
          animate="visible"
          transition={{ delay: 0.7 }}
          className="flex items-center justify-center gap-6 mt-12 flex-wrap"
        >
          {["مجاناً وبدون التزام", "رد خلال ساعة", "+500 مشروع مكتمل"].map(
            (label) => (
              <div key={label} className="flex items-center gap-2">
                <FaCheck style={{ color: C.gold, fontSize: 12 }} />
                <span style={{ color: "var(--text-inv)", fontSize: 13 }}>
                  {label}
                </span>
              </div>
            ),
          )}
        </motion.div>
      </div>

      <motion.div
        animate={{ y: [0, 8, 0] }}
        transition={{ repeat: Infinity, duration: 1.8 }}
        className="absolute bottom-8 left-1/2 -translate-x-1/2 opacity-40"
      >
        <div
          style={{
            width: 1,
            height: 40,
            background: `linear-gradient(180deg,transparent,${C.gold})`,
          }}
        />
      </motion.div>
    </section>
  );
}

// ══════════════════════════════════════════════════════════════════════════════
// 2. TRUST / STATS
// ══════════════════════════════════════════════════════════════════════════════
const STATS = [
  {
    number: "+500",
    label: "مشروع مكتمل",
    Icon: BsGem,
    desc: "من فلل ومجمعات ومشاريع تجارية",
  },
  {
    number: "+100",
    label: "عميل سعيد",
    Icon: FaHeart,
    desc: "أسر سعيدة تسكن أحلامها",
  },
  {
    number: "+20",
    label: "سنوات خبرة",
    Icon: FaAward,
    desc: "خبرة راسخة في السوق السعودي",
  },
];

function Trust() {
  return (
    <section
      className="py-20 md:py-28"
      style={{
        background: `linear-gradient(180deg,${C.ivory} 0%,${C.surface} 100%)`,
        direction: "rtl",
      }}
    >
      <div className="max-w-5xl mx-auto px-6">
        <Reveal>
          <Heading
            eyebrow="أرقام تتحدث"
            title="ثقة آلاف العملاء خير شاهد"
            subtitle="لأن كل مشروع نفذناه كان أكثر من مجرد أثاث — كان حلماً أصبح واقعاً"
          />
        </Reveal>
        <motion.div
          variants={stagger}
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true, margin: "-60px" }}
          className="grid grid-cols-1 md:grid-cols-3 gap-6"
        >
          {STATS.map(({ number, label, Icon, desc }) => (
            <motion.div
              key={label}
              variants={scaleUp}
              className="relative text-center p-8 rounded-2xl"
              style={{
                background: C.surface,
                border: `1px solid ${C.goldBorder}`,
                boxShadow: "var(--shadow-sm)",
                transition: "all 0.35s ease",
              }}
              onMouseEnter={(e) => hoverLift(e.currentTarget, true)}
              onMouseLeave={(e) => hoverLift(e.currentTarget, false)}
            >
              <div
                className="inline-flex items-center justify-center w-14 h-14 rounded-full mb-5"
                style={{
                  background: C.goldBg,
                  border: `1px solid ${C.goldBorder}`,
                }}
              >
                <Icon style={{ color: C.gold, fontSize: 22 }} />
              </div>
              <div
                className="text-5xl font-light mb-2"
                style={{
                  background: `linear-gradient(135deg,${C.gold},${C.goldLight})`,
                  WebkitBackgroundClip: "text",
                  WebkitTextFillColor: "transparent",
                  letterSpacing: "-1px",
                }}
              >
                {number}
              </div>
              <div
                className="text-lg font-semibold mb-2"
                style={{ color: C.darkMid }}
              >
                {label}
              </div>
              <p
                className="text-sm"
                style={{ color: C.textLight, lineHeight: 1.7 }}
              >
                {desc}
              </p>
              <div
                className="absolute bottom-0 right-0 left-0 h-px rounded-b-2xl"
                style={{
                  background: `linear-gradient(90deg,transparent,${C.gold},transparent)`,
                  opacity: 0.5,
                }}
              />
            </motion.div>
          ))}
        </motion.div>
      </div>
    </section>
  );
}

// ══════════════════════════════════════════════════════════════════════════════
// 3. CONSULTATION FORM (react-hook-form + zod)
// ══════════════════════════════════════════════════════════════════════════════
function BookingForm() {
  const {
    register,
    handleSubmit,
    watch,
    reset,
    formState: { errors, isSubmitting },
  } = useForm<FormValues>({
    resolver: zodResolver(schema),
    defaultValues: { details: "التفاصيل عن التواصل" },
  });
  const [srvErr, setSrvErr] = useState<string | null>(null);
  const [done, setDone] = useState(false);

  const showDesc = watch("details") === "كتابة التفاصيل";

  const inputBase: React.CSSProperties = {
    width: "100%",
    background: "var(--bg)",
    border: "1px solid var(--border-md)",
    borderRadius: 12,
    padding: "14px 18px",
    color: "var(--text-inv)",
    fontSize: 15,
    outline: "none",
    transition: "all 0.25s ease",
    fontFamily: "inherit",
    direction: "rtl",
  };
  const labelStyle: React.CSSProperties = {
    display: "block",
    color: "var(--text-inv)",
    fontSize: 12,
    fontWeight: 600,
    letterSpacing: "1.5px",
    marginBottom: 8,
  };
  const focusIn = (
    e: React.FocusEvent<
      HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement
    >,
  ) => {
    e.target.style.borderColor = C.gold;
    e.target.style.boxShadow = `0 0 0 3px ${C.goldBg}`;
    e.target.style.background = C.goldBg;
  };
  const focusOut = (
    e: React.FocusEvent<
      HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement
    >,
  ) => {
    e.target.style.borderColor = "var(--border-md)";
    e.target.style.boxShadow = "none";
    e.target.style.background = "var(--bg)";
  };

  if (done) {
    return (
      <motion.div
        initial={{ opacity: 0, scale: 0.92 }}
        animate={{ opacity: 1, scale: 1 }}
        className="text-center py-14 px-6 rounded-2xl"
        style={{ background: C.goldBg, border: `1px solid ${C.goldBorder}` }}
      >
        <div
          className="inline-flex items-center justify-center w-20 h-20 rounded-full mb-6"
          style={{
            background: C.goldBg,
            border: `1px solid ${C.goldBorder}`,
          }}
        >
          <HiCheckCircle style={{ color: C.gold, fontSize: 40 }} />
        </div>
        <h3
          className="text-2xl font-semibold mb-3"
          style={{ color: "var(--text-inv)" }}
        >
          وصل طلبك بنجاح! ✨
        </h3>
        <p
          className="text-base leading-loose mb-6"
          style={{
            color: "var(--text-inv)",
            maxWidth: 400,
            margin: "0 auto 24px",
          }}
        >
          شكراً لك على ثقتك! سيتواصل معك أحد مستشارينا خلال{" "}
          <strong style={{ color: C.gold }}>ساعة أو أقل</strong>. 🏡
        </p>
        <a
          href="https://wa.me/966557211359"
          target="_blank"
          rel="noopener noreferrer"
          className="inline-flex items-center gap-2 px-8 py-3 rounded-xl font-semibold text-sm"
          style={{
            background: C.gold,
            color: "var(--text-inv)",
            textDecoration: "none",
          }}
        >
          <FaWhatsapp style={{ fontSize: 18 }} />
          تواصل معنا الآن عبر واتساب
        </a>
      </motion.div>
    );
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: 24 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true }}
      transition={{ duration: 0.6, ease: [0.22, 1, 0.36, 1] }}
      className="rounded-2xl p-8 md:p-10"
      style={{
        background: C.darkMid,
        border: "1px solid var(--border-md)",
      }}
    >
      <div className="mb-8">
        <h3
          className="text-xl font-semibold mb-2"
          style={{ color: "var(--text-inv)" }}
        >
          أرسل طلب الاستشارة
        </h3>
        <p
          className="text-sm"
          style={{ color: "var(--text-inv)", lineHeight: 1.7 }}
        >
          أخبرنا عن نفسك وسنتواصل معك في أقرب وقت — منزلك يستحق الأفضل 💛
        </p>
      </div>

      <form
        onSubmit={handleSubmit(async (data) => {
          setSrvErr(null);
          const fd = new FormData();
          Object.entries(data).forEach(([k, v]) => v && fd.append(k, v));
          const res = await submitConsultation(fd);
          if (res.success) {
            setDone(true);
            reset();
          } else setSrvErr(res.error ?? "حدث خطأ، حاول مرة أخرى");
        })}
        className="space-y-5"
      >
        {/* Name */}
        <div>
          <label style={labelStyle}>الاسم الكريم *</label>
          <input
            {...register("name")}
            type="text"
            placeholder="ما اسمك؟"
            style={inputBase}
            onFocus={focusIn}
            onBlur={focusOut}
          />
          {errors.name && (
            <p className="mt-1 text-xs" style={{ color: "var(--red)" }}>
              {errors.name.message}
            </p>
          )}
        </div>

        {/* Phone */}
        <div>
          <label style={labelStyle}>رقم الجوال *</label>
          <input
            {...register("phone")}
            type="tel"
            placeholder="05X XXX XXXX"
            style={{ ...inputBase, direction: "ltr", textAlign: "right" }}
            onFocus={focusIn}
            onBlur={focusOut}
          />
          {errors.phone && (
            <p className="mt-1 text-xs" style={{ color: "var(--red)" }}>
              {errors.phone.message}
            </p>
          )}
        </div>

        {/* Type select */}
        <div>
          <label style={labelStyle}>ماذا تريد؟ *</label>
          <select
            {...register("details")}
            style={{
              ...inputBase,
              cursor: "pointer",
              appearance: "none",
              backgroundImage: `url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='12' height='8' viewBox='0 0 12 8'%3E%3Cpath d='M1 1l5 5 5-5' stroke='%230ea5e9' stroke-width='1.5' fill='none'/%3E%3C/svg%3E")`,
              backgroundRepeat: "no-repeat",
              backgroundPosition: "left 16px center",
              paddingLeft: 40,
            }}
            onFocus={focusIn}
            onBlur={focusOut}
          >
            <option
              value="التفاصيل عن التواصل"
              style={{ background: C.dark, color: "var(--text-inv)" }}
            >
              📞 أريد أن يتواصل معي الفريق مباشرة
            </option>
            <option
              value="كتابة التفاصيل"
              style={{ background: C.dark, color: "var(--text-inv)" }}
            >
              📝 أريد كتابة تفاصيل طلبي
            </option>
          </select>
        </div>

        {/* Conditional textarea */}
        <AnimatePresence>
          {showDesc && (
            <motion.div
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: "auto" }}
              exit={{ opacity: 0, height: 0 }}
              transition={{ duration: 0.3 }}
              style={{ overflow: "hidden" }}
            >
              <label style={labelStyle}>أخبرنا أكثر 💬</label>
              <textarea
                {...register("desc")}
                rows={4}
                placeholder="صِف لنا مساحتك، ذوقك، وما تحلم به... 🏡"
                style={{ ...inputBase, resize: "vertical", minHeight: 110 }}
                onFocus={focusIn}
                onBlur={focusOut}
              />
            </motion.div>
          )}
        </AnimatePresence>

        {/* Server error */}
        {srvErr && (
          <div
            className="flex items-center gap-3 p-4 rounded-xl text-sm"
            style={{
              background: "var(--bg)",
              border: "1px solid var(--red)",
              color: "var(--red)",
            }}
          >
            <span>⚠️</span> {srvErr}
          </div>
        )}

        {/* Submit */}
        <button
          type="submit"
          disabled={isSubmitting}
          className="w-full flex items-center justify-center gap-3 font-bold text-base rounded-xl"
          style={{
            background:
              isSubmitting ?
                C.goldBg
              : `linear-gradient(135deg,${C.gold},${C.goldLight})`,
            color: "var(--text-inv)",
            padding: "16px 32px",
            border: "none",
            cursor: isSubmitting ? "not-allowed" : "pointer",
            transition: "all 0.3s ease",
            letterSpacing: "0.5px",
            boxShadow: isSubmitting ? "none" : "var(--shadow-md)",
          }}
          onMouseEnter={(e) => {
            if (!isSubmitting) {
              e.currentTarget.style.transform = "translateY(-2px)";
              e.currentTarget.style.boxShadow = "var(--shadow-md)";
            }
          }}
          onMouseLeave={(e) => {
            e.currentTarget.style.transform = "translateY(0)";
            e.currentTarget.style.boxShadow = "var(--shadow-md)";
          }}
        >
          {isSubmitting ?
            <>
              <svg
                className="animate-spin"
                width="18"
                height="18"
                viewBox="0 0 24 24"
                fill="none"
              >
                <circle
                  cx="12"
                  cy="12"
                  r="10"
                  stroke="currentColor"
                  strokeWidth="3"
                  strokeDasharray="32"
                  strokeLinecap="round"
                />
              </svg>{" "}
              جارٍ إرسال طلبك...
            </>
          : <>
              <HiSparkles style={{ fontSize: 20 }} /> أرسل طلب الاستشارة
            </>
          }
        </button>

        <p
          className="text-xs text-center"
          style={{ color: "var(--text-inv)", lineHeight: 1.8 }}
        >
          🔒 بياناتك آمنة ومحمية تماماً · لن نشاركها مع أي جهة
        </p>
      </form>
    </motion.div>
  );
}

// ══════════════════════════════════════════════════════════════════════════════
// 4. CONTACT  (WhatsApp + Phone + Form)
// ══════════════════════════════════════════════════════════════════════════════
function Contact() {
  return (
    <section
      id="book"
      className="py-20 md:py-24"
      style={{
        background: `linear-gradient(160deg,${C.dark} 0%,${C.darkMid} 50%,${C.dark} 100%)`,
        direction: "rtl",
      }}
    >
      <div className="max-w-4xl mx-auto px-6">
        <Reveal>
          <Heading
            eyebrow="تواصل معنا"
            title="تواصل معنا مباشرة"
            subtitle="فريقنا جاهز للإجابة على استفساراتك ومساعدتك في اختيار أفضل الحلول التي تجمع بين الفخامة والراحة والجودة بأسعار تنافسية."
            light
          />
        </Reveal>

        <motion.div
          variants={stagger}
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true }}
          className="grid grid-cols-1 sm:grid-cols-2 gap-5 mb-10"
        >
          {[
            {
              href: "https://wa.me/966557211359",
              Icon: FaWhatsapp,
              iconColor: C.gold,
              bg: C.goldBg,
              border: C.goldBorder,
              label: "واتساب",
              sub: "ردّ فوري • متاح 24/7",
            },
            {
              href: "tel:+966557211359",
              Icon: FaPhone,
              iconColor: C.gold,
              bg: C.goldBg,
              border: C.goldBorder,
              label: "اتصال مباشر",
              sub: "من السبت إلى الخميس • ٩ص – ١٠م",
            },
          ].map(({ href, Icon, iconColor, bg, border, label, sub }) => (
            <motion.a
              key={label}
              variants={scaleUp}
              href={href}
              target={href.startsWith("http") ? "_blank" : undefined}
              rel="noopener noreferrer"
              className="flex items-center gap-5 p-6 rounded-2xl no-underline"
              style={{
                background: bg,
                border: `1px solid ${border}`,
                transition: "all 0.3s ease",
                textDecoration: "none",
              }}
              whileHover={{ scale: 1.02, transition: { duration: 0.2 } }}
            >
              <div
                className="flex-shrink-0 w-14 h-14 rounded-xl flex items-center justify-center"
                style={{ background: bg }}
              >
                <Icon style={{ color: iconColor, fontSize: 26 }} />
              </div>
              <div>
                <div
                  className="text-xs font-semibold mb-1"
                  style={{
                    color: "var(--text-inv)",
                    letterSpacing: "2px",
                  }}
                >
                  {label}
                </div>
                <div
                  className="text-xl font-bold"
                  style={{
                    color: "var(--text-inv)",
                    letterSpacing: "1px",
                    direction: "ltr",
                  }}
                >
                  +966 55 721 1359
                </div>
                <div
                  className="text-xs mt-1"
                  style={{ color: "var(--text-inv)" }}
                >
                  {sub}
                </div>
              </div>
            </motion.a>
          ))}
        </motion.div>

        <div className="flex items-center gap-4 mb-10">
          <div
            className="flex-1 h-px"
            style={{ background: "var(--border-md)" }}
          />
          <span
            className="text-sm px-5 py-2 rounded-full"
            style={{
              color: C.gold,
              background: C.goldBg,
              border: `1px solid ${C.goldBorder}`,
              letterSpacing: "1px",
            }}
          >
            أو أرسل طلبك
          </span>
          <div
            className="flex-1 h-px"
            style={{ background: "var(--border-md)" }}
          />
        </div>

        <BookingForm />
      </div>
    </section>
  );
}

// ══════════════════════════════════════════════════════════════════════════════
// 5. WHY CHOOSE US
// ══════════════════════════════════════════════════════════════════════════════
const FEATURES = [
  {
    Icon: MdDesignServices,
    title: "تصاميم عصرية وفاخرة",
    desc: "نجمع بين الأناقة الراقية والوظيفة العملية لتناسب أسلوب حياتك.",
  },
  {
    Icon: BsGem,
    title: "جودة تصنيع عالية",
    desc: "خامات ومواد تحمل معايير دولية، تدوم طويلاً وتبقى جميلة.",
  },
  {
    Icon: FaAward,
    title: "تنفيذ احترافي",
    desc: "فريق متخصص يُنفّذ كل تفصيل بدقة ويلتزم بالمواعيد.",
  },
  {
    Icon: MdSupportAgent,
    title: "دعم ومتابعة مستمر",
    desc: "لا نختفي بعد التسليم — نحن دائماً هنا لخدمتك.",
  },
  {
    Icon: MdPriceCheck,
    title: "أسعار تنافسية",
    desc: "فخامة حقيقية بأسعار منطقية — لأن الجودة لا تعني دفع الزيادة.",
  },
  {
    Icon: FaTruck,
    title: "توصيل سريع وآمن",
    desc: "نوصل طلبك في الوقت المحدد مع ضمان سلامة كل قطعة.",
  },
];

function WhyUs() {
  return (
    <section
      className="py-20 md:py-28"
      style={{
        background: `linear-gradient(180deg,${C.surface} 0%,${C.ivory} 100%)`,
        direction: "rtl",
      }}
    >
      <div className="max-w-6xl mx-auto px-6">
        <Reveal>
          <Heading
            eyebrow="لماذا نحن"
            title="ما يميّزنا يجعلك تختارنا"
            subtitle="من التصميم إلى التسليم — نحرص على كل تفصيلة لأن منزلك يستحق لا شيء أقل من المثالية"
          />
        </Reveal>
        <motion.div
          variants={stagger}
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true, margin: "-50px" }}
          className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6"
        >
          {FEATURES.map(({ Icon, title, desc }) => (
            <motion.div
              key={title}
              variants={fadeUp}
              className="p-7 rounded-2xl relative overflow-hidden"
              style={{
                background: C.surface,
                border: `1px solid ${C.goldBorder}`,
                boxShadow: "var(--shadow-sm)",
                transition: "all 0.35s ease",
              }}
              onMouseEnter={(e) =>
                hoverLift(e.currentTarget, true, "var(--shadow-md)")
              }
              onMouseLeave={(e) =>
                hoverLift(e.currentTarget, false, "var(--shadow-md)")
              }
            >
              <div
                className="absolute inset-0 opacity-0 hover:opacity-100 transition-opacity duration-500 pointer-events-none"
                style={{
                  background: C.goldBg,
                }}
              />
              <div className="relative">
                <div
                  className="inline-flex items-center justify-center w-12 h-12 rounded-xl mb-5"
                  style={{
                    background: C.goldBg,
                    border: `1px solid ${C.goldBorder}`,
                  }}
                >
                  <Icon style={{ color: C.gold, fontSize: 20 }} />
                </div>
                <h3
                  className="text-base font-bold mb-2"
                  style={{ color: C.darkMid }}
                >
                  {title}
                </h3>
                <p
                  className="text-sm leading-relaxed"
                  style={{ color: C.textMid }}
                >
                  {desc}
                </p>
              </div>
            </motion.div>
          ))}
        </motion.div>
      </div>
    </section>
  );
}

// ══════════════════════════════════════════════════════════════════════════════
// 6. FINAL CTA
// ══════════════════════════════════════════════════════════════════════════════
function FinalCTA() {
  return (
    <section
      className="py-24 md:py-32 relative overflow-hidden"
      style={{
        background: `linear-gradient(145deg,${C.dark} 0%,${C.darkMid} 50%,${C.dark} 100%)`,
        direction: "rtl",
      }}
    >
      <div className="relative z-10 max-w-2xl mx-auto px-6 text-center">
        <Reveal>
          <div
            style={{
              width: 56,
              height: 1,
              background: `linear-gradient(90deg,transparent,${C.gold},transparent)`,
              margin: "0 auto 28px",
            }}
          />
          <h2
            className="text-3xl md:text-5xl font-light mb-6 leading-tight"
            style={{ color: "var(--text-inv)", letterSpacing: "-0.5px" }}
          >
            ابدأ رحلة تصميم{" "}
            <span
              style={{
                background: `linear-gradient(135deg,${C.goldLight},${C.gold})`,
                WebkitBackgroundClip: "text",
                WebkitTextFillColor: "transparent",
                fontWeight: 500,
              }}
            >
              مساحتك المثالية
            </span>{" "}
            اليوم
          </h2>
          <p
            className="text-base md:text-lg leading-loose mb-10"
            style={{ color: "var(--text-inv)" }}
          >
            احجز استشارتك الآن واكتشف كيف يمكننا تحويل أفكارك إلى واقع يجمع بين
            الجمال والوظيفة.
          </p>

          <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
            <a
              href="#book"
              className="inline-flex items-center gap-3 font-bold text-base rounded-xl w-full sm:w-auto justify-center"
              style={{
                background: `linear-gradient(135deg,${C.gold},${C.goldLight})`,
                color: "var(--text-inv)",
                padding: "17px 40px",
                textDecoration: "none",
                boxShadow: "var(--shadow-md)",
                transition: "all 0.3s ease",
              }}
              onMouseEnter={(e) => {
                e.currentTarget.style.transform = "translateY(-3px)";
                e.currentTarget.style.boxShadow = "var(--shadow-md)";
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.transform = "translateY(0)";
                e.currentTarget.style.boxShadow = "var(--shadow-md)";
              }}
            >
              <HiSparkles style={{ fontSize: 20 }} /> احجز استشارة مجانية
            </a>
            <a
              href="https://wa.me/966557211359"
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-3 font-semibold text-base rounded-xl w-full sm:w-auto justify-center"
              style={{
                background: C.goldBg,
                color: "var(--text-inv)",
                padding: "17px 40px",
                textDecoration: "none",
                border: `1px solid ${C.goldBorder}`,
                transition: "all 0.3s ease",
              }}
              onMouseEnter={(e) => {
                e.currentTarget.style.background = C.goldBorder;
                e.currentTarget.style.transform = "translateY(-3px)";
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.background = C.goldBg;
                e.currentTarget.style.transform = "translateY(0)";
              }}
            >
              <FaWhatsapp style={{ fontSize: 22 }} /> تواصل عبر واتساب
            </a>
          </div>

          <div className="mt-10 flex items-center justify-center gap-2">
            <FaStar style={{ color: C.gold, fontSize: 12 }} />
            <span style={{ color: "var(--text-inv)", fontSize: 13 }}>
              فريقنا يرد في غضون{" "}
              <strong style={{ color: C.gold }}>ساعة أو أقل</strong> — لأنك
              تستحق الاهتمام الفوري
            </span>
            <FaStar style={{ color: C.gold, fontSize: 12 }} />
          </div>
          <div
            style={{
              width: 56,
              height: 1,
              background: `linear-gradient(90deg,transparent,${C.gold},transparent)`,
              margin: "28px auto 0",
            }}
          />
        </Reveal>
      </div>
    </section>
  );
}

// ══════════════════════════════════════════════════════════════════════════════
// ROOT CLIENT EXPORT — composes all sections
// ══════════════════════════════════════════════════════════════════════════════
export function ConsultationClient() {
  return (
    <main dir="rtl" lang="ar" className="overflow-x-hidden">
      <Hero />
      <Contact />
      <Trust />
      <WhyUs />
      <FinalCTA />
    </main>
  );
}
