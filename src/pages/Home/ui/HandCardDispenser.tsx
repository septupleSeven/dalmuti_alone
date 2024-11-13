import React, { FormEvent, useRef, useState } from "react";
import styles from "../styles/HomeStyles.module.scss";
import { getRankGroup } from "../../../features/utils";
import { useGameStore } from "../../../store/gameStore";
import { runHumanActionTrigger } from "../../../features/playing";
import { useShallow } from "zustand/react/shallow";
import { useHandDispenserStoreAction } from "../../../store/handStore";
import { useHumanStore, useHumanStoreAction } from "../../../store/humanStore";
import { CARD_NAME_TABLE, HUMAN_ID } from "../../../config/contants";

const HandCardDispenser = ({
  onSelect,
}: {
  onSelect: (val: number) => void;
}) => {
  const { setDispenserClose } = useHandDispenserStoreAction();

  const { cardStatus, actionTrigger } = useHumanStore(
    useShallow((state) => ({
      cardStatus: state.cardStatus,
      actionTrigger: state.actionTrigger,
    }))
  );

  const {
    setHumanActionTrigger,
    setCardStatusJokerPicked,
    setCardStatusCombine,
    setCardStatusSelected,
    setLatestAction,
    view,
  } = useHumanStoreAction();

  const { players, pile, gameStep } = useGameStore(
    useShallow((state) => ({
      players: state.players,
      pile: state.pile,
      gameStep: state.gameStatus.gameStep,
    }))
  );

  const [inputVal, setInputVal] = useState<string>("");
  const inputRef = useRef<HTMLInputElement>(null);
  const jokerRef = useRef<HTMLInputElement>(null);

  const onlyNumber = (e: FormEvent<HTMLInputElement>) => {
    setInputVal(
      e.currentTarget.value.replace(/[^0-9.]/g, "").replace(/(\..*)\./g, "$1")
    );
  };

  const chkBtn = () => {
    if (inputRef.current) {
      setCardStatusSelected(inputRef.current.value);
    }
  };

  const isHumanTurn = () => {
    const humanPlayer = players.find((player) => player.id === HUMAN_ID);
    return humanPlayer?.status.gameState === "inAction";
  };

  const hasJoker = () => {
    const humanPlayer = players.find((player) => player.id === HUMAN_ID);
    return humanPlayer?.hand.some((card) => card.value === 13);
  };

  const jokerGroup = () => {
    const humanPlayer = players.find((player) => player.id === HUMAN_ID)!;
    const joker = getRankGroup(humanPlayer.hand).find(
      (group) => group.rank === "JOKER"
    );
    return joker ? joker : null;
  };

  return (
    <div className={styles.handDispenser}>
      <div className={styles.handDispenserContents}>
        <div className={styles.handDispenserTitleWrap}>
          <p className={styles.title}>
            <span>
              {CARD_NAME_TABLE[`RANK${cardStatus.value}`].name}&#40;
              {cardStatus.rank}&#41;
            </span>
            을 몇 장 내시겠습니까?
          </p>
          <p className={styles.amount}>
            최대 : <span>{cardStatus.cards.length}</span>장 가능
          </p>
        </div>

        <div className={styles.handDispenserJokerWrap}>
          <div className={styles.inputContainer}>
            <input
              type="checkbox"
              id="joker"
              disabled={
                hasJoker() &&
                pile.length &&
                useHumanStore.getState().cardStatus.cards.length <
                  pile[pile.length - 1].length
                  ? false
                  : true
              }
              onChange={(e) => {
                const groupedJoker = jokerGroup();
                if (e.target.checked && groupedJoker) {
                  setCardStatusJokerPicked(groupedJoker.cards);
                } else {
                  setCardStatusJokerPicked([]);
                }
              }}
              ref={jokerRef}
              defaultChecked={false}
            />
            <label htmlFor="joker">조커 사용</label>
          </div>
          {hasJoker() ? (
            <p className={styles.remain}>
              남은 수 {jokerGroup()?.cards.length}/2 장
            </p>
          ) : null}
        </div>

        <div className={styles.handDispenserSubmitContainer}>
          
          <div className={styles.textWrap}>
            <input
              type="text"
              value={
                pile.length ? String(pile[pile.length - 1].length) : inputVal
              }
              onInput={(e) => onlyNumber(e)}
              disabled={isHumanTurn() && pile.length ? true : false}
              ref={inputRef}
            />
            <span>장</span>
          </div>

          <div className={styles.handDispenserBtnContainer}>
            <div className={styles.handDispenserBtnWrap}>
              <button
                onClick={() => {
                  if (!pile.length && !inputVal) {
                    alert("제출 카드를 선택해주세요.");
                    return false;
                  }

                  if (
                    !pile.length &&
                    cardStatus.cards.length < Number(inputVal)
                  ) {
                    alert("선택한 카드가 충분하지 않습니다.");
                    return false;
                  }

                  if (
                    pile.length &&
                    !cardStatus.cards.some((card) => card.value === 13) &&
                    cardStatus.cards[0].value >= pile[pile.length - 1][0].value
                  ) {
                    alert("선택한 카드의 등급이 낮습니다.");
                    return false;
                  }

                  if (
                    pile.length &&
                    cardStatus.cards.length < pile[pile.length - 1].length
                  ) {
                    if (
                      jokerRef.current &&
                      jokerRef.current.checked &&
                      cardStatus.rank !== "JOKER"
                    ) {
                      setCardStatusCombine(pile[pile.length - 1].length);
                      setCardStatusSelected(
                        useHumanStore.getState().cardStatus.cards.length
                      );
                    } else {
                      alert("조건에 맞는 카드가 충분하지 않습니다.");
                      return false;
                    }
                  }

                  // view();

                  if (gameStep === "inPlaying") {
                    chkBtn();
                    setLatestAction("layDown");

                    runHumanActionTrigger(actionTrigger, setHumanActionTrigger);

                    onSelect(0);
                    setDispenserClose();
                  }
                }}
                disabled={
                  isHumanTurn() && gameStep === "inPlaying" ? false : true
                }
              >
                확인
              </button>
              <button
                onClick={() => {
                  onSelect(0);
                  setDispenserClose();
                }}
              >
                취소
              </button>
            </div>
            <button
              onClick={() => {
                if (pile.length) {
                  setLatestAction("passed");
                  runHumanActionTrigger(actionTrigger, setHumanActionTrigger);
                  onSelect(0);
                  setDispenserClose();
                }
              }}
              disabled={isHumanTurn() && pile.length ? false : true}
            >
              패스
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default HandCardDispenser;