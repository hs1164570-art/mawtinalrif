// components/layout/MapEmbed.tsx
// This component is strictly for rendering the exact localized shop frame.

export default function MapEmbed() {
  // الرابط المشفر المباشر لمقر مؤسسة موطن الريف في حي الجزيرة (مستخرج من خرائط جوجل الرسمية)
  const exactLocationUrl =
    "https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d3626.046867689952!2d46.79397162540896!3d24.65651505703178!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x3e2f07584f86f885%3A0x1fa398d5807432b5!2z2YXYpNiz2LPZhyDZhdmI2LfZhiDYp9mE2LHZitmBINmE2YTYqtis2KfYsdmHMQ!5e0!3m2!1sar!2seg!4v1781581840088!5m2!1sar!2seg";

  return (
    <iframe
      src={exactLocationUrl}
      width="100%"
      height="208"
      style={{ border: 0 }}
      allowFullScreen
      loading="lazy"
      referrerPolicy="no-referrer-when-downgrade"
      title="موقع مؤسسة موطن الريف للتجارة 1 على خريطة جوجل"
      aria-label="خريطة تفاعلية توضح موقع الفرع بحي الجزيرة"
      className="rounded-xl border border-neutral-800 w-full"
    />
  );
}
