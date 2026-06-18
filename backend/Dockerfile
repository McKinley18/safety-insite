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

COPY package*.json ./
RUN npm install --omit=dev

COPY --from=build /app/dist ./dist
COPY --from=build /app/scripts ./scripts
COPY --from=build /app/src/safescope-v2/knowledge-intake/records/approved ./src/safescope-v2/knowledge-intake/records/approved
COPY --from=build /app/src/safescope-v2/hazard-taxonomy-coverage ./src/safescope-v2/hazard-taxonomy-coverage
COPY --from=build /app/src/safescope-v2/site-policy-isolation ./src/safescope-v2/site-policy-isolation
COPY --from=build /app/src/safescope-v2/scenario-expansion ./src/safescope-v2/scenario-expansion

EXPOSE 4000

CMD ["npm", "run", "start:render"]
