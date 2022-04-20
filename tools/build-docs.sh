
pushd packages/docs \
  && yarn build \
  && popd \
  && rimraf docs \
  && mv packages/docs/dist docs
