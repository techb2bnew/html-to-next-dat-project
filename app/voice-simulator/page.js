import VoiceSimulatorApp from '@/components/voice/VoiceSimulatorApp'
import BackButton from '@/components/shared/BackButton'

export default function VoiceSimulatorPage() {
  return (
    <>
      <VoiceSimulatorApp />
      <BackButton href="/dat-simulator" />
    </>
  )
}
