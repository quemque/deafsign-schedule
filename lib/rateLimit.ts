interface RateLimitOptions {
   interval: number
   uniqueTokenPerInterval: number
}

interface RateLimitResult {
   success: boolean
   limit: number
   remaining: number
   reset: number
}

export function rateLimit(options: RateLimitOptions) {
   const tokenCache = new Map<string, number[]>()

   return {
      check: (limit: number, token: string): RateLimitResult => {
         const now = Date.now()
         const windowStart = now - options.interval

         const tokens = tokenCache.get(token) || []
         const validTokens = tokens.filter(
            (timestamp) => timestamp > windowStart,
         )

         if (validTokens.length >= limit) {
            tokenCache.set(token, validTokens)
            return {
               success: false,
               limit,
               remaining: 0,
               reset: validTokens[0] + options.interval,
            }
         }

         validTokens.push(now)
         tokenCache.set(token, validTokens)

         if (tokenCache.size > options.uniqueTokenPerInterval) {
            const firstKey = tokenCache.keys().next().value
            if (firstKey) tokenCache.delete(firstKey)
         }

         return {
            success: true,
            limit,
            remaining: limit - validTokens.length,
            reset: now + options.interval,
         }
      },
   }
}
