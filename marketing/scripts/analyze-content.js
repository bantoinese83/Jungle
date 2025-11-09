#!/usr/bin/env node

/**
 * Content Analysis Script
 * 
 * Analyzes content for SEO/AEO optimization:
 * - Keyword density
 * - Semantic keywords
 * - Readability score
 * - AEO optimization (conversational queries)
 * 
 * Usage:
 *   node marketing/scripts/analyze-content.js path/to/content.md
 */

const fs = require('fs')
const path = require('path')

const PRIMARY_KEYWORDS = [
  'speed to lead',
  'AI sales caller',
  'lead qualification automation',
  'AI calling',
  'automated lead follow-up',
]

const SEMANTIC_KEYWORDS = [
  'lead response time',
  'sales automation',
  'CRM integration',
  'GoHighLevel',
  'lead conversion',
  'sales efficiency',
  'customer acquisition',
  'lead nurturing',
]

const CONVERSATIONAL_QUERIES = [
  'how to improve sales lead response time',
  'what is the best AI caller for sales',
  'can AI integrate with GoHighLevel for lead follow-up',
  'how does speed to lead work',
  'what is automated lead qualification',
]

function analyzeKeywords(text) {
  const lowerText = text.toLowerCase()
  const wordCount = text.split(/\s+/).length

  const keywordCounts = {}
  PRIMARY_KEYWORDS.forEach((keyword) => {
    const regex = new RegExp(keyword.toLowerCase(), 'gi')
    const matches = lowerText.match(regex)
    keywordCounts[keyword] = matches ? matches.length : 0
  })

  const semanticCounts = {}
  SEMANTIC_KEYWORDS.forEach((keyword) => {
    const regex = new RegExp(keyword.toLowerCase(), 'gi')
    const matches = lowerText.match(regex)
    semanticCounts[keyword] = matches ? matches.length : 0
  })

  return {
    wordCount,
    primaryKeywords: keywordCounts,
    semanticKeywords: semanticCounts,
    keywordDensity: Object.values(keywordCounts).reduce((a, b) => a + b, 0) / wordCount,
  }
}

function analyzeAEO(text) {
  const lowerText = text.toLowerCase()
  const queryMatches = {}

  CONVERSATIONAL_QUERIES.forEach((query) => {
    const keywords = query.split(' ')
    const matches = keywords.filter((keyword) =>
      lowerText.includes(keyword.toLowerCase())
    ).length
    queryMatches[query] = {
      matched: matches,
      total: keywords.length,
      coverage: (matches / keywords.length) * 100,
    }
  })

  return queryMatches
}

function calculateReadability(text) {
  // Simple Flesch Reading Ease approximation
  const sentences = text.split(/[.!?]+/).filter((s) => s.trim().length > 0)
  const words = text.split(/\s+/)
  const syllables = words.reduce((count, word) => {
    return count + (word.match(/[aeiouy]+/gi) || []).length
  }, 0)

  const avgSentenceLength = words.length / sentences.length
  const avgSyllablesPerWord = syllables / words.length

  const score =
    206.835 - 1.015 * avgSentenceLength - 84.6 * avgSyllablesPerWord

  let level = 'Very Easy'
  if (score < 30) level = 'Very Difficult'
  else if (score < 50) level = 'Difficult'
  else if (score < 60) level = 'Fairly Difficult'
  else if (score < 70) level = 'Standard'
  else if (score < 80) level = 'Fairly Easy'
  else if (score < 90) level = 'Easy'

  return { score: Math.round(score), level }
}

function generateReport(filepath, content) {
  const keywordAnalysis = analyzeKeywords(content)
  const aeoAnalysis = analyzeAEO(content)
  const readability = calculateReadability(content)

  console.log('\n📊 Content Analysis Report\n')
  console.log('='.repeat(50))
  console.log(`File: ${filepath}`)
  console.log('='.repeat(50))

  console.log('\n📈 Keyword Analysis:')
  console.log(`Total Words: ${keywordAnalysis.wordCount}`)
  console.log(`Keyword Density: ${(keywordAnalysis.keywordDensity * 100).toFixed(2)}%`)
  console.log('\nPrimary Keywords:')
  Object.entries(keywordAnalysis.primaryKeywords).forEach(([keyword, count]) => {
    console.log(`  ${keyword}: ${count} occurrences`)
  })

  console.log('\nSemantic Keywords:')
  const semanticFound = Object.entries(keywordAnalysis.semanticKeywords).filter(
    ([, count]) => count > 0
  )
  if (semanticFound.length > 0) {
    semanticFound.forEach(([keyword, count]) => {
      console.log(`  ${keyword}: ${count} occurrences`)
    })
  } else {
    console.log('  ⚠️  No semantic keywords found')
  }

  console.log('\n🤖 AEO Optimization (Conversational Queries):')
  Object.entries(aeoAnalysis).forEach(([query, data]) => {
    const status = data.coverage >= 70 ? '✅' : data.coverage >= 50 ? '⚠️' : '❌'
    console.log(
      `  ${status} "${query}": ${data.matched}/${data.total} keywords (${data.coverage.toFixed(0)}% coverage)`
    )
  })

  console.log('\n📖 Readability:')
  console.log(`  Score: ${readability.score} (${readability.level})`)
  if (readability.score < 60) {
    console.log('  ⚠️  Consider simplifying for better readability')
  }

  console.log('\n💡 Recommendations:')
  const recommendations = []

  if (keywordAnalysis.keywordDensity < 0.01) {
    recommendations.push('Increase primary keyword usage')
  }

  const lowAEO = Object.values(aeoAnalysis).filter((d) => d.coverage < 50)
  if (lowAEO.length > 0) {
    recommendations.push('Add more conversational query keywords')
  }

  if (readability.score < 60) {
    recommendations.push('Simplify language for better readability')
  }

  if (recommendations.length === 0) {
    console.log('  ✅ Content is well optimized!')
  } else {
    recommendations.forEach((rec) => console.log(`  • ${rec}`))
  }

  console.log('\n')
}

function main() {
  const filepath = process.argv[2]

  if (!filepath) {
    console.error('Usage: node analyze-content.js <filepath>')
    process.exit(1)
  }

  if (!fs.existsSync(filepath)) {
    console.error(`File not found: ${filepath}`)
    process.exit(1)
  }

  const content = fs.readFileSync(filepath, 'utf-8')
  generateReport(filepath, content)
}

if (require.main === module) {
  main()
}

module.exports = { analyzeKeywords, analyzeAEO, calculateReadability }

