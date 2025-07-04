#/bin/sh

pnpm distclean \
 && pnpm --filter "@canvas-ui/*" --filter "!@canvas-ui/docs" run --stream build \
 && NODE_OPTIONS=--max_old_space_size=4096 rollup -c