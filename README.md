<p align="center">
  <a href="https://anistream.catco.uno/">
    <img src="logo.png" alt="Logo" width="200" height="200">
  </a>
</p>

<h1 align="center">
  Anistream API
</h1>
<p align="center">
  An API for anime information, episodes, and streaming sources.
</p>

Anistream scrapes data from various websites and provides APIs for accessing the data to satisfy your needs.

> [!IMPORTANT]
> Self-hosting the Anistream is required to use the API. Please refer to the [Installation section](#installation) for more information on hosting your own instance.

> [!CAUTION]
> Anistream is not affiliated with any of the providers it scrapes data from. Anistream is not responsible for any misuse of the data provided by the API. Commercial utilization may lead to serious consequences, including potential site takedown measures. Ensure that you understand the legal implications before using this API.

<h2> Table of Contents </h2>

- [Installation](#installation)
  - [Locally](#locally)

## Installation
### Locally
installation is simple.

Run the following command to clone the repository, and install the dependencies.

```sh
$ git clone https://github.com/Firkhie/anistream-api.git
$ cd anistream-api
$ pnpm install
```

start the server!

```sh
$ pnpm run dev
```