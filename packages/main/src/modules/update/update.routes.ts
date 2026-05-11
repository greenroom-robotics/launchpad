import { router, publicProcedure, injectService } from '../../trpc/procedures.js';
import { UpdateService } from './update.service.js';

export const updateRouter = router({
  getState: publicProcedure
    .use(injectService<UpdateService>(UpdateService))
    .query(({ ctx }) => ctx.service.getState()),

  checkNow: publicProcedure
    .use(injectService<UpdateService>(UpdateService))
    .mutation(async ({ ctx }) => {
      await ctx.service.checkNow();
    }),

  installNow: publicProcedure
    .use(injectService<UpdateService>(UpdateService))
    .mutation(({ ctx }) => {
      ctx.service.installNow();
    }),
});
