import CommentThread from './CommentThread'

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

function ArticleDetailModal({
  article,
  onClose,
  allowComment = false,
  commentValue = '',
  onCommentChange,
  onCommentSubmit,
  submitting = false,
  showAuthorActions = false,
  onEdit,
  onToggleVisibility,
  visibilitySubmitting = false,
}) {
  if (!article) {
    return null
  }

  return (
    <div
      className="modal-overlay"
      role="dialog"
      aria-modal="true"
      aria-labelledby={`article-modal-${article._id}`}
      onClick={onClose}
    >
      <div
        className="modal-card"
        onClick={(event) => event.stopPropagation()}
      >
        <div className="flex items-start justify-between gap-4">
          <div>
            <div className="flex flex-wrap items-center gap-3">
              <span className="rounded-full bg-sky-100 px-3 py-1 text-xs font-semibold uppercase tracking-[0.18em] text-sky-700">
                {article.category}
              </span>
              <span className="text-xs font-medium text-slate-400">
                {article.comments?.length ?? 0} comments
              </span>
              {showAuthorActions ? (
                <span
                  className={`rounded-full px-3 py-1 text-xs font-semibold uppercase tracking-[0.18em] ${
                    article.isArticleActive
                      ? 'bg-emerald-100 text-emerald-700'
                      : 'bg-amber-100 text-amber-700'
                  }`}
                >
                  {article.isArticleActive ? 'Visible' : 'Hidden'}
                </span>
              ) : null}
            </div>

            <h3
              id={`article-modal-${article._id}`}
              className="mt-4 text-3xl font-semibold text-slate-800"
            >
              {article.title}
            </h3>

            <p className="mt-3 text-sm text-slate-500">
              By {getAuthorName(article.author)} on {formatPublishedDate(article.createdAt)}
            </p>
          </div>

          <div className="flex shrink-0 flex-wrap justify-end gap-2">
            {showAuthorActions ? (
              <>
                <button
                  type="button"
                  className="nav-button border border-slate-200 bg-slate-50"
                  onClick={() => onEdit?.(article)}
                >
                  Edit
                </button>
                <button
                  type="button"
                  className={`nav-button border ${
                    article.isArticleActive
                      ? 'border-amber-200 bg-amber-50 text-amber-700'
                      : 'border-emerald-200 bg-emerald-50 text-emerald-700'
                  }`}
                  onClick={() => onToggleVisibility?.(article)}
                  disabled={visibilitySubmitting}
                >
                  {visibilitySubmitting
                    ? 'Saving...'
                    : article.isArticleActive
                      ? 'Hide article'
                      : 'Show article'}
                </button>
              </>
            ) : null}

            <button
              type="button"
              className="nav-button shrink-0"
              onClick={onClose}
            >
              Close
            </button>
          </div>
        </div>

        {showAuthorActions && !article.isArticleActive ? (
          <div className="mt-6 rounded-2xl border border-amber-200 bg-amber-50 px-4 py-3 text-sm text-amber-700">
            This article is hidden from readers right now. You can show it again anytime.
          </div>
        ) : null}

        <div className="mt-6 rounded-[24px] border border-slate-200 bg-slate-50/80 px-5 py-5">
          <p className="text-sm font-semibold uppercase tracking-[0.18em] text-slate-500">
            About the article
          </p>
          <p className="mt-4 whitespace-pre-wrap text-base leading-8 text-slate-700">
            {article.content}
          </p>
        </div>

        <CommentThread
          comments={article.comments ?? []}
          emptyMessage={
            allowComment
              ? 'No comments yet. Start the conversation.'
              : 'No comments from readers yet.'
          }
        />

        {allowComment ? (
          <form
            className="mt-5 space-y-3"
            onSubmit={(event) => {
              event.preventDefault()
              onCommentSubmit?.()
            }}
          >
            <label className="block">
              <span className="field-label">Add your comment</span>
              <textarea
                rows="4"
                placeholder="Write something thoughtful..."
                className="text-input resize-none"
                value={commentValue}
                onChange={(event) => onCommentChange?.(event.target.value)}
              />
            </label>

            <div className="flex justify-end">
              <button
                type="submit"
                className="primary-button"
                disabled={submitting}
              >
                {submitting ? 'Posting...' : 'Post comment'}
              </button>
            </div>
          </form>
        ) : null}
      </div>
    </div>
  )
}

export default ArticleDetailModal
