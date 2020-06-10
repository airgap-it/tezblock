export const getBsModalServiceMock = () => jasmine.createSpyObj('BsModalService', {
    show: { content: { closeBtnName: undefined } }
})
