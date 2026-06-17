"use client";
import React, { useState } from "react";

// تعريف نوع البيانات لكل سؤال
interface FaqItem {
  id: number;
  question: string;
  answer: string;
}

export default function FaqSection() {
  // حالة لتخزين رقم السؤال المفتوح حالياً (null يعني الكل مغلق)
  const [activeId, setActiveId] = useState<number | null>(null);

  // بيانات الأسئلة (مباشرة وبدون فئات)
  const faqData: FaqItem[] = [
    {
      id: 1,
      question: "هل توفرون خدمة تخصيص مقاسات الأثاث والمطابخ؟",
      answer:
        "بالتأكيد. نحن نؤمن بأن كل مساحة ولها خصوصيتها؛ لذلك نتيح لعملائنا النخبة خدمة تعديل المقاسات، واختيار أنواع الأخشاب الفاخرة، وألوان الأقمشة بما يتناسب تماماً مع المخطط الهندسي لمنزلك تحت إشراف مهندسي الديكور لدينا.",
    },
    {
      id: 2,
      question: "ما هي أنواع الأخشاب المستخدمة في صناعة القطع؟",
      answer:
        "نعتمد بالكامل على أجود أنواع الأخشاب الطبيعية الصلبة مثل خشب الزان الروماني، الجوز الأمريكي، والبلوط (الآرو)، والتي تُعالج ضد الرطوبة والنمل الأبيض لضمان استدامة القطعة كإرث عائلي يتوارثه الأجيال.",
    },
    {
      id: 3,
      question: "كيف يتم التعامل مع عمليات الشحن والتوصيل للقطع الثقيلة؟",
      answer:
        "نمتلك أسطول توصيل خاص مجهز بالكامل لحماية الأثاث. نقوم بشحن القطع في صناديق خشبية مبطنة، ويتولى فريق من الفنيين المحترفين عملية النقل، الرفع، والتركيب في مكانها النهائي داخل منزلك لضمان تجربة مريحة وفخمة.",
    },
    {
      id: 4,
      question: "ما هي فترة الضمان الممنوحة على الأثاث؟",
      answer:
        "تأتي جميع قطع الأثاث بضمان ذهبي ممتد يصل إلى 5 سنوات يشمل العيوب المصنعية، جودة الخشب، والهيكل الداخلي، بالإضافة إلى صيانة دورية مجانية في العام الأول من الشراء.",
    },
  ];

  // دالة التحكم في فتح وإغلاق الأسئلة
  const toggleFaq = (id: number) => {
    setActiveId(activeId === id ? null : id);
  };

  return (
    <section className="bg-[#eaddb8] py-24 px-5 text-right" dir="rtl">
      <div className="max-w-[900px] mx-auto">
        {/* رأس القسم الفخم */}
        <header className="text-center mb-14">
          <span className="inline-block text-[#8a6a14] text-sm font-bold tracking-wider mb-3 bg-[#6b510c]/10 px-4 py-1.5 rounded-full">
            مساعدة وإرشادات
          </span>
          <h2 className="text-[#0d0904] text-4xl font-extrabold mb-5">
            الأسئلة الشائعة
          </h2>
          <div className="relative w-28 h-[1px] bg-[#903c0a]/25 mx-auto">
            <span className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 rotate-45 w-2 h-2 bg-[#ad860f]"></span>
          </div>
        </header>

        {/* حاوية الأسئلة (الأنيميشن السلس هنا) */}
        <div className="flex flex-col gap-4">
          {faqData.map((item) => {
            const isOpen = activeId === item.id;

            return (
              <div
                key={item.id}
                className={`bg-[#f8f2e0] border rounded-xl overflow-hidden shadow-sm transition-all duration-300 ease-in-out hover:translate-y-[-2px] ${
                  isOpen ?
                    "bg-[#fdfae8] border-[#8a6a14] shadow-md"
                  : "border-[#903c0a]/15 hover:border-[#903c0a]/40 hover:bg-[#fdfae8]"
                }`}
              >
                {/* زر السؤال */}
                <button
                  onClick={() => toggleFaq(item.id)}
                  className="w-full flex justify-between items-center p-6 bg-transparent border-none cursor-pointer outline-none group"
                  aria-expanded={isOpen}
                >
                  <span
                    className={`text-xl font-bold transition-colors duration-300 ${isOpen ? "text-[#6b510c]" : "text-[#0d0904] group-hover:text-[#6b510c]"}`}
                  >
                    {item.question}
                  </span>

                  {/* السهم الذكي والدوار */}
                  <span
                    className={`w-6 h-6 text-[#523d25] transition-transform duration-300 ${isOpen ? "rotate-180 text-[#8a6a14]" : ""}`}
                  >
                    <svg
                      xmlns="http://www.w3.org/2000/svg"
                      viewBox="0 0 24 24"
                      fill="none"
                      stroke="currentColor"
                      strokeWidth="2.5"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                    >
                      <polyline points="6 9 12 15 18 9"></polyline>
                    </svg>
                  </span>
                </button>

                {/* الحاوية السحرية للفتح السلس جداً */}
                <div
                  className={`grid transition-all duration-300 ease-in-out ${isOpen ? "grid-rows-[1fr]" : "grid-rows-[0fr]"}`}
                >
                  <div className="overflow-hidden">
                    <p className="px-6 pb-6 text-[#291d0a] text-[1.1rem] leading-8 font-medium m-0">
                      {item.answer}
                    </p>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </section>
  );
}
