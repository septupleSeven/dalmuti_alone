import React, { FormEvent, useRef, useState } from "react";
import styles from "../styles/HomeStyles.module.scss";
import {
  useHumanStore,
  useHandDispenserStore,
  useGameStore,
} from "../../../store/store";
import { getRankGroup } from "../../../features/utils";

const HandCardDispenser = ({
  onSelect,
}: {
  onSelect: (val: number) => void;
}) => {
  const { setDispenserClose } = useHandDispenserStore();
  const {
    cardStatus,
    setCardStatusSelected,
    setLatestAction,
    view,
    runHumanActionTrigger,
    setCardStatusJokerPicked,
    setCardStatusCombine,
  } = useHumanStore();

  const { players, pile, gameStatus } = useGameStore();

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
    const humanPlayer = players.find((player) => player.id === "Human");
    return humanPlayer?.status.gameState === "inAction";
  };

  const hasJoker = () => {
    const humanPlayer = players.find((player) => player.id === "Human");
    return humanPlayer?.hand.some((card) => card.value === 13);
  };

  const jokerGroup = () => {
    const humanPlayer = players.find((player) => player.id === "Human")!;
    const joker = getRankGroup(humanPlayer.hand).find(
      (group) => group.rank === "JOKER"
    );
    return joker ? joker : null;
  };

  return (
    <div className={styles.handDispenser}>
      <div className={styles.handDispenserContents}>
        <div className={styles.handDispenserTitleWrap}>
          <p className={styles.title}>{cardStatus.rank} 몇 장 내시겠습니까?</p>
          <p className={styles.amount}>
            최대 : {cardStatus.cards.length}장 가능
          </p>
        </div>

        <div>
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
          {hasJoker() ? <p>남은 수 {jokerGroup()?.cards.length}/2 장</p> : null}
        </div>

        <input
          type="text"
          value={pile.length ? String(pile[pile.length - 1].length) : inputVal}
          onInput={(e) => onlyNumber(e)}
          disabled={isHumanTurn() && pile.length ? true : false}
          ref={inputRef}
        />

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
                  alert("숫자가 안맞습니다.");
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

                if (gameStatus.gameStep === "inPlaying") {
                  chkBtn();
                  setLatestAction("layDown");
                  runHumanActionTrigger();
                  onSelect(0);
                  setDispenserClose();
                }
              }}
              disabled={
                isHumanTurn() && gameStatus.gameStep === "inPlaying"
                  ? false
                  : true
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
                runHumanActionTrigger();
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
  );
};

export default HandCardDispenser;
