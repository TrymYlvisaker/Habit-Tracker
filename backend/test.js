import sql from './db.js'

const test = async () => {
  const result = await sql`SELECT version()`
  console.log(result)
  process.exit()
}

test()