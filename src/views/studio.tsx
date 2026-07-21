import { useState } from 'react'
import { useQuery, useMutation } from '@hanzo/base/react'
import { YStack, XStack, SizableText, Paragraph, Input, TextArea, Button, Text, Spinner } from '@hanzo/gui'
import type { Subscriber } from '../lib/types'
import { fmtDate } from '../lib/date'
import { paper, ink, rule, muted, faint, onInk } from '../theme'

/** A quiet labelled field — uppercase caption over a hairline input. */
function Field({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <YStack gap="$2">
      <SizableText fontSize={11} letterSpacing={2} color={faint} textTransform="uppercase">
        {label}
      </SizableText>
      {children}
    </YStack>
  )
}

const fieldStyle = {
  borderWidth: 1,
  borderColor: rule,
  borderRadius: 6,
  backgroundColor: paper,
  fontSize: 16,
  color: ink,
} as const

/**
 * Studio — the author's desk. Compose an issue (draft or published) into the
 * `issues` collection, and read the mailing list from `subscribers`. Both are
 * org-scoped writes carrying the signed-in IAM token.
 */
export function Studio() {
  const createIssue = useMutation('issues', 'create')
  const [subject, setSubject] = useState('')
  const [preview, setPreview] = useState('')
  const [body, setBody] = useState('')
  const [published, setPublished] = useState(false)
  const [notice, setNotice] = useState<string | null>(null)

  async function saveIssue() {
    const s = subject.trim()
    if (!s || createIssue.isLoading) return
    await createIssue.mutate({
      subject: s,
      preview: preview.trim(),
      body,
      published,
      sent_at: published ? new Date().toISOString() : '',
    })
    setNotice(published ? `Published “${s}”.` : `Saved “${s}” as a draft.`)
    setSubject('')
    setPreview('')
    setBody('')
    setPublished(false)
  }

  const {
    data: subs,
    isLoading,
    error,
    refetch,
  } = useQuery<Subscriber>('subscribers', { sort: '-subscribed_at', realtime: false })
  const addSub = useMutation('subscribers', 'create')
  const [subEmail, setSubEmail] = useState('')
  const [subName, setSubName] = useState('')

  async function addSubscriber() {
    const e = subEmail.trim()
    if (!e || addSub.isLoading) return
    await addSub.mutate({
      email: e,
      name: subName.trim(),
      subscribed_at: new Date().toISOString(),
      status: 'active',
    })
    setSubEmail('')
    setSubName('')
    await refetch()
  }

  return (
    <YStack gap="$8">
      {/* Compose */}
      <YStack gap="$4">
        <SizableText fontSize={12} letterSpacing={3} color={faint} textTransform="uppercase">
          Studio · compose
        </SizableText>

        <YStack gap="$4" borderWidth={1} borderColor={rule} borderRadius={10} padding="$5" backgroundColor={paper}>
          <Field label="Subject">
            <Input
              {...fieldStyle}
              height={48}
              paddingHorizontal={14}
              value={subject}
              onChangeText={setSubject}
              placeholder="What’s this issue about?"
            />
          </Field>

          <Field label="Preview">
            <Input
              {...fieldStyle}
              height={48}
              paddingHorizontal={14}
              value={preview}
              onChangeText={setPreview}
              placeholder="One line of standfirst, shown in the archive"
            />
          </Field>

          <Field label="Body">
            <TextArea
              {...fieldStyle}
              minHeight={220}
              padding={14}
              value={body}
              onChangeText={setBody}
              placeholder={'Write the issue…\n\nBlank lines start new paragraphs.'}
            />
          </Field>

          <XStack alignItems="center" justifyContent="space-between" flexWrap="wrap" gap="$3">
            <XStack alignItems="center" gap="$2" cursor="pointer" onPress={() => setPublished((v) => !v)}>
              <YStack
                width={18}
                height={18}
                borderWidth={1}
                borderColor={ink}
                borderRadius={3}
                alignItems="center"
                justifyContent="center"
                backgroundColor={published ? ink : 'transparent'}
              >
                {published ? <SizableText fontSize={12} lineHeight={13} color={onInk}>✓</SizableText> : null}
              </YStack>
              <SizableText fontSize={14} color={ink}>Publish now</SizableText>
            </XStack>

            <Button
              onPress={saveIssue}
              disabled={createIssue.isLoading || !subject.trim()}
              height={46}
              paddingHorizontal={22}
              borderRadius={6}
              backgroundColor={ink}
              pressStyle={{ backgroundColor: muted }}
              hoverStyle={{ backgroundColor: muted }}
            >
              <SizableText color={onInk} fontSize={15} fontWeight="700">
                {published ? 'Publish issue' : 'Save draft'}
              </SizableText>
            </Button>
          </XStack>

          {createIssue.error ? <Paragraph color="$red10">{createIssue.error.message}</Paragraph> : null}
          {notice ? <SizableText fontSize={13} color={muted}>{notice}</SizableText> : null}
        </YStack>
      </YStack>

      {/* Subscribers */}
      <YStack gap="$4">
        <XStack alignItems="baseline" gap="$3">
          <SizableText fontSize={12} letterSpacing={3} color={faint} textTransform="uppercase">
            Subscribers
          </SizableText>
          {!isLoading && !error ? (
            <SizableText fontSize={12} color={faint}>
              {subs.length} on the list
            </SizableText>
          ) : null}
        </XStack>

        <XStack gap="$2" flexWrap="wrap">
          <Input
            {...fieldStyle}
            flex={1}
            minWidth={200}
            height={46}
            paddingHorizontal={14}
            value={subEmail}
            onChangeText={setSubEmail}
            onSubmitEditing={addSubscriber}
            placeholder="reader@example.com"
            autoCapitalize="none"
            keyboardType="email-address"
          />
          <Input
            {...fieldStyle}
            width={160}
            height={46}
            paddingHorizontal={14}
            value={subName}
            onChangeText={setSubName}
            onSubmitEditing={addSubscriber}
            placeholder="Name (optional)"
          />
          <Button
            onPress={addSubscriber}
            disabled={addSub.isLoading || !subEmail.trim()}
            height={46}
            paddingHorizontal={20}
            borderRadius={6}
            backgroundColor={ink}
            pressStyle={{ backgroundColor: muted }}
            hoverStyle={{ backgroundColor: muted }}
          >
            <SizableText color={onInk} fontSize={15} fontWeight="700">Add</SizableText>
          </Button>
        </XStack>

        {isLoading ? (
          <XStack gap="$2" alignItems="center" opacity={0.6}>
            <Spinner /> <Text color={muted}>Loading the list…</Text>
          </XStack>
        ) : error ? (
          <Paragraph color="$red10">Couldn’t reach Base ({error.message}).</Paragraph>
        ) : subs.length === 0 ? (
          <Paragraph fontSize={15} color={muted}>No subscribers yet.</Paragraph>
        ) : (
          <YStack>
            {subs.map((s) => (
              <XStack
                key={s.id}
                alignItems="center"
                justifyContent="space-between"
                gap="$3"
                paddingVertical="$3"
                borderTopWidth={1}
                borderColor={rule}
              >
                <YStack gap="$1" flex={1}>
                  <Text fontSize={15} color={ink}>{s.email}</Text>
                  {s.name ? <Text fontSize={13} color={muted}>{s.name}</Text> : null}
                </YStack>
                <YStack alignItems="flex-end" gap="$1">
                  <SizableText
                    fontSize={11}
                    letterSpacing={1}
                    textTransform="uppercase"
                    color={s.status === 'active' ? ink : faint}
                  >
                    {s.status}
                  </SizableText>
                  <SizableText fontSize={12} color={faint}>{fmtDate(s.subscribed_at)}</SizableText>
                </YStack>
              </XStack>
            ))}
            <YStack height={1} backgroundColor={rule} />
          </YStack>
        )}
      </YStack>
    </YStack>
  )
}
