import { writable } from 'svelte/store'

import { PlayerState, type Player } from './types'

export const started = writable(false)
export const players = writable<Player[]>([
  {
    uid: 0,
    name: '',
    invalid: false,
    state: PlayerState.Playing,
  },
])
