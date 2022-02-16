export class WheelEventSaveTarget implements WheelEvent {

  readonly offsetX = this.original.offsetX

  readonly offsetY = this.original.offsetY

  readonly target = this.original.target

  readonly currentTarget = this.original.currentTarget

  readonly relatedTarget = this.original.relatedTarget

  readonly srcElement = this.original.srcElement

  constructor(readonly original: WheelEvent) {
  }

  get deltaMode() {
    return this.original.deltaMode
  }

  get deltaX() {
    return this.original.deltaX
  }

  get deltaY() {
    return this.original.deltaY
  }

  get deltaZ() {
    return this.original.deltaZ
  }

  get DOM_DELTA_LINE() {
    return this.original.DOM_DELTA_LINE
  }

  get DOM_DELTA_PAGE() {
    return this.original.DOM_DELTA_PAGE
  }

  get DOM_DELTA_PIXEL() {
    return this.original.DOM_DELTA_PIXEL
  }

  get altKey() {
    return this.original.altKey
  }

  get button() {
    return this.original.button
  }

  get buttons() {
    return this.original.buttons
  }

  get clientX() {
    return this.original.clientX
  }

  get clientY() {
    return this.original.clientY
  }

  get ctrlKey() {
    return this.original.ctrlKey
  }

  get metaKey() {
    return this.original.metaKey
  }

  get movementX() {
    return this.original.movementX
  }

  get movementY() {
    return this.original.movementY
  }

  get pageX() {
    return this.original.pageX
  }

  get pageY() {
    return this.original.pageY
  }

  get screenX() {
    return this.original.screenX
  }

  get screenY() {
    return this.original.screenY
  }

  get shiftKey() {
    return this.original.shiftKey
  }

  get x() {
    return this.original.x
  }

  get y() {
    return this.original.y
  }

  getModifierState(keyArg: string): boolean {
    return this.original.getModifierState(keyArg)
  }

  initMouseEvent(_typeArg: string, _canBubbleArg: boolean, _cancelableArg: boolean, _viewArg: Window, _detailArg: number, _screenXArg: number, _screenYArg: number, _clientXArg: number, _clientYArg: number, _ctrlKeyArg: boolean, _altKeyArg: boolean, _shiftKeyArg: boolean, _metaKeyArg: boolean, _buttonArg: number, _relatedTargetArg: EventTarget | null): void {
    throw new Error('Method not implemented.')
  }

  get detail() {
    return this.original.detail
  }

  get view() {
    return this.original.view
  }

  get which() {
    return this.original.which
  }

  initUIEvent(_typeArg: string, _bubblesArg?: boolean, _cancelableArg?: boolean, _viewArg?: Window | null, _detailArg?: number): void {
    throw new Error('Method not implemented.')
  }

  get bubbles() {
    return this.original.bubbles
  }

  get cancelBubble() {
    return this.original.cancelBubble
  }

  get cancelable() {
    return this.original.cancelable
  }

  get composed() {
    return this.original.composed
  }

  get defaultPrevented() {
    return this.original.defaultPrevented
  }

  get eventPhase() {
    return this.original.eventPhase
  }

  get isTrusted() {
    return this.original.isTrusted
  }

  get returnValue() {
    return this.original.returnValue
  }

  get timeStamp() {
    return this.original.timeStamp
  }

  get type() {
    return this.original.type
  }

  composedPath(): EventTarget[] {
    return this.original.composedPath()
  }

  initEvent(): void {
    throw new Error('Method not implemented.')
  }

  preventDefault(): void {
    this.original.preventDefault()
  }

  stopImmediatePropagation(): void {
    this.original.stopImmediatePropagation()
  }

  stopPropagation(): void {
    this.original.stopPropagation()
  }

  get AT_TARGET() {
    return this.original.AT_TARGET
  }

  get BUBBLING_PHASE() {
    return this.original.BUBBLING_PHASE
  }

  get CAPTURING_PHASE() {
    return this.original.CAPTURING_PHASE
  }

  get NONE() {
    return this.original.NONE
  }
}

export class PointerEventSaveTarget implements PointerEvent {

