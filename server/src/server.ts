import app from './app'
import { testDatabaseConnection } from './config/database'

const PORT = process.env.PORT || 5000

async function startServer() {
  try {
    // Test database connection
    console.log('🔍 Testing database connection...')
    const isDbConnected = await testDatabaseConnection()
    
    if (!isDbConnected) {
      console.error('❌ Database connection failed. Exiting...')
      process.exit(1)
    }

    // Start server
    const server = app.listen(PORT, () => {
      console.log(`
🚀 Server is running!
📍 Port: ${PORT}
🌍 Environment: ${process.env.NODE_ENV || 'development'}
🔗 Health Check: http://localhost:${PORT}/health
📚 API Base: http://localhost:${PORT}/api
🔐 Auth Routes: http://localhost:${PORT}/api/auth
      `)
    })

    // Graceful shutdown
    process.on('SIGTERM', () => {
      console.log('🛑 SIGTERM received, shutting down gracefully...')
      server.close(() => {
        console.log('✅ Server closed')
        process.exit(0)
      })
    })

    process.on('SIGINT', () => {
      console.log('🛑 SIGINT received, shutting down gracefully...')
      server.close(() => {
        console.log('✅ Server closed')
        process.exit(0)
      })
    })

  } catch (error) {
    console.error('❌ Failed to start server:', error)
    process.exit(1)
  }
}

startServer() 