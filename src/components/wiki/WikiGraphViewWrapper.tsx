'use client'

import { WikiGraphView } from './WikiGraphView'
import type { WikiCategoryTree } from '@/lib/wiki'

interface Props {
  categories: WikiCategoryTree[]
  onClose: () => void
}

export default function WikiGraphViewWrapper(props: Props) {
  return <WikiGraphView {...props} />
}
