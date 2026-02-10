import process from 'process'
import fs from 'fs'
import fsPromises from 'fs/promises'
import path from 'path'
import { pipeline } from 'stream/promises'
import { execFile } from 'child_process'
import { promisify } from 'util'
import fetch from 'node-fetch'
import extractZip from 'extract-zip'
import sevenBin from '7zip-bin'
import node7z from 'node-7z'
import tar from 'tar'

const execFileAsync = promisify(execFile)

function extract7z(archivePath, outPath) {
  return new Promise((resolve, reject) => {
    const pathTo7zip = sevenBin.path7za
    const seven = node7z.extractFull(archivePath, outPath, {
      $bin: pathTo7zip,
    })
    seven.on('end', resolve)
    seven.on('error', reject)
  })
}

let winOrMac = null
if (process.platform === 'win32') {
  winOrMac = 'win'
} else if (process.platform === 'darwin') {
  winOrMac = 'mac'
}

// Target architecture: use STEMROLLER_TARGET_ARCH env var if set, otherwise detect from runtime
const targetArch = process.env.STEMROLLER_TARGET_ARCH || process.arch

async function downloadFile(url, filePath) {
  const response = await fetch(url)
  if (!response.ok) {
    throw new Error(`Reponse error: ${response.statusText}`)
  }
  await pipeline(response.body, fs.createWriteStream(filePath))
}

async function fileExists(filePath) {
  try {
    await fsPromises.access(filePath, fs.constants.R_OK)
    return true
  } catch (err) {
    return false
  }
}

async function moveDirChildrenUpAndDeleteDir(dirName) {
  const parentDirName = path.resolve(path.join(dirName, '..'))
  const fileNames = await fsPromises.readdir(dirName)
  for (const fileName of fileNames) {
    const srcPath = path.join(dirName, fileName)
    const destPath = path.join(parentDirName, fileName)
    console.log(`Moving: "${srcPath}" to "${destPath}"`)
    if (await fileExists(destPath)) {
      console.log(`Deleting: "${destPath}"`)
      await fsPromises.rm(destPath, {
        force: true,
        recursive: true,
      })
      console.log(`Delete succeeded: "${destPath}"`)
    }
    await fsPromises.rename(srcPath, destPath)
    console.log(`Move succeeded: "${srcPath}" to "${destPath}"`)
  }

  console.log(`Deleting: "${dirName}"`)
  await fsPromises.rm(dirName, {
    force: true,
    recursive: true,
  })
  console.log(`Delete succeeded: "${dirName}"`)
}

// Standalone Python version for bundled demucs
const PYTHON_BUILD_TAG = '20260203'
const PYTHON_VERSION = '3.13.12'

function getPythonPlatformTriple() {
  if (process.platform === 'darwin') {
    const archName = targetArch === 'arm64' ? 'aarch64' : 'x86_64'
    return `${archName}-apple-darwin`
  } else {
    return 'x86_64-pc-windows-msvc'
  }
}

function getPythonBinPath(pythonDir) {
  if (process.platform === 'win32') {
    return path.join(pythonDir, 'python.exe')
  }
  return path.join(pythonDir, 'bin', 'python3')
}

