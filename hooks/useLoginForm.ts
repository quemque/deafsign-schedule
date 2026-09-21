'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'

export function useLoginForm() {
   const router = useRouter()
   const [login, setLogin] = useState('')
   const [password, setPassword] = useState('')
   const [showPassword, setShowPassword] = useState(false)
   const [isLoading, setIsLoading] = useState(false)
   const [error, setError] = useState('')

   const toggleShowPassword = () => setShowPassword((prev) => !prev)

   const handleSubmit = async (e: React.FormEvent) => {
      e.preventDefault()
      setError('')
      setIsLoading(true)

      try {
         const res = await fetch('/api/auth/login', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ login, password }),
         })

         const data = await res.json().catch(() => null)

         if (!res.ok) {
            setError(data?.error || 'Ошибка входа')
            return
         }

         router.push('/')
         router.refresh()
      } catch {
         setError('Ошибка соединения')
      } finally {
         setIsLoading(false)
      }
   }

   return {
      login,
      setLogin,
      password,
      setPassword,
      showPassword,
      toggleShowPassword,
      isLoading,
      error,
      handleSubmit,
   }
}
