import dotenv from 'dotenv'
import { connect } from 'ts-postgres'
import * as mailer from 'nodemailer'

dotenv.config()

const db_host: string = process.env.DB_HOST
const db_port: number = parseInt(process.env.DB_PORT)
const db_name: string = process.env.DB_NAME
const db_user: string = process.env.DB_USER
const db_pass: string = process.env.DB_PASS

const smtp_host: string = process.env.SMTP_HOST
const smtp_port: number = parseInt(process.env.SMTP_PORT)
const smtp_user: string = process.env.SMTP_USER
const smtp_pass: string = process.env.SMTP_PASS
const smtp_from: string = process.env.SMTP_FROM
const smtp_secure: boolean = JSON.parse(process.env.SMTP_SECURE)

const client = await connect({
  host: db_host,
  port: db_port,
  user: db_user,
  password: db_pass,
  database: db_name
})

const transporter = mailer.createTransport({
  host: smtp_host,
  port: smtp_port,
  secure: smtp_secure,
  auth: {
    user: smtp_user,
    pass: smtp_pass
  }
})

try {

  const tquery = "SELECT table_name FROM information_schema.tables WHERE table_name ~ '^messages_(\d+)_(\d+)$'"
  const tables = await client.query(tquery) 

  console.log(`Found ${tables.rows.length} tables`)

  for await (const table of tables) {
    const mquery = "SELECT id, to, subject, html_body FROM $1 WHERE id NOT IN (SELECT message_id FROM sent_emails WHERE email_table = $1)"
    const messages = await client.query(mquery, [table.table_name])

    console.log(`Found ${messages.rows.length} messages in ${table.table_name}`)
    
    for await (const message of messages) {
      const options = {
        from: smtp_from,
        to: message.to,
        subject: message.subject,
        html: message.html_body
      }

      console.log(options)

      /*await transporter.sendMail(options).then((info) => {
          console.log(`Email sent: ${info.response}`)
  
          const insert = "INSERT INTO sent_emails (email_table, message_id) VALUES ($1, $2)"
          client.query(insert, [table.table_name, message.id])
      })*/
    }

  }

} catch (error) {
  console.error(error)
} finally {
  await client.end()
}
