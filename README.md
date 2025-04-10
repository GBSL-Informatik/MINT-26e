# Website

[![Netlify Status](https://api.netlify.com/api/v1/badges/c12c90fd-3361-4d73-a8bc-bd6ea1753a3a/deploy-status)](https://app.netlify.com/sites/mint-26e/deploys)

This website is built using [Docusaurus](https://docusaurus.io/), a modern static website generator.

> \[!NOTE]
> Compatible with @docusaurus/faster (rspack and swc).

## ENV

| Variable                   | For         | Default                 | Example             | Description                                                                                                                                                        |
| :------------------------- | :---------- | :---------------------- | :------------------ | :----------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| APP\_URL                   | Production  | `http://localhost:3000` |                     | Domain of the hosted app                                                                                                                                           |
| BACKEND\_URL               | Production  | `http://localhost:3002` |                     | Url of the API Endpoint                                                                                                                                            |
| CLIENT\_ID                 | Production  |                         |                     | Azure ID: Client ID                                                                                                                                                |
| TENANT\_ID                 | Production  |                         |                     | Azure AD: Tenant Id                                                                                                                                                |
| API\_URI                   | Production  |                         |                     | Azure AD: API Url                                                                                                                                                  |
| STUDENT\_USERNAME\_PATTERN | Production  |                         | `@edu`              | Users with usernames matching this RegExp pattern are displayed as students (regardless of admin status). If unset, all non-admin users are displayed as students. |
| TEST\_USERNAME             | Development |                         | `admin.bar@bazz.ch` | To log in offline. Must correspond to a user email found in the API's database.\*                                                                                  |

\* To change users, clear LocalStorage to delete the API key created upon first authentication.<br />

## Upgrade Docusaurus

To upgrade docusaurus, run:

```bash
yarn upgrade @docusaurus/core@latest @docusaurus/faster@latest @docusaurus/preset-classic@latest @docusaurus/theme-classic@latest @docusaurus/theme-common@latest @docusaurus/module-type-aliases@latest @docusaurus/plugin-rsdoctor@latest @docusaurus/tsconfig@latest @docusaurus/types@latest
```