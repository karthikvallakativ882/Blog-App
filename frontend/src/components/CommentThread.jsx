function getCommenterName(user) {
  if (!user || typeof user === 'string') {
    return 'Reader'
  }

  const fullName = [user.firstName, user.lastName].filter(Boolean).join(' ')
  return fullName || user.email || 'Reader'
}

function formatCommentDate(value) {
  if (!value) {
    return 'Just now'
  }

  return new Intl.DateTimeFormat('en-IN', {
    dateStyle: 'medium',
  }).format(new Date(value))
}

function CommentThread({
  comments = [],
  emptyMessage = 'No comments yet.',
}) {
  return (
    <div className="mt-5 rounded-[24px] border border-slate-200 bg-slate-50/90 p-4">
      <div className="flex items-center justify-between gap-3">
        <h4 className="text-sm font-semibold uppercase tracking-[0.18em] text-slate-700">
          Comments
        </h4>
        <span className="text-xs font-semibold text-slate-500">
          {comments.length} {comments.length === 1 ? 'comment' : 'comments'}
        </span>
      </div>

      {comments.length === 0 ? (
        <p className="mt-3 text-sm text-slate-500">{emptyMessage}</p>
      ) : (
        <div className="mt-4 space-y-3">
          {comments.map((comment) => {
            const commenterName = getCommenterName(comment.user)
            const commenterInitial = commenterName.charAt(0).toUpperCase()

            return (
              <div
                key={comment._id}
                className="rounded-2xl border border-white/80 bg-white/90 p-3 shadow-sm"
              >
                <div className="flex items-start gap-3">
                  {comment.user?.profileImageUrl ? (
                    <img
                      src={comment.user.profileImageUrl}
                      alt={commenterName}
                      className="h-9 w-9 rounded-full object-cover"
                    />
                  ) : (
                    <div className="flex h-9 w-9 items-center justify-center rounded-full bg-sky-100 text-xs font-semibold text-sky-700">
                      {commenterInitial}
                    </div>
                  )}

                  <div className="min-w-0 flex-1">
                    <div className="flex flex-wrap items-center gap-2">
                      <p className="text-sm font-semibold text-slate-800">
                        {commenterName}
                      </p>
                      <span className="text-xs text-slate-400">
                        {formatCommentDate(comment.createdAt)}
                      </span>
                    </div>
                    <p className="mt-2 break-words text-sm leading-6 text-slate-600">
                      {comment.comment}
                    </p>
                  </div>
                </div>
              </div>
            )
          })}
        </div>
      )}
    </div>
  )
}

export default CommentThread
