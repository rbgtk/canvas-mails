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

  const query = "SELECT * FROM emails WHERE id NOT IN (SELECT email_id FROM sent_emails)"
  const result = await client.query(query)

  for await (const row of result) {
    console.log(`Found row: ${row}`)

    const options = {
      from: smtp_from,
      to: row.to,
      subject: row.subject,
      html: row.body
    }

    await transporter.sendMail(options)
      .then((info) => {
        console.log(`Email sent: ${info.response}`)

        const insert = "INSERT INTO sent_emails (email_id) VALUES ($1)"
        client.query(insert, [row.id])
      })
    })
  }

} catch (error) {
  console.error(error)
} finally {
  await client.end()
}
