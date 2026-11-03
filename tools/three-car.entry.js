// Entry for js/vendor/three-car.js: only the parts of Three.js r169 that js/ai-car.js uses.
// One self-hosted, tree-shaken file. Rebuild after adding a T.* symbol to js/ai-car.js:
//   npm i three@0.169.0 esbuild@0.24.0 --no-save   (in a scratch dir, not the repo)
//   npx esbuild tools/three-car.entry.js --bundle --format=esm --minify --legal-comments=none \
//     "--banner:js=/* three.js r169 (tree-shaken for ai-car.js) | MIT License | https://github.com/mrdoob/three.js */" \
//     --outfile=js/vendor/three-car.js
export {
  Box3, CanvasTexture, Color, DirectionalLight, EquirectangularReflectionMapping, Group, Mesh, MeshBasicMaterial,
  MeshPhysicalMaterial, MeshStandardMaterial, NeutralToneMapping, PCFSoftShadowMap, PerspectiveCamera,
  PlaneGeometry, PMREMGenerator, Raycaster, Scene, ShadowMaterial, SRGBColorSpace, Vector2, Vector3, WebGLRenderer
} from 'three';
export { GLTFLoader } from 'three/addons/loaders/GLTFLoader.js';
export { RGBELoader } from 'three/addons/loaders/RGBELoader.js';
export { MeshoptDecoder } from 'three/addons/libs/meshopt_decoder.module.js';
export { OrbitControls } from 'three/addons/controls/OrbitControls.js';
