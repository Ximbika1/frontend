'use client'

import { zodResolver } from '@hookform/resolvers/zod'
import { useRouter } from 'next/navigation'
import { useForm } from 'react-hook-form'
import { toast } from 'react-toastify'
import { z } from 'zod'

const registerSchema = z.object({
  name: z.string().min(1, 'Nome é obrigatório'),
  email: z.string().email('Email inválido'),
  password: z.string().min(6, 'A senha deve ter no mínimo 6 caracteres'),
})

type RegisterFormData = z.infer<typeof registerSchema>

export default function RegisterPage() {
  const API_URL = process.env.NEXT_PUBLIC_API_URL
  console.log(API_URL)
  const router = useRouter()

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<RegisterFormData>({
    resolver: zodResolver(registerSchema),
  })
  const onSubmit = async (data: RegisterFormData) => {
    try {
      const response = await fetch(`${API_URL}/auth/register`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data),
      })

      if (!response.ok) {
        const errorData = await response.json()
        throw new Error(errorData.message || 'Erro ao registrar usuário.')
      }

      toast.success('Cadastro realizado com sucesso!')

      // Aguarda o toast aparecer antes de redirecionar
      setTimeout(() => router.push('/'), 1500)
    } catch (error: any) {
      toast.error(error.message || 'Erro inesperado.')
    }
  }

  return (
    <div className="flex min-h-screen items-center justify-center bg-zinc-950">
      <div className="w-full max-w-md rounded-xl bg-white p-8 shadow-lg">
        <h2 className="mb-6 text-center text-3xl font-semibold text-zinc-950">
          Crie sua conta
        </h2>
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-zinc-950">
              Nome
            </label>
            <input
              type="text"
              {...register('name')}
              className="mt-1 w-full rounded-md border text-zinc-950 px-3 py-2 text-sm shadow-sm focus:border-blue-500 focus:outline-none"
            />
            {errors.name && (
              <p className="mt-1 text-sm font-semibold text-red-500">
                {errors.name.message}
              </p>
            )}
          </div>
          <div>
            <label className="block text-sm font-medium text-zinc-950">
              Email
            </label>
            <input
              type="text"
              {...register('email')}
              className="mt-1 w-full rounded-md border text-zinc-950 px-3 py-2 text-sm shadow-sm focus:border-blue-500 focus:outline-none"
            />
            {errors.email && (
              <p className="mt-1 text-sm font-semibold text-red-500">
                {errors.email.message}
              </p>
            )}
          </div>
          <div>
            <label className="block text-sm font-medium text-zinc-950">
              Senha
            </label>
            <input
              type="password"
              {...register('password')}
              className="mt-1 w-full rounded-md border text-zinc-950 px-3 py-2 text-sm shadow-sm focus:border-blue-500 focus:outline-none"
            />
            {errors.password && (
              <p className="mt-1 text-sm font-semibold text-red-500">
                {errors.password.message}
              </p>
            )}
          </div>
          <button
            type="submit"
            className="w-full rounded-md bg-blue-600 px-4 py-2 text-white transition duration-200 hover:bg-blue-700"
          >
            Cadastrar
          </button>
        </form>
        <p className="mt-4 text-center text-sm text-gray-500">
          Já tem uma conta?{' '}
          <a href="/" className="text-blue-600 hover:underline">
            Entrar
          </a>
        </p>
      </div>
    </div>
  )
}
