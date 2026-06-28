import { getAllEmailTemplates } from './actions'
import { TemplateList } from './_components/TemplateList'

export const dynamic = 'force-dynamic'

export default async function EmailTemplatesPage() {
  const templates = await getAllEmailTemplates()

  return (
    <div className="space-y-12 max-w-5xl mx-auto">
      <TemplateList templates={templates} />
    </div>
  )
}
