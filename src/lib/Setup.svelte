<script lang="ts">
  import Button, { Icon, Label } from '@smui/button'
  import IconButton from '@smui/icon-button'
  import Snackbar, { Actions } from '@smui/snackbar'
  import Textfield from '@smui/textfield'

  import { players as playersStore, started as startedStore } from '../stores'
  import { PlayerState, type Player } from '../types'

  import '../theme/snackbar.scss'

  let uid = 1
  let players: Player[]

  playersStore.subscribe(value => (players = value))

  /* eslint-disable @typescript-eslint/no-unsafe-call */
  /* eslint-disable-next-line @typescript-eslint/no-explicit-any */
  let snackbar: Snackbar & { open: any }
  let snackbarLabel: string

  const tryStart = () => {
    // Ensure no names are empty
    const empty = players.filter(player => !player.name)

    console.log(empty)

    if (empty.length) {
      for (const player of empty) {
        player.invalid = true
      }
      players = players

      snackbarLabel = 'Les noms des joueurs ne peuvent pas être vides'
      snackbar.open()
      throw new Error('Player names cannot be empty')
    } else {
      for (const player of players.values()) {
        player.invalid = false
      }
      players = players
    }

    // Ensure that names are unique
    const names = players.map(player => player.name)

    if (new Set(names).size !== names.length) {
      snackbarLabel = 'Les noms des joueurs ne sont pas uniques'
      snackbar.open()
      throw new Error('Player names are not unique')
    }

    // Ensure that there are enough players
    if (players.length < 2) {
      snackbarLabel = 'Pas assez de joueurs'
      snackbar.open()
      throw new Error('Not enough players')
    }

    playersStore.set(players)
    startedStore.set(true)

    console.log('Game started with players', players)
  }
</script>

<Snackbar bind:this={snackbar} labelText={snackbarLabel} class="error">
  <Label />
  <Actions>
    <IconButton class="material-icons" title="Dismiss">close</IconButton>
  </Actions>
</Snackbar>

<div>
  {#each players as player}
    <Textfield
      bind:value={player.name}
      bind:invalid={player.invalid}
      on:change={() => (player.invalid = false)}
      label="Nom du joueur"
    />
    <IconButton
      on:click={() => {
        const index = players.indexOf(player)
        players.splice(index, 1)
        players = players
      }}
      class="material-icons"
    >
      delete
    </IconButton>
    <br />
  {/each}
  <Button
    on:click={() => {
      players.push({
        uid,
        name: '',
        invalid: false,
        state: PlayerState.Playing,
      })
      uid++
      players = players
    }}
  >
    <Label>Ajouter un joueur</Label>
    <Icon class="material-icons">add_circle</Icon>
  </Button>
  <br />
  <br />
  <Button variant="raised" on:click={tryStart}>
    <Label>Commencer</Label>
    <Icon class="material-icons">check</Icon>
  </Button>
</div>
