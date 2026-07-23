import '@testing-library/jest-dom/vitest'

// jsdom은 <dialog>의 show/showModal/close를 구현하지 않았다.
// open 상태 반영과 close 이벤트만 흉내 내는 테스트용 최소 폴리필.
HTMLDialogElement.prototype.show = function () {
  this.open = true
}
HTMLDialogElement.prototype.showModal = function () {
  this.open = true
}
HTMLDialogElement.prototype.close = function (returnValue?: string) {
  if (!this.open) return
  this.open = false
  if (returnValue !== undefined) this.returnValue = returnValue
  this.dispatchEvent(new Event('close'))
}
