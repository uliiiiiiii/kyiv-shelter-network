"use client";

import { useState } from "react";
import { useMap } from "react-leaflet";
import styles from "@/styles/Search.module.css";

interface SearchProps {
  onLocationAdded: (location: [number, number]) => void;
}

export default function Search({ onLocationAdded }: SearchProps) {
  const [inputValue, setInputValue] = useState<string>("");
  const map = useMap();

  const handleSearch = async () => {
    if (!inputValue.trim()) {
      alert("Будь ласка, введіть координати або текст для пошуку.");
      return;
    }

    const coords = inputValue
      .split(",")
      .map((value) => parseFloat(value.trim()));
    if (coords.length === 2 && !isNaN(coords[0]) && !isNaN(coords[1])) {
      const location: [number, number] = [coords[0], coords[1]];
      onLocationAdded(location);
      map.flyTo(location, 16);
      return;
    }

    try {
      const res = await fetch(
        `https://nominatim.openstreetmap.org/search?format=json&q=${encodeURIComponent(
          inputValue
        )}`
      );
      const data = await res.json();
      if (data.length === 0) {
        alert("Місце не знайдено. Спробуйте ще раз.");
        return;
      }
      const { lat, lon } = data[0];
      const location: [number, number] = [parseFloat(lat), parseFloat(lon)];
      onLocationAdded(location);
      map.flyTo(location, 16);
    } catch (error) {
      console.error("Помилка геокодування:", error);
      alert("Сталася помилка під час пошуку. Спробуйте пізніше.");
    }
  };

  return (
    <div className={styles.searchContainer}>
      <div className={styles.searchWrapper}>
        <input
          type="text"
          placeholder="Введіть координати (lat, lon) або адресу"
          value={inputValue}
          onChange={(e) => setInputValue(e.target.value)}
          className={styles.searchInput}
        />
        <button onClick={handleSearch} className={styles.searchButton}>
          Знайти
        </button>
      </div>
    </div>
  );
}
