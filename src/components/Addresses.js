import React from 'react'
import { translate } from 'react-i18next'
import { action, extendObservable } from 'mobx'
import { inject, observer } from 'mobx-react'

/** Ant Design */
import Input from 'antd/lib/input'
import Select from 'antd/lib/select'
import Table from 'antd/lib/table'

/** Required components. */
import Address from './Address'
import AddressGet from './AddressGet'
import CurrencyConverter from './CurrencyConverter'
import Message from './Message'
import PrivateKeyDump from './PrivateKeyDump'
import PrivateKeyImport from './PrivateKeyImport'
import SendControls from './SendControls'
import SendOptions from './SendOptions'
import SendRecipients from './SendRecipients'

@translate(['wallet'], { wait: true })
@inject('gui', 'rates', 'send', 'wallet')
@observer
class Addresses extends React.Component {
  constructor(props) {
    super(props)
    this.t = props.t
    this.gui = props.gui
    this.rates = props.rates
    this.send = props.send
    this.wallet = props.wallet

    /** Extend the component with observable properties. */
    extendObservable(this, { filters: { address: ['spendable', 'new'] } })
  }

  /**
   * Handle table change.
   * @function tableChange
   */
  @action
  tableChange = (pagination, filters, sorter) => {
    this.filters = filters
  }

  render() {
    const { accountBalances, spendFrom } = this.wallet

    return (
      <div id="AddressesGrid">
        <div className="shadow" style={{ minHeight: '32px' }}>
          <div className="AddressesColumnsGrid">
            <div className="flex-sb">
              <div className="flex" style={{ margin: '0 0 0 10px' }}>
                <AddressGet />
                <div style={{ margin: '0 5px 0 5px' }}>
                  <PrivateKeyImport />
                </div>
                <div style={{ margin: '0 5px 0 0' }}>
                  <PrivateKeyDump />
                </div>
                <Message />
              </div>
              <Input
                onChange={e =>
                  this.wallet.setSearch('addresses', e.target.value)}
                placeholder={this.t('wallet:searchAddresses')}
                prefix={<i className="material-icons md-14">search</i>}
                size="small"
                style={{ margin: '0 10px 0 0', width: '290px' }}
                value={this.wallet.search.addresses.value}
              />
            </div>
            <div className="flex" style={{ margin: '0 10px 0 10px' }}>
              <SendControls />
            </div>
          </div>
        </div>
        <div className="AddressesColumnsGrid">
          <div style={{ margin: '10px' }}>
            <div className="flex-sb" style={{ margin: '0 0 10px 0' }}>
              <div style={{ lineHeight: '22px', margin: '0 36px 0 0' }}>
                <div className="flex">
                  <i className="material-icons md-16">account_balance</i>
                  <p>{this.t('wallet:spendFrom')}</p>
                </div>
              </div>
              <div style={{ flex: 1 }}>
                <div className="flex">
                  <Select
                    onChange={account => this.wallet.setSpendFrom(account)}
                    optionFilterProp="children"
                    size="small"
                    style={{ flex: 1, margin: '0 5px 0 0' }}
                    value={spendFrom}
                  >
                    <Select.Option
                      disabled={this.send.recipients.size > 1}
                      value="#"
                    >
                      {this.t('wallet:any')}
                    </Select.Option>
                    <Select.Option value="*">
                      {this.t('wallet:default')}
                    </Select.Option>
                    {this.wallet.accounts.map(account => (
                      <Select.Option key={account} value={account}>
                        {account}
                      </Select.Option>
                    ))}
                  </Select>
                  <div style={{ width: '140px' }}>
                    <Input
                      disabled
                      size="small"
                      suffix="XVC"
                      value={new Intl.NumberFormat(this.gui.language, {
                        maximumFractionDigits: 6
                      }).format(accountBalances[spendFrom])}
                    />
                  </div>
                </div>
              </div>
            </div>
            <div style={{ textAlign: 'center' }}>
              <Table
                bordered
                columns={[
                  {
                    dataIndex: 'address',
                    filteredValue: this.filters.address.slice() || null,
                    filters: [
                      { text: this.t('wallet:spent'), value: 'spent' },
                      { text: this.t('wallet:spendable'), value: 'spendable' },
                      { text: this.t('wallet:new'), value: 'new' }
                    ],
                    onFilter: (value, { received, spent }) => {
                      switch (value) {
                        case 'spent':
                          return received - spent === 0 && received > 0
                        case 'spendable':
                          return received - spent !== 0
                        case 'new':
                          return received === 0
                      }
                    },
                    title: this.t('wallet:addresses'),
                    width: 290,
                    render: address => <p className="text-mono">{address}</p>
                  },
                  {
                    dataIndex: 'balance',
                    sorter: (a, b) => a.balance - b.balance,
                    title: this.t('wallet:balance'),
                    render: balance => (
                      <p style={{ textAlign: 'right' }}>
                        {new Intl.NumberFormat(this.gui.language, {
                          minimumFractionDigits: 6,
                          maximumFractionDigits: 6
                        }).format(balance)}{' '}
                        XVC
                      </p>
                    )
                  }
                ]}
                dataSource={this.wallet.addressesData}
                expandedRowRender={data => <Address data={data} />}
                key={'addr-table-' + this.gui.windowSize.height}
                locale={{
                  emptyText: this.t('wallet:notFound'),
                  filterConfirm: this.t('wallet:ok'),
                  filterReset: this.t('wallet:reset')
                }}
                onChange={this.tableChange}
                pagination={{
                  defaultPageSize: Math.round(
                    (this.gui.windowSize.height - 225) / 22
                  ),
                  style: { display: 'inline-block' }
                }}
                rowKey="address"
                scroll={{ y: this.gui.windowSize.height - 217 }}
                size="small"
              />
            </div>
          </div>
          <div style={{ margin: '10px' }}>
            <div id="RecipientsGrid">
              <SendRecipients />
              <div style={{ alignSelf: 'end' }}>
                <SendOptions />
                <hr />
                <CurrencyConverter />
              </div>
            </div>
          </div>
        </div>
      </div>
    )
  }
}

export default Addresses
