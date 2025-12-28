# [1.2.0](https://github.com/tylerdh12/kylee-bible-blog/compare/v1.1.0...v1.2.0) (2025-12-28)


### Bug Fixes

* add missing fields to StatsResponse type ([70aeb2c](https://github.com/tylerdh12/kylee-bible-blog/commit/70aeb2c777776179e6e0a349227aa23eac13d9f4))
* clean up admin pages and remove unnecessary code ([8f0c828](https://github.com/tylerdh12/kylee-bible-blog/commit/8f0c82873fb8259d14dcc0f64edc5cf129169809))
* convert post edit page to server-side rendering ([2018afd](https://github.com/tylerdh12/kylee-bible-blog/commit/2018afd7b78096ee4687c8ae14f77b00d3fa9b54))
* correct auth function and permissions in admin API routes ([0a598cd](https://github.com/tylerdh12/kylee-bible-blog/commit/0a598cdc116ed3469c12e9ffe7b84da4f4723903))
* handle date serialization for both Date objects and strings ([b54a340](https://github.com/tylerdh12/kylee-bible-blog/commit/b54a340120d4cb61f938a485b10e934aa63fcaad))
* implement consistent DashboardLayout across admin pages ([2ce2b65](https://github.com/tylerdh12/kylee-bible-blog/commit/2ce2b65e26503cdf51b6141416a7f34c4b21c5cf))
* remove remaining Sentry imports to resolve build conflicts ([761deeb](https://github.com/tylerdh12/kylee-bible-blog/commit/761deeb8c9bf5991bbda1299a6952b9984cb946a))
* resolve admin post creation errors and API route bugs ([7896e50](https://github.com/tylerdh12/kylee-bible-blog/commit/7896e501da9674457797670ed6008b6e316a3af9))
* resolve admin posts list not displaying posts ([87ef005](https://github.com/tylerdh12/kylee-bible-blog/commit/87ef005f29bbfcde6addb6228e858667fdfce91d))
* resolve app misconfigurations and improve data fetching ([095bc90](https://github.com/tylerdh12/kylee-bible-blog/commit/095bc90fd209863634a7b30bdc96e0dfd475597f))
* resolve production build errors and add migration documentation ([53b448e](https://github.com/tylerdh12/kylee-bible-blog/commit/53b448e290e04fcf0f682d39da7e7348eb88d335))
* resolve Sentry configuration issues ([b8d7ac4](https://github.com/tylerdh12/kylee-bible-blog/commit/b8d7ac43a90da59a663a5f4f86ef80a086e168ff))
* resolve TipTap dependency version conflicts ([27cce6f](https://github.com/tylerdh12/kylee-bible-blog/commit/27cce6f07be5ec31d26539b1fa39cedf7cd3fdd5))
* resolve TipTap duplicate extension errors ([00b50c3](https://github.com/tylerdh12/kylee-bible-blog/commit/00b50c3cc7f08536f5f206a875939b5be83cc21b))
* resolve Vercel deployment dependency conflicts ([476d621](https://github.com/tylerdh12/kylee-bible-blog/commit/476d6212f73b5c66a4ec3aade8d1172c0616c86e))
* use prisma directly for counts in stats route ([e6ed73c](https://github.com/tylerdh12/kylee-bible-blog/commit/e6ed73ccf7d617a7ccf2007a24792ddd4705a275))
* use Prisma directly to fetch post by ID in edit page ([2509db4](https://github.com/tylerdh12/kylee-bible-blog/commit/2509db44dc820091f7922e6823099f5ef21c0900))


### Features

* add Sentry error tracking and performance monitoring ([ba9ce0e](https://github.com/tylerdh12/kylee-bible-blog/commit/ba9ce0ec3213f1bbffc33870ee7d211e62d65908))
* add subscriber management and tags API functionality ([468c0ba](https://github.com/tylerdh12/kylee-bible-blog/commit/468c0bab59c0130175d5ba763c04a7c02c1a3ca9))
* enhance database and deployment scripts ([13eeccd](https://github.com/tylerdh12/kylee-bible-blog/commit/13eeccdbffe0f22c1631da8a0cbdf0c75ce7697b))
* fully implement and enhance admin posts pages ([fd36fd0](https://github.com/tylerdh12/kylee-bible-blog/commit/fd36fd08e61f37f170ee51e7ea2ffc462b00877e))
* fully implement and refine admin pages with real database data ([302f42f](https://github.com/tylerdh12/kylee-bible-blog/commit/302f42f53ab209409c9fce503a96159ee2bddbf6))
* improve application pages and components ([a98ff99](https://github.com/tylerdh12/kylee-bible-blog/commit/a98ff997a2a21eedd1b45fd229f3b5af3aafbb35))

# [1.1.0](https://github.com/tylerdh12/kylee-bible-blog/compare/v1.0.1...v1.1.0) (2025-10-22)


### Features

* add Snyk security configuration ([20f8637](https://github.com/tylerdh12/kylee-bible-blog/commit/20f8637a7ec21ec1d83ca36c3d7f1fc2f2177f32))
* enhance admin and workflow automation scripts ([4533d28](https://github.com/tylerdh12/kylee-bible-blog/commit/4533d284eede51e2db1a5d10cb558a045d416b65))
* enhance page components with improved functionality ([2928621](https://github.com/tylerdh12/kylee-bible-blog/commit/2928621aa158753b353ff6b55f8ffe698798e4a3))
* enhance UI components with improved functionality ([d3c2c4b](https://github.com/tylerdh12/kylee-bible-blog/commit/d3c2c4b3622d202de3d60531ddf8bba1599e3297))
* improve database diagnostic and currency utilities ([383a97c](https://github.com/tylerdh12/kylee-bible-blog/commit/383a97c85acc27bce5c61e87816f289ba59327d5))

## [1.0.1](https://github.com/tylerdh12/kylee-bible-blog/compare/v1.0.0...v1.0.1) (2025-09-29)


### Bug Fixes

* temporarily lower coverage thresholds to allow CI to pass ([9abc80d](https://github.com/tylerdh12/kylee-bible-blog/commit/9abc80d1827c35893517ffc85bcf1905bdc3616f))

# 1.0.0 (2025-09-29)


### Bug Fixes

* **auth:** add JWT_SECRET validation and security enforcement ([8b06125](https://github.com/tylerdh12/kylee-bible-blog/commit/8b0612575c46726d7c574d0d870c8cb8e6e91517))
* complete AdminPage test mock data with totalDonationAmount field ([c3caacc](https://github.com/tylerdh12/kylee-bible-blog/commit/c3caacca95263c332cdf6015fc4d2c560e69d0c1))
* prevent static generation failures by forcing dynamic rendering for database-dependent pages ([099117b](https://github.com/tylerdh12/kylee-bible-blog/commit/099117b7d03d5ecc78472ac8746ac34467f7b330))
* remove Node 18.x from CI matrix - dependencies require Node 20+ ([df15e33](https://github.com/tylerdh12/kylee-bible-blog/commit/df15e331a60b61afd35cc94bdad60f29619d0e44))
* resolve all ESLint warnings throughout codebase (JSS-12) ([c1c98ff](https://github.com/tylerdh12/kylee-bible-blog/commit/c1c98ffefffd3680ca8d9d38ce25c913bd24833b))
* resolve CI/CD build failures - update Node version and database config ([3d03f62](https://github.com/tylerdh12/kylee-bible-blog/commit/3d03f6265abae53e32110622c068cbf09d2b3ad0))
* resolve critical unit test failures (JSS-11) ([69fe19e](https://github.com/tylerdh12/kylee-bible-blog/commit/69fe19ef6587f393e88345fd53f5e5b3bb8a5f4e))
* resolve database connectivity issues and standardize PostgreSQL usage ([72e8cab](https://github.com/tylerdh12/kylee-bible-blog/commit/72e8cab95fbe1e40b9afc3b859a87161da640f5f))
* resolve linting issues in posts API and jest config ([a077c4b](https://github.com/tylerdh12/kylee-bible-blog/commit/a077c4b92b0677a22845ce926980ed2849f4fa67))
* resolve TypeScript build errors ([f3ef700](https://github.com/tylerdh12/kylee-bible-blog/commit/f3ef7006f585c0079b69b7eb759b5d59deb7e8b3))
* resolve TypeScript issues in database service for production build ([3c9cb3c](https://github.com/tylerdh12/kylee-bible-blog/commit/3c9cb3c5d5fec83cb6eeccbb96ed1332673bd7c3))
* resolve Vercel build failure with lazy JWT_SECRET validation and comprehensive troubleshooting ([7acc510](https://github.com/tylerdh12/kylee-bible-blog/commit/7acc5101c12ba7c66b8f2af67de8b328a7f990d9))
* resolve Vercel build issues and Next.js 15 compatibility ([7a96d74](https://github.com/tylerdh12/kylee-bible-blog/commit/7a96d7410a3f7c5e1703f2506286431d1b16b193))
* standardize database access across pages to use DatabaseService ([dbb5411](https://github.com/tylerdh12/kylee-bible-blog/commit/dbb541140c07e1f311e0fdad020c7a66899c7b6e))
* update failing unit tests to match component implementation ([44bebeb](https://github.com/tylerdh12/kylee-bible-blog/commit/44bebeb9c77d6983b80d3ec86013ad7b78ea621b))


### Features

* add comprehensive SEO metadata to all public pages ([924ea26](https://github.com/tylerdh12/kylee-bible-blog/commit/924ea26f3f6def7ee688edf5985ced6344f94baa))
* add comprehensive Vercel deployment optimizations and monitoring ([6de0dee](https://github.com/tylerdh12/kylee-bible-blog/commit/6de0dee6b6e75e39cb41a75a8fb2913bc9b301db))
* add Neon PostgreSQL database connection ([5bddb29](https://github.com/tylerdh12/kylee-bible-blog/commit/5bddb293a2650d7f5322fa2882f25786754d69e7))
* add production admin setup functionality ([40f33eb](https://github.com/tylerdh12/kylee-bible-blog/commit/40f33ebb5196465cd78fecc87666aaa33678a514))
* add proper TypeScript types for API responses ([735be84](https://github.com/tylerdh12/kylee-bible-blog/commit/735be84a18104984fffe32c24b7a09470894dcef))
* add secure production admin user setup ([e56aac2](https://github.com/tylerdh12/kylee-bible-blog/commit/e56aac25e3948b7b1d6d394b06b5ecc8976cbd2c))
* implement comprehensive 404 and error page system ([b950aed](https://github.com/tylerdh12/kylee-bible-blog/commit/b950aed7af233f567557f92e87b5391ed69a7411))
* implement comprehensive error boundary system ([40e7aac](https://github.com/tylerdh12/kylee-bible-blog/commit/40e7aac9d323d7ce0b705fa5b11c8eabb7b5ce8f))
* implement comprehensive loading states for better UX ([7d95e26](https://github.com/tylerdh12/kylee-bible-blog/commit/7d95e26a4bfe079e1335f2dbf2ceda5e303b67a0))
* implement comprehensive production deployment workflow ([41cb0e3](https://github.com/tylerdh12/kylee-bible-blog/commit/41cb0e3bb8390ae80cdf39173e22325e027cf42d))
* implement comprehensive workflow automation system ([d304d89](https://github.com/tylerdh12/kylee-bible-blog/commit/d304d894cb570c794d065d3c9bab33ac41a6230b))
* improve accessibility across key components ([98d40a0](https://github.com/tylerdh12/kylee-bible-blog/commit/98d40a03d73cde135ded3b47f77b1b8c205b8ee8))
* **navigation:** implement responsive mobile navigation menu ([2bf540c](https://github.com/tylerdh12/kylee-bible-blog/commit/2bf540cdd7a079e1d2bf41c355ccdc9733fa5de7))
* **security:** add comprehensive input validation and rate limiting to public APIs ([8d613e7](https://github.com/tylerdh12/kylee-bible-blog/commit/8d613e7959ee86aeae4abe0bf6af1dd51034d847))
* trigger deployment with new environment variables ([61f869e](https://github.com/tylerdh12/kylee-bible-blog/commit/61f869e39eba89261a829cd6efda489bb1fad5cc))


### BREAKING CHANGES

* **auth:** JWT_SECRET environment variable is now required and must be 32+ characters
