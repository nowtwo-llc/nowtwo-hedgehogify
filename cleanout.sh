mv ./umd/main.*.css ./umd/HedgeHogify.css
mv ./umd/main.*.css.map ./umd/HedgeHogify.css.map
rm -rf ./umd/main**
mv ./umd/** ./dist
rm -rf umd

cp ./dist/HedgeHogify.d.ts ./example/dist/HedgeHogify.d.ts
cp ./dist/HedgeHogify.js ./example/dist/HedgeHogify.js
cp ./dist/HedgeHogify.js.map ./example/dist/HedgeHogify.js.map