  readonly offsetX = this.original.offsetX

  readonly offsetY = this.original.offsetY

  readonly target = this.original.target

  readonly currentTarget = this.original.currentTarget

  readonly relatedTarget = this.original.relatedTarget

  readonly srcElement = this.original.srcElement

  constructor(readonly original: PointerEvent) {
  }

  get height() {
    return this.original.height
  }

  get isPrimary() {
    return this.original.isPrimary
  }

  get pointerId() {
    return this.original.pointerId
  }

  get pointerType() {
    return this.original.pointerType
  }

  get pressure() {
    return this.original.pressure
  }

  get tangentialPressure() {
    return this.original.tangentialPressure
  }

  get tiltX() {
    return this.original.tiltX
  }

  get tiltY() {
    return this.original.tiltY
  }

  get twist() {
    return this.original.twist
  }

  get width() {
    return this.original.width
  }

  getCoalescedEvents() {
    return this.original.getCoalescedEvents()
  }

  getPredictedEvents() {
    return this.original.getPredictedEvents()
  }

  get altKey() {
    return this.original.altKey
  }

  get button() {
    return this.original.button
  }

  get buttons() {
    return this.original.buttons
  }

  get clientX() {
    return this.original.clientX
  }

  get clientY() {
    return this.original.clientY
  }

  get ctrlKey() {
    return this.original.ctrlKey
  }

  get metaKey() {
    return this.original.metaKey
  }

  get movementX() {
    return this.original.movementX
  }

  get movementY() {
    return this.original.movementY
  }

  get pageX() {
    return this.original.pageX
  }

  get pageY() {
    return this.original.pageY
  }

  get screenX() {
    return this.original.screenX
  }

  get screenY() {
    return this.original.screenY
  }

  get shiftKey() {
    return this.original.shiftKey
  }

  get x() {
    return this.original.x
  }

  get y() {
    return this.original.y
  }

  getModifierState(keyArg: string): boolean {
    return this.original.getModifierState(keyArg)
  }

  initMouseEvent(_typeArg: string, _canBubbleArg: boolean, _cancelableArg: boolean, _viewArg: Window, _detailArg: number, _screenXArg: number, _screenYArg: number, _clientXArg: number, _clientYArg: number, _ctrlKeyArg: boolean, _altKeyArg: boolean, _shiftKeyArg: boolean, _metaKeyArg: boolean, _buttonArg: number, _relatedTargetArg: EventTarget | null): void {
    throw new Error('Method not implemented.')
  }

  get detail() {
    return this.original.detail
  }

  get view() {
    return this.original.view
  }

  get which() {
    return this.original.which
  }

  initUIEvent(_typeArg: string, _bubblesArg?: boolean, _cancelableArg?: boolean, _viewArg?: Window | null, _detailArg?: number): void {
    throw new Error('Method not implemented.')
  }

  get bubbles() {
    return this.original.bubbles
  }

  get cancelBubble() {
    return this.original.cancelBubble
  }

  get cancelable() {
    return this.original.cancelable
  }

  get composed() {
    return this.original.composed
  }

  get defaultPrevented() {
    return this.original.defaultPrevented
  }

  get eventPhase() {
    return this.original.eventPhase
  }

  get isTrusted() {
    return this.original.isTrusted
  }

  get returnValue() {
    return this.original.returnValue
  }

  get timeStamp() {
    return this.original.timeStamp
  }

  get type() {
    return this.original.type
  }

  composedPath(): EventTarget[] {
    return this.original.composedPath()
  }

  initEvent(): void {
    throw new Error('Method not implemented.')
  }

  preventDefault(): void {
    this.original.preventDefault()
  }

  stopImmediatePropagation(): void {
    this.original.stopImmediatePropagation()
  }

  stopPropagation(): void {
    this.original.stopPropagation()
  }

  get AT_TARGET() {
    return this.original.AT_TARGET
  }

  get BUBBLING_PHASE() {
    return this.original.BUBBLING_PHASE
  }

  get CAPTURING_PHASE() {
    return this.original.CAPTURING_PHASE
  }

  get NONE() {
    return this.original.NONE
  }
}
