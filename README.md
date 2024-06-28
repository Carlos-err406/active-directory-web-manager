# Open ActiveDirectory Web Manager

Open ActiveDirectory Web Manager is a sveltekit-powered web app for managing an active directory instance.

## Development

## App Configuration

Follow [.env.example](.env.example) for environment configuration

App is configurable through a json file that follows [this json schema](https://carlos-err406.github.io/active-directory-web-manager/schemas/index.schema.json)

The `CONFIG_PATH` environment variable is path for the json file specified above

An example of this config file can be found at the root of the repo [app.config.json](app.config.json)

Documentation of all attributes for the config file can be found [here](https://carlos-err406.github.io/active-directory-web-manager)

## Recommended extensions

[LDAP Explorer](https://marketplace.visualstudio.com/items?itemName=fengtan.ldap-explorer)
Follow extension docs for how to config.
