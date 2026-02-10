<script>
  export let Icon = null, text = null, disabled = false, highlighted = false, flashing = false, onClick = null

  let styles = null
  $: {
    styles = 'whitespace-nowrap flex items-center justify-center px-3 py-2 outline-none focus:outline-none text-sm font-medium '

    if (highlighted) {
      styles += 'bg-slate-800 text-slate-100 '
    } else if (flashing) {
      styles += 'bottom-bar-button-flash '
    } else {
      styles += 'text-slate-400 bg-slate-950 '
    }

    if (disabled) {
      styles += 'cursor-auto opacity-50'
    } else if (!flashing) {
      styles += 'hover:bg-slate-900 hover:text-slate-200 active:bg-slate-800 transition-colors'
    }
  }
</script>

<button class={styles} on:click={onClick || ((event) => event.preventDefault())}>
  <div class="w-4 h-4 mr-2">
    <svelte:component this={Icon} />
  </div>
  <span>{text}</span>
</button>
