export const config = {
  env: '',
  markets: [
    {
      currencies: { primary: 'LEV', secondary: 'ETH' },
      spread: { type: 'fixed', depth: 3, quantity: 1, step: 0.1 },
      trades: { limit: 100, timeout_milliseconds: 1000 },
      save_changes: true
    },
  ],
  gateways: {
    Gatecoin: {
      privateKey: '',
      publicKey: '',
      subscribeKey: '',
      apiUrl: 'https://api.gatecoin.com' // production
    },
  },
}
