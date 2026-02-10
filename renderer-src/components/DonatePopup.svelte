<script>
  import SparklesIcon from '$icons/outline/SparklesIcon.svelte'
  import XIcon from '$icons/outline/XIcon.svelte'

  export let onDonateClick = null, onCloseClick = null
</script>

<div class="absolute flex flex-col space-y-3 right-2 bottom-12 z-[9999] max-w-md px-5 py-4 bg-slate-900 text-slate-300 rounded-lg border border-slate-800">

  <div class="space-x-2 flex flex-row items-center">
    <div class="w-5 h-5 grow-0 shrink-0 text-violet-400">
      <SparklesIcon />
    </div>

    <div class="font-semibold text-lg text-slate-100 grow-0 shrink-0">Congratulations!</div>

    <div class="w-full grow-1 shrink-1"></div>

    <button class="w-5 h-5 grow-0 shrink-0 text-slate-500 hover:text-slate-300 transition-colors" on:click={onCloseClick}>
      <XIcon />
    </button>
  </div>

  <p class="text-sm leading-relaxed">Looks like you&apos;ve been using StemRoller Next a lot lately! If you find my app useful, please consider <button class="text-violet-400 hover:text-violet-300 underline underline-offset-2 transition-colors" on:click={onDonateClick}>buying me a coffee</button>. Your support motivates me to continue building great products!</p>

  <p class="text-slate-500 text-sm italic leading-relaxed">...and even if you choose not to donate, I still want to thank you for using my app! StemRoller Next will always be free for anyone to enjoy - no strings attached. Sharing StemRoller Next via social media or word-of-mouth is always appreciated.</p>
</div>
