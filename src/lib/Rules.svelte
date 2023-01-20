<script lang="ts">
  import Button, { Icon, Label } from '@smui/button'
  import Dialog, { Title, Content, Actions } from '@smui/dialog'

  let open = false
</script>

<Button variant="raised" color="secondary" on:click={() => (open = true)}>
  <Label>Règles</Label>
  <Icon class="material-icons">help</Icon>
</Button>

<Dialog
  bind:open
  aria-labelledby="help-modal-title"
  aria-describedby="help-modal-content"
  surface$style="width: 500px; max-width: calc(100vw - 32px);"
>
  <Title id="help-modal-title">Règles</Title>
  <Content id="help-modal-content">
    <b>Joueurs: 2 ou plus</b>

    <h2>Règles</h2>
    <p>
      Il y a des cartes avec des questions de grammaire et un minuteur qui
      commence à 20 secondes. Chaque fois qu'un tour se termine sans
      éliminations, le temps sur le minuteur diminue par 5 secondes, avec un
      temps minimal de 3 secondes.
    </p>
    <p>
      Chaque joueur doit répondre à la question en le temps donné (à l'heure).
      Si le joueur ne donne pas la bonne réponse ou ne répond pas à temps, il
      entre dans le tour d'élimination.
    </p>
    <p>Le tour d'élimination n'a pas lieu s'il y a seulement deux joueurs.</p>

    <h2>Le tour d'élimination</h2>
    <p>
      Quand deux joueurs sont éliminées, il y a une question partagée entre les
      deux. Les joueurs doivent « buzz in » pour réponde à la question quand
      elle est révélée. « Buzzing in » peut être fait en mettant un objet (ex.
      un morceau de papier) entre les deux joueurs et voir qui prend le papier
      en premier, ou sinon en voyant qui peut donner la réponse en premier.
    </p>
    <p>
      Si le joueur répond correctement à la question, il reste dans le jeu et
      l'autre est éliminé. Mais si le joueur ne donne pas la bonne réponse, il
      est éliminé et l'autre continue à jouer.
    </p>
  </Content>
  <Actions>
    <Button on:click={() => (open = false)}>
      <Label>Fermer</Label>
    </Button>
  </Actions>
</Dialog>
