import DatSimulatorApp from '@/components/dat-simulator/DatSimulatorApp'
import BackButton from '@/components/shared/BackButton'
import Script from 'next/script'

export default function DatSimulatorPage() {
  return (
    <>
      <DatSimulatorApp />
      <BackButton href="/" />
      <Script src="/js/simulator.js" strategy="afterInteractive" />
      <Script src="/js/dat-simulator-page.js" strategy="afterInteractive" />
    </>
  )
}
