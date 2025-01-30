# How to test locally

First build the new version:

`pnpm run build`

Then link it globally:

`pnpm link --global`

Make sure the link worked:

`pnpm list -g`

In a project install the global package by using `pnpm link --global vercel-allow-cors` import `vercel-allow-cors` and test with `vercel dev`

---

Update version on package.json - Commit changes

---

Publish to NPM

`npm publish`

---

Unlink the library globally

`pnpm uninstall -g vercel-allow-cors`

In a project install the global package by using `pnpm i vercel-allow-cors` import `vercel-allow-cors` and test with `vercel dev`
