'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'

export function withAuth<P>(WrappedComponent: React.ComponentType<P>) {
  return function AuthenticatedComponent(props: P) {
    const [isClient, setIsClient] = useState(false)
    const [loading, setLoading] = useState(true)
    const [isAuthenticated, setIsAuthenticated] = useState(false)
    const router = useRouter()

    useEffect(() => {
      setIsClient(true) // confirma que estamos no cliente

      const token = localStorage.getItem('token')
      if (!token) {
        router.replace('/login')
      } else {
        setIsAuthenticated(true)
        setLoading(false)
      }
    }, [router])

    if (!isClient || loading) {
      return <div>Verificando autenticação...</div> // evita o mismatch
    }

    if (!isAuthenticated) return null

    return <WrappedComponent {...props} />
  }
}
