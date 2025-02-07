import { Match, Switch, createSignal } from 'solid-js'
import { useStore } from '@nanostores/solid'
import { conversationMap, currentConversationId } from '@/stores/conversation'
import { conversationMessagesMap } from '@/stores/messages'
import { loadingStateMap, streamsMap } from '@/stores/streams'
import Welcome from './Welcome'
import Continuous from './Continuous'
import Single from './Single'
import Image from './Image'
import type { User } from '@/types'

export default () => {
  const $conversationMap = useStore(conversationMap)
  const $conversationMessagesMap = useStore(conversationMessagesMap)
  const $currentConversationId = useStore(currentConversationId)
  const $streamsMap = useStore(streamsMap)
  const $loadingStateMap = useStore(loadingStateMap)

  const currentConversation = () => {
    return $conversationMap()[$currentConversationId()]
  }
  const currentConversationMessages = () => {
    return $conversationMessagesMap()[$currentConversationId()] || []
  }
  const isStreaming = () => !!$streamsMap()[$currentConversationId()]
  const isLoading = () => !!$loadingStateMap()[$currentConversationId()]

  const [isLogin, setIsLogin] = createSignal(true)
  const [showCharge, setShowCharge] = createSignal(false)
  const [user, setUser] = createSignal<User>({
    id: 0,
    email: '',
    nickname: '',
    times: 0,
    token: '',
    word: 0,
  })

  return (
    <Switch
      fallback={(
        <Welcome
          setIsLogin={setIsLogin}
          setUser={setUser}
          isLogin={isLogin}
          user={user}
        />
      )}
    >
      <Match when={currentConversation()?.conversationType === 'continuous'}>
        <Continuous
          conversationId={$currentConversationId()}
          messages={currentConversationMessages}
          setUser={setUser}
          user={user}
        />
      </Match>
      <Match when={currentConversation()?.conversationType === 'single'}>
        <Single
          conversationId={$currentConversationId()}
          messages={currentConversationMessages}
          setUser={setUser}
          user={user}
        />
      </Match>
      <Match when={currentConversation()?.conversationType === 'image'}>
        <Image
          // conversationId={$currentConversationId()}
          messages={currentConversationMessages}
          // fetching={isLoading() || !isStreaming()}
        />
      </Match>
    </Switch>
  )
}
