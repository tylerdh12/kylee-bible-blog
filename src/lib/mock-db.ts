// Temporary in-memory database for Vercel deployment
/* eslint-disable @typescript-eslint/no-unused-vars */

interface User {
  id: string
  email: string
  password: string
  name?: string
  role: string
  createdAt: Date
  updatedAt: Date
}

interface Post {
  id: string
  title: string
  slug: string
  content: string
  excerpt?: string
  published: boolean
  publishedAt?: Date
  createdAt: Date
  updatedAt: Date
  authorId: string
  author?: User
  tags: Tag[]
}

interface Tag {
  id: string
  name: string
  posts?: Post[]
}

interface Goal {
  id: string
  title: string
  description?: string
  targetAmount: number
  currentAmount: number
  deadline?: Date
  completed: boolean
  createdAt: Date
  updatedAt: Date
  donations: Donation[]
}

interface Donation {
  id: string
  amount: number
  donorName?: string
  message?: string
  anonymous: boolean
  createdAt: Date
  goalId?: string
  goal?: Goal
}

// In-memory storage (mutable for testing)
const storage = {
  users: [
    {
      id: 'user1',
      email: 'kylee@blog.com',
      password: '$2b$12$vTCWqUKNTGANclWDOkqXe.yKfRI/J1mIbtn5JjbL57oD71KTooBm.', // admin123
      name: 'Kylee',
      role: 'admin',
      createdAt: new Date(),
      updatedAt: new Date()
    }
  ] as User[],
  posts: [] as Post[],
  tags: [] as Tag[],
  goals: [] as Goal[],
  donations: [] as Donation[]
}

