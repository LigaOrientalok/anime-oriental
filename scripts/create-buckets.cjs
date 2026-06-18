const { createClient } = require('@supabase/supabase-js')

const supabase = createClient(
  'https://tfethynmceqbbaitrxfy.supabase.co',
  'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InRmZXRoeW5tY2VxYmJhaXRyeGZ5Iiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc4MTgwNDY1MiwiZXhwIjoyMDk3MzgwNjUyfQ.uBGRp_JvZ-AhaZHlVS1-1TUgZQCylQnX9MwSefCsIVg'
)

const buckets = ['covers', 'banners', 'videos', 'avatars']

async function run() {
  for (const name of buckets) {
    const { data, error } = await supabase.storage.createBucket(name, {
      public: true,
      fileSizeLimit: name === 'videos' ? null : 10485760, // no limit for videos, 10MB for images
    })
    if (error && error.message !== 'Bucket already exists') {
      console.error(`Error creating ${name}:`, error.message)
    } else {
      console.log(`Bucket '${name}' ready`)
    }
  }
  console.log('All buckets created!')
}

run()
