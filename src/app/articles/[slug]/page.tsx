import type { Metadata } from 'next'
import { notFound } from 'next/navigation'
import Link from 'next/link'
import { serverNewsApi } from '@/lib/api-server'
import { getCompany } from '@/lib/company'
import { resolveLocale } from '@/lib/locale'
import { publicSiteOrigin } from '@/lib/product-seo'
import { Article } from '@/lib/types'
import {
  getArticleImageUrl,
  getArticleOpenGraphImageUrls,
} from '@/lib/image-utils'
import { resolveArticleAuthorLabel } from '@/lib/article-author-options'
import { Calendar, User, ArrowLeft, Clock } from 'lucide-react'

interface ArticlePageProps {
  params: Promise<{ slug: string }>
}

function parseArticleList(data: unknown): Article | null {
  const articles = Array.isArray(data) ? data : (data as { results?: Article[] })?.results || []
  return articles[0] || null
}

async function getArticle(slug: string): Promise<Article | null> {
  try {
    const listData = await serverNewsApi.articles.getBySlug(slug)
    let article = parseArticleList(listData)
    if (!article) return null

    const needsDetail =
      !String(article.content || '').trim() && article.id != null && article.id !== ''
    if (needsDetail) {
      try {
        const full = await serverNewsApi.articles.get(String(article.id))
        if (full && typeof full === 'object') {
          article = { ...article, ...(full as Article) }
        }
      } catch (error) {
        console.error('Error fetching article detail:', error)
      }
    }

    return article
  } catch (error) {
    console.error('Error fetching article:', error)
    return null
  }
}

export async function generateMetadata({ params }: ArticlePageProps): Promise<Metadata> {
  const { slug } = await params
  const [article, company] = await Promise.all([getArticle(slug), getCompany()])
  const companyName = company?.name?.trim() || 'Store'

  if (!article) {
    return { title: `Article | ${companyName}` }
  }

  const titleBase = (article.seo_title || article.title || '').trim() || 'Article'
  const title = `${titleBase} | ${companyName}`
  const description = (
    article.seo_description ||
    article.excerpt ||
    article.subtitle ||
    ''
  ).trim()
  const site = publicSiteOrigin()
  const canonical = site ? `${site}/articles/${slug}` : undefined
  const ogImages = getArticleOpenGraphImageUrls(article)
  const authorLabel = resolveArticleAuthorLabel(article)

  return {
    title,
    description,
    openGraph: {
      title,
      description,
      type: 'article',
      ...(canonical ? { url: canonical } : {}),
      ...(ogImages.length > 0 ? { images: ogImages.map((url) => ({ url, alt: titleBase })) } : {}),
      ...(article.published_at ? { publishedTime: article.published_at } : {}),
      authors: [authorLabel],
    },
    twitter: {
      card: 'summary_large_image',
      title,
      description,
      ...(ogImages[0] ? { images: [ogImages[0]] } : {}),
    },
  }
}

export default async function ArticlePage({ params }: ArticlePageProps) {
  const { slug } = await params
  const [article, company] = await Promise.all([getArticle(slug), getCompany()])
  const locale = resolveLocale(company)

  if (!article) {
    notFound()
  }

  const heroSrc = getArticleImageUrl(article)
  const authorLabel = resolveArticleAuthorLabel(article)

  return (
    <div className="min-h-screen bg-vintage-background">
      <div className="bg-white border-b border-gray-200">
        <div className="container-wide py-4">
          <Link
            href="/articles"
            className="flex items-center text-text-muted hover:text-vintage-primary transition-colors"
          >
            <ArrowLeft className="w-4 h-4 mr-2" />
            Back to Style Journal
          </Link>
        </div>
      </div>

      <article>
        <div className="w-full h-64 md:h-96 relative">
          <img
            src={heroSrc}
            alt={article.title}
            className="w-full h-full object-cover"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent" />
        </div>

        <div className="container-narrow py-12">
          {article.category && (
            <span className="tag tag-vintage mb-4">{article.category.name}</span>
          )}

          <h1 className="text-3xl md:text-4xl lg:text-5xl font-bold font-playfair text-text mb-4">
            {article.title}
          </h1>

          {article.subtitle && (
            <p className="text-xl text-text-light mb-6">{article.subtitle}</p>
          )}

          <div className="flex flex-wrap items-center gap-6 text-sm text-text-muted mb-8 pb-8 border-b border-gray-200">
            <span className="flex items-center gap-2">
              <User className="w-4 h-4" />
              {authorLabel}
            </span>
            {article.published_at && (
              <span className="flex items-center gap-2">
                <Calendar className="w-4 h-4" />
                {new Date(article.published_at).toLocaleDateString(locale, {
                  year: 'numeric',
                  month: 'long',
                  day: 'numeric',
                })}
              </span>
            )}
            {article.read_time_minutes && (
              <span className="flex items-center gap-2">
                <Clock className="w-4 h-4" />
                {article.read_time_minutes} min read
              </span>
            )}
          </div>

          {article.content ? (
            <div
              className="article-content"
              dangerouslySetInnerHTML={{ __html: article.content }}
            />
          ) : article.excerpt ? (
            <p className="text-lg text-text leading-relaxed">{article.excerpt}</p>
          ) : null}

          {article.tags && article.tags.length > 0 && (
            <div className="mt-12 pt-8 border-t border-gray-200">
              <h3 className="text-sm font-semibold text-text-muted mb-3">Tags</h3>
              <div className="flex flex-wrap gap-2">
                {article.tags.map((tag) => (
                  <span key={tag.id} className="tag tag-vintage">
                    {tag.name}
                  </span>
                ))}
              </div>
            </div>
          )}
        </div>
      </article>

      <section className="py-12 bg-white border-t border-gray-200">
        <div className="container-narrow text-center">
          <h2 className="text-2xl font-bold font-playfair text-text mb-4">
            Discover Our Collection
          </h2>
          <p className="text-text-muted mb-6">
            Find new arrivals, wardrobe staples, and seasonal edits in our shop.
          </p>
          <Link href="/products" className="btn btn-primary">
            Shop Now
          </Link>
        </div>
      </section>
    </div>
  )
}
