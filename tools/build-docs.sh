
pushd packages/docs \
  && pnpm build \
  && popd \
  && rimraf docs \
  && mv packages/docs/dist docs
