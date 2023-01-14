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
    <p>Il y aura quelque chose ici plus tard.</p>
  </Content>
  <Actions>
    <Button on:click={() => (open = false)}>
      <Label>Fermer</Label>
    </Button>
  </Actions>
</Dialog>
