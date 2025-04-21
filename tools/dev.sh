#/bin/sh

pnpm distclean \
 && pnpm --filter "@canvas-ui/*" run --stream build \
 && pnpm --filter "@canvas-ui/*" run --parallel dev
