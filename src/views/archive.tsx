import { useQuery } from '@hanzo/base/react'
import { YStack, XStack, SizableText, Paragraph, Spinner, Text } from '@hanzo/gui'
import type { Issue } from '../lib/types'
import { fmtDate } from '../lib/date'
import { ink, rule, muted, faint } from '../theme'

/**
 * The reader's archive: every published issue, newest first. Rows read as a
 * quiet ledger — dateline, headline, one line of preview — and open the full
 * issue on press. Org-scoped through the IAM token wired in providers.tsx.
 */
export function Archive({ onOpen, onCompose }: { onOpen: (issue: Issue) => void; onCompose: () => void }) {
  const { data, isLoading, error } = useQuery<Issue>('issues', {
    filter: 'published = true',
    sort: '-sent_at',
    realtime: false,
  })

  return (
    <YStack gap="$5">
      <SizableText fontSize={12} letterSpacing={3} color={faint} textTransform="uppercase">
        The archive
      </SizableText>

      {isLoading ? (
        <XStack gap="$2" alignItems="center" opacity={0.6}>
          <Spinner /> <Text color={muted}>Gathering issues…</Text>
        </XStack>
      ) : error ? (
        <Paragraph color="$red10">
          Couldn’t reach Base ({error.message}). Confirm VITE_HANZO_BASE_URL and that you’re signed in.
        </Paragraph>
      ) : data.length === 0 ? (
        <YStack gap="$3" paddingVertical="$4">
          <Paragraph fontSize={17} color={ink}>No issues yet.</Paragraph>
          <SizableText
            fontSize={14}
            color={ink}
            cursor="pointer"
            textDecorationLine="underline"
            hoverStyle={{ color: muted }}
            onPress={onCompose}
          >
            Write the first one in Studio →
          </SizableText>
        </YStack>
      ) : (
        <YStack>
          {data.map((issue) => (
            <YStack
              key={issue.id}
              paddingVertical="$4"
              borderTopWidth={1}
              borderColor={rule}
              cursor="pointer"
              gap="$2"
              hoverStyle={{ backgroundColor: '#F3F1EA' }}
              onPress={() => onOpen(issue)}
            >
              <SizableText fontSize={12} letterSpacing={1.5} color={faint} textTransform="uppercase">
                {fmtDate(issue.sent_at)}
              </SizableText>
              <SizableText fontSize={23} lineHeight={29} fontWeight="700" color={ink}>
                {issue.subject}
              </SizableText>
              {issue.preview ? (
                <Paragraph fontSize={15} lineHeight={23} color={muted} numberOfLines={2}>
                  {issue.preview}
                </Paragraph>
              ) : null}
            </YStack>
          ))}
          <YStack height={1} backgroundColor={rule} />
        </YStack>
      )}
    </YStack>
  )
}
