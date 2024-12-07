import React from "react";
import getMarkerColor from "@/utils/getMarkerColor";
import styles from "@/styles/Map.module.css";

interface ShelterTypeFilterProps {
  types: string[];
  selectedTypes: string[];
  onTypeChange: (type: string) => void;
}

export default function ShelterTypeFilter({
  types,
  selectedTypes,
  onTypeChange,
}: ShelterTypeFilterProps) {
  return (
    <div className={styles.filterPanel}>
      <h3 style={{ paddingBottom: "10px", paddingRight: "30px" }}>
        Фільтрувати укриття:
      </h3>
      {types.map((type) => {
        const isChecked = selectedTypes.includes(type);
        return (
          <label
            key={type}
            style={{
              display: "flex",
              alignItems: "center",
              marginBottom: "8px",
              cursor: "pointer",
            }}
          >
            <input
              type="checkbox"
              value={type}
              checked={isChecked}
              onChange={() => onTypeChange(type)}
              style={{ display: "none" }}
            />
            <div
              className={styles.checkbox}
              style={{
                backgroundColor: getMarkerColor(type),
                border: `2px solid ${isChecked ? "black" : "white"}`,
              }}
            >
              {isChecked && <div className={styles.checkedInput} />}
            </div>
            {type}
          </label>
        );
      })}
    </div>
  );
}
