## [1.1.4](https://github.com/adobe/helix-epsagon/compare/v1.1.3...v1.1.4) (2020-03-03)


### Bug Fixes

* **deps:** update external ([#20](https://github.com/adobe/helix-epsagon/issues/20)) ([f1e873c](https://github.com/adobe/helix-epsagon/commit/f1e873cd022a908e18d67df7fdf86f2e601a9a38))

## [1.1.3](https://github.com/adobe/helix-epsagon/compare/v1.1.2...v1.1.3) (2020-01-31)


### Bug Fixes

* **deps:** update epsagon to version 1.49.1 ([d7742d8](https://github.com/adobe/helix-epsagon/commit/d7742d896941a888f36988830a494582f6f21425))

## [1.1.2](https://github.com/adobe/helix-epsagon/compare/v1.1.1...v1.1.2) (2020-01-29)


### Bug Fixes

* **core:** use proper key filter ([a481b38](https://github.com/adobe/helix-epsagon/commit/a481b380e910f6fd304c8e4159e6f10dc6c83a10)), closes [#9](https://github.com/adobe/helix-epsagon/issues/9)
* **deps:** use epsagon 1.49.0 with support for sendTimeout ([d8dd6f5](https://github.com/adobe/helix-epsagon/commit/d8dd6f57d8e9341e47cb783456263df0a5d45b9d)), closes [#10](https://github.com/adobe/helix-epsagon/issues/10)

## [1.1.1](https://github.com/adobe/helix-epsagon/compare/v1.1.0...v1.1.1) (2020-01-26)


### Bug Fixes

* **deps:** update espagon@1.48.2 ([#5](https://github.com/adobe/helix-epsagon/issues/5)) ([dc38f97](https://github.com/adobe/helix-epsagon/commit/dc38f9722d3e80aeebd0eec77fde01d3bc708d46))

# [1.1.0](https://github.com/adobe/helix-epsagon/compare/v1.0.0...v1.1.0) (2020-01-24)


### Features

* **epsagon:** ignore status codes 4xx ([dac95af](https://github.com/adobe/helix-epsagon/commit/dac95af3edc1059ab69d2a5a84fea8b0e624f452)), closes [#2](https://github.com/adobe/helix-epsagon/issues/2)

# 1.0.0 (2020-01-23)


### Bug Fixes

* **core:** provide initial version ([#1](https://github.com/adobe/helix-epsagon/issues/1)) ([93b71f6](https://github.com/adobe/helix-epsagon/commit/93b71f66e2f3a8624f793c676c7331743aed1c19))

## [1.3.1](https://github.com/adobe/helix-library/compare/v1.3.0...v1.3.1) (2020-01-19)


### Bug Fixes

* **create:** ensure that dot files are included in npm released package ([#76](https://github.com/adobe/helix-library/issues/76)) ([a6a4944](https://github.com/adobe/helix-library/commit/a6a49441cec95bac8fa5cc8872e9fc2fba200a0b)), closes [#29](https://github.com/adobe/helix-library/issues/29)

# [1.3.0](https://github.com/adobe/helix-library/compare/v1.2.1...v1.3.0) (2019-11-21)


### Features

* **circleci:** use Contexts for Env var management ([28837b5](https://github.com/adobe/helix-library/commit/28837b50f470594dfa93554701b28528d6f6bf1b))

## [1.2.1](https://github.com/adobe/helix-library/compare/v1.2.0...v1.2.1) (2019-11-21)


### Bug Fixes

* **init:** add gitignore ([279fb38](https://github.com/adobe/helix-library/commit/279fb38042702868eb3c8c5a9a1765a903637b6b)), closes [#64](https://github.com/adobe/helix-library/issues/64)

# [1.2.0](https://github.com/adobe/helix-library/compare/v1.1.1...v1.2.0) (2019-11-21)


### Features

* **init:** make the list of questions extensible ([d94684f](https://github.com/adobe/helix-library/commit/d94684fddd5dc1874f991f795968a0928fcf5a88))

## [1.1.1](https://github.com/adobe/helix-library/compare/v1.1.0...v1.1.1) (2019-11-20)


### Bug Fixes

* **template:** remove old NPM option ([d2b1279](https://github.com/adobe/helix-library/commit/d2b1279f33abcae92010512d4abca1ca35161e2c))

# [1.1.0](https://github.com/adobe/helix-library/compare/v1.0.1...v1.1.0) (2019-11-20)


### Bug Fixes

* **init:** include test files in new repo ([d6e28c6](https://github.com/adobe/helix-library/commit/d6e28c637215e5332fce9cc6919e88b2d63f1b22)), closes [#63](https://github.com/adobe/helix-library/issues/63)


### Features

* **init:** expose init as an extensible function ([8544810](https://github.com/adobe/helix-library/commit/85448100e7f0f15979db900bb975b691906e86d7))

## [1.0.1](https://github.com/adobe/helix-library/compare/v1.0.0...v1.0.1) (2019-11-20)


### Bug Fixes

* **init:** include files from npmignore in templates ([e17618b](https://github.com/adobe/helix-library/commit/e17618b86f3efd38fc586a451b30a0b0e52d2792)), closes [#62](https://github.com/adobe/helix-library/issues/62)

# 1.0.0 (2019-11-20)


### Bug Fixes

* **package:** npm test script should provide information about failing tests ([#34](https://github.com/adobe/helix-library/issues/34)) ([be08076](https://github.com/adobe/helix-library/commit/be0807685dcb9e5367d8770651cbc5e37536abeb)), closes [#33](https://github.com/adobe/helix-library/issues/33)


### Features

* **init:** copy default files, patch package.json ([4c551d8](https://github.com/adobe/helix-library/commit/4c551d8c57affd28013d14f1473866a692ad5d2e))
* **init:** create initializer script for bootstrapping Helix library projects ([c879e4c](https://github.com/adobe/helix-library/commit/c879e4cd9c2a26cc33a139a3c47047aaa5184baa))
* **init:** enable patching of package-lock.json ([f5d35d3](https://github.com/adobe/helix-library/commit/f5d35d34379fd4e2486f5ba174990524f96762f3))
* **init:** enable patching README.md ([7ed14dc](https://github.com/adobe/helix-library/commit/7ed14dc87c7edc5d84864fee867aada02c66caf4))
* **init:** enable pushing new repo to github ([a4fe5ad](https://github.com/adobe/helix-library/commit/a4fe5ad20bcd77e2719aba3d5f2fea832fee5192))
* **init:** separate between npm and github org ([c728193](https://github.com/adobe/helix-library/commit/c72819310798c0be1bab4f606d650554de566518))
* **init:** turn init into a proper executable ([5ec8d64](https://github.com/adobe/helix-library/commit/5ec8d64df28ef6fb6e7c0a390cfc697d8cf8a9a5))