async function setupBundledDemucs() {
  const demucsDir = path.join(`${winOrMac}-extra-files`, 'ThirdPartyApps', 'demucs')
  const pythonDir = path.join(demucsDir, 'python')
  const pythonBin = getPythonBinPath(pythonDir)

  if (await fileExists(pythonBin)) {
    console.log('Bundled Python + demucs already set up, skipping')
    return
  }

  console.log(`Setting up standalone Python ${PYTHON_VERSION} (${targetArch}) with demucs...`)
  await fsPromises.mkdir(demucsDir, { recursive: true })

  // Download standalone Python
  const platformTriple = getPythonPlatformTriple()
  const pythonTarball = `cpython-${PYTHON_VERSION}+${PYTHON_BUILD_TAG}-${platformTriple}-install_only_stripped.tar.gz`
  const pythonUrl = `https://github.com/astral-sh/python-build-standalone/releases/download/${PYTHON_BUILD_TAG}/${pythonTarball}`
  const tarballPath = path.join(demucsDir, pythonTarball)

  console.log(`Downloading: "${pythonUrl}"`)
  await downloadFile(pythonUrl, tarballPath)
  console.log('Download successful!')

  // Extract tarball
  console.log('Extracting standalone Python...')
  await tar.extract({
    file: tarballPath,
    cwd: demucsDir,
  })
  console.log('Extraction successful!')

  // Delete tarball
  await fsPromises.rm(tarballPath)

  // Install demucs via pip
  console.log('Installing demucs via pip...')
  const { stdout, stderr } = await execFileAsync(pythonBin, ['-m', 'pip', 'install', 'demucs', 'torchcodec'], {
    timeout: 600000,
  })
  if (stdout) console.log(stdout)
  if (stderr) console.error(stderr)
  console.log('demucs installed successfully!')

  // Patch demucs for PyTorch 2.6+ (weights_only default changed to True)
  console.log('Patching demucs for PyTorch 2.6+ compatibility...')
  const { stdout: siteOut } = await execFileAsync(pythonBin, [
    '-c',
    'import demucs.states; print(demucs.states.__file__)',
  ])
  const statesPath = siteOut.trim()
  const statesContent = await fsPromises.readFile(statesPath, 'utf-8')
  await fsPromises.writeFile(
    statesPath,
    statesContent.replace("torch.load(path, 'cpu')", "torch.load(path, 'cpu', weights_only=False)")
  )
  console.log('Patch applied successfully!')
}