export const mockDb = {
  user: {
    findUnique: async ({ where }: { where: { email?: string; id?: string } }) => {
      if (where.email) {
        return storage.users.find(u => u.email === where.email) || null
      }
      if (where.id) {
        return storage.users.find(u => u.id === where.id) || null
      }
      return null
    },
    findFirst: async () => {
      return storage.users[0] || null
    },
    create: async ({ data }: { data: Omit<User, 'id' | 'createdAt' | 'updatedAt'> }) => {
      const newUser: User = {
        ...data,
        id: `user${storage.users.length + 1}`,
        createdAt: new Date(),
        updatedAt: new Date()
      }
      storage.users.push(newUser)
      return newUser
    }
  },
  
  post: {
    findMany: async ({ 
      where, 
      include, 
      orderBy, 
      take 
    }: { 
      where?: any
      include?: any
      orderBy?: any
      take?: number
    } = {}) => {
      let filteredPosts = [...storage.posts]
      
      if (where?.published) {
        filteredPosts = filteredPosts.filter(p => p.published)
      }
      
      if (orderBy?.publishedAt === 'desc') {
        filteredPosts.sort((a, b) => (b.publishedAt?.getTime() || 0) - (a.publishedAt?.getTime() || 0))
      }
      
      if (take) {
        filteredPosts = filteredPosts.slice(0, take)
      }
      
      return filteredPosts.map(post => ({
        ...post,
        author: storage.users.find(u => u.id === post.authorId),
        tags: post.tags || []
      }))
    },
    
    findFirst: async ({ where, include }: { where?: any, include?: any } = {}) => {
      const post = storage.posts.find(p => {
        if (where?.slug && p.slug !== where.slug) return false
        if (where?.published !== undefined && p.published !== where.published) return false
        return true
      })
      
      if (!post) return null
      
      return {
        ...post,
        author: storage.users.find(u => u.id === post.authorId),
        tags: post.tags || []
      }
    },
    
    create: async ({ data, include }: { data: any, include?: any }) => {
      const newPost: Post = {
        ...data,
        id: `post${storage.posts.length + 1}`,
        createdAt: new Date(),
        updatedAt: new Date(),
        tags: []
      }

      // Handle tags - support both array of strings and connect format
      if (data.tags) {
        if (Array.isArray(data.tags) && typeof data.tags[0] === 'string') {
          // Handle array of tag names
          newPost.tags = data.tags.map((tagName: string) => {
            let tag = storage.tags.find(t => t.name === tagName)
            if (!tag) {
              tag = {
                id: `tag${storage.tags.length + 1}`,
                name: tagName
              }
              storage.tags.push(tag)
            }
            return tag
          })
        } else if (data.tags?.connect) {
          // Handle connect format
          newPost.tags = data.tags.connect.map((t: { id: string }) =>
            storage.tags.find(tag => tag.id === t.id)
          ).filter(Boolean)
        }
      }

      storage.posts.push(newPost)
      return newPost
    }
  },
  
  tag: {
    upsert: async ({ where, update, create }: { where: { name: string }, update?: any, create: { name: string } }) => {
      let tag = storage.tags.find(t => t.name === where.name)
      if (!tag) {
        tag = {
          id: `tag${storage.tags.length + 1}`,
          name: create.name
        }
        storage.tags.push(tag)
      }
      return tag
    }
  },
  
  goal: {
    findMany: async ({ where, include, orderBy, take }: { where?: any, include?: any, orderBy?: any, take?: number } = {}) => {
      let filteredGoals = [...storage.goals]
      
      if (where?.completed === false) {
        filteredGoals = filteredGoals.filter(g => !g.completed)
      }
      
      if (orderBy?.createdAt === 'desc') {
        filteredGoals.sort((a, b) => b.createdAt.getTime() - a.createdAt.getTime())
      }
      
      if (orderBy && Array.isArray(orderBy)) {
        filteredGoals.sort((a, b) => {
          // Sort by completed first (false first), then by createdAt desc
          if (a.completed !== b.completed) {
            return a.completed ? 1 : -1
          }
          return b.createdAt.getTime() - a.createdAt.getTime()
        })
      }
      
      if (take) {
        filteredGoals = filteredGoals.slice(0, take)
      }
      
      return filteredGoals.map(goal => ({
        ...goal,
        donations: storage.donations.filter(d => d.goalId === goal.id)
      }))
    },
    
    findUnique: async ({ where }: { where: { id: string } }) => {
      return storage.goals.find(g => g.id === where.id) || null
    },
    
    create: async ({ data }: { data: any }) => {
      const newGoal: Goal = {
        ...data,
        id: `goal${storage.goals.length + 1}`,
        currentAmount: data.currentAmount || 0,
        completed: data.completed || false,
        createdAt: new Date(),
        updatedAt: new Date(),
        donations: []
      }
      storage.goals.push(newGoal)
      return newGoal
    },
    
    update: async ({ where, data }: { where: { id: string }, data: any }) => {
      const goalIndex = storage.goals.findIndex(g => g.id === where.id)
      if (goalIndex >= 0) {
        if (data.currentAmount?.increment) {
          storage.goals[goalIndex].currentAmount += data.currentAmount.increment
        }
        if (data.completed !== undefined) {
          storage.goals[goalIndex].completed = data.completed
        }
        storage.goals[goalIndex].updatedAt = new Date()
        return storage.goals[goalIndex]
      }
      return null
    }
  },
  
  donation: {
    findMany: async ({ include, orderBy }: { include?: any, orderBy?: any } = {}) => {
      const donations = [...storage.donations]
      
      if (orderBy?.createdAt === 'desc') {
        donations.sort((a, b) => b.createdAt.getTime() - a.createdAt.getTime())
      }
      
      return donations.map(donation => {
        const result = { ...donation }
        if (include?.goal && donation.goalId) {
          result.goal = storage.goals.find(g => g.id === donation.goalId) || undefined
        }
        return result
      })
    },
    
    create: async ({ data }: { data: any }) => {
      const newDonation: Donation = {
        ...data,
        id: `donation${storage.donations.length + 1}`,
        createdAt: new Date()
      }
      storage.donations.push(newDonation)
      return newDonation
    }
  }
}

export const mockPrisma = mockDb

// Export storage for direct access (useful for statistics)
export const dbStorage = storage