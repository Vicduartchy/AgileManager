import { createApp } from './app'
import { runMigrations } from './db/migrate'

runMigrations()

const app = createApp()
const port = process.env.PORT ?? 3001

app.listen(port, () => {
  console.log(`AgileManager API running on http://localhost:${port}`)
})
