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
