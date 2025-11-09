import { Metadata } from 'next'
import { notFound } from 'next/navigation'

interface BlogPost {
  slug: string
  title: string
  metaDescription: string
  content: string
  publishedAt: Date
  author: string
  featuredImage?: string
}

// In production, fetch from CMS or database
const blogPosts: Record<string, BlogPost> = {
  'critical-5-minute-window': {
    slug: 'critical-5-minute-window',
    title: 'The Critical 5-Minute Window: How AI Can Revolutionize Your Lead Follow-Up Speed',
    metaDescription:
      'Discover how AI-powered speed to lead automation can increase your conversion rates by 10x. Learn how to never miss a lead again with automated AI calling.',
    content: `
# The Critical 5-Minute Window: How AI Can Revolutionize Your Lead Follow-Up Speed

Most businesses lose 78% of leads in the first 5 minutes. Here's how AI can fix that.

## The Problem

By the time your sales team calls back, the lead has already:
- Contacted 3 competitors
- Lost interest
- Made a decision elsewhere

Speed matters. Every minute of delay costs you revenue.

## The Solution

AI-powered automated calling ensures leads are contacted within 60 seconds—every time.

### How It Works

1. Lead comes in via your CRM
2. AI automatically calls within 60 seconds
3. AI qualifies the lead
4. Follow-up scheduled if needed

You never miss a lead again, even at 2 AM.

## The Results

Businesses using speed to lead automation see:
- 10x conversion rate increase
- 24/7 lead coverage
- Zero manual work
- Full CRM integration

## Get Started

Ready to never miss a lead again? Try Jungle free for 14 days.

[Start Free Trial](/signup)
    `,
    publishedAt: new Date(),
    author: 'Jungle Team',
    featuredImage: '/images/blog/critical-5-minute-window.jpg',
  },
}

export async function generateStaticParams() {
  return Object.keys(blogPosts).map((slug) => ({ slug }))
}

export async function generateMetadata({
  params,
}: {
  params: { slug: string }
}): Promise<Metadata> {
  const post = blogPosts[params.slug]

  if (!post) {
    return {}
  }

  return {
    title: post.title,
    description: post.metaDescription,
    openGraph: {
      title: post.title,
      description: post.metaDescription,
      images: post.featuredImage ? [post.featuredImage] : [],
      type: 'article',
      publishedTime: post.publishedAt.toISOString(),
      authors: [post.author],
    },
    twitter: {
      card: 'summary_large_image',
      title: post.title,
      description: post.metaDescription,
      images: post.featuredImage ? [post.featuredImage] : [],
    },
  }
}

export default async function BlogPostPage({
  params,
}: {
  params: { slug: string }
}) {
  const post = blogPosts[params.slug]

  if (!post) {
    notFound()
  }

  return (
    <article className="max-w-4xl mx-auto px-4 py-12">
      {/* Schema Markup for Article */}
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html: JSON.stringify({
            '@context': 'https://schema.org',
            '@type': 'Article',
            headline: post.title,
            description: post.metaDescription,
            image: post.featuredImage,
            datePublished: post.publishedAt.toISOString(),
            author: {
              '@type': 'Person',
              name: post.author,
            },
            publisher: {
              '@type': 'Organization',
              name: 'Jungle',
              logo: {
                '@type': 'ImageObject',
                url: `${process.env.NEXT_PUBLIC_APP_URL}/logo.png`,
              },
            },
          }),
        }}
      />

      <header className="mb-8">
        <h1 className="text-4xl font-bold mb-4">{post.title}</h1>
        <div className="flex items-center gap-4 text-gray-600">
          <span>By {post.author}</span>
          <span>•</span>
          <time dateTime={post.publishedAt.toISOString()}>
            {post.publishedAt.toLocaleDateString('en-US', {
              year: 'numeric',
              month: 'long',
              day: 'numeric',
            })}
          </time>
        </div>
      </header>

      {post.featuredImage && (
        <div className="mb-8">
          <img
            src={post.featuredImage}
            alt={post.title}
            className="w-full rounded-lg"
          />
        </div>
      )}

      <div
        className="prose prose-lg max-w-none"
        dangerouslySetInnerHTML={{ __html: post.content }}
        // Note: In production, this content should be sanitized or rendered via a markdown library
        // For now, content is from a controlled source (blogPosts object), but this should be
        // replaced with a proper markdown renderer (e.g., react-markdown) if content becomes user-generated
      />

      <footer className="mt-12 pt-8 border-t">
        <div className="bg-emerald-50 p-6 rounded-lg">
          <h2 className="text-2xl font-bold mb-4">Ready to Never Miss a Lead Again?</h2>
          <p className="mb-6">
            Start your free 14-day trial of Jungle. No credit card required.
          </p>
          <a
            href="/signup"
            className="inline-block bg-emerald-600 text-white px-6 py-3 rounded-lg font-semibold hover:bg-emerald-700 transition"
          >
            Start Free Trial
          </a>
        </div>
      </footer>
    </article>
  )
}

