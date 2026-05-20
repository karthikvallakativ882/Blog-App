import { useEffect } from 'react'
import { useForm } from 'react-hook-form'
import toast from 'react-hot-toast'
import { api, getApiErrorMessage } from '../utils/api'

const emptyArticleValues = {
  title: '',
  category: '',
  content: '',
}

function getFormValues(article) {
  if (!article) {
    return emptyArticleValues
  }

  return {
    title: article.title ?? '',
    category: article.category ?? '',
    content: article.content ?? '',
  }
}

function AddArticle({
  articleToEdit = null,
  onArticleCreated,
  onArticleUpdated,
  onCancelEdit,
}) {
  const isEditing = Boolean(articleToEdit?._id)
  const {
    register,
    handleSubmit,
    reset,
    formState: { errors, isSubmitting },
  } = useForm({
    defaultValues: emptyArticleValues,
  })

  useEffect(() => {
    reset(getFormValues(articleToEdit))
  }, [articleToEdit, reset])

  const handleCancel = () => {
    reset(emptyArticleValues)
    onCancelEdit?.()
  }

  const onSubmit = async (formData) => {
    try {
      const payload = {
        title: formData.title.trim(),
        category: formData.category,
        content: formData.content.trim(),
      }

      if (isEditing) {
        const res = await api.put(
          '/author-api/articles',
          {
            articleId: articleToEdit._id,
            ...payload,
          },
        )

        toast.success(res.data?.message || 'Article updated successfully')
        onArticleUpdated?.(res.data?.payload)
        handleCancel()
        return
      }

      const res = await api.post('/author-api/articles', payload)

      toast.success(res.data?.message || 'Article published successfully')
      onArticleCreated?.(res.data?.payload)

      reset(emptyArticleValues)
    } catch (error) {
      const message = getApiErrorMessage(
        error,
        `Unable to ${isEditing ? 'update' : 'publish'} article`,
      )

      toast.error(message)
    }
  }

  return (
    <section className="compact-form-card">
      <h2 className="form-title">{isEditing ? 'Edit Article' : 'Add Article'}</h2>

      <p className="mt-3 text-center text-sm text-slate-500">
        {isEditing
          ? 'Update the article details below, then save your changes.'
          : 'Write a new article and publish it to your readers.'}
      </p>

      <form className="mt-8 space-y-5" onSubmit={handleSubmit(onSubmit)} noValidate>
        <label>
          <span className="field-label">Title</span>
          <input
            type="text"
            placeholder="Title"
            className="text-input"
            {...register('title', {
              required: 'Title is required',
            })}
          />
          {errors.title ? <p className="error-text">{errors.title.message}</p> : null}
        </label>

        <label>
          <span className="field-label">Category</span>
          <select
            className="text-input"
            {...register('category', {
              required: 'Category is required',
            })}
          >
            <option value="">Select category</option>
            <option value="Technology">Technology</option>
            <option value="Programming">Programming</option>
            <option value="Lifestyle">Lifestyle</option>
            <option value="Business">Business</option>
          </select>
          {errors.category ? <p className="error-text">{errors.category.message}</p> : null}
        </label>

        <label>
          <span className="field-label">Content</span>
          <textarea
            rows="6"
            placeholder="Content"
            className="text-input resize-none"
            {...register('content', {
              required: 'Content is required',
            })}
          />
          {errors.content ? <p className="error-text">{errors.content.message}</p> : null}
        </label>

        <div className="flex flex-wrap justify-center gap-3 pt-2">
          {isEditing ? (
            <button
              type="button"
              className="nav-button border border-slate-200 bg-slate-50"
              onClick={handleCancel}
              disabled={isSubmitting}
            >
              Cancel edit
            </button>
          ) : null}

          <button
            type="submit"
            className="primary-button min-w-44"
            disabled={isSubmitting}
          >
            {isSubmitting
              ? isEditing
                ? 'Saving...'
                : 'Publishing...'
              : isEditing
                ? 'Save Changes'
                : 'Publish Article'}
          </button>
        </div>
      </form>
    </section>
  )
}

export default AddArticle
