import { Col, FictionDbTable, standardTable } from '@fiction/core'
import { z } from 'zod'

export const t = { ...standardTable, form: 'fiction_form', submission: 'fiction_form_submission' }

// Define schema for individual form field configuration
const FormFieldConfig = z.object({
  key: z.string(),
  type: z.enum(['text', 'number', 'boolean', 'select', 'multiselect', 'date', 'file', 'custom']),
  label: z.string(),
  placeholder: z.string().optional(),
  required: z.boolean().optional(),
  options: z.array(z.object({ label: z.string(), value: z.string() })).optional(),
  validation: z.record(z.unknown()).optional(),
  defaultValue: z.union([z.string(), z.number(), z.boolean(), z.array(z.string())]).optional(),
})

// Define schema for form layout
const FormLayout = z.array(z.object({
  type: z.enum(['section', 'row', 'column']),
  title: z.string().optional(),
  fields: z.array(z.string()), // Array of field keys
}))

export const formConfigCols = [
  new Col({ key: 'formId', sec: 'permanent', sch: () => z.string().min(1), make: ({ s, col, db }) => s.string(col.k).primary().defaultTo(db.raw(`object_id('form')`)).index() }),
  new Col({ key: 'projectId', sec: 'permanent', sch: () => z.string().min(1), make: ({ s, col }) => s.string(col.k).notNullable().index() }),
  new Col({ key: 'createdByUserId', sec: 'permanent', sch: () => z.string().min(1), make: ({ s, col }) => s.string(col.k).notNullable() }),
  new Col({ key: 'templateId', sec: 'setting', sch: () => z.string().nullable(), make: ({ s, col }) => s.string(col.k).nullable() }),
  new Col({ key: 'title', sec: 'setting', sch: () => z.string(), make: ({ s, col }) => s.string(col.k).notNullable() }),
  new Col({ key: 'description', sec: 'setting', sch: () => z.string(), make: ({ s, col }) => s.text(col.k).defaultTo('') }),
  new Col({ key: 'fields', sec: 'setting', sch: () => z.array(FormFieldConfig), make: ({ s, col }) => s.jsonb(col.k).notNullable(), prepare: ({ value }) => JSON.stringify(value) }),
  new Col({ key: 'layout', sec: 'setting', sch: () => FormLayout, make: ({ s, col }) => s.jsonb(col.k).notNullable(), prepare: ({ value }) => JSON.stringify(value) }),
  new Col({ key: 'settings', sec: 'setting', sch: () => z.record(z.unknown()), make: ({ s, col }) => s.jsonb(col.k).defaultTo({}), prepare: ({ value }) => JSON.stringify(value) }),
  new Col({ key: 'status', sec: 'setting', sch: () => z.enum(['draft', 'published', 'archived']), make: ({ s, col }) => s.string(col.k).notNullable().defaultTo('draft') }),
  new Col({ key: 'version', sec: 'setting', sch: () => z.number().int().positive(), make: ({ s, col }) => s.integer(col.k).notNullable().defaultTo(1) }),
  new Col({ key: 'submissionCount', sec: 'setting', sch: () => z.number().int().nonnegative(), make: ({ s, col }) => s.integer(col.k).notNullable().defaultTo(0) }),
  new Col({ key: 'lastSubmissionAt', sec: 'setting', sch: () => z.date().nullable(), make: ({ s, col }) => s.timestamp(col.k).nullable() }),
] as const

// Define types for different form field values
const FormFieldValue = z.union([
  z.string(),
  z.number(),
  z.boolean(),
  z.array(z.string()),
  z.array(z.number()),
  z.record(z.unknown()),
  z.null(),
])

// Define the schema for a single form field result
const FormFieldResult = z.object({
  key: z.string(),
  type: z.enum(['text', 'number', 'boolean', 'select', 'multiselect', 'date', 'file', 'custom']),
  label: z.string(),
  value: FormFieldValue,
  valid: z.boolean().optional(),
  error: z.string().optional(),
})

// Define the schema for the entire results array
const ResultsSchema = z.array(FormFieldResult)

export const formSubmissionCols = [
  new Col({ key: 'submissionId', sec: 'permanent', sch: () => z.string().min(1), make: ({ s, col, db }) => s.string(col.k).primary().defaultTo(db.raw(`object_id('submission')`)).index() }),
  new Col({ key: 'formId', sec: 'permanent', sch: () => z.string().min(1), make: ({ s, col }) => s.string(col.k).notNullable().index() }),
  new Col({ key: 'userId', sec: 'permanent', sch: () => z.string().nullable(), make: ({ s, col }) => s.string(col.k).nullable() }),
  new Col({ key: 'submittedAt', sec: 'permanent', sch: () => z.date(), make: ({ s, col, db }) => s.timestamp(col.k).defaultTo(db.fn.now()).notNullable() }),
  new Col({ key: 'ipAddress', sec: 'permanent', sch: () => z.string().ip().nullable(), make: ({ s, col }) => s.string(col.k).nullable() }),
  new Col({ key: 'results', sec: 'setting', sch: () => ResultsSchema, make: ({ s, col }) => s.jsonb(col.k).notNullable(), prepare: ({ value }) => JSON.stringify(value) }),
  new Col({ key: 'metadata', sec: 'setting', sch: () => z.record(z.unknown()), make: ({ s, col }) => s.jsonb(col.k).defaultTo({}), prepare: ({ value }) => JSON.stringify(value) }),
  new Col({ key: 'status', sec: 'setting', sch: () => z.enum(['pending', 'processed', 'error']), make: ({ s, col }) => s.string(col.k).notNullable().defaultTo('pending') }),
  new Col({ key: 'completedAt', sec: 'setting', sch: () => z.date().nullable(), make: ({ s, col }) => s.timestamp(col.k).nullable() }),
] as const

export const tables = [
  new FictionDbTable({ tableKey: t.form, timestamps: true, cols: formConfigCols }),
  new FictionDbTable({ tableKey: t.submission, timestamps: true, cols: formSubmissionCols }),
]
