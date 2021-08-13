
import { TezosFA2Protocol, TezosFA2ProtocolOptions, TezosProtocolNetwork, TezosUtils } from '@airgap/coinlib-core'
import { WetziKoinProtocolConfig } from './wetzikoin-protocol-config'

export class WetziKoin extends TezosFA2Protocol {

    constructor(
        public readonly options: TezosFA2ProtocolOptions = new TezosFA2ProtocolOptions(
            new TezosProtocolNetwork(),
            new WetziKoinProtocolConfig()
        )
    ) {
        super(options)
    }

    public async fetchTokenHolders(): Promise<{ address: string; amount: string }[]> {
        const tokenID = this.options.config.tokenID ?? 0
        const values = await this.contract.bigMapValues({
            bigMapFilter: [
                {
                    field: 'key_type',
                    operation: 'like',
                    set: ['pair address nat'],
                    inverse: false
                }
            ],
            bigMapID: this.options.config.tokenMetadataBigMapID,
            predicates: [
                {
                    field: 'key',
                    operation: 'endsWith',
                    set: [
                        `${tokenID}`
                    ],
                    inverse: false
                },
                {
                    field: 'value',
                    operation: 'isnull',
                    set: [],
                    inverse: true
                }
            ]
        })
        const addressRegEx = new RegExp(`Pair (.*) ${this.options.config.tokenID ?? 0}`)

        return values.map(value => {
            let address: string = ''
            const match = addressRegEx.exec(value.key)
            if (match) {
                address = match[1]
            }

            return {
                address: TezosUtils.parseAddress(address),
                amount: value.value
            }
        })
    }
}
