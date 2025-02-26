import dotenv from 'dotenv'
import { connect } from 'ts-postgres'
import * as mailer from 'nodemailer'

dotenv.config()

const db_host = process.env.DB_HOST
const db_port = process.env.DB_PORT
const db_name = process.env.DB_NAME
const db_user = process.env.DB_USER
const db_pass = process.env.DB_PASS

const smtp_host = process.env.SMTP_HOST
const smtp_port = process.env.SMTP_PORT
const smtp_user = process.env.SMTP_USER
const smtp_pass = process.env.SMTP_PASS
const smtp_from = process.env.SMTP_FROM
const smtp_secure = process.env.SMTP_SECURE

try {

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

  const query1 = "SELECT table_name FROM information_schema.tables WHERE table_name ~ '^messages_(\d+)_(\d+)$'"
  const tables = await client.query(query) 

  for await (const table of tables) {
    const query2 = "SELECT id, to, subject, html_body FROM $1 WHERE id NOT IN (SELECT message_id FROM sent_emails WHERE email_table = $1)"
    const messages = await client.query(query, [table.table_name])
    
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
