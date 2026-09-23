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

  setAutoCheck: publicProcedure
    .input(z.boolean())
    .use(injectService<UpdateService>(UpdateService))
    .mutation(({ ctx, input }) => {
      ctx.service.setAutoCheck(input);
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
