import { PrismaClient } from '@prisma/client'

// Global Prisma instance with logging
const globalForPrisma = globalThis as unknown as {
  prisma: PrismaClient | undefined
}

// Create Prisma client with logging configuration
export const prisma = globalForPrisma.prisma ?? new PrismaClient({
  log: ['query', 'info', 'warn', 'error'],
})

// Prevent multiple instances in development
if (process.env.NODE_ENV !== 'production') globalForPrisma.prisma = prisma

// Database connection test function
export async function testDatabaseConnection(): Promise<boolean> {
  try {
    console.log('🔍 Testing database connection...')
    
    // Test basic connection
    await prisma.$connect()
    console.log('✅ Database connected successfully')
    
    // Test query execution
    const userCount = await prisma.user.count()
    const postCount = await prisma.post.count()
    const commentCount = await prisma.comment.count()
    const tagCount = await prisma.tag.count()
    
    console.log('📊 Database Stats:')
    console.log(`   Users: ${userCount}`)
    console.log(`   Posts: ${postCount}`)
    console.log(`   Comments: ${commentCount}`)
    console.log(`   Tags: ${tagCount}`)
    
    return true
  } catch (error) {
    console.error('❌ Database connection failed:', error)
    return false
  }
}

// Graceful shutdown
export async function disconnectDatabase(): Promise<void> {
  try {
    await prisma.$disconnect()
    console.log('✅ Database disconnected successfully')
  } catch (error) {
    console.error('❌ Error disconnecting from database:', error)
  }
}

// Handle process termination
process.on('SIGINT', async () => {
  console.log('\n🛑 Received SIGINT, closing database connection...')
  await disconnectDatabase()
  process.exit(0)
})

process.on('SIGTERM', async () => {
  console.log('\n🛑 Received SIGTERM, closing database connection...')
  await disconnectDatabase()
  process.exit(0)
}) 