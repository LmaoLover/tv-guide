import { Noto_Sans_Display } from 'next/font/google'
import { DarkModeProvider } from 'components/util/useDarkMode'
import 'styles/index.css'

const noto = Noto_Sans_Display({subsets: ["latin"]}) 

function MyApp({ Component, pageProps }) {
  return (
    <DarkModeProvider>
      <main className={noto.className}>
        <Component {...pageProps} />
      </main>
    </DarkModeProvider>
  )
}

export default MyApp
