"use client";
import dynamic from "next/dynamic";

const Map = dynamic(() => import("@/components/Map"), {
  ssr: false,
  loading: () => <p>Loading map...</p>,
});

export default function Home() {
  return (
    <div>
      <Map />
    </div>
  );
}
