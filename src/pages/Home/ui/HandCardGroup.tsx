import React from "react";
import { HandGroupTypes } from "../types/HomeTypes";
import Card from "./Card";
import styles from "../styles/HomeStyles.module.scss";

const HandCardGroup = ({ group }: { group: HandGroupTypes }) => {
  const { rank, cards } = group;

  return (
    <li>
      <p>{rank}</p>
      <ul className={styles.cardContainer}>
        {cards.map((card) => (
          <li key={`HANDCARD-${card.id}`}>
            <Card cardVal={card.value} />
          </li>
        ))}
      </ul>
    </li>
  );
};

export default HandCardGroup;
