/**
 * Input sanitization utilities.
 *
 * All user-supplied text must pass through one of these functions before being
 * stored in the database or rendered. This prevents:
 *   - XSS: HTML/JS tags stripped from all text fields.
 *   - SQL injection: Prisma uses parameterized queries exclusively (see note).
 *
 * ─── SQL Injection Audit ─────────────────────────────────────────────────────
 * This project uses Prisma ORM. Prisma uses parameterized queries for all
 * auto-generated model operations (create, update, findMany, etc.).
 *
 * For raw queries, ONLY the safe tagged-template form is permitted:
 *   ✓  prisma.$queryRaw`SELECT … WHERE id = ${id}`
 *   ✗  prisma.$queryRawUnsafe(`SELECT … WHERE id = '${id}'`)  — NEVER use this
 *
 * No raw queries using string interpolation are present in this codebase.
 * All dynamic values flow through Prisma's parameterized API.
 * ─────────────────────────────────────────────────────────────────────────────
 */

import xss, { type IFilterXSSOptions } from "xss";

/** Options that strip ALL HTML — only plain text allowed. */
const PLAIN_TEXT_OPTIONS: IFilterXSSOptions = {
  whiteList: {},
  stripIgnoreTag: true,
  stripIgnoreTagBody: ["script", "style", "iframe", "object", "embed"],
};

/**
 * Sanitize any plain-text field (names, addresses, bio, etc.).
 * Strips all HTML tags and trims whitespace.
 */
export function sanitizeText(raw: string): string {
  return xss(raw.trim(), PLAIN_TEXT_OPTIONS);
}

/**
 * Sanitize a job description.
 * Strips all HTML/JS — we store and display plain text only.
 */
export function sanitizeDescription(raw: string): string {
  return sanitizeText(raw);
}

/**
 * Sanitize a street/location address.
 */
export function sanitizeAddress(raw: string): string {
  return sanitizeText(raw);
}
