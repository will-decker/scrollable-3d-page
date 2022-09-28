import {
  ViewerApp,
  AssetManagerPlugin,
  GBufferPlugin,
  ProgressivePlugin,
  TonemapPlugin,
  SSRPlugin,
  SSAOPlugin,
  BloomPlugin,
  GammaCorrectionPlugin,
  //   addBasePlugins,
  AssetManagerBasicPopupPlugin,
  CanvasSnipperPlugin,
  IViewerPlugin,

  // Color, // Import THREE.js internals
  // Texture, // Import THREE.js internals
} from 'webgi';
import './styles.css';

import gsap from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';

gsap.registerPlugin(ScrollTrigger);

async function setupViewer() {
  // Initialize the viewer
  const viewer = new ViewerApp({
    canvas: document.getElementById('webgi-canvas') as HTMLCanvasElement,
    isAntialiased: true,
    // useRgbm: false,
  });

  // Add some plugins
  const manager = await viewer.addPlugin(AssetManagerPlugin);
  const camera = viewer.scene.activeCamera;
  const position = camera.position;
  const target = camera.target;

  // Add a popup(in HTML) with download progress when any asset is downloading.
  // await viewer.addPlugin(AssetManagerBasicPopupPlugin);

  // Add plugins individually.
  await viewer.addPlugin(GBufferPlugin);
  await viewer.addPlugin(new ProgressivePlugin(32));
  await viewer.addPlugin(new TonemapPlugin(true));
  await viewer.addPlugin(GammaCorrectionPlugin);
  await viewer.addPlugin(SSRPlugin);
  await viewer.addPlugin(SSAOPlugin);
  await viewer.addPlugin(BloomPlugin);

  // or use this to add all main ones at once.
  //   await addBasePlugins(viewer);

  // Add more plugins not available in base, like CanvasSnipperPlugin which has helpers to download an image of the canvas.
  await viewer.addPlugin(CanvasSnipperPlugin);

  // This must be called once after all plugins are added.
  viewer.renderer.refreshPipeline();

  await manager.addFromPath('./assets/drone2-draco.glb');

  function setupScrollAnim() {
    const tl = gsap.timeline();

    // First Section
    tl.to(position, {
      x: -0.68,
      y: 0.12,
      z: 1.93,
      duration: 4,
      scrollTrigger: {
        trigger: '.second',
        start: 'top bottom',
        end: 'top top',
        scrub: true,
      },
      onUpdate,
    }).to(target, {
      x: 0.005,
      y: 0.11,
      z: 1.09,
      duration: 4,
      scrollTrigger: {
        trigger: '.second',
        start: 'top bottom',
        end: 'top top',
        scrub: true,
      },
      onUpdate,
    });
  }

  setupScrollAnim();

  // WEBGI UPDATE
  let needsUpdate = true;

  function onUpdate() {
    needsUpdate = true;
    viewer.renderer.resetShadows();
  }

  viewer.addEventListener('preFrame', () => {
    if (needsUpdate) {
      camera.positionUpdated(false);
      camera.targetUpdated(true);
      needsUpdate = false;
    }
  });

  viewer.getPlugin(TonemapPlugin)!.config!.clipBackground = true;

  // Load an environment map if not set in the glb file
  // await viewer.scene.setEnvironment(
  //     await manager.importer!.importSinglePath<ITexture>(
  //         "./assets/environment.hdr"
  //     )
  // );

  // Add some UI for tweak and testing.
  //   const uiPlugin = await viewer.addPlugin(TweakpaneUiPlugin);
  // Add plugins to the UI to see their settings.
  //   uiPlugin.setupPlugins<IViewerPlugin>(TonemapPlugin, CanvasSnipperPlugin);
}

setupViewer();
