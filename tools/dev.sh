#/bin/sh

yarn distclean \
 && yarn lerna run build --no-private --stream \
 && yarn lerna run dev --no-private --parallel
