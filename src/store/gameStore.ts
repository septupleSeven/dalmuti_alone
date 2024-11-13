import { create } from "zustand";
import { useGameStoreTypes } from "./types/storeTypes";
import {
  clearHand,
  createDeck,
  dealDeck,
  setLogData,
  setOrder,
  setPlayer,
  setPlayerGameState,
  setReadyForPlay,
  shuffleDeck,
  sortPlayer,
} from "../features/setting";
import {
  HUMAN_ID,
  MAXIMUM_CARDRANK,
  PLAYER_NAME_TABLE,
  PLAYER_NUM,
} from "../config/contants";
import { produce } from "immer";
import {
  getSettleRoundData,
  isRevolution,
  layDownCard,
  performTaxCollect,
  playerLayDownCard,
  setWinner,
} from "../features/playing";
import { LayDownCardType } from "../features/types/featuresTypes";
import { useShallow } from "zustand/react/shallow";
import { useHumanStore } from "./humanStore";
import { useLogStore } from "./logStore";
import { findPlayerWithId, setDelay } from "../features/utils";
import { immer } from "zustand/middleware/immer";

export const useGameStore = create<useGameStoreTypes>()(
  immer((set, get) => ({
    players: setPlayer(PLAYER_NUM),
    deck: createDeck(MAXIMUM_CARDRANK),
    pile: [],
    settingStatus: {
      settingStep: "booting",
      settingStepCondition: "booting",
    },
    gameStatus: {
      gameStep: "collectingTax",
      currentTurn: 0,
      latestPlayer: "",
      resultRank: [],
    },
    actions: {
      view: () => console.log(get()),
      setSettingStep: (value, type = "step") =>
        set((state) => {
          const keyVal =
            type === "step" ? "settingStep" : "settingStepCondition";
          state.settingStatus[keyVal] = value;
        }),
      setGameStep: (value) =>
        set((state) => {
          state.gameStatus.gameStep = value;
        }),
      setShuffleDeck: () =>
        set((state) => {
          shuffleDeck(state.deck);
        }),
      setDealCard: (type) =>
        set((state) => {
          dealDeck(state.deck, state.players, type);

          if (type === "game") {
            state.players.forEach((player) => {
              player.hand.sort((a, b) => a.value - b.value);
              player.className = `${
                PLAYER_NAME_TABLE[`ORDER${player.order}`].name
              }`;
            });
          }
        }),
      setInitializeDeck: (action) =>
        set((state) => {
          state.players.forEach((player) => {
            player.hand = [];
          });
          state.deck = createDeck(MAXIMUM_CARDRANK);
          if (action === "shuffle") shuffleDeck(state.deck);
        }),
      setSortPlayer: (type) =>
        set((state) => {
          sortPlayer(state.deck, state.players, type);
        }),
      setDeck: (deck) =>
        set((state) => {
          state.deck = deck;
        }),
      setPile: (pile) =>
        set((state) => {
          state.pile = pile;
        }),
      setTurn: (value) =>
        set((state) => {
          state.gameStatus.currentTurn = value;
        }),
      setGameOrder: (type) =>
        set((state) => {
          state.players = setOrder(state.players, type);
        }),
      setFirstInAction: () =>
        set((state) => {
          const fitstPlayer = state.players.find(player => player.order === 0);
          if(fitstPlayer) fitstPlayer.status.gameState ="inAction"
        }),
      setPlayers: (players) =>
        set((state) => {
          state.players = players;
        }),
      setResultRank: (players) =>
        set((state) => {
            state.gameStatus.resultRank = players;
        }),
      setLatestPlayer: (value) =>
        set((state) => {
          state.gameStatus.latestPlayer = value
        }),
      runTaxCollect: async () => {
        const { deck, players, gameStatus, actions } = get();
        const getLogStore = useLogStore.getState();
        const isRevolutionVal = await isRevolution(players);

        await performTaxCollect(
          deck,
          players,
          gameStatus.gameStep,
          actions,
          getLogStore.actions.setLog,
          isRevolutionVal
        );
      },





      
      runGame: async () => {
        const { players, 
          // gameStatus, 
          // pile, 
          actions } = get();

        const {
          // setTurn,
          // setPile,
          setGameStep,
          // setLatestPlayer,
          // setPlayers,
          // setResultRank,
        } = actions;

        const getLogStoreAction = useLogStore.getState().actions;
        const { setLog } = getLogStoreAction;

        const getCurrentPlayer = players.find(
          (player) => player.status.gameState === "inAction"
        );

        // console.log(
        //   "%cNow Turn is =>",
        //   "background: #a7a8d9; color: #111",
        //   getCurrentPlayer?.name
        // );
        setLog(
          setLogData(
            `${getCurrentPlayer?.className}(${getCurrentPlayer?.name})의 차례`
          )
        );

        if (getCurrentPlayer!.status.isLeader) {
          // console.log(
          //   "%cRound Ended Winner is => ",
          //   "background: #bada55; color: #111",
          //   getCurrentPlayer
          // );
          setLog(
            setLogData(`라운드 종료. 이번 라운드 승자는 ${getCurrentPlayer?.className}(${getCurrentPlayer?.name})입니다. 
              다음 라운드는 이 플레이어 기준 시계방향으로 시작됩니다. 상단 '다음 라운드 시작' 버튼을 눌러서 계속 진행할 수 있습니다.`)
          );
          setGameStep("roundEnd");
          return;
        }

        // let actionResult: LayDownCardType;

        if (getCurrentPlayer && getCurrentPlayer.id === HUMAN_ID) {
          await new Promise<void>((resolve) => {
            useHumanStore.getState().actionTrigger = resolve;
          });
          const getHumanStore = useHumanStore.getState();
          playerLayDownCard(get(), getHumanStore, get, setLog);

          // actionResult = playerLayDownCard(
          //   // players,
          //   // pile,
          //   // gameStatus.currentTurn,
          //   get(),
          //   getHumanStore,
          //   // getHumanStore.cardStatus,
          //   // getHumanStore.latestAction,
          //   setLog
          // );
        } else {
          // actionResult = layDownCard(
          //   players,
          //   pile,
          //   gameStatus.currentTurn,
          //   setLog
          // )!;
          layDownCard(
            get(),
            get,
            setLog
          );
        }

        // setLatestPlayer(actionResult.latestPlayer);

        // if (actionResult.result === "layDown") {
        //   setTurn(actionResult.nextTurn);// layDownCard에서 하도록 실행하면 삭제해야함
          
        //   setPlayers(actionResult.nextPlayers);// layDownCard에서 하도록 실행하면 삭제해야함
        //   setPile(actionResult.copiedPile);// layDownCard에서 하도록 실행하면 삭제해야함

        // } else if (actionResult.result === "pass") {

        //   setTurn(actionResult.nextTurn);
        //   setPlayers(actionResult.nextPlayers);
        // }

        await setDelay(1000);

        const isGameContinue = await new Promise<void>((resolve, reject) =>
          setTimeout(() => {
            const currentState = get();
            const currentLatestPlayer = currentState.players.find(
              (player) => player.id === currentState.gameStatus.latestPlayer
            );

            if (
              currentLatestPlayer &&
              !currentLatestPlayer.hand.length
              // playerChk && playerChk.hand.length < 12
            ) {
              // console.log(
              //   "%cGame Set winner is=> ",
              //   "background: #820e0e; color: #111",
              //   playerChk.name
              // );
              setLog(
                setLogData(`${currentLatestPlayer.className}(${currentLatestPlayer.name})은 더이상 수중에 패가 없습니다. 
                  ${currentLatestPlayer.className}은 게임의 승리자 입니다! 이후 순번에서 제외됩니다.`)
              );

              // const resultData = setWinner(
              //   currentState.players,
              //   currentLatestPlayer,
              //   currentState.gameStatus,
              //   currentState.actions
              // );

              setWinner(
                currentState.players,
                currentLatestPlayer,
                currentState.gameStatus,
                currentState.actions
              );

              // setPlayers(resultData.remainedPlayers);
              // setResultRank(resultData.updatedResultRank);
              // setTurn(resultData.currentTurn);

              if (get().players.length === 1) {
                alert("게임 종료");
                return reject();
              }
            }

            return resolve();
          }, 1500)
        )
          .then(() => true)
          .catch(() => false);

        if (!isGameContinue) {
          const updatedState = get();

          // const updatedPlayers = get().players;
          // const resultData = setWinner(
          //   updatedPlayers,
          //   updatedPlayers[0],
          //   get().gameStatus
          // );

          setWinner(
            updatedState.players,
            updatedState.players[0],
            updatedState.gameStatus,
            updatedState.actions
          );

          // setPlayers(resultData.remainedPlayers);
          // setResultRank(resultData.updatedResultRank);
          setGameStep("GAMEOVER");
          return;
        }

        if (isGameContinue && get().gameStatus.gameStep === "inPlaying") {
          await actions.runGame();
        }
      },







      settleRound: async () => {
        const { 
          players, 
          // pile, 
          // deck, 
          actions 
        } = get();

        const { 
          runGame, 
          setGameStep, 
          setGameOrder, 
          setPile,
          // setDeck, 
          // view 
        } =
          actions;

        const getLogStoreAction = useLogStore.getState().actions;
        const { setLog } = getLogStoreAction;

        if (players.length > 1) {
        
          setGameOrder("game");
          setPile([]);

          // ↓ 리셋 기능 추가 시 활성화
          // const settledData = getSettleRoundData(players.length, pile);
          // setDeck(settledData);

          set((state) => {
            state.gameStatus.currentTurn = 0;
          });
        }

        const isComplete = await new Promise<string>((resolve) =>
          setTimeout(() => {
            setGameStep("inPlaying");
            return resolve("inPlaying");
          }, 2000)
        );

        if (isComplete) {
          // console.log("Round Restart");
          setLog(setLogData(`다음 라운드가 시작됩니다.`));
          runGame();
        }
      },










      setLeader: (
        playerId, 
        isNotFirstTurn = false, 
        // currentLeaderPlayer
      ) => set(
        (state) => {
          const currentPlayer = findPlayerWithId(state.players, playerId)!
          
          if (isNotFirstTurn) {
            const currentLeaderPlayer = state.players.find(
              (player) => player.status.isLeader === true
            );
            
            if(currentLeaderPlayer){
              currentLeaderPlayer.status.isLeader = false;
            }
          }
          
          currentPlayer.status.isLeader = true;
        }
      ),
      setPushPile: (cards) =>
        set((state) => {
          state.pile.push(cards);
        }),
      setPlayerState: (playerId, gameState) => set(
        (state) => {
          const currentPlayer = findPlayerWithId(state.players, playerId)!
          currentPlayer.status.gameState = gameState
        }
      ),
      setPlayerHand: (playerId, hand) => set(state => {
        const currentPlayer = findPlayerWithId(state.players, playerId)!
        currentPlayer.hand = hand
      })
    },
  }))
);

export const useGameStoreAction = () =>
  useGameStore(useShallow((state) => state.actions));
