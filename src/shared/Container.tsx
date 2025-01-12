import React, { ReactNode, useEffect, useState } from "react";
import styles from "./styles/GlobalStyles.module.scss";
import Nav from "./Nav";
import BgPlaceholder from "../assets/img/bg_placeholder.png";
import Bg from "../assets/img/bg.jpg";
import { loadImage } from "../features/utils";

const Container = ({ children }: { children: ReactNode }) => {
  const [isLoaded, setIsLoaded] = useState(false);

  useEffect(() => {
    const loadImg = async () => {
      try {
        await loadImage(Bg);
        setIsLoaded(true);
      } catch (error) {
        console.log(error);
      }
    };

    loadImg();
  }, []);

  return (
    <>
      <Nav />
      <main
        className={styles.mainContainer}
        style={{
          backgroundImage: `url(${isLoaded ? Bg : BgPlaceholder})`,
          backgroundColor: "rgba(0,0,0,1)",
          backgroundSize: "cover",
          backgroundRepeat: "no-repeat",
          backgroundPosition: "center",
          filter: `${isLoaded ? "none" : "blur(4px)"}`,
          transform: `${isLoaded ? "none" : "scale(1.025)"}`,
          transition: "filter 0.4s, transform 0.4s",
        }}
      >
        {children}
      </main>
    </>
  );
};

export default Container;
