import { Request, Response } from 'express';
import { prisma } from '../config/database';
import { paginate } from '../utils/database';

export async function getTags(req: Request, res: Response): Promise<void> {
  try {
    const { limit = 20, search } = req.query;

    let whereClause: any = {};
    
    if (search) {
      whereClause.name = {
        contains: search as string,
        mode: 'insensitive',
      };
    }

    const tags = await prisma.tag.findMany({
      where: whereClause,
      take: parseInt(limit as string),
      orderBy: [
        { name: 'asc' },
      ],
      select: {
        id: true,
        name: true,
        slug: true,
        description: true,
        color: true,
        _count: {
          select: {
            postTags: {
              where: {
                post: {
                  status: 'PUBLISHED',
                },
              },
            },
          },
        },
      },
    });

    res.json({
      success: true,
      data: { tags },
    });
  } catch (error) {
    console.error('Get tags error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch tags',
    });
  }
}

export async function getTagById(req: Request, res: Response): Promise<void> {
  try {
    const { id } = req.params;
    const { page = 1, limit = 10 } = req.query;

    const tag = await prisma.tag.findUnique({
      where: { id },
    });

    if (!tag) {
      res.status(404).json({
        success: false,
        message: 'Tag not found',
      });
      return;
    }

    // Get posts with this tag
    const result = await paginate(prisma.post, {
      page: parseInt(page as string),
      limit: parseInt(limit as string),
      where: {
        status: 'PUBLISHED',
        postTags: {
          some: {
            tagId: tag.id,
          },
        },
      },
      include: {
        author: {
          select: {
            id: true,
            username: true,
            firstName: true,
            lastName: true,
            avatar: true,
          },
        },
        postTags: {
          include: {
            tag: true,
          },
        },
        _count: {
          select: {
            comments: true,
          },
        },
      },
    });

    res.json({
      success: true,
      data: {
        tag,
        posts: result,
      },
    });
  } catch (error) {
    console.error('Get tag error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch tag',
    });
  }
}

export async function createTag(req: Request, res: Response): Promise<void> {
  try {
    const { name, color = '#3B82F6' } = req.body;

    if (!name || !name.trim()) {
      res.status(400).json({
        success: false,
        message: 'Tag name is required',
      });
      return;
    }

    const trimmedName = name.trim();

    // Check if tag already exists
    const existingTag = await prisma.tag.findUnique({
      where: { name: trimmedName },
    });

    if (existingTag) {
      res.status(400).json({
        success: false,
        message: `Tag "${trimmedName}" already exists`,
      });
      return;
    }

    // Create base slug from name
    let baseSlug = trimmedName.toLowerCase()
      .replace(/\s+/g, '-')           // Replace spaces with hyphens
      .replace(/[^a-z0-9-]/g, '')     // Remove non-alphanumeric characters except hyphens
      .replace(/-+/g, '-')            // Replace multiple hyphens with single hyphen
      .replace(/^-|-$/g, '');         // Remove leading/trailing hyphens

    // Ensure slug is not empty
    if (!baseSlug) {
      baseSlug = 'tag';
    }

    // Check for slug uniqueness and append number if needed
    let slug = baseSlug;
    let counter = 1;
    
    while (true) {
      const existingSlugTag = await prisma.tag.findUnique({
        where: { slug },
      });

      if (!existingSlugTag) {
        break; // Slug is unique
      }

      slug = `${baseSlug}-${counter}`;
      counter++;
      
      // Prevent infinite loop (safety check)
      if (counter > 100) {
        throw new Error('Unable to generate unique slug');
      }
    }

    const tag = await prisma.tag.create({
      data: {
        name: trimmedName,
        slug,
        color,
      },
    });

    res.status(201).json({
      success: true,
      message: 'Tag created successfully',
      data: { tag },
    });
  } catch (error) {
    console.error('Create tag error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to create tag',
    });
  }
} 