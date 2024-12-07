"use client";

import { useMap } from "react-leaflet";
import styles from "@/styles/LocateButton.module.css";

interface LocateButtonProps {
  onLocationFound: (location: [number, number]) => void;
}

export default function LocateButton({ onLocationFound }: LocateButtonProps) {
  const map = useMap();

  function getUserCoords(position: any) {
    const { latitude, longitude } = position.coords;
    const location: [number, number] = [latitude, longitude];
    onLocationFound(location);
    map.flyTo(location, 16);
  }

  function locateUser() {
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(getUserCoords, (error) => {
        console.error("Помилка отримання місцезнаходження: ", error);
        alert(
          "Не вдалось отримати Ваше місцезнаходження. Будь ласка, спробуйте ще раз."
        );
      });
    } else {
      alert("Ґеолокація не підтримується Вашим браузером.");
    }
  }

  return (
    <button className={styles.locateButton} onClick={locateUser}>
      Де я?
    </button>
  );
}
