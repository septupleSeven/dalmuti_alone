import React from 'react';
import styles from "../styles/HomeStyles.module.scss";

const Card = ({
    cardVal,
    size = "normal"
}:{
    cardVal: number;
    size?: string
}) => {

  return (
    <div className={`${styles.cardNode} ${styles[`cardSize--${size}`]}`}>
        {/* <figure>
            <img src="" alt="" />
        </figure> */}
        {cardVal}
    </div>
  )
}

export default Card