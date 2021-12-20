#/bin/sh

yarn distclean \
 && yarn lerna run build --no-private --stream \
 && NODE_OPTIONS=--max_old_space_size=4096 rollup -c
