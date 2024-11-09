import { CardTypes } from "../../../features/types/featuresTypes"

export type HandGroupTypes = {
    rank: string,
    cards: Omit<CardTypes, "rank">[]
}