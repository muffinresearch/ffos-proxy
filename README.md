[![Build Status](https://travis-ci.org/muffinresearch/ffos-proxy.svg)](https://travis-ci.org/muffinresearch/ffos-proxy)
[![Dependency Status](https://david-dm.org/muffinresearch/ffos-proxy.svg)](https://david-dm.org/muffinresearch/ffos-proxy)
[![devDependency Status](https://david-dm.org/muffinresearch/ffos-proxy/dev-status.svg)](https://david-dm.org/muffinresearch/ffos-proxy#info=devDependencies)



# ffos-proxy

*Warning: For development purposes only. Use at your own risk and for good, not evil etc...*

Proxy setup automation for FFOS developer devices

```
Proxify: Setup and configure a proxy on your FFOS device

Usage: bin/ffos-proxy <command>

Commands:
  enable       Configure and enable the proxy on a chosen device                
  disable      Disable the proxy on a chosen device                             
  add-certs    Add the certs to a chosen device
```

## Requirements

* A FFOS device. This has been only tested on the flame so far. 
* Unix/Linux only at the moment.
* adb must be installed.
* Install the `certutil` command see [NSS documentation](https://developer.mozilla.org/en-US/docs/Mozilla/Projects/NSS) for more information.
* A CA certificate that you want to install. See [This post for instructions](https://muffinresearch.co.uk/proxying-connections-from-ffos/#generateyourowncacertforcharles).

## Setup

*Note: a slicker setup to be added in due course*

* clone this repo and cd into it.
* Run `npm install`
* Run command with `bin/ffos-proxy`
