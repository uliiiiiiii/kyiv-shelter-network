"use client";

import Map from "@/components/Map";

import dynamic from "next/dynamic";
import styles from "@/styles/Home.module.css";

// const Map = dynamic(() => import("@/components/Map"), {
//   ssr: false,
//   loading: () => <p>Loading map...</p>,
// });

export default function Home() {
  return (
    // <main className={styles.main}>
    <Map />
    // </main>
  );
}
