const JSONStream = require("JSONStream")
const fs = require("fs")
const path = require("path")
const glob = require("glob-promise")

const toAbsPath = (pth) => {
  return path.isAbsolute(pth) ? pth : path.resolve(".", pth)
}

const mkdirAll = async (dirs) => {
  for (const dir of dirs) {
    await fs.promises.mkdir(toAbsPath(dir), { recursive: true })
  }
}

const deduplicate = (array) => {
  const set = new Set(array)
  return [...set]
}

const collectDirs = (files) => {
  const dirs = files.map((file) => path.dirname(file))
  return deduplicate(dirs)
}

const isDumpData = (name, eventType) => {
  if (eventType === "I") return false
  if (name.includes("Paint") && name !== "PrePaint") return true
  if (name === "Layout") return true
  if (name.includes("Composite")) return true
  if (name.includes("Animation")) return true
  return false
}

const calcTotalDuration = (timelineArray, targetName) => {
  return timelineArray.reduce((total, obj) => {
    return obj.name === targetName ? total + obj.duration : total
  }, 0)
}

const calcTimestampDiff = (startTs, endTs) => {
  const start = new Date(startTs)
  const end = new Date(endTs)
  return end - start
}

const parseProfile = (srcPath, destPath) => {
  const stream = fs.createReadStream(srcPath).pipe(JSONStream.parse("$*"))
  const dest = fs.createWriteStream(destPath)

  let chunk = []

  let startAnimationTs = 0
  let endAnimationTs = 0

  stream.on("data", ({ value }) => {
    let name = value.name
    const eventType = value.ph
    const timestamp = value.ts
    if (name === "Animation") {
      if (eventType === "b") {
        startAnimationTs = timestamp
        name = "BEGIN Animation"
      } else if (eventType === "e") {
        endAnimationTs = timestamp
        name = "END Animation"
      } else {
        return
      }
    }
    const duration = value.dur
    if (!isDumpData(name, eventType)) return
    const data = { name, duration, timestamp }
    if (data) {
      chunk.push(data)
    }
  })

  stream.on("end", () => {
    const timeline = chunk
      .filter((obj) => startAnimationTs <= obj.timestamp && obj.timestamp <= endAnimationTs)
      .sort((a, b) => a.timestamp - b.timestamp)
    const playDuration = calcTimestampDiff(startAnimationTs, endAnimationTs)
    const layoutDuration = calcTotalDuration(timeline, "Layout")
    const paintDuration = calcTotalDuration(timeline, "Paint")
    const compositeDuration = calcTotalDuration(timeline, "CompositeLayers")
    const totalDuration = layoutDuration + paintDuration + compositeDuration
    const data = {
      timeline,
      meta: [
        {
          name: "Layout",
          duration: layoutDuration,
          percent: (layoutDuration / playDuration) * 100
        },
        {
          name: "Paint",
          duration: paintDuration,
          percent: (paintDuration / playDuration) * 100
        },
        {
          name: "Composite",
          duration: compositeDuration,
          percent: (compositeDuration / playDuration) * 100
        },
        {
          name: "TOTAL ReRender",
          duration: totalDuration
        },
        {
          name: "Animation",
          duration: playDuration
        }
      ]
    }
    dest.write(JSON.stringify(data, null, 2))
  })
}

const parseProfileForAllFiles = async (srcDir, destDir) => {
  const files = await glob(srcDir + "/**/*")
  const dirs = collectDirs(files).map((dir) => dir.replace(srcDir, destDir))
  await mkdirAll(dirs)
  files.forEach((file) => {
    if (!file.endsWith(".json")) return
    const destFile = file.replace(srcDir, destDir)
    parseProfile(file, destFile)
  })
}

parseProfileForAllFiles("./data/animation", "./dump/animation")
