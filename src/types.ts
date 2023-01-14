/** A player's state in the game */
export enum PlayerState {
  /** Playing as usual */
  Playing,
  /** Showdown required to re-enter game */
  Limbo,
  /** No longer playing */
  Eliminated,
}

/** The current state of the game. Used to manage the game card */
export enum GameState {
  /** Before the game has started */
  Pregame,
  /** The beginning of a new round */
  NewRound,
  /** Before the question has been revealed */
  PreQuestion,
  /** Question onscreen, player must answer */
  QuestionDisplayed,
  /** Answer is onscreen */
  AnswerDisplayed,
  /** Game is done */
  GameOver,
}

export enum QuestionCategory {
  FindTense,
  Conjugate,
}

/** A player in the game */
export interface Player {
  /** An incremental ID for the player */
  uid: number
  /** The player's display name */
  name: string
  /** Whether the player is invalid. Used during game setup */
  invalid: boolean
  state: PlayerState
}

export interface Question {
  category: QuestionCategory
  question: string
  answer: string
}
