// Supabase database setup script
import { createClient } from '@supabase/supabase-js'
import fs from 'fs'
import path from 'path'

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY

if (!supabaseUrl || !supabaseKey) {
  console.error('❌ Missing Supabase environment variables')
  process.exit(1)
}

const supabase = createClient(supabaseUrl, supabaseKey)

async function setupDatabase() {
  try {
    console.log('🍱 Setting up Lunchbox AI Supabase database...')
    
    // Read the SQL schema file
    const schemaPath = path.join(process.cwd(), 'supabase', 'schema.sql')
    const schemaSQL = fs.readFileSync(schemaPath, 'utf8')
    
    // Split into individual statements
    const statements = schemaSQL
      .split(';')
      .map(stmt => stmt.trim())
      .filter(stmt => stmt.length > 0 && !stmt.startsWith('--'))
    
    console.log(`📋 Found ${statements.length} SQL statements to execute`)
    
    // Execute each statement
    for (let i = 0; i < statements.length; i++) {
      const statement = statements[i]
      if (statement) {
        try {
          console.log(`⏳ Executing statement ${i + 1}/${statements.length}...`)
          const { error } = await supabase.rpc('exec_sql', { sql: statement })
          
          if (error) {
            // Some errors are expected (like "already exists")
            if (!error.message.includes('already exists') && 
                !error.message.includes('duplicate') &&
                !error.message.includes('already defined')) {
              console.warn(`⚠️  Statement ${i + 1} warning:`, error.message)
            }
          } else {
            console.log(`✅ Statement ${i + 1} executed successfully`)
          }
        } catch (error) {
          console.warn(`⚠️  Statement ${i + 1} error:`, error.message)
        }
      }
    }
    
    console.log('🎉 Database setup completed!')
    
    // Test the connection
    const { data, error } = await supabase.from('users').select('count').limit(1)
    if (error) {
      console.error('❌ Database connection test failed:', error.message)
    } else {
      console.log('✅ Database connection test successful!')
    }
    
  } catch (error) {
    console.error('❌ Database setup failed:', error)
    process.exit(1)
  }
}

// Alternative method using direct SQL execution
async function setupDatabaseDirect() {
  try {
    console.log('🍱 Setting up Lunchbox AI Supabase database (direct method)...')
    
    // Test connection first
    const { data, error } = await supabase.from('users').select('count').limit(1)
    if (error && error.code === 'PGRST116') {
      console.log('📋 Users table does not exist, creating schema...')
      
      // Create a simple test table first
      const { error: createError } = await supabase.rpc('exec', {
        sql: `
          CREATE TABLE IF NOT EXISTS users (
            id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
            discord_id TEXT UNIQUE NOT NULL,
            username TEXT NOT NULL,
            email TEXT,
            xp INTEGER DEFAULT 0,
            level INTEGER DEFAULT 1,
            created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
          );
        `
      })
      
      if (createError) {
        console.error('❌ Failed to create users table:', createError.message)
        console.log('💡 Please run the SQL schema manually in your Supabase dashboard')
        console.log('📁 Schema file location: supabase/schema.sql')
        return
      }
      
      console.log('✅ Users table created successfully!')
    } else if (error) {
      console.error('❌ Database connection failed:', error.message)
      return
    } else {
      console.log('✅ Database connection successful!')
    }
    
    console.log('🎉 Database setup completed!')
    console.log('💡 You can now start the development server with: npm run dev')
    
  } catch (error) {
    console.error('❌ Database setup failed:', error)
    console.log('💡 Please run the SQL schema manually in your Supabase dashboard')
    console.log('📁 Schema file location: supabase/schema.sql')
  }
}

// Run the setup
setupDatabaseDirect()
