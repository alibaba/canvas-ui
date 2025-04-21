#/bin/sh

pnpm build

pnpm lerna version --force-publish

pushd packages/core
npm publish
popd
pushd packages/react
npm publish
popd
pushd packages/assert
npm publish
popd
