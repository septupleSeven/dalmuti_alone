import React, { useEffect, useMemo, useRef } from "react";
import styles from "../../styles/ModalStyles.module.scss";
import { Swiper, SwiperClass, SwiperSlide } from "swiper/react";
import { Navigation, Pagination } from "swiper/modules";
import "swiper/swiper-bundle.css";
import { TIP_MODAL_CONTENTS } from "../../../../config/contants";
import ChevronLeft from "../../../../assets/img/slide__prev.svg";
import BtnClose from "../../../../assets/img/btn__close.svg";
import { motion } from "framer-motion";
import {
  useModalStoreAction,
} from "../../../../store/modalStore";

const TipModal = () => {
  const navPrevRef = useRef(null);
  const navNextRef = useRef(null);
  const pagingRef = useRef(null);
  const swiperRef = useRef<SwiperClass | null>(null);

  const { setModalShow } = useModalStoreAction();

  const motionVariant = useMemo(
    () => ({
      init: {
        opacity: 0,
      },
      show: {
        opacity: 1,
      },
      exit: {
        opacity: 0,
      },
    }),
    []
  );

  useEffect(() => {
    if (swiperRef.current) {
      const navigation = swiperRef.current.params.navigation as any;
      navigation.prevEl = navPrevRef.current;
      navigation.nextEl = navNextRef.current;

      swiperRef.current.navigation.init();
      swiperRef.current.navigation.update();

      const pagination = swiperRef.current.params.pagination as any;
      pagination.el = pagingRef.current;
      pagination.clickable = true;

      swiperRef.current.pagination.init();
      swiperRef.current.pagination.render();
      swiperRef.current.pagination.update();
    }
  }, []);

  return (
    <motion.div
      variants={motionVariant}
      initial="init"
      animate="show"
      exit="exit"
      className={styles.tipModal}
    >
      <div className={styles.tipModalContainer}>
        <div className={styles.slideContainer}>
          <div className={styles.linkContainer}>
            <a
              href="https://youtu.be/sO-vxnoL31A?si=K1YYEMjvOBoduqmM"
              target="_blank"
              rel="noopener noreferrer"
              aria-label="게임 설명 보기"
            >
              영상으로 보기
            </a>
          </div>
          <Swiper
            modules={[Navigation, Pagination]}
            spaceBetween={0}
            slidesPerView={1}
            onSwiper={(swiper: SwiperClass) => {
              swiperRef.current = swiper;
            }}
            className={styles.tipSlide}
          >
            {TIP_MODAL_CONTENTS.map((contents, idx) => (
              <SwiperSlide key={`TIPSLIDE-${contents.id}`}>
                <div className={styles.slideContents}>
                  <div className={styles.desc}>
                    <h3 className={styles.title}>{contents.desc.title}</h3>
                    <div className={styles.text}>
                      {contents.desc.text.split("\n").map((para, paraIdx) => {
                        return (
                          <p key={`${contents.id}PARA-${paraIdx}`}>
                            {para === "" ? <br /> : para}
                          </p>
                        );
                      })}
                    </div>
                  </div>
                  <div className={styles.imgContainer}>
                    <figure>
                      {contents.src.map((img, imgIdx) => (
                        <img
                          key={`${contents.id}IMG-${imgIdx}`}
                          src={require(`../../../../assets/img/tips/${img}`)}
                          alt="tip"
                        />
                      ))}
                    </figure>
                  </div>
                </div>
              </SwiperSlide>
            ))}
          </Swiper>
        </div>
        <div className={styles.utilContainer}>
          <div className={styles.pagingContainer} ref={pagingRef}></div>
          <div className={styles.navContainer}>
            <button
              className={`${styles.navBtn} ${styles.navBtnPrev}`}
              ref={navPrevRef}
            >
              <img src={ChevronLeft} alt="toPrevious" />
            </button>
            <button
              className={`${styles.navBtn} ${styles.navBtnNext}`}
              ref={navNextRef}
            >
              <img src={ChevronLeft} alt="to Next" />
            </button>
          </div>
        </div>
      </div>
      <button
        className={styles.closeBtn}
        onClick={() => {
          setModalShow(false);
        }}
      >
        <img src={BtnClose} alt="close tip" />
      </button>
    </motion.div>
  );
};

export default TipModal;
