import { z } from 'zod';
import { router, publicProcedure, injectService } from '../../trpc/procedures.js';
import { UpdateService } from './update.service.js';

export const updateRouter = router({
  getState: publicProcedure
    .use(injectService<UpdateService>(UpdateService))
    .query(({ ctx }) => ctx.service.getState()),

  getAutoCheck: publicProcedure
    .use(injectService<UpdateService>(UpdateService))
    .query(({ ctx }) => ctx.service.getAutoCheck()),

  // Object input on purpose: electron-trpc-experimental 1.0.0-alpha.1 drops a
  // bare falsy input (false, 0, '') to undefined before validation, so a plain
  // z.boolean() could never be set to false.
  setAutoCheck: publicProcedure
    .input(z.object({ enabled: z.boolean() }))
    .use(injectService<UpdateService>(UpdateService))
    .mutation(({ ctx, input }) => {
      ctx.service.setAutoCheck(input.enabled);
    }),

  checkNow: publicProcedure.use(injectService<UpdateService>(UpdateService)).mutation(({ ctx }) => {
    // Fire-and-forget: server-side state transitions to 'checking' synchronously,
    // and the renderer's polling picks up subsequent transitions. Awaiting here
    // would block the mutation for the whole network round-trip.
    void ctx.service.checkNow();
  }),

  downloadNow: publicProcedure
    .use(injectService<UpdateService>(UpdateService))
    .mutation(({ ctx }) => {
      // Fire-and-forget for the same reason as checkNow.
      void ctx.service.downloadNow();
    }),

  cancelDownload: publicProcedure
    .use(injectService<UpdateService>(UpdateService))
    .mutation(({ ctx }) => {
      ctx.service.cancelDownload();
    }),

  installNow: publicProcedure
    .use(injectService<UpdateService>(UpdateService))
    .mutation(({ ctx }) => {
      ctx.service.installNow();
    }),
});
