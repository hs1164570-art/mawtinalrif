"use client";

import { useState } from "react";
// استيراد الأيقونات الرسمية والاحترافية من مكتبة react-icons
import { FaWhatsapp } from "react-icons/fa"; // لوجو الواتساب الرسمي
import { FiPhone, FiMail } from "react-icons/fi"; // أيقونات التليفون والإيميل بتصميم الـ Outline النظيف

export default function ContactSpeedDial() {
  const [isOpen, setIsOpen] = useState(false);

  // البيانات والأرقام الخاصة بك
  const phoneNumber = "+966532055715";
  const whatsappNumber = "966532055715";
  const emailAddress = "info@mawtinalriyf.com";

  return (
    <div className="fixed bottom-6 right-6 z-50 flex flex-col items-center gap-4">
      {/* القائمة الفرعية (تفتح وتغلق بسلاسة ونعومة) */}
      <div
        className={`flex flex-col items-center gap-3 transition-all duration-300 ease-out transform ${
          isOpen ?
            "opacity-100 translate-y-0 scale-100"
          : "opacity-0 translate-y-4 scale-75 pointer-events-none"
        }`}
      >
        {/* 1. زرار الإيميل الرسمي */}
        <a
          href={`mailto:${emailAddress}`}
          title="إرسال بريد إلكتروني"
          className="flex h-12 w-12 items-center justify-center rounded-full bg-white text-slate-600 shadow-md hover:bg-slate-50 transition-all hover:scale-110 border border-slate-100 hover:text-amber-700"
        >
          <FiMail className="w-5 h-5" />
        </a>

        {/* 2. زرار الواتساب باللوجو الرسمي */}
        <a
          href={`https://wa.me/${whatsappNumber}`}
          target="_blank"
          rel="noopener noreferrer"
          title="تواصل عبر الواتساب"
          className="flex h-12 w-12 items-center justify-center rounded-full bg-[#25D366] text-white shadow-md hover:bg-[#20ba5a] transition-all hover:scale-110"
        >
          <FaWhatsapp className="w-6 h-6" />
        </a>

        {/* 3. زرار الاتصال الهاتفي */}
        <a
          href={`tel:${phoneNumber}`}
          title="اتصال هاتفي"
          className="flex h-12 w-12 items-center justify-center rounded-full bg-blue-600 text-white shadow-md hover:bg-blue-700 transition-all hover:scale-110"
        >
          <FiPhone className="w-5 h-5" />
        </a>
      </div>

      {/* الزر الرئيسي بـ SVG مودرن وانسيابي لفقاعة محادثة شيك جداً */}
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="flex h-14 w-14 items-center justify-center rounded-full bg-[#D2B48C] text-[#4A3525] shadow-lg hover:bg-[#c4a47c] transition-all transform active:scale-95 z-50 border border-[#bfa37d]"
      >
        {
          isOpen ?
            // علامة الـ X عند فتح القائمة لشكل أنظف وأسهل للمستخدم
            <svg
              xmlns="http://www.w3.org/2000/svg"
              fill="none"
              viewBox="0 0 24 24"
              strokeWidth="2.5"
              stroke="currentColor"
              className="w-6 h-6"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                d="M6 18 18 6M6 6l12 12"
              />
            </svg>
            // الـ SVG المودرن الجديد لفقاعة الشات الانسيابية
          : <svg
              xmlns="http://www.w3.org/2000/svg"
              fill="none"
              viewBox="0 0 24 24"
              strokeWidth="2"
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
