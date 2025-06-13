#/bin/sh

pnpm distclean \
 && pnpm --filter "@canvas-ui/*" --filter "!@canvas-ui/docs" run --stream build \
 && pnpm --filter "@canvas-ui/*" --filter "!@canvas-ui/docs" run --parallel dev
