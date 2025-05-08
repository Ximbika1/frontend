'use client'

import { zodResolver } from '@hookform/resolvers/zod'
import ArrowForwardIosIcon from '@mui/icons-material/ArrowForwardIos'
import SmartToyIcon from '@mui/icons-material/SmartToy'
import { useRouter } from 'next/navigation'
import { useEffect, useState } from 'react'
import { useForm } from 'react-hook-form'
import ClipLoader from 'react-spinners/ClipLoader'
import { toast } from 'react-toastify'
import { z } from 'zod'

const questionSchema = z.object({
  question: z.string().optional(),
})

type QuestionFormData = z.infer<typeof questionSchema>

interface InvoicePageProps {
  params: {
    id: string
  }
}

export default function Invoice({ params }: InvoicePageProps) {
  const router = useRouter()
  const API_URL = process.env.NEXT_PUBLIC_API_URL
  const { id: invoiceId } = params
  const [loading, setLoading] = useState(false)
  const [document, setDocument] = useState({} as any)
  const [interactions, setInteractions] = useState([])
  const [disabled, setDisabled] = useState(true)
  const { handleSubmit, register } = useForm<QuestionFormData>({
    resolver: zodResolver(questionSchema),
  })

  useEffect(() => {
    function verifyToken() {
      const tokenExpiration = localStorage.getItem('tokenExpiration')
      const currentTime = Date.now()

      if (currentTime > Number(tokenExpiration)) {
        //Logout
        localStorage.removeItem('token')
        localStorage.removeItem('tokenExpiration')
        router.push('/')
        toast.warning('Você foi deslogado!')
      }
    }
    verifyToken()
  }, [router])

  // biome-ignore lint/correctness/useExhaustiveDependencies: <explanation>
  useEffect(() => {
    const token = localStorage.getItem('token')
    async function getAllInteractions() {
      const response = await fetch(
        `${API_URL}/invoice/${invoiceId}/interactions`,
        {
          method: 'GET',
          headers: { Authorization: `Bearer ${token}` },
        }
      )
      const data = await response.json()
      setInteractions(data)
    }
    getAllInteractions()
  }, [loading, API_URL, invoiceId])

  useEffect(() => {
    const token = localStorage.getItem('token')
    async function getInvoice() {
      const response = await fetch(`${API_URL}/invoice/${invoiceId}`, {
        method: 'GET',
        headers: { Authorization: `Bearer ${token}` },
      })
      const data = await response.json()
      setDocument(data)
    }

    getInvoice()
  }, [API_URL, invoiceId])

  const fileUrl = `${API_URL}${document.fileUrl}`

  const onSubmit = async (question: QuestionFormData) => {
    setLoading(true)
    setDisabled(true)
    try {
      const token = localStorage.getItem('token')
      const response = await fetch(`${API_URL}/invoice/${invoiceId}/ask`, {
        method: 'POST',
        headers: {
          Authorization: `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(question),
      })

      if (!response.ok) {
        throw new Error('Erro ao fazer a pergunta, tente novamente!')
      }

      toast.success('Pergunta feita')
    } catch (error: any) {
      toast.error(error.message || 'Erro inesperado.')
    } finally {
      setLoading(false)
      setDisabled(false)
    }
  }
  return (
    <>
      <div className="bg-zinc-800 h-[50px] w-screen items-center flex pl-10">
        <a href="/home" className="text-zinc-300 font-semibold underline">
          Voltar
        </a>
      </div>
      <div className="mx-auto pt-20 gap-10 flex w-full justify-center flex-row">
        <div>
          <img
            src={fileUrl}
            alt="Fatura"
            style={{ maxWidth: '500px', border: '1px solid #ccc' }}
          />
        </div>

        <div className="bg-zinc-800 w-[850px] h-[750px] overflow-y-auto rounded-4xl flex flex-col items-center">
          <ClipLoader
            className="fixed mt-[18%]"
            loading={loading}
            size={85}
            color="#ffffff"
          />
          <div
            className={`w-full flex-1 max-h-[900px] overflow-y-auto flex flex-col items-center ${loading && 'blur-xl'}`}
          >
            {interactions.length === 0 && (
              <div className="flex text-[20px] h-full font-bold items-center justify-center">
                Nenhuma interação, inicie uma interação com nossa IA!
              </div>
            )}
            {interactions.length > 0
              ? interactions?.map((item: any) => (
                  <div
                    key={item.id}
                    className="w-[90%] h-auto flex flex-col text-justify justify-center pl-10 pr-2 rounded-xl bg-zinc-50 text-zinc-950 my-2"
                  >
                    <div className="flex flex-row gap-1 items-baseline">
                      <p className="font-bold text-[18px]">Pergunta:</p>
                      <p className="font-semibold text-[16px] text-zinc-500">
                        {item.question}
                      </p>
                    </div>
                    <div className="flex flex-row gap-1 items-baseline">
                      <p className="font-bold text-[18px] mb-1">
                        <SmartToyIcon />
                      </p>
                      <p className="text-[15px]">{item.answer}</p>
                    </div>
                  </div>
                ))
              : ''}
          </div>

          <form
            onSubmit={handleSubmit(onSubmit)}
            className="w-full px-10 py-4 flex flex-row"
          >
            <input
              type="question"
              {...register('question')}
              className="w-full h-[80px] bg-zinc-900 rounded-l-3xl border px-3 py-2 text-zinc-200 text-sm shadow-sm "
              placeholder="Faça sua pergunta..."
              onChange={(event) => {
                if (event.target.value.length > 0) {
                  setDisabled(false)
                } else {
                  setDisabled(true)
                }
              }}
            />
            <button
              type="submit"
              disabled={disabled}
              className={`border ml-1 rounded-r-3xl w-[50px] ${!disabled ? 'hover:cursor-pointer duration-300 hover:bg-zinc-950 bg-zinc-900 ' : 'bg-zinc-800 cursor-not-allowed'}`}
            >
              {' '}
              <ArrowForwardIosIcon />{' '}
            </button>
          </form>
        </div>
      </div>
    </>
  )
}
