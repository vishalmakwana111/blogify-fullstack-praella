import { prisma } from '../config/database';

export async function paginate(model: any, options: {
  page: number;
  limit: number;
  where?: any;
  include?: any;
  orderBy?: any;
}) {
  const { page, limit, where = {}, include = {}, orderBy = { createdAt: 'desc' } } = options;
  
  const skip = (page - 1) * limit;
  
  const [data, total] = await Promise.all([
    model.findMany({
      where,
      include,
      orderBy,
      skip,
      take: limit,
    }),
    model.count({ where }),
  ]);

  const totalPages = Math.ceil(total / limit);
  const hasNextPage = page < totalPages;
  const hasPrevPage = page > 1;

  return {
    data,
    pagination: {
      currentPage: page,
      totalPages,
      totalItems: total,
      itemsPerPage: limit,
      hasNextPage,
      hasPrevPage,
    },
  };
} 