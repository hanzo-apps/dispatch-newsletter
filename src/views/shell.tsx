import { useEffect, useRef, useState } from 'react'
import { useIam } from '@hanzo/iam/react'
import { useMutation } from '@hanzo/base/react'
import { YStack, XStack, SizableText } from '@hanzo/gui'
import type { Issue } from '../lib/types'
import { Archive } from './archive'
import { IssueRead } from './issue'
import { Studio } from './studio'
import { PENDING_KEY } from './landing'
import { paper, ink, rule, muted, faint, measure } from '../theme'

type Route = { name: 'archive' } | { name: 'issue'; issue: Issue } | { name: 'studio' }

/** A masthead nav link — ink when active, muted otherwise. */
function NavLink({ label, active, onPress }: { label: string; active: boolean; onPress: () => void }) {
  return (
    <SizableText
      fontSize={14}
      color={active ? ink : muted}
      cursor="pointer"
      hoverStyle={{ color: ink }}
      onPress={onPress}
    >
      {label}
    </SizableText>
  )
}

/**
 * The signed-in shell: a newsprint masthead over the three views (archive →
 * issue read, and studio). On first load after a subscribe, it finalizes the
 * pending email stashed by the landing into a real `subscribers` row.
 */
export function Shell() {
  const { user, logout } = useIam()
  const [route, setRoute] = useState<Route>({ name: 'archive' })
  const [welcome, setWelcome] = useState<string | null>(null)

  const finalize = useMutation('subscribers', 'create')
  const claimed = useRef(false)
  useEffect(() => {
    if (claimed.current) return
    let email: string | null = null
    try {
      email = window.localStorage.getItem(PENDING_KEY)
    } catch {
      email = null
    }
    if (!email) return
    claimed.current = true
    try {
      window.localStorage.removeItem(PENDING_KEY)
    } catch {
      /* ignore */
    }
    finalize
      .mutate({
        email,
        name: user?.displayName || user?.name || '',
        subscribed_at: new Date().toISOString(),
        status: 'active',
      })
      .then(() => setWelcome(email))
      .catch(() => {
        /* already on the list, or offline — they can re-add in Studio */
      })
  }, [finalize, user])

  const archiveActive = route.name !== 'studio'

  return (
    <YStack flex={1} minHeight="100vh" backgroundColor={paper}>
      {/* Masthead */}
      <YStack borderBottomWidth={1} borderColor={ink} paddingHorizontal="$5">
        <XStack
          width="100%"
          maxWidth={measure}
          alignSelf="center"
          alignItems="center"
          justifyContent="space-between"
          paddingVertical="$4"
          gap="$4"
        >
          <SizableText
            fontSize={20}
            fontWeight="800"
            letterSpacing={-0.5}
            color={ink}
            cursor="pointer"
            onPress={() => setRoute({ name: 'archive' })}
          >
            Dispatch
          </SizableText>
          <XStack alignItems="center" gap="$5">
            <NavLink label="Archive" active={archiveActive} onPress={() => setRoute({ name: 'archive' })} />
            <NavLink label="Studio" active={route.name === 'studio'} onPress={() => setRoute({ name: 'studio' })} />
            <SizableText fontSize={14} color={faint} cursor="pointer" hoverStyle={{ color: ink }} onPress={() => logout()}>
              Sign out
            </SizableText>
          </XStack>
        </XStack>
      </YStack>

      {/* Body */}
      <YStack width="100%" maxWidth={measure} alignSelf="center" paddingHorizontal="$5" paddingVertical="$7" gap="$6">
        {welcome ? (
          <YStack borderWidth={1} borderColor={rule} borderRadius={8} padding="$4" gap="$1">
            <SizableText fontSize={15} color={ink}>You’re on the list — welcome.</SizableText>
            <SizableText fontSize={13} color={muted}>
              {welcome} is subscribed. Every issue is filed in the archive below.
            </SizableText>
          </YStack>
        ) : null}

        {route.name === 'studio' ? (
          <Studio />
        ) : route.name === 'issue' ? (
          <IssueRead issue={route.issue} onBack={() => setRoute({ name: 'archive' })} />
        ) : (
          <Archive
            onOpen={(issue) => setRoute({ name: 'issue', issue })}
            onCompose={() => setRoute({ name: 'studio' })}
          />
        )}
      </YStack>
    </YStack>
  )
}
