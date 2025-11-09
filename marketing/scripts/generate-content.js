#!/usr/bin/env node

/**
 * Content Generation Script
 * 
 * Uses AI prompts to generate content for blog posts, social media, etc.
 * 
 * Usage:
 *   node marketing/scripts/generate-content.js blog "speed to lead automation"
 *   node marketing/scripts/generate-content.js social "twitter thread about AI calling"
 */

const fs = require('fs')
const path = require('path')

const CONTENT_TYPES = {
  blog: {
    template: path.join(__dirname, '../content-templates/blog-post-template.md'),
    output: path.join(__dirname, '../generated/blog'),
  },
  social: {
    template: path.join(__dirname, '../content-templates/social-media-templates.md'),
    output: path.join(__dirname, '../generated/social'),
  },
}

function generateAIPrompts(contentType, topic) {
  const prompts = {
    blog: {
      title: `Generate a compelling blog post title about "${topic}". Focus on benefits and include keywords like "speed to lead" or "AI calling".`,
      intro: `Write an engaging introduction for a blog post about "${topic}". Start with a hook about how most businesses lose leads. Include the problem and introduce AI as the solution.`,
      sections: [
        `Write a section explaining why the first 5 minutes after a lead comes in is critical. Include statistics and examples.`,
        `Explain how AI-powered automated calling solves the speed to lead problem. Focus on technology and benefits.`,
        `Create a case study showing how a business increased lead conversion by implementing AI calling. Include specific metrics.`,
        `Write a practical guide on how to implement speed to lead automation. Include setup steps and best practices.`,
      ],
      conclusion: `Write a compelling conclusion that summarizes the importance of speed to lead and includes a call to action.`,
    },
    social: {
      twitter: {
        hook: `Write a hook tweet about "${topic}" that grabs attention. Start with a surprising statistic.`,
        problem: `Write a tweet explaining the problem with slow lead follow-up. Keep it under 280 characters.`,
        solution: `Write a tweet explaining how AI calling solves the lead follow-up problem. Include benefits.`,
        cta: `Write a compelling call-to-action tweet for trying a speed to lead automation tool.`,
      },
      linkedin: `Write a professional LinkedIn post about "${topic}". Focus on ROI and business benefits. Target sales leaders and agency owners.`,
    },
  }

  return prompts[contentType] || {}
}

function saveContent(contentType, topic, content) {
  const outputDir = CONTENT_TYPES[contentType].output
  if (!fs.existsSync(outputDir)) {
    fs.mkdirSync(outputDir, { recursive: true })
  }

  const filename = `${topic.replace(/\s+/g, '-').toLowerCase()}-${Date.now()}.md`
  const filepath = path.join(outputDir, filename)

  fs.writeFileSync(filepath, content, 'utf-8')
  console.log(`✅ Content saved to: ${filepath}`)
}

function main() {
  const [contentType, ...topicParts] = process.argv.slice(2)
  const topic = topicParts.join(' ')

  if (!contentType || !topic) {
    console.error('Usage: node generate-content.js <type> <topic>')
    console.error('Types: blog, social')
    console.error('Example: node generate-content.js blog "speed to lead automation"')
    process.exit(1)
  }

  if (!CONTENT_TYPES[contentType]) {
    console.error(`Unknown content type: ${contentType}`)
    console.error('Available types:', Object.keys(CONTENT_TYPES).join(', '))
    process.exit(1)
  }

  console.log(`\n📝 Generating ${contentType} content about: "${topic}"\n`)

  const prompts = generateAIPrompts(contentType, topic)

  console.log('🤖 AI Prompts Generated:\n')
  console.log(JSON.stringify(prompts, null, 2))
  console.log('\n📋 Next Steps:')
  console.log('1. Copy these prompts to Jasper/Copy.ai')
  console.log('2. Generate the content')
  console.log('3. Review and edit as needed')
  console.log('4. Use the templates in content-templates/ for structure\n')

  // Save prompts for reference
  const promptsContent = `# AI Prompts for: ${topic}\n\n\`\`\`json\n${JSON.stringify(prompts, null, 2)}\n\`\`\`\n`
  saveContent(contentType, topic, promptsContent)
}

if (require.main === module) {
  main()
}

module.exports = { generateAIPrompts, saveContent }

