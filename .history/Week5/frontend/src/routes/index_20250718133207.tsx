import { lazy } from 'react'
import type { RouteProps } from 'react-router-dom'

const HomePage = lazy(() => import('@/app/(pages)/home/page'))

export type RoutesProps = {
  path: RouteProps['path']
  name: string
  element: RouteProps['element']
  exact?: boolean
}

const demoPages: RoutesProps[] = [
  {
    path: '/',
    name: 'root',
    element: <HomePage />,
  },

]

export const appRoutes = [...demoPages]
