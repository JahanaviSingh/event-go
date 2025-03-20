import { RouterOutputs } from '../../trpc/clients/types'

export const UserInfo = ({ hello }: { hello: RouterOutputs['hello'] }) => {
  return
  ;<div>
    <div>{hello.name}</div>
    <div>{hello.age}</div>
  </div>
}
