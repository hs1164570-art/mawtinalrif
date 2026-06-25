declare global {
  interface Window {
    gtag: (...args: any[]) => void;
  }
}

export function reportWhatsAppConversion(url?: string) {
  const callback = () => {
    if (typeof url !== "undefined") {
      window.location.href = url;
    }
  };

  if (typeof window.gtag === "function") {
    window.gtag("event", "conversion", {
      send_to: "AW-18262833732/5hWGCIrIxsMcEMT0soRE",
      value: 1.0,
      currency: "SAR",
      event_callback: callback,
    });
  } else {
    // fallback لو gtag لسه متحملش
    callback();
  }
  return false;
}
