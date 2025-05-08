'use client'

import { zodResolver } from '@hookform/resolvers/zod'
import DeleteIcon from '@mui/icons-material/Delete'
import DownloadIcon from '@mui/icons-material/Download'
import LiveHelp from '@mui/icons-material/LiveHelp'
import Receipt from '@mui/icons-material/Receipt'
import {
  Box,
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
  Menu,
  MenuItem,
  Typography,
} from '@mui/material'
// biome-ignore lint/style/useImportType: <explanation>
import { DataGrid, GridColDef } from '@mui/x-data-grid'
import { useRouter } from 'next/navigation'
import { useEffect, useState } from 'react'
import { useForm } from 'react-hook-form'
import { toast } from 'react-toastify'
import { z } from 'zod'

interface Document {
  id: number
  displayName: string
  date: string
}

const invoiceSchema = z.object({
  displayName: z.string().min(1, 'Nome é obrigatório'),
  file: z.custom<File>((value) => value instanceof File, {
    message: 'Arquivo é obrigatório',
  }),
})

type InvoiceFormData = z.infer<typeof invoiceSchema>

export default function HomePage() {
  const router = useRouter()
  const API_URL = process.env.NEXT_PUBLIC_API_URL
  const {
    register,
    handleSubmit,
    formState: { errors },
    setValue,
  } = useForm<InvoiceFormData>({
    resolver: zodResolver(invoiceSchema),
  })
  const [documents, setDocuments] = useState<Document[]>()
  const [open, setOpen] = useState(false)
  const [file, setFile] = useState<File | null>(null)
  const [anchorEl, setAnchorEl] = useState<null | HTMLElement>(null)
  const [selectedRow, setSelectedRow] = useState<Document | null>(null)
  const [loading, setLoading] = useState(false)

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

    async function getAllInvoice() {
      const response = await fetch(`${API_URL}/invoice`, {
        method: 'GET',
        headers: { Authorization: `Bearer ${token}` },
      })
      const data = await response.json()
      setDocuments(data)
    }
    getAllInvoice()
  }, [API_URL, loading])

  const handleClick = (event: React.MouseEvent<HTMLElement>, row: Document) => {
    setAnchorEl(event.currentTarget)
    setSelectedRow(row) // Guardar a linha selecionada
  }

  const handleClose = () => {
    setAnchorEl(null)
    setOpen(false)
    setFile(null)
  }

  const handleQuestion = (id: number) => {
    router.push(`/invoice/${id}`)
  }

  const handleDownload = async (id: number, name: string) => {
    try {
      const token = localStorage.getItem('token')
      const response = await fetch(`${API_URL}/download/invoice/${id}`, {
        method: 'GET',
        headers: {
          Authorization: `Bearer ${token}`,
        },
      })

      if (!response.ok) {
        throw new Error('Erro ao baixar o arquivo.')
      }

      const blob = await response.blob()
      const url = window.URL.createObjectURL(blob)

      const link = document.createElement('a')
      link.href = url
      link.download = name
      document.body.appendChild(link)
      link.click()
      document.body.removeChild(link)

      toast.success('Download feito com sucesso')

      handleClose()
    } catch (error) {
      console.error('Erro no download:', error)
    }
  }

  const handleDelete = async (id: number) => {
    setLoading(true)
    try {
      const token = localStorage.getItem('token')
      const response = await fetch(`${API_URL}/invoice/${id}`, {
        method: 'DELETE',
        headers: {
          Authorization: `Bearer ${token}`,
        },
      })

      if (!response.ok) {
        throw new Error('Erro ao excluir o arquivo.')
      }

      toast.success('Fatura excluída com sucesso')

      handleClose()
    } catch (error) {
      console.error('Erro ao excluir fatura:', error)
    } finally {
      setLoading(false)
    }
  }

  const columns: GridColDef[] = [
    { field: 'id', headerName: 'ID', width: 90 },
    { field: 'displayName', headerName: 'Nome', flex: 1 },
    {
      field: 'date',
      headerName: 'Data de Envio',
      width: 200,
      renderCell: (params) => {
        const date = new Date(params.value)
        return date.toLocaleString('pt-BR', {
          day: '2-digit',
          month: '2-digit',
          year: 'numeric',
          hour: '2-digit',
          minute: '2-digit',
        })
      },
    },
    {
      field: 'actions',
      headerName: 'Ações',
      align: 'center',

      width: 100,
      sortable: false,
      renderCell: (params) => (
        <>
          {/* biome-ignore lint/a11y/useKeyWithClickEvents: <explanation> */}
          <div
            className="text-2xl font-bold h-full  hover:cursor-pointer duration-300 hover:bg-zinc-200"
            onClick={(event) => handleClick(event, params.row)}
          >
            ...
          </div>
          <Menu
            anchorEl={anchorEl}
            open={Boolean(anchorEl)}
            onClose={handleClose}
          >
            <MenuItem onClick={() => handleQuestion(selectedRow?.id ?? 0)}>
              <div className="text-[14px] font-bold">
                <LiveHelp /> Visualizar
              </div>
            </MenuItem>
            <MenuItem
              onClick={() =>
                handleDownload(
                  selectedRow?.id ?? 0,
                  selectedRow?.displayName ?? 'arquivo'
                )
              }
            >
              <div className="text-[14px] font-bold">
                <DownloadIcon /> Download
              </div>
            </MenuItem>
            <MenuItem onClick={() => handleDelete(selectedRow?.id ?? 0)}>
              <div className="text-[14px] text-red-700 font-bold">
                <DeleteIcon /> Excluir
              </div>
            </MenuItem>
          </Menu>
        </>
      ),
    },
  ]

  const handleFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const selected = event.target.files?.[0]
    if (selected) {
      setFile(selected)
    }
  }

  const onSubmit = async (data: InvoiceFormData) => {
    setLoading(true)
    try {
      const token = localStorage.getItem('token')

      const formData = new FormData()

      formData.append('displayName', data.displayName)
      formData.append('file', data.file)

      const response = await fetch(`${API_URL}/invoice/upload`, {
        method: 'POST',
        headers: { Authorization: `Bearer ${token}` },
        body: formData,
      })

      if (!response.ok) {
        const errorData = await response.json()
        throw new Error(errorData.message || 'Erro ao adicionar fatura.')
      }

      toast.success('Fatura adicionada com sucesso')
      handleClose()
    } catch (error: any) {
      toast.error(error.message || 'Erro inesperado.')
    } finally {
      setLoading(false)
    }
  }

  return (
    <>
      <Dialog open={open} onClose={handleClose}>
        <DialogTitle>Enviar nova fatura</DialogTitle>
        <form onSubmit={handleSubmit(onSubmit)}>
          <DialogContent sx={{ minWidth: 400 }}>
            <div>
              <label className="block text-sm font-medium text-zinc-950">
                Nome da fatura
              </label>
              <input
                type="name"
                {...register('displayName')}
                className="mt-1 w-full rounded-md border px-3 py-2 text-zinc-950 text-sm shadow-sm focus:border-blue-500 focus:outline-none"
              />
              {errors.displayName && (
                <p className="mt-1 text-sm font-semibold text-red-500">
                  {errors.displayName.message}
                </p>
              )}
            </div>

            <div className="mt-5">
              <label
                htmlFor="file-upload"
                className="cursor-pointer inline-block w-full rounded-md bg-zinc-200 px-4 py-2 text-center text-sm font-semibold text-zinc-700 hover:bg-zinc-300"
              >
                <Receipt /> Selecionar fatura
              </label>
              <input
                id="file-upload"
                type="file"
                accept="image/jpeg, image/png"
                onChange={(e) => {
                  const selectedFile = e.target.files?.[0]
                  if (selectedFile) {
                    setValue('file', selectedFile, { shouldValidate: true })
                    handleFileChange(e)
                  }
                }}
                className="hidden"
              />
              {errors.file && (
                <p className="mt-2 text-sm text-red-500 font-semibold">
                  {errors.file.message}
                </p>
              )}
              {file && (
                <p className="mt-2 text-sm text-zinc-600">
                  Arquivo selecionado: {file.name}
                </p>
              )}
            </div>
          </DialogContent>
          <DialogActions className="bg-zinc-300">
            <button
              type="button"
              onClick={handleClose}
              className="w-[100px] font-semibold rounded-md px-4 py-2 text-zinc-600 transition duration-200 hover:cursor-pointer hover:bg-zinc-200 "
            >
              Cancelar
            </button>
            <button
              type="submit"
              className="w-[100px] font-semibold rounded-md bg-blue-600 px-4 py-2 text-white transition duration-200 hover:bg-blue-700"
            >
              Enviar
            </button>
          </DialogActions>
        </form>
      </Dialog>

      <Box sx={{ height: 500, width: '100%', padding: 4 }}>
        <Typography
          variant="body1"
          gutterBottom
          className="flex-row flex justify-between"
        >
          <button
            type="button"
            onClick={() => setOpen(true)}
            className="w-[100px] font-semibold rounded-md bg-blue-600 px-4 py-2 text-white transition duration-200 hover:bg-blue-700"
          >
            + Fatura
          </button>
        </Typography>
        <DataGrid rows={documents} columns={columns} />
      </Box>
    </>
  )
}
