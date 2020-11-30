const program = require('commander')
// const del = require('del')
const fs = require('fs')
const fsp = require('fs/promises')
const fse = require('fs-extra')
const path = require('path')

program
  .version('0.0.1')
  .requiredOption('-f, --folder <type>', 'Input source folder', 'picture')
  .option('-o, --output [type]', 'Input output folder', 'dist')
  .option('-d, --del [type]', 'If you want delete source folder')
  .parse(process.argv)

const pathToOriginalDir = path.join(__dirname, program.folder)
const pathToFinalDir = path.join(__dirname, program.output)

// Создаю итоговую папку
const createFinalDir = async (pathToFinalDir) => {
  if (fs.existsSync(pathToFinalDir)) {
    console.log('Итоговая папка существует')
    fse.removeSync(pathToFinalDir)

    await fsp.mkdir(pathToFinalDir)
    console.log('Итоговая папка очищена')
  } else {
    await fsp.mkdir(pathToFinalDir)
    console.log('Итоговая папка создана')
  }
}

const fileNames = []
// Читаю все файлы внутри исходной папки, и записываю первые буквы в массив
const readOriginalDir = async (pathToOriginalDir) => {
  const files = await fsp.readdir(pathToOriginalDir)

  for (const item of files) {
    const localBase = path.join(pathToOriginalDir, item)
    const state = await fsp.stat(localBase)
    if (state.isDirectory()) {
      await readOriginalDir(localBase)
    } else {
      fileNames.push(item[0].toUpperCase())
    }
  }
}

// Создаю папки в итоговой папке
const createDirsInFinalDir = async (fileNames) => {
  const uniqLetterArray = Array.from(new Set(fileNames))

  for (const item of uniqLetterArray) {
    await fsp.mkdir(path.join(pathToFinalDir, item))
  }
}

// Копирую файлы в итоговую папку из исходной
const copyFiles = async (pathToOriginalDir, pathToFinalDir) => {
  const files = await fsp.readdir(pathToOriginalDir)

  for (const item of files) {
    const localBase = path.join(pathToOriginalDir, item)
    const state = await fsp.stat(localBase)
    if (state.isDirectory()) {
      await copyFiles(localBase, pathToFinalDir)
    } else {
      await fsp.writeFile(path.join(pathToFinalDir, item[0], item), localBase)
    }
  }
}

(async () => {
  await createFinalDir(pathToFinalDir)
  await readOriginalDir(pathToOriginalDir)
  await createDirsInFinalDir(fileNames)
  await copyFiles(pathToOriginalDir, pathToFinalDir)
  console.log('Файлы записаны')
  // if (program.del) {
  // Удаляю исходную папку при наличии команды del
  //   del(program.folder).then(() => console.log('Исходная папка удалена'))
  // }
})()
