# Leaonline Teacher Application

This is the code repository for the lea.online teacher dashboard application.


## Install and run

We use Meteor for our application to fetch and display data in near realtime.
To install Meteor run the install script:

```bash
$ curl https://install.meteor.com/ | sh
```

Please note, that Windows is supported by Meteor but not officially supported by this repo.
If you get everything running on Windows (dev, tests, build / deployment) feel free to update
the documentation accordingly for Windows users.

In order to get the code and run the app you simply need to clone this repo and run the `./run.sh` script:

```bash
$ git clone git@github.com:leaonline/leaonline-teacher.git
$ cd ./leaonline-teacher
$ ./run.sh
```

and then open your browser on `localhost:5555` to load the client app.

## Development and contribution to this project

Every contribution is appreciated and we treat every issue and pull request with care.
Please note, that we follow a certain workflow for contributions.

### Folder Structure

The folder structure follows the [recommended structure from the Meteor guide](https://guide.meteor.com/structure.html#javascript-structure).
If you are not familiar with it, please consult the Meteor guide, first.

<!-- auto-generated notes tree starts here -->

- [**client**](client) - This is the main entry point for the client code. Imports, starting from here will be added
to the client bundle.
- [**imports**](imports)
    - [**routing**](imports/routing) - Contains all relevant tools for client-side routing
    - [**startup**](imports/startup) - Files loaded very first at application start
        - [**client**](imports/startup/client) - Files loaded at very first on client app start
    - [**ui**](imports/ui) - Client-only UI system
        - [**pages**](imports/ui/pages) - Contains all templates, that represent a specific page (targeted via 1..n routes)
            - [**notfound**](imports/ui/pages/notfound) - Loaded by the Router when no route was found by given url
- [**resources**](resources) - Static resources
    - [**i18n**](resources/i18n) - Translation files
- [**server**](server) - This is the main entry point for the server code. Imports, starting from here will be added
to the server bundle.
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

And run the respective build script `npm run build:folder-tree`.

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
   
   Pull request that have merge conflicts, failed the linter, failed the tests or miss tests for new features / bigger changes will
   not get into review phase. They will also be tagged with the `fixes required` label.
   
   Work-in-progress pull requests are encouraged and you should tag them with the `work in progress` label
   to show others that this PR is still incomplete. 

4. **Review**

   There will be always two reviewers for a PR, one from a code perspective and one from a UI/UX 
   perspective. If any of the reviewers reject the PR there will be also the `fixes required` label assigned.
   On approve the PR is ready for being merged.
   
5. **Merge**

   The PR is merged into the `develop` branch and the issue is closed. The core team will usually
   increase the version of the project in a separate commit.
   



## Deployment

We use [`mup` (Meteor-Up)](http://meteor-up.com/) as one-step deployment tool.
While deployment to the official lea.online platform is restricted to the lea core developers,
you still might want to deploy a custom build. In this case you should follow the documentation
on their website. It's super easy.   


## License

APGL 3, see [LICENSE FILE](./LICENSE)

