# Jira Location Tracker

This is a custom field for jira to track location

## Requirements

See [Set up Forge](https://developer.atlassian.com/platform/forge/set-up-forge/) for instructions to get set up.

## Configuration file
Google Map API key is required to run this app
- Copy `/static/map-viewer/.env.example` to `/static/map-viewer/.env` and fill GMAP API KEY
- Copy `config.js.example` to `config.js` and fill GMAP API KEY

## Quick start

- Modify your app by editing the `src/index.jsx` file.

- Build and deploy your app by running:
```
forge deploy
```

- Install your app in an Atlassian site by running:
```
forge install
```

- Develop your app by running `forge tunnel` to proxy invocations locally:
```
forge tunnel
```

### Notes
- Use the `forge deploy` command when you want to persist code changes.
- Use the `forge install` command when you want to install the app on a new site.
- Once the app is installed on a site, the site picks up the new app changes you deploy without needing to rerun the install command.
