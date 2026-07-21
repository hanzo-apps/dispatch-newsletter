import { YStack, H1, Paragraph, SizableText } from '@hanzo/gui'
import type { Issue } from '../lib/types'
import { fmtDate } from '../lib/date'
import { ink, rule, muted, faint } from '../theme'

/**
 * A single issue, read the way it was sent: one narrow column, a dateline, the
 * headline, an optional standfirst, then the body split into paragraphs. No
 * refetch — the archive hands the record straight in.
 */
export function IssueRead({ issue, onBack }: { issue: Issue; onBack: () => void }) {
  const paragraphs = issue.body
    .split(/\n{2,}/)
    .map((block) => block.trim())
    .filter(Boolean)

  return (
    <YStack gap="$5">
      <SizableText
        fontSize={13}
        color={muted}
        cursor="pointer"
        hoverStyle={{ color: ink }}
        onPress={onBack}
      >
        ← Back to the archive
      </SizableText>

      <YStack gap="$3">
        <SizableText fontSize={12} letterSpacing={2} color={faint} textTransform="uppercase">
          {fmtDate(issue.sent_at)}
        </SizableText>
        <H1 fontSize={40} lineHeight={46} fontWeight="800" letterSpacing={-1} color={ink}>
          {issue.subject}
        </H1>
        {issue.preview ? (
          <Paragraph fontSize={19} lineHeight={28} color={muted}>
            {issue.preview}
          </Paragraph>
        ) : null}
        <YStack height={1} backgroundColor={ink} marginTop="$2" />
      </YStack>

      <YStack gap="$4">
        {paragraphs.length === 0 ? (
          <Paragraph fontSize={17} color={muted}>This issue has no body yet.</Paragraph>
        ) : (
          paragraphs.map((text, i) => (
            <Paragraph key={i} fontSize={18} lineHeight={30} color={ink}>
              {text}
            </Paragraph>
          ))
        )}
      </YStack>

      <YStack gap="$3" paddingTop="$6">
        <YStack height={1} backgroundColor={rule} />
        <SizableText fontSize={12} letterSpacing={1} color={faint} textTransform="uppercase">
          End of issue · Dispatch
        </SizableText>
      </YStack>
    </YStack>
  )
}
