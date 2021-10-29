import { DarkModeProvider } from 'components/util/useDarkMode'
import 'styles/index.css'

function MyApp({ Component, pageProps }) {
  return (
    <DarkModeProvider>
      <Component {...pageProps} />
    </DarkModeProvider>
  )
}

export default MyApp
