
pushd packages/docs \
  && pnpm build \
  && popd \
  && rimraf docs \
  && mv packages/docs/build docs
