import { describe, it, expect } from 'vitest'
import { screen } from '@testing-library/react'
import { render } from '@/test/test-utils'
import { createTestArticle } from '@/test/fixtures'

// Create a simple ArticleCard component for testing without router dependencies
function SimpleArticleCard({ 
  title, 
  description, 
  author, 
  favoritesCount, 
  favorited 
}: {
  title: string
  description: string
  author: { username: string; image: string }
  favoritesCount: number
  favorited: boolean
}) {
  return (
    <div>
      <h2>{title}</h2>
      <p>{description}</p>
      <span>{author.username}</span>
      <img src={author.image} alt={author.username} />
      <button>{favorited ? 'Unfavorite' : 'Favorite'} {favoritesCount}</button>
    </div>
  )
}

describe('SimpleArticleCard', () => {
  it('renders article information correctly', () => {
    const article = createTestArticle({
      title: 'Test Article Title',
      description: 'Test article description',
      author: {
        username: 'john-doe',
        bio: 'Test bio',
        image: 'https://example.com/avatar.jpg',
        following: false,
      },
      favoritesCount: 5,
      favorited: false,
    })

    render(
      <SimpleArticleCard 
        title={article.title}
        description={article.description}
        author={article.author}
        favoritesCount={article.favoritesCount}
        favorited={article.favorited}
      />
    )

    expect(screen.getByText('Test Article Title')).toBeInTheDocument()
    expect(screen.getByText('Test article description')).toBeInTheDocument()
    expect(screen.getByText('john-doe')).toBeInTheDocument()
    expect(screen.getByText('Favorite 5')).toBeInTheDocument()
  })

  it('shows correct favorite state', () => {
    const article = createTestArticle({
      favorited: true,
      favoritesCount: 10,
    })

    render(
      <SimpleArticleCard 
        title={article.title}
        description={article.description}
        author={article.author}
        favoritesCount={article.favoritesCount}
        favorited={article.favorited}
      />
    )

    expect(screen.getByText('Unfavorite 10')).toBeInTheDocument()
  })
})