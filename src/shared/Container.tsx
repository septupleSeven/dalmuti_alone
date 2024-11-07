import React, { ReactNode } from "react";
import styles from "./styles/GlobalStyles.module.scss";
import Nav from "./Nav";

const Container = ({children}:{children: ReactNode}) => {
  return (
    <>
      <Nav />
      <main className={styles.mainContainer}>{children}</main>
    </>
  );
};

export default Container;
