import { useForm } from 'react-hook-form'
import { z } from 'zod'
import { zodResolver } from '@hookform/resolvers/zod'
import { useNavigate, Link } from 'react-router-dom'
import toast from 'react-hot-toast'
import { registerUser } from '../api/auth'
import { useAuthStore } from '../store/authStore'

const schema = z.object({
  username: z.string().min(3, 'Min 3 characters'),
  email: z.string().email('Invalid email'),
  password: z.string().min(6, 'Min 6 characters'),
})

export default function RegisterPage() {
  const { register, handleSubmit, formState: { errors, isSubmitting } } = useForm({
    resolver: zodResolver(schema)
  })
  const setAuth = useAuthStore(s => s.setAuth)
  const navigate = useNavigate()

  const onSubmit = async (data) => {
    try {
      const res = await registerUser({
        name: data.username,
        email: data.email,
        password: data.password,
      })
      setAuth(res.data.user, res.data.token)
      toast.success('Account created!')
      navigate('/chat')
    } catch (e) {
      toast.error(e.response?.data?.message || 'Register failed')
    }
  }

  return (
    <div className="auth-shell">
      <div className="auth-card">
        <div className="auth-panel hidden md:flex">
          <div className="auth-copy w-full">
            <div className="flex items-center gap-3 mb-8">
              <div className="brand-mark">C</div>
              <span className="text-lg font-medium tracking-tight text-white">ChatApp</span>
            </div>

            <div className="space-y-8">
              <div>
                <p className="text-3xl font-semibold tracking-tight text-white leading-tight mb-3">
                  Start your space with a clean slate.
                </p>
                <p className="text-sm text-slate-300 max-w-sm">
                  Create your account and connect with your team in a calmer, more focused way.
                </p>
              </div>

              <div className="space-y-3">
                <div className="auth-mini-card max-w-xs">welcome to the team 👋</div>
                <div className="auth-mini-card max-w-xs ml-auto bg-white/10 text-slate-100">excited to be here!</div>
                <div className="auth-mini-card max-w-xs">let’s build something great 🚀</div>
              </div>
            </div>
          </div>
        </div>

        <div className="auth-form">
          <div className="mb-8">
            <p className="text-xs uppercase tracking-[0.22em] text-slate-500 mb-3">Create account</p>
            <h1>Join the team</h1>
            <p className="mt-2 text-sm text-slate-500">Set up your profile to get started</p>
          </div>

          <form onSubmit={handleSubmit(onSubmit)} className="flex flex-col gap-4">
            <div>
              <label className="block text-xs font-medium uppercase tracking-[0.14em] text-slate-500 mb-2">Username</label>
              <input {...register('username')} placeholder="yourname" className="form-input" />
              {errors.username && <p className="mt-1 text-xs text-red-500">{errors.username.message}</p>}
            </div>

            <div>
              <label className="block text-xs font-medium uppercase tracking-[0.14em] text-slate-500 mb-2">Email</label>
              <input {...register('email')} type="email" placeholder="you@example.com" className="form-input" />
              {errors.email && <p className="mt-1 text-xs text-red-500">{errors.email.message}</p>}
            </div>

            <div>
              <label className="block text-xs font-medium uppercase tracking-[0.14em] text-slate-500 mb-2">Password</label>
              <input {...register('password')} type="password" placeholder="••••••••" className="form-input" />
              {errors.password && <p className="mt-1 text-xs text-red-500">{errors.password.message}</p>}
            </div>

            <button type="submit" disabled={isSubmitting} className="primary-btn mt-2">
              {isSubmitting ? 'Creating account...' : 'Create account'}
            </button>
          </form>

          <p className="mt-6 text-center text-sm text-slate-500">
            Already have an account?{' '}
            <Link to="/login" className="muted-link text-slate-800">Sign in</Link>
          </p>
        </div>
      </div>
    </div>
  )
}