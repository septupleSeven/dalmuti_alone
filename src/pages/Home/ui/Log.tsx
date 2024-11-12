import React, { useEffect, useRef, useState } from "react";
import styles from "../styles/HomeStyles.module.scss";
import {
  AnimatePresence,
  motion,
  useMotionValue,
  useTransform,
} from "framer-motion";
import { useLogStore } from "../../../store/logStore";
import { useShallow } from "zustand/react/shallow";

const Log = () => {
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
  }, [log]);

  return (
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
                    y: 20
                  }}
                  animate={{
                    opacity: 1,
                    y: 0
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
  );
};

export default Log;
