"use client";

import { reportWhatsAppConversion } from "@/lib/gtag";
import { useState } from "react";
import { FaWhatsapp } from "react-icons/fa";
import { FiPhone, FiMail } from "react-icons/fi";

export default function ContactSpeedDial() {
  const [isOpen, setIsOpen] = useState(false);

  const phoneNumber = "+966557211359";
  const whatsappNumber = "966557211359";
  const emailAddress = "info@mawtinalriyf.com";

  return (
    <div
      className="fixed bottom-6 right-6 z-50 flex flex-col items-center gap-4"
      dir="rtl"
    >
      <div
        className={`flex flex-col items-center gap-3 transition-all duration-300 ease-[cubic-bezier(0.16,1,0.3,1)] transform origin-bottom motion-reduce:transition-none ${
          isOpen ?
            "opacity-100 translate-y-0 scale-100 pointer-events-auto"
          : "opacity-0 translate-y-4 scale-75 pointer-events-none"
        }`}
      >
        {/* 1. زرار الإيميل الرسمي */}
        <a
          href={`mailto:${emailAddress}`}
          title="إرسال بريد إلكتروني"
          onClick={() => reportWhatsAppConversion()}
          className="flex h-12 w-12 items-center justify-center rounded-full bg-[var(--surface)] text-[var(--text-2)] shadow-md hover:bg-[var(--bg-deep)] border border-[var(--border)] transition-all duration-200 hover:scale-110 hover:text-[var(--gold-mid)]"
        >
          <FiMail className="w-5 h-5" />
        </a>

        {/* 2. زرار الواتساب باللوجو الرسمي */}
        <a
          href={`https://wa.me/${whatsappNumber}`}
          target="_blank"
          rel="noopener noreferrer"
          title="تواصل عبر الواتساب"
          onClick={() => reportWhatsAppConversion()}
          className="flex h-12 w-12 items-center justify-center rounded-full bg-[#25D366] text-white shadow-md hover:bg-[#20ba5a] transition-all duration-200 hover:scale-110"
        >
          <FaWhatsapp className="w-6 h-6" />
        </a>

        {/* 3. زرار الاتصال الهاتفي */}
        <a
          href={`tel:${phoneNumber}`}
          title="اتصال هاتفي"
          onClick={() => reportWhatsAppConversion()}
          className="flex h-12 w-12 items-center justify-center rounded-full bg-[var(--text-2)] text-[var(--text-inv)] shadow-md hover:bg-[var(--text-1)] border border-[var(--border-strong)] transition-all duration-200 hover:scale-110"
        >
          <FiPhone className="w-5 h-5" />
        </a>
      </div>

      <button
        onClick={() => setIsOpen(!isOpen)}
        aria-expanded={isOpen}
        aria-label="قائمة وسائل الاتصال السريعة"
        className="flex h-14 w-14 items-center justify-center rounded-full bg-[var(--gold)] text-[var(--text-inv)] shadow-lg hover:bg-[var(--gold-mid)] transition-all duration-200 transform active:scale-95 z-50 border border-[var(--border-strong)]"
      >
        {isOpen ?
          <svg
            xmlns="http://www.w3.org/2000/svg"
            fill="none"
            viewBox="0 0 24 24"
            strokeWidth="2.5"
            stroke="currentColor"
            className="w-5 h-5 transition-transform duration-200 rotate-0 group-hover:rotate-90"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              d="M6 18 18 6M6 6l12 12"
            />
          </svg>
        : <svg
            xmlns="http://www.w3.org/2000/svg"
            fill="none"
            viewBox="0 0 24 24"
            strokeWidth="1.8"
            stroke="currentColor"
            className="w-6 h-6"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              d="M7.5 8.25h9m-9 3H12m-9.75 1.51c0 1.6 1.123 2.994 2.707 3.227 1.129.166 2.27.293 3.423.379.35.026.67.21.865.501L12 21l2.755-4.133a1.14 1.14 0 0 1 .865-.501c1.153-.086 2.294-.213 3.423-.379 1.584-.233 2.707-1.626 2.707-3.228V6.741c0-1.602-1.123-2.995-2.707-3.228A48.394 48.394 0 0 0 12 3c-2.392 0-4.744.175-7.043.513C3.373 3.746 2.25 5.14 2.25 6.741v6.018Z"
            />
          </svg>
        }
      </button>
    </div>
  );
}
