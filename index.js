const program = require('commander')
const fs = require('fs')
const fse = require('fs-extra')
const del = require('del')
const path = require('path')

program
  .version('0.0.1')
  .requiredOption('-f, --folder <type>', 'Input source folder', 'picture')
  .option('-o, --output [type]', 'Input output folder', 'dist')
  .option('-d, --del [type]', 'If you want delete source folder')
  .parse(process.argv)

const pathToOriginalDir = path.join(__dirname, program.folder)
const pathToFinalDir = path.join(__dirname, program.output)
console.log(program.del)
// Создаю итоговую папку
const createFinalDir = (pathToFinalDir) => {
  if (fs.existsSync(pathToFinalDir)) {
    console.log('Итоговая папка существует')
    fse.removeSync(pathToFinalDir)

    fs.mkdirSync(pathToFinalDir)
    console.log('Итоговая папка очищена')
  } else {
    fs.mkdirSync(pathToFinalDir)
    console.log('Итоговая папка создана')
  }
}

const fileNames = []
// Читаю все файлы внутри исходной папки, и записываю первые буквы в массив
const readOriginalDir = (pathToOriginalDir) => {
  const files = fs.readdirSync(pathToOriginalDir)

  files.forEach((item) => {
    const localBase = path.join(pathToOriginalDir, item)
    const state = fs.statSync(localBase)
    if (state.isDirectory()) {
      readOriginalDir(localBase)
    } else {
      fileNames.push(item[0].toUpperCase())
    }
  })
}

// Создаю папки в итоговой папке
const createDirsInFinalDir = (fileNames) => {
  const uniqLetterArray = Array.from(new Set(fileNames))

  uniqLetterArray.forEach((item) => {
    fs.mkdirSync(path.join(pathToFinalDir, item))
  })
}

// Копирую файлы в итоговую папку из исходной
let counter = 0
const copyFiles = (pathToOriginalDir, pathToFinalDir) => {
  const files = fs.readdirSync(pathToOriginalDir)

  files.forEach((item) => {
    const localBase = path.join(pathToOriginalDir, item)
    const state = fs.statSync(localBase)
    if (state.isDirectory()) {
      copyFiles(localBase, pathToFinalDir)
    } else {
      fs.writeFile(path.join(pathToFinalDir, item[0], item), localBase, () => {
        ++counter
        // Ранее я получил массив всех файлов, теперь как только каунтер в callback достигнет количества файлов массива, я пойму что все файлы записаны
        if (counter === fileNames.length) {
          console.log('Файлы записаны')
          if (counter === fileNames.length && program.del) {
            // Удаляю исходную папку при наличии команды del
            del(program.folder).then(() => console.log('Исходная папка удалена'))
          }
        }
      })
    }
  })
}

createFinalDir(pathToFinalDir)
readOriginalDir(pathToOriginalDir)
createDirsInFinalDir(fileNames)
copyFiles(pathToOriginalDir, pathToFinalDir)
