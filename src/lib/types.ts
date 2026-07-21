import type { BaseRecord } from '@hanzo/base/react'

/** One row of the `issues` collection provisioned from schema.sql. */
export interface Issue extends BaseRecord {
  subject: string
  preview: string
  body: string
  sent_at: string
  published: boolean
}

/** One row of the `subscribers` collection provisioned from schema.sql. */
export interface Subscriber extends BaseRecord {
  email: string
  name: string
  subscribed_at: string
  status: string
}