async function main() {
  console.log(`Target architecture: ${targetArch}`)

  const downloads = [
    [
      'https://dl.fbaipublicfiles.com/demucs/hybrid_transformer/f7e0c4bc-ba3fe64a.th',
      path.join('anyos-extra-files', 'Models', 'f7e0c4bc-ba3fe64a.th'),
    ],
    [
      'https://dl.fbaipublicfiles.com/demucs/hybrid_transformer/d12395a8-e57c48e6.th',
      path.join('anyos-extra-files', 'Models', 'd12395a8-e57c48e6.th'),
    ],
    [
      'https://dl.fbaipublicfiles.com/demucs/hybrid_transformer/92cfc3b6-ef3bcb9c.th',
      path.join('anyos-extra-files', 'Models', '92cfc3b6-ef3bcb9c.th'),
    ],
    [
      'https://dl.fbaipublicfiles.com/demucs/hybrid_transformer/04573f0d-f3cf25b2.th',
      path.join('anyos-extra-files', 'Models', '04573f0d-f3cf25b2.th'),
    ],
    [
      'https://raw.githubusercontent.com/facebookresearch/demucs/main/demucs/remote/htdemucs_ft.yaml',
      path.join('anyos-extra-files', 'Models', 'htdemucs_ft.yaml'),
    ],
    [
      'https://dl.fbaipublicfiles.com/demucs/hybrid_transformer/955717e8-8726e21a.th',
      path.join('anyos-extra-files', 'Models', '955717e8-8726e21a.th'),
    ],
    [
      'https://raw.githubusercontent.com/facebookresearch/demucs/main/demucs/remote/htdemucs.yaml',
      path.join('anyos-extra-files', 'Models', 'htdemucs.yaml'),
    ],
    [
      'https://dl.fbaipublicfiles.com/demucs/hybrid_transformer/5c90dfd2-34c22ccb.th',
      path.join('anyos-extra-files', 'Models', '5c90dfd2-34c22ccb.th'),
    ],
    [
      'https://raw.githubusercontent.com/facebookresearch/demucs/main/demucs/remote/htdemucs_6s.yaml',
      path.join('anyos-extra-files', 'Models', 'htdemucs_6s.yaml'),
    ],
  ]

  if (process.platform === 'win32') {
    downloads.push(
      [
        'https://www.gyan.dev/ffmpeg/builds/ffmpeg-release-essentials.zip',
        path.join(
          `${winOrMac}-extra-files`,
          'ThirdPartyApps',
          'ffmpeg',
          'ffmpeg-release-essentials.zip'
        ),
      ],
      [
        'https://github.com/yt-dlp/yt-dlp/releases/download/2026.02.04/yt-dlp_win.zip',
        path.join(`${winOrMac}-extra-files`, 'ThirdPartyApps', 'yt-dlp', 'yt-dlp_win.zip'),
      ]
    )
  } else if (process.platform === 'darwin') {
    if (targetArch === 'arm64') {
      // arm64: use Martin Riedl's ffmpeg build server
      downloads.push(
        [
          'https://ffmpeg.martin-riedl.de/redirect/latest/macos/arm64/release/ffmpeg.zip',
          path.join(`${winOrMac}-extra-files`, 'ThirdPartyApps', 'ffmpeg', 'ffmpeg-release.zip'),
        ],
        [
          'https://ffmpeg.martin-riedl.de/redirect/latest/macos/arm64/release/ffprobe.zip',
          path.join(`${winOrMac}-extra-files`, 'ThirdPartyApps', 'ffmpeg', 'ffprobe-release.zip'),
        ]
      )
    } else {
      // x64: use evermeet.cx
      downloads.push(
        [
          'https://evermeet.cx/ffmpeg/getrelease/zip',
          path.join(`${winOrMac}-extra-files`, 'ThirdPartyApps', 'ffmpeg', 'ffmpeg-release.zip'),
        ],
        [
          'https://evermeet.cx/ffmpeg/getrelease/ffprobe/zip',
          path.join(`${winOrMac}-extra-files`, 'ThirdPartyApps', 'ffmpeg', 'ffprobe-release.zip'),
        ]
      )
    }

    downloads.push([
      'https://github.com/yt-dlp/yt-dlp/releases/download/2026.02.04/yt-dlp_macos.zip',
      path.join(`${winOrMac}-extra-files`, 'ThirdPartyApps', 'yt-dlp', 'yt-dlp_macos.zip'),
    ])
  }

  for (const download of downloads) {
    if (!(await fileExists(download[1]))) {
      console.log(`Downloading: "${download[0]}"`)
      await downloadFile(download[0], download[1])
      console.log(`Download successful! Saved "${download[0]}" to "${download[1]}"`)
    }
  }

  for (const download of downloads) {
    const ext = path.extname(download[1])
    if (ext === '.zip' || ext === '.7z') {
      console.log(`Extracting: "${download[1]}"`)
      const dirName = path.dirname(download[1])
      const outDir = path.resolve(dirName)
      if (ext === '.zip') {
        await extractZip(download[1], { dir: outDir })
      } else {
        await extract7z(download[1], outDir)
      }
      console.log(`Extraction successful! Extracted "${download[1]}" to "${dirName}"`)
      console.log(`Deleting: "${download[1]}"`)
      await fsPromises.rm(download[1], {
        force: true,
        recursive: true,
      })
      console.log(`Delete succeeded: "${download[1]}"`)
    }
  }

  // Set up bundled Python + demucs
  await setupBundledDemucs()

  if (process.platform === 'win32') {
    await moveDirChildrenUpAndDeleteDir(
      path.join(
        `${winOrMac}-extra-files`,
        'ThirdPartyApps',
        'ffmpeg',
        'ffmpeg-8.0-essentials_build'
      )
    )
  } else if (process.platform === 'darwin') {
    console.log('Moving: ffmpeg and ffprobe')
    await fsPromises.rename(
      path.join(`${winOrMac}-extra-files`, 'ThirdPartyApps', 'ffmpeg', 'ffmpeg'),
      path.join(`${winOrMac}-extra-files`, 'ThirdPartyApps', 'ffmpeg', 'bin', 'ffmpeg')
    )
    await fsPromises.rename(
      path.join(`${winOrMac}-extra-files`, 'ThirdPartyApps', 'ffmpeg', 'ffprobe'),
      path.join(`${winOrMac}-extra-files`, 'ThirdPartyApps', 'ffmpeg', 'bin', 'ffprobe')
    )
    console.log('Move successful: ffmpeg and ffprobe')

    console.log('Renaming yt-dlp_macos to yt-dlp')
    await fsPromises.rename(
      path.join(`${winOrMac}-extra-files`, 'ThirdPartyApps', 'yt-dlp', 'yt-dlp_macos'),
      path.join(`${winOrMac}-extra-files`, 'ThirdPartyApps', 'yt-dlp', 'yt-dlp')
    )
    console.log('Rename successful: yt-dlp_macos to yt-dlp')
  }
}

main()
