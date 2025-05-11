import { CreateAuditorium } from '@/components/templates/CreateAuditorium'
import { FormProviderCreateAuditorium } from '@/forms/CreateAuditorium'

const page = () => {
  return (
    <FormProviderCreateAuditorium>
      <CreateAuditorium />
    </FormProviderCreateAuditorium>
  )
}
export default page
