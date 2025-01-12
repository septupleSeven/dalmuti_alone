import React, { memo } from "react";
import styles from "../styles/HomeStyles.module.scss";
import LazyImage from "../../../shared/ui/LazyImage";
import CardPlaceholder from "../../../assets/img/cards/card_placeholder.jpg";

const Card = memo(
  ({
    cardVal,
    activeFocus = 0,
    size = "normal",
    button = false,
  }: {
    cardVal: number;
    activeFocus?: number;
    size?: "normal" | "hand" | "pile";
    button?: boolean;
  }) => {
    const isBtnClass = button ? `${styles[`cardNode--btn`]}` : ``;

    const CardImage = memo(() => {
      return (
        <LazyImage
          src={require(`../../../assets/img/cards/rank${cardVal}.jpg`)}
          placeholder={CardPlaceholder}
          alt={`Card_rank${cardVal}`}
        />
      );
    });

    return button ? (
      <button
        className={`${styles.cardNode} ${isBtnClass} ${
          styles[`cardSize--${size}`]
        }`}
        tabIndex={activeFocus}
      >
        <CardImage />
      </button>
    ) : (
      <div
        className={`${styles.cardNode} ${isBtnClass} ${
          styles[`cardSize--${size}`]
        }`}
      >
        <CardImage />
      </div>
    );
  }
);

export default Card;
