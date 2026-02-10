<script>
  import { onMount } from 'svelte'
  import Button from '$components/Button.svelte'
  import CogIcon from '$icons/outline/CogIcon.svelte'
  import XIcon from '$icons/outline/XIcon.svelte'
  import FolderOpenIcon from '$icons/solid/FolderOpenIcon.svelte'

  export let onCloseClick = null

  let pyTorchBackend = null
  let outputPath = null
  let modelName = null
  let outputFormat = null
  let localFileOutputToContainingDir = null
  let prefixStemFilenameWithSongName = null
  let preserveOriginalAudio = null
  let mounted = false

  async function handleBrowseStems() {
    const newOutputPath = await window.browseOutputPath()
    if (newOutputPath) {
      outputPath = newOutputPath
    }
  }

  onMount(async () => {
    pyTorchBackend = await window.getPyTorchBackend()
    outputPath = await window.getOutputPath()
    modelName = await window.getModelName()
    outputFormat = await window.getOutputFormat()
    localFileOutputToContainingDir = await window.getLocalFileOutputToContainingDir()
    prefixStemFilenameWithSongName = await window.getPrefixStemFilenameWithSongName()
    preserveOriginalAudio = await window.getPreserveOriginalAudio()
    mounted = true
  })

  $: {
    if (mounted && pyTorchBackend) {
      window.setPyTorchBackend(pyTorchBackend)
    }
  }
  $: {
    if (mounted && modelName) {
      window.setModelName(modelName)
    }
  }
  $: {
    if (mounted && outputFormat) {
      window.setOutputFormat(outputFormat)
    }
  }
  $: {
    if (mounted && localFileOutputToContainingDir !== null) {
      window.setLocalFileOutputToContainingDir(localFileOutputToContainingDir)
    }
  }
  $: {
    if (mounted && prefixStemFilenameWithSongName !== null) {
      window.setPrefixStemFilenameWithSongName(prefixStemFilenameWithSongName)
    }
  }
  $: {
    if (mounted && preserveOriginalAudio !== null) {
      window.setPreserveOriginalAudio(preserveOriginalAudio)
    }
  }
</script>

<div
  class="absolute flex flex-col left-2 bottom-12 z-[9999] w-[28rem] px-5 py-4 bg-slate-900 text-slate-300 rounded-lg border border-slate-800"
>
  <div class="space-x-2 flex flex-row items-center mb-3">
    <div class="w-5 h-5 grow-0 shrink-0 text-slate-400">
      <CogIcon />
    </div>

    <div class="font-semibold text-lg text-slate-100 grow-0 shrink-0">Preferences</div>

    <div class="w-full grow-1 shrink-1"></div>

    <button class="w-5 h-5 grow-0 shrink-0 text-slate-500 hover:text-slate-300 transition-colors" on:click={onCloseClick}>
      <XIcon />
    </button>
  </div>

  <div class="text-sm font-semibold text-slate-200 mb-1">Stems output path</div>

  <div class="flex flex-row space-x-2 mb-3">
    <div
      class="flex-1 w-full min-w-0 border border-slate-800 bg-slate-950 text-slate-400 px-3 py-2 rounded-lg text-sm truncate"
    >
      {outputPath || ''}
    </div>
    <Button Icon={FolderOpenIcon} text="Browse" onClick={handleBrowseStems} />
  </div>

  <div class="space-x-2 flex flex-row items-center justify-start mb-2">
    <input
      id="checkboxLocalFileOutputToContainingDir"
      type="checkbox"
      class="w-4 h-4 grow-0 shrink-0 accent-violet-500"
      bind:checked={localFileOutputToContainingDir}
    />

    <label for="checkboxLocalFileOutputToContainingDir" class="grow-0 shrink-0 text-sm"
      >When splitting local files, use input file directory</label
    >
  </div>

  <div class="space-x-2 flex flex-row items-center justify-start mb-2">
    <input
      id="checkboxPrefixStemFilenameWithSongName"
      type="checkbox"
      class="w-4 h-4 grow-0 shrink-0 accent-violet-500"
      bind:checked={prefixStemFilenameWithSongName}
    />

    <label for="checkboxPrefixStemFilenameWithSongName" class="grow-0 shrink-0 text-sm"
      >Prefix stem name with song name</label
    >
  </div>

  <div class="space-x-2 flex flex-row items-center justify-start mb-3">
    <input
      id="checkboxPreserveOriginalAudio"
      type="checkbox"
      class="w-4 h-4 grow-0 shrink-0 accent-violet-500"
      bind:checked={preserveOriginalAudio}
    />

    <label for="checkboxPreserveOriginalAudio" class="grow-0 shrink-0 text-sm"
      >Preserve original audio</label
    >
  </div>

  <div class="text-sm font-semibold text-slate-200 mb-1">Stems output format</div>

  <select
    class="border border-slate-800 bg-slate-950 text-slate-300 focus:outline-none focus:ring-2 focus:ring-violet-500/50 px-3 py-2 mb-3 rounded-lg text-sm"
    bind:value={outputFormat}
  >
    <option value="wav" class="bg-slate-950 text-slate-300">WAV</option>
    <option value="flac" class="bg-slate-950 text-slate-300">FLAC</option>
    <option value="mp3" class="bg-slate-950 text-slate-300">MP3</option>
    <option value="aac" class="bg-slate-950 text-slate-300">AAC</option>
  </select>

  <div class="text-sm font-semibold text-slate-200 mb-1">Separation model</div>

  <select
    class="border border-slate-800 bg-slate-950 text-slate-300 focus:outline-none focus:ring-2 focus:ring-violet-500/50 px-3 py-2 mb-3 rounded-lg text-sm"
    bind:value={modelName}
  >
    <option value="htdemucs" class="bg-slate-950 text-slate-300">4-channel (Fast)</option>
    <option value="htdemucs_ft" class="bg-slate-950 text-slate-300"
      >4-channel (Finetuned)</option
    >
    <option value="htdemucs_6s" class="bg-slate-950 text-slate-300"
      >6-channel (Experimental)</option
    >
  </select>

  <div class="text-sm font-semibold text-slate-200 mb-1">Backend</div>

  <p class="mb-2 text-slate-500 text-xs">Try &quot;Always use CPU&quot; if splitting fails on your device.</p>

  <select
    class="border border-slate-800 bg-slate-950 text-slate-300 focus:outline-none focus:ring-2 focus:ring-violet-500/50 px-3 py-2 rounded-lg text-sm"
    bind:value={pyTorchBackend}
  >
    <option value="auto" class="bg-slate-950 text-slate-300"
      >Use GPU (if available)</option
    >
    <option value="cpu" class="bg-slate-950 text-slate-300">Always use CPU</option>
  </select>
</div>
