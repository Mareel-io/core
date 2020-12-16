# Mareel core

Universal network device control module by using Javascript.

## Installation

```bash
$ yarn add @mareel/core
# npm i @mareel/core
```

## Documentation
This project uses typedoc to generate library documentation automatically.

Please run following command to generate library documentation (gh page WIP)

```bash
yarn doc
```

## Example codes
Please refer to

[https://github.com/Mareel-io/core/tree/main/examples]

## Implementation status
### EFM Networks
Currently tested on A8004T model

#### Implemented features
WLAN interface
* SSID broadcast enable / disable
* IFace disable / enable
* SSID change
* WMM support enable / disable
* Set WPA2 personal wireless authentication (field value rework pending)

WLAN device
* Channel configuration
* Channel bandwidth 
* TXpower (field value rework pending)
* Diversity configuration (partially working)
* Regdom configuration (field value rework pending)
* Beacon interval configuration
