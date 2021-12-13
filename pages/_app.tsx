import "../styles/globals.css";
import type { AppProps } from "next/app";
import Link from "next/link";

function MyApp({ Component, pageProps }: AppProps) {
  return (
    <div>
      <nav>
          <Link href="/">
            <a>🚪 Backdoor</a>
          </Link>
          <Link href="/listitem">
            <a>🎨 List Item</a>
          </Link>
          <Link href="/favourites">
            <a>💙 Favourites</a>
          </Link>
      </nav>
      <Component {...pageProps} />
    </div>
  );
}

export default MyApp;
