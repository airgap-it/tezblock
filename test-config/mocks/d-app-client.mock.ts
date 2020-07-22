export const getDAppClientMock = () => jasmine.createSpyObj('DAppClient', {
    requestPermissions: Promise.resolve(null),
    getActiveAccount: Promise.resolve(null),
    requestOperation: Promise.resolve(null)
})
