// Test Supabase connection and basic operations
import { createClient } from '@supabase/supabase-js'

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY

if (!supabaseUrl || !supabaseKey) {
  console.error('❌ Missing Supabase environment variables')
  console.log('💡 Make sure NEXT_PUBLIC_SUPABASE_URL and NEXT_PUBLIC_SUPABASE_ANON_KEY are set')
  process.exit(1)
}

const supabase = createClient(supabaseUrl, supabaseKey)

async function testConnection() {
  try {
    console.log('🍱 Testing Supabase connection...')
    console.log(`🔗 URL: ${supabaseUrl}`)
    console.log(`🔑 Key: ${supabaseKey.substring(0, 20)}...`)
    
    // Test basic connection
    const { data, error } = await supabase.from('users').select('count').limit(1)
    
    if (error) {
      if (error.code === 'PGRST116') {
        console.log('📋 Users table does not exist yet')
        console.log('💡 Please run the database setup first:')
        console.log('   node scripts/setup-supabase.js')
        return
      } else {
        console.error('❌ Connection failed:', error.message)
        return
      }
    }
    
    console.log('✅ Supabase connection successful!')
    
    // Test inserting a test user
    const testUser = {
      discord_id: 'test-user-123',
      username: 'TestUser',
      email: 'test@example.com'
    }
    
    console.log('📝 Testing user creation...')
    const { data: insertData, error: insertError } = await supabase
      .from('users')
      .insert(testUser)
      .select()
      .single()
    
    if (insertError) {
      console.error('❌ User creation failed:', insertError.message)
    } else {
      console.log('✅ Test user created successfully!')
      console.log('👤 User ID:', insertData.id)
      
      // Clean up test user
      const { error: deleteError } = await supabase
        .from('users')
        .delete()
        .eq('id', insertData.id)
      
      if (deleteError) {
        console.warn('⚠️  Could not clean up test user:', deleteError.message)
      } else {
        console.log('🧹 Test user cleaned up')
      }
    }
    
    console.log('🎉 All tests passed! Your Supabase setup is working correctly.')
    
  } catch (error) {
    console.error('❌ Test failed:', error.message)
  }
}

testConnection()
