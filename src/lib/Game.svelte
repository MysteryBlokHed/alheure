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

  /** Keep this up-to-date with the animation length */
  const flipTime = 750

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
  /** How much the timer is decreased by when a round passes without eliminations */
  const timerDecrement = 5
  /** The smallest amount of time allowed for the timer */
  const minTimer = 3
  /** The current value for the timer*/
  let timer = timerSet
  /** The number of the interval to count down the timer*/
  let timerInterval: number

  /** The list of active players*/
  let players: Player[]
  /** The current player's index */
  let current = 0
  /** The victor, when the game is over */
  let victor: Player

  /**
   * The list of available questions.
   * Every time a question is used, it's removed from the list
   */
  let availableQuestions = [...questions]
  /** The current question */
  let question: Question = availableQuestions[0]

  /** Whether anyone was eliminated for the current round */
  let anyEliminated = false

  $: if (state === GameState.GameOver) {
    confetti({
      particleCount: 250,
      spread: 100,
      angle: 0,
      origin: { x: -0.1, y: 0.5 },
      disableForReducedMotion: true,
    })
    confetti({
      particleCount: 250,
      spread: 100,
      angle: 180,
      origin: { x: 1.1, y: 0.5 },
      disableForReducedMotion: true,
    })
  }

  playersStore.subscribe(value => (players = value))

  // Prevent the space bar from scrolling the page
  window.addEventListener('keydown', event => {
    if (event.key === ' ') event.preventDefault()
    return false
  })

  // Simulate a click on the card when the space bar is pressed
  window.addEventListener('keyup', event => {
    if (event.key === ' ') container?.click()
  })

  /**
   * Start the flip animation and update the game state
   * @param newState The name game state
   * @param callback Called when content is safe to change
   */
  const flipAndChangeState = (newState: GameState, callback?: () => void) => {
    cardEnabled = false
    container?.classList.add('flip')

    // Reset state and run callback
    setTimeout(() => {
      state = newState
      callback?.()
    }, flipTime / 2)

    // Re-enable card interaction and remove flip class
    setTimeout(() => {
      container.classList.remove('flip')
      cardEnabled = true
    }, flipTime)
  }

  /**
   * Start the flip animation and increment the game state by 1
   * @param callback Called when content is safe to change
   */
  const flipAndNextState = (callback?: () => void) => {
    flipAndChangeState(state + 1, callback)
  }

  /**
   * Get a description of the category to show to a user
   * @param category The category
   */
  const getCategory = (category: QuestionCategory): string => {
    switch (category) {
      case QuestionCategory.FindTense:
        return 'Nommer le temps de verbe'
      case QuestionCategory.Conjugate:
        return 'Bien conjuguer le verbe (ou les verbes)'
    }
  }

  /** Run the timer. Doesn't reset the timer if it's already running */
  const runTimer = () => {
    timerInterval = window.setInterval(() => {
      if (--timer === 0) {
        clearInterval(timerInterval)
      }
    }, 1000)
  }

  /** Reset the timer */
  const resetTimer = (newTime?: number) => {
    clearInterval(timerInterval)
    timer = newTime ?? timerSet
  }

  /** Called when a full round has been completed */
  const fullRoundDone = () => {
    console.log('Round done')
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
  }

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
   * Go to the next player
   * @param lastCorrect Whether the last player was correct
   */
  const nextPlayer = (lastCorrect: boolean) => {
    // Eliminate player if required
    if (!lastCorrect) {
      players[current].state = PlayerState.Eliminated
      playersStore.set(players)
      if (checkGameOver()) return
    }

    // Select next player
    if (current !== players.length - 1) {
      current++
    } else {
      current = 0
      fullRoundDone()
    }
    flipAndChangeState(GameState.NewRound)
  }

  /** Handle the card being clicked */
  const cardClick = () => {
    if (!cardEnabled) return

    switch (state) {
      // Prompt to start game
      case GameState.Pregame:
        flipAndNextState()
        break

      // Pick a question and reveal its category
      case GameState.NewRound:
        // Pick question and remove it from available questions
        if (!availableQuestions.length) availableQuestions = [...questions]

        question =
          availableQuestions[
            Math.floor(Math.random() * availableQuestions.length)
          ]
        availableQuestions.splice(availableQuestions.indexOf(question), 1)

        flipAndNextState()
        break

      // Reveal the question and start the timer
      case GameState.PreQuestion:
        flipAndNextState(runTimer)
        break

      // Reveal the answer and ask if the player answered correctly
      case GameState.QuestionDisplayed:
        flipAndNextState(resetTimer)
        break

      // Do nothing; the state change is handled elsewhere
      case GameState.AnswerDisplayed:
      case GameState.GameOver:
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
    {:else if state !== GameState.GameOver}
      Tour de <b style:color="var(--mdc-theme-primary, #ff3e00)">
        {players[current].name}
      </b>
    {:else}
      <b style:color="var(--mdc-theme-primary, #ff3e00)">
        {victor.name}
      </b>
      a gagné!
    {/if}
  </h2>

  <div
    role="button"
    class="card-container"
    bind:this={container}
    use:Ripple={{ surface: true }}
    on:click={cardClick}
    on:keyup={event => {
      /* eslint-disable-next-line @typescript-eslint/no-unsafe-member-access */
      if (event.key === 'Enter') container.click()
    }}
    tabindex="0"
  >
    <Card>
      {#if state === GameState.Pregame}
        Prêt à jouer?
      {/if}

      {#if state === GameState.NewRound}
        Cliquer pour voir la catégorie
      {/if}

      {#if state === GameState.PreQuestion}
        <p style="margin-bottom: 0.5em;">
          <b>Catégorie: {getCategory(question.category)}</b>
        </p>
        <p style="margin-top: 0.5em;">Cliquer pour commencer</p>
      {/if}

      {#if state === GameState.QuestionDisplayed}
        {#if timer > 0}
          <p>{question.question}</p>
        {:else}
          <p>C'est l'heure!</p>
        {/if}
      {/if}

      {#if state === GameState.AnswerDisplayed}
        <p>Réponse: {question.answer}</p>
      {/if}

      {#if state === GameState.GameOver}
        <p>Félicitations à {victor.name}!</p>
      {/if}
    </Card>
  </div>

  {#if state === GameState.QuestionDisplayed}
    <h1 style="font-size: 6em; margin: 0;{timer === 0 ? ' color: red;' : ''}">
      00:{timer.toString().padStart(2, '0')}
    </h1>
  {/if}

  {#if state === GameState.AnswerDisplayed}
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
</div>

<style>
  .card-container {
    border-radius: var(--mdc-shape-medium, 4px);
  }
</style>
