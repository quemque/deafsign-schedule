'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import type { UserProfile } from '@/types/user'

export function useProfile() {
   const [user, setUser] = useState<UserProfile | null>(null)
   const [loading, setLoading] = useState(true)
   const [isLoggingOut, setIsLoggingOut] = useState(false)
   const router = useRouter()

   useEffect(() => {
      fetch('/api/auth/me')
         .then((res) => res.json())
         .then((data) => setUser(data.user ?? null))
         .catch(() => setUser(null))
         .finally(() => setLoading(false))
   }, [])

   const logout = async () => {
      setIsLoggingOut(true)
      try {
         await fetch('/api/auth/logout', {
            credentials: 'include',
            method: 'POST',
         })
      } finally {
         router.push('/login')
         router.refresh()
      }
   }

   return {
      user,
      loading,
      isLoggingOut,
      logout,
   }
}
