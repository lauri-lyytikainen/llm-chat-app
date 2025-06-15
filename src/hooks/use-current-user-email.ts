import { createClient } from '@/lib/client'
import { useEffect, useState } from 'react'

export const useCurrentUserEmail = () => {
  const [email, setEmail] = useState<string | null>(null)

  useEffect(() => {
    const fetchUserEmail = async () => {
      const { data, error } = await createClient().auth.getSession()
      if (error) {
        console.error(error)
      }

      setEmail(data.session?.user.email ?? null)
    }
    fetchUserEmail()
  }, [])

  return email
}
