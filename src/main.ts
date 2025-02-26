import dotenv from 'dotenv'
import { connect } from 'ts-postgres'
import * as mailer from 'nodemailer'

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

const smtp_host = process.env.SMTP_HOST
const smtp_port = process.env.SMTP_PORT
const smtp_user = process.env.SMTP_USER
const smtp_pass = process.env.SMTP_PASS
const smtp_from = process.env.SMTP_FROM
const smtp_secure = process.env.SMTP_SECURE

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
  
  const tables = [
    "messages_05",
    "messages_06",
    "messages_07",
    "messages_08",
    "messages_09",
    "messages_10",
    "messages_11"
  ]

  for (const table of tables) {
    const query = "SELECT * FROM $1 WHERE id NOT IN (SELECT message_id FROM sent_emails WHERE email_table = $1)"
    const result = await client.query(query, [table])
    
    for await (const row of result) {
      const options = {
        from: smtp_from,
        to: row.to,
        subject: row.subject,
        html: row.html_body
      }

      console.log(options)

      /*await transporter.sendMail(options).then((info) => {
          console.log(`Email sent: ${info.response}`)
  
          const insert = "INSERT INTO sent_emails (email_table, message_id) VALUES ($1, $2)"
          client.query(insert, [table, row.id])
      })*/
    }

  }

} catch (error) {
  console.error(error)
} finally {
  await client.end()
}
