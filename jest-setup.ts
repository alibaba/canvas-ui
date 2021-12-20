const FPS = 1000 / 60

jest.spyOn(self, 'requestAnimationFrame').mockImplementation((callback: FrameRequestCallback) => {
  return self.setTimeout(() => {
    callback(performance.now())
  }, FPS) as unknown as number
})

jest.spyOn(self, 'cancelAnimationFrame').mockImplementation((id: number) => {
  return self.clearTimeout(id)
})
