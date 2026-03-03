import { getCurrentUser } from '@/lib/auth'
import { redirect } from 'next/navigation'
import { MediaLibrary } from './MediaLibrary'

export default async function ConteudoPage() {
  const user = await getCurrentUser()
  if (!user) redirect('/admin/login')

  return <MediaLibrary />
}
