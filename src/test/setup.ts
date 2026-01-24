// happy-dom is registered in happydom.ts preload (must run first)
import '@testing-library/jest-dom'
import { afterEach, mock } from 'bun:test'
import { cleanup } from '@testing-library/react'

// Cleanup after each test
afterEach(() => {
  cleanup()
  // Clear any mock state
  document.body.innerHTML = ''
})

// Mock localStorage
const localStorageMock = (() => {
  let store: Record<string, string> = {}

  return {
    getItem: (key: string) => store[key] || null,
    setItem: (key: string, value: string) => {
      store[key] = value.toString()
    },
    removeItem: (key: string) => {
      delete store[key]
    },
    clear: () => {
      store = {}
    },
    get length() {
      return Object.keys(store).length
    },
    key: (index: number) => Object.keys(store)[index] || null,
  }
})()

Object.defineProperty(window, 'localStorage', {
  value: localStorageMock,
  writable: true,
})

// Mock sessionStorage
Object.defineProperty(window, 'sessionStorage', {
  value: localStorageMock,
  writable: true,
})

// Mock window.scrollTo
Object.defineProperty(window, 'scrollTo', {
  value: mock(() => {}),
  writable: true,
})

// Mock window.scroll
Object.defineProperty(window, 'scroll', {
  value: mock(() => {}),
  writable: true,
})

// Mock matchMedia
Object.defineProperty(window, 'matchMedia', {
  writable: true,
  value: mock((query: string) => ({
    matches: false,
    media: query,
    onchange: null,
    addListener: mock(() => {}),
    removeListener: mock(() => {}),
    addEventListener: mock(() => {}),
    removeEventListener: mock(() => {}),
    dispatchEvent: mock(() => true),
  })),
})

// Mock ResizeObserver
class MockResizeObserver {
  observe = mock(() => {})
  unobserve = mock(() => {})
  disconnect = mock(() => {})
}
global.ResizeObserver = MockResizeObserver as unknown as typeof ResizeObserver

// Mock IntersectionObserver
class MockIntersectionObserver {
  observe = mock(() => {})
  unobserve = mock(() => {})
  disconnect = mock(() => {})
}
global.IntersectionObserver = MockIntersectionObserver as unknown as typeof IntersectionObserver

// Mock Notification API
Object.defineProperty(window, 'Notification', {
  value: {
    permission: 'default',
    requestPermission: mock(() => Promise.resolve('granted')),
  },
  writable: true,
})

// Mock IndexedDB
global.indexedDB = {
  open: mock(() => ({})),
  deleteDatabase: mock(() => ({})),
} as unknown as IDBFactory

// Mock URL.createObjectURL and revokeObjectURL
URL.createObjectURL = mock(() => 'blob:mock-url')
URL.revokeObjectURL = mock(() => {})

// Mock window.location
const locationMock = {
  href: 'http://localhost:3000',
  origin: 'http://localhost:3000',
  protocol: 'http:',
  host: 'localhost:3000',
  hostname: 'localhost',
  port: '3000',
  pathname: '/',
  search: '',
  hash: '',
  assign: mock(() => {}),
  replace: mock(() => {}),
  reload: mock(() => {}),
}

Object.defineProperty(window, 'location', {
  value: locationMock,
  writable: true,
})
