<script lang="ts">
  import Button, { Icon, Label } from '@smui/button'
  import Card from '@smui/card'
  import Ripple from '@smui/ripple'
  import confetti from 'canvas-confetti'

  import questions from '../questions'
  import { players as playersStore } from '../stores'
  import {
    GameState,
    PlayerState,
    QuestionCategory,
    type Player,
    type Question,
  } from '../types'

  /**
   * A function to restart the game.
   * This should recreate the `<Game />` component so that all state is reset.
   * Any visual effects to make the restart less jarring should also be handled here
   */
  export let restart: () => void

  /**
   * A reference to the card's container.
   * Click events and whatnot are handled on the container,
   * not the card itself
   */
  let container: HTMLDivElement
  /**
   * Whether the card can be clicked.
   * Used to prevent spam-clicking (or accidental double-clicks)
   * from breaking the game
   */
  let cardEnabled = true

  /** The current game state */
  let state: GameState = GameState.Pregame
  /** The starting value for the timer */
  let timerSet = 20
  /** The starting value for the timer during elimination rounds */
  const eliminationTimerSet = 15
  /** How much the timer is decreased by when a round passes without eliminations */
  const timerDecrement = 5
  /** The smallest amount of time allowed for the timer */
  const minTimer = 3
  /** The current value for the timer */
  let timer = timerSet
  /** The number of the interval to count down the timer */
  let timerInterval: number
  /** Whether the timer is at 0. Used to sync the changes of the card with its animation */
  let timeUp = false
  /** Whether the timer reached 0 during an elimination round. Both players are eliminated */
  let eliminationTimeUp = false

  /** The list of active players */
  let players: Player[]
  /** The current player */
  let current: Player
  /** The players in the elimination round */
  let eliminationPlayers: [Player, Player]
  /** The index in `eliminationPlayers` of the player who buzed in during the elimination round */
  let buzzedIn: 0 | 1
  /** The victor, when the game is over */
  let victor: Player

  /** The number of the interval to show confetti */
  let confettiInterval: number

  /** Get available questions from sessionStorage */
  const availableFromStorage = () => {
    if (!sessionStorage.availableQuestions) {
      throw new Error('No data in sessionStorage')
    }

    const availableIndices: number[] = JSON.parse(
      sessionStorage.availableQuestions as string,
    ) as number[]

    return availableIndices.map(index => questions[index])
  }

  /** Save available questions to sessionStorage */
  const availableToStorage = (available: Question[]) => {
    const availableIndices = available.map(question =>
      questions.indexOf(question),
    )
    sessionStorage.availableQuestions = JSON.stringify(availableIndices)
  }

  /**
   * The list of available questions.
   * Every time a question is used, it's removed from the list
   */
  let availableQuestions: Question[] = sessionStorage.availableQuestions
    ? availableFromStorage()
    : [...questions]
  /** The current question */
  let question: Question = availableQuestions[0]

  $: availableToStorage(availableQuestions)

  /** Whether anyone was eliminated for the current round */
  let anyEliminated = false

  /** Pick question and remove it from available questions */
  const newQuestion = () => {
    if (!availableQuestions.length) availableQuestions = [...questions]

    question =
      availableQuestions[Math.floor(Math.random() * availableQuestions.length)]
    availableQuestions.splice(availableQuestions.indexOf(question), 1)
    availableQuestions = availableQuestions
  }

  const showConfetti = () => {
    void confetti({
      particleCount: 200,
      spread: 100,
      angle: 23,
      origin: { x: -0.1, y: 0.5 },
      disableForReducedMotion: true,
    })
    void confetti({
      particleCount: 200,
      spread: 100,
      angle: 157,
      origin: { x: 1.1, y: 0.5 },
      disableForReducedMotion: true,
    })
  }

  $: if (state === GameState.GameOver) {
    showConfetti()
    confettiInterval = window.setInterval(showConfetti, 4000)
  }

  $: if (state <= GameState.NewRound && confettiInterval) {
    clearInterval(confettiInterval)
    confettiInterval = 0
  }

  playersStore.subscribe(value => (players = value))
  $: if (!current) current = players[0]

  // Simulate a click on the card when the space bar is pressed
  // and prevent the space bar from scrolling the page
  window.addEventListener('keydown', event => {
    if (event.key === ' ') {
      event.preventDefault()
      container?.click()
    }
    return false
  })

  /**
   * Start the flip transition
   * @param callback Called when content is safe to change
   */
  const flip = (callback?: () => void) => {
    cardEnabled = false
    container?.classList.add('flipped')

    // First transition end, card is invisible
    container?.addEventListener(
      'transitionend',
      e => {
        // Fixes a weird problem where the transitionend event fires way before the transition is done
        if (e.elapsedTime < 0.1) {
          flip(callback)
          return
        }

        callback?.()
        container?.classList.remove('flipped')

        // Second transition end, card is visible
        container?.addEventListener(
          'transitionend',
          () => (cardEnabled = true),
          { once: true },
        )
      },
      { once: true },
    )
  }

  /**
   * Start the flip transition and update the game state
   * @param newState The new game state
   * @param callback Called when content is safe to change
   */
  const flipAndChangeState = (newState: GameState, callback?: () => void) => {
    flip(() => {
      state = newState
      callback?.()
    })
  }

  /**
   * Start the flip transition and increment the game state by 1
   * @param callback Called when content is safe to change
   */
  const flipAndNextState = (callback?: () => void) =>
    flipAndChangeState(state + 1, callback)

  /**
   * Get a description of the category to show to a user
   * @param category The category
   */
  const getCategory = (category: QuestionCategory): string => {
    switch (category) {
      case QuestionCategory.FindTense:
        return 'Nommer le temps de verbe'
      case QuestionCategory.Conjugate:
        return 'Conjuguer le verbe'
      case QuestionCategory.CDOrCI:
        return 'Y a-t-il un CD ou CI?'
    }
  }

  /** Run the timer. Doesn't reset the timer if it's already running */
  const runTimer = () => {
    timerInterval = window.setInterval(() => {
      if (--timer === 0) {
        clearInterval(timerInterval)
        flip(() => {
          timeUp = true
          if (state === GameState.EliminationQuestionDisplayed) {
            state = GameState.EliminationRoundFailed
            eliminationTimeUp = true
          }
        })
      }
    }, 1000)
  }

  /** Reset the timer */
  const resetTimer = (newTime?: number) => {
    clearInterval(timerInterval)
    timer = newTime ?? timerSet
    timeUp = false
    // eliminationTimeUp is reset in nextPlayer()
  }

  /** Called when a full round has been completed */
  const fullRoundDone = () => {
    // Decrease timer time if nobody was eliminated
    if (!anyEliminated) {
      const newTime = timerSet - timerDecrement
      if (newTime < minTimer) {
        if (timerSet > minTimer) timerSet = minTimer
      } else {
        timerSet = newTime
      }
      resetTimer()
    }
    anyEliminated = false
  }

  /** Checks whether the game is over, and updates the state if it is */
  const checkGameOver = () => {
    const nonEliminated = players.filter(
      player => player.state !== PlayerState.Eliminated,
    )

    if (nonEliminated.length === 1) {
      victor = nonEliminated[0]
      flipAndChangeState(GameState.GameOver)
      return true
    }

    return false
  }

  /**
   * Checks whether an elimination round is required.
   * Elimination rounds happen when two people are in limbo,
   * and decide who should return to the game and who should remain eliminated
   */
  const eliminationRound = (): [true, [Player, Player]] | false => {
    const limbo = players.filter(player => player.state === PlayerState.Limbo)

    if (limbo.length === 2) return [true, limbo as [Player, Player]]
    return false
  }

  /**
   * Set the player that buzzed in for the elimination round
   * @param player Which elimination player buzzed in
   * (either 0 or 1)
   */
  const eliminationRoundSelectPlayer = (player: 0 | 1) => {
    buzzedIn = player
    flipAndNextState()
  }

  /**
   * Go to the next player
   * @param lastCorrect Whether the last player answered correctly
   */
  const nextPlayer = (lastCorrect: boolean) => {
    // Get list of available players
    // It's important that this happens before the elimination code below
    const playersAvailable = players.filter(
      player => player.state === PlayerState.Playing,
    )

    const playersUneliminated = players.filter(
      player => player.state !== PlayerState.Eliminated,
    )

    const wasEliminationRound =
      state === GameState.EliminationAnswerDisplayed ||
      state === GameState.EliminationRoundFailed

    // Eliminate player/send to limbo if required
    if (wasEliminationRound) {
      if (eliminationTimeUp) {
        eliminationPlayers.forEach(
          player => (player.state = PlayerState.Eliminated),
        )
        playersStore.set(players)
        eliminationTimeUp = false
        checkGameOver()
        return
      }

      const winner = lastCorrect ? buzzedIn : buzzedIn === 0 ? 1 : 0
      const loser = winner === 0 ? 1 : 0

      eliminationPlayers[winner].state = PlayerState.Playing
      eliminationPlayers[loser].state = PlayerState.Eliminated
      playersStore.set(players)
    } else {
      if (!lastCorrect) {
        anyEliminated = true

        // Get list of non-eliminated players
        const nonEliminated = players.filter(
          player => player.state !== PlayerState.Eliminated,
        )

        if (nonEliminated.length === 2) {
          current.state = PlayerState.Eliminated
        } else {
          current.state = PlayerState.Limbo
        }

        playersStore.set(players)
        if (checkGameOver()) return
      }
    }

    // Run an elimination round if required
    const elimination = eliminationRound()
    if (elimination) {
      eliminationPlayers = elimination[1]
      flipAndChangeState(GameState.NewEliminationRound)
      return
    }

    let currentIsLast: boolean

    if (wasEliminationRound) {
      currentIsLast =
        playersUneliminated.indexOf(current) === playersUneliminated.length - 1
    } else {
      currentIsLast =
        playersAvailable.indexOf(current) === playersAvailable.length - 1
    }

    if (!currentIsLast) {
      if (wasEliminationRound) {
        const currentUneliminatedIndex = playersUneliminated.indexOf(current)
        const nextPlayer = playersUneliminated[currentUneliminatedIndex + 1]
        current = nextPlayer
      } else {
        const currentAvailableIndex = playersAvailable.indexOf(current)
        const nextPlayer = playersAvailable[currentAvailableIndex + 1]
        current = nextPlayer
      }
    } else {
      current = playersAvailable[0]
      if (!wasEliminationRound) fullRoundDone()
    }

    flipAndChangeState(GameState.NewRound)
  }

  /** Handle the card being clicked */
  const cardClick = () => {
    if (!cardEnabled) return

    switch (state) {
      case GameState.Pregame:
      case GameState.EliminationCategoryDisplayed:
      case GameState.GameOver:
        flipAndNextState()
        break

      case GameState.NewRound:
      case GameState.NewEliminationRound:
        newQuestion()
        flipAndNextState()
        break

      case GameState.PreEliminationQuestion:
        timer = eliminationTimerSet
      /** eslint-disable-next-line no-fallthrough */
      case GameState.PreQuestion:
        flipAndNextState(runTimer)
        break

      case GameState.QuestionDisplayed:
      case GameState.EliminationQuestionDisplayed:
        flipAndNextState(resetTimer)
        break

      case GameState.EliminationRoundFailed:
        nextPlayer(false)
        break

      case GameState.PlayAgainPrompt:
        if (confettiInterval) clearInterval(confettiInterval)
        players.forEach(player => (player.state = PlayerState.Playing))
        playersStore.set(players)
        restart()
        break

      case GameState.AnswerDisplayed:
      case GameState.EliminationPlayerAnswered:
        break

      default:
        throw new Error('Unhandled game state')
    }
  }
