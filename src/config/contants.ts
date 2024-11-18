import { ModeTypes } from "../store/types/storeTypes";

export const PLAYER_NUM = 5;
export const MAXIMUM_CARDRANK = 11;
export const HUMAN_ID = "Human";
export const PLAYER_NAME_TABLE: Record<string, { src: string; name: string }> =
  {
    ORDER0: {
      src: "",
      name: "달무티",
    },
    ORDER1: {
      src: "",
      name: "총리대신",
    },
    ORDER2: {
      src: "",
      name: "상인",
    },
    ORDER3: {
      src: "",
      name: "소작농",
    },
    ORDER4: {
      src: "",
      name: "농노",
    },
  };
export const CARD_NAME_TABLE: Record<string, { src: string; name: string }> = {
  RANK1: {
    src: "",
    name: "달무티",
  },
  RANK2: {
    src: "",
    name: "대주교",
  },
  RANK3: {
    src: "",
    name: "시종장",
  },
  RANK4: {
    src: "",
    name: "남작부인",
  },
  RANK5: {
    src: "",
    name: "수녀원장",
  },
  RANK6: {
    src: "",
    name: "기사",
  },
  RANK7: {
    src: "",
    name: "재봉사",
  },
  RANK8: {
    src: "",
    name: "석공",
  },
  RANK9: {
    src: "",
    name: "요리사",
  },
  RANK10: {
    src: "",
    name: "광부",
  },
  RANK11: {
    src: "",
    name: "농노",
  },
  RANK13: {
    src: "",
    name: "광대",
  },
};

export const REVOLUTION_TEXT: Record<string, string> = {
  revolution: "혁명이 일어났습니다! 갈등 속에 세금은 징수되지 않았습니다.",
  gRevolution: "대혁명! 달무티와 총리대신의 손에 농기구가 쥐어 집니다.",
  continue:
    "아무 일도 없었습니다. 세금이 징수됩니다. 농노와 소작농의 희망도 징수됩니다.",
};

export const ENDING_TEXT: Record<string, string> = {
  ORDER0: "훌륭합니다. 당신이 바로 진정한 달무티입니다.",
  ORDER1: "어떤 때는 2인자가 더 기억에 남는 법이죠.",
  ORDER2: "이 리스트에선 센터 포지션이군요.",
  ORDER3: "원래 인생은 불공평합니다.",
  ORDER4: "...",
};

export const MODE_TEXT: Record<ModeTypes, string> = {
  short:
    "기존 룰에서 먼저 패에 5장 남은 플레이어가 승리하는 것으로 설정합니다. 게임이 짧게 끝납니다.",
  long: "기존 룰 그대로 진행합니다. 승리한 플레이어가 나올 시 게임은 종료됩니다.",
  full: "기존 룰 그대로 진행합니다. 마지막 한 명의 플레이어가 남을 때까지 진행합니다. 게임이 상당히 길게 진행됩니다.",
};
