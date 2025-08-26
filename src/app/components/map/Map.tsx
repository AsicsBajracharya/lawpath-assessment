'use client';

import { useEffect, useRef } from 'react';

declare global {
  interface Window {
    initGoogleMaps?: () => void;
    google: any;
  }
}

type Props = { lat: number; lng: number };

export default function Map({ lat, lng }: Props) {
  const ref = useRef<HTMLDivElement | null>(null);

  useEffect(() => {
    let cancelled = false;

    function render() {
      if (cancelled || !ref.current || !window.google) return;
      const map = new window.google.maps.Map(ref.current, {
        center: { lat, lng },
        zoom: 14,
        disableDefaultUI: true,
      });
      new window.google.maps.Marker({ position: { lat, lng }, map });
    }

    if (window.google?.maps) {
      render();
      return () => {
        cancelled = true;
      };
    }

    const script = document.createElement('script');
    const apiKey = process.env.NEXT_PUBLIC_GOOGLE_MAPS_API_KEY;
    const url = apiKey 
      ? `https://maps.googleapis.com/maps/api/js?key=${apiKey}&callback=initGoogleMaps`
      : 'https://maps.googleapis.com/maps/api/js?callback=initGoogleMaps';
    script.src = url;
    script.async = true;
    window.initGoogleMaps = () => render();
    document.body.appendChild(script);
    return () => {
      cancelled = true;
      script.remove();
    };
  }, [lat, lng]);

  return <div ref={ref} className="w-full h-72 rounded-lg border" />;
}


