import dotenv from 'dotenv'
import { connect } from 'ts-postgres'

dotenv.config()

const db_host = process.env.DB_HOST
const db_port = process.env.DB_PORT
const db_name = process.env.DB_NAME
const db_user = process.env.DB_USER
const db_pass = process.env.DB_PASS

const client = await connect({
  host: db_host,
  port: db_port,
  user: db_user,
  password: db_pass,
  database: db_name
})

try {

  const query = "SELECT * FROM emails WHERE id NOT IN (SELECT email_id FROM sent_emails)"
  const result = await client.query(query)

  for await (const row of result) {
    console.log(`Found row: ${row}`)
  }

} catch (error) {
  console.error(error)
} finally {
  await client.end()
}
