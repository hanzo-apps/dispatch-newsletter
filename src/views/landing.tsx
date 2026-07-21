import { useState } from 'react'
import { useIam } from '@hanzo/iam/react'
import { YStack, XStack, H1, Paragraph, SizableText, Input, Button } from '@hanzo/gui'
import { paper, ink, rule, muted, faint, onInk, measure } from '../theme'

/** localStorage key: a pending subscribe email, finalized after sign-in (shell.tsx). */
export const PENDING_KEY = 'dispatch.subscribe'

/**
 * The public masthead — the pre-auth view every visitor lands on. Wordmark, a
 * thin ink rule, the tagline, and a boxed subscribe field. Reading the archive
 * and joining the list both run on Hanzo identity, so subscribing stashes the
 * email and starts a PKCE sign-in; the shell records the row on return.
 */
export function Landing() {
  const { login, isLoading } = useIam()
  const [email, setEmail] = useState('')

  function subscribe() {
    const value = email.trim()
    if (value) {
      try {
        window.localStorage.setItem(PENDING_KEY, value)
      } catch {
        /* private mode — sign-in still proceeds */
      }
    }
    login()
  }

  return (
    <YStack flex={1} minHeight="100vh" backgroundColor={paper} alignItems="center" justifyContent="center" paddingVertical="$8" paddingHorizontal="$5">
      <YStack width="100%" maxWidth={measure} gap="$5">
        {/* Masthead */}
        <YStack gap="$3">
          <SizableText fontSize={12} letterSpacing={3} color={faint} textTransform="uppercase">
            A newsletter, archived
          </SizableText>
          <H1 fontSize={64} lineHeight={62} fontWeight="800" letterSpacing={-2} color={ink}>
            Dispatch
          </H1>
          <YStack height={1} backgroundColor={ink} />
          <SizableText fontSize={21} lineHeight={30} color={ink}>
            Every issue, kept forever.
          </SizableText>
        </YStack>

        <Paragraph fontSize={16} lineHeight={26} color={muted}>
          Dispatch keeps every issue of the newsletter in one quiet archive. Join the
          list to read along — each new issue is filed here the day it goes out, and
          nothing ever falls off the bottom of an inbox again.
        </Paragraph>

        {/* Boxed subscribe field with a solid black button */}
        <YStack gap="$2" paddingTop="$2">
          <XStack borderWidth={1} borderColor={ink} borderRadius={6} overflow="hidden" alignItems="center">
            <Input
              flex={1}
              value={email}
              onChangeText={setEmail}
              onSubmitEditing={subscribe}
              placeholder="you@example.com"
              autoCapitalize="none"
              keyboardType="email-address"
              height={54}
              borderWidth={0}
              borderRadius={0}
              backgroundColor={paper}
              paddingHorizontal={18}
              fontSize={16}
              color={ink}
            />
            <Button
              onPress={subscribe}
              disabled={isLoading}
              height={54}
              paddingHorizontal={26}
              borderRadius={0}
              backgroundColor={ink}
              pressStyle={{ backgroundColor: muted }}
              hoverStyle={{ backgroundColor: muted }}
            >
              <SizableText color={onInk} fontSize={15} fontWeight="700">Subscribe</SizableText>
            </Button>
          </XStack>
          <SizableText fontSize={13} lineHeight={19} color={faint}>
            Subscribing signs you in with Hanzo — then you’re on the list.
          </SizableText>
        </YStack>

        {/* Secondary: existing readers */}
        <XStack paddingTop="$1">
          <SizableText
            fontSize={14}
            color={ink}
            cursor="pointer"
            textDecorationLine="underline"
            hoverStyle={{ color: muted }}
            onPress={() => login()}
          >
            Already a reader? Open the archive →
          </SizableText>
        </XStack>

        {/* Colophon */}
        <YStack gap="$3" paddingTop="$7">
          <YStack height={1} backgroundColor={rule} />
          <SizableText fontSize={12} letterSpacing={1} color={faint} textTransform="uppercase">
            Dispatch · published on Hanzo
          </SizableText>
        </YStack>
      </YStack>
    </YStack>
  )
}
