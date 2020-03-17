# Leaonline Teacher Application

This is the code repository for the lea.online teacher dashboard application.

![built with Meteor](https://img.shields.io/badge/Meteor-1.9.2-%23595dff?logo=meteor&logoColor=white&link=https://meteor.com)
[![Project Status: Active – The project has reached a stable, usable state and is being actively developed.](https://www.repostatus.org/badges/latest/active.svg)](https://www.repostatus.org/#active)
[![JavaScript Style Guide](https://img.shields.io/badge/code_style-standard-brightgreen.svg)](https://standardjs.com)
![GitHub](https://img.shields.io/github/license/leaonline/leaonline-teacher)

Tests master:

![Test suite](https://github.com/leaonline/leaonline-teacher/workflows/Test%20suite/badge.svg)

Tests develop:

![Test suite](https://github.com/leaonline/leaonline-teacher/workflows/Test%20suite/badge.svg?branch=develop)

## Install and run

We use Meteor for our application to fetch and display data in near realtime.
To install Meteor run the install script:

```bash
curl https://install.meteor.com/ | sh
```

Please note, that Windows is supported by Meteor but not officially supported by this repo.
If you get everything running on Windows (dev, tests, build / deployment) feel free to update
the documentation accordingly for Windows users.

In order to get the code and run the app you simply need to clone this repo and run the `./run.sh` script:

```bash
git clone git@github.com:leaonline/leaonline-teacher.git
cd ./leaonline-teacher
./run.sh
```

and then open your browser on `localhost:5555` to load the client app.

## Development and contribution to this project

Every contribution is appreciated and we treat every issue and pull request with care.
Please note, that we follow a certain workflow for contributions.

### Contribution workflow

1. **Create issue**

   There should always be an issue, describing a bug or a feature request before contributing code.
   Pull requests without issues will be on stale until an issue is created and passed step 2.
   Issues that have did not went through step 2 will get the `needs approval` label.

2. **Issue approved / rejected**

   The core team will discuss the issue and approves or rejects it. Approved issues get the `pr welcome` label assigned
   and will also contain a comment of approval / denial to inform all issue members.

3. **Open pull request**

   You should always create a pull request to the `develop` branch, unless there is a strong reason to merge
   into another specific branch. Note that `master` is disabled for non-core members.

   It is possible to reference multiple issues with a single PR as long as it's made clear, which issues
   are solved by which parts of the PR. Try to avoid to solve multiple issues with a single commit.

   Pull request that have merge conflicts, failed the linter, failed the tests or miss tests for new features / bigger
   changes will not get into review phase. They will also be tagged with the `fixes required` label.

   Work-in-progress pull requests are encouraged and you should tag them with the `work in progress` label
   to show others that this PR is still incomplete.

4. **Review**

   There will be always two reviewers for a PR, one from a code perspective and one from a UI/UX
   perspective. If any of the reviewers reject the PR there will be also the `fixes required` label assigned.
   On approve the PR is ready for being merged.

5. **Merge**

   The PR is merged into the `develop` branch and the issue is closed. The core team will usually
   increase the version of the project in a separate commit.

### Folder Structure

The folder structure follows the
[recommended structure from the Meteor guide](https://guide.meteor.com/structure.html#javascript-structure).
If you are not familiar with it, please consult the Meteor guide, first.

<!-- auto-generated notes tree starts here -->

- [**client**](client)
- [**imports**](imports)
  - [**api**](imports/api)
    - [**blazebootstrap**](imports/api/blazebootstrap)
    - [**i18n**](imports/api/i18n)
    - [**routing**](imports/api/routing)
    - [**utils**](imports/api/utils)
  - [**startup**](imports/startup)
    - [**client**](imports/startup/client)
      - [**scss**](imports/startup/client/scss) - custom styles / theme
    - [**server**](imports/startup/server)
  - [**ui**](imports/ui)
    - [**components**](imports/ui/components)
      - [**icon**](imports/ui/components/icon)
      - [**loading**](imports/ui/components/loading)
      - [**onloaded**](imports/ui/components/onloaded)
    - [**pages**](imports/ui/pages)
      - [**notfound**](imports/ui/pages/notfound)
    - [**utils**](imports/ui/utils)
- [**resources**](resources) - Static resources
  - [**i18n**](resources/i18n) - Translation files
- [**server**](server)
- [**tests**](tests) - Top-level of the test suite. ALl tests file are in here

<!-- auto-generated notes tree ends here -->

#### Updating and documenting the folder structure

In order to build / update the folder structure please edit the respective `README.md` file in the folder
you want to describe. The description is wrapped inside comments to indicate that this part is printed to the tree.

Example:

```markdown
# foldername

This will not be printed but still be part of the README.

<!-- optional markdown-notes-tree directory description starts here -->

This will be printed as description next to the folder name

<!-- optional markdown-notes-tree directory description ends here -->

This will not be printed but still be part of the README.
```

And run the respective build script `npm run build:folder-tree`. After that, please validate the markdown using 
the `lint:markdown` script.

### UI Components

We use [Meteor Blaze Bootstrap](https://github.com/jankapunkt/meteor-blaze-bs4) as UI components library.
Please read it's documentation, if you are interested to contribute to the UI part.

### Styleguide

This project uses several style rules, enforced by different linters. The following table shows the styles and their
respective tools and commands (scripts, see [package.json](./package.json)):

|Category|Style|Tool|Command|
|--------|-----|----|-------|
|JS|[Javascript standard style](https://standardjs.com/)|`standard`|`lint:code`|
|SCSS|[Sass Guidelines](https://sass-guidelin.es/)|`stylelint`|`lint:style`|
|Markdown|[Markdown lint](https://github.com/DavidAnson/markdownlint)|`markdownlint`|`lint:markdown`|

Make sure to run all linters without error, before you open a pull request.  There is a `lint.sh` shellscript added 
for your convenience. It basically executes these commands in a row.

## Deployment

We use [`mup` (Meteor-Up)](http://meteor-up.com/) as one-step deployment tool.
While deployment to the official lea.online platform is restricted to the lea core developers,
you still might want to deploy a custom build. In this case you should follow the documentation
on their website. It's super easy.

## License

APGL 3, see [LICENSE FILE](./LICENSE)
