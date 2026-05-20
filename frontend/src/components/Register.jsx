import { useEffect, useState } from "react"
import { useForm, useWatch } from "react-hook-form"
import toast from "react-hot-toast"
import { useNavigate } from "react-router-dom"
import { useAuthStore } from "../store/userAuth"
import { getDashboardPath } from "../utils/appRoutes"
import { api, getApiErrorMessage } from "../utils/api"

const registerEndpoints = {
  user: "/user-api/users",
  author: "/author-api/users",
}


function Register() {
  const [preview, setPreview] = useState("")
  const [submitMessage, setSubmitMessage] = useState("")
  const [submitError, setSubmitError] = useState("")
  const navigate = useNavigate()
  const login = useAuthStore((state) => state.login)

  const {
    control,
    register,
    handleSubmit,
    reset,
    formState: { errors, isSubmitting },
  } = useForm({
    defaultValues: {
      role: "user",
      firstName: "",
      lastName: "",
      email: "",
      password: "",
      profileImage: null,
    },
  })

  const selectedRole = useWatch({
    control,
    name: "role",
  })
  const profileImage = useWatch({
    control,
    name: "profileImage",
  })

  useEffect(() => {
    const file = profileImage?.[0]

    if (!file) {
      if (preview) {
        // eslint-disable-next-line react-hooks/set-state-in-effect
        setPreview("")
      }
      return
    }

    const objectUrl = URL.createObjectURL(file)
    setPreview(objectUrl)

    return () => {
      URL.revokeObjectURL(objectUrl)
    }
  }, [profileImage, preview])

  const onSubmit = async (formData) => {
    try {
      setSubmitError("")
      setSubmitMessage("")

      const profileImageFile = formData.profileImage?.[0]
      const payload = new FormData()

      payload.append("firstName", formData.firstName.trim())
      payload.append("lastName", formData.lastName.trim())
      payload.append("email", formData.email.trim())
      payload.append("password", formData.password)

      if (profileImageFile) {
        payload.append("profileImage", profileImageFile)
      }

      const endpoint = registerEndpoints[formData.role] ?? registerEndpoints.user
      const response = await api.post(endpoint, payload)
      const data = response.data ?? {}

      setSubmitMessage("Account created. Signing you in...")

      try {
        const user = await login(
          {
            email: formData.email.trim(),
            password: formData.password,
          },
          data?.payload?.role ?? formData.role.toUpperCase(),
        )

        reset({
          role: formData.role,
          firstName: "",
          lastName: "",
          email: "",
          password: "",
          profileImage: null,
        })

        navigate(getDashboardPath(user.role), { replace: true })
      } catch (loginError) {
        const message =
          loginError?.response?.data?.error ||
          loginError?.response?.data?.message ||
          "Account created, but automatic login failed. Please sign in."

        setSubmitMessage("")
        setSubmitError(message)
      }
    } catch (error) {
      const message = getApiErrorMessage(error, "Registration failed")
      setSubmitError(message)
      toast.error(message)
    }
  }

  return (
    <div>
      <section className="form-card">
        <h2 className="form-title">Register</h2>

        <form className="mt-8 space-y-5" onSubmit={handleSubmit(onSubmit)} noValidate>
          <div>
            <span className="field-label">Select Role</span>

            <div className="flex flex-wrap gap-3">
              {["user", "author"].map((role) => (
                <label key={role} className="radio-chip">
                  <input
                    type="radio"
                    value={role}
                    className="h-4 w-4 accent-sky-500"
                    {...register("role")}
                  />

                  <span className={selectedRole === role ? "text-sky-600" : ""}>
                    {role === "user" ? "User" : "Author"}
                  </span>
                </label>
              ))}
            </div>
          </div>

          <div className="grid gap-5 sm:grid-cols-2">
            <label>
              <span className="field-label">First Name</span>

              <input
                type="text"
                placeholder="First name"
                className="text-input"
                {...register("firstName", {
                  required: "First Name is required",
                })}
              />

              {errors.firstName && (
                <p className="error-text">{errors.firstName.message}</p>
              )}
            </label>

            <label>
              <span className="field-label">Last Name</span>

              <input
                type="text"
                placeholder="Last name"
                className="text-input"
                {...register("lastName")}
              />
            </label>
          </div>

          <label>
            <span className="field-label">Email</span>

            <input
              type="email"
              placeholder="Email"
              className="text-input"
              {...register("email", {
                required: "Email is required",
                pattern: {
                  value: /^[^\s@]+@[^\s@]+\.[^\s@]+$/,
                  message: "Enter a valid email address",
                },
              })}
            />

            {errors.email && <p className="error-text">{errors.email.message}</p>}
          </label>

          <label>
            <span className="field-label">Password</span>

            <input
              type="password"
              placeholder="Password"
              className="text-input"
              {...register("password", {
                required: "Password is required",
                minLength: {
                  value: 6,
                  message: "Password must be at least 6 characters",
                },
              })}
            />

            {errors.password && (
              <p className="error-text">{errors.password.message}</p>
            )}
          </label>

          <label>
            <span className="field-label">Upload Profile Image</span>

            <input
              type="file"
              accept="image/png,image/jpeg"
              className="file-input"
              {...register("profileImage")}
            />
          </label>

          {preview ? (
            <div className="flex items-center gap-4 rounded-2xl border border-slate-200 bg-white/70 p-4">
              <img
                src={preview}
                alt="Profile preview"
                className="h-16 w-16 rounded-full object-cover"
              />
              <div>
                <p className="text-sm font-semibold text-slate-700">Preview</p>
                <p className="muted-text mt-1">Selected profile image</p>
              </div>
            </div>
          ) : null}

          {submitError ? (
            <p className="error-text text-center">{submitError}</p>
          ) : null}

          {submitMessage ? (
            <p className="muted-text text-center">{submitMessage}</p>
          ) : null}

          <div className="flex justify-center pt-2">
            <button
              type="submit"
              className="primary-button min-w-40"
              disabled={isSubmitting}
            >
              {isSubmitting ? "Creating..." : "Create one !"}
            </button>
          </div>

          <div className="flex justify-center items-center gap-2 pt-2">
            <span>If you already have an account?</span>
            <button
              type="button"
              className="font-semibold text-blue-500"
              onClick={() => navigate("/login")}
            >
              Sign in
            </button>
          </div>
        </form>
      </section>
    </div>
  )
}

export default Register
