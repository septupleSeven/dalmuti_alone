import React, { useEffect, useRef } from "react";
import styles from "../styles/HomeStyles.module.scss";
import {
  AnimatePresence,
  motion,
  useCycle,
  useMotionValue,
  useTransform,
} from "framer-motion";
import { useLogStore } from "../../../store/logStore";
import { useShallow } from "zustand/react/shallow";
import LogOpen from "../../../assets/img/logOpen.svg";
import LogClose from "../../../assets/img/logClose.svg";

const Log = () => {
  const [isOpen, toggleOpen] = useCycle(true, false);

  const { log } = useLogStore(
    useShallow((state) => ({
      log: state.log,
    }))
  );

  const y = useMotionValue(200);
  const height = useTransform(y, (y) => Math.max(y + 0.5 * 100, 200));

  const logContainerRef = useRef<HTMLDivElement>(null);
  const logWrapRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (logWrapRef.current) {
      logWrapRef.current.scrollTop = logWrapRef.current.scrollHeight;
    }

    const handleResize = () => {
      if(window.innerWidth <= 768 && isOpen){
        toggleOpen();
      }
    };

    window.addEventListener('resize', handleResize);

    handleResize();

    return () => window.removeEventListener('resize', handleResize);
  }, [log, toggleOpen]);

  return (
    <motion.div
      className={styles.log}
      initial={{
        x: 0,
      }}
      animate={{
        x: isOpen ? 0 : "-100%",
      }}
    >
      <motion.div
        style={{
          height: height,
        }}
        className={styles.logContainer}
        initial={{
          y: "100%",
        }}
        animate={{
          y: 0,
          transition: {
            duration: 0.4,
            type: "spring",
          },
        }}
        ref={logContainerRef}
      >
        <motion.div
          drag
          dragElastic={0}
          dragMomentum={false}
          dragConstraints={{
            left: 0,
            right: 0,
            top: 0,
            bottom: 0,
          }}
          className={styles.logCursor}
          onDrag={(e, info) => {
            y.set(y.get() - info.delta.y);
          }}
        ></motion.div>
        <div className={styles.logWrap} ref={logWrapRef}>
          <ul>
            <AnimatePresence>
              {log.map((data, idx) => {
                return (
                  <motion.li
                    initial={{
                      opacity: 0,
                      y: 20,
                    }}
                    animate={{
                      opacity: 1,
                      y: 0,
                    }}
                    key={`${data.time}-${idx}`}
                    className={styles.logChat}
                  >
                    <p className={styles.time}>{data.time}</p>
                    <p className={styles.contents}>{data.contents}</p>
                  </motion.li>
                );
              })}
            </AnimatePresence>
          </ul>
        </div>
      </motion.div>
      <button onClick={() => toggleOpen()} className={styles.logToggle}>
        <motion.img
          src={isOpen ? LogClose : LogOpen}
          alt="logToggle"
          initial={{
            filter: "brightness(0) invert(1)",
          }}
          whileHover={{
            filter: "brightness(1) invert(0)",
            transition: {
              delay: 0,
              duration: 0.2,
            },
          }}
        />
      </button>
    </motion.div>
  );
};

export default Log;
