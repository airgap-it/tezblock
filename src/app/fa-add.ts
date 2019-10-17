import { library } from '@fortawesome/fontawesome-svg-core'
import { faGithub, faMedium, faTelegram, faTwitter } from '@fortawesome/free-brands-svg-icons'
import {
  faBell,
  faCopy,
  faLevelDownAlt,
  faLevelUpAlt,
  faLongArrowAltDown,
  faQrcode,
  faSearch,
  faExchangeAlt,
  faHandshake,
  faLink,
  faStamp,
  faVoteYea,
  faSeedling,
  faEye
} from '@fortawesome/free-solid-svg-icons'

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
    faHandshake,
    faLink,
    faStamp,
    faVoteYea,
    faSeedling,
    faEye,
    faGithub,
    faMedium,
    faTelegram,
    faTwitter
  )
}
