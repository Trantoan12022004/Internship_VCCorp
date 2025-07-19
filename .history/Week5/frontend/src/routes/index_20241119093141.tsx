import { lazy } from 'react'
import type { RouteProps } from 'react-router-dom'

const HomePage = lazy(() => import('@/app/(pages)/home/page'))
const AboutPage = lazy(() => import('@/app/(pages)/about/page'))
const ServicesPage = lazy(() => import('@/app/(pages)/services/page'))
const Resume = lazy(() => import('@/app/(pages)/resume/page'))
const Projects = lazy(() => import('@/app/(pages)/projects/page'))
const Blogs = lazy(() => import('@/app/(pages)/blogs/page'))
const Contact = lazy(() => import('@/app/(pages)/contact/page'))
const BlogDetail = lazy(() => import('@/app/(pages)/blog-detail/page'))

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
  {
    path: '/about',
    name: 'About',
    element: <AboutPage />,
  },
  {
    path: '/services',
    name: 'Services',
    element: <ServicesPage />,
  },
  {
    path: '/resume',
    name: 'Resume',
    element: <Resume />,
  },
  {
    path: '/projects',
    name: 'Projects',
    element: <Projects />,
  },
  {
    path: '/blogs',
    name: 'Blogs',
    element: <Blogs />,
  },
  {
    path: '/contact',
    name: 'Contact',
    element: <Contact />,
  },
  {
    path: '/blog-detail',
    name: 'Blog-detail',
    element: <BlogDetail />,
  },
]

export const appRoutes = [...demoPages]
