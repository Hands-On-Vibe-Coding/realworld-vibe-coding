import { test, expect } from '@playwright/test'

test.describe('Smoke Tests', () => {
  test('should load the application', async ({ page }) => {
    await page.goto('/')
    
    // Basic check that the app loads
    await expect(page).toHaveTitle(/RealWorld/)
    
    // Check that React is rendering content
    await expect(page.locator('#root')).toBeVisible()
    
    // Check for any console errors
    const errors: string[] = []
    page.on('console', msg => {
      if (msg.type() === 'error') {
        errors.push(msg.text())
      }
    })
    
    // Wait a bit for any errors to surface
    await page.waitForTimeout(2000)
    
    // Report any console errors
    if (errors.length > 0) {
      console.warn('Console errors found:', errors)
    }
  })

  test('should have working navigation', async ({ page }) => {
    await page.goto('/')
    
    // Check that we can navigate to different routes
    await page.goto('/login')
    expect(page.url()).toContain('/login')
    
    await page.goto('/register')
    expect(page.url()).toContain('/register')
    
    await page.goto('/')
    expect(page.url()).toBe(page.url().replace(/\/[^/]*$/, '/'))
  })
})