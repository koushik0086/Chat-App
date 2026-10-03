import { useForm } from 'react-hook-form'
import { z } from 'zod'
import { zodResolver } from '@hookform/resolvers/zod'
import { useNavigate, Link } from 'react-router-dom'
import toast from 'react-hot-toast'
import { loginUser } from '../api/auth'
import { useAuthStore } from '../store/authStore'

const schema = z.object({
  email: z.string().email('Invalid email'),
  password: z.string().min(6, 'Min 6 characters'),
})

export default function LoginPage() {
  const { register, handleSubmit, formState: { errors, isSubmitting } } = useForm({
    resolver: zodResolver(schema)
  })
  const setAuth = useAuthStore(s => s.setAuth)
  const navigate = useNavigate()

  const onSubmit = async (data) => {
    try {
      const res = await loginUser(data)
      setAuth(res.data.user, res.data.token)
      toast.success('Welcome back!')
      navigate('/chat')
    } catch (e) {
      toast.error(e.response?.data?.message || 'Login failed')
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
                  Real conversations, without the noise.
                </p>
                <p className="text-sm text-slate-300 max-w-sm">
                  A simple place to stay connected with your team, rooms, and direct messages.
                </p>
              </div>

              <div className="space-y-3">
                <div className="auth-mini-card max-w-xs">hey! backend is ready 🚀</div>
                <div className="auth-mini-card max-w-xs ml-auto bg-white/10 text-slate-100">frontend too, let’s ship it.</div>
                <div className="auth-mini-card max-w-xs">deploying now... 🎉</div>
              </div>
            </div>
          </div>
        </div>

        <div className="auth-form">
          <div className="mb-8">
            <p className="text-xs uppercase tracking-[0.22em] text-slate-500 mb-3">Welcome back</p>
            <h1>Sign in</h1>
            <p className="mt-2 text-sm text-slate-500">Use your account to continue</p>
          </div>

          <form onSubmit={handleSubmit(onSubmit)} className="flex flex-col gap-4">
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
              {isSubmitting ? 'Signing in...' : 'Sign in'}
            </button>
          </form>

          <p className="mt-6 text-center text-sm text-slate-500">
            Don’t have an account?{' '}
            <Link to="/register" className="muted-link text-slate-800">Create one</Link>
          </p>
        </div>
      </div>
    </div>
  )
}