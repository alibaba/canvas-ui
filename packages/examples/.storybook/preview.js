import './global.css'

export const parameters = {
  layout: 'fullscreen',
  options: {
    storySort: {
      order: [
        'core', [
          'compositing',
          'rendering',
          'events',
          'dom',
        ],
        'react',
        'hooks',
        'example',
      ],
    },
  },
}
