import DatSimulatorApp from '@/components/dat-simulator/DatSimulatorApp'
import BackButton from '@/components/shared/BackButton'

export default function DatSimulatorPage() {
  return (
    <>
      <DatSimulatorApp />
      <BackButton href="/" />
    </>
  )
}
