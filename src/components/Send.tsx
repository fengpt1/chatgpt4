import { Match, Switch, createSignal, onMount } from 'solid-js'
import { useStore } from '@nanostores/solid'
import { createShortcut } from '@solid-primitives/keyboard'
import { currentErrorMessage, inputPrompt } from '@/stores/ui'
import { addConversation, conversationMap, currentConversationId } from '@/stores/conversation'
import { handlePrompt } from '@/logics/conversation'

export default () => {
  let inputRef: HTMLTextAreaElement
  const $conversationMap = useStore(conversationMap)
  const $currentConversationId = useStore(currentConversationId)
  const $inputPrompt = useStore(inputPrompt)
  const $currentErrorMessage = useStore(currentErrorMessage)

  const [focusState, setFocusState] = createSignal(false)
  const isEditing = () => $inputPrompt() || focusState()
  const currentConversation = () => {
    return $conversationMap()[$currentConversationId()]
  }

  onMount(() => {
    createShortcut(['Meta', 'Enter'], () => {
      focusState() && handleSend()
    })
  })

  const EmptyState = () => (
    <div
      class="max-w-base h-full flex flex-row items-center gap-2"
      onClick={() => { setFocusState(true) && inputRef.focus() }}
    >
      <div class="flex-1 op-30">Enter Something...</div>
      <div class="i-carbon-send op-50 text-xl" />
    </div>
  )

  const EditState = () => (
    <div class="h-full">
      <div class="h-full relative">
        <textarea
          ref={inputRef!}
          placeholder="Enter something..."
          autocomplete="off"
          onBlur={() => { setFocusState(false) }}
          onInput={() => { inputPrompt.set(inputRef.value) }}
          class="absolute inset-0 py-4 px-[calc(max(1.5rem,(100%-48rem)/2))] resize-none scroll-pa-4 input-base"
        />
        <div
          onClick={handleSend}
          class="absolute right-[calc(max(1.5rem,(100%-48rem)/2)-0.5rem)] bottom-3 bg-base-100 border border-base p-2 rounded-md hv-base"
        >
          <div class="i-carbon-send op-50 text-xl cursor-pointer" />
        </div>
      </div>
    </div>
  )

  const ErrorState = () => (
    <div class="max-w-base h-full flex items-end flex-col sm:(flex-row items-center) justify-between gap-8 py-4 text-error text-sm">
      <div>
        <div class="fi gap-0.5 mb-1">
          <span i-carbon-warning />
          <span class="font-semibold">{$currentErrorMessage()?.code}</span>
        </div>
        <div>{$currentErrorMessage()?.message}</div>
      </div>
      <div
        class="border border-error px-2 py-1 rounded-md hv-base hover:bg-white"
        onClick={() => { currentErrorMessage.set(null) }}
      >
        Dismiss
      </div>
    </div>
  )

  const handleSend = () => {
    if (!inputRef.value)
      return
    if (!currentConversation())
      addConversation()
    handlePrompt(currentConversation(), inputRef.value)
    inputPrompt.set('')
    inputRef.value = ''
    setFocusState(false)
  }

  const stateType = () => {
    if ($currentErrorMessage())
      return 'error'
    else if (isEditing())
      return 'editing'
    else
      return 'normal'
  }

  const stateClass = () => {
    if (stateType() === 'normal')
      return 'h-14 bg-base-100 hv-base'
    else if (stateType() === 'error')
      return 'bg-red/8'
    else if (stateType() === 'editing')
      return 'h-40 bg-base-100'
    return ''
  }

  return (
    <div class={`px-6 border-t border-base transition-all ${stateClass()}`}>
      <Switch fallback={<EmptyState />}>
        <Match when={$currentErrorMessage()}>
          <ErrorState />
        </Match>
        <Match when={isEditing()}>
          <EditState />
        </Match>
      </Switch>
    </div>
  )
}
