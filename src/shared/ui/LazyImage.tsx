import React, { useEffect, useState } from "react";
import styles from "../styles/GlobalStyles.module.scss";
import { loadImage } from "../../features/utils";

const LazyImage = ({
  src,
  placeholder,
  alt,
}: {
  src: string;
  placeholder: string;
  alt: string;
}) => {
  const [isLoaded, setIsLoaded] = useState(false);

  useEffect(() => {
    const loadImg = async () => {
      try {
        await loadImage(src);
        setIsLoaded(true);
      } catch (error) {
        console.log(error);
      }
    };

    loadImg();
  }, [src]);

  return (
    <figure className={styles.lazyImgContainer}>
      <img
        src={placeholder}
        alt={`${alt}_placeholder`}
        className={styles.lazyImgPlaceholder}
        style={{
          opacity: isLoaded ? "0" : "1",
          //   transition: "opacity 0.4s",
        }}
      />
      <img src={src} alt={alt} className={styles.lazyImgContents} />
    </figure>
  );
};

export default LazyImage;
