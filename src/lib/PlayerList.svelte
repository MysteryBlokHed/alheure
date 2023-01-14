<script lang="ts">
  import DataTable, { Head, Body, Row, Cell } from '@smui/data-table'

  import { players as playersStore } from '../stores'
  import { PlayerState, type Player } from '../types'

  /* eslint-disable @typescript-eslint/no-unsafe-argument */

  let players: Player[]

  playersStore.subscribe(value => (players = value))

  const getState = (state: PlayerState): string => {
    switch (state) {
      case PlayerState.Playing:
        return 'Jouant'
      case PlayerState.Limbo:
        return "Tour d'Élimination"
      case PlayerState.Eliminated:
        return 'Éliminé(e)'
    }
  }
</script>

<DataTable table$aria-label="List of player states">
  <Head>
    <Row>
      <Cell>Nom du joueur</Cell>
      <Cell>État</Cell>
    </Row>
  </Head>
  <Body>
    {#each players as player}
      <Row>
        <Cell>{player.name}</Cell>
        <Cell>{getState(player.state)}</Cell>
      </Row>
    {/each}
  </Body>
</DataTable>
