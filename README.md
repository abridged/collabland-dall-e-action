# Collab.Land DALL·E 2 Action

This repository provides a DALL·E 2 Collab Action that developers can use to build AI-powered miniapps for the Collab.Land marketplace. The Collab Action uses the DALL·E 2 API to generate 10 images based on user input, you cycle through all the images and send the ones most fitting to your needs.

## Getting Started

To use this Collab Action, follow these steps:

### Fork or clone the repository to your local machine.

### Install the dependencies

Run the following command to install the Action dependencies:

```bash
npm install or yarn install
```

### Set up environment variables

Create a `.env` file and add your API keys for Collab.Land and Open AI. You can obtain API keys by signing up for the respective services. We've provided a basic structure in the `.env.example` file to help you get started.

> Note: The Collab.Land Action Public API key is not required to run the Collab Action locally if you set skip_verification to `true`, but it is required to deploy the Collab Action to production. This Action Public API key serves to verify that the Collab Action is being used by an authentic Collab.Land user. You can obtain the Public API key from https://api-qa.collab.land/config.

### Build the project

Run the following command to build the project:

```bash
npm run build or yarn build
```

### Run the Action locally

Run the following command to start the Action server:

```bash
npm run start or yarn start
```

By default, this will start the Action server on port `3000`. You can now make requests to the Action server using the ngrok URL.

### Start the Ngrok server

Run the following command to start the Ngrok server:

```bash
ngrok http 3000
```

### Test the Collab Action

You can follow the instructions in the [Collab.Land documentation](https://dev.collab.land/docs/upstream-integrations/collab-actions/getting-started-with-collab-actions#test-the-actions-in-a-discord-server) to test the Collab Action locally.

### Contributing

If you would like to contribute to the Collab.Land + DALL·E 2 Collab Action, please fork the repository and submit a pull request. All contributions are welcome!

### License

This project is licensed under the MIT License - see the LICENSE file for details.
