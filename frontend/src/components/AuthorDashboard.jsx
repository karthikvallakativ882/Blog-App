import { useEffect, useMemo, useState } from 'react'
import toast from 'react-hot-toast'
import AddArticle from './AddArticle'
import ArticleDetailModal from './ArticleDetailModal'
import { useAuthStore } from '../store/userAuth'
import { api, getApiErrorMessage } from '../utils/api'

function formatPublishedDate(value) {
  if (!value) {
    return 'Recently updated'
  }

  return new Intl.DateTimeFormat('en-IN', {
    dateStyle: 'medium',
  }).format(new Date(value))
}

function normalizeArticle(article, currentUser) {
  if (!article) {
    return null
  }

  return {
    ...article,
    author:
      typeof article.author === 'object' && article.author
        ? article.author
        : currentUser,
    comments: article.comments ?? [],
    isArticleActive: article.isArticleActive ?? true,
  }
}

function AuthorDashboard() {
  const currentUser = useAuthStore((state) => state.currentUser)
  const [articles, setArticles] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [selectedArticleId, setSelectedArticleId] = useState('')
  const [articleToEdit, setArticleToEdit] = useState(null)
  const [visibilitySubmittingId, setVisibilitySubmittingId] = useState('')

  useEffect(() => {
    let isMounted = true

    const readArticles = async () => {
      if (!currentUser?._id) {
        setLoading(false)
        return
      }

      try {
        setLoading(true)
        setError('')

        const res = await api.get(`/author-api/articles/${currentUser._id}`)

        if (isMounted) {
          setArticles((res.data?.payload ?? []).map((article) => normalizeArticle(article, currentUser)))
        }
      } catch (err) {
        if (isMounted) {
          setError(getApiErrorMessage(err, 'Unable to load your articles'))
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
  }, [currentUser])

  const selectedArticle = useMemo(
    () => articles.find((article) => article._id === selectedArticleId) ?? null,
    [articles, selectedArticleId],
  )

  const visibleArticleCount = articles.filter((article) => article.isArticleActive).length
  const hiddenArticleCount = articles.length - visibleArticleCount

  const handleArticleCreated = (article) => {
    const normalizedArticle = normalizeArticle(article, currentUser)

    if (!normalizedArticle) {
      return
    }

    setArticles((currentArticles) => [normalizedArticle, ...currentArticles])
  }

  const handleArticleUpdated = (article) => {
    const normalizedArticle = normalizeArticle(article, currentUser)

    if (!normalizedArticle) {
      return
    }

    setArticles((currentArticles) =>
      currentArticles.map((currentArticle) =>
        currentArticle._id === normalizedArticle._id
          ? normalizedArticle
          : currentArticle,
      ),
    )

    setArticleToEdit((currentArticle) =>
      currentArticle?._id === normalizedArticle._id ? normalizedArticle : currentArticle,
    )
  }

  const handleEditArticle = (article) => {
    setArticleToEdit(normalizeArticle(article, currentUser))
    setSelectedArticleId('')
  }

  const handleToggleVisibility = async (article) => {
    if (!article?._id) {
      return
    }

    try {
      setVisibilitySubmittingId(article._id)

      const nextVisibility = !article.isArticleActive
      const res = await api.patch(
        `/author-api/articles/${article._id}/visibility`,
        {
          isArticleActive: nextVisibility,
        },
      )

      handleArticleUpdated(res.data?.payload)
      toast.success(
        res.data?.message ||
          (nextVisibility ? 'Article is visible again' : 'Article hidden from readers'),
      )
    } catch (err) {
      const message = getApiErrorMessage(err, 'Unable to update article visibility')

      toast.error(message)
    } finally {
      setVisibilitySubmittingId('')
    }
  }

  return (
    <div className="space-y-8">
      <section className="welcome-card">
        <p className="text-sm font-semibold uppercase tracking-[0.24em] text-sky-600">
          Author dashboard
        </p>
        <h2 className="mt-3 text-3xl font-semibold text-slate-800">
          Create, edit, hide, and restore articles from your author space.
        </h2>
        <p className="mt-4 max-w-2xl text-base text-slate-600">
          Hidden articles stay in your dashboard, but readers only see the ones
          you keep visible.
        </p>

        <div className="mt-6 flex flex-wrap items-center justify-center gap-3">
          <div className="inline-flex rounded-full border border-slate-200 bg-white/80 px-4 py-2 text-sm font-medium text-slate-600">
            {articles.length} total article{articles.length === 1 ? '' : 's'}
          </div>
          <div className="inline-flex rounded-full border border-emerald-200 bg-emerald-50 px-4 py-2 text-sm font-medium text-emerald-700">
            {visibleArticleCount} visible
          </div>
          <div className="inline-flex rounded-full border border-amber-200 bg-amber-50 px-4 py-2 text-sm font-medium text-amber-700">
            {hiddenArticleCount} hidden
          </div>
        </div>
      </section>

      <AddArticle
        articleToEdit={articleToEdit}
        onArticleCreated={handleArticleCreated}
        onArticleUpdated={handleArticleUpdated}
        onCancelEdit={() => setArticleToEdit(null)}
      />

      <section className="placeholder-card">
        <h3 className="text-2xl font-semibold text-slate-800">Your articles</h3>
        <p className="mt-3 text-sm text-slate-500">
          Open any article to review comments, then edit it or change whether readers can see it.
        </p>

        {loading ? (
          <div className="mt-6 rounded-[24px] border border-slate-200 bg-white/70 px-6 py-10 text-center text-slate-600">
            Loading your articles...
          </div>
        ) : null}

        {!loading && error ? (
          <div className="mt-6 rounded-[24px] border bg-red-50 px-6 py-10 text-center text-red-600">
            {error}
          </div>
        ) : null}

        {!loading && !error && articles.length === 0 ? (
          <div className="mt-6 rounded-[24px] border border-slate-200 bg-white/70 px-6 py-10 text-center text-slate-600">
            No articles found for this author account yet.
          </div>
        ) : null}

        {!loading && !error && articles.length > 0 ? (
          <div className="mt-6 grid gap-4 md:grid-cols-2">
            {articles.map((article) => {
              const isHidden = !article.isArticleActive
              const isSavingVisibility = visibilitySubmittingId === article._id

              return (
                <article
                  key={article._id}
                  className={`article-preview-card text-left ${
                    isHidden ? 'border-amber-200 bg-amber-50/70' : ''
                  }`}
                >
                  <div className="flex items-start justify-between gap-3">
                    <div className="flex flex-wrap items-center gap-2">
                      <span className="rounded-full bg-sky-100 px-3 py-1 text-xs font-semibold uppercase tracking-[0.18em] text-sky-700">
                        {article.category}
                      </span>
                      <span
                        className={`rounded-full px-3 py-1 text-xs font-semibold uppercase tracking-[0.18em] ${
                          isHidden
                            ? 'bg-amber-100 text-amber-700'
                            : 'bg-emerald-100 text-emerald-700'
                        }`}
                      >
                        {isHidden ? 'Hidden' : 'Visible'}
                      </span>
                    </div>

                    <div className="text-right">
                      <p className="text-xs font-medium text-slate-400">
                        {formatPublishedDate(article.updatedAt || article.createdAt)}
                      </p>
                      <p className="mt-1 text-xs font-medium text-slate-400">
                        {article.comments?.length ?? 0} comments
                      </p>
                    </div>
                  </div>

                  <h4 className="mt-4 text-xl font-semibold text-slate-800">
                    {article.title}
                  </h4>
                  <p className="mt-3 text-sm leading-6 text-slate-600">
                    {article.content.length > 180
                      ? `${article.content.slice(0, 180)}...`
                      : article.content}
                  </p>

                  <p
                    className={`mt-4 text-sm font-semibold ${
                      isHidden ? 'text-amber-700' : 'text-sky-600'
                    }`}
                  >
                    {isHidden
                      ? 'Readers cannot see this article until you show it again.'
                      : 'Readers can currently view this article.'}
                  </p>

                  <div className="mt-6 flex flex-wrap gap-3">
                    <button
                      type="button"
                      className="primary-button"
                      onClick={() => setSelectedArticleId(article._id)}
                    >
                      View details
                    </button>
                    <button
                      type="button"
                      className="nav-button border border-slate-200 bg-slate-50"
                      onClick={() => handleEditArticle(article)}
                    >
                      Edit
                    </button>
                    <button
                      type="button"
                      className={`nav-button border ${
                        isHidden
                          ? 'border-emerald-200 bg-emerald-50 text-emerald-700'
                          : 'border-amber-200 bg-amber-50 text-amber-700'
                      }`}
                      onClick={() => {
                        void handleToggleVisibility(article)
                      }}
                      disabled={isSavingVisibility}
                    >
                      {isSavingVisibility
                        ? 'Saving...'
                        : isHidden
                          ? 'Show article'
                          : 'Hide article'}
                    </button>
                  </div>
                </article>
              )
            })}
          </div>
        ) : null}
      </section>

      <ArticleDetailModal
        article={selectedArticle}
        onClose={() => setSelectedArticleId('')}
        showAuthorActions
        onEdit={handleEditArticle}
        onToggleVisibility={(article) => {
          void handleToggleVisibility(article)
        }}
        visibilitySubmitting={visibilitySubmittingId === selectedArticleId}
      />
    </div>
  )
}

export default AuthorDashboard
