import { useEffect, useMemo, useState } from 'react'
import toast from 'react-hot-toast'
import ArticleDetailModal from './ArticleDetailModal'
import { useAuthStore } from '../store/userAuth'
import { api, getApiErrorMessage } from '../utils/api'

function getAuthorName(author) {
  if (!author || typeof author === 'string') {
    return 'Unknown author'
  }

  const fullName = [author.firstName, author.lastName].filter(Boolean).join(' ')
  return fullName || author.email || 'Unknown author'
}

function formatPublishedDate(value) {
  if (!value) {
    return 'Recently published'
  }

  return new Intl.DateTimeFormat('en-IN', {
    dateStyle: 'medium',
  }).format(new Date(value))
}

function ArticleFeed() {
  const currentUser = useAuthStore((state) => state.currentUser)
  const [articles, setArticles] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [commentDrafts, setCommentDrafts] = useState({})
  const [submittingArticleId, setSubmittingArticleId] = useState('')
  const [selectedArticleId, setSelectedArticleId] = useState('')

  useEffect(() => {
    let isMounted = true

    const readArticles = async () => {
      try {
        setLoading(true)
        setError('')

        const res = await api.get('/user-api/articles')

        if (isMounted) {
          setArticles(res.data?.payload ?? [])
        }
      } catch (err) {
        if (isMounted) {
          setError(getApiErrorMessage(err, 'Unable to load articles'))
        }
      } finally {
        if (isMounted) {
          setLoading(false)
        }
      }
    }

    readArticles()

    return () => {
      isMounted = false
    }
  }, [])

  const selectedArticle = useMemo(
    () => articles.find((article) => article._id === selectedArticleId) ?? null,
    [articles, selectedArticleId],
  )

  const handleDraftChange = (articleId, value) => {
    setCommentDrafts((currentDrafts) => ({
      ...currentDrafts,
      [articleId]: value,
    }))
  }

  const handleCommentSubmit = async (articleId) => {
    const commentText = commentDrafts[articleId]?.trim()

    if (!commentText) {
      toast.error('Please write a comment before posting')
      return
    }

    try {
      setSubmittingArticleId(articleId)

      const res = await api.post(`/user-api/articles/${articleId}/comments`, {
        comment: commentText,
      })

      const updatedArticle = res.data?.payload

      if (updatedArticle) {
        setArticles((currentArticles) =>
          currentArticles.map((article) =>
            article._id === articleId ? updatedArticle : article,
          ),
        )
      }

      setCommentDrafts((currentDrafts) => ({
        ...currentDrafts,
        [articleId]: '',
      }))

      toast.success(res.data?.message || 'Comment added')
    } catch (err) {
      const message = getApiErrorMessage(err, 'Unable to add comment')

      toast.error(message)
    } finally {
      setSubmittingArticleId('')
    }
  }

  return (
    <section className="article-board">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <p className="text-sm font-semibold uppercase tracking-[0.24em] text-sky-600">
            Reader space
          </p>
          <h2 className="mt-2 text-3xl font-semibold text-blue-400">
            Latest articles from all authors
          </h2>
          <p className="mt-3 max-w-2xl text-sm text-slate-600 sm:text-base">
            {currentUser?.firstName
              ? `Welcome ${currentUser.firstName}. Explore the newest posts across every author.`
              : 'Explore the newest posts across every author.'}
          </p>
        </div>

        <div className="inline-flex w-fit rounded-full border border-slate-200 bg-white/80 px-4 py-2 text-sm font-medium text-slate-600">
          {articles.length} article{articles.length === 1 ? '' : 's'}
        </div>
      </div>

      {loading ? (
        <div className="mt-8 rounded-[28px] border bg-white/75 px-6 py-12 text-center text-slate-600">
          Loading articles...
        </div>
      ) : null}

      {!loading && error ? (
        <div className="mt-8 rounded-[28px] border bg-red-50 px-6 py-12 text-center text-red-600">
          {error}
        </div>
      ) : null}

      {!loading && !error && articles.length === 0 ? (
        <div className="mt-8 rounded-[28px] border border-slate-200 bg-white/75 px-6 py-12 text-center text-slate-600">
          No articles are available yet.
        </div>
      ) : null}

      {!loading && !error && articles.length > 0 ? (
        <div className="mt-8 grid grid-cols-1 gap-5 lg:grid-cols-2">
          {articles.map((article) => (
            <button
              key={article._id}
              type="button"
              className="article-preview-card text-left"
              onClick={() => setSelectedArticleId(article._id)}
            >
              <div className="flex items-start justify-between gap-3">
                <span className="rounded-full bg-sky-100 px-3 py-1 text-xs font-semibold uppercase tracking-[0.18em] text-sky-700">
                  {article.category}
                </span>
                <span className="text-xs font-medium text-slate-400">
                  {article.comments?.length ?? 0} comments
                </span>
              </div>

              <h3 className="mt-4 text-xl font-semibold text-slate-800">
                {article.title}
              </h3>

              <p className="mt-3 text-sm leading-6 text-slate-600">
                {article.content.length > 180
                  ? `${article.content.slice(0, 180)}...`
                  : article.content}
              </p>

              <div className="mt-6 rounded-2xl bg-slate-50 px-4 py-3">
                <p className="text-sm font-semibold text-slate-700">
                  {getAuthorName(article.author)}
                </p>
                <p className="mt-1 text-xs text-slate-500">
                  Published {formatPublishedDate(article.createdAt)}
                </p>
              </div>

              <p className="mt-4 text-sm font-semibold text-sky-600">
                Click to view article details and comments
              </p>
            </button>
          ))}
        </div>
      ) : null}

      <ArticleDetailModal
        article={selectedArticle}
        onClose={() => setSelectedArticleId('')}
        allowComment
        commentValue={
          selectedArticleId ? commentDrafts[selectedArticleId] ?? '' : ''
        }
        onCommentChange={(value) => {
          if (selectedArticleId) {
            handleDraftChange(selectedArticleId, value)
          }
        }}
        onCommentSubmit={() => {
          if (selectedArticleId) {
            void handleCommentSubmit(selectedArticleId)
          }
        }}
        submitting={submittingArticleId === selectedArticleId}
      />
    </section>
  )
}

export default ArticleFeed
