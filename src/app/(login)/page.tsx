'use client'

import { zodResolver } from '@hookform/resolvers/zod'
import Image from 'next/image'
import { useRouter } from 'next/navigation'
import { useForm } from 'react-hook-form'
import { toast } from 'react-toastify'
import { z } from 'zod'

const loginSchema = z.object({
    email: z.string().email('Email inválido'),
    password: z.string().min(6, 'A senha deve ter no mínimo 6 caracteres'),
})

type LoginFormData = z.infer<typeof loginSchema>

export default function LoginPage() {
  const router = useRouter()
  const API_URL = process.env.NEXT_PUBLIC_API_URL
      
  const {
      register,
      handleSubmit,
      formState: { errors },
  } = useForm<LoginFormData>({
      resolver: zodResolver(loginSchema),
  })

  const onSubmit = async (data: LoginFormData) => {
    try {
        const response = await fetch(`${API_URL}/auth/login`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(data),
        })

        if (!response.ok) {
            const errorData = await response.json()
            throw new Error(errorData.message || 'Erro ao logar usuário.')
        }

        
        // Guarda o Token e o tempo de uso que ele poderá usar
        const now = new Date();
        const result = await response.json()

      
        const expirationTime = Date.now() + (60 * 60 * 1000)
        localStorage.setItem("token", result.access_token);
        localStorage.setItem("tokenExpiration", expirationTime.toString());

        toast.success('Login realizado com sucesso!')

        setTimeout(() => router.push('/home'), 1500)
    } catch (error: any) {
        toast.error(error.message || 'Erro inesperado.')
    }
  }

  return (
    <div className="flex min-h-screen items-center justify-center gap-6 bg-zinc-950 flex-col">
        <div className='text-5xl flex gap-4 flex-row items-center'> 
            <p>
                Seja bem-vindo
            </p>
            <Image
                src="/hi.png"
                alt="Imagem remota"
                width={90}
                height={60}
                priority // (Opcional) Carrega com alta prioridade
            />
        </div>
      <div className="w-full max-w-md rounded-xl bg-white p-8 shadow-lg">
        <h2 className="mb-6 text-center text-3xl font-semibold text-zinc-950">Login</h2>
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-zinc-950">Email</label>
            <input
              type="text"
              {...register('email')}
              className="mt-1 w-full rounded-md border px-3 py-2 text-sm text-zinc-950 shadow-sm focus:border-blue-500 focus:outline-none"
            />
            {errors.email && (
              <p className="mt-1 text-sm font-semibold text-red-500">{errors.email.message}</p>
            )}
          </div>
          <div>
            <label className="block text-sm font-medium text-zinc-950">Senha</label>
            <input
              type="password"
              {...register('password')}
              className="mt-1 w-full rounded-md border px-3 py-2 text-zinc-950 text-sm shadow-sm focus:border-blue-500 focus:outline-none"
            />
            {errors.password && (
              <p className="mt-1 text-sm font-semibold text-red-500">{errors.password.message}</p>
            )}
          </div>
          <button
            type="submit"
            className="w-full rounded-md bg-blue-600 px-4 py-2 text-white transition duration-200 hover:bg-blue-700"
          >
            Entrar
          </button>
        </form>
        <p className="mt-4 text-center text-sm text-gray-500">
          Não tem uma conta? <a href="/register" className="text-blue-600 hover:underline">Cadastre-se</a>
        </p>
      </div>
    </div>
  )
}
