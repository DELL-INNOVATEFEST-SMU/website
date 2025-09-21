/// <reference types="vite/client" />

declare global {
  namespace JSX {
    interface IntrinsicElements {
      group: any
      mesh: any
      sphereGeometry: any
      meshBasicMaterial: any
      meshStandardMaterial: any
      ringGeometry: any
      ambientLight: any
      directionalLight: any
      pointLight: any
      hemisphereLight: any
    }
  }
}
