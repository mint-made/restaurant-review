#!/usr/bin/env sh

# Build the project to the /dist/ folder
npm run build
# copy the assets into the dist folder
cp -r src/assets/ ./dist/

# add commit and push the dsitribution files to the gh-pages branch of the project 
# to deploy the newly built files to Github Pages
cd dist
git init
git add .
git commit -m "deploy"
git push -f https://github.com/mint-made/restaurant-review.git master:gh-pages
cd -