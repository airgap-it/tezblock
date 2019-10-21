import { library } from '@fortawesome/fontawesome-svg-core'
import { faGithub, faMedium, faTelegram, faTwitter } from '@fortawesome/free-brands-svg-icons'
import {
  faBell,
  faBoxBallot,
  faCopy,
  faExchangeAlt,
  faEye,
  faHandHoldingSeedling,
  faHandReceiving,
  faLevelDownAlt,
  faLevelUpAlt,
  faLink,
  faLongArrowAltDown,
  faQrcode,
  faSearch,
  faStamp
} from '@fortawesome/pro-light-svg-icons'

export const addFontAwesome = () => {
  library.add(
    faBell,
    faCopy,
    faLevelDownAlt,
    faLevelUpAlt,
    faLongArrowAltDown,
    faQrcode,
    faSearch,
    faExchangeAlt,
    faHandReceiving,
    faLink,
    faStamp,
    faBoxBallot,
    faHandHoldingSeedling,
    faEye,
    faGithub,
    faMedium,
    faTelegram,
    faTwitter
  )
}
