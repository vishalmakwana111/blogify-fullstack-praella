import { PrismaClient, UserRole, PostStatus } from '@prisma/client'
import bcrypt from 'bcryptjs'

const prisma = new PrismaClient()

async function main() {
  console.log('🌱 Starting database seeding...')

  // Create users
  const hashedPassword = await bcrypt.hash('password123', 12)
  
  const adminUser = await prisma.user.upsert({
    where: { email: 'admin@blogify.com' },
    update: {},
    create: {
      email: 'admin@blogify.com',
      username: 'admin',
      password: hashedPassword,
      firstName: 'Admin',
      lastName: 'User',
      bio: 'Blog administrator',
      role: UserRole.ADMIN,
      emailVerified: true,
    },
  })

  const johnUser = await prisma.user.upsert({
    where: { email: 'john@example.com' },
    update: {},
    create: {
      email: 'john@example.com',
      username: 'john_doe',
      password: hashedPassword,
      firstName: 'John',
      lastName: 'Doe',
      bio: 'Passionate writer and tech enthusiast',
      role: UserRole.USER,
      emailVerified: true,
    },
  })

  const janeUser = await prisma.user.upsert({
    where: { email: 'jane@example.com' },
    update: {},
    create: {
      email: 'jane@example.com',
      username: 'jane_smith',
      password: hashedPassword,
      firstName: 'Jane',
      lastName: 'Smith',
      bio: 'Frontend developer and UI/UX designer',
      role: UserRole.USER,
      emailVerified: true,
    },
  })

  console.log('✅ Users created')

  // Create tags
  const techTag = await prisma.tag.upsert({
    where: { slug: 'technology' },
    update: {},
    create: {
      name: 'Technology',
      slug: 'technology',
      description: 'All about technology and innovation',
      color: '#3b82f6',
    },
  })

  const webDevTag = await prisma.tag.upsert({
    where: { slug: 'web-development' },
    update: {},
    create: {
      name: 'Web Development',
      slug: 'web-development',
      description: 'Web development tutorials and tips',
      color: '#10b981',
    },
  })

  const reactTag = await prisma.tag.upsert({
    where: { slug: 'react' },
    update: {},
    create: {
      name: 'React',
      slug: 'react',
      description: 'React.js framework and ecosystem',
      color: '#06b6d4',
    },
  })

  const designTag = await prisma.tag.upsert({
    where: { slug: 'design' },
    update: {},
    create: {
      name: 'Design',
      slug: 'design',
      description: 'UI/UX design principles and trends',
      color: '#8b5cf6',
    },
  })

  console.log('✅ Tags created')

  // Create posts
  const post1 = await prisma.post.create({
    data: {
      title: 'Getting Started with React and TypeScript',
      slug: 'getting-started-react-typescript',
      content: `# Getting Started with React and TypeScript

React and TypeScript make a powerful combination for building modern web applications. In this comprehensive guide, we'll explore how to set up a React project with TypeScript and best practices for development.

## Why TypeScript with React?

TypeScript adds static type checking to JavaScript, which helps catch errors early in development and provides better IDE support with autocomplete and refactoring tools.

## Setting Up Your Project

\`\`\`bash
npx create-react-app my-app --template typescript
cd my-app
npm start
\`\`\`

## Key Benefits

1. **Type Safety**: Catch errors at compile time
2. **Better IDE Support**: Enhanced autocomplete and refactoring
3. **Improved Documentation**: Types serve as documentation
4. **Easier Refactoring**: Confident code changes

## Conclusion

TypeScript with React provides a robust foundation for building scalable applications. The initial setup overhead pays off quickly with improved developer experience and code quality.`,
      excerpt: 'Learn how to set up and use React with TypeScript for better development experience and type safety.',
      status: PostStatus.PUBLISHED,
      publishedAt: new Date(),
      authorId: johnUser.id,
      viewCount: 156,
      likeCount: 23,
      commentCount: 5,
    },
  })

  const post2 = await prisma.post.create({
    data: {
      title: 'Modern CSS Techniques for Better Web Design',
      slug: 'modern-css-techniques-web-design',
      content: `# Modern CSS Techniques for Better Web Design

CSS has evolved significantly over the years. Modern CSS provides powerful tools for creating beautiful, responsive, and maintainable web designs.

## CSS Grid and Flexbox

CSS Grid and Flexbox are essential tools for modern layout design:
\`\`\`css
.grid-container {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(300px, 1fr));
  gap: 2rem;
}
\`\`\`

### Flexbox
Ideal for one-dimensional layouts:
\`\`\`css
.flex-container {
  display: flex;
  justify-content: space-between;
  align-items: center;
}
\`\`\`

## CSS Custom Properties

Variables in CSS make your stylesheets more maintainable:
\`\`\`css
:root {
  --primary-color: #3b82f6;
  --secondary-color: #10b981;
}
\`\`\`

## Conclusion

Modern CSS techniques enable developers to create sophisticated designs with cleaner, more maintainable code.`,
      excerpt: 'Explore modern CSS techniques including Grid, Flexbox, and Custom Properties for better web design.',
      status: PostStatus.PUBLISHED,
      publishedAt: new Date(Date.now() - 86400000), // 1 day ago
      authorId: janeUser.id,
      viewCount: 89,
      likeCount: 15,
      commentCount: 3,
    },
  })

  const post3 = await prisma.post.create({
    data: {
      title: 'Building Scalable APIs with Node.js and Express',
      slug: 'building-scalable-apis-nodejs-express',
      content: `# Building Scalable APIs with Node.js and Express

Building robust and scalable APIs is crucial for modern web applications. This guide covers best practices for API development with Node.js and Express.

## Project Structure

A well-organized project structure is essential:
\`\`\`
src/
├── controllers/
├── middleware/
├── routes/
├── services/
├── models/
└── utils/
\`\`\`

## Error Handling

Proper error handling is critical for API reliability:
\`\`\`javascript
const errorHandler = (err, req, res, next) => {
  const statusCode = err.statusCode || 500;
  res.status(statusCode).json({
    success: false,
    message: err.message,
    stack: process.env.NODE_ENV === 'development' ? err.stack : undefined
  });
};
\`\`\`

## Authentication and Authorization

Implement JWT-based authentication:
\`\`\`javascript
const jwt = require('jsonwebtoken');

const authenticateToken = (req, res, next) => {
  const authHeader = req.headers['authorization'];
  const token = authHeader && authHeader.split(' ')[1];
  
  if (!token) {
    return res.status(401).json({ message: 'Access token required' });
  }
  
  jwt.verify(token, process.env.JWT_SECRET, (err, user) => {
    if (err) return res.status(403).json({ message: 'Invalid token' });
    req.user = user;
    next();
  });
};
\`\`\`

## Conclusion

Following these practices will help you build maintainable and scalable APIs that can grow with your application needs.`,
      excerpt: 'Learn best practices for building scalable APIs with Node.js, Express, and proper architecture patterns.',
      status: PostStatus.PUBLISHED,
      publishedAt: new Date(Date.now() - 172800000), // 2 days ago
      authorId: adminUser.id,
      viewCount: 234,
      likeCount: 42,
      commentCount: 8,
    },
  })

  console.log('✅ Posts created')

  // Create post-tag relationships
  await prisma.postTag.createMany({
    data: [
      { postId: post1.id, tagId: techTag.id },
      { postId: post1.id, tagId: webDevTag.id },
      { postId: post1.id, tagId: reactTag.id },
      { postId: post2.id, tagId: webDevTag.id },
      { postId: post2.id, tagId: designTag.id },
      { postId: post3.id, tagId: techTag.id },
      { postId: post3.id, tagId: webDevTag.id },
    ],
  })

  console.log('✅ Post-tag relationships created')

  // Create comments
  await prisma.comment.createMany({
    data: [
      {
        content: 'Great article! TypeScript really does make React development much better.',
        postId: post1.id,
        authorId: janeUser.id,
        isApproved: true,
      },
      {
        content: 'Thanks for the comprehensive guide. The setup instructions were very clear.',
        postId: post1.id,
        authorId: adminUser.id,
        isApproved: true,
      },
      {
        content: 'CSS Grid has been a game-changer for my layouts. Thanks for the examples!',
        postId: post2.id,
        authorId: johnUser.id,
        isApproved: true,
      },
      {
        content: 'Excellent breakdown of modern CSS techniques. Bookmarked for reference!',
        postId: post2.id,
        authorId: adminUser.id,
        isApproved: true,
      },
      {
        content: 'The API structure you outlined is exactly what I needed for my project.',
        postId: post3.id,
        authorId: johnUser.id,
        isApproved: true,
      },
      {
        content: 'JWT authentication implementation is spot on. Very helpful!',
        postId: post3.id,
        authorId: janeUser.id,
        isApproved: true,
      },
    ],
  })

  console.log('✅ Comments created')

  console.log('🎉 Database seeding completed successfully!')
  console.log(`
📊 Summary:
- Users: 3 (1 admin, 2 regular users)
- Posts: 3 (all published)
- Tags: 4 (Technology, Web Development, React, Design)
- Comments: 6 (all approved)
- Post-Tag relationships: 7
  `)
}

main()
  .catch((e) => {
    console.error('❌ Error during seeding:', e)
    process.exit(1)
  })
  .finally(async () => {
    await prisma.$disconnect()
  }) 