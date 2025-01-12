import React, { useEffect, useState } from "react";
import styles from "../styles/GlobalStyles.module.scss";
import { ModeTypes } from "../../store/types/storeTypes";
import { motion } from "framer-motion";
import { useSettingStoreAction } from "../../store/settingStore";
import { MODE_TEXT } from "../../config/contants";

const ModeSelector = ({ modeChk }: { modeChk: () => Promise<void> }) => {
  const { setMode } = useSettingStoreAction();
  const [modeHover, setModeHover] = useState<ModeTypes | "">("");
  const [isTouchDevice, setIsTouchDevice] = useState(false);
  const [canClick, setCanClick] = useState({
    short: false,
    long: false,
    full: false,
  });

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

  const handleClick = async (mode: ModeTypes) => {
    const initCanClick = {
      short: false,
      long: false,
      full: false,
    };

    if (isTouchDevice) {
      if (canClick[mode]) {
        if (mode === modeHover) {
          setMode(mode);
          await modeChk();
        }

        setCanClick({ ...initCanClick });
      } else {
        setModeHover(mode);

        setCanClick({
          ...initCanClick,
          [mode]: true,
        });
      }
    } else {
      setMode(mode);
      await modeChk();
    }
  };

  useEffect(() => {
    const handleResize = () => {
      if (window.innerWidth <= 1024) {
        setIsTouchDevice(true);
      }
    };

    window.addEventListener("resize", handleResize);

    handleResize();

    return () => window.removeEventListener("resize", handleResize);
  }, []);

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
                handleClick("short");
              }}
              onMouseEnter={() => {
                if (!isTouchDevice) setModeHover("short");
              }}
            >
              짧은 게임
            </button>
          </li>
          <li>
            <button
              onClick={async () => {
                handleClick("long");
              }}
              onMouseEnter={() => {
                if (!isTouchDevice) setModeHover("long");
              }}
            >
              일반 게임
            </button>
          </li>
          <li>
            <button
              onClick={async () => {
                handleClick("full");
              }}
              onMouseEnter={() => {
                if (!isTouchDevice) setModeHover("full");
              }}
            >
              풀 게임
            </button>
          </li>
        </ul>
      </div>
      <div className={styles.contents}>
        <div className={styles.desc}>
          <p>{modeHover === "" ? "" : MODE_TEXT[modeHover]}</p>
        </div>
        {isTouchDevice && (canClick.full || canClick.long || canClick.short) ? (
          <p className={styles.tooltip}>
            선택한 모드를 한번 더 선택 시 모드가 선택됩니다.
          </p>
        ) : null}
      </div>
    </motion.div>
  );
};

export default ModeSelector;
