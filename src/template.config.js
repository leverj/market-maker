export const config = {
  env: '',
  strategies: {
    fixed: {
      depth: -1, quantity:  -1, step:  -1
    }
  },
  gateways: {
    Gatecoin_test: {
      privateKey: '',
      publicKey: '',
      keysName: '',
      keysExpiration: '',
      permission: 'Trade Withdraw',
      apiUrl: 'https://api.gtcprojects.com' // test
    },
    Gatecoin: {
      privateKey: '',
      publicKey: '',
      keysName: '',
      keysExpiration: '',
      permission: 'Trade Withdraw',
      apiUrl: 'https://api.gatecoin.com' // production
    },
  }
}
