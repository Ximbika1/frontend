'use client'
import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'

export const useAuth = () => {
  const [loading, setLoading] = useState(true)
  const router = useRouter()

  useEffect(() => {
    const token = localStorage.getItem('token')
    if (!token) {
      router.push('/login') 
      setLoading(false)
    }
  }, [router]) 

  return { loading }
}