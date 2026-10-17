import { createError, defineEventHandler, getMethod, getRequestURL, proxyRequest } from 'h3'

export default defineEventHandler((event) => {
  if (getMethod(event) !== 'GET') {
    throw createError({ statusCode: 405, statusMessage: 'Method Not Allowed' })
  }

  const config = useRuntimeConfig(event)
  const strapiBase = String(config.public.strapiBase).replace(/\/+$/, '')
  const query = getRequestURL(event).search

  return proxyRequest(event, `${strapiBase}/api/abdomen-stomaches${query}`)
})