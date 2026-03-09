import { test, expect } from '@playwright/test'

/**
 * VRT (Visual Regression Test) stories configuration.
 *
 * Each entry defines a Storybook story to capture and compare screenshots.
 * - `id`: Storybook story ID (derived from title + story name in kebab-case)
 * - `name`: Human-readable name used for the screenshot filename
 * - `waitMs`: Extra wait time (ms) after page load for canvas rendering to settle
 */
const stories = [
  // Core rendering
  { id: 'core-rendering--render-rect-test', name: 'render-rect' },
  { id: 'core-rendering--render-circle-test', name: 'render-circle' },
  { id: 'core-rendering--render-r-rect-test', name: 'render-rrect' },
  { id: 'core-rendering--render-text-test', name: 'render-text' },
  { id: 'core-rendering--render-flex-test', name: 'render-flex' },
  { id: 'core-rendering--render-canvas-test', name: 'render-canvas' },
  { id: 'core-rendering--render-path-test', name: 'render-path' },
  { id: 'core-rendering--render-image-test', name: 'render-image' },

  // Core compositing (clipping)
  { id: 'core-compositing--clip-circle-layer-test', name: 'clip-circle-layer' },
  { id: 'core-compositing--clip-rect-layer-test', name: 'clip-rect-layer' },
  { id: 'core-compositing--clip-r-rect-layer-test', name: 'clip-rrect-layer' },
  { id: 'core-compositing--rasterizing', name: 'rasterizing' },

  // React components
  { id: 'react-canvas--canvas-test', name: 'react-canvas' },
  { id: 'react--text-test', name: 'react-text' },
  { id: 'react--chunk-test', name: 'react-chunk' },
  { id: 'react-scrollview--scroll-view-test', name: 'react-scroll-view' },
]

for (const story of stories) {
  test(`VRT: ${story.name}`, async ({ page }) => {
    await page.goto(`/iframe.html?id=${story.id}&viewMode=story`)

    // Stories use setTimeout(100ms) internally for canvas initialization;
    // wait 500ms (5x) to ensure rendering fully settles across all stories
    await page.waitForTimeout(500)

    await expect(page).toHaveScreenshot(`${story.name}.png`, {
      maxDiffPixelRatio: 0.01,
    })
  })
}
