import React from 'react'
import { translate } from 'react-i18next'
import { withRouter } from 'react-router-dom'
import { action, extendObservable, reaction } from 'mobx'
import { inject, observer } from 'mobx-react'

/** Ant Design */
import Menu from 'antd/lib/menu'

@translate(['common'])
@inject('connections')
@observer
class MainMenu extends React.Component {
  constructor(props) {
    super(props)
    this.t = props.t
    this.connections = props.connections

    /** Extend the component with observable properties. */
    extendObservable(this, { selected: '/' })

    /**
     * Redirect to the viewing connection when RPC becomes active, or to the
     * connections screen if the viewing connection becomes unreachable.
     */
    this.viewingReaction = reaction(
      () => [this.connections.viewingId, this.connections.viewing.status.rpc],
      ([id, rpc]) => {
        this.setSelected({
          key: rpc === true ? '/' + id + '/transactions' : '/'
        })
      },
      {
        fireImmediately: true,
        name: 'MainMenu: viewing connection status changed, adjusting screen.'
      }
    )
  }

  /** Dispose of reaction on component unmount. */
  componentWillUnmount() {
    this.viewingReaction()
  }

  /**
   * Set selected menu item and navigate to it.
   * @function setSelected
   * @param {object} item - Routing path and menu item key.
   */
  @action
  setSelected = ({ key }) => {
    this.selected = key

    if (this.props.history.location.pathname !== key) {
      this.props.history.push(key)
    }
  }

  render() {
    const disabled = this.connections.viewing.status.rpc !== true
    const key = '/' + this.connections.viewingId + '/'

    return (
      <Menu
        inlineCollapsed
        mode="inline"
        onClick={this.setSelected}
        selectedKeys={[this.selected]}
      >
        <Menu.Item disabled={disabled} key={key + 'transactions'}>
          <div className="flex">
            <i className="material-icons md-22">account_balance_wallet</i>
            <p style={{ margin: '0 0 0 10px' }}>{this.t('txs')}</p>
          </div>
        </Menu.Item>
        <Menu.Item disabled={disabled} key={key + 'send'}>
          <div className="flex">
            <i className="material-icons md-22">send</i>
            <p style={{ margin: '0 0 0 10px' }}>{this.t('send')}</p>
          </div>
        </Menu.Item>
        <Menu.Item disabled={disabled} key={key + 'network/info'}>
          <div className="flex">
            <i className="material-icons md-22">public</i>
            <p style={{ margin: '0 0 0 10px' }}>{this.t('net')}</p>
          </div>
        </Menu.Item>
        <Menu.Item disabled={disabled} key={key + 'maintenance/general'}>
          <div className="flex">
            <i className="material-icons md-22">settings</i>
            <p style={{ margin: '0 0 0 10px' }}>{this.t('maint')}</p>
          </div>
        </Menu.Item>
        <Menu.Item key="/">
          <div className="flex">
            <i className="material-icons md-22">cast_connected</i>
            <p style={{ margin: '0 0 0 10px' }}>{this.t('connManager')}</p>
          </div>
        </Menu.Item>
      </Menu>
    )
  }
}

export default withRouter(MainMenu)
