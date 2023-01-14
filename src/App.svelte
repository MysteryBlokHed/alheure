<script lang="ts">
  import Button, { Icon, Label } from '@smui/button'

  import Game from './lib/Game.svelte'
  import PlayerList from './lib/PlayerList.svelte'
  import Help from './lib/Rules.svelte'
  import Setup from './lib/Setup.svelte'

  import { players as playersStore, started as startedStore } from './stores'
  import type { Player } from './types'

  let players: Player[]
  playersStore.subscribe(value => (players = value))
  let started: boolean
  startedStore.subscribe(value => (started = value))
</script>

<main>
  <h1>À l'heure</h1>
  {#if !started}
    <Setup />
  {:else}
    <Game />
    <br />
    <PlayerList />
    <br />
  {/if}
  <br />
  <Help />
  <br />
  <br />
  <Button
    variant="raised"
    color="secondary"
    href="//gitlab.com/MysteryBlokHed/alheure"
    target="_blank"
    rel="noreferrer"
  >
    <Label>Source</Label>
    <Icon class="material-icons">open_in_new</Icon>
  </Button>
</main>
