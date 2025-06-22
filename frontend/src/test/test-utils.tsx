import type { ReactElement } from 'react'
import { render, type RenderOptions } from '@testing-library/react'
import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { MantineProvider } from '@mantine/core'
import { Notifications } from '@mantine/notifications'
import { createRouter, RouterProvider, createMemoryHistory } from '@tanstack/react-router'
import { createRootRoute, createRoute } from '@tanstack/react-router'

// Create a test query client with disabled retries and caching
const createTestQueryClient = () =>
  new QueryClient({
    defaultOptions: {
      queries: {
        retry: false,
        gcTime: 0,
        staleTime: 0,
      },
      mutations: {
        retry: false,
      },
    },
  })

// Mock router for testing
const rootRoute = createRootRoute({
  component: () => <div data-testid="mock-router-outlet">Router Outlet</div>,
})

const indexRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: '/',
  component: () => <div>Home</div>,
})

const routeTree = rootRoute.addChildren([indexRoute])

const createTestRouter = () =>
  createRouter({
    routeTree,
    history: createMemoryHistory({
      initialEntries: ['/'],
    }),
  })

interface AllTheProvidersProps {
  children: React.ReactNode
  queryClient?: QueryClient
  withRouter?: boolean
}

function AllTheProviders({ 
  children, 
  queryClient = createTestQueryClient(),
  withRouter = false 
}: AllTheProvidersProps) {
  const router = createTestRouter()

  const content = (
    <QueryClientProvider client={queryClient}>
      <MantineProvider>
        <Notifications />
        {children}
      </MantineProvider>
    </QueryClientProvider>
  )

  if (withRouter) {
    // Router의 루트 컴포넌트에서 content를 렌더링하도록 설정
    const router = createTestRouter()
    return (
      <RouterProvider router={router}>
        {content}
      </RouterProvider>
    )
  }

  return content
}

interface CustomRenderOptions extends Omit<RenderOptions, 'wrapper'> {
  queryClient?: QueryClient
  withRouter?: boolean
}

const customRender = (
  ui: ReactElement,
  {
    queryClient = createTestQueryClient(),
    withRouter = false,
    ...renderOptions
  }: CustomRenderOptions = {}
) =>
  render(ui, {
    wrapper: ({ children }) => (
      <AllTheProviders queryClient={queryClient} withRouter={withRouter}>
        {children}
      </AllTheProviders>
    ),
    ...renderOptions,
  })

// Re-export everything
export * from '@testing-library/react'
export { customRender as render }
export { createTestQueryClient }