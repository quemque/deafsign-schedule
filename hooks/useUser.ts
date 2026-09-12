'use client'

import { useState, useEffect } from 'react'

interface User {
   id: string
   email: string
   login: string
   name: string
   role: string
   avatarUrl: string | null
}

export const useUser = () => {
   const [user, setUser] = useState<User | null>(null)
   const [loading, setLoading] = useState(true)

   useEffect(() => {
      const fetchUser = async () => {
         try {
            const res = await fetch('/api/auth/me')
            if (res.ok) {
               const data = await res.json()
               setUser(data.user)
            } else {
               setUser(null)
            }
         } catch {
            setUser(null)
         } finally {
            setLoading(false)
         }
      }

      fetchUser()
   }, [])

   return { user, loading }
}
