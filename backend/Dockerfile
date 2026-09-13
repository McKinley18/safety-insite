FROM node:20-alpine AS build

WORKDIR /app

COPY package*.json ./
RUN npm install

COPY . .

# Use the Render-specific TypeScript build path so Node/V8 memory is bounded.
RUN npm run build:render


FROM node:20-alpine AS runtime

WORKDIR /app
ENV NODE_ENV=production
ENV NODE_OPTIONS=--max-old-space-size=512

# §268 — STAMP THE RELEASE COMMIT INTO THE IMAGE.
#
# `getBuildMetadata()` prefers a pipeline-supplied commit and falls back to the checked-in
# `src/build-info.ts` literal, which is NOT stamped by any build step and currently names a commit
# from months ago. Falling back to it means /health/version answers confidently and wrongly, and
# `release:verify-sha` refuses such an answer rather than matching against it.
#
# Render sets RENDER_GIT_COMMIT itself, which `getBuildMetadata()` reads first, so this ARG is for
# every other way the image gets built — a local `docker build`, CI, or a registry push:
#   docker build --build-arg GIT_COMMIT=$(git rev-parse HEAD) .
ARG GIT_COMMIT=""
ENV GIT_COMMIT=$GIT_COMMIT

COPY package*.json ./
RUN npm install --omit=dev

COPY --from=build /app/dist ./dist
COPY --from=build /app/scripts ./scripts
COPY --from=build /app/src/safescope-v2/knowledge-intake/records/approved ./src/safescope-v2/knowledge-intake/records/approved
COPY --from=build /app/src/safescope-v2/hazard-taxonomy-coverage ./src/safescope-v2/hazard-taxonomy-coverage
COPY --from=build /app/src/safescope-v2/site-policy-isolation ./src/safescope-v2/site-policy-isolation
COPY --from=build /app/src/safescope-v2/scenario-expansion ./src/safescope-v2/scenario-expansion

EXPOSE 4000

# §268 — THE CMD DOES NOT MIGRATE, AND THAT IS DELIBERATE.
#
# The deployment order is MIGRATE -> VERIFY SCHEMA -> ACTIVATE, with the migration run as an
# explicit release step (`npm run migrate:prod`) BEFORE this container serves traffic. Explicit
# execution is preferred over implicit boot-time migration because a failure is then visible,
# separately auditable, and cannot be mistaken for a slow start. `migrationsRun` stays false.
#
# `npm run start:release` chains migrate-then-start with `&&` for platforms that offer no pre-deploy
# hook. It is NOT the default: on a multi-instance service every replica would race to migrate.
# Where it is used, the shell's `&&` is what guarantees a failed migration never reaches startup.
#
# The process still refuses to serve traffic against a schema it does not match — /health/ready
# fails closed on missing migrations — so an operator who skips the release step gets an instance
# that never becomes ready rather than one that silently serves broken reads.
CMD ["npm", "run", "start:render"]
