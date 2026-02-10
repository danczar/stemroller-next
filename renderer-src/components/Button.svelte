<script>
  export let Icon = null, text = null, disabled = false, onClick = null

  let styles = null
  $: {
    styles = 'whitespace-nowrap flex items-center justify-center px-4 py-2 rounded-lg text-slate-950 font-medium bg-violet-500 outline-none focus:outline-none '
    if (disabled) {
      styles += 'cursor-auto opacity-50'
    } else {
      styles += 'hover:bg-violet-400 active:bg-violet-600 focus:ring-2 focus:ring-violet-500/50 focus:ring-offset-2 focus:ring-offset-slate-950 transition-colors'
    }
  }
</script>

<button class={styles} on:click={onClick || ((event) => event.preventDefault())}>
  <div class="w-4 h-4 mr-2">
    <svelte:component this={Icon} />
  </div>
  <span>{text}</span>
</button>
