import React from 'react';
import styles from "../styles/HomeStyles.module.scss";

const Card = ({
    cardVal,
    size = "normal",
    button = false
}:{
    cardVal: number;
    size?: "normal" | "hand" | "pile";
    button?: boolean
}) => {

  const isBtnClass = button ? `${styles[`cardNode--btn`]}` : ``;

  return (
    <div className={`${styles.cardNode} ${isBtnClass} ${styles[`cardSize--${size}`]}`}>
        <figure>
            <img src={require(`../../../assets/img/cards/rank${cardVal}.jpg`)} alt="Card" />
        </figure>
        {/* {cardVal} */}
    </div>
  )
}

export default Card