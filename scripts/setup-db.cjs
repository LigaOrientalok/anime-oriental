const { Client } = require('pg')
const fs = require('fs')
const path = require('path')

const client = new Client({
  connectionString: 'postgresql://postgres:Apasionada09@db.tfethynmceqbbaitrxfy.supabase.co:5432/postgres',
  ssl: { rejectUnauthorized: false }
})

async function run() {
  try {
    await client.connect()
    console.log('Connected to Supabase DB')

    const schemaSql = fs.readFileSync(path.join(__dirname, '..', 'supabase', 'schema.sql'), 'utf8')
    console.log('Executing schema.sql...')
    await client.query(schemaSql)
    console.log('Schema created successfully!')

    const rlsSql = fs.readFileSync(path.join(__dirname, '..', 'supabase', 'rls.sql'), 'utf8')
    console.log('Executing rls.sql...')
    await client.query(rlsSql)
    console.log('RLS policies created successfully!')

    await client.end()
    console.log('Done!')
  } catch (err) {
    console.error('Error:', err.message)
    process.exit(1)
  }
}

run()
