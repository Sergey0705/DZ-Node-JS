const http = require('http')

const DELAY = process.env.DELAY || 1000
const LIMIT = process.env.LIMIT || 10
const PORT = process.env.PORT || 3000

const server = http.createServer((req, res) => {
  if (req.url === '/') {
    res.setHeader('Content-Type', 'text/html; charset=utf-8')
    res.setHeader('Transfer-Encoding', 'chuncked')
    res.write('Local time: ')
    clock().then((date) => res.end(`${date}`))
  }
})

const clock = () => {
  return new Promise((resolve) => {
    let current = 1
    setTimeout(function run () {
      console.log(`${new Date()} tick:${current}`)
      if (current < LIMIT) {
        setTimeout(run, DELAY)
      } else {
        resolve(new Date())
      }
      current++
    }, DELAY)
  })
}

server.listen(PORT, () => {
  console.log(`Server on running on port ${PORT}`)
})
