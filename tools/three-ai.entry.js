// Entry for js/vendor/three-ai.js: only the parts of Three.js r169 the AI film uses.
// One self-hosted, tree-shaken file instead of ~10 chained CDN module requests.
// Rebuild after adding a THREE.* symbol to js/ai-film.js:
//   npm i three@0.169.0 esbuild@0.24.0 --no-save   (in a scratch dir, not the repo)
//   npx esbuild tools/three-ai.entry.js --bundle --format=esm --minify --legal-comments=none \
//     "--banner:js=/* three.js r169 (tree-shaken for ai-film.js) | MIT License | https://github.com/mrdoob/three.js */" \
//     --outfile=js/vendor/three-ai.js
export {
  ACESFilmicToneMapping, AdditiveBlending, BoxGeometry, BufferAttribute, BufferGeometry, CanvasTexture,
  CapsuleGeometry, Color, CylinderGeometry, DirectionalLight, DoubleSide, Euler, ExtrudeGeometry, Fog, Group,
  HemisphereLight, IcosahedronGeometry, InstancedMesh, LatheGeometry, MathUtils, Matrix4, Mesh,
  MeshBasicMaterial, MeshPhysicalMaterial, MeshStandardMaterial, NormalBlending, PCFSoftShadowMap,
  PerspectiveCamera, PlaneGeometry, PMREMGenerator, PointLight, Points, PointsMaterial, Quaternion,
  RepeatWrapping, RingGeometry, Scene, ShaderMaterial, Shape, SphereGeometry, SRGBColorSpace, TorusGeometry,
  Vector2, Vector3, WebGLRenderer
} from 'three';
export { Sky } from 'three/addons/objects/Sky.js';
export { RoomEnvironment } from 'three/addons/environments/RoomEnvironment.js';
export { EffectComposer } from 'three/addons/postprocessing/EffectComposer.js';
export { RenderPass } from 'three/addons/postprocessing/RenderPass.js';
export { UnrealBloomPass } from 'three/addons/postprocessing/UnrealBloomPass.js';
export { OutputPass } from 'three/addons/postprocessing/OutputPass.js';
export { RoundedBoxGeometry } from 'three/addons/geometries/RoundedBoxGeometry.js';
export { mergeGeometries } from 'three/addons/utils/BufferGeometryUtils.js';
