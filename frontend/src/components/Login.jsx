import { useEffect, useState } from 'react'
import { useForm } from 'react-hook-form'
import { useNavigate } from 'react-router-dom'
import { useAuthStore } from '../store/userAuth'
import { getDashboardPath } from '../utils/appRoutes'

function Login() {
  const [submitMessage, setSubmitMessage] = useState('')
  const login = useAuthStore((state) => state.login)
  const loading = useAuthStore((state) => state.loading)
  const submitError = useAuthStore((state) => state.error)
  const clearError = useAuthStore((state) => state.clearError)
  const navigate = useNavigate()

  const {
    register,
    handleSubmit,
    reset,
    formState: { errors, isSubmitting },
  } = useForm({
    defaultValues: {
      email: '',
      password: '',
    },
  })

  useEffect(() => {
    clearError()
  }, [clearError])

  const onSubmit = async (formData) => {
    try {
      setSubmitMessage('')
      clearError()

      const user = await login({
        email: formData.email.trim(),
        password: formData.password,
      })

      setSubmitMessage('Login successful')
      reset({
        email: '',
        password: '',
      })
      navigate(getDashboardPath(user.role), { replace: true })
    } catch (error) {
      void error
    }
  }

  return (
    <section className="compact-form-card">
      <h2 className="form-title">Login</h2>

      <form className="mt-8 space-y-5" onSubmit={handleSubmit(onSubmit)} noValidate>
        <label>
          <span className="field-label">Email</span>
          <input
            type="email"
            placeholder="Email"
            className="text-input"
            {...register('email', {
              required: 'Email is required',
            })}
          />
          {errors.email ? <p className="error-text">{errors.email.message}</p> : null}
        </label>

        <label>
          <span className="field-label">Password</span>
          <input
            type="password"
            placeholder="Password"
            className="text-input"
            {...register('password', {
              required: 'Password is required',
            })}
          />
          {errors.password ? <p className="error-text">{errors.password.message}</p> : null}
        </label>

        {submitError ? <p className="error-text text-center">{submitError}</p> : null}
        {submitMessage ? <p className="muted-text text-center">{submitMessage}</p> : null}

        <div className="flex justify-center pt-2">
          <button
            type="submit"
            className="primary-button min-w-40"
            disabled={isSubmitting || loading}
          >
            {isSubmitting || loading ? 'Logging in...' : 'Login'}
          </button>
        </div>
      </form>
    </section>
  )
}

export default Login
