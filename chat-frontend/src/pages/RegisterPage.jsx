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
      const res = await registerUser(data)
      setAuth(res.data.user, res.data.token)
      toast.success('Account created!')
      navigate('/chat')
    } catch (e) {
      toast.error(e.response?.data?.message || 'Register failed')
    }
  }

  return (
    <div className="min-h-screen flex items-center justify-center" style={{background:'#f1f5f9'}}>
      <div className="flex w-full max-w-3xl rounded-2xl overflow-hidden" style={{boxShadow:'0 4px 40px rgba(0,0,0,0.10)'}}>

        {/* Left panel */}
        <div className="hidden md:flex flex-col justify-center items-center p-10 w-5/12 relative overflow-hidden" style={{background:'#0f172a'}}>
          <div className="absolute w-72 h-72 rounded-full border border-indigo-500/20 -top-20 -left-20"/>
          <div className="absolute w-48 h-48 rounded-full border border-indigo-500/20 -bottom-10 -right-10"/>
          <div className="flex items-center gap-3 mb-8">
            <div className="w-10 h-10 rounded-xl flex items-center justify-center" style={{background:'#6366f1'}}>
              <svg width="20" height="20" fill="none" stroke="white" strokeWidth="2" viewBox="0 0 24 24">
                <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z"/>
              </svg>
            </div>
            <span className="text-white text-lg font-medium">ChatApp</span>
          </div>
          <p className="text-white text-xl font-medium text-center leading-snug mb-3">
            Join the conversation today
          </p>
          <p className="text-slate-500 text-sm text-center leading-relaxed">
            Create your account and start chatting with your team instantly
          </p>
          <div className="mt-8 w-full flex flex-col gap-2">
            <div className="px-4 py-2.5 rounded-xl rounded-bl-sm text-xs text-slate-400 max-w-xs" style={{background:'rgba(255,255,255,0.07)'}}>
              welcome to the team! 👋
            </div>
            <div className="px-4 py-2.5 rounded-xl rounded-br-sm text-xs text-indigo-200 max-w-xs self-end" style={{background:'#6366f1'}}>
              excited to be here!
            </div>
            <div className="px-4 py-2.5 rounded-xl rounded-bl-sm text-xs text-slate-400 max-w-xs" style={{background:'rgba(255,255,255,0.07)'}}>
              let's build something great 🚀
            </div>
          </div>
        </div>

        {/* Right panel */}
        <div className="flex-1 bg-white p-10 flex flex-col justify-center">
          <h1 className="text-xl font-medium mb-1" style={{color:'#0f172a'}}>Create account</h1>
          <p className="text-sm mb-7" style={{color:'#94a3b8'}}>Fill in the details below to get started</p>

          <form onSubmit={handleSubmit(onSubmit)} className="flex flex-col gap-4">
            <div>
              <label className="block text-xs font-medium mb-1.5" style={{color:'#475569'}}>Username</label>
              <input {...register('username')} placeholder="yourname"
                className="w-full px-4 py-2.5 rounded-xl text-sm outline-none transition-all"
                style={{border:'0.5px solid #e2e8f0', background:'#f8fafc', color:'#1e293b'}}
                onFocus={e => e.target.style.borderColor='#6366f1'}
                onBlur={e => e.target.style.borderColor='#e2e8f0'}/>
              {errors.username && <p className="text-xs mt-1" style={{color:'#ef4444'}}>{errors.username.message}</p>}
            </div>

            <div>
              <label className="block text-xs font-medium mb-1.5" style={{color:'#475569'}}>Email</label>
              <input {...register('email')} type="email" placeholder="you@example.com"
                className="w-full px-4 py-2.5 rounded-xl text-sm outline-none transition-all"
                style={{border:'0.5px solid #e2e8f0', background:'#f8fafc', color:'#1e293b'}}
                onFocus={e => e.target.style.borderColor='#6366f1'}
                onBlur={e => e.target.style.borderColor='#e2e8f0'}/>
              {errors.email && <p className="text-xs mt-1" style={{color:'#ef4444'}}>{errors.email.message}</p>}
            </div>

            <div>
              <label className="block text-xs font-medium mb-1.5" style={{color:'#475569'}}>Password</label>
              <input {...register('password')} type="password" placeholder="••••••••"
                className="w-full px-4 py-2.5 rounded-xl text-sm outline-none transition-all"
                style={{border:'0.5px solid #e2e8f0', background:'#f8fafc', color:'#1e293b'}}
                onFocus={e => e.target.style.borderColor='#6366f1'}
                onBlur={e => e.target.style.borderColor='#e2e8f0'}/>
              {errors.password && <p className="text-xs mt-1" style={{color:'#ef4444'}}>{errors.password.message}</p>}
            </div>

            <button type="submit" disabled={isSubmitting}
              className="w-full py-2.5 rounded-xl text-sm font-medium text-white transition-opacity disabled:opacity-60"
              style={{background:'#6366f1'}}>
              {isSubmitting ? 'Creating account...' : 'Create account'}
            </button>
          </form>

          <p className="text-center text-xs mt-6" style={{color:'#94a3b8'}}>
            Already have an account?{' '}
            <Link to="/login" className="font-medium" style={{color:'#6366f1'}}>Sign in</Link>
          </p>
        </div>
      </div>
    </div>
  )
}