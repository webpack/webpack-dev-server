# CLI: Https Option

By default webpack-dev-server will generate a self-signed, 2048 bit, sha256 SSL
Certificate, which is used to enable https. The certificate will be located in the
`ssl` directory after the server is started for the first time. The generated
certificate is only good for 30 days, at which point it'll be regenerated.

We highly recommend creating and managing your own certificates. Please see the
following resources for doing so:

* (MacOS) https://certsimple.com/blog/localhost-ssl-fix
* (Windows) https://technet.microsoft.com/itpro/powershell/windows/pkiclient/new-selfsignedcertificate

## Getting Started

```shell
npm run webpack-dev-server -- --open --https
```

## Using Your Certificate

Options are available for using your own SSL Certificate in your preferred or
OS-required format.

Given the base command `npm run webpack-dev-server -- --open --https`, append
one of the following:

* (PEM Files)  `--cert=../../ssl/server.pem --key=../../ssl/server.pem`
* (PFX and Passphrase) `--pfx=./test_cert.pfx --pfx-passphrase=sample`

## What To Expect

The script should open `https://localhost:8080/`in your default browser. If your
browser displays a warning about a non-trusted certificate, follow the procedure
for your browser of choice to continue. After doing so you should see "It's Working"
displayed on the page.
