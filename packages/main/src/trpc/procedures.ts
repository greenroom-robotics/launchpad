import { initTRPC } from '@trpc/server';
import { container } from 'tsyringe';

const t = initTRPC.create();

export const router = t.router;
export const middleware = t.middleware;
export const publicProcedure = t.procedure;

// Procedure inputs must be objects, never bare primitives. The IPC transport
// (electron-trpc-experimental 1.0.0-alpha.1) treats a falsy input (false, 0,
// '') as "no input" and delivers undefined, so a `.input(z.boolean())` can
// never be called with false. Wrap it: `.input(z.object({ enabled: z.boolean() }))`.

// Middleware to resolve services from TSyringe container
// eslint-disable-next-line @typescript-eslint/no-explicit-any
export const injectService = <T>(serviceToken: any) => {
  return middleware(async ({ next, ctx }) => {
    const service = container.resolve<T>(serviceToken);
    return next({
      ctx: {
        ...ctx,
        service,
      },
    });
  });
};
