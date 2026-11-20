// A deployment can subscribe to this event from its consented analytics integration.
// Only fixed labels are emitted. Scenario inputs and coordinates stay in the tools.
export function reportSimulatorEvent(event, tool) {
  document.dispatchEvent(new CustomEvent('tornado:simulator-event', {
    detail: { event, tool, modelVersion: '1', device: matchMedia('(max-width: 767px)').matches ? 'mobile' : 'desktop' }
  }));
}
