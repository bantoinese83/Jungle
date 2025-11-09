import Link from 'next/link'
import { Metadata } from 'next'

export const metadata: Metadata = {
  title: 'Blog - Speed to Lead Insights & Tips | Jungle',
  description:
    'Learn about speed to lead automation, AI calling, CRM integration, and sales best practices. Get insights to never miss a lead again.',
}

const blogPosts = [
  {
    slug: 'critical-5-minute-window',
    title: 'The Critical 5-Minute Window: How AI Can Revolutionize Your Lead Follow-Up Speed',
    excerpt:
      'Discover how AI-powered speed to lead automation can increase your conversion rates by 10x. Learn how to never miss a lead again.',
    publishedAt: '2024-01-15',
    readTime: '5 min read',
    category: 'Speed to Lead',
  },
]

export default function BlogPage() {
  return (
    <div className="max-w-6xl mx-auto px-4 py-12">
      {/* Schema Markup for Blog */}
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html: JSON.stringify({
            '@context': 'https://schema.org',
            '@type': 'Blog',
            name: 'Jungle Blog',
            description:
              'Insights and tips on speed to lead automation, AI calling, and sales best practices',
            url: `${process.env.NEXT_PUBLIC_APP_URL}/blog`,
            publisher: {
              '@type': 'Organization',
              name: 'Jungle',
            },
          }),
        }}
      />

      <header className="mb-12">
        <h1 className="text-4xl font-bold mb-4">Jungle Blog</h1>
        <p className="text-xl text-gray-600">
          Insights on speed to lead automation, AI calling, and sales best practices
        </p>
      </header>

      <div className="grid gap-8 md:grid-cols-2 lg:grid-cols-3">
        {blogPosts.map((post) => (
          <article
            key={post.slug}
            className="border rounded-lg overflow-hidden hover:shadow-lg transition"
          >
            <Link href={`/blog/${post.slug}`}>
              <div className="p-6">
                <div className="mb-2">
                  <span className="text-sm text-emerald-600 font-semibold">
                    {post.category}
                  </span>
                </div>
                <h2 className="text-2xl font-bold mb-3 hover:text-emerald-600 transition">
                  {post.title}
                </h2>
                <p className="text-gray-600 mb-4">{post.excerpt}</p>
                <div className="flex items-center justify-between text-sm text-gray-500">
                  <time dateTime={post.publishedAt}>
                    {new Date(post.publishedAt).toLocaleDateString('en-US', {
                      year: 'numeric',
                      month: 'long',
                      day: 'numeric',
                    })}
                  </time>
                  <span>{post.readTime}</span>
                </div>
              </div>
            </Link>
          </article>
        ))}
      </div>

      {/* Newsletter Signup */}
      <section className="mt-16 bg-emerald-50 p-8 rounded-lg">
        <h2 className="text-2xl font-bold mb-4">Stay Updated</h2>
        <p className="mb-6 text-gray-700">
          Get weekly tips on speed to lead automation and sales best practices.
        </p>
        <form className="flex gap-4">
          <input
            type="email"
            placeholder="Enter your email"
            className="flex-1 px-4 py-2 rounded-lg border"
          />
          <button
            type="submit"
            className="bg-emerald-600 text-white px-6 py-2 rounded-lg font-semibold hover:bg-emerald-700 transition"
          >
            Subscribe
          </button>
        </form>
      </section>
    </div>
  )
}

