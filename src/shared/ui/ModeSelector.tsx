import React, { useState } from "react";
import styles from "../styles/GlobalStyles.module.scss";
import { ModeTypes } from "../../store/types/storeTypes";
import { motion } from "framer-motion";
import { useSettingStoreAction } from "../../store/settingStore";
import { MODE_TEXT } from "../../config/contants";

const ModeSelector = ({
    modeChk
}:{
    modeChk: () => Promise<void>
}) => {
  const { setMode } = useSettingStoreAction();
  const [modeHover, setModeHover] = useState<ModeTypes | "">("");

  const modeSelectorVariants = {
    modeInit: {
      opacity: 0,
    },
    modeAnimate: {
      opacity: 1,
      transition: {
        delay: 1.2,
        duration: 1,
      },
    },
    modeExit: {
      opacity: 0,
    },
  };

  return (
    <motion.div
      variants={modeSelectorVariants}
      exit="modeExit"
      className={styles.headerModeContainer}
    >
      <div className={styles.listContainer}>
        <p>게임 모드를 선택해주세요</p>
        <ul>
          <li>
            <button
              onClick={async () => {
                setMode("short");
                await modeChk();
              }}
              onMouseEnter={() => setModeHover("short")}
            >
              짧은 게임
            </button>
          </li>
          <li>
            <button
              onClick={async () => {
                setMode("long");
                await modeChk();
              }}
              onMouseEnter={() => setModeHover("long")}
            >
              일반 게임
            </button>
          </li>
          <li>
            <button
              onClick={async () => {
                setMode("full");
                await modeChk();
              }}
              onMouseEnter={() => setModeHover("full")}
            >
              풀 게임
            </button>
          </li>
        </ul>
      </div>
      <div className={styles.contents}>
        <p>{modeHover === "" ? "" : MODE_TEXT[modeHover]}</p>
      </div>
    </motion.div>
  );
};

export default ModeSelector;
