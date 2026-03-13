import { getCurrentUser } from '@/lib/auth'
import { redirect } from 'next/navigation'
import { MediaLibrary } from './MediaLibrary'
import { MediaTutorial } from '@/components/admin/tutorial/tutorials/media-tutorial'

export default async function ConteudoPage() {
  const user = await getCurrentUser()
  if (!user) redirect('/admin/login')

  return (
    <div>
      <MediaLibrary />
      <MediaTutorial />
    </div>
  )
}
