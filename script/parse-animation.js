const JSONStream = require("JSONStream")
const fs = require("fs")
const path = require("path")

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

const parseProfileForAllFiles = (srcDir, destDir) => {
  fs.readdir(srcDir, (err, files) => {
    files.forEach((file) => {
      const filename = path.basename(file)
      parseProfile(path.join(srcDir, filename), path.join(destDir, filename))
    })
  })
}

parseProfileForAllFiles("./data/flow-bg", "./dump/flow-bg")
parseProfileForAllFiles("./data/box-shadow", "./dump/box-shadow")
