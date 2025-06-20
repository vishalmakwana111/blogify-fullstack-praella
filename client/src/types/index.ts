export interface Post {
  id: string;
  title: string;
  content: string;
  excerpt: string;
  coverImage?: string;
  status: string;
  publishedAt: string;
  viewCount: number;
  likeCount: number;
  commentCount: number;
  createdAt: string;
  updatedAt: string;
  author: {
    id: string;
    username: string;
    firstName?: string;
    lastName?: string;
    avatar?: string;
  };
  postTags: Array<{
    tag: {
      id: string;
      name: string;
      color?: string;
    };
  }>;
  _count: {
    comments: number;
  };
}

export interface PostsResponse {
  success: boolean;
  data: {
    data: Post[];
    pagination: {
      currentPage: number;
      totalPages: number;
      totalItems: number;
      itemsPerPage: number;
      hasNextPage: boolean;
      hasPrevPage: boolean;
    };
  };
}

export interface PostResponse {
  success: boolean;
  data: {
    post: Post;
  };
} 