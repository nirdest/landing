// Compresses the Blender export into models/car-hi.glb / car-lo.glb: texture size per part (px per metre of the part),
// WebP textures, meshopt geometry. Needs, in a scratch dir: npm i @gltf-transform/core@4 @gltf-transform/extensions@4 @gltf-transform/functions@4 meshoptimizer sharp
//   node car-opt.mjs car.gltf car-hi.glb 1000 2048   (≈4.2 MB, ≈245 MB GPU textures)
//   node car-opt.mjs car.gltf car-lo.glb 450 1024    (≈2.7 MB, ≈48 MB GPU textures)
// node opt.mjs <in.gltf> <out.glb> <pxPerMeter> <maxPx>
import { NodeIO } from '@gltf-transform/core';
import { ALL_EXTENSIONS, EXTMeshoptCompression } from '@gltf-transform/extensions';
import { dedup, prune, textureCompress, meshopt, weld, getBounds } from '@gltf-transform/functions';
import { MeshoptEncoder, MeshoptDecoder } from 'meshoptimizer';
import sharp from 'sharp';
const [, , inp, out, ppm, maxPx] = process.argv;
await MeshoptEncoder.ready;
const io = new NodeIO().registerExtensions(ALL_EXTENSIONS).registerDependencies({ 'meshopt.encoder': MeshoptEncoder, 'meshopt.decoder': MeshoptDecoder });
const doc = await io.read(inp);
await doc.transform(dedup(), prune());
const root = doc.getRoot();
// размер детали в метрах для каждой текстуры: максимум по мешам, где она используется
const need = new Map();
for (const node of root.listNodes()) {
  const mesh = node.getMesh(); if (!mesh) continue;
  const b = getBounds(node), size = Math.max(...b.max.map((v, i) => v - b.min[i]));
  for (const prim of mesh.listPrimitives()) {
    const m = prim.getMaterial(); if (!m) continue;
    for (const [tex, kind] of [[m.getBaseColorTexture(), 'c'], [m.getMetallicRoughnessTexture(), 'mr'], [m.getNormalTexture(), 'n'], [m.getEmissiveTexture(), 'c'], [m.getOcclusionTexture(), 'mr']]) {
      if (!tex) continue;
      const px = size * ppm * (kind === 'c' ? 1 : .5);
      need.set(tex, Math.max(need.get(tex) || 0, px));
    }
  }
}
let gpu = 0;
for (const [tex, px] of need) {
  const p2 = Math.min(+maxPx, Math.max(64, 2 ** Math.round(Math.log2(Math.max(px, 1)))));
  const img = sharp(Buffer.from(tex.getImage())); const meta = await img.metadata();
  const s = Math.min(p2, meta.width);
  tex.setImage(new Uint8Array(await img.resize(s, s, { fit: 'fill' }).png().toBuffer())).setMimeType('image/png');
  gpu += s * s * 4 * 1.33;
}
await doc.transform(
  textureCompress({ encoder: sharp, targetFormat: 'webp', quality: 80 }),
  weld(),
  meshopt({ encoder: MeshoptEncoder, level: 'medium' }),
);
await io.write(out, doc);
const tris = root.listMeshes().flatMap(m => m.listPrimitives()).reduce((a, p) => a + (p.getIndices() ? p.getIndices().getCount() : p.getAttribute('POSITION').getCount()) / 3, 0);
console.log(out, 'textures', need.size, 'gpuMB', (gpu / 1048576).toFixed(0), 'tris', Math.round(tris), 'materials', root.listMaterials().length, 'meshes', root.listMeshes().length);
