import { router, publicProcedure, injectService } from '../../trpc/procedures.js';
import { UpdateService } from './update.service.js';

export const updateRouter = router({
  getState: publicProcedure
    .use(injectService<UpdateService>(UpdateService))
    .query(({ ctx }) => ctx.service.getState()),

  checkNow: publicProcedure.use(injectService<UpdateService>(UpdateService)).mutation(({ ctx }) => {
    // Fire-and-forget: server-side state transitions to 'checking' synchronously,
    // and the renderer's polling picks up subsequent transitions. Awaiting here
    // would block the mutation for the whole network round-trip.
    void ctx.service.checkNow();
  }),

  installNow: publicProcedure
    .use(injectService<UpdateService>(UpdateService))
    .mutation(({ ctx }) => {
      ctx.service.installNow();
    }),
});
