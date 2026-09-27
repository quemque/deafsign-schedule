export const queryKeys = {
   auth: {
      all: ['auth'] as const,
      me: () => [...queryKeys.auth.all, 'me'] as const,
   },
   schedule: {
      all: ['schedule'] as const,
      list: (params?: { startDate?: string; endDate?: string }) =>
         [...queryKeys.schedule.all, 'list', params] as const,
      detail: (id: string) =>
         [...queryKeys.schedule.all, 'detail', id] as const,
   },
   users: {
      all: ['users'] as const,
      list: () => [...queryKeys.users.all, 'list'] as const,
   },
} as const