</script>

<div>
  <h2>
    {#if state === GameState.Pregame}
      Commencement du jeu
    {:else if state >= GameState.NewEliminationRound && state <= GameState.EliminationAnswerDisplayed}
      Tour d'élimination entre
      <b class="player-name">
        {eliminationPlayers[0].name}
      </b>
      et
      <b class="player-name">
        {eliminationPlayers[1].name}
      </b>
    {:else if state < GameState.GameOver}
      Tour de <b class="player-name">
        {current.name}
      </b>
    {:else}
      <b class="player-name">
        {victor.name}
      </b>
      a gagné!
    {/if}
  </h2>

  <!-- svelte-ignore a11y-no-noninteractive-tabindex -->
  <div
    role="button"
    class="card-container"
    bind:this={container}
    use:Ripple={{ surface: true }}
    on:click={cardClick}
    on:keydown={event => {
      /* eslint-disable-next-line @typescript-eslint/no-unsafe-member-access */
      if (event.key === 'Enter') container.click()
    }}
    tabindex="0"
  >
    <Card>
      {#if state === GameState.Pregame}
        <p>Prêt à jouer?</p>
      {/if}

      {#if state === GameState.NewRound}
        <p>Cliquer pour voir la catégorie</p>
      {/if}

      {#if state === GameState.PreQuestion}
        <p style="margin-bottom: 0.5em;">
          <b>Catégorie: {getCategory(question.category)}</b>
        </p>
        <p style="margin-top: 0.5em;">Cliquer pour commencer</p>
      {/if}

      {#if state === GameState.QuestionDisplayed}
        <p>
          {#if !timeUp}
            {question.question}
          {:else}
            C'est l'heure!
          {/if}
        </p>
      {/if}

      {#if state === GameState.AnswerDisplayed || state === GameState.EliminationAnswerDisplayed}
        <p>Réponse: {question.answer}</p>
      {/if}

      {#if state === GameState.NewEliminationRound}
        <p>
          <b>Tour d'élimination:</b>
          <br />
          {eliminationPlayers[0].name} vs. {eliminationPlayers[1].name}
        </p>
      {/if}

      {#if state === GameState.EliminationCategoryDisplayed}
        <p>
          <b>Catégorie: {getCategory(question.category)}</b>
        </p>
      {/if}

      {#if state === GameState.PreEliminationQuestion}
        <p style="margin-bottom: 0.5em;">Préparez-vous...</p>
        <p style="margin-top: 0.5em;">
          <b>« Buzz in » quand la question est révélée</b>
        </p>
      {/if}

      {#if state === GameState.EliminationQuestionDisplayed}
        <p style="margin-bottom: 0.5em;"><b>{question.question}</b></p>
        <p style="margin-top: 0.5em;">
          Cliquez <b>dès que quelqu'un « buzz in »</b>
        </p>
      {/if}

      {#if state === GameState.EliminationPlayerAnswered}
        <!-- <p>{question.question}</p> -->
        <p>Donnez votre réponse maintenant</p>
      {/if}

      {#if state === GameState.EliminationRoundFailed}
        <p style="margin-bottom: 0.5em;">C'est l'heure!</p>
        <p style="margin-top: 0.5em;">
          <b>Tous les deux joueurs sont éliminés!</b>
        </p>
      {/if}

      {#if state === GameState.GameOver}
        <p>Félicitations à {victor.name}!</p>
      {/if}

      {#if state === GameState.PlayAgainPrompt}
        <p>Jouer encore?</p>
      {/if}
    </Card>
  </div>

  {#if state === GameState.QuestionDisplayed || state === GameState.EliminationQuestionDisplayed}
    <h1 style="font-size: 6em; margin: 0;{timer === 0 ? ' color: red;' : ''}">
      00:{timer.toString().padStart(2, '0')}
    </h1>
  {/if}

  {#if state === GameState.AnswerDisplayed || state === GameState.EliminationAnswerDisplayed}
    <h2>Le joueur a-t-il répondu correctement?</h2>
    <Button on:click={() => nextPlayer(true)} variant="raised">
      <Label>Oui</Label>
      <Icon class="material-icons">check</Icon>
    </Button>
    <Button on:click={() => nextPlayer(false)} variant="raised">
      <Label>Non</Label>
      <Icon class="material-icons">close</Icon>
    </Button>
  {/if}

  {#if state === GameState.EliminationPlayerAnswered}
    <h2>Choissiez le joueur qui a répondu:</h2>
    <Button on:click={() => eliminationRoundSelectPlayer(0)} variant="raised">
      <Label>{eliminationPlayers[0].name}</Label>
    </Button>
    <Button on:click={() => eliminationRoundSelectPlayer(1)} variant="raised">
      <Label>{eliminationPlayers[1].name}</Label>
    </Button>
  {/if}
</div>

<style>
  .card-container {
    border-radius: var(--mdc-shape-medium, 4px);
  }

  .player-name {
    color: var(--mdc-theme-primary, #ff3e00);
  }
</style>
